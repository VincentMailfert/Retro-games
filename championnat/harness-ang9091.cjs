/* Harnais de validation — SAISON DE DÉPART ANG 1990-91
   La DEUXIÈME saison anglaise, et la plus ancienne du pays. `harness-angleterre.cjs` tient
   déjà le cadre (20+20, le mur européen, les libellés d'époque, la carrière) et il balaie
   toutes les saisons `pays:"ANG"` ; il ne vérifie pas, et c'est voulu, les FAITS de cette
   année-là. C'est le travail d'ici :
   1) le plateau est le vrai : la First Division à vingt, l'échelon du dessous ramené de
      vingt-quatre à vingt, et les quatre écartés bien dehors — dont DEUX qui ne sont pas
      les derniers du classement, écartés sur la pauvreté de la source (Saint-Seurin)
   2) les sièges européens de 1990-91 : AUCUN en Coupe des clubs champions, et ce n'est pas
      un oubli — les Anglais rentrent d'exil, mais Liverpool purge une année de plus
   3) les hommes de la saison : les vedettes à leur club et à leur valeur, les distinctions
      de l'année, les pépites forcées, les deux bouts de l'échelle des âges
   4) LE MUR DU RECRUTEUR : les six hommes que `VIVIER_SAISON[1990]` chiffre et qui jouent le
      championnat anglais ne doivent JAMAIS être proposés par le recruteur
   5) les homonymes sont distincts, et aucun prénom ne ment
   6) les stades de 1990 : Charlton à Selhurst Park, Wimbledon à Plough Lane, personne dans
      un stade qui n'ouvre que plus tard
   7) une carrière, et la bascule vers la Premier League à la troisième saison
   Usage : node harness-ang9091.cjs                                                        */
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
  "voitPays,SAISONS,STARS_ANG9091,STARS_D2_ANG9091,D1_ANG9091,D2_ANG9091,SIEGES_ANG,VIVIER_SAISON," +
  "PRENOMS_VRAIS,CLUBS_ANG,vivierEuro,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ANG-1990-91";
const S = api.SAISONS[KEY];

