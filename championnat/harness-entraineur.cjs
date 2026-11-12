/* Harnais headless — LA CARRIÈRE D'ENTRAÎNEUR (chantier carriere-entraineur, livraison 1)
   Le joueur choisit un pays et une année ; le jeu lui tend les trois effectifs les plus faibles de la division
   la plus basse, et le président annonce une durée (1 ou 2 saisons) et un objectif lu au niveau réel du club.
   A) sur TOUTES les saisons : trois offres, toutes en deuxième division, les trois effectifs les plus faibles
   B) l'objectif suit le rang de force (titre, montée ou Europe, première moitié, maintien)
   C) signer : le mode, la réputation à une étoile, le contrat, l'objectif du président
   D) le mode de toujours ne bouge pas : sans offre, ni `mode` ni `coach`, l'objectif au prestige
   E) la carrière d'entraîneur se sauvegarde, se recharge, et l'accueil montre ses étoiles
   F) l'écran : le bouton de l'accueil (fermé sur une saison fermée), les trois clubs, le contrat, les étoiles
   G) le verdict de la saison : dépassé, tenu, manqué (livraison 2)
   H) une saison entière : le verdict, la réputation, l'almanach, l'été
   I) les offres de l'été, cas par cas (suite, prolongation, clubs plus forts ou plus modestes, club disparu, fin)
   J) signer l'été : la vraie saison suivante, le vrai effectif, la même carrière
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
  "objectifPour,ecranEntraineur,contratEntraineur,etoiles,montre,verdictSaison,preparerEte,basculeSaison,echelle,ecranBilan,cleDepart,ecranCalendrier," +
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
    G.intro = null; APP._h = ""; api.ecranCalendrier(); // montre() ne dessine rien sous le harnais : on dessine l'écran du match
    ok(APP._h.includes("JOUER LE MATCH") && !/☆/.test(APP._h), id + " : pas d'étoiles dans le bandeau");
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
  api.nouvellePartie(o.id, "1995-96", o); api.getG().intro = null; APP._h = ""; api.ecranCalendrier();
  ok(APP._h.includes("★☆☆☆☆"), "les étoiles dans le bandeau du jeu");
}

console.log("G) le verdict de la saison (livraison 2)");
{
  const v = (r, niv, div) => api.verdictSaison(r, api.objectifEntr(niv, div, 20), div, 20);
  ok(v(17, 0, 2).v === "tenu" && v(18, 0, 2).v === "rate", "maintien : 17e tenu, 18e manqué");
  ok(v(10, 0, 2).v === "depasse" && v(10, 0, 2).crans === 1, "maintien : 10e, dépassé d'un cran");
  ok(v(3, 0, 2).crans === 2 && v(1, 0, 2).crans === 3, "maintien : 3e (la montée) deux crans, 1er trois crans");
  ok(v(1, 3, 1).v === "tenu" && v(2, 3, 1).v === "rate", "titre : champion tenu, deuxième manqué");
  ok(v(5, 2, 1).v === "tenu" && v(6, 2, 1).v === "rate", "Europe : 5e tenu, 6e manqué");
}

/* Joue une saison entière de la carrière en cours, sans le renvoi en cours de saison (livraison 3) */
function joueSaison(a) {
  let G = a.getG();
  while (G.journee < 38 && !G.finie) { G.confiance = Math.max(G.confiance, 50); a.jouerJournee(); G = a.getG(); }
  return G;
}

console.log("H) une saison entière, le verdict et l'été");
{
  const o = Object.assign({}, api.offresDebut("1995-96")[0], { duree: 1 });
  api.nouvellePartie(o.id, "1995-96", o);
  let err = null, G;
  try { G = joueSaison(api); } catch (e) { err = e; }
  ok(!err, "trente-huit journées jouées" + (err ? " : " + err.stack : ""));
  G = api.getG();
  ok(G.finie && G.vire !== "objectif", "la saison est finie, sans le renvoi « objectif manqué » du mode de toujours");
  const b = G.coach.bilan;
  ok(b && ["depasse", "tenu", "rate"].includes(b.v) && b.obj === o.obj.label, "le verdict est posé : " + (b && b.v) + " (" + (b && b.rang) + "e)");
  const att = b.v === "rate" ? 10 : b.v === "tenu" ? 26 : 32 + 6 * (b.crans - 1) + (b.rang === 1 ? 4 : 0);
  ok(G.coach.rep === Math.min(100, att), "la réputation suit le verdict (" + b.avant + " → " + G.coach.rep + ")");
  ok(G.coach.saisons.length === 1 && G.coach.saisons[0].s === "1995-96" && G.coach.contrat.reste === 0, "la saison entre dans l'historique, le contrat d'une saison est fini");
  api.ecranBilan();
  ok(/OBJECTIF (DÉPASSÉ|TENU|MANQUÉ)/.test(APP._h), "l'almanach dit le verdict");
  api.preparerEte();
  const E = api.getG().ete;
  ok(E && E.k === "1996-97" && !E.fin, "l'été regarde la vraie saison suivante (1996-97)");
  const cas = { depasse: "appels", tenu: "prolonge", rate: "remercie" }[b.v];
  ok(E.cas === cas || (E.cas === "disparu"), "le cas de l'été suit le verdict : " + E.cas);
}

