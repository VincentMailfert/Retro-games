/* Harnais headless — LA CARRIÈRE D'ENTRAÎNEUR (chantier carriere-entraineur, livraison 1)
   Le joueur choisit un pays et une année ; le jeu lui tend les trois effectifs les plus faibles de la division
   la plus basse, et le président annonce une durée (1 ou 2 saisons) et un objectif lu au niveau réel du club.
   A) sur TOUTES les saisons : trois offres, toutes en deuxième division, les trois effectifs les plus faibles
   B) l'objectif suit le rang de force (titre, montée ou Europe, première moitié, maintien)
   C) signer : le mode, la réputation à une étoile, le contrat, l'objectif du président
   D) le mode de toujours ne bouge pas : sans offre, ni `mode` ni `coach`, l'objectif au prestige
   E) la carrière d'entraîneur se sauvegarde, se recharge, et l'accueil montre ses étoiles
   F) l'écran : le bouton de l'accueil (fermé sur une saison fermée), les trois clubs, le contrat, les étoiles
   G) une saison entière se joue, et l'intersaison garde le mode et relit l'objectif au rang de force
   Usage : node harness-entraineur.cjs                                                               */
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
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0); global.cancelAnimationFrame = (id) => clearTimeout(id);

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,clubById,sauvegardeLocale,chargeLocale,partiesListe," +
  "ecranAccueil,SAISONS,SAISONS_OUVERTES,saisonOuverte,offresDebut,forceReelle,forceEffectif,nivDuRang,objectifEntr,objectifDuClub," +
  "objectifPour,ecranEntraineur,contratEntraineur,etoiles,montre," +
  "getG:function(){return G;},setG:function(x){G=x;},setAccueil:function(k){SAISON_ACCUEIL=k;},getPARTIE:function(){return PARTIE;}};";
function appareil(ls) { global.localStorage = ls; global.window.localStorage = ls; return new Function(script + epilogue)(); }
function reel(fn) { global.window.__TEST__ = false; try { return fn(); } finally { global.window.__TEST__ = true; } }

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };

const api = appareil(nouveauLS());
const S = api.SAISONS;
const cles = Object.keys(S);

console.log("A) les offres du premier été, sur les " + cles.length + " saisons");
{
  let malTrois = [], horsD2 = [], pasLesPlusFaibles = [], objFaux = [], dureeFausse = [];
  for (const k of cles) {
    const s = S[k], l = api.offresDebut(k);
    if (l.length !== 3 || new Set(l.map(o => o.id)).size !== 3) malTrois.push(k);
    if (l.some(o => !s.d2.includes(o.id))) horsD2.push(k);
    const f = s.d2.map(id => api.forceReelle(s, id)).sort((a, b) => a - b);
    if (l.some(o => api.forceReelle(s, o.id) > f[2] + 1e-9)) pasLesPlusFaibles.push(k);
    // le maintien, ou la première moitié quand le président est exigeant (et seulement alors)
    if (l.some(o => o.obj.niv !== (o.exig ? 1 : 0) || o.obj.place !== (o.exig ? Math.floor(s.d2.length / 2) : s.d2.length - 3))) objFaux.push(k);
    if (l.some(o => o.duree !== 1 && o.duree !== 2)) dureeFausse.push(k);
  }
  ok(!malTrois.length, "trois clubs différents à chaque saison" + (malTrois.length ? " : " + malTrois.join(", ") : ""));
  ok(!horsD2.length, "tous en deuxième division" + (horsD2.length ? " : " + horsD2.join(", ") : ""));
  ok(!pasLesPlusFaibles.length, "ce sont les trois effectifs les plus faibles" + (pasLesPlusFaibles.length ? " : " + pasLesPlusFaibles.join(", ") : ""));
  ok(!objFaux.length, "le président leur demande le maintien, ou la première moitié s'il est exigeant" + (objFaux.length ? " : " + objFaux.join(", ") : ""));
  // environ un président sur cinq est exigeant : 1 200 offres, écart-type ~1,2 point, fenêtre de ±5 points
  let ex = 0, tot = 0; for (let i = 0; i < 400; i++) api.offresDebut("1995-96").forEach(o => { tot++; if (o.exig) ex++; });
  ok(ex / tot > 0.15 && ex / tot < 0.25, "un président exigeant sur cinq environ (" + (100 * ex / tot).toFixed(1) + " %)");
  ok(!dureeFausse.length, "un contrat d'une ou deux saisons");
  const durees = new Set(); for (let i = 0; i < 40; i++) api.offresDebut("1995-96").forEach(o => durees.add(o.duree));
  ok(durees.has(1) && durees.has(2), "les deux durées sortent");
  // aucun grand club : l'OM de 1995-96 est en D2, mais c'est l'un des effectifs les plus forts
  ok(!api.offresDebut("1995-96").some(o => o.id === "OM"), "l'OM de 1995-96, en D2, n'est jamais proposé");
}

