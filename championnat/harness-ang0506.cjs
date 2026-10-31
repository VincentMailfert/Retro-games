/* Harnais de validation — SAISON DE DÉPART ANG 2005-06
   La SEIZIÈME saison anglaise, assemblée par la tâche planifiée sans accès à Transfermarkt.
   `harness-angleterre.cjs` tient le cadre ; ici, les FAITS :
   1) le plateau réel (Chelsea garde son titre, Reading à cent six points), 2) les sièges européens de 2005,
   3) les hommes : Gerrard joueur de l'année PFA, Henry de la presse et meilleur buteur, Rooney meilleur
      espoir, Darren Bent dix-huit buts pour Charlton
   4) les corrections du relevé : les arrivées non datées reprises contre le relevé 2004-05, Milner rendu à
      Newcastle, le contrôle des minutes, six hommes sans nom libre ou trop vieux remplacés, « A. Cissé »
   5) une carrière
   Usage : node harness-ang0506.cjs                                                        */
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
  "voitPays,SAISONS,STARS_ANG0506,STARS_D2_ANG0506,D1_ANG0506,D2_ANG0506,SIEGES_ANG,VIVIER_SAISON," +
  "PRENOMS_VRAIS,CLUBS_ANG,STARS_ANG0405,STARS_D2_ANG0405,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ANG-2005-06";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ANG0506)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ANG0506)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;

const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

// le même homme la saison d'avant, pour l'âge suivi
const PREC = new Map();
for (const lst of [...Object.values(api.STARS_ANG0405), ...Object.values(api.STARS_D2_ANG0405)]) for (const t of lst) PREC.set(t[0], t);

