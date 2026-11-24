/* Harnais headless — LES GRANDES LÉGENDES (v3.27)
   A) le prix et le format des achats : la progression les garde, la fusion ne les compte qu'une fois
   B) pour toujours, hors carrière : acheté à l'accueil, il arrive au départ de chaque carrière neuve
   C) une saison : il arrive tout de suite, ne se signe qu'une fois, et repart à l'intersaison
   D) trois saisons : il reste trois saisons, pas une de plus
   E) une légende ne se vend pas, ne se prête pas, ne part pas sur une offre ni sur un incident
   F) le vrai joueur sur les pelouses : Maradona attend à Naples en 1990-91
   G) l'écran : le rayon, huit cartes, la pépite, la fiche ne casse rien au harnais
   H) une carrière de six saisons avec un Platini de 17 ans signé pour toujours
   Usage : node harness-legendes.cjs                                                            */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,clubById,SAISONS,prog,progVide,progNette,progFusionne," +
  "soldePoints,depensePoints,achete,achatPossible,boutiqueHTML,LEGENDES_BOUT,LEG_DE,achatLegPossible,acheteLegende,legPerm,prixAchat," +
  "refusDepart,genOffreExt,eff,ficheLegende,ecranTrophees,DEFIS,DEFIS_CLUB," +
  "getG:function(){return G;},setG:function(x){G=x;}};";
function appareil(ls) { global.localStorage = ls; global.window.localStorage = ls; return new Function(script + epilogue)(); }
let FAILS = 0;
function ok(c, m) { console.log((c ? "  ✔ " : "  ✘ ") + m); if (!c) FAILS++; }
const riche = api => { api.prog().defis = api.DEFIS.concat(api.DEFIS_CLUB).map((d, t) => ({ id: d.id, t })); }; // tous les défis réussis : ~41 500 points
const leg = (G, id) => G.clubs.concat(G.autre || []).flatMap(c => c.joueurs).filter(j => j.legende && j.legende.id === id);
const finirSaison = (api) => { const G = api.getG(); while (!G.finie) api.jouerJournee(); api.intersaison(); };

console.log("A) Prix et format des achats");
{
  const api = appareil(nouveauLS()), p = api.prog(), L = api.LEG_DE.cruyff;
  ok(api.LEGENDES_BOUT.length === 8 && api.LEGENDES_BOUT.every(l => l.top.note > 90 && l.jeune.pot > 90 && l.jeune.age <= 19), "huit légendes, toutes au-dessus de 90, un gamin de 19 ans au plus");
  ok(api.LEGENDES_BOUT.every(l => /^[a-y]+$/.test(l.id) && l.prix[0] < l.prix[1] && l.prix[1] < l.prix[2]), "identifiants propres, prix croissants avec la durée");
  ok(!api.LEGENDES_BOUT.some(l => /—/.test(l.nom + l.poste)), "pas de tiret long");
  ok(api.prixAchat("legcruyffzjeunezun") === L.prix[0] && api.prixAchat("legcruyffztopztoujours") === L.prix[2] && api.prixAchat("legzorroztopzun") === 0, "le prix se lit dans l'article");
  riche(api);
  const s0 = api.soldePoints();
  ok(api.achatLegPossible(L, "top", "un") === "partie", "une location exige une carrière ouverte");
  ok(api.acheteLegende(L, "jeune", "toujours") && api.legPerm("cruyff") === "jeune" && api.soldePoints() === s0 - L.prix[2], "pour toujours : acheté hors carrière, payé, version gardée");
  ok(api.achatLegPossible(L, "top", "toujours") === "acquis" && !api.acheteLegende(L, "top", "toujours"), "une seule fois pour toujours");
  const net = api.progNette(JSON.parse(JSON.stringify(p)));
  ok(net.achats.length === p.achats.length && api.depensePoints() === L.prix[2], "la progression nettoyée garde l'achat, la dépense le compte");
  const a = api.progVide(), b = api.progVide(); a.achats = [p.achats[0]]; b.achats = [p.achats[0]];
  ok(api.progFusionne(a, b).achats.length === 1, "deux appareils : compté une fois");
}

