/* Harnais de validation — SAISON DE DÉPART 2000-01
   Vérifie : intégrité du registre SAISONS, doublons de noms, année de base/étés,
   sièges européens, carrière multi-saisons depuis 00/01 (calibrage, vieillissement).
   C'est la saison la plus RÉCENTE du jeu : toutes les ancres de notes sont derrière
   elle, la Coupe des Coupes n'existe plus (personne en C2), et Gueugnon joue la
   Coupe UEFA depuis la Deuxième Division.
   Usage : node harness0001.cjs                                                    */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,CIBLE,SAISONS,STARS_0001,STARS_D2_0001,D1_0001,D2_0001,STARS_EUROPE,STARS_EUROPE_C2,STARS_EUROPE_C3,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const KEY = "2000-01";

/* ===== 1) Intégrité du registre SAISONS ===== */
console.log("1) Registre SAISONS : composition, métadonnées, effectifs");
try {
  const S = api.SAISONS[KEY];
  if (!S) fail("saison " + KEY + " absente du registre");
  else {
    if (S.d1.length !== 20) fail("D1 00/01 a " + S.d1.length + " clubs (attendu 20)");
    if (S.d2.length !== 20) fail("D2 00/01 a " + S.d2.length + " clubs (attendu 20)");
    const tous = S.d1.concat(S.d2);
    const setIds = new Set(tous);
    if (setIds.size !== 40) fail("ids dupliqués entre D1 et D2 (uniques: " + setIds.size + "/40)");
    const metaManquante = tous.filter(id => !api.metaClub(id));
    if (metaManquante.length) fail("métadonnées manquantes : " + metaManquante.join(","));
    if (!metaManquante.length && setIds.size === 40 && S.d1.length === 20 && S.d2.length === 20)
      ok("00/01 = 20 D1 + 20 D2, 40 clubs uniques, toutes métadonnées résolues");
    // La D1 réelle 2000-01 n'avait que DIX-HUIT clubs : les dix-huit doivent être là.
    const REELS_D1 = ["NAN", "LYO", "LIL", "BOR", "SED", "REN", "TRO", "BAS", "PSG", "GUI",
                      "MON", "MET", "AUX", "LEN", "OM", "TOU", "STE", "STR"];
    const absentsD1 = REELS_D1.filter(id => !S.d1.includes(id));
    if (absentsD1.length) fail("clubs réels de D1 00/01 absents : " + absentsD1.join(","));
    else ok("les dix-huit clubs de la vraie D1 2000-01 sont au plateau (Lille, Guingamp et Toulouse promus)");
    // Repêchage en D1 : les DEUX MEILLEURS relégués de D1 99/00, Nancy (42 pts) et Le Havre (34).
    // Montpellier, dix-huitième avec 31 points, reste en D2 — il y jouera la montée.
    if (!S.d1.includes("NCY") || !S.d1.includes("LEH"))
      fail("repêchage en D1 : Nancy (42 pts) et Le Havre (34 pts) doivent compléter les vingt");
    else if (S.d1.includes("MTP"))
      fail("Montpellier, 18e et dernier relégué de 99/00 (31 pts), ne doit PAS être repêché");
    else ok("Nancy et Le Havre, meilleurs relégués de D1 99/00, repêchés ; Montpellier reste en D2");
    // La D2 retombant à dix-huit, les deux meilleurs relégués de D2 99/00 y sont repêchés à leur tour :
    // Amiens (18e, 37 pts) et Valence (19e, 33) ; Louhans-Cuiseaux, 20e avec 24 points, reste dehors.
    if (!S.d2.includes("AMI") || !S.d2.includes("VAL"))
      fail("repêchage en D2 : Amiens (37 pts) et Valence (33 pts) doivent tenir les vingt");
    else if (S.d2.includes("LOU"))
      fail("Louhans-Cuiseaux, 20e de D2 99/00 (24 pts), ne doit PAS être repêché");
    else ok("Amiens et Valence, meilleurs relégués de D2 99/00, repêchés en D2");
    // les dix-huit autres clubs de la vraie D2 2000-01, Nancy et Le Havre partis en D1
    const REELS_D2 = ["SOC", "LOR", "MTP", "NIO", "CHA", "NIM", "LAV", "GUE", "BEA", "AJA",
                      "WAS", "LMN", "NIC", "CRE", "CAE", "MAR", "CAN", "ANG"];
    const absentsD2 = REELS_D2.filter(id => !S.d2.includes(id));
    if (absentsD2.length) fail("clubs réels de D2 00/01 absents : " + absentsD2.join(","));
    else ok("les dix-huit autres clubs de la vraie D2 2000-01 sont au plateau (Sochaux, Lorient, Montpellier en tête)");
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
    const vets = { REN: "B. Lama", MET: "S. Kastendeuch" };          // 37 ans tous les deux
    const absentsV = Object.entries(vets).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom));
    const vetsD2 = { LAV: "C. Gardié", CAN: "F. Lemasson" };         // 36 et 37 ans
    const absentsV2 = Object.entries(vetsD2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom));
    if (absentsV.length || absentsV2.length)
      fail("vétérans 36+ manquants : " + absentsV.concat(absentsV2).map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("vétérans de 36 ans et plus conservés : Lama et Kastendeuch (37 ans), Gardié, Lemasson");
    // les gamins de 2000 : le tri au temps de jeu les écartait, la liste de forçage les rattrape
    const forces = { LMN: "D. Drogba", MON: "J. Riise", NIC: "P. Evra", PSG: "M. Arteta",
                     AUX: "T. Tainio", TRO: "M. Niang", OM: "A. Méïté" };
    const perdus = Object.entries(forces).filter(([id, nom]) => {
      const L = (S.d1.includes(id) ? S.starsD1 : S.starsD2)[id] || [];
      return !L.some(t => t[0] === nom);
    });
    if (perdus.length) fail("pépites forcées absentes : " + perdus.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("pépites forcées présentes : Drogba, Riise, Evra, Arteta, Tainio, Niang, Méïté");
    // celles que le temps de jeu suffisait à garder
    const seuls = { AUX: ["P. Mexès", "D. Cissé", "J.-A. Boumsong"], NAN: ["M. Landreau", "S. Armand"],
                    LYO: ["S. Malbranque", "S. Govou"], BAS: ["M. Essien"] };
    const rates = [];
    for (const id in seuls) for (const nom of seuls[id])
      if (!(S.starsD1[id] || []).some(t => t[0] === nom)) rates.push(nom + " (" + id + ")");
    if (!(S.starsD2.LOR || []).some(t => t[0] === "S. Keita")) rates.push("S. Keita (LOR)");
    if (rates.length) fail("pépites passées au temps de jeu et pourtant absentes : " + rates.join(", "));
    else ok("Mexès, Cissé, Boumsong, Landreau, Malbranque, Govou, Essien et Keita passent au temps de jeu");
    const nD1 = S.d1.reduce((s, id) => s + S.starsD1[id].length, 0);
    const nD2 = S.d2.reduce((s, id) => s + S.starsD2[id].length, 0);
    if (nD1 !== 400) fail("D1 00/01 : " + nD1 + " joueurs curés (attendu 20 × 20)");
    if (nD2 !== 360) fail("D2 00/01 : " + nD2 + " joueurs curés (attendu 20 × 18)");
    if (nD1 === 400 && nD2 === 360) ok("760 joueurs réels relevés : 20 par club en D1, 18 en D2");
  }
} catch (e) { fail("exception registre : " + e.stack); }

