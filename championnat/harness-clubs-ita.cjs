/* Harnais de validation — LES CLUBS ITALIENS (ITA-A, v2.56)
   Première étape du lot structure qui précède l'Italie, calquée sur harness-clubs-ang.cjs (ANG-B).
   Aucune saison italienne n'est encore jouable : ce qui se vérifie ici, c'est que les soixante-quatorze
   clubs existent, qu'ils disent vrai, qu'ils ne marchent sur les pieds d'aucun club français ni anglais,
   et qu'une partie française ou anglaise n'a pas bougé.
   A) la table CLUBS_ITA se tient : 74 clubs, aucun trou, aucun chiffre absurde
   B) les identifiants : aucun ne vole celui d'un club français ou anglais, et six SEULEMENT sont partagés
      avec le vivier de Coupe d'Europe — les six clubs italiens qui y sont déjà
   C) metaClub retrouve chaque club italien
   D) les blasons : un par club, deux couleurs valides et différentes, un style connu, la palette maison
      plus deux exceptions nommées (le gris de la Cremonese, le rose de Palerme)
   E) les rivalités : symétriques, un rival par club, chacune nommée, aucune paire entre deux pays
   F) les époques : de 1990 à 2009, personne ne joue dans un stade qui n'existe pas encore
   G) la France et l'Angleterre n'ont pas bougé d'un octet
   H) rien d'un libellé ne peut ouvrir une balise
   Usage : node harness-clubs-ita.cjs                                                             */
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</scr" + "ipt>"));

function makeStub() {
  let stub; const fn = function () { return stub; };
  stub = new Proxy(fn, {
    get(_t, p) { if (p === Symbol.toPrimitive) return () => ""; if (p === "length") return 0; return stub; },
    set() { return true; }, apply() { return stub; }, has() { return true; }, construct() { return stub; },
  });
  return stub;
}
const ls = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
const generic = makeStub();
global.document = new Proxy(function () {}, {
  get(_t, p) { if (p === Symbol.toPrimitive) return () => ""; return generic; },
  set() { return true; }, apply() { return generic; }, has() { return true; }, construct() { return generic; },
});
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, localStorage: ls, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.localStorage = ls; global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0); global.cancelAnimationFrame = (id) => clearTimeout(id);

const api = new Function(script + "\n;return {CLUBS,CLUBS_D2,CLUBS_EXTRA,CLUBS_ANG,CLUBS_ITA,CLUBS_EUROPE,CLUBS_EUROPE_C2," +
  "CLUBS_EUROPE_C3,BLASONS,RIVAL,NOMS_RIVALITES,nomRivalite,metaClub,metaSaison,PRES_EPOQUE,STADE_EPOQUE," +
  "blason,esc};")();
const { CLUBS, CLUBS_D2, CLUBS_EXTRA, CLUBS_ANG, CLUBS_ITA, BLASONS, RIVAL, NOMS_RIVALITES, metaClub, metaSaison,
  PRES_EPOQUE, STADE_EPOQUE } = api;

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const ITA = CLUBS_ITA.map(c => c.id);
const SET_ITA = new Set(ITA);
const FR = [].concat(CLUBS, CLUBS_D2, CLUBS_EXTRA);
const SET_FR = new Set(FR.map(c => c.id));
const SET_ANG = new Set(CLUBS_ANG.map(c => c.id));
const EURO = [].concat(api.CLUBS_EUROPE, api.CLUBS_EUROPE_C2, api.CLUBS_EUROPE_C3);
const BAREME = { 10: 95e6, 9: 75e6, 8: 58e6, 7: 42e6, 6: 36e6, 5: 26e6, 4: 18e6, 3: 13e6, 2: 8e6, 1: 6e6 };

