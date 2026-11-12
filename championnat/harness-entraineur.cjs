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
   K) le naufrage : l'avertissement, sa levée, le renvoi, la fin de saison sans vous, l'été d'un renvoyé (livraison 3)
   L) les offres de l'étranger : un été sur deux, une offre d'un autre pays ; signer change de pays, pas de saison de départ (livraison 4)
   M) le livre d'or et le grand bilan de fin de carrière (livraison 5)
   N) l'écart avec l'histoire : les vrais classements, la vraie place, le bonus au verdict, l'affichage (livraison 6)
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,clubById,classement,sauvegardeLocale,chargeLocale,partiesListe," +
  "ecranAccueil,SAISONS,SAISONS_OUVERTES,saisonOuverte,offresDebut,forceReelle,forceEffectif,nivDuRang,objectifEntr,objectifDuClub," +
  "objectifPour,ecranEntraineur,contratEntraineur,etoiles,montre,verdictSaison,preparerEte,basculeSaison,echelle,ecranBilan,cleDepart,ecranCalendrier,offresEte,ecranClub,livreDorHTML,rangReel,CLASSEMENT_REEL,finSaisonEntr,metaClub,seuilNaufrage,surveillePresident,finitSansVous,forceReelle2:forceReelle," +
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
  while (G.journee < 38 && !G.finie) { G.confiance = Math.max(G.confiance, 50); if (G.coach) G.coach.avert = null; a.jouerJournee(); G = a.getG(); }
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
    if (E.offres.slice(0, 3).some(o => valeur(S[o.k], o.id) < v0 || o.id === id)) tousPlusForts = false;
    E = ete("rate", 0);
    if (E.cas !== "remercie" || E.offres.length !== 3 || E.offres.some(o => valeur(S[o.k], o.id) >= v0 || o.id === id)) tousPlusModestes = false;
  }
  ok(rester, "objectif dépassé : trois clubs appellent, et le président propose de prolonger");
  ok(tousPlusForts, "objectif dépassé : ce sont des clubs plus forts");
  ok(tousPlusModestes, "objectif manqué : seulement des clubs plus modestes");
  // la réputation fixe jusqu'où : une étoile n'ouvre jamais le haut de l'échelle, cinq étoiles si
  const rangE = o => api.echelle(S[o.k]).findIndex(e => e.id === o.id), ech = api.echelle(S96); // chaque offre sur l'échelle de son pays
  let hautPetit = 0, hautGrand = 0;
  for (let i = 0; i < 60; i++) {
    E = ete("depasse", 0, 20); hautPetit = Math.max(hautPetit, ...E.offres.slice(0, 3).map(o => rangE(o)));
    E = ete("depasse", 0, 100); hautGrand = Math.max(hautGrand, ...E.offres.slice(0, 3).map(o => rangE(o)));
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
    ok(api.getG().ete.fin && APP._h.includes("FIN DE CARRIÈRE") && APP._h.includes("meilleure réputation"), "après " + last + " : fin de carrière"); }
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

