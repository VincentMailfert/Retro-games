/* Harnais de validation — LES PRÉNOMS (v1.46)
   Le nom court (« B. Lama ») reste la clé du jeu ; le prénom se déduit de lui à l'affichage (prenomDe/nomLong).
   A) chaque vrai joueur des tables curées a son entrée dans PRENOMS_VRAIS ("" = on garde l'initiale)
   B) un prénom connu colle à l'initiale affichée (« J.-P. » = Jean-Pierre), et ne porte rien d'étrange
   C) un joueur généré a toujours un prénom, qui commence par son initiale, et toujours le même
   D) nomLong ne touche pas à ce qu'il ne connaît pas (mononymes, prénoms "" , noms hors tables)
   E) le prénom ne remplace jamais le nom court dans le moteur : genJoueur garde « X. Nom »
   Usage : node harness-prenoms.cjs                                                                    */
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
const generic = makeStub();
global.document = new Proxy(function () {}, {
  get(_t, p) { if (p === "getElementById") return () => generic; if (p === Symbol.toPrimitive) return () => ""; return generic; },
  set() { return true; }, apply() { return generic; }, has() { return true; }, construct() { return generic; },
});
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, localStorage: ls, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.localStorage = ls; global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0); global.cancelAnimationFrame = (id) => clearTimeout(id);

const api = new Function(script + "\n;return {PRENOMS_VRAIS,PRENOMS_GEN,PRENOMS,NOMS,prenomDe,nomLong,genJoueur};")();
const { PRENOMS_VRAIS, PRENOMS_GEN, PRENOMS, NOMS, prenomDe, nomLong, genJoueur } = api;

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const extrait = (l, n = 6) => l.slice(0, n).join(", ") + (l.length > n ? ` … (+${l.length - n})` : "");
const sansAccent = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

