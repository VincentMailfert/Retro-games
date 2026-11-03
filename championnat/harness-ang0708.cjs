/* Harnais de validation — SAISON DE DÉPART ANG 2007-08
   La DIX-HUITIÈME saison anglaise, assemblée par la tâche planifiée sans accès à Transfermarkt.
   `harness-angleterre.cjs` tient le cadre ; ici, les FAITS :
   1) le plateau réel (United garde le titre, Derby finit à onze points, West Bromwich remonte),
   2) les sièges de 2007,
   3) les hommes : Cristiano Ronaldo joueur de l'année PFA et FWA et meilleur buteur, Fàbregas meilleur
      espoir, Adebayor et Torres à vingt-quatre buts, Ebanks-Blake meilleur buteur du dessous,
      « R. Santa Cruz » avec sa particule entière
   4) les corrections du relevé : les arrivées non datées reprises contre le relevé 2006-07, quatre hommes
      laissés au club du coup d'envoi, Bale gardé à Tottenham, six sans nom libre remplacés, Isaiah
      Osbourne départagé d'Isaac
   5) une carrière
   Usage : node harness-ang0708.cjs                                                        */
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
  "voitPays,SAISONS,STARS_ANG0708,STARS_D2_ANG0708,D1_ANG0708,D2_ANG0708,SIEGES_ANG,VIVIER_SAISON," +
  "PRENOMS_VRAIS,CLUBS_ANG,STARS_ANG0607,STARS_D2_ANG0607,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ANG-2007-08";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ANG0708)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ANG0708)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;

const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

// le même homme la saison d'avant, pour l'âge suivi
const PREC = new Map();
for (const lst of [...Object.values(api.STARS_ANG0607), ...Object.values(api.STARS_D2_ANG0607)]) for (const t of lst) PREC.set(t[0], t);

