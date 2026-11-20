/* Harnais de validation — SAISON DE DÉPART ITA 1992-93
   La troisième saison italienne, assemblée par la tâche planifiée le 20/11/2026 (relevé du jour, arrivées datées
   par les listes de transferts des clubs et les pages de détail de transfert de Transfermarkt). `harness-italie.cjs`
   tient le cadre ; ici, les FAITS :
   1) le plateau réel, à sa vraie taille (dix-huit clubs en Serie A) : le Milan champion, Brescia (match d'appui),
      Fiorentina, Ancona et Pescara relégués, Reggiana, Cremonese, Piacenza et Lecce promus,
   2) les sièges de 1992,
   3) les hommes : Signori meilleur buteur, R. Baggio et Balbo derrière lui, Papin sous son nom du jeu, Bierhoff
      meilleur buteur de Serie B,
   4) les arrivées et les corrections : Totti (Primavera), Tacchinardi forcé, Desideri à l'Inter, Campilongo et
      Soldà écartés, Desailly absent, Bresciani au Cagliari, les ailiers en attaque,
   5) l'âge suivi d'une saison italienne à l'autre, 6) une carrière de trois saisons
   Usage : node harness-ita9293.cjs                                                        */
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
  "SAISONS,STARS_ITA9192,STARS_D2_ITA9192,STARS_ITA9293,STARS_D2_ITA9293,D1_ITA9293,D2_ITA9293,SIEGES_ITA,CLASSEMENT_REEL," +
  "PRENOMS_VRAIS,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ITA-1992-93";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ITA9293)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ITA9293)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;
const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

