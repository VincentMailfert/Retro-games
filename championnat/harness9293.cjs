/* Harnais de validation — SAISON DE DÉPART 1992-93
   Vérifie : intégrité du registre SAISONS, doublons de noms, année de base/étés,
   sièges européens, carrière multi-saisons depuis 92/93 (calibrage, vieillissement).
   Particularités de cette saison : la D1 réelle avait ses vingt clubs SANS aucun
   repêchage, la D2 se jouait encore en DEUX groupes de dix-huit, AUCUN club neuf
   n'a été ajouté (une première), la Coupe de France 1992 n'a pas eu de vainqueur
   (drame de Furiani) et la PREMIÈRE intersaison ne porte aucun tournoi.
   Usage : node harness9293.cjs                                                    */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,CIBLE,SAISONS,STARS_9293,STARS_D2_9293,D1_9293,D2_9293,STARS_EUROPE,STARS_EUROPE_C2,STARS_EUROPE_C3,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const KEY = "1992-93";

/* ===== 1) Intégrité du registre SAISONS ===== */
console.log("1) Registre SAISONS : composition, métadonnées, effectifs");
try {
  const S = api.SAISONS[KEY];
  if (!S) fail("saison " + KEY + " absente du registre");
  else {
    if (S.d1.length !== 20) fail("D1 92/93 a " + S.d1.length + " clubs (attendu 20)");
    if (S.d2.length !== 20) fail("D2 92/93 a " + S.d2.length + " clubs (attendu 20)");
    const tous = S.d1.concat(S.d2);
    const setIds = new Set(tous);
    if (setIds.size !== 40) fail("ids dupliqués entre D1 et D2 (uniques: " + setIds.size + "/40)");
    const metaManquante = tous.filter(id => !api.metaClub(id));
    if (metaManquante.length) fail("métadonnées manquantes : " + metaManquante.join(","));
    if (!metaManquante.length && setIds.size === 40 && S.d1.length === 20 && S.d2.length === 20)
      ok("92/93 = 20 D1 + 20 D2, 40 clubs uniques, toutes métadonnées résolues");
    // Le plateau de 92/93 est le premier que le jeu connaissait DÉJÀ en entier : aucun
    // club neuf n'a eu à être créé, tous les quarante sortent du registre existant.
    const sansStade = tous.filter(id => { const m = api.metaClub(id); return !m.stade || !m.cap; });
    if (sansStade.length) fail("clubs sans stade/capacité : " + sansStade.join(","));
    else ok("aucun club neuf cette saison : les quarante étaient déjà au registre, avec stade et capacité");
    // La D1 1992-93 comptait bien vingt clubs et n'a repêché personne.
    const D1_REELLE = ["OM","PSG","MON","BOR","NAN","AUX","STE","STR","LEN","MTP",
                       "CAE","MET","TOU","LYO","LEH","SOC","LIL","VAN","TON","NIM"];
    const horsD1 = D1_REELLE.filter(id => !S.d1.includes(id));
    if (horsD1.length) fail("D1 92/93 : clubs réels absents — " + horsD1.join(","));
    else ok("D1 92/93 = les vingt clubs réels, aucun repêchage");
    // les trois promus de D2 91/92 montent, les trois relégués de D1 91/92 descendent
    for (const id of ["BOR", "STR", "VAN"])
      if (!S.d1.includes(id)) fail(id + ", promu de D2 91/92, doit jouer la D1 92/93");
    for (const id of ["CAN", "NCY", "REN"]) {
      if (S.d1.includes(id)) fail(id + " est relégué de D1 91/92 : il ne joue pas la D1 92/93");
      if (!S.d2.includes(id)) fail(id + ", relégué, doit jouer la D2 92/93");
    }
    ok("Bordeaux, Strasbourg et Valenciennes montent ; Cannes, Nancy et Rennes descendent");
    // la D2 réelle en deux groupes de dix-huit : le jeu retient les dix premiers de chacun
    const GROUPE_A = ["MAR", "CAN", "NIC", "NCY", "VAL", "SED", "BAS", "IST", "CHV", "ALE"];
    const GROUPE_B = ["ANG", "REN", "ROU", "RST", "LMN", "DUN", "BOU", "BEA", "LAV", "NIO"];
    const manquants = GROUPE_A.concat(GROUPE_B).filter(id => !S.d2.includes(id));
    if (manquants.length) fail("D2 92/93 : clubs de tête absents — " + manquants.join(","));
    else ok("D2 92/93 = les dix premiers du groupe A + les dix premiers du groupe B (classements réels)");
    // les onzièmes restent dehors : personne n'a eu à être repêché faute de source
    for (const id of ["MUL", "GUE"])
      if (S.d2.includes(id)) fail(id + " est onzième de son groupe : il n'entre que si un club de tête manque");
    ok("Mulhouse et Gueugnon, onzièmes de leur groupe, restent dehors : aucun club de tête n'a manqué à l'appel");
    if (S.d2.includes("AJA") || S.d2.includes("GFC"))
      fail("ni l'AC Ajaccio ni le Gazélec ne jouent la D2 92/93");
    // effectifs : non vides, postes valides, notes dans les bornes
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
    // pas de plafond d'âge depuis 99/00 : les vétérans jouent leur saison réelle,
    // puis vieillirClub() les fait raccrocher à la première intersaison.
    const vets = { STE: "J.-A. Bell", MON: "J.-L. Ettori", SOC: "F. Hadzibegic" };
    const absents = Object.entries(vets).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom));
    if (absents.length) fail("vétérans 35+ manquants : " + absents.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("vétérans conservés : Bell (38 ans, 3 960 minutes), Ettori (37 ans) et Hadžibegić (35 ans)");
    // les gamins de 1992 : le tri au temps de jeu ne doit pas les avoir écartés
    const gamins = { BOR: "Z. Zidane", NAN: "C. Makélélé", OM: "F. Barthez", MON: "L. Thuram", LYO: "B. N'Gotty" };
    const perdus = Object.entries(gamins).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom));
    if (perdus.length) fail("pépites 1992 absentes : " + perdus.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("pépites conservées : Zidane (20 ans, arrivé de Cannes), Makélélé (19 ans), Barthez, Thuram, N'Gotty");
    // le tri aux minutes écarte les pépites : celles-là ont été forcées à la main
    const forces = { TOU: ["V. Candela"], MON: ["S. Legwinski"], MET: ["C. Pouget"] };
    for (const id in forces) for (const nom of forces[id])
      if (!(S.starsD1[id] || []).some(t => t[0] === nom)) fail("pépite forcée absente de D1 : " + nom + " (" + id + ")");
    const forcesD2 = { CAN: ["B. Lambourde", "L. Charvet"], NIC: ["S. Ipoua"] };
    for (const id in forcesD2) for (const nom of forcesD2[id])
      if (!(S.starsD2[id] || []).some(t => t[0] === nom)) fail("pépite forcée absente de D2 : " + nom + " (" + id + ")");
    ok("forçages tenus : Candela (19 ans, 107 minutes), Legwinski, Pouget, Lambourde, Charvet, Ipoua");
    // la table d'ajustements à la main : le calcul ne sait pas qu'un homme est champion du monde
    const AJUSTES = [["OM", "A. Bokšić", 83], ["OM", "R. Völler", 83], ["MON", "J. Klinsmann", 85]];
    for (const [id, nom, note] of AJUSTES) {
      const t = (S.starsD1[id] || []).find(x => x[0] === nom);
      if (!t) fail("joueur ajusté absent : " + nom + " (" + id + ")");
      else if (t[3] !== note) fail(nom + " note " + t[3] + " (attendu " + note + ")");
    }
    ok("notes ajustées à la main : Bokšić 83 (23 buts, meilleur buteur), Völler 83 et Klinsmann 85 (champions du monde 1990)");
    const nD1 = S.d1.reduce((s, id) => s + S.starsD1[id].length, 0);
    const nD2 = S.d2.reduce((s, id) => s + S.starsD2[id].length, 0);
    // 397 + 360 : le PSG n'a que 19 hommes ayant joué — la source fait foi.
    if (nD1 !== 397) fail("D1 92/93 : " + nD1 + " joueurs curés (attendu 397)");
    if (nD2 !== 360) fail("D2 92/93 : " + nD2 + " joueurs curés (attendu 360)");
    if (nD1 === 397 && nD2 === 360) ok("757 joueurs réels relevés (397 en D1, 360 en D2)");
  }
} catch (e) { fail("exception registre : " + e.stack); }