console.log("K) le naufrage (livraison 3)");
{
  ok(api.seuilNaufrage(17, 20) === 19 && api.seuilNaufrage(10, 20) === 15 && api.seuilNaufrage(3, 20) === 8 && api.seuilNaufrage(1, 20) === 6,
    "le seuil : les deux dernières places pour le maintien, cinq places sous l'objectif sinon");
  const neuve = () => { const o = Object.assign({}, api.offresDebut("1995-96")[0], { duree: 2, obj: api.objectifEntr(0, 2, 20) });
    api.nouvellePartie(o.id, "1995-96", o); const G = api.getG(); G.confiance = 50; return G; };
  let G = neuve();
  G.journee = 9; api.surveillePresident(20, 17, 20);
  ok(!G.coach.avert, "avant la 10e journée, le président ne dit rien");
  G.journee = 10; api.surveillePresident(18, 17, 20);
  ok(!G.coach.avert, "18e pour un maintien : pas encore un naufrage");
  api.surveillePresident(19, 17, 20);
  ok(G.coach.avert && G.coach.avert.j === 10 && /AVERTISSEMENT/.test(G.news[0]), "19e : l'avertissement");
  G.journee = 14; api.surveillePresident(19, 17, 20);
  ok(G.coach.avert && !G.coach.vire, "quatre journées plus tard, il attend encore");
  G.journee = 15; api.surveillePresident(18, 17, 20);
  ok(!G.coach.avert && G.coach.vire && G.coach.vire.j === 15 && G.coach.vire.rang === 18, "cinq journées sans redressement : renvoyé");
  G = neuve(); G.journee = 12; api.surveillePresident(20, 17, 20); G.journee = 14; api.surveillePresident(16, 17, 20);
  ok(!G.coach.avert && !G.coach.vire && /respire/.test(G.news[0]), "remonté à la 16e : l'avertissement est levé");
  G.journee = 20; api.surveillePresident(19, 17, 20);
  ok(G.coach.avert && G.coach.avert.j === 20, "et il peut revenir");
  G = neuve(); G.journee = 12; G.confiance = 5; api.surveillePresident(12, 10, 20);
  ok(!!G.coach.avert, "la confiance presque morte suffit quand on est sous l'objectif (12e pour un top 10)");
  G = neuve(); G.journee = 12; G.confiance = 5; api.surveillePresident(8, 10, 20);
  ok(!G.coach.avert, "mais pas quand on le tient (8e pour un top 10)");
  // le chemin du jeu : une journée jouée avec la confiance à zéro ne renvoie plus d'un coup
  G = neuve(); for (let i = 0; i < 10; i++) { G.confiance = 50; G.coach.avert = null; api.jouerJournee(); }
  G.confiance = -10; api.jouerJournee(); G = api.getG();
  const rangJ = api.classement().findIndex(c => c.id === G.monClub) + 1;
  ok(!G.vire && !G.coach.vire && (!!G.coach.avert === rangJ > G.objectif.place), "confiance à zéro : plus de renvoi immédiat (avertissement si l'on est sous l'objectif, ici " + rangJ + "e)");
  // le mode de toujours : rien ne change
  api.nouvellePartie("OM", "1995-96"); G = api.getG();
  for (let i = 0; i < 10; i++) { G.confiance = 50; api.jouerJournee(); }
  G.confiance = -10; api.jouerJournee(); G = api.getG();
  ok(G.vire === "confiance", "le mode de toujours renvoie toujours à confiance nulle");
  // renvoyé à la 15e : écran, fin de saison sans vous, verdict, été
  G = neuve(); const v0 = api.forceReelle(api.SAISONS["1995-96"], G.monClub);
  for (let i = 0; i < 15; i++) { G.confiance = 50; G.coach.avert = null; api.jouerJournee(); }
  G.coach.vire = { j: 15, rang: 20 };
  APP._h = ""; G.intro = null; api.ecranCalendrier();
  ok(APP._h.includes("LIMOGÉ") && APP._h.includes("sans vous") && !/—/.test(APP._h), "l'écran du renvoi");
  let err = null; try { api.finitSansVous(); } catch (e) { err = e; }
  G = api.getG();
  ok(!err && G.finie && G.journee === 38 && !G._pend, "la fin de saison se joue sans vous" + (err ? " : " + err.stack : ""));
  ok(!(G.coupe && G.coupe.aJouer) && !(G.euro && G.euro.aJouer), "la coupe et l'Europe aussi");
  const b = G.coach.bilan;
  ok(b && b.v === "vire" && G.coach.rep === 5 && G.coach.saisons[0].vireJ === 15 && G.coach.contrat.reste === 0 && !G.coach.vire,
    "verdict : renvoyé, la réputation chute (20 → " + G.coach.rep + "), le contrat s'arrête");
  APP._h = ""; api.ecranBilan();
  ok(APP._h.includes("RENVOYÉ"), "l'almanach le dit");
  api.preparerEte(); const E = api.getG().ete;
  const S96 = api.SAISONS["1996-97"];
  const val = o => api.forceReelle(api.SAISONS[o.k], o.id) + (api.SAISONS[o.k].d1.includes(o.id) ? 3 : 0), bas3 = o => api.echelle(api.SAISONS[o.k]).slice(0, 3).map(x => x.id).includes(o.id);
  ok(E.cas === "vire" && E.offres.length === 3 && E.offres.every(o => val(o) < v0 || bas3(o)), "l'été : trois clubs plus faibles (ou les plus faibles de tous)");
  APP._h = ""; api.ecranCalendrier();
  ok(APP._h.includes("RENVOYÉ") && (APP._h.match(/bEteSigne/g) || []).length === 3, "l'écran de l'été d'un renvoyé");
  // le bandeau d'avertissement, sur l'écran du match
  // (les notifications ouvrent la fenêtre du debrief, que le faux #fiche du harnais ne sait pas tenir : on les vide)
  G = neuve(); G.journee = 12; api.surveillePresident(20, 17, 20); G.intro = null; G.notifs = []; APP._h = ""; api.ecranCalendrier();
  ok(APP._h.includes("Le président vous a prévenu") && APP._h.includes("5 journées"), "le bandeau rouge et le délai qui court");
}

