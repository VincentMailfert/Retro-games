/* Harnais de validation — SAISON DE DÉPART ANG 1992-93
   La QUATRIÈME saison anglaise, et la PREMIÈRE Premier League de l'histoire.
   `harness-angleterre.cjs` tient déjà le cadre (20+20, le mur européen, les libellés
   d'époque, la carrière) et il balaie toutes les saisons `pays:"ANG"` ; il ne vérifie pas,
   et c'est voulu, les FAITS de cette année-là. C'est le travail d'ici :
   1) le plateau est le vrai : la Premier League ramenée de vingt-deux à vingt, l'échelon du
      dessous de vingt-quatre à vingt — et les quatre écartés du dessous ne sont PAS les
      quatre derniers : Tranmere (4e) et Southend manquent d'hommes, et GRIMSBY (9e) manque
      d'un NOM LIBRE, ce que le chantier n'avait jamais rencontré
   2) les sièges européens de 1992-93 : Leeds en C1, Liverpool en C2, Manchester United et
      Sheffield Wednesday en C3 — et le champion de l'année part SANS Europe
   3) les hommes de la saison : CANTONA EST À LEEDS au coup d'envoi, les cinq distinctions,
      les seize pépites forcées, les deux bouts de l'échelle des âges
   4) LE MUR DU RECRUTEUR : les cinq hommes que `VIVIER_SAISON[1992]` chiffre et qui jouent
      le championnat anglais ne doivent JAMAIS être proposés par le recruteur
   5) les homonymes sont distincts, et aucun prénom ne mente — les TROIS frères Wallace,
      trois Mark Smith dont un innommable, et les noms qui doivent rester absents
   6) les stades de 1992 : Charlton rentre à The Valley, Millwall encore à The Den,
      Wimbledon et Crystal Palace qui partagent Selhurst Park
   7) une carrière, l'été 1993 muet et le Mondial 94 à la deuxième intersaison
   Usage : node harness-ang9293.cjs                                                        */
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
  "voitPays,SAISONS,STARS_ANG9293,STARS_D2_ANG9293,D1_ANG9293,D2_ANG9293,SIEGES_ANG,VIVIER_SAISON," +
  "PRENOMS_VRAIS,CLUBS_ANG,STARS_ANG9192,STARS_D2_ANG9192,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ANG-1992-93";
const S = api.SAISONS[KEY];

/* Tous les hommes du plateau, par nom court. */
const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ANG9293)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ANG9293)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });

