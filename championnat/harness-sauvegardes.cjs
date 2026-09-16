/* Harnais headless — PLUSIEURS CARRIÈRES DANS LE NAVIGATEUR (v0.94)
   A) l'allègement : une sauvegarde de milieu de saison tient de nouveau dans le localStorage
      (l'historique des journées n'archive plus les clubs entiers — il pesait ~100 Ko par journée)
   B) plusieurs carrières cohabitent : chacune sa clé, un index les liste, on les rouvre au choix
   C) la carrière d'avant le multi-parties (clé SAVEKEY) est ADOPTÉE sans recopie ni perte
   D) l'index se répare tout seul s'il est perdu ou s'il ment
   E) renommer / supprimer une carrière
   F) mémoire pleine : la sauvegarde échoue proprement, prévient une fois, et le jeu continue
   Usage : node harness-sauvegardes.cjs                                                      */
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const a = html.indexOf("<script>") + "<script>".length;
const b = html.lastIndexOf("</script>");
const script = html.slice(a, b);

/* ---- stubs DOM/navigateur ---- */
function makeStub() {
  let stub;
  const fn = function () { return stub; };
  stub = new Proxy(fn, {
    get(_t, p) { if (p === Symbol.toPrimitive) return () => ""; if (p === "length") return 0; return stub; },
    set() { return true; }, apply() { return stub; }, has() { return true; }, construct() { return stub; },
  });
  return stub;
}
/* localStorage fidèle : il expose length/key (balayage des clés) et sait déborder (quota) */
const ls = {
  _m: {}, quota: 0,
  get length() { return Object.keys(this._m).length; },
  key(i) { return Object.keys(this._m)[i] ?? null; },
  getItem(k) { return this._m[k] ?? null; },
  setItem(k, v) {
    v = String(v);
    if (this.quota) {
      let poids = v.length;
      for (const c of Object.keys(this._m)) if (c !== k) poids += this._m[c].length;
      if (poids > this.quota) { const e = new Error("quota"); e.name = "QuotaExceededError"; e.code = 22; throw e; }
    }
    this._m[k] = v;
  },
  removeItem(k) { delete this._m[k]; },
  clear() { this._m = {}; },
  poids() { return Object.keys(this._m).reduce((n, k) => n + this._m[k].length, 0); },
};
global.document = makeStub();
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, localStorage: ls, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.localStorage = ls;
global.navigator = { userAgent: "harness" };
// Les boîtes du navigateur ont disparu du jeu (v1.05). Les refus passent par les fenêtres maison,
// qui tiennent un journal des vingt derniers messages (ALERTES, branché plus bas sur api.MSG_JOURNAL),
// et la saisie d'un nom de carrière lit window._saisie quand il n'y a pas de DOM à remplir.
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.Blob = function () {}; global.URL = { createObjectURL: () => "blob:" };

const epilogue = "\n;return {nouvellePartie,jouerJournee,migre,clubById,metaClub,CLUBS,CLUBS_D2," +
  "sauvegardeLocale,chargeLocale,partiesListe,supprimePartie,renommePartie,placeDispo,idxLit,ficheDe," +
  "SAVEKEY,IDXKEY,PARTPFX,MAX_PARTIES,MSG_JOURNAL,posePend," +
  "getG:function(){return G;},setG:function(x){G=x;},getPARTIE:function(){return PARTIE;}," +
  "getSaveKO:function(){return SAVE_KO;},setSaveCrie:function(v){SAVE_CRIE=v;}};";
const api = new Function(script + epilogue)();
const ALERTES = api.MSG_JOURNAL; // le journal des messages poussés au joueur (fenêtres maison)

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (c, m) => { if (c) console.log("  ✓ " + m); else fail(m); };
const Ko = (n) => (n / 1024).toFixed(0) + " Ko";
/* les helpers de sauvegarde se court-circuitent en mode test (EN_TEST) pour ne pas peser sur les
   autres harnais : ici, c'est justement ce qu'on veut éprouver — on lève le drapeau le temps de l'appel */
function reel(fn) {
  global.window.__TEST__ = false;
  try { return fn(); } finally { global.window.__TEST__ = true; }
}

/* ===== A) l'allègement de la sauvegarde ===== */
console.log("A) Une saison entière tient dans le navigateur");
api.nouvellePartie(api.CLUBS[0].id);
for (let i = 0; i < 20; i++) api.jouerJournee();
let G = api.getG();
const poidsMi = JSON.stringify(G).length;
ok(poidsMi < 700 * 1024, `sauvegarde à la 20ᵉ journée : ${Ko(poidsMi)} (elle en pesait 2 600 avant)`);
const ent = G.histo[0][0];
ok(typeof ent.h === "string" && typeof ent.a === "string" && typeof ent.sh === "number",
  "l'historique n'archive que les ID et le score, plus les objets clubs");
ok(G.news.length <= 60, `les dépêches sont plafonnées (${G.news.length})`);
for (let i = 20; i < 38; i++) api.jouerJournee();
ok(JSON.stringify(api.getG()).length < 700 * 1024, `saison complète : ${Ko(JSON.stringify(api.getG()).length)}`);