console.log("I) les offres de l'été, cas par cas");
{
  const S96 = S["1996-97"], S95 = S["1995-96"];
  const valeur = (s, id) => api.forceReelle(s, id) + (s.d1.includes(id) ? 3 : 0);
  // un club présent les deux années, en D2, dans la moitié faible
  const id = S95.d2.filter(x => S96.d2.includes(x)).sort((a, b) => valeur(S95, a) - valeur(S95, b))[2];
  const ete = (v, reste, rep) => {
    const o = { id, k: "1995-96", duree: 1, obj: api.objectifEntr(0, 2, 20) };
    api.nouvellePartie(id, "1995-96", o);
    const G = api.getG();
    G.coach.contrat.reste = reste; G.coach.bilan = { v, crans: 1, avant: 20, apres: 20, rang: 10, obj: o.obj.label };
    if (rep != null) G.coach.rep = rep;
    api.preparerEte(); return api.getG().ete;
  };
  let E = ete("rate", 1);
  ok(E.cas === "suite" && E.offres.length === 1 && E.offres[0].id === id && E.offres[0].suite, "contrat en cours : on continue au même club");
  E = ete("tenu", 0);
  ok(E.cas === "prolonge" && E.offres.length === 1 && E.offres[0].id === id && E.offres[0].reste && !E.offres[0].suite, "objectif tenu : le président prolonge");
  ok(E.offres[0].obj.niv >= 1, "la prolongation vise plus haut (« " + E.offres[0].obj.label + " »)");
  const v0 = valeur(S95, id);
  let tousPlusForts = true, tousPlusModestes = true, rester = true;
  for (let i = 0; i < 30; i++) {
    E = ete("depasse", 0);
    if (E.cas !== "appels" || E.offres.length !== 4 || E.offres[3].id !== id) rester = false;
    if (E.offres.slice(0, 3).some(o => valeur(S96, o.id) < v0 || o.id === id)) tousPlusForts = false;
    E = ete("rate", 0);
    if (E.cas !== "remercie" || E.offres.length !== 3 || E.offres.some(o => valeur(S96, o.id) >= v0 || o.id === id)) tousPlusModestes = false;
  }
  ok(rester, "objectif dépassé : trois clubs appellent, et le président propose de prolonger");
  ok(tousPlusForts, "objectif dépassé : ce sont des clubs plus forts");
  ok(tousPlusModestes, "objectif manqué : seulement des clubs plus modestes");
  // la réputation fixe jusqu'où : une étoile n'ouvre jamais le haut de l'échelle, cinq étoiles si
  const ech = api.echelle(S96), rangE = x => ech.findIndex(e => e.id === x);
  let hautPetit = 0, hautGrand = 0;
  for (let i = 0; i < 60; i++) {
    E = ete("depasse", 0, 20); hautPetit = Math.max(hautPetit, ...E.offres.slice(0, 3).map(o => rangE(o.id)));
    E = ete("depasse", 0, 100); hautGrand = Math.max(hautGrand, ...E.offres.slice(0, 3).map(o => rangE(o.id)));
  }
  ok(hautPetit < ech.length * 0.75, "une étoile : pas de grand club (plus haut rang proposé " + (hautPetit + 1) + "/" + ech.length + ")");
  ok(hautGrand > hautPetit, "cinq étoiles : des clubs plus hauts (" + (hautGrand + 1) + "/" + ech.length + ")");
  // un club qui a quitté les deux divisions
  const parti = S95.d2.find(x => !S96.d1.includes(x) && !S96.d2.includes(x));
  ok(!!parti, "un club de D2 1995-96 a disparu en 1996-97 (" + parti + ")");
  { const o = { id: parti, k: "1995-96", duree: 2, obj: api.objectifEntr(0, 2, 20) };
    api.nouvellePartie(parti, "1995-96", o); const G = api.getG();
    G.coach.contrat.reste = 1; G.coach.bilan = { v: "tenu", crans: 0, avant: 20, apres: 26, rang: 12, obj: o.obj.label };
    api.preparerEte(); E = api.getG().ete;
    ok(E.cas === "disparu" && E.offres.length === 3 && !E.offres.some(x => x.id === parti), "son entraîneur reçoit trois offres d'ailleurs"); }
  // plus de saison : la fin de carrière
  { const last = cles.filter(k => (S[k].pays || "FR") === "FR").sort((a, b) => S[b].an - S[a].an)[0];
    const o = api.offresDebut(last)[0]; api.nouvellePartie(o.id, last, o); const G = api.getG();
    G.coach.bilan = { v: "tenu", crans: 0, avant: 20, apres: 26, rang: 12, obj: o.obj.label }; G.coach.contrat.reste = 0;
    api.preparerEte(); APP._h = ""; api.ecranCalendrier();
    ok(api.getG().ete.fin && APP._h.includes("FIN DE CARRIÈRE") && APP._h.includes("Meilleure réputation"), "après " + last + " : fin de carrière"); }
  // l'écran de l'été
  E = ete("depasse", 0); APP._h = ""; api.ecranCalendrier();
  ok(APP._h.includes("OBJECTIF DÉPASSÉ") && (APP._h.match(/bEteSigne/g) || []).length === 4 && APP._h.includes("Prolonger"), "l'écran de l'été : verdict, trois offres et la prolongation");
  ok(!/—/.test(APP._h), "aucun tiret long à l'écran de l'été");
}

