/* Harnais de validation — SAISON DE DÉPART ITA 1990-91
   La PREMIÈRE saison italienne, assemblée par la tâche planifiée sans accès à Transfermarkt (le relevé brut datait
   du 15/11/2026). `harness-italie.cjs` tient le cadre ; ici, les FAITS :
   1) le plateau réel, à sa vraie taille (dix-huit clubs en Serie A, décision de l'auteur v3.00) : la Sampdoria
      championne, Lecce, Pisa, Cesena et Bologna relégués, Foggia, Hellas Verona, Cremonese et Ascoli promus,
   2) les sièges de 1990 (Milan banni l'année suivante seulement : il joue encore la C1 1990-91),
   3) les hommes : Vialli meilleur buteur, Matthäus Ballon d'or 1990, Schillaci et Brehme sur le podium,
      les trois co-meilleurs buteurs de Serie B (Baiano, Balbo, Casagrande),
   4) les corrections du relevé : Júnior sans nom libre remplacé par Atzori, Angelo Calisti (né en 1948 selon la
      source) retiré, les homonymes (deux Ciro Ferrara, deux A. Orlando, deux A. Bianchi…), Ravanelli à Avellino,
   5) une carrière de trois saisons
   Usage : node harness-ita9091.cjs                                                        */
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
  "SAISONS,STARS_ITA9091,STARS_D2_ITA9091,D1_ITA9091,D2_ITA9091,SIEGES_ITA,CLASSEMENT_REEL," +
  "PRENOMS_VRAIS,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ITA-1990-91";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ITA9091)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ITA9091)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;
const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

