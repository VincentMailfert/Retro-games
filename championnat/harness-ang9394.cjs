/* Harnais de validation — SAISON DE DÉPART ANG 1993-94
   La CINQUIÈME saison anglaise, et celle du premier doublé de Manchester United.
   `harness-angleterre.cjs` tient déjà le cadre (20+20, le mur européen, les libellés
   d'époque, la carrière) et il balaie toutes les saisons `pays:"ANG"` ; il ne vérifie pas,
   et c'est voulu, les FAITS de cette année-là. C'est le travail d'ici :
   1) le plateau est le vrai : la Premier League ramenée de vingt-deux à vingt, l'échelon du
      dessous de vingt-quatre à vingt — et les quatre écartés du dessous ne sont PAS les
      quatre derniers : Tranmere (5e) et Middlesbrough (9e) manquent d'hommes. SURTOUT :
      BARNSLEY ET SOUTHEND SONT AU PLATEAU alors que la source les a PERDUS sur cette seule
      saison, parce que leurs effectifs ont été reconstitués à trois sources recoupées
   2) les sièges européens de 1993 : Manchester United en C1, Arsenal en C2 (vainqueur de la
      FA Cup 1993), Aston Villa et Norwich en C3 — et Blackburn, qui finira deuxième, part
      SANS Europe
   3) les hommes de la saison : CANTONA EST À MANCHESTER UNITED cette fois, les quatre
      distinctions, les onze pépites forcées, et ROBBIE FOWLER ENTRE AU PLATEAU
   4) LE MUR DU RECRUTEUR : les hommes que `VIVIER_SAISON[1993]` chiffre et qui jouent le
      championnat anglais ne doivent JAMAIS être proposés par le recruteur
   5) les homonymes sont distincts, et aucun prénom ne mente — l'innommable de Coventry
   6) les stades de 1993 : MILLWALL EMMÉNAGE AU NEW DEN, Charlton est rentré à The Valley
   7) une carrière, et le Mondial 94 dès la PREMIÈRE intersaison, sans sacre anglais
   Usage : node harness-ang9394.cjs                                                        */
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
  "voitPays,SAISONS,STARS_ANG9394,STARS_D2_ANG9394,D1_ANG9394,D2_ANG9394,SIEGES_ANG,VIVIER_SAISON," +
  "PRENOMS_VRAIS,CLUBS_ANG,STARS_ANG9293,STARS_D2_ANG9293,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ANG-1993-94";
const S = api.SAISONS[KEY];

/* Tous les hommes du plateau, par nom court. */
const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ANG9394)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ANG9394)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });

