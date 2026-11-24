/* Harnais de validation — SAISON DE DÉPART ITA 1996-97
   La septième saison italienne, assemblée par la tâche planifiée le 24/11/2026 (relevé du jour, arrivées datées
   par les listes de transferts des clubs et les pages de détail de transfert de Transfermarkt, recoupées par les
   pages Wikipédia italiennes de saison des clubs). `harness-italie.cjs` tient le cadre ; ici, les FAITS :
   1) le plateau réel, à sa vraie taille (dix-huit clubs en Serie A) : la Juventus championne, Cagliari, Perugia,
      Hellas Verona et Reggiana relégués, Brescia, Empoli, Lecce et Bari promus, Ravenna pénalisé de trois points,
   2) les sièges de 1996,
   3) les hommes : Del Piero (quatrième du Ballon d'or, but de Tokyo), Zidane, Vieri et Bokšić à la Juventus,
      Inzaghi meilleur buteur, Montella derrière lui, Dionigi meilleur buteur de Serie B, Pirlo à dix-sept ans,
   4) les arrivées et les corrections de Wikipédia : Tovalieri et Pedone à la Reggiana, Rocco à Perugia au coup
      d'envoi ; Ferrante, Longhi, Dimas, Stanić, Candela, Kanchelskis, Gattuso arrivés en cours de saison ;
      Reinaldo, innommable, remplacé par Ferrarese,
   5) l'âge suivi d'une saison italienne à l'autre, 6) une carrière de trois saisons
   Usage : node harness-ita9697.cjs                                                        */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,libDiv,tailleD1," +
  "SAISONS,STARS_ITA9596,STARS_D2_ITA9596,STARS_ITA9697,STARS_D2_ITA9697,D1_ITA9697,D2_ITA9697,SIEGES_ITA,CLASSEMENT_REEL," +
  "PRENOMS_VRAIS,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ITA-1996-97";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ITA9697)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ITA9697)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;
const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