console.log("L) les offres de l'étranger (livraison 4)");
{
  const S96 = S["1996-97"], v0 = api.forceReelle(S["1995-96"], "LAV");
  const pays = o => S[o.k].pays || "FR";
  let etes = 0, avecEtranger = 0, troisEtrangers = 0, sensFaux = 0;
  for (let i = 0; i < 300; i++) for (const sens of ["haut", "bas", "pareil"]) {
    const l = api.offresEte(sens, S96, "1996-97", v0, "LAV", 50); etes++;
    const e = l.filter(o => pays(o) !== "FR");
    if (e.length) avecEtranger++;
    if (e.length > 1) troisEtrangers++;
    for (const o of e) { const v = api.forceReelle(S[o.k], o.id) + (S[o.k].d1.includes(o.id) ? 3 : 0);
      if (S[o.k].an !== 1996 || (sens === "haut" && v < v0) || (sens === "bas" && v >= v0)) sensFaux++; }
  }
  ok(avecEtranger / etes > 0.4 && avecEtranger / etes < 0.6, "environ un été sur deux, une offre vient de l'étranger (" + (100 * avecEtranger / etes).toFixed(0) + " %)");
  ok(troisEtrangers === 0, "jamais plus d'une");
  ok(sensFaux === 0, "même année, et la même règle : plus fort vers le haut, plus modeste vers le bas");
  // signer en Angleterre
  const ls = nouveauLS(), a = appareil(ls);
  const o = a.offresDebut("1995-96")[0]; a.nouvellePartie(o.id, "1995-96", o);
  let G = a.getG(); const pid = G.pid;
  G.finie = true; G.coach.contrat.reste = 0; G.coach.bilan = { v: "depasse", crans: 1, avant: 20, apres: 32, rang: 6, obj: o.obj.label }; G.coach.rep = 32;
  const SA = a.SAISONS["ANG-1996-97"], idA = SA.d2[5];
  a.basculeSaison({ id: idA, k: "ANG-1996-97", div: 2, duree: 2, obj: a.objectifEntr(1, 2, SA.d2.length) });
  G = a.getG();
  ok(G.pays === "ANG" && G.monClub === idA && G.saison === "1996-97" && G.div === 2, "on entraîne en Angleterre, en deuxième division, en 1996-97");
  ok(G.clubs.every(c => SA.d2.includes(c.id)) && (SA.starsD2[idA] || []).every(s => a.clubById(idA).joueurs.some(j => j.nom === s[0])), "la vraie D2 anglaise et le vrai effectif");
  ok(G.pid === pid && G.coach.rep === 32 && G.coach.depart === "1995-96" && a.cleDepart(G) === "1995-96", "même carrière, et la saison de départ reste 1995-96 (France)");
  let err = null; try { G.intro = null; for (let i = 0; i < 3; i++) a.jouerJournee(); } catch (e) { err = e; }
  ok(!err, "la saison anglaise se joue" + (err ? " : " + err.message : ""));
  ok(reel(() => a.sauvegardeLocale(true)) && a.partiesListe().length === 1 && a.partiesListe()[0].pays === "ANG", "une seule carrière, la carte de l'accueil passe au drapeau anglais");
  // l'été suivant regarde l'Angleterre de 1997-98
  G.finie = true; G.coach.contrat.reste = 1; G.coach.bilan = { v: "tenu", crans: 0, avant: 32, apres: 38, rang: 8, obj: "x" };
  a.preparerEte();
  ok(a.getG().ete.k === "ANG-1997-98", "l'été suivant regarde la saison anglaise de 1997-98");
  // l'écran de l'été montre le drapeau d'une offre étrangère
  a.getG().ete.offres.push({ id: S["1997-98"].d2[0], k: "1997-98", div: 2, duree: 1, exig: false, obj: a.objectifEntr(0, 2, 20) });
  APP._h = ""; a.ecranCalendrier();
  ok(APP._h.includes('class="drap"') && APP._h.includes("Division 2"), "une offre de France porte son drapeau et le nom de sa division");
}