/* ===== 1) Le plateau réel de 1992-93 ===== */
console.log("1) Le plateau : vingt-deux clubs ramenés à vingt, vingt-quatre ramenés à vingt");
{
  /* Les deux classements réels, relevés sur Wikipedia. La table du dessous se lit par le
     TROISIÈME format signalé par ANG-B (un `team_order=` dans « 1992–93 Football League »),
     ni `teamN=` ni transclusion : s'arrêter au premier format laissait les 24 clubs dehors. */
  const PL = ["MUN", "AVL", "NOR", "BLB", "QPR", "LIV", "SHW", "TOT", "MCI", "ARS", "CHE",
    "WIM", "EVE", "SHU", "COV", "IPS", "LEE", "SOU", "OLD", "CPL", "MID", "FOR"];
  const DIV1 = ["NEW", "WHU", "POR", "TRM", "SWI", "LEI", "MIW", "DER", "GRI", "PET", "WOL", "CHL",
    "BNS", "OXF", "BSC", "WAT", "NTC", "SND", "BIR", "LUT", "SUN", "BTF", "CAM", "BSR"];
  dit(PL.length === 22, "la Premier League 1992-93 avait vingt-deux clubs, la première de l'histoire");
  dit(DIV1.length === 24, "l'échelon du dessous en avait vingt-quatre");

  /* L'ÉLITE : les vingt-deux peuvent TOUS remplir leur effectif en vrais joueurs, donc le
     plateau se décide au seul classement — s'effacent les deux derniers. */
  dit(JSON.stringify(S.d1) === JSON.stringify(PL.slice(0, 20)),
    "l'élite du jeu est exactement les vingt premiers du classement réel");
  const ecartesD1 = PL.slice(20);
  dit(ecartesD1.join(",") === "MID,FOR",
    "s'effacent Middlesbrough (21e) et Nottingham Forest (22e), deux des trois relégués");
  dit(S.d1.includes("CPL"), "Crystal Palace, vingtième et relégué lui aussi, RESTE au plateau");

  /* LE DESSOUS : les quatre écartés ne sont PAS les quatre derniers. */
  const ECARTES_D2 = ["TRM", "SND", "GRI", "BSR"];
  dit(S.d2.length === 20, "vingt clubs à l'échelon du dessous");
  const attenduD2 = DIV1.filter(c => !ECARTES_D2.includes(c));
  dit(JSON.stringify(S.d2) === JSON.stringify(attenduD2),
    "le dessous du jeu est les vingt-quatre réels moins les quatre écartés, dans l'ordre du classement");
  for (const c of ECARTES_D2) dit(!S.d2.includes(c), c + " est bien hors du plateau");
  /* TRANMERE EST QUATRIÈME, ET IL S'EFFACE QUAND MÊME : la source ne lui connaît que
     dix-sept hommes pour dix-huit places (jurisprudence Saint-Seurin). Southend seize. */
  dit(DIV1.indexOf("TRM") === 3,
    "Tranmere Rovers était QUATRIÈME et s'efface quand même : dix-sept hommes pour dix-huit places");
  dit(DIV1.indexOf("SND") === 17, "Southend United, dix-huitième, s'efface pour la même raison (seize hommes)");
  /* GRIMSBY, ET C'EST LA DÉCOUVERTE DU JOUR : il a ses dix-huit hommes, mais l'un d'eux,
     Mark Smith né en 1961, n'a AUCUNE FORME DE NOM LIBRE — « M. Smith » est à Martin Smith
     (1974, Sunderland en ANG 1995-96) et « Mark Smith » au défenseur né en 1960. ANG 1990-91
     avait déjà écarté des hommes innommables, mais leurs clubs avaient un homme de plus à
     promouvoir ; Grimsby n'en a pas. Un club peut donc ne pas remplir faute de NOM. */
  dit(DIV1.indexOf("GRI") === 8,
    "Grimsby Town était NEUVIÈME et s'efface : dix-huit hommes, mais l'un d'eux n'a aucun nom libre");
  const mSmith = PAR_NOM.get("M. Smith"), markSmith = PAR_NOM.get("Mark Smith");
  dit(!mSmith, "« M. Smith » n'est nulle part au plateau 1992-93 : il est à Martin Smith, né en 1974");
  dit(!!markSmith && markSmith.club === "NTC" && markSmith.t[2] === 32,
    "« Mark Smith » est bien le défenseur né en 1960, trente-deux ans, à Notts County");
  /* Les quatre écartés gardent leur fiche : ils joueront d'autres saisons. */
  const sansFiche = ECARTES_D2.concat(ecartesD1).filter(c => !api.CLUBS_ANG.some(x => x.id === c));
  dit(sansFiche.length === 0,
    "les six clubs écartés gardent leur fiche dans CLUBS_ANG" + (sansFiche.length ? " — " + sansFiche.join(", ") : ""));
  /* Aucun club neuf : les quarante-six traversés étaient déjà au registre. */
  dit(PL.concat(DIV1).every(c => api.CLUBS_ANG.some(x => x.id === c)),
    "aucun club neuf : les quarante-six clubs traversés étaient déjà dans CLUBS_ANG");
  /* Brentford et Cambridge, relégués, sont SAUVÉS parce que la source les documente. */
  dit(S.d2.includes("BTF") && S.d2.includes("CAM"),
    "Brentford (22e) et Cambridge (23e), tous deux relégués, restent au plateau");
}

