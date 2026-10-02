/* Harnais de validation — SAISON DE DÉPART 2005-06
   Vérifie : intégrité du registre SAISONS, doublons de noms, année de base/étés,
   sièges européens, carrière multi-saisons depuis 05/06 (calibrage, vieillissement).
   C'est la saison la plus RÉCENTE du jeu, comme 04/05 l'était avant elle : toutes les
   ancres de notes sont derrière elle. Quatre singularités à surveiller ici — le plateau
   tombe juste tout seul pour la QUATRIÈME fois de suite (vingt et vingt, aucun repêchage) ;
   la PREMIÈRE intersaison porte le Mondial 2006, celui que l'Italie gagne aux tirs au but
   et que la France perd, donc sans « LA FRANCE » en capitales ; les HUIT sièges européens
   sont tous en Ligue 1, la plus grosse délégation depuis 97/98, avec DEUX clubs qualifiés
   par l'Intertoto 2005 ; et deux mononymes « Adailton » cohabitent, ce qui rouvre le cas
   « Cris » de 04/05 — le Rennais garde le nom court, le Lorrain s'écrit « Adailton Santos ».
   Usage : node harness0506.cjs                                                    */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,CIBLE,SAISONS,STARS_0506,STARS_D2_0506,D1_0506,D2_0506,STARS_EUROPE,STARS_EUROPE_C2,STARS_EUROPE_C3,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const KEY = "2005-06";

