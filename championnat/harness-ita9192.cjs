/* Harnais de validation — SAISON DE DÉPART ITA 1991-92
   La deuxième saison italienne, assemblée par la tâche planifiée le 19/11/2026 (relevé du jour, arrivées
   recoupées par l'historique de transferts de Transfermarkt). `harness-italie.cjs` tient le cadre ; ici, les FAITS :
   1) le plateau réel, à sa vraie taille (dix-huit clubs en Serie A) : le Milan invaincu champion, Bari, Hellas Verona,
      Cremonese et Ascoli relégués, Brescia, Pescara, Ancona et Udinese promus, Casertana battue au match d'appui,
   2) les sièges de 1991 (Milan banni d'Europe, la Sampdoria seule en C1),
   3) les hommes : Van Basten meilleur buteur, R. Baggio et Baiano sur le podium, Ganz meilleur buteur de Serie B,
   4) les corrections du relevé : Porcù (Sampdoria) et Lemme (Parma) complétés hors de la page de saison, Paulo Silas
      et Careca Bianchesi, Buso en attaque, Cannavaro forcé, Conte à Lecce, Pagotto écarté,
   5) une carrière de trois saisons, et l'âge suivi d'une saison italienne à l'autre
   Usage : node harness-ita9192.cjs                                                        */
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
  "SAISONS,STARS_ITA9091,STARS_D2_ITA9091,STARS_ITA9192,STARS_D2_ITA9192,D1_ITA9192,D2_ITA9192,SIEGES_ITA,CLASSEMENT_REEL," +
  "PRENOMS_VRAIS,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ITA-1991-92";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());



const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ITA9192)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ITA9192)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;
const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

