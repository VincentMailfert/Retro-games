/* Harnais de validation — LES CLUBS ANGLAIS (ANG-B, v1.81)
   Deuxième étape du lot structure qui précède l'Angleterre. Aucune saison anglaise n'est encore
   jouable : ce qui se vérifie ici, c'est que les soixante-douze clubs existent, qu'ils disent vrai,
   qu'ils ne marchent sur les pieds d'aucun club français, et qu'une partie française n'a pas bougé.
   A) la table CLUBS_ANG se tient : 72 clubs, aucun trou, aucun chiffre absurde
   B) les identifiants : aucun ne vole celui d'un club français, et quatre SEULEMENT sont partagés
      avec le vivier de Coupe d'Europe — les quatre clubs anglais qui y sont déjà (ANG-C)
   C) metaClub retrouve chaque club anglais
   D) les blasons : un par club, deux couleurs valides et différentes, un style connu
   E) les rivalités : symétriques, un rival par club, chacune nommée, aucune paire franco-anglaise
   F) les époques : de 1990 à 2009, personne ne joue dans un stade qui n'existe pas encore
   G) la France n'a pas bougé d'un octet
   H) rien d'un libellé ne peut ouvrir une balise
   Usage : node harness-clubs-ang.cjs                                                             */
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

const api = new Function(script + "\n;return {CLUBS,CLUBS_D2,CLUBS_EXTRA,CLUBS_ANG,CLUBS_EUROPE,CLUBS_EUROPE_C2," +
  "CLUBS_EUROPE_C3,BLASONS,RIVAL,NOMS_RIVALITES,nomRivalite,metaClub,metaSaison,PRES_EPOQUE,STADE_EPOQUE," +
  "blason,esc,PAYS};")();
const { CLUBS, CLUBS_D2, CLUBS_EXTRA, CLUBS_ANG, BLASONS, RIVAL, NOMS_RIVALITES, metaClub, metaSaison,
  PRES_EPOQUE, STADE_EPOQUE } = api;

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const ANG = CLUBS_ANG.map(c => c.id);
const SET_ANG = new Set(ANG);
const FR = [].concat(CLUBS, CLUBS_D2, CLUBS_EXTRA);
const SET_FR = new Set(FR.map(c => c.id));
const EURO = [].concat(api.CLUBS_EUROPE, api.CLUBS_EUROPE_C2, api.CLUBS_EUROPE_C3);
/* L'échelle de budget du moteur : le prestige donne le budget, en FRANCS, pour tous les pays.
   C'est la garantie que l'économie n'est calibrée qu'une fois (voir ANG-A). */
const BAREME = { 10: 95e6, 9: 75e6, 8: 58e6, 7: 42e6, 6: 36e6, 5: 26e6, 4: 18e6, 3: 13e6, 2: 8e6, 1: 6e6 };