console.log("B) Pour toujours, à chaque carrière neuve");
{
  const api = appareil(nouveauLS()), p = api.prog(); riche(api);
  api.acheteLegende(api.LEG_DE.platini, "top", "toujours");
  const club = api.SAISONS["1995-96"].d1[5];
  api.nouvellePartie(club, "1995-96"); let G = api.getG();
  let l = leg(G, "platini");
  ok(l.length === 1 && l[0].club === club && l[0].note === 96 && l[0].legende.fin === null, "Platini est au club au départ, note 96, pour toujours");
  ok(G.news.some(n => /🌟 Michel Platini est là/.test(n)), "une dépêche le dit");
  ok(l[0].tireurElite && l[0].ego === 7, "son caractère et son pied droit sont fidèles");
  api.nouvellePartie(api.SAISONS["1995-96"].d1[8], "1995-96"); G = api.getG();
  ok(leg(G, "platini").length === 1, "une deuxième carrière neuve : il est encore là");
}

console.log("C) Une saison");
{
  const api = appareil(nouveauLS()), p = api.prog(); riche(api);
  const club = api.SAISONS["1995-96"].d1[2]; api.nouvellePartie(club, "1995-96"); const G = api.getG();
  const L = api.LEG_DE.maradona, n0 = api.clubById(club).joueurs.length;
  ok(api.achatLegPossible(L, "top", "un") === null && api.acheteLegende(L, "top", "un"), "signé pour une saison");
  ok(api.clubById(club).joueurs.length === n0 + 1 && leg(G, "maradona")[0].legende.fin === G.saisonIdx, "il arrive tout de suite, jusqu'à la fin de la saison");
  ok(G.news[0] === "🌟 Diego Maradona signe chez vous pour la saison.", "la dépêche");
  ok(api.achatLegPossible(L, "top", "un") === "club" && api.achatLegPossible(L, "jeune", "trois") === "club", "déjà chez vous : rien d'autre à louer");
  let err = null; try { finirSaison(api); } catch (e) { err = e; }
  ok(!err, "une saison jouée avec lui" + (err ? " : " + err.message : ""));
  ok(leg(G, "maradona").length === 0 && api.clubById(club).joueurs.every(j => j.nom !== "Diego Maradona"), "à l'intersaison, il est reparti");
  ok(api.achatLegPossible(L, "top", "un") === (api.soldePoints() >= L.prix[0] ? null : "points"), "la saison suivante, on peut le relouer");
}

console.log("D) Trois saisons");
{
  const api = appareil(nouveauLS()), p = api.prog(); riche(api);
  const club = api.SAISONS["1995-96"].d1[1]; api.nouvellePartie(club, "1995-96"); const G = api.getG();
  ok(api.acheteLegende(api.LEG_DE.vanbasten, "jeune", "trois"), "Van Basten, 18 ans, pour trois saisons");
  const j = leg(G, "vanbasten")[0]; ok(j.age === 18 && j.note === 73 && j.pot === 95, "le gamin : 18 ans, 73, potentiel 95");
  let err = null, presents = [];
  try { for (let i = 0; i < 4; i++) { finirSaison(api); presents.push(leg(G, "vanbasten").length); } } catch (e) { err = e; }
  ok(!err, "quatre saisons sans erreur" + (err ? " : " + err.message : ""));
  ok(presents.join() === "1,1,0,0", `présent deux intersaisons, parti à la troisième (${presents.join()})`);
}