/* ===== 2) Les sièges européens de 1992-93 ===== */
console.log("\n2) Les sièges européens : quatre clubs, tous à l'élite");
{
  const T = api.SIEGES_ANG[1992];
  dit(!!T, "SIEGES_ANG connaît 1992");
  const meme = (x, y) => (x || []).slice().sort().join(",") === (y || []).slice().sort().join(",");
  dit(meme(S.euroC1, ["LEE"]), "Leeds en Coupe des clubs champions, champion de la dernière First Division");
  dit(meme(S.euroC2, ["LIV"]), "Liverpool en Coupe des Coupes, vainqueur de la FA Cup 1992");
  dit(meme(S.euroC3, ["MUN", "SHW"]), "Manchester United et Sheffield Wednesday en Coupe UEFA");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3),
    "les trois listes concordent avec SIEGES_ANG[1992], relevé par ANG-C");
  /* Les trois listes sont DISJOINTES : nouvellePartie lit la compétition d'un club dedans. */
  const tous = [].concat(S.euroC1, S.euroC2, S.euroC3);
  dit(new Set(tous).size === tous.length, "les trois listes sont disjointes : aucun club dans deux coupes");
  dit(tous.every(c => S.d1.includes(c)), "les quatre sièges sont à l'élite");
  /* LE CONTRÔLE QUE LE HARNAIS GARDE, parce que c'est l'erreur la plus facile : les sièges se
     gagnent l'année d'AVANT. Manchester United va gagner le championnat 1992-93 et ne joue
     pourtant que la Coupe UEFA ; Aston Villa, qui finira deuxième, part sans Europe. */
  dit(!S.euroC1.includes("MUN"),
    "MANCHESTER UNITED, QUI VA GAGNER LE TITRE, N'EST PAS EN C1 : les sièges se gagnent l'année d'avant");
  dit(S.euroC3.includes("MUN"), "il joue la Coupe UEFA, au titre de sa deuxième place de 1991-92");
  for (const c of ["AVL", "NOR", "BLB", "QPR"])
    dit(!tous.includes(c), api.metaClub(c).nom + " part sans Europe");
}

