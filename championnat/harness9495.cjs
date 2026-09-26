/* Harnais de validation — SAISON DE DÉPART 1994-95
   Vérifie : intégrité du registre SAISONS, doublons de noms, année de base/étés,
   sièges européens, carrière multi-saisons depuis 94/95 (calibrage, vieillissement).
   Particularités de cette saison : la D1 réelle avait ses vingt clubs SANS aucun
   repêchage, la D2 est un groupe unique de vingt-deux clubs dont on retient les vingt
   premiers, aucun club neuf n'a été ajouté, l'Olympique de Marseille joue la Coupe UEFA
   DEPUIS LA DEUXIÈME DIVISION (il y est allé jusqu'aux huitièmes), et partir de 94/95 ne
   pose aucun tournoi à la première intersaison — l'été 95 est muet, l'Euro 96 tombe à la
   deuxième.
   Usage : node harness9495.cjs                                                    */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,CIBLE,SAISONS,STARS_9495,STARS_D2_9495,D1_9495,D2_9495,STARS_EUROPE,STARS_EUROPE_C2,STARS_EUROPE_C3,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const KEY = "1994-95";

/* ===== 1) Intégrité du registre SAISONS ===== */
console.log("1) Registre SAISONS : composition, métadonnées, effectifs");
try {
  const S = api.SAISONS[KEY];
  if (!S) fail("saison " + KEY + " absente du registre");
  else {
    if (S.d1.length !== 20) fail("D1 94/95 a " + S.d1.length + " clubs (attendu 20)");
    if (S.d2.length !== 20) fail("D2 94/95 a " + S.d2.length + " clubs (attendu 20)");
    const tous = S.d1.concat(S.d2);
    const setIds = new Set(tous);
    if (setIds.size !== 40) fail("ids dupliqués entre D1 et D2 (uniques: " + setIds.size + "/40)");
    const metaManquante = tous.filter(id => !api.metaClub(id));
    if (metaManquante.length) fail("métadonnées manquantes : " + metaManquante.join(","));
    if (!metaManquante.length && setIds.size === 40 && S.d1.length === 20 && S.d2.length === 20)
      ok("94/95 = 20 D1 + 20 D2, 40 clubs uniques, toutes métadonnées résolues");
    // troisième plateau d'affilée que le jeu connaissait déjà en entier : aucun club à créer.
    const sansStade = tous.filter(id => { const m = api.metaClub(id); return !m.stade || !m.cap; });
    if (sansStade.length) fail("clubs sans stade/capacité : " + sansStade.join(","));
    else ok("aucun club neuf cette saison : les quarante étaient déjà au registre, avec stade et capacité");
    // La D1 1994-95 comptait bien vingt clubs et n'a repêché personne.
    const D1_REELLE = ["NAN","LYO","PSG","AUX","LEN","MON","BOR","MET","CAN","STR",
                       "MAR","LEH","REN","LIL","BAS","NIC","MTP","STE","CAE","SOC"];
    const horsD1 = D1_REELLE.filter(id => !S.d1.includes(id));
    if (horsD1.length) fail("D1 94/95 : clubs réels absents — " + horsD1.join(","));
    else ok("D1 94/95 = les vingt clubs réels, aucun repêchage");
    // les trois promus de D2 93/94 montent, les trois partants de D1 93/94 s'en vont
    for (const id of ["NIC", "REN", "BAS"])
      if (!S.d1.includes(id)) fail(id + ", promu de D2 93/94, doit jouer la D1 94/95");
    for (const id of ["OM", "TOU", "ANG"]) {
      if (S.d1.includes(id)) fail(id + " a quitté la D1 à l'été 94 : il ne joue pas la D1 94/95");
      if (!S.d2.includes(id)) fail(id + " doit jouer la D2 94/95");
    }
    ok("Nice, Rennes et Bastia montent ; Toulouse et Angers descendent, et l'OM purge sa rétrogradation");
    // la D2 réelle est un GROUPE UNIQUE de vingt-deux clubs : le jeu retient les vingt premiers
    const D2_REELLE = ["OM","GUI","GUE","TOU","CHA","RST","NCY","DUN","AMI","ALE",
                       "CHV","LMN","MUL","VAL","LAV","PER","ANG","NIO","BRI","BEA"];
    const manquants = D2_REELLE.filter(id => !S.d2.includes(id));
    if (manquants.length) fail("D2 94/95 : clubs de tête absents — " + manquants.join(","));
    else ok("D2 94/95 = les vingt premiers du groupe unique de vingt-deux (classement réel)");
    // les deux derniers du classement réel restent dehors
    for (const id of ["SED", "NIM"])
      if (S.d2.includes(id)) fail(id + " finit 21e ou 22e de la D2 réelle : il n'entre pas dans les vingt");
    ok("Sedan (21e) et Nîmes (22e) écartés pour tenir les vingt places du moteur");
    // effectifs : non vides, postes valides, notes dans les bornes
    let pb = [];
    for (const id of tous) {
      const L = (S.d1.includes(id) ? S.starsD1 : S.starsD2)[id];
      if (!L || !L.length) { pb.push(id + " vide"); continue; }
      if (L.length < 14) pb.push(id + " maigre (" + L.length + ")");
      for (const t of L) {
        if (!["G", "D", "M", "A"].includes(t[1])) pb.push(id + " poste invalide " + t[0]);
        // Didier Domi tient la borne basse : seize ans, une minute le 24 janvier 1995 contre Lyon.
        // De Wolf et Sénac tiennent la haute, à trente-six ans.
        if (!(t[2] >= 16 && t[2] <= 36)) pb.push(id + " âge hors bornes " + t[0] + " " + t[2]);
        if (!(t[3] >= 55 && t[3] <= 90)) pb.push(id + " note hors bornes " + t[0] + " " + t[3]);
        if (!(t[4] >= t[3] && t[4] <= 97)) pb.push(id + " pot incohérent " + t[0]);
      }
      if (!L.filter(t => t[1] === "G").length) pb.push(id + " sans gardien réel");
    }
    if (pb.length) pb.forEach(fail); else ok("40 effectifs réels valides (postes, âges, notes ≤ 90, pot ≥ note)");
    // pas de plafond d'âge depuis 99/00 : les vétérans jouent leur saison réelle.
    const vets = { BOR: "D. Sénac", CAN: "M. Dussuyer", STR: "P. Thys" };
    const absents = Object.entries(vets).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom));
    if (absents.length) fail("vétérans 35+ manquants : " + absents.map(([id, n]) => n + " (" + id + ")").join(", "));
    else if (!(S.starsD2.OM || []).some(t => t[0] === "M. De Wolf"))
      fail("Michel De Wolf, 36 ans et 4 442 minutes en D2, doit tenir la défense de l'OM");
    else ok("vétérans conservés : De Wolf (36 ans, 4 442 minutes), Sénac (36), Dussuyer et Thys (35)");
    // les gamins de 1994 : le tri au temps de jeu ne doit pas les avoir écartés
    const gamins = { BOR: "Z. Zidane", NAN: "C. Makélélé", MON: "L. Thuram", CAN: "P. Vieira", LEH: "V. Dhorasoo" };
    const perdus = Object.entries(gamins).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom));
    if (perdus.length) fail("pépites 1994 absentes : " + perdus.map(([id, n]) => n + " (" + id + ")").join(", "));
    if (!(S.starsD2.TOU || []).some(t => t[0] === "V. Candela")) fail("Vincent Candela, 21 ans, doit jouer la D2 à Toulouse");
    if (!(S.starsD2.RST || []).some(t => t[0] === "S. Marlet")) fail("Steve Marlet, 20 ans, doit jouer la D2 au Red Star");
    if (!perdus.length) ok("pépites conservées : Zidane, Makélélé, Thuram, Vieira, Dhorasoo, Candela, Marlet");
    // Thierry Henry débute à dix-sept ans sur le Rocher : c'est le plus jeune buteur du plateau
    const henry = (S.starsD1.MON || []).find(t => t[0] === "T. Henry");
    if (!henry) fail("Thierry Henry, 17 ans et 279 minutes, doit figurer dans le Monaco de 94/95");
    else if (henry[2] !== 17 || henry[4] < 90) fail("Henry : âge " + henry[2] + ", potentiel " + henry[4]);
    else ok("Thierry Henry a dix-sept ans à Monaco, et le potentiel qui va avec");
    // le tri aux minutes écarte les pépites : celles-là ont été forcées à la main
    const forces = { LYO: ["L. Giuly"], PSG: ["P. Ducrocq", "D. Domi"], BOR: ["F. Grenet"],
                     LEH: ["M. Louis-Jean"], MTP: ["P. Delaye"], CAN: ["D. Jemmali"] };
    for (const id in forces) for (const nom of forces[id])
      if (!(S.starsD1[id] || []).some(t => t[0] === nom)) fail("pépite forcée absente de D1 : " + nom + " (" + id + ")");
    const forcesD2 = { OM: ["O. Echouafni"], ANG: ["U. Ramé"], NCY: ["V. Hognon"] };
    for (const id in forcesD2) for (const nom of forcesD2[id])
      if (!(S.starsD2[id] || []).some(t => t[0] === nom)) fail("pépite forcée absente de D2 : " + nom + " (" + id + ")");
    ok("forçages tenus : Giuly (18 ans), Domi (16 ans, une minute), Ducrocq, Grenet, Louis-Jean, Delaye, Jemmali, Echouafni, Ramé, Hognon");
    // la table d'ajustements à la main : le calcul ne sait pas qui ramasse le Ballon d'or
    const AJUSTES = [["PSG", "G. Weah", 86], ["PSG", "V. Guérin", 82], ["PSG", "B. Lama", 82],
                     ["NAN", "P. Loko", 81], ["NAN", "R. Pedros", 77], ["BOR", "Z. Zidane", 82],
                     ["MON", "L. Thuram", 79]];
    for (const [id, nom, note] of AJUSTES) {
      const t = (S.starsD1[id] || []).find(x => x[0] === nom);
      if (!t) fail("joueur ajusté absent : " + nom + " (" + id + ")");
      else if (t[3] !== note) fail(nom + " note " + t[3] + " (attendu " + note + ")");
    }
    const casca = (S.starsD2.OM || []).find(t => t[0] === "T. Cascarino");
    if (!casca) fail("Tony Cascarino, 31 buts en D2, doit mener l'attaque de l'OM");
    else if (casca[3] !== 82) fail("Cascarino note " + casca[3] + " (attendu 82)");
    ok("notes ajustées : Weah 86 (Ballon d'or 1995), Guérin 82 (meilleur joueur), Loko 81 (22 buts), Cascarino 82 (31 buts en D2)");
    const nD1 = S.d1.reduce((s, id) => s + S.starsD1[id].length, 0);
    const nD2 = S.d2.reduce((s, id) => s + S.starsD2[id].length, 0);
    // 400 + 359 : Dunkerque n'a que 17 hommes ayant joué — la source fait foi.
    if (nD1 !== 400) fail("D1 94/95 : " + nD1 + " joueurs curés (attendu 400)");
    if (nD2 !== 359) fail("D2 94/95 : " + nD2 + " joueurs curés (attendu 359)");
    if (nD1 === 400 && nD2 === 359) ok("759 joueurs réels relevés (400 en D1, 359 en D2)");
  }
} catch (e) { fail("exception registre : " + e.stack); }

