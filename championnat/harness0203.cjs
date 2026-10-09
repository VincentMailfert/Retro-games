/* Harnais de validation — SAISON DE DÉPART 2002-03
   Vérifie : intégrité du registre SAISONS, doublons de noms, année de base/étés,
   sièges européens, carrière multi-saisons depuis 02/03 (calibrage, vieillissement).
   C'est la saison la plus RÉCENTE du jeu, comme 01/02 l'était avant elle : toutes les
   ancres de notes sont derrière elle. Trois singularités à surveiller ici — le championnat
   s'appelle LIGUE 1 et compte pour la première fois VINGT clubs, si bien qu'AUCUN repêchage
   n'est nécessaire ni d'un côté ni de l'autre (une première du chantier) ; la PREMIÈRE
   intersaison est MUETTE (l'été 2003 ne porte aucun tournoi) ; et Lorient, vainqueur de la
   Coupe de France mais relégué, joue la Coupe UEFA DEPUIS LA DEUXIÈME DIVISION.
   Usage : node harness0203.cjs                                                    */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,CIBLE,SAISONS,STARS_0203,STARS_D2_0203,D1_0203,D2_0203,STARS_EUROPE,STARS_EUROPE_C2,STARS_EUROPE_C3,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const KEY = "2002-03";

/* ===== 1) Intégrité du registre SAISONS ===== */
console.log("1) Registre SAISONS : composition, métadonnées, effectifs");
try {
  const S = api.SAISONS[KEY];
  if (!S) fail("saison " + KEY + " absente du registre");
  else {
    if (S.d1.length !== 20) fail("D1 02/03 a " + S.d1.length + " clubs (attendu 20)");
    if (S.d2.length !== 20) fail("D2 02/03 a " + S.d2.length + " clubs (attendu 20)");
    const tous = S.d1.concat(S.d2);
    const setIds = new Set(tous);
    if (setIds.size !== 40) fail("ids dupliqués entre D1 et D2 (uniques: " + setIds.size + "/40)");
    const metaManquante = tous.filter(id => !api.metaClub(id));
    if (metaManquante.length) fail("métadonnées manquantes : " + metaManquante.join(","));
    if (!metaManquante.length && setIds.size === 40 && S.d1.length === 20 && S.d2.length === 20)
      ok("02/03 = 20 D1 + 20 D2, 40 clubs uniques, toutes métadonnées résolues");

    // LA SINGULARITÉ DE LA SAISON : la Ligue 1 passe à VINGT clubs et la Ligue 2 en compte vingt
    // aussi. Le plateau du jeu est donc EXACTEMENT le plateau réel — aucun repêchage, aucun écarté,
    // pour la première fois du chantier français. Les deux listes se vérifient donc par égalité.
    const REELS_D1 = ["LYO", "MON", "OM", "BOR", "SOC", "AJA", "GUI", "LEN", "NAN", "NIC",
                      "PSG", "BAS", "STR", "LIL", "REN", "MTP", "ACA", "LEH", "TRO", "SED"];
    const REELS_D2 = ["GRE", "CLE", "BEA", "IST", "WAS", "CRE", "VAL", "REI", "AMI", "GUE",
                      "MET", "CHA", "LMN", "CAE", "NIO", "NCY", "LOR", "LAV", "STE", "TOU"];
    const absentsD1 = REELS_D1.filter(id => !S.d1.includes(id));
    const intrusD1 = S.d1.filter(id => !REELS_D1.includes(id));
    if (absentsD1.length || intrusD1.length)
      fail("D1 02/03 : absents " + (absentsD1.join(",") || "—") + " / intrus " + (intrusD1.join(",") || "—"));
    else ok("les vingt clubs de la vraie Ligue 1 2002-03 sont au plateau, et eux seuls (Ajaccio, Strasbourg, Nice et Le Havre promus)");
    const absentsD2 = REELS_D2.filter(id => !S.d2.includes(id));
    const intrusD2 = S.d2.filter(id => !REELS_D2.includes(id));
    if (absentsD2.length || intrusD2.length)
      fail("D2 02/03 : absents " + (absentsD2.join(",") || "—") + " / intrus " + (intrusD2.join(",") || "—"));
    else ok("les vingt clubs de la vraie Ligue 2 2002-03 sont au plateau, et eux seuls (Metz et Lorient descendus)");
    // aucun repêchage : c'est ce qui distingue 02/03 de TOUTES les saisons précédentes du chantier
    if (S.d1.length + S.d2.length !== REELS_D1.length + REELS_D2.length)
      fail("le compte de 02/03 doit tomber juste sans repêcher personne");
    else ok("AUCUN repêchage ni d'un côté ni de l'autre — une première du chantier français");

    // Clermont est le seul club neuf du plateau : il entre par CLUBS_EXTRA, en D2
    const cle = api.metaClub("CLE");
    if (!cle) fail("Clermont (CLE) doit être au registre des clubs");
    else if (!S.d2.includes("CLE")) fail("Clermont joue la Ligue 2 en 2002-03");
    else if (!/Montpied/.test(cle.stade)) fail("le stade de Clermont est Gabriel-Montpied, pas « " + cle.stade + " »");
    else ok("Clermont Foot Auvergne, seul club neuf de la saison, à Gabriel-Montpied et en Ligue 2");

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
    const vets = { REN: "E. Durand", BAS: "A. Boumnijel" };            // 37 et 36 ans
    const vetsD2 = { GUE: "A. Traoré" };                               // 37 ans
    const absentsV = Object.entries(vets).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom))
      .concat(Object.entries(vetsD2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom)));
    if (absentsV.length)
      fail("vétérans 36+ manquants : " + absentsV.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("vétérans de 36 ans et plus conservés : Durand et Amara Traoré (37 ans), Boumnijel (36 ans)");

    // les gamins de 2002 : le tri au temps de jeu les écartait, la liste de forçage les rattrape.
    // 02/03 étant la dernière saison du jeu, on les a trouvés par la parade de 00/01 (lister les
    // écartés que le jeu connaît déjà) puis par les débutants dont la carrière a suivi.
    const forces = { LYO: "F. Balmont", LEN: "R. Fanni", PSG: "L. Cana", REN: "J. Briand",
                     SOC: "G. N'Daw", AJA: "H. Yebda" };
    const forcesD2 = { MET: "L. Obraniak", CRE: "J. Plasil", CAE: "R. Zubar", LOR: "J. Morel",
                       TOU: "A. Romao", GUE: "M. Bougherra", LMN: "Y. Pelé" };
    const perdus = Object.entries(forces).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom))
      .concat(Object.entries(forcesD2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom)));
    if (perdus.length) fail("pépites forcées absentes : " + perdus.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("pépites forcées présentes : Balmont, Fanni, Cana, Briand, N'Daw, Yebda, Obraniak, Plašil, Zubar, Morel, Romao, Bougherra, Pelé");
    // Jimmy Briand a DIX-SEPT ans et vingt-quatre minutes : le plus jeune vrai joueur de la saison
    const briand = (S.starsD1.REN || []).find(t => t[0] === "J. Briand");
    if (!briand || briand[2] !== 17) fail("Jimmy Briand doit avoir dix-sept ans à Rennes");
    else ok("Jimmy Briand, dix-sept ans et vingt-quatre minutes, entre quand même");
    // Lille et Metz paient chacun deux forcés : le prix du forçage, assumé
    const paires = [["LIL", ["J. Makoun", "M.-A. Fortuné"]], ["REN", ["J. Briand", "J. Faty"]]];
    const manquePaire = paires.filter(([id, ns]) => ns.some(n => !(S.starsD1[id] || []).some(t => t[0] === n)));
    if (manquePaire.length) fail("forçage double incomplet : " + manquePaire.map(p => p[0]).join(", "));
    else ok("Lille garde Makoun et Fortuné, Rennes Briand et Faty — deux clubs qui paient deux hommes");

    // celles que le temps de jeu suffisait à garder
    const seuls = { GUI: ["D. Drogba", "F. Malouda"], MET: [], AJA: ["D. Cissé", "P. Mexès", "O. Kapo"],
                    MON: ["P. Evra", "S. Squillaci", "G. Givet", "S. Nonda", "J. Rothen"],
                    BAS: ["M. Essien"], REN: ["P. Cech"], LEN: ["S. Keita"], NAN: ["J. Toulalan", "M. Landreau"],
                    LEH: ["F. Sinama-Pongolle", "A. Le Tallec"], SOC: ["J. Mathieu", "B. Pedretti"],
                    TRO: ["K. Ziani"], BOR: ["Pauleta", "M. Chamakh"], PSG: ["Ronaldinho"],
                    LYO: ["Juninho", "S. Govou", "M. Diarra"], LIL: ["É. Abidal"] };
    const rates = [];
    for (const id in seuls) for (const nom of seuls[id])
      if (!(S.starsD1[id] || []).some(t => t[0] === nom)) rates.push(nom + " (" + id + ")");
    if (!(S.starsD2.MET || []).some(t => t[0] === "E. Adebayor")) rates.push("E. Adebayor (MET)");
    if (rates.length) fail("pépites passées au temps de jeu et pourtant absentes : " + rates.join(", "));
    else ok("Drogba, Malouda, Nonda, Rothen, Evra, Čech, Cissé, Mexès, Essien, Adebayor, Keita, Ziani, Mathieu et Chamakh passent au temps de jeu");
    // Drogba dix-sept buts à Guingamp, et Guingamp septième : la révélation de la saison
    const drogba = (S.starsD1.GUI || []).find(t => t[0] === "D. Drogba");
    if (!drogba || drogba[2] !== 24 || drogba[4] < 88)
      fail("Didier Drogba : vingt-quatre ans à Guingamp, et un potentiel qui dit ce qui l'attend");
    else ok("Didier Drogba, vingt-quatre ans à Guingamp, noté " + drogba[3] + " pour un potentiel de " + drogba[4]);

    // Le nom de Juninho : TM ne l'abrège pas et rend « Juninho Pernambucano » ; l'abréger donnait
    // « J. Pernambucano », alors que le jeu écrit les surnoms brésiliens en mononymes.
    if ((S.starsD1.LYO || []).some(t => /Pernambucano/.test(t[0])))
      fail("Juninho doit s'écrire en mononyme, pas « J. Pernambucano »");
    else ok("Juninho écrit en mononyme, comme Raí, Bebeto ou Ronaldinho");

    const nD1 = S.d1.reduce((s, id) => s + S.starsD1[id].length, 0);
    const nD2 = S.d2.reduce((s, id) => s + S.starsD2[id].length, 0);
    if (nD1 !== 400) fail("D1 02/03 : " + nD1 + " joueurs curés (attendu 20 × 20)");
    if (nD2 !== 360) fail("D2 02/03 : " + nD2 + " joueurs curés (attendu 20 × 18)");
    if (nD1 === 400 && nD2 === 360) ok("760 joueurs réels relevés : 20 par club en D1, 18 en D2");
  }
} catch (e) { fail("exception registre : " + e.stack); }

