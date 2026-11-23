/* Harnais de validation — SAISON DE DÉPART ITA 1995-96
   La sixième saison italienne, assemblée par la tâche planifiée le 23/11/2026 (relevé du jour, arrivées datées
   par les listes de transferts des clubs et les pages de détail de transfert de Transfermarkt, recoupées par les
   pages Wikipédia italiennes de saison des clubs). `harness-italie.cjs` tient le cadre ; ici, les FAITS :
   1) le plateau réel, à sa vraie taille (dix-huit clubs en Serie A) : le Milan champion, Bari, Torino, Cremonese et
      Padova relégués, Bologna, Hellas Verona, Perugia et Reggiana promus,
   2) les sièges de 1995,
   3) les hommes : Weah, Ballon d'or 1995, et Baggio au Milan, Protti et Signori meilleurs buteurs, Del Piero
      quatrième du Ballon d'or, Hübner meilleur buteur de Serie B, Buffon à dix-sept ans,
   4) les arrivées et les corrections de Wikipédia : Branca à la Roma, Pistone et Briaschi à Vicenza, Delvecchio à
      l'Inter au coup d'envoi ; Pittana, Nava, Scarafoni, Sclosa, Ingesson, O'Neill, Aloisi arrivés en cours de saison,
   5) l'âge suivi d'une saison italienne à l'autre, 6) une carrière de trois saisons
   Usage : node harness-ita9596.cjs                                                        */
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
  "SAISONS,STARS_ITA9495,STARS_D2_ITA9495,STARS_ITA9596,STARS_D2_ITA9596,D1_ITA9596,D2_ITA9596,SIEGES_ITA,CLASSEMENT_REEL," +
  "PRENOMS_VRAIS,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ITA-1995-96";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ITA9596)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ITA9596)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;
const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