/* une sauvegarde d'AVANT l'allègement (clubs entiers dans l'historique) doit maigrir au chargement */
const gros = JSON.parse(JSON.stringify(api.getG()));
gros.histo = [[{ h: gros.clubs[0], a: gros.clubs[1], sh: 2, sa: 1 }]];
gros.news = new Array(400).fill("Une dépêche de plus, et puis une autre.");
const avant = JSON.stringify(gros).length;
api.setG(gros); api.migre(); G = api.getG();
ok(typeof G.histo[0][0].h === "string" && G.news.length === 60,
  `une vieille sauvegarde maigrit en la chargeant : ${Ko(avant)} → ${Ko(JSON.stringify(G).length)}`);

/* ===== B) plusieurs carrières cohabitent ===== */
console.log("\nB) Plusieurs carrières cohabitent");
ls.clear();
const idA = api.CLUBS[0].id, idB = api.CLUBS_D2[3].id;
api.nouvellePartie(idA);
for (let i = 0; i < 5; i++) api.jouerJournee();
reel(() => api.sauvegardeLocale(true));
const cleA = api.getPARTIE().k, partA = api.getPARTIE().id;
ok(api.partiesListe().length === 1, "une première carrière est enregistrée");

api.nouvellePartie(idB);
for (let i = 0; i < 12; i++) api.jouerJournee();
reel(() => api.sauvegardeLocale(true));
const cleB = api.getPARTIE().k, partB = api.getPARTIE().id;
let l = api.partiesListe();
ok(l.length === 2, "la seconde s'AJOUTE : les deux carrières sont là");
ok(cleA !== cleB && ls.getItem(cleA) && ls.getItem(cleB), "chacune a sa propre clé, aucune n'écrase l'autre");
ok(l[0].id === partB, "la plus récemment jouée est en tête de liste");
ok(l[0].club === api.metaClub(idB).nom && l[0].journee === 13 && l[0].div === 2,
  `la fiche est juste : ${l[0].club} · ${l[0].saison}, J${l[0].journee}/38 · D${l[0].div}`);

reel(() => api.chargeLocale(partA));
ok(api.getG().monClub === idA && api.getPARTIE().k === cleA, "on rouvre la première carrière au bon endroit");
ok(api.getG().journee === 5, "elle reprend exactement là où on l'avait laissée (J6)");
for (let i = 0; i < 3; i++) api.jouerJournee();
reel(() => api.sauvegardeLocale(true));
ok(JSON.parse(ls.getItem(cleB)).journee === 12, "y jouer ne touche pas à la seconde carrière");
ok(api.partiesListe()[0].id === partA, "la liste se réordonne : la carrière reprise repasse en tête");

/* ===== C) la carrière d'avant le multi-parties ===== */
console.log("\nC) La carrière des testeurs (clé historique) est adoptée telle quelle");
ls.clear();
api.nouvellePartie(api.CLUBS[2].id);
for (let i = 0; i < 7; i++) api.jouerJournee();
const ancienne = JSON.parse(JSON.stringify(api.getG()));
delete ancienne.pid; delete ancienne._maj; // une sauvegarde d'avant ne connaît ni l'un ni l'autre
ls.clear();
ls.setItem(api.SAVEKEY, JSON.stringify(ancienne));
l = api.partiesListe();
ok(l.length === 1 && l[0].k === api.SAVEKEY, "elle apparaît dans la liste sans avoir été recopiée");
ok(l[0].club === api.metaClub(ancienne.monClub).nom && l[0].journee === 8, `reconnue : ${l[0].club}, J${l[0].journee}/38`);
reel(() => api.chargeLocale(l[0].id));
ok(api.getG().monClub === ancienne.monClub, "on la reprend normalement");
api.jouerJournee();
reel(() => api.sauvegardeLocale(true));
ok(ls.getItem(api.SAVEKEY) && JSON.parse(ls.getItem(api.SAVEKEY)).journee === 8,
  "elle continue de s'écrire dans SA clé : une ancienne version du jeu la relirait encore");
ok(Object.keys(ls._m).filter(k => k.indexOf(api.PARTPFX) === 0).length === 0,
  "aucun doublon n'a été créé dans une clé neuve");

/* ===== D) l'index se répare tout seul ===== */
console.log("\nD) L'index se répare tout seul");
ls.clear();
api.nouvellePartie(idA); reel(() => api.sauvegardeLocale(true));
const kA = api.getPARTIE().k;
api.nouvellePartie(idB); reel(() => api.sauvegardeLocale(true));
ls.removeItem(api.IDXKEY); // index perdu (nettoyage de navigateur, bug, import manuel...)
l = api.partiesListe();
ok(l.length === 2, "index effacé : les deux carrières sont retrouvées par balayage des clés");
ok(l[0].maj >= l[1].maj, "et remises dans l'ordre grâce à la date portée par la sauvegarde");
ls.removeItem(kA); // une sauvegarde disparaît, l'index y croit encore
l = api.partiesListe();
ok(l.length === 1 && l.every(e => ls.getItem(e.k) !== null), "une entrée orpheline est retirée de la liste");

