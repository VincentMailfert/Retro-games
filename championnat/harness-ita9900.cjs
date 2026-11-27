/* Harnais de validation — SAISON DE DÉPART ITA 1999-00
   La dixième saison italienne, assemblée par la tâche planifiée le 27/11/2026 (relevé du jour, arrivées datées
   par l'historique de transferts de Transfermarkt au coup d'envoi de chaque division, le 28 août 1999 en Serie A
   et le 29 en Serie B, recoupées par les pages Wikipédia italiennes de saison des clubs).
   `harness-italie.cjs` tient le cadre ; ici, les FAITS :
   1) le plateau réel, à sa vraie taille (dix-huit clubs en Serie A) : la Lazio championne devant la Juventus, battue
      à Perugia sous la pluie, l'Inter quatrième devant Parma au match d'appui ; Torino, Venezia, Cagliari et Piacenza
      relégués ; Vicenza, Napoli, Atalanta et Brescia promus ; la Pistoiese, Alzano, Savoia et Fermana, montés de C1,
   2) les sièges de 1999,
   3) les hommes : Shevchenko, meilleur buteur, au Milan ; Zidane et Del Piero à la Juventus ; Ronaldo, Vieri,
      R. Baggio et Pirlo à l'Inter ; Verón, Nedvěd, Nesta et Simeone à la Lazio ; Batistuta, Crespo, Cassano, Frey,
   4) les arrivées et les arbitrages du relevé : Seedorf, Córdoba, Amoruso et Kennet Andersson arrivés après le
      coup d'envoi ; Hilário, Dani et Hugo de Bari sans nom libre ; Francioso, Tarantino, Kanyengele, Foglia, Rapaić
      et Osmanovski en attaque ; la Pistoiese à trois attaquants ; Gattuso sous la graphie du jeu,
   5) l'âge suivi d'une saison italienne à l'autre, 6) une carrière de trois saisons
   Usage : node harness-ita9900.cjs                                                        */
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
  "SAISONS,STARS_ITA9899,STARS_D2_ITA9899,STARS_ITA9900,STARS_D2_ITA9900,D1_ITA9900,D2_ITA9900,SIEGES_ITA,CLASSEMENT_REEL," +
  "PRENOMS_VRAIS,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ITA-1999-00";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ITA9900)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ITA9900)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;
const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

