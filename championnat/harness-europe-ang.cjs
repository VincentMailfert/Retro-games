/* Harnais de validation — LA RÉCONCILIATION EUROPÉENNE (ANG-C, v1.85)
   Troisième étape du lot structure qui précède l'Angleterre. Aucune saison anglaise n'est encore jouable :
   ce qui se vérifie ici, c'est qu'un club du championnat ne peut plus être AUSSI un adversaire de Coupe
   d'Europe, que le tableau garde ses seize clubs quand il en perd, que les sièges anglais sont justes
   saison par saison, et SURTOUT qu'une partie française ne bouge pas d'un cheveu.
   A) la table SIEGES_ANG se tient : vingt saisons, des codes qui existent, des listes disjointes
   B) non-régression française : sur les vingt saisons, le tableau est EXACTEMENT celui d'avant
   C) le plateau quitte le vivier : une saison anglaise d'essai, et les quatre codes partagés s'en vont
   D) la recomplétion : seize clubs, aucun doublon, aucun club du championnat en adversaire
   E) le siège du pays, 1990-91 et son absence de siège en C1 comprises
   F) la ceinture de migre, et retireClubDEurope
   G) et tout cela tient une saison entière jouée pour de vrai
   Usage : node harness-europe-ang.cjs                                                                  */
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</scr" + "ipt>"));

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
global.localStorage = ls; global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0); global.cancelAnimationFrame = (id) => clearTimeout(id);

const epilogue = "\n;return {SIEGES_ANG,SIEGES_PAYS,COMPETS,EUROCLUBS,CLUBS_ANG,CLUBS,CLUBS_D2,SAISONS,SAISON_DEFAUT," +
  "nouvellePartie,jouerJournee,euroInit,vivierEuro,siegePays,viviersEuroDe,plateauDeSaison,plateauEnCours," +
  "retireClubDEurope,retireDEurope,paysEuro,nomEuro,migre,metaSaison,plateauHorsVivier,clubsDuPlateauEnEurope,memePays," +
  "getG:function(){return G;},setG:function(x){G=x;}};";
const api = new Function(script + epilogue)();
const { SIEGES_ANG, SIEGES_PAYS, COMPETS, EUROCLUBS, CLUBS_ANG, SAISONS } = api;

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const CODES_ANG = new Set(CLUBS_ANG.map(c => c.id));
const plateauDe = (S) => new Set((S.d1 || []).concat(S.d2 || []));
const ANS = Object.keys(SIEGES_ANG).map(Number).sort((a, b) => a - b);

