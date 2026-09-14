/* Harnais de validation — SAISON DE DÉPART 1998-99
   Vérifie : intégrité du registre SAISONS, doublons de noms, année de base/étés,
   sièges européens, carrière multi-saisons depuis 98/99 (calibrage, vieillissement).
   Usage : node harness9899.cjs                                                    */
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const a = html.indexOf("<script>") + "<script>".length;
const b = html.lastIndexOf("</script>");
const script = html.slice(a, b);

function makeStub() {
  let stub; const fn = function () { return stub; };
  stub = new Proxy(fn, {
    get(_t, p) { if (p === Symbol.toPrimitive) return () => ""; if (p === "length") return 0; return stub; },
    set() { return true; }, apply() { return stub; }, has() { return true; }, construct() { return stub; },
  });
  return stub;
}
const ls = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
global.document = makeStub();
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, localStorage: ls, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.localStorage = ls;
global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,CIBLE,SAISONS,STARS_9899,STARS_D2_9899,D1_9899,D2_9899,STARS_EUROPE,STARS_EUROPE_C2,STARS_EUROPE_C3,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const KEY = "1998-99";

/* ===== 1) Intégrité du registre SAISONS ===== */
console.log("1) Registre SAISONS : composition, métadonnées, effectifs");
try {
  const S = api.SAISONS[KEY];
  if (!S) fail("saison " + KEY + " absente du registre");
  else {
    if (S.d1.length !== 20) fail("D1 98/99 a " + S.d1.length + " clubs (attendu 20)");
    if (S.d2.length !== 20) fail("D2 98/99 a " + S.d2.length + " clubs (attendu 20)");
    const tous = S.d1.concat(S.d2);
    const setIds = new Set(tous);
    if (setIds.size !== 40) fail("ids dupliqués entre D1 et D2 (uniques: " + setIds.size + "/40)");
    const metaManquante = tous.filter(id => !api.metaClub(id));
    if (metaManquante.length) fail("métadonnées manquantes : " + metaManquante.join(","));
    if (!metaManquante.length && setIds.size === 40 && S.d1.length === 20 && S.d2.length === 20)
      ok("98/99 = 20 D1 + 20 D2, 40 clubs uniques, toutes métadonnées résolues");
    if (!S.d1.includes("GUI") || !S.d1.includes("CHA")) fail("Guingamp et Châteauroux devraient être repêchés en D1");
    else ok("Guingamp et Châteauroux repêchés en D1 (la vraie D1 98/99 n'avait que 18 clubs)");
    if (!S.d2.includes("LOU") || !S.d2.includes("MAR")) fail("Louhans-Cuiseaux et Martigues devraient compléter la D2");
    else ok("Louhans-Cuiseaux et Martigues repêchés en D2 (la vraie D2 98/99 n'avait que 20 clubs, dont 2 montés en D1)");
    for (const neuf of ["SED", "AJA"]) {
      const m = api.metaClub(neuf);
      if (!m) fail("club neuf " + neuf + " absent de CLUBS_EXTRA");
      else if (!m.stade || !m.cap) fail("club neuf " + neuf + " sans stade/capacité");
    }
    ok("Sedan et Ajaccio présents dans CLUBS_EXTRA avec stade et capacité");
    // effectifs : non vides, postes valides, notes dans les bornes
    let pb = [];
    for (const id of tous) {
      const L = (S.d1.includes(id) ? S.starsD1 : S.starsD2)[id];
      if (!L || !L.length) { pb.push(id + " vide"); continue; }
      if (L.length < 14) pb.push(id + " maigre (" + L.length + ")");
      for (const t of L) {
        if (!["G", "D", "M", "A"].includes(t[1])) pb.push(id + " poste invalide " + t[0]);
        if (!(t[2] >= 15 && t[2] <= 38)) pb.push(id + " âge suspect " + t[0] + " " + t[2]);
        if (!(t[3] >= 55 && t[3] <= 90)) pb.push(id + " note hors bornes " + t[0] + " " + t[3]);
        if (!(t[4] >= t[3] && t[4] <= 97)) pb.push(id + " pot incohérent " + t[0]);
      }
      const nG = L.filter(t => t[1] === "G").length;
      if (nG < 1) pb.push(id + " sans gardien réel");
    }
    if (pb.length) pb.forEach(fail); else ok("40 effectifs réels valides (postes, âges, notes ≤ 90, pot ≥ note)");
  }
} catch (e) { fail("exception registre : " + e.stack); }

