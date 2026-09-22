/* Harnais de validation — SAISON DE DÉPART 1999-00
   Vérifie : intégrité du registre SAISONS, doublons de noms, année de base/étés,
   sièges européens, carrière multi-saisons depuis 99/00 (calibrage, vieillissement).
   Usage : node harness9900.cjs                                                    */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,CIBLE,SAISONS,STARS_9900,STARS_D2_9900,D1_9900,D2_9900,STARS_EUROPE,STARS_EUROPE_C2,STARS_EUROPE_C3,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const KEY = "1999-00";

/* ===== 1) Intégrité du registre SAISONS ===== */
console.log("1) Registre SAISONS : composition, métadonnées, effectifs");
try {
  const S = api.SAISONS[KEY];
  if (!S) fail("saison " + KEY + " absente du registre");
  else {
    if (S.d1.length !== 20) fail("D1 99/00 a " + S.d1.length + " clubs (attendu 20)");
    if (S.d2.length !== 20) fail("D2 99/00 a " + S.d2.length + " clubs (attendu 20)");
    const tous = S.d1.concat(S.d2);
    const setIds = new Set(tous);
    if (setIds.size !== 40) fail("ids dupliqués entre D1 et D2 (uniques: " + setIds.size + "/40)");
    const metaManquante = tous.filter(id => !api.metaClub(id));
    if (metaManquante.length) fail("métadonnées manquantes : " + metaManquante.join(","));
    if (!metaManquante.length && setIds.size === 40 && S.d1.length === 20 && S.d2.length === 20)
      ok("99/00 = 20 D1 + 20 D2, 40 clubs uniques, toutes métadonnées résolues");
    if (!S.d1.includes("LOR") || !S.d1.includes("SOC")) fail("Lorient et Sochaux devraient être repêchés en D1");
    else ok("Lorient (35 pts) et Sochaux (33) repêchés en D1 (la vraie D1 99/00 n'avait que 18 clubs)");
    if (S.d1.includes("TOU")) fail("Toulouse (29 pts, 18e) ne doit pas être repêché : il reste en D2");
    else ok("Toulouse, dernier de D1 98/99, reste en D2 (seuls les deux meilleurs relégués montent)");
    if (!S.d2.includes("RST") || !S.d2.includes("BEA")) fail("Red Star et Beauvais devraient compléter la D2");
    else ok("Red Star (39 pts) et Beauvais (38) repêchés en D2, que les deux montées en D1 laissaient à 18");
    const m = api.metaClub("CRE");
    if (!m) fail("club neuf CRE absent de CLUBS_EXTRA");
    else if (!m.stade || !m.cap) fail("club neuf CRE sans stade/capacité");
    else ok("Créteil présent dans CLUBS_EXTRA avec stade et capacité (" + m.stade + ", " + m.cap + ")");
    // effectifs : non vides, postes valides, notes dans les bornes, aucun 36+
    let pb = [];
    for (const id of tous) {
      const L = (S.d1.includes(id) ? S.starsD1 : S.starsD2)[id];
      if (!L || !L.length) { pb.push(id + " vide"); continue; }
      if (L.length < 14) pb.push(id + " maigre (" + L.length + ")");
      for (const t of L) {
        if (!["G", "D", "M", "A"].includes(t[1])) pb.push(id + " poste invalide " + t[0]);
        if (!(t[2] >= 15 && t[2] <= 38)) pb.push(id + " âge hors bornes " + t[0] + " " + t[2]);
        if (!(t[3] >= 55 && t[3] <= 90)) pb.push(id + " note hors bornes " + t[0] + " " + t[3]);
        if (!(t[4] >= t[3] && t[4] <= 97)) pb.push(id + " pot incohérent " + t[0]);
      }
      if (!L.filter(t => t[1] === "G").length) pb.push(id + " sans gardien réel");
    }
    if (pb.length) pb.forEach(fail); else ok("40 effectifs réels valides (postes, âges, notes ≤ 90, pot ≥ note)");
    // les vétérans de 36 ans et plus sont gardés (pas de plafond d'âge en 99/00) : ils jouent
    // leur saison réelle, puis vieillirClub() les fait raccrocher à la 1re intersaison.
    const vets = { MET: "S. Kastendeuch", PSG: "B. Lama", NCY: "T. Cascarino" };
    const absents = Object.entries(vets).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom));
    const bravo = (S.starsD2.NIC || []).some(t => t[0] === "D. Bravo");
    if (absents.length) fail("vétérans 36+ manquants : " + absents.map(([id, n]) => n + " (" + id + ")").join(", "));
    else if (!bravo) fail("vétéran 36+ manquant : D. Bravo (NIC)");
    else ok("vétérans de 36 ans et plus conservés : Kastendeuch, Lama, Cascarino, Bravo");
    const nD1 = S.d1.reduce((s, id) => s + S.starsD1[id].length, 0);
    const nD2 = S.d2.reduce((s, id) => s + S.starsD2[id].length, 0);
    if (nD1 !== 400) fail("D1 99/00 : " + nD1 + " joueurs curés (attendu 20 × 20)");
    if (nD2 !== 360) fail("D2 99/00 : " + nD2 + " joueurs curés (attendu 20 × 18)");
    if (nD1 === 400 && nD2 === 360) ok("760 joueurs réels relevés : 20 par club en D1, 18 en D2");
  }
} catch (e) { fail("exception registre : " + e.stack); }