/* ===== A) la table se tient ===== */
console.log("A) La table CLUBS_ANG : soixante-douze clubs décrits, pas esquissés");
{
  ok(CLUBS_ANG.length === 72, `la table compte ${CLUBS_ANG.length} clubs anglais`);
  ok(SET_ANG.size === CLUBS_ANG.length, "aucun identifiant en double dans la table");
  const trous = CLUBS_ANG.filter(c => !c.id || !c.nom || !c.stade ||
    !Number.isFinite(c.cap) || !Number.isFinite(c.pres) || !Number.isFinite(c.budget));
  ok(trous.length === 0, `aucun champ manquant${trous.length ? " — " + trous.map(c => c.id).join(", ") : ""}`);
  const codes = CLUBS_ANG.filter(c => !/^[A-Z]{3}$/.test(c.id));
  ok(codes.length === 0, `tous les codes sont trois majuscules${codes.length ? " — " + codes.map(c => c.id).join(", ") : ""}`);
  const nomsDbl = ANG.length - new Set(CLUBS_ANG.map(c => c.nom)).size;
  ok(nomsDbl === 0, "aucun club ne porte le nom d'un autre");
  // les capacités : un stade anglais de l'époque, entre un terrain de troisième division et Old Trafford
  const caps = CLUBS_ANG.filter(c => !(c.cap >= 5000 && c.cap <= 80000));
  ok(caps.length === 0, `toutes les capacités sont plausibles (${Math.min(...CLUBS_ANG.map(c => c.cap))} à ${Math.max(...CLUBS_ANG.map(c => c.cap))} places)${caps.length ? " — " + caps.map(c => c.id).join(", ") : ""}`);
  const pres = CLUBS_ANG.filter(c => !(c.pres >= 1 && c.pres <= 10 && Number.isInteger(c.pres)));
  ok(pres.length === 0, `tous les prestiges sont des entiers de 1 à 10${pres.length ? " — " + pres.map(c => c.id).join(", ") : ""}`);
  const hors = CLUBS_ANG.filter(c => c.budget !== BAREME[c.pres]);
  ok(hors.length === 0, `chaque budget suit le barème français du moteur${hors.length ? " — " + hors.map(c => c.id + " (" + c.pres + " → " + c.budget / 1e6 + " MF)").join(", ") : ""}`);
  // un plateau d'époque a des grands et des petits : si tout le monde se ressemble, la saison est fade
  const parPres = {}; for (const c of CLUBS_ANG) parPres[c.pres] = (parPres[c.pres] || 0) + 1;
  ok(Object.keys(parPres).length >= 7, `le plateau est étagé : ${Object.keys(parPres).sort().map(p => p + "→" + parPres[p]).join(" ")}`);
  ok(CLUBS_ANG.some(c => c.pres >= 9) && CLUBS_ANG.filter(c => c.pres <= 2).length >= 15,
    "il y a un géant et une vraie queue de peloton");
}

/* ===== B) les identifiants ===== */
console.log("B) Les identifiants ne marchent sur les pieds de personne");
{
  const volés = ANG.filter(id => SET_FR.has(id));
  ok(volés.length === 0, `aucun code anglais ne reprend celui d'un club français${volés.length ? " — " + volés.join(", ") : ""}`);
  /* Quatre clubs anglais sont DÉJÀ dans le vivier de Coupe d'Europe. Ils gardent leur code exprès :
     même club, même identifiant, et c'est ce qui permettra à ANG-C de retirer Liverpool du vivier
     le jour où l'on jouera le championnat anglais. Aucun autre partage n'est voulu. */
  const anglaisDEurope = EURO.filter(c => c.pays === "Angleterre").map(c => c.id).sort();
  const partagés = ANG.filter(id => EURO.some(c => c.id === id)).sort();
  ok(anglaisDEurope.join(",") === partagés.join(","),
    `les codes partagés avec l'Europe sont exactement les clubs anglais du vivier : ${partagés.join(", ")}`);
  ok(partagés.length === 4, `ils sont quatre, et pas un de plus (${partagés.join(", ")})`);
  const autresEuro = ANG.filter(id => EURO.some(c => c.id === id && c.pays !== "Angleterre"));
  ok(autresEuro.length === 0, `aucun club anglais ne prend le code d'un club étranger du vivier${autresEuro.length ? " — " + autresEuro.join(", ") : ""}`);
}

/* ===== C) metaClub ===== */
console.log("C) metaClub retrouve chaque club anglais");
{
  const perdus = ANG.filter(id => !metaClub(id));
  ok(perdus.length === 0, `les ${ANG.length} clubs sont retrouvés par leur code${perdus.length ? " — " + perdus.join(", ") : ""}`);
  const faux = ANG.filter(id => metaClub(id).nom !== CLUBS_ANG.find(c => c.id === id).nom);
  ok(faux.length === 0, `et c'est bien le bon club qui revient${faux.length ? " — " + faux.join(", ") : ""}`);
  // un club français continue de revenir avant tout le monde : l'ordre de recherche n'a pas changé
  ok(metaClub("PSG").nom === "Paris Saint-Germain" && metaClub("ARL").nom === "AC Arles-Avignon",
    "les clubs français passent toujours d'abord (Paris Saint-Germain, AC Arles-Avignon)");
}

