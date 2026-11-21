/* Harnais de validation — SAISON DE DÉPART ITA 1993-94
   La quatrième saison italienne, assemblée par la tâche planifiée le 21/11/2026 (relevé du jour, arrivées datées
   par les listes de transferts des clubs et les pages de détail de transfert de Transfermarkt, recoupées par les
   pages Wikipédia italiennes de saison des clubs). `harness-italie.cjs` tient le cadre ; ici, les FAITS :
   1) le plateau réel, à sa vraie taille (dix-huit clubs en Serie A) : le Milan champion, Piacenza, Udinese,
      Atalanta et Lecce relégués, Fiorentina, Bari, Brescia et Padova promus, Pisa battu au barrage par Acireale,
   2) les sièges de 1993,
   3) les hommes : Signori meilleur buteur pour la deuxième fois, Zola, R. Baggio (Ballon d'or 1993) et Silenzi
      derrière lui, Papin sous son nom du jeu, Agostini meilleur buteur de Serie B, Batistuta en Serie B,
   4) les arrivées et les corrections : Desailly, Bokšić et Helveg arrivés en novembre, Pizzi à Parma, Ambrosio à
      Pisa (deux transferts du même jour), Altomare à Napoli (liste d'hiver), Nesta forcé, Colacone et Morfeo
      (Primavera), les deux Andrea Bianchi, les rôles repris de Wikipédia,
   5) l'âge suivi d'une saison italienne à l'autre, 6) une carrière de trois saisons
   Usage : node harness-ita9394.cjs                                                        */
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
  "SAISONS,STARS_ITA9293,STARS_D2_ITA9293,STARS_ITA9394,STARS_D2_ITA9394,D1_ITA9394,D2_ITA9394,SIEGES_ITA,CLASSEMENT_REEL," +
  "PRENOMS_VRAIS,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ITA-1993-94";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ITA9394)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ITA9394)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;
const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

