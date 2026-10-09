/* Harnais de validation — SAISON DE DÉPART 2001-02
   Vérifie : intégrité du registre SAISONS, doublons de noms, année de base/étés,
   sièges européens, carrière multi-saisons depuis 01/02 (calibrage, vieillissement).
   C'est la saison la plus RÉCENTE du jeu, comme 00/01 l'était avant elle : toutes les
   ancres de notes sont derrière elle. Deux singularités à surveiller ici — la PREMIÈRE
   intersaison porte le Mondial 2002 (ce n'est pas un été muet), et Strasbourg, relégué
   mais vainqueur de la Coupe de France, joue la Coupe UEFA DEPUIS LA DEUXIÈME DIVISION.
   Usage : node harness0102.cjs                                                    */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,CIBLE,SAISONS,STARS_0102,STARS_D2_0102,D1_0102,D2_0102,STARS_EUROPE,STARS_EUROPE_C2,STARS_EUROPE_C3,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const KEY = "2001-02";

/* ===== 1) Intégrité du registre SAISONS ===== */
console.log("1) Registre SAISONS : composition, métadonnées, effectifs");
try {
  const S = api.SAISONS[KEY];
  if (!S) fail("saison " + KEY + " absente du registre");
  else {
    if (S.d1.length !== 20) fail("D1 01/02 a " + S.d1.length + " clubs (attendu 20)");
    if (S.d2.length !== 20) fail("D2 01/02 a " + S.d2.length + " clubs (attendu 20)");
    const tous = S.d1.concat(S.d2);
    const setIds = new Set(tous);
    if (setIds.size !== 40) fail("ids dupliqués entre D1 et D2 (uniques: " + setIds.size + "/40)");
    const metaManquante = tous.filter(id => !api.metaClub(id));
    if (metaManquante.length) fail("métadonnées manquantes : " + metaManquante.join(","));
    if (!metaManquante.length && setIds.size === 40 && S.d1.length === 20 && S.d2.length === 20)
      ok("01/02 = 20 D1 + 20 D2, 40 clubs uniques, toutes métadonnées résolues");
    // La D1 réelle 2001-02 n'avait que DIX-HUIT clubs — la dernière à porter le nom de Division 1.
    const REELS_D1 = ["LYO", "LEN", "AJA", "PSG", "LIL", "BOR", "TRO", "SOC", "OM", "NAN",
                      "BAS", "REN", "MTP", "SED", "MON", "GUI", "MET", "LOR"];
    const absentsD1 = REELS_D1.filter(id => !S.d1.includes(id));
    if (absentsD1.length) fail("clubs réels de D1 01/02 absents : " + absentsD1.join(","));
    else ok("les dix-huit clubs de la vraie D1 2001-02 sont au plateau (Sochaux, Lorient et Montpellier promus)");
    // Repêchage en D1 : les DEUX MEILLEURS relégués de D1 00/01, Toulouse (37 pts) et Saint-Étienne (34).
    // Strasbourg, dix-huitième avec 29 points, reste en D2 — et c'est de là qu'il jouera l'Europe.
    if (!S.d1.includes("TOU") || !S.d1.includes("STE"))
      fail("repêchage en D1 : Toulouse (37 pts) et Saint-Étienne (34 pts) doivent compléter les vingt");
    else if (S.d1.includes("STR"))
      fail("Strasbourg, 18e et dernier relégué de 00/01 (29 pts), ne doit PAS être repêché en D1");
    else ok("Toulouse et Saint-Étienne, meilleurs relégués de D1 00/01, repêchés ; Strasbourg reste en D2");
    // les dix-neuf autres clubs de la vraie D2 2001-02, Saint-Étienne parti en D1
    const REELS_D2 = ["ACA", "STR", "NIC", "LEH", "LMN", "CAE", "BEA", "CHA", "NCY", "LAV",
                      "NIO", "AMI", "GUE", "WAS", "GRE", "IST", "CRE", "NIM", "MAR"];
    const absentsD2 = REELS_D2.filter(id => !S.d2.includes(id));
    if (absentsD2.length) fail("clubs réels de D2 01/02 absents : " + absentsD2.join(","));
    else ok("les dix-neuf autres clubs de la vraie D2 2001-02 sont au plateau (Ajaccio champion, Grenoble monté du National)");
    // La D2 retombant à dix-neuf, le MEILLEUR relégué de D2 00/01 y est repêché : Cannes (19e, 34 pts).
    // Angers, vingtième avec 33 points, reste dehors — et la source le documente bien plus mal encore.
    if (!S.d2.includes("CAN")) fail("repêchage en D2 : Cannes (34 pts) doit tenir les vingt");
    else if (S.d2.includes("ANG")) fail("Angers, 20e de D2 00/01 (33 pts), ne doit PAS être repêché");
    else ok("Cannes, meilleur relégué de D2 00/01, repêché en D2 ; Angers reste dehors");
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
    const vets = { MET: "J. Songo'o", REN: "E. Durand" };            // 37 et 36 ans
    const absentsV = Object.entries(vets).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom));
    const vetsD2 = { STR: "J. Chilavert", LAV: "C. Gardié", NIO: "J. Bossis", CAN: "F. Durix" };
    const absentsV2 = Object.entries(vetsD2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom));
    if (absentsV.length || absentsV2.length)
      fail("vétérans 36+ manquants : " + absentsV.concat(absentsV2).map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("vétérans de 36 ans et plus conservés : Songo'o et Gardié (37 ans), Chilavert, Durand, Bossis, Durix");
    // les gamins de 2001 : le tri au temps de jeu les écartait, la liste de forçage les rattrape
    const forces = { MON: "É. Abidal", LEH: "F. Sinama-Pongolle", NAN: "J. Toulalan", LIL: "M. Moussilou",
                     MET: "F. Béria", BAS: "A. Yahia", REN: "É. Didot", NCY: "P. Diakhaté" };
    const perdus = Object.entries(forces).filter(([id, nom]) => {
      const L = (S.d1.includes(id) ? S.starsD1 : S.starsD2)[id] || [];
      return !L.some(t => t[0] === nom);
    });
    if (perdus.length) fail("pépites forcées absentes : " + perdus.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("pépites forcées présentes : Abidal, Sinama-Pongolle, Toulalan, Moussilou, Béria, Yahia, Didot, Diakhaté");
    // Monaco paie le forçage de trois hommes : Abidal, Plašil et Giuly, que 958 minutes ne suffisaient pas à garder
    const trioMON = ["É. Abidal", "J. Plasil", "L. Giuly"].filter(n => !(S.starsD1.MON || []).some(t => t[0] === n));
    if (trioMON.length) fail("Monaco : " + trioMON.join(", ") + " manquent (forçage assumé de trois hommes)");
    else ok("Monaco garde ses trois forcés : Abidal, Plašil et Giuly (958 minutes, écarté par la réparation des postes)");
    // celles que le temps de jeu suffisait à garder
    const seuls = { AJA: ["D. Cissé", "P. Mexès", "O. Kapo", "J.-A. Boumsong"], PSG: ["Ronaldinho", "M. Arteta"],
                    LYO: ["Juninho", "S. Govou"], BAS: ["M. Essien"], MET: ["E. Adebayor"],
                    SOC: ["B. Pedretti", "P.-A. Frau"], GUI: ["F. Malouda"], NAN: ["E. Djemba-Djemba"] };
    const rates = [];
    for (const id in seuls) for (const nom of seuls[id])
      if (!(S.starsD1[id] || []).some(t => t[0] === nom)) rates.push(nom + " (" + id + ")");
    const seulsD2 = { NIC: ["P. Evra"], LEH: ["A. Le Tallec"], LOR: [] };
    for (const id in seulsD2) for (const nom of seulsD2[id])
      if (!(S.starsD2[id] || []).some(t => t[0] === nom)) rates.push(nom + " (" + id + ")");
    if (!(S.starsD1.LOR || []).some(t => t[0] === "S. Keita")) rates.push("S. Keita (LOR)");
    if (rates.length) fail("pépites passées au temps de jeu et pourtant absentes : " + rates.join(", "));
    else ok("Cissé, Mexès, Kapo, Boumsong, Ronaldinho, Arteta, Juninho, Essien, Adebayor, Evra, Le Tallec et Keita passent au temps de jeu");
    // Le nom de Juninho : TM ne l'abrège pas et rend « Juninho Pernambucano » ; l'abréger donnait
    // « J. Pernambucano », alors que le jeu écrit les surnoms brésiliens en mononymes.
    if ((S.starsD1.LYO || []).some(t => /Pernambucano/.test(t[0])))
      fail("Juninho doit s'écrire en mononyme, pas « J. Pernambucano »");
    else ok("Juninho écrit en mononyme, comme Raí, Bebeto ou Ronaldinho");
    const nD1 = S.d1.reduce((s, id) => s + S.starsD1[id].length, 0);
    const nD2 = S.d2.reduce((s, id) => s + S.starsD2[id].length, 0);
    if (nD1 !== 400) fail("D1 01/02 : " + nD1 + " joueurs curés (attendu 20 × 20)");
    if (nD2 !== 360) fail("D2 01/02 : " + nD2 + " joueurs curés (attendu 20 × 18)");
    if (nD1 === 400 && nD2 === 360) ok("760 joueurs réels relevés : 20 par club en D1, 18 en D2");
  }
} catch (e) { fail("exception registre : " + e.stack); }

