/* Harnais de validation — SAISON DE DÉPART ANG 1995-96
   La PREMIÈRE saison étrangère du jeu. `harness-angleterre.cjs` tient déjà le cadre
   (20+20, le mur européen, les libellés d'époque, la carrière) et il balaie toutes les
   saisons `pays:"ANG"` ; il ne vérifie pas, et c'est voulu, les FAITS de cette année-là.
   C'est le travail d'ici :
   1) le plateau est le vrai : la Premier League à vingt, la division du dessous ramenée
      de vingt-quatre à vingt par le classement réel, et les quatre écartés bien dehors
   2) les sièges européens sont ceux de 1995-96, et ils recoupent SIEGES_ANG[1995]
   3) les hommes de la saison : les vedettes à leur club et à leur valeur, les pépites
      forcées, les deux bouts de l'échelle des âges
   4) LE MUR DU RECRUTEUR : les huit hommes que `VIVIER_SAISON[1995]` chiffre et qui
      jouent le championnat anglais ne doivent JAMAIS être proposés par le recruteur —
      sinon on signe un joueur qu'un club du championnat a déjà sous contrat
   5) les homonymes sont distincts, et aucun prénom ne ment
   6) Middlesbrough joue au Riverside, ouvert le 26 août 1995
   Usage : node harness-ang9596.cjs                                                    */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,metaSaison,CIBLE," +
  "SAISONS,STARS_ANG9596,STARS_D2_ANG9596,D1_ANG9596,D2_ANG9596,SIEGES_ANG,VIVIER_SAISON," +
  "PRENOMS_VRAIS,CLUBS_ANG,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ANG-1995-96";
const S = api.SAISONS[KEY];

/* ===== 1) Le plateau réel de 1995-96 ===== */
console.log("1) Le plateau : vingt clubs à l'élite, vingt repris sur vingt-quatre en dessous");
{
  if (!S) fail("saison " + KEY + " absente du registre");
  else {
    /* La Premier League 1995-96, dans l'ordre du classement final. Elle comptait VINGT
       clubs pour la première fois (vingt-deux de 1992 à 1995) : le compte tombe juste,
       et c'est la seule saison anglaise d'avant 1996 où personne n'a à être repêché. */
    const ELITE = ["MUN","NEW","LIV","AVL","ARS","EVE","BLB","TOT","FOR","WHU",
                   "CHE","MID","LEE","WIM","SHW","COV","SOU","MCI","QPR","BOL"];
    /* Les vingt PREMIERS de la Division One 1995-96, qui en comptait vingt-quatre. */
    const DESSOUS = ["SUN","DER","CPL","STK","LEI","CHL","IPS","HUD","SHU","BNS",
                     "WBA","PTV","TRM","SND","BIR","NOR","GRI","OLD","RDG","WOL"];
    /* Et les QUATRE ÉCARTÉS, par le classement réel et rien d'autre : Portsmouth 21e
       avec 52 points, Millwall 22e avec 52, Watford 23e avec 48, Luton Town 24e avec 45.
       Aucun n'a de siège européen cette année-là, donc les écarter ne coûte rien au
       tableau d'Europe — ce qui n'aurait pas été vrai de Millwall en 2004-05. */
    const ECARTES = ["POR","MIW","WAT","LUT"];

    dit(S.d1.length === 20, "la Premier League aligne 20 clubs (" + S.d1.length + ")");
    dit(S.d2.length === 20, "la Division One aligne 20 clubs (" + S.d2.length + ")");
    dit(S.d1.join(",") === ELITE.join(","),
      "l'élite est exactement le classement réel de 1995-96, dans l'ordre");
    dit(S.d2.join(",") === DESSOUS.join(","),
      "l'échelon du dessous est exactement les vingt premiers du classement réel");
    const tous = new Set(S.d1.concat(S.d2));
    const intrus = ECARTES.filter(c => tous.has(c));
    dit(intrus.length === 0,
      "les quatre derniers de la Division One sont bien dehors (Portsmouth, Millwall, Watford, Luton)"
      + (intrus.length ? " — mais on trouve " + intrus.join(", ") : ""));
    /* Les quatre écartés existent quand même au registre des clubs : on les a laissés de
       côté pour cette saison, on ne les a pas effacés du pays. */
    const sansFiche = ECARTES.filter(c => !api.CLUBS_ANG.some(x => x.id === c));
    dit(sansFiche.length === 0,
      "les quatre écartés gardent leur fiche dans CLUBS_ANG, pour les autres saisons"
      + (sansFiche.length ? " — manquent " + sansFiche.join(", ") : ""));
    dit(S.pays === "ANG" && S.an === 1995 && S.titre === "1995-96",
      "le registre dit pays ANG, année 1995, créneau « 1995-96 »");
    dit(S.starsD1 === api.STARS_ANG9596 && S.starsD2 === api.STARS_D2_ANG9596,
      "la saison pointe sur ses deux tables d'effectifs");
  }
}

