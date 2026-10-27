/* Harnais de validation — SAISON DE DÉPART ANG 2001-02
   La DOUZIÈME saison anglaise, assemblée par la tâche planifiée sans accès à Transfermarkt.
   `harness-angleterre.cjs` tient le cadre ; ici, les FAITS :
   1) le plateau réel, 2) les sièges européens de 2001,
   3) les hommes : Henry meilleur buteur, Pirès et van Nistelrooy joueurs de l'année, Bellamy
      meilleur espoir, Fowler encore à Liverpool au coup d'envoi
   4) les corrections du relevé : Preston refait avec les hommes prouvés au club de part et d'autre,
      Dickov et Carbone (arrivés en cours de saison) dehors, les quatre hommes sans nom libre remplacés
   5) une carrière
   Usage : node harness-ang0102.cjs                                                        */
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
  "voitPays,SAISONS,STARS_ANG0102,STARS_D2_ANG0102,D1_ANG0102,D2_ANG0102,SIEGES_ANG,VIVIER_SAISON," +
  "PRENOMS_VRAIS,CLUBS_ANG,STARS_ANG0001,STARS_D2_ANG0001,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ANG-2001-02";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ANG0102)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ANG0102)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;

const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

console.log("1) Le plateau réel de 2001-02");
{
  dit(!!S && S.pays === "ANG" && S.an === 2001 && S.titre === "2001-02", "au registre : ANG, 2001, « 2001-02 »");
  dit(S.nom === "Wiltord éteint Old Trafford", "son nom : « " + S.nom + " »");
  dit(S.d1[0] === "ARS" && S.d1[1] === "LIV" && S.d1[2] === "MUN" && S.d1[3] === "NEW", "Arsenal champion, devant Liverpool, Manchester United et Newcastle");
  dit(meme(S.d1.slice(-3), ["IPS", "DER", "LEI"]), "Ipswich, Derby et Leicester, les trois relégués, ferment l'élite");
  dit(S.d2[0] === "MCI" && S.d2[1] === "WBA" && S.d2.includes("BIR"), "Manchester City champion du dessous, West Bromwich deuxième, Birmingham vainqueur des barrages");
  for (const c of ["ROT", "CRW", "BNS", "SKP"]) dit(!S.d2.includes(c), c + " écarté, parmi les quatre derniers");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ANG0102[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ANG0102[c].length, 0);
  dit(n1 === 400 && n2 === 360, "760 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 2001");
{
  const T = api.SIEGES_ANG[2001];
  dit(meme(S.euroC1, ["MUN", "ARS", "LIV"]) && S.euroC2.length === 0 && meme(S.euroC3, ["LEE", "IPS", "CHE", "AVL"]), "United, Arsenal et Liverpool en C1, la C2 vide, Leeds, Ipswich, Chelsea et Aston Villa en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ANG[2001]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("T. Henry", "ARS") && note("T. Henry")[3] >= 90, "Henry, meilleur buteur (vingt-quatre) : " + note("T. Henry")[3]);
  dit(au("R. Pirès", "ARS") && note("R. Pirès")[3] >= 87, "Pirès, joueur de l'année FWA : " + note("R. Pirès")[3]);
  dit(au("R. van Nistelrooy", "MUN") && note("R. van Nistelrooy")[3] >= 88, "van Nistelrooy, joueur de l'année PFA : " + note("R. van Nistelrooy")[3]);
  dit(au("C. Bellamy", "NEW") && note("C. Bellamy")[3] >= 80 && note("C. Bellamy")[4] >= 86, "Bellamy, meilleur espoir : " + note("C. Bellamy")[3] + "/" + note("C. Bellamy")[4]);
  dit(au("S. Wiltord", "ARS") && au("R. Parlour", "ARS") && au("F. Ljungberg", "ARS"), "Wiltord, Parlour et Ljungberg, les buteurs du doublé, à Arsenal");
  dit(au("R. Fowler", "LIV"), "Fowler à Liverpool : il ne rejoint Leeds qu'en novembre");
  dit(au("S. Campbell", "ARS"), "Sol Campbell à Arsenal, arrivé de Tottenham pendant l'été");
  const tous = [].concat(...Object.values(api.STARS_ANG0102), ...Object.values(api.STARS_D2_ANG0102));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-Z][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 760, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
}
console.log("\n4) Les corrections du relevé");
{
  // Preston : le relevé l'avait reconstitué de Wikipedia ; ne restent que des hommes prouvés au club de part et d'autre
  for (const n of ["D. Lucas", "G. Alexander", "J. Macken", "P. McKenna", "C. Murdock", "Mike Jackson", "I. Anderson"]) dit(au(n, "PNE"), n + " à Preston");
  const ed = PAR_NOM.get("R. Edwards");
  dit(au("R. Edwards", "PNE") && ed.t[2] === 28, "R. Edwards, le défenseur né en 1973 (vingt-huit ans), et non l'homonyme né en 1982");
  dit(!PAR_NOM.has("Michael Jackson"), "« Mike Jackson », graphie du jeu, et pas un second nom pour le même homme");
  dit(au("D. Etuhu", "MCI"), "Etuhu à Manchester City, où il était au coup d'envoi (Preston l'a en cours de saison)");
  for (const n of ["K. Gallacher", "C. Wijnhard", "D. Healy", "C. Lucketti", "G. Ainsworth"]) dit(!au(n, "PNE"), n + " n'est pas à Preston au coup d'envoi");
  dit(api.STARS_D2_ANG0102.PNE.filter(t => t[1] === "A").length >= 4, "Preston garde quatre attaquants (Anderson, attaquant au relevé 2000-01)");
  dit(!PAR_NOM.has("P. Dickov") && !PAR_NOM.has("B. Carbone"), "Dickov (Leicester, février) et Carbone (Derby, prêt d'octobre), arrivés en cours de saison, ne sont pas au plateau");
  dit(au("A. Gunnlaugsson", "LEI") && au("A. Murray", "DER"), "Gunnlaugsson (Leicester) et Murray (Derby), au club la saison d'avant, les remplacent");
  dit(au("J. Burns", "LEE") && au("P. Furlong", "BIR") && au("J. Panayi", "WAT") && au("Gary Jones", "FOR"), "Burns, Furlong, Panayi et Gary Jones remplacent Alan Smith, Marcelo, Paul Robinson et Gareth Williams, sans nom libre");
}
console.log("\n5) Une carrière anglaise depuis 2001-02");
{
  api.nouvellePartie("PNE", KEY);
  const G = api.getG();
  dit(G.pays === "ANG" && G.saison === "2001-02" && api.anneeJeu() === 2001, "G.pays = ANG, « 2001-02 », 2001");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 2004, "carrière rendue en 2004-05");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ANG 2001-02 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ANG 2001-02 : TOUT EST VERT");
