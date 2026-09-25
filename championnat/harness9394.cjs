/* Harnais de validation — SAISON DE DÉPART 1993-94
   Vérifie : intégrité du registre SAISONS, doublons de noms, année de base/étés,
   sièges européens, carrière multi-saisons depuis 93/94 (calibrage, vieillissement).
   Particularités de cette saison : la D1 réelle avait ses vingt clubs SANS aucun
   repêchage, la D2 passe pour la première fois en GROUPE UNIQUE de vingt-deux clubs
   (les deux derniers sont écartés), aucun club neuf n'a été ajouté, l'OM est exclu
   de la Coupe d'Europe par l'affaire VA-OM — le PSG, deuxième, refuse la place et
   c'est Monaco qui la prend — et le Mondial 94 tombe dès la PREMIÈRE intersaison,
   sans les Bleus, battus par la Bulgarie le 17 novembre.
   Usage : node harness9394.cjs                                                    */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,CIBLE,SAISONS,STARS_9394,STARS_D2_9394,D1_9394,D2_9394,STARS_EUROPE,STARS_EUROPE_C2,STARS_EUROPE_C3,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const KEY = "1993-94";

/* ===== 1) Intégrité du registre SAISONS ===== */
console.log("1) Registre SAISONS : composition, métadonnées, effectifs");
try {
  const S = api.SAISONS[KEY];
  if (!S) fail("saison " + KEY + " absente du registre");
  else {
    if (S.d1.length !== 20) fail("D1 93/94 a " + S.d1.length + " clubs (attendu 20)");
    if (S.d2.length !== 20) fail("D2 93/94 a " + S.d2.length + " clubs (attendu 20)");
    const tous = S.d1.concat(S.d2);
    const setIds = new Set(tous);
    if (setIds.size !== 40) fail("ids dupliqués entre D1 et D2 (uniques: " + setIds.size + "/40)");
    const metaManquante = tous.filter(id => !api.metaClub(id));
    if (metaManquante.length) fail("métadonnées manquantes : " + metaManquante.join(","));
    if (!metaManquante.length && setIds.size === 40 && S.d1.length === 20 && S.d2.length === 20)
      ok("93/94 = 20 D1 + 20 D2, 40 clubs uniques, toutes métadonnées résolues");
    // deuxième plateau d'affilée que le jeu connaissait déjà en entier : aucun club à créer.
    const sansStade = tous.filter(id => { const m = api.metaClub(id); return !m.stade || !m.cap; });
    if (sansStade.length) fail("clubs sans stade/capacité : " + sansStade.join(","));
    else ok("aucun club neuf cette saison : les quarante étaient déjà au registre, avec stade et capacité");
    // La D1 1993-94 comptait bien vingt clubs et n'a repêché personne.
    const D1_REELLE = ["PSG","OM","AUX","BOR","NAN","CAN","MTP","LYO","MON","LEN",
                       "STE","MET","STR","SOC","LIL","CAE","LEH","MAR","TOU","ANG"];
    const horsD1 = D1_REELLE.filter(id => !S.d1.includes(id));
    if (horsD1.length) fail("D1 93/94 : clubs réels absents — " + horsD1.join(","));
    else ok("D1 93/94 = les vingt clubs réels, aucun repêchage");
    // les trois promus de D2 92/93 montent, les trois relégués de D1 92/93 descendent
    for (const id of ["CAN", "MAR", "ANG"])
      if (!S.d1.includes(id)) fail(id + ", promu de D2 92/93, doit jouer la D1 93/94");
    for (const id of ["VAN", "NIM"]) {
      if (S.d1.includes(id)) fail(id + " est relégué de D1 92/93 : il ne joue pas la D1 93/94");
      if (!S.d2.includes(id)) fail(id + ", relégué, doit jouer la D2 93/94");
    }
    if (S.d1.includes("TON") || S.d2.includes("TON"))
      fail("Toulon, relégué de D1 92/93, jouait le National en 93/94 : il n'est pas au plateau");
    ok("Cannes, Martigues et Angers montent ; Valenciennes et Nîmes descendent, Toulon quitte le plateau");
    // la D2 réelle passe en GROUPE UNIQUE de vingt-deux clubs : le jeu retient les vingt premiers
    const D2_REELLE = ["NIC","REN","BAS","NIM","RST","BRI","LAV","DUN","CHV","ALE",
                       "SED","NCY","GUE","MUL","VAL","BEA","LMN","NIO","ROU","VAN"];
    const manquants = D2_REELLE.filter(id => !S.d2.includes(id));
    if (manquants.length) fail("D2 93/94 : clubs de tête absents — " + manquants.join(","));
    else ok("D2 93/94 = les vingt premiers du groupe unique de vingt-deux (classement réel)");
    // les deux derniers du classement réel restent dehors
    for (const id of ["BOU", "IST"])
      if (S.d2.includes(id)) fail(id + " finit 21e ou 22e de la D2 réelle : il n'entre pas dans les vingt");
    ok("Bourges (21e) et Istres (22e) écartés pour tenir les vingt places du moteur");
    // effectifs : non vides, postes valides, notes dans les bornes
    let pb = [];
    for (const id of tous) {
      const L = (S.d1.includes(id) ? S.starsD1 : S.starsD2)[id];
      if (!L || !L.length) { pb.push(id + " vide"); continue; }
      if (L.length < 14) pb.push(id + " maigre (" + L.length + ")");
      for (const t of L) {
        if (!["G", "D", "M", "A"].includes(t[1])) pb.push(id + " poste invalide " + t[0]);
        // Joseph-Antoine Bell tient les buts de Saint-Étienne à trente-neuf ans : la borne haute
        // de cette saison est la sienne, et il raccroche à la première intersaison.
        if (!(t[2] >= 15 && t[2] <= 39)) pb.push(id + " âge hors bornes " + t[0] + " " + t[2]);
        if (!(t[3] >= 55 && t[3] <= 90)) pb.push(id + " note hors bornes " + t[0] + " " + t[3]);
        if (!(t[4] >= t[3] && t[4] <= 97)) pb.push(id + " pot incohérent " + t[0]);
      }
      if (!L.filter(t => t[1] === "G").length) pb.push(id + " sans gardien réel");
    }
    if (pb.length) pb.forEach(fail); else ok("40 effectifs réels valides (postes, âges, notes ≤ 90, pot ≥ note)");
    // pas de plafond d'âge depuis 99/00 : les vétérans jouent leur saison réelle.
    const vets = { STE: "J.-A. Bell", MON: "J.-L. Ettori", SOC: "F. Hadzibegic", BOR: "D. Sénac" };
    const absents = Object.entries(vets).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom));
    if (absents.length) fail("vétérans 35+ manquants : " + absents.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("vétérans conservés : Bell (39 ans, 2 460 minutes), Ettori (38 ans, 4 530), Hadžibegić et Sénac");
    // les gamins de 1993 : le tri au temps de jeu ne doit pas les avoir écartés
    const gamins = { BOR: "Z. Zidane", NAN: "C. Makélélé", MON: "L. Thuram", MET: "R. Pirès", CAN: "J. Micoud" };
    const perdus = Object.entries(gamins).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom));
    if (perdus.length) fail("pépites 1993 absentes : " + perdus.map(([id, n]) => n + " (" + id + ")").join(", "));
    if (!(S.starsD2.REN || []).some(t => t[0] === "S. Wiltord")) fail("Sylvain Wiltord, 19 ans, doit jouer la D2 à Rennes");
    if (!perdus.length) ok("pépites conservées : Zidane (meilleur espoir 1994), Makélélé, Thuram, Pirès, Micoud, Wiltord");
    // le tri aux minutes écarte les pépites : celles-là ont été forcées à la main
    const forces = { CAN: ["P. Vieira"], STE: ["G. Coupet"], LEH: ["V. Dhorasoo"], TOU: ["L. Batlles"],
                     AUX: ["T. West"], CAE: ["D. Sommeil"] };
    for (const id in forces) for (const nom of forces[id])
      if (!(S.starsD1[id] || []).some(t => t[0] === nom)) fail("pépite forcée absente de D1 : " + nom + " (" + id + ")");
    const forcesD2 = { NIO: ["O. Tébily"], NCY: ["V. Hognon"] };
    for (const id in forcesD2) for (const nom of forcesD2[id])
      if (!(S.starsD2[id] || []).some(t => t[0] === nom)) fail("pépite forcée absente de D2 : " + nom + " (" + id + ")");
    ok("forçages tenus : Vieira (17 ans, 562 minutes), Coupet, Dhorasoo, Batlles, West, Sommeil, Tébily, Hognon");
    // la table d'ajustements à la main : le calcul ne sait pas qui finit meilleur buteur
    const AJUSTES = [["PSG", "D. Ginola", 84], ["MON", "Y. Djorkaeff", 83], ["LEN", "R. Boli", 79],
                     ["NAN", "N. Ouédec", 78], ["OM", "M. Desailly", 82], ["OM", "S. Anderson", 81]];
    for (const [id, nom, note] of AJUSTES) {
      const t = (S.starsD1[id] || []).find(x => x[0] === nom);
      if (!t) fail("joueur ajusté absent : " + nom + " (" + id + ")");
      else if (t[3] !== note) fail(nom + " note " + t[3] + " (attendu " + note + ")");
    }
    ok("notes ajustées à la main : Ginola 84 (meilleur joueur de l'année), Djorkaeff/Boli/Ouédec vingt buts chacun");
    // Bokšić est parti à la Lazio fin novembre : ses douze matchs marseillais comptent quand même,
    // et sa note est sa valeur, pas son temps de jeu (jurisprudence Stojković 90/91).
    const bok = (S.starsD1.OM || []).find(t => t[0] === "A. Bokšić");
    if (!bok) fail("Bokšić, parti à la Lazio fin novembre, a joué douze matchs à l'OM : il reste au plateau");
    else if (bok[3] < 80) fail("Bokšić note " + bok[3] + " : sa valeur ne suit pas son temps de jeu");
    else ok("Bokšić conservé à l'OM (1 078 minutes avant la Lazio), noté à sa valeur");
    const nD1 = S.d1.reduce((s, id) => s + S.starsD1[id].length, 0);
    const nD2 = S.d2.reduce((s, id) => s + S.starsD2[id].length, 0);
    // 400 + 359 : le Red Star n'a que 17 hommes ayant joué — la source fait foi.
    if (nD1 !== 400) fail("D1 93/94 : " + nD1 + " joueurs curés (attendu 400)");
    if (nD2 !== 359) fail("D2 93/94 : " + nD2 + " joueurs curés (attendu 359)");
    if (nD1 === 400 && nD2 === 359) ok("759 joueurs réels relevés (400 en D1, 359 en D2)");
  }
} catch (e) { fail("exception registre : " + e.stack); }

