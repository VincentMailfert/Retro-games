/* Harnais de validation — SAISON DE DÉPART ANG 2009-10
   La VINGTIÈME et dernière saison anglaise, assemblée par la tâche planifiée sans accès à Transfermarkt.
   `harness-angleterre.cjs` tient le cadre ; ici, les FAITS :
   1) le plateau réel (Chelsea champion, Burnley, Hull et Portsmouth descendent, Newcastle et West
      Bromwich remontent, Blackpool par les barrages),
   2) les sièges de 2009,
   3) les hommes : Rooney joueur de l'année PFA et de la presse, Milner meilleur espoir, Drogba
      meilleur buteur
   4) les corrections du relevé : la présélection rejouée (les arrivées rectifiées oubliées : Drogba,
      Scholes, Bale, Pienaar, Carroll…), les arrivées rectifiées reprises contre le relevé 2008-09
      (Donovan, Cork, Rocha, McManus, Klasnic sortent), Routledge remis à QPR, six sans nom libre
      remplacés, Abdoulaye Faye
   5) une carrière
   Usage : node harness-ang0910.cjs                                                        */
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
  "voitPays,SAISONS,STARS_ANG0910,STARS_D2_ANG0910,D1_ANG0910,D2_ANG0910,SIEGES_ANG,VIVIER_SAISON," +
  "PRENOMS_VRAIS,CLUBS_ANG,STARS_ANG0809,STARS_D2_ANG0809,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ANG-2009-10";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ANG0910)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ANG0910)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;

const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

// le même homme la saison d'avant, pour l'âge suivi
const PREC = new Map();
for (const lst of [...Object.values(api.STARS_ANG0809), ...Object.values(api.STARS_D2_ANG0809)]) for (const t of lst) PREC.set(t[0], t);