/* ===== 1) Le plateau réel de 1990-91 ===== */
console.log("1) Le plateau : vingt clubs à l'élite, vingt repris sur vingt-quatre en dessous");
{
  if (!S) fail("saison " + KEY + " absente du registre");
  else {
    /* La First Division 1990-91, dans l'ordre du classement final. Elle avait ses VINGT
       clubs : aucun repêchage. Arsenal champion malgré deux points de pénalité, et avec
       une seule défaite en trente-huit journées. */
    const ELITE = ["ARS","LIV","CPL","LEE","MCI","MUN","WIM","FOR","EVE","TOT",
                   "CHE","QPR","SHU","SOU","NOR","COV","AVL","LUT","SUN","DER"];
    /* L'échelon du dessous en comptait VINGT-QUATRE, donc quatre s'effacent — mais ce ne
       sont PAS les quatre derniers, et c'est le fait du jour. Deux le sont bien (West
       Bromwich Albion 23e et Hull City 24e, les deux relégués) ; les deux autres tombent
       sur la jurisprudence Saint-Seurin, parce que Transfermarkt ne leur connaît pas de
       quoi tenir dix-huit places : Brighton (6e, dix-sept joueurs) et Bristol Rovers
       (13e, quinze). ET LES REPÊCHÉS NE SONT PAS LES PREMIERS VENUS : Swindon (21e) et
       Leicester (22e), qui auraient dû entrer par le classement, auraient pris leur
       dix-huitième homme à Crystal Palace et à Notts County — Paul Bodin et Alan Paris,
       transférés en cours de saison, comptent pour le club où ils ont le plus joué. Les
       deux clubs du plateau seraient tombés sous leur quota, ce que la règle « aucun
       joueur inventé » interdit de combler. D'où West Brom et Hull, qui ne coûtent rien
       à personne. Règle neuve : un club n'entre au plateau que si son entrée ne laisse
       pas un autre club du plateau à court. */
    const DESSOUS = ["OLD","WHU","SHW","NTC","MIW","MID","BNS","BSC","OXF","NEW",
                     "WOL","IPS","PTV","CHL","POR","PLY","BLB","WAT","WBA","HUL"];
    const ECARTES = ["BHA","BSR","SWI","LEI"];

    dit(S.d1.length === 20, "la First Division aligne 20 clubs (" + S.d1.length + ")");
    dit(S.d2.length === 20, "la Second Division aligne 20 clubs (" + S.d2.length + ")");
    dit(S.d1.join(",") === ELITE.join(","),
      "l'élite est exactement le classement réel de 1990-91, dans l'ordre");
    dit(S.d2.join(",") === DESSOUS.join(","),
      "l'échelon du dessous est le classement réel moins Brighton et Bristol Rovers, plus West Brom et Hull");
    const tous = new Set(S.d1.concat(S.d2));
    const intrus = ECARTES.filter(c => tous.has(c));
    dit(intrus.length === 0,
      "les quatre écartés sont dehors (Brighton, Bristol Rovers, Swindon, Leicester)"
      + (intrus.length ? " — mais on trouve " + intrus.join(", ") : ""));
    /* Les écartés gardent leur fiche : on les a laissés de côté pour cette saison, on ne
       les a pas effacés du pays — Leicester et Swindon joueront d'autres années. */
    const sansFiche = ECARTES.filter(c => !api.CLUBS_ANG.some(x => x.id === c));
    dit(sansFiche.length === 0,
      "les quatre écartés gardent leur fiche dans CLUBS_ANG, pour les autres saisons"
      + (sansFiche.length ? " — manquent " + sansFiche.join(", ") : ""));
    /* Et la raison des deux écarts de pauvreté se vérifie à l'envers : les deux repêchés
       doivent, eux, tenir leurs dix-huit hommes sans aide. */
    const maigres = ["WBA", "HUL"].filter(id => (S.starsD2[id] || []).length < 18);
    dit(maigres.length === 0, "les deux repêchés tiennent leurs dix-huit hommes"
      + (maigres.length ? " — " + maigres.join(", ") : ""));
    dit(S.pays === "ANG" && S.an === 1990 && S.titre === "1990-91",
      "le registre dit pays ANG, année 1990, créneau « 1990-91 »");
    dit(S.starsD1 === api.STARS_ANG9091 && S.starsD2 === api.STARS_D2_ANG9091,
      "la saison pointe sur ses deux tables d'effectifs");
    /* Avant 1992, l'élite s'appelle First Division : c'est le détail d'époque d'ANG-A, et
       cette saison est la première du jeu à le montrer sur de la vraie donnée. */
    api.voitPays("ANG", 1990, false);
    dit(api.libDiv(1, 1990) === "First Division" && api.libDiv(2, 1990) === "Second Division",
      "en 1990 les deux divisions s'appellent First Division et Second Division");
    api.voitPays("FR", 1995, false);
  }
}

