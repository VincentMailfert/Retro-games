/* Harnais de validation — SAISON DE DÉPART ITA 1994-95
   La cinquième saison italienne, assemblée par la tâche planifiée le 22/11/2026 (relevé du jour, arrivées datées
   par les listes de transferts des clubs et les pages de détail de transfert de Transfermarkt, recoupées par les
   pages Wikipédia italiennes de saison des clubs). `harness-italie.cjs` tient le cadre ; ici, les FAITS :
   1) le plateau réel, à sa vraie taille (dix-huit clubs en Serie A) : la Juventus championne, Genoa, Foggia,
      Reggiana et Brescia relégués (Genoa battu au barrage par Padova), Piacenza, Udinese, Vicenza et Atalanta promus,
   2) les sièges de 1994,
   3) les hommes : Batistuta meilleur buteur, Balbo, Zola, Rizzitelli derrière lui, Maldini troisième du Ballon d'or,
      Del Piero, Pisano meilleur buteur de Serie B,
   4) les arrivées et les corrections : Gullit au Milan au coup d'envoi, Orlando arrivé en automne, les corrections de
      Wikipédia (Rui Águas, Mozzini, Minaudo, Dionigi, Sartor, Luiso), les pépites Zanetti, Morfeo et Zambrotta,
   5) l'âge suivi d'une saison italienne à l'autre, 6) une carrière de trois saisons
   Usage : node harness-ita9495.cjs                                                        */
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
  "SAISONS,STARS_ITA9394,STARS_D2_ITA9394,STARS_ITA9495,STARS_D2_ITA9495,D1_ITA9495,D2_ITA9495,SIEGES_ITA,CLASSEMENT_REEL," +
  "PRENOMS_VRAIS,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ITA-1994-95";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ITA9495)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ITA9495)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;
const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