/* ===== A) la table des sièges anglais ===== */
console.log("A) SIEGES_ANG : vingt saisons de Coupe d'Europe anglaise, relevées et non devinées");
{
  ok(ANS.length === 20 && ANS[0] === 1990 && ANS[19] === 2009,
    `la table couvre les vingt saisons du chantier, de ${ANS[0]}-91 à ${ANS[19]}-10`);
  const inconnus = [];
  for (const an of ANS) for (const k of ["C1", "C2", "C3"])
    for (const id of SIEGES_ANG[an][k]) if (!CODES_ANG.has(id)) inconnus.push(an + " " + k + " " + id);
  ok(inconnus.length === 0, `tous les codes sont de vrais clubs de CLUBS_ANG${inconnus.length ? " — " + inconnus.join(", ") : ""}`);

  const troisClefs = ANS.every(an => ["C1", "C2", "C3"].every(k => Array.isArray(SIEGES_ANG[an][k])));
  ok(troisClefs, "chaque saison porte ses trois compétitions, même vides");

  // les trois listes d'une saison ne se chevauchent JAMAIS : nouvellePartie lit la compétition d'un club là
  const croise = [];
  for (const an of ANS) {
    const vus = new Set();
    for (const k of ["C1", "C2", "C3"]) for (const id of SIEGES_ANG[an][k]) { if (vus.has(id)) croise.push(an + " " + id); vus.add(id); }
  }
  ok(croise.length === 0, `aucun club n'est listé dans deux compétitions la même saison${croise.length ? " — " + croise.join(", ") : ""}`);

  // le plateau du jeu a vingt places par division : une délégation de plus de huit clubs serait suspecte
  const gros = ANS.filter(an => SIEGES_ANG[an].C1.length + SIEGES_ANG[an].C2.length + SIEGES_ANG[an].C3.length > 9);
  ok(gros.length === 0, `aucune saison n'envoie plus de neuf clubs en Europe${gros.length ? " — " + gros.join(", ") : ""}`);

  // 1990-91 : le retour d'exil après le Heysel, et Liverpool qui purge un an de plus
  ok(SIEGES_ANG[1990].C1.length === 0,
    "1990-91 n'a AUCUN siège en C1 : l'Angleterre rentre d'exil, mais Liverpool purge une année de plus");
  ok(SIEGES_ANG[1990].C2.join() === "MUN" && SIEGES_ANG[1990].C3.join() === "AVL",
    "et ses deux seuls engagés sont Manchester United en Coupe des Coupes et Aston Villa en Coupe UEFA");

  // la Coupe des Coupes meurt en 1999, comme côté français
  const c2Vivants = ANS.filter(an => SIEGES_ANG[an].C2.length > 0);
  ok(c2Vivants.every(an => an <= 1998) && c2Vivants.length === 9,
    `la Coupe des Coupes n'a de siège anglais que jusqu'en 1998-99 (${c2Vivants.length} saisons), après elle n'existe plus`);
  ok(ANS.filter(an => an >= 1999).every(an => SIEGES_ANG[an].C2.length === 0),
    "de 1999-00 à 2009-10, la C2 est vide : la compétition a disparu");

  // quelques faits nommés, chacun relevé sur le tableau de participants de son édition
  const faits = [
    [1991, "C1", "ARS", "Arsenal, champion 90-91, rouvre la C1 anglaise"],
    [1992, "C1", "LEE", "Leeds United, dernier champion de First Division, joue la C1 1992-93"],
    [1995, "C1", "BLB", "Blackburn, champion 94-95 de Jack Walker, joue la C1 1995-96"],
    [1991, "C3", "LIV", "Liverpool retrouve l'Europe en Coupe UEFA 1991-92, un an après les autres"],
    [1993, "C2", "ARS", "Arsenal, vainqueur de la FA Cup 1993, gagnera la Coupe des Coupes 1994"],
    [1997, "C2", "CHE", "Chelsea, vainqueur de la FA Cup 1997, gagnera la Coupe des Coupes 1998"],
    [2004, "C3", "MIW", "Millwall joue la Coupe UEFA 2004-05 en finaliste battu de la FA Cup"],
    [2009, "C3", "FUL", "Fulham entre en Ligue Europa 2009-10 par sa septième place, et ira en finale"],
  ];
  for (const [an, k, id, dit] of faits) ok(SIEGES_ANG[an][k].includes(id), dit);

  // le siège de repli d'un pays
  ok(SIEGES_PAYS.FR === null, "la France n'a pas de table de sièges : elle garde son siège historique (Nantes en C1)");
  ok(SIEGES_PAYS.ANG === SIEGES_ANG[1995],
    "l'Angleterre prend l'époque du vivier, c'est-à-dire la ligne 1995 : Blackburn, Everton, puis Manchester United");
}