/* ===== 2) Les sièges européens : une délégation de DEUX clubs, et aucun en C1 ===== */
console.log("\n2) Les sièges européens : les Anglais rentrent d'exil, mais pas tous");
{
  /* Cinq ans après le Heysel, les clubs anglais retrouvent l'Europe en 1990-91 — sauf
     Liverpool, champion 89-90, qui purge une année de plus. L'Angleterre n'a donc
     PERSONNE en Coupe des clubs champions, seulement Manchester United en Coupe des
     Coupes (qu'il gagnera à Rotterdam contre le Barça) et Aston Villa en Coupe UEFA.
     C'est la plus petite délégation anglaise des vingt saisons du chantier. */
  dit(S.euroC1.length === 0, "C1 : personne, et ce n'est pas un oubli (Liverpool purge le Heysel)");
  dit(S.euroC2.join(",") === "MUN", "C2 : Manchester United, futur vainqueur à Rotterdam");
  dit(S.euroC3.join(",") === "AVL", "C3 : Aston Villa, seul engagé en Coupe UEFA");
  /* Le vrai recoupement : deux tables écrites des jours différents doivent concorder. */
  const ligne = api.SIEGES_ANG[1990];
  dit(!!ligne, "SIEGES_ANG connaît l'année 1990");
  if (ligne) {
    dit(ligne.C1.join(",") === S.euroC1.join(",") &&
        ligne.C2.join(",") === S.euroC2.join(",") &&
        ligne.C3.join(",") === S.euroC3.join(","),
      "la saison et SIEGES_ANG[1990] disent exactement la même délégation");
  }
  const horsPlateau = S.euroC1.concat(S.euroC2, S.euroC3).filter(c => !S.d1.includes(c));
  dit(horsPlateau.length === 0,
    "les deux clubs à siège jouent l'élite" + (horsPlateau.length ? " — sauf " + horsPlateau.join(", ") : ""));
  /* ET CE QUE SEULE CETTE SAISON PEUT ÉPROUVER : un pays SANS siège dans une coupe. Le
     tableau garde ses seize clubs quoi qu'il perde (règle d'ANG-C), et il doit alors se
     recompléter entièrement par les viviers, sans jamais prendre un club du championnat. */
  api.nouvellePartie("ARS", KEY);
  for (const compet of ["C1", "C2", "C3"]) {
    const tableau = api.vivierEuro(compet, false) || [];
    dit(tableau.length === 16, `le tableau de ${compet} tient ses seize clubs (${tableau.length})`);
    const duChampionnat = tableau.filter(id => S.d1.includes(id) || S.d2.includes(id));
    const siege = (api.SIEGES_ANG[1990][compet] || []);
    const intrus = duChampionnat.filter(id => !siege.includes(id));
    dit(intrus.length === 0,
      `aucun club du championnat au tableau de ${compet} hors le siège national`
      + (intrus.length ? " — " + intrus.join(", ") : ""));
  }
}