/* ===== 2) Les sièges européens de 1995-96 ===== */
console.log("\n2) Les sièges européens : ceux de 1995-96, et pas ceux d'une autre année");
{
  /* Relevés sur les tableaux de participants : Blackburn en C1 (champion 94-95),
     Everton en C2 (vainqueur de la FA Cup 1995), et quatre clubs en Coupe UEFA —
     Manchester United, Nottingham Forest, Liverpool et Leeds. Six clubs en tout,
     tous de l'élite : c'est la délégation anglaise de l'année. */
  const C1 = ["BLB"], C2 = ["EVE"], C3 = ["MUN","FOR","LIV","LEE"];
  dit(S.euroC1.join(",") === C1.join(","), "C1 : Blackburn, champion sortant");
  dit(S.euroC2.join(",") === C2.join(","), "C2 : Everton, vainqueur de la FA Cup 1995");
  dit(S.euroC3.join(",") === C3.join(","),
    "C3 : Manchester United, Forest, Liverpool et Leeds");
  /* Et le vrai recoupement : deux tables écrites séparément, à des jours différents,
     doivent dire la même chose. En répétition générale ce contrôle était circulaire
     (ANG-E le disait franchement) ; il cesse de l'être aujourd'hui. */
  const ligne = api.SIEGES_ANG[1995];
  dit(!!ligne, "SIEGES_ANG connaît l'année 1995");
  if (ligne) {
    dit(ligne.C1.join(",") === S.euroC1.join(",") &&
        ligne.C2.join(",") === S.euroC2.join(",") &&
        ligne.C3.join(",") === S.euroC3.join(","),
      "la saison et SIEGES_ANG[1995] disent exactement la même délégation");
  }
  const horsPlateau = S.euroC1.concat(S.euroC2, S.euroC3).filter(c => !S.d1.includes(c));
  dit(horsPlateau.length === 0,
    "les six clubs à siège jouent tous l'élite" + (horsPlateau.length ? " — sauf " + horsPlateau.join(", ") : ""));
}

