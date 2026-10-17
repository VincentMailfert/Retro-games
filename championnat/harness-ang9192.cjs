/* Harnais de validation — SAISON DE DÉPART ANG 1991-92
   La TROISIÈME saison anglaise, et la dernière First Division de l'histoire.
   `harness-angleterre.cjs` tient déjà le cadre (20+20, le mur européen, les libellés
   d'époque, la carrière) et il balaie toutes les saisons `pays:"ANG"` ; il ne vérifie pas,
   et c'est voulu, les FAITS de cette année-là. C'est le travail d'ici :
   1) le plateau est le vrai : la First Division ramenée de vingt-deux à vingt, l'échelon du
      dessous de vingt-quatre à vingt — et il y manquait un club que la source sache REMPLIR,
      d'où le repêchage de West Bromwich Albion, relégué l'année d'avant
   2) les sièges européens de 1991-92 : Arsenal en C1, Tottenham ET Manchester United en C2,
      Liverpool en C3, qui rentre d'exil un an après les autres
   3) les hommes de la saison : les vedettes à leur club et à leur valeur, les quatre
      distinctions de l'année, les pépites forcées, les deux bouts de l'échelle des âges
   4) LE MUR DU RECRUTEUR : les cinq hommes que `VIVIER_SAISON[1991]` chiffre et qui jouent
      le championnat anglais ne doivent JAMAIS être proposés par le recruteur
   5) les homonymes sont distincts, et aucun prénom ne mente — trois cessions cette année
   6) les stades de 1991 : Wimbledon qui arrive à Selhurst Park, Charlton à Upton Park,
      Middlesbrough encore à Ayresome Park
   7) une carrière, et l'Euro 92 dès la première intersaison
   Usage : node harness-ang9192.cjs                                                        */
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
  "voitPays,SAISONS,STARS_ANG9192,STARS_D2_ANG9192,D1_ANG9192,D2_ANG9192,SIEGES_ANG,VIVIER_SAISON," +
  "PRENOMS_VRAIS,CLUBS_ANG,STARS_ANG9091,STARS_D2_ANG9091,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ANG-1991-92";
const S = api.SAISONS[KEY];

