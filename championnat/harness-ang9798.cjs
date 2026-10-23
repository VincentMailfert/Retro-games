/* Harnais de validation — SAISON DE DÉPART ANG 1997-98
   La HUITIÈME saison anglaise, assemblée en séance à partir du relevé releves/ANG-1997-98.
   `harness-angleterre.cjs` tient le cadre ; ici, les FAITS de cette année-là :
   1) le plateau réel : Premier League à vingt sans écarté ; l'échelon du dessous perd ses quatre derniers,
      dont MANCHESTER CITY
   2) les sièges européens de 1997 : United et Newcastle en C1, Chelsea en C2, Arsenal, Liverpool,
      Leicester et Aston Villa en C3
   3) les hommes : Bergkamp à Arsenal (joueur de l'année deux fois), Owen à Liverpool (meilleur espoir et
      co-meilleur buteur), « J. F. Hasselbaink » à Leeds, Zola cette fois au plateau
   4) les corrections du relevé : MADDISON À SOUTHAMPTON (il n'arrive à Middlesbrough qu'en octobre),
      Ormerod et Fjørtoft complètent, les quatre pépites vérifiées à l'historique de transferts
   5) l'âge d'Aldridge reste celui du jeu (38 ans, la saison d'avant plus un)
   6) les stades de 1997 : Bolton au Reebok, Derby à Pride Park, Sunderland au Stadium of Light,
      Stoke au Britannia
   7) une carrière
   Usage : node harness-ang9798.cjs                                                        */
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
  "voitPays,SAISONS,STARS_ANG9798,STARS_D2_ANG9798,D1_ANG9798,D2_ANG9798,SIEGES_ANG,VIVIER_SAISON," +
  "PRENOMS_VRAIS,CLUBS_ANG,STARS_ANG9697,STARS_D2_ANG9697,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ANG-1997-98";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ANG9798)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ANG9798)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;

const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

console.log("1) Le plateau réel de 1997-98");
{
  dit(!!S && S.pays === "ANG" && S.an === 1997 && S.titre === "1997-98", "au registre : ANG, 1997, « 1997-98 »");
  dit(S.d1[0] === "ARS" && S.d1[1] === "MUN", "Arsenal champion, Manchester United deuxième à un point");
  dit(meme(S.d1.slice(-3), ["BOL", "BNS", "CPL"]), "Bolton, Barnsley et Crystal Palace, les trois relégués, ferment l'élite");
  dit(S.d2[0] === "FOR" && S.d2[1] === "MID", "Forest champion du dessous, Middlesbrough deuxième");
  for (const c of ["QPR", "MCI", "STK", "RDG"]) dit(!S.d2.includes(c), c + " écarté, parmi les quatre derniers");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ANG9798[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ANG9798[c].length, 0);
  dit(n1 === 400 && n2 === 360, "760 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 1997");
{
  const T = api.SIEGES_ANG[1997];
  dit(meme(S.euroC1, ["MUN", "NEW"]) && meme(S.euroC2, ["CHE"]) && meme(S.euroC3, ["ARS", "LIV", "LEI", "AVL"]), "United et Newcastle en C1, Chelsea en C2, Arsenal, Liverpool, Leicester et Villa en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ANG[1997]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("D. Bergkamp", "ARS") && note("D. Bergkamp")[3] >= 89, "Bergkamp à Arsenal, joueur de l'année PFA et FWA : " + note("D. Bergkamp")[3]);
  dit(au("M. Owen", "LIV") && note("M. Owen")[3] >= 82, "Owen à Liverpool, meilleur espoir et co-meilleur buteur : " + note("M. Owen")[3]);
  dit(au("J. F. Hasselbaink", "LEE"), "« J. F. Hasselbaink » à Leeds, sous la graphie du jeu");
  dit(au("G. Zola", "CHE"), "Zola à Chelsea, au plateau cette fois");
  dit(au("R. Ferdinand", "WHU") && note("R. Ferdinand")[3] >= 74, "Rio Ferdinand titulaire à West Ham, international en novembre : " + note("R. Ferdinand")[3]);
  const tous = [].concat(...Object.values(api.STARS_ANG9798), ...Object.values(api.STARS_D2_ANG9798));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-Z][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 760, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
}
console.log("\n4) Les corrections du relevé");
{
  dit(au("N. Maddison", "SOU") && !(api.STARS_D2_ANG9798.MID || []).some(t => t[0] === "N. Maddison"), "Maddison à Southampton au coup d'envoi, pas à Middlesbrough (il y arrive le 28 octobre)");
  dit(au("A. Ormerod", "MID") && au("J. Å. Fjørtoft", "SHU"), "Ormerod (Middlesbrough) et Fjørtoft (Sheffield United) complètent");
  for (const [n, c] of [["C. Babayaro", "CHE"], ["R. Dunne", "EVE"], ["C. Woodhouse", "SHU"], ["L. Naylor", "WOL"]]) dit(au(n, c), n + " forcé à " + c);
  dit(!PAR_NOM.has("A. Griffin") || !au("A. Griffin", "NEW"), "Andy Griffin n'est pas à Newcastle : il y arrive en janvier 1998");
}
console.log("\n5) L'âge que le jeu connaît");
{
  const a96 = (api.STARS_D2_ANG9697.TRM || []).find(t => t[0] === "J. Aldridge"), a97 = (api.STARS_D2_ANG9798.TRM || []).find(t => t[0] === "J. Aldridge");
  dit(a96 && a97 && a97[2] === a96[2] + 1, "Aldridge vieillit d'un an exactement d'une saison à l'autre (" + (a96 && a96[2]) + " → " + (a97 && a97[2]) + ")");
}
console.log("\n6) Les stades de 1997");
{
  dit(api.metaSaison("BOL", 1997).stade === "Reebok Stadium", "Bolton au Reebok Stadium");
  dit(api.metaSaison("DER", 1997).stade === "Pride Park", "Derby à Pride Park");
  dit(api.metaSaison("SUN", 1997).stade === "Stadium of Light", "Sunderland au Stadium of Light");
  dit(api.metaSaison("STK", 1997).stade === "Britannia Stadium", "Stoke au Britannia Stadium (même écarté du plateau)");
}
console.log("\n7) Une carrière anglaise depuis 1997-98");
{
  api.nouvellePartie("ARS", KEY);
  const G = api.getG();
  dit(G.pays === "ANG" && G.saison === "1997-98" && api.anneeJeu() === 1997, "G.pays = ANG, « 1997-98 », 1997");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 2000, "carrière rendue en 2000-01");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ANG 1997-98 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ANG 1997-98 : TOUT EST VERT");