/* ===== 3) Les hommes de la saison ===== */
console.log("\n3) Les hommes : les vedettes, les distinctions, les pépites forcées");
{
  const parNom = new Map();
  for (const [club, lst] of Object.entries(api.STARS_ANG9091)) for (const t of lst) parNom.set(t[0], { club, t, elite: true });
  for (const [club, lst] of Object.entries(api.STARS_D2_ANG9091)) for (const t of lst) parNom.set(t[0], { club, t, elite: false });

  /* Les vedettes, à leur club et au moins à leur valeur. Les notes viennent de trois
     sources : les effectifs d'ANG 1995-96 rajeunis de cinq ans, `VIVIER_SAISON[1990]`
     ramené d'un cran à l'échelle des effectifs, et les distinctions de l'année. */
  const VEDETTES = [
    ["Mark Hughes", "MUN", 83],     // JOUEUR DE L'ANNÉE DES JOUEURS (PFA), son deuxième
    ["G. Strachan", "LEE", 80],     // JOUEUR DE L'ANNÉE DE LA PRESSE (FWA), à trente-trois ans
    ["Alan Smith", "ARS", 81],      // MEILLEUR BUTEUR, vingt-deux buts, et champion
    ["P. Gascoigne", "TOT", 83],    // le héros d'Italia 90, le plus grand nom du pays
    ["D. Seaman", "ARS", 83],       // dix-huit buts encaissés en trente-huit journées
    ["G. Lineker", "TOT", 81],      // Soulier d'or du Mondial 86, capitaine de la sélection
    ["J. Barnes", "LIV", 82],
    ["I. Rush", "LIV", 81],
    ["N. Southall", "EVE", 82],
    ["D. Platt", "AVL", 80],        // la révélation d'Italia 90, parti à Bari l'été suivant
    ["S. Pearce", "FOR", 81],
    ["D. Walker", "FOR", 80],
    ["S. Bruce", "MUN", 79],
    ["I. Wright", "CPL", 79],
    ["T. Sheringham", "MIW", 77],   // meilleur buteur de TOUT le pays, depuis la deuxième division
    ["B. Robson", "MUN", 78],
  ];
  let pbV = [];
  for (const [nom, club, mini] of VEDETTES) {
    const e = parNom.get(nom);
    if (!e) { pbV.push(nom + " absent"); continue; }
    if (e.club !== club) pbV.push(nom + " au mauvais club (" + e.club + " au lieu de " + club + ")");
    else if (e.t[3] < mini) pbV.push(nom + " noté " + e.t[3] + " (au moins " + mini + " attendu)");
  }
  dit(pbV.length === 0, "les " + VEDETTES.length + " vedettes sont à leur club et à leur valeur"
    + (pbV.length ? " — " + pbV.join(" ; ") : ""));

  /* LE MEILLEUR ESPOIR DE L'ANNÉE (PFA) : Lee Sharpe, dix-neuf ans, Manchester United. Il
     entre par le seul temps de jeu — trois mille minutes — mais sa note doit dire le titre. */
  const sh = parNom.get("L. Sharpe");
  dit(!!sh && sh.club === "MUN" && sh.t[2] === 19 && sh.t[3] >= 73,
    "Lee Sharpe, meilleur espoir de l'année, a dix-neuf ans à Manchester United et la note qui va avec");

  /* LES PÉPITES FORCÉES, et elles sont CINQ seulement : la leçon de 95-96 tient, un forçage
     met dehors le vingtième de son club et il faut mesurer ce qu'il coûte. Ryan Giggs sort
     Mark Bosnich (180 minutes), Kanchelskis sort Darren Ferguson (348), Parlour sort Martin
     Hayes (zéro), Chris Sutton remplace le David Smith de Norwich qu'un homonyme écartait,
     Gunnar Halle sort Paul Moulden (117). Aucun ne chasse un titulaire. */
  const PEPITES = [
    ["R. Giggs", "MUN", 17],        // cent minutes, et il sera le joueur du club pendant vingt ans
    ["A. Kanchelskis", "MUN", 21],  // quatre-vingt-dix minutes, arrivé du Chakhtior en mars
    ["R. Parlour", "ARS", 17],      // zéro minute, et il n'a rien coûté
    ["C. Sutton", "NOR", 17],       // quatre-vingt-dix minutes, futur champion d'Angleterre
    ["G. Halle", "OLD", 25],        // arrivé en février, soixante-quatre sélections norvégiennes
  ];
  let pbP = [];
  for (const [nom, club, age] of PEPITES) {
    const e = parNom.get(nom);
    if (!e) { pbP.push(nom + " absent du plateau"); continue; }
    if (e.club !== club) pbP.push(nom + " au mauvais club (" + e.club + ")");
    else if (e.t[2] !== age) pbP.push(nom + " a " + e.t[2] + " ans (attendu " + age + ")");
  }
  dit(pbP.length === 0, "les cinq hommes forcés sont là, au bon âge"
    + (pbP.length ? " — " + pbP.join(" ; ") : ""));

  /* Et ceux qui passent TOUT SEULS au temps de jeu, la preuve qu'on n'a pas forcé ce que la
     source donnait déjà : Alan Shearer à vingt ans est titulaire à Southampton, Roy Keane à
     dix-neuf joue toute la saison à Forest, Steve Watson entre à SEIZE ans à Newcastle et y
     joue deux mille minutes, Darren Anderton perce à Portsmouth. */
  const SANS_FORCAGE = [["A. Shearer", "SOU", 20], ["R. Keane", "FOR", 19], ["S. Watson", "NEW", 16],
                        ["L. Clark", "NEW", 18], ["D. Anderton", "POR", 18], ["D. Yorke", "AVL", 19],
                        ["S. McManaman", "LIV", 18], ["S. Collymore", "CPL", 19], ["G. Southgate", "CPL", 20]];
  let pbS2 = [];
  for (const [nom, club, age] of SANS_FORCAGE) {
    const e = parNom.get(nom);
    if (!e) { pbS2.push(nom + " absent"); continue; }
    if (e.club !== club || e.t[2] !== age) pbS2.push(nom + " à " + e.club + " / " + e.t[2] + " ans");
  }
  dit(pbS2.length === 0, "neuf hommes entrent par le seul temps de jeu, sans forçage"
    + (pbS2.length ? " — " + pbS2.join(" ; ") : ""));

  /* Un potentiel qui dit l'avenir sans le trahir. Giggs doit retrouver en 95-96 le potentiel
     que le jeu lui connaît déjà (91) : une saison ajoutée ne doit pas rabaisser un homme. */
  const jeunes = ["R. Giggs", "A. Shearer", "R. Keane", "S. McManaman", "C. Sutton", "D. Anderton"];
  const courts = jeunes.filter(n => { const e = parNom.get(n); return !e || e.t[4] - e.t[3] < 14; });
  dit(courts.length === 0, "les gamins de la saison ont au moins quatorze points de marge"
    + (courts.length ? " — " + courts.join(", ") : ""));
  const g = parNom.get("R. Giggs");
  dit(!!g && g.t[4] === 91, "Ryan Giggs garde le potentiel 91 que le jeu lui donne déjà en 95-96");

  /* Les deux bouts de l'échelle des âges, et ce sont de vrais hommes : Steve Watson entre à
     seize ans à Newcastle, plus jeune joueur de l'histoire du club, et Phil Parkes garde
     encore les buts d'Ipswich à quarante. Peter Shilton, lui, en avait QUARANTE ET UN à
     Derby : il tombe hors des bornes du moteur, et c'est dit plutôt que caché. */
  const ages = [...parNom.values()].map(e => e.t[2]);
  dit(Math.min(...ages) === 16, "le plus jeune a seize ans (" + Math.min(...ages) + ")");
  dit(Math.max(...ages) === 40, "le plus vieux a quarante ans (" + Math.max(...ages) + ")");
  const w16 = parNom.get("S. Watson");
  dit(!!w16 && w16.club === "NEW" && w16.t[2] === 16, "Steve Watson a seize ans à Newcastle");
  const pp = parNom.get("P. Parkes");
  dit(!!pp && pp.club === "IPS" && pp.t[2] === 40, "Phil Parkes garde les buts d'Ipswich à quarante ans");
  dit(!parNom.has("P. Shilton"), "Peter Shilton, quarante et un ans à Derby, est hors des bornes du moteur");

  /* Le compte, et la distribution : une saison qui dérive se voit ici. */
  const n1 = Object.values(api.STARS_ANG9091).reduce((s, l) => s + l.length, 0);
  const n2 = Object.values(api.STARS_D2_ANG9091).reduce((s, l) => s + l.length, 0);
  dit(n1 === 400 && n2 === 360, "760 vrais joueurs (" + n1 + " + " + n2 + ")");
  const moy = (l) => l.reduce((s, x) => s + x, 0) / l.length;
  const e1 = Object.values(api.STARS_ANG9091).flat().map(t => t[3]);
  const e2 = Object.values(api.STARS_D2_ANG9091).flat().map(t => t[3]);
  const m1 = moy(e1), m2 = moy(e2);
  console.log("— Distribution : élite moyenne " + m1.toFixed(1) + ", dessous " + m2.toFixed(1) + " —");
  dit(m1 > 68 && m1 < 73, "la moyenne de l'élite reste dans la plage des saisons françaises (" + m1.toFixed(1) + ")");
  dit(m2 > 63 && m2 < 68, "la moyenne du dessous aussi (" + m2.toFixed(1) + ")");
  dit(m1 - m2 > 2, "l'élite est bien au-dessus du dessous (" + (m1 - m2).toFixed(1) + " points)");
}