/* ===== 1) Intégrité du registre SAISONS ===== */
console.log("1) Registre SAISONS : composition, métadonnées, effectifs");
try {
  const S = api.SAISONS[KEY];
  if (!S) fail("saison " + KEY + " absente du registre");
  else {
    if (S.d1.length !== 20) fail("L1 05/06 a " + S.d1.length + " clubs (attendu 20)");
    if (S.d2.length !== 20) fail("L2 05/06 a " + S.d2.length + " clubs (attendu 20)");
    const tous = S.d1.concat(S.d2);
    const setIds = new Set(tous);
    if (setIds.size !== 40) fail("ids dupliqués entre L1 et L2 (uniques: " + setIds.size + "/40)");
    const metaManquante = tous.filter(id => !api.metaClub(id));
    if (metaManquante.length) fail("métadonnées manquantes : " + metaManquante.join(","));
    if (!metaManquante.length && setIds.size === 40 && S.d1.length === 20 && S.d2.length === 20)
      ok("05/06 = 20 L1 + 20 L2, 40 clubs uniques, toutes métadonnées résolues");

    // LE PLATEAU TOMBE JUSTE TOUT SEUL POUR LA QUATRIÈME FOIS DE SUITE : les deux échelons réels
    // ont vingt clubs, donc aucun repêchage, aucun écarté. On vérifie les deux listes par ÉGALITÉ.
    const REELS_D1 = ["LYO", "BOR", "LIL", "LEN", "OM", "REN", "AUX", "MON", "PSG", "NIC",
                      "NAN", "STE", "SOC", "LMN", "TOU", "NCY", "TRO", "AJA", "STR", "MET"];
    const REELS_D2 = ["VAN", "SED", "LOR", "CAE", "DIJ", "BAS", "LEH", "CRE", "GUI", "GRE",
                      "IST", "MTP", "AMI", "CHA", "REI", "GUE", "BRE", "CLE", "LAV", "SET"];
    const absentsD1 = REELS_D1.filter(id => !S.d1.includes(id));
    const intrusD1 = S.d1.filter(id => !REELS_D1.includes(id));
    if (absentsD1.length || intrusD1.length)
      fail("L1 05/06 : absents " + (absentsD1.join(",") || "—") + " / intrus " + (intrusD1.join(",") || "—"));
    else ok("les vingt clubs de la vraie Ligue 1 2005-06 sont au plateau, et eux seuls (Nancy, Le Mans et Troyes promus)");
    const absentsD2 = REELS_D2.filter(id => !S.d2.includes(id));
    const intrusD2 = S.d2.filter(id => !REELS_D2.includes(id));
    if (absentsD2.length || intrusD2.length)
      fail("L2 05/06 : absents " + (absentsD2.join(",") || "—") + " / intrus " + (intrusD2.join(",") || "—"));
    else ok("les vingt clubs de la vraie Ligue 2 2005-06 sont au plateau, et eux seuls (Caen, Bastia et Istres descendus)");
    if (S.d1.length + S.d2.length !== REELS_D1.length + REELS_D2.length)
      fail("le compte de 05/06 doit tomber juste sans repêcher personne");
    else ok("AUCUN repêchage ni d'un côté ni de l'autre — la quatrième fois de suite, après 02/03, 03/04 et 04/05");

    // Sète est le seul club neuf du plateau : il entre par CLUBS_EXTRA, en Ligue 2, monté du
    // National, et il redescend au bout d'une saison (dernier, vingt-trois points).
    const set = api.metaClub("SET");
    if (!set) fail("Sète (SET) doit être au registre des clubs");
    else if (!S.d2.includes("SET")) fail("Sète joue la Ligue 2 en 2005-06");
    else if (!/Louis-Michel/.test(set.stade)) fail("le stade de Sète est Louis-Michel, pas « " + set.stade + " »");
    else ok("FC Sète 34, seul club neuf de la saison, à Louis-Michel et en Ligue 2");

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

    // pas de plafond d'âge depuis 99/00 : les vétérans jouent leur saison réelle, puis raccrochent.
    // Franck Silvestre, trente-huit ans et mille cent minutes à Sète, est le plus vieux du jeu.
    const vetsD2 = { SET: "F. Silvestre", DIJ: "S. Grégoire", CHA: "T. Bertin",
                     REI: "C. Delmotte", BRE: "C. Forest" };
    const absentsV = Object.entries(vetsD2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom));
    if (absentsV.length)
      fail("vétérans 36+ manquants : " + absentsV.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("vétérans de 36 ans et plus conservés : Silvestre (38 ans), Grégoire (37), Bertin, Delmotte et Forest (36)");
    const silvestre = (S.starsD2.SET || []).find(t => t[0] === "F. Silvestre");
    if (!silvestre || silvestre[2] !== 38)
      fail("Franck Silvestre a trente-huit ans à Sète : quatorze matchs, le plus vieux joueur du jeu");
    else ok("Franck Silvestre, trente-huit ans et quatorze matchs à Sète — le plus vieux vrai joueur du jeu");

    // LE PIÈGE DES QUATRE DERNIÈRES SAISONS, QU'UN HARNAIS DOIT GARDER : le découpage du tableau de
    // temps de jeu laisse la DERNIÈRE ligne collée au bas de page, si bien qu'une expression ancrée
    // sur la fin de morceau ne trouve plus la cellule des minutes et rend ZÉRO. Neuf derniers de
    // tableau avaient leur place dans un effectif cette année-là, dont Sylvain Wiltord et ses
    // 3 107 minutes à Lyon, et Stéphane Mangione, 3 250 minutes à Dijon.
    const DERNIERS = { LYO: "S. Wiltord", BOR: "M. Chamakh", REN: "M. Sow", STR: "K. Gameiro" };
    const DERNIERS_D2 = { DIJ: "S. Mangione", SED: "M. Boutabout", LOR: "J. Audel",
                          GUI: "A. Gonzalez", SET: "C. Rouve" };
    const zappes = Object.entries(DERNIERS).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom))
      .concat(Object.entries(DERNIERS_D2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom)));
    if (zappes.length)
      fail("derniers de tableau perdus (la sentinelle de fin a frappé) : " + zappes.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("les neuf derniers de tableau ont leurs vraies minutes : Wiltord, Chamakh, Mangione, Boutabout, Audel et les autres");
    const wiltord = (S.starsD1.LYO || []).find(t => t[0] === "S. Wiltord");
    if (!wiltord || wiltord[3] < 77)
      fail("Sylvain Wiltord : 3 107 minutes chez le champion, il ne peut pas sortir d'un tableau à zéro minute");
    else ok("Sylvain Wiltord, dernier du tableau lyonnais, noté " + wiltord[3] + " pour ses 3 107 minutes");

    // les gamins de 2005 : le tri au temps de jeu les écartait, la liste de forçage les rattrape
    const forces = { LYO: "K. Benzema", AUX: "Y. Kaboul", LIL: "K. Mirallas", STR: "R. Faty",
                     NAN: "D. Payet", REN: "M. Sow", MET: "G. Bong" };
    const forcesD2 = { GRE: "O. Giroud", GUI: "L. Koscielny", LOR: "A.-P. Gignac",
                       LAV: "H. Yebda", GUE: "M. Bougherra", CLE: "B. Diomède", IST: "M. Djetou" };
    const perdus = Object.entries(forces).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom))
      .concat(Object.entries(forcesD2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom)));
    if (perdus.length) fail("pépites forcées absentes : " + perdus.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("pépites forcées présentes : Benzema, Ben Arfa, Kaboul, Diaby, Mirallas, Dante, Gameiro, Faty, Giroud, Payet, Oliech, Sow, Koscielny, Gignac, Yebda, Bougherra, Bong, Diomède, Djetou");
    // OLIVIER GIROUD A DIX-NEUF ANS ET CENT QUATORZE MINUTES EN LIGUE 2 : le tri aux minutes le
    // jetait, et c'est le meilleur buteur de l'histoire des Bleus. Le potentiel doit dire la suite.
    const giroud = (S.starsD2.GRE || []).find(t => t[0] === "O. Giroud");
    if (!giroud || giroud[2] !== 19 || giroud[4] < 84)
      fail("Olivier Giroud : dix-neuf ans à Grenoble, cent quatorze minutes, et tout devant lui");
    else ok("Olivier Giroud, dix-neuf ans à Grenoble, noté " + giroud[3] + " pour un potentiel de " + giroud[4]);
    // DIMITRI PAYET N'A JOUÉ QUE QUATRE-VINGT-HUIT MINUTES à Nantes : un gamin de dix-huit ans
    const payet = (S.starsD1.NAN || []).find(t => t[0] === "D. Payet");
    if (!payet || payet[2] !== 18 || payet[4] < 86)
      fail("Dimitri Payet : dix-huit ans à Nantes, quatre-vingt-huit minutes, et le Vélodrome plus tard");
    else ok("Dimitri Payet gardé pour quatre-vingt-huit minutes à Nantes, potentiel " + payet[4]);
    // Karim Benzema a maintenant dix-huit ans et sept cent quatre-vingt-seize minutes
    const benzema = (S.starsD1.LYO || []).find(t => t[0] === "K. Benzema");
    if (!benzema || benzema[2] !== 18 || benzema[4] < 92)
      fail("Karim Benzema : dix-huit ans à Lyon, 796 minutes, et le plus gros potentiel de la saison");
    else ok("Karim Benzema, dix-huit ans à Lyon, noté " + benzema[3] + " pour un potentiel de " + benzema[4]);
    // Lille, Auxerre, Strasbourg et Nantes paient deux forcés chacun : le prix du forçage, assumé
    const pairesD1 = [["LYO", ["K. Benzema", "H. Ben Arfa"]], ["AUX", ["Y. Kaboul", "A. Diaby"]],
                      ["LIL", ["K. Mirallas", "Dante"]], ["STR", ["K. Gameiro", "R. Faty"]],
                      ["NAN", ["D. Payet", "D. Oliech"]]];
    const manquePaire = pairesD1.filter(([id, ns]) => ns.some(n => !(S.starsD1[id] || []).some(t => t[0] === n)));
    if (manquePaire.length) fail("forçage multiple incomplet : " + manquePaire.map(p => p[0]).join(", "));
    else ok("Lyon, Auxerre, Lille, Strasbourg et Nantes paient DEUX hommes chacun");

    // celles que le temps de jeu suffisait à garder — et HUGO LLORIS EN EST, cette année
    const seuls = { LYO: ["Juninho", "G. Coupet", "F. Malouda", "Cristiano", "É. Abidal", "M. Diarra", "J. Carew", "T. Mendes"],
                    OM: ["F. Ribéry", "S. Nasri", "F. Barthez", "L. Cana", "M. Niang", "T. Taiwo"],
                    NIC: ["H. Lloris", "C. Rool", "R. Fanni"],
                    REN: ["A. Frei", "A. Isaksson", "Y. Gourcuff", "J. Briand", "K. Källström"],
                    BOR: ["R. Mavuba", "M. Chamakh", "U. Ramé", "V. Smicer"],
                    LIL: ["M. Moussilou", "Y. Cabaye", "J. Makoun", "M. Debuchy", "S. Lichtsteiner"],
                    LEN: ["S. Keita", "A. Diarra", "É. Carrière", "P.-A. Frau"],
                    MON: ["P. Evra", "Maicon", "E. Adebayor", "S. Squillaci"],
                    PSG: ["Pauleta", "J. Rothen", "S. Armand"], NAN: ["M. Landreau", "J. Toulalan"],
                    AUX: ["B. Sagna", "Benoît Cheyrou"], STE: ["D. Zokora", "B. Gomis"],
                    SOC: ["J. Ménez"], TOU: ["J. Mathieu"], TRO: ["B. Matuidi"], MET: ["S. Bassong"] };
    const rates = [];
    for (const id in seuls) for (const nom of seuls[id])
      if (!(S.starsD1[id] || []).some(t => t[0] === nom)) rates.push(nom + " (" + id + ")");
    for (const [id, nom] of [["LEH", "S. Mandanda"], ["CAE", "Y. Gouffran"], ["LAV", "R. Gomis"], ["VAN", "S. Savidan"]])
      if (!(S.starsD2[id] || []).some(t => t[0] === nom)) rates.push(nom + " (" + id + ")");
    if (rates.length) fail("pépites passées au temps de jeu et pourtant absentes : " + rates.join(", "));
    else ok("Juninho, Ribéry, Nasri, Gourcuff, Mandanda, Ménez, Cabaye, Matuidi, Sagna et Toulalan passent au temps de jeu");
    // HUGO LLORIS EST LÀ CETTE FOIS : en 04/05 il n'avait pas joué une minute et restait dehors ;
    // en 05/06 il en joue mille cinquante à Nice, et la source fait foi dans les deux sens.
    const lloris = (S.starsD1.NIC || []).find(t => t[0] === "H. Lloris");
    if (!lloris || lloris[1] !== "G" || lloris[2] !== 19 || lloris[4] < 90)
      fail("Hugo Lloris : dix-neuf ans dans les buts de Nice, mille cinquante minutes, futur capitaine champion du monde");
    else ok("Hugo Lloris entre au jeu, dix-neuf ans et mille cinquante minutes à Nice, potentiel " + lloris[4]);
    // Juninho Pernambucano, meilleur joueur du championnat 2005-06 : le sommet de la saison
    const juninho = (S.starsD1.LYO || []).find(t => t[0] === "Juninho");
    if (!juninho || juninho[3] < 85) fail("Juninho : meilleur joueur du championnat 2005-06, il ne peut pas sortir sous 85");
    else ok("Juninho, meilleur joueur du championnat, noté " + juninho[3] + " pour un potentiel de " + juninho[4]);
    // Pauleta, meilleur buteur avec vingt et un buts
    const pauleta = (S.starsD1.PSG || []).find(t => t[0] === "Pauleta");
    if (!pauleta || pauleta[3] < 84) fail("Pauleta : vingt et un buts et meilleur buteur, il ne peut pas sortir sous 84");
    else ok("Pauleta, meilleur buteur du championnat avec vingt et un buts, noté " + pauleta[3]);
    // Grégory Coupet, meilleur gardien pour la quatrième fois
    const coupet = (S.starsD1.LYO || []).find(t => t[0] === "G. Coupet");
    if (!coupet || coupet[1] !== "G" || coupet[3] < 85) fail("Grégory Coupet : meilleur gardien du championnat pour la quatrième fois");
    else ok("Grégory Coupet, meilleur gardien pour la quatrième fois, noté " + coupet[3]);
    // Franck Ribéry, meilleur espoir, la saison qui l'emmène au Mondial
    const ribery = (S.starsD1.OM || []).find(t => t[0] === "F. Ribéry");
    if (!ribery || ribery[3] < 79) fail("Franck Ribéry : meilleur espoir du championnat, 4 467 minutes au Vélodrome");
    else ok("Franck Ribéry, meilleur espoir, noté " + ribery[3] + " pour un potentiel de " + ribery[4]);

    // DEUX MONONYMES « Adailton », ET C'EST LE CAS « Cris » DE 04/05 QUI SE REJOUE. Le jeu donne
    // « Adailton » depuis 04/05 au Rennais, né en 1983 ; celui de Nancy, né en 1979, est un autre
    // homme, et un nom court ne se reprend pas (règle de 02/03). Il s'écrit donc sous son nom civil,
    // qu'on a lu en entier sur sa fiche Transfermarkt : Adailton da Silva Santos.
    if ((S.starsD1.NCY || []).some(t => t[0] === "Adailton"))
      fail("« Adailton » appartient au Rennais depuis 04/05 : le Lorrain ne peut pas le reprendre");
    else if (!(S.starsD1.NCY || []).some(t => t[0] === "Adailton Santos"))
      fail("le défenseur brésilien de Nancy doit être au plateau, écrit « Adailton Santos »");
    else if (!(S.starsD1.REN || []).some(t => t[0] === "Adailton"))
      fail("« Adailton » doit rester au Rennais que le jeu porte depuis 04/05");
    else ok("l'Adailton de Nancy s'écrit « Adailton Santos » : « Adailton » reste au Rennais de 04/05");
    // et « Cris » reste à l'Angevin, le Lyonnais gardant son « Cristiano » de 04/05
    if ((S.starsD1.LYO || []).some(t => t[0] === "Cris"))
      fail("« Cris » appartient à l'Angevin de 03/04 : le Lyonnais garde « Cristiano »");
    else if (!(S.starsD1.LYO || []).some(t => t[0] === "Cristiano"))
      fail("le défenseur brésilien de Lyon doit être au plateau, écrit « Cristiano » comme en 04/05");
    else ok("le Cris de Lyon reste écrit « Cristiano », comme en 04/05");

    const nD1 = S.d1.reduce((s, id) => s + S.starsD1[id].length, 0);
    const nD2 = S.d2.reduce((s, id) => s + S.starsD2[id].length, 0);
    if (nD1 !== 400) fail("L1 05/06 : " + nD1 + " joueurs curés (attendu 20 × 20)");
    if (nD2 !== 360) fail("L2 05/06 : " + nD2 + " joueurs curés (attendu 20 × 18)");
    if (nD1 === 400 && nD2 === 360) ok("760 joueurs réels relevés : 20 par club en L1, 18 en L2");
  }
} catch (e) { fail("exception registre : " + e.stack); }