console.log("B) l'objectif suit le rang de force");
{
  const n = r => api.nivDuRang(r, 20);
  ok(n(1) === 3 && n(2) === 3, "les deux premiers jouent le titre");
  ok(n(3) === 2 && n(6) === 2, "de 3 à 6 : la montée (ou l'Europe)");
  ok(n(7) === 1 && n(12) === 1, "de 7 à 12 : la première moitié");
  ok(n(13) === 0 && n(20) === 0, "de 13 à 20 : le maintien");
  const m2 = api.objectifEntr(2, 2, 20), e1 = api.objectifEntr(2, 1, 20), t = api.objectifEntr(3, 1, 20), mt = api.objectifEntr(0, 1, 20);
  ok(m2.place === 3 && m2.label === "La montée (top 3)", "en D2 : « " + m2.label + " »");
  ok(e1.place === 5 && e1.label === "L'Europe (top 5)", "en D1 : « " + e1.label + " »");
  ok(t.place === 1 && t.label === "Le titre", "« " + t.label + " »");
  ok(mt.place === 17 && mt.label === "Le maintien (top 17)", "« " + mt.label + " »");
  ok(!/—/.test([m2, e1, t, mt].map(o => o.label).join("")), "aucun tiret long");
}

console.log("C) signer");
{
  const o = api.offresDebut("1995-96")[0];
  api.nouvellePartie(o.id, "1995-96", o);
  const G = api.getG();
  ok(G.mode === "entraineur", "la partie est une carrière d'entraîneur");
  ok(G.coach && G.coach.rep === 20 && G.coach.repMax === 20 && api.etoiles(G.coach.rep) === "★☆☆☆☆", "réputation : une étoile");
  ok(G.coach.contrat.club === o.id && G.coach.contrat.duree === o.duree && G.coach.contrat.reste === o.duree && G.coach.contrat.saison === "1995-96", "le contrat est retenu");
  ok(G.objectif.place === o.obj.place && G.objectif.label === o.obj.label, "l'objectif du président est celui du contrat (« " + G.objectif.label + " »)");
  ok(G.monClub === o.id && G.div === 2, "on dirige le club choisi, en deuxième division");
  ok(/^Contrat signé/.test(G.news[0]), "la première dépêche : « " + G.news[0] + " »");
}

console.log("D) le mode de toujours ne bouge pas");
{
  for (const [id, k] of [["OM", "1995-96"], ["PSG", "1995-96"], ["MUN", "ANG-1995-96"]]) {
    api.nouvellePartie(id, k);
    const G = api.getG(), c = api.clubById(id);
    ok(G.mode === undefined && G.coach === undefined, id + " : ni mode ni entraîneur");
    ok(G.objectif.label === api.objectifPour(c.pres).label, id + " : l'objectif au prestige (« " + G.objectif.label + " »)");
    ok(!/☆/.test(APP._h), id + " : pas d'étoiles dans le bandeau");
  }
}

