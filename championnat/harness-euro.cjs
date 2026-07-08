/* Harnais Coupe d'Europe (lot 1 — Ligue des Champions) — D1 MANAGER 95-96
   Vérifie : vivier européen (15×18), tirage à 16, résolution complète sur une saison,
   qualification du champion, réconciliation joker↔Europe, et zéro doublon Europe↔France.
   Usage : node harness-euro.cjs                                                        */
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));

function makeStub() {
  let stub; const fn = function () { return stub; };
  stub = new Proxy(fn, {
    get(_t, p) { if (p === Symbol.toPrimitive) return () => ""; if (p === "length") return 0; return stub; },
    set() { return true; }, apply() { return stub; }, has() { return true; }, construct() { return stub; },
  });
  return stub;
}
const ls = { _m: {}, getItem(k){return this._m[k]??null;}, setItem(k,v){this._m[k]=String(v);}, removeItem(k){delete this._m[k];} };
global.document = makeStub();
global.window = { __TEST__: true, addEventListener(){}, removeEventListener(){}, localStorage: ls, location:{href:""}, matchMedia:()=>({matches:false,addEventListener(){}}) };
global.localStorage = ls; global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,acheterJoker,retireDEurope,euroInit,CLUBS,CLUBS_D2,CLUBS_EUROPE,STARS_EUROPE,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);

/* ===== A) vivier européen ===== */
console.log("A) Vivier européen (structure)");
try {
  api.nouvellePartie("NAN"); // Nantes = siège français de la C1 95-96 → qualifié d'entrée
  const G = api.getG();
  if (!G.europe || G.europe.length !== 30) fail("G.europe = " + (G.europe ? G.europe.length : "absent") + " clubs (attendu 30 : 15 C1 + 15 C3)");
  else ok("30 clubs européens construits (15 C1 + 15 C3)");
  let bad = 0;
  for (const c of G.europe) { const n = c.joueurs.length; if (n < 16) { bad++; } }
  if (bad) fail(bad + " clubs européens sous 16 joueurs"); else ok("tous les clubs ont un effectif complet (≥16)");
  // pas de note > 90 (plafond du jeu)
  let over = null;
  for (const c of G.europe) for (const j of c.joueurs) if (j.note > 90) over = j.nom + " (" + j.note + ")";
  if (over) fail("note > 90 : " + over); else ok("plafond de note respecté (≤ 90)");
} catch (e) { fail("exception A : " + e.stack); }

/* ===== B) qualification + résolution complète sur une saison (comme Nantes) ===== */
console.log("B) C1 : Nantes qualifié, tableau à 16, résolution complète");
try {
  api.nouvellePartie("NAN");
  let G = api.getG();
  if (!G.euro.enLice) fail("Nantes devrait être en lice (siège français C1)");
  else ok("Nantes en lice d'entrée (enLice=true)");
  if (G.euro.vivants.length !== 16) fail("tableau = " + G.euro.vivants.length + " (attendu 16)");
  else ok("tableau à 16 clubs");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G = api.getG();
  if (!G.euro.vainqueur) fail("pas de vainqueur de C1 après 38 journées");
  else ok("C1 résolue : vainqueur = " + G.euro.vainqueur);
  if (G.euro.enLice && G.euro.monParcours.length === 0) fail("parcours vide alors qu'en lice");
  else ok("parcours enregistré (" + G.euro.monParcours.length + " tours joués)");
} catch (e) { fail("exception B : " + e.stack); }

/* ===== C) qualification du champion (multi-saisons) ===== */
console.log("C) Champion de D1 → C1 la saison suivante");
try {
  api.nouvellePartie(api.CLUBS[0].id); // AUX (pas seed C1 en 95-96)
  let G = api.getG();
  const seed = G.euro.enLice;
  let sawChampionQualif = false, seasons = 0, exc = 0;
  for (let s = 0; s < 8; s++) {
    for (let d = 0; d < 38; d++) api.jouerJournee();
    G = api.getG();
    const cl = [...G.clubs].sort((a,b)=>b.pts-a.pts);
    const champ = cl[0].id === G.monClub && G.div === 1;
    G.vire = null;
    api.intersaison();
    G = api.getG();
    if (champ && G.euro.enLice) sawChampionQualif = true;
    if (champ && !G.euro.enLice) fail("champion de D1 mais pas qualifié en C1 la saison suivante");
    seasons++;
  }
  ok(seasons + " saisons enchaînées sans exception (europe vieillit avec le reste)");
  ok(sawChampionQualif ? "au moins un titre → qualification C1 vérifiée" : "pas de titre sur l'échantillon (qualif non déclenchée, non bloquant)");
} catch (e) { fail("exception C : " + e.stack); }

