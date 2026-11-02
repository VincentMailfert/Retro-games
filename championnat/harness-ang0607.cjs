/* Harnais de validation — SAISON DE DÉPART ANG 2006-07
   La DIX-SEPTIÈME saison anglaise, assemblée par la tâche planifiée sans accès à Transfermarkt.
   `harness-angleterre.cjs` tient le cadre ; ici, les FAITS :
   1) le plateau réel (United reprend le titre, Sunderland remonte, Leeds tombe), 2) les sièges de 2006,
   3) les hommes : Cristiano Ronaldo joueur de l'année PFA et FWA et meilleur espoir, Drogba meilleur
      buteur, Scholes et Van der Sar remontés, Cureton meilleur buteur du dessous
   4) les corrections du relevé : les arrivées non datées reprises contre le relevé 2005-06, cinq hommes
      rendus au club du coup d'envoi, cinq sans nom libre remplacés, trois homonymes départagés, « N. Vidić »
   5) une carrière
   Usage : node harness-ang0607.cjs                                                        */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,metaSaison,libDiv," +
  "voitPays,SAISONS,STARS_ANG0607,STARS_D2_ANG0607,D1_ANG0607,D2_ANG0607,SIEGES_ANG,VIVIER_SAISON," +
  "PRENOMS_VRAIS,CLUBS_ANG,STARS_ANG0506,STARS_D2_ANG0506,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ANG-2006-07";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ANG0607)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ANG0607)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;

const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

// le même homme la saison d'avant, pour l'âge suivi
const PREC = new Map();
for (const lst of [...Object.values(api.STARS_ANG0506), ...Object.values(api.STARS_D2_ANG0506)]) for (const t of lst) PREC.set(t[0], t);