/* ===== 3) Les hommes de la saison ===== */
console.log("\n3) Les hommes : les vedettes, les pépites forcées, les deux bouts de l'échelle");
{
  const parNom = new Map();
  for (const [club, lst] of Object.entries(api.STARS_ANG9596)) for (const t of lst) parNom.set(t[0], { club, t, elite: true });
  for (const [club, lst] of Object.entries(api.STARS_D2_ANG9596)) for (const t of lst) parNom.set(t[0], { club, t, elite: false });

  /* Les vedettes, à leur club et au moins à leur valeur. Les notes viennent des quatre
     effectifs anglais que l'auteur avait lui-même curés en 95-96 dans ses viviers de
     Coupe d'Europe, de `VIVIER_SAISON[1995]`, et des distinctions de la saison. */
  const VEDETTES = [
    ["A. Shearer", "BLB", 88],      // meilleur buteur, trente et un buts en championnat
    ["E. Cantona", "MUN", 86],      // joueur de l'année de la presse (FWA), de retour de suspension
    ["L. Ferdinand", "NEW", 84],    // JOUEUR DE L'ANNÉE DES JOUEURS (PFA)
    ["R. Fowler", "LIV", 84],       // meilleur espoir de l'année (PFA)
    ["D. Bergkamp", "ARS", 85],
    ["P. Schmeichel", "MUN", 85],
    ["D. Ginola", "NEW", 85],
    ["R. Giggs", "MUN", 83],
    ["S. McManaman", "LIV", 83],
    ["R. Gullit", "CHE", 82],       // Ballon d'or 1987, première saison à Chelsea
    ["Juninho Paulista", "MID", 82],// la recrue brésilienne de l'année
    ["M. Le Tissier", "SOU", 80],
    ["G. Kinkladze", "MCI", 79],    // le seul enchanteur d'une équipe qui descend
    ["A. Yeboah", "LEE", 80],
    ["T. Sheringham", "TOT", 80],
    ["C. Waddle", "SHW", 78],       // trente-cinq ans, et le jeu le connaît depuis 90/91
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

  /* LES PÉPITES FORCÉES. Le tri aux minutes les écartait toutes, et c'est le piège que
     le chantier connaît depuis 98/99 : un gamin qui n'a pas encore joué n'est pas un
     joueur sans valeur. Ici il a mordu deux fois plus fort qu'ailleurs, parce que la
     source ne documente qu'un tiers des matchs de la deuxième division anglaise. */
  const PEPITES = [
    ["F. Lampard", "WHU", 17],      // quinze minutes dans toute la saison
    ["R. Ferdinand", "WHU", 17],    // cinq minutes
    ["H. Kewell", "LEE", 17],
    ["I. Harte", "LEE", 18],
    ["S. Carr", "TOT", 19],
    ["D. Huckerby", "NEW", 19],
    ["M. Branch", "EVE", 17],
    ["M. Bridges", "SUN", 17],      // treize minutes
    ["S. Hughes", "ARS", 19],
    ["J. Euell", "WIM", 18],        // 695 minutes, plus que deux hommes entrés devant lui
    ["A. Campbell", "MID", 16],     // le plus jeune du plateau
    ["W. Prunier", "MUN", 28],      // le Français des deux matchs de décembre 1995
    ["I. Stimac", "DER", 28],       // international croate, cent seize minutes relevées
    ["J. Kearton", "EVE", 26],      // la doublure de Southall, curée par l'auteur
  ];
  let pbP = [];
  for (const [nom, club, age] of PEPITES) {
    const e = parNom.get(nom);
    if (!e) { pbP.push(nom + " absent du plateau"); continue; }
    if (e.club !== club) pbP.push(nom + " au mauvais club (" + e.club + ")");
    else if (e.t[2] !== age) pbP.push(nom + " a " + e.t[2] + " ans (attendu " + age + ")");
  }
  dit(pbP.length === 0, "les " + PEPITES.length + " hommes forcés sont là, au bon âge"
    + (pbP.length ? " — " + pbP.join(" ; ") : ""));

  /* Et ceux qui passent TOUT SEULS au temps de jeu : la preuve qu'on n'a pas forcé ce que
     la source donnait déjà. Emile Heskey à dix-sept ans et Lee Bowyer à dix-huit jouent
     assez pour entrer par la grande porte, comme Zidane en 91/92.
     ET CE QU'UN FORÇAGE COÛTE, dit franchement : vingt places pour trente et un hommes
     documentés à Leeds, donc forcer Kewell et Harte met dehors Andy Gray (dix-huit ans,
     1 271 minutes) et Richard Jobson. Le choix est assumé — Kewell gagnera la Ligue des
     champions et Harte comptera soixante-quatre sélections — mais il se paie. */
  const SANS_FORCAGE = [["E. Heskey", "LEI", 17], ["L. Bowyer", "CHL", 18],
                        ["D. Kovacevic", "SHW", 22], ["L. Radebe", "LEE", 26],
                        ["E. Barrett", "EVE", 28], ["T. Grant", "EVE", 21]];
  let pbS2 = [];
  for (const [nom, club, age] of SANS_FORCAGE) {
    const e = parNom.get(nom);
    if (!e) { pbS2.push(nom + " absent"); continue; }
    if (e.club !== club || e.t[2] !== age) pbS2.push(nom + " à " + e.club + " / " + e.t[2] + " ans");
  }
  dit(pbS2.length === 0, "six hommes entrent par le seul temps de jeu, sans forçage"
    + (pbS2.length ? " — " + pbS2.join(" ; ") : ""));

  /* Un potentiel qui dit l'avenir sans le trahir : à dix-sept ans, Lampard et Ferdinand
     doivent avoir de la marge, sinon le jeu les condamne à rester des remplaçants. */
  const jeunes = ["F. Lampard", "R. Ferdinand", "H. Kewell", "E. Heskey", "L. Bowyer"];
  const courts = jeunes.filter(n => { const e = parNom.get(n); return !e || e.t[4] - e.t[3] < 14; });
  dit(courts.length === 0, "les gamins de la saison ont au moins quatorze points de marge"
    + (courts.length ? " — " + courts.join(", ") : ""));

  /* Les deux bouts de l'échelle des âges, et ce sont de vrais hommes : Andrew Campbell
     entre à seize ans à Middlesbrough, Ray Wilkins tient le milieu de QPR à trente-neuf,
     quatre-vingt-quatre sélections anglaises derrière lui. */
  const ages = [...parNom.values()].map(e => e.t[2]);
  dit(Math.min(...ages) === 16, "le plus jeune a seize ans (" + Math.min(...ages) + ")");
  dit(Math.max(...ages) === 39, "le plus vieux a trente-neuf ans (" + Math.max(...ages) + ")");
  const w = parNom.get("R. Wilkins");
  dit(!!w && w.club === "QPR" && w.t[2] === 39, "Ray Wilkins tient le milieu de QPR à trente-neuf ans");
  const c16 = parNom.get("A. Campbell");
  dit(!!c16 && c16.club === "MID" && c16.t[2] === 16, "Andrew Campbell a seize ans à Middlesbrough");

  /* Le compte, et la distribution : une saison qui dérive se voit ici. */
  const n1 = Object.values(api.STARS_ANG9596).reduce((s, l) => s + l.length, 0);
  const n2 = Object.values(api.STARS_D2_ANG9596).reduce((s, l) => s + l.length, 0);
  dit(n1 === 400 && n2 === 360, "760 vrais joueurs (" + n1 + " + " + n2 + ")");
  const moy = (l) => l.reduce((s, x) => s + x, 0) / l.length;
  const e1 = Object.values(api.STARS_ANG9596).flat().map(t => t[3]);
  const e2 = Object.values(api.STARS_D2_ANG9596).flat().map(t => t[3]);
  const m1 = moy(e1), m2 = moy(e2);
  console.log("— Distribution : élite moyenne " + m1.toFixed(1) + ", dessous " + m2.toFixed(1) + " —");
  dit(m1 > 68 && m1 < 73, "la moyenne de l'élite reste dans la plage des saisons françaises (" + m1.toFixed(1) + ")");
  dit(m2 > 63 && m2 < 68, "la moyenne du dessous aussi (" + m2.toFixed(1) + ")");
  dit(m1 - m2 > 2, "l'élite est bien au-dessus du dessous (" + (m1 - m2).toFixed(1) + " points)");
}

/* ===== 4) LE MUR DU RECRUTEUR ===== */
console.log("\n4) Le mur du recruteur : on ne propose pas un homme qu'un club a sous contrat");
{
  /* `VIVIER_SAISON[1995]` est la liste du recruteur de l'été 95, et elle reste FRANÇAISE
     (ANG-F la reprendra) : elle aligne de vrais joueurs qui jouent HORS de France, donc
     huit hommes du championnat ANGLAIS. Vue d'une carrière anglaise, ces huit-là sont
     sous contrat au championnat qu'on joue — et `vivierDeSaison` les écarte en comparant
     le NOM, chaîne pour chaîne. C'est tout l'enjeu : si notre table écrit « É. Cantona »
     là où le vivier écrit « E. Cantona », le recruteur propose Cantona alors que
     Manchester United l'a sous contrat. L'impossibilité d'ANG-C, par la porte de service. */
  const ANGLAIS = [
    ["E. Cantona", "MUN"], ["P. Schmeichel", "MUN"], ["R. Giggs", "MUN"], ["D. Beckham", "MUN"],
    ["D. Ginola", "NEW"], ["D. Bergkamp", "ARS"], ["A. Shearer", "BLB"], ["R. Fowler", "LIV"],
  ];
  const liste = api.VIVIER_SAISON[1995] || [];
  const nomsViv = new Set(liste.map(e => e[0]));
  let pb = [];
  for (const [nom, club] of ANGLAIS) {
    if (!nomsViv.has(nom)) { pb.push(nom + " n'est plus dans VIVIER_SAISON[1995]"); continue; }
    const lst = api.STARS_ANG9596[club] || [];
    if (!lst.some(t => t[0] === nom)) pb.push(nom + " introuvable à " + club + " sous ce nom exact");
  }
  dit(pb.length === 0,
    "les huit hommes du vivier 1995 qui jouent en Angleterre portent au plateau le nom EXACT du vivier"
    + (pb.length ? " — " + pb.join(" ; ") : ""));

  /* Et la preuve en situation : on lance une carrière anglaise et on relit le vivier. */
  const G0 = (() => { api.nouvellePartie("MUN", KEY); return api.getG(); })();
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
    "Cantona, Shearer, Giggs et les autres ne sont PAS au rapport du recruteur"
    + (attendus.length ? " — " + attendus.join(", ") : ""));
}

