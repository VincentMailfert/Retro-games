/* Harnais de validation — SAISON DE DÉPART ANG 2008-09
   La DIX-NEUVIÈME saison anglaise, assemblée par la tâche planifiée sans accès à Transfermarkt.
   `harness-angleterre.cjs` tient le cadre ; ici, les FAITS :
   1) le plateau réel (United champion pour la troisième fois de suite, Newcastle, Middlesbrough et West
      Bromwich descendent, Wolverhampton remonte),
   2) les sièges de 2008,
   3) les hommes : Giggs joueur de l'année PFA, Gerrard de la presse, Ashley Young meilleur espoir, Anelka
      meilleur buteur, Vidić et van der Sar, Ebanks-Blake meilleur buteur du dessous
   4) les corrections du relevé : trois arrivées « postérieures » reprises contre le relevé 2007-08, le
      contrôle des minutes (Bridge, Stanislas), six sans nom libre remplacés, Amdy et Abdoulaye Faye
   5) une carrière
   Usage : node harness-ang0809.cjs                                                        */
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
  "voitPays,SAISONS,STARS_ANG0809,STARS_D2_ANG0809,D1_ANG0809,D2_ANG0809,SIEGES_ANG,VIVIER_SAISON," +
  "PRENOMS_VRAIS,CLUBS_ANG,STARS_ANG0708,STARS_D2_ANG0708,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ANG-2008-09";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ANG0809)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ANG0809)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;

const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

// le même homme la saison d'avant, pour l'âge suivi
const PREC = new Map();
for (const lst of [...Object.values(api.STARS_ANG0708), ...Object.values(api.STARS_D2_ANG0708)]) for (const t of lst) PREC.set(t[0], t);