console.log("1) Le plateau réel de 1993-94");
{
  dit(!!S && S.pays === "ITA" && S.an === 1993 && S.titre === "1993-94", "au registre : ITA, 1993, « 1993-94 »");
  dit(S.nom === "La leçon d'Athènes", "son nom : « " + S.nom + " »");
  dit(S.d1.length === 18 && api.tailleD1("ITA", 1993) === 18 && S.d2.length === 20, "la Serie A à dix-huit clubs, sa vraie taille, et la Serie B à vingt");
  dit(S.d1[0] === "MIL" && S.d1[1] === "JUV" && S.d1[2] === "LAZ", "le Milan champion, devant la Juventus et la Lazio");
  dit(S.d1.indexOf("INT") === 12, "l'Inter, vainqueur de la Coupe UEFA, treizième");
  dit(JSON.stringify(S.d1.slice(14)) === JSON.stringify(["PIA", "UDI", "ATA", "LEC"]), "Piacenza, Udinese, Atalanta et Lecce, les quatre relégués, ferment l'élite");
  dit(JSON.stringify(S.d2.slice(0, 4)) === JSON.stringify(["FIO", "BAI", "BRS", "PAD"]), "Fiorentina, Bari, Brescia et Padova (barrage contre Cesena), les quatre promus, ouvrent la Serie B");
  dit(JSON.stringify(S.d2.slice(15)) === JSON.stringify(["ACR", "PIS", "RAV", "MOD", "MZA"]), "Acireale, sauvé au barrage, puis Pisa, Ravenna, Modena et Monza, relégués, la ferment");
  dit(["ANC", "PES"].every(c => S.d2.includes(c)) && ["CRM", "REG", "PIA"].every(c => S.d1.includes(c)), "Cremonese, Reggiana et Piacenza promus en Serie A ; Ancona et Pescara en Serie B");
  dit(["VIC", "ACR", "RAV", "PAL"].every(c => S.d2.includes(c)), "Vicenza, Acireale, Ravenna et Palermo, montés de Serie C1, en Serie B");
  const R = api.CLASSEMENT_REEL[KEY];
  dit(!!R && R.d1 === S.d1.join(" ") && R.d2 === S.d2.join(" "), "le vrai classement (CLASSEMENT_REEL) est exactement le plateau, dans l'ordre");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ITA9394[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ITA9394[c].length, 0);
  dit(n1 === 360 && n2 === 360, "720 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 1993");
{
  const T = api.SIEGES_ITA[1993];
  dit(meme(S.euroC1, ["MIL"]) && meme(S.euroC2, ["PAR", "TOR"]) && meme(S.euroC3, ["INT", "CAG", "JUV", "LAZ"]), "le Milan en C1, Parma et Torino en C2, Inter, Cagliari, Juventus et Lazio en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ITA[1993]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("G. Signori", "LAZ") && note("G. Signori")[3] === 82, "Signori, meilleur buteur pour la deuxième année de suite (vingt-trois buts) : " + note("G. Signori")[3]);
  dit(au("G. Zola", "PAR") && note("G. Zola")[3] === 80, "Zola, deuxième buteur avec dix-huit buts : " + note("G. Zola")[3]);
  dit(au("R. Baggio", "JUV") && note("R. Baggio")[3] === 88 && note("R. Baggio")[2] === 26, "Roberto Baggio, vingt-six ans, Ballon d'or 1993 : " + note("R. Baggio")[3]);
  dit(au("A. Silenzi", "TOR") && au("R. Sosa", "INT") && au("D. Fonseca", "NAP") && au("R. Gullit", "SAM") && au("M. Branca", "UDI"), "Silenzi, Sosa, Fonseca, Gullit et Branca, les buteurs suivants");
  dit(au("J.-P. Papin", "MIL") && !PAR_NOM.has("J. Papin"), "Papin au Milan, sous le nom que le jeu lui donne à Marseille");
  dit(au("D. Massaro", "MIL") && note("D. Massaro")[3] === 74 && au("D. Savićević", "MIL") && au("B. Laudrup", "MIL") && au("F. Răducioiu", "MIL"), "Massaro (deux buts à Athènes), Savićević, Laudrup et Răducioiu au Milan");
  dit(au("D. Bergkamp", "INT") && au("W. Jonk", "INT") && au("A. Möller", "JUV") && au("A. Del Piero", "JUV"), "Bergkamp et Jonk à l'Inter, Möller et Del Piero à la Juventus");
  dit(au("G. Batistuta", "FIO") && au("S. Effenberg", "FIO"), "Batistuta et Effenberg avec la Fiorentina, en Serie B");
  dit(au("M. Agostini", "ANC") && note("M. Agostini")[3] === 73 && au("O. Bierhoff", "ASC") && au("G. Galderisi", "PAD"), "Agostini, meilleur buteur de Serie B, Bierhoff et Galderisi derrière lui");
  dit(au("C. Vieri", "RAV") && au("F. Inzaghi", "HEL") && au("F. Cannavaro", "NAP") && au("C. Panucci", "MIL"), "Vieri à Ravenna, Inzaghi à l'Hellas, Cannavaro au Napoli, Panucci au Milan");
  const tous = [].concat(...Object.values(api.STARS_ITA9394), ...Object.values(api.STARS_D2_ITA9394));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-ZÀ-ÝŁŠŽČ][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 720, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
  dit(![...PAR_NOM.keys()].some(n => /^[A-Z][a-z]+\. /.test(n)), "aucune forme courte à initiale de plusieurs lettres");
  dit(![...PAR_NOM.keys()].some(n => /[\u200B-\u200F\u00A0]|&#/.test(n)), "aucun caractère invisible ni entité HTML dans un nom");
}
console.log("\n4) Les arrivées et les corrections du relevé");
{
  dit(!PAR_NOM.has("M. Desailly") && !PAR_NOM.has("A. Bokšić") && !PAR_NOM.has("A. Boksic"), "Desailly (Milan) et Bokšić (Lazio), arrivés en novembre, écartés");
  dit(au("F. Pizzi", "PAR") && !PAR_NOM.has("T. Helveg"), "Pizzi à Parma et Helveg absent : arrivés à l'Udinese en novembre (Wikipédia)");
  dit(au("M. Ambrosio", "PIS") && note("M. Ambrosio")[1] === "G", "Ambrosio, gardien, à Pisa : deux transferts du même jour se lisent en chaîne");
  dit(au("L. Altomare", "NAP"), "Altomare au Napoli : son départ pour Lucchese est dans la liste d'hiver");
  dit(au("A. Nesta", "LAZ") && note("A. Nesta")[2] === 17 && note("A. Nesta")[4] === 90, "Nesta, dix-sept ans, forcé à la Lazio");
  dit(au("R. Colacone", "PAR") && au("D. Morfeo", "ATA"), "Colacone et Morfeo : leur « arrivée » en cours de saison est leur montée de la Primavera");
  dit(au("Andrea Bianchi", "GEN") && au("M. Mazzoli", "AND"), "l'Andrea Bianchi né en 1969 au Genoa ; son homonyme d'Andria, sans nom libre, remplacé par Mazzoli");
  dit(note("T. Brolin")[1] === "M" && note("W. Pittana")[1] === "A" && note("G. Ambrosetti")[1] === "A", "Brolin milieu, Pittana et Ambrosetti attaquants, selon Wikipédia");
  dit(note("R. Rambaudi")[1] === "A" && note("B. Roy")[1] === "A", "les ailiers Rambaudi et Roy en attaque, faute de quatre avant-centres");
  dit(au("R. Sensini", "UDI") && au("T. Bigliardi", "ATA"), "Sensini à l'Udinese et Bigliardi à l'Atalanta, partis en novembre");
}
console.log("\n5) D'une saison italienne à l'autre");
{
  const A = new Map(); for (const T of [api.STARS_ITA9293, api.STARS_D2_ITA9293]) for (const c in T) for (const t of T[c]) A.set(t[0], t);
  const ecarts = [...PAR_NOM.entries()].filter(([n, v]) => A.has(n) && v.t[2] - A.get(n)[2] !== 1).map(([n]) => n);
  dit(ecarts.length === 0, "un homme présent en 1992-93 a pris un an exactement" + (ecarts.length ? " — " + ecarts.slice(0, 6).join(", ") : ""));
  const communs = [...PAR_NOM.keys()].filter(n => A.has(n)).length;
  dit(communs >= 450, communs + " hommes déjà présents en 1992-93");
}

console.log("\n6) Une carrière italienne depuis 1993-94");
{
  api.nouvellePartie("PAR", KEY);
  const G = api.getG();
  dit(G.pays === "ITA" && G.saison === "1993-94" && api.anneeJeu() === 1993, "G.pays = ITA, « 1993-94 », 1993");
  dit(api.libDiv(1) === "Serie A", "l'élite s'appelle « Serie A »");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.getG().vire = null; api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 1996, "carrière rendue en 1996-97");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ITA 1993-94 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ITA 1993-94 : TOUT EST VERT");
