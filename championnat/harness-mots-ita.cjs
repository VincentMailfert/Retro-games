/* Harnais de validation — LE MOT DES CLUBS ITALIENS (ITA-F b, v2.87)
   A) chaque club d'ITA-A a son mot, quelle que soit la saison de départ entre 1990 et 2009
   B) aucun code italien n'écrase le mot d'un club français ou anglais
   C) la forme : aucun tiret long, aucun chevron, deux phrases au plus, une ponctuation finale
   D) les époques se tiennent : années croissantes, la vérité suit la saison (quelques bascules témoins)
   E) une carrière française ne voit pas un mot de plus pour ses clubs
   Usage : node harness-mots-ita.cjs                                                                    */
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</scr" + "ipt>"));
function makeStub() {
  let stub; const fn = function () { return stub; };
  stub = new Proxy(fn, { get(_t, p) { if (p === Symbol.toPrimitive) return () => ""; if (p === "length") return 0; return stub; },
    set() { return true; }, apply() { return stub; }, has() { return true; }, construct() { return stub; } });
  return stub;
}
const ls = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
global.document = makeStub();
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, localStorage: ls, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.localStorage = ls; global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0); global.cancelAnimationFrame = (id) => clearTimeout(id);
const api = new Function(script + "\n;return {malediction,MALEDICTIONS,MALEDICTIONS_EPOQUE,MALEDICTIONS_ITA,MALEDICTIONS_EPOQUE_ITA,CLUBS_ITA,CLUBS_ANG};")();
let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const ITA = api.CLUBS_ITA.map(c => c.id);

console.log("A) Chaque club italien a son mot, de 1990 à 2009");
{
  const trous = [];
  for (const id of ITA) for (let an = 1990; an <= 2009; an++) if (!api.malediction(id, an)) trous.push(id + " " + an);
  ok(!trous.length, ITA.length + " clubs × 20 saisons, aucun silence" + (trous.length ? " — trous : " + trous.slice(0, 8).join(", ") : ""));
  ok(Object.keys(api.MALEDICTIONS_ITA).length === ITA.length && ITA.every(id => api.MALEDICTIONS_ITA[id]), "la table italienne a exactement un mot par club d'ITA-A, et rien d'autre");
}
console.log("B) Aucun code italien n'écrase un mot existant");
{
  const src = html.slice(html.indexOf("const MALEDICTIONS={"), html.indexOf("const MALEDICTIONS_EPOQUE={"));
  const fr = new Set([...src.matchAll(/^ ([A-Z]{2,4}):/gm)].map(m => m[1]));
  ok(ITA.every(id => !fr.has(id)), "aucun des " + ITA.length + " codes italiens n'est une clé française de MALEDICTIONS");
  const ang = new Set((api.CLUBS_ANG || []).map(c => c.id));
  ok(ITA.every(id => !ang.has(id)), "aucun code italien n'est un code anglais");
}
console.log("C) La forme");
{
  const tous = [];
  for (const id of ITA) { tous.push([id, api.MALEDICTIONS_ITA[id]]); for (const [, t] of (api.MALEDICTIONS_EPOQUE_ITA[id] || [])) if (t) tous.push([id, t]); }
  const mal = tous.filter(([, t]) => /[—<>]/.test(t) || !/[.!?]$/.test(t) || (t.match(/[.!?](\s|$)/g) || []).length > 2 || t.length > 220);
  ok(!mal.length, tous.length + " phrases : pas de tiret long ni de chevron, une ou deux phrases, ponctuées, moins de 220 signes" + (mal.length ? " — " + mal.map(m => m[0]).join(", ") : ""));
}
console.log("D) Les époques suivent la saison");
{
  const desordre = Object.entries(api.MALEDICTIONS_EPOQUE_ITA).filter(([, l]) => l.some((e, i) => i && e[0] <= l[i - 1][0]) || l.some(e => e[0] < 1990 || e[0] > 2009));
  ok(!desordre.length, "années d'époque croissantes et dans la fenêtre 1990-2009" + (desordre.length ? " — " + desordre.map(d => d[0]).join(", ") : ""));
  const m = api.malediction;
  ok(/Jamais champion/.test(m("SAM", 1990)) && /première fois/.test(m("SAM", 1991)) && /seul titre/.test(m("SAM", 1995)), "la Sampdoria : maudite en 1990, sacrée en 1991, nostalgique ensuite");
  ok(/Serie B/.test(m("JUV", 2006)) && /premier essai/.test(m("JUV", 2008)) && !/Serie B/.test(m("JUV", 2005)), "la Juventus : le scandale n'existe qu'à partir de 2006");
  ok(/1983/.test(m("ROM", 2000)) && /2001/.test(m("ROM", 2001)), "la Roma : 1983 jusqu'en 2000, le troisième titre ensuite");
  ok(/1974/.test(m("LAZ", 1999)) && /mai 2000/.test(m("LAZ", 2000)) && /Cirio/.test(m("LAZ", 2003)), "la Lazio : 1974, puis 2000, puis la chute de Cragnotti");
  ok(/ânes voleraient/.test(m("CHI", 1995)) && /ânes volent/.test(m("CHI", 2001)) && /premier essai/.test(m("CHI", 2009)), "le Chievo : les ânes volent à partir de 2001");
  ok(/1949/.test(m("LVR", 2003)) && /2004/.test(m("LVR", 2004)), "Livourne : l'attente jusqu'en 2003, le retour en 2004");
  ok(/Maradona toujours là/.test(m("NAP", 1990)) && /héritier/.test(m("NAP", 2000)) && /De Laurentiis/.test(m("NAP", 2009)), "Naples : Maradona, l'héritier introuvable, puis De Laurentiis");
}
console.log("E) Une carrière française n'y voit rien de plus");
{
  ok(api.malediction("AJA", 1995) === "Jamais champion de France, Guy Roux attend son heure depuis 1961." && /Tapie/.test(api.malediction("OM", 1990)), "Auxerre et Marseille disent toujours la même chose");
}
console.log(FAILS === 0 ? "\n✅ MOT DES CLUBS ITALIENS : TOUT EST VERT" : "\n❌ MOT DES CLUBS ITALIENS : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS ? 1 : 0);
