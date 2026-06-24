/* Harnais de validation — SAISON DE DÉPART 1996-97
   Vérifie : intégrité du registre SAISONS, doublons de noms, année de base/étés,
   carrière multi-saisons depuis 96/97 (calibrage, vieillissement, zéro exception).
   Usage : node harness9697.cjs                                                    */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,construitDivision,CIBLE,SAISONS,STARS,STARS_D2,STARS_9697,STARS_D2_9697,VIVIER,JOKERS_RESERVE,D1_9697,D2_9697,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);

/* ===== 1) Intégrité du registre SAISONS ===== */
console.log("1) Registre SAISONS : composition, métadonnées résolues");
try {
  const S = api.SAISONS["1996-97"];
  if (!S) fail("saison 1996-97 absente du registre");
  else {
    if (S.d1.length !== 20) fail("D1 96/97 a " + S.d1.length + " clubs (attendu 20)");
    if (S.d2.length !== 20) fail("D2 96/97 a " + S.d2.length + " clubs (attendu 20)");
    const tous = S.d1.concat(S.d2);
    const setIds = new Set(tous);
    if (setIds.size !== 40) fail("ids dupliqués entre D1 et D2 (uniques: " + setIds.size + "/40)");
    let metaManquante = tous.filter(id => !api.metaClub(id));
    if (metaManquante.length) fail("métadonnées manquantes : " + metaManquante.join(","));
    if (!metaManquante.length && setIds.size === 40 && S.d1.length === 20 && S.d2.length === 20)
      ok("96/97 = 20 D1 + 20 D2, 40 clubs uniques, toutes métadonnées résolues");
    // chaque club a un effectif réel non vide
    let vides = tous.filter(id => { const m = (S.d1.includes(id) ? S.starsD1 : S.starsD2)[id]; return !m || !m.length; });
    if (vides.length) fail("effectif réel vide : " + vides.join(",")); else ok("chaque club 96/97 a un effectif réel non vide");
  }
} catch (e) { fail("exception registre : " + e.stack); }

/* ===== 2) Doublons de noms (intra-saison 96/97 + vs vivier) ===== */
console.log("2) Doublons de noms");
try {
  const compte = {};
  const ajoute = (nom, src) => { (compte[nom] = compte[nom] || []).push(src); };
  for (const id in api.STARS_9697) for (const t of api.STARS_9697[id]) ajoute(t[0], "D1:" + id);
  for (const id in api.STARS_D2_9697) for (const t of api.STARS_D2_9697[id]) ajoute(t[0], "D2:" + id);
  const dupClub = Object.entries(compte).filter(([n, s]) => s.length > 1);
  if (dupClub.length) { dupClub.forEach(([n, s]) => fail("doublon 96/97 : « " + n + " » dans " + s.join(" + "))); }
  else ok("aucun joueur dupliqué entre deux clubs en 96/97");
  // collision runtime : aucun nom du vivier CONSTRUIT n'est employé dans une équipe (96/97)
  api.nouvellePartie("PSG", "1996-97");
  const Gv = api.getG();
  const employes = new Set();
  for (const c of Gv.clubs.concat(Gv.autre || [])) for (const j of c.joueurs) employes.add(j.nom);
  const vivNoms = [];
  for (const t in (Gv.vivier || {})) for (const e of Gv.vivier[t]) vivNoms.push(e[0]);
  const coll = [...new Set(vivNoms.filter(n => employes.has(n)))];
  if (coll.length) fail("vivier 96/97 contient des joueurs déjà employés : " + coll.join(", "));
  else ok("vivier construit disjoint des effectifs employés (96/97)");
} catch (e) { fail("exception doublons : " + e.stack); }

/* ===== 3) Année de base + étés internationaux ===== */
console.log("3) Année de base, chaîne de saison, étés (HONNEURS)");
try {
  api.nouvellePartie("PSG", "1996-97");
  let G = api.getG();
  if (G.saison !== "1996-97") fail("G.saison = " + G.saison + " (attendu 1996-97)");
  if (G.anBase !== 1996) fail("G.anBase = " + G.anBase + " (attendu 1996)");
  if (api.anneeJeu() !== 1996) fail("anneeJeu() = " + api.anneeJeu() + " (attendu 1996)");
  // joue une saison + intersaison → 1997-98, été 1997 (rien), puis 1998 = Mondial 98
  for (let d = 0; d < 38; d++) api.jouerJournee();
  api.intersaison();
  G = api.getG();
  if (G.saison !== "1997-98") fail("après 1 intersaison : G.saison = " + G.saison + " (attendu 1997-98)");
  if (api.anneeJeu() !== 1997) fail("anneeJeu() = " + api.anneeJeu() + " (attendu 1997)");
  // l'été de Mondial 98 doit tomber à l'intersaison suivante (anneeJeu()+1 === 1998)
  for (let d = 0; d < 38; d++) api.jouerJournee();
  api.intersaison();
  G = api.getG();
  const recap98 = (G.recap || []).join(" ");
  if (!/COUPE DU MONDE EN FRANCE/i.test(recap98)) fail("été 1998 : Mondial 98 non déclenché au bon moment");
  else ok("année de base 1996 OK ; Mondial 98 déclenché à l'été 1998 (et non décalé)");
  if (G.saison === "1998-99") ok("chaîne de saison correcte : 1996-97 → 1997-98 → 1998-99");
  else fail("chaîne de saison : G.saison = " + G.saison + " (attendu 1998-99)");
} catch (e) { fail("exception année de base : " + e.stack); }

/* ===== 4) Carrière multi-saisons depuis 96/97 ===== */
console.log("4) Carrière multi-saisons depuis 96/97 (calibrage, vieillissement)");
let totalButs = 0, totalMatchs = 0;
const departs = ["PSG", "STE", "OM", "TON"]; // D1, D2(ex-D1 relégué), D1(OM de retour), D2(nouveau club)
const NS = 6;
for (const dep of departs) {
  try {
    api.nouvellePartie(dep, "1996-97");
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
  } catch (e) { fail("exception carrière 96/97 (" + dep + ") : " + e.stack); }
}
const gpm = totalButs / totalMatchs;
console.log("— Calibrage 96/97 : " + gpm.toFixed(3) + " buts/match sur " + Math.round(totalMatchs) + " matchs —");
if (gpm < 2.0 || gpm > 2.8) fail("calibrage 96/97 hors plage (cible ~2,3) : " + gpm.toFixed(3));
else ok("calibrage 96/97 dans la plage attendue");

console.log(FAILS === 0 ? "\n✅ HARNAIS 96/97 : TOUT EST VERT" : "\n❌ HARNAIS 96/97 : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
