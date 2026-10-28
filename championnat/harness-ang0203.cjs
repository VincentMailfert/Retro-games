/* Harnais de validation — SAISON DE DÉPART ANG 2002-03
   La TREIZIÈME saison anglaise, assemblée par la tâche planifiée sans accès à Transfermarkt.
   `harness-angleterre.cjs` tient le cadre ; ici, les FAITS :
   1) le plateau réel, 2) les sièges européens de 2002,
   3) les hommes : van Nistelrooy meilleur buteur, Henry joueur de l'année PFA et FWA, Jenas
      meilleur espoir, Beattie vingt-trois buts, Rooney à seize ans
   4) les corrections du relevé : les pépites et les arrivées sans preuve dehors, les titulaires
      laissés dehors remis, les cinq hommes sans nom libre remplacés, « A. Cissé » graphie du jeu
   5) une carrière
   Usage : node harness-ang0203.cjs                                                        */
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
  "voitPays,SAISONS,STARS_ANG0203,STARS_D2_ANG0203,D1_ANG0203,D2_ANG0203,SIEGES_ANG,VIVIER_SAISON," +
  "PRENOMS_VRAIS,CLUBS_ANG,STARS_ANG0102,STARS_D2_ANG0102,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ANG-2002-03";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ANG0203)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ANG0203)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;

const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

console.log("1) Le plateau réel de 2002-03");
{
  dit(!!S && S.pays === "ANG" && S.an === 2002 && S.titre === "2002-03", "au registre : ANG, 2002, « 2002-03 »");
  dit(S.nom === "Le gamin d'Everton", "son nom : « " + S.nom + " »");
  dit(S.d1[0] === "MUN" && S.d1[1] === "ARS" && S.d1[2] === "NEW" && S.d1[3] === "CHE", "Manchester United champion, devant Arsenal, Newcastle et Chelsea");
  dit(meme(S.d1.slice(-3), ["WHU", "WBA", "SUN"]), "West Ham, West Bromwich et Sunderland, les trois relégués, ferment l'élite");
  dit(S.d2[0] === "POR" && S.d2[1] === "LEI" && S.d2.includes("WOL"), "Portsmouth champion du dessous, Leicester deuxième, Wolverhampton vainqueur des barrages");
  for (const c of ["STK", "SHW", "BHA", "GRI"]) dit(!S.d2.includes(c), c + " écarté, parmi les quatre derniers");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ANG0203[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ANG0203[c].length, 0);
  dit(n1 === 400 && n2 === 360, "760 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 2002");
{
  const T = api.SIEGES_ANG[2002];
  dit(meme(S.euroC1, ["ARS", "LIV", "MUN", "NEW"]) && S.euroC2.length === 0 && meme(S.euroC3, ["LEE", "CHE", "BLB", "FUL", "IPS"]), "Arsenal, Liverpool, United et Newcastle en C1, la C2 vide, Leeds, Chelsea, Blackburn, Fulham et Ipswich en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ANG[2002]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("R. van Nistelrooy", "MUN") && note("R. van Nistelrooy")[3] >= 89, "van Nistelrooy, meilleur buteur (vingt-cinq) : " + note("R. van Nistelrooy")[3]);
  dit(au("T. Henry", "ARS") && note("T. Henry")[3] >= 90, "Henry, joueur de l'année PFA et FWA : " + note("T. Henry")[3]);
  dit(au("J. Jenas", "NEW") && note("J. Jenas")[3] >= 78 && note("J. Jenas")[4] >= 88, "Jenas, meilleur espoir : " + note("J. Jenas")[3] + "/" + note("J. Jenas")[4]);
  dit(au("J. Beattie", "SOU") && note("J. Beattie")[3] >= 81, "Beattie, vingt-trois buts pour Southampton : " + note("J. Beattie")[3]);
  dit(au("W. Rooney", "EVE") && note("W. Rooney")[2] === 17 && note("W. Rooney")[4] >= 92, "Rooney à Everton, dix-sept ans au jeu, potentiel " + note("W. Rooney")[4]);
  dit(au("R. Pirès", "ARS"), "Pirès, buteur de la finale de la FA Cup, à Arsenal");
  dit(au("G. Zola", "CHE") && note("G. Zola")[3] >= 79, "Zola, quatorze buts pour sa dernière saison à Chelsea : " + note("G. Zola")[3]);
  const tous = [].concat(...Object.values(api.STARS_ANG0203), ...Object.values(api.STARS_D2_ANG0203));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-Z][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 760, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
}
console.log("\n4) Les corrections du relevé");
{
  // pépites forcées par le relevé et arrivées non datées : sans historique de transferts, elles ne se prouvent pas
  dit(!PAR_NOM.has("S. Warnock") && !PAR_NOM.has("Stephen Warnock") && !PAR_NOM.has("M. Sadler"), "Warnock et Sadler, pépites forcées par le relevé sans preuve, ne sont pas au plateau");
  dit(!PAR_NOM.has("Doriva") && !au("P. Ritchie", "POR"), "Doriva (Middlesbrough) et Paul Ritchie (Portsmouth), sans preuve de présence au coup d'envoi, n'y sont pas");
  // les titulaires que le relevé laissait dehors, arrivés avant le coup d'envoi
  const remis = [["Q. Fortune", "MUN"], ["A. Pistone", "EVE"], ["G. Doherty", "TOT"], ["P. Womé", "FUL"], ["S. Minto", "WHU"], ["C. Doig", "FOR"],
    ["P. Heckingbottom", "NOR"], ["L. Johnson", "GIL"], ["T. Mears", "PNE"], ["P. Vernazza", "WAT"], ["G. Mahon", "WAT"],
    ["M. Babbel", "LIV"], ["M. Johnson", "BIR"], ["L. Wilkshire", "MID"], ["C. Robinson", "POR"]];
  const manquent = remis.filter(([n, c]) => !au(n, c));
  dit(manquent.length === 0, "les quinze hommes remis à leur club" + (manquent.length ? " — manquent " + manquent.map(x => x[0]).join(", ") : ""));
  dit(au("S. McPhail", "LEE") && au("M. Heath", "LEI") && au("Gary Jones", "FOR") && au("R. Bull", "MIW") && au("J. Norville", "WAT"),
    "McPhail, Heath, Gary Jones, Bull et Norville remplacent Alan Smith, Tommy Wright, Gareth Williams et les deux Paul Robinson, sans nom libre");
  dit(au("A. Cissé", "BIR") && note("A. Cissé")[2] === 26 && !PAR_NOM.has("Aliou Cissé"), "« A. Cissé », graphie du jeu (Montpellier 2001-02, vingt-cinq ans), à Birmingham à vingt-six ans");
  dit(au("Michael Svensson", "SOU") && au("Mathias Svensson", "CHL"), "les deux Svensson, Michael (Southampton) et Mathias (Charlton), distingués");
}
console.log("\n5) Une carrière anglaise depuis 2002-03");
{
  api.nouvellePartie("MUN", KEY);
  const G = api.getG();
  dit(G.pays === "ANG" && G.saison === "2002-03" && api.anneeJeu() === 2002, "G.pays = ANG, « 2002-03 », 2002");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 2005, "carrière rendue en 2005-06");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ANG 2002-03 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ANG 2002-03 : TOUT EST VERT");
