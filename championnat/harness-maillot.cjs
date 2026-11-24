/* Harnais headless — LE MAILLOT DU CLUB (v3.28)
   A) la coupe suit le rang de l'équipementier, d'après les listes du jeu
   B) à l'intersaison, le maillot de la saison entre au musée avant la remise à zéro du sponsor et de l'équipementier
   C) l'écran Club porte le maillot et, dès la deuxième saison, la galerie
   D) le motif passé à la maquette 3D : rayures du blason, sponsor seulement pour votre club
   E) six saisons de carrière, six maillots rangés, sans erreur
   Usage : node harness-maillot.cjs                                                            */
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
function nouveauLS() {
  return {
    _m: {},
    get length() { return Object.keys(this._m).length; },
    key(i) { return Object.keys(this._m)[i] ?? null; },
    getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; },
  };
}
const noeud = () => { const n = { _h: "", style: {}, querySelector: () => null, querySelectorAll: () => [] };
  Object.defineProperty(n, "innerHTML", { get() { return n._h; }, set(v) { n._h = String(v); } }); return n; };
const APP = noeud(), FICHE = noeud();
const generic = makeStub();
global.document = new Proxy(function () {}, {
  get(_t, p) { if (p === "getElementById") return id => (id === "app" ? APP : id === "fiche" ? FICHE : generic); if (p === Symbol.toPrimitive) return () => ""; return generic; },
  set() { return true; }, apply() { return generic; }, has() { return true; }, construct() { return generic; },
});
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, location: { href: "" }, scrollTo() {}, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0); global.cancelAnimationFrame = (id) => clearTimeout(id);

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,clubById,montre,ecranClub,cachetEquip,coupeMaillot,maillotClubHTML,archiveMaillot,motif3D,BLASONS," +
  "getG:function(){return G;}};";
function appareil(ls) { global.localStorage = ls; global.window.localStorage = ls; return new Function(script + epilogue)(); }
let FAILS = 0;
function ok(c, m) { console.log((c ? "  ✔ " : "  ✘ ") + m); if (!c) FAILS++; }
const finirSaison = api => { const G = api.getG(); while (!G.finie) api.jouerJournee(); api.intersaison(); };

console.log("A) La coupe");
{
  const api = appareil(nouveauLS());
  ok(api.cachetEquip("Uhlsport") === 1 && api.cachetEquip("Mitre") === 0.78 && api.cachetEquip("Le Grand Échalas") === 0.14 && api.cachetEquip(null) === null, "le rang se lit dans les listes du jeu");
  ok(api.coupeMaillot(1).col === "polo" && api.coupeMaillot(0.78).col === "v" && api.coupeMaillot(0.55).raglan && api.coupeMaillot(0.14).maison && api.coupeMaillot(null).nu, "polo, V, raglan, atelier, et maillot nu sans équipementier");
}
console.log("B) Le musée des maillots");
{
  const api = appareil(nouveauLS()); api.nouvellePartie("MET", "1995-96"); const G = api.getG();
  G.sponsor = { nom: "Cochonou" }; G.equip = { nom: "Uhlsport" };
  let err = null; try { finirSaison(api); } catch (e) { err = e; }
  ok(!err, "une saison jouée" + (err ? " : " + err.message : ""));
  ok(G.maillots && G.maillots.length === 1 && G.maillots[0].s === "1995-96" && G.maillots[0].sp === "Cochonou" && G.maillots[0].eq === "Uhlsport" && G.maillots[0].c === "MET", "le maillot de 1995-96 est rangé avec son sponsor et son équipementier");
  ok(G.sponsor === null, "le sponsor repart à zéro ensuite, comme avant");
}
console.log("C) L'écran Club");
{
  const api = appareil(nouveauLS()); api.nouvellePartie("MET", "1995-96"); const G = api.getG();
  let h = api.maillotClubHTML();
  ok(/mlVitrine/.test(h) && /Sans sponsor/.test(h) && !/mlGal/.test(h), "première saison : le maillot nu, pas encore de galerie");
  G.sponsor = { nom: "Amora" }; G.equip = { nom: "Mitre" }; h = api.maillotClubHTML();
  ok(/Amora/.test(h) && /Mitre/.test(h), "le sponsor et l'équipementier sont nommés");
  G.maillots = [{ s: "1994-95", c: "MET", sp: "Teisseire", eq: "Duarig" }]; h = api.maillotClubHTML();
  ok((h.match(/class="mlCase/g) || []).length === 2 && /mlCase ici/.test(h) && /1994-95/.test(h), "la galerie : la saison passée, puis celle en cours");
  ok(!/—/.test(h), "pas de tiret long");
  let err = null; try { api.ecranClub(); } catch (e) { err = e; } ok(!err, "l'écran Club se dessine" + (err ? " : " + err.message : ""));
  ok(/mlClub/.test(APP.innerHTML), "le maillot est sur l'écran Club");
}
console.log("D) Le maillot dans la maquette 3D");
{
  const api = appareil(nouveauLS()); api.nouvellePartie("MET", "1995-96"); const G = api.getG();
  G.sponsor = { nom: "Cochonou" };
  const m = api.motif3D(api.clubById("MET"), [api.BLASONS.MET.a, api.BLASONS.MET.b]), n = api.motif3D({ id: "NAN" }, [api.BLASONS.NAN.a, api.BLASONS.NAN.b]);
  ok(m && m.type === "plain" && m.sponsor === true && m.col === api.BLASONS.MET.b, "Metz : uni, col blanc, votre sponsor sur la poitrine");
  ok(n && n.type === "stripes" && n.sponsor === false, "Nantes : rayé, sans sponsor");
  ok(api.motif3D({ id: "ZZZ" }, ["#000000", "#ffffff"]) === null, "un club inconnu garde le maillot uni");
}
console.log("E) Six saisons");
{
  const api = appareil(nouveauLS()); api.nouvellePartie("MET", "1995-96"); const G = api.getG();
  let err = null; try { for (let i = 0; i < 6; i++) finirSaison(api); } catch (e) { err = e; }
  ok(!err, "six saisons sans erreur" + (err ? " : " + err.stack.split("\n").slice(0, 3).join(" | ") : ""));
  ok(G.maillots.length === 6 && G.maillots.map(x => x.s).join() === "1995-96,1996-97,1997-98,1998-99,1999-00,2000-01", "six maillots rangés, dans l'ordre");
}
console.log(FAILS ? `\n${FAILS} ÉCHEC(S)` : "\nTOUT EST VERT");
process.exit(FAILS ? 1 : 0);
