/* Harnais de validation — SAISON DE DÉPART ANG 2004-05
   La QUINZIÈME saison anglaise, assemblée par la tâche planifiée sans accès à Transfermarkt.
   `harness-angleterre.cjs` tient le cadre ; ici, les FAITS :
   1) le plateau réel (le Chelsea de Mourinho), 2) les sièges européens de 2004,
   3) les hommes : Terry joueur de l'année PFA, Lampard de la presse, Henry meilleur buteur,
      Andy Johnson et Ellington, Rooney absent (il n'arrive à United qu'après le coup d'envoi)
   4) les corrections du relevé : les arrivées « corrigées en masse » reprises contre le relevé 2003-04,
      deux doublons rendus au club du coup d'envoi, cinq hommes sans nom libre ou trop vieux remplacés,
      « A. Cissé » graphie du jeu, l'ajustement d'Andy Johnson qui ne touche pas son homonyme
   5) une carrière
   Usage : node harness-ang0405.cjs                                                        */
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
  "voitPays,SAISONS,STARS_ANG0405,STARS_D2_ANG0405,D1_ANG0405,D2_ANG0405,SIEGES_ANG,VIVIER_SAISON," +
  "PRENOMS_VRAIS,CLUBS_ANG,STARS_ANG0304,STARS_D2_ANG0304,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ANG-2004-05";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ANG0405)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ANG0405)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;

const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