/* ===== 1) Le plateau réel de 1991-92 ===== */
console.log("1) Le plateau : vingt-deux clubs ramenés à vingt, vingt-quatre ramenés à vingt");
{
  if (!S) fail("saison " + KEY + " absente du registre");
  else {
    dit(S.an === 1991 && S.titre === "1991-92" && S.pays === "ANG",
      "la saison est enregistrée : an 1991, créneau « 1991-92 », pays ANG");

    /* La First Division 1991-92, la DERNIÈRE de l'histoire, avait VINGT-DEUX clubs. Les
       vingt-deux peuvent remplir vingt places, donc la documentation n'impose rien :
       s'effacent les deux derniers du classement réel, Notts County (21e) et West Ham (22e),
       deux des trois relégués. Luton, vingtième et relégué lui aussi, RESTE au plateau. */
    const D1 = ["LEE", "MUN", "SHW", "ARS", "MCI", "LIV", "AVL", "FOR", "SHU", "CPL",
                "QPR", "EVE", "WIM", "CHE", "TOT", "SOU", "OLD", "NOR", "COV", "LUT"];
    dit(JSON.stringify(api.D1_ANG9192) === JSON.stringify(D1),
      "les vingt clubs de l'élite sont exactement les vingt premiers du classement réel");
    dit(!api.D1_ANG9192.includes("NTC") && !api.D1_ANG9192.includes("WHU"),
      "Notts County (21e) et West Ham (22e) sont écartés, et Luton (20e) est gardé");
    dit(api.D1_ANG9192.includes("LUT"),
      "Luton, relégué mais vingtième, joue bien l'élite");

    /* L'échelon du dessous avait VINGT-QUATRE clubs, mais la source ne sait REMPLIR que
       dix-neuf effectifs de dix-huit hommes. Cinq clubs s'effacent, et comme en 1990-91
       CE NE SONT PAS LES DERNIERS : Brighton (23e) et Port Vale (24e) sont mieux servis par
       la source que Blackburn (6e, quinze hommes), Southend (12e, quinze), Barnsley (16e,
       dix-sept), Oxford (21e, dix-sept) et Plymouth (22e, dix-sept). Il manque alors un
       club, et c'est la règle de repêchage du chantier : le meilleur relégué de la saison
       précédente monte pour compléter — West Bromwich Albion, 23e de la division en 1990-91. */
    const D2 = ["IPS", "MID", "DER", "LEI", "CAM", "CHL", "SWI", "POR", "WAT", "WOL",
                "BSR", "TRM", "MIW", "BSC", "SUN", "GRI", "NEW", "BHA", "PTV", "WBA"];
    dit(JSON.stringify(api.D2_ANG9192) === JSON.stringify(D2),
      "les vingt clubs du dessous sont les dix-neuf que la source peut remplir, plus le repêché");
    for (const [id, pourquoi] of [["BLB", "sixième, quinze hommes documentés pour dix-huit places"],
                                  ["SND", "douzième, quinze hommes"], ["BNS", "seizième, dix-sept"],
                                  ["OXF", "vingt et unième, dix-sept"], ["PLY", "vingt-deuxième, dix-sept"]]) {
      dit(!api.D2_ANG9192.includes(id), "écarté : " + id + " — " + pourquoi);
    }
    dit(api.D2_ANG9192.includes("BHA") && api.D2_ANG9192.includes("PTV"),
      "Brighton (23e) et Port Vale (24e) sont GARDÉS : la source les sert mieux que ceux du dessus");
    dit(api.D2_ANG9192.includes("WBA"),
      "West Bromwich Albion est repêché pour compléter les vingt (il jouait la Third Division)");
    /* Les cinq écartés gardent leur fiche : ils joueront d'autres années. */
    const codes = new Set(api.CLUBS_ANG.map(c => c.id));
    const perdus = ["BLB", "SND", "BNS", "OXF", "PLY", "NTC", "WHU"].filter(id => !codes.has(id));
    dit(perdus.length === 0,
      "les sept écartés gardent leur fiche dans CLUBS_ANG" + (perdus.length ? " — " + perdus.join(", ") : ""));
    /* AUCUN CLUB NEUF : les quarante-sept clubs traversés étaient déjà au registre d'ANG-B. */
    const absents = api.D1_ANG9192.concat(api.D2_ANG9192).filter(id => !codes.has(id));
    dit(absents.length === 0, "aucun club neuf : les quarante sont déjà dans CLUBS_ANG"
      + (absents.length ? " — " + absents.join(", ") : ""));
  }
}

/* ===== 2) Les sièges européens de 1991-92 ===== */
console.log("\n2) Les sièges européens : Liverpool rentre d'exil un an après les autres");
{
  const r = api.SIEGES_ANG[1991];
  dit(!!r && JSON.stringify(r.C1) === JSON.stringify(["ARS"]),
    "Arsenal, champion 1990-91, est le seul Anglais en Coupe des clubs champions");
  dit(!!r && JSON.stringify(r.C2) === JSON.stringify(["TOT", "MUN"]),
    "Tottenham (vainqueur de la FA Cup 1991) ET Manchester United (tenant du titre) en Coupe des Coupes");
  dit(!!r && JSON.stringify(r.C3) === JSON.stringify(["LIV"]),
    "Liverpool, deuxième de 1990-91, est en Coupe UEFA : il purgeait une année de plus en 1990-91");
  /* La saison doit étaler EXACTEMENT la ligne de SIEGES_ANG[1991] : deux tables écrites des
     jours différents doivent dire la même chose. */
  dit(JSON.stringify(S.euroC1) === JSON.stringify(r.C1)
    && JSON.stringify(S.euroC2) === JSON.stringify(r.C2)
    && JSON.stringify(S.euroC3) === JSON.stringify(r.C3),
    "l'entrée de saison recopie fidèlement la ligne de SIEGES_ANG[1991]");
  const tous = [].concat(S.euroC1, S.euroC2, S.euroC3);
  dit(tous.length === 4, "quatre sièges en tout, tous à l'élite");
  const horsPlateau = tous.filter(id => !api.D1_ANG9192.includes(id));
  dit(horsPlateau.length === 0, "chaque club à siège est bien au plateau de l'élite"
    + (horsPlateau.length ? " — " + horsPlateau.join(", ") : ""));
  /* Le contrôle que le chantier garde parce que c'est l'erreur la plus facile : les sièges
     se gagnent l'année d'AVANT. Leeds gagne le championnat 1991-92 et n'a donc PAS de
     siège cette saison-là ; Manchester City, cinquième en 1991-92, n'en a pas non plus. */
  dit(!tous.includes("LEE"), "LEEDS, QUI VA GAGNER LE CHAMPIONNAT, PART SANS EUROPE : les sièges se gagnent l'année d'avant");
  dit(!tous.includes("MCI") && !tous.includes("SHW"),
    "Manchester City et Sheffield Wednesday, cinquième et troisième en 1991-92, partent sans Europe");
}

