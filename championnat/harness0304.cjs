/* Harnais de validation — SAISON DE DÉPART 2003-04
   Vérifie : intégrité du registre SAISONS, doublons de noms, année de base/étés,
   sièges européens, carrière multi-saisons depuis 03/04 (calibrage, vieillissement).
   C'est la saison la plus RÉCENTE du jeu, comme 02/03 l'était avant elle : toutes les
   ancres de notes sont derrière elle. Quatre singularités à surveiller ici — le plateau
   tombe juste tout seul pour la DEUXIÈME fois (vingt et vingt, aucun repêchage) ; la
   PREMIÈRE intersaison porte l'EURO 2004, celui de la Grèce ; les SEPT sièges européens
   sont tous en Ligue 1, ce qui n'était plus arrivé depuis 96/97 ; et le dernier homme de
   chaque tableau de temps de jeu doit avoir ses vraies minutes — c'est le piège du jour,
   celui qui effaçait Pierre-Alain Frau, cinquième buteur du championnat.
   Usage : node harness0304.cjs                                                    */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,CIBLE,SAISONS,STARS_0304,STARS_D2_0304,D1_0304,D2_0304,STARS_EUROPE,STARS_EUROPE_C2,STARS_EUROPE_C3,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const KEY = "2003-04";

/* ===== 1) Intégrité du registre SAISONS ===== */
console.log("1) Registre SAISONS : composition, métadonnées, effectifs");
try {
  const S = api.SAISONS[KEY];
  if (!S) fail("saison " + KEY + " absente du registre");
  else {
    if (S.d1.length !== 20) fail("L1 03/04 a " + S.d1.length + " clubs (attendu 20)");
    if (S.d2.length !== 20) fail("L2 03/04 a " + S.d2.length + " clubs (attendu 20)");
    const tous = S.d1.concat(S.d2);
    const setIds = new Set(tous);
    if (setIds.size !== 40) fail("ids dupliqués entre L1 et L2 (uniques: " + setIds.size + "/40)");
    const metaManquante = tous.filter(id => !api.metaClub(id));
    if (metaManquante.length) fail("métadonnées manquantes : " + metaManquante.join(","));
    if (!metaManquante.length && setIds.size === 40 && S.d1.length === 20 && S.d2.length === 20)
      ok("03/04 = 20 L1 + 20 L2, 40 clubs uniques, toutes métadonnées résolues");

    // LE PLATEAU TOMBE JUSTE TOUT SEUL POUR LA DEUXIÈME FOIS : les deux échelons réels ont vingt
    // clubs, donc aucun repêchage, aucun écarté. On vérifie les deux listes par ÉGALITÉ.
    const REELS_D1 = ["LYO", "MON", "OM", "BOR", "SOC", "AUX", "GUI", "LEN", "NAN", "NIC",
                      "PSG", "BAS", "STR", "LIL", "REN", "MTP", "AJA", "TOU", "LMN", "MET"];
    const REELS_D2 = ["GRE", "CLE", "BES", "IST", "CRE", "ROU", "VAL", "ANG", "AMI", "GUE",
                      "STE", "CHA", "CAE", "NIO", "NCY", "LOR", "TRO", "SED", "LAV", "LEH"];
    const absentsD1 = REELS_D1.filter(id => !S.d1.includes(id));
    const intrusD1 = S.d1.filter(id => !REELS_D1.includes(id));
    if (absentsD1.length || intrusD1.length)
      fail("L1 03/04 : absents " + (absentsD1.join(",") || "—") + " / intrus " + (intrusD1.join(",") || "—"));
    else ok("les vingt clubs de la vraie Ligue 1 2003-04 sont au plateau, et eux seuls (Toulouse, Metz et Le Mans promus)");
    const absentsD2 = REELS_D2.filter(id => !S.d2.includes(id));
    const intrusD2 = S.d2.filter(id => !REELS_D2.includes(id));
    if (absentsD2.length || intrusD2.length)
      fail("L2 03/04 : absents " + (absentsD2.join(",") || "—") + " / intrus " + (intrusD2.join(",") || "—"));
    else ok("les vingt clubs de la vraie Ligue 2 2003-04 sont au plateau, et eux seuls (Troyes, Sedan et Le Havre descendus)");
    if (S.d1.length + S.d2.length !== REELS_D1.length + REELS_D2.length)
      fail("le compte de 03/04 doit tomber juste sans repêcher personne");
    else ok("AUCUN repêchage ni d'un côté ni de l'autre — la deuxième fois du chantier français, après 02/03");

    // Besançon est le seul club neuf du plateau : il entre par CLUBS_EXTRA, en L2
    const bes = api.metaClub("BES");
    if (!bes) fail("Besançon (BES) doit être au registre des clubs");
    else if (!S.d2.includes("BES")) fail("Besançon joue la Ligue 2 en 2003-04");
    else if (!/Lagrange/.test(bes.stade)) fail("le stade de Besançon est Léo-Lagrange, pas « " + bes.stade + " »");
    else ok("Besançon RC, seul club neuf de la saison, à Léo-Lagrange et en Ligue 2");

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
    const vets = { NIC: "É. Roy", TOU: "W. Prunier" };                 // 36 ans
    const vetsD2 = { ROU: "A. Boumnijel", LEH: "A. Vencel" };          // 37 et 36 ans, tous deux gardiens n°1
    const absentsV = Object.entries(vets).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom))
      .concat(Object.entries(vetsD2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom)));
    if (absentsV.length)
      fail("vétérans 36+ manquants : " + absentsV.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("vétérans de 36 ans et plus conservés : Boumnijel (37 ans), Éric Roy, Prunier et Vencel (36 ans)");

    // LE PIÈGE DU JOUR, ET IL FAUT QU'UN HARNAIS LE GARDE : le découpage du tableau de temps de jeu
    // laisse la DERNIÈRE ligne collée au bas de page, si bien qu'une expression ancrée sur la fin de
    // morceau ne trouve plus la cellule des minutes et rend ZÉRO. Un joueur par club, donc quarante,
    // et treize d'entre eux avaient leur place dans un effectif — dont Pierre-Alain Frau, cinquième
    // buteur du championnat avec dix-sept buts, et Bernard Diomède, champion du monde 1998.
    const DERNIERS = { SOC: "P.-A. Frau", BAS: "C. Ben Saada", AJA: "B. Diomède", GUI: "S. Camara",
                       REN: "S. N'Guéma", MET: "B. Guèye", TOU: "J. Blayac" };
    const DERNIERS_D2 = { STE: "B. Gomis", TRO: "F. Garny", NCY: "O. Rambo", ANG: "P. Sampil",
                          IST: "M. Hissein", LAV: "K. Aubry" };
    const zappes = Object.entries(DERNIERS).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom))
      .concat(Object.entries(DERNIERS_D2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom)));
    if (zappes.length)
      fail("derniers de tableau perdus (la sentinelle de fin a frappé) : " + zappes.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("les treize derniers de tableau ont leurs vraies minutes : Frau, Diomède, Ben Saada, Gomis et les autres");
    // Frau, dix-sept buts et 3 796 minutes, doit être noté comme un titulaire et non comme un remplaçant
    const frau = (S.starsD1.SOC || []).find(t => t[0] === "P.-A. Frau");
    if (!frau || frau[3] < 78) fail("Pierre-Alain Frau : dix-sept buts à Sochaux, il ne peut pas sortir sous 78");
    else ok("Pierre-Alain Frau noté " + frau[3] + " à Sochaux — la preuve que ses minutes ont été lues");

    // les gamins de 2003 : le tri au temps de jeu les écartait, la liste de forçage les rattrape
    const forces = { LYO: "J. Clément", OM: "P. Christanval", SOC: "G. N'Daw", LEN: "B. Assou-Ekotto",
                     REN: "Y. Gourcuff", MET: "L. Obraniak" };
    const forcesD2 = { GUE: "M. Bougherra", STE: "L. Perrin", SED: "C. Samba", ANG: "M. Obbadi",
                       LAV: "M. Lacen", LEH: "G. Hoarau" };
    const perdus = Object.entries(forces).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom))
      .concat(Object.entries(forcesD2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom)));
    if (perdus.length) fail("pépites forcées absentes : " + perdus.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("pépites forcées présentes : Clément, Christanval, N'Daw, Assou-Ekotto, Gourcuff, Obraniak, Bougherra, Perrin, Samba, Obbadi, Lacen, Hoarau");
    // Yoann Gourcuff a DIX-SEPT ans et trois cent quinze minutes : le futur meilleur joueur du championnat
    const gourcuff = (S.starsD1.REN || []).find(t => t[0] === "Y. Gourcuff");
    if (!gourcuff || gourcuff[2] !== 17 || gourcuff[4] < 88)
      fail("Yoann Gourcuff : dix-sept ans à Rennes, et un potentiel qui dit ce qui l'attend");
    else ok("Yoann Gourcuff, dix-sept ans à Rennes, noté " + gourcuff[3] + " pour un potentiel de " + gourcuff[4]);
    // Lille, Rennes et Caen paient chacun deux forcés : le prix du forçage, assumé
    const pairesD1 = [["LIL", ["Dante", "M. Debuchy"]], ["REN", ["Y. Gourcuff", "J. Briand"]]];
    const pairesD2 = [["CAE", ["R. Zubar", "Y. Gouffran"]]];
    const manquePaire = pairesD1.filter(([id, ns]) => ns.some(n => !(S.starsD1[id] || []).some(t => t[0] === n)))
      .concat(pairesD2.filter(([id, ns]) => ns.some(n => !(S.starsD2[id] || []).some(t => t[0] === n))));
    if (manquePaire.length) fail("forçage double incomplet : " + manquePaire.map(p => p[0]).join(", "));
    else ok("Lille garde Dante et Debuchy, Rennes Gourcuff et Briand, Caen Zubar et Gouffran — trois clubs qui paient deux hommes");

    // celles que le temps de jeu suffisait à garder
    const seuls = { OM: ["D. Drogba", "F. Barthez", "M. Flamini"], AUX: ["D. Cissé", "P. Mexès", "J.-A. Boumsong", "O. Kapo"],
                    MON: ["F. Morientes", "L. Giuly", "J. Rothen", "P. Evra", "E. Adebayor", "S. Squillaci"],
                    LYO: ["G. Coupet", "Juninho", "M. Essien", "F. Malouda", "G. Élber", "M. Diarra"],
                    REN: ["P. Cech", "A. Frei"], PSG: ["Pauleta", "J. Sorín"], BOR: ["R. Mavuba", "M. Chamakh", "A. Riera"],
                    SOC: ["B. Pedretti", "J. Mathieu"], LEN: ["J. Bąk", "Papa Bouba Diop"], NAN: ["M. Landreau", "E. Faé"],
                    GUI: ["M. Dagano"], LIL: ["S. Tavlaridis"], BAS: ["A. Diarra"], MET: ["T. Maoulida"] };
    const rates = [];
    for (const id in seuls) for (const nom of seuls[id])
      if (!(S.starsD1[id] || []).some(t => t[0] === nom)) rates.push(nom + " (" + id + ")");
    for (const [id, nom] of [["STE", "J. Sablé"], ["LOR", "B. Koné"], ["NIO", "C. Jallet"], ["TRO", "D. Perquis"]])
      if (!(S.starsD2[id] || []).some(t => t[0] === nom)) rates.push(nom + " (" + id + ")");
    if (rates.length) fail("pépites passées au temps de jeu et pourtant absentes : " + rates.join(", "));
    else ok("Drogba, Cissé, Coupet, Evra, Čech, Essien, Morientes, Giuly, Rothen, Mavuba, Flamini, Adebayor et Chamakh passent au temps de jeu");
    // Drogba, meilleur joueur du championnat, dix-neuf buts, puis Chelsea : le sommet de la saison
    const drogba = (S.starsD1.OM || []).find(t => t[0] === "D. Drogba");
    if (!drogba || drogba[3] < 84 || drogba[4] < 90)
      fail("Didier Drogba : meilleur joueur du championnat 2003-04, il ne peut pas sortir sous 84");
    else ok("Didier Drogba, meilleur joueur du championnat, noté " + drogba[3] + " pour un potentiel de " + drogba[4]);

    // Le nom de Juninho : TM ne l'abrège pas et rend « Juninho Pernambucano » ; l'abréger donnait
    // « J. Pernambucano », alors que le jeu écrit les surnoms brésiliens en mononymes.
    if ((S.starsD1.LYO || []).some(t => /Pernambucano/.test(t[0])))
      fail("Juninho doit s'écrire en mononyme, pas « J. Pernambucano »");
    else ok("Juninho écrit en mononyme, comme Raí, Bebeto ou Ronaldinho");

    const nD1 = S.d1.reduce((s, id) => s + S.starsD1[id].length, 0);
    const nD2 = S.d2.reduce((s, id) => s + S.starsD2[id].length, 0);
    if (nD1 !== 400) fail("L1 03/04 : " + nD1 + " joueurs curés (attendu 20 × 20)");
    if (nD2 !== 360) fail("L2 03/04 : " + nD2 + " joueurs curés (attendu 20 × 18)");
    if (nD1 === 400 && nD2 === 360) ok("760 joueurs réels relevés : 20 par club en L1, 18 en L2");
  }
} catch (e) { fail("exception registre : " + e.stack); }