/* ===== E) renommer et supprimer ===== */
console.log("\nE) Renommer et supprimer");
ls.clear();
api.nouvellePartie(idA); reel(() => api.sauvegardeLocale(true));
const pid = api.getPARTIE().id, pk = api.getPARTIE().k;
// pas de reel() ici : sans DOM, la fenêtre de saisie valide la réponse préparée par le test
global.window._saisie = "La remontada messine";
api.renommePartie(pid);
global.window._saisie = null;
ok(api.partiesListe()[0].nom === "La remontada messine", "une carrière peut porter un nom choisi");
reel(() => api.sauvegardeLocale(true));
ok(api.partiesListe()[0].nom === "La remontada messine", "le nom survit aux sauvegardes suivantes");
api.supprimePartie(pid); // sans DOM, la fenêtre de confirmation prend le chemin du « oui »
ok(api.partiesListe().length === 0 && ls.getItem(pk) === null, "la supprimer efface la sauvegarde ET son entrée d'index");

/* ===== F) mémoire pleine ===== */
console.log("\nF) Mémoire du navigateur pleine");
ls.clear();
api.nouvellePartie(idA);
for (let i = 0; i < 6; i++) api.jouerJournee();
ls.quota = 100; // plus rien ne rentre
ALERTES.length = 0; api.setSaveCrie(false);
const r1 = reel(() => api.sauvegardeLocale(true));
ok(r1 === false && api.getSaveKO() === true, "la sauvegarde échoue proprement, sans exception");
ok(ALERTES.length === 1 && /pleine/.test(ALERTES[0]), "le joueur est prévenu une fois, et on lui dit quoi faire");
ALERTES.length = 0;
reel(() => api.sauvegardeLocale(true));
ok(ALERTES.length === 0, "la sauvegarde auto ne harcèle pas le joueur à chaque écran");
let boum = null;
try { api.jouerJournee(); } catch (e) { boum = e; }
ok(!boum, "et la partie continue de se jouer malgré tout");
ls.quota = 0;
ok(reel(() => api.sauvegardeLocale(true)) === true && api.getSaveKO() === false,
  "de la place libérée, la sauvegarde repart");

/* ===== G) le nombre de carrières est borné ===== */
console.log("\nG) Le nombre de carrières est borné");
ls.clear();
for (let i = 0; i < api.MAX_PARTIES; i++) { api.nouvellePartie(api.CLUBS[i].id); reel(() => api.sauvegardeLocale(true)); }
ALERTES.length = 0;
ok(api.partiesListe().length === api.MAX_PARTIES, `${api.MAX_PARTIES} carrières tiennent dans le navigateur`);
ok(reel(() => api.placeDispo()) === false && ALERTES.length === 1,
  "la suivante est refusée, avec l'explication (supprimer une carrière)");
ok(ls.poids() * 2 < 5 * 1024 * 1024,
  `${api.MAX_PARTIES} carrières pèsent ${Ko(ls.poids())} de texte, soit ${(ls.poids() * 2 / 1048576).toFixed(1)} Mo en UTF-16 — sous les ~5 Mo du navigateur`);

/* ===== H) un match en cours ne part jamais dans la sauvegarde =====
   G._pend porte des RÉFÉRENCES aux vrais clubs et aux vrais joueurs. Sérialisé, il les duplique — et
   au rechargement la fin de journée s'appliquerait à des clones détachés : une journée comptée dans le
   vide, un match perdu pour le classement. Deux verrous depuis v1.05 : la propriété est non énumérable
   (JSON.stringify l'ignore) ET sauvegardeLocale refuse d'écrire tant qu'elle est levée, pour que la
   dernière sauvegarde reste celle d'AVANT le coup d'envoi — la seule cohérente. */
console.log("\nH) Un match en cours ne part jamais dans la sauvegarde");
ls.clear();
api.nouvellePartie(idA);
const Gp = api.getG();
const poidsAvant = JSON.stringify(Gp).length;
api.posePend({ res: Gp.clubs.map(c => ({ h: c, a: c, sh: 0, sa: 0 })), pend: null, monMatch: { ev: [] } });
ok(!!Gp._pend, "le match en cours est bien posé sur G");
ok(JSON.parse(JSON.stringify(Gp))._pend === undefined, "JSON.stringify l'ignore : aucun clone de club dans le fichier");
ok(JSON.stringify(Gp).length === poidsAvant, "et la sauvegarde ne grossit pas d'un octet");
ok(reel(() => api.sauvegardeLocale(true)) === false && ls.getItem(api.getPARTIE().k) === null,
  "tant qu'il est levé, rien n'est écrit : on ne fige pas une journée à moitié jouée");
Gp._pend = null;
ok(reel(() => api.sauvegardeLocale(true)) === true, "le coup de sifflet passé, la sauvegarde repart normalement");

console.log(FAILS ? `\n❌ ${FAILS} test(s) en échec` : "\n✅ HARNAIS SAUVEGARDES : TOUT EST VERT");
process.exit(FAILS ? 1 : 0);