console.log("E) sauvegarde et rechargement");
{
  const ls = nouveauLS(), a = appareil(ls);
  const o = a.offresDebut("ANG-1995-96")[1];
  a.nouvellePartie(o.id, "ANG-1995-96", o);
  for (let i = 0; i < 3; i++) a.jouerJournee();
  ok(reel(() => a.sauvegardeLocale(true)), "la carrière se sauvegarde");
  const b = appareil(ls), l = b.partiesListe();
  ok(l.length === 1 && l[0].entr === 20, "l'index retient la réputation");
  ok(b.chargeLocale(l[0].id), "elle se recharge");
  const G = b.getG();
  ok(G.mode === "entraineur" && G.coach.contrat.club === o.id && G.journee === 3 && G.pays === "ANG", "mode, contrat, journée et pays sont là");
  let err = null; try { for (let i = 0; i < 3; i++) b.jouerJournee(); } catch (e) { err = e; }
  ok(!err, "elle se rejoue" + (err ? " : " + err.message : ""));
  b.setG(null); b.ecranAccueil();
  ok(APP._h.includes("★☆☆☆☆"), "l'accueil montre ses étoiles sur la carte de la carrière");
}

console.log("F) l'écran");
{
  api.setG(null); api.setAccueil("1995-96"); api.ecranAccueil();
  ok(/id="bEntr" style="width:100%">/.test(APP._h), "le bouton de l'accueil est là, ouvert sur une saison ouverte");
  const ferme = cles.find(k => !api.saisonOuverte(k));
  api.setAccueil(ferme); api.ecranAccueil();
  ok(/id="bEntr" style="width:100%" disabled>/.test(APP._h), "fermé sur une saison fermée (" + ferme + ")");
  api.setAccueil("1995-96"); api.ecranEntraineur();
  ok((FICHE._h.match(/class="startclub entrClub"/g) || []).length === 3, "trois clubs à l'écran");
  ok(!/—/.test(FICHE._h), "aucun tiret long");
  const o = api.offresDebut("1995-96")[0];
  api.contratEntraineur(o);
  ok(FICHE._h.includes("Signer") && FICHE._h.includes(o.obj.label) && FICHE._h.includes("Le président"), "le contrat : président, objectif, signature");
  const ex = Object.assign({}, o, { exig: true, obj: api.objectifEntr(1, 2, 20) }); api.contratEntraineur(ex);
  ok(FICHE._h.includes("La première moitié (top 10)") && FICHE._h.includes("Pas une place de moins"), "le président exigeant parle de la première moitié");
  ok(!/—/.test(FICHE._h), "aucun tiret long dans le contrat");
  api.nouvellePartie(o.id, "1995-96", o); api.getG().intro = null; api.montre("calendrier");
  ok(APP._h.includes("★☆☆☆☆"), "les étoiles dans le bandeau du jeu");
}

console.log("G) une saison entière, puis l'intersaison");
{
  const o = api.offresDebut("1998-99")[2];
  api.nouvellePartie(o.id, "1998-99", o);
  let G = api.getG(), err = null;
  try { while (G.journee < 38 && !G.finie) { api.jouerJournee(); G = api.getG(); } } catch (e) { err = e; }
  ok(!err, "trente-huit journées jouées" + (err ? " : " + err.stack : ""));
  ok(G.finie, "la saison est finie");
  G.vire = null; api.intersaison(); G = api.getG();
  ok(G.mode === "entraineur" && G.coach && G.coach.rep === 20, "l'entraîneur est toujours là");
  // l'état de grâce tombe APRÈS la parole du président (un joueur vit la saison de sa vie, en secret) : le
  // président ne le connaît pas, on le retire donc avant de refaire son calcul
  const sansGrace = G.clubs.map(c => ({ id: c.id, joueurs: c.joueurs.map(j => ({ pos: j.pos, note: j.note - (j.grace ? j.graceBonus : 0) })) }));
  const att = api.objectifDuClub(sansGrace.find(c => c.id === G.monClub), sansGrace, G.div);
  ok(G.objectif.label === att.label && G.objectif.place === att.place, "l'objectif est relu au rang de force : « " + G.objectif.label + " »");
}

console.log(FAILS ? "\n✗ " + FAILS + " échec(s)" : "\n✓ tout est vert");
process.exit(FAILS ? 1 : 0);
