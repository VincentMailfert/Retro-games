/* Harnais de validation — SAISON DE DÉPART ANG 1994-95
   La SIXIÈME saison anglaise, et le titre de Blackburn. La première assemblée à partir d'un relevé
   (releves/ANG-1994-95) et non relevée le jour même. `harness-angleterre.cjs` tient le cadre (20+20,
   le mur européen, les libellés, la carrière) ; ici, les FAITS de cette année-là :
   1) le plateau réel : la Premier League ramenée de vingt-deux à vingt (Leicester et Ipswich), l'échelon
      du dessous de vingt-quatre à vingt, et STOKE, ONZIÈME, est écarté faute d'effectif
   2) les sièges européens de 1994 : United en C1, Chelsea ET Arsenal en C2 (Arsenal tenant du titre),
      Blackburn, Newcastle et Aston Villa en C3
   3) les hommes de la saison : Shearer et Sutton à Blackburn, CANTONA ET COLE À UNITED SOUS LA GRAPHIE
      DU JEU (« E. Cantona », « A. Cole »), Klinsmann à Tottenham, et les quatre distinctions
   4) le mur du recruteur : les hommes de `VIVIER_SAISON[1994]` qui jouent en Angleterre portent au
      plateau le nom EXACT du vivier
   5) les homonymes : KEVIN SCOTT n'est pas « K. Scott » (Keith, attaquant, le jeu le porte en 1995-96),
      Craig Fleming n'est pas « C. Fleming » (Curtis, Middlesbrough) ; et les six hommes que Transfermarkt
      perd sur cette saison, repris à la base neilbrown, sont au plateau
   6) les stades de 1994 : Middlesbrough joue encore à Ayresome Park
   7) une carrière, et l'Euro 96 à la deuxième intersaison
   Usage : node harness-ang9495.cjs                                                        */
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
  "voitPays,SAISONS,STARS_ANG9495,STARS_D2_ANG9495,D1_ANG9495,D2_ANG9495,SIEGES_ANG,VIVIER_SAISON," +
  "PRENOMS_VRAIS,CLUBS_ANG,STARS_ANG9394,STARS_D2_ANG9394,STARS_ANG9596,STARS_D2_ANG9596,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ANG-1994-95";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ANG9495)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ANG9495)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;

/* ===== 1) Le plateau réel ===== */
console.log("1) Le plateau réel de 1994-95");
{
  dit(!!S, "la saison est au registre sous la clé « ANG-1994-95 »");
  dit(S.pays === "ANG" && S.an === 1994 && S.titre === "1994-95", "pays ANG, an 1994, créneau « 1994-95 »");
  dit(S.d1[0] === "BLB" && S.d1[1] === "MUN", "Blackburn premier, Manchester United deuxième, à un point");
  dit(!S.d1.includes("LEI") && !S.d1.includes("IPS"), "Leicester et Ipswich, les deux derniers des vingt-deux, s'effacent");
  dit(S.d1.includes("CPL") && S.d1.includes("NOR"), "Crystal Palace et Norwich, relégués mais dix-neuvième et vingtième, restent au plateau");
  dit(S.d2[0] === "MID" && S.d2[1] === "RDG" && S.d2[2] === "BOL", "Middlesbrough champion du dessous, Reading deuxième, Bolton troisième (promu par les barrages)");
  for (const c of ["NTC", "SWI", "PTV", "STK"]) dit(!S.d2.includes(c), `${c} écarté faute d'un effectif de vrais joueurs présents au coup d'envoi`);
  dit(S.d2.includes("GRI"), "Grimsby, que la source perd sur cette seule saison, est au plateau (reconstitué)");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ANG9495[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ANG9495[c].length, 0);
  dit(n1 === 400 && n2 === 360, `760 vrais joueurs (${n1} + ${n2})`);
}

/* ===== 2) Les sièges européens de 1994 ===== */
console.log("\n2) Les sièges européens de 1994");
{
  const T = api.SIEGES_ANG[1994];
  dit(meme(S.euroC1, ["MUN"]), "Manchester United en Coupe des clubs champions");
  dit(meme(S.euroC2, ["CHE", "ARS"]), "Chelsea (finaliste de la FA Cup) et Arsenal (tenant) en Coupe des Coupes");
  dit(meme(S.euroC3, ["BLB", "NEW", "AVL"]), "Blackburn, Newcastle et Aston Villa en Coupe UEFA");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ANG[1994]");
}

