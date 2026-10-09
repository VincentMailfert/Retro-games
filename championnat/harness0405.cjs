/* Harnais de validation — SAISON DE DÉPART 2004-05
   Vérifie : intégrité du registre SAISONS, doublons de noms, année de base/étés,
   sièges européens, carrière multi-saisons depuis 04/05 (calibrage, vieillissement).
   C'est la saison la plus RÉCENTE du jeu, comme 03/04 l'était avant elle : toutes les
   ancres de notes sont derrière elle. Quatre singularités à surveiller ici — le plateau
   tombe juste tout seul pour la TROISIÈME fois de suite (vingt et vingt, aucun repêchage) ;
   la PREMIÈRE intersaison est MUETTE et le Mondial 2006 attend la deuxième ; un siège
   européen repart en deuxième division, Châteauroux jouant la Coupe UEFA pour avoir PERDU
   la finale de la Coupe de France ; et deux noms demandent une attention particulière —
   « Cris » appartient depuis 03/04 à un autre homme que le Lyonnais, et « L. Leroy » à un
   autre que le Rémois : c'est le piège du jour, celui de la tolérance d'un an des tables
   96/97, qui prenait Ludovic Leroy pour Laurent Leroy.
   Usage : node harness0405.cjs                                                    */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,CIBLE,SAISONS,STARS_0405,STARS_D2_0405,D1_0405,D2_0405,STARS_EUROPE,STARS_EUROPE_C2,STARS_EUROPE_C3,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const KEY = "2004-05";

