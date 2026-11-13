/* Harnais du MATCH EN MAQUETTE 3D (v2.89)
     A) le bloc MATCH3D du jeu est exactement celui du prototype (on ne le retouche jamais dans index.html)
     B) la greffe est rejouable : une deuxième passe ne change rien
     C) sans DOM (harnais, serveur), la maquette reste inerte : aucune requête, aucune exception, le direct joue comme avant
     D) le direct parle à la maquette aux bons endroits : la montée, la ligne suivante, l'après-but
   Usage : node harness-match3d.cjs */
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const proto = fs.readFileSync(path.join(__dirname, "docs", "prototype-match-3d.html"), "utf8");
let F = 0; const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) F++; };
const DEBUT = "/* ---- MATCH3D : DÉBUT ----", FIN = "/* ---- MATCH3D : FIN ---- */";
const bloc = t => { const a = t.indexOf(DEBUT), b = t.indexOf(FIN); return a >= 0 && b > a ? t.slice(a, b + FIN.length).replace(/\r\n/g, "\n") : null; };

console.log("A) Le bloc du jeu est celui du prototype");
ok(bloc(proto), "le prototype porte ses marqueurs");
ok(bloc(html) && bloc(html) === bloc(proto), "index.html porte le même bloc, au caractère près");

console.log("B) La greffe est rejouable");
{ const avant = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  execFileSync("node", [path.join(__dirname, "docs", "greffe-match-3d.cjs")], { cwd: __dirname, stdio: "pipe" });
  ok(fs.readFileSync(path.join(__dirname, "index.html"), "utf8") === avant, "une passe de plus ne change pas un octet"); }

console.log("C) Au harnais (sans vrai navigateur), la maquette reste inerte");
{ const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</scr" + "ipt>"));
  let requetes = 0;
  function makeStub() { let st; const fn = function () { return st; };
    st = new Proxy(fn, { get(_t, p) { if (p === Symbol.toPrimitive) return () => ""; if (p === "length") return 0; if (p === "forEach" || p === "map") return () => []; return st; },
      set() { return true; }, apply() { return st; }, has() { return true; }, construct() { return st; } }); return st; }
  const generic = makeStub();
  global.document = new Proxy(function () {}, { get(_t, p) { if (p === "getElementById") return () => generic; if (p === "querySelectorAll") return () => []; if (p === Symbol.toPrimitive) return () => ""; return generic; },
    set() { return true; }, apply() { return generic; }, has() { return true; }, construct() { return generic; } });
  global.getComputedStyle = () => makeStub();
  global.requestAnimationFrame = cb => setTimeout(cb, 0); global.cancelAnimationFrame = id => clearTimeout(id);
  global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
  global.localStorage = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; }, get length() { return 0; }, key() { return null; } };
  global.navigator = { userAgent: "h" }; global.fetch = () => { requetes++; return Promise.reject(new Error("pas de réseau")); };
  const api = new Function(script + "\n;return {nouvellePartie, jouerJournee, match3dOuvre, match3dLigne, match3dAnnonce, match3dSuite, match3dFerme, match3dActif, stadeDirectOuvre, stadeDirectLigne, getG:()=>G};")();
  api.nouvellePartie("LEN"); const G = api.getG();
  let pepin = null;
  try {
    api.stadeDirectOuvre(G.clubs[0], G.clubs[1]);
    api.match3dOuvre(G.clubs[0], G.clubs[1], {}, ["#ff0000", "#ffffff"], ["#0000ff", "#ffffff"], { cap: 20000 });
    api.match3dLigne({ m: 0, t: "sys", x: "Coup d'envoi" }); api.match3dAnnonce({ m: 3, t: "but", g: { cote: "LEN" } }, 2300);
    api.match3dSuite({ m: 4, t: "occ", q: { bu: true } }, 2300); api.match3dFerme();
    for (let d = 0; d < 3; d++) api.jouerJournee();
  } catch (e) { pepin = e.message; }
  ok(!pepin, pepin || "ouvrir, parler, fermer, puis trois journées : aucune exception");
  ok(!api.match3dActif(), "aucune maquette n'est vivante");
  ok(requetes === 0, "aucune requête réseau");
}

console.log("D) Le direct parle à la maquette");
ok((html.match(/match3dAnnonce\(lg, \(3-etape\)\*Math\.max\(650,tickerDelai\)\)/g) || []).length === 2, "la montée de tension annonce la ligne, dans les deux directs");
ok((html.match(/match3dSuite\(lignes\[i\], tickerDelai\);\n    apres\(courante, tickerDelai\);/g) || []).length === 2, "la ligne suivante est annoncée avant chaque tic, dans les deux directs");
ok((html.match(/match3dSuite\(lignes\[i\], d\); apres\(courante,d\);/g) || []).length === 2, "après le flash d'un but, le temps de rejouer l'engagement");
ok(/function stadeDirectLigne\(l\)\{\n  match3dLigne\(l\);/.test(html), "chaque ligne lue passe par la maquette");
ok(/function stadeDirectFerme\(\)\{ match3dFerme\(\);/.test(html), "quitter le direct ferme la maquette");

console.log(F ? "\n❌ HARNAIS MATCH 3D : " + F + " ÉCHEC(S)" : "\n✅ HARNAIS MATCH 3D : TOUT EST VERT");
process.exit(F ? 1 : 0);