/* ===== B) non-régression française : le tableau d'avant, à l'identique ===== */
console.log("\nB) La France ne bouge pas : sur les vingt saisons, le tableau est celui d'avant la v1.85");
{
  const clesFR = Object.keys(SAISONS).filter(k => (SAISONS[k].pays || "FR") === "FR");
  ok(clesFR.length === 20, `les vingt saisons françaises sont au registre (${clesFR.length})`);
  let ecarts = 0, viviersCourts = 0, siegesFaux = 0, sansAjax = [], surDeuxTerrains = [];
  for (const cle of clesFR) {
    const S = SAISONS[cle];
    api.nouvellePartie(S.d1[0], cle);
    const G = api.getG();
    if ((G.europe || []).length !== EUROCLUBS.length) viviersCourts++;
    // LE PIÈGE DU JOUR : « AJA » est l'AC Ajaccio au plateau ET l'Ajax Amsterdam au vivier de C1
    if (plateauDe(S).has("AJA") && !G.europe.some(c => c.id === "AJA" && c.nom.includes("Ajax"))) sansAjax.push(cle);
    // et la réconciliation par le nom, celle qui a de vraies dents : de vrais joueurs des deux côtés
    const cures = new Set();
    for (const c of G.clubs.concat(G.autre)) for (const j of c.joueurs) if (j.reel) cures.add(j.nom);
    for (const c of G.europe) for (const j of c.joueurs) if (j.reel && cures.has(j.nom)) surDeuxTerrains.push(cle + " " + j.nom);
    for (const k of ["C1", "C2", "C3"]) {
      // non qualifié : le vivier entier, puis le siège historique au bout — exactement l'ancien code
      const attendu = COMPETS[k].pool.concat([COMPETS[k].siege]);
      const rendu = api.vivierEuro(k, false);
      if (rendu.join("|") !== attendu.join("|")) ecarts++;
      if (api.siegePays(k) !== COMPETS[k].siege) siegesFaux++;
      // qualifié : le vivier entier, puis VOUS
      const q = api.vivierEuro(k, true);
      if (q.join("|") !== COMPETS[k].pool.concat([G.monClub]).join("|")) ecarts++;
    }
  }
  ok(viviersCourts === 0, `les quarante-cinq clubs du vivier sont là dans les vingt saisons : aucun club français ne s'y recoupe`);
  ok(ecarts === 0, "sur 120 tableaux français, pas un seul n'a changé d'un club ni d'un rang");
  ok(siegesFaux === 0, "et le siège national reste Nantes en C1, le PSG en C2, Bordeaux en C3");
  ok(sansAjax.length === 0,
    `l'Ajax Amsterdam reste au vivier des douze saisons où l'AC Ajaccio joue le championnat, malgré le code « AJA » partagé${sansAjax.length ? " — " + sansAjax.join(", ") : ""}`);
  ok(surDeuxTerrains.length === 0,
    `aucun joueur curé du championnat français ne joue aussi dans un club du vivier${surDeuxTerrains.length ? " — " + surDeuxTerrains.slice(0, 5).join(", ") : ""}`);

  // la recomplétion ne se déclenche jamais : seize clubs pile, quinze du vivier plus un
  api.nouvellePartie(SAISONS[api.SAISON_DEFAUT].d1[0], api.SAISON_DEFAUT);
  const v = api.vivierEuro("C1", false);
  ok(v.length === 16 && new Set(v).size === 16, "le tableau français compte seize clubs distincts");
  ok(v[15] === "NAN" && v.slice(0, 15).join("|") === COMPETS.C1.pool.join("|"),
    "et il se lit dans l'ordre d'avant : le vivier, puis le siège, pour que `melange` tire la même suite de hasards");
}

/* ===== la saison anglaise d'essai =====
   Vingt clubs de Premier League 1995-96 et vingt autres clubs de CLUBS_ANG en deuxième division : un
   PLATEAU D'ESSAI, pas un classement relevé (c'est le travail des vingt saisons anglaises à venir). Il
   contient ce qui compte ici, les quatre codes partagés avec le vivier d'Europe par ANG-B. Les effectifs
   sont procéduraux, exprès : on teste le cadre, pas la donnée. */
const ANG_D1 = ["ARS", "AVL", "BLB", "BOL", "CHE", "COV", "EVE", "LEE", "LIV", "MCI",
  "MUN", "MID", "NEW", "FOR", "QPR", "SHW", "SOU", "TOT", "WHU", "WIM"];
