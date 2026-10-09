/* Harnais de validation — LES TROIS CODES (v1.87)
   Auxerre AUX → AJA, l'AC Ajaccio AJA → ACA, l'Ajax Amsterdam AJA → AFC. Ce qui se vérifie ici :
   A) les tables du jeu : plus un seul AUX, chaque code désigne le bon club, le derby corse tient
   B) une sauvegarde d'avant la v1.87 se relit : Ajaccio au plateau, l'Ajax au vivier, Auxerre en AJA
   C) une carrière d'Auxerre d'avant (sans Ajaccio au plateau) : l'AJA du vivier redevient l'Ajax
   D) et la carrière relue se joue
   Usage : node harness-codes.cjs                                                                       */
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</scr" + "ipt>"));

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
global.localStorage = ls; global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0); global.cancelAnimationFrame = (id) => clearTimeout(id);
const epilogue = "\n;return {CLUBS,CLUBS_EXTRA,EUROCLUBS,RIVAL,SAISONS,nouvellePartie,jouerJournee,migre,nomRivalite," +
  "getG:function(){return G;},setG:function(x){G=x;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
// une sauvegarde d'avant : la même partie, écrite avec les anciens codes, en une seule passe
const aLAncienne = (G) => { const o = JSON.parse(JSON.stringify(G).replace(/"(AJA|ACA|AFC)"/g,
  (_, c) => c === "AJA" ? '"AUX"' : '"AJA"')); delete o._codes; return o; };
const relit = (o) => { api.setG(o); api.migre(); return api.getG(); };
// premier niveau trié : le marqueur _codes arrive en dernier dans une sauvegarde relue, sans effet
const texte = (G) => JSON.stringify(Object.fromEntries(Object.entries(G).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)));

console.log("\nA) Les tables du jeu");
{
  const tous = api.CLUBS.concat(api.CLUBS_EXTRA || []);
  const de = id => tous.find(c => c.id === id);
  ok(!tous.some(c => c.id === "AUX") && !api.EUROCLUBS.some(c => c.id === "AUX"), "plus aucun club ne s'appelle AUX");
  ok(de("AJA") && de("AJA").nom === "AJ Auxerre", "AJA, c'est l'AJ Auxerre");
  ok(de("ACA") && de("ACA").nom === "AC Ajaccio", "ACA, c'est l'AC Ajaccio");
  ok(api.EUROCLUBS.some(c => c.id === "AFC" && c.nom === "Ajax Amsterdam") && !api.EUROCLUBS.some(c => c.id === "AJA"),
    "AFC, c'est l'Ajax Amsterdam, et le vivier n'a plus d'AJA");
  ok(api.RIVAL.ACA === "BAS" && api.RIVAL.BAS === "ACA" && api.nomRivalite("ACA", "BAS") === "Le derby corse",
    "le derby corse tient : Ajaccio contre Bastia");
}

console.log("\nB) Une carrière d'Ajaccio en 2002-03, sauvegardée avant la v1.87");
{
  api.nouvellePartie("ACA", "2002-03");
  const neuf = texte(relit(JSON.parse(texte(api.getG()))));
  api.setG(JSON.parse(neuf)); // la même partie, relue en v1.87 : la référence
  const G = relit(aLAncienne(JSON.parse(neuf)));
  ok(G._codes === 1, "la sauvegarde est marquée relue");
  ok(G.monClub === "ACA", "vous êtes toujours l'AC Ajaccio");
  const pl = G.clubs.concat(G.autre);
  ok(pl.some(c => c.id === "ACA" && c.nom === "AC Ajaccio") && pl.some(c => c.id === "AJA" && c.nom === "AJ Auxerre"),
    "au plateau : Ajaccio en ACA, Auxerre en AJA");
  ok(G.europe.some(c => c.id === "AFC" && c.nom === "Ajax Amsterdam"), "au vivier : l'Ajax en AFC");
  ok(!/"AUX"/.test(texte(G)), "plus un seul AUX dans la sauvegarde");
  ok(texte(G) === neuf, "la sauvegarde relue est identique, au caractère près, à la même partie lancée en v1.87");
}

console.log("\nC) Une carrière d'Auxerre en 1995-96, sans Ajaccio au plateau");
{
  api.nouvellePartie("AJA", "1995-96");
  const neuf = texte(relit(JSON.parse(texte(api.getG()))));
  api.setG(JSON.parse(neuf)); // la même partie, relue en v1.87 : la référence
  const G = relit(aLAncienne(JSON.parse(neuf)));
  ok(G.monClub === "AJA" && G.clubs.some(c => c.id === "AJA" && c.nom === "AJ Auxerre"), "vous êtes Auxerre, en AJA");
  ok(G.europe.some(c => c.id === "AFC") && !G.europe.some(c => c.id === "AJA"), "l'Ajax du vivier est passé en AFC");
  ok(texte(G) === neuf, "identique au caractère près à la même partie lancée en v1.87");
  const avant = texte(G); api.migre();
  ok(texte(api.getG()) === avant, "relire deux fois ne change rien");
}

console.log("\nD) La carrière relue se joue");
{
  api.nouvellePartie("ACA", "2003-04");
  relit(aLAncienne(api.getG()));
  let err = null;
  try { for (let i = 0; i < 6; i++) api.jouerJournee(); } catch (e) { err = e; }
  ok(!err, "six journées jouées sans exception" + (err ? " — " + err.message : ""));
  ok(api.getG().journee >= 6, `le compteur avance (${api.getG().journee})`);
}

console.log(FAILS ? `\n✗ ${FAILS} ÉCHEC(S)` : "\nTOUT EST VERT");
process.exit(FAILS ? 1 : 0);