console.log("1) Le plateau réel de 2004-05");
{
  dit(!!S && S.pays === "ANG" && S.an === 2004 && S.titre === "2004-05", "au registre : ANG, 2004, « 2004-05 »");
  dit(S.nom === "Le verrou de Chelsea", "son nom : « " + S.nom + " »");
  dit(S.d1[0] === "CHE" && S.d1[1] === "ARS" && S.d1[2] === "MUN" && S.d1[3] === "EVE" && S.d1[4] === "LIV", "Chelsea champion, devant Arsenal, Manchester United, Everton et Liverpool");
  dit(meme(S.d1.slice(-3), ["CPL", "NOR", "SOU"]) && S.d1[16] === "WBA", "Crystal Palace, Norwich et Southampton, les trois relégués, ferment l'élite ; West Bromwich, sauvé le dernier jour, dix-septième");
  dit(S.d2[0] === "SUN" && S.d2[1] === "WIG" && S.d2.includes("WHU") && S.d2.includes("PNE"), "Sunderland champion du dessous, Wigan deuxième, West Ham et Preston en barrages");
  for (const c of ["CRW", "GIL", "FOR", "ROT"]) dit(!S.d2.includes(c), c + " écarté (les quatre derniers)");
  dit(S.d2.includes("PLY") && S.d2.includes("QPR") && S.d2.includes("BHA"), "Plymouth, QPR et Brighton, montés de troisième division, au plateau");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ANG0405[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ANG0405[c].length, 0);
  dit(n1 === 400 && n2 === 360, "760 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 2004");
{
  const T = api.SIEGES_ANG[2004];
  dit(meme(S.euroC1, ["ARS", "CHE", "MUN", "LIV"]) && S.euroC2.length === 0 && meme(S.euroC3, ["NEW", "MID", "MIW"]), "Arsenal, Chelsea, United et Liverpool en C1, la C2 vide, Newcastle, Middlesbrough et Millwall en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ANG[2004]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("J. Terry", "CHE") && note("J. Terry")[3] >= 85, "Terry, joueur de l'année PFA : " + note("J. Terry")[3]);
  dit(au("F. Lampard", "CHE") && note("F. Lampard")[3] >= 86, "Lampard, joueur de l'année de la presse : " + note("F. Lampard")[3]);
  dit(au("P. Čech", "CHE") && note("P. Čech")[3] >= 85, "Čech, quinze buts encaissés : " + note("P. Čech")[3]);
  dit(au("D. Drogba", "CHE") && au("A. Robben", "CHE") && au("R. Carvalho", "CHE"), "Drogba, Robben et Carvalho, recrues de l'été, à Chelsea");
  dit(au("T. Henry", "ARS") && note("T. Henry")[3] >= 90, "Henry, meilleur buteur avec vingt-cinq buts : " + note("T. Henry")[3]);
  dit(au("Andy Johnson", "CPL") && note("Andy Johnson")[3] >= 80, "Andy Johnson, vingt et un buts pour Crystal Palace : " + note("Andy Johnson")[3]);
  dit(au("A. Johnson", "WBA") && note("A. Johnson")[3] < 70, "son homonyme de West Bromwich, « A. Johnson », garde sa note : " + note("A. Johnson")[3]);
  dit(au("N. Ellington", "WIG") && note("N. Ellington")[3] >= 75, "Ellington, meilleur buteur du dessous : " + note("N. Ellington")[3]);
  dit(!PAR_NOM.has("W. Rooney") && !PAR_NOM.has("Wayne Rooney"), "Rooney, meilleur espoir, absent : il signe à United après le coup d'envoi, et Everton ne l'a pas à son effectif de la saison");
  dit(au("C. Ronaldo", "MUN") && note("C. Ronaldo")[2] === 19, "Ronaldo à United, dix-neuf ans au jeu (dix-huit en 2003-04)");
  const tous = [].concat(...Object.values(api.STARS_ANG0405), ...Object.values(api.STARS_D2_ANG0405));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-Z][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 760, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
}
console.log("\n4) Les corrections du relevé");
{
  // arrivées « corrigées en masse » : absents de leur club en 2003-04 et moins d'un match sur deux joué
  dit(!PAR_NOM.has("Mido") && !PAR_NOM.has("M. Arteta") && !PAR_NOM.has("W. Pandiani") && !PAR_NOM.has("D. Nugent"),
    "Mido, Arteta, Pandiani et Nugent, arrivés en cours de saison, ne sont pas au plateau");
  dit(au("D. Drogba", "CHE"), "Drogba gardé : le recruteur de l'été 2004 du jeu le met à Chelsea");
  // doublons : l'homme qui joue cette saison pour son club de 2003-04 y était au coup d'envoi
  dit(au("G. Doherty", "TOT") && au("R. Earnshaw", "CAR"), "Doherty à Tottenham et Earnshaw à Cardiff, leurs clubs au coup d'envoi");
  dit(au("P. McVeigh", "NOR") && au("R. Hulse", "WBA") && !PAR_NOM.has("J. Inamoto"), "McVeigh et Hulse comblent Norwich et West Bromwich ; Inamoto laisse sa place à Earnshaw");
  dit(au("I. Turner", "EVE") && au("S. John", "BIR") && au("S. Lynch", "PNE"), "Turner, Stern John et Lynch, au club en 2003-04, remplacent Arteta, Pandiani et Nugent");
  dit(api.STARS_ANG0405.TOT.filter(t => t[1] === "A").length === 3, "Tottenham à trois attaquants : aucun autre n'a de preuve de présence au coup d'envoi");
  dit(au("Kléberson", "MUN") && !PAR_NOM.has("Alan Smith"), "Kléberson remplace Alan Smith, sans nom libre");
  dit(au("A. Blayney", "SOU") && au("K. Lowe", "WOL") && au("P. Canero", "LEI"), "Blayney, Keith Lowe et Canero remplacent Paul Smith, Rob Edwards et Gareth Williams, sans nom libre");
  dit(au("R. Shakes", "BOL") && !PAR_NOM.has("K. Poole") && api.STARS_ANG0405.BOL.filter(t => t[1] === "G").length === 1,
    "Shakes remplace Kevin Poole, 41 ans ; Bolton n'a qu'un gardien, l'autre arrivant en cours de saison");
  dit(au("A. Cissé", "POR") && note("A. Cissé")[2] === 28 && !PAR_NOM.has("Aliou Cissé"), "« A. Cissé », graphie du jeu, à Portsmouth à vingt-huit ans");
}
console.log("\n5) Une carrière anglaise depuis 2004-05");
{
  api.nouvellePartie("CHE", KEY);
  const G = api.getG();
  dit(G.pays === "ANG" && G.saison === "2004-05" && api.anneeJeu() === 2004, "G.pays = ANG, « 2004-05 », 2004");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 2007, "carrière rendue en 2007-08");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ANG 2004-05 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ANG 2004-05 : TOUT EST VERT");