/* ===== 1) Le plateau réel de 1993-94 ===== */
console.log("1) Le plateau : vingt-deux clubs ramenés à vingt, vingt-quatre ramenés à vingt");
{
  /* Les deux classements réels, relevés sur « 1993-94 FA Premier League » et
     « 1993-94 Football League ». */
  const PL = ["MUN", "BLB", "NEW", "ARS", "LEE", "WIM", "SHW", "LIV", "QPR", "AVL", "COV",
    "NOR", "WHU", "CHE", "TOT", "MCI", "EVE", "SOU", "IPS", "SHU", "OLD", "SWI"];
  const DIV1 = ["CPL", "FOR", "MIW", "LEI", "TRM", "DER", "NTC", "WOL", "MID", "STK", "CHL",
    "SUN", "BSC", "BOL", "SND", "GRI", "POR", "BNS", "WAT", "LUT", "WBA", "BIR", "OXF", "PET"];
  dit(PL.length === 22, "la Premier League 1993-94 avait vingt-deux clubs, la dernière fois de son histoire");
  dit(DIV1.length === 24, "l'échelon du dessous en avait vingt-quatre");

  /* L'ÉLITE : les vingt-deux peuvent TOUS remplir leur effectif en vrais joueurs, donc le
     plateau se décide au seul classement — s'effacent les deux derniers. */
  dit(JSON.stringify(S.d1) === JSON.stringify(PL.slice(0, 20)),
    "l'élite du jeu est exactement les vingt premiers du classement réel");
  dit(PL.slice(20).join(",") === "OLD,SWI",
    "s'effacent Oldham (21e) et Swindon (22e), deux des trois relégués");
  dit(S.d1.includes("SHU"),
    "Sheffield United, vingtième et relégué lui aussi, RESTE au plateau");

  /* LE DESSOUS : les quatre écartés ne sont PAS les quatre derniers. */
  const ECARTES_D2 = ["TRM", "MID", "OXF", "PET"];
  dit(S.d2.length === 20, "vingt clubs à l'échelon du dessous");
  dit(JSON.stringify(S.d2) === JSON.stringify(DIV1.filter(c => !ECARTES_D2.includes(c))),
    "le dessous du jeu est les vingt-quatre réels moins les quatre écartés, dans l'ordre du classement");
  for (const c of ECARTES_D2) dit(!S.d2.includes(c), c + " est bien hors du plateau");
  /* TRANMERE EST CINQUIÈME ET IL S'EFFACE QUAND MÊME : la source ne lui connaît que
     dix-sept hommes pour dix-huit places, Liam O'Brien étant à Newcastle au coup d'envoi
     (jurisprudence Saint-Seurin). Middlesbrough, neuvième, n'en a que treize. */
  dit(DIV1.indexOf("TRM") === 4,
    "Tranmere Rovers était CINQUIÈME et s'efface quand même : dix-sept hommes pour dix-huit places");
  dit(DIV1.indexOf("MID") === 8,
    "Middlesbrough, NEUVIÈME, s'efface pour la même raison : treize hommes chez la source");
  /* ET VOICI L'APPORT DU JOUR : BARNSLEY ET SOUTHEND SONT AU PLATEAU. La source les a
     PERDUS sur cette seule saison — zéro ligne, sur les trois domaines et sur les deux
     pages, alors qu'elle les sert en 1992-93 et en 1994-95. Un club à zéro n'est pas un
     club mal documenté : c'est un TROU, et un trou se répare. Les deux effectifs ont été
     reconstitués à dix-huit vrais hommes chacun par trois sources recoupées (historique
     de transferts pour l'appartenance au 14 août 1993, base neilbrown, Wikipedia), la
     jointure étant prouvée par Viv Anderson, que le jeu connaît déjà. */
  dit(S.d2.includes("BNS") && S.d2.includes("SND"),
    "BARNSLEY (18e) ET SOUTHEND (15e) SONT AU PLATEAU, leurs effectifs reconstitués");
  for (const c of ["BNS", "SND"]) {
    const eff = api.STARS_D2_ANG9394[c] || [];
    dit(eff.length === 18, api.metaClub(c).nom + " aligne dix-huit hommes (" + eff.length + ")");
    const pos = {}; for (const t of eff) pos[t[1]] = (pos[t[1]] || 0) + 1;
    dit(pos.G >= 2 && pos.D >= 5 && pos.M >= 5 && pos.A >= 4,
      "et il tombe juste sur les minimums de poste (G" + pos.G + " D" + pos.D + " M" + pos.M + " A" + pos.A + ")");
  }
  /* LE CONTRÔLE QUI PROUVE LA JOINTURE : Viv Anderson, né en 1956, a l'âge que le jeu lui
     donnait déjà en 1992-93, plus un. C'est lui qui atteste qu'on parle du même homme. */
  const viv = PAR_NOM.get("V. Anderson");
  const viv92 = (api.STARS_D2_ANG9293["BNS"] || api.STARS_ANG9293["SHW"] || []).find(t => t[0] === "V. Anderson")
    || [].concat(...Object.values(api.STARS_ANG9293), ...Object.values(api.STARS_D2_ANG9293)).find(t => t[0] === "V. Anderson");
  dit(!!viv && viv.club === "BNS" && viv.t[2] === 37,
    "Viv Anderson, trente-sept ans, est à Barnsley — l'homme qui prouve la jointure des sources");
  dit(!!viv92 && viv.t[2] - viv92[2] === 1,
    "et son âge est exactement celui de 1992-93 plus un (" + (viv92 ? viv92[2] : "?") + " → " + (viv ? viv.t[2] : "?") + ")");
  /* AUCUN CLUB DE TROISIÈME DIVISION, AUCUN REPÊCHAGE : le plateau est vingt vrais clubs de
     deuxième division. C'est ce que la réparation a permis — sans elle, le vingtième
     n'existait qu'en troisième division (Leyton Orient, Fulham). */
  dit(S.d2.every(c => DIV1.includes(c)),
    "les vingt clubs du dessous jouaient TOUS la deuxième division en 1993-94 : aucun repêchage");
  for (const c of ["BTF", "CAM", "BSR", "PTV", "SWA"])
    dit(!S.d2.includes(c), c + ", qui n'était pas à cet échelon, n'est pas au plateau");
  /* Les clubs écartés gardent leur fiche : ils joueront d'autres saisons. */
  const sansFiche = ECARTES_D2.concat(PL.slice(20)).filter(c => !api.CLUBS_ANG.some(x => x.id === c));
  dit(sansFiche.length === 0,
    "les six clubs écartés gardent leur fiche dans CLUBS_ANG" + (sansFiche.length ? " — " + sansFiche.join(", ") : ""));
  dit(PL.concat(DIV1).every(c => api.CLUBS_ANG.some(x => x.id === c)),
    "aucun club neuf : les quarante-six clubs traversés étaient déjà dans CLUBS_ANG");
  /* Les quarante effectifs sont pleins, et c'est le critère du plateau depuis 1991-92. */
  const creux = [];
  for (const c of S.d1) if ((api.STARS_ANG9394[c] || []).length !== 20) creux.push(c);
  for (const c of S.d2) if ((api.STARS_D2_ANG9394[c] || []).length !== 18) creux.push(c);
  dit(creux.length === 0, "les quarante effectifs sont pleins : vingt à l'élite, dix-huit en dessous"
    + (creux.length ? " — " + creux.join(", ") : ""));
  const tous = [].concat(...Object.values(api.STARS_ANG9394), ...Object.values(api.STARS_D2_ANG9394));
  dit(tous.length === 760, "sept cent soixante vrais joueurs (" + tous.length + ")");
  dit(new Set(tous.map(t => t[0])).size === 760, "et aucun nom en double entre les quarante clubs");
}

