/* Harnais de validation — SAISON DE DÉPART ANG 1999-00
   La DIXIÈME saison anglaise, la dernière des années 90 ; assemblée en séance à partir du relevé fait en
   séance (Transfermarkt, arrivées recoupées). `harness-angleterre.cjs` tient le cadre ; ici, les FAITS :
   1) le plateau réel, 2) les sièges européens de 1999 (aucune Coupe des Coupes : elle n'existe plus),
   3) les hommes : Keane joueur de l'année, Phillips et son Soulier d'or, Henry arrivé en août, Kewell
      meilleur espoir, et les pépites (Terry, Carrick, Ledley King)
   4) les noms à particule : « S. Dalla Bona », « R. van der Gouw », et plus aucun « R. V. D. Gouw »
   5) une carrière
   Usage : node harness-ang9900.cjs                                                        */
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
  "voitPays,SAISONS,STARS_ANG9900,STARS_D2_ANG9900,D1_ANG9900,D2_ANG9900,SIEGES_ANG,VIVIER_SAISON," +
  "PRENOMS_VRAIS,CLUBS_ANG,STARS_ANG9899,STARS_D2_ANG9899,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ANG-1999-00";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ANG9900)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ANG9900)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;

const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

console.log("1) Le plateau réel de 1999-00");
{
  dit(!!S && S.pays === "ANG" && S.an === 1999 && S.titre === "1999-00", "au registre : ANG, 1999, « 1999-00 »");
  dit(S.d1[0] === "MUN" && S.d1[1] === "ARS", "Manchester United champion, dix-huit points devant Arsenal");
  dit(meme(S.d1.slice(-3), ["WIM", "SHW", "WAT"]), "Wimbledon, Sheffield Wednesday et Watford, les trois relégués, ferment l'élite");
  dit(S.d2[0] === "CHL" && S.d2[1] === "MCI", "Charlton champion du dessous, Manchester City deuxième (et au plateau, pas écarté comme la première nuit)");
  for (const c of ["SWI", "PTV", "WAL", "WBA"]) dit(!S.d2.includes(c), c + " écarté, parmi les quatre derniers");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ANG9900[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ANG9900[c].length, 0);
  dit(n1 === 400 && n2 === 360, "760 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 1999");
{
  const T = api.SIEGES_ANG[1999];
  dit(meme(S.euroC1, ["MUN", "ARS", "CHE"]) && S.euroC2.length === 0 && meme(S.euroC3, ["LEE", "TOT", "NEW", "WHU"]), "United, Arsenal et Chelsea en C1, la C2 vide, Leeds, Tottenham, Newcastle et West Ham en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ANG[1999]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("R. Keane", "MUN") && note("R. Keane")[3] >= 88, "Keane, joueur de l'année PFA et FWA : " + note("R. Keane")[3]);
  dit(au("K. Phillips", "SUN") && note("K. Phillips")[3] >= 83, "Phillips à Sunderland, trente buts et le Soulier d'or : " + note("K. Phillips")[3]);
  dit(au("T. Henry", "ARS") && note("T. Henry")[4] >= 90, "Henry à Arsenal, arrivé de la Juventus en août, potentiel " + note("T. Henry")[4]);
  dit(au("H. Kewell", "LEE") && note("H. Kewell")[3] >= 82, "Kewell, meilleur espoir : " + note("H. Kewell")[3]);
  dit(au("J. Terry", "CHE") && au("M. Carrick", "WHU") && au("L. King", "TOT"), "Terry (Chelsea), Carrick (West Ham) et Ledley King (Tottenham), formés au club");
  const tous = [].concat(...Object.values(api.STARS_ANG9900), ...Object.values(api.STARS_D2_ANG9900));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-Z][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 760, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
}
console.log("\n4) Les noms à particule");
{
  dit(au("S. Dalla Bona", "CHE") && !PAR_NOM.has("S. Bona") && !PAR_NOM.has("S. D. Bona"), "« S. Dalla Bona » à Chelsea, la particule gardée entière");
  dit(au("R. van der Gouw", "MUN"), "« R. van der Gouw » à United");
  for (const faux of ["R. V. D. Gouw", "L. T. Heuvel", "J. V. Blerk"]) dit(!html.includes('["' + faux + '",'), "« " + faux + " » a disparu des saisons déjà livrées");
}
console.log("\n5) Une carrière anglaise depuis 1999-00");
{
  api.nouvellePartie("SUN", KEY);
  const G = api.getG();
  dit(G.pays === "ANG" && G.saison === "1999-00" && api.anneeJeu() === 1999, "G.pays = ANG, « 1999-00 », 1999");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 2002, "carrière rendue en 2002-03");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ANG 1999-00 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ANG 1999-00 : TOUT EST VERT");