/* ===== A) la table se tient ===== */
console.log("A) La table CLUBS_ITA : soixante-quatorze clubs décrits, pas esquissés");
{
  ok(CLUBS_ITA.length === 74, `la table compte ${CLUBS_ITA.length} clubs italiens`);
  ok(SET_ITA.size === CLUBS_ITA.length, "aucun identifiant en double dans la table");
  const trous = CLUBS_ITA.filter(c => !c.id || !c.nom || !c.stade ||
    !Number.isFinite(c.cap) || !Number.isFinite(c.pres) || !Number.isFinite(c.budget));
  ok(trous.length === 0, `aucun champ manquant${trous.length ? " — " + trous.map(c => c.id).join(", ") : ""}`);
  const codes = CLUBS_ITA.filter(c => !/^[A-Z]{3}$/.test(c.id));
  ok(codes.length === 0, `tous les codes sont trois majuscules${codes.length ? " — " + codes.map(c => c.id).join(", ") : ""}`);
  ok(ITA.length === new Set(CLUBS_ITA.map(c => c.nom)).size, "aucun club ne porte le nom d'un autre");
  /* Les capacités : du Dorico d'Ancône (3 000 places, le seul chiffre de la source) à San Siro.
     Le plancher est plus bas qu'en Angleterre à cause de ce seul stade, et c'est écrit ici exprès. */
  const caps = CLUBS_ITA.filter(c => !(c.cap >= 3000 && c.cap <= 90000));
  ok(caps.length === 0, `toutes les capacités sont plausibles (${Math.min(...CLUBS_ITA.map(c => c.cap))} à ${Math.max(...CLUBS_ITA.map(c => c.cap))} places)${caps.length ? " — " + caps.map(c => c.id).join(", ") : ""}`);
  const pres = CLUBS_ITA.filter(c => !(c.pres >= 1 && c.pres <= 10 && Number.isInteger(c.pres)));
  ok(pres.length === 0, `tous les prestiges sont des entiers de 1 à 10${pres.length ? " — " + pres.map(c => c.id).join(", ") : ""}`);
  const hors = CLUBS_ITA.filter(c => c.budget !== BAREME[c.pres]);
  ok(hors.length === 0, `chaque budget suit le barème français du moteur${hors.length ? " — " + hors.map(c => c.id).join(", ") : ""}`);
  const parPres = {}; for (const c of CLUBS_ITA) parPres[c.pres] = (parPres[c.pres] || 0) + 1;
  ok(Object.keys(parPres).length >= 7, `le plateau est étagé : ${Object.keys(parPres).sort((a, b) => a - b).map(p => p + "→" + parPres[p]).join(" ")}`);
  ok(CLUBS_ITA.some(c => c.pres >= 9) && CLUBS_ITA.filter(c => c.pres <= 2).length >= 15,
    "il y a des géants et une vraie queue de peloton");
  ok(metaClub("MIL").pres === 10 && metaClub("NAP").pres === 9 && metaClub("SAM").pres === 8,
    "en 1990, le Milan de Sacchi est au sommet, Naples champion juste derrière, la Sampdoria à l'affût");
}

/* ===== B) les identifiants ===== */
console.log("B) Les identifiants ne marchent sur les pieds de personne");
{
  const volésFR = ITA.filter(id => SET_FR.has(id));
  ok(volésFR.length === 0, `aucun code italien ne reprend celui d'un club français${volésFR.length ? " — " + volésFR.join(", ") : ""}`);
  const volésANG = ITA.filter(id => SET_ANG.has(id));
  ok(volésANG.length === 0, `ni celui d'un club anglais${volésANG.length ? " — " + volésANG.join(", ") : ""}`);
  const italiensDEurope = EURO.filter(c => c.pays === "Italie").map(c => c.id).sort();
  const partagés = ITA.filter(id => EURO.some(c => c.id === id)).sort();
  ok(italiensDEurope.join(",") === partagés.join(","),
    `les codes partagés avec l'Europe sont exactement les clubs italiens du vivier : ${partagés.join(", ")}`);
  ok(partagés.length === 6, `ils sont six, et pas un de plus (${partagés.join(", ")})`);
  const autresEuro = ITA.filter(id => EURO.some(c => c.id === id && c.pays !== "Italie"));
  ok(autresEuro.length === 0, `aucun club italien ne prend le code d'un club étranger du vivier${autresEuro.length ? " — " + autresEuro.join(", ") : ""}`);
  // les neuf codes de contournement : Bari n'est pas le Barça, Livourne n'est pas Liverpool
  const CONTOURNES = { BAI: "Bari", BGN: "Bologna", BRS: "Brescia", CHI: "Chievo Verona", CRM: "Cremonese",
    FRM: "Fermana", LVR: "Livorno", MZA: "Monza", PRG: "Perugia" };
  const malCodés = Object.entries(CONTOURNES).filter(([id, nom]) => (metaClub(id) || {}).nom !== nom);
  ok(malCodés.length === 0, `les neuf codes de contournement désignent le bon club${malCodés.length ? " — " + malCodés.map(x => x[0]).join(", ") : ""}`);
  ok(metaClub("LIV").nom === "Liverpool" && metaClub("BAR") === undefined && metaClub("MON").nom !== "Monza",
    "et LIV reste Liverpool, BAR reste hors du championnat, MON reste Monaco");
}