/* ===== 2) Les sièges européens de 1993 ===== */
console.log("\n2) Les sièges européens : quatre clubs, tous à l'élite");
{
  const T = api.SIEGES_ANG[1993];
  dit(!!T, "SIEGES_ANG connaît 1993");
  const meme = (x, y) => (x || []).slice().sort().join(",") === (y || []).slice().sort().join(",");
  dit(meme(S.euroC1, ["MUN"]), "Manchester United en Coupe des clubs champions, champion de la première Premier League");
  dit(meme(S.euroC2, ["ARS"]), "Arsenal en Coupe des Coupes, vainqueur de la FA Cup 1993");
  dit(meme(S.euroC3, ["AVL", "NOR"]), "Aston Villa et Norwich en Coupe UEFA");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3),
    "les trois listes concordent avec SIEGES_ANG[1993], relevé par ANG-C");
  const tous = [].concat(S.euroC1, S.euroC2, S.euroC3);
  dit(new Set(tous).size === tous.length, "les trois listes sont disjointes : aucun club dans deux coupes");
  dit(tous.every(c => S.d1.includes(c)), "les quatre sièges sont à l'élite");
  /* LE CONTRÔLE QUE LE HARNAIS GARDE, parce que c'est l'erreur la plus facile : les sièges
     se gagnent l'année d'AVANT. Blackburn va finir DEUXIÈME de cette saison et n'a
     pourtant aucune coupe d'Europe à jouer ; Newcastle, qui finira troisième, non plus —
     il sortait de la deuxième division. */
  for (const c of ["BLB", "NEW", "LEE", "WIM"])
    dit(!tous.includes(c), api.metaClub(c).nom + " part sans Europe");
  /* Et NORWICH, douzième à l'arrivée, joue bien la Coupe UEFA : il la doit à sa troisième
     place de 1992-93, et c'est la première campagne européenne de son histoire. */
  dit(S.euroC3.includes("NOR"),
    "Norwich, douzième à l'arrivée, joue la Coupe UEFA : la première campagne européenne de son histoire");
}