console.log("1) Le plateau réel de 2006-07");
{
  dit(!!S && S.pays === "ANG" && S.an === 2006 && S.titre === "2006-07", "au registre : ANG, 2006, « 2006-07 »");
  dit(S.nom === "Ronaldo prend le pouvoir", "son nom : « " + S.nom + " »");
  dit(S.d1[0] === "MUN" && S.d1[1] === "CHE" && S.d1[2] === "LIV" && S.d1[3] === "ARS" && S.d1[4] === "TOT", "Manchester United champion, devant Chelsea, Liverpool, Arsenal et Tottenham");
  dit(S.d1[17] === "SHU" && S.d1[18] === "CHL" && S.d1[19] === "WAT", "Sheffield United, Charlton et Watford, les trois relégués, ferment l'élite");
  dit(S.d1.includes("RDG") && S.d1[7] === "RDG", "Reading, promu, huitième pour sa première saison en élite");
  dit(S.d2[0] === "SUN" && S.d2[1] === "BIR" && S.d2[2] === "DER" && S.d2[3] === "WBA", "Sunderland champion du dessous, Birmingham deuxième, Derby troisième et vainqueur des barrages contre West Bromwich");
  for (const c of ["HUL", "SND", "LUT", "LEE"]) dit(!S.d2.includes(c), c + " écarté (les quatre derniers, Leeds pénalisé de dix points)");
  dit(S.d2.includes("COL") && S.d2.includes("BNS"), "Colchester et Barnsley, montés de troisième division, au plateau");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ANG0607[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ANG0607[c].length, 0);
  dit(n1 === 400 && n2 === 360, "760 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 2006");
{
  const T = api.SIEGES_ANG[2006];
  dit(meme(S.euroC1, ["CHE", "MUN", "LIV", "ARS"]) && S.euroC2.length === 0 && meme(S.euroC3, ["TOT", "BLB", "WHU", "NEW"]), "Chelsea, United, Liverpool et Arsenal en C1, la C2 vide, Tottenham, Blackburn, West Ham et Newcastle en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ANG[2006]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("C. Ronaldo", "MUN") && note("C. Ronaldo")[3] >= 88 && note("C. Ronaldo")[4] >= 92 && note("C. Ronaldo")[2] === 21, "Cristiano Ronaldo, joueur de l'année PFA et FWA et meilleur espoir, vingt et un ans : " + note("C. Ronaldo")[3] + "/" + note("C. Ronaldo")[4]);
  dit(au("D. Drogba", "CHE") && note("D. Drogba")[3] >= 87, "Drogba, meilleur buteur avec vingt buts : " + note("D. Drogba")[3]);
  dit(au("P. Scholes", "MUN") && note("P. Scholes")[3] >= 81, "Scholes, titulaire du champion : " + note("P. Scholes")[3]);
  dit(au("E. van der Sar", "MUN") && note("E. van der Sar")[3] >= 81, "Van der Sar, gardien du champion, que l'âge érodait à 62 : " + note("E. van der Sar")[3]);
  dit(au("J. Cureton", "COL") && note("J. Cureton")[3] >= 74, "Cureton, vingt-trois buts pour Colchester : " + note("J. Cureton")[3]);
  dit(au("J. Terry", "CHE") && au("F. Lampard", "CHE") && au("M. Ballack", "CHE") && au("A. Shevchenko", "CHE") && au("P. Čech", "CHE"), "Terry, Lampard, Ballack, Shevchenko et Čech à Chelsea");
  dit(au("S. Gerrard", "LIV") && au("T. Henry", "ARS") && au("W. Rooney", "MUN"), "Gerrard à Liverpool, Henry à Arsenal, Rooney à United");
  const tous = [].concat(...Object.values(api.STARS_ANG0607), ...Object.values(api.STARS_D2_ANG0607));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const ages = [...PAR_NOM.keys()].filter(n => PREC.has(n) && Math.abs(PREC.get(n)[2] + 1 - note(n)[2]) > 0 && PREC.get(n)[1] === note(n)[1]);
  dit(ages.length === 0, "un homme de 2005-06 a un an de plus" + (ages.length ? " — " + ages.slice(0, 8).join(", ") : ""));
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-Z][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 760, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
  dit(![...PAR_NOM.keys()].some(n => /^[A-Z][a-z]+\. /.test(n)), "aucune forme courte à initiale de plusieurs lettres (« Cr. Davies »…)");
  dit(![...PAR_NOM.keys()].some(n => /[​-‏ ]/.test(n)), "aucun caractère invisible dans un nom");
}
console.log("\n4) Les corrections du relevé");
{
  // arrivées non datées : absents de leur club en 2005-06 et utilisés moins d'une demi-saison
  for (const n of ["Z. Zheng", "C. Dempsey", "J. Walters", "J. Mascherano", "T. Kuszczak", "A. Carroll", "D. Marshall", "G. Sawyer", "R. Fallon", "A. Mvuemba", "A. Bikey", "J. Evans", "C. Cole", "G. McCartney", "A. Valencia", "K. Bassett", "S. Cann"])
    dit(!PAR_NOM.has(n), n + " n'est pas au plateau (arrivée non datée, absent du club en 2005-06)");
  dit(!PAR_NOM.has("J. Woodgate"), "Woodgate, au Real Madrid dans le recruteur de l'été 2006, n'est pas à Middlesbrough");
  dit(au("L. Camp", "DER") && au("M. Fernandes", "POR") && au("P. Chimbonda", "WIG"), "Lee Camp à Derby, Manuel Fernandes à Portsmouth, Chimbonda à Wigan : au club du coup d'envoi");
  dit(!PAR_NOM.has("L. Nyatanga") && !PAR_NOM.has("J. Parkin"), "Nyatanga (Derby) et Parkin (Hull) ne sont pas au club où ils arrivent en cours de saison");
  dit(au("D. Connolly", "SUN") && au("B. Jones", "MID") && au("A. Young", "WAT"), "Connolly à Sunderland, Brad Jones à Middlesbrough, Ashley Young à Watford, où le relevé les met");
  dit(api.STARS_ANG0607.MUN.filter(t => t[1] === "G").length === 1 && au("D. Jones", "MUN"), "Manchester United n'a qu'un gardien sans Kuszczak ; David Jones prend la place");
  for (const c of ["NEW", "WHU"]) dit(api.STARS_ANG0607[c].filter(t => t[1] === "A").length === 3, c + " à trois attaquants : aucun autre n'a de preuve de présence au coup d'envoi");
  dit(api.STARS_D2_ANG0607.CAR.filter(t => t[1] === "A").length === 3, "CAR à trois attaquants");
  dit(au("A. Rooney", "STK") && au("A. Mason", "PLY") && au("M. Coulson", "BNS"), "Adam Rooney, Anthony Mason et Michael Coulson rendent à Stoke, Plymouth et Barnsley leur quatrième attaquant");
  dit(au("Joe Lewis", "NOR") && au("Jake Cole", "QPR"), "Joe Lewis et Jake Cole, deuxièmes gardiens de Norwich et de QPR");
  dit(au("J. Hodgkiss", "WBA") && au("Dan Jones", "WOL") && au("J. Low", "LEI") && au("C. Healy", "BNS"), "Hodgkiss, Dan Jones, Josh Low et Healy remplacent Paul Robinson, Rob Edwards, Gareth Williams et Paul Reid, sans nom libre");
  dit(au("Paul Robinson", "TOT") && note("Paul Robinson")[1] === "G", "le Paul Robinson de Tottenham, gardien, garde son nom");
  // homonymes départagés par _graphie
  dit(au("A. Faye", "CHL") && note("A. Faye")[1] === "M" && note("A. Faye")[2] === 29, "« A. Faye » est Amdy Faye, milieu, à Charlton à vingt-neuf ans");
  dit(au("Abdoulaye Faye", "BOL") && note("Abdoulaye Faye")[1] === "D" && note("Abdoulaye Faye")[2] === 28, "Abdoulaye Faye, défenseur, garde son nom entier à Bolton");
  dit(au("I. Osbourne", "COV") && note("I. Osbourne")[2] === 20 && au("Isaiah Osbourne", "AVL"), "« I. Osbourne » est Isaac, à Coventry ; Isaiah Osbourne, d'Aston Villa, porte son nom entier");
  dit(au("Craig Davies", "WOL") && !PAR_NOM.has("C. Davies"), "Craig Davies porte son nom entier : « C. Davies » est l'attaquant de Sochaux de 2009-10");
  dit(au("N. Vidić", "MUN") && api.PRENOMS_VRAIS["N. Vidić"] === "Nemanja", "« N. Vidić », graphie du jeu, sans le caractère invisible du relevé");
}

console.log("\n5) Une carrière anglaise depuis 2006-07");
{
  api.nouvellePartie("MUN", KEY);
  const G = api.getG();
  dit(G.pays === "ANG" && G.saison === "2006-07" && api.anneeJeu() === 2006, "G.pays = ANG, « 2006-07 », 2006");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 2009, "carrière rendue en 2009-10");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ANG 2006-07 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ANG 2006-07 : TOUT EST VERT");