/* ===== C) metaClub ===== */
console.log("C) metaClub retrouve chaque club italien");
{
  const perdus = ITA.filter(id => !metaClub(id));
  ok(perdus.length === 0, `les ${ITA.length} clubs sont retrouvés par leur code${perdus.length ? " — " + perdus.join(", ") : ""}`);
  const faux = ITA.filter(id => metaClub(id).nom !== CLUBS_ITA.find(c => c.id === id).nom);
  ok(faux.length === 0, `et c'est bien le bon club qui revient${faux.length ? " — " + faux.join(", ") : ""}`);
  ok(metaClub("PSG").nom === "Paris Saint-Germain" && metaClub("ARS").nom === "Arsenal",
    "les clubs français puis anglais passent toujours d'abord (Paris Saint-Germain, Arsenal)");
}

/* ===== D) les blasons ===== */
console.log("D) Les blasons : un par club, deux couleurs, un style connu");
{
  const sans = ITA.filter(id => !BLASONS[id]);
  ok(sans.length === 0, `les ${ITA.length} clubs ont leur blason${sans.length ? " — " + sans.join(", ") : ""}`);
  const hex = /^#[0-9a-f]{6}$/;
  const sales = ITA.filter(id => !hex.test(BLASONS[id].a) || !hex.test(BLASONS[id].b));
  ok(sales.length === 0, `toutes les couleurs sont des hex à six chiffres${sales.length ? " — " + sales.join(", ") : ""}`);
  const plates = ITA.filter(id => BLASONS[id].a === BLASONS[id].b);
  ok(plates.length === 0, `aucun blason n'a deux fois la même couleur${plates.length ? " — " + plates.join(", ") : ""}`);
  const styles = new Set(["uni", "v", "ray", "diag"]);
  const inconnus = ITA.filter(id => !styles.has(BLASONS[id].st));
  ok(inconnus.length === 0, `tous les styles sont connus du dessinateur${inconnus.length ? " — " + inconnus.join(", ") : ""}`);
  const vus = {}; for (const id of ITA) vus[BLASONS[id].st] = (vus[BLASONS[id].st] || 0) + 1;
  ok(Object.keys(vus).length >= 4, `le plateau n'est pas monotone : ${Object.keys(vus).map(s => s + "→" + vus[s]).join(" ")}`);
  /* La palette de la maison, plus DEUX couleurs nommées que l'Italie impose et qu'aucun club français ne
     porte : le gris des grigiorossi de Crémone et le rose des rosanero de Palerme. Les ramener à la palette
     aurait habillé Palerme comme le Milan. Toute autre couleur neuve est refusée. */
  const EXCEPTIONS = { "#8c8c8c": "CRM", "#f29ec4": "PAL" };
  const paletteFR = new Set(Object.keys(BLASONS).filter(k => SET_FR.has(k)).flatMap(k => [BLASONS[k].a, BLASONS[k].b]));
  const horsPalette = ITA.flatMap(id => [BLASONS[id].a, BLASONS[id].b].filter(c => !paletteFR.has(c)).map(c => [id, c]))
    .filter(([id, c]) => EXCEPTIONS[c] !== id);
  ok(horsPalette.length === 0, `aucune couleur hors de la palette maison, hors les deux exceptions nommées${horsPalette.length ? " — " + horsPalette.map(x => x.join(":")).join(", ") : ""}`);
  ok(BLASONS.CRM.b === "#8c8c8c" && BLASONS.PAL.a === "#f29ec4", "et les deux exceptions sont bien là où on les attend");
  // quelques maillots qu'on ne peut pas rater
  ok(BLASONS.JUV.st === "ray" && BLASONS.JUV.a === "#ffffff" && BLASONS.JUV.b === "#111111", "la Juventus est rayée de blanc et de noir");
  ok(BLASONS.MIL.st === "ray" && BLASONS.MIL.a === "#d40026" && BLASONS.MIL.b === "#111111", "le Milan rayé de rouge et de noir");
  ok(BLASONS.INT.st === "ray" && BLASONS.INT.b === "#111111", "l'Inter rayée de bleu et de noir");
  ok(BLASONS.FIO.a === "#5b2d8e" && BLASONS.TOR.a === "#7a1f3d" && BLASONS.LAZ.a === "#37a6dc", "la Fiorentina violette, le Torino grenat, la Lazio ciel");
  let mauvais = [];
  for (const id of ITA) for (const t of [18, 28, 44]) {
    const s = api.blason(metaClub(id), t);
    if (!/^<svg /.test(s) || !s.includes("</svg>") || /undefined|NaN/.test(s)) mauvais.push(id + "@" + t);
  }
  ok(mauvais.length === 0, `les ${ITA.length} blasons se dessinent en 18, 28 et 44 px${mauvais.length ? " — " + mauvais.slice(0, 5).join(", ") : ""}`);
}