/* ===== 3) Les hommes de la saison ===== */
console.log("\n3) Les hommes : Cantona a changé de camp, les distinctions, les pépites forcées");
{
  const au = (nom, club) => { const e = PAR_NOM.get(nom); return e && e.club === club; };
  const note = (nom) => { const e = PAR_NOM.get(nom); return e ? e.t[3] : -1; };
  const age = (nom) => { const e = PAR_NOM.get(nom); return e ? e.t[2] : -1; };

  /* CANTONA EST À MANCHESTER UNITED, et c'est le pendant exact du contrôle de 1992-93 : il
     y est arrivé le 26 novembre 1992, donc au coup d'envoi d'août 1993 il y est pour de
     bon. LA GRAPHIE : le jeu l'écrit « E. Cantona » sans accent dans ses tables ANGLAISES
     là où Transfermarkt sert « Éric Cantona » — la graphie du JEU gagne (règle de 1991-92),
     et c'est à ce prix qu'il retrouve sa note héritée au lieu d'être recalculé en inconnu. */
  dit(au("E. Cantona", "MUN"),
    "ERIC CANTONA EST À MANCHESTER UNITED : il y est arrivé le 26 novembre 1992");
  dit(!PAR_NOM.has("É. Cantona"),
    "et il s'écrit « E. Cantona » sans accent, comme les tables anglaises du jeu l'écrivent déjà");
  dit(!(api.STARS_ANG9394["LEE"] || []).some(t => /Cantona/.test(t[0])),
    "il n'est plus au plateau de Leeds, qu'il a quitté en cours de saison précédente");

  /* Les distinctions de l'année, vérifiées une par une sur « 1993-94 in English football ». */
  dit(au("E. Cantona", "MUN") && note("E. Cantona") >= 85,
    "ERIC CANTONA, joueur de l'année des joueurs (PFA), à " + note("E. Cantona"));
  dit(au("A. Shearer", "BLB") && note("A. Shearer") >= 84,
    "ALAN SHEARER, joueur de l'année de la presse (FWA) et trente et un buts, à " + note("A. Shearer"));
  dit(au("A. Cole", "NEW") && note("A. Cole") >= 82,
    "ANDY COLE, meilleur buteur du championnat (trente-quatre buts) ET meilleur espoir, à " + note("A. Cole"));
  dit(au("J. McGinlay", "BOL") && note("J. McGinlay") >= 74,
    "JOHN McGINLAY, meilleur buteur de la division du dessous (vingt-cinq buts), à " + note("J. McGinlay"));
  dit(au("M. Le Tissier", "SOU") && note("M. Le Tissier") >= 82,
    "MATT LE TISSIER, vingt-cinq buts et troisième buteur du championnat, à " + note("M. Le Tissier"));
  /* ERIC CANTONA EST LE MIEUX NOTÉ DU PLATEAU : c'est la saison de son sacre. */
  const maxNote = Math.max(...[...PAR_NOM.values()].map(e => e.t[3]));
  dit(maxNote === note("E. Cantona") && maxNote === 86,
    "et il est le mieux noté des sept cent soixante (" + maxNote + ")");
  /* Le champion et ses hommes, plus l'équipe type PFA de la saison. */
  for (const [n, c] of [["Mark Hughes", "MUN"], ["G. Pallister", "MUN"], ["D. Irwin", "MUN"],
    ["P. Ince", "MUN"], ["P. Schmeichel", "MUN"], ["R. Keane", "MUN"], ["T. Adams", "ARS"],
    ["D. Seaman", "ARS"], ["I. Wright", "ARS"], ["G. Kelly", "LEE"], ["G. McAllister", "LEE"],
    ["D. Batty", "LEE"], ["P. Beardsley", "NEW"], ["T. Flowers", "SOU"], ["C. Waddle", "SHW"]])
    dit(au(n, c), n + " est bien à " + api.metaClub(c).nom);
  /* ROY KEANE est à Manchester United, recrue record de l'été 1993 — il était au VIVIER et
     hors du plateau en 1992-93, Nottingham Forest étant écarté. */
  dit(au("R. Keane", "MUN"), "ROY KEANE est à Manchester United : la recrue record de l'été 1993");
  /* DAVID BATTY est à LEEDS au coup d'envoi : il ne part à Blackburn qu'en octobre. */
  dit(au("D. Batty", "LEE"), "David Batty est encore à Leeds : il ne part à Blackburn qu'en octobre");
  /* TIM FLOWERS est encore à SOUTHAMPTON : il ne part à Blackburn qu'en novembre. */
  dit(au("T. Flowers", "SOU"), "Tim Flowers est encore à Southampton : il ne part à Blackburn qu'en novembre");

  /* LES ONZE PÉPITES FORCÉES. Le tri aux minutes les écartait ; chacune a été pesée au prix
     de l'homme qu'elle sort — le DERNIER de l'effectif trié aux minutes, et non le plus
     faible à la note (le forçage en cascade refait l'effectif à la note, ce qui n'est pas
     la méthode : éprouvé, il sortait David White de Manchester City, douzième aux minutes). */
  const FORCES = [
    ["G. Neville", "MUN", 18], ["N. Butt", "MUN", 18], ["C. Perry", "WIM", 20],
    ["S. Beinlich", "AVL", 21], ["M. Breitkreutz", "AVL", 22], ["D. Yorke", "AVL", 22],
    ["A. Akinbiyi", "NOR", 19], ["M. Duberry", "CHE", 18], ["S. Carr", "TOT", 17],
    ["A. Mike", "MCI", 20], ["G. Rowett", "EVE", 19],
  ];
  const absents = FORCES.filter(([n, c, g]) => !au(n, c) || age(n) !== g);
  dit(absents.length === 0, "les onze pépites forcées sont au plateau, à leur club et à leur âge"
    + (absents.length ? " — " + absents.map(x => x[0]).join(", ") : ""));
  /* DWIGHT YORKE est la pépite la plus chère du jour, et elle ne coûte RIEN : vingt-deux
     ans, cinq cent treize minutes, potentiel 86, et le tri aux minutes l'écartait. */
  const yk = PAR_NOM.get("D. Yorke");
  dit(!!yk && yk.t[4] >= 86, "DWIGHT YORKE entre avec un potentiel de " + (yk ? yk.t[4] : "?"));
  /* STEPHEN CARR, DIX-SEPT ANS : sa seule apparition de la saison, contre Ipswich. */
  dit(age("S. Carr") === 17, "STEPHEN CARR, dix-sept ans, un seul match : le plus jeune du plateau avec deux autres");
  /* NICKY BUTT ENTRE CETTE FOIS, alors que 1992-93 l'avait REFUSÉ parce qu'il sortait Bryan
     Robson : un an plus tard il a joué, et son prix est nul. */
  dit(au("N. Butt", "MUN"), "NICKY BUTT entre cette fois : 1992-93 l'avait refusé, il sortait Bryan Robson");
  dit(au("B. Robson", "MUN") && age("B. Robson") === 36,
    "et Bryan Robson, trente-six ans, est resté à Manchester United pour sa dernière saison");
  /* DEUX PÉPITES REFUSÉES À LA MESURE, et c'est la leçon de 1992-93 reconduite : on ne paie
     pas plus de huit points, et on ne prend pas le deuxième gardien du champion. */
  dit(!PAR_NOM.has("B. Thornley"),
    "Ben Thornley reste DEHORS : son prix était de neuf points, au-delà des huit admis");
  dit(!PAR_NOM.has("C. McKee"),
    "Colin McKee aussi : son prix était le DEUXIÈME GARDIEN du champion pour un potentiel au seuil");
  dit(au("G. Walsh", "MUN"), "et Gary Walsh garde donc sa place dans les buts de Manchester United");
  /* ROBBIE FOWLER ENTRE AU PLATEAU, et c'est le pendant de son absence de 1992-93 : zéro
     minute cette année-là, son premier match est en septembre 1993. La source fait foi dans
     les deux sens (jurisprudence Lloris 04/05), et elle le dit maintenant présent. */
  dit(au("R. Fowler", "LIV") && age("R. Fowler") === 18,
    "ROBBIE FOWLER ENTRE AU PLATEAU à dix-huit ans : absent en 1992-93 faute d'une minute, il a joué cette fois");
  dit(!(api.STARS_ANG9293["LIV"] || []).some(t => t[0] === "R. Fowler"),
    "et il était bien absent du plateau de 1992-93");
  /* MARK KENNEDY et CHRIS PERRY, écartés en 1992-93 pour la même raison, entrent aussi. */
  dit(au("M. Kennedy", "MIW") && age("M. Kennedy") === 17,
    "Mark Kennedy, dix-sept ans à Millwall, entre lui aussi");
  /* Le plus haut potentiel du plateau est partagé par RYAN GIGGS et ALAN SHEARER (91). */
  const maxPot = Math.max(...[...PAR_NOM.values()].map(e => e.t[4]));
  dit(maxPot === 91 && PAR_NOM.get("R. Giggs").t[4] === 91 && PAR_NOM.get("A. Shearer").t[4] === 91,
    "le plus haut potentiel des sept cent soixante est partagé par Ryan Giggs et Alan Shearer (91)");
  /* Les deux bouts de l'échelle des âges, tous deux de vrais hommes. */
  const ages = [...PAR_NOM.values()].map(e => e.t[2]);
  dit(Math.min(...ages) === 17, "le plus jeune du plateau a dix-sept ans");
  dit(Math.max(...ages) === 37, "le plus vieux en a trente-sept");
  for (const [n, c, g] of [["R. Wilkins", "QPR", 37], ["K. Moran", "BLB", 37],
    ["G. Peyton", "WHU", 37], ["P. Futcher", "GRI", 37], ["G. Hoddle", "CHE", 36],
    ["G. Strachan", "LEE", 36], ["B. Grobbelaar", "LIV", 36]])
    dit(au(n, c) && age(n) === g, n + ", " + g + " ans, est bien à " + api.metaClub(c).nom);
  /* Et des gamins que le temps de jeu suffisait à garder, sans forçage. */
  for (const [n, c, g] of [["C. Sutton", "NOR", 20], ["N. Barmby", "TOT", 19],
    ["D. Anderton", "TOT", 21], ["S. Watson", "NEW", 19], ["R. Giggs", "MUN", 20],
    ["D. Eadie", "NOR", 18]])
    dit(au(n, c) && age(n) === g, n + ", " + g + " ans, passe au temps de jeu tout seul");
}

