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

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const r2 = x => Math.round(x * 100) / 100;
let G;
const frais = c => c.joueurs.forEach(j => { j.fraich = 100; j.bless = 0; j.susp = 0; j.repos = false; });

/* Monte une rencontre jouée (mon club à domicile), arrêtée à la minute `m`, et rend de quoi piloter le banc. */
const scene = (club, m, prepare) => {
  api.nouvellePartie(club);
  G = api.getG();
  const moi = api.clubById(G.monClub), adv = G.clubs.find(c => c.id !== moi.id);
  frais(moi); frais(adv);
  const chg = { [moi.id]: api.tireSubs(moi, 0), [adv.id]: api.tireSubs(adv, 3) };
  api.setChg(chg);
  const p = chg[moi.id];
  if (prepare) prepare(p, moi);
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
  return { moi, adv, p, r, ctx, etat, m, chg };
};
const clic = (sel, n) => { const b = (n == null) ? FICHE.querySelector("#" + sel) : FICHE.querySelectorAll("." + sel)[n];
  if (!b || !b.onclick) throw new Error("pas de bouton " + sel + " " + n); b.onclick(); };
const reprendreLeMatch = () => FICHE.querySelector("#penRes").querySelector("#bPenOk").onclick();

/* ============ A) LA FENÊTRE ============ */
console.log("A) La fenêtre du banc s'ouvre, se lit, et sait se taire");
{
  const s = scene("LIL", 40);
  api.ouvreBanc(s.ctx);
  ok(/LE BANC — 40ᵉ MINUTE/.test(FICHE._h), "le titre annonce la minute : « 🔁 LE BANC — 40ᵉ MINUTE »");
  ok(/il vous reste <b class="jaune">3<\/b> changements/.test(FICHE._h), "elle annonce les trois changements encore en poche");
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
  clic("bEntreB", 0);
  clic("bSortB", 0);
  ok(s.p.min.filter(x => x <= 90).length <= 3, `la feuille du jour tient toujours en trois changements (${s.p.min.length})`);
  ok(s.p.min.filter(x => x > 40).length === Math.max(0, prevusAvant - 1),
    `et l'un de ceux que le banc avait prévus a sauté (${prevusAvant} → ${s.p.min.filter(x => x > 40).length})`);
  ok(s.etat.suites === 1, "la fin du match a été rejouée avec la nouvelle pelouse");
  reprendreLeMatch();
  ok(s.etat.repris === 1, "puis le téléscripteur a repris");
}

/* ============ D) LA PELOUSE SUIT, ET LE MOTEUR AVEC ============ */
console.log("D) Le sortant se tait, l'entrant joue");
{
  const nomme = (l, j) => (l.g && (l.g.uid === j.uid || l.g.pasUid === j.uid)) || (l.c && l.c.uid === j.uid)
    || (l.q && l.q.but === j.nom) || (l.ic !== "sub" && !l.bl && typeof l.x === "string" && l.x.includes(j.nom));
  let faux = null, faits = 0;
  for (let n = 0; n < 60 && !faux; n++) {
    const s = scene(["LIL", "REN", "OM", "AUX"][n % 4], 30 + (n % 20));
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
  // on force les deux extrêmes : le meilleur du banc pour le plus faible du onze, puis l'inverse
  const extreme = (haut) => {
    const s = scene("OM", 40);
    api.ouvreBanc(s.ctx);
    const entrants = api.bancDispo(s.moi, s.p, 40).sort((x, y) => api.noteSel(y) - api.noteSel(x));
    const cible = haut ? entrants[0] : entrants[entrants.length - 1];
    const boutons = FICHE.querySelectorAll(".bEntreB");
    const idx = [...boutons].findIndex((b, n) => FICHE._h.split("bEntreB")[n + 1] && true);
    // on retrouve le bouton par son ordre d'affichage (même tri que la fenêtre)
    const affiches = api.bancDispo(s.moi, s.p, 40).sort((x, y) => ("DMA".indexOf(y.pos) - "DMA".indexOf(x.pos)) || (api.noteSel(y) - api.noteSel(x))).slice(0, 6);
    const n = affiches.indexOf(cible);
    if (n < 0) { clic("bFermeBanc"); return null; }
    boutons[n].onclick();
    const pelouse = api.enJeu(s.moi, 40).filter(x => x.pos !== "G");
    const sortants = s.p.xi.filter(j => pelouse.includes(j));
    const victime = haut ? sortants.slice().sort((x, y) => api.noteSel(x) - api.noteSel(y))[0] : sortants.slice().sort((x, y) => api.noteSel(y) - api.noteSel(x))[0];
    const sorties = FICHE.querySelectorAll(".bSortB");
    const k = sortants.indexOf(victime);
    if (k < 0) { clic("bFermeBanc"); return null; }
    sorties[k].onclick();
    reprendreLeMatch();
    return { mien: s.ctx.mul.h, entrant: cible, sortant: victime };
  };
  const fort = extreme(true), faible = extreme(false);
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
  const s = scene("LIL", 60);
  api.ouvreBanc(s.ctx);
  clic("bEntreB", 0); clic("bSortB", 0);
  reprendreLeMatch();
  const k = s.p.min.lastIndexOf(60);
  const entrant = s.p.banc[k], sortant = s.p.sort[k];
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