/* ===== 2) Doublons de noms ===== */
console.log("2) Doublons de noms");
try {
  const compte = {};
  const ajoute = (nom, src) => { (compte[nom] = compte[nom] || []).push(src); };
  for (const id in api.STARS_0203) for (const t of api.STARS_0203[id]) ajoute(t[0], "D1:" + id);
  for (const id in api.STARS_D2_0203) for (const t of api.STARS_D2_0203[id]) ajoute(t[0], "D2:" + id);
  const dupClub = Object.entries(compte).filter(([n, s]) => s.length > 1);
  if (dupClub.length) dupClub.forEach(([n, s]) => fail("doublon 02/03 : « " + n + " » dans " + s.join(" + ")));
  else ok("aucun joueur dupliqué entre deux clubs en 02/03 (transferts d'hiver arbitrés au temps de jeu)");

  // homonymes DANS la saison : celui qui portait DÉJÀ le nom court dans le jeu le garde (règle de
  // 00/01), l'autre passe en toutes lettres.
  const HOMONYMES = [["A. Faye", "Abdoulaye Faye"], ["A. Yahia", "Alaeddine Yahia"],
                     ["P. Diop", "Papa Bouba Diop"], ["D. Coulibaly", "Dramane Coulibaly"]];
  const mal = HOMONYMES.filter(([court, long]) => !compte[court] || !compte[long]);
  if (mal.length) fail("homonymes mal résolus : " + mal.map(p => p.join(" / ")).join(" ; "));
  else ok("homonymes résolus : les deux Faye, les deux Yahia, les deux Diop et les deux Coulibaly");

  // LA RÈGLE ÉTENDUE D'UNE SAISON À L'AUTRE : un nom court que le JEU attribue déjà à un autre
  // homme ne se reprend pas, même si cet homme ne joue plus en France. Sans elle « B. Cheyrou »
  // cessait d'être Bruno pour devenir son frère Benoît, parti de Lille pour Liverpool l'été d'avant.
  const CEDENT = [["B. Cheyrou", "Benoît Cheyrou"], ["A. Cissé", "Abdoulaye Cissé"], ["K. Sarr", "Kor Sarr"]];
  const bavures = CEDENT.filter(([court, long]) => compte[court] || !compte[long]);
  if (bavures.length)
    fail("nom court d'un autre homme repris : " + bavures.map(p => p[0] + " au lieu de " + p[1]).join(" ; "));
  else ok("Benoît Cheyrou, Abdoulaye Cissé et Kor Sarr gardent leur nom en toutes lettres : « B. Cheyrou », « A. Cissé » et « K. Sarr » sont à d'autres");

  // piège « J. Arne Riise » : un prénom composé resté collé au patronyme.
  const PARTICULES = new Set(["Le", "La", "Les", "De", "Del", "Della", "Da", "Das", "Dos", "Di", "Du",
    "Van", "Von", "Der", "Ten", "Ter", "El", "Al", "Ben", "Bin", "Mac", "Mc", "O", "Saint", "San", "Aït", "Ait"]);
  const suspects = Object.keys(compte).filter(n => {
    const m = /^[A-ZÀ-Þ]\.(-[A-ZÀ-Þ]\.)? ([A-ZÀ-Þ][a-zà-ÿ']+) [A-ZÀ-Þ]/.exec(n);
    return m && !PARTICULES.has(m[2]);
  });
  if (suspects.length) fail("noms à vérifier (prénom composé avalé dans le patronyme ?) : " + suspects.join(", "));
  else ok("aucun prénom composé resté collé au patronyme (« Ait » est une particule, comme « Aït »)");

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
  if (coll.length) fail("vivier 02/03 contient des joueurs déjà employés : " + coll.join(", "));
  else ok("vivier construit disjoint des effectifs employés (02/03)");
} catch (e) { fail("exception doublons : " + e.stack); }

/* ===== 3) Année de base + étés internationaux + sièges européens ===== */
console.log("3) Année de base, été 2003 muet, Euro 2004, sièges européens");
try {
  api.nouvellePartie("LYO", KEY);
  let G = api.getG();
  if (G.saison !== KEY) fail("G.saison = " + G.saison + " (attendu " + KEY + ")");
  if (G.anBase !== 2002) fail("G.anBase = " + G.anBase + " (attendu 2002)");
  if (api.anneeJeu() !== 2002) fail("anneeJeu() = " + api.anneeJeu() + " (attendu 2002)");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G.vire = null;
  api.intersaison();
  G = api.getG();
  // Partir de 02/03 fait tomber la PREMIÈRE intersaison sur un été MUET (l'été 2003 ne porte
  // aucun tournoi) : cinquième cas du jeu, après 90/91, 92/93, 94/95 et 00/01.
  if (/ÉTÉ 200/.test((G.recap || []).join(" ")))
    fail("été 2003 : la 1re intersaison de 02/03 ne porte aucun tournoi, elle doit rester muette");
  else ok("année de base 2002 ; première intersaison muette (l'été 2003 ne portait aucun tournoi)");
  if (G.saison !== "2003-04") fail("chaîne de saison : G.saison = " + G.saison + " (attendu 2003-04)");
  else ok("chaîne de saison correcte : 2002-03 → 2003-04");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  api.getG().vire = null; api.intersaison(); G = api.getG();
  if (!/la Grèce stupéfie/i.test((G.recap || []).join(" ")))
    fail("été 2004 : l'Euro de la Grèce doit tomber à la 2e intersaison quand on part de 02/03");
  else ok("été 2004 déclenché à la DEUXIÈME intersaison : la Grèce stupéfie l'Europe");
  // L'Europe 2002-03 telle qu'elle s'est jouée : Lyon (champion) et Lens (2e) en phase de groupes
  // de Ligue des champions, Auxerre (3e) au troisième tour de qualification ; en Coupe UEFA le PSG
  // (4e), Bordeaux (vainqueur de la Coupe de la Ligue 2002) ET LORIENT, vainqueur de la Coupe de
  // France 2002, QUI JOUAIT LA DEUXIÈME DIVISION. Aucun club français n'a gagné l'Intertoto 2002
  // (Fulham, Málaga et Stuttgart), donc Lille, Troyes et Sochaux n'ont pas de siège à ce titre.
  const attendu = { LYO: "C1", LEN: "C1", AJA: "C1", PSG: "C3", BOR: "C3", LOR: "C3",
                    MON: null, OM: null, SOC: null, GUI: null, NAN: null, NIC: null, LIL: null,
                    TRO: null, STR: null, ACA: null, MET: null, STE: null, CLE: null };
  for (const id in attendu) {
    api.nouvellePartie(id, KEY);
    const c = api.getG().euroCompet;
    if (c !== attendu[id]) fail("siège européen " + id + " = " + c + " (attendu " + attendu[id] + ")");
  }
  ok("sièges européens : Lyon, Lens et Auxerre en C1 ; le PSG, Bordeaux et Lorient en Coupe UEFA");
  const S = api.SAISONS[KEY];
  if ((S.euroC2 || []).length) fail("la Coupe des Coupes n'existe plus en 2002-03 : euroC2 doit être vide");
  else ok("aucun siège en Coupe des Coupes : la compétition a disparu après 1999");
  if (!S.d2.includes("LOR")) fail("Lorient doit être en D2 : c'est tout le sel de son siège européen");
  else ok("Lorient joue la Coupe UEFA DEPUIS LA DEUXIÈME DIVISION (cinquième cas du jeu)");
} catch (e) { fail("exception année/Europe : " + e.stack); }

/* ===== 4) Carrière multi-saisons depuis 02/03 ===== */
console.log("4) Carrière multi-saisons depuis 02/03 (calibrage, vieillissement)");
let totalButs = 0, totalMatchs = 0;
const departs = ["LYO", "LOR", "CLE", "GUI"];  // le champion, le siège européen de D2, le club neuf, la révélation
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
  } catch (e) { fail("exception carrière 02/03 (" + dep + ") : " + e.stack); }
}
const gpm = totalButs / totalMatchs;
console.log("— Calibrage 02/03 : " + gpm.toFixed(3) + " buts/match sur " + Math.round(totalMatchs) + " matchs —");
if (gpm < 2.0 || gpm > 2.8) fail("calibrage 02/03 hors plage (cible ~2,3) : " + gpm.toFixed(3));
else ok("calibrage 02/03 dans la plage attendue");

console.log(FAILS === 0 ? "\n✅ HARNAIS 02/03 : TOUT EST VERT" : "\n❌ HARNAIS 02/03 : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