/* ===== 4) LE MUR DU RECRUTEUR ===== */
console.log("\n4) Le mur du recruteur : on ne propose pas un homme qu'un club a sous contrat");
{
  /* `VIVIER_SAISON[1990]` est la liste du recruteur de l'été 90, et elle reste FRANÇAISE
     (ANG-F la reprendra) : elle aligne de vrais joueurs qui jouent HORS de France, donc
     SIX hommes du championnat anglais. Vue d'une carrière anglaise, ces six-là sont sous
     contrat au championnat qu'on joue — et `vivierDeSaison` les écarte en comparant le NOM,
     chaîne pour chaîne. C'est le piège de 95-96, où « É. Cantona » et « E. Cantona » ne se
     reconnaissaient pas : la règle est que la graphie du JEU gagne, pas celle de la source. */
  const ANGLAIS = [
    ["G. Lineker", "TOT"], ["P. Gascoigne", "TOT"], ["J. Barnes", "LIV"],
    ["I. Rush", "LIV"], ["N. Southall", "EVE"], ["B. Robson", "MUN"],
  ];
  const liste = api.VIVIER_SAISON[1990] || [];
  const nomsViv = new Set(liste.map(e => e[0]));
  let pb = [];
  for (const [nom, club] of ANGLAIS) {
    if (!nomsViv.has(nom)) { pb.push(nom + " n'est plus dans VIVIER_SAISON[1990]"); continue; }
    const lst = api.STARS_ANG9091[club] || [];
    if (!lst.some(t => t[0] === nom)) pb.push(nom + " introuvable à " + club + " sous ce nom exact");
  }
  dit(pb.length === 0,
    "les six hommes du vivier 1990 qui jouent en Angleterre portent au plateau le nom EXACT du vivier"
    + (pb.length ? " — " + pb.join(" ; ") : ""));

  /* Et la preuve en situation : on lance une carrière anglaise et on relit le vivier. */
  const G0 = (() => { api.nouvellePartie("ARS", KEY); return api.getG(); })();
  const employes = new Set();
  for (const c of G0.clubs.concat(G0.autre || [])) for (const j of (c.joueurs || [])) employes.add(j.nom);
  dit(employes.size > 700, "la carrière anglaise emploie " + employes.size + " hommes");
  const offerts = [];
  for (const t in (G0.vivier || {})) for (const e of G0.vivier[t]) offerts.push(e[0]);
  const doubles = offerts.filter(n => employes.has(n));
  dit(doubles.length === 0,
    "aucun joueur du vivier n'est déjà employé au championnat (" + offerts.length + " offres relues)"
    + (doubles.length ? " — " + [...new Set(doubles)].join(", ") : ""));
  const attendus = ANGLAIS.map(x => x[0]).filter(n => offerts.includes(n));
  dit(attendus.length === 0,
    "Lineker, Gascoigne, Barnes, Rush, Southall et Robson ne sont PAS au rapport du recruteur"
    + (attendus.length ? " — " + attendus.join(", ") : ""));
}

