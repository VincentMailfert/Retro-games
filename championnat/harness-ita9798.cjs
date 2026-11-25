/* Harnais de validation — SAISON DE DÉPART ITA 1997-98
   La huitième saison italienne, assemblée par la tâche planifiée le 25/11/2026 (relevé du jour, arrivées datées
   par l'historique de transferts de Transfermarkt, qui répond de nouveau, recoupées par les pages Wikipédia
   italiennes de saison des clubs). `harness-italie.cjs` tient le cadre ; ici, les FAITS :
   1) le plateau réel, à sa vraie taille (dix-huit clubs en Serie A) : la Juventus championne devant l'Inter et
      l'Udinese, Brescia, Atalanta, Lecce et Napoli relégués, Salernitana, Venezia, Cagliari et Perugia promus,
      la Serie B de la Wikipédia italienne (l'anglaise est incohérente),
   2) les sièges de 1997,
   3) les hommes : Ronaldo, Ballon d'or, à l'Inter ; Zidane, troisième, Del Piero et Inzaghi à la Juventus ;
      Bierhoff meilleur buteur ; Baggio, Batistuta ; Di Vaio meilleur buteur de Serie B ; Pirlo à dix-huit ans,
   4) les arrivées et les arbitrages du relevé : Vierchowod, Davids, Pedros, Andersson et Ganz arrivés après le
      coup d'envoi ; Fuser à la Lazio, Ivan à Foggia, Gregori à Venezia, Tovalieri à la Sampdoria ; Savićević en
      attaque, Diana en défense ; les deux Tedesco de la Salernitana,
   5) l'âge suivi d'une saison italienne à l'autre, 6) une carrière de trois saisons
   Usage : node harness-ita9798.cjs                                                        */
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
  "SAISONS,STARS_ITA9697,STARS_D2_ITA9697,STARS_ITA9798,STARS_D2_ITA9798,D1_ITA9798,D2_ITA9798,SIEGES_ITA,CLASSEMENT_REEL," +
  "PRENOMS_VRAIS,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ITA-1997-98";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ITA9798)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ITA9798)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;
const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