/* ===== 3) Les hommes de la saison ===== */
console.log("\n3) Les hommes : les vedettes, les quatre distinctions, les pépites forcées");
{
  const parNom = new Map();
  for (const [club, lst] of Object.entries(api.STARS_ANG9192)) for (const t of lst) parNom.set(t[0], { club, t, elite: true });
  for (const [club, lst] of Object.entries(api.STARS_D2_ANG9192)) for (const t of lst) parNom.set(t[0], { club, t, elite: false });
  dit(parNom.size === 760, "sept cent soixante vrais joueurs, tous sous un nom distinct (" + parNom.size + ")");

  /* LES QUATRE DISTINCTIONS DE 1991-92, vérifiées une par une sur « 1991-92 in English
     football ». Le calcul plafonne et ne sait pas qu'un homme a été élu joueur de l'année :
     c'est la table d'ajustements à la main qui le dit. */
  const PRIX = [
    ["G. Pallister", "MUN", 83, "JOUEUR DE L'ANNÉE DES JOUEURS (PFA)"],
    ["G. Lineker", "TOT", 85, "JOUEUR DE L'ANNÉE DE LA PRESSE (FWA), sa dernière saison avant le Japon"],
    ["R. Giggs", "MUN", 72, "MEILLEUR ESPOIR (PFA), dix-huit ans"],
    ["I. Wright", "ARS", 82, "MEILLEUR BUTEUR, vingt-neuf buts"],
  ];
  let pbP = [];
  for (const [nom, club, mini, quoi] of PRIX) {
    const e = parNom.get(nom);
    if (!e) { pbP.push(nom + " absent (" + quoi + ")"); continue; }
    if (e.club !== club) pbP.push(nom + " au mauvais club (" + e.club + " au lieu de " + club + ")");
    else if (e.t[3] < mini) pbP.push(nom + " noté " + e.t[3] + ", au moins " + mini + " attendu (" + quoi + ")");
  }
  dit(pbP.length === 0, "les quatre primés de l'année sont à leur club et à leur valeur"
    + (pbP.length ? " — " + pbP.join(" ; ") : ""));
  /* Ian Wright a quitté Crystal Palace pour Arsenal en SEPTEMBRE 1991 : il est donc à
     Arsenal, pas à Palace, et c'est le dédoublonnage par identifiant TM qui l'y met. */
  dit((api.STARS_ANG9192["CPL"] || []).every(t => t[0] !== "I. Wright"),
    "Ian Wright n'est PAS resté à Crystal Palace : il a signé à Arsenal dès septembre");

  const VEDETTES = [
    ["Mark Hughes", "MUN", 84],      // quatorze buts et la Coupe de la Ligue
    ["E. Cantona", "LEE", 80],       // débarqué de Nîmes en février, il fait basculer le titre
    ["D. Seaman", "ARS", 83],
    ["P. Schmeichel", "MUN", 81],    // sa première saison anglaise
    ["N. Southall", "EVE", 81],
    ["S. Pearce", "FOR", 81],
    ["J. Barnes", "LIV", 82],
    ["I. Rush", "LIV", 81],
    ["D. Walker", "FOR", 81],        // il part à la Sampdoria l'été suivant
    ["T. Adams", "ARS", 80],
    ["G. Strachan", "LEE", 78],      // champion à trente-quatre ans
    ["G. McAllister", "LEE", 78],
    ["S. Bruce", "MUN", 78],
    ["T. Sheringham", "FOR", 79],    // arrivé de Millwall, il sera meilleur buteur l'an prochain
    ["R. Keane", "FOR", 75],         // vingt ans, 4 329 minutes
    ["A. Shearer", "SOU", 77],       // record britannique pour Blackburn l'été suivant
    ["M. Le Tissier", "SOU", 78],
    ["P. Ince", "MUN", 78],
    ["D. Hirst", "SHW", 78],
    ["S. McManaman", "LIV", 74],     // dauphin de Giggs au trophée du meilleur espoir
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

  /* PAUL GASCOIGNE EST ABSENT, ET C'EST LA SOURCE QUI A RAISON : le genou brisé en finale
     de FA Cup en mai 1991, il ne joue PAS UNE MINUTE de 1991-92 et part à la Lazio l'été
     suivant. Un grand nom mal placé est pire qu'un nom absent (leçon de 06/07). */
  dit(!parNom.has("P. Gascoigne"),
    "Paul Gascoigne n'est nulle part : blessé toute la saison, il n'a pas joué une minute");
  /* DAVID PLATT non plus : il jouait à Bari en 1991-92. */
  dit(!parNom.has("D. Platt"), "David Platt n'est pas au plateau : il jouait à Bari cette année-là");
  /* PETER SHILTON gardait les buts de Derby à QUARANTE-DEUX ans : hors des bornes du
     moteur (15-40), il est écarté plutôt que rajeuni — comme à quarante et un ans en 90/91. */
  dit(!parNom.has("P. Shilton"),
    "Peter Shilton, quarante-deux ans à Derby, est écarté plutôt que rajeuni (bornes 15-40)");

  /* LES QUATRE PÉPITES FORCÉES, et c'est un CHOIX : le contrôle de 09/10 — comparer la
     carrière du forcé à celle de l'homme qu'il sort — a fait tomber six noms d'une première
     liste de dix. Andy Cole, onze minutes à Arsenal, reste dehors : il aurait sorti Ray
     Parlour et ses 299 minutes, que le jeu porte déjà. */
  const FORCES = [["J. Redknapp", "LIV", 18], ["M. Ward", "SHU", 20],
                  ["G. Rowett", "CAM", 17], ["R. Elliott", "NEW", 18]];
  let pbF = [];
  for (const [nom, club, age] of FORCES) {
    const e = parNom.get(nom);
    if (!e) { pbF.push(nom + " absent"); continue; }
    if (e.club !== club) pbF.push(nom + " au mauvais club (" + e.club + ")");
    if (e.t[2] !== age) pbF.push(nom + " a " + e.t[2] + " ans au lieu de " + age);
  }
  dit(pbF.length === 0, "les quatre pépites forcées sont là, à leur club et à leur âge"
    + (pbF.length ? " — " + pbF.join(" ; ") : ""));
  dit(!parNom.has("A. Cole"),
    "Andy Cole reste dehors : onze minutes à Arsenal, il aurait sorti Ray Parlour");
  dit(!!parNom.get("R. Parlour") && parNom.get("R. Parlour").club === "ARS",
    "Ray Parlour est bien resté à Arsenal");

  /* LES DEUX BOUTS DE L'ÉCHELLE DES ÂGES, tous deux de vrais hommes. */
  const pp = parNom.get("P. Pettinger");
  dit(!!pp && pp.club === "LEE" && pp.t[2] === 16 && pp.t[1] === "G",
    "Paul Pettinger, SEIZE ANS, est le gardien de réserve de Leeds et le plus jeune du plateau");
  const sh = parNom.get("S. Sherwood");
  dit(!!sh && sh.club === "GRI" && sh.t[2] === 38,
    "Steve Sherwood tient les buts de Grimsby à TRENTE-HUIT ans, le doyen du plateau");
  const tf = parNom.get("T. Francis");
  dit(!!tf && tf.club === "SHW" && tf.t[2] === 37,
    "Trevor Francis, entraîneur-joueur de Sheffield Wednesday, joue encore à trente-sept ans");
  const tous = [...parNom.values()];
  const bornes = tous.filter(e => e.t[2] < 15 || e.t[2] > 40);
  dit(bornes.length === 0, "tous les âges tiennent dans les bornes du moteur (15-40)");
  const vet = tous.filter(e => e.t[2] >= 36);
  dit(vet.length === 4, "quatre vétérans de trente-six ans et plus (" + vet.length + ")");

  /* La distribution ne doit pas dériver d'une saison à l'autre : ANG 1990-91 rend 70,0 et
     66,2 de moyenne. Un an plus tard, on doit retomber dessus au dixième près. */
  const moy = (l) => l.reduce((s, x) => s + x, 0) / l.length;
  const nE = [].concat(...Object.values(api.STARS_ANG9192)).map(t => t[3]);
  const nD = [].concat(...Object.values(api.STARS_D2_ANG9192)).map(t => t[3]);
  const mE = moy(nE), mD = moy(nD);
  console.log("     moyennes : élite " + mE.toFixed(1) + " · dessous " + mD.toFixed(1)
    + "  (ANG 1990-91 : 70,0 et 66,2)");
  dit(mE > 69 && mE < 72, "la moyenne de l'élite ne dérive pas (" + mE.toFixed(1) + ")");
  dit(mD > 64.5 && mD < 67.5, "la moyenne du dessous ne dérive pas (" + mD.toFixed(1) + ")");
  const hauts = tous.filter(e => e.t[3] > 90);
  dit(hauts.length === 0, "aucune note au-dessus du plafond du jeu");
  const pots = tous.filter(e => e.t[4] < e.t[3]);
  dit(pots.length === 0, "aucun potentiel sous la note");
}

/* ===== 4) LE MUR DU RECRUTEUR ===== */
console.log("\n4) Le mur du recruteur : on ne propose pas un homme qu'un club a sous contrat");
{
  /* `VIVIER_SAISON[1991]` est la liste du recruteur de l'été 91, et elle reste FRANÇAISE :
     elle aligne de vrais joueurs qui jouent HORS de France, donc CINQ hommes du championnat
     anglais. `vivierDeSaison` les écarte en comparant le NOM, chaîne pour chaîne — d'où le
     piège de 95-96, où « É. Cantona » et « E. Cantona » ne se reconnaissaient pas. La règle :
     LA GRAPHIE DU JEU GAGNE, pas celle de la source. Et c'est Cantona, de nouveau, qui l'a
     montrée ici : les tables françaises l'écrivent « É. Cantona » et les anglaises
     « E. Cantona », si bien qu'un homme du championnat anglais doit porter la graphie des
     saisons anglaises. */
  const ANGLAIS = [
    ["I. Wright", "ARS"], ["P. Schmeichel", "MUN"], ["R. Giggs", "MUN"],
    ["A. Kanchelskis", "MUN"], ["D. Saunders", "LIV"],
  ];
  const liste = api.VIVIER_SAISON[1991] || [];
  const nomsViv = new Set(liste.map(e => e[0]));
  let pb = [];
  for (const [nom, club] of ANGLAIS) {
    if (!nomsViv.has(nom)) { pb.push(nom + " n'est plus dans VIVIER_SAISON[1991]"); continue; }
    const lst = api.STARS_ANG9192[club] || [];
    if (!lst.some(t => t[0] === nom)) pb.push(nom + " introuvable à " + club + " sous ce nom exact");
  }
  dit(pb.length === 0,
    "les cinq hommes du vivier 1991 qui jouent en Angleterre portent au plateau le nom EXACT du vivier"
    + (pb.length ? " — " + pb.join(" ; ") : ""));
  /* Cantona est dans les DEUX saisons 1991-92, la française (à Nîmes) et l'anglaise (à
     Leeds), parce qu'il a joué les deux moitiés de la saison de part et d'autre de la
     Manche. Ce n'est pas un doublon : on ne joue qu'un championnat à la fois. */
  dit((api.STARS_ANG9192["LEE"] || []).some(t => t[0] === "E. Cantona"),
    "Cantona est à Leeds sous « E. Cantona », la graphie des saisons anglaises");

  /* Et la preuve en situation : on lance une carrière anglaise et on relit le vivier. */
  const G0 = (() => { api.nouvellePartie("LEE", KEY); return api.getG(); })();
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
    "Wright, Schmeichel, Giggs, Kanchelskis et Saunders ne sont PAS au rapport du recruteur"
    + (attendus.length ? " — " + attendus.join(", ") : ""));
}

