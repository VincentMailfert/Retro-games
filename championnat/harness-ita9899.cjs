/* Harnais de validation — SAISON DE DÉPART ITA 1998-99
   La neuvième saison italienne, assemblée par la tâche planifiée le 26/11/2026 (relevé du jour, arrivées datées
   par l'historique de transferts de Transfermarkt au coup d'envoi de chaque division, le 12 septembre 1998 en
   Serie A et le 6 en Serie B, recoupées par les pages Wikipédia italiennes de saison des clubs).
   `harness-italie.cjs` tient le cadre ; ici, les FAITS :
   1) le plateau réel, à sa vraie taille (dix-huit clubs en Serie A) : le Milan champion devant la Lazio et la
      Fiorentina, Salernitana, Sampdoria, Vicenza et Empoli (pénalisé de deux points) relégués, Hellas Verona,
      Torino, Lecce et Reggina promus,
   2) les sièges de 1998,
   3) les hommes : Zidane, Ballon d'or 1998, à la Juventus ; Ronaldo et R. Baggio à l'Inter ; Bierhoff, Weah et le
      jeune Abbiati au Milan ; Vieri et Salas à la Lazio ; Amoroso meilleur buteur ; Ferrante en Serie B,
   4) les arrivées et les arbitrages du relevé : Henry, Morfeo, Gattuso et Recoba arrivés après le coup d'envoi ;
      Zamboni à Lecce toute la saison ; Morrone à Cosenza et non à Empoli ; Leonardo, Paulo Sérgio, Piovani,
      Francioso, Fabris et Vecchiola en attaque ; les deux Tedesco de la Salernitana,
   5) l'âge suivi d'une saison italienne à l'autre, 6) une carrière de trois saisons
   Usage : node harness-ita9899.cjs                                                        */
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
  "SAISONS,STARS_ITA9798,STARS_D2_ITA9798,STARS_ITA9899,STARS_D2_ITA9899,D1_ITA9899,D2_ITA9899,SIEGES_ITA,CLASSEMENT_REEL," +
  "PRENOMS_VRAIS,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ITA-1998-99";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ITA9899)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ITA9899)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;
const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