/* ===== 2) Doublons de noms ===== */
console.log("2) Doublons de noms");
try {
  const compte = {};
  const ajoute = (nom, src) => { (compte[nom] = compte[nom] || []).push(src); };
  for (const id in api.STARS_9495) for (const t of api.STARS_9495[id]) ajoute(t[0], "D1:" + id);
  for (const id in api.STARS_D2_9495) for (const t of api.STARS_D2_9495[id]) ajoute(t[0], "D2:" + id);
  const dupClub = Object.entries(compte).filter(([n, s]) => s.length > 1);
  if (dupClub.length) dupClub.forEach(([n, s]) => fail("doublon 94/95 : « " + n + " » dans " + s.join(" + ")));
  else ok("aucun joueur dupliqué entre deux clubs en 94/95 (transferts arbitrés au temps de jeu)");
  // Deux Cissé sans lien : convention de 99/00, le plus utilisé garde l'initiale.
  if (!(api.STARS_D2_9495.NIO || []).some(t => t[0] === "A. Cissé"))
    fail("Aboubacar Cissé (1 420 min à Niort) doit garder l'initiale");
  else if (!(api.STARS_9495.LIL || []).some(t => t[0] === "Aliou Cissé"))
    fail("Aliou Cissé, 18 ans à Lille, doit être écrit en toutes lettres");
  else ok("homonymes séparés : A. Cissé (Aboubacar, Niort) et Aliou Cissé (Lille) en toutes lettres");
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
  // les mononymes de la source restent tels quels (Raí, Valdo, Valdeir)
  for (const [id, nom] of [["PSG", "Raí"], ["PSG", "Valdo"], ["BOR", "Valdeir"]])
    if (!(api.STARS_9495[id] || []).some(t => t[0] === nom)) fail("mononyme attendu absent : " + nom + " (" + id + ")");
  ok("mononymes conservés sans initiale : Raí et Valdo au PSG, Valdeir à Bordeaux");
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
  if (coll.length) fail("vivier 94/95 contient des joueurs déjà employés : " + coll.join(", "));
  else ok("vivier construit disjoint des effectifs employés (94/95)");
} catch (e) { fail("exception doublons : " + e.stack); }