/* ===== 5) Les homonymes et les prénoms ===== */
console.log("\n5) Les homonymes sont distincts, et aucun prénom ne mente");
{
  const parNom = new Map();
  for (const [club, lst] of Object.entries(api.STARS_ANG9192)) for (const t of lst) parNom.set(t[0], { club, t });
  for (const [club, lst] of Object.entries(api.STARS_D2_ANG9192)) for (const t of lst) parNom.set(t[0], { club, t });

  /* TROIS CESSIONS, toutes par la jurisprudence Olivier Baudry : prénom ET patronyme
     identiques, aucune forme ne les sépare, le plus marginal cède sa place à un autre vrai
     joueur de son club. Et la règle vaut AUSSI d'une saison à l'autre : « Mark Smith » est
     au défenseur de Barnsley que le jeu porte depuis ANG 1990-91 (identifiant Transfermarkt
     499223, né en 1960), donc l'attaquant de Grimsby de 91-92 (identifiant 1015277, né en
     1961) n'a pas pu le reprendre — c'est l'IDENTIFIANT qui tranche l'identité, jamais l'âge. */
  const mh = parNom.get("Mark Hughes");
  dit(!!mh && mh.club === "MUN",
    "« Mark Hughes » est l'attaquant de Manchester United : le défenseur de Tranmere a cédé sa place");
  dit(!parNom.has("Mark Smith"),
    "« Mark Smith » reste au défenseur de Barnsley de 1990-91 : l'attaquant de Grimsby a cédé sa place");
  const pw = parNom.get("Paul Williams");
  dit(!!pw && pw.club !== "WBA",
    "« Paul Williams » n'est pas celui de West Bromwich, qui a cédé sa place");

  /* Les homonymes de la MÊME année, tranchés par la règle de 00/01 : celui que le jeu
     connaît DÉJÀ sous ce nom court le garde, l'autre passe en toutes lettres. */
  const PAIRES = [
    ["M. Hughes", "Mark Hughes", "Michael Hughes, que le jeu porte depuis 92/93, garde l'initiale"],
    ["M. Ward", "Mark Ward", "Mitch Ward garde l'initiale, Mark Ward passe en toutes lettres"],
    ["R. Wilkins", "Richard Wilkins", "Ray Wilkins, trente-cinq ans à QPR, garde l'initiale face à Richard"],
    ["P. Reid", "Peter Reid", "Paul Reid garde l'initiale, Peter Reid passe en toutes lettres"],
    ["D. White", "Devon White", "David White garde l'initiale"],
    ["D. Wilson", "David Wilson", "Danny Wilson garde l'initiale"],
  ];
  let pbH = [];
  for (const [court, entier, quoi] of PAIRES) {
    if (!parNom.has(court)) pbH.push(court + " absent (" + quoi + ")");
    if (!parNom.has(entier)) pbH.push(entier + " absent (" + quoi + ")");
    if (court === entier) pbH.push(court + " : les deux formes sont identiques");
  }
  dit(pbH.length === 0, "les six paires d'homonymes cohabitent, chacune sous deux formes distinctes"
    + (pbH.length ? " — " + pbH.join(" ; ") : ""));

  /* Chaque nom à initiale a son entrée dans PRENOMS_VRAIS, et le prénom COMMENCE par
     l'initiale affichée. Le découpage des initiales composées suit celui de
     `harness-prenoms.cjs` (`split(/\.-?/)`), leçon de 08/09. */
  /* La comparaison est celle de `harness-prenoms.cjs`, accents ôtés DES DEUX CÔTÉS : le jeu
     écrit « E. Cantona » dans les saisons anglaises et « Éric » comme prénom, et c'est voulu. */
  const sansAccent = (x) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let pbPr = [];
  for (const nom of parNom.keys()) {
    if (!/^\p{Lu}\./u.test(nom)) continue;
    const p = api.PRENOMS_VRAIS[nom];
    if (p === undefined) { pbPr.push(nom + " sans entrée"); continue; }
    if (p === "") continue;                       // `""` = on garde l'initiale, jamais de prénom deviné
    const ini = sansAccent(nom.slice(0, nom.indexOf(". "))).split(/\.-?/).filter(Boolean);
    const morceaux = p.split(/[- ]/);
    const colle = ini.length === 1
      ? sansAccent(p)[0] === ini[0][0]
      : ini.every((x, i) => morceaux[i] && sansAccent(morceaux[i]).startsWith(x));
    if (!colle) pbPr.push(nom + " → « " + p + " » ne colle pas à l'initiale");
  }
  dit(pbPr.length === 0, "chaque nom à initiale a son prénom, et le prénom colle à l'initiale"
    + (pbPr.length ? " — " + pbPr.slice(0, 6).join(" ; ") : ""));

  /* Un patronyme en deux mots est authentique et ne doit pas passer pour un prénom avalé. */
  const composes = [...parNom.keys()].filter(n => /^\p{Lu}\. \p{Lu}[^ ]* \p{Lu}/u.test(n));
  console.log("     noms à initiale suivis de deux mots : " + (composes.join(", ") || "aucun"));

  /* AUCUN DOUBLON entre l'élite et le dessous, ni à l'intérieur d'une division. */
  const tousNoms = [].concat(
    ...Object.values(api.STARS_ANG9192).map(l => l.map(t => t[0])),
    ...Object.values(api.STARS_D2_ANG9192).map(l => l.map(t => t[0])));
  const vus = new Set(); const dbl = [];
  for (const n of tousNoms) { if (vus.has(n)) dbl.push(n); vus.add(n); }
  dit(dbl.length === 0, "aucun nom en double sur les deux divisions"
    + (dbl.length ? " — " + [...new Set(dbl)].join(", ") : ""));

  /* L'IDENTITÉ D'UNE SAISON À L'AUTRE : un nom court que 1990-91 porte déjà doit désigner
     le MÊME homme, donc son âge doit avoir avancé d'exactement un an. */
  const ancien = new Map();
  for (const [club, lst] of Object.entries(api.STARS_ANG9091)) for (const t of lst) ancien.set(t[0], t[2]);
  for (const [club, lst] of Object.entries(api.STARS_D2_ANG9091)) for (const t of lst) ancien.set(t[0], t[2]);
  let pbA = [];
  for (const [nom, e] of parNom) {
    if (!ancien.has(nom)) continue;
    if (ancien.get(nom) + 1 !== e.t[2]) pbA.push(nom + " " + ancien.get(nom) + "→" + e.t[2]);
  }
  dit(pbA.length === 0, "chaque nom partagé avec 1990-91 a vieilli d'exactement un an"
    + (pbA.length ? " — " + pbA.slice(0, 8).join(" ; ") : ""));
  const partages = [...parNom.keys()].filter(n => ancien.has(n)).length;
  console.log("     " + partages + " noms partagés avec ANG 1990-91, tous vieillis d'un an");
}

