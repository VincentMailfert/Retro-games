/* Harnais de validation — SAISON DE DÉPART 2006-07
   Vérifie : intégrité du registre SAISONS, doublons de noms, année de base/étés,
   sièges européens, carrière multi-saisons depuis 06/07 (calibrage, vieillissement).
   C'est la saison la plus RÉCENTE du jeu, comme 05/06 l'était avant elle : toutes les
   ancres de notes sont derrière elle. Quatre singularités à surveiller ici — le plateau
   tombe juste tout seul pour la CINQUIÈME fois de suite (vingt et vingt, aucun repêchage) ;
   la PREMIÈRE intersaison est MUETTE et c'est la DEUXIÈME qui porte l'EURO 2008, le premier
   été que `HONNEURS` ait eu à apprendre depuis l'ouverture du chantier ; les HUIT sièges
   européens sont tous en Ligue 1, avec DEUX clubs qualifiés par l'Intertoto pour la deuxième
   année de suite ; et sept homonymes se tranchent, dont TROIS Traoré dont aucun ne peut
   prendre « M. Traoré », qui appartient à un quatrième homme.
   Usage : node harness0607.cjs                                                    */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,CIBLE,SAISONS,STARS_0607,STARS_D2_0607,D1_0607,D2_0607,STARS_EUROPE,STARS_EUROPE_C2,STARS_EUROPE_C3,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const KEY = "2006-07";