/* ===== 2) Doublons de noms ===== */
console.log("2) Doublons de noms");
try {
  const compte = {};
  const ajoute = (nom, src) => { (compte[nom] = compte[nom] || []).push(src); };
  for (const id in api.STARS_0001) for (const t of api.STARS_0001[id]) ajoute(t[0], "D1:" + id);
  for (const id in api.STARS_D2_0001) for (const t of api.STARS_D2_0001[id]) ajoute(t[0], "D2:" + id);
  const dupClub = Object.entries(compte).filter(([n, s]) => s.length > 1);
  if (dupClub.length) dupClub.forEach(([n, s]) => fail("doublon 00/01 : « " + n + " » dans " + s.join(" + ")));
  else ok("aucun joueur dupliqué entre deux clubs en 00/01 (transferts d'hiver arbitrés au temps de jeu)");
  if (!dupClub.length) ok("dédoublonnage par identifiant TM : les joueurs listés dans deux clubs sont arbitrés au temps de jeu");
  // homonymes : celui qui portait DÉJÀ le nom court dans le jeu le garde, l'autre passe en toutes lettres
  const HOMONYMES = [["B. Cheyrou", "Benoît Cheyrou"], ["F. Lemasson", "Frédéric Lemasson"],
                     ["L. Leroy", "Ludovic Leroy"], ["S. N'Diaye", "Samba N'Diaye"], ["S. N'Diaye", "Sada N'Diaye"]];
  const mal = HOMONYMES.filter(([court, long]) => !compte[court] || !compte[long]);
  if (mal.length) fail("homonymes mal résolus : " + mal.map(p => p.join(" / ")).join(" ; "));
  else ok("homonymes résolus : les deux Cheyrou, les deux Lemasson, les deux Leroy et les TROIS N'Diaye");
  // piège « J. Arne Riise » : un prénom composé resté collé au patronyme.
  const PARTICULES = new Set(["Le", "La", "Les", "De", "Del", "Della", "Da", "Das", "Dos", "Di", "Du",
    "Van", "Von", "Der", "Ten", "Ter", "El", "Al", "Ben", "Bin", "Mac", "Mc", "O", "Saint", "San"]);
  // patronymes en deux mots vérifiés chez Transfermarkt, et non des prénoms avalés :
  // Ahmed Aït Ouarab (Martigues) — « Aït » est une particule berbère du patronyme.
  const COMPOSES = new Set(["Aït"]);
  const suspects = Object.keys(compte).filter(n => {
    const m = /^[A-ZÀ-Þ]\.(-[A-ZÀ-Þ]\.)? ([A-ZÀ-Þ][a-zà-ÿ']+) [A-ZÀ-Þ]/.exec(n);
    return m && !PARTICULES.has(m[2]) && !COMPOSES.has(m[2]);
  });
  if (suspects.length) fail("noms à vérifier (prénom composé avalé dans le patronyme ?) : " + suspects.join(", "));
  else ok("aucun prénom composé resté collé au patronyme (particules Le/De/Van/Aït… préservées)");
  // réconciliation France ↔ Europe (clubs européens figés en 95-96)
  const eur = new Set();
  for (const T of [api.STARS_EUROPE, api.STARS_EUROPE_C2, api.STARS_EUROPE_C3]) for (const id in T) for (const t of T[id]) eur.add(t[0]);
  const collE = Object.keys(compte).filter(n => eur.has(n));
  api.nouvellePartie("NAN", KEY);
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
  if (coll.length) fail("vivier 00/01 contient des joueurs déjà employés : " + coll.join(", "));
  else ok("vivier construit disjoint des effectifs employés (00/01)");
} catch (e) { fail("exception doublons : " + e.stack); }

/* ===== 3) Année de base + étés internationaux + sièges européens ===== */
console.log("3) Année de base, étés 2001/2002/2004, sièges européens");
try {
  api.nouvellePartie("NAN", KEY);
  let G = api.getG();
  if (G.saison !== KEY) fail("G.saison = " + G.saison + " (attendu " + KEY + ")");
  if (G.anBase !== 2000) fail("G.anBase = " + G.anBase + " (attendu 2000)");
  if (api.anneeJeu() !== 2000) fail("anneeJeu() = " + api.anneeJeu() + " (attendu 2000)");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G.vire = null;
  api.intersaison();
  G = api.getG();
  // partir de 00/01 est le quatrième cas du jeu où la PREMIÈRE intersaison ne porte aucun tournoi
  // (après 90/91, 92/93 et 94/95) : l'été 2001 est muet, le Mondial 2002 tombe à la deuxième.
  if (/ÉTÉ 200/.test((G.recap || []).join(" ")))
    fail("été 2001 : aucun tournoi international ne doit être annoncé à la 1re intersaison");
  else ok("année de base 2000 ; première intersaison muette (l'été 2001 ne portait aucun tournoi)");
  if (G.saison !== "2001-02") fail("chaîne de saison : G.saison = " + G.saison + " (attendu 2001-02)");
  else ok("chaîne de saison correcte : 2000-01 → 2001-02");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  api.getG().vire = null; api.intersaison(); G = api.getG();
  if (!/le Brésil de Ronaldo/i.test((G.recap || []).join(" ")))
    fail("été 2002 : le Mondial du Brésil doit tomber à la 2e intersaison quand on part de 00/01");
  else ok("été 2002 déclenché à la 2e intersaison : le Brésil de Ronaldo sacré, la France sort au premier tour");
  for (let s = 0; s < 2; s++) {
    for (let d = 0; d < 38; d++) api.jouerJournee();
    api.getG().vire = null; api.intersaison(); G = api.getG();
  }
  if (!/la Grèce stupéfie/i.test((G.recap || []).join(" ")))
    fail("été 2004 : l'Euro de la Grèce doit tomber à la 4e intersaison");
  else ok("été 2004 déclenché à la 4e intersaison : la Grèce stupéfie l'Europe");
  // L'Europe 2000-01 telle qu'elle s'est jouée : Monaco (champion) et le PSG (2e) en phase de groupes
  // de Ligue des champions, Lyon (3e) au tour préliminaire ; Bordeaux (4e) et Nantes (Coupe de France
  // 2000) en Coupe UEFA — AVEC GUEUGNON, vainqueur de la Coupe de la Ligue 2000, QUI JOUAIT LA D2.
  // La Coupe des Coupes n'existe plus depuis 1999 : PERSONNE en C2.
  const attendu = { MON: "C1", PSG: "C1", LYO: "C1", BOR: "C3", NAN: "C3", GUE: "C3",
                    LIL: null, SED: null, REN: null, OM: null, LEN: null, AUX: null, SOC: null };
  for (const id in attendu) {
    api.nouvellePartie(id, KEY);
    const c = api.getG().euroCompet;
    if (c !== attendu[id]) fail("siège européen " + id + " = " + c + " (attendu " + attendu[id] + ")");
  }
  ok("sièges européens : Monaco, PSG et Lyon en C1 ; Bordeaux, Nantes et Gueugnon en Coupe UEFA");
  const S = api.SAISONS[KEY];
  if ((S.euroC2 || []).length) fail("la Coupe des Coupes n'existe plus en 2000-01 : euroC2 doit être vide");
  else ok("aucun siège en Coupe des Coupes : la compétition a disparu après 1999");
  if (!S.d2.includes("GUE")) fail("Gueugnon doit être en D2 : c'est tout le sel de son siège européen");
  else ok("Gueugnon joue la Coupe UEFA DEPUIS LA DEUXIÈME DIVISION (troisième cas du jeu)");
} catch (e) { fail("exception année/Europe : " + e.stack); }

/* ===== 4) Carrière multi-saisons depuis 00/01 ===== */
console.log("4) Carrière multi-saisons depuis 00/01 (calibrage, vieillissement)");
let totalButs = 0, totalMatchs = 0;
const departs = ["NAN", "GUE", "NCY", "AMI"];  // le champion, le siège européen de D2, les deux repêchés
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
  } catch (e) { fail("exception carrière 00/01 (" + dep + ") : " + e.stack); }
}
const gpm = totalButs / totalMatchs;
console.log("— Calibrage 00/01 : " + gpm.toFixed(3) + " buts/match sur " + Math.round(totalMatchs) + " matchs —");
if (gpm < 2.0 || gpm > 2.8) fail("calibrage 00/01 hors plage (cible ~2,3) : " + gpm.toFixed(3));
else ok("calibrage 00/01 dans la plage attendue");

console.log(FAILS === 0 ? "\n✅ HARNAIS 00/01 : TOUT EST VERT" : "\n❌ HARNAIS 00/01 : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