/* ===== 5) Les homonymes et les prénoms ===== */
console.log("\n5) Les homonymes sont distincts, et aucun prénom ne ment");
{
  const vus = new Map();
  const dbl = [];
  for (const T of [api.STARS_ANG9091, api.STARS_D2_ANG9091])
    for (const [club, lst] of Object.entries(T))
      for (const t of lst) {
        if (vus.has(t[0])) dbl.push(t[0] + " (" + vus.get(t[0]) + " et " + club + ")");
        else vus.set(t[0], club);
      }
  dit(dbl.length === 0, "aucun nom porté par deux hommes" + (dbl.length ? " — " + dbl.join(" ; ") : ""));

  /* Les homonymes, réglés à la convention du chantier : celui que le jeu écrit DÉJÀ avec une
     initiale la garde, sinon le plus utilisé, et l'autre passe en toutes lettres. La liste
     est longue parce que l'Angleterre de 1990 aligne des Smith, des Williams et des Allen
     par paquets. Deux cas se règlent par la graphie que le jeu portait déjà : Mark Hughes et
     Mark Ward étaient écrits en entier depuis 95-96, où « M. Hughes » est Michael et
     « M. Ward » est Mitch — on ne change pas d'avis d'une saison à l'autre. */
  const PAIRES = [
    ["M. Thomas", "ARS", "Mitchell Thomas", "TOT"],   // Michael à Arsenal, Mitchell à Tottenham
    ["S. McCall", "EVE", "Steve McCall", "SHW"],      // Stuart à Everton
    ["B. Horne", "SOU", "Brian Horne", "MIW"],        // Barry à Southampton
    ["K. Black", "LUT", "Kenny Black", "POR"],        // Kingsley à Luton
    ["M. Allen", "WHU", "Malcolm Allen", "MIW"],      // Martin à West Ham
    ["C. Palmer", "SHW", "Charlie Palmer", "NTC"],    // Carlton à Sheffield Wednesday
    ["D. Wilson", "SHW", "David Wilson", "CHL"],      // Danny à Sheffield Wednesday
    ["C. Short", "NTC", "Chris Short", "NTC"],        // Craig et Chris, les DEUX dans le même club
    ["P. Robinson", "PLY", "Phil Robinson", "NTC"],   // Paul à Plymouth
    ["P. Williams", "DER", "Paul Williams", "SHW"],   // le Paul de Derby garde l'initiale : c'est lui qu'ANG 95-96 connaît
    ["D. Smith", "COV", "Dave Smith", "BSC"],         // David à Coventry
    ["G. Thomas", "CPL", "Gwyn Thomas", "HUL"],       // Geoff à Crystal Palace
  ];
  let pbH = [];
  for (const [court, clubC, long, clubL] of PAIRES) {
    const a1 = vus.get(court), a2 = vus.get(long);
    if (a1 !== clubC) pbH.push(court + " attendu à " + clubC + " (trouvé " + (a1 || "nulle part") + ")");
    if (a2 !== clubL) pbH.push(long + " attendu à " + clubL + " (trouvé " + (a2 || "nulle part") + ")");
  }
  dit(pbH.length === 0, "les douze homonymes sont rangés à la convention du chantier"
    + (pbH.length ? " — " + pbH.join(" ; ") : ""));
  dit(vus.get("Mark Hughes") === "MUN" && !vus.has("M. Hughes"),
    "Mark Hughes est écrit en entier : « M. Hughes » est Michael depuis 92/93");
  dit(vus.get("Mark Ward") === "MCI" && !vus.has("M. Ward"),
    "Mark Ward est écrit en entier : « M. Ward » est Mitch depuis 95-96");
  dit(vus.get("Jan Mølby") === "LIV" && !vus.has("J. Mølby"),
    "Jan Mølby est écrit en entier : « J. Mølby » est Johnny, du vivier d'Europe");
  dit(vus.get("Gary Williams") === "WAT" && vus.get("Gareth Williams") === "AVL" && vus.get("G. Williams") === "DER",
    "les TROIS Williams du plateau sont distincts : Geraint, Gareth et Gary");
  dit(vus.get("Alan Smith") === "ARS" && vus.get("Anthony Smith") === "SUN" && !vus.has("A. Smith"),
    "les deux Smith à initiale A passent en entier : « A. Smith » est Anders dans le jeu");

  /* Chaque nom à initiale a son prénom, et ce prénom commence par la bonne lettre. */
  const INI = /^(\p{Lu})\.(?:[-\s]\p{L}\.)*\s/u;
  const sans = [], faux = [];
  const nu = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
  for (const nom of vus.keys()) {
    const m = nom.match(INI);
    if (!m) continue;
    if (!Object.prototype.hasOwnProperty.call(api.PRENOMS_VRAIS, nom)) { sans.push(nom); continue; }
    const p = api.PRENOMS_VRAIS[nom];
    if (p && nu(p)[0] !== nu(m[1])[0]) faux.push(nom + " → " + p);
  }
  dit(sans.length === 0, "tous les noms à initiale ont leur prénom" + (sans.length ? " — " + sans.slice(0, 6).join(", ") : ""));
  dit(faux.length === 0, "aucun prénom ne contredit l'initiale affichée" + (faux.length ? " — " + faux.join(" ; ") : ""));
  /* Deux variantes du même homme : la graphie du JEU reste, pas celle de la source. */
  dit(api.PRENOMS_VRAIS["A. Kanchelskis"] === "Andrei", "« A. Kanchelskis » reste Andrei, et non Andrey");
  dit(api.PRENOMS_VRAIS["M. Le Tissier"] === "Matthew", "« M. Le Tissier » reste Matthew, et non Matt");
  dit(api.PRENOMS_VRAIS["B. Kristensen"] === "Bjørn", "« B. Kristensen » garde son Bjørn danois");
}

