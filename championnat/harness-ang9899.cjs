/* Harnais de validation — SAISON DE DÉPART ANG 1998-99
   La NEUVIÈME saison anglaise, et le triplé de Manchester United ; assemblée en séance à partir du relevé.
   `harness-angleterre.cjs` tient le cadre ; ici, les FAITS de cette année-là :
   1) le plateau réel, 2) les sièges européens de 1998,
   3) les hommes : Ginola joueur de l'année, Anelka meilleur espoir, YORKE À ASTON VILLA AU COUP D'ENVOI,
      Stam, Solskjær et Sheringham à United, Gerrard et Joe Cole formés au club
   4) cinq remplaçants présents au coup d'envoi, quatre pépites, et trois arrivées tardives absentes
   5) UN HOMME, UN NOM : Solskjær, Bjørnebye et Kvarme portent le nom des saisons voisines
   6) une carrière
   Usage : node harness-ang9899.cjs                                                        */
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
  "voitPays,SAISONS,STARS_ANG9899,STARS_D2_ANG9899,D1_ANG9899,D2_ANG9899,SIEGES_ANG,VIVIER_SAISON," +
  "PRENOMS_VRAIS,CLUBS_ANG,STARS_ANG9798,STARS_D2_ANG9798,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ANG-1998-99";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ANG9899)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ANG9899)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;

const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

console.log("1) Le plateau réel de 1998-99");
{
  dit(!!S && S.pays === "ANG" && S.an === 1998 && S.titre === "1998-99", "au registre : ANG, 1998, « 1998-99 »");
  dit(S.d1[0] === "MUN" && S.d1[1] === "ARS", "Manchester United champion, Arsenal deuxième à un point");
  dit(meme(S.d1.slice(-3), ["CHL", "BLB", "FOR"]), "Charlton, Blackburn et Forest, les trois relégués, ferment l'élite");
  dit(S.d2[0] === "SUN" && S.d2[1] === "BRD", "Sunderland champion du dessous, Bradford deuxième");
  for (const c of ["PTV", "BRY", "OXF", "BSC"]) dit(!S.d2.includes(c), c + " écarté, parmi les quatre derniers");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ANG9899[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ANG9899[c].length, 0);
  dit(n1 === 400 && n2 === 360, "760 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 1998");
{
  const T = api.SIEGES_ANG[1998];
  dit(meme(S.euroC1, ["ARS", "MUN"]) && meme(S.euroC2, ["CHE", "NEW"]) && meme(S.euroC3, ["LIV", "LEE", "BLB", "AVL"]), "Arsenal et United en C1, Chelsea et Newcastle en C2, Liverpool, Leeds, Blackburn et Villa en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ANG[1998]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("D. Ginola", "TOT") && note("D. Ginola")[3] >= 87, "Ginola à Tottenham, joueur de l'année PFA et FWA : " + note("D. Ginola")[3]);
  dit(au("N. Anelka", "ARS") && note("N. Anelka")[3] >= 83, "Anelka, meilleur espoir : " + note("N. Anelka")[3]);
  dit(au("D. Yorke", "AVL") && !(api.STARS_ANG9899.MUN || []).some(t => t[0] === "D. Yorke"), "Yorke à Aston Villa au coup d'envoi : il ne signe à United que le 20 août");
  dit(au("J. Stam", "MUN") && au("O. Solskjær", "MUN") && au("T. Sheringham", "MUN"), "Stam, Solskjær et Sheringham à United, les buteurs de Barcelone sous la graphie du jeu");
  dit(au("S. Gerrard", "LIV") && note("S. Gerrard")[4] >= 90 && au("J. Cole", "WHU"), "Gerrard (Liverpool) et Joe Cole (West Ham), formés au club, potentiel " + note("S. Gerrard")[4]);
  const tous = [].concat(...Object.values(api.STARS_ANG9899), ...Object.values(api.STARS_D2_ANG9899));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-Z][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 760, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
}
console.log("\n4) Les remplaçants et les pépites");
{
  for (const [n, c] of [["L. Sharpe", "LEE"], ["J. Wallemme", "COV"], ["N. Gibbs", "WAT"], ["S. Froggatt", "WOL"], ["T. Dellas", "SHU"]]) dit(au(n, c), n + " à " + c + ", présent au coup d'envoi, remplace un homme sans nom libre ou trop âgé");
  for (const [n, c] of [["L. Marshall", "NOR"], ["R. Langley", "QPR"], ["K. Lunt", "CRW"], ["D. Butterfield", "GRI"]]) dit(au(n, c), n + " forcé à " + c + ", formé au club");
  for (const n of ["F. Ljungberg", "D. Domi", "G. McCann"]) dit(!PAR_NOM.has(n), n + " n'est pas au plateau : arrivé après le coup d'envoi");
}
console.log("\n5) Un homme, un nom, d'une saison à l'autre");
{
  for (const [bon, faux] of [["O. Solskjær", "O. G. Solskjaer"], ["S. Bjørnebye", "S. I. Bjørnebye"], ["B. Kvarme", "B. T. Kvarme"]])
    dit(!html.includes('["' + faux + '",'), "« " + faux + " » a disparu des tables : c'est « " + bon + " », comme dans les saisons voisines");
}
console.log("\n6) Une carrière anglaise depuis 1998-99");
{
  api.nouvellePartie("MUN", KEY);
  const G = api.getG();
  dit(G.pays === "ANG" && G.saison === "1998-99" && api.anneeJeu() === 1998, "G.pays = ANG, « 1998-99 », 1998");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 2001, "carrière rendue en 2001-02");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ANG 1998-99 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ANG 1998-99 : TOUT EST VERT");
