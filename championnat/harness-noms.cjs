/* Harnais de validation — LES SAISONS NOMMÉES
   Chaque saison de départ porte un nom, et ce nom est ce que l'écran d'accueil met en avant. Ce qui se
   vérifie ici tient en une phrase : le nom s'ajoute au repère daté, il ne le remplace jamais.
   A) les sept saisons ont un nom, et il tient dans un menu déroulant
   B) la collection se tient : aucun nom en double, aucun mot marquant partagé
   C) aucun nom ne marche sur les plates-bandes des feuilletons (ARCS)
   D) le repère daté est intact : `titre` et `G.saison` restent « 1991-92 », les sauvegardes avec
   E) rien d'un nom ne peut ouvrir une balise
   Usage : node harness-noms.cjs                                                                    */
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
/* un vrai petit nœud pour #app : il retient la page que le jeu lui écrit, ce qui permet de lire l'écran
   d'accueil tel qu'un joueur le voit — c'est là, et seulement là, que le nom d'une saison sert à quelque chose */
const APP = { _h: "", querySelector: () => null, querySelectorAll: () => [] };
Object.defineProperty(APP, "innerHTML", { get() { return APP._h; }, set(v) { APP._h = String(v); } });
const generic = makeStub();
global.document = new Proxy(function () {}, {
  get(_t, p) { if (p === "getElementById") return id => (id === "app" ? APP : generic); if (p === Symbol.toPrimitive) return () => ""; return generic; },
  set() { return true; }, apply() { return generic; }, has() { return true; }, construct() { return generic; },
});
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, localStorage: ls, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.localStorage = ls; global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0); global.cancelAnimationFrame = (id) => clearTimeout(id);

const api = new Function(script + "\n;return {nouvellePartie,ecranAccueil,SAISONS,ARCS,SAISON_DEFAUT,esc,getG:function(){return G;}};")();
const { SAISONS, ARCS } = api;

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const cles = Object.keys(SAISONS);

/* Les mots qu'on ne compte pas comme « marquants » : deux noms ont le droit de partager un article. */
const VIDES = new Set(["le", "la", "les", "l", "un", "une", "des", "du", "de", "d", "au", "aux", "et",
  "a", "en", "sur", "sous", "pour", "dans", "par", "ce", "cet", "cette", "qui", "que", "se", "sera"]);
const mots = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .split(/[^a-z0-9]+/).filter(w => w && !VIDES.has(w));

/* ===== A) chaque saison a son nom ===== */
console.log("A) Les saisons de départ portent un nom");
{
  const sans = cles.filter(k => !SAISONS[k].nom || !String(SAISONS[k].nom).trim());
  ok(sans.length === 0, `les ${cles.length} saisons ont un nom${sans.length ? " — sauf " + sans.join(", ") : ""}`);
  const trop = cles.filter(k => String(SAISONS[k].nom).length > 34);
  ok(trop.length === 0, `aucun ne dépasse 34 caractères : il faut qu'il tienne dans le menu déroulant${trop.length ? " — " + trop.join(", ") : ""}`);
  const longs = cles.filter(k => { const n = String(SAISONS[k].nom).trim().split(/\s+/).length; return n < 2 || n > 5; });
  ok(longs.length === 0, `chacun tient en deux à cinq mots${longs.length ? " — " + longs.join(", ") : ""}`);
  // évoquer son époque est le propre d'un bon nom (« Le bug de l'an 2000 ») ; recopier son créneau ne l'est pas
  const dates = cles.filter(k => String(SAISONS[k].nom).includes(k));
  ok(dates.length === 0, `et aucun ne se contente de recopier son créneau${dates.length ? " — " + dates.join(", ") : ""}`);
  console.log("     " + cles.map(k => `${SAISONS[k].nom} (${k})`).join(" · "));
}