/* ===== E) les rivalités ===== */
console.log("E) Les derbys italiens se tiennent debout");
{
  const paires = ITA.filter(id => RIVAL[id]);
  ok(paires.length >= 40, `${paires.length} clubs italiens ont un rival désigné`);
  const bancals = paires.filter(id => RIVAL[RIVAL[id]] !== id);
  ok(bancals.length === 0, `chaque rivalité est réciproque${bancals.length ? " — " + bancals.join(", ") : ""}`);
  const mixtes = paires.filter(id => !SET_ITA.has(RIVAL[id]));
  ok(mixtes.length === 0, `aucun club italien n'a de rival étranger${mixtes.length ? " — " + mixtes.join(", ") : ""}`);
  const autres = [...SET_FR, ...SET_ANG].filter(id => RIVAL[id] && SET_ITA.has(RIVAL[id]));
  ok(autres.length === 0, `et aucun club français ou anglais n'a de rival italien${autres.length ? " — " + autres.join(", ") : ""}`);
  const anonymes = paires.filter(id => !(NOMS_RIVALITES[id + "-" + RIVAL[id]] || NOMS_RIVALITES[RIVAL[id] + "-" + id]));
  ok(anonymes.length === 0, `chaque derby porte un nom${anonymes.length ? " — " + anonymes.join(", ") : ""}`);
  const noms = Object.values(NOMS_RIVALITES);
  ok(new Set(noms).size === noms.length, `les ${noms.length} noms de derby du jeu sont tous différents`);
  const clésMortes = Object.keys(NOMS_RIVALITES).filter(k => k.split("-").some(id => !metaClub(id)));
  ok(clésMortes.length === 0, `aucun nom de derby ne cite un club inconnu${clésMortes.length ? " — " + clésMortes.join(", ") : ""}`);
  ok(api.nomRivalite("MIL", "INT") === "Le derby de la Madonnina" && api.nomRivalite("LAZ", "ROM") === "Le derby de la Capitale" &&
     api.nomRivalite("TOR", "JUV") === "Le derby de la Mole" && api.nomRivalite("SAM", "GEN") === "Le derby de la Lanterne",
    "à l'œil : Milan, Rome, Turin et Gênes se lisent dans les deux sens");
  ok(api.nomRivalite("PSG", "OM") === "Le Classique" && api.nomRivalite("MUN", "MCI") === "Le derby de Manchester",
    "et le Classique comme le derby de Manchester n'ont pas bougé");
}