/* ===== 2) Doublons de noms ===== */
console.log("2) Doublons de noms");
try {
  const compte = {};
  const ajoute = (nom, src) => { (compte[nom] = compte[nom] || []).push(src); };
  for (const id in api.STARS_9394) for (const t of api.STARS_9394[id]) ajoute(t[0], "D1:" + id);
  for (const id in api.STARS_D2_9394) for (const t of api.STARS_D2_9394[id]) ajoute(t[0], "D2:" + id);
  const dupClub = Object.entries(compte).filter(([n, s]) => s.length > 1);
  if (dupClub.length) dupClub.forEach(([n, s]) => fail("doublon 93/94 : « " + n + " » dans " + s.join(" + ")));
  else ok("aucun joueur dupliqué entre deux clubs en 93/94 (transferts arbitrés au temps de jeu)");
  // Deux Martins sans lien, à Nantes et à Nancy : convention de 99/00, le plus utilisé
  // garde l'initiale, l'autre passe en toutes lettres.
  if (!(api.STARS_D2_9394.NCY || []).some(t => t[0] === "A. Martins"))
    fail("Afonso Martins (2 009 min à Nancy) doit garder l'initiale");
  else if (!(api.STARS_9394.NAN || []).some(t => t[0] === "Anthony Martins"))
    fail("Anthony Martins, homonyme nantais, doit être écrit en toutes lettres");
  else ok("homonymes séparés : A. Martins (Afonso, Nancy) et Anthony Martins (Nantes) en toutes lettres");
  // piège « J. Arne Riise » : un prénom composé resté collé au patronyme.
  const PARTICULES = new Set(["Le", "La", "Les", "De", "Del", "Della", "Da", "Das", "Dos", "Di", "Du",
    "Van", "Von", "Der", "Ten", "Ter", "El", "Al", "Ben", "Bin", "Mac", "Mc", "O", "Saint", "San"]);
  // patronyme en deux mots vérifié chez Transfermarkt : Mass Sarr Jr (Alès), déjà connu de 92/93.
  const COMPOSES = new Set(["Sarr"]);
  const suspects = Object.keys(compte).filter(n => {
    const m = /^[A-ZÀ-Þ]\.(-[A-ZÀ-Þ]\.)? ([A-ZÀ-Þ][a-zà-ÿ']+) [A-ZÀ-Þ]/.exec(n);
    return m && !PARTICULES.has(m[2]) && !COMPOSES.has(m[2]);
  });
  if (suspects.length) fail("noms à vérifier (prénom composé avalé dans le patronyme ?) : " + suspects.join(", "));
  else ok("aucun prénom composé resté collé au patronyme (particules Le/De/Van/El… préservées)");
  // les mononymes de la source restent tels quels (Valdo, Raí, Futre, Oliveira)
  for (const [id, nom] of [["PSG", "Raí"], ["OM", "Futre"], ["LEN", "Oliveira"], ["PSG", "Valdo"]])
    if (!(api.STARS_9394[id] || []).some(t => t[0] === nom)) fail("mononyme attendu absent : " + nom + " (" + id + ")");
  ok("mononymes conservés sans initiale : Raí et Valdo au PSG, Futre à l'OM, Oliveira à Lens");
  // réconciliation France ↔ Europe (clubs européens figés en 95-96)
  const eur = new Set();
  for (const T of [api.STARS_EUROPE, api.STARS_EUROPE_C2, api.STARS_EUROPE_C3]) for (const id in T) for (const t of T[id]) eur.add(t[0]);
  const collE = Object.keys(compte).filter(n => eur.has(n));
  api.nouvellePartie("PSG", KEY);
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
  if (coll.length) fail("vivier 93/94 contient des joueurs déjà employés : " + coll.join(", "));
  else ok("vivier construit disjoint des effectifs employés (93/94)");
} catch (e) { fail("exception doublons : " + e.stack); }

/* ===== 3) Année de base + étés internationaux + sièges européens ===== */
console.log("3) Année de base, Mondial 94 dès la 1re intersaison, sièges européens");
try {
  api.nouvellePartie("PSG", KEY);
  let G = api.getG();
  if (G.saison !== KEY) fail("G.saison = " + G.saison + " (attendu " + KEY + ")");
  if (G.anBase !== 1993) fail("G.anBase = " + G.anBase + " (attendu 1993)");
  if (api.anneeJeu() !== 1993) fail("anneeJeu() = " + api.anneeJeu() + " (attendu 1993)");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G.vire = null;
  api.intersaison();
  G = api.getG();
  // partir de 93/94 fait tomber le Mondial américain dès la PREMIÈRE intersaison
  const recap1 = (G.recap || []).join(" ");
  if (!/Coupe du monde aux États-Unis/i.test(recap1))
    fail("été 94 : le Mondial américain doit tomber dès la 1re intersaison quand on part de 93/94");
  else ok("année de base 1993 ; le Mondial aux États-Unis tombe dès la première intersaison");
  // et les Bleus n'y étaient pas : la dépêche ne doit pas se lire comme un triomphe français
  if (/LA FRANCE/.test(recap1))
    fail("été 94 : la France n'était pas au Mondial, la dépêche ne doit pas la mettre en capitales");
  else ok("l'été 94 ne fête aucun triomphe français : les Bleus regardaient à la télévision");
  if (G.saison !== "1994-95") fail("chaîne de saison : G.saison = " + G.saison + " (attendu 1994-95)");
  else ok("chaîne de saison correcte : 1993-94 → 1994-95");
  // l'Euro 96 à la troisième intersaison
  for (let s = 0; s < 2; s++) {
    for (let d = 0; d < 38; d++) api.jouerJournee();
    api.getG().vire = null; api.intersaison();
  }
  G = api.getG();
  if (!/Euro en Angleterre/i.test((G.recap || []).join(" ")))
    fail("été 96 : l'Euro anglais doit tomber à la 3e intersaison");
  else ok("été 96 déclenché à la 3e intersaison : l'Euro en Angleterre");
  // L'Europe 1993-94 telle qu'elle s'est jouée : l'OM, tenant du titre, est EXCLU par
  // l'UEFA (affaire VA-OM) ; le PSG, deuxième, refuse la place et joue la C2 qu'il a
  // gagnée sur le terrain (Coupe de France 1993) ; Monaco, troisième, prend la C1 ;
  // Bordeaux, Auxerre et Nantes jouent la Coupe UEFA.
  const attendu = { MON: "C1", PSG: "C2", BOR: "C3", AUX: "C3", NAN: "C3",
                    OM: null, CAN: null, MTP: null, LYO: null, LEN: null, STE: null };
  for (const id in attendu) {
    api.nouvellePartie(id, KEY);
    const c = api.getG().euroCompet;
    if (c !== attendu[id]) fail("siège européen " + id + " = " + c + " (attendu " + attendu[id] + ")");
  }
  ok("sièges européens : Monaco en C1 à la place de l'OM exclu, le PSG en C2, Bordeaux/Auxerre/Nantes en C3");
} catch (e) { fail("exception année/Europe : " + e.stack); }

/* ===== 4) Carrière multi-saisons depuis 93/94 ===== */
console.log("4) Carrière multi-saisons depuis 93/94 (calibrage, vieillissement)");
let totalButs = 0, totalMatchs = 0;
const departs = ["PSG", "OM", "MAR", "VAN"]; // champion, exclu d'Europe, promu de D2, dernier entrant de D2
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
  } catch (e) { fail("exception carrière 93/94 (" + dep + ") : " + e.stack); }
}
const gpm = totalButs / totalMatchs;
console.log("— Calibrage 93/94 : " + gpm.toFixed(3) + " buts/match sur " + Math.round(totalMatchs) + " matchs —");
if (gpm < 2.0 || gpm > 2.8) fail("calibrage 93/94 hors plage (cible ~2,3) : " + gpm.toFixed(3));
else ok("calibrage 93/94 dans la plage attendue");

console.log(FAILS === 0 ? "\n✅ HARNAIS 93/94 : TOUT EST VERT" : "\n❌ HARNAIS 93/94 : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
