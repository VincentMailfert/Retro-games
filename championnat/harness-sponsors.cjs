/* Harnais de validation — LES SPONSORS PAR PAYS (v2.01)
   La liste française des sponsors et des équipementiers est ARRÊTÉE PAR L'AUTEUR ; la liste anglaise aussi
   (validée le 15/10/2026, sans Umbro). Ce harnais garde la frontière entre les deux :
   A) une carrière française ne voit QUE la liste française, à l'identique
   B) une carrière anglaise ne voit QUE la liste anglaise, à chaque époque, et jamais Umbro
   C) les deux listes se tiennent : champs, dates, aucun tiret long, aucun chevron
   D) la cérémonie de signature (v2.17) : chaque sponsor tombe dans une famille qui a sa vignette, et chaque vignette
      du jeu existe bien dans img/moments/
   Usage : node harness-sponsors.cjs                                                                   */
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
/* un vrai petit nœud pour #app : il retient la page que le jeu lui écrit, seul moyen de lire l'écran
   d'accueil et le bandeau en jeu tels qu'un joueur les voit */
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
const api = new Function(script + "\n;return {SAISONS,nouvellePartie,genSponsors,genEquip,sponsorsDispo," +
  "SPONSORS_RINGARDS,SPONSORS_PROPRES,SPONSORS_SULFUREUX,EQUIPEMENTIERS," +
  "SPONSORS_RINGARDS_ANG,SPONSORS_PROPRES_ANG,SPONSORS_SULFUREUX_ANG,EQUIPEMENTIERS_ANG," +
  "familleSponsor,IMG_MOMENT,getG:function(){return G;}};")();
let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const noms = l => new Set(l.map(x => x.nom));
const FR = new Set([...noms(api.SPONSORS_RINGARDS), ...noms(api.SPONSORS_PROPRES), ...noms(api.SPONSORS_SULFUREUX), ...noms(api.EQUIPEMENTIERS)]);
const AN = new Set([...noms(api.SPONSORS_RINGARDS_ANG), ...noms(api.SPONSORS_PROPRES_ANG), ...noms(api.SPONSORS_SULFUREUX_ANG), ...noms(api.EQUIPEMENTIERS_ANG)]);
function tirages(cle, club, n) {
  const vus = new Set();
  for (let i = 0; i < n; i++) {
    api.nouvellePartie(club, cle);
    for (const o of api.genSponsors(1)) vus.add(o.nom);
    for (const o of api.genEquip()) vus.add(o.nom);
  }
  return vus;
}
console.log("A) Une carrière française ne voit que la liste française");
for (const cle of Object.keys(api.SAISONS).filter(k => (api.SAISONS[k].pays || "FR") === "FR")) {
  const S = api.SAISONS[cle], vus = tirages(cle, S.d1[0], 4);
  const intrus = [...vus].filter(n => !FR.has(n));
  if (intrus.length) ok(false, cle + " : noms hors liste française : " + intrus.join(", "));
}
ok(true, "les vingt saisons françaises ne tirent que des noms de la liste française");
console.log("B) Une carrière anglaise ne voit que la liste anglaise");
for (const cle of Object.keys(api.SAISONS).filter(k => api.SAISONS[k].pays === "ANG")) {
  const S = api.SAISONS[cle], vus = new Set([...tirages(cle, S.d1[0], 6), ...tirages(cle, S.d2[S.d2.length - 1], 6)]);
  const intrus = [...vus].filter(n => !AN.has(n));
  ok(!intrus.length, cle + " : " + vus.size + " noms tirés, tous anglais" + (intrus.length ? " — intrus : " + intrus.join(", ") : ""));
}
ok(!AN.has("Umbro") && ![...AN].some(n => FR.has(n) && n !== "Mitre"), "pas d'Umbro, et une seule marque partagée avec la liste française : Mitre, qui y finit en 1999 et revient ici en 2000");
ok(api.EQUIPEMENTIERS_ANG.filter(e => e.de === 2000).length === 4, "après 2000, quatre équipementiers anglais, Mitre à la place d'Umbro");
// les anglais à chaque époque : jamais d'offre vide ni de repli sur une autre liste
for (const an of [1990, 1995, 2000, 2005, 2009]) {
  const dans = l => l.filter(s => (!s.de || an >= s.de) && (!s.a || an <= s.a)).length;
  ok(dans(api.SPONSORS_RINGARDS_ANG) && dans(api.SPONSORS_PROPRES_ANG) >= 3 && dans(api.SPONSORS_SULFUREUX_ANG) && dans(api.EQUIPEMENTIERS_ANG) >= 3,
    an + " : chaque famille anglaise a des marques de l'époque");
}
console.log("C) Les listes se tiennent");
{
  const tout = [...api.SPONSORS_RINGARDS_ANG, ...api.SPONSORS_PROPRES_ANG, ...api.SPONSORS_SULFUREUX_ANG, ...api.EQUIPEMENTIERS_ANG];
  ok(tout.every(s => !/[—<>&]/.test(JSON.stringify(s))), "aucun tiret long, aucun chevron dans les marques et leurs phrases");
  ok(api.SPONSORS_RINGARDS_ANG.every(s => s.rep > 0 && s.ere) && api.SPONSORS_SULFUREUX_ANG.every(s => s.rep < 0 && s.ere), "le terroir rapporte de l'image, les sulfureux en coûtent, et tous ont leur phrase");
  ok(api.EQUIPEMENTIERS_ANG[api.EQUIPEMENTIERS_ANG.length - 1].nom === "Sunday League Kits", "l'atelier du pub ferme la liste des équipementiers, comme Le Grand Échalas");
}
console.log("D) La cérémonie de signature (v2.17)");
{
  const fam = api.familleSponsor;
  const tous = [...api.SPONSORS_RINGARDS, ...api.SPONSORS_RINGARDS_ANG].map(s => Object.assign({ ringard: true }, s))
    .concat(api.SPONSORS_PROPRES, api.SPONSORS_PROPRES_ANG, api.SPONSORS_SULFUREUX, api.SPONSORS_SULFUREUX_ANG);
  ok(tous.every(s => api.IMG_MOMENT[fam(s)]), "chaque sponsor des deux pays a une cérémonie avec sa vignette");
  ok(fam({ nom: "Gauloises", rep: -15, ere: "Une marque de tabac sur le maillot" }) === "sp_vice", "le tabac signe dans le salon enfumé");
  ok(fam({ nom: "Madoff Consulting", rep: -10, defaut: 0.4 }) === "sp_louche", "l'escroc qui peut ne jamais payer sable le champagne");
  ok(fam({ nom: "3615 Ulla", rep: -12 }) === "sp_decale", "le Minitel rose signe sous les néons roses");
  ok(fam({ nom: "Rillettes du Mans", ringard: true, rep: 8 }) === "sp_terroir" && fam({ nom: "X", ringard: true, rep: -3 }) === "sp_decale", "le terroir et le décalé se séparent sur le signe de l'image");
  ok(fam({ nom: "Orange", rep: 1 }) === "sp_national", "la marque nationale signe en salle de réunion");
  const manque = [].concat(...Object.values(api.IMG_MOMENT)).filter(f => !fs.existsSync(path.join(__dirname, f)));
  ok(!manque.length, "toutes les vignettes du jeu sont dans img/moments/" + (manque.length ? " (manque : " + manque.join(", ") + ")" : ""));
}
console.log(FAILS === 0 ? "\n✅ SPONSORS PAR PAYS : TOUT EST VERT" : "\n❌ SPONSORS PAR PAYS : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS ? 1 : 0);