/* ===== 2) Doublons de noms ===== */
console.log("2) Doublons de noms");
try {
  const compte = {};
  const ajoute = (nom, src) => { (compte[nom] = compte[nom] || []).push(src); };
  for (const id in api.STARS_9899) for (const t of api.STARS_9899[id]) ajoute(t[0], "D1:" + id);
  for (const id in api.STARS_D2_9899) for (const t of api.STARS_D2_9899[id]) ajoute(t[0], "D2:" + id);
  const dupClub = Object.entries(compte).filter(([n, s]) => s.length > 1);
  if (dupClub.length) dupClub.forEach(([n, s]) => fail("doublon 98/99 : « " + n + " » dans " + s.join(" + ")));
  else ok("aucun joueur dupliqué entre deux clubs en 98/99");
  // réconciliation France ↔ Europe (clubs européens figés en 95-96)
  const eur = new Set();
  for (const T of [api.STARS_EUROPE, api.STARS_EUROPE_C2, api.STARS_EUROPE_C3]) for (const id in T) for (const t of T[id]) eur.add(t[0]);
  const collE = Object.keys(compte).filter(n => eur.has(n));
  api.nouvellePartie("BOR", KEY);
  const Gv = api.getG();
  const enFr = new Set(); for (const c of Gv.clubs.concat(Gv.autre)) for (const j of c.joueurs) if (j.reel) enFr.add(j.nom);
  const surDeux = []; for (const c of Gv.europe) for (const j of c.joueurs) if (j.reel && enFr.has(j.nom)) surDeux.push(j.nom + " (" + c.id + ")");
  if (surDeux.length) fail("joueurs réels à la fois en France et en Europe : " + surDeux.join(", "));
  else ok(collE.length + " joueurs passés en France (" + collE.slice(0, 4).join(", ") + "…) retirés de leur club européen");
  const courts = Gv.europe.filter(c => ["G", "D", "M", "A"].some(p => c.joueurs.filter(j => j.pos === p).length < api.CIBLE[p]));
  if (courts.length) fail("clubs européens sous l'effectif cible après réconciliation : " + courts.map(c => c.id).join(","));
  const employes = new Set();
  for (const c of Gv.clubs.concat(Gv.autre || [])) for (const j of c.joueurs) employes.add(j.nom);
  const vivNoms = [];
  for (const t in (Gv.vivier || {})) for (const e of Gv.vivier[t]) vivNoms.push(e[0]);
  for (const r of (Gv.rapport || [])) if (r && r.nom) vivNoms.push(r.nom);
  const coll = [...new Set(vivNoms.filter(n => employes.has(n)))];
  if (coll.length) fail("vivier 98/99 contient des joueurs déjà employés : " + coll.join(", "));
  else ok("vivier construit disjoint des effectifs employés (98/99)");
} catch (e) { fail("exception doublons : " + e.stack); }

/* ===== 3) Année de base + Euro 2000 + sièges européens ===== */
console.log("3) Année de base, Euro 2000, sièges européens");
try {
  api.nouvellePartie("BOR", KEY);
  let G = api.getG();
  if (G.saison !== KEY) fail("G.saison = " + G.saison + " (attendu " + KEY + ")");
  if (G.anBase !== 1998) fail("G.anBase = " + G.anBase + " (attendu 1998)");
  if (api.anneeJeu() !== 1998) fail("anneeJeu() = " + api.anneeJeu() + " (attendu 1998)");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G.vire = null;
  api.intersaison();
  G = api.getG();
  if (/COUPE DU MONDE|Euro/i.test((G.recap || []).join(" "))) fail("été 1999 : aucun grand tournoi ne devrait tomber");
  else ok("été 1999 : pas de tournoi international (correct)");
  if (G.saison === "1999-00") ok("chaîne de saison correcte : 1998-99 → 1999-00");
  else fail("chaîne de saison : G.saison = " + G.saison + " (attendu 1999-00)");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G.vire = null;
  api.intersaison();
  G = api.getG();
  if (!/Euro : LA FRANCE RÉALISE LE DOUBLÉ/i.test((G.recap || []).join(" "))) fail("été 2000 : Euro 2000 non déclenché à la 2e intersaison");
  else ok("année de base 1998 ; Euro 2000 déclenché à l'été 2000");
  const attendu = { LEN: "C1", MET: "C1", PSG: "C2", MON: "C3", OM: "C3", BOR: "C3", BAS: "C3", AUX: "C3", LYO: "C3", REN: null, STE: null, SED: null };
  for (const id in attendu) {
    api.nouvellePartie(id, KEY);
    const c = api.getG().euroCompet;
    if (c !== attendu[id]) fail("siège européen " + id + " = " + c + " (attendu " + attendu[id] + ")");
  }
  ok("sièges européens : Lens et Metz en C1, le PSG en C2, Monaco/OM/Bordeaux + les trois de l'Intertoto en C3");
} catch (e) { fail("exception année/Europe : " + e.stack); }

/* ===== 4) Carrière multi-saisons depuis 98/99 ===== */
console.log("4) Carrière multi-saisons depuis 98/99 (calibrage, vieillissement)");
let totalButs = 0, totalMatchs = 0;
const departs = ["BOR", "LEN", "GUI", "SED"]; // champion, siège C1, repêché, nouveau venu
const NS = 6;
for (const dep of departs) {
  try {
    api.nouvellePartie(dep, KEY);
    for (let s = 0; s < NS; s++) {
      for (let d = 0; d < 38; d++) api.jouerJournee();
      const G = api.getG();
      let bp = 0, jSum = 0;
      for (const c of G.clubs) { bp += c.bp; jSum += c.j; }
      totalButs += bp; totalMatchs += jSum / 2;
      G.vire = null;
      api.intersaison();
      let mx = 0, actif36 = null;
      for (const c of api.getG().clubs) for (const j of c.joueurs) { if (j.age > mx) mx = j.age; if (j.age >= 36) actif36 = j; }
      if (actif36) { fail("joueur 36+ actif après vieillissement : " + actif36.nom + " (" + actif36.age + ")"); break; }
      if (mx > 35) { fail("âge max " + mx + " > 35"); break; }
    }
    ok("club " + dep + " : " + NS + " saisons sans exception (âge max ≤ 35)");
  } catch (e) { fail("exception carrière 98/99 (" + dep + ") : " + e.stack); }
}
const gpm = totalButs / totalMatchs;
console.log("— Calibrage 98/99 : " + gpm.toFixed(3) + " buts/match sur " + Math.round(totalMatchs) + " matchs —");
if (gpm < 2.0 || gpm > 2.8) fail("calibrage 98/99 hors plage (cible ~2,3) : " + gpm.toFixed(3));
else ok("calibrage 98/99 dans la plage attendue");

console.log(FAILS === 0 ? "\n✅ HARNAIS 98/99 : TOUT EST VERT" : "\n❌ HARNAIS 98/99 : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