/* ===== 2) Doublons de noms ===== */
console.log("2) Doublons de noms");
try {
  const compte = {};
  const ajoute = (nom, src) => { (compte[nom] = compte[nom] || []).push(src); };
  for (const id in api.STARS_9900) for (const t of api.STARS_9900[id]) ajoute(t[0], "D1:" + id);
  for (const id in api.STARS_D2_9900) for (const t of api.STARS_D2_9900[id]) ajoute(t[0], "D2:" + id);
  const dupClub = Object.entries(compte).filter(([n, s]) => s.length > 1);
  if (dupClub.length) dupClub.forEach(([n, s]) => fail("doublon 99/00 : « " + n + " » dans " + s.join(" + ")));
  else ok("aucun joueur dupliqué entre deux clubs en 99/00 (transferts d'hiver arbitrés au temps de jeu)");
  // les trois N'Diaye : trois joueurs réels distincts, désambiguïsés par le prénom complet
  const nd = Object.keys(compte).filter(n => /N'Diaye$/.test(n));
  if (nd.length < 3) fail("les trois N'Diaye de 99/00 ne sont pas tous présents : " + nd.join(", "));
  else ok("homonymes réels séparés par le prénom complet : " + nd.join(" / "));
  // piège « J. Arne Riise » : un prénom composé resté collé au patronyme.
  // Les particules (Le, De, Da, Di, Van, El, Ben…) font partie du patronyme et sont légitimes.
  const PARTICULES = new Set(["Le", "La", "Les", "De", "Del", "Della", "Da", "Das", "Dos", "Di", "Du",
    "Van", "Von", "Der", "Ten", "Ter", "El", "Al", "Ben", "Bin", "Mac", "Mc", "O", "Saint", "San", "Dos"]);
  const suspects = Object.keys(compte).filter(n => {
    const m = /^[A-ZÀ-Þ]\.(-[A-ZÀ-Þ]\.)? ([A-ZÀ-Þ][a-zà-ÿ']+) [A-ZÀ-Þ]/.exec(n);
    return m && !PARTICULES.has(m[2]);
  });
  if (suspects.length) fail("noms à vérifier (prénom composé avalé dans le patronyme ?) : " + suspects.join(", "));
  else ok("aucun prénom composé resté collé au patronyme (particules Le/De/Van/El… préservées)");
  // réconciliation France ↔ Europe (clubs européens figés en 95-96)
  const eur = new Set();
  for (const T of [api.STARS_EUROPE, api.STARS_EUROPE_C2, api.STARS_EUROPE_C3]) for (const id in T) for (const t of T[id]) eur.add(t[0]);
  const collE = Object.keys(compte).filter(n => eur.has(n));
  api.nouvellePartie("MON", KEY);
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
  if (coll.length) fail("vivier 99/00 contient des joueurs déjà employés : " + coll.join(", "));
  else ok("vivier construit disjoint des effectifs employés (99/00)");
} catch (e) { fail("exception doublons : " + e.stack); }

/* ===== 3) Année de base + Euro 2000 dès la 1re intersaison + sièges européens ===== */
console.log("3) Année de base, Euro 2000, sièges européens");
try {
  api.nouvellePartie("MON", KEY);
  let G = api.getG();
  if (G.saison !== KEY) fail("G.saison = " + G.saison + " (attendu " + KEY + ")");
  if (G.anBase !== 1999) fail("G.anBase = " + G.anBase + " (attendu 1999)");
  if (api.anneeJeu() !== 1999) fail("anneeJeu() = " + api.anneeJeu() + " (attendu 1999)");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G.vire = null;
  api.intersaison();
  G = api.getG();
  if (!/Euro : LA FRANCE RÉALISE LE DOUBLÉ/i.test((G.recap || []).join(" ")))
    fail("été 2000 : l'Euro 2000 doit tomber dès la 1re intersaison quand on part de 99/00");
  else ok("année de base 1999 ; Euro 2000 déclenché dès la 1re intersaison (été 2000)");
  if (G.saison === "2000-01") ok("chaîne de saison correcte : 1999-00 → 2000-01");
  else fail("chaîne de saison : G.saison = " + G.saison + " (attendu 2000-01)");
  const attendu = { BOR: "C1", OM: "C1", LYO: "C1", NAN: "C2", MON: "C3", LEN: "C3", MTP: "C3",
                    PSG: null, STE: null, SED: null, TRO: null, LOR: null, SOC: null };
  for (const id in attendu) {
    api.nouvellePartie(id, KEY);
    const c = api.getG().euroCompet;
    if (c !== attendu[id]) fail("siège européen " + id + " = " + c + " (attendu " + attendu[id] + ")");
  }
  ok("sièges européens : Bordeaux/OM/Lyon en C1, Nantes (Coupe 99) en C2, Monaco/Lens + Montpellier (Intertoto 99) en C3");
} catch (e) { fail("exception année/Europe : " + e.stack); }

/* ===== 4) Carrière multi-saisons depuis 99/00 ===== */
console.log("4) Carrière multi-saisons depuis 99/00 (calibrage, vieillissement)");
let totalButs = 0, totalMatchs = 0;
const departs = ["MON", "BOR", "LOR", "CRE"]; // champion, siège C1, repêché, nouveau venu
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
  } catch (e) { fail("exception carrière 99/00 (" + dep + ") : " + e.stack); }
}
const gpm = totalButs / totalMatchs;
console.log("— Calibrage 99/00 : " + gpm.toFixed(3) + " buts/match sur " + Math.round(totalMatchs) + " matchs —");
if (gpm < 2.0 || gpm > 2.8) fail("calibrage 99/00 hors plage (cible ~2,3) : " + gpm.toFixed(3));
else ok("calibrage 99/00 dans la plage attendue");

console.log(FAILS === 0 ? "\n✅ HARNAIS 99/00 : TOUT EST VERT" : "\n❌ HARNAIS 99/00 : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