const ANG_D2 = CLUBS_ANG.map(c => c.id).filter(id => !ANG_D1.includes(id)).slice(0, 20);
const PARTAGES = ["BLB", "EVE", "FOR", "LIV"];
const CLE_ANG = "ANG-1995-96";
function ouvreAnglaise(clubId, compet) {
  SAISONS[CLE_ANG] = {
    pays: "ANG", an: 1995, titre: "1995-96", nom: "Essai du harnais",
    d1: ANG_D1, d2: ANG_D2, starsD1: {}, starsD2: {},
    euroC1: SIEGES_ANG[1995].C1, euroC2: SIEGES_ANG[1995].C2, euroC3: SIEGES_ANG[1995].C3,
    sous: "Saison d'essai, retirée aussitôt.",
  };
  api.nouvellePartie(clubId, CLE_ANG);
  const G = api.getG();
  if (compet !== undefined) { G.euroCompet = compet; api.euroInit(); }
  return G;
}
function fermeAnglaise() { delete SAISONS[CLE_ANG]; }

/* ===== C) le plateau quitte le vivier ===== */
console.log("\nC) Un club du championnat n'est plus un adversaire d'Europe");
try {
  const S = { pays: "ANG", d1: ANG_D1, d2: ANG_D2 };
  const vivier = api.viviersEuroDe(S).map(c => c.id);
  ok(vivier.length === EUROCLUBS.length - 4,
    `le vivier anglais perd ses quatre clubs partagés et tombe à ${vivier.length} au lieu de ${EUROCLUBS.length}`);
  ok(PARTAGES.every(id => !vivier.includes(id)),
    "Blackburn, Everton, Nottingham Forest et Liverpool ne sont plus dans le vivier : on ne les affronte plus le mardi ET le samedi");
  ok(vivier.includes("JUV") && vivier.includes("MIL") && vivier.includes("PAR"),
    "tout le reste est là, la Juventus, Milan et Parme compris");

  const G = ouvreAnglaise("ARS", null);
  ok((G.europe || []).length === EUROCLUBS.length - 4, "une carrière anglaise ouvre donc sur un vivier de quarante et un clubs");
  ok(PARTAGES.every(id => !G.europe.some(c => c.id === id)), "et aucun des quatre n'y a de vestiaire");
  const plateau = api.plateauEnCours();
  ok(plateau.size === 40 && ANG_D1.every(id => plateau.has(id)), "le plateau compte bien ses quarante clubs anglais");
  const doublons = G.europe.filter(c => plateau.has(c.id)).map(c => c.id);
  ok(doublons.length === 0, `aucun club du plateau ne traîne dans le vivier${doublons.length ? " — " + doublons.join(", ") : ""}`);

  /* la réconciliation par le NOM tient aussi. On ne compare que les joueurs CURÉS des deux côtés :
     deux jeunes procéduraux peuvent porter le même nom, et c'est toléré depuis harness-euro (c'est déjà
     le cas entre deux clubs français). Le plateau d'essai étant entièrement procédural, le contrôle qui
     a des dents est celui de la section B, sur les vingt saisons françaises et leurs vrais noms. */
  const auChampionnat = new Set();
  for (const c of G.clubs.concat(G.autre)) for (const j of c.joueurs) if (j.reel) auChampionnat.add(j.nom);
  const pareils = [];
  for (const c of G.europe) for (const j of c.joueurs) if (j.reel && auChampionnat.has(j.nom)) pareils.push(j.nom);
  ok(pareils.length === 0, `aucun nom curé ne joue sur deux terrains${pareils.length ? " — " + pareils.slice(0, 5).join(", ") : ""}`);
} finally { fermeAnglaise(); }