/* ===== 3) Les hommes de la saison ===== */
console.log("\n3) Les hommes : Cantona à Leeds, les cinq distinctions, les pépites forcées");
{
  const au = (nom, club) => { const e = PAR_NOM.get(nom); return e && e.club === club; };
  const note = (nom) => { const e = PAR_NOM.get(nom); return e ? e.t[3] : -1; };
  const age = (nom) => { const e = PAR_NOM.get(nom); return e ? e.t[2] : -1; };

  /* CANTONA EST À LEEDS, et c'est le fait le plus contre-intuitif de la saison. Il a quitté
     Leeds pour Old Trafford le 26 NOVEMBRE 1992 : au coup d'envoi d'août, il est encore
     champion en titre avec Leeds. La colonne « Im Team seit » de Transfermarkt le dit
     (Leeds 06.02.1992, Manchester United 26.11.1992), et c'est elle qui arbitre un effectif
     de COUP D'ENVOI. Le nom de la saison raconte exactement ce mouvement. */
  dit(au("E. Cantona", "LEE"),
    "ERIC CANTONA EST À LEEDS au coup d'envoi : il ne part à Manchester United que le 26 novembre");
  dit(!(api.STARS_ANG9293["MUN"] || []).some(t => t[0] === "E. Cantona"),
    "et il n'est donc PAS au plateau de Manchester United, qui le recrutera en cours de saison");
  dit(S.nom === "Cantona change de camp", "le nom de la saison dit ce mouvement : « Cantona change de camp »");

  /* Les cinq distinctions de l'année, vérifiées une par une sur « 1992-93 in English football ». */
  dit(au("P. McGrath", "AVL") && note("P. McGrath") >= 83,
    "PAUL McGRATH, joueur de l'année des joueurs (PFA), à " + note("P. McGrath") + " (l'héritage seul le laissait à 74)");
  dit(au("C. Waddle", "SHW") && note("C. Waddle") >= 85,
    "CHRIS WADDLE, joueur de l'année de la presse (FWA), rentré de Marseille, à " + note("C. Waddle"));
  dit(au("T. Sheringham", "TOT") && note("T. Sheringham") >= 81,
    "TEDDY SHERINGHAM, meilleur buteur du championnat avec vingt-deux buts, à " + note("T. Sheringham"));
  dit(au("R. Giggs", "MUN") && note("R. Giggs") >= 78 && age("R. Giggs") === 19,
    "RYAN GIGGS, meilleur espoir pour la DEUXIÈME année de suite, dix-neuf ans, à " + note("R. Giggs"));
  dit(au("G. Whittingham", "POR") && note("G. Whittingham") >= 79,
    "GUY WHITTINGHAM, quarante-deux buts de championnat pour Portsmouth, à " + note("G. Whittingham"));
  /* Le champion et ses hommes. */
  dit(au("Mark Hughes", "MUN") && note("Mark Hughes") >= 84,
    "Mark Hughes, meilleur buteur du champion, à " + note("Mark Hughes"));
  for (const [n, c] of [["G. Pallister", "MUN"], ["P. Schmeichel", "MUN"], ["P. Ince", "MUN"],
    ["D. Seaman", "ARS"], ["I. Wright", "ARS"], ["T. Adams", "ARS"], ["A. Shearer", "BLB"],
    ["M. Le Tissier", "SOU"], ["L. Ferdinand", "QPR"], ["N. Southall", "EVE"], ["I. Rush", "LIV"],
    ["J. Barnes", "LIV"], ["D. Hirst", "SHW"], ["B. Deane", "SHU"]])
    dit(au(n, c), n + " est bien à " + api.metaClub(c).nom);

  /* LES SEIZE PÉPITES FORCÉES. Le tri aux minutes les écartait ; chacune a été pesée au prix
     de l'homme qu'elle sort (règle de 09/10 : on juge la DIFFÉRENCE, pas la carrière du forcé). */
  const FORCES = [
    ["D. Beckham", "MUN", 17], ["G. Neville", "MUN", 17], ["S. Campbell", "TOT", 18],
    ["S. Watson", "NEW", 18], ["Alan Thompson", "NEW", 19], ["D. Sturridge", "DER", 19],
    ["I. Hendon", "BNS", 21], ["S. Collymore", "CPL", 21], ["M. Thomas", "LIV", 25],
    ["M. Sterland", "LEE", 31], ["R. Harvey", "LUT", 23], ["S. Wood", "SOU", 29],
    ["P. Stephenson", "BTF", 24], ["Z. Kruszyński", "BTF", 32], ["P. McGee", "WIM", 24],
    ["D. Kharin", "CHE", 24],
  ];
  const absents = FORCES.filter(([n, c, g]) => !au(n, c) || age(n) !== g);
  dit(absents.length === 0, "les seize pépites forcées sont au plateau, à leur club et à leur âge"
    + (absents.length ? " — " + absents.map(x => x[0]).join(", ") : ""));
  /* DAVID BECKHAM, DIX-SEPT ANS ET DIX-HUIT MINUTES : sa première saison professionnelle,
     et le plus haut potentiel du plateau. */
  const bk = PAR_NOM.get("D. Beckham");
  dit(bk && bk.t[4] === 90, "DAVID BECKHAM, dix-sept ans, potentiel " + (bk ? bk.t[4] : "?"));
  /* Le plus haut potentiel du plateau n'est pas le sien mais celui de RYAN GIGGS (91), qui a
     deux ans de plus et joue déjà toute la saison ; Beckham et Shearer suivent à 90. */
  const maxPot = Math.max(...[...PAR_NOM.values()].map(e => e.t[4]));
  dit(maxPot === 91 && PAR_NOM.get("R. Giggs").t[4] === 91,
    "le plus haut potentiel des sept cent soixante est celui de Ryan Giggs (91)");
  dit(bk && bk.t[4] === 90 && PAR_NOM.get("A. Shearer").t[4] === 90,
    "Beckham et Alan Shearer le suivent à 90");
  /* GARY NEVILLE, TROIS MINUTES dans toute la saison : la borne basse de l'année. */
  dit(au("G. Neville", "MUN"), "GARY NEVILLE, dix-sept ans et TROIS MINUTES, est gardé");
  /* Mais la Class of '92 ne tient pas tout entière : forcer Butt et Gillespie aurait sorti
     BRYAN ROBSON et Mike Phelan, et on ne paie pas ce prix-là. */
  dit(!PAR_NOM.has("N. Butt") && !PAR_NOM.has("K. Gillespie"),
    "Nicky Butt et Keith Gillespie restent DEHORS : les forcer sortait Bryan Robson et Mike Phelan");
  dit(au("B. Robson", "MUN") && au("M. Phelan", "MUN"),
    "et Bryan Robson comme Mike Phelan sont bien restés à Manchester United");
  /* Même arbitrage à Chelsea : Pearce et Shipperley auraient coûté Cascarino et Le Saux. */
  dit(au("Tony Cascarino", "CHE") && au("G. Le Saux", "CHE"),
    "à Chelsea, Tony Cascarino et Graeme Le Saux sont restés : Pearce et Shipperley ne valaient pas ce prix");
  /* ROBBIE FOWLER N'EST PAS AU PLATEAU, et c'est la source qui a raison : dix-sept ans à
     Liverpool, ZÉRO minute en 1992-93, son premier match est en septembre 1993.
     Jurisprudence Lloris 04/05 : la source fait foi dans les deux sens. */
  dit(!PAR_NOM.has("R. Fowler"),
    "ROBBIE FOWLER est absent : zéro minute en 1992-93, et on ne force pas un homme qui n'a pas joué");
  /* Les deux bouts de l'échelle des âges, tous deux de vrais hommes. */
  const ages = [...PAR_NOM.values()].map(e => e.t[2]);
  dit(Math.min(...ages) === 17, "le plus jeune du plateau a dix-sept ans");
  dit(Math.max(...ages) === 37, "le plus vieux en a trente-sept");
  dit(au("M. Day", "LEE") && age("M. Day") === 37, "Mervyn Day garde les buts de Leeds à trente-sept ans");
  dit(au("R. Wilkins", "QPR") && age("R. Wilkins") === 36,
    "Ray Wilkins tient le milieu de QPR à trente-six ans, comme à trente-cinq en 1991-92");
  dit(au("Peter Reid", "MCI") && age("Peter Reid") === 36,
    "Peter Reid, trente-six ans, entraîneur-joueur de Manchester City");
  dit(au("V. Anderson", "SHW") && age("V. Anderson") === 36,
    "Viv Anderson, trente-six ans à Sheffield Wednesday");
  /* Et des gamins que le temps de jeu suffisait à garder, sans forçage. */
  for (const [n, c, g] of [["C. Bart-Williams", "SHW", 18], ["N. Barmby", "TOT", 18],
    ["C. Sutton", "NOR", 19], ["D. Anderton", "TOT", 20], ["I. Selley", "ARS", 18]])
    dit(au(n, c) && age(n) === g, n + ", " + g + " ans, passe au temps de jeu tout seul");
}