console.log("1) Le plateau réel de 1991-92");
{
  dit(!!S && S.pays === "ITA" && S.an === 1991 && S.titre === "1991-92", "au registre : ITA, 1991, « 1991-92 »");
  dit(S.nom === "Le Milan des invaincus", "son nom : « " + S.nom + " »");
  dit(S.d1.length === 18 && api.tailleD1("ITA", 1991) === 18 && S.d2.length === 20, "la Serie A à dix-huit clubs, sa vraie taille, et la Serie B à vingt");
  dit(S.d1[0] === "MIL" && S.d1[1] === "JUV" && S.d1[2] === "TOR", "le Milan champion, devant la Juventus et le Torino");
  dit(JSON.stringify(S.d1.slice(14)) === JSON.stringify(["BAI", "HEL", "CRM", "ASC"]), "Bari, Hellas Verona, Cremonese et Ascoli, les quatre relégués, ferment l'élite");
  dit(JSON.stringify(S.d2.slice(0, 4)) === JSON.stringify(["BRS", "PES", "ANC", "UDI"]), "Brescia, Pescara, Ancona et Udinese, les quatre promus, ouvrent la Serie B");
  dit(JSON.stringify(S.d2.slice(14, 17)) === JSON.stringify(["VEN", "TAR", "CAS"]), "Taranto devant Casertana, battue au match d'appui");
  dit(["PIA", "VEN", "CAS", "PAL"].every(c => S.d2.includes(c)), "Piacenza, Venezia, Casertana et Palermo, montés de Serie C1, en Serie B");
  const R = api.CLASSEMENT_REEL[KEY];
  dit(!!R && R.d1 === S.d1.join(" ") && R.d2 === S.d2.join(" "), "le vrai classement (CLASSEMENT_REEL) est exactement le plateau, dans l'ordre");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ITA9192[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ITA9192[c].length, 0);
  dit(n1 === 360 && n2 === 360, "720 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 1991");
{
  const T = api.SIEGES_ITA[1991];
  dit(meme(S.euroC1, ["SAM"]) && meme(S.euroC2, ["ROM"]) && meme(S.euroC3, ["TOR", "INT", "PAR", "GEN"]), "la Sampdoria en C1, la Roma en C2, Torino, Inter, Parma et Genoa en C3");
  dit(!S.euroC1.concat(S.euroC2, S.euroC3).includes("MIL"), "le Milan, banni pour un an, sans Europe");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ITA[1991]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("M. van Basten", "MIL") && note("M. van Basten")[3] === 90, "Van Basten, meilleur buteur avec vingt-cinq buts : " + note("M. van Basten")[3]);
  dit(au("F. Baresi", "MIL") && au("P. Maldini", "MIL") && au("R. Gullit", "MIL") && au("F. Rijkaard", "MIL") && au("D. Albertini", "MIL"), "Baresi, Maldini, Gullit, Rijkaard et Albertini au Milan");
  dit(au("R. Baggio", "JUV") && note("R. Baggio")[3] === 86 && note("R. Baggio")[2] === 24, "Roberto Baggio, vingt-quatre ans, deuxième buteur : " + note("R. Baggio")[3]);
  dit(au("F. Baiano", "FOG") && au("G. Signori", "FOG") && au("R. Rambaudi", "FOG"), "le trident de Zeman à Foggia, Baiano troisième buteur");
  dit(au("G. Batistuta", "FIO") && au("R. Sosa", "LAZ") && au("K. Riedle", "LAZ") && au("Careca", "NAP") && au("G. Zola", "NAP"), "Batistuta, Sosa, Riedle, Careca et Zola, les buteurs suivants");
  dit(!PAR_NOM.has("D. Maradona"), "Maradona, suspendu, n'est plus au Napoli");
  dit(au("L. Matthäus", "INT") && au("A. Brehme", "INT") && au("J. Klinsmann", "INT"), "les trois Allemands de l'Inter");
  dit(au("D. Platt", "BAI") && au("T. Häßler", "ROM") && au("R. Völler", "ROM"), "Platt à Bari, Häßler et Völler à la Roma");
  dit(au("M. Ganz", "BRS") && note("M. Ganz")[3] >= 74 && au("A. De Vitis", "PIA") && au("S. Campilongo", "CAS"), "Ganz, meilleur buteur de Serie B, De Vitis et Campilongo derrière lui");
  dit(au("A. Del Piero", "PAD") && au("F. Inzaghi", "PIA") && au("C. Vieri", "TOR") && au("C. Panucci", "GEN"), "Del Piero à Padova, Inzaghi à Piacenza, Vieri au Torino, Panucci au Genoa");
  const tous = [].concat(...Object.values(api.STARS_ITA9192), ...Object.values(api.STARS_D2_ITA9192));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-ZÀ-ÝŁŠŽČ][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 720, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
  dit(![...PAR_NOM.keys()].some(n => /^[A-Z][a-z]+\. /.test(n)), "aucune forme courte à initiale de plusieurs lettres");
  dit(![...PAR_NOM.keys()].some(n => /[​-‏ ]|&#/.test(n)), "aucun caractère invisible ni entité HTML dans un nom");
}
console.log("\n4) Les corrections du relevé");
{
  dit(au("S. Porcù", "SAM") && note("S. Porcù")[1] === "G", "Porcù, gardien de la Sampdoria jusqu'à sa retraite de 1992, complète un effectif de dix-neuf");
  dit(au("M. Lemme", "PAR"), "Mario Lemme, absent de la page de saison mais au club au coup d'envoi, complète Parma");
  dit(au("Paulo Silas", "SAM") && !au("Silas", "SAM"), "Paulo Silas à la Sampdoria (« Silas » est l'homme de Wolverhampton)");
  dit(PAR_NOM.has("Careca Bianchesi") && !PAR_NOM.has("C. Bianchesi"), "Careca Bianchesi garde son surnom entier");
  dit(note("R. Buso")[1] === "A" && au("R. Buso", "SAM"), "Buso en attaque à la Sampdoria");
  dit(au("F. Cannavaro", "NAP") && note("F. Cannavaro")[2] === 18, "Cannavaro, dix-huit ans, forcé au Napoli");
  dit(au("A. Conte", "LEC") && !au("A. Conte", "JUV"), "Antonio Conte à Lecce, club du coup d'envoi (Juventus en novembre)");
  dit(!PAR_NOM.has("A. Pagotto"), "Pagotto, arrivé au Napoli à l'été 1992 selon son historique, écarté");
  dit(au("F. Ravanelli", "REG"), "Ravanelli à la Reggiana");
}
console.log("\n5) D'une saison italienne à l'autre");
{
  const A = new Map(); for (const T of [api.STARS_ITA9091, api.STARS_D2_ITA9091]) for (const c in T) for (const t of T[c]) A.set(t[0], t);
  const ecarts = [...PAR_NOM.entries()].filter(([n, v]) => A.has(n) && v.t[2] - A.get(n)[2] !== 1).map(([n]) => n);
  dit(ecarts.length === 0, "un homme présent en 1990-91 a pris un an exactement" + (ecarts.length ? " — " + ecarts.slice(0, 6).join(", ") : ""));
  const communs = [...PAR_NOM.keys()].filter(n => A.has(n)).length;
  dit(communs >= 450, communs + " hommes déjà présents en 1990-91");
}

console.log("\n6) Une carrière italienne depuis 1991-92");
{
  api.nouvellePartie("MIL", KEY);
  const G = api.getG();
  dit(G.pays === "ITA" && G.saison === "1991-92" && api.anneeJeu() === 1991, "G.pays = ITA, « 1991-92 », 1991");
  dit(api.libDiv(1) === "Serie A", "l'élite s'appelle « Serie A »");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.getG().vire = null; api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 1994, "carrière rendue en 1994-95");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ITA 1991-92 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ITA 1991-92 : TOUT EST VERT");
