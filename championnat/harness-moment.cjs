/* Harnais headless — LE MOMENT DE LA 90e SUIT LA PELOUSE (v2.96)
   Bug du 14/11/2026 : Juninho, sorti à la mi-temps par un changement en direct, marque à la 90e. Le moment de la
   90e désignait ses hommes au coup d'envoi et ne les revoyait jamais.
   A) on sort en direct l'homme du moment : après le recollage, le moment nomme un homme sur la pelouse
   B) même type de moment, même objet (le direct le tient par référence), annonce et ligne du fil réécrites ensemble
   C) un moment dont l'homme est resté sur la pelouse ne bouge pas d'un mot
   Usage : node harness-moment.cjs                                                                  */
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
  "fraich,alignable,noteSel,BLESS_DIX,tireMoment,revalideMoment,changementDirect,ouvreBlessure," +
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


const surPelouse = (s, uid) => api.enJeu(s.moi, 90).concat(api.enJeu(s.adv, 90)).some(j => j.uid === uid);
const TYPES = ["pen_pour","coupfranc","corner","provoc","but50","geste","cadeau","tacle"];
const T = {pen_pour:.11,coupfranc:.46,corner:.535,provoc:.66,but50:.715,geste:.785,cadeau:.91,tacle:.61};
console.log("A/B) L'homme du moment sort en direct");
{
  let vus = 0, bons = 0, memeType = 0, memeObjet = 0, ligneOk = 0, nomSorti = 0;
  const clubs = ["OL","OM","PSG","LIL","REN","NAN","MON","BOR"];
  for (let n = 0; n < 400; n++) {
    let s; try { s = scene(clubs[n % clubs.length], 45); } catch (e) { continue; }
    const type = TYPES[n % TYPES.length];
    const mo = api.tireMoment(s.moi, s.adv, { t: T[type], sansDerby: true });
    if (!mo || mo.type !== type) continue;
    const homme = s.moi.joueurs.find(j => j.uid === mo.uid);
    if (!homme || homme.pos === "G" || !s.p.xi.includes(homme) || s.p.sort.includes(homme) || !api.enJeu(s.moi, 45).includes(homme)) continue;
    s.r.moment = mo;
    const sif = s.r.ev.pop(); s.r.ev.push({ m: 90, t: "crd", x: mo.annonce, mo: mo.type }); s.r.ev.push(sif);
    const entrant = api.bancDispo(s.moi, s.p, 45).find(j => j.pos !== "G" && !s.p.banc.includes(j));
    if (!entrant) continue;
    const ref = s.r.moment, ancien = homme.nom;
    api.changementDirect(s.ctx, entrant, homme);
    vus++;
    const l = s.r.ev.find(x => x.mo);
    if (surPelouse(s, s.r.moment.uid) && (s.r.moment.tir == null || surPelouse(s, s.r.moment.tir))) bons++;
    if (s.r.moment.type === type) memeType++;
    if (s.r.moment === ref) memeObjet++;
    if (l && l.x === s.r.moment.annonce && l.mo === s.r.moment.type) ligneOk++;
    if (ditLeNom(s.r.moment.annonce, ancien) || ditLeNom(s.r.moment.annonce, ancien.toUpperCase())) nomSorti++;
  }
  ok(vus >= 40, `${vus} scènes où l'homme du moment sort à la 45e`);
  ok(bons === vus, `le moment nomme un homme encore sur la pelouse à la 90e (${bons}/${vus})`);
  ok(nomSorti === 0, `l'annonce ne nomme plus jamais le sortant (${nomSorti} fois)`);
  ok(memeType === vus, `le type du moment ne change pas, le déroulé du direct non plus (${memeType}/${vus})`);
  ok(memeObjet === vus, "c'est le même objet, réécrit sur place");
  ok(ligneOk === vus, `la ligne du fil porte la nouvelle annonce (${ligneOk}/${vus})`);
}
console.log("C) L'homme du moment reste : rien ne bouge");
{
  let vus = 0, intacts = 0, horsJeu = 0, reaffectes = 0;
  for (let n = 0; n < 150; n++) {
    let s; try { s = scene(["OM","PSG","LIL","REN"][n % 4], 45); } catch (e) { continue; }
    const mo = api.tireMoment(s.moi, s.adv, { t: .785, sansDerby: true });
    if (!mo) continue;
    s.r.moment = mo; const avant = mo.annonce;
    const sif = s.r.ev.pop(); s.r.ev.push({ m: 90, t: "crd", x: mo.annonce, mo: mo.type }); s.r.ev.push(sif);
    const sortant = s.p.xi.find(j => j.pos !== "G" && j.uid !== mo.uid && !s.p.sort.includes(j) && api.enJeu(s.moi, 45).includes(j));
    const entrant = api.bancDispo(s.moi, s.p, 45).find(j => j.pos !== "G" && !s.p.banc.includes(j) && j.uid !== mo.uid);
    if (!sortant || !entrant) continue;
    const uid0 = mo.uid;
    api.changementDirect(s.ctx, entrant, sortant);
    /* Le changement fait REJOUER la fin du match : il arrive (une scène sur cent cinquante environ) que l'homme du
       moment y prenne un rouge ou y sorte blessé. Le moment DOIT alors changer d'homme (c'est la section A) : la scène
       ne relève plus de « rien ne bouge » et se vérifie à part. Rouge au hasard jusqu'au 17/11/2026 pour cette raison. */
    if (!surPelouse(s, uid0)) { horsJeu++; if (s.r.moment.uid !== uid0 && surPelouse(s, s.r.moment.uid)) reaffectes++; continue; }
    vus++; if (s.r.moment.annonce === avant && s.r.moment.uid === uid0) intacts++;
  }
  ok(vus >= 30 && intacts === vus, `un autre changement ne touche pas au moment (${intacts}/${vus})`);
  ok(reaffectes === horsJeu, `quand la fin rejouée sort l'homme du moment, le moment passe à un homme sur la pelouse (${reaffectes}/${horsJeu})`);
}
console.log(FAILS ? `\n✗ ${FAILS} échec(s)` : "\n✓ tout est vert");
process.exit(FAILS ? 1 : 0);
