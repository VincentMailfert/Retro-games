/* Harnais headless — LES DÉFIS ET LA SALLE DES TROPHÉES (v2.75)
   Des défis rapportent des points (jamais stockés : ils se déduisent des défis réussis), une salle des
   trophées réunit, à l'accueil, tout ce que le joueur a gagné, toutes carrières confondues.
   A) une progression neuve : aucun défi, zéro point, la porte de l'accueil dit ⭐ 0
   B) les défis de match tombent au soir de la journée, et seulement quand le score le dit
   C) un défi ne rapporte qu'une fois, et les points sont la somme des défis réussis
   D) la fin de saison : titre, podium, montée, coupe, Europe, doublé, forteresse, invincibles
   E) la carrière : cinq et dix saisons, trois saisons ouvertes, champion dans deux championnats
   F) le rattrapage depuis les résultats déjà rangés, sans notification, une seule fois
   G) la fusion de deux appareils réunit les défis, la plus ancienne réussite fait foi
   H) le nettoyage de ce qui vient du navigateur ou du serveur
   I) l'écran : la vitrine, les blasons des clubs sacrés, les trois familles de défis
   J) une vraie carrière de six saisons : pas d'erreur, chaque défi de match réussi est justifié par un score
   Usage : node harness-trophees.cjs                                                            */
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</scr" + "ipt>"));

function makeStub() {
  let stub; const fn = function () { return stub; };
  stub = new Proxy(fn, {
    get(_t, p) { if (p === Symbol.toPrimitive) return () => ""; if (p === "length") return 0; return stub; },
    set() { return true; }, apply() { return stub; }, has() { return true; }, construct() { return stub; },
  });
  return stub;
}
function nouveauLS() {
  return {
    _m: {},
    get length() { return Object.keys(this._m).length; },
    key(i) { return Object.keys(this._m)[i] ?? null; },
    getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; },
  };
}
const noeud = () => { const n = { _h: "", style: {}, querySelector: () => null, querySelectorAll: () => [] };
  Object.defineProperty(n, "innerHTML", { get() { return n._h; }, set(v) { n._h = String(v); } }); return n; };
const APP = noeud(), FICHE = noeud();
const generic = makeStub();
global.document = new Proxy(function () {}, {
  get(_t, p) { if (p === "getElementById") return id => (id === "app" ? APP : id === "fiche" ? FICHE : generic); if (p === Symbol.toPrimitive) return () => ""; return generic; },
  set() { return true; }, apply() { return generic; }, has() { return true; }, construct() { return generic; },
});
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, location: { href: "" }, scrollTo() {}, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0); global.cancelAnimationFrame = (id) => clearTimeout(id);

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,classement,clubById,SAISONS,prog,progMag,progVide,progNette," +
  "progFusionne,progEmpreinte,ecranAccueil,ecranTrophees,DEFIS,DEFI_DE,defiReussi,pointsDefis,defiGagne,mesMatchs," +
  "defisJournee,defisFinSaison,defisCarriere,defisConstate,vitrine," +
  "getG:function(){return G;},setG:function(x){G=x;}};";
function appareil(ls) { global.localStorage = ls; global.window.localStorage = ls; return new Function(script + epilogue)(); }

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const ids = api => api.prog().defis.map(d => d.id).sort();
/* une journée forgée : le seul match du club, à domicile ou dehors */
function journee(G, dom, bp, bc) {
  const adv = "ADV";
  G.histo.push([dom ? { h: G.monClub, a: adv, sh: bp, sa: bc, mien: true } : { h: adv, a: G.monClub, sh: bc, sa: bp, mien: true },
    { h: "X1", a: "X2", sh: 9, sa: 0, mien: false }]);
}
function vide(api) { const p = api.prog(); p.defis = []; p.resultats = []; p.ouvertes = []; p.gagnees = []; }