/* ===== 2) Doublons de noms ===== */
console.log("2) Doublons de noms");
try {
  const compte = {};
  const ajoute = (nom, src) => { (compte[nom] = compte[nom] || []).push(src); };
  for (const id in api.STARS_0102) for (const t of api.STARS_0102[id]) ajoute(t[0], "D1:" + id);
  for (const id in api.STARS_D2_0102) for (const t of api.STARS_D2_0102[id]) ajoute(t[0], "D2:" + id);
  const dupClub = Object.entries(compte).filter(([n, s]) => s.length > 1);
  if (dupClub.length) dupClub.forEach(([n, s]) => fail("doublon 01/02 : « " + n + " » dans " + s.join(" + ")));
  else ok("aucun joueur dupliqué entre deux clubs en 01/02 (transferts d'hiver arbitrés au temps de jeu)");
  // homonymes : celui qui portait DÉJÀ le nom court dans le jeu le garde, l'autre passe en toutes lettres
  const HOMONYMES = [["P. Diop", "Papa Bouba Diop"], ["L. Leroy", "Ludovic Leroy"],
                     ["S. N'Diaye", "Samba N'Diaye"], ["B. Cheyrou", "Benoît Cheyrou"],
                     ["A. Cissé", "Abdoulaye Cissé"], ["D. Coulibaly", "Dramane Coulibaly"]];
  const mal = HOMONYMES.filter(([court, long]) => !compte[court] || !compte[long]);
  if (mal.length) fail("homonymes mal résolus : " + mal.map(p => p.join(" / ")).join(" ; "));
  else ok("homonymes résolus : les deux Diop, les deux Leroy, les N'Diaye, les frères Cheyrou, les Cissé et les Coulibaly");
  // DEUX Frédéric Mendy, prénom ET patronyme identiques (Bastia 1973, Saint-Étienne 1981) : aucune
  // graphie ne les sépare. Le jeu porte « F. Mendy » depuis 93/94, c'est le Bastiais ; le Stéphanois
  // cède sa place à un autre vrai joueur de son club (jurisprudence Olivier Baudry, 91/92).
  if ((compte["F. Mendy"] || []).length !== 1 || (compte["F. Mendy"] || [])[0] !== "D1:BAS")
    fail("« F. Mendy » doit être le seul Bastiais : " + JSON.stringify(compte["F. Mendy"]));
  else ok("un seul « F. Mendy », celui de Bastia que le jeu connaît depuis 93/94");
  // piège « J. Arne Riise » : un prénom composé resté collé au patronyme.
  const PARTICULES = new Set(["Le", "La", "Les", "De", "Del", "Della", "Da", "Das", "Dos", "Di", "Du",
    "Van", "Von", "Der", "Ten", "Ter", "El", "Al", "Ben", "Bin", "Mac", "Mc", "O", "Saint", "San", "Aït"]);
  const suspects = Object.keys(compte).filter(n => {
    const m = /^[A-ZÀ-Þ]\.(-[A-ZÀ-Þ]\.)? ([A-ZÀ-Þ][a-zà-ÿ']+) [A-ZÀ-Þ]/.exec(n);
    return m && !PARTICULES.has(m[2]);
  });
  if (suspects.length) fail("noms à vérifier (prénom composé avalé dans le patronyme ?) : " + suspects.join(", "));
  else ok("aucun prénom composé resté collé au patronyme (Djemba-Djemba garde son trait d'union)");
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
  if (coll.length) fail("vivier 01/02 contient des joueurs déjà employés : " + coll.join(", "));
  else ok("vivier construit disjoint des effectifs employés (01/02)");
} catch (e) { fail("exception doublons : " + e.stack); }

/* ===== 3) Année de base + étés internationaux + sièges européens ===== */
console.log("3) Année de base, étés 2002 et 2004, sièges européens");
try {
  api.nouvellePartie("LYO", KEY);
  let G = api.getG();
  if (G.saison !== KEY) fail("G.saison = " + G.saison + " (attendu " + KEY + ")");
  if (G.anBase !== 2001) fail("G.anBase = " + G.anBase + " (attendu 2001)");
  if (api.anneeJeu() !== 2001) fail("anneeJeu() = " + api.anneeJeu() + " (attendu 2001)");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G.vire = null;
  api.intersaison();
  G = api.getG();
  // Partir de 01/02 fait tomber le Mondial 2002 dès la PREMIÈRE intersaison : contrairement à
  // 90/91, 92/93, 94/95 et 00/01, l'été n'est pas muet.
  if (!/le Brésil de Ronaldo/i.test((G.recap || []).join(" ")))
    fail("été 2002 : le Mondial du Brésil doit tomber dès la 1re intersaison quand on part de 01/02");
  else ok("année de base 2001 ; le Mondial 2002 tombe dès la PREMIÈRE intersaison (le Brésil de Ronaldo sacré)");
  if (G.saison !== "2002-03") fail("chaîne de saison : G.saison = " + G.saison + " (attendu 2002-03)");
  else ok("chaîne de saison correcte : 2001-02 → 2002-03");
  for (let s = 0; s < 2; s++) {
    for (let d = 0; d < 38; d++) api.jouerJournee();
    api.getG().vire = null; api.intersaison(); G = api.getG();
  }
  if (!/la Grèce stupéfie/i.test((G.recap || []).join(" ")))
    fail("été 2004 : l'Euro de la Grèce doit tomber à la 3e intersaison quand on part de 01/02");
  else ok("été 2004 déclenché à la 3e intersaison : la Grèce stupéfie l'Europe");
  // L'Europe 2001-02 telle qu'elle s'est jouée : Nantes (champion) et Lyon (2e) en Ligue des
  // champions, Lille (3e) par le tour préliminaire ; en Coupe UEFA Bordeaux (4e), Sedan (5e),
  // les deux vainqueurs de l'Intertoto 2001 — le PSG et Troyes — ET STRASBOURG, vainqueur de la
  // Coupe de France 2001, QUI JOUAIT LA DEUXIÈME DIVISION. La Coupe des Coupes n'existe plus.
  const attendu = { NAN: "C1", LYO: "C1", LIL: "C1", BOR: "C3", SED: "C3", STR: "C3", PSG: "C3", TRO: "C3",
                    LEN: null, AJA: null, OM: null, MON: null, MET: null, STE: null, TOU: null, ACA: null };
  for (const id in attendu) {
    api.nouvellePartie(id, KEY);
    const c = api.getG().euroCompet;
    if (c !== attendu[id]) fail("siège européen " + id + " = " + c + " (attendu " + attendu[id] + ")");
  }
  ok("sièges européens : Nantes, Lyon et Lille en C1 ; Bordeaux, Sedan, Strasbourg, le PSG et Troyes en Coupe UEFA");
  const S = api.SAISONS[KEY];
  if ((S.euroC2 || []).length) fail("la Coupe des Coupes n'existe plus en 2001-02 : euroC2 doit être vide");
  else ok("aucun siège en Coupe des Coupes : la compétition a disparu après 1999");
  if (!S.d2.includes("STR")) fail("Strasbourg doit être en D2 : c'est tout le sel de son siège européen");
  else ok("Strasbourg joue la Coupe UEFA DEPUIS LA DEUXIÈME DIVISION (quatrième cas du jeu)");
} catch (e) { fail("exception année/Europe : " + e.stack); }

/* ===== 4) Carrière multi-saisons depuis 01/02 ===== */
console.log("4) Carrière multi-saisons depuis 01/02 (calibrage, vieillissement)");
let totalButs = 0, totalMatchs = 0;
const departs = ["LYO", "STR", "TOU", "CAN"];  // le champion, le siège européen de D2, les deux repêchés
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
  } catch (e) { fail("exception carrière 01/02 (" + dep + ") : " + e.stack); }
}
const gpm = totalButs / totalMatchs;
console.log("— Calibrage 01/02 : " + gpm.toFixed(3) + " buts/match sur " + Math.round(totalMatchs) + " matchs —");
if (gpm < 2.0 || gpm > 2.8) fail("calibrage 01/02 hors plage (cible ~2,3) : " + gpm.toFixed(3));
else ok("calibrage 01/02 dans la plage attendue");

console.log(FAILS === 0 ? "\n✅ HARNAIS 01/02 : TOUT EST VERT" : "\n❌ HARNAIS 01/02 : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