/* ===== 5) Les homonymes et les prénoms ===== */
console.log("\n5) Les homonymes sont distincts, et aucun prénom ne ment");
{
  const tous = [];
  for (const [club, lst] of Object.entries(api.STARS_ANG9596)) for (const t of lst) tous.push({ club, t });
  for (const [club, lst] of Object.entries(api.STARS_D2_ANG9596)) for (const t of lst) tous.push({ club, t });
  const vus = new Map();
  const dbl = [];
  for (const e of tous) {
    if (vus.has(e.t[0])) dbl.push(e.t[0] + " (" + vus.get(e.t[0]) + " et " + e.club + ")");
    else vus.set(e.t[0], e.club);
  }
  dit(dbl.length === 0, "aucun nom porté par deux hommes" + (dbl.length ? " — " + dbl.join(" ; ") : ""));

  /* Les quatorze homonymes de la saison, réglés à la convention du chantier : celui que
     le jeu écrit DÉJÀ avec une initiale la garde (Duncan Ferguson, Dave Watson et Neville
     Southall d'Everton, curés dans le vivier de C2 ; Michael Hughes, curé à Strasbourg
     depuis 92/93), sinon le plus utilisé la garde, et l'autre passe en toutes lettres —
     exactement comme Jean-Michel Ferri face au J.-M. Ferri du Gazélec en 91/92.
     Trois paires portaient le MÊME prénom et n'avaient aucune autre issue. */
  const PAIRES = [
    ["D. Ferguson", "EVE", "Darren Ferguson", "WOL"],
    ["D. Watson", "EVE", "Dave Watson", "BNS"],       // deux David Watson sans lien
    ["N. Southall", "EVE", "Nicky Southall", "GRI"],  // Neville à Everton, Nicky à Grimsby
    ["M. Hughes", "WHU", "Mark Hughes", "CHE"],       // Michael à West Ham, Mark à Chelsea
    ["D. Lee", "CHE", "David Lee", "BOL"],            // deux David Lee sans lien
    ["G. Jones", "SND", "Gary Jones", "TRM"],         // deux Gary Jones sans lien
    ["A. Clarke", "WIM", "Adrian Clarke", "ARS"],
    ["A. Thompson", "WOL", "Alan Thompson", "BOL"],
    ["C. Fleming", "MID", "Craig Fleming", "OLD"],
    ["D. Whyte", "MID", "David Whyte", "CHL"],
    ["M. Gray", "SUN", "Martin Gray", "SUN"],         // les DEUX dans le même club
    ["M. Ward", "SHU", "Mark Ward", "BIR"],
    ["R. Wallace", "LEE", "Ray Wallace", "STK"],
  ];
  let pbH = [];
  for (const [court, clubC, long, clubL] of PAIRES) {
    const a1 = vus.get(court), a2 = vus.get(long);
    if (a1 !== clubC) pbH.push(court + " attendu à " + clubC + " (trouvé " + (a1 || "nulle part") + ")");
    if (a2 !== clubL) pbH.push(long + " attendu à " + clubL + " (trouvé " + (a2 || "nulle part") + ")");
  }
  dit(pbH.length === 0, "les treize homonymes sont rangés à la convention du chantier"
    + (pbH.length ? " — " + pbH.join(" ; ") : ""));
  /* Les Williams : ils étaient trois au relevé, le Mike de Sheffield Wednesday n'a pas
     tenu dans les vingt de son club, et il n'en reste que deux à distinguer. */
  dit(vus.get("M. Williams") === "WOL" && vus.get("Martin Williams") === "RDG",
    "les deux Williams du plateau sont distincts : Wolverhampton et Reading");

  /* LE PIÈGE DE LA TABLE DES PRÉNOMS, trouvé en la relisant : deux noms courts de cette
     saison étaient DÉJÀ pris par un autre homme. Sans correctif, le jeu écrivait
     « Arthur Moses » sur la fiche d'Adie Moses et « Johnny Mølby » sur celle de Jan. */
  dit(vus.get("Adie Moses") === "BNS" && !vus.has("A. Moses"),
    "Adie Moses est écrit en entier : « A. Moses » est un autre homme, né en 1973");
  dit(vus.get("Jan Mølby") === "NOR" && !vus.has("J. Mølby"),
    "Jan Mølby est écrit en entier : « J. Mølby » est Johnny, né en 1969");

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
  dit(api.PRENOMS_VRAIS["E. Cantona"] === "Éric", "« E. Cantona » reste Éric, avec son accent");
}