console.log("J) signer l'été : la vraie saison suivante");
{
  const ls = nouveauLS(), a = appareil(ls);
  const S95 = a.SAISONS["1995-96"], S96 = a.SAISONS["1996-97"];
  const id = S95.d2.filter(x => S96.d2.includes(x))[0];
  const o = { id, k: "1995-96", duree: 1, obj: a.objectifEntr(0, 2, 20) };
  a.nouvellePartie(id, "1995-96", o);
  reel(() => a.sauvegardeLocale(true));
  let G = a.getG(); const pid = G.pid, vieux = new Set(a.clubById(id).joueurs.map(j => j.uid));
  G.budget = 123e6; G.tresorerie = 45e6; G.finie = true;
  G.coach.contrat.reste = 0; G.coach.bilan = { v: "tenu", crans: 0, avant: 20, apres: 26, rang: 12, obj: o.obj.label }; G.coach.rep = 26;
  G.coach.saisons.push({ s: "1995-96", club: id, nom: "x", div: 2, rang: 12, obj: o.obj.label, v: "tenu", rep: 26 });
  a.preparerEte();
  const off = a.getG().ete.offres[0];
  a.basculeSaison(off); G = a.getG();
  ok(G.saison === "1996-97" && G.anneeJeu === undefined && G.saisonIdx === 2 && G.anBase === 1995, "on passe en 1996-97 (départ toujours 1995, deuxième saison)");
  ok(G.pid === pid && a.getPARTIE().id === pid, "c'est la même carrière");
  const club = a.clubById(id), vrais = (S96.starsD2[id] || []).map(s => s[0]);
  ok(vrais.length > 0 && vrais.every(n => club.joueurs.some(j => j.nom === n)), "le club a son VRAI effectif de 1996-97 (" + vrais.length + " joueurs réels)");
  ok(!club.joueurs.some(j => vieux.has(j.uid)), "aucun joueur de la saison passée n'est gardé tel quel");
  ok(G.div === 2 && G.clubs.length === S96.d2.length && G.clubs.every(c => S96.d2.includes(c.id)), "la vraie deuxième division de 1996-97");
  ok(G.budget === 123e6 && G.tresorerie === 45e6, "même club : l'argent reste");
  ok(G.coach.rep === 26 && G.coach.saisons.length === 1 && G.coach.contrat.saison === "1996-97" && G.coach.contrat.duree === off.duree, "la réputation, l'historique et le nouveau contrat");
  ok(G.objectif.label === off.obj.label && G.ete == null && G.intro === 1996 && !G.finie && G.journee === 0, "l'objectif signé, le mot d'ouverture de 1996, journée 1");
  ok(!G.vire, "personne n'est renvoyé");
  let err = null; try { G.intro = null; for (let i = 0; i < 4; i++) a.jouerJournee(); } catch (e) { err = e; }
  ok(!err, "la nouvelle saison se joue" + (err ? " : " + err.message : ""));
  ok(reel(() => a.sauvegardeLocale(true)) && a.partiesListe().length === 1, "toujours UNE carrière dans le navigateur");
  const b = appareil(ls); ok(b.chargeLocale(pid) && b.getG().saison === "1996-97" && b.getG().coach.rep === 26 && b.cleDepart(b.getG()) === "1995-96", "elle se recharge, et sa saison de départ reste 1995-96");
  // changer de club : on repart de ce qu'avait le nouveau club
  const autre = S96.d2.find(x => x !== id);
  a.getG().finie = true; a.getG().coach.contrat.reste = 0; a.getG().coach.bilan = { v: "depasse", crans: 1, avant: 26, apres: 38, rang: 5, obj: "x" };
  a.basculeSaison({ id: autre, k: "1997-98", div: 2, duree: 2, obj: a.objectifEntr(1, 2, 20) });
  G = a.getG();
  if (S["1997-98"].d2.includes(autre) || S["1997-98"].d1.includes(autre)) {
    ok(G.monClub === autre && G.budget === a.clubById(autre).budget && G.tresorerie === 12e6, "nouveau club : son argent à lui");
    ok(G.saisonIdx === 3 && G.coach.contrat.club === autre && G.coach.contrat.reste === 2, "troisième saison, nouveau contrat de deux saisons");
  }
}

console.log(FAILS ? "\n✗ " + FAILS + " échec(s)" : "\n✓ tout est vert");
process.exit(FAILS ? 1 : 0);
