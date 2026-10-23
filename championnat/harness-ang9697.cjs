/* Harnais de validation — SAISON DE DÉPART ANG 1996-97
   La SEPTIÈME saison anglaise, assemblée en séance à partir du relevé releves/ANG-1996-97.
   `harness-angleterre.cjs` tient le cadre ; ici, les FAITS de cette année-là :
   1) le plateau réel : Premier League à vingt sans écarté, l'échelon du dessous perd ses quatre derniers
   2) les sièges européens de 1996 : United en C1, Liverpool en C2, Newcastle, Aston Villa et Arsenal en C3
   3) les hommes : SHEARER À NEWCASTLE (record du monde de l'été), Cantona à United pour sa dernière saison,
      Solskjær sous la graphie du jeu, ZOLA ABSENT (arrivé en novembre), Owen, Carragher et Lampard forcés
   4) le mur du recruteur de l'été 1996
   5) les prénoms composés à initiales (J. Å. Fjørtoft, L. E. Andersen, L. O. Sigurdsson)
   6) les stades de 1996 : Middlesbrough au Riverside, Derby, Bolton, Sunderland et Stoke encore dans leurs vieux stades
   7) une carrière
   Usage : node harness-ang9697.cjs                                                        */
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
  "voitPays,SAISONS,STARS_ANG9697,STARS_D2_ANG9697,D1_ANG9697,D2_ANG9697,SIEGES_ANG,VIVIER_SAISON," +
  "PRENOMS_VRAIS,CLUBS_ANG,STARS_ANG9596,STARS_D2_ANG9596,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ANG-1996-97";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ANG9697)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ANG9697)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;

const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

console.log("1) Le plateau réel de 1996-97");
{
  dit(!!S && S.pays === "ANG" && S.an === 1996 && S.titre === "1996-97", "au registre : ANG, 1996, « 1996-97 »");
  dit(S.d1[0] === "MUN" && S.d1[1] === "NEW", "Manchester United champion, Newcastle deuxième");
  dit(meme(S.d1.slice(-3), ["SUN", "MID", "FOR"]), "Sunderland, Middlesbrough et Forest, les trois relégués, ferment l'élite");
  dit(S.d2[0] === "BOL" && S.d2[1] === "BNS", "Bolton champion du dessous, Barnsley deuxième, promu pour la première fois");
  for (const c of ["BRD", "GRI", "OLD", "SND"]) dit(!S.d2.includes(c), c + " écarté, parmi les quatre derniers");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ANG9697[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ANG9697[c].length, 0);
  dit(n1 === 400 && n2 === 360, "760 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 1996");
{
  const T = api.SIEGES_ANG[1996];
  dit(meme(S.euroC1, ["MUN"]) && meme(S.euroC2, ["LIV"]) && meme(S.euroC3, ["NEW", "AVL", "ARS"]), "United en C1, Liverpool en C2, Newcastle, Villa et Arsenal en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ANG[1996]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("A. Shearer", "NEW") && !(api.STARS_ANG9697.BLB || []).some(t => t[0] === "A. Shearer"), "Shearer à Newcastle, plus à Blackburn");
  dit(note("A. Shearer")[3] >= 89, "Shearer, joueur de l'année PFA et meilleur buteur : " + note("A. Shearer")[3]);
  dit(au("E. Cantona", "MUN") && au("O. Solskjær", "MUN") && !PAR_NOM.has("O. Solskjaer"), "Cantona et « O. Solskjær » à United, sous la graphie du jeu");
  dit(note("D. Beckham")[3] >= 80, "Beckham, meilleur espoir : " + note("D. Beckham")[3]);
  dit(!PAR_NOM.has("G. Zola"), "Zola n'est pas au plateau : arrivé de Parme en novembre, après le coup d'envoi");
  dit(au("M. Owen", "LIV") && note("M. Owen")[4] >= 90, "Michael Owen à Liverpool à dix-sept ans, potentiel " + note("M. Owen")[4]);
  dit(au("J. Carragher", "LIV") && au("F. Lampard", "WHU"), "Carragher à Liverpool et Lampard à West Ham, formés au club");
  dit(au("Juninho Paulista", "MID") && au("F. Ravanelli", "MID"), "Juninho et Ravanelli à Middlesbrough, sous les noms du recruteur");
  const tous = [].concat(...Object.values(api.STARS_ANG9697), ...Object.values(api.STARS_D2_ANG9697));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
}
console.log("\n4) Le mur du recruteur de l'été 1996");
{
  const liste = api.VIVIER_SAISON[1996] || [];
  const anglais = liste.filter(e => /Manchester|Tottenham|Blackburn|Newcastle|Liverpool|Arsenal|Chelsea|Leeds|Aston|Middlesbrough/.test(e[5]));
  const absents = anglais.filter(e => !PAR_NOM.has(e[0]));
  dit(anglais.length > 0 && absents.length === 0, "les " + anglais.length + " hommes du vivier qui jouent en Angleterre portent au plateau le nom EXACT du vivier" + (absents.length ? " — " + absents.map(e => e[0]).join(", ") : ""));
}
console.log("\n5) Les prénoms composés");
{
  for (const [n, c] of [["J. Å. Fjørtoft", "MID"], ["L. E. Andersen", "CPL"], ["L. O. Sigurdsson", "STK"]]) dit(au(n, c), n + " à " + c + ", une initiale par prénom comme en 1995-96");
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-Z][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 760, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
}
console.log("\n6) Les stades de 1996");
{
  dit(api.metaSaison("MID", 1996).stade === "Riverside Stadium", "Middlesbrough au Riverside depuis 1995");
  dit(api.metaSaison("DER", 1996).stade !== "Pride Park" && api.metaSaison("SUN", 1996).stade !== "Stadium of Light", "Derby et Sunderland encore dans leurs vieux stades (1997)");
  dit(api.metaSaison("BOL", 1996).stade !== "Reebok Stadium" && api.metaSaison("STK", 1996).stade !== "Britannia Stadium", "Bolton et Stoke aussi");
}
console.log("\n7) Une carrière anglaise depuis 1996-97");
{
  api.nouvellePartie("NEW", KEY);
  const G = api.getG();
  dit(G.pays === "ANG" && G.saison === "1996-97" && api.anneeJeu() === 1996, "G.pays = ANG, « 1996-97 », 1996");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 1999, "carrière rendue en 1999-00");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ANG 1996-97 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ANG 1996-97 : TOUT EST VERT");