/* ===== 4) LE MUR DU RECRUTEUR ===== */
console.log("\n4) Le mur du recruteur : on ne propose pas un homme qu'un club a sous contrat");
{
  /* `VIVIER_SAISON[1992]` reste FRANÇAIS : il aligne de vrais joueurs qui jouent HORS de
     France, donc CINQ hommes du championnat anglais. `vivierDeSaison` les écarte en comparant
     le NOM, chaîne pour chaîne — d'où le piège de 95-96, où « É. Cantona » et « E. Cantona »
     ne se reconnaissaient pas. La règle : LA GRAPHIE DU JEU GAGNE, et pour un homme du
     championnat anglais ce sont les TABLES ANGLAISES qui la disent. */
  const ANGLAIS = [["E. Cantona", "LEE"], ["A. Shearer", "BLB"], ["I. Wright", "ARS"],
    ["T. Adams", "ARS"], ["D. Hirst", "SHW"]];
  const liste = api.VIVIER_SAISON[1992] || [];
  const nomsViv = new Set(liste.map(e => e[0]));
  const pb = [];
  for (const [nom, club] of ANGLAIS) {
    if (!nomsViv.has(nom)) { pb.push(nom + " n'est plus dans VIVIER_SAISON[1992]"); continue; }
    if (!(api.STARS_ANG9293[club] || []).some(t => t[0] === nom)) pb.push(nom + " introuvable à " + club);
  }
  dit(pb.length === 0,
    "les cinq hommes du vivier 1992 qui jouent en Angleterre portent au plateau le nom EXACT du vivier"
    + (pb.length ? " — " + pb.join(" ; ") : ""));
  /* ROY KEANE ET STUART PEARCE sont au vivier ET à Nottingham Forest, qui est HORS du
     plateau : ils sont donc réellement signables, et c'est une cohérence, pas un trou. */
  dit(nomsViv.has("R. Keane") && !PAR_NOM.has("R. Keane"),
    "Roy Keane est au vivier et PAS au plateau : il jouait Nottingham Forest, écarté du plateau");
  dit(nomsViv.has("S. Pearce") && !PAR_NOM.has("S. Pearce"),
    "Stuart Pearce de même : le vivier peut les proposer sans contredire le championnat");

  /* La preuve en situation : on lance une carrière anglaise et on relit le vivier. */
  api.nouvellePartie("LEE", KEY);
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
  const fautifs = ANGLAIS.map(x => x[0]).filter(n => offerts.includes(n));
  dit(fautifs.length === 0,
    "Cantona, Shearer, Wright, Adams et Hirst ne sont PAS au rapport du recruteur"
    + (fautifs.length ? " — " + fautifs.join(", ") : ""));
}

