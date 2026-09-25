/* Harnais headless — LE BANC EN DIRECT (v1.19)
   Les trois changements restent tirés par le banc (57e/65e/73e) : si le joueur n'ouvre jamais la fenêtre,
   rien ne bouge — c'est la première chose que ce harnais vérifie. Ensuite, ce que reprendre la main veut
   dire : un changement voulu consomme l'une des trois places, fait sauter celui que le banc avait prévu,
   et la pelouse que le moteur fait jouer est celle qu'on vient de composer.
   A) la fenêtre s'ouvre, se lit, et ne propose que des choix tenables
   B) le vivier : qui peut entrer, qui peut sortir — et qui ne le peut jamais
   C) un changement voulu prend l'une des trois places, jamais une quatrième
   D) la pelouse suit, et le moteur avec : le sortant se tait, l'entrant joue
   E) le fil : la ligne est annoncée tout de suite, avec les mots d'un choix, pas ceux d'un drame
   F) le poids : un meilleur entrant renforce, un moins bon affaiblit, jamais plus qu'un homme en moins
   G) les trois changements faits : la fenêtre le dit et ne propose personne
   H) la fraîcheur au prorata, comme pour n'importe quel changement
   I) un nom bricolé ne peut pas ouvrir de balise
   Usage : node harness-banc.cjs                                                                  */
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</scr" + "ipt>"));

function makeStub() {
  let stub;
  const fn = function () { return stub; };
  stub = new Proxy(fn, {
    get(_t, p) { if (p === Symbol.toPrimitive) return () => ""; if (p === "length") return 0; return stub; },
    set() { return true; }, apply() { return stub; }, has() { return true; }, construct() { return stub; },
  });
  return stub;
}
/* un vrai petit nœud pour #fiche : il retient ce qu'on lui écrit et rend des boutons cliquables */
function noeud() {
  const n = { _h: "", style: {}, dataset: {}, disabled: false, onclick: null, _enfants: {},
    classList: { _c: new Set(), add(c) { this._c.add(c); }, remove(c) { this._c.delete(c); }, contains(c) { return this._c.has(c); } } };
  Object.defineProperty(n, "innerHTML", { get() { return n._h; }, set(v) { n._h = String(v); n._enfants = {}; } });
  n.querySelector = sel => {
    const id = sel.replace("#", "");
    if (!new RegExp('id="' + id + '"').test(n._h)) return null;
    if (!n._enfants[id]) n._enfants[id] = noeud();
    return n._enfants[id];
  };
  n.querySelectorAll = sel => {
    const out = [], re = /<button([^>]*)>/g, veut = sel.split(",").map(x => x.trim().replace(".", ""));
    let mm;
    while ((mm = re.exec(n._h))) {
      const attrs = mm[1];
      const cls = (/class="([^"]*)"/.exec(attrs) || [, ""])[1].split(" ");
      const id = (/id="([^"]*)"/.exec(attrs) || [, ""])[1];
      const dn = (/data-n="([^"]*)"/.exec(attrs) || [, ""])[1];
      if (!veut.some(v => cls.includes(v))) continue;
      const cle = id || (sel + "|" + dn);
      if (!n._enfants[cle]) { const b = noeud(); if (dn !== "") b.dataset.n = dn; n._enfants[cle] = b; }
      out.push(n._enfants[cle]);
    }
    return out;
  };
  return n;
}
const FICHE = noeud(), generic = makeStub();
const ls = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
global.document = new Proxy(function () {}, {
  get(_t, p) { if (p === "getElementById") return id => (id === "fiche" ? FICHE : generic); if (p === Symbol.toPrimitive) return () => ""; return generic; },
  set() { return true; }, apply() { return generic; }, has() { return true; }, construct() { return generic; },
});
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, localStorage: ls, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.localStorage = ls; global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = cb => setTimeout(cb, 0); global.cancelAnimationFrame = id => clearTimeout(id);