/* ===== 1) Intégrité du registre SAISONS ===== */
console.log("1) Registre SAISONS : composition, métadonnées, effectifs");
try {
  const S = api.SAISONS[KEY];
  if (!S) fail("saison " + KEY + " absente du registre");
  else {
    if (S.d1.length !== 20) fail("L1 06/07 a " + S.d1.length + " clubs (attendu 20)");
    if (S.d2.length !== 20) fail("L2 06/07 a " + S.d2.length + " clubs (attendu 20)");
    const tous = S.d1.concat(S.d2);
    const setIds = new Set(tous);
    if (setIds.size !== 40) fail("ids dupliqués entre L1 et L2 (uniques: " + setIds.size + "/40)");
    const metaManquante = tous.filter(id => !api.metaClub(id));
    if (metaManquante.length) fail("métadonnées manquantes : " + metaManquante.join(","));
    if (!metaManquante.length && setIds.size === 40 && S.d1.length === 20 && S.d2.length === 20)
      ok("06/07 = 20 L1 + 20 L2, 40 clubs uniques, toutes métadonnées résolues");

    // LE PLATEAU TOMBE JUSTE TOUT SEUL POUR LA CINQUIÈME FOIS DE SUITE : les deux échelons réels
    // ont vingt clubs, donc aucun repêchage, aucun écarté. On vérifie les deux listes par ÉGALITÉ.
    const REELS_D1 = ["LYO", "OM", "TOU", "REN", "LEN", "BOR", "SOC", "AUX", "MON", "LIL",
                      "STE", "LMN", "NCY", "LOR", "PSG", "NIC", "VAN", "TRO", "SED", "NAN"];
    const REELS_D2 = ["MET", "CAE", "STR", "GUI", "BAS", "AMI", "REI", "LEH", "AJA", "DIJ",
                      "NIO", "MTP", "BRE", "GRE", "CHA", "LIB", "GUE", "CRE", "IST", "TRS"];
    const absentsD1 = REELS_D1.filter(id => !S.d1.includes(id));
    const intrusD1 = S.d1.filter(id => !REELS_D1.includes(id));
    if (absentsD1.length || intrusD1.length)
      fail("L1 06/07 : absents " + (absentsD1.join(",") || "—") + " / intrus " + (intrusD1.join(",") || "—"));
    else ok("les vingt clubs de la vraie Ligue 1 2006-07 sont au plateau, et eux seuls (Valenciennes, Lorient et Sedan promus)");
    const absentsD2 = REELS_D2.filter(id => !S.d2.includes(id));
    const intrusD2 = S.d2.filter(id => !REELS_D2.includes(id));
    if (absentsD2.length || intrusD2.length)
      fail("L2 06/07 : absents " + (absentsD2.join(",") || "—") + " / intrus " + (intrusD2.join(",") || "—"));
    else ok("les vingt clubs de la vraie Ligue 2 2006-07 sont au plateau, et eux seuls (Ajaccio, Metz et Strasbourg descendus)");
    if (S.d1.length + S.d2.length !== REELS_D1.length + REELS_D2.length)
      fail("le compte de 06/07 doit tomber juste sans repêcher personne");
    else ok("AUCUN repêchage ni d'un côté ni de l'autre — la cinquième fois de suite, depuis 02/03");

    // Libourne est le seul club neuf du plateau : il entre par CLUBS_EXTRA, en Ligue 2, monté du
    // National pour sa première saison professionnelle, à sept mille places.
    const lib = api.metaClub("LIB");
    if (!lib) fail("Libourne (LIB) doit être au registre des clubs");
    else if (!S.d2.includes("LIB")) fail("Libourne joue la Ligue 2 en 2006-07");
    else if (!/Moueix/.test(lib.stade)) fail("le stade de Libourne est Jean-Antoine-Moueix, pas « " + lib.stade + " »");
    else if (lib.cap !== 7000) fail("Jean-Antoine-Moueix compte sept mille places, pas " + lib.cap);
    else ok("FC Libourne-Saint-Seurin, seul club neuf de la saison, à Jean-Antoine-Moueix et en Ligue 2");

    // effectifs : non vides, postes valides, notes dans les bornes, aucun trou
    let pb = [];
    for (const id of tous) {
      const L = (S.d1.includes(id) ? S.starsD1 : S.starsD2)[id];
      if (!L || !L.length) { pb.push(id + " vide"); continue; }
      if (L.length < 14) pb.push(id + " maigre (" + L.length + ")");
      for (const t of L) {
        if (!["G", "D", "M", "A"].includes(t[1])) pb.push(id + " poste invalide " + t[0]);
        if (!(t[2] >= 15 && t[2] <= 38)) pb.push(id + " âge hors bornes " + t[0] + " " + t[2]);
        if (!(t[3] >= 55 && t[3] <= 90)) pb.push(id + " note hors bornes " + t[0] + " " + t[3]);
        if (!(t[4] >= t[3] && t[4] <= 97)) pb.push(id + " pot incohérent " + t[0]);
      }
      if (!L.filter(t => t[1] === "G").length) pb.push(id + " sans gardien réel");
    }
    if (pb.length) pb.forEach(fail); else ok("40 effectifs réels valides (postes, âges, notes ≤ 90, pot ≥ note)");

    // pas de plafond d'âge depuis 99/00 : les vétérans jouent leur saison réelle puis raccrochent.
    // Ils ne sont que DEUX cette année, et tous deux en Ligue 2 : Serge Grégoire tient les buts de
    // Dijon à trente-huit ans (2 571 minutes) et Thierry Bertin joue à trente-sept à Châteauroux.
    const vets = { DIJ: "S. Grégoire", CHA: "T. Bertin" };
    const absentsV = Object.entries(vets).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom));
    if (absentsV.length)
      fail("vétérans 36+ manquants : " + absentsV.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("les deux seuls vétérans de 36 ans et plus sont conservés : Grégoire (38 ans) et Bertin (37)");
    const greg = (S.starsD2.DIJ || []).find(t => t[0] === "S. Grégoire");
    if (!greg || greg[2] !== 38) fail("Serge Grégoire a trente-huit ans à Dijon : 2 571 minutes, le plus vieux joueur du jeu cette saison");
    else ok("Serge Grégoire, trente-huit ans et 2 571 minutes à Dijon — le plus vieux du plateau");

    // LE PIÈGE DES CINQ DERNIÈRES SAISONS, QU'UN HARNAIS DOIT GARDER : le découpage des tableaux
    // laisse la DERNIÈRE ligne collée au bas de page, si bien qu'une sentinelle de fin ne trouve
    // plus la cellule des minutes et rend ZÉRO. Dix-sept derniers de tableau avaient leur place
    // dans un effectif cette année-là, dont Aruna Dindane et ses 3 623 minutes à Lens.
    const DERNIERS = { LEN: "A. Dindane", BOR: "M. Chamakh", SED: "G. Pujol", SOC: "A. Le Tallec",
                       NAN: "C. Keșerü", OM: "H. Bamogo", STE: "M. Heinz", VAN: "E. Hassli" };
    const DERNIERS_D2 = { MTP: "V. Montaño", CRE: "P. Vareilles", CHA: "A. El Jadeyaoui",
                          GRE: "C. Chapuis", AMI: "N. Raynier", IST: "N. Goussé" };
    const zappes = Object.entries(DERNIERS).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom))
      .concat(Object.entries(DERNIERS_D2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom)));
    if (zappes.length)
      fail("derniers de tableau perdus (la sentinelle de fin a frappé) : " + zappes.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("les derniers de tableau ont leurs vraies minutes : Dindane, Chamakh, Pujol, Le Tallec, Montaño et les autres");
    const dindane = (S.starsD1.LEN || []).find(t => t[0] === "A. Dindane");
    if (!dindane || dindane[3] < 70)
      fail("Aruna Dindane : 3 623 minutes au Racing, il ne peut pas sortir d'un tableau à zéro minute");
    else ok("Aruna Dindane, dernier du tableau lensois, noté " + dindane[3] + " pour ses 3 623 minutes");

    // les gamins de 2006 : le tri au temps de jeu les écartait, la liste de forçage les rattrape.
    // C'est la plus grosse fournée du chantier, parce que 2006-07 est une année de débuts énorme.
    const forces = { LYO: "L. Rémy", PSG: "M. Sakho", LEN: "A. Taarabt", LIL: "A. Rami",
                     NAN: "W. Vainqueur", MON: "C. Mongongu", SOC: "M. Erdinç",
                     REN: "J. Kembo Ekoko", TOU: "K. Constant", AUX: "A. Traoré", LMN: "H. Yebda" };
    const forcesD2 = { GRE: "O. Giroud", MET: "G. Bong", STR: "M. Schneiderlin",
                       GUI: "Bakary Koné", MTP: "M. Yanga-Mbiwa", CHA: "B. Sako",
                       LIB: "C. Kaboré", GUE: "A. Cissokho" };
    const perdus = Object.entries(forces).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom))
      .concat(Object.entries(forcesD2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom)));
    if (perdus.length) fail("pépites forcées absentes : " + perdus.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("pépites forcées présentes : Sakho, N'Gog, Schneiderlin, Rami, Yanga-Mbiwa, Taarabt, Rémy, Constant, Mongongu, Vainqueur, Giroud, Feghouli, Cissokho, Alessandrini, Sako, Kaboré, Bong, Bakary Koné, Erdinç, Kembo Ekoko, Alain Traoré, Yebda");
    // MAMADOU SAKHO A SEIZE ANS ET CENT SOIXANTE-QUINZE MINUTES au Parc des Princes : c'est le
    // deuxième seizième anniversaire du jeu après Didier Domi (94/95), et un futur capitaine des Bleus.
    const sakho = (S.starsD1.PSG || []).find(t => t[0] === "M. Sakho");
    if (!sakho || sakho[2] !== 16 || sakho[1] !== "D" || sakho[4] < 88)
      fail("Mamadou Sakho : seize ans en défense du Paris SG, cent soixante-quinze minutes, et tout devant lui");
    else ok("Mamadou Sakho, SEIZE ANS au Parc des Princes, noté " + sakho[3] + " pour un potentiel de " + sakho[4]);
    // KÉVIN CONSTANT N'A JOUÉ QUE DEUX MINUTES de toute la saison, et c'est la borne basse du jeu
    // après la minute unique de Didier Domi : le tri aux minutes ne pouvait pas le garder.
    const constant = (S.starsD1.TOU || []).find(t => t[0] === "K. Constant");
    if (!constant || constant[2] !== 19)
      fail("Kévin Constant : dix-neuf ans à Toulouse, DEUX minutes dans toute la saison");
    else ok("Kévin Constant gardé pour DEUX minutes à Toulouse, potentiel " + constant[4]);
    // MORGAN SCHNEIDERLIN a dix-sept ans et soixante-quatre minutes en Ligue 2
    const schn = (S.starsD2.STR || []).find(t => t[0] === "M. Schneiderlin");
    if (!schn || schn[2] !== 17 || schn[4] < 84)
      fail("Morgan Schneiderlin : dix-sept ans à Strasbourg, soixante-quatre minutes, et l'Angleterre plus tard");
    else ok("Morgan Schneiderlin, dix-sept ans à Strasbourg, noté " + schn[3] + " pour un potentiel de " + schn[4]);
    // Olivier Giroud a maintenant vingt ans et quatre cent vingt minutes : il reste forcé
    const giroud = (S.starsD2.GRE || []).find(t => t[0] === "O. Giroud");
    if (!giroud || giroud[2] !== 20 || giroud[4] < 84)
      fail("Olivier Giroud : vingt ans à Grenoble, quatre cent vingt minutes, et le record des Bleus au bout");
    else ok("Olivier Giroud, vingt ans à Grenoble, forcé pour la deuxième saison de suite, potentiel " + giroud[4]);
    // Le Paris SG, Lyon, Grenoble et Gueugnon paient DEUX hommes chacun : le prix du forçage, assumé
    const paires = [["PSG", ["M. Sakho", "D. N'Gog"]], ["LYO", ["L. Rémy", "H. Ben Arfa"]]];
    const pairesD2 = [["GRE", ["O. Giroud", "S. Feghouli"]], ["GUE", ["A. Cissokho", "R. Alessandrini"]]];
    const manquePaire = paires.filter(([id, ns]) => ns.some(n => !(S.starsD1[id] || []).some(t => t[0] === n)))
      .concat(pairesD2.filter(([id, ns]) => ns.some(n => !(S.starsD2[id] || []).some(t => t[0] === n))));
    if (manquePaire.length) fail("forçage multiple incomplet : " + manquePaire.map(p => p[0]).join(", "));
    else ok("le Paris SG, Lyon, Grenoble et Gueugnon paient DEUX hommes chacun");

    // celles que le temps de jeu suffisait à garder
    const seuls = { LYO: ["Juninho", "G. Coupet", "F. Malouda", "Cristiano", "J. Toulalan", "S. Squillaci", "K. Källström", "K. Benzema", "S. Wiltord", "É. Abidal"],
                    OM: ["F. Ribéry", "S. Nasri", "M. Niang", "D. Cissé", "L. Cana", "M. M'Bami"],
                    TOU: ["J. Elmander", "A. Emaná", "J. Mathieu", "D. Arribagé"],
                    REN: ["M. Melchiot", "J. Briand", "J. Utaka", "S. Marveaux"],
                    LEN: ["S. Keita", "A. Dindane", "N. Kovacevic", "Hilton"],
                    BOR: ["M. Chamakh", "U. Ramé", "Wendel", "G. Obertan"],
                    SOC: ["T. Richert", "A. Le Tallec", "V. Birsa"],
                    AUX: ["B. Sagna", "B. Pedretti", "I. Jeleń", "Benoît Cheyrou"],
                    MON: ["Y. Touré", "J. Koller", "J. Ménez", "S. Ruffier", "G. Givet"],
                    LIL: ["Y. Cabaye", "J. Makoun", "M. Debuchy", "P. Odemwingie", "M. Bastos"],
                    STE: ["B. Gomis", "F. Guarín", "Z. Camara"], LMN: ["Ismaël Bangoura", "M. Coutadeur", "Grafite"],
                    NCY: ["Kim"], LOR: ["A.-P. Gignac", "Rémy Riou"],
                    PSG: ["Pauleta", "M. Landreau", "J. Rothen", "S. Armand", "C. Chantôme", "Y. Mulumbu"],
                    NIC: ["H. Lloris", "B. Koné", "M. Moussilou"], VAN: ["S. Savidan"],
                    TRO: ["B. Matuidi"], SED: ["Alaeddine Yahia"],
                    NAN: ["F. Barthez", "D. Payet", "C. Wilhelmsson", "Mamadou Diallo"] };
    const rates = [];
    for (const id in seuls) for (const nom of seuls[id])
      if (!(S.starsD1[id] || []).some(t => t[0] === nom)) rates.push(nom + " (" + id + ")");
    for (const [id, nom] of [["LEH", "S. Mandanda"], ["MET", "P. Cissé"], ["TRS", "M. Benatia"],
                             ["BAS", "A. Ejide"], ["MTP", "G. Jourdren"], ["BRE", "E. Oliveira"]])
      if (!(S.starsD2[id] || []).some(t => t[0] === nom)) rates.push(nom + " (" + id + ")");
    if (rates.length) fail("pépites passées au temps de jeu et pourtant absentes : " + rates.join(", "));
    else ok("Malouda, Ribéry, Nasri, Benzema, Lloris, Mandanda, Cabaye, Matuidi, Sagna, Toulalan et Yaya Touré passent au temps de jeu");
    // Florent Malouda, MEILLEUR JOUEUR du championnat 2006-07 : le sommet de la saison
    const malouda = (S.starsD1.LYO || []).find(t => t[0] === "F. Malouda");
    if (!malouda || malouda[3] < 85) fail("Florent Malouda : meilleur joueur du championnat 2006-07, il ne peut pas sortir sous 85");
    else ok("Florent Malouda, meilleur joueur du championnat, noté " + malouda[3] + " — la meilleure note du plateau");
    // Pauleta, meilleur buteur avec QUINZE buts : le plus petit total qu'on ait vu en France
    const pauleta = (S.starsD1.PSG || []).find(t => t[0] === "Pauleta");
    if (!pauleta || pauleta[3] < 82) fail("Pauleta : meilleur buteur avec quinze buts, il ne peut pas sortir sous 82");
    else ok("Pauleta, meilleur buteur du championnat avec quinze buts seulement, noté " + pauleta[3]);
    // Teddy Richert, MEILLEUR GARDIEN, 4 281 minutes, deux penaltys arrêtés en finale de Coupe
    const richert = (S.starsD1.SOC || []).find(t => t[0] === "T. Richert");
    if (!richert || richert[1] !== "G" || richert[3] < 77) fail("Teddy Richert : meilleur gardien du championnat 2006-07, à Sochaux");
    else ok("Teddy Richert, meilleur gardien du championnat, noté " + richert[3] + " pour 4 281 minutes");
    // Samir Nasri, MEILLEUR ESPOIR à dix-neuf ans, 3 829 minutes au Vélodrome
    const nasri = (S.starsD1.OM || []).find(t => t[0] === "S. Nasri");
    if (!nasri || nasri[2] !== 19 || nasri[3] < 77 || nasri[4] < 88)
      fail("Samir Nasri : meilleur espoir du championnat, dix-neuf ans et 3 829 minutes à Marseille");
    else ok("Samir Nasri, meilleur espoir, noté " + nasri[3] + " pour un potentiel de " + nasri[4]);
    // LE VIEILLISSEMENT DÉRAPE DANS LES DEUX SENS : Djibril Cissé, ancré en 2003 et vieilli trois
    // fois, ressortait à 88, c'est-à-dire au plafond du jeu, pour une saison de prêt au Vélodrome.
    const dcisse = (S.starsD1.OM || []).find(t => t[0] === "D. Cissé");
    if (!dcisse || dcisse[3] > 83) fail("Djibril Cissé ne peut pas ressortir au plafond du jeu : l'ancre de 2003 vieillie trois fois dérape");
    else ok("Djibril Cissé ramené à " + dcisse[3] + " : le vieillissement d'une ancre lointaine donne trop");

    const nD1 = S.d1.reduce((s, id) => s + S.starsD1[id].length, 0);
    const nD2 = S.d2.reduce((s, id) => s + S.starsD2[id].length, 0);
    if (nD1 !== 400) fail("L1 06/07 : " + nD1 + " joueurs curés (attendu 20 × 20)");
    if (nD2 !== 360) fail("L2 06/07 : " + nD2 + " joueurs curés (attendu 20 × 18)");
    if (nD1 === 400 && nD2 === 360) ok("760 joueurs réels relevés : 20 par club en L1, 18 en L2");
  }
} catch (e) { fail("exception registre : " + e.stack); }