console.log("1) Le plateau réel de 1998-99");
{
  dit(!!S && S.pays === "ITA" && S.an === 1998 && S.titre === "1998-99", "au registre : ITA, 1998, « 1998-99 »");
  dit(S.nom === "Zaccheroni coiffe la Lazio", "son nom : « " + S.nom + " »");
  dit(S.d1.length === 18 && api.tailleD1("ITA", 1998) === 18 && S.d2.length === 20, "la Serie A à dix-huit clubs, sa vraie taille, et la Serie B à vingt");
  dit(JSON.stringify(S.d1.slice(0, 4)) === JSON.stringify(["MIL", "LAZ", "FIO", "PAR"]), "le Milan champion, devant la Lazio, la Fiorentina et Parma");
  dit(JSON.stringify(S.d1.slice(4, 8)) === JSON.stringify(["ROM", "UDI", "JUV", "INT"]), "Roma, Udinese, puis la Juventus septième et l'Inter huitième");
  dit(JSON.stringify(S.d1.slice(14)) === JSON.stringify(["SAL", "SAM", "VIC", "EMP"]), "Salernitana, Sampdoria, Vicenza et Empoli, les quatre relégués, ferment l'élite");
  dit(JSON.stringify(S.d2.slice(0, 4)) === JSON.stringify(["HEL", "TOR", "LEC", "RGC"]), "Hellas Verona, Torino, Lecce et Reggina, les quatre promus, ouvrent la Serie B");
  dit(JSON.stringify(S.d2.slice(16)) === JSON.stringify(["REG", "AND", "LUC", "CRM"]), "Reggiana, Fidelis Andria, Lucchese et Cremonese, relégués, la ferment");
  dit(S.d2[8] === "RAV" && S.d2[9] === "NAP", "l'ordre de la Wikipédia anglaise : Ravenna devant Napoli à égalité de points");
  dit(["SAL", "VEN", "CAG", "PRG"].every(c => S.d1.includes(c)) && ["BRS", "ATA", "LEC", "NAP"].every(c => S.d2.includes(c)), "Salernitana, Venezia, Cagliari et Perugia, promus en 1998, en Serie A ; Brescia, Atalanta, Lecce et Napoli en Serie B");
  dit(["CES", "TER", "COS", "CRM"].every(c => S.d2.includes(c) && !api.SAISONS["ITA-1997-98"].d1.concat(api.SAISONS["ITA-1997-98"].d2).includes(c)), "Cesena, Ternana, Cosenza et Cremonese, absents en 1997-98, en Serie B");
  const R = api.CLASSEMENT_REEL[KEY];
  dit(!!R && R.d1 === S.d1.join(" ") && R.d2 === S.d2.join(" "), "le vrai classement (CLASSEMENT_REEL) est exactement le plateau, dans l'ordre");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ITA9899[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ITA9899[c].length, 0);
  dit(n1 === 360 && n2 === 360, "720 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 1998");
{
  const T = api.SIEGES_ITA[1998];
  dit(meme(S.euroC1, ["JUV", "INT"]) && meme(S.euroC2, ["LAZ"]) && meme(S.euroC3, ["UDI", "ROM", "FIO", "PAR", "BGN"]), "la Juventus et l'Inter en C1, la Lazio en C2, Udinese, Roma, Fiorentina, Parma et Bologna en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ITA[1998]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("Z. Zidane", "JUV") && note("Z. Zidane")[3] === 90 && au("A. Del Piero", "JUV") && au("E. Davids", "JUV") && note("E. Davids")[3] === 83, "Zidane, Ballon d'or 1998 (" + note("Z. Zidane")[3] + "), Del Piero et Davids à la Juventus");
  dit(au("Ronaldo", "INT") && note("Ronaldo")[3] === 90 && note("Ronaldo")[2] === 22 && au("R. Baggio", "INT") && au("A. Pirlo", "INT") && note("A. Pirlo")[2] === 19, "Ronaldo, Roberto Baggio et Pirlo, dix-neuf ans, à l'Inter");
  dit(au("O. Bierhoff", "MIL") && note("O. Bierhoff")[3] === 83 && au("G. Weah", "MIL") && au("P. Maldini", "MIL") && au("T. Helveg", "MIL"), "Bierhoff (83), Helveg, Weah et Maldini au Milan");
  dit(au("C. Abbiati", "MIL") && note("C. Abbiati")[2] === 21 && note("C. Abbiati")[3] === 71, "Abbiati, vingt et un ans, gardien du Milan champion (71)");
  dit(au("C. Vieri", "LAZ") && au("M. Salas", "LAZ") && au("A. Nesta", "LAZ") && au("R. Mancini", "LAZ"), "Vieri, Salas, Nesta et Mancini à la Lazio");
  dit(au("M. Amoroso", "UDI") && note("M. Amoroso")[3] === 83, "Márcio Amoroso, meilleur buteur avec vingt-deux buts, à l'Udinese (83)");
  dit(au("G. Batistuta", "FIO") && note("G. Batistuta")[3] === 87 && au("L. Thuram", "PAR") && note("L. Thuram")[3] === 84 && au("H. Crespo", "PAR") && au("G. Buffon", "PAR") && note("G. Buffon")[2] === 20, "Batistuta (87), Thuram (84), Crespo et Buffon, vingt ans");
  dit(au("F. Totti", "ROM") && au("G. Signori", "BGN") && au("G. Zambrotta", "BAI"), "Totti à la Roma, Signori à Bologna, Zambrotta à Bari");
  dit(au("M. Ferrante", "TOR") && note("M. Ferrante")[3] === 75 && au("D. Hübner", "BRS") && au("N. Caccia", "ATA"), "Ferrante, meilleur buteur de Serie B, puis Hübner et Caccia");
  const tous = [].concat(...Object.values(api.STARS_ITA9899), ...Object.values(api.STARS_D2_ITA9899));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-ZÀ-ÝŁŠŽČ][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 720, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
  dit(![...PAR_NOM.keys()].some(n => /^[A-Z][a-z]+\. /.test(n)), "aucune forme courte à initiale de plusieurs lettres");
  dit(![...PAR_NOM.keys()].some(n => /[\u200b-\u200f\u00a0]|&#/.test(n)), "aucun caractère invisible ni entité HTML dans un nom");
}
console.log("\n4) Les arrivées et les arbitrages du relevé");
{
  dit(!PAR_NOM.has("T. Henry") && !PAR_NOM.has("D. Morfeo") && !PAR_NOM.has("G. Gattuso") && !PAR_NOM.has("Á. Recoba"), "Henry (18 janvier), Morfeo (22 octobre), Gattuso et Recoba, arrivés après le coup d'envoi, écartés");
  dit(au("M. Zamboni", "LEC"), "Zamboni à Lecce : quarante-deux matchs, la note « acquistato » d'automne ne le concerne pas");
  dit(au("S. Morrone", "COS"), "Morrone à Cosenza, où il joue avant de partir à Empoli en automne");
  dit(au("S. Fresi", "SAL") && au("J. Bachini", "UDI") && au("D. Godeas", "UDI") && au("M. Rampulla", "JUV"), "Fresi à la Salernitana (transfert du 1er septembre), Bachini et Godeas à l'Udinese, Rampulla à la Juventus");
  dit(["Leonardo", "MIL", "Paulo Sérgio", "ROM", "G. Piovani", "PIA", "C. Francioso", "GEN", "F. Fabris", "TER", "S. Vecchiola", "GEN"].every((x, i, a) => i % 2 || (au(x, a[i + 1]) && note(x)[1] === "A")), "Leonardo, Paulo Sérgio, Piovani, Francioso, Fabris et Vecchiola en attaque");
  dit(au("G. Tedesco", "SAL") && au("Giacomo Tedesco", "SAL") && note("G. Tedesco")[2] === 26, "les deux Tedesco à la Salernitana, Giovanni (« G. Tedesco ») et Giacomo");
}
console.log("\n5) D'une saison italienne à l'autre");
{
  const A = new Map(); for (const T of [api.STARS_ITA9798, api.STARS_D2_ITA9798]) for (const c in T) for (const t of T[c]) A.set(t[0], t);
  const ecarts = [...PAR_NOM.entries()].filter(([n, v]) => A.has(n) && v.t[2] - A.get(n)[2] !== 1).map(([n]) => n);
  dit(ecarts.length === 0, "un homme présent en 1997-98 a pris un an exactement" + (ecarts.length ? " — " + ecarts.slice(0, 6).join(", ") : ""));
  const communs = [...PAR_NOM.keys()].filter(n => A.has(n)).length;
  dit(communs >= 450, communs + " hommes déjà présents en 1997-98");
}

console.log("\n6) Une carrière italienne depuis 1998-99");
{
  api.nouvellePartie("MIL", KEY);
  const G = api.getG();
  dit(G.pays === "ITA" && G.saison === "1998-99" && api.anneeJeu() === 1998, "G.pays = ITA, « 1998-99 », 1998");
  dit(api.libDiv(1) === "Serie A", "l'élite s'appelle « Serie A »");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.getG().vire = null; api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 2001, "carrière rendue en 2001-02");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ITA 1998-99 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ITA 1998-99 : TOUT EST VERT");
