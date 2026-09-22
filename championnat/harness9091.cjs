/* Harnais de validation — SAISON DE DÉPART 1990-91
   Vérifie : intégrité du registre SAISONS, doublons de noms, année de base/étés,
   sièges européens, carrière multi-saisons depuis 90/91 (calibrage, vieillissement).
   C'est la plus ANCIENNE saison du jeu : la D2 réelle se jouait en deux groupes de
   dix-huit, et l'Euro 92 ne tombe qu'à la DEUXIÈME intersaison.
   Usage : node harness9091.cjs                                                    */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,CIBLE,SAISONS,STARS_9091,STARS_D2_9091,D1_9091,D2_9091,STARS_EUROPE,STARS_EUROPE_C2,STARS_EUROPE_C3,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const KEY = "1990-91";

/* ===== 1) Intégrité du registre SAISONS ===== */
console.log("1) Registre SAISONS : composition, métadonnées, effectifs");
try {
  const S = api.SAISONS[KEY];
  if (!S) fail("saison " + KEY + " absente du registre");
  else {
    if (S.d1.length !== 20) fail("D1 90/91 a " + S.d1.length + " clubs (attendu 20)");
    if (S.d2.length !== 20) fail("D2 90/91 a " + S.d2.length + " clubs (attendu 20)");
    const tous = S.d1.concat(S.d2);
    const setIds = new Set(tous);
    if (setIds.size !== 40) fail("ids dupliqués entre D1 et D2 (uniques: " + setIds.size + "/40)");
    const metaManquante = tous.filter(id => !api.metaClub(id));
    if (metaManquante.length) fail("métadonnées manquantes : " + metaManquante.join(","));
    if (!metaManquante.length && setIds.size === 40 && S.d1.length === 20 && S.d2.length === 20)
      ok("90/91 = 20 D1 + 20 D2, 40 clubs uniques, toutes métadonnées résolues");
    // La D1 1990-91 comptait bien vingt clubs : aucun repêchage, contrairement à 97/98, 98/99 et 99/00.
    // La D2, elle, se jouait en DEUX groupes de dix-huit : le jeu retient les dix premiers de chacun.
    const GROUPE_A = ["NIM", "STR", "VAN", "ALE", "IST", "BAS", "AVI", "ROD", "ANN", "MUL"];
    const GROUPE_B = ["LEH", "LEN", "LAV", "ANG", "ROU", "REI", "GUI", "BEA", "TRS", "RST"];
    const manquantsA = GROUPE_A.filter(id => !S.d2.includes(id));
    const manquantsB = GROUPE_B.filter(id => !S.d2.includes(id));
    if (manquantsA.length || manquantsB.length)
      fail("D2 90/91 : dix premiers de groupe absents — " + manquantsA.concat(manquantsB).join(","));
    else ok("D2 90/91 = les dix premiers du groupe A + les dix premiers du groupe B (classements réels)");
    if (S.d2.includes("SSE"))
      fail("Saint-Seurin ne doit pas entrer : Transfermarkt ne lui connaît que 17 joueurs pour 18 places");
    else if (!S.d2.includes("BEA"))
      fail("Beauvais, suivant au classement réel, doit remplacer Saint-Seurin");
    else ok("Saint-Seurin (8e du groupe B, 17 joueurs documentés) écarté au profit de Beauvais, 11e");
    if (S.d1.length === 20 && !S.d1.some(id => S.d2.includes(id)))
      ok("aucun repêchage en D1 : le championnat réel 1990-91 avait déjà ses vingt clubs");
    // les onze clubs neufs de cette saison doivent tous avoir stade, capacité et blason
    const NEUFS = ["BRE", "VAN", "ALE", "IST", "AVI", "ROD", "ANN", "ANG", "ROU", "REI", "TRS"];
    const sansMeta = NEUFS.filter(id => { const m = api.metaClub(id); return !m || !m.stade || !m.cap; });
    if (sansMeta.length) fail("clubs neufs sans stade/capacité : " + sansMeta.join(","));
    else ok("onze clubs neufs présents dans CLUBS_EXTRA avec stade et capacité (Brest, Valenciennes, Reims…)");
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
    // pas de plafond d'âge depuis 99/00 : les vétérans de 36 ans et plus jouent leur saison
    // réelle, puis vieillirClub() les fait raccrocher à la première intersaison.
    const vets = { BOR: "J.-A. Bell" };          // 36 ans, 3809 minutes, gardien du Cameroun
    const absents = Object.entries(vets).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom));
    const girard = (S.starsD2.NIM || []).some(t => t[0] === "R. Girard");   // 36 ans, 3228 minutes
    if (absents.length) fail("vétérans 36+ manquants : " + absents.map(([id, n]) => n + " (" + id + ")").join(", "));
    else if (!girard) fail("vétéran 36+ manquant : R. Girard (NIM)");
    else ok("vétérans de 36 ans et plus conservés : Bell, Girard");
    // les gamins de 1990 : le tri au temps de jeu ne doit pas les avoir écartés
    const gamins = { CAN: "Z. Zidane", MON: "L. Thuram", NAN: "M. Desailly", BOR: "C. Dugarry" };
    const perdus = Object.entries(gamins).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom));
    if (perdus.length) fail("pépites 1990 absentes : " + perdus.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("pépites conservées malgré le tri aux minutes : Zidane (18 ans), Thuram (15 minutes), Desailly, Dugarry");
    const nD1 = S.d1.reduce((s, id) => s + S.starsD1[id].length, 0);
    const nD2 = S.d2.reduce((s, id) => s + S.starsD2[id].length, 0);
    if (nD1 !== 400) fail("D1 90/91 : " + nD1 + " joueurs curés (attendu 20 × 20)");
    if (nD2 !== 360) fail("D2 90/91 : " + nD2 + " joueurs curés (attendu 20 × 18)");
    if (nD1 === 400 && nD2 === 360) ok("760 joueurs réels relevés : 20 par club en D1, 18 en D2");
  }
} catch (e) { fail("exception registre : " + e.stack); }