const api = new Function(script + "\n;return {nouvellePartie,jouerJournee,clubById,byUid,onze,enJeu,forces," +
  "tireSubs,simuleMatch,rejoueDepuis,lignesChangements,appliqueResultat,ouvreBanc,bancDispo,poidsPelouse," +
  "fraich,alignable,noteSel,BLESS_DIX," +
  "getChg:function(){return CHANGEMENTS;},setChg:function(x){CHANGEMENTS=x;},getG:function(){return G;}};")();

/* « I. Ba » est un morceau de « I. Bakayoko ». Un simple `includes` accusait donc le moteur de nommer un
   homme sorti du terrain alors qu'il n'avait jamais bougé — et ce harnais rougissait une fois sur vingt
   pour un faux témoignage. On exige désormais que le nom ne soit pas collé à une lettre. */
const ditLeNom = (txt, nom) => {
  if (typeof txt !== "string" || !nom) return false;
  const lettre = ch => ch != null && /[\p{L}\p{M}'’-]/u.test(ch);
  for (let i = txt.indexOf(nom); i >= 0; i = txt.indexOf(nom, i + 1))
    if (!lettre(txt[i - 1]) && !lettre(txt[i + nom.length])) return true;
  return false;
};

/* Deux hommes peuvent porter le même nom court dans une même rencontre (un A. Traoré dans chaque camp) :
   le texte d'une ligne ne permet alors plus de dire lequel des deux elle nomme, et le harnais accusait le
   moteur d'avoir fait agir un remplaçant resté sur le banc. On relève donc les noms portés en double avant
   chaque match, et on ne juge jamais sur le texte d'une ligne qui porte déjà un identifiant. */
let AMBIGUS = new Set();
const poseAmbigus = (chg) => {
  const cpt = {};
  for (const s of Object.values(chg)) for (const j of s.xi.concat(s.banc)) cpt[j.nom] = (cpt[j.nom] || 0) + 1;
  AMBIGUS = new Set(Object.keys(cpt).filter(n => cpt[n] > 1));
};


let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const r2 = x => Math.round(x * 100) / 100;
let G;
const frais = c => c.joueurs.forEach(j => { j.fraich = 100; j.bless = 0; j.susp = 0; j.repos = false; });

/* Monte une rencontre jouée (mon club à domicile), arrêtée à la minute `m`, et rend de quoi piloter le banc. */
const monteScene = (club, m, prepare) => {
  api.nouvellePartie(club);
  G = api.getG();
  const moi = api.clubById(G.monClub), adv = G.clubs.find(c => c.id !== moi.id);
  frais(moi); frais(adv);
  const chg = { [moi.id]: api.tireSubs(moi, 0), [adv.id]: api.tireSubs(adv, 3) };
  api.setChg(chg);
  const p = chg[moi.id];
  if (prepare) prepare(p, moi);
  const prevus = p.min.slice(); // la feuille du jour AVANT le coup d'envoi : le match ne doit pas y toucher
  const r = api.simuleMatch(moi, adv, true);
  const lignes = [];
  for (const [c, s] of [[moi, chg[moi.id]], [adv, chg[adv.id]]]) lignes.push(...api.lignesChangements(c, s));
  const fin = r.ev.pop(); r.ev = r.ev.concat(lignes).sort((x, y) => x.m - y.m); r.ev.push(fin);
  const eM = { h: moi, a: adv, sh: r.sh, sa: r.sa, mien: true };
  G._pend = { res: [eM], pend: {}, monMatch: r };
  const etat = { repris: 0, suites: 0 };
  let from = r.ev.findIndex(l => l.m > m); if (from < 0) from = r.ev.length - 1;
  const ctx = { monMatch: r, eM, mul: { h: 1, a: 1 }, pos: () => ({ from, mNow: m }),
    reprendre: () => { etat.repris++; }, suite: () => { etat.suites++; } };
  return { moi, adv, p, r, ctx, etat, m, chg, prevus };
};
/* Tout ce harnais parle du banc TACTIQUE : il suppose partout que les seuls changements de la feuille du
   jour sont ceux que le banc avait prévus. Or un pépin ou un rouge tiré pendant la rencontre pose un
   changement d'urgence qui prend l'une des trois places (v1.18, `poseRemplacement`) — et le tirage en sert
   environ un match sur vingt. Le jeu a raison ; c'est la supposition qui était muette, et elle rendait ce
   harnais rouge une fois sur vingt sans qu'aucune régression ne se cache derrière. On retire donc la scène
   tant que la feuille du jour n'est pas ressortie du match telle qu'elle y était entrée. Les pépins en
   direct ont leur propre harnais (`harness-blessure.cjs`), c'est là qu'ils doivent être jugés. */
const intacte = s => s.p.min.length === s.prevus.length && s.p.min.every((x, i) => x === s.prevus[i]);
const scene = (club, m, prepare) => {
  for (let essai = 1; ; essai++) {
    const s = monteScene(club, m, prepare);
    if (intacte(s)) return s;
    if (essai >= 80) throw new Error("scène du banc (" + club + ", " + m + "e) : 80 tirages sans une feuille du jour épargnée par les pépins");
  }
};
const clic = (sel, n) => { const b = (n == null) ? FICHE.querySelector("#" + sel) : FICHE.querySelectorAll("." + sel)[n];
  if (!b || !b.onclick) throw new Error("pas de bouton " + sel + " " + n); b.onclick(); };
/* Clique un entrant et un sortant que le banc n'avait PAS prévus de faire bouger. Prendre le premier nom
   venu tombe une fois sur trente sur un homme déjà inscrit à la feuille du jour : avanceLeBanc annule
   alors SON changement, poseRemplacement en annule un second, et deux places sautent au lieu d'une. Le jeu
   a raison de les annuler — mais les sections qui comptent les places, ou qui pèsent une entrée à la
   minute près, parlent d'un changement neuf. On en choisit donc un, explicitement. */
const paireLibre = (s, m) => {
  const affiches = api.bancDispo(s.moi, s.p, m)
    .sort((x, y) => ("DMA".indexOf(y.pos) - "DMA".indexOf(x.pos)) || (api.noteSel(y) - api.noteSel(x))).slice(0, 6);
  const pelouse = api.enJeu(s.moi, m).filter(x => x.pos !== "G");
  const sortants = s.p.xi.filter(j => pelouse.includes(j));
  const iE = affiches.findIndex(j => !s.p.banc.includes(j));
  const iS = sortants.findIndex(j => !s.p.sort.includes(j));
  if (iE < 0 || iS < 0) throw new Error("scène du banc : ni entrant ni sortant neuf à la " + m + "e");
  FICHE.querySelectorAll(".bEntreB")[iE].onclick();
  FICHE.querySelectorAll(".bSortB")[iS].onclick();
  return { entrant: affiches[iE], sortant: sortants[iS] };
};
const reprendreLeMatch = () => FICHE.querySelector("#penRes").querySelector("#bPenOk").onclick();

/* ============ A) LA FENÊTRE ============ */
console.log("A) La fenêtre du banc s'ouvre, se lit, et sait se taire");
{
  const s = scene("LIL", 40);
  api.ouvreBanc(s.ctx);
  ok(/LE BANC : 40ᵉ MINUTE/.test(FICHE._h), "le titre annonce la minute : « 🔁 LE BANC : 40ᵉ MINUTE »");
  ok(/il vous reste <b class="fort">3<\/b> changements/.test(FICHE._h), "elle annonce les trois changements encore en poche");
  ok(/en décider un fait sauter celui que le banc avait prévu/.test(FICHE._h), "et prévient que le banc cédera la place à votre décision");
  ok(FICHE.querySelectorAll(".bEntreB").length > 0 && !!FICHE.querySelector("#bFermeBanc"), "on y entre par un nom, on en sort par « Laisser le banc tranquille »");
  const bancAvant = s.p.banc.slice(), filAvant = s.r.ev.length;
  clic("bFermeBanc");
  ok(s.etat.repris === 1 && s.etat.suites === 0, "refermée sans rien décider, elle rend la main au téléscripteur sans rien rejouer");
  ok(s.p.banc.length === bancAvant.length && s.r.ev.length === filAvant, "la feuille du jour et le fil sont intacts : ne pas ouvrir le banc, c'est le jeu d'avant");

  // le résultat acté : elle le dit au lieu de faire semblant
  const s2 = scene("REN", 40);
  G._pend = null;
  api.ouvreBanc(s2.ctx);
  ok(/le banc n'y peut plus rien/.test(FICHE._h), "résultat déjà acté : elle le dit franchement");
  reprendreLeMatch();
  ok(s2.etat.repris === 1 && s2.etat.suites === 0, "et le match reprend sans avoir été rejoué");
}

/* ============ B) LE VIVIER ============ */
console.log("B) Qui peut entrer, qui peut sortir");
{
  const s = scene("OM", 40);
  api.ouvreBanc(s.ctx);
  const noms = FICHE._h;
  const gardiens = s.moi.joueurs.filter(x => x.pos === "G");
  ok(!gardiens.some(g => noms.includes(g.nom)), "aucun gardien ne figure parmi les entrants : il ne sort que sur blessure ou carton rouge (v1.13)");
  const dejaEntres = s.p.banc.filter((x, k) => s.p.min[k] <= 40);
  ok(!dejaEntres.some(x => noms.includes(x.nom)), `personne qui soit déjà sur la pelouse (${dejaEntres.length} entré(s) avant la 40e)`);
  const prevus = s.p.banc.filter((x, k) => s.p.min[k] > 40);
  ok(prevus.length === 0 || prevus.some(x => noms.includes(x.nom)), "en revanche, un homme que le banc comptait faire entrer plus tard peut entrer MAINTENANT");
  // les sortants : des titulaires encore sur la pelouse, jamais le gardien
  clic("bEntreB", 0);
  const pelouse = api.enJeu(s.moi, 40);
  const listes = FICHE._h;
  const gk = pelouse.find(x => x.pos === "G");
  ok(!listes.includes(gk.nom), `le gardien ${gk.nom} n'est pas proposé à la sortie`);
  const hors = s.moi.joueurs.filter(x => !pelouse.includes(x) && !s.p.xi.includes(x));
  ok(!hors.some(x => listes.includes(x.nom)), "ni personne qui ne soit pas sur la pelouse");
  clic("bFermeBanc");
}

/* ============ C) UNE DES TROIS PLACES, JAMAIS UNE QUATRIÈME ============ */
console.log("C) Un changement voulu prend l'une des trois places");
{
  const s = scene("AUX", 40);
  const prevusAvant = s.p.min.filter(x => x > 40).length;
  api.ouvreBanc(s.ctx);
  paireLibre(s, 40);
  ok(s.p.min.filter(x => x <= 90).length <= 3, `la feuille du jour tient toujours en trois changements (${s.p.min.length})`);
  /* Au moins un des changements prévus a sauté — et parfois deux : la fin du match est REJOUÉE avec la
     nouvelle pelouse, et un rouge tiré dans cette tranche-là emporte à son tour un changement à venir.
     C'est le jeu qui a raison, et l'égalité stricte rougissait une fois sur trois cents. Ce que cette
     ligne doit prouver, c'est qu'un changement voulu prend une place au lieu d'en ajouter une quatrième. */
  ok(s.p.min.filter(x => x > 40).length <= Math.max(0, prevusAvant - 1),
    `et l'un de ceux que le banc avait prévus a sauté (${prevusAvant} → ${s.p.min.filter(x => x > 40).length})`);
  ok(s.etat.suites === 1, "la fin du match a été rejouée avec la nouvelle pelouse");
  reprendreLeMatch();
  ok(s.etat.repris === 1, "puis le téléscripteur a repris");
}

/* ============ D) LA PELOUSE SUIT, ET LE MOTEUR AVEC ============ */
console.log("D) Le sortant se tait, l'entrant joue");
{
  const nomme = (l, j) => (l.g && (l.g.uid === j.uid || l.g.pasUid === j.uid)) || (l.c && l.c.uid === j.uid)
    || (l.q && l.q.but === j.nom)
    || (!l.g && !l.c && l.ic !== "sub" && !l.bl && typeof l.x === "string" && !AMBIGUS.has(j.nom) && ditLeNom(l.x, j.nom));
  let faux = null, faits = 0;
  for (let n = 0; n < 60 && !faux; n++) {
    const s = scene(["LIL", "REN", "OM", "AUX"][n % 4], 30 + (n % 20));
    poseAmbigus(s.chg);
    // on compte À la minute du changement, pas après : la fin rejouée peut sortir un rouge dès la minute
    // suivante, et ce n'est pas le changement qui aurait retiré l'homme. Un rouge d'AVANT, lui, compte :
    // l'équipe est peut-être déjà à dix.
    const avantN = api.enJeu(s.moi, s.m).length;
    api.ouvreBanc(s.ctx);
    const boutons = FICHE.querySelectorAll(".bEntreB");
    if (!boutons.length) continue;
    boutons[n % boutons.length].onclick();
    const sorties = FICHE.querySelectorAll(".bSortB");
    if (!sorties.length) { clic("bFermeBanc"); continue; }
    sorties[n % sorties.length].onclick();
    faits++;
    const k = s.p.min.lastIndexOf(s.m);
    const entrant = s.p.banc[k], sortant = s.p.sort[k];
    const pel = api.enJeu(s.moi, s.m);
    if (!pel.includes(entrant)) faux = `${entrant.nom} est entré à la ${s.m}e mais n'est pas sur la pelouse`;
    if (pel.includes(sortant)) faux = `${sortant.nom} est sorti à la ${s.m}e mais joue toujours`;
    if (pel.length !== avantN) faux = `${avantN} hommes sur la pelouse avant le changement, ${pel.length} après : un changement n'ajoute ni ne retire personne`;
    for (const l of s.r.ev) {
      if (l.m > s.m && l.t !== "sys" && nomme(l, sortant)) faux = `${sortant.nom} sorti à la ${s.m}e, encore nommé à la ${l.m}e : « ${l.x} »`;
      if (l.m < s.m && nomme(l, entrant)) faux = `${entrant.nom} entré à la ${s.m}e, déjà nommé à la ${l.m}e : « ${l.x} »`;
    }
    const sc = s.r.ev.filter(l => l.g).length, sh = s.r.ev.filter(l => l.g && l.g.cote === s.moi.id).length;
    if (s.r.sh !== sh || s.r.sa !== sc - sh) faux = `score ${s.r.sh}-${s.r.sa} contre ${sh}-${sc - sh} lignes-but après recollage`;
    if (s.r.ev[s.r.ev.length - 1].t !== "sys") faux = "le coup de sifflet n'est plus la dernière ligne";
    reprendreLeMatch();
  }
  ok(!faux && faits > 0, faux || `${faits} changements voulus : la pelouse suit, le moteur ne nomme personne hors de son temps de jeu, et le score reste d'accord avec le fil`);
}

/* ============ E) LE FIL ============ */
console.log("E) Le téléscripteur l'annonce tout de suite, et comme un choix");
{
  const s = scene("LIL", 44);
  const pos = s.ctx.pos();
  api.ouvreBanc(s.ctx);
  clic("bEntreB", 0); clic("bSortB", 0);
  const k = s.p.min.lastIndexOf(44);
  const entrant = s.p.banc[k], sortant = s.p.sort[k];
  const ligne = s.r.ev[pos.from];
  ok(ligne && ligne.ic === "sub" && ligne.m === 44, "la ligne est posée à la minute courante, en tête de ce qui reste à lire");
  ok(ligne && ligne.x === "Changement pour " + s.moi.nom + " : " + entrant.nom + " entre à la place de " + sortant.nom + ".",
    `et elle se lit comme n'importe quel changement : « ${ligne ? ligne.x : "?"} »`);
  ok(ligne && !ligne.urg, "aucune trace d'urgence : ce n'est ni un blessé, ni un gardien à relever");
  ok(/CHANGEMENT/.test(FICHE._h) && FICHE._h.includes(entrant.nom) && FICHE._h.includes(sortant.nom), "la fenêtre confirme les deux noms avant de rendre la main");
  ok(/plus forts|vous y perdez|forces égales/.test(FICHE._h), "et dit en mots ce que le changement pèse, sans jamais montrer un multiplicateur");
  reprendreLeMatch();
}

/* ============ F) LE POIDS ============ */
console.log("F) Un meilleur entrant renforce, un moins bon affaiblit");
{
  // on force les deux extrêmes : le meilleur du banc pour le plus faible du onze, puis l'inverse — mais
  // toujours À POSTE ÉGAL. `mien` pèse la ZONE d'attaque (poidsPelouse passe par lambdasZones), pas la
  // somme des notes : un milieu moyen entré à la place d'un défenseur formidable peut très légitimement
  // la faire monter, et le harnais criait alors au loup pour un match sur trente. Le jeu a raison — c'est
  // « un moins bon entrant affaiblit » qui ne veut dire quelque chose qu'entre hommes du même poste.
  const extreme = (haut) => {
    /* Pour éprouver le RENFORT, encore faut-il qu'un renfort existe : le onze étant par construction le
       meilleur onze, aucun homme du banc ne bat son homologue à son poste, et cette moitié de la section
       ne mesurait jusqu'ici qu'un échange de défenseurs valant ×1 tout rond — c'est-à-dire rien. On POSE
       donc la situation, comme le harnais de fraîcheur pose son cadre à 84 et ses doublures à 72 : un
       attaquant remarquable laissé sur le banc. Le onze est déjà tiré quand `prepare` passe : sa note ne
       le fait pas entrer dans l'équipe, elle le rend seulement digne d'y entrer. */
    const s = scene("OM", 40, haut ? (p, moi) => {
      const att = moi.joueurs.filter(j => !p.xi.includes(j) && j.pos === "A" && api.alignable(j));
      if (att.length) { att[0].note = 90; att[0].fraich = 100; }
    } : undefined);
    api.ouvreBanc(s.ctx);
    // même tri que la fenêtre, et mêmes six noms affichés
    const affiches = api.bancDispo(s.moi, s.p, 40)
      .sort((x, y) => ("DMA".indexOf(y.pos) - "DMA".indexOf(x.pos)) || (api.noteSel(y) - api.noteSel(x))).slice(0, 6);
    const pelouse = api.enJeu(s.moi, 40).filter(x => x.pos !== "G");
    const sortants = s.p.xi.filter(j => pelouse.includes(j));
    const paires = [];
    for (const e of affiches) for (const v of sortants) if (v.pos === e.pos) paires.push({ e, v, d: api.noteSel(e) - api.noteSel(v) });
    /* Et dans la ligne la plus offensive où l'échange va VRAIMENT dans le sens qu'on veut éprouver.
       `mien` est le rapport des buts ATTENDUS par l'attaque : un défenseur échangé contre un défenseur ne
       la bouge presque pas, et le signe de ce presque-rien est affaire de décimale — ×1,02 pour un 68
       entré à la place d'un 85, et le harnais criait à la régression. On exige donc un vrai renfort
       (d > 0) ou un vrai affaiblissement (d < 0), pris le plus haut possible sur le terrain. */
    const cand = paires.filter(x => (haut ? x.d > 0 : x.d < 0));
    if (!cand.length) { clic("bFermeBanc"); return null; }
    const posPref = ["A", "M", "D"].find(pp => cand.some(x => x.e.pos === pp));
    const retenues = cand.filter(x => x.e.pos === posPref).sort((x, y) => x.d - y.d);
    const choix = haut ? retenues[retenues.length - 1] : retenues[0];
    FICHE.querySelectorAll(".bEntreB")[affiches.indexOf(choix.e)].onclick();
    FICHE.querySelectorAll(".bSortB")[sortants.indexOf(choix.v)].onclick();
    reprendreLeMatch();
    return { mien: s.ctx.mul.h, entrant: choix.e, sortant: choix.v };
  };
  const tente = (haut) => { for (let essai = 1; essai <= 60; essai++) { const x = extreme(haut); if (x) return x; } return null; };
  const fort = tente(true), faible = tente(false);
  ok(fort && fort.mien >= 1, fort ? `${fort.entrant.nom} (${Math.round(fort.entrant.note)}) pour ${fort.sortant.nom} (${Math.round(fort.sortant.note)}) : ×${r2(fort.mien)}` : "cas limite");
  ok(faible && faible.mien <= 1, faible ? `${faible.entrant.nom} (${Math.round(faible.entrant.note)}) pour ${faible.sortant.nom} (${Math.round(faible.sortant.note)}) : ×${r2(faible.mien)}` : "cas limite");
  ok(faible && faible.mien >= api.BLESS_DIX, "et même le pire des changements coûte moins cher qu'un homme en moins : la borne tient");
}

/* ============ G) LES TROIS CHANGEMENTS FAITS ============ */
console.log("G) Les trois changements faits : la fenêtre le dit");
{
  const s = scene("REN", 80, (p) => { p.min = p.min.map(() => 20); });
  api.ouvreBanc(s.ctx);
  ok(/vos trois changements sont faits/.test(FICHE._h), "l'en-tête ne promet plus rien");
  ok(/il faudra finir avec ces hommes-là/.test(FICHE._h) && FICHE.querySelectorAll(".bEntreB").length === 0,
    "et la fenêtre ne propose personne à faire entrer");
  reprendreLeMatch();
  ok(s.etat.suites === 0, "rien n'a été rejoué");
}

/* ============ H) LA FRAÎCHEUR AU PRORATA ============ */
console.log("H) Un changement voulu se paie comme les autres");
{
  /* La fin du match est rejouée après le changement : un rouge tiré dans cette tranche peut défaire ce
     qu'on vient de poser, et l'homme entré à la 60e n'aurait alors plus joué trente minutes. On retire
     la scène tant que la feuille du jour ne montre pas exactement le changement qu'on a décidé. */
  let s, paire;
  for (let essai = 1; ; essai++) {
    s = scene("LIL", 60);
    api.ouvreBanc(s.ctx);
    paire = paireLibre(s, 60);
    reprendreLeMatch();
    const k = s.p.banc.indexOf(paire.entrant);
    if (k >= 0 && s.p.min[k] === 60 && s.p.sort[k] === paire.sortant) break;
    if (essai >= 80) throw new Error("scène du banc (LIL, 60e) : 80 tirages sans une fin rejouée qui respecte le changement");
  }
  const entrant = paire.entrant, sortant = paire.sortant;
  s.p.bless = []; s.chg[s.adv.id].bless = [];
  api.appliqueResultat(s.moi, s.adv, 2, 1, { h: s.p, a: s.chg[s.adv.id] });
  ok(r2(100 - api.fraich(sortant)) === r2(20 * 60 / 90), `${sortant.nom}, sorti à la 60e, paie ${r2(100 - api.fraich(sortant))}`);
  ok(r2(100 - api.fraich(entrant)) === r2(20 * 30 / 90), `${entrant.nom}, entré à la 60e, paie ${r2(100 - api.fraich(entrant))}`);
}

/* ============ I) ÉCHAPPEMENT ============ */
console.log("I) Un nom bricolé ne peut pas ouvrir de balise");
{
  const s = scene("AUX", 40);
  api.bancDispo(s.moi, s.p, 40).forEach(x => { x.nom = 'R. <img src=x onerror="pan()">'; });
  api.ouvreBanc(s.ctx);
  ok(FICHE._h.indexOf("<img") < 0 && /&lt;img/.test(FICHE._h), "les noms du banc ressortent échappés");
  clic("bEntreB", 0);
  ok(FICHE._h.indexOf("<img") < 0, "le titre de la seconde étape aussi");
  clic("bFermeBanc");
}

console.log(FAILS === 0 ? "\n✅ HARNAIS BANC : TOUT EST VERT" : `\n❌ ${FAILS} ÉCHEC(S)`);
process.exit(FAILS ? 1 : 0);