/* ===== 5) Les homonymes et les prénoms ===== */
console.log("\n5) Les homonymes sont distincts, et aucun prénom ne mente");
{
  /* LES TROIS FRÈRES WALLACE SONT AU PLATEAU LA MÊME ANNÉE, et c'est une première : Danny
     (1964) à Manchester United, et les JUMEAUX Rod et Ray (1969) tous deux à Leeds. Rod,
     que le jeu porte sous « R. Wallace » depuis 1991-92, le garde ; Ray passe en toutes
     lettres — et il perd du même coup l'héritage de cette ancre (règle de 07/08 : aucune
     ancre ne sert deux fois, le perdant perd le nom ET l'héritage). */
  const rod = PAR_NOM.get("R. Wallace"), ray = PAR_NOM.get("Ray Wallace"), danny = PAR_NOM.get("D. Wallace");
  dit(!!rod && rod.club === "LEE" && rod.t[2] === 23, "« R. Wallace » est Rod, vingt-trois ans, à Leeds");
  dit(!!ray && ray.club === "LEE" && ray.t[2] === 23, "« Ray Wallace », son jumeau, est à Leeds aussi, en toutes lettres");
  dit(!!danny && danny.club === "MUN" && danny.t[2] === 28, "« D. Wallace » est Danny, l'aîné, à Manchester United");
  dit(rod && ray && rod.t[0] !== ray.t[0], "les deux jumeaux portent deux noms distincts");

  /* Les trois replis en toutes lettres de la saison, chacun parce que le nom court est à un
     autre homme (règle de 00/01 : celui que le jeu connaît DÉJÀ garde l'initiale). */
  const CESSIONS = [
    ["D. Smith", "COV", "David Smith", "NOR"],      // deux David Smith, prénom ET patronyme identiques
    ["J. Robinson", "CHL", "Jamie Robinson", "BNS"],
    ["R. Wallace", "LEE", "Ray Wallace", "LEE"],
  ];
  for (const [court, cc, plein, cp] of CESSIONS) {
    const A = PAR_NOM.get(court), B = PAR_NOM.get(plein);
    dit(!!A && A.club === cc && !!B && B.club === cp,
      "« " + court + " » reste à " + cc + ", et « " + plein + " » s'écrit en toutes lettres à " + cp);
    dit(A && B && A.t[2] !== B.t[2] || (court === "R. Wallace"),
      "les deux hommes de « " + court + " » sont bien distincts");
  }
  /* DEUX DAVID SMITH, prénom ET patronyme identiques : écrire l'un en entier suffit à les
     séparer (jurisprudence ANG 1995-96, les deux David Lee et les deux Dave Watson), et on
     n'a eu à écarter personne — contrairement à ANG 1990-91, où Norwich n'avait pas d'homme
     de plus et où son David Smith avait dû céder sa place. */
  dit(PAR_NOM.get("D. Smith").t[2] === 24 && PAR_NOM.get("David Smith").t[2] === 22,
    "le David Smith de Coventry a vingt-quatre ans, celui de Norwich vingt-deux");

  /* LES NOMS QUI DOIVENT RESTER ABSENTS, parce que leur porteur ne joue pas en Angleterre
     cette année-là. C'est ce contrôle qui attrape un nom repris par un autre homme. */
  const ABSENTS = ["M. Hughes", "M. Smith", "R. Fowler", "N. Butt", "K. Gillespie"];
  for (const n of ABSENTS) dit(!PAR_NOM.has(n), "« " + n + " » n'apparaît nulle part au plateau");
  dit(!!PAR_NOM.get("Mark Hughes") && !!PAR_NOM.get("M. Ward") && !!PAR_NOM.get("Mark Ward"),
    "Mark Hughes et Mark Ward gardent leur nom entier, « M. Ward » restant à Mitch (Sheffield United)");
  dit(PAR_NOM.get("M. Ward").club === "SHU" && PAR_NOM.get("Mark Ward").club === "EVE",
    "Mitch Ward est à Sheffield United, Mark Ward à Everton");

  /* Les vrais mononymes de la saison, gardés tels quels. */
  for (const [n, c] of [["Nayim", "TOT"], ["Preki", "EVE"]])
    dit(PAR_NOM.has(n) && PAR_NOM.get(n).club === c, "« " + n + " », vrai mononyme, reste tel quel à " + c);

  /* LES PRÉNOMS : chaque nom à initiale a son entrée, et chaque prénom commence par
     l'initiale affichée (consigne v1.46). Le découpage des initiales composées suit
     exactement celui de harness-prenoms.cjs. */
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
  /* LES PRÉNOMS VOLONTAIREMENT VIDES. `""` veut dire « on garde l'initiale, jamais de prénom
     deviné » (consigne v1.46) : c'est le cas quand deux hommes portent le même nom court avec
     des prénoms différents. Quatre noms du plateau sont dans ce cas, et les QUATRE précèdent
     cette saison — aucune des 97 entrées écrites pour 1992-93 n'est vide. Le contrôle nomme
     les quatre, de sorte qu'un cinquième ferait rougir le harnais. */
  const VIDES_CONNUS = ["R. Jones", "M. Jackson", "C. Coleman", "C. Short"];
  const vides = aIni.filter(n => api.PRENOMS_VRAIS[n] === "");
  const inattendus = vides.filter(n => !VIDES_CONNUS.includes(n));
  dit(inattendus.length === 0,
    "les " + vides.length + " prénoms vides du plateau sont les quatre connus, antérieurs à cette saison"
    + (inattendus.length ? " — en trop : " + inattendus.join(", ") : ""));

  /* L'IDENTITÉ D'UNE SAISON ANGLAISE À L'AUTRE : un même nom court doit désigner le même
     homme, et l'âge doit avancer d'exactement un an depuis 1991-92. */
  const age91 = {};
  for (const T of [api.STARS_ANG9192, api.STARS_D2_ANG9192]) for (const id in T) for (const t of T[id]) age91[t[0]] = t[2];
  const ecarts = [];
  let partages = 0;
  for (const [n, e] of PAR_NOM) if (n in age91) { partages++; if (e.t[2] - age91[n] !== 1) ecarts.push(n); }
  dit(ecarts.length === 0, partages + " noms partagés avec ANG 1991-92, tous vieillis d'exactement un an"
    + (ecarts.length ? " — " + ecarts.slice(0, 8).join(", ") : ""));
}