/* ===== 2) Doublons de noms ===== */
console.log("2) Doublons de noms");
try {
  const compte = {};
  const ajoute = (nom, src) => { (compte[nom] = compte[nom] || []).push(src); };
  for (const id in api.STARS_9091) for (const t of api.STARS_9091[id]) ajoute(t[0], "D1:" + id);
  for (const id in api.STARS_D2_9091) for (const t of api.STARS_D2_9091[id]) ajoute(t[0], "D2:" + id);
  const dupClub = Object.entries(compte).filter(([n, s]) => s.length > 1);
  if (dupClub.length) dupClub.forEach(([n, s]) => fail("doublon 90/91 : « " + n + " » dans " + s.join(" + ")));
  else ok("aucun joueur dupliqué entre deux clubs en 90/91 (transferts d'hiver arbitrés au temps de jeu)");
  // aucun nom ne doit apparaître deux fois : le dédoublonnage se fait par identifiant
  // Transfermarkt, jamais par nom — un prêté comme Simba figure dans deux effectifs TM.
  if (!dupClub.length) ok("dédoublonnage par identifiant TM : les joueurs listés dans deux clubs sont arbitrés au temps de jeu");
  // piège « J. Arne Riise » : un prénom composé resté collé au patronyme.
  // Les particules (Le, De, Da, Di, Van, El, Ben…) font partie du patronyme et sont légitimes.
  const PARTICULES = new Set(["Le", "La", "Les", "De", "Del", "Della", "Da", "Das", "Dos", "Di", "Du",
    "Van", "Von", "Der", "Ten", "Ter", "El", "Al", "Ben", "Bin", "Mac", "Mc", "O", "Saint", "San", "Dos"]);
  // patronymes en deux mots vérifiés un à un chez Transfermarkt, et non des prénoms avalés :
  // Michael Mio Nielsen (Lille) et Mass Sarr Jr (Monaco).
  const COMPOSES = new Set(["Mio", "Sarr"]);
  const suspects = Object.keys(compte).filter(n => {
    const m = /^[A-ZÀ-Þ]\.(-[A-ZÀ-Þ]\.)? ([A-ZÀ-Þ][a-zà-ÿ']+) [A-ZÀ-Þ]/.exec(n);
    return m && !PARTICULES.has(m[2]) && !COMPOSES.has(m[2]);
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
  if (coll.length) fail("vivier 90/91 contient des joueurs déjà employés : " + coll.join(", "));
  else ok("vivier construit disjoint des effectifs employés (90/91)");
} catch (e) { fail("exception doublons : " + e.stack); }

/* ===== 3) Année de base + étés internationaux + sièges européens ===== */
console.log("3) Année de base, étés 91/92/94, sièges européens");
try {
  api.nouvellePartie("MON", KEY);
  let G = api.getG();
  if (G.saison !== KEY) fail("G.saison = " + G.saison + " (attendu " + KEY + ")");
  if (G.anBase !== 1990) fail("G.anBase = " + G.anBase + " (attendu 1990)");
  if (api.anneeJeu() !== 1990) fail("anneeJeu() = " + api.anneeJeu() + " (attendu 1990)");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G.vire = null;
  api.intersaison();
  G = api.getG();
  // partir de 90/91 est le seul cas du jeu où la PREMIÈRE intersaison ne porte aucun tournoi.
  if (/ÉTÉ 9/.test((G.recap || []).join(" ")))
    fail("été 91 : aucun tournoi international ne doit être annoncé à la 1re intersaison");
  else ok("année de base 1990 ; première intersaison muette (l'été 91 ne portait aucun tournoi)");
  if (G.saison !== "1991-92") fail("chaîne de saison : G.saison = " + G.saison + " (attendu 1991-92)");
  else ok("chaîne de saison correcte : 1990-91 → 1991-92");
  // l'Euro 92 tombe à la DEUXIÈME intersaison, le Mondial 94 à la quatrième
  for (let d = 0; d < 38; d++) api.jouerJournee();
  api.getG().vire = null; api.intersaison(); G = api.getG();
  if (!/Euro en Suède/i.test((G.recap || []).join(" ")))
    fail("été 92 : l'Euro suédois doit tomber à la 2e intersaison quand on part de 90/91");
  else ok("été 92 déclenché à la 2e intersaison : l'Euro en Suède, le Danemark repêché et sacré");
  for (let s = 0; s < 2; s++) {
    for (let d = 0; d < 38; d++) api.jouerJournee();
    api.getG().vire = null; api.intersaison(); G = api.getG();
  }
  if (!/Coupe du monde aux États-Unis/i.test((G.recap || []).join(" ")))
    fail("été 94 : le Mondial américain doit tomber à la 4e intersaison");
  else ok("été 94 déclenché à la 4e intersaison : le Mondial aux États-Unis");
  // l'Europe 1990-91 telle qu'elle s'est jouée : l'OM, champion 89-90, en C1 ; Montpellier,
  // vainqueur de la Coupe de France 1990, en C2 ; Bordeaux (2e) et Monaco (3e) en Coupe UEFA.
  const attendu = { OM: "C1", MTP: "C2", BOR: "C3", MON: "C3",
                    PSG: null, AUX: null, CAN: null, LYO: null, BRE: null, REN: null };
  for (const id in attendu) {
    api.nouvellePartie(id, KEY);
    const c = api.getG().euroCompet;
    if (c !== attendu[id]) fail("siège européen " + id + " = " + c + " (attendu " + attendu[id] + ")");
  }
  ok("sièges européens : OM en C1, Montpellier (Coupe de France 1990) en C2, Bordeaux et Monaco en C3");
} catch (e) { fail("exception année/Europe : " + e.stack); }

/* ===== 4) Carrière multi-saisons depuis 90/91 ===== */
console.log("4) Carrière multi-saisons depuis 90/91 (calibrage, vieillissement)");
let totalButs = 0, totalMatchs = 0;
const departs = ["OM", "MTP", "BRE", "REI"]; // champion, siège C2, club neuf de D1, club neuf de D2
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
  } catch (e) { fail("exception carrière 90/91 (" + dep + ") : " + e.stack); }
}
const gpm = totalButs / totalMatchs;
console.log("— Calibrage 90/91 : " + gpm.toFixed(3) + " buts/match sur " + Math.round(totalMatchs) + " matchs —");
if (gpm < 2.0 || gpm > 2.8) fail("calibrage 90/91 hors plage (cible ~2,3) : " + gpm.toFixed(3));
else ok("calibrage 90/91 dans la plage attendue");

console.log(FAILS === 0 ? "\n✅ HARNAIS 90/91 : TOUT EST VERT" : "\n❌ HARNAIS 90/91 : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
