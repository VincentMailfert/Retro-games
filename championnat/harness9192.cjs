/* Harnais de validation — SAISON DE DÉPART 1991-92
   Vérifie : intégrité du registre SAISONS, doublons de noms, année de base/étés,
   sièges européens, carrière multi-saisons depuis 91/92 (calibrage, vieillissement).
   Particularités de cette saison : la D1 réelle avait ses vingt clubs SANS aucun
   repêchage (Bordeaux, Brest et Nice rétrogradés administrativement), la D2 se
   jouait encore en DEUX groupes de dix-huit, et l'Euro 92 tombe dès la PREMIÈRE
   intersaison.
   Usage : node harness9192.cjs                                                    */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,CIBLE,SAISONS,STARS_9192,STARS_D2_9192,D1_9192,D2_9192,STARS_EUROPE,STARS_EUROPE_C2,STARS_EUROPE_C3,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const KEY = "1991-92";

/* ===== 1) Intégrité du registre SAISONS ===== */
console.log("1) Registre SAISONS : composition, métadonnées, effectifs");
try {
  const S = api.SAISONS[KEY];
  if (!S) fail("saison " + KEY + " absente du registre");
  else {
    if (S.d1.length !== 20) fail("D1 91/92 a " + S.d1.length + " clubs (attendu 20)");
    if (S.d2.length !== 20) fail("D2 91/92 a " + S.d2.length + " clubs (attendu 20)");
    const tous = S.d1.concat(S.d2);
    const setIds = new Set(tous);
    if (setIds.size !== 40) fail("ids dupliqués entre D1 et D2 (uniques: " + setIds.size + "/40)");
    const metaManquante = tous.filter(id => !api.metaClub(id));
    if (metaManquante.length) fail("métadonnées manquantes : " + metaManquante.join(","));
    if (!metaManquante.length && setIds.size === 40 && S.d1.length === 20 && S.d2.length === 20)
      ok("91/92 = 20 D1 + 20 D2, 40 clubs uniques, toutes métadonnées résolues");
    // La D1 1991-92 comptait bien vingt clubs et n'a repêché personne : Bordeaux, Brest
    // et Nice ont été rétrogradés administrativement, Le Havre, Lens et Nîmes sont montés.
    const D1_REELLE = ["OM","MON","PSG","AUX","CAE","MTP","LEH","LEN","NAN","STE",
                       "TOU","MET","LIL","CAN","NCY","NIM","REN","SOC","TON","LYO"];
    const horsD1 = D1_REELLE.filter(id => !S.d1.includes(id));
    if (horsD1.length) fail("D1 91/92 : clubs réels absents — " + horsD1.join(","));
    else ok("D1 91/92 = les vingt clubs réels, aucun repêchage");
    for (const id of ["BOR", "BRE", "NIC"])
      if (S.d1.includes(id)) fail(id + " était rétrogradé administrativement : il ne joue pas la D1 91/92");
    if (!S.d2.includes("BOR")) fail("Bordeaux, rétrogradé, doit jouer la D2 91/92 (qu'il remportera)");
    else ok("Bordeaux, Brest et Nice rétrogradés administrativement ; Bordeaux joue — et gagne — la D2");
    // la D2 réelle en deux groupes de dix-huit : le jeu retient les dix premiers de chacun
    const GROUPE_A = ["VAN", "ANG", "LMN", "LOU", "LAV", "GUI", "ROU", "BOU", "DUN"];
    const GROUPE_B = ["BOR", "STR", "IST", "BAS", "GFC", "ROD", "PER", "CHA", "NIC", "ALE"];
    const manquants = GROUPE_A.concat(GROUPE_B).filter(id => !S.d2.includes(id));
    if (manquants.length) fail("D2 91/92 : clubs de tête absents — " + manquants.join(","));
    else ok("D2 91/92 = les dix premiers du groupe A + les dix premiers du groupe B (classements réels)");
    if (S.d2.includes("TRS"))
      fail("Tours ne doit pas entrer : Transfermarkt ne lui connaît que 16 joueurs pour 18 places");
    else if (S.d2.includes("ANC"))
      fail("Ancenis (11e) n'est pas mieux documenté que Tours (17 joueurs) : il ne le remplace pas");
    else if (!S.d2.includes("BEA"))
      fail("Beauvais, 12e du groupe A et documenté en entier, doit remplacer Tours");
    else ok("Tours (16 joueurs pour 18) écarté, Ancenis (17) sauté, Beauvais (12e) entre à leur place");
    // les deux clubs neufs de cette saison
    const NEUFS = ["BOU", "GFC"];
    const sansMeta = NEUFS.filter(id => { const m = api.metaClub(id); return !m || !m.stade || !m.cap; });
    if (sansMeta.length) fail("clubs neufs sans stade/capacité : " + sansMeta.join(","));
    else ok("deux clubs neufs dans CLUBS_EXTRA avec stade et capacité : Bourges et le Gazélec Ajaccio");
    if (api.metaClub("GFC").stade !== "Mezzavia")
      fail("le stade du Gazélec s'appelait Mezzavia en 1991 — Ange-Casanova ne le baptise qu'en 1994");
    else ok("stade du Gazélec au nom de l'époque : Mezzavia (rebaptisé Ange-Casanova en 1994)");
    if (S.d2.includes("AJA") && S.d2.includes("GFC"))
      fail("AC Ajaccio et Gazélec sont deux clubs distincts : l'AC ne joue pas la D2 91/92");
    // effectifs : non vides, postes valides, notes dans les bornes
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
    // pas de plafond d'âge depuis 99/00 : les vétérans jouent leur saison réelle,
    // puis vieillirClub() les fait raccrocher à la première intersaison.
    const vets = { MON: "J.-L. Ettori", STE: "J.-A. Bell" }; // 36 ans / 37 ans, tous deux titulaires
    const absents = Object.entries(vets).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom));
    if (absents.length) fail("vétérans 35+ manquants : " + absents.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("vétérans conservés : Ettori (36 ans, 4 351 minutes) et Bell (37 ans, 3 420)");
    // les gamins de 1991 : le tri au temps de jeu ne doit pas les avoir écartés
    const gamins = { CAN: "Z. Zidane", MON: "L. Thuram", TOU: "F. Barthez", NAN: "M. Desailly", NCY: "T. Vairelles" };
    const perdus = Object.entries(gamins).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom));
    if (perdus.length) fail("pépites 1991 absentes : " + perdus.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("pépites conservées : Zidane (19 ans), Thuram, Barthez, Desailly, Vairelles (18 ans)");
    const gaminsD2 = { BOR: ["B. Lizarazu", "C. Dugarry"] };
    for (const id in gaminsD2) for (const nom of gaminsD2[id])
      if (!(S.starsD2[id] || []).some(t => t[0] === nom)) fail("pépite D2 absente : " + nom + " (" + id + ")");
    ok("Lizarazu et Dugarry bien présents dans le Bordeaux de Division 2");
    const nD1 = S.d1.reduce((s, id) => s + S.starsD1[id].length, 0);
    const nD2 = S.d2.reduce((s, id) => s + S.starsD2[id].length, 0);
    // 399 + 359 : l'OM n'a que 19 hommes ayant joué, Istres 17 — la source fait foi.
    if (nD1 !== 399) fail("D1 91/92 : " + nD1 + " joueurs curés (attendu 399)");
    if (nD2 !== 359) fail("D2 91/92 : " + nD2 + " joueurs curés (attendu 359)");
    if (nD1 === 399 && nD2 === 359) ok("758 joueurs réels relevés (399 en D1, 359 en D2)");
  }
} catch (e) { fail("exception registre : " + e.stack); }