// tous les vrais joueurs : chaque tuple [nom, poste, âge, note, pot…] écrit dans le fichier
const reels = new Set();
for (const m of script.matchAll(/\["([^"]+)","[GDMA]",\d+,\d+,\d+/g)) reels.add(m[1]);
const INI = /^\p{Lu}\.(?:-\p{Lu}\.)* /u;           // « B. », « É. », « J.-P. » ; pas « João M. Pinto »
const aInitiale = [...reels].filter(n => INI.test(n));

/* ===== A) couverture ===== */
console.log("A) Chaque vrai joueur a son entrée");
{
  const manquants = aInitiale.filter(n => !Object.prototype.hasOwnProperty.call(PRENOMS_VRAIS, n));
  ok(manquants.length === 0, `les ${aInitiale.length} vrais joueurs à initiale sont dans la table${manquants.length ? " — manquent : " + extrait(manquants) : ""}`);
  const orphelins = Object.keys(PRENOMS_VRAIS).filter(n => !reels.has(n));
  ok(orphelins.length === 0, `la table ne parle que de joueurs du jeu${orphelins.length ? " — orphelins : " + extrait(orphelins) : ""}`);
  const connus = Object.values(PRENOMS_VRAIS).filter(Boolean).length;
  ok(connus >= aInitiale.length * 0.5, `au moins la moitié ont un prénom (${connus}/${aInitiale.length})`);
}

/* ===== B) un prénom colle à son initiale ===== */
console.log("B) Le prénom colle à l'initiale affichée");
{
  const faux = [], bizarres = [];
  for (const [nom, p] of Object.entries(PRENOMS_VRAIS)) {
    if (!p) continue;
    if (/[<>"—0-9]/.test(p) || p !== p.trim() || /\s{2}/.test(p) || /\./.test(p)) bizarres.push(nom + " → " + p);
    const ini = sansAccent(nom.slice(0, nom.indexOf(". "))).split(/\.-?/).filter(Boolean);   // « J.-P » → [J, P], « É » → [E]
    const morceaux = p.split(/[- ]/);
    const colle = ini.length === 1
      ? sansAccent(p)[0] === ini[0][0]
      : ini.every((x, i) => morceaux[i] && sansAccent(morceaux[i]).startsWith(x));
    if (!colle) faux.push(nom + " → " + p);
  }
  ok(faux.length === 0, `chaque prénom commence par l'initiale affichée${faux.length ? " — " + extrait(faux) : ""}`);
  ok(bizarres.length === 0, `aucun prénom ne porte de chevron, de chiffre, de point ou de tiret long${bizarres.length ? " — " + extrait(bizarres) : ""}`);
}

/* ===== C) les joueurs générés ===== */
console.log("C) Un joueur généré a toujours un prénom d'époque");
{
  const trous = [], faux = [];
  for (const i of PRENOMS) for (const f of NOMS) {
    const nom = i + " " + f;
    if (Object.prototype.hasOwnProperty.call(PRENOMS_VRAIS, nom)) continue; // un vrai joueur porte ce nom : la table décide
    const p = prenomDe(nom);
    if (!p) trous.push(nom);
    else if (sansAccent(p)[0] !== i[0]) faux.push(nom + " → " + p);
  }
  ok(trous.length === 0, `les ${PRENOMS.length * NOMS.length} combinaisons initiale × nom ont un prénom${trous.length ? " — sauf " + extrait(trous) : ""}`);
  ok(faux.length === 0, `et il commence par la bonne lettre${faux.length ? " — " + extrait(faux) : ""}`);
  const stables = NOMS.every(f => prenomDe("M. " + f) === prenomDe("M. " + f));
  ok(stables, "le même nom donne toujours le même prénom (d'une ouverture à l'autre)");
  const varies = new Set(NOMS.map(f => prenomDe("L. " + f))).size;
  ok(varies >= 2, `deux « L. » n'ont pas forcément le même prénom (${varies} prénoms différents pour les L.)`);
  const vides = Object.entries(PRENOMS_GEN).flatMap(([o, l]) => l.filter(p => /[<>"—.]/.test(p) || !p.trim()).map(p => o + ":" + p));
  ok(vides.length === 0, "les listes d'époque sont propres");
}

/* ===== D) nomLong ne touche pas à ce qu'il ne connaît pas ===== */
console.log("D) Sans prénom connu, le nom court reste");
{
  const mono = [...reels].filter(n => !INI.test(n));
  ok(mono.every(n => nomLong(n) === n), `les ${mono.length} noms sans initiale (Raí, Leonardo, João M. Pinto…) restent tels quels`);
  const inconnus = Object.entries(PRENOMS_VRAIS).filter(([, p]) => !p).map(([n]) => n);
  ok(inconnus.every(n => nomLong(n) === n), `les ${inconnus.length} prénoms introuvables gardent l'initiale`);
  ok(nomLong("Z. Inconnu") === "Z. Inconnu" && nomLong("") === "" && nomLong(undefined) === "", "un nom hors table, vide ou absent ne casse rien");
  const ex = Object.entries(PRENOMS_VRAIS).find(([, p]) => p);
  if (ex) ok(nomLong(ex[0]) === ex[1] + " " + ex[0].slice(ex[0].indexOf(". ") + 2), `exemple : « ${ex[0]} » s'affiche « ${nomLong(ex[0])} »`);
  const compose = Object.keys(PRENOMS_VRAIS).find(n => /^[A-Z]\.-[A-Z]\. /.test(n) && PRENOMS_VRAIS[n]);
  if (compose) ok(!nomLong(compose).includes(". "), `un prénom composé remplace les deux initiales : « ${nomLong(compose)} »`);
}

/* ===== E) le moteur garde le nom court ===== */
console.log("E) Le moteur garde le nom court");
{
  let courts = 0, sansPrenom = 0;
  for (let k = 0; k < 400; k++) {
    const j = genJoueur("M", 5);
    if (/^[A-Z]\. /.test(j.nom)) courts++;
    // un généré peut porter le nom d'un vrai joueur au prénom introuvable : la table a le dernier mot
    if (nomLong(j.nom) === j.nom && !Object.prototype.hasOwnProperty.call(PRENOMS_VRAIS, j.nom)) sansPrenom++;
  }
  ok(courts === 400, "genJoueur fabrique toujours « X. Nom »");
  ok(sansPrenom === 0, "et chacun a son prénom à l'affichage");
}

console.log(FAILS ? `\n✗ ${FAILS} échec(s)` : "\n✓ Tout est vert");
process.exit(FAILS ? 1 : 0);