/* ===== D) réconciliation joker ↔ Europe ===== */
console.log("D) Réconciliation : un joueur signé quitte son club européen");
try {
  api.nouvellePartie("NAN");
  const G = api.getG();
  // retrait direct par nom
  const cible = G.europe.find(c => c.id === "JUV").joueurs.find(j => j.nom === "D. Deschamps");
  if (!cible) fail("D. Deschamps introuvable à la Juve (curation)");
  const ex = api.retireDEurope("D. Deschamps");
  const encore = G.europe.find(c => c.id === "JUV").joueurs.some(j => j.nom === "D. Deschamps");
  if (ex && !encore) ok("retireDEurope retire bien le joueur (Deschamps quitte " + ex.nom + ")");
  else fail("retireDEurope n'a pas retiré Deschamps");
  // chemin complet acheterJoker : on force une offre dont le nom existe en Europe
  const moi = G.clubs.find(c => c.id === G.monClub);
  const euNom = "P. Kluivert", club = G.europe.find(c => c.id === "AJA");
  const avant = club.joueurs.some(j => j.nom === euNom);
  G.budget = 999e6;
  G.vivier = G.vivier || {}; G.vivier["Jeune espoir étranger"] = G.vivier["Jeune espoir étranger"] || [];
  G.rapport = [{ j: { nom: euNom, pos: "A", age: 20, note: 80, pot: 93, lieu: "Ajax", buts:0, passes:0, matchs:0, uid: "test", bless:0, susp:0, moral:70 }, type: "Jeune espoir étranger", prix: 5e6 }];
  api.acheterJoker(0);
  const apres = club.joueurs.some(j => j.nom === euNom);
  const signe = moi.joueurs.some(j => j.nom === euNom);
  if (avant && signe && !apres) ok("acheterJoker : Kluivert signé ET retiré de l'Ajax");
  else fail("acheterJoker reconciliation ratée (avant=" + avant + " signe=" + signe + " encoreAjax=" + apres + ")");
} catch (e) { fail("exception D : " + e.stack); }

/* ===== E) zéro doublon de joueur CURÉ entre France et Europe (sur plusieurs saisons) =====
   NB : les jeunes PROCÉDURAUX (j.histoire) piochent dans le même pool PRENOMS/NOMS que
   les jeunes français — une homonymie occasionnelle est tolérée (objets/uid distincts),
   exactement comme entre deux clubs français dans le jeu de base. On ne flague que les
   VRAIS joueurs curés partagés, qui seraient une vraie faute de données. */
console.log("E) Aucun joueur CURÉ partagé entre un club français et un club européen");
try {
  api.nouvellePartie("NAN");
  let G = api.getG(), pire = 0, detail = "";
  for (let s = 0; s < 4; s++) {
    for (let d = 0; d < 38; d++) api.jouerJournee();
    G = api.getG();
    const frCures = new Set();
    for (const c of G.clubs.concat(G.autre)) for (const j of c.joueurs) if (!j.histoire) frCures.add(j.nom);
    const dup = [];
    for (const c of G.europe) for (const j of c.joueurs) if (!j.histoire && frCures.has(j.nom)) dup.push(j.nom);
    if (dup.length > pire) { pire = dup.length; detail = dup.slice(0,5).join(", "); }
    G.vire = null; api.intersaison();
  }
  if (pire) fail(pire + " doublon(s) CURÉ Europe↔France (ex: " + detail + ")");
  else ok("aucun joueur curé partagé sur 4 saisons");
} catch (e) { fail("exception E : " + e.stack); }

/* ===== F) sanity du modèle de force : les gros gagnent plus souvent que les modestes ===== */
console.log("F) Distribution des vainqueurs de C1 (sanity du modèle de force)");
try {
  const N = 120;
  const tally = {};
  for (let t = 0; t < N; t++) {
    api.nouvellePartie("AUX"); // AUX pas qualifié en 95-96 → C1 de fond entre les 15 + Nantes
    for (let d = 0; d < 38; d++) api.jouerJournee();
    const G = api.getG();
    const w = G.euro.vainqueur; if (w) tally[w] = (tally[w]||0)+1;
  }
  const rows = Object.entries(tally).sort((a,b)=>b[1]-a[1]);
  const top = rows.slice(0,6).map(r=>r[0]+":"+r[1]).join(" ");
  ok("vainqueurs sur " + N + " C1 → " + top);
  const elite = (tally.JUV||0)+(tally.AJA||0)+(tally.RMA||0)+(tally.DOR||0)+(tally.BLB||0);
  const modestes = (tally.FER||0)+(tally.AAB||0)+(tally.LEG||0);
  if (elite <= modestes) fail("le modèle de force ne favorise pas assez l'élite (élite " + elite + " ≤ modestes " + modestes + ")");
  else ok("l'élite domine les modestes (élite " + elite + " vs modestes " + modestes + ")");
} catch (e) { fail("exception F : " + e.stack); }

/* ===== G) C3 : Coupe UEFA (registre multi-compétitions) ===== */
console.log("G) C3 : Bordeaux qualifié en Coupe UEFA (siège français), pool C3");
try {
  api.nouvellePartie("BOR"); // Bordeaux = siège C3 95-96
  let G = api.getG();
  if (G.euro.compet !== "C3") fail("compétition = " + G.euro.compet + " (attendu C3)");
  else ok("Bordeaux dispute la Coupe UEFA (compet=C3)");
  if (!G.euro.enLice) fail("Bordeaux devrait être en lice en C3");
  else ok("en lice d'entrée");
  const hasMIL = G.euro.vivants.includes("MIL"), hasJUV = G.euro.vivants.includes("JUV");
  if (hasMIL && !hasJUV) ok("tableau tiré dans le pool C3 (Milan présent, clubs C1 absents)");
  else fail("pool C3 incorrect (MIL=" + hasMIL + " JUV=" + hasJUV + ")");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G = api.getG();
  if (!G.euro.vainqueur) fail("pas de vainqueur de C3 après 38 journées");
  else ok("C3 résolue : vainqueur = " + G.euro.vainqueur);
} catch (e) { fail("exception G : " + e.stack); }

console.log(FAILS ? ("\n❌ HARNAIS EUROPE : " + FAILS + " ÉCHEC(S)") : "\n✅ HARNAIS EUROPE : TOUT EST VERT");
process.exit(FAILS ? 1 : 0);