/* ===== 2) Doublons de noms ===== */
console.log("2) Doublons de noms");
try {
  const compte = {};
  const ajoute = (nom, src) => { (compte[nom] = compte[nom] || []).push(src); };
  for (const id in api.STARS_9192) for (const t of api.STARS_9192[id]) ajoute(t[0], "D1:" + id);
  for (const id in api.STARS_D2_9192) for (const t of api.STARS_D2_9192[id]) ajoute(t[0], "D2:" + id);
  const dupClub = Object.entries(compte).filter(([n, s]) => s.length > 1);
  if (dupClub.length) dupClub.forEach(([n, s]) => fail("doublon 91/92 : « " + n + " » dans " + s.join(" + ")));
  else ok("aucun joueur dupliqué entre deux clubs en 91/92 (transferts arbitrés au temps de jeu)");
  // homonymes désambiguïsés à la main : le plus utilisé garde l'initiale, l'autre
  // prend son prénom complet (convention 99/00).
  for (const [nom, ou] of [["Jean-Michel Ferri", api.STARS_9192.NAN], ["Zoran Vujovic", api.STARS_9192.CAN]])
    if (!(ou || []).some(t => t[0] === nom)) fail("homonyme non désambiguïsé : " + nom);
  if (!(api.STARS_D2_9192.GFC || []).some(t => t[0] === "J.-M. Ferri"))
    fail("J.-M. Ferri (Gazélec, 3 147 min) doit garder l'initiale face au Nantais");
  else ok("homonymes séparés : Jean-Michel Ferri et Zoran Vujovic écrits en toutes lettres");
  // piège « J. Arne Riise » : un prénom composé resté collé au patronyme.
  const PARTICULES = new Set(["Le", "La", "Les", "De", "Del", "Della", "Da", "Das", "Dos", "Di", "Du",
    "Van", "Von", "Der", "Ten", "Ter", "El", "Al", "Ben", "Bin", "Mac", "Mc", "O", "Saint", "San"]);
  // patronymes en deux mots vérifiés un à un chez Transfermarkt :
  // Michael Mio Nielsen (Lille) et Alfonso Fernández Leal (Lyon, double nom espagnol).
  const COMPOSES = new Set(["Mio", "Fernández"]);
  const suspects = Object.keys(compte).filter(n => {
    const m = /^[A-ZÀ-Þ]\.(-[A-ZÀ-Þ]\.)? ([A-ZÀ-Þ][a-zà-ÿ']+) [A-ZÀ-Þ]/.exec(n);
    return m && !PARTICULES.has(m[2]) && !COMPOSES.has(m[2]);
  });
  if (suspects.length) fail("noms à vérifier (prénom composé avalé dans le patronyme ?) : " + suspects.join(", "));
  else ok("aucun prénom composé resté collé au patronyme (particules Le/De/Van/El… préservées)");
  // réconciliation France ↔ Europe (clubs européens figés en 95-96)
  const eur = new Set();
  for (const T of [api.STARS_EUROPE, api.STARS_EUROPE_C2, api.STARS_EUROPE_C3]) for (const id in T) for (const t of T[id]) eur.add(t[0]);
  const collE = Object.keys(compte).filter(n => eur.has(n));
  api.nouvellePartie("MON", KEY);
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
  if (coll.length) fail("vivier 91/92 contient des joueurs déjà employés : " + coll.join(", "));
  else ok("vivier construit disjoint des effectifs employés (91/92)");
} catch (e) { fail("exception doublons : " + e.stack); }

/* ===== 3) Année de base + étés internationaux + sièges européens ===== */
console.log("3) Année de base, étés 92 et 94, sièges européens");
try {
  api.nouvellePartie("MON", KEY);
  let G = api.getG();
  if (G.saison !== KEY) fail("G.saison = " + G.saison + " (attendu " + KEY + ")");
  if (G.anBase !== 1991) fail("G.anBase = " + G.anBase + " (attendu 1991)");
  if (api.anneeJeu() !== 1991) fail("anneeJeu() = " + api.anneeJeu() + " (attendu 1991)");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G.vire = null;
  api.intersaison();
  G = api.getG();
  // contrairement à 90/91, l'Euro tombe ici dès la PREMIÈRE intersaison
  if (!/Euro en Suède/i.test((G.recap || []).join(" ")))
    fail("été 92 : l'Euro suédois doit tomber dès la 1re intersaison quand on part de 91/92");
  else ok("année de base 1991 ; l'Euro 92 en Suède tombe dès la première intersaison");
  if (G.saison !== "1992-93") fail("chaîne de saison : G.saison = " + G.saison + " (attendu 1992-93)");
  else ok("chaîne de saison correcte : 1991-92 → 1992-93");
  // le Mondial 94 à la troisième intersaison
  for (let s = 0; s < 2; s++) {
    for (let d = 0; d < 38; d++) api.jouerJournee();
    api.getG().vire = null; api.intersaison(); G = api.getG();
  }
  if (!/Coupe du monde aux États-Unis/i.test((G.recap || []).join(" ")))
    fail("été 94 : le Mondial américain doit tomber à la 3e intersaison");
  else ok("été 94 déclenché à la 3e intersaison : le Mondial aux États-Unis");
  // l'Europe 1991-92 telle qu'elle s'est jouée : l'OM champion en C1 ; Monaco,
  // vainqueur de la Coupe de France 1991, en C2 ; Auxerre, Cannes et Lyon en Coupe UEFA.
  const attendu = { OM: "C1", MON: "C2", AUX: "C3", CAN: "C3", LYO: "C3",
                    PSG: null, CAE: null, MTP: null, LEN: null, NIM: null, BOR: null };
  for (const id in attendu) {
    api.nouvellePartie(id, KEY);
    const c = api.getG().euroCompet;
    if (c !== attendu[id]) fail("siège européen " + id + " = " + c + " (attendu " + attendu[id] + ")");
  }
  ok("sièges européens : l'OM en C1, Monaco (Coupe de France 1991) en C2, Auxerre/Cannes/Lyon en C3");
} catch (e) { fail("exception année/Europe : " + e.stack); }

/* ===== 4) Carrière multi-saisons depuis 91/92 ===== */
console.log("4) Carrière multi-saisons depuis 91/92 (calibrage, vieillissement)");
let totalButs = 0, totalMatchs = 0;
const departs = ["OM", "MON", "NIM", "BOU"]; // champion, siège C2, promu de D1, club neuf de D2
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
  } catch (e) { fail("exception carrière 91/92 (" + dep + ") : " + e.stack); }
}
const gpm = totalButs / totalMatchs;
console.log("— Calibrage 91/92 : " + gpm.toFixed(3) + " buts/match sur " + Math.round(totalMatchs) + " matchs —");
if (gpm < 2.0 || gpm > 2.8) fail("calibrage 91/92 hors plage (cible ~2,3) : " + gpm.toFixed(3));
else ok("calibrage 91/92 dans la plage attendue");

console.log(FAILS === 0 ? "\n✅ HARNAIS 91/92 : TOUT EST VERT" : "\n❌ HARNAIS 91/92 : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