console.log("1) Le plateau réel de 1995-96");
{
  dit(!!S && S.pays === "ITA" && S.an === 1995 && S.titre === "1995-96", "au registre : ITA, 1995, « 1995-96 »");
  dit(S.nom === "Le Libérien de San Siro", "son nom : « " + S.nom + " »");
  dit(S.d1.length === 18 && api.tailleD1("ITA", 1995) === 18 && S.d2.length === 20, "la Serie A à dix-huit clubs, sa vraie taille, et la Serie B à vingt");
  dit(S.d1[0] === "MIL" && S.d1[1] === "JUV" && S.d1[2] === "LAZ" && S.d1[3] === "FIO", "le Milan champion, devant la Juventus, la Lazio et la Fiorentina");
  dit(JSON.stringify(S.d1.slice(14)) === JSON.stringify(["BAI", "TOR", "CRM", "PAD"]), "Bari, Torino, Cremonese et Padova, les quatre relégués, ferment l'élite");
  dit(JSON.stringify(S.d2.slice(0, 4)) === JSON.stringify(["BGN", "HEL", "PRG", "REG"]), "Bologna, Hellas Verona, Perugia et Reggiana, les quatre promus, ouvrent la Serie B");
  dit(JSON.stringify(S.d2.slice(16)) === JSON.stringify(["AND", "AVE", "ANC", "PST"]), "Fidelis Andria, Avellino, Ancona et Pistoiese, relégués, la ferment");
  dit(["PIA", "UDI", "VIC", "ATA"].every(c => S.d1.includes(c)), "Piacenza, Udinese, Vicenza et Atalanta, promus en 1995, en Serie A");
  dit(["GEN", "FOG", "REG", "BRS"].every(c => S.d2.includes(c)) && ["AVE", "PST", "RGC"].every(c => S.d2.includes(c)), "Genoa, Foggia, Reggiana et Brescia descendus ; Avellino, Pistoiese et Reggina montés de C1");
  const R = api.CLASSEMENT_REEL[KEY];
  dit(!!R && R.d1 === S.d1.join(" ") && R.d2 === S.d2.join(" "), "le vrai classement (CLASSEMENT_REEL) est exactement le plateau, dans l'ordre");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ITA9596[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ITA9596[c].length, 0);
  dit(n1 === 360 && n2 === 360, "720 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 1995");
{
  const T = api.SIEGES_ITA[1995];
  dit(meme(S.euroC1, ["JUV"]) && meme(S.euroC2, ["PAR"]) && meme(S.euroC3, ["LAZ", "MIL", "ROM", "INT"]), "la Juventus en C1, Parma en C2, Lazio, Milan, Roma et Inter en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ITA[1995]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("G. Weah", "MIL") && note("G. Weah")[3] === 89 && au("R. Baggio", "MIL"), "Weah, Ballon d'or 1995 (" + note("G. Weah")[3] + "), et Roberto Baggio au Milan");
  dit(au("I. Protti", "BAI") && note("I. Protti")[3] === 77 && au("G. Signori", "LAZ") && note("G. Signori")[3] === 84, "Protti et Signori, meilleurs buteurs avec vingt-quatre buts");
  dit(au("E. Chiesa", "SAM") && au("G. Batistuta", "FIO") && au("O. Bierhoff", "UDI") && au("L. Oliveira", "CAG"), "Chiesa, Batistuta, Bierhoff et Oliveira, les buteurs suivants");
  dit(au("A. Del Piero", "JUV") && note("A. Del Piero")[3] === 84 && au("G. Zola", "PAR") && au("P. Maldini", "MIL"), "Del Piero (quatrième du Ballon d'or), Zola et Maldini");
  dit(au("H. Stoichkov", "PAR") && au("F. Inzaghi", "PAR") && au("C. Vieri", "ATA") && au("R. Carlos", "INT") && au("P. Ince", "INT"), "Stoichkov et Inzaghi à Parma, Vieri à l'Atalanta, Roberto Carlos et Ince à l'Inter");
  dit(au("G. Buffon", "PAR") && note("G. Buffon")[2] === 17 && note("G. Buffon")[1] === "G", "Buffon, dix-sept ans, gardien de Parma");
  dit(au("D. Hübner", "CES") && note("D. Hübner")[3] === 72 && au("V. Montella", "GEN"), "Hübner, meilleur buteur de Serie B, et Montella derrière lui");
  dit(au("F. Totti", "ROM") && au("A. Nesta", "LAZ") && au("C. Seedorf", "SAM"), "Totti à la Roma, Nesta à la Lazio, Seedorf à la Sampdoria");
  const tous = [].concat(...Object.values(api.STARS_ITA9596), ...Object.values(api.STARS_D2_ITA9596));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-ZÀ-ÝŁŠŽČ][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 720, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
  dit(![...PAR_NOM.keys()].some(n => /^[A-Z][a-z]+\. /.test(n)), "aucune forme courte à initiale de plusieurs lettres");
  dit(![...PAR_NOM.keys()].some(n => /[​-‏ ]|&#/.test(n)), "aucun caractère invisible ni entité HTML dans un nom");
}
console.log("\n4) Les arrivées et les corrections du relevé");
{
  dit(au("M. Branca", "ROM") && au("A. Pistone", "VIC") && au("A. Briaschi", "VIC"), "Branca à la Roma, Pistone et Briaschi à Vicenza au coup d'envoi (partis à l'automne selon Wikipédia)");
  dit(au("M. Delvecchio", "INT"), "Delvecchio à l'Inter au coup d'envoi, avant de partir à la Roma");
  dit(!PAR_NOM.has("W. Pittana") && !PAR_NOM.has("S. Nava") && !PAR_NOM.has("L. Scarafoni") && !PAR_NOM.has("C. Sclosa"), "Pittana, Nava, Scarafoni et Sclosa, arrivés en cours de saison selon Wikipédia, écartés");
  dit(!PAR_NOM.has("K. Ingesson") && !PAR_NOM.has("F. O'Neill") && !PAR_NOM.has("J. Aloisi") && !au("F. Mancini", "LAZ"), "Ingesson, O'Neill, Aloisi et Mancini (Lazio), arrivés en cours de saison, écartés");
  dit(au("E. Nicolini", "CRM") && au("J. Pirri", "CRM") && au("E. Verolino", "NAP"), "Nicolini et Pirri à la Cremonese, Verolino à Napoli, comme le disent les rosas Wikipédia");
  dit(au("C. Zanetti", "FIO") && note("C. Zanetti")[2] === 18, "la pépite forcée : Cristiano Zanetti (dix-huit ans)");
  dit(note("G. Piovani")[1] === "A" && note("J. Pirri")[1] === "A", "l'ailier Piovani et Pirri en attaque, faute de quatre avant-centres");
}
console.log("\n5) D'une saison italienne à l'autre");
{
  const A = new Map(); for (const T of [api.STARS_ITA9495, api.STARS_D2_ITA9495]) for (const c in T) for (const t of T[c]) A.set(t[0], t);
  const ecarts = [...PAR_NOM.entries()].filter(([n, v]) => A.has(n) && v.t[2] - A.get(n)[2] !== 1).map(([n]) => n);
  dit(ecarts.length === 0, "un homme présent en 1994-95 a pris un an exactement" + (ecarts.length ? " — " + ecarts.slice(0, 6).join(", ") : ""));
  const communs = [...PAR_NOM.keys()].filter(n => A.has(n)).length;
  dit(communs >= 450, communs + " hommes déjà présents en 1994-95");
}

console.log("\n6) Une carrière italienne depuis 1995-96");
{
  api.nouvellePartie("FIO", KEY);
  const G = api.getG();
  dit(G.pays === "ITA" && G.saison === "1995-96" && api.anneeJeu() === 1995, "G.pays = ITA, « 1995-96 », 1995");
  dit(api.libDiv(1) === "Serie A", "l'élite s'appelle « Serie A »");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.getG().vire = null; api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 1998, "carrière rendue en 1998-99");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ITA 1995-96 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ITA 1995-96 : TOUT EST VERT");