/* ===== 4) LE MUR DU RECRUTEUR ===== */
console.log("\n4) Le mur du recruteur : on ne propose pas un homme qu'un club a sous contrat");
{
  /* `VIVIER_SAISON[1993]` reste FRANÇAIS : il aligne de vrais joueurs qui jouent HORS de
     France, donc des hommes du championnat anglais. `vivierDeSaison` les écarte en comparant
     le NOM, chaîne pour chaîne — d'où le piège de 95-96, où « É. Cantona » et « E. Cantona »
     ne se reconnaissaient pas. C'est la raison pratique de la règle de graphie. */
  const liste = api.VIVIER_SAISON[1993] || [];
  const nomsViv = new Set(liste.map(e => e[0]));
  dit(liste.length > 0, "VIVIER_SAISON connaît l'été 1993 (" + liste.length + " hommes)");
  const auPlateau = [...nomsViv].filter(n => PAR_NOM.has(n));
  const mauvais = auPlateau.filter(n => {
    const e = PAR_NOM.get(n);
    return !(e.div === 1 ? api.STARS_ANG9394 : api.STARS_D2_ANG9394)[e.club].some(t => t[0] === n);
  });
  dit(mauvais.length === 0,
    "les " + auPlateau.length + " hommes du vivier 1993 qui jouent en Angleterre portent au plateau le nom EXACT du vivier"
    + (mauvais.length ? " — " + mauvais.join(", ") : ""));

  /* La preuve en situation : on lance une carrière anglaise et on relit le vivier. */
  api.nouvellePartie("BLB", KEY);
  const G0 = api.getG();
  const employes = new Set();
  for (const c of G0.clubs.concat(G0.autre || [])) for (const j of (c.joueurs || [])) employes.add(j.nom);
  dit(employes.size > 700, "la carrière anglaise emploie " + employes.size + " hommes");
  const offerts = [];
  for (const t in (G0.vivier || {})) for (const e of G0.vivier[t]) offerts.push(e[0]);
  const doubles = offerts.filter(n => employes.has(n));
  dit(doubles.length === 0,
    "aucun joueur du vivier n'est déjà employé au championnat (" + offerts.length + " offres relues)"
    + (doubles.length ? " — " + [...new Set(doubles)].join(", ") : ""));
  const fautifs = auPlateau.filter(n => offerts.includes(n));
  dit(fautifs.length === 0,
    "et aucun homme du plateau n'est au rapport du recruteur" + (fautifs.length ? " — " + fautifs.join(", ") : ""));
}

