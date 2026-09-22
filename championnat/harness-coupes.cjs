/* Harnais des COUPES — MULTIPLEX 95
   L'ÉTALON du chantier « un seul moteur ». Avant de router la Coupe de France et l'Europe par
   `simuleMatch`, il faut savoir ce que le modèle de force autonome produisait : ces chiffres sont la
   référence à retrouver après la bascule, à la tolérance près.
   Mesure, sur N saisons complètes réellement jouées :
   - A) Coupe de France : buts par match, par type d'affiche (pro-pro, pro contre amateur),
        part des tirs au but, distribution des scores.
   - B) L'EXPLOIT : à quelle fréquence un amateur sort un pro. C'est LE chiffre à ne pas perdre.
   - C) Le Petit Poucet : jusqu'où il va, saison après saison.
   - D) Votre parcours : tour atteint, taux de sacre.
   - E) Coupe d'Europe : buts par manche, part des t.a.b., victoire du favori.
   - F) L'INVARIANT DES BUTEURS : résoudre des milliers d'affiches ne doit toucher AUCUN compteur
        de joueur, dans aucun vivier (France, D2, Europe).
   Les chiffres sont comparés à un ÉTALON gravé plus bas, sur un hasard à graine fixe : deux lancers
   rendent exactement les mêmes valeurs, donc tout écart est un vrai écart.
   Usage : node harness-coupes.cjs   (ou GRAINE=1234 node harness-coupes.cjs pour un autre tirage) */
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const a = html.indexOf("<script>") + "<script>".length;
const b = html.lastIndexOf("</script>");
const script = html.slice(a, b);

/* ---- stubs DOM/navigateur ---- */
function makeStub() {
  let stub;
  const fn = function () { return stub; };
  stub = new Proxy(fn, {
    get(_t, p) { if (p === Symbol.toPrimitive) return () => ""; if (p === "length") return 0; return stub; },
    set() { return true; }, apply() { return stub; }, has() { return true; }, construct() { return stub; },
  });
  return stub;
}
const ls = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
global.document = makeStub();
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, localStorage: ls, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.localStorage = ls;
global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

/* ---- HASARD REPRODUCTIBLE : un étalon qui bouge à chaque lancer ne sert à rien.
   On remplace Math.random par un générateur à graine (mulberry32) AVANT de charger le jeu, pour que
   deux exécutions rendent exactement les mêmes chiffres — et qu'un écart constaté après la bascule
   vers `simuleMatch` soit un vrai écart de calibrage, jamais du bruit.
   `GRAINE=…` en variable d'environnement pour rejouer la mesure sur un autre tirage.              */