/* ===== 3) Année de base + étés internationaux + sièges européens ===== */
console.log("3) Année de base, été 95 muet, Euro 96 à la 2e intersaison, sièges européens");
try {
  api.nouvellePartie("PSG", KEY);
  let G = api.getG();
  if (G.saison !== KEY) fail("G.saison = " + G.saison + " (attendu " + KEY + ")");
  if (G.anBase !== 1994) fail("G.anBase = " + G.anBase + " (attendu 1994)");
  if (api.anneeJeu() !== 1994) fail("anneeJeu() = " + api.anneeJeu() + " (attendu 1994)");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G.vire = null;
  api.intersaison();
  G = api.getG();
  // partir de 94/95 ne pose AUCUN tournoi à la première intersaison : l'été 95 est muet
  const recap1 = (G.recap || []).join(" ");
  if (/Coupe du monde|Euro en /i.test(recap1))
    fail("été 95 : aucun grand tournoi ne s'est joué, la 1re intersaison doit être muette");
  else ok("année de base 1994 ; l'été 95 ne porte aucun tournoi");
  if (G.saison !== "1995-96") fail("chaîne de saison : G.saison = " + G.saison + " (attendu 1995-96)");
  else ok("chaîne de saison correcte : 1994-95 → 1995-96");
  // l'Euro 96 à la deuxième intersaison
  for (let d = 0; d < 38; d++) api.jouerJournee();
  api.getG().vire = null; api.intersaison();
  G = api.getG();
  if (!/Euro en Angleterre/i.test((G.recap || []).join(" ")))
    fail("été 96 : l'Euro anglais doit tomber à la 2e intersaison");
  else ok("été 96 déclenché à la 2e intersaison : l'Euro en Angleterre");
  // L'Europe 1994-95 telle qu'elle s'est jouée : le PSG champion joue la C1 (et ira en
  // demi-finale), Auxerre la Coupe des Coupes qu'il a gagnée sur le terrain (Coupe de
  // France 1994), et l'OM joue la Coupe UEFA DEPUIS LA D2 — vice-champion 93/94, il a
  // sorti l'Olympiakos avant de tomber à Sion.
  const attendu = { PSG: "C1", AUX: "C2", OM: "C3", BOR: "C3", NAN: "C3", CAN: "C3",
                    LYO: null, LEN: null, MON: null, MET: null, STR: null };
  for (const id in attendu) {
    api.nouvellePartie(id, KEY);
    const c = api.getG().euroCompet;
    if (c !== attendu[id]) fail("siège européen " + id + " = " + c + " (attendu " + attendu[id] + ")");
  }
  ok("sièges européens : le PSG en C1, Auxerre en C2, l'OM (depuis la D2), Bordeaux, Nantes et Cannes en C3");
} catch (e) { fail("exception année/Europe : " + e.stack); }

/* ===== 4) Carrière multi-saisons depuis 94/95 ===== */
console.log("4) Carrière multi-saisons depuis 94/95 (calibrage, vieillissement)");
let totalButs = 0, totalMatchs = 0;
const departs = ["NAN", "PSG", "BAS", "OM"]; // champion, tenant de la Coupe, promu, exclu en D2
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
  } catch (e) { fail("exception carrière 94/95 (" + dep + ") : " + e.stack); }
}
const gpm = totalButs / totalMatchs;
console.log("— Calibrage 94/95 : " + gpm.toFixed(3) + " buts/match sur " + Math.round(totalMatchs) + " matchs —");
if (gpm < 2.0 || gpm > 2.8) fail("calibrage 94/95 hors plage (cible ~2,3) : " + gpm.toFixed(3));
else ok("calibrage 94/95 dans la plage attendue");

console.log(FAILS === 0 ? "\n✅ HARNAIS 94/95 : TOUT EST VERT" : "\n❌ HARNAIS 94/95 : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