console.log("M) le livre d'or et le grand bilan (livraison 5)");
{
  // une saison entière : la ligne du livre d'or retient les trophées de CETTE saison
  const o = Object.assign({}, api.offresDebut("1995-96")[0], { duree: 2 });
  api.nouvellePartie(o.id, "1995-96", o);
  let G = api.getG();
  G.palmares.push("Champion de France 1994-95"); // un vieux titre : il ne doit pas entrer dans la ligne de 1995-96
  G = joueSaison(api);
  const s0 = G.coach.saisons[0];
  ok(Array.isArray(s0.pal) && !s0.pal.includes("Champion de France 1994-95"), "la ligne de 1995-96 ne retient que ses trophées");
  ok((s0.rang === 1) === s0.pal.some(p => /^Champion/.test(p)), "un titre de champion y entre quand on l'est (" + s0.rang + "e)");
  // un livre d'or fabriqué : deux pays, un renvoi, des trophées
  G.coach.saisons = [
    { s: "1995-96", pays: "FR", club: "POI", nom: "Stade Poitevin", div: 2, rang: 1, obj: "x", v: "depasse", rep: 40, pal: ["Champion de Division 2 1995-96", "Vainqueur de la Coupe de France 1995-96"] },
    { s: "1996-97", pays: "ANG", club: "LEI", nom: "Leicester City", div: 1, rang: 19, obj: "x", v: "vire", rep: 25, vireJ: 15, pal: [] },
    { s: "1997-98", pays: "FR", club: "LAV", nom: "Stade Lavallois", div: 2, rang: 9, obj: "x", v: "tenu", rep: 31, pal: [] },
  ];
  G.coach.repMax = 40; G.coach.rep = 31;
  const h = api.livreDorHTML();
  ok((h.match(/<tr>/g) || []).length === 3, "une ligne par saison");
  ok(h.includes("Stade Poitevin") && h.includes("Leicester City") && (h.match(/class="drap"/g) || []).length === 3, "les clubs, chacun avec son drapeau");
  ok(h.includes(">PL<") && h.includes(">D2<"), "la division dans les mots de son pays (PL, D2)");
  ok(h.includes("Renvoyé J15") && h.includes("Dépassé") && h.includes("Tenu"), "les verdicts, et la journée du renvoi");
  ok(h.includes("🏆🏆") && !/—/.test(h), "deux trophées la première saison ; aucun tiret long");
  // l'onglet Club, pendant la carrière
  APP._h = ""; api.ecranClub();
  ok(APP._h.includes("Livre d'or") && APP._h.includes("Contrat :") && APP._h.includes("Leicester City"), "le livre d'or vit dans l'onglet Club");
  api.nouvellePartie("OM", "1995-96"); APP._h = ""; api.ecranClub();
  ok(!APP._h.includes("Livre d'or") && APP._h.includes("Le président"), "pas dans le mode de toujours");
  // la fin de carrière
  api.setG(G); G.ete = { fin: true, k: null, cas: null, offres: [] };
  APP._h = ""; api.ecranCalendrier();
  ok(APP._h.includes("FIN DE CARRIÈRE") && APP._h.includes("LIVRE D'OR"), "l'écran de fin de carrière, avec le livre d'or");
  ok(APP._h.includes("3 saisons · 3 clubs · 2 pays") && APP._h.includes(api.etoiles(40)), "trois saisons, trois clubs, deux pays, la meilleure réputation");
  ok(APP._h.includes("🏆 Champion de Division 2 1995-96") && APP._h.includes("🏆 Vainqueur de la Coupe de France 1995-96"), "la liste des trophées");
  ok(!/—/.test(APP._h), "aucun tiret long");
}