/* ===== 6) Les stades datés de 1991 ===== */
console.log("\n6) Les stades de 1991 : Wimbledon arrive à Selhurst Park");
{
  const st = (id, an) => { const m = api.metaSaison(id, an); return m ? m.stade : null; };
  /* 1991-92 est LA saison où le déménagement de Wimbledon prend effet : il quitte Plough
     Lane pour Selhurst Park, qu'il partage avec Crystal Palace. */
  dit(st("WIM", 1990) === "Plough Lane" && st("WIM", 1991) === "Selhurst Park",
    "Wimbledon quitte Plough Lane pour Selhurst Park en 1991, et le jeu le sait");
  dit(st("CPL", 1991) === "Selhurst Park",
    "Crystal Palace y est aussi : les deux clubs partagent Selhurst Park cette année-là");
  /* Charlton, lui, est à Upton Park en 91-92 et ne rentre à The Valley qu'en décembre 1992. */
  dit(st("CHL", 1990) === "Selhurst Park" && st("CHL", 1991) === "Upton Park",
    "Charlton passe de Selhurst Park à Upton Park, et ne rentrera à The Valley qu'en décembre 1992");
  /* Middlesbrough est encore à Ayresome Park : le Riverside n'ouvre qu'en août 1995. */
  dit(st("MID", 1991) === "Ayresome Park" && st("MID", 1995) === "Riverside Stadium",
    "Middlesbrough est encore à Ayresome Park : le Riverside n'ouvre qu'en 1995");
  /* Personne ne joue dans un stade qui n'existe pas encore. */
  const TARDIFS = ["Emirates Stadium", "Stadium of Light", "St Mary's Stadium", "Riverside Stadium",
                   "Pride Park", "Reebok Stadium", "Britannia Stadium", "City of Manchester Stadium",
                   "Walkers Stadium", "Ricoh Arena", "JJB Stadium", "KC Stadium", "Madejski Stadium",
                   "Kassam Stadium", "Liberty Stadium", "New Den", "Alfred McAlpine Stadium",
                   "Keepmoat Stadium", "Cardiff City Stadium"];
  const fautifs = api.D1_ANG9192.concat(api.D2_ANG9192)
    .map(id => [id, st(id, 1991)]).filter(([id, s]) => TARDIFS.includes(s));
  dit(fautifs.length === 0, "aucun club ne joue dans un stade ouvert plus tard"
    + (fautifs.length ? " — " + fautifs.map(f => f.join(" ")).join(", ") : ""));
  /* Et le repêché a bien son stade d'époque. */
  dit(st("WBA", 1991) === "The Hawthorns", "West Bromwich Albion joue aux Hawthorns");
}