console.log("1) Le plateau réel de 1994-95");
{
  dit(!!S && S.pays === "ITA" && S.an === 1994 && S.titre === "1994-95", "au registre : ITA, 1994, « 1994-95 »");
  dit(S.nom === "La Vieille Dame se réveille", "son nom : « " + S.nom + " »");
  dit(S.d1.length === 18 && api.tailleD1("ITA", 1994) === 18 && S.d2.length === 20, "la Serie A à dix-huit clubs, sa vraie taille, et la Serie B à vingt");
  dit(S.d1[0] === "JUV" && S.d1[1] === "PAR" && S.d1[2] === "LAZ" && S.d1[3] === "MIL", "la Juventus championne, devant Parma, la Lazio et le Milan");
  dit(S.d1.indexOf("PAD") === 13 && S.d1.indexOf("GEN") === 14, "Padova sauvé au barrage, Genoa juste derrière");
  dit(JSON.stringify(S.d1.slice(14)) === JSON.stringify(["GEN", "FOG", "REG", "BRS"]), "Genoa, Foggia, Reggiana et Brescia, les quatre relégués, ferment l'élite");
  dit(JSON.stringify(S.d2.slice(0, 4)) === JSON.stringify(["PIA", "UDI", "VIC", "ATA"]), "Piacenza, Udinese, Vicenza et Atalanta, les quatre promus, ouvrent la Serie B");
  dit(JSON.stringify(S.d2.slice(16)) === JSON.stringify(["ACR", "ASC", "COM", "LEC"]), "Acireale, Ascoli, Como et Lecce, relégués, la ferment");
  dit(["FIO", "BAI", "BRS", "PAD"].every(c => S.d1.includes(c)), "Fiorentina, Bari, Brescia et Padova, promus en 1994, en Serie A");
  dit(["SAL", "PRG", "CHI", "COM"].every(c => S.d2.includes(c)) && S.d2.indexOf("CHI") === 13, "Salernitana, Perugia, Chievo et Como, montés de Serie C1, en Serie B ; le Chievo quatorzième");
  const R = api.CLASSEMENT_REEL[KEY];
  dit(!!R && R.d1 === S.d1.join(" ") && R.d2 === S.d2.join(" "), "le vrai classement (CLASSEMENT_REEL) est exactement le plateau, dans l'ordre");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ITA9495[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ITA9495[c].length, 0);
  dit(n1 === 360 && n2 === 360, "720 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 1994");
{
  const T = api.SIEGES_ITA[1994];
  dit(meme(S.euroC1, ["MIL"]) && meme(S.euroC2, ["SAM"]) && meme(S.euroC3, ["INT", "JUV", "LAZ", "PAR", "NAP"]), "le Milan en C1, la Sampdoria en C2, Inter, Juventus, Lazio, Parma et Napoli en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ITA[1994]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("G. Batistuta", "FIO") && note("G. Batistuta")[3] === 85, "Batistuta, meilleur buteur avec vingt-six buts : " + note("G. Batistuta")[3]);
  dit(au("A. Balbo", "ROM") && note("A. Balbo")[3] === 80 && au("G. Zola", "PAR") && note("G. Zola")[3] === 82, "Balbo (vingt-deux buts) et Zola (dix-neuf) derrière lui");
  dit(au("R. Rizzitelli", "TOR") && au("M. Simone", "MIL") && au("S. Tovalieri", "BAI") && au("G. Signori", "LAZ"), "Rizzitelli, Simone, Tovalieri et Signori, les buteurs suivants");
  dit(au("G. Vialli", "JUV") && au("F. Ravanelli", "JUV") && au("A. Del Piero", "JUV") && note("A. Del Piero")[3] === 78, "le trident de Lippi : Vialli, Ravanelli et Del Piero (" + note("A. Del Piero")[3] + ")");
  dit(au("P. Maldini", "MIL") && note("P. Maldini")[3] === 87 && au("R. Baggio", "JUV") && note("R. Baggio")[3] === 88, "Maldini (troisième du Ballon d'or 1994) et Roberto Baggio (deuxième)");
  dit(au("A. Peruzzi", "JUV") && note("A. Peruzzi")[3] === 80 && note("A. Peruzzi")[1] === "G", "Peruzzi, gardien de la Juventus championne : " + note("A. Peruzzi")[3]);
  dit(au("G. Pisano", "SAL") && note("G. Pisano")[3] === 71 && au("G. Cornacchini", "PRG"), "Pisano, meilleur buteur de Serie B, et Cornacchini derrière lui");
  dit(au("F. Inzaghi", "PIA") && au("C. Vieri", "VEN") && au("F. Totti", "ROM") && au("A. Nesta", "LAZ"), "Inzaghi à Piacenza, Vieri à Venezia, Totti à la Roma, Nesta à la Lazio");
  const tous = [].concat(...Object.values(api.STARS_ITA9495), ...Object.values(api.STARS_D2_ITA9495));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-ZÀ-ÝŁŠŽČ][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 720, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
  dit(![...PAR_NOM.keys()].some(n => /^[A-Z][a-z]+\. /.test(n)), "aucune forme courte à initiale de plusieurs lettres");
  dit(![...PAR_NOM.keys()].some(n => /[​-‏ ]|&#/.test(n)), "aucun caractère invisible ni entité HTML dans un nom");
}
console.log("\n4) Les arrivées et les corrections du relevé");
{
  dit(au("R. Gullit", "MIL") && au("A. Melli", "SAM"), "Gullit au Milan et Melli à la Sampdoria au coup d'envoi (échangés en novembre)");
  dit(!PAR_NOM.has("A. Orlando") || !au("A. Orlando", "JUV"), "Orlando, arrivé à la Juventus en automne, n'y est pas");
  dit(!PAR_NOM.has("R. Águas") && !PAR_NOM.has("Rui Águas") && !PAR_NOM.has("P. Mozzini") && !PAR_NOM.has("G. Minaudo"), "Rui Águas, Mozzini et Minaudo, arrivés en cours de saison selon Wikipédia, écartés");
  dit(au("D. Dionigi", "REG") && !au("L. Sartor", "VIC") && !au("P. Luiso", "PES"), "Dionigi à la Reggiana ; Sartor et Luiso, partis en cours de saison, ni à Vicenza ni à Pescara");
  dit(!PAR_NOM.has("J. Cadete") && !PAR_NOM.has("M. Padovano") && !PAR_NOM.has("I. Simutenkov"), "Cadete, Padovano et Simutenkov, arrivés en cours de saison, écartés");
  dit(au("C. Zanetti", "FIO") && au("D. Morfeo", "ATA") && au("G. Zambrotta", "COM") && note("G. Zambrotta")[2] === 17, "les pépites forcées : Zanetti, Morfeo et Zambrotta (dix-sept ans)");
  dit(au("Alberto Bernardi", "TOR") || au("A. Bernardi", "TOR"), "Alberto Bernardi (Torino) et Antonio Bernardi (Brescia), deux hommes distincts");
  dit(note("G. Lentini")[1] === "A" && note("A. Lombardo")[1] === "A", "les ailiers Lentini et Lombardo en attaque, faute de quatre avant-centres");
}
console.log("\n5) D'une saison italienne à l'autre");
{
  const A = new Map(); for (const T of [api.STARS_ITA9394, api.STARS_D2_ITA9394]) for (const c in T) for (const t of T[c]) A.set(t[0], t);
  const ecarts = [...PAR_NOM.entries()].filter(([n, v]) => A.has(n) && v.t[2] - A.get(n)[2] !== 1).map(([n]) => n);
  dit(ecarts.length === 0, "un homme présent en 1993-94 a pris un an exactement" + (ecarts.length ? " — " + ecarts.slice(0, 6).join(", ") : ""));
  const communs = [...PAR_NOM.keys()].filter(n => A.has(n)).length;
  dit(communs >= 450, communs + " hommes déjà présents en 1993-94");
}

console.log("\n6) Une carrière italienne depuis 1994-95");
{
  api.nouvellePartie("PAR", KEY);
  const G = api.getG();
  dit(G.pays === "ITA" && G.saison === "1994-95" && api.anneeJeu() === 1994, "G.pays = ITA, « 1994-95 », 1994");
  dit(api.libDiv(1) === "Serie A", "l'élite s'appelle « Serie A »");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.getG().vire = null; api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 1997, "carrière rendue en 1997-98");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ITA 1994-95 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ITA 1994-95 : TOUT EST VERT");