/* ===== A) progression neuve ===== */
console.log("A) Une progression neuve : aucun défi, zéro point");
let api = appareil(nouveauLS());
{
  ok(api.prog().defis.length === 0 && api.pointsDefis() === 0, "aucun défi réussi, zéro point");
  ok(api.DEFIS.length >= 20 && new Set(api.DEFIS.map(d => d.id)).size === api.DEFIS.length, `${api.DEFIS.length} défis, identifiants uniques`);
  ok(api.DEFIS.every(d => ["pas", "saison", "carriere"].includes(d.fam) && d.pts > 0 && d.nom), "chaque défi a une famille, un nom et des points");
  ok(!api.DEFIS.some(d => /—/.test(d.nom)), "aucun tiret long dans les noms des défis");
  api.ecranAccueil();
  ok(/id="bTrophees"/.test(APP.innerHTML) && /⭐ 0</.test(APP.innerHTML), "l'accueil porte la salle des trophées, ⭐ 0");
}

/* ===== B) les défis de match ===== */
console.log("B) Les défis de match tombent au soir de la journée");
{
  api.nouvellePartie(api.SAISONS["1995-96"].d1[0], "1995-96"); const G = api.getG(); G.histo = []; vide(api); G.notifs = [];
  journee(G, true, 1, 1); api.defisJournee();
  ok(ids(api).length === 0, "un nul 1-1 ne rapporte rien");
  journee(G, true, 2, 1); api.defisJournee();
  ok(ids(api).join() === "vic", "une victoire à domicile : « Une première victoire » seulement");
  ok(G.notifs.some(n => /DÉFI RÉUSSI : Une première victoire · \+10 pts/.test(n)), "le debrief l'annonce");
  journee(G, false, 1, 0); api.defisJournee();
  ok(api.defiReussi("ext") && api.defiReussi("zero"), "1-0 dehors : gagner à l'extérieur, et sans encaisser");
  journee(G, true, 5, 2); api.defisJournee();
  ok(api.defiReussi("large") && api.defiReussi("cinq"), "5-2 : trois buts d'écart, cinq buts");
  const avant = G.notifs.length; journee(G, true, 3, 0); api.defisJournee();
  ok(G.notifs.length === avant, "rien de neuf, rien d'annoncé");
  ok(!api.defiReussi("serie6"), "quatre victoires d'affilée, pas encore six");
  journee(G, true, 1, 0); journee(G, true, 1, 0); api.defisJournee();
  ok(api.defiReussi("serie6"), "six victoires d'affilée");
  ok(!api.defiReussi("murs10"), "cinq matchs sans encaisser ne suffisent pas");
  for (let i = 0; i < 6; i++) journee(G, i % 2 === 0, 0, 0); api.defisJournee(); // 4 + 6 = 10 matchs sans encaisser
  ok(api.defiReussi("murs10") && api.defiReussi("invaincu10"), "dix matchs sans encaisser, dix sans défaite");
}

/* ===== C) une seule fois ===== */
console.log("C) Un défi ne rapporte qu'une fois");
{
  const n = api.prog().defis.length, pts = api.pointsDefis();
  ok(api.defiGagne("vic") === false && api.prog().defis.length === n, "regagner un défi ne l'ajoute pas");
  ok(api.defiGagne("inconnu") === false, "un défi inconnu est refusé");
  ok(pts === api.prog().defis.reduce((s, d) => s + api.DEFI_DE[d.id].pts, 0), `les points sont la somme des défis réussis (${pts})`);
  ok(!("points" in api.prog()), "les points ne sont stockés nulle part");
}

/* ===== D) la fin de saison ===== */
console.log("D) La fin de saison");
{
  const G = api.getG(); vide(api); G.histo = []; G.div = 1;
  for (let i = 0; i < 38; i++) journee(G, i % 2 === 0, 2, i % 5 === 0 ? 2 : 0);
  api.defisFinSaison(1, ["CN", "C1"]);
  for (const id of ["forteresse", "podium", "titre", "coupe", "europe", "double", "invincibles"]) ok(api.defiReussi(id), "réussi : " + api.DEFI_DE[id].nom);
  ok(!api.defiReussi("montee"), "pas de montée depuis la D1");
  vide(api); G.histo = []; G.div = 1;
  for (let i = 0; i < 38; i++) journee(G, i % 2 === 0, i === 4 ? 0 : 2, i === 4 ? 1 : 0);
  api.defisFinSaison(1, []);
  ok(api.defiReussi("titre") && !api.defiReussi("invincibles") && !api.defiReussi("forteresse"), "une défaite à domicile : champion, mais ni invincible ni forteresse");
  ok(!api.defiReussi("coupe") && !api.defiReussi("double") && !api.defiReussi("europe"), "sans coupe, ni coupe ni doublé ni Europe");
  vide(api); G.div = 2; api.defisFinSaison(3, []);
  ok(api.defiReussi("montee") && !api.defiReussi("podium") && !api.defiReussi("titre"), "3ᵉ de D2 : la montée, pas le podium de D1");
  vide(api); G.div = 2; api.defisFinSaison(4, []);
  ok(!api.defiReussi("montee"), "4ᵉ de D2 : pas de montée");
}