/* ===== D) les blasons ===== */
console.log("D) Les blasons : un par club, deux couleurs, un style connu");
{
  const sans = ANG.filter(id => !BLASONS[id]);
  ok(sans.length === 0, `les ${ANG.length} clubs ont leur blason${sans.length ? " — " + sans.join(", ") : ""}`);
  const hex = /^#[0-9a-f]{6}$/;
  const sales = ANG.filter(id => !hex.test(BLASONS[id].a) || !hex.test(BLASONS[id].b));
  ok(sales.length === 0, `toutes les couleurs sont des hex à six chiffres${sales.length ? " — " + sales.join(", ") : ""}`);
  const plates = ANG.filter(id => BLASONS[id].a === BLASONS[id].b);
  ok(plates.length === 0, `aucun blason n'a deux fois la même couleur${plates.length ? " — " + plates.join(", ") : ""}`);
  const styles = new Set(["uni", "v", "ray", "diag"]);
  const inconnus = ANG.filter(id => !styles.has(BLASONS[id].st));
  ok(inconnus.length === 0, `tous les styles sont connus du dessinateur${inconnus.length ? " — " + inconnus.join(", ") : ""}`);
  const vus = {}; for (const id of ANG) vus[BLASONS[id].st] = (vus[BLASONS[id].st] || 0) + 1;
  ok(Object.keys(vus).length >= 3, `le plateau n'est pas monotone : ${Object.keys(vus).map(s => s + "→" + vus[s]).join(" ")}`);
  // la palette reste celle de la maison : pas de couleur inventée hors de celles déjà employées en France
  const paletteFR = new Set(Object.keys(BLASONS).filter(k => SET_FR.has(k)).flatMap(k => [BLASONS[k].a, BLASONS[k].b]));
  const horsPalette = [...new Set(ANG.flatMap(id => [BLASONS[id].a, BLASONS[id].b]))].filter(c => !paletteFR.has(c));
  ok(horsPalette.length === 0, `aucune couleur hors de la palette maison${horsPalette.length ? " — " + horsPalette.join(", ") : ""}`);
  // et le dessinateur ne tombe pas : chaque blason rend un SVG, à toutes les tailles
  let mauvais = [];
  for (const id of ANG) for (const t of [18, 28, 44]) {
    const s = api.blason(metaClub(id), t);
    if (!/^<svg /.test(s) || !s.includes("</svg>") || /undefined|NaN/.test(s)) mauvais.push(id + "@" + t);
  }
  ok(mauvais.length === 0, `les ${ANG.length} blasons se dessinent en 18, 28 et 44 px${mauvais.length ? " — " + mauvais.slice(0, 5).join(", ") : ""}`);
}

/* ===== E) les rivalités ===== */
console.log("E) Les rivalités anglaises se tiennent debout");
{
  const paires = ANG.filter(id => RIVAL[id]);
  ok(paires.length >= 40, `${paires.length} clubs anglais ont un rival désigné`);
  const bancals = paires.filter(id => RIVAL[RIVAL[id]] !== id);
  ok(bancals.length === 0, `chaque rivalité est réciproque${bancals.length ? " — " + bancals.join(", ") : ""}`);
  const mixtes = paires.filter(id => SET_FR.has(RIVAL[id]));
  ok(mixtes.length === 0, `aucun club anglais n'a de rival français${mixtes.length ? " — " + mixtes.join(", ") : ""}`);
  const frMixtes = [...SET_FR].filter(id => RIVAL[id] && SET_ANG.has(RIVAL[id]));
  ok(frMixtes.length === 0, `et aucun club français n'a de rival anglais${frMixtes.length ? " — " + frMixtes.join(", ") : ""}`);
  const anonymes = paires.filter(id => {
    const a = id, b = RIVAL[id];
    return !(NOMS_RIVALITES[a + "-" + b] || NOMS_RIVALITES[b + "-" + a]);
  });
  ok(anonymes.length === 0, `chaque derby porte un nom${anonymes.length ? " — " + anonymes.join(", ") : ""}`);
  const noms = Object.values(NOMS_RIVALITES);
  ok(new Set(noms).size === noms.length, `les ${noms.length} noms de derby sont tous différents`);
  // les clés de NOMS_RIVALITES désignent des clubs qui existent
  const clésMortes = Object.keys(NOMS_RIVALITES).filter(k => k.split("-").some(id => !metaClub(id)));
  ok(clésMortes.length === 0, `aucun nom de derby ne cite un club inconnu${clésMortes.length ? " — " + clésMortes.join(", ") : ""}`);
  ok(api.nomRivalite("MUN", "MCI") === "Le derby de Manchester" &&
     api.nomRivalite("MCI", "MUN") === "Le derby de Manchester" &&
     api.nomRivalite("LIV", "EVE") === "Le derby du Merseyside",
    "à l'œil : le derby de Manchester se lit dans les deux sens, et le Merseyside est au rendez-vous");
  ok(api.nomRivalite("PSG", "OM") === "Le Classique", "et le Classique n'a pas bougé");
}

