/* Harnais de validation — LES SPONSORS PAR PAYS (v2.01)
   La liste française des sponsors et des équipementiers est ARRÊTÉE PAR L'AUTEUR ; la liste anglaise aussi
   (validée le 15/10/2026, sans Umbro). Ce harnais garde la frontière entre les deux :
   A) une carrière française ne voit QUE la liste française, à l'identique
   B) une carrière anglaise ne voit QUE la liste anglaise, à chaque époque, et jamais Umbro
   C) les deux listes se tiennent : champs, dates, aucun tiret long, aucun chevron
   D) la cérémonie de signature (v2.17) : chaque sponsor tombe dans une famille qui a sa vignette, et chaque vignette
      du jeu existe bien dans img/moments/
   E) l'Italie (v2.85) : une carrière italienne ne voit QUE la liste italienne, à chaque époque, et les deux autres
      pays n'en voient pas un nom
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
  "SPONSORS_RINGARDS_ITA,SPONSORS_PROPRES_ITA,SPONSORS_SULFUREUX_ITA,EQUIPEMENTIERS_ITA,CLUBS_ITA,SIEGES_ITA,intersaison," +
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
  const tous = [...api.SPONSORS_RINGARDS, ...api.SPONSORS_RINGARDS_ANG, ...api.SPONSORS_RINGARDS_ITA].map(s => Object.assign({ ringard: true }, s))
    .concat(api.SPONSORS_PROPRES, api.SPONSORS_PROPRES_ANG, api.SPONSORS_PROPRES_ITA, api.SPONSORS_SULFUREUX, api.SPONSORS_SULFUREUX_ANG, api.SPONSORS_SULFUREUX_ITA);
  ok(tous.every(s => api.IMG_MOMENT[fam(s)]), "chaque sponsor des trois pays a une cérémonie avec sa vignette");
  ok(fam({ nom: "Gauloises", rep: -15, ere: "Une marque de tabac sur le maillot" }) === "sp_vice", "le tabac signe dans le salon enfumé");
  ok(fam({ nom: "Madoff Consulting", rep: -10, defaut: 0.4 }) === "sp_louche", "l'escroc qui peut ne jamais payer sable le champagne");
  ok(fam({ nom: "3615 Ulla", rep: -12 }) === "sp_decale", "le Minitel rose signe sous les néons roses");
  ok(fam({ nom: "Rillettes du Mans", ringard: true, rep: 8 }) === "sp_terroir" && fam({ nom: "X", ringard: true, rep: -3 }) === "sp_decale", "le terroir et le décalé se séparent sur le signe de l'image");
  ok(fam({ nom: "Orange", rep: 1 }) === "sp_national", "la marque nationale signe en salle de réunion");
  const manque = [].concat(...Object.values(api.IMG_MOMENT)).filter(f => !fs.existsSync(path.join(__dirname, f)));
  ok(!manque.length, "toutes les vignettes du jeu sont dans img/moments/" + (manque.length ? " (manque : " + manque.join(", ") + ")" : ""));
}
console.log("E) Une carrière italienne ne voit que la liste italienne (v2.85)");
{
  const IT = new Set([...noms(api.SPONSORS_RINGARDS_ITA), ...noms(api.SPONSORS_PROPRES_ITA), ...noms(api.SPONSORS_SULFUREUX_ITA), ...noms(api.EQUIPEMENTIERS_ITA)]);
  const ids = api.CLUBS_ITA.map(c => c.id), CLE = "ITA-ESSAI";
  for (const an of Object.keys(api.SIEGES_ITA).map(Number)) {
    const S = api.SIEGES_ITA[an];
    api.SAISONS[CLE] = { pays: "ITA", an, titre: an + "-" + String((an + 1) % 100).padStart(2, "0"), nom: "Essai",
      d1: ids.slice(0, 20), d2: ids.slice(20, 40), starsD1: {}, starsD2: {}, euroC1: S.C1, euroC2: S.C2, euroC3: S.C3, sous: "Essai" };
    const vus = new Set([...tirages(CLE, ids[0], 5), ...tirages(CLE, ids[39], 5)]);
    const intrus = [...vus].filter(n => !IT.has(n));
    if (intrus.length) ok(false, an + " : noms hors liste italienne : " + intrus.join(", "));
    const dans = l => l.filter(s => (!s.de || an >= s.de) && (!s.a || an <= s.a)).length;
    if (!(dans(api.SPONSORS_RINGARDS_ITA) && dans(api.SPONSORS_PROPRES_ITA) >= 3 && dans(api.SPONSORS_SULFUREUX_ITA) && dans(api.EQUIPEMENTIERS_ITA) >= 3))
      ok(false, an + " : une famille italienne n'a pas assez de marques de l'époque");
  }
  delete api.SAISONS[CLE];
  ok(true, "les vingt saisons italiennes d'essai ne tirent que des noms italiens, et chaque famille a des marques de l'époque");
  const communs = [...IT].filter(n => FR.has(n) || AN.has(n));
  ok(communs.length === 1 && communs[0] === "Diadora" && !AN.has("Diadora"), "une seule marque partagée, Diadora, que la liste française a aussi après 2000 ; aucune avec l'anglaise" + (communs.length ? " (communes : " + communs.join(", ") + ")" : ""));
  const tout = [...api.SPONSORS_RINGARDS_ITA, ...api.SPONSORS_PROPRES_ITA, ...api.SPONSORS_SULFUREUX_ITA, ...api.EQUIPEMENTIERS_ITA];
  ok(tout.every(s => !/[—<>&]/.test(JSON.stringify(s))), "aucun tiret long, aucun chevron chez les Italiens");
  ok(api.SPONSORS_RINGARDS_ITA.every(s => s.rep > 0 && s.ere) && api.SPONSORS_SULFUREUX_ITA.every(s => s.rep < 0 && s.ere), "le terroir italien rapporte de l'image, les sulfureux en coûtent, tous ont leur phrase");
  ok(api.EQUIPEMENTIERS_ITA[api.EQUIPEMENTIERS_ITA.length - 1].nom === "Sartoria Brambilla", "l'atelier du tailleur ferme la liste italienne");
  ok(api.familleSponsor({ nom: "144 Bollente", rep: -12 }) === "sp_decale", "le téléphone rose italien signe sous les néons roses, comme le Minitel");
  ok(api.familleSponsor(api.SPONSORS_SULFUREUX_ITA.find(s => s.nom === "Fernet-Branca")) === "sp_vice", "l'amer milanais signe dans le salon enfumé");
  ok(api.SPONSORS_SULFUREUX_ITA.filter(s => s.moderne).length === 1, "une seule nouvelle ère italienne, celle des paris en ligne");
}
console.log(FAILS === 0 ? "\n✅ SPONSORS PAR PAYS : TOUT EST VERT" : "\n❌ SPONSORS PAR PAYS : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS ? 1 : 0);