/* ===== 6) Les stades de 1990 ===== */
console.log("\n6) Les stades datés de 1990");
{
  /* Trois clubs campent ailleurs que chez eux en 1990-91, et ça se verrait : Charlton est
     locataire de Selhurst Park et ne rentrera à The Valley qu'en décembre 1992 ; Wimbledon
     joue sa DERNIÈRE saison à Plough Lane avant d'emménager à Selhurst Park en 1991 ;
     Millwall est encore au vieux Den, le New Den n'ouvrant qu'en août 1993. */
  const cas = [
    ["CHL", 1990, /Selhurst/i, "Charlton est locataire de Selhurst Park"],
    ["CHL", 1992, /Valley/i, "et il rentre à The Valley en 1992"],
    ["WIM", 1990, /Plough Lane/i, "Wimbledon joue sa dernière saison à Plough Lane"],
    ["WIM", 1991, /Selhurst/i, "et part à Selhurst Park dès 1991"],
    ["MIW", 1990, /The Den/i, "Millwall est encore au vieux Den"],
    ["MID", 1990, /Ayresome/i, "Middlesbrough est à Ayresome Park, le Riverside n'ouvre qu'en 1995"],
    ["SUN", 1990, /Roker/i, "Sunderland est à Roker Park, le Stadium of Light n'ouvre qu'en 1997"],
    ["DER", 1990, /Baseball/i, "Derby est au Baseball Ground, Pride Park n'ouvre qu'en 1997"],
  ];
  let pbS = [];
  for (const [id, an, re, quoi] of cas) {
    const m = api.metaSaison ? api.metaSaison(id, an) : null;
    if (!m || !re.test(m.stade)) pbS.push(quoi + " — trouvé « " + (m ? m.stade : "rien") + " »");
    else ok(quoi);
  }
  dit(pbS.length === 0, "les huit faits de stade de 1990 tiennent" + (pbS.length ? " — " + pbS.join(" ; ") : ""));
}