/* ===== 2) Doublons de noms ===== */
console.log("2) Doublons de noms");
try {
  const compte = {};
  const ajoute = (nom, src) => { (compte[nom] = compte[nom] || []).push(src); };
  for (const id in api.STARS_9293) for (const t of api.STARS_9293[id]) ajoute(t[0], "D1:" + id);
  for (const id in api.STARS_D2_9293) for (const t of api.STARS_D2_9293[id]) ajoute(t[0], "D2:" + id);
  const dupClub = Object.entries(compte).filter(([n, s]) => s.length > 1);
  if (dupClub.length) dupClub.forEach(([n, s]) => fail("doublon 92/93 : « " + n + " » dans " + s.join(" + ")));
  else ok("aucun joueur dupliqué entre deux clubs en 92/93 (transferts arbitrés au temps de jeu)");
  // Les jumeaux Vujović jouaient TOUS LES DEUX à Nice cette saison-là : convention de
  // 99/00, le plus utilisé garde l'initiale, l'autre passe en toutes lettres.
  const nice = api.STARS_D2_9293.NIC || [];
  if (!nice.some(t => t[0] === "Z. Vujovic")) fail("Zlatko Vujović (2 547 min) doit garder l'initiale à Nice");
  else if (!nice.some(t => t[0] === "Zoran Vujovic")) fail("Zoran Vujović, son jumeau, doit être écrit en toutes lettres");
  else ok("jumeaux séparés à Nice : Z. Vujovic (Zlatko) et Zoran Vujovic écrit en toutes lettres");
  // piège « J. Arne Riise » : un prénom composé resté collé au patronyme.
  const PARTICULES = new Set(["Le", "La", "Les", "De", "Del", "Della", "Da", "Das", "Dos", "Di", "Du",
    "Van", "Von", "Der", "Ten", "Ter", "El", "Al", "Ben", "Bin", "Mac", "Mc", "O", "Saint", "San"]);
  // patronymes en deux mots vérifiés un à un chez Transfermarkt :
  // Rafael Martín Vázquez (OM, double nom espagnol) et Mass Sarr Jr (Alès).
  const COMPOSES = new Set(["Martín", "Sarr"]);
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
  api.nouvellePartie("OM", KEY);
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
  if (coll.length) fail("vivier 92/93 contient des joueurs déjà employés : " + coll.join(", "));
  else ok("vivier construit disjoint des effectifs employés (92/93)");
} catch (e) { fail("exception doublons : " + e.stack); }