console.log("1) Le plateau réel de 2009-10");
{
  dit(!!S && S.pays === "ANG" && S.an === 2009 && S.titre === "2009-10", "au registre : ANG, 2009, « 2009-10 »");
  dit(S.nom === "Ancelotti passe la centaine", "son nom : « " + S.nom + " »");
  dit(S.d1[0] === "CHE" && S.d1[1] === "MUN" && S.d1[2] === "ARS" && S.d1[3] === "TOT" && S.d1[4] === "MCI", "Chelsea champion, devant Manchester United, Arsenal, Tottenham et Manchester City");
  dit(S.d1[17] === "BUR" && S.d1[18] === "HUL" && S.d1[19] === "POR", "Burnley, Hull et Portsmouth, les trois relégués, ferment l'élite");
  dit(S.d1.includes("WOL") && S.d1.includes("BIR") && S.d1.includes("BUR"), "Wolverhampton, Birmingham et Burnley, promus de 2008-09, à l'élite");
  dit(S.d2[0] === "NEW" && S.d2[1] === "WBA" && S.d2.includes("BLP"), "Newcastle champion du dessous, West Bromwich deuxième, Blackpool vainqueur des barrages");
  for (const c of ["CPL", "SHW", "PLY", "PET"]) dit(!S.d2.includes(c), c + " écarté (les quatre derniers du dessous)");
  dit(S.d2.includes("MID") && S.d2.includes("NEW") && S.d2.includes("WBA"), "Newcastle, Middlesbrough et West Bromwich, relégués en 2008-09, au dessous");
  dit(S.d2.includes("LEI") && S.d2.includes("SCU"), "Leicester et Scunthorpe, montés de troisième division, au dessous");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ANG0910[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ANG0910[c].length, 0);
  dit(n1 === 400 && n2 === 360, "760 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 2009");
{
  const T = api.SIEGES_ANG[2009];
  dit(meme(S.euroC1, ["MUN", "LIV", "CHE", "ARS"]) && S.euroC2.length === 0 && meme(S.euroC3, ["EVE", "AVL", "FUL"]), "United, Liverpool, Chelsea et Arsenal en C1, la C2 vide, Everton, Aston Villa et Fulham en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ANG[2009]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("W. Rooney", "MUN") && note("W. Rooney")[3] >= 90 && note("W. Rooney")[2] === 24, "Rooney, joueur de l'année PFA et de la presse à vingt-quatre ans : " + note("W. Rooney")[3]);
  dit(au("J. Milner", "AVL") && note("J. Milner")[3] >= 79, "Milner, meilleur espoir, que l'héritage laissait à 71 : " + note("J. Milner")[3]);
  dit(au("D. Drogba", "CHE") && note("D. Drogba")[3] >= 88 && note("D. Drogba")[1] === "A", "Drogba, meilleur buteur avec vingt-neuf buts : " + note("D. Drogba")[3]);
  dit(au("F. Lampard", "CHE") && au("J. Terry", "CHE") && au("P. Čech", "CHE"), "Lampard, Terry et Čech à Chelsea");
  dit(au("S. Gerrard", "LIV") && au("F. Torres", "LIV") && au("C. Fàbregas", "ARS"), "Gerrard et Torres à Liverpool, Fàbregas à Arsenal");
  dit(au("C. Tévez", "MCI") && au("E. Adebayor", "MCI"), "Tévez et Adebayor, arrivés l'été, à Manchester City");
  dit(!PAR_NOM.has("C. Ronaldo"), "Cristiano Ronaldo, parti au Real Madrid l'été, n'est plus au plateau");
  const tous = [].concat(...Object.values(api.STARS_ANG0910), ...Object.values(api.STARS_D2_ANG0910));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const ages = [...PAR_NOM.keys()].filter(n => PREC.has(n) && Math.abs(PREC.get(n)[2] + 1 - note(n)[2]) > 0 && PREC.get(n)[1] === note(n)[1]);
  dit(ages.length === 0, "un homme de 2008-09 a un an de plus" + (ages.length ? " — " + ages.slice(0, 8).join(", ") : ""));
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-ZÀ-ÝŁŠŽČ][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 760, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
  dit(![...PAR_NOM.keys()].some(n => /^[A-Z][a-z]+\. /.test(n)), "aucune forme courte à initiale de plusieurs lettres (« Cr. Davies »…)");
  dit(![...PAR_NOM.keys()].some(n => /[​-‏ ]|&#/.test(n)), "aucun caractère invisible ni entité HTML dans un nom");
}
console.log("\n4) Les corrections du relevé");
{
  // la présélection rejouée : arrivées rectifiées par le relevé, oubliées de sa présélection
  dit(au("D. Drogba", "CHE") && au("P. Scholes", "MUN") && au("J. Evans", "MUN") && au("G. Bale", "TOT") && au("S. Pienaar", "EVE"), "Drogba, Scholes, Jonny Evans, Bale et Pienaar rentrent dans leur effectif");
  dit(au("A. Carroll", "NEW") && au("C. Dempsey", "FUL") && au("C. Cole", "WHU") && au("A. Taarabt", "QPR") && au("B. Sharp", "DON"), "Carroll, Dempsey, Carlton Cole, Taarabt et Billy Sharp aussi");
  dit(au("P. Hayes", "SCU") && au("Marcus Williams", "SCU") && au("Cliff Byrne", "SCU"), "Scunthorpe, monté de troisième division, retrouve Hayes, Marcus Williams et Byrne");
  dit(!PAR_NOM.has("A. Shevchenko") && !PAR_NOM.has("M. Godden") && !PAR_NOM.has("Matty Godden"), "Shevchenko (quatre minutes) et Godden (zéro) leur cèdent la place");
  // arrivées rectifiées reprises contre le relevé 2008-09
  for (const n of ["L. Donovan", "Landon Donovan", "J. Cork", "Jack Cork", "R. Rocha", "Ricardo Rocha", "S. McManus", "Stephen McManus", "I. Klasnić", "I. Klasnic", "Ivan Klasnic", "N. Çiftçi", "Nadir Çiftçi", "S. Campbell", "Sol Campbell"])
    dit(!PAR_NOM.has(n), n + " n'est pas au plateau (absent du club en 2008-09, moins d'une demi-saison, ou ailleurs au coup d'envoi)");
  dit(au("C. Gardner", "AVL") && !au("C. Gardner", "BIR"), "Craig Gardner à Aston Villa, club du coup d'envoi (Birmingham en janvier)");
  dit(au("J. Greening", "FUL") && au("G. Tamaș", "WBA") && au("J. Colback", "IPS"), "Greening, Tamaș et Colback, titulaires arrivés l'été, gardés faute de contre-preuve");
  dit(au("W. Routledge", "QPR") && !au("W. Routledge", "NEW"), "Routledge remis à QPR, club du coup d'envoi (Newcastle en janvier)");
  dit(au("T. Kádár", "NEW") && au("J. Ashdown", "POR"), "Kádár et Ashdown complètent Newcastle et Portsmouth");
  // sans nom libre
  dit(!PAR_NOM.has("Anderson") && !PAR_NOM.has("Eduardo"), "Anderson et Eduardo, sans nom libre, ne sont pas au plateau");
  dit(au("J. O'Shea", "MUN") && au("Armand Traoré", "ARS") && au("Sean Davis", "BOL") && au("J. Barton", "NEW") && au("J. Garner", "FOR") && au("A. Eastham", "BLP"), "O'Shea, Armand Traoré, Sean Davis, Barton, Garner et Eastham remplacent Anderson, Eduardo, Paul Robinson, Alan Smith, Paul Smith et Rob Edwards");
  dit(api.STARS_D2_ANG0910.FOR.filter(t => t[1] === "G").length === 1, "Nottingham Forest à un seul gardien, Lee Camp (toléré) : aucun autre n'a de date d'avant le coup d'envoi");
  dit(api.STARS_ANG0910.ARS.filter(t => t[1] === "A").length === 3 && api.STARS_ANG0910.POR.filter(t => t[1] === "A").length === 3, "Arsenal et Portsmouth à trois attaquants (toléré)");
  // homonymes
  dit(au("Abdoulaye Faye", "STK") && note("Abdoulaye Faye")[1] === "D" && note("Abdoulaye Faye")[2] === 31, "Abdoulaye Faye, défenseur de Stoke, garde son nom entier");
  dit(!PAR_NOM.has("A. Faye"), "« A. Faye » (Amdy) n'est pas au plateau : le résolveur ne l'a pas rendu à Abdoulaye");
  dit(au("I. Osbourne", "COV") && note("I. Osbourne")[2] === 23, "« I. Osbourne » est Isaac, de Coventry");
  dit(au("N. Hunt", "DER") && note("N. Hunt")[1] === "D" && au("Noel Hunt", "RDG") && note("Noel Hunt")[1] === "A", "Nicky Hunt (« N. Hunt », Derby) et Noel Hunt (Reading), deux hommes");
}

console.log("\n5) Une carrière anglaise depuis 2009-10");
{
  api.nouvellePartie("CHE", KEY);
  const G = api.getG();
  dit(G.pays === "ANG" && G.saison === "2009-10" && api.anneeJeu() === 2009, "G.pays = ANG, « 2009-10 », 2009");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 2012, "carrière rendue en 2012-13");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ANG 2009-10 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ANG 2009-10 : TOUT EST VERT");