console.log("1) Le plateau réel de 1997-98");
{
  dit(!!S && S.pays === "ITA" && S.an === 1997 && S.titre === "1997-98", "au registre : ITA, 1997, « 1997-98 »");
  dit(S.nom === "Le Frioul de Bierhoff", "son nom : « " + S.nom + " »");
  dit(S.d1.length === 18 && api.tailleD1("ITA", 1997) === 18 && S.d2.length === 20, "la Serie A à dix-huit clubs, sa vraie taille, et la Serie B à vingt");
  dit(JSON.stringify(S.d1.slice(0, 4)) === JSON.stringify(["JUV", "INT", "UDI", "ROM"]), "la Juventus championne, devant l'Inter, l'Udinese et la Roma");
  dit(JSON.stringify(S.d1.slice(14)) === JSON.stringify(["BRS", "ATA", "LEC", "NAP"]), "Brescia, Atalanta, Lecce et Napoli, les quatre relégués, ferment l'élite");
  dit(JSON.stringify(S.d2.slice(0, 5)) === JSON.stringify(["SAL", "VEN", "CAG", "PRG", "TOR"]), "Salernitana, Venezia, Cagliari et Perugia, les quatre promus, ouvrent la Serie B, Perugia devant le Torino (barrage)");
  dit(JSON.stringify(S.d2.slice(16)) === JSON.stringify(["FOG", "ANC", "PAD", "CDS"]), "Foggia, Ancona, Padova et Castel di Sangro, relégués, la ferment");
  dit(S.d2[5] === "RGC" && S.d2[6] === "HEL" && S.d2[14] === "LUC" && S.d2[15] === "MZA", "l'ordre de la Wikipédia italienne : Reggina devant l'Hellas, Lucchese devant Monza");
  dit(["BRS", "EMP", "LEC", "BAI"].every(c => S.d1.includes(c)), "Brescia, Empoli, Lecce et Bari, promus en 1997, en Serie A");
  dit(["CAG", "PRG", "HEL", "REG"].every(c => S.d2.includes(c)) && ["TRV", "MZA", "AND", "ANC"].every(c => S.d2.includes(c) && !api.SAISONS["ITA-1996-97"].d1.concat(api.SAISONS["ITA-1996-97"].d2).includes(c)), "Cagliari, Perugia, Hellas Verona et Reggiana descendus ; Treviso, Monza, Fidelis Andria et Ancona montés de C1");
  const R = api.CLASSEMENT_REEL[KEY];
  dit(!!R && R.d1 === S.d1.join(" ") && R.d2 === S.d2.join(" "), "le vrai classement (CLASSEMENT_REEL) est exactement le plateau, dans l'ordre");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ITA9798[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ITA9798[c].length, 0);
  dit(n1 === 360 && n2 === 360, "720 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 1997");
{
  const T = api.SIEGES_ITA[1997];
  dit(meme(S.euroC1, ["JUV", "PAR"]) && meme(S.euroC2, ["VIC"]) && meme(S.euroC3, ["INT", "LAZ", "UDI", "SAM"]), "la Juventus et Parma en C1, Vicenza en C2, Inter, Lazio, Udinese et Sampdoria en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ITA[1997]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("Ronaldo", "INT") && note("Ronaldo")[3] === 90 && note("Ronaldo")[2] === 21, "Ronaldo, Ballon d'or à vingt et un ans, à l'Inter (" + note("Ronaldo")[3] + ")");
  dit(au("Z. Zidane", "JUV") && note("Z. Zidane")[3] === 87 && au("A. Del Piero", "JUV") && au("F. Inzaghi", "JUV"), "Zidane (" + note("Z. Zidane")[3] + "), troisième du Ballon d'or, avec Del Piero et Inzaghi à la Juventus");
  dit(au("O. Bierhoff", "UDI") && note("O. Bierhoff")[3] === 82, "Bierhoff, meilleur buteur avec vingt-sept buts, à l'Udinese (82)");
  dit(au("R. Baggio", "BGN") && au("G. Batistuta", "FIO") && au("V. Montella", "SAM") && au("D. Hübner", "BRS") && note("D. Hübner")[3] === 75, "Baggio à Bologna, Batistuta, Montella, et Hübner à Brescia (75)");
  dit(au("M. Di Vaio", "SAL") && note("M. Di Vaio")[3] === 72 && au("M. Ferrante", "TOR"), "Di Vaio, meilleur buteur de Serie B, puis Ferrante");
  dit(au("A. Pirlo", "BRS") && note("A. Pirlo")[2] === 18 && au("G. Buffon", "PAR") && note("G. Buffon")[2] === 19, "Pirlo, dix-huit ans, à Brescia ; Buffon, dix-neuf ans, à Parma");
  dit(au("F. Totti", "ROM") && au("A. Nesta", "LAZ") && au("P. Nedvěd", "LAZ") && au("P. Kluivert", "MIL") && au("G. Weah", "MIL") && au("P. Maldini", "MIL"), "Totti, Nesta et Nedvěd, Kluivert, Weah et Maldini");
  const tous = [].concat(...Object.values(api.STARS_ITA9798), ...Object.values(api.STARS_D2_ITA9798));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-ZÀ-ÝŁŠŽČ][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 720, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
  dit(![...PAR_NOM.keys()].some(n => /^[A-Z][a-z]+\. /.test(n)), "aucune forme courte à initiale de plusieurs lettres");
  dit(![...PAR_NOM.keys()].some(n => /[​-‏ ]|&#/.test(n)), "aucun caractère invisible ni entité HTML dans un nom");
}
console.log("\n4) Les arrivées et les arbitrages du relevé");
{
  dit(!PAR_NOM.has("P. Vierchowod") && !PAR_NOM.has("E. Davids") && !PAR_NOM.has("R. Pedros") && !PAR_NOM.has("M. Ganz"), "Vierchowod (6 septembre), Davids, Pedros (4 septembre) et Ganz, arrivés après le coup d'envoi, écartés");
  dit(![...PAR_NOM.keys()].some(n => /Andersson$/.test(n) && PAR_NOM.get(n).club === "MIL"), "Andreas Andersson, arrivé au Milan le 1er septembre, écarté");
  dit(au("D. Fuser", "LAZ") && au("A. Ivan", "FOG") && note("A. Ivan")[1] === "G" && au("A. Gregori", "VEN"), "Fuser à la Lazio, Ivan à Foggia, Gregori à Venezia : les arbitrages du relevé");
  dit(au("S. Tovalieri", "SAM") && au("S. Inzaghi", "PIA"), "Tovalieri à la Sampdoria et Simone Inzaghi à Piacenza au coup d'envoi, partis en automne selon Wikipédia");
  dit(note("D. Savićević")[1] === "A" && au("D. Savićević", "MIL") && note("A. Diana")[1] === "D" && au("A. Diana", "BRS"), "Savićević en attaque au Milan, Diana en défense à Brescia");
  dit(au("G. Tedesco", "SAL") && au("Giacomo Tedesco", "SAL") && note("G. Tedesco")[2] === 25, "les deux Tedesco à la Salernitana, Giovanni (« G. Tedesco ») et Giacomo");
  dit(au("J. Bachini", "UDI"), "Bachini à l'Udinese, absent de la page d'effectif mais présent au temps de jeu");
}
console.log("\n5) D'une saison italienne à l'autre");
{
  const A = new Map(); for (const T of [api.STARS_ITA9697, api.STARS_D2_ITA9697]) for (const c in T) for (const t of T[c]) A.set(t[0], t);
  const ecarts = [...PAR_NOM.entries()].filter(([n, v]) => A.has(n) && v.t[2] - A.get(n)[2] !== 1).map(([n]) => n);
  dit(ecarts.length === 0, "un homme présent en 1996-97 a pris un an exactement" + (ecarts.length ? " — " + ecarts.slice(0, 6).join(", ") : ""));
  const communs = [...PAR_NOM.keys()].filter(n => A.has(n)).length;
  dit(communs >= 450, communs + " hommes déjà présents en 1996-97");
}

console.log("\n6) Une carrière italienne depuis 1997-98");
{
  api.nouvellePartie("UDI", KEY);
  const G = api.getG();
  dit(G.pays === "ITA" && G.saison === "1997-98" && api.anneeJeu() === 1997, "G.pays = ITA, « 1997-98 », 1997");
  dit(api.libDiv(1) === "Serie A", "l'élite s'appelle « Serie A »");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.getG().vire = null; api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 2000, "carrière rendue en 2000-01");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ITA 1997-98 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ITA 1997-98 : TOUT EST VERT");