/* ===== 3) Les hommes de la saison ===== */
console.log("\n3) Les hommes de la saison");
{
  dit(au("A. Shearer", "BLB") && au("C. Sutton", "BLB") && au("T. Flowers", "BLB"), "Shearer, Sutton et Flowers à Blackburn");
  dit(au("E. Cantona", "MUN") && !PAR_NOM.has("É. Cantona"), "Cantona à United sous la graphie du jeu « E. Cantona » (pas « É. Cantona »)");
  dit(au("A. Cole", "NEW") && !PAR_NOM.has("Andy Cole"), "Andy Cole à Newcastle au coup d'envoi (il ne rejoint United qu'en janvier), sous le nom « A. Cole »");
  dit(au("R. Keane", "MUN") && !PAR_NOM.has("Roy Keane"), "Roy Keane sous le nom « R. Keane », comme en 1993-94");
  dit(au("J. Klinsmann", "TOT"), "Klinsmann à Tottenham");
  const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0] }).t[3];
  dit(note("A. Shearer") >= 88, `Shearer, joueur de l'année PFA et 34 buts : ${note("A. Shearer")}`);
  dit(note("J. Klinsmann") >= 86, `Klinsmann, joueur de l'année de la presse : ${note("J. Klinsmann")}`);
  dit(note("R. Fowler") >= 79, `Fowler, meilleur espoir à dix-neuf ans : ${note("R. Fowler")}`);
  const tous = [].concat(...Object.values(api.STARS_ANG9495), ...Object.values(api.STARS_D2_ANG9495));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes ≤ 90, potentiel ≥ note");
  const moy = l => l.reduce((s, t) => s + t[3], 0) / l.length;
  const m1 = moy([].concat(...Object.values(api.STARS_ANG9495))), m2 = moy([].concat(...Object.values(api.STARS_D2_ANG9495)));
  dit(m1 > 69 && m1 < 72.5 && m2 > 64.5 && m2 < 68, `distribution collée aux saisons voisines (élite ${m1.toFixed(1)}, dessous ${m2.toFixed(1)})`);
}

/* ===== 4) Le mur du recruteur ===== */
console.log("\n4) Le mur du recruteur de l'été 1994");
{
  const liste = api.VIVIER_SAISON[1994] || [];
  dit(liste.length > 0, `VIVIER_SAISON connaît l'été 1994 (${liste.length} hommes)`);
  const anglais = liste.filter(e => /Manchester|Tottenham|Blackburn|Newcastle|Liverpool|Arsenal|Chelsea|Leeds|Aston/.test(e[5]));
  /* Popescu est au vivier sous Tottenham, mais il n'arrive du PSV que le 9 septembre 1994 : au coup
     d'envoi il n'y est pas, et le plateau a raison de ne pas le porter. */
  const ARRIVES_APRES = ["G. Popescu"];
  dit(!PAR_NOM.has("G. Popescu"), "Popescu n'est pas au plateau : arrivé à Tottenham le 9 septembre 1994, après le coup d'envoi");
  const absents = anglais.filter(e => !PAR_NOM.has(e[0]) && !ARRIVES_APRES.includes(e[0]));
  dit(absents.length === 0, `les ${anglais.length} hommes du vivier qui jouent en Angleterre portent au plateau le nom EXACT du vivier`
    + (absents.length ? " — " + absents.map(e => e[0]).join(", ") : ""));
}

/* ===== 5) Les homonymes, et les hommes repris à neilbrown ===== */
console.log("\n5) Les homonymes, et les six hommes que la source perd");
{
  dit(au("Kevin Scott", "TOT") && !PAR_NOM.has("K. Scott"), "Kevin Scott, défenseur de Tottenham, porte son nom entier : « K. Scott » est Keith, l'attaquant");
  const keith = Object.values(api.STARS_D2_ANG9596).flat().find(t => t[0] === "K. Scott");
  dit(keith && keith[1] === "A", "et « K. Scott » reste l'attaquant que le jeu porte en 1995-96");
  dit(au("Craig Fleming", "OLD") && au("C. Fleming", "MID"), "Craig Fleming (Oldham) et C. Fleming (Curtis, Middlesbrough) sont deux hommes");
  for (const [n, c] of [["J. Lambert", "RDG"], ["D. Higgins", "TRM"], ["L. Butler", "BNS"], ["O. Archdeacon", "BNS"], ["B. Atkinson", "SUN"]])
    dit(au(n, c), `${n} à ${c} : absent des pages de la source, au club d'après la base neilbrown`);
  dit(au("P. Cook", "COV"), "Paul Cook à Coventry : arrivé le 18 août, deux jours avant le coup d'envoi de la Premier League");
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-Z][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  const doublons = [...PAR_NOM.keys()].length;
  dit(doublons === 760, `aucun nom court porté par deux hommes du plateau (${doublons} noms distincts)`);
}

/* ===== 6) Les stades de 1994 ===== */
console.log("\n6) Les stades de 1994");
{
  dit(api.metaSaison("MID", 1994).stade === "Ayresome Park", "Middlesbrough joue encore à Ayresome Park (le Riverside ouvre en 1995)");
  dit(api.metaSaison("MIW", 1994).stade === "The New Den", "Millwall au New Den depuis 1993");
  const tous = S.d1.concat(S.d2);
  dit(tous.every(id => api.metaSaison(id, 1994).cap > 0), "chaque club a une capacité");
}

/* ===== 7) Une carrière anglaise depuis 1994-95 ===== */
console.log("\n7) Une carrière anglaise depuis 1994-95");
{
  api.nouvellePartie("BLB", KEY);
  const G = api.getG();
  dit(G.pays === "ANG" && G.saison === "1994-95" && api.anneeJeu() === 1994, "G.pays = ANG, G.saison = « 1994-95 », anneeJeu() = 1994");
  api.voitPays("ANG", 1994);
  dit(api.libDiv(1, 1994) === "Premier League" && api.libDiv(2, 1994) === "Division One", "Premier League et Division One");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  const trop = G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38));
  dit(trop.length === 0, "personne ne dépasse trente-huit ans après trois vieillissements");
  dit(api.anneeJeu() === 1997, `et la carrière est rendue en 1997-98 (${api.anneeJeu()})`);
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ANG 1994-95 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ANG 1994-95 : TOUT EST VERT");