/* ===== 6) Les stades de 1995, et le Riverside tout neuf ===== */
console.log("\n6) Les stades datés de 1995");
{
  /* Le cas qui se verrait : Middlesbrough quitte Ayresome Park pour le Riverside le
     26 août 1995, en plein dans notre saison. `STADE_EPOQUE` le sait depuis ANG-B ;
     on vérifie ici qu'il le sait pour la BONNE année, celle qu'on joue. */
  const m95 = api.metaSaison ? api.metaSaison("MID", 1995) : null;
  const m94 = api.metaSaison ? api.metaSaison("MID", 1994) : null;
  if (!m95 || !m94) fail("metaSaison indisponible : impossible de dater les stades");
  else {
    dit(/Riverside/i.test(m95.stade), "en 1995 Middlesbrough joue au Riverside (" + m95.stade + ")");
    dit(/Ayresome/i.test(m94.stade), "en 1994 il jouait encore à Ayresome Park (" + m94.stade + ")");
  }
  /* Et les trois stades qu'on ne doit PAS voir en 1995, parce qu'ils n'existent pas
     encore : le Stadium of Light (1997), le Reebok (1997) et Pride Park (1997). */
  const futurs = [["SUN", /Stadium of Light/i], ["BOL", /Reebok/i], ["DER", /Pride Park/i]];
  let pbS = [];
  for (const [id, re] of futurs) {
    const m = api.metaSaison ? api.metaSaison(id, 1995) : null;
    if (m && re.test(m.stade)) pbS.push(id + " joue déjà dans un stade de 1997 (" + m.stade + ")");
  }
  dit(pbS.length === 0, "aucun club ne joue dans un stade qui n'ouvre qu'en 1997"
    + (pbS.length ? " — " + pbS.join(" ; ") : ""));
}