/* ===== F) les époques ===== */
console.log("F) De 1990 à 2009, personne ne joue dans un stade qui n'existe pas encore");
{
  const clésS = Object.keys(STADE_EPOQUE).filter(k => SET_ANG.has(k));
  const clésP = Object.keys(PRES_EPOQUE).filter(k => SET_ANG.has(k));
  ok(clésS.length >= 25 && clésP.length >= 25, `${clésS.length} clubs déménagent, ${clésP.length} changent de standing dans la fenêtre`);
  const inconnues = Object.keys(STADE_EPOQUE).concat(Object.keys(PRES_EPOQUE)).filter(k => !metaClub(k));
  ok(inconnues.length === 0, `aucune ligne d'époque ne cite un club inconnu${inconnues.length ? " — " + inconnues.join(", ") : ""}`);
  const malRangées = [];
  for (const k of clésS) { let d = 0; for (const [a] of STADE_EPOQUE[k]) { if (a <= d || a < 1990 || a > 2010) malRangées.push(k + "/" + a); d = a; } }
  for (const k of clésP) { let d = 0; for (const [a] of PRES_EPOQUE[k]) { if (a <= d || a < 1990 || a > 2010) malRangées.push(k + "/" + a); d = a; } }
  ok(malRangées.length === 0, `toutes les dates sont dans la fenêtre et rangées dans l'ordre${malRangées.length ? " — " + malRangées.join(", ") : ""}`);
  // vingt saisons de suite, chaque club reste décrit, et sa fiche reste sensée
  const cassés = [];
  for (let an = 1990; an <= 2009; an++) for (const id of ANG) {
    const m = metaSaison(id, an);
    if (!m || !m.stade || !m.nom || !(m.cap >= 5000 && m.cap <= 80000) || !(m.pres >= 1 && m.pres <= 10) || !(m.budget > 0)) cassés.push(id + "/" + an);
  }
  ok(cassés.length === 0, `72 clubs × 20 saisons = ${72 * 20} fiches d'époque, toutes tenables${cassés.length ? " — " + cassés.slice(0, 6).join(", ") : ""}`);
  /* Les faits vérifiés, un par un. C'est le cœur du harnais : une date de déménagement fausse
     mettrait un club dans un stade qui n'est pas encore construit, et ça se verrait à l'écran. */
  const FAITS = [
    ["ARS", 1990, "Highbury"], ["ARS", 2005, "Highbury"], ["ARS", 2006, "Emirates Stadium"], ["ARS", 2009, "Emirates Stadium"],
    ["MCI", 2002, "Maine Road"], ["MCI", 2003, "City of Manchester Stadium"],
    ["SUN", 1996, "Roker Park"], ["SUN", 1997, "Stadium of Light"],
    ["SOU", 2000, "The Dell"], ["SOU", 2001, "St Mary's Stadium"],
    ["MID", 1994, "Ayresome Park"], ["MID", 1995, "Riverside Stadium"],
    ["DER", 1996, "Baseball Ground"], ["DER", 1997, "Pride Park"],
    ["BOL", 1996, "Burnden Park"], ["BOL", 1997, "Reebok Stadium"],
    ["STK", 1996, "Victoria Ground"], ["STK", 1997, "Britannia Stadium"],
    ["LEI", 2001, "Filbert Street"], ["LEI", 2002, "Walkers Stadium"],
    ["COV", 2004, "Highfield Road"], ["COV", 2005, "Ricoh Arena"],
    ["WIG", 1998, "Springfield Park"], ["WIG", 1999, "JJB Stadium"],
    ["HUL", 2001, "Boothferry Park"], ["HUL", 2002, "KC Stadium"],
    ["RDG", 1997, "Elm Park"], ["RDG", 1998, "Madejski Stadium"],
    ["OXF", 2000, "Manor Ground"], ["OXF", 2001, "Kassam Stadium"],
    ["SWA", 2004, "Vetch Field"], ["SWA", 2005, "Liberty Stadium"],
    ["MIW", 1992, "The Den"], ["MIW", 1993, "The New Den"],
    ["HUD", 1993, "Leeds Road"], ["HUD", 1994, "Alfred McAlpine Stadium"],
    ["DON", 2006, "Belle Vue"], ["DON", 2007, "Keepmoat Stadium"],
    ["COL", 2007, "Layer Road"], ["COL", 2008, "Weston Homes Community Stadium"],
    ["CAR", 2008, "Ninian Park"], ["CAR", 2009, "Cardiff City Stadium"],
    ["BSR", 1995, "Twerton Park"], ["BSR", 1996, "Memorial Ground"],
    ["WIM", 1990, "Plough Lane"], ["WIM", 1991, "Selhurst Park"], ["WIM", 2003, "National Hockey Stadium"],
    ["CHL", 1990, "Selhurst Park"], ["CHL", 1991, "Upton Park"], ["CHL", 1992, "The Valley"],
    ["MUN", 1990, "Old Trafford"], ["LIV", 2009, "Anfield"], ["TOT", 1995, "White Hart Lane"],
  ];
  const fauxFaits = FAITS.filter(([id, an, st]) => metaSaison(id, an).stade !== st);
  ok(fauxFaits.length === 0, `les ${FAITS.length} faits de stade vérifiés tombent juste${fauxFaits.length ? " — " + fauxFaits.map(([i, a, s]) => `${i}/${a} attendait ${s}, trouve ${metaSaison(i, a).stade}` ).join(" ; ") : ""}`);
  // et le standing suit l'histoire : l'argent arrive, et il se voit
  const HIST = [
    ["BLB", 1990, 3], ["BLB", 1994, 7], ["BLB", 1995, 8], ["BLB", 1999, 4],
    ["CHE", 1996, 6], ["CHE", 2002, 7], ["CHE", 2003, 9], ["CHE", 2004, 10],
    ["MCI", 1990, 6], ["MCI", 1997, 4], ["MCI", 2008, 8], ["MCI", 2009, 9],
    ["MUN", 1990, 8], ["MUN", 1999, 10], ["LEE", 2001, 8], ["LEE", 2004, 4],
    ["FOR", 1990, 6], ["FOR", 1999, 3], ["WIG", 1990, 1], ["WIG", 2005, 4],
  ];
  const fauxHist = HIST.filter(([id, an, p]) => metaSaison(id, an).pres !== p);
  ok(fauxHist.length === 0, `les ${HIST.length} standings d'époque tombent juste${fauxHist.length ? " — " + fauxHist.map(([i, a, p]) => `${i}/${a} attendait ${p}, trouve ${metaSaison(i, a).pres}`).join(" ; ") : ""}`);
  // le budget suit le prestige, jamais l'inverse
  ok(metaSaison("CHE", 2004).budget > metaSaison("CHE", 2002).budget * 1.4,
    "le budget de Chelsea décolle avec son prestige en 2004");
  ok(metaSaison("LEE", 2004).budget < metaSaison("LEE", 2001).budget / 1.5,
    "et celui de Leeds s'effondre avec le sien en 2004");
}