/* ===== F) les époques ===== */
console.log("F) De 1990 à 2009, personne ne joue dans un stade qui n'existe pas encore");
{
  const clésS = Object.keys(STADE_EPOQUE).filter(k => SET_ITA.has(k));
  const clésP = Object.keys(PRES_EPOQUE).filter(k => SET_ITA.has(k));
  ok(clésS.length >= 10 && clésP.length >= 20, `${clésS.length} clubs déménagent ou voient leur stade renommé, ${clésP.length} changent de standing dans la fenêtre`);
  const malRangées = [];
  for (const k of clésS) { let d = 0; for (const [a] of STADE_EPOQUE[k]) { if (a <= d || a < 1990 || a > 2010) malRangées.push(k + "/" + a); d = a; } }
  for (const k of clésP) { let d = 0; for (const [a] of PRES_EPOQUE[k]) { if (a <= d || a < 1990 || a > 2010) malRangées.push(k + "/" + a); d = a; } }
  ok(malRangées.length === 0, `toutes les dates sont dans la fenêtre et rangées dans l'ordre${malRangées.length ? " — " + malRangées.join(", ") : ""}`);
  const cassés = [];
  for (let an = 1990; an <= 2009; an++) for (const id of ITA) {
    const m = metaSaison(id, an);
    if (!m || !m.stade || !m.nom || !(m.cap >= 3000 && m.cap <= 90000) || !(m.pres >= 1 && m.pres <= 10) || !(m.budget > 0)) cassés.push(id + "/" + an);
  }
  ok(cassés.length === 0, `74 clubs × 20 saisons = ${74 * 20} fiches d'époque, toutes tenables${cassés.length ? " — " + cassés.slice(0, 6).join(", ") : ""}`);
  const FAITS = [
    ["JUV", 1990, "Delle Alpi"], ["JUV", 2005, "Delle Alpi"], ["JUV", 2006, "Olimpico di Torino"], ["JUV", 2009, "Olimpico di Torino"],
    ["TOR", 1990, "Delle Alpi"], ["TOR", 2006, "Olimpico di Torino"],
    ["ANC", 1991, "Dorico"], ["ANC", 1992, "Del Conero"],
    ["PAD", 1993, "Silvio Appiani"], ["PAD", 1994, "Euganeo"],
    ["REG", 1994, "Mirabello"], ["REG", 1995, "Giglio"],
    ["RGC", 1998, "Comunale"], ["RGC", 1999, "Oreste Granillo"],
    ["TRI", 1990, "Giuseppe Grezar"], ["TRI", 1992, "Nereo Rocco"],
    ["MES", 2003, "Giovanni Celeste"], ["MES", 2004, "San Filippo"],
    ["CIT", 1999, "Pier Cesare Tombolato"], ["CIT", 2000, "Euganeo"], ["CIT", 2001, "Euganeo"], ["CIT", 2002, "Pier Cesare Tombolato"],
    ["PAL", 2001, "La Favorita"], ["PAL", 2002, "Renzo Barbera"],
    ["CTN", 2001, "Cibali"], ["CTN", 2002, "Angelo Massimino"],
    ["BAI", 1990, "San Nicola"], ["SAL", 1990, "Arechi"], ["MIL", 2009, "San Siro"], ["INT", 1990, "San Siro"],
    ["ROM", 1995, "Olimpico"], ["NAP", 2009, "San Paolo"], ["ALZ", 1999, "Atleti Azzurri d'Italia"], ["SAS", 2008, "Alberto Braglia"],
  ];
  const fauxFaits = FAITS.filter(([id, an, st]) => metaSaison(id, an).stade !== st);
  ok(fauxFaits.length === 0, `les ${FAITS.length} faits de stade vérifiés tombent juste${fauxFaits.length ? " — " + fauxFaits.map(([i, a, s]) => `${i}/${a} attendait ${s}, trouve ${metaSaison(i, a).stade}`).join(" ; ") : ""}`);
  ok(metaSaison("CIT", 2000).cap === 32420 && metaSaison("CIT", 2002).cap === 7623, "Cittadella prend les places de l'Euganeo deux saisons, puis retrouve les siennes");
  const HIST = [
    ["PAR", 1990, 4], ["PAR", 1992, 6], ["PAR", 1995, 8], ["PAR", 2004, 6],
    ["LAZ", 1990, 6], ["LAZ", 1997, 9], ["LAZ", 2002, 7],
    ["NAP", 1990, 9], ["NAP", 2004, 3], ["NAP", 2008, 6],
    ["JUV", 1994, 10], ["JUV", 2006, 8], ["JUV", 2007, 9], ["INT", 2006, 10],
    ["FIO", 1993, 6], ["FIO", 1994, 7], ["FIO", 2002, 4], ["FIO", 2006, 7],
    ["CHI", 1990, 1], ["CHI", 2001, 4], ["PAL", 2004, 6],
  ];
  const fauxHist = HIST.filter(([id, an, p]) => metaSaison(id, an).pres !== p);
  ok(fauxHist.length === 0, `les ${HIST.length} standings d'époque tombent juste${fauxHist.length ? " — " + fauxHist.map(([i, a, p]) => `${i}/${a} attendait ${p}, trouve ${metaSaison(i, a).pres}`).join(" ; ") : ""}`);
  ok(metaSaison("PAR", 1995).budget === metaSaison("PAR", 1990).budget * 2, "le budget de Parme double avec Parmalat (prestige 4 → 8)");
  ok(metaSaison("NAP", 2004).budget === metaSaison("NAP", 1990).budget / 3, "et celui de Naples fond des deux tiers avec la faillite (prestige 9 → 3)");
}