const GRAINE = Number(process.env.GRAINE || 20250922);
(function semer(g) {
  let t = g >>> 0;
  Math.random = function () {
    t = (t + 0x6D2B79F5) >>> 0;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
})(GRAINE);

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,estAmateur,niveauCoupe,forceCoupe,forceEuro,nomCoupe,resoudreCoupe,euroManche,simuleMatch,enCompet,clubById,CLUBS,CLUBS_D2,CLUBS_AMATEURS,COUPE_TOURS,EURO_TOURS,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const pct = (x) => (100 * x).toFixed(1) + " %";
const moy = (s, n) => (n ? s / n : 0).toFixed(3);

/* ============================================================================
   L'ÉTALON — ce que le modèle de force autonome produisait AVANT le chantier « un seul moteur »
   (graine 20250922, 60 saisons × 3 clubs de départ, mesuré le 22/09/2026 sur la v1.16).
   Les tolérances sont larges (~4 écarts-types) : elles absorbent le fait qu'un changement de code
   consomme le hasard autrement, mais pas un vrai décalage de calibrage.
   QUAND LA BASCULE VERS `simuleMatch` SERA FAITE, ces chiffres bougeront — c'est attendu. Il faudra
   alors les relire un par un, décider lesquels sont une amélioration, et RÉÉCRIRE l'étalon
   sciemment. Ce qu'on ne veut surtout pas, c'est qu'ils bougent sans que personne le voie.
   ============================================================================ */
const ETALON = {
  butsParMatch: [2.629, 0.09],
  butsProPro: [2.373, 0.09],
  butsProAma: [3.062, 0.15],
  tabCoupe: [0.215, 0.030],
  exploit: [0.161, 0.028],
  poucetLoin: [0.122, 0.060],
  monPremierTour: [0.350, 0.080],
  butsMancheEuro: [2.369, 0.09],
  tabEuro: [0.083, 0.025],
  favoriEuro: [0.652, 0.040],
};
function etalonne(cle, mesure, libelle) {
  const ref = ETALON[cle];
  if (!ref) return;
  const [attendu, tol] = ref;
  const d = Math.abs(mesure - attendu);
  if (d > tol) fail(libelle + " : " + mesure.toFixed(3) + " — l'étalon dit " + attendu.toFixed(3) + " (± " + tol + "). Écart de " + d.toFixed(3) + " : calibrage déplacé, ou étalon à réécrire sciemment.");
  else ok(libelle + " conforme à l'étalon (" + mesure.toFixed(3) + " vs " + attendu.toFixed(3) + ")");
}

/* ============================================================================
   Collecte : on joue de vraies saisons et on relit `dernierTour` à chaque tour.
   ============================================================================ */
const SAISONS = 60;                                   // 60 saisons × 3 clubs × 63 affiches = ~11 000 affiches
const DEPARTS = [api.CLUBS[0].id, api.CLUBS[9].id, api.CLUBS_D2[2].id];

const C = {                                            // Coupe de France
  ties: 0, buts: 0, tab: 0, nul90: 0,
  proPro: { ties: 0, buts: 0 },
  proAma: { ties: 0, buts: 0, butsAma: 0, butsPro: 0, exploits: 0 },  // affiche pro contre amateur
  scores: {},                                          // distribution du nombre total de buts
  poucet: {},                                          // tour atteint → occurrences
  poucetSaisons: 0,
  mon: {},                                             // tour de sortie de VOTRE club → occurrences
  monSacres: 0, monSaisons: 0,
};
const E = {                                            // Coupe d'Europe
  ties: 0, manches: 0, buts: 0, tab: 0, favori: 0, favoriTies: 0,
};

const niveau = (id) => api.niveauCoupe(id);            // 0 amateur · 1 D2 · 2 D1

function encaisseCoupe(dt) {
  for (const f of dt.faits) {
    const tot = f.sh + f.sa;
    C.ties++; C.buts += tot;
    if (f.tab) { C.tab++; C.nul90++; }
    C.scores[tot] = (C.scores[tot] || 0) + 1;
    const nh = niveau(f.hid), na = niveau(f.aid);
    const amaH = nh === 0, amaA = na === 0;
    if (!amaH && !amaA) { C.proPro.ties++; C.proPro.buts += tot; }
    else if (amaH !== amaA) {                          // un amateur contre un pro
      C.proAma.ties++; C.proAma.buts += tot;
      const butsAma = amaH ? f.sh : f.sa, butsPro = amaH ? f.sa : f.sh;
      C.proAma.butsAma += butsAma; C.proAma.butsPro += butsPro;
      if (niveau(f.win) === 0) C.proAma.exploits++;
    }
  }
}

function encaisseEuro(dt) {
  for (const f of dt.faits) {
    E.ties++;
    if (f.tab) E.tab++;
    if (f.neutre) { E.manches++; E.buts += f.s[0] + f.s[1]; }
    else { E.manches += 2; E.buts += f.l1[0] + f.l1[1] + f.l2[0] + f.l2[1]; }
    const fa = api.forceEuro(f.aid), fb = api.forceEuro(f.bid);
    if (Math.abs(fa - fb) > 0.5) {                     // affiche à favori net : le plus fort passe-t-il ?
      E.favoriTies++;
      if (f.win === (fa > fb ? f.aid : f.bid)) E.favori++;
    }
  }
}

console.log("Collecte : " + SAISONS + " saisons × " + DEPARTS.length + " clubs de départ…");
const t0 = Date.now();
for (const dep of DEPARTS) {
  try {
    api.nouvellePartie(dep);
    for (let s = 0; s < SAISONS; s++) {
      let vuC = null, vuE = null;
      for (let d = 0; d < 38; d++) {
        api.jouerJournee();
        const G = api.getG();
        if (G.coupe && G.coupe.dernierTour && G.coupe.dernierTour !== vuC) { vuC = G.coupe.dernierTour; encaisseCoupe(vuC); }
        if (G.euro && G.euro.dernierTour && G.euro.dernierTour !== vuE) { vuE = G.euro.dernierTour; if (vuE.manche === 2) encaisseEuro(vuE); }
      }
      const G = api.getG();
      /* le Petit Poucet et votre parcours */
      if (G.coupe) {
        C.poucetSaisons++;
        const sortie = G.coupe.poucetVivant ? "Vainqueur" : (G.coupe.poucetSortie || "32es");
        C.poucet[sortie] = (C.poucet[sortie] || 0) + 1;
        C.monSaisons++;
        if (G.coupe.vainqueur === G.monClub) C.monSacres++;
        else { const t = G.coupe.tourSortie || "non engagé"; C.mon[t] = (C.mon[t] || 0) + 1; }
      }
      G.vire = null;
      api.intersaison();
    }
  } catch (e) { fail("exception pendant la collecte (" + dep + ") : " + e.stack); }
}
console.log("  (" + ((Date.now() - t0) / 1000).toFixed(1) + " s)\n");

/* ============================================================================
   A) Coupe de France — le calibrage général
   ============================================================================ */
console.log("A) Coupe de France — calibrage");
console.log("   affiches jouées ............ " + C.ties);
console.log("   buts par match ............. " + moy(C.buts, C.ties));
console.log("   dont pro contre pro ........ " + moy(C.proPro.buts, C.proPro.ties) + "  (" + C.proPro.ties + " affiches)");
console.log("   dont pro contre amateur .... " + moy(C.proAma.buts, C.proAma.ties) + "  (" + C.proAma.ties + " affiches)");
console.log("      · buts du pro ........... " + moy(C.proAma.butsPro, C.proAma.ties));
console.log("      · buts de l'amateur ..... " + moy(C.proAma.butsAma, C.proAma.ties));
console.log("   nuls au bout de 90' (t.a.b.) " + pct(C.tab / C.ties));
const distr = Object.keys(C.scores).map(Number).sort((x, y) => x - y);
console.log("   distribution des buts ...... " + distr.map(n => n + " but" + (n > 1 ? "s" : "") + " : " + pct(C.scores[n] / C.ties)).join(" · "));

if (C.ties < 500) fail("échantillon trop maigre (" + C.ties + " affiches) — le reste des mesures ne vaut rien");
else ok("échantillon de " + C.ties + " affiches");
etalonne("butsParMatch", C.buts / C.ties, "buts par match");
etalonne("butsProPro", C.proPro.buts / C.proPro.ties, "buts pro contre pro");
etalonne("butsProAma", C.proAma.buts / C.proAma.ties, "buts pro contre amateur");
etalonne("tabCoupe", C.tab / C.ties, "part des tirs au but");

/* ============================================================================
   B) L'EXPLOIT — un amateur sort un pro
   ============================================================================ */
console.log("\nB) L'exploit (un amateur élimine un pro)");
const tauxExploit = C.proAma.ties ? C.proAma.exploits / C.proAma.ties : 0;
console.log("   affiches pro contre amateur  " + C.proAma.ties);
console.log("   exploits ................... " + C.proAma.exploits + "  (" + pct(tauxExploit) + ")");
if (tauxExploit <= 0.01) fail("l'amateur ne gagne JAMAIS (" + pct(tauxExploit) + ") — la coupe a perdu son sel");
else if (tauxExploit >= 0.40) fail("l'amateur gagne trop souvent (" + pct(tauxExploit) + ") — le niveau ne pèse plus rien");
else ok("taux d'exploit tenable : " + pct(tauxExploit));
etalonne("exploit", tauxExploit, "taux d'exploit");

/* ============================================================================
   C) Le Petit Poucet
   ============================================================================ */
console.log("\nC) Le Petit Poucet (" + C.poucetSaisons + " saisons)");
/* `poucetSortie` retient le nom ABRÉGÉ du tour (tour.court), `tourSortie` le nom long (tour.nom) */
const COURTS = ["32es", "16es", "8es", "Quarts", "Demies", "Finale", "Vainqueur"];
const LONGS = ["32es de finale", "16es de finale", "8es de finale", "Quarts de finale", "Demi-finales", "Finale", "Vainqueur"];
for (const t of COURTS) if (C.poucet[t]) console.log("   sorti en " + t.padEnd(12) + " " + pct(C.poucet[t] / C.poucetSaisons));
const loin = COURTS.slice(3).reduce((s, t) => s + (C.poucet[t] || 0), 0);
console.log("   atteint les quarts ou mieux  " + pct(loin / C.poucetSaisons));
if (loin === 0) fail("le Poucet n'atteint JAMAIS les quarts — le bonus ne sert à rien");
else ok("le Poucet va loin " + pct(loin / C.poucetSaisons) + " des saisons");
etalonne("poucetLoin", loin / C.poucetSaisons, "le Poucet aux quarts ou mieux");

/* ============================================================================
   D) Votre parcours
   ============================================================================ */
console.log("\nD) Votre club (" + C.monSaisons + " saisons)");
for (const t of LONGS) if (C.mon[t]) console.log("   éliminé en " + t.padEnd(18) + " " + pct(C.mon[t] / C.monSaisons));
console.log("   sacres ..................... " + C.monSacres + "  (" + pct(C.monSacres / C.monSaisons) + ")");
if (C.monSacres === 0) fail("votre club ne gagne JAMAIS la coupe en " + C.monSaisons + " saisons — invraisemblable, à vérifier");
else ok("votre club soulève le trophée " + pct(C.monSacres / C.monSaisons) + " des saisons");
etalonne("monPremierTour", (C.mon["32es de finale"] || 0) / C.monSaisons, "votre sortie dès les 32es");

/* ============================================================================
   E) Coupe d'Europe
   ============================================================================ */
console.log("\nE) Coupe d'Europe");
console.log("   ties joués ................. " + E.ties + "  (" + E.manches + " manches)");
console.log("   buts par manche ............ " + moy(E.buts, E.manches));
console.log("   ties tranchés aux t.a.b. ... " + pct(E.tab / E.ties));
console.log("   le favori passe ............ " + pct(E.favori / (E.favoriTies || 1)) + "  (" + E.favoriTies + " affiches à favori net)");
if (E.manches < 200) fail("échantillon européen trop maigre (" + E.manches + " manches)");
else ok("échantillon de " + E.manches + " manches européennes");
etalonne("butsMancheEuro", E.buts / E.manches, "buts par manche européenne");
etalonne("tabEuro", E.tab / E.ties, "part des t.a.b. en Europe");
etalonne("favoriEuro", E.favori / (E.favoriTies || 1), "le favori passe");

/* ============================================================================
   F) L'INVARIANT DES BUTEURS — une affiche de coupe ne crédite personne.
   On ne peut PAS le vérifier en comparant, en fin de saison, la somme des `j.buts` de la division à
   la somme des `c.bp` : le mercato d'hiver fait légitimement sortir des buts de la division (un
   buteur vendu en D2 emporte ses buts avec lui). On mesure donc la seule chose qui compte, et on la
   mesure au bon endroit : on relève les compteurs de TOUS les viviers, on résout des centaines
   d'affiches, et rien ne doit avoir bougé.
   C'EST L'INVARIANT À NE PAS PERDRE au moment de router les coupes par `simuleMatch` : les buts de
   coupe devront alors atterrir dans un compteur SÉPARÉ (jamais `j.buts`), sans quoi le classement des
   buteurs du championnat se met à compter les amateurs.
   ============================================================================ */
console.log("\nF) Invariant des buteurs (une affiche de coupe ne crédite personne)");
try {
  api.nouvellePartie(api.CLUBS[3].id);
  const G = api.getG();
  const tousLesJoueurs = () => [].concat(G.clubs || [], G.autre || [], G.europe || []).flatMap(c => c.joueurs || []);
  const releve = () => tousLesJoueurs().reduce((s, j) => s + (j.buts || 0) + (j.passes || 0) + (j.matchs || 0), 0);

  const prosEtAmateurs = (G.clubs || []).concat(G.autre || []).map(c => c.id).concat(api.CLUBS_AMATEURS.map(a => a.id));
  const avantC = releve();
  let butsCoupe = 0;
  for (let i = 0; i < 3000; i++) {
    const h = prosEtAmateurs[Math.floor(Math.random() * prosEtAmateurs.length)];
    let v = prosEtAmateurs[Math.floor(Math.random() * prosEtAmateurs.length)];
    if (v === h) continue;
    const r = api.resoudreCoupe(h, v);
    butsCoupe += r.sh + r.sa;
  }
  const apresC = releve();
  if (apresC !== avantC) fail("Coupe de France : " + (apresC - avantC) + " point(s) de statistique crédité(s) par " + butsCoupe + " buts de coupe");
  else ok("Coupe de France : " + butsCoupe + " buts résolus, zéro statistique touchée");

  const eur = (G.europe || []).map(c => c.id);
  const avantE = releve();
  let butsEuro = 0;
  for (let i = 0; i < 2000; i++) {
    const h = eur[Math.floor(Math.random() * eur.length)];
    let v = eur[Math.floor(Math.random() * eur.length)];
    if (v === h) continue;
    const m = api.euroManche(h, v);
    butsEuro += m[0] + m[1];
  }
  const apresE = releve();
  if (apresE !== avantE) fail("Coupe d'Europe : " + (apresE - avantE) + " point(s) de statistique crédité(s) par " + butsEuro + " buts de manche");
  else ok("Coupe d'Europe : " + butsEuro + " buts résolus, zéro statistique touchée");
} catch (e) { fail("exception dans l'invariant des buteurs : " + e.stack); }

/* ============================================================================
   G) LE CONTEXTE DE COMPÉTITION (`COMPET`) — le cœur du chantier « un seul moteur ».
   Le moteur du championnat, joué sous le maillot d'une coupe, doit déposer ses buts dans le compteur
   de coupe et laisser le classement des buteurs du championnat rigoureusement intact. C'est ce qui
   permet de router la Coupe de France et l'Europe par `simuleMatch` sans mélanger les buteurs.
   ============================================================================ */
console.log("\nG) Le contexte de compétition (COMPET)");
try {
  api.nouvellePartie(api.CLUBS[1].id);
  const G = api.getG();
  const h = G.clubs[0], v = G.clubs[1];
  const somme = (cle) => G.clubs.flatMap(c => c.joueurs).reduce((s, j) => s + (j[cle] || 0), 0);

  /* 1) sous le maillot d'une coupe : rien au championnat, tout au compteur de coupe */
  const avant = { buts: somme("buts"), passes: somme("passes"), butsC: somme("butsC"), passesC: somme("passesC") };
  let marques = 0;
  for (let i = 0; i < 400; i++) {
    const r = api.enCompet("CF", () => api.simuleMatch(h, v, false));
    marques += r.sh + r.sa;
  }
  const apres = { buts: somme("buts"), passes: somme("passes"), butsC: somme("butsC"), passesC: somme("passesC") };
  if (apres.buts !== avant.buts) fail("400 matchs de coupe ont ajouté " + (apres.buts - avant.buts) + " but(s) au classement des buteurs du championnat");
  else ok("le classement des buteurs du championnat n'a pas bougé (" + marques + " buts de coupe marqués)");
  if (apres.passes !== avant.passes) fail("400 matchs de coupe ont ajouté " + (apres.passes - avant.passes) + " passe(s) au championnat");
  else ok("le tableau des passeurs du championnat n'a pas bougé");
  if (apres.butsC - avant.butsC !== marques) fail("compteur de coupe : " + (apres.butsC - avant.butsC) + " buts enregistrés pour " + marques + " marqués");
  else ok("les " + marques + " buts sont tous arrivés dans le compteur de coupe");
  if (apres.passesC <= avant.passesC) fail("aucune passe décisive n'a été enregistrée en coupe");
  else ok((apres.passesC - avant.passesC) + " passes décisives enregistrées en coupe");

  /* 2) sous le maillot du championnat : l'inverse, exactement */
  const av2 = { buts: somme("buts"), butsC: somme("butsC") };
  let marques2 = 0;
  for (let i = 0; i < 200; i++) { const r = api.simuleMatch(h, v, false); marques2 += r.sh + r.sa; }
  const ap2 = { buts: somme("buts"), butsC: somme("butsC") };
  if (ap2.butsC !== av2.butsC) fail("un match de championnat a alimenté le compteur de coupe");
  else if (ap2.buts - av2.buts !== marques2) fail("championnat : " + (ap2.buts - av2.buts) + " buts enregistrés pour " + marques2 + " marqués");
  else ok("le championnat écrit toujours dans son propre compteur (" + marques2 + " buts)");

  /* 3) le maillot se rend TOUJOURS, même quand le match explose en vol : une variable laissée sur
        "CF" ferait disparaître la journée de championnat suivante des classements. */
  try { api.enCompet("CF", () => { throw new Error("coup de sifflet interrompu"); }); } catch (e) { /* attendu */ }
  const av3 = somme("buts");
  api.simuleMatch(h, v, false);
  if (somme("buts") === av3) fail("après une exception en coupe, le championnat n'écrit plus dans son compteur : le maillot n'a pas été rendu");
  else ok("le maillot est rendu même si le match lève une exception");
} catch (e) { fail("exception dans le contexte de compétition : " + e.stack); }

console.log("\n" + (FAILS ? "✗ " + FAILS + " ÉCHEC(S)" : "TOUT EST VERT"));
process.exit(FAILS ? 1 : 0);