console.log("1) Le plateau réel de 2005-06");
{
  dit(!!S && S.pays === "ANG" && S.an === 2005 && S.titre === "2005-06", "au registre : ANG, 2005, « 2005-06 »");
  dit(S.nom === "La loi du plus fort", "son nom : « " + S.nom + " »");
  dit(S.d1[0] === "CHE" && S.d1[1] === "MUN" && S.d1[2] === "LIV" && S.d1[3] === "ARS" && S.d1[4] === "TOT", "Chelsea champion, devant Manchester United, Liverpool, Arsenal et Tottenham");
  dit(S.d1[17] === "BIR" && S.d1[18] === "WBA" && S.d1[19] === "SUN", "Birmingham, West Bromwich et Sunderland, les trois relégués, ferment l'élite");
  dit(S.d1.includes("WIG") && S.d1.includes("WHU"), "Wigan, promu pour la première fois, et West Ham, vainqueur des barrages, en élite");
  dit(S.d2[0] === "RDG" && S.d2[1] === "SHU" && S.d2[2] === "WAT" && S.d2.includes("LEE"), "Reading champion du dessous, Sheffield United deuxième, Watford troisième et vainqueur des barrages contre Leeds");
  for (const c of ["QPR", "CRW", "MIW", "BHA"]) dit(!S.d2.includes(c), c + " écarté (les quatre derniers)");
  dit(S.d2.includes("SOU") && S.d2.includes("CPL") && S.d2.includes("NOR"), "Southampton, Crystal Palace et Norwich, relégués en 2005, au dessous");
  dit(S.d2.includes("LUT") && S.d2.includes("HUL"), "Luton et Hull, montés de troisième division, au plateau");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ANG0506[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ANG0506[c].length, 0);
  dit(n1 === 400 && n2 === 360, "760 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 2005");
{
  const T = api.SIEGES_ANG[2005];
  dit(meme(S.euroC1, ["CHE", "ARS", "MUN", "EVE", "LIV"]) && S.euroC2.length === 0 && meme(S.euroC3, ["BOL", "MID"]), "Chelsea, Arsenal, United, Everton et Liverpool (tenant) en C1, la C2 vide, Bolton et Middlesbrough en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ANG[2005]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("S. Gerrard", "LIV") && note("S. Gerrard")[3] >= 88, "Gerrard, joueur de l'année PFA : " + note("S. Gerrard")[3]);
  dit(au("T. Henry", "ARS") && note("T. Henry")[3] >= 90, "Henry, joueur de l'année de la presse et meilleur buteur avec vingt-sept buts : " + note("T. Henry")[3]);
  dit(au("W. Rooney", "MUN") && note("W. Rooney")[3] >= 84 && note("W. Rooney")[4] >= 92, "Rooney, meilleur espoir, à United : " + note("W. Rooney")[3] + "/" + note("W. Rooney")[4]);
  dit(au("D. Bent", "CHL") && note("D. Bent")[3] >= 78, "Darren Bent, dix-huit buts pour Charlton : " + note("D. Bent")[3]);
  dit(au("J. Terry", "CHE") && au("F. Lampard", "CHE") && au("D. Drogba", "CHE") && au("P. Čech", "CHE"), "Terry, Lampard, Drogba et Čech à Chelsea");
  dit(au("C. Ronaldo", "MUN") && note("C. Ronaldo")[2] === 20, "Ronaldo à United, vingt ans au jeu (dix-neuf en 2004-05)");
  const tous = [].concat(...Object.values(api.STARS_ANG0506), ...Object.values(api.STARS_D2_ANG0506));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const ages = [...PAR_NOM.keys()].filter(n => PREC.has(n) && Math.abs(PREC.get(n)[2] + 1 - note(n)[2]) > 0 && PREC.get(n)[1] === note(n)[1]);
  dit(ages.length === 0, "un homme de 2004-05 a un an de plus" + (ages.length ? " — " + ages.slice(0, 8).join(", ") : ""));
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-Z][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 760, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
  dit(![...PAR_NOM.keys()].some(n => /^[A-Z][a-z]+\. /.test(n)), "aucune forme courte à initiale de plusieurs lettres (« St. Davis »…)");
}
console.log("\n4) Les corrections du relevé");
{
  // arrivées non datées : absents de leur club en 2004-05 et peu utilisés, le profil d'une arrivée en cours de saison
  for (const n of ["P. Scharner", "V. Anichebe", "G. Stack", "S. Long", "T. Robinson", "A. Rooney", "R. Reid", "N. Weaver", "L. Best"])
    dit(!PAR_NOM.has(n), n + " n'est pas au plateau (arrivée non datée, absent du club en 2004-05)");
  dit(au("J. Milner", "NEW") && !au("J. Milner", "AVL") && au("N. Solano", "AVL"), "Milner à Newcastle, où il était au coup d'envoi ; Solano à Aston Villa, qu'il ne quitte qu'en cours de saison");
  dit(!PAR_NOM.has("K. Dyer"), "Kieron Dyer, le moins utilisé de Newcastle, laisse sa place à Milner");
  dit(au("James Vaughan", "EVE") && api.STARS_ANG0506.EVE.filter(t => t[1] === "A").length === 4, "James Vaughan, à Everton en 2004-05, rend à Everton son quatrième attaquant");
  dit(au("J. Jenas", "TOT") && au("J. Harley", "BUR") && au("T. Walcott", "SOU"), "Jenas, Harley et Walcott restent où le relevé les met");
  // contrôle des minutes
  dit(au("D. Matteo", "BLB") && au("D. Rommedahl", "CHL") && au("N. Onuoha", "MCI") && au("A. Williams", "COV") && au("C. Woodhouse", "HUL") && au("D. Diallo", "SHW") && au("J. Kenna", "DER") && au("C. Carlisle", "WAT"),
    "le contrôle des minutes remet Matteo, Rommedahl, Onuoha, Ady Williams, Woodhouse, Diallo, Kenna et Carlisle");
  dit(!PAR_NOM.has("G. Rasiak"), "Rasiak, 572 minutes pour Derby, laisse sa place à Kenna");
  dit(api.STARS_D2_ANG0506.WAT.filter(t => t[1] === "G").length === 1 && !PAR_NOM.has("A. Chamberlain"), "Alec Chamberlain, 41 ans, sorti ; Watford n'a qu'un gardien, l'autre arrivant en cours de saison");
  for (const c of ["WAT", "STK", "PLY"]) dit(api.STARS_D2_ANG0506[c].filter(t => t[1] === "A").length === 3, c + " à trois attaquants : aucun autre n'a de preuve de présence au coup d'envoi");
  dit(au("G. Piqué", "MUN") && !PAR_NOM.has("Alan Smith"), "Piqué remplace Alan Smith, sans nom libre");
  dit(au("D. Moore", "WBA") && au("S. Olofinjana", "WOL") && au("A. Blayney", "SOU") && au("P. Gilbert", "LEI"), "Darren Moore, Olofinjana, Blayney et Gilbert remplacent Paul Robinson, Rob Edwards, Paul Smith et Gareth Williams, sans nom libre");
  dit(au("Paul Robinson", "TOT") && note("Paul Robinson")[1] === "G", "le Paul Robinson de Tottenham, gardien, garde son nom");
  dit(au("A. Cissé", "POR") && note("A. Cissé")[2] === 29 && !PAR_NOM.has("Aliou Cissé"), "« A. Cissé », graphie du jeu, à Portsmouth à vingt-neuf ans");
}
console.log("\n5) Une carrière anglaise depuis 2005-06");
{
  api.nouvellePartie("CHE", KEY);
  const G = api.getG();
  dit(G.pays === "ANG" && G.saison === "2005-06" && api.anneeJeu() === 2005, "G.pays = ANG, « 2005-06 », 2005");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 2008, "carrière rendue en 2008-09");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ANG 2005-06 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ANG 2005-06 : TOUT EST VERT");