/* ===== D) la recomplétion garde les seize ===== */
console.log("\nD) Le tableau garde ses seize clubs, qualifié ou non, dans les trois compétitions");
try {
  for (const compet of ["C1", "C2", "C3"]) {
    for (const [clubId, cible] of [["BLB", compet], ["WIM", null]]) {
      const G = ouvreAnglaise(clubId, cible);
      const quali = G.euroCompet === compet;
      const v = api.vivierEuro(compet, quali);
      const plateau = api.plateauHorsVivier();
      const siege = quali ? G.monClub : api.siegePays(compet);
      const intrus = v.filter(id => plateau.has(id) && id !== siege && !(SIEGES_PAYS.ANG[compet] || []).includes(id));
      ok(v.length === 16, `${compet}, ${quali ? "qualifié" : "non qualifié"} : seize clubs au départ (${v.length})`);
      ok(new Set(v).size === 16, `${compet}, ${quali ? "qualifié" : "non qualifié"} : aucun club deux fois`);
      ok(intrus.length === 0, `${compet}, ${quali ? "qualifié" : "non qualifié"} : seuls les sièges anglais viennent du championnat${intrus.length ? " — " + intrus.join(", ") : ""}`);
      ok(!quali || v[15] === clubId, `${compet}, ${quali ? "qualifié" : "non qualifié"} : votre club ferme la liste quand il est engagé`);
      fermeAnglaise();
    }
  }
  // le tirage lui-même : euroInit doit rendre seize vivants, et tous doivent être des clubs que le jeu sait servir
  for (const compet of ["C1", "C2", "C3"]) {
    const G = ouvreAnglaise("MUN", compet);
    ok(G.euro.vivants.length === 16 && new Set(G.euro.vivants).size === 16,
      `${compet} : le tirage pose seize clubs vivants et distincts`);
    const muets = G.euro.vivants.filter(id => !G.europe.some(c => c.id === id) && !G.clubs.concat(G.autre).some(c => c.id === id));
    ok(muets.length === 0, `${compet} : chacun a un vestiaire, aucun n'est une coquille${muets.length ? " — " + muets.join(", ") : ""}`);
    fermeAnglaise();
  }
  // la recomplétion est DÉTERMINISTE : deux ouvertures de la même saison rendent le même tableau
  const a = (() => { const G = ouvreAnglaise("MUN", "C3"); const r = api.vivierEuro("C3", true).join("|"); fermeAnglaise(); return r; })();
  const b = (() => { const G = ouvreAnglaise("MUN", "C3"); const r = api.vivierEuro("C3", true).join("|"); fermeAnglaise(); return r; })();
  ok(a === b, "la recomplétion ne tire rien au sort : deux ouvertures rendent le même tableau");
} finally { fermeAnglaise(); }

/* ===== E) le siège du pays ===== */
console.log("\nE) Le siège national se lit au pays, et l'Angleterre de 1990 n'en a pas en C1");
try {
  const G = ouvreAnglaise("WIM", null);
  ok(api.siegePays("C1") === "BLB" && api.siegePays("C2") === "EVE",
    "non qualifié, une carrière anglaise voit Blackburn tenir la C1 et Everton la C2, à l'époque du vivier");
  ok(api.siegePays("C3") === "MUN", "et Manchester United la Coupe UEFA");
  fermeAnglaise();

  // votre club ne peut pas être le siège quand il n'est pas qualifié
  const H = ouvreAnglaise("BLB", null);
  ok(!H.euroCompet, "Blackburn, hors des sièges de la saison d'essai, n'est pas qualifié");
  ok(api.siegePays("C1") !== "BLB", "le siège de C1 ne lui revient donc pas : on ne joue pas une coupe à laquelle on n'est pas invité");
  const v = api.vivierEuro("C1", false);
  ok(!v.includes("BLB"), "et son code n'apparaît nulle part dans le tableau");
  ok(v.length === 16, "qui compte quand même ses seize clubs");
  fermeAnglaise();

  // 1990-91 : aucun siège de C1, et le tableau se recomplète entièrement par le vivier
  SAISONS[CLE_ANG] = { pays: "ANG", an: 1990, titre: "1990-91", nom: "Essai du harnais",
    d1: ANG_D1, d2: ANG_D2, starsD1: {}, starsD2: {},
    euroC1: SIEGES_ANG[1990].C1, euroC2: SIEGES_ANG[1990].C2, euroC3: SIEGES_ANG[1990].C3, sous: "Essai." };
  api.nouvellePartie("WIM", CLE_ANG);
  const I = api.getG();
  I.pays = "ANG"; // la table de repli reste celle de 1995 : on ne teste ici que le cas « liste vide »
  const sansSiege = api.vivierEuro.length; // présence de la fonction, pour mémoire
  ok(sansSiege === 2, "vivierEuro prend la compétition et la qualification, rien de plus");
  const vide = { C1: [], C2: [], C3: [] };
  const garde = SIEGES_PAYS.ANG; SIEGES_PAYS.ANG = vide;
  try {
    ok(api.siegePays("C1") === null, "un pays sans engagé en C1 n'a pas de siège, et c'est le cas de l'Angleterre de 1990-91");
    const w = api.vivierEuro("C1", false);
    ok(w.length === 16 && new Set(w).size === 16, "le tableau se recomplète alors entièrement par les viviers, seize clubs distincts");
    const plateau = api.plateauHorsVivier();
    ok(w.every(id => !plateau.has(id)), "et pas un seul club anglais n'y figure : en 1990-91, l'Angleterre regardait la C1 à la télévision");
  } finally { SIEGES_PAYS.ANG = garde; }
} finally { fermeAnglaise(); }