console.log("1) Le plateau réel de 2008-09");
{
  dit(!!S && S.pays === "ANG" && S.an === 2008 && S.titre === "2008-09", "au registre : ANG, 2008, « 2008-09 »");
  dit(S.nom === "Trois couronnes de rang", "son nom : « " + S.nom + " »");
  dit(S.d1[0] === "MUN" && S.d1[1] === "LIV" && S.d1[2] === "CHE" && S.d1[3] === "ARS" && S.d1[4] === "EVE", "Manchester United champion, devant Liverpool, Chelsea, Arsenal et Everton");
  dit(S.d1[17] === "NEW" && S.d1[18] === "MID" && S.d1[19] === "WBA", "Newcastle, Middlesbrough et West Bromwich, les trois relégués, ferment l'élite");
  dit(S.d1.includes("WBA") && S.d1.includes("STK") && S.d1.includes("HUL"), "West Bromwich, Stoke et Hull, promus de 2007-08, à l'élite");
  dit(S.d2[0] === "WOL" && S.d2[1] === "BIR" && S.d2[2] === "SHU" && S.d2.includes("BUR"), "Wolverhampton champion du dessous, Birmingham deuxième, Sheffield United troisième, Burnley vainqueur des barrages");
  for (const c of ["PLY", "NOR", "SOU", "CHL"]) dit(!S.d2.includes(c), c + " écarté (les quatre derniers du dessous)");
  dit(S.d2.includes("RDG") && S.d2.includes("BIR") && S.d2.includes("DER"), "Reading, Birmingham et Derby, relégués en 2007-08, au dessous");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ANG0809[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ANG0809[c].length, 0);
  dit(n1 === 400 && n2 === 360, "760 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 2008");
{
  const T = api.SIEGES_ANG[2008];
  dit(meme(S.euroC1, ["MUN", "CHE", "ARS", "LIV"]) && S.euroC2.length === 0 && meme(S.euroC3, ["POR", "EVE", "TOT", "AVL", "MCI"]), "United, Chelsea, Arsenal et Liverpool en C1, la C2 vide, Portsmouth, Everton, Tottenham, Aston Villa et Manchester City en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ANG[2008]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("R. Giggs", "MUN") && note("R. Giggs")[3] >= 81 && note("R. Giggs")[2] === 35, "Giggs, joueur de l'année PFA à trente-cinq ans : " + note("R. Giggs")[3]);
  dit(au("S. Gerrard", "LIV") && note("S. Gerrard")[3] >= 89, "Gerrard, joueur de l'année de la presse : " + note("S. Gerrard")[3]);
  dit(au("A. Young", "AVL") && note("A. Young")[3] >= 80 && note("A. Young")[2] === 23, "Ashley Young, meilleur espoir, que l'héritage laissait à 64 : " + note("A. Young")[3]);
  dit(au("N. Anelka", "CHE") && note("N. Anelka")[3] >= 84, "Anelka, meilleur buteur avec dix-neuf buts : " + note("N. Anelka")[3]);
  dit(au("N. Vidić", "MUN") && note("N. Vidić")[3] >= 84 && au("E. van der Sar", "MUN") && note("E. van der Sar")[3] >= 81, "Vidić (" + note("N. Vidić")[3] + ") et van der Sar (" + note("E. van der Sar")[3] + "), la défense championne");
  dit(au("S. Ebanks-Blake", "WOL") && note("S. Ebanks-Blake")[3] >= 77, "Ebanks-Blake, meilleur buteur du dessous, à Wolverhampton : " + note("S. Ebanks-Blake")[3]);
  dit(au("C. Ronaldo", "MUN") && note("C. Ronaldo")[3] >= 90 && au("W. Rooney", "MUN"), "Cristiano Ronaldo et Rooney à United");
  dit(au("F. Torres", "LIV") && au("Robbie Keane", "LIV"), "Torres et Robbie Keane à Liverpool (Keane rentre à Tottenham en février)");
  dit(au("J. Milner", "AVL") && au("C. Bellamy", "WHU") && au("G. Bale", "TOT"), "Milner à Aston Villa, Bellamy à West Ham (Manchester City en janvier), Bale à Tottenham");
  const tous = [].concat(...Object.values(api.STARS_ANG0809), ...Object.values(api.STARS_D2_ANG0809));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const ages = [...PAR_NOM.keys()].filter(n => PREC.has(n) && Math.abs(PREC.get(n)[2] + 1 - note(n)[2]) > 0 && PREC.get(n)[1] === note(n)[1]);
  dit(ages.length === 0, "un homme de 2007-08 a un an de plus" + (ages.length ? " — " + ages.slice(0, 8).join(", ") : ""));
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-Z][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 760, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
  dit(![...PAR_NOM.keys()].some(n => /^[A-Z][a-z]+\. /.test(n)), "aucune forme courte à initiale de plusieurs lettres (« Cr. Davies »…)");
  dit(![...PAR_NOM.keys()].some(n => /[​-‏ ]/.test(n)), "aucun caractère invisible dans un nom");
}
console.log("\n4) Les corrections du relevé");
{
  // dates « postérieures » corrigées par le relevé : absents de leur club en 2007-08 et utilisés moins d'une demi-saison
  for (const n of ["R. Kovac", "Radoslav Kovac", "D. Potter", "Darren Potter", "C. Wickham", "Connor Wickham"])
    dit(!PAR_NOM.has(n), n + " n'est pas au plateau (arrivée non datée, absent du club en 2007-08)");
  dit(au("D. Cornell", "SWA") && note("D. Cornell")[1] === "G", "Cornell, la seule arrivée non datée, reste à Swansea, monté de troisième division (règle de 2004-05)");
  // contrôle des minutes
  dit(au("W. Bridge", "CHE") && au("J. Stanislas", "WHU"), "le contrôle des minutes remet Bridge à Chelsea et Stanislas à West Ham");
  dit(!PAR_NOM.has("F. Di Santo") && !PAR_NOM.has("D. Ashton"), "Di Santo et Ashton, les moins utilisés de leurs attaquants, leur cèdent la place");
  dit(au("J. Spector", "WHU") && au("Jimmy Smith", "SHW") && au("J. Rhodes", "IPS"), "Spector, Jimmy Smith et Rhodes remplacent Kovac, Potter et Wickham");
  // sans nom libre
  dit(!PAR_NOM.has("Anderson") && !PAR_NOM.has("Rafael") && !PAR_NOM.has("Eduardo"), "Anderson, Rafael et Eduardo, sans nom libre, ne sont pas au plateau");
  dit(au("D. Gibson", "MUN") && au("W. Brown", "MUN") && au("C. Vela", "ARS") && au("S. Martis", "WBA") && au("M. Camara", "BLP") && au("Dale Roberts", "FOR"), "Gibson, Brown, Vela, Martis, Camara et Dale Roberts remplacent Anderson, Rafael, Eduardo, Paul Robinson, Rob Edwards et Paul Smith");
  dit(api.STARS_D2_ANG0809.FOR.filter(t => t[1] === "G").length === 2, "Nottingham Forest garde deux gardiens");
  dit(api.STARS_ANG0809.ARS.filter(t => t[1] === "A").length === 3, "Arsenal à trois attaquants, comme en 2007-08 : aucun autre n'a de date d'arrivée");
  dit(au("Paul Robinson", "BLB") && note("Paul Robinson")[1] === "G", "le Paul Robinson de Blackburn, gardien, garde son nom");
  // homonymes
  dit(au("A. Faye", "STK") && note("A. Faye")[2] === 31 && note("A. Faye")[1] === "M", "« A. Faye » est Amdy, milieu de trente et un ans, à Stoke");
  dit(au("Abdoulaye Faye", "STK") && note("Abdoulaye Faye")[1] === "D", "Abdoulaye Faye, défenseur de Stoke, porte son nom entier");
  dit(au("I. Osbourne", "COV") && note("I. Osbourne")[2] === 22, "« I. Osbourne » est Isaac, de Coventry, revenu au plateau");
}

console.log("\n5) Une carrière anglaise depuis 2008-09");
{
  api.nouvellePartie("MUN", KEY);
  const G = api.getG();
  dit(G.pays === "ANG" && G.saison === "2008-09" && api.anneeJeu() === 2008, "G.pays = ANG, « 2008-09 », 2008");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 2011, "carrière rendue en 2011-12");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ANG 2008-09 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ANG 2008-09 : TOUT EST VERT");
