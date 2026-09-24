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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,acheterJoker,retireDEurope,euroInit,CLUBS,CLUBS_D2,CLUBS_EUROPE,STARS_EUROPE,EURO_TOURS,euroManche,euroCloture,euroFinaleSeche,euroClub,enCompet,rejoueDepuis,aStade,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);

/* ===== A) vivier européen ===== */
console.log("A) Vivier européen (structure)");
try {
  api.nouvellePartie("NAN"); // Nantes = siège français de la C1 95-96 → qualifié d'entrée
  const G = api.getG();
  if (!G.europe || G.europe.length !== 45) fail("G.europe = " + (G.europe ? G.europe.length : "absent") + " clubs (attendu 45 : 15 C1 + 15 C2 + 15 C3)");
  else ok("45 clubs européens construits (15 C1 + 15 C2 + 15 C3)");
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

/* ===== H) C2 : Coupe des Coupes (vainqueur de la Coupe de France) ===== */
console.log("H) C2 : PSG qualifié en Coupe des Coupes (siège français), pool C2");
try {
  api.nouvellePartie("PSG"); // PSG = siège C2 95-96
  let G = api.getG();
  if (G.euro.compet !== "C2") fail("compétition = " + G.euro.compet + " (attendu C2)");
  else ok("PSG dispute la Coupe des Coupes (compet=C2)");
  const hasPAR = G.euro.vivants.includes("PAR"), hasMIL = G.euro.vivants.includes("MIL");
  if (hasPAR && !hasMIL) ok("tableau tiré dans le pool C2 (Parme présent, clubs C3 absents)");
  else fail("pool C2 incorrect (PAR=" + hasPAR + " MIL=" + hasMIL + ")");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G = api.getG();
  if (!G.euro.vainqueur) fail("pas de vainqueur de C2 après 38 journées");
  else ok("C2 résolue : vainqueur = " + G.euro.vainqueur);
} catch (e) { fail("exception H : " + e.stack); }

/* ===== I) L'aller et le retour ne se jouent PAS le même soir =====
   Retour de playtest : « les matchs aller et retour se sont suivis le même jour ». Chaque tour
   occupe désormais deux milieux de semaine espacés d'une semaine (EURO_TOURS.j puis .jr), et
   la manche aller ne qualifie personne — seul le retour tranche. La finale reste un match sec. */
console.log("I) Aller et retour espacés d'une semaine, en milieu de semaine");
try {
  api.nouvellePartie("NAN");
  const G = api.getG(), T = api.EURO_TOURS;
  const t0 = T[0];
  if (t0.jr !== t0.j + 1) fail("l'aller (J" + t0.j + ") et le retour (J" + t0.jr + ") ne sont pas espacés d'une journée");
  else ok("8es : aller après la J" + t0.j + ", retour après la J" + t0.jr + " (une semaine d'écart)");
  const coupeJ = [10, 15, 20, 26, 31, 36]; // COUPE_TOURS : jamais deux rendez-vous de semaine le même soir
  const collision = T.flatMap(t => [t.j, t.jr].filter(Boolean)).filter(j => coupeJ.includes(j));
  if (collision.length) fail("un soir européen tombe sur un tour de Coupe de France (J" + collision.join(", J") + ")");
  else ok("aucun soir européen ne tombe sur un tour de Coupe de France");

  for (let d = 0; d < t0.j - 1; d++) api.jouerJournee();
  if (G.euro.dernierTour) fail("un tour a été joué avant la J" + t0.j);
  else ok("rien avant l'heure (J" + (t0.j - 1) + " : aucun tour joué)");

  api.jouerJournee(); // J8 → match ALLER
  const at = G.euro.attente;
  if (!at) fail("pas de tie en attente après la J" + t0.j);
  else if (at.allers.length !== 8) fail("aller : " + at.allers.length + " matchs joués (attendu 8)");
  else ok("J" + t0.j + " : les 8 matchs aller sont joués et mis en attente");
  if (G.euro.tourIdx !== 0) fail("le tour a avancé dès l'aller (tourIdx=" + G.euro.tourIdx + ")");
  else if (G.euro.vivants.length !== 16) fail("des clubs ont été éliminés dès l'aller (" + G.euro.vivants.length + " vivants)");
  else ok("l'aller ne qualifie personne : 16 clubs toujours en lice");
  if (!G.euro.dernierTour || G.euro.dernierTour.manche !== 1) fail("la soirée n'est pas marquée comme une manche aller");
  else if (G.euro.dernierTour.faits.some(f => f.agg || f.win)) fail("un verdict a été rendu au soir de l'aller");
  else ok("les résultats du soir sont ceux de l'aller, sans vainqueur désigné");
  const allersCopie = at.allers.map(l => l.slice()), pairesCopie = at.paires.map(p => p.slice());

  api.jouerJournee(); // J9 → match RETOUR, une semaine plus tard
  if (G.euro.attente) fail("le tie est resté en attente après le retour");
  else if (G.euro.tourIdx !== 1) fail("le tour n'a pas avancé après le retour (tourIdx=" + G.euro.tourIdx + ")");
  else if (G.euro.vivants.length !== 8) fail("après le retour : " + G.euro.vivants.length + " vivants (attendu 8)");
  else ok("J" + t0.jr + " : le retour tranche, 8 clubs passent en quarts");
  const dt = G.euro.dernierTour;
  const memeAller = dt && dt.manche === 2 && dt.faits.every((f, i) =>
    f.aid === pairesCopie[i][0] && f.bid === pairesCopie[i][1] &&
    f.l1[0] === allersCopie[i][0] && f.l1[1] === allersCopie[i][1] &&
    f.agg[0] === f.l1[0] + f.l2[1] && f.agg[1] === f.l1[1] + f.l2[0]);
  if (!memeAller) fail("le cumul du retour ne reprend pas le score de l'aller joué une semaine plus tôt");
  else ok("le cumul reprend bien l'aller de la semaine précédente (8 ties vérifiés)");

  for (let d = 0; d < T[3].j - t0.jr; d++) api.jouerJournee(); // jusqu'au soir de la finale
  if (!G.euro.vainqueur) fail("pas de vainqueur après la J" + T[3].j + " (la finale sèche n'a pas eu lieu)");
  else if (G.euro.dernierTour.faits.length !== 1 || !G.euro.dernierTour.finale) fail("la finale n'est pas un match sec");
  else ok("finale = match sec à la J" + T[3].j + ", vainqueur = " + G.euro.vainqueur);
} catch (e) { fail("exception I : " + e.stack); }

/* ===== J) LE DIRECT EUROPÉEN (chantier « un seul moteur ») ===== */
console.log("J) Le direct européen montre le fil du moteur, et la consigne le recolle sans trahir les fiches");
try {
  api.nouvellePartie("NAN");
  const G = api.getG(), moi = G.monClub;
  const advs = G.europe.slice(0, 6).map(c => c.id);
  const lesDeux = (x, y) => [api.euroClub(x), api.euroClub(y)];
  const photo = (cs) => { const m = new Map(); for (const c of cs) for (const j of c.joueurs) m.set(j.uid, {b: j.buts || 0, bc: j.butsC || 0}); return m; };
  // ce que les fiches ont reçu depuis la photo : buts de COUPE par homme — et un buteur de championnat, jamais
  const recu = (cs, av) => { const d = new Map(); let ligue = 0;
    for (const c of cs) for (const j of c.joueurs) { const a = av.get(j.uid); const x = (j.butsC || 0) - a.bc; if (x) d.set(j.uid, x); if ((j.buts || 0) !== a.b) ligue++; }
    return {d, ligue}; };
  const auFil = (ev) => { const d = new Map(); for (const l of ev) if (l.g && l.g.uid) d.set(l.g.uid, (d.get(l.g.uid) || 0) + 1); return d; };
  const memes = (a, b) => a.size === b.size && [...a].every(([k, v]) => b.get(k) === v);
  const sifflet = (ev) => ev.find(l => l.t === "sys" && /^COUP DE SIFFLET FINAL/.test(l.x || ""));
  let n = 0, filOk = 0, recolleOk = 0, scoreOk = 0, ligueTouchee = 0, tabOk = 0, tabVus = 0, sifOk = 0, sansFil = 0;
  const consignes = ["prudent", "offensif", "equilibre"];
  for (let k = 0; k < 90; k++) {
    const adv = advs[k % advs.length], type = k % 3; // 0 aller · 1 retour (aller nul et vierge : prolongations fréquentes) · 2 finale
    const sortie = {}; let home, away;
    const cs = lesDeux(moi, adv), av = photo(cs);
    if (type === 0) { api.euroManche(moi, adv, sortie); home = moi; away = adv; }
    else if (type === 1) { api.euroCloture(moi, adv, [0, 0], sortie); home = adv; away = moi; }
    else { api.euroFinaleSeche(moi, adv, sortie); home = moi; away = adv; }
    const R = sortie.r; if (!R || !R.ev) { sansFil++; continue; }
    n++;
    // 1) le fil du moteur crédite EXACTEMENT les buteurs qu'il raconte
    const r1 = recu(cs, av); if (memes(auFil(R.ev), r1.d)) filOk++; ligueTouchee += r1.ligue;
    // 2) la consigne change à une minute au hasard avant le sifflet : le reste se rejoue
    const sif = R.ev.indexOf(sifflet(R.ev)), from = 1 + Math.floor(Math.random() * Math.max(1, sif - 1)), mNow = R.ev[from - 1].m;
    G.consigne = consignes[k % 3];
    const [H, A] = [api.euroClub(home), api.euroClub(away)];
    api.enCompet("EU", () => api.rejoueDepuis(R, H, A, from, mNow, 1, 1, sortie.o));
    G.consigne = "equilibre";
    const r2 = recu(cs, av); if (memes(auFil(R.ev), r2.d)) recolleOk++; ligueTouchee += r2.ligue;
    const shF = R.ev.filter(l => l.g && l.g.cote === home).length, saF = R.ev.filter(l => l.g && l.g.cote === away).length;
    if (shF === R.sh && saF === R.sa) scoreOk++;
    // 3) le sifflet tombe à la bonne minute, et la séance suit l'égalité que la compétition définit
    const s = sifflet(R.ev), eg = (sortie.o && sortie.o.egalite) || ((x, y) => x === y);
    if (s && s.m === (R.prolong ? 120 : 90) && /après prolongations/.test(s.x) === !!R.prolong) sifOk++;
    if (sortie.o && sortie.o.prolong) { tabVus++;
      const doit = eg(R.sh, R.sa);
      if (doit ? (R.tab && (R.tab.win === home || R.tab.win === away)) : !R.tab) tabOk++; }
  }
  if (sansFil) fail(sansFil + " manches sans fil du moteur (le direct retomberait sur le fil inventé)");
  if (filOk !== n) fail("fil du moteur : " + (n - filOk) + "/" + n + " manches dont les buteurs racontés ≠ buteurs crédités");
  else ok("le fil du moteur crédite exactement les buteurs qu'il raconte (" + n + " manches : aller, retour, finale)");
  if (recolleOk !== n) fail("recollage : " + (n - recolleOk) + "/" + n + " manches où les fiches ne suivent pas le nouveau fil (buts effacés mal défaits)");
  else ok("consigne changée en direct : les buts effacés sortent des fiches, les nouveaux y entrent (" + n + " recollages)");
  if (scoreOk !== n) fail("recollage : le score annoncé ne correspond pas aux buts du fil (" + (n - scoreOk) + " cas)");
  else ok("après recollage, le score annoncé est celui que raconte le fil");
  if (ligueTouchee) fail(ligueTouchee + " buts européens sont tombés dans le classement des buteurs du CHAMPIONNAT");
  else ok("aucun but européen ne touche le classement des buteurs du championnat");
  if (sifOk !== n) fail("sifflet : " + (n - sifOk) + " fils recollés sifflent à la mauvaise minute (90/120) ou oublient les prolongations");
  else ok("le sifflet recollé tombe à 90 ou à 120 et dit « après prolongations » quand il le faut");
  if (tabOk !== tabVus) fail("tirs au but : " + (tabVus - tabOk) + "/" + tabVus + " recollages où la séance ne suit pas l'égalité de la compétition");
  else ok("la séance de tirs au but se rejoue exactement quand rien ne sépare les deux camps (" + tabVus + " manches à prolongations)");
  const st = [api.aStade("le Stadio delle Alpi"), api.aStade("les Brisbane"), api.aStade("Roudourou")];
  if (st.join("|") !== "au Stadio delle Alpi|aux Brisbane|à Roudourou") fail("aStade : " + st.join(" | "));
  else ok("« au Stadio delle Alpi », « à Roudourou » : plus de « à le » au coup d'envoi");
} catch (e) { fail("exception J : " + e.stack); }

console.log(FAILS ? ("\n❌ HARNAIS EUROPE : " + FAILS + " ÉCHEC(S)") : "\n✅ HARNAIS EUROPE : TOUT EST VERT");
process.exit(FAILS ? 1 : 0);