/* ===== 1) Intégrité du registre SAISONS ===== */
console.log("1) Registre SAISONS : composition, métadonnées, effectifs");
try {
  const S = api.SAISONS[KEY];
  if (!S) fail("saison " + KEY + " absente du registre");
  else {
    if (S.d1.length !== 20) fail("L1 04/05 a " + S.d1.length + " clubs (attendu 20)");
    if (S.d2.length !== 20) fail("L2 04/05 a " + S.d2.length + " clubs (attendu 20)");
    const tous = S.d1.concat(S.d2);
    const setIds = new Set(tous);
    if (setIds.size !== 40) fail("ids dupliqués entre L1 et L2 (uniques: " + setIds.size + "/40)");
    const metaManquante = tous.filter(id => !api.metaClub(id));
    if (metaManquante.length) fail("métadonnées manquantes : " + metaManquante.join(","));
    if (!metaManquante.length && setIds.size === 40 && S.d1.length === 20 && S.d2.length === 20)
      ok("04/05 = 20 L1 + 20 L2, 40 clubs uniques, toutes métadonnées résolues");

    // LE PLATEAU TOMBE JUSTE TOUT SEUL POUR LA TROISIÈME FOIS DE SUITE : les deux échelons réels
    // ont vingt clubs, donc aucun repêchage, aucun écarté. On vérifie les deux listes par ÉGALITÉ.
    const REELS_D1 = ["LYO", "LIL", "MON", "REN", "OM", "STE", "LEN", "AJA", "PSG", "SOC",
                      "STR", "NIC", "TOU", "ACA", "BOR", "MET", "NAN", "CAE", "BAS", "IST"];
    const REELS_D2 = ["NCY", "LMN", "TRO", "DIJ", "CHA", "SED", "GUI", "MTP", "BRE", "LOR",
                      "GRE", "GUE", "AMI", "LAV", "CRE", "REI", "LEH", "CLE", "NIO", "ANG"];
    const absentsD1 = REELS_D1.filter(id => !S.d1.includes(id));
    const intrusD1 = S.d1.filter(id => !REELS_D1.includes(id));
    if (absentsD1.length || intrusD1.length)
      fail("L1 04/05 : absents " + (absentsD1.join(",") || "—") + " / intrus " + (intrusD1.join(",") || "—"));
    else ok("les vingt clubs de la vraie Ligue 1 2004-05 sont au plateau, et eux seuls (Saint-Étienne, Caen et Istres promus)");
    const absentsD2 = REELS_D2.filter(id => !S.d2.includes(id));
    const intrusD2 = S.d2.filter(id => !REELS_D2.includes(id));
    if (absentsD2.length || intrusD2.length)
      fail("L2 04/05 : absents " + (absentsD2.join(",") || "—") + " / intrus " + (intrusD2.join(",") || "—"));
    else ok("les vingt clubs de la vraie Ligue 2 2004-05 sont au plateau, et eux seuls (Guingamp, Le Mans et Montpellier descendus)");
    if (S.d1.length + S.d2.length !== REELS_D1.length + REELS_D2.length)
      fail("le compte de 04/05 doit tomber juste sans repêcher personne");
    else ok("AUCUN repêchage ni d'un côté ni de l'autre — la troisième fois de suite, après 02/03 et 03/04");

    // Dijon est le seul club neuf du plateau : il entre par CLUBS_EXTRA, en L2, pour sa première
    // saison professionnelle (monté du National en 2004, quatrième de Ligue 2 pour ses débuts).
    const dij = api.metaClub("DIJ");
    if (!dij) fail("Dijon (DIJ) doit être au registre des clubs");
    else if (!S.d2.includes("DIJ")) fail("Dijon joue la Ligue 2 en 2004-05");
    else if (!/Gaston-Gérard/.test(dij.stade)) fail("le stade de Dijon est Gaston-Gérard, pas « " + dij.stade + " »");
    else ok("Dijon FCO, seul club neuf de la saison, à Gaston-Gérard et en Ligue 2");

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

    // pas de plafond d'âge depuis 99/00 : les vétérans jouent leur saison réelle, puis raccrochent
    const vets = { NIC: "J. Cobos" };                                      // 36 ans
    const vetsD2 = { LEH: "A. Vencel", GUE: "J.-M. Branger", CRE: "P. Blondeau", GRE: "J.-M. Chanelet" };
    const absentsV = Object.entries(vets).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom))
      .concat(Object.entries(vetsD2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom)));
    if (absentsV.length)
      fail("vétérans 36+ manquants : " + absentsV.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("vétérans de 36 ans et plus conservés : Vencel et Branger (37 ans), Cobos, Blondeau et Chanelet (36 ans)");

    // LE PIÈGE DES TROIS DERNIÈRES SAISONS, QU'UN HARNAIS DOIT GARDER : le découpage du tableau de
    // temps de jeu laisse la DERNIÈRE ligne collée au bas de page, si bien qu'une expression ancrée
    // sur la fin de morceau ne trouve plus la cellule des minutes et rend ZÉRO. Huit derniers de
    // tableau avaient leur place dans un effectif cette année-là, dont Jérémy Ménez, dix-sept ans et
    // 1 777 minutes à Sochaux, et Danijel Ljuboja, buteur du Paris SG.
    const DERNIERS = { SOC: "J. Ménez", PSG: "D. Ljuboja", BAS: "C. Ben Saada", IST: "M. N'Diaye" };
    const DERNIERS_D2 = { LMN: "G. Ba", CHA: "P. D'Amico", AMI: "T. Camara", DIJ: "S. Mangione" };
    const zappes = Object.entries(DERNIERS).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom))
      .concat(Object.entries(DERNIERS_D2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom)));
    if (zappes.length)
      fail("derniers de tableau perdus (la sentinelle de fin a frappé) : " + zappes.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("les huit derniers de tableau ont leurs vraies minutes : Ménez, Ljuboja, Ben Saada, Titi Camara et les autres");
    // Ménez, dix-sept ans et 1 777 minutes, doit être noté comme un joueur qui a joué
    const menez = (S.starsD1.SOC || []).find(t => t[0] === "J. Ménez");
    if (!menez || menez[2] !== 17 || menez[4] < 85)
      fail("Jérémy Ménez : dix-sept ans à Sochaux, 1 777 minutes, et un potentiel qui dit la suite");
    else ok("Jérémy Ménez, dix-sept ans à Sochaux, noté " + menez[3] + " pour un potentiel de " + menez[4]);

    // les gamins de 2004 : le tri au temps de jeu les écartait, la liste de forçage les rattrape
    const forces = { LYO: "K. Benzema", LIL: "Y. Cabaye", AJA: "A. Diaby", TOU: "F. Clerc",
                     BAS: "C. Karembeu", NIC: "M. Djetou" };
    const forcesD2 = { GUI: "L. Koscielny", LOR: "A.-P. Gignac", TRO: "B. Matuidi", LEH: "S. Mandanda",
                       CRE: "B. Diomède", AMI: "T. Camara" };
    const perdus = Object.entries(forces).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom))
      .concat(Object.entries(forcesD2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom)));
    if (perdus.length) fail("pépites forcées absentes : " + perdus.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("pépites forcées présentes : Benzema, Cabaye, Diaby, Clerc, Koscielny, Gignac, Matuidi, Mandanda, Karembeu, Djetou, Diomède, Titi Camara");
    // KARIM BENZEMA A DIX-SEPT ANS ET CENT SEPT MINUTES : le tri aux minutes le jetait, et c'est
    // le Ballon d'or 2022. Le potentiel doit dire ce qui l'attend.
    const benzema = (S.starsD1.LYO || []).find(t => t[0] === "K. Benzema");
    if (!benzema || benzema[2] !== 17 || benzema[4] < 92)
      fail("Karim Benzema : dix-sept ans à Lyon, cent sept minutes, et le plus gros potentiel de la saison");
    else ok("Karim Benzema, dix-sept ans à Lyon, noté " + benzema[3] + " pour un potentiel de " + benzema[4]);
    // Steve Mandanda n'a joué QUE QUATRE-VINGT-DIX MINUTES : un seul match, et il est gardé
    const mandanda = (S.starsD2.LEH || []).find(t => t[0] === "S. Mandanda");
    if (!mandanda || mandanda[1] !== "G" || mandanda[4] < 85)
      fail("Steve Mandanda : dix-neuf ans au Havre, un seul match, futur gardien de l'équipe de France");
    else ok("Steve Mandanda gardé pour quatre-vingt-dix minutes au Havre, potentiel " + mandanda[4]);
    // Le Havre et Troyes paient chacun deux forcés, Créteil aussi : le prix du forçage, assumé
    const pairesD2 = [["LEH", ["S. Mandanda", "D. Digard", "G. Hoarau"]], ["TRO", ["B. Matuidi", "B. Gomis"]],
                      ["CRE", ["B. Diomède", "P. Blondeau"]]];
    const pairesD1 = [["LIL", ["Y. Cabaye", "Dante"]], ["NIC", ["M. Djetou", "E. Jankauskas"]]];
    const manquePaire = pairesD1.filter(([id, ns]) => ns.some(n => !(S.starsD1[id] || []).some(t => t[0] === n)))
      .concat(pairesD2.filter(([id, ns]) => ns.some(n => !(S.starsD2[id] || []).some(t => t[0] === n))));
    if (manquePaire.length) fail("forçage multiple incomplet : " + manquePaire.map(p => p[0]).join(", "));
    else ok("Le Havre paie TROIS hommes (Mandanda, Digard, Hoarau), Troyes et Créteil deux chacun, Lille garde Cabaye et Dante");

    // celles que le temps de jeu suffisait à garder
    const seuls = { LYO: ["M. Essien", "Juninho", "G. Coupet", "F. Malouda", "Cristiano", "É. Abidal", "H. Ben Arfa"],
                    MON: ["P. Evra", "J. Saviola", "E. Adebayor", "S. Squillaci"],
                    OM: ["F. Barthez", "B. Lizarazu", "S. Nasri", "B. Pedretti"],
                    REN: ["A. Frei", "A. Isaksson", "Y. Gourcuff", "J. Briand"],
                    AJA: ["B. Sagna", "Benoît Cheyrou", "Y. Kaboul"], NAN: ["M. Landreau", "J. Toulalan", "G. Yapi Yapo"],
                    PSG: ["Pauleta", "J. Rothen"], BOR: ["R. Mavuba", "M. Kapsis", "J. Faubert"],
                    MET: ["F. Ribéry", "L. Obraniak"], STE: ["D. Zokora", "Z. Camara", "L. Perrin"],
                    LEN: ["S. Keita", "É. Carrière"], BAS: ["P. Chimbonda", "A. Song"],
                    LIL: ["M. Moussilou", "M. Acimovic", "J. Makoun"], SOC: ["J. Mathieu"],
                    STR: ["A. Boka", "M. Niang"], CAE: ["R. Zubar", "Y. Gouffran"] };
    const rates = [];
    for (const id in seuls) for (const nom of seuls[id])
      if (!(S.starsD1[id] || []).some(t => t[0] === nom)) rates.push(nom + " (" + id + ")");
    for (const [id, nom] of [["LEH", "L. Diarra"], ["NCY", "G. Bracigliano"], ["LMN", "Y. Pelé"], ["LAV", "R. Gomis"]])
      if (!(S.starsD2[id] || []).some(t => t[0] === nom)) rates.push(nom + " (" + id + ")");
    if (rates.length) fail("pépites passées au temps de jeu et pourtant absentes : " + rates.join(", "));
    else ok("Essien, Juninho, Coupet, Evra, Saviola, Barthez, Lizarazu, Nasri, Frei, Ribéry, Sagna, Toulalan, Mavuba et Lassana Diarra passent au temps de jeu");
    // Michael Essien, meilleur joueur du championnat avant Chelsea : le sommet de la saison
    const essien = (S.starsD1.LYO || []).find(t => t[0] === "M. Essien");
    if (!essien || essien[3] < 85) fail("Michael Essien : meilleur joueur du championnat 2004-05, il ne peut pas sortir sous 85");
    else ok("Michael Essien, meilleur joueur du championnat, noté " + essien[3] + " pour un potentiel de " + essien[4]);
    // Alexander Frei, meilleur buteur avec vingt buts
    const frei = (S.starsD1.REN || []).find(t => t[0] === "A. Frei");
    if (!frei || frei[3] < 81) fail("Alexander Frei : vingt buts et meilleur buteur, il ne peut pas sortir sous 81");
    else ok("Alexander Frei, meilleur buteur du championnat avec vingt buts, noté " + frei[3]);
    // Grégory Coupet, meilleur gardien pour la troisième fois
    const coupet = (S.starsD1.LYO || []).find(t => t[0] === "G. Coupet");
    if (!coupet || coupet[1] !== "G" || coupet[3] < 84) fail("Grégory Coupet : meilleur gardien du championnat pour la troisième fois");
    else ok("Grégory Coupet, meilleur gardien pour la troisième fois, noté " + coupet[3]);

    // LE NOM QUI N'ÉTAIT PAS LIBRE, ET C'EST UN CAS SANS PRÉCÉDENT : DEUX MONONYMES « Cris ».
    // Le jeu donne « Cris » au défenseur d'Angers depuis 03/04 (né en 1979) ; le Lyonnais, né en
    // 1977, est un autre homme, et un nom court ne se reprend pas (règle de 02/03). Il est donc
    // écrit sous son prénom civil, que Transfermarkt donne en entier : Cristiano Márques Gómes.
    if ((S.starsD1.LYO || []).some(t => t[0] === "Cris"))
      fail("« Cris » appartient à l'Angevin de 03/04 : le Lyonnais ne peut pas le reprendre");
    else if (!(S.starsD1.LYO || []).some(t => t[0] === "Cristiano"))
      fail("le défenseur brésilien de Lyon doit être au plateau, écrit « Cristiano »");
    else ok("le Cris de Lyon s'écrit « Cristiano » : « Cris » reste à l'Angevin que le jeu porte depuis 03/04");

    const nD1 = S.d1.reduce((s, id) => s + S.starsD1[id].length, 0);
    const nD2 = S.d2.reduce((s, id) => s + S.starsD2[id].length, 0);
    if (nD1 !== 400) fail("L1 04/05 : " + nD1 + " joueurs curés (attendu 20 × 20)");
    if (nD2 !== 360) fail("L2 04/05 : " + nD2 + " joueurs curés (attendu 20 × 18)");
    if (nD1 === 400 && nD2 === 360) ok("760 joueurs réels relevés : 20 par club en L1, 18 en L2");
  }
} catch (e) { fail("exception registre : " + e.stack); }