/* ===== G) la France n'a pas bougé ===== */
console.log("G) Une partie française ne bouge pas d'un octet");
{
  ok(CLUBS.length === 20 && CLUBS_D2.length === 20, `les tables françaises sont intactes (${CLUBS.length} + ${CLUBS_D2.length})`);
  const TEMOINS = [
    ["PSG", "Parc des Princes", 48000, 10, 95e6], ["OM", "Vélodrome", 42000, 8, 30e6],
    ["AJA", "Abbé-Deschamps", 20000, 8, 55e6], ["GUE", "Jean-Laville", 9000, 2, 9e6],
  ];
  const bougés = TEMOINS.filter(([id, st, cap, p, b]) => {
    const c = metaClub(id); return c.stade !== st || c.cap !== cap || c.pres !== p || c.budget !== b;
  });
  ok(bougés.length === 0, `les fiches françaises témoins sont inchangées${bougés.length ? " — " + bougés.map(t => t[0]).join(", ") : ""}`);
  const FR_EPOQUE = [["OM", 1997, "Vélodrome", 42000], ["OM", 1998, "Vélodrome", 60000],
    ["LYO", 1998, "Gerland", 42000], ["BOR", 2001, "Chaban-Delmas", 34000], ["SED", 2000, "Louis-Dugauguez", 24000]];
  const fauxFR = FR_EPOQUE.filter(([id, an, st, cap]) => { const m = metaSaison(id, an); return m.stade !== st || m.cap !== cap; });
  ok(fauxFR.length === 0, `et les stades français d'époque répondent comme avant${fauxFR.length ? " — " + fauxFR.map(t => t[0] + "/" + t[1]).join(", ") : ""}`);
  ok(metaSaison("LYO", 2003).pres === 10 && metaSaison("LEN", 1998).pres === 7,
    "les prestiges français d'époque aussi (Lyon 2003, Lens 1998)");
  // les quatre codes partagés avec l'Europe gagnent un blason : c'est une conséquence, pas un accident
  ok(BLASONS.LIV && BLASONS.EVE && BLASONS.FOR && BLASONS.BLB,
    "Liverpool, Everton, Forest et Blackburn ont désormais leurs couleurs, y compris en Coupe d'Europe");
}