console.log("1) Le plateau réel de 1999-00");
{
  dit(!!S && S.pays === "ITA" && S.an === 1999 && S.titre === "1999-00", "au registre : ITA, 1999, « 1999-00 »");
  dit(S.nom === "Le déluge de Pérouse", "son nom : « " + S.nom + " »");
  dit(S.d1.length === 18 && api.tailleD1("ITA", 1999) === 18 && S.d2.length === 20, "la Serie A à dix-huit clubs, sa vraie taille, et la Serie B à vingt");
  dit(JSON.stringify(S.d1.slice(0, 5)) === JSON.stringify(["LAZ", "JUV", "MIL", "INT", "PAR"]), "la Lazio championne, devant la Juventus, le Milan, l'Inter (match d'appui) et Parma");
  dit(JSON.stringify(S.d1.slice(14)) === JSON.stringify(["TOR", "VEN", "CAG", "PIA"]), "Torino, Venezia, Cagliari et Piacenza, les quatre relégués, ferment l'élite");
  dit(JSON.stringify(S.d2.slice(0, 4)) === JSON.stringify(["VIC", "NAP", "ATA", "BRS"]), "Vicenza, Napoli, Atalanta et Brescia, les quatre promus, ouvrent la Serie B");
  dit(JSON.stringify(S.d2.slice(15)) === JSON.stringify(["PST", "CES", "ALZ", "SAV", "FRM"]), "la Pistoiese, sauvée au barrage, puis Cesena, Alzano, Savoia et Fermana, relégués");
  dit(["HEL", "TOR", "LEC", "RGC"].every(c => S.d1.includes(c)) && ["SAL", "SAM", "VIC", "EMP"].every(c => S.d2.includes(c)), "Hellas, Torino, Lecce et Reggina, promus en 1999, en Serie A ; Salernitana, Sampdoria, Vicenza et Empoli en Serie B");
  dit(["PST", "ALZ", "SAV", "FRM"].every(c => S.d2.includes(c) && !api.SAISONS["ITA-1998-99"].d1.concat(api.SAISONS["ITA-1998-99"].d2).includes(c)), "Pistoiese, Alzano, Savoia et Fermana, montés de C1, en Serie B");
  const R = api.CLASSEMENT_REEL[KEY];
  dit(!!R && R.d1 === S.d1.join(" ") && R.d2 === S.d2.join(" "), "le vrai classement (CLASSEMENT_REEL) est exactement le plateau, dans l'ordre");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ITA9900[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ITA9900[c].length, 0);
  dit(n1 === 360 && n2 === 360, "720 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 1999");
{
  const T = api.SIEGES_ITA[1999];
  dit(meme(S.euroC1, ["MIL", "LAZ", "FIO", "PAR"]) && S.euroC2.length === 0 && meme(S.euroC3, ["ROM", "UDI", "BGN", "JUV"]), "Milan, Lazio, Fiorentina et Parma en C1, plus de C2, Roma, Udinese, Bologna et Juventus en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ITA[1999]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("A. Shevchenko", "MIL") && note("A. Shevchenko")[3] === 88 && note("A. Shevchenko")[2] === 23 && au("P. Maldini", "MIL") && au("O. Bierhoff", "MIL") && au("G. Weah", "MIL"), "Shevchenko, vingt-trois ans, meilleur buteur (" + note("A. Shevchenko")[3] + "), Maldini, Bierhoff et Weah au Milan");
  dit(au("Z. Zidane", "JUV") && note("Z. Zidane")[3] === 90 && au("A. Del Piero", "JUV") && au("E. van der Sar", "JUV") && au("F. Inzaghi", "JUV"), "Zidane (90), Del Piero, Inzaghi et van der Sar, arrivé de l'Ajax, à la Juventus");
  dit(au("Ronaldo", "INT") && note("Ronaldo")[3] === 90 && au("C. Vieri", "INT") && note("C. Vieri")[3] === 86 && au("R. Baggio", "INT") && au("A. Pirlo", "INT") && note("A. Pirlo")[2] === 20, "Ronaldo, Vieri (86), Roberto Baggio et Pirlo, vingt ans, à l'Inter");
  dit(au("J. S. Verón", "LAZ") && au("P. Nedvěd", "LAZ") && au("D. Simeone", "LAZ") && au("A. Nesta", "LAZ") && note("A. Nesta")[3] === 81 && au("M. Salas", "LAZ") && au("R. Mancini", "LAZ"), "Verón, Nedvěd, Simeone, Nesta (81), Salas et Mancini à la Lazio championne");
  dit(au("G. Batistuta", "FIO") && note("G. Batistuta")[3] === 87 && au("H. Crespo", "PAR") && note("H. Crespo")[3] === 83 && au("G. Buffon", "PAR") && au("F. Totti", "ROM") && au("V. Montella", "ROM"), "Batistuta (87), Crespo (83), Buffon, Totti et Montella");
  dit(au("A. Cassano", "BAI") && note("A. Cassano")[2] === 17 && au("S. Frey", "HEL") && note("S. Frey")[2] === 19 && au("A. Gilardino", "PIA") && au("A. Calori", "PRG"), "Cassano, dix-sept ans, Frey, dix-neuf ans, Gilardino, et Calori, l'homme du dernier but");
  dit(au("C. Francioso", "GEN") && note("C. Francioso")[3] === 72 && au("D. Di Michele", "SAL") && au("S. Schwoch", "NAP") && au("G. Comandini", "VIC") && au("L. Toni", "TRV"), "Francioso, meilleur buteur de Serie B, Di Michele, Schwoch, Comandini et Toni");
  const tous = [].concat(...Object.values(api.STARS_ITA9900), ...Object.values(api.STARS_D2_ITA9900));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-ZÀ-ÝŁŠŽČ][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 720, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
  dit(![...PAR_NOM.keys()].some(n => /^[A-Z][a-z]+\. /.test(n)), "aucune forme courte à initiale de plusieurs lettres");
  dit(![...PAR_NOM.keys()].some(n => /[​-‏ ]|&#/.test(n)), "aucun caractère invisible ni entité HTML dans un nom");
}
console.log("\n4) Les arrivées et les arbitrages du relevé");
{
  dit(!PAR_NOM.has("C. Seedorf") && !PAR_NOM.has("I. Córdoba") && !PAR_NOM.has("N. Amoruso") && !PAR_NOM.has("K. Andersson") && !PAR_NOM.has("M. Carparelli"), "Seedorf et Córdoba (janvier), Amoruso (1er septembre), Kennet Andersson et Carparelli, arrivés après le coup d'envoi, écartés");
  dit(!PAR_NOM.has("Hilário") && !PAR_NOM.has("Dani") && !au("Hugo", "BAI"), "Hilário et Dani (Perugia) et Hugo (Bari), sans nom libre, écartés");
  dit(["C. Francioso", "GEN", "N. Tarantino", "EMP", "C. Kanyengele", "SAV", "F. Foglia", "PST", "M. Rapaic", "PRG", "Y. Osmanovski", "BAI"].every((x, i, a) => i % 2 || (au(x, a[i + 1]) && note(x)[1] === "A")), "Francioso, Tarantino, Kanyengele, Foglia, Rapaić et Osmanovski en attaque");
  dit(api.STARS_D2_ITA9900.PST.filter(t => t[1] === "A").length === 3, "la Pistoiese tolérée à trois attaquants, les autres arrivés en cours de saison");
  dit(au("G. Gattuso", "MIL") && !PAR_NOM.has("Gennaro Gattuso") && api.PRENOMS_VRAIS["G. Gattuso"] === "Gennaro", "Gattuso au Milan sous la graphie du jeu, « G. Gattuso » (Gennaro)");
  dit(au("M. Rampulla", "JUV") && au("J. Bachini", "JUV") && au("A. Melli", "PRG") && au("D. Gregori", "PES"), "Rampulla et Bachini à la Juventus, Melli à Perugia et Gregori à Pescara (rosa sans note, temps de jeu au club)");
  dit(au("Gianluca De Angelis", "PAR") && au("Alberto Colombo", "MZA") && au("F. Júnior", "ROM"), "Gianluca De Angelis et Alberto Colombo en toutes lettres, Fábio Júnior « F. Júnior »");
}
console.log("\n5) D'une saison italienne à l'autre");
{
  const A = new Map(); for (const T of [api.STARS_ITA9899, api.STARS_D2_ITA9899]) for (const c in T) for (const t of T[c]) A.set(t[0], t);
  const ecarts = [...PAR_NOM.entries()].filter(([n, v]) => A.has(n) && v.t[2] - A.get(n)[2] !== 1).map(([n]) => n);
  dit(ecarts.length === 0, "un homme présent en 1998-99 a pris un an exactement" + (ecarts.length ? " — " + ecarts.slice(0, 6).join(", ") : ""));
  const communs = [...PAR_NOM.keys()].filter(n => A.has(n)).length;
  dit(communs >= 450, communs + " hommes déjà présents en 1998-99");
}

console.log("\n6) Une carrière italienne depuis 1999-00");
{
  api.nouvellePartie("LAZ", KEY);
  const G = api.getG();
  dit(G.pays === "ITA" && G.saison === "1999-00" && api.anneeJeu() === 1999, "G.pays = ITA, « 1999-00 », 1999");
  dit(api.libDiv(1) === "Serie A", "l'élite s'appelle « Serie A »");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.getG().vire = null; api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 2002, "carrière rendue en 2002-03");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ITA 1999-00 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ITA 1999-00 : TOUT EST VERT");