/* ===== 7) Une carrière, et la bascule vers la Premier League ===== */
console.log("\n7) Une carrière anglaise de quatre saisons depuis 1990-91");
{
  let buts = 0, matchs = 0, ex = 0;
  for (const club of ["ARS", "HUL"]) {
    try {
      api.nouvellePartie(club, KEY);
      const G = api.getG();
      if (api.anneeJeu() !== 1990) fail(club + " : anneeJeu() = " + api.anneeJeu() + " (attendu 1990)");
      for (let s = 0; s < 4; s++) {
        for (let j = 0; j < 38; j++) api.jouerJournee();
        for (const c of G.clubs) { buts += (c.bp || 0); matchs += 38; }
        if (s < 3) api.intersaison();
      }
      const ages = G.clubs.flatMap(c => (c.joueurs || []).map(j => j.age));
      if (Math.max(...ages) > 35) fail(club + " : un joueur de " + Math.max(...ages) + " ans traîne encore");
      else ok(club + " : quatre saisons jouées, âge maximal " + Math.max(...ages));
      /* LA BASCULE DES LIBELLÉS EN PLEINE CARRIÈRE, et c'est la promesse d'ANG-A : parti en
         First Division, on joue la Premier League à la troisième saison, sans rien toucher. */
      if (club === "ARS") {
        api.voitPays("ANG", api.anneeJeu(), false);
        dit(api.anneeJeu() === 1993 && api.libDiv(1, api.anneeJeu()) === "Premier League",
          "après trois intersaisons on est en 1993 et l'élite s'appelle Premier League");
        dit(api.libDiv(1, 1991) === "First Division" && api.libDiv(1, 1992) === "Premier League",
          "la bascule se fait exactement en 1992, comme dans l'histoire");
      }
    } catch (e) { ex++; fail(club + " : exception — " + (e && e.message)); }
  }
  if (ex === 0) {
    const gpm = buts / (matchs / 2);
    console.log("— Calibrage ANG 90/91 : " + gpm.toFixed(3) + " buts/match sur " + Math.round(matchs / 2) + " matchs —");
    dit(gpm > 2.0 && gpm < 2.9, "le calibrage reste dans la plage du moteur (" + gpm.toFixed(3) + ")");
  }
}

console.log(FAILS === 0 ? "\n✅ HARNAIS ANG 90/91 : TOUT EST VERT" : "\n❌ HARNAIS ANG 90/91 : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