console.log("1) Le plateau réel de 1990-91");
{
  dit(!!S && S.pays === "ITA" && S.an === 1990 && S.titre === "1990-91", "au registre : ITA, 1990, « 1990-91 »");
  dit(S.nom === "Le scudetto de Boskov", "son nom : « " + S.nom + " »");
  dit(S.d1.length === 18 && api.tailleD1("ITA", 1990) === 18 && S.d2.length === 20, "la Serie A à dix-huit clubs, sa vraie taille, et la Serie B à vingt");
  dit(S.d1[0] === "SAM" && S.d1[1] === "MIL" && S.d1[2] === "INT", "la Sampdoria championne, devant le Milan et l'Inter");
  dit(JSON.stringify(S.d1.slice(14)) === JSON.stringify(["LEC", "PIS", "CES", "BGN"]), "Lecce, Pisa, Cesena et Bologna, les quatre relégués, ferment l'élite");
  dit(JSON.stringify(S.d2.slice(0, 4)) === JSON.stringify(["FOG", "HEL", "CRM", "ASC"]), "Foggia, Hellas Verona, Cremonese et Ascoli, les quatre promus, ouvrent la Serie B");
  dit(S.d2.includes("UDI") && !S.d1.includes("UDI"), "l'Udinese en Serie B (cinq points de pénalité)");
  dit(!S.d1.concat(S.d2).some(c => ["MZA", "COM"].includes(c)), "aucun repêché : ni Monza ni Como au plateau");
  const R = api.CLASSEMENT_REEL[KEY];
  dit(!!R && R.d1 === S.d1.join(" ") && R.d2 === S.d2.join(" "), "le vrai classement (CLASSEMENT_REEL) est exactement le plateau, dans l'ordre");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ITA9091[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ITA9091[c].length, 0);
  dit(n1 === 360 && n2 === 360, "720 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 1990");
{
  const T = api.SIEGES_ITA[1990];
  dit(meme(S.euroC1, ["NAP", "MIL"]) && meme(S.euroC2, ["SAM", "JUV"]) && meme(S.euroC3, ["INT", "ROM", "ATA", "BGN"]), "Napoli et Milan en C1, Sampdoria et Juventus en C2, Inter, Roma, Atalanta et Bologna en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ITA[1990]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("G. Vialli", "SAM") && note("G. Vialli")[3] >= 85 && note("G. Vialli")[1] === "A", "Vialli, meilleur buteur de Serie A avec dix-neuf buts : " + note("G. Vialli")[3]);
  dit(au("R. Mancini", "SAM") && au("G. Pagliuca", "SAM") && au("P. Vierchowod", "SAM") && au("Toninho Cerezo", "SAM"), "Mancini, Pagliuca, Vierchowod et Toninho Cerezo à la Sampdoria");
  dit(au("L. Matthäus", "INT") && note("L. Matthäus")[3] === 89, "Matthäus, Ballon d'or 1990, à l'Inter : " + note("L. Matthäus")[3]);
  dit(au("A. Brehme", "INT") && au("J. Klinsmann", "INT") && au("S. Schillaci", "JUV") && note("S. Schillaci")[3] >= 81, "Brehme et Klinsmann à l'Inter, Schillaci (deuxième du Ballon d'or) à la Juventus");
  dit(au("M. van Basten", "MIL") && au("R. Gullit", "MIL") && au("F. Rijkaard", "MIL") && au("F. Baresi", "MIL") && au("P. Maldini", "MIL"), "Van Basten, Gullit, Rijkaard, Baresi et Maldini au Milan");
  dit(au("D. Maradona", "NAP") && au("Careca", "NAP") && au("G. Zola", "NAP"), "Maradona, Careca et Zola au Napoli");
  dit(au("R. Baggio", "JUV") && note("R. Baggio")[2] === 23, "Roberto Baggio, vingt-trois ans, à la Juventus");
  dit(au("F. Baiano", "FOG") && au("A. Balbo", "UDI") && au("Casagrande", "ASC") && note("F. Baiano")[1] === "A", "Baiano, Balbo et Casagrande, co-meilleurs buteurs de Serie B");
  dit(au("G. Signori", "FOG") && au("R. Rambaudi", "FOG"), "le trident de Zeman à Foggia");
  const tous = [].concat(...Object.values(api.STARS_ITA9091), ...Object.values(api.STARS_D2_ITA9091));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-ZÀ-ÝŁŠŽČ][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 720, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
  dit(![...PAR_NOM.keys()].some(n => /^[A-Z][a-z]+\. /.test(n)), "aucune forme courte à initiale de plusieurs lettres");
  dit(![...PAR_NOM.keys()].some(n => /[\u200B-\u200F\u00A0]|&#/.test(n)), "aucun caractère invisible ni entité HTML dans un nom");
}
console.log("\n4) Les corrections du relevé");
{
  dit(!PAR_NOM.has("Júnior") && au("G. Atzori", "TOR"), "Júnior, sans nom libre, remplacé à Torino par Gianluca Atzori");
  dit(!PAR_NOM.has("A. Calisti") && au("E. Calisti", "HEL"), "Angelo Calisti (né en 1948 selon la source) absent, Ernesto Calisti au Hellas");
  dit(au("C. Ferrara", "NAP") && note("C. Ferrara")[1] === "D" && au("Ciro Ferrara", "SAL"), "deux Ciro Ferrara : celui du Napoli garde « C. Ferrara », celui de la Salernitana son nom entier");
  dit(au("A. Orlando", "UDI") && au("Alessandro Orlando", "UDI"), "deux Orlando à l'Udinese : Angelo garde l'initiale, Alessandro son nom entier");
  dit(au("A. Bianchi", "INT") && au("Andrea Bianchi", "LUC"), "Alessandro Bianchi (Inter) et Andrea Bianchi (Lucchese)");
  dit(au("Marco Ferrari", "PAR") && au("Domenico Agostini", "TAR"), "Marco Ferrari et Domenico Agostini en toutes lettres (« M. Ferrari » et « D. Agostini » sont à d'autres)");
  dit(au("F. Ravanelli", "AVE") && !au("F. Ravanelli", "REG"), "Ravanelli à Avellino, club du coup d'envoi selon Transfermarkt");
  dit(au("Gerson Caçapa", "BAI") && au("João Paulo", "BAI"), "Gerson Caçapa et João Paulo, surnoms brésiliens, à Bari");
  dit(au("L. Fusi", "TOR") && au("C. Muro", "MES") && au("E. Bivi", "PES"), "les noms courts non abrégés par la source (Fusi, Muro, Bivi) portent leur initiale");
}

console.log("\n5) Une carrière italienne depuis 1990-91");
{
  api.nouvellePartie("SAM", KEY);
  const G = api.getG();
  dit(G.pays === "ITA" && G.saison === "1990-91" && api.anneeJeu() === 1990, "G.pays = ITA, « 1990-91 », 1990");
  dit(api.libDiv(1) === "Serie A", "l'élite s'appelle « Serie A »");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.getG().vire = null; api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 1993, "carrière rendue en 1993-94");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ITA 1990-91 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ITA 1990-91 : TOUT EST VERT");