/* ===== 6) Les stades datés de 1992 ===== */
console.log("\n6) Les stades de 1992 : Charlton rentre à The Valley");
{
  /* CHARLTON RENTRE CHEZ LUI, et c'est le déménagement de l'année : exilé à Selhurst Park
     puis à Upton Park, il retrouve The Valley en décembre 1992. Les trente-cinq
     déménagements datés d'ANG-B paient une troisième fois. */
  dit(api.metaSaison("CHL", 1992).stade === "The Valley", "Charlton Athletic joue à The Valley en 1992-93");
  dit(api.metaSaison("CHL", 1991).stade === "Upton Park", "il était encore à Upton Park en 1991-92");
  /* MILLWALL EST ENCORE À THE DEN : le New Den n'ouvre qu'en août 1993. */
  dit(api.metaSaison("MIW", 1992).stade === "The Den", "Millwall est encore à The Den : le New Den n'ouvre qu'en 1993");
  dit(api.metaSaison("MIW", 1993).stade === "The New Den", "et il y arrive bien la saison suivante");
  /* WIMBLEDON ET CRYSTAL PALACE PARTAGENT SELHURST PARK, tous deux au plateau. */
  dit(api.metaSaison("WIM", 1992).stade === "Selhurst Park" && api.metaSaison("CPL", 1992).stade === "Selhurst Park",
    "Wimbledon et Crystal Palace partagent Selhurst Park, et tous deux sont au plateau");
  /* Aucun stade hors d'époque : rien d'ouvert après 1992 ne doit apparaître. */
  const tard = [];
  for (const id of S.d1.concat(S.d2)) {
    const m = api.metaSaison(id, 1992);
    if (!m || !m.stade) tard.push(id + " sans stade");
    if (m && /Emirates|Stadium of Light|St Mary|Riverside|Pride Park|Reebok|Britannia|Walkers|Ricoh|JJB|Madejski|Kassam|Liberty|Keepmoat|McAlpine/.test(m.stade))
      tard.push(id + " = " + m.stade);
  }
  dit(tard.length === 0, "aucun club ne joue dans un stade ouvert après 1992"
    + (tard.length ? " — " + tard.join(", ") : ""));
  dit(S.d1.concat(S.d2).every(id => api.metaSaison(id, 1992).cap > 0), "chaque club a une capacité");
}

/* ===== 7) Une carrière anglaise depuis 1992-93 ===== */
console.log("\n7) Une carrière anglaise depuis 1992-93 : l'été 1993 muet, le Mondial 94 ensuite");
{
  api.nouvellePartie("MUN", KEY);
  const G = api.getG();
  dit(G.pays === "ANG", "G.pays = ANG");
  dit(G.saison === "1992-93", "G.saison = « 1992-93 », le créneau daté");
  dit(api.anneeJeu() === 1992, "anneeJeu() = 1992");
  /* LA PREMIÈRE PREMIER LEAGUE : l'élite change de nom cet été-là, et le cadre d'ANG-A le
     sait tout seul — en 1991-92 elle s'appelait encore First Division. */
  api.voitPays("ANG", 1992);
  dit(api.libDiv(1, 1992) === "Premier League", "l'élite s'appelle Premier League dès 1992, la première de l'histoire");
  dit(api.libDiv(1, 1991) === "First Division", "et First Division l'année d'avant");
  dit(api.libDiv(2, 1992) === "Division One", "l'échelon du dessous s'appelle Division One");

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
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ANG 1992-93 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ANG 1992-93 : TOUT EST VERT");