console.log("E) Une légende ne part pas");
{
  const api = appareil(nouveauLS()), p = api.prog(); riche(api);
  const club = api.SAISONS["1995-96"].d1[0]; api.nouvellePartie(club, "1995-96"); const G = api.getG(), moi = api.clubById(club);
  api.acheteLegende(api.LEG_DE.beckenbauer, "top", "toujours"); const j = leg(G, "beckenbauer")[0];
  ok(j && /légende/.test(api.refusDepart(moi, j) || ""), "ni vente ni prêt : la Ligue refuse, avec une phrase");
  let tire = false; for (let i = 0; i < 300; i++) { const o = api.genOffreExt(); if (o && o.uid === j.uid) tire = true; }
  ok(!tire, "aucune offre étrangère ne le vise");
  api.eff(j, { vend: 1 }); ok(moi.joueurs.includes(j), "un incident qui « vend » le joueur ne l'emporte pas");
}

console.log("F) Le vrai joueur sur les pelouses");
{
  const api = appareil(nouveauLS()), p = api.prog(); riche(api);
  api.acheteLegende(api.LEG_DE.maradona, "top", "toujours");
  api.nouvellePartie("INT", "ITA-1990-91"); const G = api.getG();
  const vrais = G.clubs.concat(G.autre || []).flatMap(c => c.joueurs).filter(j => j.nom === "D. Maradona");
  ok(vrais.length === 1, "le vrai Maradona joue à Naples en 1990-91");
  ok(leg(G, "maradona").length === 0, "la légende attend : jamais deux Maradona");
  ok(api.achatLegPossible(api.LEG_DE.maradona, "top", "un") === "terrain", "la location le dit");
  ok(leg(G, "platini").length === 0 && api.achatLegPossible(api.LEG_DE.platini, "top", "un") === null, "Platini, lui, est libre");
}

console.log("G) L'écran");
{
  const api = appareil(nouveauLS()); riche(api);
  let h = api.boutiqueHTML(false);
  ok(/<h3>Les légendes<\/h3>/.test(h) && (h.match(/data-leg="/g) || []).length === 8, "le rayon et ses huit cartes");
  ok(/lgPep/.test(h) && /Henry en 1995-96/.test(h) && (h.match(/class="boArt/g) || []).length === 8, "hors carrière, la jeune légende montre l'exemple d'Henry ; chaque article a sa ligne");
  api.nouvellePartie(api.SAISONS["1995-96"].d1[0], "1995-96");
  h = api.boutiqueHTML(true); ok(/ans · /.test(h) && !/Henry en 1995-96/.test(h), "en carrière, elle montre la pépite de la saison");
  api.acheteLegende(api.LEG_DE.kopa, "top", "toujours"); h = api.boutiqueHTML(true);
  ok(/POUR TOUJOURS/.test(h), "la carte acquise porte son ruban");
  let err = null; try { api.ficheLegende("cruyff", () => {}); api.ecranTrophees(); } catch (e) { err = e; }
  ok(!err, "la fiche et la salle des trophées ne cassent rien" + (err ? " : " + err.message : ""));
}

console.log("H) Six saisons avec un Platini de 17 ans");
{
  const api = appareil(nouveauLS()), p = api.prog(); riche(api);
  api.acheteLegende(api.LEG_DE.platini, "jeune", "toujours");
  api.nouvellePartie(api.SAISONS["1995-96"].d1[10], "1995-96"); const G = api.getG();
  const j = leg(G, "platini")[0], notes = [j.note];
  let err = null; try { for (let s = 0; s < 6; s++) { finirSaison(api); const x = leg(G, "platini")[0]; notes.push(x ? x.note : null); } } catch (e) { err = e; }
  ok(!err, "six saisons sans erreur" + (err ? " : " + err.stack.split("\n").slice(0, 3).join(" | ") : ""));
  ok(notes.every(n => n != null), "il est toujours là six saisons plus tard");
  ok(notes[6] > notes[0], `il a grandi : ${notes.join(" → ")}`);
}

console.log(FAILS ? `\n${FAILS} ÉCHEC(S)` : "\nTOUT EST VERT");
process.exit(FAILS ? 1 : 0);