/* ===== G) la France et l'Angleterre n'ont pas bougé ===== */
console.log("G) Une partie française ou anglaise ne bouge pas d'un octet");
{
  ok(CLUBS.length === 20 && CLUBS_D2.length === 20 && CLUBS_ANG.length === 72, `les tables françaises et anglaise sont intactes (${CLUBS.length} + ${CLUBS_D2.length}, ${CLUBS_ANG.length})`);
  const TEMOINS = [
    ["PSG", "Parc des Princes", 48000, 10, 95e6], ["OM", "Vélodrome", 42000, 8, 30e6],
    ["ARS", "Highbury", 38500, 8, 58e6], ["LIV", "Anfield", null, null, null], ["MON", null, null, null, null],
  ];
  const bougés = TEMOINS.filter(([id, st, cap, p, b]) => {
    const c = metaClub(id); return !c || (st && c.stade !== st) || (cap && c.cap !== cap) || (p && c.pres !== p) || (b && c.budget !== b) || SET_ITA.has(c.id) && c.nom !== CLUBS_ITA.find(x => x.id === c.id).nom;
  });
  ok(bougés.length === 0, `les fiches témoins sont inchangées${bougés.length ? " — " + bougés.map(t => t[0]).join(", ") : ""}`);
  ok(metaSaison("ARS", 2006).stade === "Emirates Stadium" && metaSaison("OM", 1998).cap === 60000 && metaSaison("CHE", 2004).pres === 10,
    "et les époques françaises et anglaises répondent comme avant (Emirates 2006, Vélodrome 1998, Chelsea 2004)");
  ok(BLASONS.LIV.a === "#b8001f" && BLASONS.PSG.a === "#0a3580", "les blasons de Liverpool et du PSG n'ont pas bougé");
  ok(BLASONS.JUV && BLASONS.MIL && BLASONS.INT && BLASONS.ROM && BLASONS.LAZ && BLASONS.PAR,
    "les six clubs italiens du vivier ont désormais leurs couleurs, y compris en Coupe d'Europe");
}

/* ===== H) rien ne peut ouvrir une balise ===== */
console.log("H) Aucun libellé italien ne peut ouvrir une balise");
{
  const tous = CLUBS_ITA.flatMap(c => [c.nom, c.stade])
    .concat(Object.keys(STADE_EPOQUE).filter(k => SET_ITA.has(k)).flatMap(k => STADE_EPOQUE[k].filter(e => e[1] !== null).map(e => e[1])))
    .concat(Object.values(NOMS_RIVALITES));
  const sales = tous.filter(t => /[<>"]/.test(String(t)));
  ok(sales.length === 0, `aucun des ${tous.length} libellés ne porte de chevron ni de guillemet${sales.length ? " — " + sales.join(", ") : ""}`);
  ok(tous.every(t => String(t).trim()), "et aucun n'est vide");
  const amp = tous.filter(t => String(t).includes("&"));
  ok(amp.length === 0, `l'Italie n'apporte aucune esperluette, ni dans ses clubs ni dans les noms de derby${amp.length ? " — " + amp.join(", ") : ""}`);
  ok(api.esc("Atleti Azzurri d'Italia").includes("Azzurri") && api.esc("Renato Dall'Ara").includes("Ara"),
    "les apostrophes d'Atleti Azzurri d'Italia et de Renato Dall'Ara traversent l'échappement");
}

console.log(FAILS === 0 ? "\n✅ CLUBS ITALIENS : TOUT EST VERT" : "\n❌ CLUBS ITALIENS : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS ? 1 : 0);