/* ===== 7) Une carrière, et l'Euro 92 dès la première intersaison ===== */
console.log("\n7) Une carrière anglaise depuis 1991-92");
{
  api.nouvellePartie("LEE", KEY);
  const G = api.getG();
  dit(G.pays === "ANG" && G.saison === "1991-92" && api.anneeJeu() === 1991,
    "la carrière démarre en 1991-92, pays ANG");
  dit(api.libDiv(1, 1991) === "First Division",
    "l'élite s'appelle encore First Division : la Premier League arrive à l'été 1992");
  let erreurs = 0;
  try {
    for (let s = 0; s < 3; s++) {
      for (let j = 0; j < 38; j++) api.jouerJournee();
      api.intersaison();
    }
  } catch (e) { erreurs++; console.error("      " + e.message); }
  dit(erreurs === 0, "trois saisons jouées d'affilée sans exception");
  /* LA BASCULE : partant de 1991-92, l'élite devient la Premier League à la DEUXIÈME saison. */
  dit(api.libDiv(1, 1992) === "Premier League",
    "à la deuxième saison, l'élite s'appelle Premier League — la bascule se fait en pleine carrière");
  dit(api.libDiv(2, 1992) === "Division One",
    "et l'échelon du dessous devient la Division One");
  const ages = [].concat(...G.clubs.map(c => (c.joueurs || []).map(j => j.age)));
  dit(Math.max(...ages) <= 35, "après vieillissement, plus personne au-dessus de 35 ans");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ANG 1991-92 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ANG 1991-92 : TOUT EST VERT");