console.log("1) Le plateau réel de 1992-93");
{
  dit(!!S && S.pays === "ITA" && S.an === 1992 && S.titre === "1992-93", "au registre : ITA, 1992, « 1992-93 »");
  dit(S.nom === "Parme triomphe à Wembley", "son nom : « " + S.nom + " »");
  dit(S.d1.length === 18 && api.tailleD1("ITA", 1992) === 18 && S.d2.length === 20, "la Serie A à dix-huit clubs, sa vraie taille, et la Serie B à vingt");
  dit(S.d1[0] === "MIL" && S.d1[1] === "INT" && S.d1[2] === "PAR", "le Milan champion, devant l'Inter et Parma");
  dit(JSON.stringify(S.d1.slice(13)) === JSON.stringify(["UDI", "BRS", "FIO", "ANC", "PES"]), "Brescia, battu par l'Udinese au match d'appui, Fiorentina, Ancona et Pescara, les quatre relégués, ferment l'élite");
  dit(JSON.stringify(S.d2.slice(0, 4)) === JSON.stringify(["REG", "CRM", "PIA", "LEC"]), "Reggiana, Cremonese, Piacenza et Lecce, les quatre promus, ouvrent la Serie B");
  dit(JSON.stringify(S.d2.slice(16)) === JSON.stringify(["SPA", "BGN", "TAR", "TER"]), "SPAL, Bologna, Taranto et Ternana, relégués, la ferment");
  dit(["BAI", "HEL", "CRM", "ASC"].every(c => S.d2.includes(c)), "Bari, Hellas Verona, Cremonese et Ascoli, descendus de Serie A, en Serie B");
  dit(["MZA", "AND", "SPA", "TER"].every(c => S.d2.includes(c)), "Monza, Fidelis Andria, SPAL et Ternana, montés de Serie C1, en Serie B");
  const R = api.CLASSEMENT_REEL[KEY];
  dit(!!R && R.d1 === S.d1.join(" ") && R.d2 === S.d2.join(" "), "le vrai classement (CLASSEMENT_REEL) est exactement le plateau, dans l'ordre");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ITA9293[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ITA9293[c].length, 0);
  dit(n1 === 360 && n2 === 360, "720 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 1992");
{
  const T = api.SIEGES_ITA[1992];
  dit(meme(S.euroC1, ["MIL"]) && meme(S.euroC2, ["PAR"]) && meme(S.euroC3, ["JUV", "TOR", "ROM", "NAP"]), "le Milan en C1, Parma en C2, Juventus, Torino, Roma et Napoli en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ITA[1992]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("G. Signori", "LAZ") && note("G. Signori")[3] === 81, "Signori, meilleur buteur avec vingt-six buts pour la Lazio : " + note("G. Signori")[3]);
  dit(au("R. Baggio", "JUV") && note("R. Baggio")[3] === 87 && note("R. Baggio")[2] === 25, "Roberto Baggio, vingt-cinq ans, deuxième buteur : " + note("R. Baggio")[3]);
  dit(au("A. Balbo", "UDI") && au("R. Sosa", "INT") && au("G. Batistuta", "FIO") && au("D. Fonseca", "NAP"), "Balbo, Sosa, Batistuta et Fonseca, les buteurs suivants");
  dit(au("M. van Basten", "MIL") && note("M. van Basten")[3] === 90, "Van Basten, Ballon d'or 1992 : " + note("M. van Basten")[3]);
  dit(au("J.-P. Papin", "MIL") && !PAR_NOM.has("J. Papin"), "Papin au Milan, sous le nom que le jeu lui donne à Marseille");
  dit(au("D. Savićević", "MIL") && au("G. Lentini", "MIL") && au("S. Eranio", "MIL"), "Savićević, Lentini et Eranio, les recrues du Milan");
  dit(au("G. Vialli", "JUV") && au("A. Möller", "JUV") && au("D. Platt", "JUV"), "Vialli, Möller et Platt à la Juventus");
  dit(au("P. Gascoigne", "LAZ") && au("F. Asprilla", "PAR") && au("G. Hagi", "BRS") && note("G. Hagi")[3] >= 80, "Gascoigne à la Lazio, Asprilla à Parma, Hagi au Brescia");
  dit(!PAR_NOM.has("D. Maradona") && !PAR_NOM.has("L. Matthäus"), "Maradona (Séville) et Matthäus (Bayern) ne jouent plus en Italie");
  dit(au("O. Bierhoff", "ASC") && note("O. Bierhoff")[3] >= 72 && au("A. De Vitis", "PIA") && au("A. Tentoni", "CRM"), "Bierhoff, meilleur buteur de Serie B, De Vitis et Tentoni derrière lui");
  dit(au("A. Del Piero", "PAD") && au("C. Vieri", "PIS") && au("C. Panucci", "GEN") && au("F. Cannavaro", "NAP"), "Del Piero à Padova, Vieri à Pisa, Panucci au Genoa, Cannavaro au Napoli");
  const tous = [].concat(...Object.values(api.STARS_ITA9293), ...Object.values(api.STARS_D2_ITA9293));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-ZÀ-ÝŁŠŽČ][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 720, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
  dit(![...PAR_NOM.keys()].some(n => /^[A-Z][a-z]+\. /.test(n)), "aucune forme courte à initiale de plusieurs lettres");
  dit(![...PAR_NOM.keys()].some(n => /[​-‏ ]|&#/.test(n)), "aucun caractère invisible ni entité HTML dans un nom");
}
console.log("\n4) Les arrivées et les corrections du relevé");
{
  dit(au("F. Totti", "ROM") && note("F. Totti")[2] === 16, "Totti, seize ans, à la Roma : sa « date d'arrivée » de janvier 1993 est sa montée de la Primavera");
  dit(au("A. Tacchinardi", "ATA") && note("A. Tacchinardi")[2] === 17, "Tacchinardi, dix-sept ans, forcé à l'Atalanta");
  dit(au("S. Desideri", "INT") && !au("S. Desideri", "UDI"), "Desideri à l'Inter, club du coup d'envoi (Udinese le 20 novembre)");
  dit(!PAR_NOM.has("S. Campilongo") && !PAR_NOM.has("R. Soldà"), "Campilongo (Venezia en octobre) et Soldà (Monza en octobre), arrivés en cours de saison, écartés");
  dit(!PAR_NOM.has("M. Desailly"), "Desailly, à Marseille en 1992-93, n'est pas au Milan malgré la page de saison");
  dit(au("G. Bresciani", "CAG") && !au("G. Bresciani", "NAP"), "Bresciani au Cagliari, club du coup d'envoi (Napoli à l'hiver)");
  dit(au("A. Madonna", "SPA") && au("P. Di Sarno", "UDI"), "Madonna à la SPAL et Di Sarno à l'Udinese, selon leurs pages de transfert");
  dit(note("A. Lombardo")[1] === "A" && note("J. van 't Schip")[1] === "A", "les ailiers Lombardo et van 't Schip en attaque, faute de quatre avant-centres");
}
console.log("\n5) D'une saison italienne à l'autre");
{
  const A = new Map(); for (const T of [api.STARS_ITA9192, api.STARS_D2_ITA9192]) for (const c in T) for (const t of T[c]) A.set(t[0], t);
  const ecarts = [...PAR_NOM.entries()].filter(([n, v]) => A.has(n) && v.t[2] - A.get(n)[2] !== 1).map(([n]) => n);
  dit(ecarts.length === 0, "un homme présent en 1991-92 a pris un an exactement" + (ecarts.length ? " — " + ecarts.slice(0, 6).join(", ") : ""));
  const communs = [...PAR_NOM.keys()].filter(n => A.has(n)).length;
  dit(communs >= 450, communs + " hommes déjà présents en 1991-92");
}

console.log("\n6) Une carrière italienne depuis 1992-93");
{
  api.nouvellePartie("PAR", KEY);
  const G = api.getG();
  dit(G.pays === "ITA" && G.saison === "1992-93" && api.anneeJeu() === 1992, "G.pays = ITA, « 1992-93 », 1992");
  dit(api.libDiv(1) === "Serie A", "l'élite s'appelle « Serie A »");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.getG().vire = null; api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 1995, "carrière rendue en 1995-96");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ITA 1992-93 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ITA 1992-93 : TOUT EST VERT");
