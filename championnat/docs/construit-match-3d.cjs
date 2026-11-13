/* Remplit docs/prototype-match-3d.html avec trois VRAIS matchs du moteur (simuleMatch, mode verbeux, celui du direct).
   Usage, depuis championnat/ :  node docs/construit-match-3d.cjs
   Les onze, les couleurs des blasons et le fil des lignes sont ceux du jeu. Rejouable : chaque passe tire trois nouveaux
   matchs (avec au moins trois buts, un corner annoncé, un carton et un poteau, pour que tout se voie). */
const fs = require("fs"), path = require("path");
const RACINE = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(RACINE, "index.html"), "utf8");
const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</scr" + "ipt>"));
function makeStub() {
  let s; const fn = function () { return s; };
  s = new Proxy(fn, { get(_t, p) { if (p === Symbol.toPrimitive) return () => ""; if (p === "length") return 0; if (p === "forEach" || p === "map") return () => []; return s; },
    set() { return true; }, apply() { return s; }, has() { return true; }, construct() { return s; } });
  return s;
}
const generic = makeStub();
global.document = new Proxy(function () {}, { get(_t, p) { if (p === "getElementById") return () => generic; if (p === "querySelectorAll") return () => []; if (p === Symbol.toPrimitive) return () => ""; return generic; },
  set() { return true; }, apply() { return generic; }, has() { return true; }, construct() { return generic; } });
const ls = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; }, get length() { return Object.keys(this._m).length; }, key(i) { return Object.keys(this._m)[i] ?? null; } };
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, localStorage: ls, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.localStorage = ls; global.navigator = { userAgent: "h" };
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = cb => setTimeout(cb, 0); global.cancelAnimationFrame = id => clearTimeout(id);
const api = new Function(script + "\n;return {nouvellePartie,simuleMatch,onze,getG:()=>G,BLASONS,clubById};")();

api.nouvellePartie("LEN");
const G = api.getG();
function equipe(id) { const c = api.clubById(id);
  return { id: c.id, nom: c.nom, stade: c.stade, cap: c.cap, couleurs: api.BLASONS[c.id], xi: api.onze(c).map(j => ({ nom: j.nom, pos: j.pos })) }; }
function cherche(h, a, meteo, heure) {
  for (let k = 0; k < 6000; k++) {
    const r = api.simuleMatch(api.clubById(h), api.clubById(a), true), ev = r.ev, x0 = ev[0].x;
    const ok = (r.sh + r.sa) >= 3 && (r.sh + r.sa) <= 6 && r.sh > 0 && r.sa > 0 && ev.some(e => e.ca) && ev.some(e => e.c)
      && ev.some(e => /POTEAU|BARRE|transversale/i.test(e.x)) && (meteo ? meteo.test(x0) : !/spectateurs\. \S/.test(x0));
    if (!ok) continue;
    return { heure, dom: equipe(h), ext: equipe(a), sh: r.sh, sa: r.sa, ev: ev.map(e => {
      const o = { m: e.m, t: e.t, x: e.x }; for (const k of ["ic", "ca"]) if (e[k]) o[k] = e[k];
      if (e.g) o.g = { cote: e.g.cote, but: e.g.but, pas: e.g.pas, sh: e.g.sh, sa: e.g.sa, ph: e.g.ph, cf: e.g.cf, pen: e.g.pen };
      if (e.q) o.q = { cote: e.q.cote, but: e.q.but, ph: e.q.ph };
      if (e.c) o.c = { cote: e.c.cote, nom: e.c.nom, rouge: e.c.rouge };
      return o; }) };
  }
  throw new Error("Aucun match assez riche pour " + h + "-" + a);
}
const M = [cherche("PSG", "NAN", null, "nuit")];
G.journee = 14; M.push(cherche("LEN", "LIL", /Il pleut/, "soir"));
G.journee = 21; M.push(cherche("STE", "LYO", /Il neige/, "jour"));
const cible = path.join(__dirname, "prototype-match-3d.html");
const page = fs.readFileSync(cible, "utf8");
const neuf = page.replace(/\/\*MATCHS\*\/[\s\S]*?\/\*FIN\*\//, () => "/*MATCHS*/" + JSON.stringify(M) + "/*FIN*/");
if (neuf === page && !page.includes("/*MATCHS*/")) throw new Error("Marqueurs /*MATCHS*/ /*FIN*/ introuvables");
fs.writeFileSync(cible, neuf);
for (const m of M) console.log(m.dom.id, m.sh + "-" + m.sa, m.ext.id, "·", m.ev.length, "lignes ·", m.ev[0].x);