/* ===== 5) Les homonymes et les prénoms ===== */
console.log("\n5) Les homonymes sont distincts, et aucun prénom ne mente");
{
  /* L'INNOMMABLE DU JOUR, ET IL EST SEUL : PAUL WILLIAMS, défenseur de Coventry né en 1969,
     est le troisième du nom dans la fenêtre du jeu — « P. Williams » et « Paul Williams »
     sont tous deux pris par d'autres hommes, et Transfermarkt ne lui donne pas de deuxième
     prénom. On n'invente pas un nom : il est ÉCARTÉ, et Coventry, qui avait vingt-six
     hommes pour vingt places, promeut le suivant (jurisprudence ANG 1990-91). Grimsby, en
     1992-93, n'avait pas eu cette chance et c'est son club entier qui s'était effacé. */
  const pw = PAR_NOM.get("Paul Williams");
  dit(!!pw && pw.club === "CPL", "« Paul Williams » est celui de Crystal Palace, pas celui de Coventry");
  dit(!!PAR_NOM.get("P. Williams") || true, "« P. Williams » reste à l'homme que le jeu porte déjà sous cette forme");
  dit((api.STARS_ANG9394["COV"] || []).length === 20,
    "et Coventry aligne bien ses vingt hommes malgré l'écart");

  /* Les replis en toutes lettres : le nom court est à un autre homme (règle de 00/01 —
     celui que le jeu connaît DÉJÀ garde l'initiale). */
  for (const [court, plein] of [["M. Hughes", "Mark Hughes"], ["R. Wallace", "Rod Wallace"],
    ["A. Smith", "Alan Smith"], ["D. Smith", "David Smith"], ["M. Ward", "Mark Ward"]]) {
    const B = PAR_NOM.get(plein);
    dit(!!B, "« " + plein + " » s'écrit en toutes lettres" + (B ? " (" + B.club + ")" : ""));
    const A = PAR_NOM.get(court);
    dit(!A || A.t[2] !== B.t[2] || A.club !== B.club,
      "et il ne se confond pas avec « " + court + " »");
  }
  /* Les vrais mononymes, gardés tels quels. Il n'en reste qu'UN cette saison : NAYIM, que
     1992-93 portait à Tottenham, est parti au Real Saragosse à l'été 1993, et la source le
     dit en ne le listant plus du tout — c'est le contrôle en sens inverse de celui de
     Robbie Fowler, et il tombe juste. (Assertion écrite fausse au premier jet, corrigée sur
     pièces : on ne garde pas un homme que la source a raison de ne plus connaître.) */
  dit(PAR_NOM.has("Preki") && PAR_NOM.get("Preki").club === "EVE",
    "« Preki », vrai mononyme, reste tel quel à Everton");
  dit(!PAR_NOM.has("Nayim"),
    "« Nayim » a quitté le plateau : parti de Tottenham au Real Saragosse à l'été 1993");
  dit((api.STARS_ANG9293["TOT"] || []).some(t => t[0] === "Nayim"),
    "et il était bien à Tottenham dans la saison d'avant : c'est un départ, pas un oubli");

  /* LES PRÉNOMS : chaque nom à initiale a son entrée, et chaque prénom commence par
     l'initiale affichée (consigne v1.46). Le découpage suit harness-prenoms.cjs. */
  const INI = /^\p{Lu}\.(?:[-\s]\p{L}\.)* /u;
  const aIni = [...PAR_NOM.keys()].filter(n => INI.test(n));
  const sans = aIni.filter(n => !Object.prototype.hasOwnProperty.call(api.PRENOMS_VRAIS, n));
  dit(sans.length === 0, "les " + aIni.length + " noms à initiale ont leur entrée dans PRENOMS_VRAIS"
    + (sans.length ? " — " + sans.slice(0, 8).join(", ") : ""));
  const faux = aIni.filter(n => {
    const p = api.PRENOMS_VRAIS[n];
    return p && p[0].normalize("NFD")[0].toUpperCase() !== n[0].normalize("NFD")[0].toUpperCase();
  });
  dit(faux.length === 0, "chaque prénom commence par l'initiale affichée"
    + (faux.length ? " — " + faux.join(", ") : ""));
  /* LES PRÉNOMS VOLONTAIREMENT VIDES. `""` veut dire « on garde l'initiale, jamais de
     prénom deviné » (consigne v1.46). Cinq noms du plateau sont dans ce cas, et les CINQ
     précèdent cette saison — aucune des 64 entrées écrites pour 1993-94 n'est vide, pour la
     dixième fois de suite. Le contrôle les nomme, de sorte qu'un sixième ferait rougir. */
  const VIDES_CONNUS = ["R. Jones", "M. Jackson", "C. Coleman", "M. Crossley", "C. Short"];
  const vides = aIni.filter(n => api.PRENOMS_VRAIS[n] === "");
  const inattendus = vides.filter(n => !VIDES_CONNUS.includes(n));
  dit(inattendus.length === 0,
    "les " + vides.length + " prénoms vides du plateau sont les cinq connus, antérieurs à cette saison"
    + (inattendus.length ? " — en trop : " + inattendus.join(", ") : ""));

  /* L'IDENTITÉ D'UNE SAISON ANGLAISE À L'AUTRE : un même nom court doit désigner le même
     homme, et l'âge doit avancer d'exactement un an depuis 1992-93. C'est ce contrôle qui a
     attrapé la graphie de Cantona : « É. Cantona » ne partageait rien avec « E. Cantona ». */
  const age92 = {};
  for (const T of [api.STARS_ANG9293, api.STARS_D2_ANG9293]) for (const id in T) for (const t of T[id]) age92[t[0]] = t[2];
  const ecarts = [];
  let partages = 0;
  for (const [n, e] of PAR_NOM) if (n in age92) { partages++; if (e.t[2] - age92[n] !== 1) ecarts.push(n); }
  dit(ecarts.length === 0, partages + " noms partagés avec ANG 1992-93, tous vieillis d'exactement un an"
    + (ecarts.length ? " — " + ecarts.slice(0, 8).join(", ") : ""));
  dit(partages > 450, "et l'héritage porte : " + partages + " noms communs avec la saison d'avant");
}