/* ===== E) la carrière ===== */
console.log("E) Les défis de la carrière");
{
  vide(api); const p = api.prog();
  p.resultats = [1, 2, 3, 4].map(an => ({ pid: "A", ch: "FR", an, club: "AUX", div: 1, rang: 8, coupes: [] }));
  api.defisCarriere("A", true);
  ok(!api.defiReussi("fidele"), "quatre saisons : pas encore fidèle");
  p.resultats.push({ pid: "B", ch: "FR", an: 4, club: "LEN", div: 1, rang: 9, coupes: [] });
  api.defisCarriere("A", true);
  ok(!api.defiReussi("fidele"), "quatre saisons dans deux carrières ne font pas cinq");
  p.resultats.push({ pid: "A", ch: "FR", an: 5, club: "AUX", div: 1, rang: 1, coupes: [] });
  api.defisCarriere("A", true);
  ok(api.defiReussi("fidele") && !api.defiReussi("decennie"), "cinq saisons dans une carrière, pas dix");
  ok(!api.defiReussi("deuxPays"), "champion en France seulement");
  p.resultats.push({ pid: "C", ch: "ANG", an: 1, club: "ARS", div: 1, rang: 1, coupes: [] });
  api.defisCarriere(null, true);
  ok(api.defiReussi("deuxPays"), "champion en France et en Angleterre");
  p.ouvertes = ["1991-92", "1992-93"]; api.defisCarriere(null, true);
  ok(!api.defiReussi("cles3"), "deux saisons ouvertes, pas trois");
  p.ouvertes.push("1993-94"); api.defisCarriere(null, true);
  ok(api.defiReussi("cles3"), "trois saisons ouvertes");
}

/* ===== F) le rattrapage ===== */
console.log("F) Le rattrapage depuis les résultats déjà rangés");
{
  const G = api.getG(); vide(api); G.notifs = []; const p = api.prog();
  p.resultats = [
    { pid: "A", ch: "FR", an: 1, club: "AUX", div: 2, rang: 2, coupes: [] },
    { pid: "A", ch: "FR", an: 2, club: "AUX", div: 1, rang: 1, coupes: ["CN"] },
    { pid: "B", ch: "FR", an: 1, club: "PSG", div: 1, rang: 5, coupes: ["C2"] },
  ];
  const n = api.defisConstate();
  ok(["montee", "podium", "titre", "coupe", "double", "europe"].every(api.defiReussi), `six défis rattrapés (${n})`);
  ok(G.notifs.length === 0, "sans un mot au debrief");
  ok(api.defisConstate() === 0, "repasser ne rapporte plus rien");
  ok(!api.defiReussi("vic") && !api.defiReussi("forteresse"), "un défi de match ou de G.histo ne se rattrape pas");
}

/* ===== G) la fusion ===== */
console.log("G) La fusion de deux appareils");
{
  const a = api.progVide(), b = api.progVide();
  a.defis = [{ id: "vic", t: 200, pid: "A" }, { id: "titre", t: 500, pid: "A" }];
  b.defis = [{ id: "vic", t: 100, pid: "B" }, { id: "coupe", t: 300, pid: "B" }];
  const f = api.progFusionne(a, b);
  ok(f.defis.map(d => d.id).sort().join() === "coupe,titre,vic", "la réunion des défis");
  ok(f.defis.find(d => d.id === "vic").t === 100, "la plus ancienne réussite fait foi");
  ok(api.progEmpreinte(a) !== api.progEmpreinte(f), "un défi de plus change l'empreinte (donc part au serveur)");
  ok(api.progFusionne(a, null).defis.length === 2, "fusionner avec rien ne perd rien");
  const vieux = api.progVide(); delete vieux.defis;
  ok(api.progFusionne(vieux, b).defis.length === 2, "une progression d'avant la v2.75 (sans défis) fusionne");
}