/* ===== 2) Doublons de noms ===== */
console.log("2) Doublons de noms");
try {
  const compte = {};
  const ajoute = (nom, src) => { (compte[nom] = compte[nom] || []).push(src); };
  for (const id in api.STARS_0304) for (const t of api.STARS_0304[id]) ajoute(t[0], "L1:" + id);
  for (const id in api.STARS_D2_0304) for (const t of api.STARS_D2_0304[id]) ajoute(t[0], "L2:" + id);
  const dupClub = Object.entries(compte).filter(([n, s]) => s.length > 1);
  if (dupClub.length) dupClub.forEach(([n, s]) => fail("doublon 03/04 : « " + n + " » dans " + s.join(" + ")));
  else ok("aucun joueur dupliqué entre deux clubs en 03/04 (transferts d'hiver arbitrés au temps de jeu)");

  // homonymes DANS la saison : celui qui portait DÉJÀ le nom court dans le jeu le garde (règle de
  // 00/01), l'autre passe en toutes lettres. Trois cas en 03/04, tous reconduits de 02/03.
  const HOMONYMES = [["A. Yahia", "Alaeddine Yahia"],
                     ["P. Diop", "Papa Bouba Diop"], ["D. Coulibaly", "Dramane Coulibaly"]];
  const mal = HOMONYMES.filter(([court, long]) => !compte[court] || !compte[long]);
  if (mal.length) fail("homonymes mal résolus : " + mal.map(p => p.join(" / ")).join(" ; "));
  else ok("homonymes résolus : les deux Yahia, les deux Diop et les deux Coulibaly");

  // LA RÈGLE ÉTENDUE D'UNE SAISON À L'AUTRE : un nom court que le JEU attribue déjà à un autre
  // homme ne se reprend pas. Benoît Cheyrou reconduit 02/03 ; Serge Simon, dix-neuf ans à Laval,
  // est un cas neuf — « S. Simon » est Segundo Simon, que le jeu porte depuis 90/91.
  // Abdoulaye Faye est le cas à surveiller : Amdy Faye, à qui le jeu donne « A. Faye » depuis 00/01,
  // a quitté Auxerre pour l'Angleterre et ne joue PLUS en France — le nom ne se libère pas pour autant.
  const CEDENT = [["B. Cheyrou", "Benoît Cheyrou"], ["S. Simon", "Serge Simon"],
                  ["A. Faye", "Abdoulaye Faye"]];
  const bavures = CEDENT.filter(([court, long]) => compte[court] || !compte[long]);
  if (bavures.length)
    fail("nom court d'un autre homme repris : " + bavures.map(p => p[0] + " au lieu de " + p[1]).join(" ; "));
  else ok("Benoît Cheyrou, Serge Simon et Abdoulaye Faye gardent leur nom en toutes lettres : « B. Cheyrou », « S. Simon » et « A. Faye » sont à d'autres");

  // ET LA DÉCOUVERTE DU JOUR, DANS L'AUTRE SENS : « K. Sarr » n'était PAS un homonyme. Les deux
  // tables 96/97 ont été curées avec « âge_jeu = âge TM − 1 », si bien que le garde-fou d'âge prenait
  // un seul homme pour deux ; vérifié par identifiant Transfermarkt, le Caennais de 03/04 EST le
  // Beauvaisien de 96/97, et la table des prénoms le disait déjà (« K. Sarr » → Kor).
  if (!compte["K. Sarr"] || compte["Kor Sarr"])
    fail("Kor Sarr doit reprendre son nom court « K. Sarr » : c'est le même homme qu'en 96/97");
  else ok("Kor Sarr retrouve « K. Sarr » — le décalage d'un an des tables 96/97 avait fabriqué un faux homonyme");
  // Frédéric Mendy : deux vrais hommes de prénom ET de patronyme identiques. Le jeu porte le
  // Bastiais depuis 93/94 ; le Stéphanois cède sa place (jurisprudence Olivier Baudry, 91/92).
  if (!compte["F. Mendy"] || compte["F. Mendy"].length !== 1 || compte["F. Mendy"][0] !== "L1:BAS")
    fail("« F. Mendy » doit être le Bastiais, et lui seul");
  else ok("« F. Mendy » reste le Bastiais : le Stéphanois, son homonyme parfait, a cédé sa place");

  // piège « J. Arne Riise » : un prénom composé resté collé au patronyme.
  const PARTICULES = new Set(["Le", "La", "Les", "De", "Del", "Della", "Da", "Das", "Dos", "Di", "Du",
    "Van", "Von", "Der", "Ten", "Ter", "El", "Al", "Ben", "Bin", "Mac", "Mc", "O", "Saint", "San", "Aït", "Ait"]);
  // patronyme en deux mots vérifié sur pièces, et non un prénom avalé (jurisprudence Michael Mio
  // Nielsen, 90/91) : Gilles Donald YAPI YAPO, l'Ivoirien que Nantes recrute en janvier 2004.
  const COMPOSES = new Set(["Yapi"]);
  const suspects = Object.keys(compte).filter(n => {
    const m = /^[A-ZÀ-Þ]\.(-[A-ZÀ-Þ]\.)? ([A-ZÀ-Þ][a-zà-ÿ']+) [A-ZÀ-Þ]/.exec(n);
    return m && !PARTICULES.has(m[2]) && !COMPOSES.has(m[2]);
  });
  if (suspects.length) fail("noms à vérifier (prénom composé avalé dans le patronyme ?) : " + suspects.join(", "));
  else ok("aucun prénom composé resté collé au patronyme (« Yapi Yapo » est un vrai patronyme en deux mots)");

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
  if (coll.length) fail("vivier 03/04 contient des joueurs déjà employés : " + coll.join(", "));
  else ok("vivier construit disjoint des effectifs employés (03/04)");
} catch (e) { fail("exception doublons : " + e.stack); }

/* ===== 3) Année de base + étés internationaux + sièges européens ===== */
console.log("3) Année de base, Euro 2004 dès la première intersaison, sièges européens");
try {
  api.nouvellePartie("LYO", KEY);
  let G = api.getG();
  if (G.saison !== KEY) fail("G.saison = " + G.saison + " (attendu " + KEY + ")");
  if (G.anBase !== 2003) fail("G.anBase = " + G.anBase + " (attendu 2003)");
  if (api.anneeJeu() !== 2003) fail("anneeJeu() = " + api.anneeJeu() + " (attendu 2003)");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G.vire = null;
  api.intersaison();
  G = api.getG();
  // Partir de 03/04 fait tomber l'EURO 2004 dès la PREMIÈRE intersaison — celui de la Grèce.
  if (!/la Grèce stupéfie/i.test((G.recap || []).join(" ")))
    fail("été 2004 : l'Euro de la Grèce doit tomber dès la 1re intersaison quand on part de 03/04");
  else ok("année de base 2003 ; l'Euro 2004 de la Grèce tombe dès la PREMIÈRE intersaison");
  // et la dépêche de 2004 ne doit pas se lire comme un triomphe français
  const ete2004 = (G.recap || []).join(" ");
  if (/LA FRANCE/.test(ete2004)) fail("l'été 2004 ne doit pas contenir « LA FRANCE » en capitales : la France n'a rien gagné");
  else ok("la dépêche de l'été 2004 ne se lit pas comme un triomphe français");
  if (G.saison !== "2004-05") fail("chaîne de saison : G.saison = " + G.saison + " (attendu 2004-05)");
  else ok("chaîne de saison correcte : 2003-04 → 2004-05");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  api.getG().vire = null; api.intersaison(); G = api.getG();
  if (/ÉTÉ 200/.test((api.getG().recap || []).join(" ")) && !/2006/.test((api.getG().recap || []).join(" ")))
    fail("l'été 2005 ne porte aucun tournoi : la 2e intersaison doit rester muette");
  else ok("l'été 2005 est muet ; le Mondial 2006 attend la troisième intersaison");
  // L'Europe 2003-04 telle qu'elle s'est jouée : Lyon (champion) et Monaco (2e) en phase de groupes
  // de Ligue des champions, Marseille (3e) au troisième tour de qualification ; en Coupe UEFA
  // Bordeaux (4e), Sochaux (5e), Auxerre (vainqueur de la Coupe de France 2003) et Lens (classement
  // du fair-play). Aucun club français n'a gagné l'Intertoto 2003 (Schalke, Villarreal et Perugia),
  // donc Guingamp, Nantes et Nice n'ont pas de siège à ce titre.
  const attendu = { LYO: "C1", MON: "C1", OM: "C1", BOR: "C3", SOC: "C3", AUX: "C3", LEN: "C3",
                    PSG: null, NAN: null, NIC: null, GUI: null, REN: null, LIL: null, MTP: null,
                    BAS: null, STR: null, AJA: null, TOU: null, LMN: null, MET: null,
                    STE: null, CAE: null, IST: null, BES: null, TRO: null, SED: null, LEH: null };
  for (const id in attendu) {
    api.nouvellePartie(id, KEY);
    const c = api.getG().euroCompet;
    if (c !== attendu[id]) fail("siège européen " + id + " = " + c + " (attendu " + attendu[id] + ")");
  }
  ok("sièges européens : Lyon, Monaco et Marseille en C1 ; Bordeaux, Sochaux, Auxerre et Lens en Coupe UEFA");
  const S = api.SAISONS[KEY];
  if ((S.euroC2 || []).length) fail("la Coupe des Coupes n'existe plus en 2003-04 : euroC2 doit être vide");
  else ok("aucun siège en Coupe des Coupes : la compétition a disparu après 1999");
  // pour la première fois depuis 96/97, les SEPT sièges européens sont tous en première division
  const horsL1 = ["LYO", "MON", "OM", "BOR", "SOC", "AUX", "LEN"].filter(id => !S.d1.includes(id));
  if (horsL1.length) fail("siège européen hors Ligue 1 : " + horsL1.join(","));
  else ok("les sept clubs européens jouent tous la Ligue 1 — aucun siège en deuxième division, ce qui n'était plus arrivé depuis 96/97");
} catch (e) { fail("exception année/Europe : " + e.stack); }

/* ===== 4) Carrière multi-saisons depuis 03/04 ===== */
console.log("4) Carrière multi-saisons depuis 03/04 (calibrage, vieillissement)");
let totalButs = 0, totalMatchs = 0;
const departs = ["LYO", "MON", "BES", "STE"];  // le champion, le finaliste de C1, le club neuf, le futur promu
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
  } catch (e) { fail("exception carrière 03/04 (" + dep + ") : " + e.stack); }
}
const gpm = totalButs / totalMatchs;
console.log("— Calibrage 03/04 : " + gpm.toFixed(3) + " buts/match sur " + Math.round(totalMatchs) + " matchs —");
if (gpm < 2.0 || gpm > 2.8) fail("calibrage 03/04 hors plage (cible ~2,3) : " + gpm.toFixed(3));
else ok("calibrage 03/04 dans la plage attendue");

console.log(FAILS === 0 ? "\n✅ HARNAIS 03/04 : TOUT EST VERT" : "\n❌ HARNAIS 03/04 : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