console.log("1) Le plateau réel de 1996-97");
{
  dit(!!S && S.pays === "ITA" && S.an === 1996 && S.titre === "1996-97", "au registre : ITA, 1996, « 1996-97 »");
  dit(S.nom === "Del Piero à Tokyo", "son nom : « " + S.nom + " »");
  dit(S.d1.length === 18 && api.tailleD1("ITA", 1996) === 18 && S.d2.length === 20, "la Serie A à dix-huit clubs, sa vraie taille, et la Serie B à vingt");
  dit(S.d1[0] === "JUV" && S.d1[1] === "PAR" && S.d1[2] === "INT" && S.d1[3] === "LAZ", "la Juventus championne, devant Parma, l'Inter et la Lazio");
  dit(JSON.stringify(S.d1.slice(13)) === JSON.stringify(["PIA", "CAG", "PRG", "HEL", "REG"]), "Piacenza sauvé au barrage, puis Cagliari, Perugia, Hellas Verona et Reggiana, les quatre relégués, ferment l'élite");
  dit(JSON.stringify(S.d2.slice(0, 4)) === JSON.stringify(["BRS", "EMP", "LEC", "BAI"]), "Brescia, Empoli, Lecce et Bari, les quatre promus, ouvrent la Serie B");
  dit(JSON.stringify(S.d2.slice(16)) === JSON.stringify(["COS", "CES", "PAL", "CRM"]), "Cosenza, Cesena, Palermo et Cremonese, relégués, la ferment");
  dit(["BGN", "HEL", "PRG", "REG"].every(c => S.d1.includes(c)), "Bologna, Hellas Verona, Perugia et Reggiana, promus en 1996, en Serie A");
  dit(["BAI", "TOR", "CRM", "PAD"].every(c => S.d2.includes(c)) && ["EMP", "LEC", "CDS", "RAV"].every(c => S.d2.includes(c)), "Bari, Torino, Cremonese et Padova descendus ; Empoli, Lecce, Castel di Sangro et Ravenna montés de C1");
  dit(S.d2[7] === "RAV" && S.d2[6] === "CHI", "Ravenna huitième derrière le Chievo, malgré ses trois points de pénalité");
  const R = api.CLASSEMENT_REEL[KEY];
  dit(!!R && R.d1 === S.d1.join(" ") && R.d2 === S.d2.join(" "), "le vrai classement (CLASSEMENT_REEL) est exactement le plateau, dans l'ordre");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ITA9697[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ITA9697[c].length, 0);
  dit(n1 === 360 && n2 === 360, "720 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 1996");
{
  const T = api.SIEGES_ITA[1996];
  dit(meme(S.euroC1, ["MIL", "JUV"]) && meme(S.euroC2, ["FIO"]) && meme(S.euroC3, ["LAZ", "ROM", "PAR", "INT"]), "le Milan et la Juventus en C1, la Fiorentina en C2, Lazio, Roma, Parma et Inter en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ITA[1996]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("A. Del Piero", "JUV") && note("A. Del Piero")[3] === 86 && au("Z. Zidane", "JUV") && au("C. Vieri", "JUV") && au("A. Bokšić", "JUV"), "Del Piero (" + note("A. Del Piero")[3] + "), quatrième du Ballon d'or et buteur à Tokyo, avec Zidane, Vieri et Bokšić à la Juventus");
  dit(au("F. Inzaghi", "ATA") && note("F. Inzaghi")[3] === 81 && au("V. Montella", "SAM") && note("V. Montella")[3] === 79, "Inzaghi, meilleur buteur avec vingt-quatre buts, et Montella, vingt-deux");
  dit(au("A. Balbo", "ROM") && au("M. Negri", "PRG") && au("R. Mancini", "SAM") && au("Y. Djorkaeff", "INT"), "Balbo, Negri, Mancini et Djorkaeff, les buteurs suivants");
  dit(au("G. Weah", "MIL") && au("R. Baggio", "MIL") && au("P. Maldini", "MIL") && au("M. Desailly", "MIL"), "Weah, Baggio, Maldini et Desailly au Milan, onzième");
  dit(au("H. Crespo", "PAR") && au("L. Thuram", "PAR") && au("G. Buffon", "PAR") && note("G. Buffon")[2] === 18 && note("G. Buffon")[1] === "G", "Crespo, Thuram et Buffon, dix-huit ans, à Parma");
  dit(au("D. Dionigi", "RGC") && note("D. Dionigi")[3] === 72 && au("C. Bellucci", "VEN") && au("R. Cerbone", "CHI"), "Dionigi, meilleur buteur de Serie B, puis Bellucci et Cerbone");
  dit(au("A. Pirlo", "BRS") && note("A. Pirlo")[2] === 17 && note("A. Pirlo")[4] === 90, "Pirlo, dix-sept ans, à Brescia (potentiel 90)");
  dit(au("F. Totti", "ROM") && au("A. Nesta", "LAZ") && au("P. Nedvěd", "LAZ") && au("J. S. Verón", "SAM"), "Totti à la Roma, Nesta et Nedvěd à la Lazio, Verón à la Sampdoria");
  const tous = [].concat(...Object.values(api.STARS_ITA9697), ...Object.values(api.STARS_D2_ITA9697));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-ZÀ-ÝŁŠŽČ][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 720, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
  dit(![...PAR_NOM.keys()].some(n => /^[A-Z][a-z]+\. /.test(n)), "aucune forme courte à initiale de plusieurs lettres");
  dit(![...PAR_NOM.keys()].some(n => /[\u200b-\u200f\u00a0]|&#/.test(n)), "aucun caractère invisible ni entité HTML dans un nom");
}
console.log("\n4) Les arrivées et les corrections du relevé");
{
  dit(au("S. Tovalieri", "REG") && au("F. Pedone", "REG") && au("P. Rocco", "PRG"), "Tovalieri et Pedone à la Reggiana, Rocco à Perugia au coup d'envoi (partis en cours de saison selon Wikipédia)");
  dit(!PAR_NOM.has("M. Ferrante") && !PAR_NOM.has("D. Longhi") && !PAR_NOM.has("L. Castellazzi"), "Ferrante, Longhi et Castellazzi, arrivés en cours de saison selon Wikipédia, écartés");
  dit(!PAR_NOM.has("Dimas") && !PAR_NOM.has("M. Stanić") && !PAR_NOM.has("V. Candela") && !PAR_NOM.has("A. Kanchelskis") && !PAR_NOM.has("J. Blomqvist"), "Dimas, Stanić, Candela, Kanchelskis et Blomqvist, arrivés en hiver, écartés");
  dit(!PAR_NOM.has("G. Gattuso") && !PAR_NOM.has("M. Materazzi"), "Gattuso et Materazzi, arrivés à Perugia en cours de saison, écartés");
  dit(!au("Reinaldo", "HEL") && au("C. Ferrarese", "HEL") && note("J. Binotto")[1] === "A", "Reinaldo, innommable, remplacé à l'Hellas par Ferrarese ; l'ailier Binotto en attaque");
  dit(au("J. Bachini", "LEC"), "Bachini au Lecce, absent de la page d'effectif mais présent au temps de jeu");
}
console.log("\n5) D'une saison italienne à l'autre");
{
  const A = new Map(); for (const T of [api.STARS_ITA9596, api.STARS_D2_ITA9596]) for (const c in T) for (const t of T[c]) A.set(t[0], t);
  const ecarts = [...PAR_NOM.entries()].filter(([n, v]) => A.has(n) && v.t[2] - A.get(n)[2] !== 1).map(([n]) => n);
  dit(ecarts.length === 0, "un homme présent en 1995-96 a pris un an exactement" + (ecarts.length ? " — " + ecarts.slice(0, 6).join(", ") : ""));
  const communs = [...PAR_NOM.keys()].filter(n => A.has(n)).length;
  dit(communs >= 450, communs + " hommes déjà présents en 1995-96");
}

console.log("\n6) Une carrière italienne depuis 1996-97");
{
  api.nouvellePartie("VIC", KEY);
  const G = api.getG();
  dit(G.pays === "ITA" && G.saison === "1996-97" && api.anneeJeu() === 1996, "G.pays = ITA, « 1996-97 », 1996");
  dit(api.libDiv(1) === "Serie A", "l'élite s'appelle « Serie A »");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.getG().vire = null; api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 1999, "carrière rendue en 1999-00");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ITA 1996-97 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ITA 1996-97 : TOUT EST VERT");