/* ===== 2) Doublons de noms ===== */
console.log("2) Doublons de noms");
try {
  const compte = {};
  const ajoute = (nom, src) => { (compte[nom] = compte[nom] || []).push(src); };
  for (const id in api.STARS_0405) for (const t of api.STARS_0405[id]) ajoute(t[0], "L1:" + id);
  for (const id in api.STARS_D2_0405) for (const t of api.STARS_D2_0405[id]) ajoute(t[0], "L2:" + id);
  const dupClub = Object.entries(compte).filter(([n, s]) => s.length > 1);
  if (dupClub.length) dupClub.forEach(([n, s]) => fail("doublon 04/05 : « " + n + " » dans " + s.join(" + ")));
  else ok("aucun joueur dupliqué entre deux clubs en 04/05 (transferts d'hiver arbitrés au temps de jeu)");

  // homonymes DANS la saison : celui qui portait DÉJÀ le nom court dans le jeu le garde (règle de
  // 00/01), l'autre passe en toutes lettres. Quatre cas en 04/05.
  const HOMONYMES = [["B. Cheyrou", "Benoît Cheyrou"], ["S. Keita", "Sidi Keita"],
                     ["F. Mendy", "Frédéric Mendy"], ["Eduardo", "Eduardo Oliveira"]];
  // Eduardo Oliveira n'a pas franchi le tri aux minutes : seul le nom court doit exister.
  const mal = [["B. Cheyrou", "Benoît Cheyrou"], ["S. Keita", "Sidi Keita"], ["F. Mendy", "Frédéric Mendy"]]
    .filter(([court, long]) => !compte[court] || !compte[long]);
  if (mal.length) fail("homonymes mal résolus : " + mal.map(p => p.join(" / ")).join(" ; "));
  else ok("homonymes résolus : Bruno Cheyrou garde « B. Cheyrou » face à Benoît, Seydou Keita face à Sidi, et le Mendy de Montpellier face au Stéphanois");
  if (!compte["Eduardo"]) fail("« Eduardo » doit rester au Toulousain que le jeu porte depuis 03/04");
  else ok("« Eduardo » reste au Toulousain de 03/04");

  // LA RÈGLE ÉTENDUE D'UNE SAISON À L'AUTRE : un nom court que le JEU attribue déjà à un autre
  // homme ne se reprend pas, même si cet homme ne joue plus en France. Quatre cas en 04/05, dont
  // Abdoulaye Faye reconduit de 03/04 (« A. Faye » est Amdy, parti en Angleterre).
  // LUDOVIC LEROY EST LE CAS NEUF, ET C'EST LE PIÈGE DU JOUR : « L. Leroy » est Laurent Leroy
  // (né en avril 1976), que le jeu porte depuis 96/97 ; le Rémois est Ludovic Leroy (né en
  // septembre 1975), un défenseur et non un attaquant. La tolérance d'un an accordée aux tables
  // 96/97 les confondait.
  const CEDENT = [["A. Faye", "Abdoulaye Faye"], ["M. Diallo", "Mamadou Diallo"],
                  ["A. Cissé", "Abdoulaye Cissé"], ["L. Leroy", "Ludovic Leroy"]];
  const bavures = CEDENT.filter(([court, long]) => compte[court] || !compte[long]);
  if (bavures.length)
    fail("nom court d'un autre homme repris : " + bavures.map(p => p[0] + " au lieu de " + p[1]).join(" ; "));
  else ok("Abdoulaye Faye, Mamadou Diallo, Abdoulaye Cissé et Ludovic Leroy gardent leur nom en toutes lettres : « A. Faye », « M. Diallo », « A. Cissé » et « L. Leroy » sont à d'autres");

  // piège « J. Arne Riise » : un prénom composé resté collé au patronyme.
  const PARTICULES = new Set(["Le", "La", "Les", "De", "Del", "Della", "Da", "Das", "Do", "Dos", "Di", "Du",
    "Van", "Von", "Der", "Ten", "Ter", "El", "Al", "Ben", "Bin", "Mac", "Mc", "O", "Saint", "San", "Aït", "Ait"]);
  // patronyme en deux mots vérifié sur pièces, et non un prénom avalé (jurisprudence Michael Mio
  // Nielsen, 90/91) : Gilles Donald YAPI YAPO, reconduit de 03/04.
  const COMPOSES = new Set(["Yapi"]);
  const suspects = Object.keys(compte).filter(n => {
    const m = /^[A-ZÀ-Þ]\.(-[A-ZÀ-Þ]\.)? ([A-ZÀ-Þ][a-zà-ÿ']+) [A-ZÀ-Þ]/.exec(n);
    return m && !PARTICULES.has(m[2]) && !COMPOSES.has(m[2]);
  });
  if (suspects.length) fail("noms à vérifier (prénom composé avalé dans le patronyme ?) : " + suspects.join(", "));
  else ok("aucun prénom composé resté collé au patronyme (« Yapi Yapo » est un vrai patronyme, « Do Marcolino » porte une particule)");

  // réconciliation France ↔ Europe (clubs européens figés en 95-96)
  const eur = new Set();
  for (const T of [api.STARS_EUROPE, api.STARS_EUROPE_C2, api.STARS_EUROPE_C3]) for (const id in T) for (const t of T[id]) eur.add(t[0]);
  const collE = Object.keys(compte).filter(n => eur.has(n));
  api.nouvellePartie("LYO", KEY);
  const Gv = api.getG();
  const enFr = new Set(); for (const c of Gv.clubs.concat(Gv.autre)) for (const j of c.joueurs) if (j.reel) enFr.add(j.nom);
  const surDeux = []; for (const c of Gv.europe) for (const j of c.joueurs) if (j.reel && enFr.has(j.nom)) surDeux.push(j.nom + " (" + c.id + ")");
  if (surDeux.length) fail("joueurs réels à la fois en France et en Europe : " + surDeux.join(", "));
  else ok(collE.length + " joueurs passés en France (" + collE.slice(0, 4).join(", ") + "…) retirés de leur club européen");
  const courts = Gv.europe.filter(c => ["G", "D", "M", "A"].some(p => c.joueurs.filter(j => j.pos === p).length < api.CIBLE[p]));
  if (courts.length) fail("clubs européens sous l'effectif cible après réconciliation : " + courts.map(c => c.id).join(","));
  const employes = new Set();
  for (const c of Gv.clubs.concat(Gv.autre || [])) for (const j of c.joueurs) employes.add(j.nom);
  const vivNoms = [];
  for (const t in (Gv.vivier || {})) for (const e of Gv.vivier[t]) vivNoms.push(e[0]);
  for (const r of (Gv.rapport || [])) if (r && r.nom) vivNoms.push(r.nom);
  const coll = [...new Set(vivNoms.filter(n => employes.has(n)))];
  if (coll.length) fail("vivier 04/05 contient des joueurs déjà employés : " + coll.join(", "));
  else ok("vivier construit disjoint des effectifs employés (04/05)");
} catch (e) { fail("exception doublons : " + e.stack); }

/* ===== 3) Année de base + étés internationaux + sièges européens ===== */
console.log("3) Année de base, première intersaison MUETTE, Mondial 2006 à la deuxième, sièges européens");
try {
  api.nouvellePartie("LYO", KEY);
  let G = api.getG();
  if (G.saison !== KEY) fail("G.saison = " + G.saison + " (attendu " + KEY + ")");
  if (G.anBase !== 2004) fail("G.anBase = " + G.anBase + " (attendu 2004)");
  if (api.anneeJeu() !== 2004) fail("anneeJeu() = " + api.anneeJeu() + " (attendu 2004)");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G.vire = null;
  api.intersaison();
  G = api.getG();
  // Partir de 04/05 laisse la PREMIÈRE intersaison muette : l'été 2005 ne porte aucun tournoi.
  const ete2005 = (G.recap || []).join(" ");
  if (/ÉTÉ 200[0-9]/.test(ete2005))
    fail("l'été 2005 ne porte aucun tournoi : la 1re intersaison doit rester muette — reçu « " + ete2005.slice(0, 120) + " »");
  else ok("année de base 2004 ; la PREMIÈRE intersaison est muette, l'été 2005 ne porte aucun tournoi");
  if (G.saison !== "2005-06") fail("chaîne de saison : G.saison = " + G.saison + " (attendu 2005-06)");
  else ok("chaîne de saison correcte : 2004-05 → 2005-06");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  api.getG().vire = null; api.intersaison(); G = api.getG();
  const ete2006 = (G.recap || []).join(" ");
  // le Mondial 2006 tombe à la DEUXIÈME intersaison : l'Italie aux tirs au but, un soir de drame
  if (!/l'Italie au bout des tirs au but/i.test(ete2006))
    fail("été 2006 : le Mondial de l'Italie doit tomber à la DEUXIÈME intersaison quand on part de 04/05");
  else ok("le Mondial 2006 tombe à la DEUXIÈME intersaison — l'Italie aux tirs au but, à Berlin");
  // et la dépêche de 2006 ne doit pas se lire comme un triomphe français : la France a PERDU la finale
  if (/LA FRANCE/.test(ete2006)) fail("l'été 2006 ne doit pas contenir « LA FRANCE » en capitales : la France a perdu la finale");
  else ok("la dépêche de l'été 2006 ne se lit pas comme un triomphe français");
  // L'Europe 2004-05 telle qu'elle s'est jouée : Lyon (champion 03/04) et le Paris SG (2e) en phase
  // de groupes de Ligue des champions, Monaco (3e, finaliste sortant) au troisième tour de
  // qualification ; en Coupe UEFA Auxerre (4e), Sochaux (5e ET vainqueur de la Coupe de la Ligue),
  // LILLE au titre de l'INTERTOTO 2004 — le premier club français à le gagner depuis Montpellier en
  // 1999 — et CHÂTEAUROUX, finaliste battu de la Coupe de France 2004, le Paris SG vainqueur étant
  // déjà qualifié en C1. Marseille, septième, n'a aucun siège.
  const attendu = { LYO: "C1", PSG: "C1", MON: "C1", AJA: "C3", SOC: "C3", LIL: "C3", CHA: "C3",
                    OM: null, REN: null, STE: null, LEN: null, STR: null, NIC: null, TOU: null,
                    ACA: null, BOR: null, MET: null, NAN: null, CAE: null, BAS: null, IST: null,
                    NCY: null, LMN: null, TRO: null, DIJ: null, SED: null, GUI: null, MTP: null,
                    BRE: null, LOR: null, GRE: null, GUE: null, AMI: null, LAV: null, CRE: null,
                    REI: null, LEH: null, CLE: null, NIO: null, ANG: null };
  for (const id in attendu) {
    api.nouvellePartie(id, KEY);
    const c = api.getG().euroCompet;
    if (c !== attendu[id]) fail("siège européen " + id + " = " + c + " (attendu " + attendu[id] + ")");
  }
  ok("sièges européens : Lyon, le Paris SG et Monaco en C1 ; Auxerre, Sochaux, Lille et Châteauroux en Coupe UEFA");
  const S = api.SAISONS[KEY];
  if ((S.euroC2 || []).length) fail("la Coupe des Coupes n'existe plus en 2004-05 : euroC2 doit être vide");
  else ok("aucun siège en Coupe des Coupes : la compétition a disparu après 1999");
  // UN SIÈGE REPART EN DEUXIÈME DIVISION, ce qui n'était plus arrivé depuis 02/03 : La Berrichonne
  // de Châteauroux joue la Coupe UEFA pour avoir PERDU une finale — un motif neuf pour le jeu.
  if (!S.d2.includes("CHA"))
    fail("Châteauroux joue la Ligue 2 en 2004-05 : c'est tout l'intérêt de son siège européen");
  else ok("Châteauroux joue la Coupe UEFA DEPUIS LA DEUXIÈME DIVISION, pour avoir perdu la finale de la Coupe de France — le sixième club du jeu dans ce cas, et le premier en tant que finaliste battu");
  const horsL1 = ["LYO", "PSG", "MON", "AJA", "SOC", "LIL"].filter(id => !S.d1.includes(id));
  if (horsL1.length) fail("siège européen de première division égaré : " + horsL1.join(","));
  else ok("les six autres sièges sont bien en Ligue 1");
} catch (e) { fail("exception année/Europe : " + e.stack); }

/* ===== 4) Carrière multi-saisons depuis 04/05 ===== */
console.log("4) Carrière multi-saisons depuis 04/05 (calibrage, vieillissement)");
let totalButs = 0, totalMatchs = 0;
const departs = ["LYO", "LIL", "DIJ", "NCY"];  // le champion, le vice-champion, le club neuf, le futur promu
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
  } catch (e) { fail("exception carrière 04/05 (" + dep + ") : " + e.stack); }
}
const gpm = totalButs / totalMatchs;
console.log("— Calibrage 04/05 : " + gpm.toFixed(3) + " buts/match sur " + Math.round(totalMatchs) + " matchs —");
if (gpm < 2.0 || gpm > 2.8) fail("calibrage 04/05 hors plage (cible ~2,3) : " + gpm.toFixed(3));
else ok("calibrage 04/05 dans la plage attendue");

console.log(FAILS === 0 ? "\n✅ HARNAIS 04/05 : TOUT EST VERT" : "\n❌ HARNAIS 04/05 : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