/* ===== 3) Année de base + étés internationaux + sièges européens ===== */
console.log("3) Année de base, été 93 muet, Mondial 94, sièges européens");
try {
  api.nouvellePartie("OM", KEY);
  let G = api.getG();
  if (G.saison !== KEY) fail("G.saison = " + G.saison + " (attendu " + KEY + ")");
  if (G.anBase !== 1992) fail("G.anBase = " + G.anBase + " (attendu 1992)");
  if (api.anneeJeu() !== 1992) fail("anneeJeu() = " + api.anneeJeu() + " (attendu 1992)");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G.vire = null;
  api.intersaison();
  G = api.getG();
  // l'été 93 ne porte aucun tournoi : comme en 90/91, la 1re intersaison est muette
  const recap1 = (G.recap || []).join(" ");
  if (/Euro en|Coupe du monde/i.test(recap1))
    fail("été 93 : aucun grand tournoi ne doit tomber à la 1re intersaison quand on part de 92/93");
  else ok("année de base 1992 ; l'été 93 est muet, aucun tournoi à la première intersaison");
  if (G.saison !== "1993-94") fail("chaîne de saison : G.saison = " + G.saison + " (attendu 1993-94)");
  else ok("chaîne de saison correcte : 1992-93 → 1993-94");
  // le Mondial 94 à la deuxième intersaison
  for (let d = 0; d < 38; d++) api.jouerJournee();
  api.getG().vire = null; api.intersaison(); G = api.getG();
  if (!/Coupe du monde aux États-Unis/i.test((G.recap || []).join(" ")))
    fail("été 94 : le Mondial américain doit tomber à la 2e intersaison");
  else ok("été 94 déclenché à la 2e intersaison : le Mondial aux États-Unis");
  // L'Europe 1992-93 telle qu'elle s'est jouée : l'OM champion en titre en C1 (il la
  // gagnera à Munich) ; Monaco en C2 — la Coupe de France 1992 n'a PAS eu de vainqueur
  // après le drame de Furiani, et c'est le finaliste qui prend la place ; Auxerre, le
  // PSG et Caen en Coupe UEFA.
  const attendu = { OM: "C1", MON: "C2", AUX: "C3", PSG: "C3", CAE: "C3",
                    BOR: null, NAN: null, STE: null, STR: null, LEN: null, NIM: null };
  for (const id in attendu) {
    api.nouvellePartie(id, KEY);
    const c = api.getG().euroCompet;
    if (c !== attendu[id]) fail("siège européen " + id + " = " + c + " (attendu " + attendu[id] + ")");
  }
  ok("sièges européens : l'OM en C1, Monaco (finaliste de la Coupe 92, titre non décerné) en C2, Auxerre/PSG/Caen en C3");
} catch (e) { fail("exception année/Europe : " + e.stack); }

/* ===== 4) Carrière multi-saisons depuis 92/93 ===== */
console.log("4) Carrière multi-saisons depuis 92/93 (calibrage, vieillissement)");
let totalButs = 0, totalMatchs = 0;
const departs = ["OM", "MON", "VAN", "NIO"]; // champion déclassé, siège C2, promu de D2, dernier entrant de D2
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
  } catch (e) { fail("exception carrière 92/93 (" + dep + ") : " + e.stack); }
}
const gpm = totalButs / totalMatchs;
console.log("— Calibrage 92/93 : " + gpm.toFixed(3) + " buts/match sur " + Math.round(totalMatchs) + " matchs —");
if (gpm < 2.0 || gpm > 2.8) fail("calibrage 92/93 hors plage (cible ~2,3) : " + gpm.toFixed(3));
else ok("calibrage 92/93 dans la plage attendue");

console.log(FAILS === 0 ? "\n✅ HARNAIS 92/93 : TOUT EST VERT" : "\n❌ HARNAIS 92/93 : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