/* ===== 2) Doublons de noms ===== */
console.log("2) Doublons de noms");
try {
  const compte = {};
  const ajoute = (nom, src) => { (compte[nom] = compte[nom] || []).push(src); };
  for (const id in api.STARS_0506) for (const t of api.STARS_0506[id]) ajoute(t[0], "L1:" + id);
  for (const id in api.STARS_D2_0506) for (const t of api.STARS_D2_0506[id]) ajoute(t[0], "L2:" + id);
  const dupClub = Object.entries(compte).filter(([n, s]) => s.length > 1);
  if (dupClub.length) dupClub.forEach(([n, s]) => fail("doublon 05/06 : « " + n + " » dans " + s.join(" + ")));
  else ok("aucun joueur dupliqué entre deux clubs en 05/06 (trente-quatre transferts arbitrés au temps de jeu)");

  // homonymes DANS la saison : celui qui portait DÉJÀ le nom court dans le jeu le garde (règle de
  // 00/01), l'autre passe en toutes lettres. Six cas en 05/06, un record.
  const HOMONYMES = [["B. Cheyrou", "Benoît Cheyrou"], ["M. Diarra", "Moké Diarra"],
                     ["A. Yahia", "Alaeddine Yahia"], ["F. Mendy", "Frédéric Mendy"],
                     ["I. Bangoura", "Ismaël Bangoura"], ["D. Coulibaly", "Dramane Coulibaly"]];
  const mal = HOMONYMES.filter(([court, long]) => !compte[court] || !compte[long]);
  if (mal.length) fail("homonymes mal résolus : " + mal.map(p => p.join(" / ")).join(" ; "));
  else ok("homonymes résolus : Mahamadou Diarra garde « M. Diarra » face à Moké, Bruno Cheyrou face à Benoît, Antar Yahia face à Alaeddine, le Mendy de Montpellier face au Stéphanois");
  // « M. N'Diaye » est l'Ajaccien que le jeu porte depuis 00/01 ; le Messin Momar, dix-huit ans, a
  // cédé sa place au forçage de Gaëtan Bong, dix-sept ans — le seul des vingt que Metz pouvait payer.
  if (!(api.STARS_0506.AJA || []).some(t => t[0] === "M. N'Diaye"))
    fail("« M. N'Diaye » est l'attaquant d'Ajaccio, que le jeu porte depuis 00/01");
  else ok("« M. N'Diaye » reste à l'Ajaccien : un seul N'Diaye à initiale au plateau");

  // LA RÈGLE ÉTENDUE D'UNE SAISON À L'AUTRE : un nom court que le JEU attribue déjà à un autre
  // homme ne se reprend pas, même si cet homme ne joue plus en France. « M. Diallo » est à l'Amiénois
  // de 03/04, pas au Nantais ; « L. Leroy » est Laurent, pas Ludovic (piège de 04/05, reconduit).
  const CEDENT = [["M. Diallo", "Mamadou Diallo"]];
  const bavures = CEDENT.filter(([court, long]) => compte[court] || !compte[long]);
  if (bavures.length)
    fail("nom court d'un autre homme repris : " + bavures.map(p => p[0] + " au lieu de " + p[1]).join(" ; "));
  else ok("Mamadou Diallo garde son nom en toutes lettres : « M. Diallo » est à un autre");

  // piège « J. Arne Riise » : un prénom composé resté collé au patronyme.
  const PARTICULES = new Set(["Le", "La", "Les", "De", "Del", "Della", "Da", "Das", "Do", "Dos", "Di", "Du",
    "Van", "Von", "Der", "Ten", "Ter", "El", "Al", "Ben", "Bin", "Mac", "Mc", "O", "Saint", "San", "Aït", "Ait"]);
  // patronymes en deux mots vérifiés sur pièces, et non des prénoms avalés (jurisprudence Michael
  // Mio Nielsen, 90/91) : Jean-Louis AKPA AKPRO, Hosny ABD RABO, Wilson SANCHES LEAL, Steven PINTO BORGES.
  const COMPOSES = new Set(["Akpa", "Abd", "Sanches", "Pinto"]);
  const suspects = Object.keys(compte).filter(n => {
    const m = /^[A-ZÀ-Þ]\.(-[A-ZÀ-Þ]\.)? ([A-ZÀ-Þ][a-zà-ÿ']+) [A-ZÀ-Þ]/.exec(n);
    return m && !PARTICULES.has(m[2]) && !COMPOSES.has(m[2]);
  });
  if (suspects.length) fail("noms à vérifier (prénom composé avalé dans le patronyme ?) : " + suspects.join(", "));
  else ok("aucun prénom composé resté collé au patronyme (« Akpa Akpro » et « Abd Rabo » sont de vrais patronymes)");

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
  if (coll.length) fail("vivier 05/06 contient des joueurs déjà employés : " + coll.join(", "));
  else ok("vivier construit disjoint des effectifs employés (05/06)");
} catch (e) { fail("exception doublons : " + e.stack); }

/* ===== 3) Année de base + étés internationaux + sièges européens ===== */
console.log("3) Année de base, Mondial 2006 à la PREMIÈRE intersaison, sièges européens");
try {
  api.nouvellePartie("LYO", KEY);
  let G = api.getG();
  if (G.saison !== KEY) fail("G.saison = " + G.saison + " (attendu " + KEY + ")");
  if (G.anBase !== 2005) fail("G.anBase = " + G.anBase + " (attendu 2005)");
  if (api.anneeJeu() !== 2005) fail("anneeJeu() = " + api.anneeJeu() + " (attendu 2005)");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G.vire = null;
  api.intersaison();
  G = api.getG();
  // Partir de 05/06 fait tomber le Mondial 2006 dès la PREMIÈRE intersaison : l'Italie aux tirs au but
  const ete2006 = (G.recap || []).join(" ");
  if (!/l'Italie au bout des tirs au but/i.test(ete2006))
    fail("été 2006 : le Mondial de l'Italie doit tomber dès la PREMIÈRE intersaison quand on part de 05/06 — reçu « " + ete2006.slice(0, 140) + " »");
  else ok("année de base 2005 ; le Mondial 2006 tombe dès la PREMIÈRE intersaison — l'Italie aux tirs au but, à Berlin");
  // et la dépêche de 2006 ne doit pas se lire comme un triomphe français : la France a PERDU la finale
  if (/LA FRANCE/.test(ete2006)) fail("l'été 2006 ne doit pas contenir « LA FRANCE » en capitales : la France a perdu la finale");
  else ok("la dépêche de l'été 2006 ne se lit pas comme un triomphe français");
  if (G.saison !== "2006-07") fail("chaîne de saison : G.saison = " + G.saison + " (attendu 2006-07)");
  else ok("chaîne de saison correcte : 2005-06 → 2006-07");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  api.getG().vire = null; api.intersaison(); G = api.getG();
  const ete2007 = (G.recap || []).join(" ");
  if (/ÉTÉ 200[0-9]/.test(ete2007))
    fail("l'été 2007 ne porte aucun tournoi : la 2e intersaison doit rester muette — reçu « " + ete2007.slice(0, 120) + " »");
  else ok("l'été 2007 est muet : aucun tournoi entre le Mondial 2006 et l'Euro 2008");
  // L'Europe 2005-06 telle qu'elle s'est jouée : Lyon (champion) et LILLE (2e) en phase de groupes de
  // Ligue des champions, Monaco (3e) au troisième tour de qualification ; en Coupe UEFA Rennes (4e),
  // AUXERRE au titre de la Coupe de France 2005, STRASBOURG au titre de la Coupe de la Ligue 2005, et
  // MARSEILLE et LENS, tous deux vainqueurs de l'INTERTOTO 2005 — deux clubs français la même année,
  // ce qui n'était plus arrivé depuis les trois de 1998. Huit sièges, tous en Ligue 1.
  const attendu = { LYO: "C1", LIL: "C1", MON: "C1", REN: "C3", AUX: "C3", STR: "C3", OM: "C3", LEN: "C3",
                    BOR: null, PSG: null, NIC: null, NAN: null, STE: null, SOC: null, LMN: null,
                    TOU: null, NCY: null, TRO: null, AJA: null, MET: null,
                    VAN: null, SED: null, LOR: null, CAE: null, DIJ: null, BAS: null, LEH: null,
                    CRE: null, GUI: null, GRE: null, IST: null, MTP: null, AMI: null, CHA: null,
                    REI: null, GUE: null, BRE: null, CLE: null, LAV: null, SET: null };
  for (const id in attendu) {
    api.nouvellePartie(id, KEY);
    const c = api.getG().euroCompet;
    if (c !== attendu[id]) fail("siège européen " + id + " = " + c + " (attendu " + attendu[id] + ")");
  }
  ok("sièges européens : Lyon, Lille et Monaco en C1 ; Rennes, Auxerre, Strasbourg, Marseille et Lens en Coupe UEFA");
  const S = api.SAISONS[KEY];
  if ((S.euroC2 || []).length) fail("la Coupe des Coupes n'existe plus en 2005-06 : euroC2 doit être vide");
  else ok("aucun siège en Coupe des Coupes : la compétition a disparu après 1999");
  // Bordeaux, DEUXIÈME du championnat 2005-06, n'a aucun siège : les sièges se gagnent l'année d'AVANT,
  // et les Girondins n'étaient que quinzièmes en 2004-05. C'est le contrôle qui attrape une erreur de
  // lecture du classement — la plus facile à commettre et la plus invisible.
  if ((S.euroC1 || []).includes("BOR") || (S.euroC3 || []).includes("BOR"))
    fail("Bordeaux n'a pas de siège en 2005-06 : quinzième en 2004-05, il n'avait rien gagné");
  else ok("Bordeaux, futur dauphin, part sans Europe : quinzième l'année d'avant");
  const tousSieges = (S.euroC1 || []).concat(S.euroC3 || []);
  if (tousSieges.length !== 8) fail("2005-06 compte huit sièges européens, reçu " + tousSieges.length);
  const horsL1 = tousSieges.filter(id => !S.d1.includes(id));
  if (horsL1.length) fail("siège européen de deuxième division : " + horsL1.join(","));
  else ok("les HUIT sièges sont en Ligue 1 — la plus grosse délégation depuis 97/98, et aucune depuis la Ligue 2 pour la deuxième fois en trois saisons");
} catch (e) { fail("exception année/Europe : " + e.stack); }

/* ===== 4) Carrière multi-saisons depuis 05/06 ===== */
console.log("4) Carrière multi-saisons depuis 05/06 (calibrage, vieillissement)");
let totalButs = 0, totalMatchs = 0;
const departs = ["LYO", "BOR", "SET", "VAN"];  // le champion, le dauphin, le club neuf, le futur promu
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
  } catch (e) { fail("exception carrière 05/06 (" + dep + ") : " + e.stack); }
}
const gpm = totalButs / totalMatchs;
console.log("— Calibrage 05/06 : " + gpm.toFixed(3) + " buts/match sur " + Math.round(totalMatchs) + " matchs —");
if (gpm < 2.0 || gpm > 2.8) fail("calibrage 05/06 hors plage (cible ~2,3) : " + gpm.toFixed(3));
else ok("calibrage 05/06 dans la plage attendue");

console.log(FAILS === 0 ? "\n✅ HARNAIS 05/06 : TOUT EST VERT" : "\n❌ HARNAIS 05/06 : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