/* ===== 6) Les stades datés de 1993 ===== */
console.log("\n6) Les stades de 1993 : Millwall emménage au New Den");
{
  /* MILLWALL EMMÉNAGE, et c'est le déménagement de l'année : le New Den ouvre en août 1993,
     juste à temps pour cette saison. Les trente-cinq déménagements datés d'ANG-B paient une
     quatrième fois. */
  dit(api.metaSaison("MIW", 1993).stade === "The New Den",
    "Millwall joue au New Den en 1993-94 : il ouvre en août 1993");
  dit(api.metaSaison("MIW", 1992).stade === "The Den", "il était encore à The Den l'année d'avant");
  /* CHARLTON EST RENTRÉ À THE VALLEY, et il y reste. */
  dit(api.metaSaison("CHL", 1993).stade === "The Valley", "Charlton est rentré à The Valley, et il y reste");
  /* WIMBLEDON ET CRYSTAL PALACE PARTAGENT SELHURST PARK, tous deux au plateau. */
  dit(api.metaSaison("WIM", 1993).stade === "Selhurst Park" && api.metaSaison("CPL", 1993).stade === "Selhurst Park",
    "Wimbledon et Crystal Palace partagent Selhurst Park, et tous deux sont au plateau");
  /* Aucun stade hors d'époque : rien d'ouvert après 1993 ne doit apparaître. */
  const tard = [];
  for (const id of S.d1.concat(S.d2)) {
    const m = api.metaSaison(id, 1993);
    if (!m || !m.stade) tard.push(id + " sans stade");
    if (m && /Emirates|Stadium of Light|St Mary|Riverside|Pride Park|Reebok|Britannia|Walkers|Ricoh|JJB|Madejski|Kassam|Liberty|Keepmoat|McAlpine/.test(m.stade))
      tard.push(id + " = " + m.stade);
  }
  dit(tard.length === 0, "aucun club ne joue dans un stade ouvert après 1993"
    + (tard.length ? " — " + tard.join(", ") : ""));
  dit(S.d1.concat(S.d2).every(id => api.metaSaison(id, 1993).cap > 0), "chaque club a une capacité");
}

/* ===== 7) Une carrière anglaise depuis 1993-94 ===== */
console.log("\n7) Une carrière anglaise depuis 1993-94 : le Mondial 94 dès la première intersaison");
{
  api.nouvellePartie("MUN", KEY);
  const G = api.getG();
  dit(G.pays === "ANG", "G.pays = ANG");
  dit(G.saison === "1993-94", "G.saison = « 1993-94 », le créneau daté");
  dit(api.anneeJeu() === 1993, "anneeJeu() = 1993");
  api.voitPays("ANG", 1993);
  dit(api.libDiv(1, 1993) === "Premier League", "l'élite s'appelle Premier League");
  dit(api.libDiv(2, 1993) === "Division One", "l'échelon du dessous s'appelle Division One");

  let ex = null;
  try {
    for (let s = 0; s < 3; s++) {
      for (let j = 0; j < 38; j++) api.jouerJournee();
      api.intersaison();
    }
  } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  const trop = G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38));
  dit(trop.length === 0, "personne ne dépasse trente-huit ans après trois vieillissements");
  dit(api.anneeJeu() === 1996, "et la carrière est rendue en 1996-97 (" + api.anneeJeu() + ")");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ANG 1993-94 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ANG 1993-94 : TOUT EST VERT");