/* ===== 2) Doublons de noms ===== */
console.log("2) Doublons de noms");
try {
  const compte = {};
  const ajoute = (nom, src) => { (compte[nom] = compte[nom] || []).push(src); };
  for (const id in api.STARS_0607) for (const t of api.STARS_0607[id]) ajoute(t[0], "L1:" + id);
  for (const id in api.STARS_D2_0607) for (const t of api.STARS_D2_0607[id]) ajoute(t[0], "L2:" + id);
  const dupClub = Object.entries(compte).filter(([n, s]) => s.length > 1);
  if (dupClub.length) dupClub.forEach(([n, s]) => fail("doublon 06/07 : « " + n + " » dans " + s.join(" + ")));
  else ok("aucun joueur dupliqué entre deux clubs en 06/07 (quarante et un transferts arbitrés au temps de jeu)");

  // homonymes DANS la saison : celui qui portait DÉJÀ le nom court dans le jeu le garde (règle de
  // 00/01), l'autre passe en toutes lettres. SEPT cas en 06/07, un record après les six de 05/06.
  const HOMONYMES = [["B. Cheyrou", "Benoît Cheyrou"], ["S. Keita", "Sidi Keita"],
                     ["M. N'Diaye", "Momar N'Diaye"], ["I. Bangoura", "Ismaël Bangoura"],
                     ["R. Riou", "Rémy Riou"], ["A. Yahia", "Alaeddine Yahia"],
                     ["P. Diop", "Pape Diop"], ["B. Koné", "Bakary Koné"]];
  const mal = HOMONYMES.filter(([court, long]) => !compte[court] || !compte[long]);
  if (mal.length) fail("homonymes mal résolus : " + mal.map(p => p.join(" / ")).join(" ; "));
  else ok("homonymes résolus : Seydou Keita garde « S. Keita » face à Sidi, Rudy Riou face à Rémy, Bakari Koné face à Bakary, Pape Malick Diop face à Pape");

  // TROIS Traoré SANS LIEN, et « M. Traoré » appartient à un QUATRIÈME homme que le jeu porte depuis
  // 1990 et qui aurait trente-cinq ans en 2006 : aucun des trois ne peut le reprendre, tous les
  // trois passent donc en toutes lettres. C'est un cas que le chantier n'avait jamais rencontré.
  if (compte["M. Traoré"])
    fail("« M. Traoré » appartient à un homme de 1990 : aucun des trois Traoré de 2006 ne peut le prendre");
  else {
    const trois = [["Mahamane Traoré", "NIC"], ["Mody Traoré", "VAN"], ["Mustapha Traoré", "CAE"]];
    const absents = trois.filter(([n]) => !compte[n]);
    if (absents.length) fail("les trois Traoré doivent être au plateau en toutes lettres : manquent " + absents.map(a => a[0]).join(", "));
    else ok("TROIS Traoré sans lien, tous les trois en toutes lettres : « M. Traoré » reste à un quatrième homme");
  }

  // L'HOMONYME PARFAIT, PRÉNOM ET PATRONYME : deux Frédéric Mendy. Le jeu porte « F. Mendy » depuis
  // 93/94 et c'est le Montpelliérain né en 1973 ; le Bastiais né en 1981 cède sa place à un autre
  // vrai joueur de son club (jurisprudence Olivier Baudry 91/92, déjà appliquée en 01/02 et 03/04).
  if (compte["Frédéric Mendy"])
    fail("le second Frédéric Mendy cède sa place : prénom ET patronyme identiques, aucun remède connu");
  else if (!(api.STARS_D2_0607.MTP || []).some(t => t[0] === "F. Mendy"))
    fail("« F. Mendy » doit rester au Montpelliérain que le jeu porte depuis 93/94");
  else ok("un seul Frédéric Mendy au plateau, le Montpelliérain : le Bastiais cède sa place (jurisprudence Baudry)");

  // LA RÈGLE ÉTENDUE D'UNE SAISON À L'AUTRE : un nom court que le JEU attribue déjà à un autre
  // homme ne se reprend pas, même si cet homme ne joue plus en France. Quatre reconductions et
  // deux découvertes du jour, dont « Eduardo », qui n'était pas libre pour un homme que le jeu
  // porte sous « E. Oliveira » depuis 1998.
  const CEDENT = [["M. Diallo", "Mamadou Diallo"], ["Cris", "Cristiano"], ["J. Acédo", "Jérémy Acédo"]];
  const bavures = CEDENT.filter(([court, long]) => compte[court] || !compte[long]);
  if (bavures.length)
    fail("nom court d'un autre homme repris : " + bavures.map(p => p[0] + " au lieu de " + p[1]).join(" ; "));
  else ok("« Cris » reste à l'Angevin (le Lyonnais garde « Cristiano »), « M. Diallo » à l'Amiénois, « J. Acédo » à l'homme de 1995");
  // LA DÉCOUVERTE DU JOUR : la forme abrégée des tables du jeu passe AVANT la règle du mononyme,
  // et elle exige une concordance d'âge EXACTE. Sans elle, Eduardo Oliveira, trente-quatre ans à
  // Brest, devenait le mononyme « Eduardo » d'un Toulousain, et Álvaro Santos héritait du nom
  // d'« Adailton Santos », à un an près.
  if (compte["Eduardo"]) fail("« Eduardo » est au Toulousain de 03/04 : le Brestois s'écrit « E. Oliveira »");
  else if (!(api.STARS_D2_0607.BRE || []).some(t => t[0] === "E. Oliveira"))
    fail("Eduardo Oliveira doit garder « E. Oliveira », le nom que le jeu lui donne depuis 1998");
  else if (compte["Adailton Santos"]) fail("« Adailton Santos » est au Lorrain de 05/06 : Álvaro Santos ne peut pas le prendre");
  else if (!(api.STARS_0607.SOC || []).some(t => t[0] === "Á. Santos"))
    fail("Álvaro Santos doit s'écrire « Á. Santos » à Sochaux");
  else ok("E. Oliveira garde son nom de 1998, et Álvaro Santos s'écrit « Á. Santos » : l'âge exact tranche");

  // piège « J. Arne Riise » : un prénom composé resté collé au patronyme.
  const PARTICULES = new Set(["Le", "La", "Les", "De", "Del", "Della", "Da", "Das", "Do", "Dos", "Di", "Du",
    "Van", "Von", "Der", "Ten", "Ter", "El", "Al", "Ben", "Bin", "Mac", "Mc", "O", "Saint", "San", "Aït", "Ait"]);
  // patronymes en deux mots vérifiés sur pièces, et non des prénoms avalés (jurisprudence Michael
  // Mio Nielsen, 90/91) : Steven PINTO BORGES, Franck DJA DJÉDJÉ, Jirès KEMBO EKOKO.
  const COMPOSES = new Set(["Pinto", "Dja", "Kembo", "Akpa", "Abd", "Sanches", "Moura"]);
  const suspects = Object.keys(compte).filter(n => {
    const m = /^[A-ZÀ-Þ]\.(-[A-ZÀ-Þ]\.)? ([A-ZÀ-Þ][a-zà-ÿ']+) [A-ZÀ-Þ]/.exec(n);
    return m && !PARTICULES.has(m[2]) && !COMPOSES.has(m[2]);
  });
  if (suspects.length) fail("noms à vérifier (prénom composé avalé dans le patronyme ?) : " + suspects.join(", "));
  else ok("aucun prénom composé resté collé au patronyme (« Dja Djédjé » et « Kembo Ekoko » sont de vrais patronymes)");

  // réconciliation France ↔ Europe (clubs européens figés en 95-96)
  const eur = new Set();
  for (const T of [api.STARS_EUROPE, api.STARS_EUROPE_C2, api.STARS_EUROPE_C3]) for (const id in T) for (const t of T[id]) eur.add(t[0]);
  const collE = Object.keys(compte).filter(n => eur.has(n));
  api.nouvellePartie("LYO", KEY);
  const Gv = api.getG();
  const enFr = new Set(); for (const c of Gv.clubs.concat(Gv.autre)) for (const j of c.joueurs) if (j.reel) enFr.add(j.nom);
  const surDeux = []; for (const c of Gv.europe) for (const j of c.joueurs) if (j.reel && enFr.has(j.nom)) surDeux.push(j.nom + " (" + c.id + ")");
  if (surDeux.length) fail("joueurs réels à la fois en France et en Europe : " + surDeux.join(", "));
  else ok(collE.length + " joueurs passés en France retirés de leur club européen");
  const courts = Gv.europe.filter(c => ["G", "D", "M", "A"].some(p => c.joueurs.filter(j => j.pos === p).length < api.CIBLE[p]));
  if (courts.length) fail("clubs européens sous l'effectif cible après réconciliation : " + courts.map(c => c.id).join(","));
  // UN FORCÉ NE DOIT PAS CONTREDIRE LE RECRUTEUR (règle de 05/06) : le vivier de l'été 2006 et les
  // effectifs du championnat ne peuvent pas placer le même homme à deux endroits au coup d'envoi.
  const employes = new Set();
  for (const c of Gv.clubs.concat(Gv.autre || [])) for (const j of c.joueurs) employes.add(j.nom);
  const vivNoms = [];
  for (const t in (Gv.vivier || {})) for (const e of Gv.vivier[t]) vivNoms.push(e[0]);
  for (const r of (Gv.rapport || [])) if (r && r.nom) vivNoms.push(r.nom);
  const coll = [...new Set(vivNoms.filter(n => employes.has(n)))];
  if (coll.length) fail("vivier 06/07 contient des joueurs déjà employés : " + coll.join(", "));
  else ok("vivier de l'été 2006 disjoint des effectifs employés : aucun homme à deux endroits");
} catch (e) { fail("exception doublons : " + e.stack); }

/* ===== 3) Année de base + étés internationaux + sièges européens ===== */
console.log("3) Année de base, été 2007 muet, EURO 2008 à la DEUXIÈME intersaison, sièges européens");
try {
  api.nouvellePartie("LYO", KEY);
  let G = api.getG();
  if (G.saison !== KEY) fail("G.saison = " + G.saison + " (attendu " + KEY + ")");
  if (G.anBase !== 2006) fail("G.anBase = " + G.anBase + " (attendu 2006)");
  if (api.anneeJeu() !== 2006) fail("anneeJeu() = " + api.anneeJeu() + " (attendu 2006)");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G.vire = null;
  api.intersaison();
  G = api.getG();
  // Partir de 06/07 laisse la PREMIÈRE intersaison muette : rien entre le Mondial 2006 et l'Euro 2008
  const ete2007 = (G.recap || []).join(" ");
  if (/ÉTÉ 200[0-9]/.test(ete2007))
    fail("l'été 2007 ne porte aucun tournoi : la 1re intersaison doit rester muette — reçu « " + ete2007.slice(0, 120) + " »");
  else ok("année de base 2006 ; l'été 2007 est MUET — aucun tournoi entre le Mondial 2006 et l'Euro 2008");
  if (G.saison !== "2007-08") fail("chaîne de saison : G.saison = " + G.saison + " (attendu 2007-08)");
  else ok("chaîne de saison correcte : 2006-07 → 2007-08");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  api.getG().vire = null; api.intersaison(); G = api.getG();
  // L'ÉTÉ 2008 EST LE PREMIER QUE `HONNEURS` AIT EU À APPRENDRE DEPUIS L'OUVERTURE DU CHANTIER,
  // et 06/07 est la saison qui le réclame : l'Espagne met fin à quarante-quatre ans d'attente.
  const ete2008 = (G.recap || []).join(" ");
  if (!/l'Espagne met fin à quarante-quatre ans/i.test(ete2008))
    fail("été 2008 : l'Euro de l'Espagne doit tomber à la DEUXIÈME intersaison quand on part de 06/07 — reçu « " + ete2008.slice(0, 140) + " »");
  else ok("l'EURO 2008 tombe à la DEUXIÈME intersaison : l'Espagne sacrée à Vienne, une frappe de Torres");
  // et la dépêche de 2008 ne doit pas se lire comme un triomphe français : les Bleus sortent du 1er tour
  if (/LA FRANCE/.test(ete2008)) fail("l'été 2008 ne doit pas contenir « LA FRANCE » en capitales : les Bleus sortent au premier tour");
  else ok("la dépêche de l'été 2008 ne se lit pas comme un triomphe français");
  // L'Europe 2006-07 telle qu'elle s'est jouée : LYON (champion) et BORDEAUX (2e) en phase de groupes
  // de Ligue des champions, LILLE (3e) au troisième tour de qualification ; en Coupe UEFA LENS (4e),
  // le PARIS SG (Coupe de France 2006), NANCY (Coupe de la Ligue 2006), et MARSEILLE et AUXERRE,
  // tous DEUX vainqueurs de l'INTERTOTO 2006 — deux clubs français par la même Intertoto pour la
  // DEUXIÈME année de suite. Huit sièges, tous en Ligue 1.
  const attendu = { LYO: "C1", BOR: "C1", LIL: "C1", LEN: "C3", PSG: "C3", NCY: "C3", OM: "C3", AUX: "C3",
                    TOU: null, REN: null, SOC: null, MON: null, STE: null, LMN: null, LOR: null,
                    NIC: null, VAN: null, TRO: null, SED: null, NAN: null,
                    MET: null, CAE: null, STR: null, GUI: null, BAS: null, AMI: null, REI: null,
                    LEH: null, AJA: null, DIJ: null, NIO: null, MTP: null, BRE: null, GRE: null,
                    CHA: null, LIB: null, GUE: null, CRE: null, IST: null, TRS: null };
  for (const id in attendu) {
    api.nouvellePartie(id, KEY);
    const c = api.getG().euroCompet;
    if (c !== attendu[id]) fail("siège européen " + id + " = " + c + " (attendu " + attendu[id] + ")");
  }
  ok("sièges européens : Lyon, Bordeaux et Lille en C1 ; Lens, le Paris SG, Nancy, Marseille et Auxerre en Coupe UEFA");
  const S = api.SAISONS[KEY];
  if ((S.euroC2 || []).length) fail("la Coupe des Coupes n'existe plus en 2006-07 : euroC2 doit être vide");
  else ok("aucun siège en Coupe des Coupes : la compétition a disparu après 1999 (septième fois)");
  // LE CONTRÔLE QUI ATTRAPE L'ERREUR LA PLUS FACILE ET LA PLUS INVISIBLE : Toulouse, TROISIÈME du
  // championnat 2006-07, part SANS Europe — les sièges se gagnent l'année d'AVANT, et Toulouse
  // n'était que quinzième en 2005-06. Même chose pour Rennes et Sochaux.
  for (const id of ["TOU", "REN", "SOC"])
    if ((S.euroC1 || []).includes(id) || (S.euroC3 || []).includes(id))
      fail(id + " n'a pas de siège en 2006-07 : les sièges se gagnent sur le classement de 2005-06");
  ok("Toulouse, futur troisième, part sans Europe : quinzième l'année d'avant");
  const tousSieges = (S.euroC1 || []).concat(S.euroC3 || []);
  if (tousSieges.length !== 8) fail("2006-07 compte huit sièges européens, reçu " + tousSieges.length);
  const horsL1 = tousSieges.filter(id => !S.d1.includes(id));
  if (horsL1.length) fail("siège européen de deuxième division : " + horsL1.join(","));
  else ok("les HUIT sièges sont en Ligue 1, et aucun depuis la Ligue 2 pour la deuxième fois de suite");
} catch (e) { fail("exception année/Europe : " + e.stack); }

/* ===== 4) Carrière multi-saisons depuis 06/07 ===== */
console.log("4) Carrière multi-saisons depuis 06/07 (calibrage, vieillissement)");
let totalButs = 0, totalMatchs = 0;
const departs = ["LYO", "NAN", "LIB", "MET"];  // le champion, le relégué historique, le club neuf, le futur promu
const NS = 6;
for (const dep of departs) {
  try {
    api.nouvellePartie(dep, KEY);
    for (let s = 0; s < NS; s++) {
      for (let d = 0; d < 38; d++) api.jouerJournee();
      const G = api.getG();
      let bp = 0, jSum = 0;
      for (const c of G.clubs) { bp += c.bp; jSum += c.j; }
      totalButs += bp; totalMatchs += jSum / 2;
      G.vire = null;
      api.intersaison();
      let mx = 0, actif36 = null;
      for (const c of api.getG().clubs) for (const j of c.joueurs) { if (j.age > mx) mx = j.age; if (j.age >= 36) actif36 = j; }
      if (actif36) { fail("joueur 36+ actif après vieillissement : " + actif36.nom + " (" + actif36.age + ")"); break; }
      if (mx > 35) { fail("âge max " + mx + " > 35"); break; }
    }
    ok("club " + dep + " : " + NS + " saisons sans exception (âge max ≤ 35)");
  } catch (e) { fail("exception carrière 06/07 (" + dep + ") : " + e.stack); }
}
const gpm = totalButs / totalMatchs;
console.log("— Calibrage 06/07 : " + gpm.toFixed(3) + " buts/match sur " + Math.round(totalMatchs) + " matchs —");
if (gpm < 2.0 || gpm > 2.8) fail("calibrage 06/07 hors plage (cible ~2,3) : " + gpm.toFixed(3));
else ok("calibrage 06/07 dans la plage attendue");

console.log(FAILS === 0 ? "\n✅ HARNAIS 06/07 : TOUT EST VERT" : "\n❌ HARNAIS 06/07 : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