/* ===== 7) Une carrière, pour voir la saison tourner ===== */
console.log("\n7) Une carrière anglaise de quatre saisons depuis 1995-96");
{
  let buts = 0, matchs = 0, ex = 0;
  for (const club of ["MUN", "WOL"]) {
    try {
      api.nouvellePartie(club, KEY);
      const G = api.getG();
      if (api.anneeJeu() !== 1995) fail(club + " : anneeJeu() = " + api.anneeJeu() + " (attendu 1995)");
      for (let s = 0; s < 4; s++) {
        for (let j = 0; j < 38; j++) api.jouerJournee();
        for (const c of G.clubs) { buts += (c.bp || 0); matchs += 38; }
        if (s < 3) api.intersaison();
      }
      const ages = G.clubs.flatMap(c => (c.joueurs || []).map(j => j.age));
      if (Math.max(...ages) > 35) fail(club + " : un joueur de " + Math.max(...ages) + " ans traîne encore");
      else ok(club + " : quatre saisons jouées, âge maximal " + Math.max(...ages));
    } catch (e) { ex++; fail(club + " : exception — " + (e && e.message)); }
  }
  if (ex === 0) {
    const gpm = buts / (matchs / 2);
    console.log("— Calibrage ANG 95/96 : " + gpm.toFixed(3) + " buts/match sur " + Math.round(matchs / 2) + " matchs —");
    dit(gpm > 2.0 && gpm < 2.9, "le calibrage reste dans la plage du moteur (" + gpm.toFixed(3) + ")");
  }
}

console.log(FAILS === 0 ? "\n✅ HARNAIS ANG 95/96 : TOUT EST VERT" : "\n❌ HARNAIS ANG 95/96 : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