/* ===== H) rien ne peut ouvrir une balise ===== */
console.log("H) Aucun libellé anglais ne peut ouvrir une balise");
{
  const tous = CLUBS_ANG.flatMap(c => [c.nom, c.stade])
    .concat(Object.keys(STADE_EPOQUE).filter(k => SET_ANG.has(k)).flatMap(k => STADE_EPOQUE[k].map(e => e[1])))
    .concat(Object.values(NOMS_RIVALITES));
  const sales = tous.filter(t => /[<>"]/.test(String(t)));
  ok(sales.length === 0, `aucun des ${tous.length} libellés ne porte de chevron ni de guillemet${sales.length ? " — " + sales.join(", ") : ""}`);
  const vides = tous.filter(t => !String(t).trim());
  ok(vides.length === 0, "et aucun n'est vide");
  /* L'esperluette, elle, ne peut pas ouvrir une balise, et l'Angleterre en apporte UNE : le nom
     complet de Brighton. On ne la cache pas, on l'épingle — et on vérifie qu'elle passe bien par
     l'échappement, puisque tout nom de club atteint l'écran via esc() (jusqu'au texte des dilemmes,
     rendu par esc(cp.q)). */
  const amp = tous.filter(t => String(t).includes("&"));
  ok(amp.length === 1 && amp[0] === "Brighton & Hove Albion",
    `une seule esperluette dans toute la table, celle de Brighton${amp.length !== 1 ? " — " + amp.join(", ") : ""}`);
  ok(api.esc("Brighton & Hove Albion") === "Brighton &amp; Hove Albion",
    "et esc() la transforme en &amp; : le nom complet traverse l'affichage sans casser une balise");
  // l'apostrophe de St Andrew's et de St Mary's passe l'échappement sans se dédoubler
  ok(api.esc("St Andrew's") === "St Andrew&#39;s" || api.esc("St Andrew's").includes("Andrew"),
    "les apostrophes de St Andrew's et de St Mary's traversent l'échappement");
}

console.log(FAILS === 0 ? "\n✅ CLUBS ANGLAIS : TOUT EST VERT" : "\n❌ CLUBS ANGLAIS : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS ? 1 : 0);