console.log("1) Le plateau réel de 2007-08");
{
  dit(!!S && S.pays === "ANG" && S.an === 2007 && S.titre === "2007-08", "au registre : ANG, 2007, « 2007-08 »");
  dit(S.nom === "Moscou sous la pluie", "son nom : « " + S.nom + " »");
  dit(S.d1[0] === "MUN" && S.d1[1] === "CHE" && S.d1[2] === "ARS" && S.d1[3] === "LIV" && S.d1[4] === "EVE", "Manchester United champion, devant Chelsea, Arsenal, Liverpool et Everton");
  dit(S.d1[17] === "RDG" && S.d1[18] === "BIR" && S.d1[19] === "DER", "Reading, Birmingham et Derby, les trois relégués, ferment l'élite");
  dit(S.d1.includes("SUN") && S.d1.includes("BIR") && S.d1.includes("DER"), "Sunderland, Birmingham et Derby, promus de 2006-07, à l'élite");
  dit(S.d2[0] === "WBA" && S.d2[1] === "STK" && S.d2[2] === "HUL" && S.d2[3] === "BSC", "West Bromwich champion du dessous, Stoke deuxième, Hull troisième et vainqueur des barrages contre Bristol City");
  for (const c of ["COV", "LEI", "SCU", "COL"]) dit(!S.d2.includes(c), c + " écarté (les quatre derniers du dessous)");
  dit(S.d2.includes("SHU") && S.d2.includes("CHL") && S.d2.includes("WAT"), "Sheffield United, Charlton et Watford, relégués en 2006-07, au dessous");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ANG0708[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ANG0708[c].length, 0);
  dit(n1 === 400 && n2 === 360, "760 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 2007");
{
  const T = api.SIEGES_ANG[2007];
  dit(meme(S.euroC1, ["MUN", "CHE", "LIV", "ARS"]) && S.euroC2.length === 0 && meme(S.euroC3, ["TOT", "EVE", "BOL", "BLB"]), "United, Chelsea, Liverpool et Arsenal en C1, la C2 vide, Tottenham, Everton, Bolton et Blackburn en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ANG[2007]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("C. Ronaldo", "MUN") && note("C. Ronaldo")[3] >= 90 && note("C. Ronaldo")[4] >= 92 && note("C. Ronaldo")[2] === 22, "Cristiano Ronaldo, joueur de l'année PFA et FWA, trente et un buts, vingt-deux ans : " + note("C. Ronaldo")[3] + "/" + note("C. Ronaldo")[4]);
  dit(au("C. Fàbregas", "ARS") && note("C. Fàbregas")[3] >= 84, "Fàbregas, meilleur espoir, que l'héritage laissait à 72 : " + note("C. Fàbregas")[3]);
  dit(au("E. Adebayor", "ARS") && note("E. Adebayor")[3] >= 82, "Adebayor, vingt-quatre buts : " + note("E. Adebayor")[3]);
  dit(au("F. Torres", "LIV") && note("F. Torres")[3] >= 84, "Torres, vingt-quatre buts pour sa première saison, à Liverpool au coup d'envoi : " + note("F. Torres")[3]);
  dit(au("S. Ebanks-Blake", "PLY") && note("S. Ebanks-Blake")[3] >= 74, "Ebanks-Blake, meilleur buteur du dessous, à Plymouth au coup d'envoi (Wolverhampton en janvier) : " + note("S. Ebanks-Blake")[3]);
  dit(au("R. Santa Cruz", "BLB") && !PAR_NOM.has("R. S. Cruz") && api.PRENOMS_VRAIS["R. Santa Cruz"] === "Roque", "« R. Santa Cruz » à Blackburn, la particule gardée entière, prénom Roque");
  dit(au("J. Terry", "CHE") && au("F. Lampard", "CHE") && au("D. Drogba", "CHE") && au("P. Čech", "CHE"), "Terry, Lampard, Drogba et Čech à Chelsea");
  dit(au("S. Gerrard", "LIV") && au("W. Rooney", "MUN") && au("C. Tévez", "MUN"), "Gerrard à Liverpool, Rooney et Tévez à United");
  dit(au("J. Woodgate", "MID") && au("J. Defoe", "TOT"), "Woodgate à Middlesbrough et Defoe à Tottenham : partis en janvier, ils étaient là au coup d'envoi");
  const tous = [].concat(...Object.values(api.STARS_ANG0708), ...Object.values(api.STARS_D2_ANG0708));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const ages = [...PAR_NOM.keys()].filter(n => PREC.has(n) && Math.abs(PREC.get(n)[2] + 1 - note(n)[2]) > 0 && PREC.get(n)[1] === note(n)[1]);
  dit(ages.length === 0, "un homme de 2006-07 a un an de plus" + (ages.length ? " — " + ages.slice(0, 8).join(", ") : ""));
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-Z][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 760, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
  dit(![...PAR_NOM.keys()].some(n => /^[A-Z][a-z]+\. /.test(n)), "aucune forme courte à initiale de plusieurs lettres (« Cr. Davies »…)");
  dit(![...PAR_NOM.keys()].some(n => /[​-‏ ]/.test(n)), "aucun caractère invisible dans un nom");
}
console.log("\n4) Les corrections du relevé");
{
  // arrivées non datées : absents de leur club en 2006-07 et utilisés moins d'une demi-saison
  for (const n of ["C. Davies", "C. Clark", "C. Perry", "G. Stack", "M. Waghorn", "T. Webbe"])
    dit(!PAR_NOM.has(n), n + " n'est pas au plateau (arrivée non datée, absent du club en 2006-07)");
  // au coup d'envoi au club qui les a fait jouer avec une arrivée datée, et non au plateau
  for (const n of ["S. Sodje", "P. Gallagher", "C. Nash", "F. Campbell"])
    dit(!PAR_NOM.has(n), n + " n'est pas au club où il arrive en cours de saison");
  dit(au("G. Bale", "TOT") && note("G. Bale")[2] === 18, "Bale à Tottenham à dix-huit ans : le rapport du relevé l'y met au coup d'envoi");
  dit(au("T. Sörensen", "AVL") && au("C. Gunter", "CAR") && au("C. Powell", "CHL") && au("L. Summerfield", "PLY") && au("L. Neal", "PNE"), "Sörensen, Gunter, Powell, Summerfield et Neal entrent à Aston Villa, Cardiff, Charlton, Plymouth et Preston");
  dit(au("C. Makin", "SOU") && au("L. Buxton", "STK") && au("S. John", "SUN") && au("C. Ikeme", "WOL") && au("M. Bridges", "HUL"), "Makin, Buxton, Stern John, Ikeme et Bridges entrent à Southampton, Stoke, Sunderland, Wolverhampton et Hull");
  dit(api.STARS_D2_ANG0708.WOL.filter(t => t[1] === "G").length === 2 && api.STARS_D2_ANG0708.STK.filter(t => t[1] === "G").length === 2, "Wolverhampton et Stoke gardent deux gardiens");
  dit(api.STARS_ANG0708.ARS.filter(t => t[1] === "A").length === 3 && api.STARS_D2_ANG0708.CAR.filter(t => t[1] === "A").length === 3, "Arsenal et Cardiff à trois attaquants : aucun autre n'a de preuve de présence au coup d'envoi");
  // sans nom libre
  dit(!PAR_NOM.has("Anderson") && !PAR_NOM.has("Eduardo") && !PAR_NOM.has("Semedo"), "Anderson, Eduardo et Semedo, sans nom libre, ne sont pas au plateau");
  dit(au("C. Eagles", "MUN") && au("J. Hoyte", "ARS") && au("N. Solano", "NEW") && au("J. Hodgkiss", "WBA") && au("T. Racon", "CHL") && au("K. Christensen", "BNS"), "Eagles, Hoyte, Solano, Hodgkiss, Racon et Christensen remplacent Anderson, Eduardo, Alan Smith, Paul Robinson, Semedo et Paul Reid");
  dit(au("Paul Robinson", "TOT") && note("Paul Robinson")[1] === "G", "le Paul Robinson de Tottenham, gardien, garde son nom");
  // homonymes
  dit(au("Isaiah Osbourne", "AVL") && note("Isaiah Osbourne")[2] === 20 && !PAR_NOM.has("I. Osbourne"), "Isaiah Osbourne, vingt ans, porte son nom entier à Aston Villa : « I. Osbourne » est Isaac, de Coventry, écarté");
  dit(au("Andy Johnson", "EVE") && au("A. Johnson", "BNS") && note("A. Johnson")[1] === "M", "Andy Johnson d'Everton et « A. Johnson » de Barnsley, deux hommes, comme au jeu");
}

console.log("\n5) Une carrière anglaise depuis 2007-08");
{
  api.nouvellePartie("MUN", KEY);
  const G = api.getG();
  dit(G.pays === "ANG" && G.saison === "2007-08" && api.anneeJeu() === 2007, "G.pays = ANG, « 2007-08 », 2007");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 2010, "carrière rendue en 2010-11");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ANG 2007-08 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ANG 2007-08 : TOUT EST VERT");