console.log("N) l'écart avec l'histoire (livraison 6)");
{
  const CR = api.CLASSEMENT_REEL;
  // les données : toutes les saisons du jeu, des codes connus, aucun doublon, des tailles de vraie division
  let inconnu = [], doublon = [], taille = [], couverture = [];
  for (const k of cles) {
    const R = CR[k]; if (!R) { inconnu.push(k + " : absente"); continue; }
    for (const div of [1, 2]) {
      const s = R["d" + div]; if (!s) continue;
      const l = s.split(" "), ids = l.filter(x => x !== "-");
      if (ids.some(id => !api.metaClub(id))) inconnu.push(k + " D" + div);
      if (new Set(ids).size !== ids.length) doublon.push(k + " D" + div);
      if (l.length < 16 || l.length > 24) taille.push(k + " D" + div + " (" + l.length + ")");
      const jeu = S[k]["d" + div], vus = jeu.filter(id => ids.includes(id)).length;
      if (vus < jeu.length - 2) couverture.push(k + " D" + div + " (" + vus + "/" + jeu.length + ")");
    }
  }
  ok(!inconnu.length, "chaque saison du jeu a son vrai classement, en codes du jeu" + (inconnu.length ? " : " + inconnu.join(", ") : ""));
  ok(!doublon.length && !taille.length, "aucun doublon, des divisions de 16 à 24 clubs" + (doublon.concat(taille).length ? " : " + doublon.concat(taille).join(", ") : ""));
  ok(!couverture.length, "au plus deux clubs du jeu sans vraie place par division (repêchés, ajoutés)" + (couverture.length ? " : " + couverture.join(", ") : ""));
  const premier = (k, d) => CR[k]["d" + d].split(" ")[0];
  ok(premier("1995-96", 1) === "AJA" && premier("1997-98", 1) === "LEN" && premier("2008-09", 1) === "BOR" && premier("ANG-1995-96", 1) === "MUN" && premier("ANG-2003-04", 1) === "ARS" && premier("ANG-2001-02", 2) === "MCI",
    "les vrais champions : Auxerre 96, Lens 98, Bordeaux 09, United 96, Arsenal 04, City en D2 anglaise 02");
  ok(api.rangReel("1995-96", "AJA", 1) === 1 && api.rangReel("1995-96", "MAR", 1) === 20, "la vraie place : Auxerre 1er, Martigues 20e en 1995-96");
  ok(api.rangReel("1997-98", "NCY", 1) === null && api.rangReel("1990-91", "BRE", 2) === null && api.rangReel(null, "AJA", 1) === null,
    "pas de vraie place pour un club repêché, ni pour la D2 à deux groupes");
  // le bonus au verdict
  const S95 = S["1995-96"], id = S95.d2.find(x => (api.rangReel("1995-96", x, 2) || 0) >= 10), rr = api.rangReel("1995-96", id, 2);
  const fin = (rang, niv, vire) => { api.nouvellePartie(id, "1995-96", { id, k: "1995-96", duree: 1, obj: api.objectifEntr(niv, 2, 20) });
    const G = api.getG(); if (vire) G.coach.vire = { j: 15, rang }; api.finSaisonEntr(rang); return G.coach.bilan; };
  let b = fin(rr - 5, 3);
  ok(b.v === "depasse" && b.histoire && b.crans === 1 && b.reel === rr, "objectif titre manqué, mais " + (rr - 5) + "e quand le vrai club finit " + rr + "e : dépassé, grâce à l'histoire");
  b = fin(rr - 4, 3);
  ok(b.v === "rate" && !b.histoire, "quatre places de mieux seulement : l'objectif reste manqué");
  b = fin(rr - 6, 3, true);
  ok(b.v === "vire", "un renvoyé reste renvoyé");
  b = fin(1, 0);
  ok(b.v === "depasse" && b.crans === 3 && !b.histoire, "un objectif déjà dépassé garde ses crans, sans l'histoire");
  b = fin(Math.min(17, rr + 3), 0);
  ok(b.v !== "rate" || Math.min(17, rr + 3) > 17, "faire moins bien que l'histoire n'aggrave rien (" + b.v + ")");
  // l'affichage : l'almanach et le livre d'or
  b = fin(rr - 5, 3); const G = api.getG(); G.finie = true;
  APP._h = ""; api.ecranBilan();
  ok(APP._h.includes("Le vrai club avait fini " + rr + "ᵉ") && APP._h.includes("5 places mieux") && APP._h.includes("Le président s'en souviendra"), "l'almanach le dit");
  ok(api.livreDorHTML().includes(" /" + rr + "<"), "le livre d'or montre la vraie place");
  ok(!/—/.test(APP._h), "aucun tiret long");
}

console.log(FAILS ? "\n✗ " + FAILS + " échec(s)" : "\n✓ tout est vert");
process.exit(FAILS ? 1 : 0);