/* ===== H) le nettoyage ===== */
console.log("H) Le nettoyage de ce qui arrive");
{
  const n = api.progNette({ defis: [{ id: "vic", t: 1 }, { id: "<script>" }, null, { id: 3 }, { id: "x".repeat(40) }] });
  ok(n.defis.length === 1 && n.defis[0].id === "vic", "seuls les identifiants propres passent");
  ok(Array.isArray(api.progNette({}).defis) && Array.isArray(api.progNette(null).defis), "une progression sans défis en reçoit une liste vide");
}

/* ===== I) l'écran ===== */
console.log("I) La salle des trophées");
{
  vide(api); const p = api.prog();
  p.resultats = [
    { pid: "A", ch: "FR", an: 1, club: "AUX", div: 1, rang: 1, coupes: ["CN"] },
    { pid: "A", ch: "FR", an: 2, club: "AUX", div: 1, rang: 1, coupes: ["C1"] },
    { pid: "B", ch: "FR", an: 1, club: "MET", div: 2, rang: 1, coupes: [] },
  ];
  const v = api.vitrine();
  ok(v.d1 === 2 && v.d2 === 1 && v.cn === 1 && v.C1 === 1 && v.C2 === 0, "la vitrine compte deux titres, une D2, une coupe, une C1");
  ok(Object.keys(v.clubs).length === 1 && v.clubs["FR|AUX"] === 2, "un seul club sacré, deux fois");
  api.ecranTrophees(); const h = APP.innerHTML;
  ok(/SALLE DES TROPHÉES/.test(h) && /⭐ /.test(h), "le titre et les points");
  ok(/class="trBlason"/.test(h) && /×2/.test(h), "le blason du club sacré, marqué ×2");
  ok(/Premiers pas/.test(h) && /La saison/.test(h) && /La carrière/.test(h), "les trois familles de défis");
  ok((h.match(/class="trDefi/g) || []).length === api.DEFIS.length, "tous les défis sont listés");
  ok(/trDefi ok/.test(h) && /✅ Champion de première division/.test(h), "un défi rattrapé est coché");
  ok(!/—/.test(h.replace(/<[^>]+>/g, "")), "aucun tiret long à l'écran");
  ok(/id="bRetourAcc"/.test(h), "un retour à l'accueil");
}

/* ===== J) une vraie carrière ===== */
console.log("J) Une carrière de six saisons");
{
  api = appareil(nouveauLS());
  let err = null, justes = true, saisons = 0;
  try {
    api.nouvellePartie(api.SAISONS["1995-96"].d1[0], "1995-96");
    for (saisons = 0; saisons < 6; saisons++) {
      const G = api.getG();
      while (!G.finie) {
        const avant = new Set(api.prog().defis.map(d => d.id));
        api.jouerJournee();
        const ms = api.mesMatchs(), x = ms[ms.length - 1];
        const neufs = api.prog().defis.map(d => d.id).filter(id => !avant.has(id));
        const VRAI = { vic: x && x.bp > x.bc, ext: x && !x.dom && x.bp > x.bc, zero: x && x.bc === 0, large: x && x.bp - x.bc >= 3, cinq: x && x.bp >= 5 };
        for (const id of neufs) if (id in VRAI && !VRAI[id]) justes = false;
      }
      api.intersaison();
    }
  } catch (e) { err = e; }
  ok(!err, "aucune erreur sur six saisons" + (err ? " : " + err.stack.split("\n").slice(0, 3).join(" | ") : ""));
  ok(justes, "chaque défi de match réussi l'a été sur un vrai score");
  ok(api.prog().resultats.length === 6, "six fins de saison rangées");
  ok(api.defiReussi("vic") && api.defiReussi("fidele"), "au moins une victoire, et la fidélité après cinq saisons");
  console.log("    défis : " + ids(api).join(", ") + " · " + api.pointsDefis() + " pts");
}

console.log(FAILS ? `\n${FAILS} ÉCHEC(S)` : "\nTOUT EST VERT");
process.exit(FAILS ? 1 : 0);