/* ===== F) la ceinture de migre ===== */
console.log("\nF) La ceinture : un club du plateau recollé dans le vivier en ressort au chargement");
try {
  const G = ouvreAnglaise("ARS", "C1");
  const avant = G.europe.length;
  ok(api.retireClubDEurope("JUV") === true && G.europe.length === avant - 1, "retireClubDEurope sort un club du vivier et le dit");
  ok(api.retireClubDEurope("JUV") === false, "et ne ment pas quand il n'y a rien à sortir");
  // on recolle de force les quatre codes partagés, comme le ferait un vieux recollage de vivier
  G.europe.push({ id: "LIV", nom: "Liverpool", joueurs: [] }, { id: "EVE", nom: "Everton", joueurs: [] });
  api.migre();
  const restants = G.europe.filter(c => api.plateauHorsVivier().has(c.id)).map(c => c.id);
  ok(restants.length === 0, `migre nettoie les intrus${restants.length ? " — " + restants.join(", ") : ""}`);
  fermeAnglaise();

  // et la même ceinture ne retire rien à une partie française
  api.nouvellePartie(SAISONS[api.SAISON_DEFAUT].d1[0], api.SAISON_DEFAUT);
  const F = api.getG();
  const n = F.europe.length;
  api.migre();
  ok(F.europe.length === n && n === EUROCLUBS.length,
    `une partie française garde ses ${EUROCLUBS.length} clubs européens au chargement`);
} finally { fermeAnglaise(); }

/* ===== G) une saison anglaise jouée pour de vrai ===== */
console.log("\nG) Trente-huit journées anglaises, Coupe d'Europe comprise");
try {
  const G = ouvreAnglaise("MUN", "C3");
  ok(api.paysEuro("MUN") === "Angleterre", "un club du championnat anglais est annoncé anglais, plus « France » par défaut");
  ok(api.paysEuro("JUV") === "Italie", "et un club du vivier garde son pays");
  let boum = null;
  try { for (let i = 0; i < 38; i++) api.jouerJournee(); } catch (e) { boum = e; }
  ok(!boum, "la saison se joue sans exception" + (boum ? " — " + boum.message : ""));
  ok(G.journee === 38, `les trente-huit journées sont au compteur (${G.journee})`);
  const eu = G.euro;
  ok(!!eu.vainqueur, `la Coupe d'Europe a son vainqueur : ${eu.vainqueur ? api.nomEuro(eu.vainqueur) : "aucun"}`);
  ok(eu.monParcours.length > 0, `et votre club y a joué (${eu.monParcours.length} manche(s))`);
  const plateau = api.plateauHorsVivier();
  const triches = G.europe.filter(c => plateau.has(c.id)).map(c => c.id);
  ok(triches.length === 0, "au bout de la saison, aucun club du plateau n'a reparu dans le vivier");
} finally { fermeAnglaise(); }

console.log("\n" + (FAILS ? "✗ " + FAILS + " ÉCHEC(S)" : "TOUT EST VERT"));
process.exit(FAILS ? 1 : 0);