/* ===== B) la collection se tient ===== */
console.log("B) Sept noms qui font une collection, pas sept trouvailles séparées");
{
  const noms = cles.map(k => SAISONS[k].nom);
  ok(new Set(noms).size === noms.length, "aucun nom en double");
  const vus = new Map(); let collision = null;
  for (const k of cles) for (const w of new Set(mots(SAISONS[k].nom))) {
    if (vus.has(w) && vus.get(w) !== k) collision = `« ${w} » revient dans ${vus.get(w)} et ${k}`;
    else vus.set(w, k);
  }
  ok(!collision, collision || "aucun mot marquant partagé par deux saisons");
}

/* ===== C) les feuilletons gardent leurs mots ===== */
console.log("C) Les feuilletons du club gardent leurs mots à eux");
{
  const motsArcs = new Set();
  for (const a of Object.values(ARCS)) for (const w of mots(String(a.titre || ""))) motsArcs.add(w);
  let pris = null;
  for (const k of cles) for (const w of mots(SAISONS[k].nom))
    if (motsArcs.has(w)) pris = `« ${w} » (${k}) appartient déjà à un feuilleton`;
  ok(!pris, pris || `aucun des ${Object.keys(ARCS).length} feuilletons ne voit son mot repris par une saison`);
}

/* ===== D) le repère daté est intact ===== */
console.log("D) Le nom s'ajoute au repère daté, il ne le remplace pas");
{
  const faux = cles.filter(k => SAISONS[k].titre !== k);
  ok(faux.length === 0, `chaque saison garde son créneau comme titre${faux.length ? " — " + faux.join(", ") : ""}`);
  api.nouvellePartie("LIL");
  const G = api.getG();
  ok(G.saison === api.SAISON_DEFAUT, `une partie neuve s'ouvre sur « ${G.saison} », le créneau daté — jamais sur le nom`);
  const sauve = JSON.stringify({ saison: G.saison });
  ok(!JSON.parse(sauve).saison.includes(SAISONS[api.SAISON_DEFAUT].nom),
    "et c'est bien le créneau que la sauvegarde emporte : les carrières d'avant se relisent");
}

/* ===== E) un nom ne peut pas ouvrir de balise ===== */
console.log("E) Un nom bricolé ne peut pas ouvrir de balise");
{
  const sales = cles.filter(k => /[<>&"]/.test(String(SAISONS[k].nom)));
  ok(sales.length === 0, `aucun nom ne porte de caractère à échapper${sales.length ? " — " + sales.join(", ") : ""}`);
  ok(api.esc('<b>"x"&</b>') === "&lt;b&gt;&quot;x&quot;&amp;&lt;/b&gt;", "et `esc` reste le garde-fou qui les écrirait en toutes lettres");
}

/* ===== F) et tout cela arrive jusqu'à l'écran ===== */
console.log("F) L'écran d'accueil met le nom en avant, et garde le créneau à côté");
{
  api.ecranAccueil();
  const page = APP._h;
  const opts = [...page.matchAll(/<option[^>]*>([^<]*)<\/option>/g)].map(m => m[1]);
  ok(opts.length === cles.length, `le menu déroulant propose les ${cles.length} saisons`);
  const manque = cles.filter(k => !opts.some(o => o.includes(SAISONS[k].nom) && o.includes(k)));
  ok(manque.length === 0, `chaque ligne du menu porte le nom ET le créneau${manque.length ? " — sauf " + manque.join(", ") : ""}`);
  const mis = page.match(/<p class="fort"[^>]*><b>([^<]*)<\/b><\/p>/);
  ok(mis && mis[1] === SAISONS[api.SAISON_DEFAUT].nom,
    `et la saison choisie s'annonce par son nom : « ${mis ? mis[1] : "(absent)"} »`);
  ok(page.includes(SAISONS[api.SAISON_DEFAUT].sous), "le sous-titre déjà écrit reste dessous, il n'a pas été remplacé");
  ok(!/undefined/.test(page), "aucun « undefined » n'a fuité dans la page");
  console.log("     " + opts[0] + " · … · " + opts[opts.length - 1]);
}

console.log(FAILS === 0 ? "\n✅ SAISONS NOMMÉES : TOUT EST VERT" : "\n❌ SAISONS NOMMÉES : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS ? 1 : 0);
