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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,estAmateur,niveauCoupe,forceCoupe,forceEuro,nomCoupe,resoudreCoupe,euroManche,simuleMatch,enCompet,clubById,clubAmateur,amaById,forceClub,COUPE_POUCET_BONUS,tirsAuBut,affluenceCoupe,usureProlong,onze,CLUBS,CLUBS_D2,CLUBS_AMATEURS,COUPE_TOURS,EURO_TOURS,getG:function(){return G;}};";
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
  const av3 = { buts: somme("buts"), butsC: somme("butsC") };
  // vingt matchs, pas un seul : un match isolé peut finir 0-0 et le test crierait au loup pour rien
  let marques3 = 0;
  for (let i = 0; i < 20; i++) { const r = api.simuleMatch(h, v, false); marques3 += r.sh + r.sa; }
  const ap3 = { buts: somme("buts"), butsC: somme("butsC") };
  if (ap3.butsC !== av3.butsC) fail("après une exception en coupe, le championnat écrit encore dans le compteur de coupe : le maillot n'a pas été rendu");
  else if (ap3.buts - av3.buts !== marques3) fail("après une exception, le championnat n'enregistre plus ses buts correctement (" + (ap3.buts - av3.buts) + " pour " + marques3 + " marqués)");
  else ok("le maillot est rendu même si le match lève une exception (" + marques3 + " buts, tous au championnat)");
} catch (e) { fail("exception dans le contexte de compétition : " + e.stack); }

/* ============================================================================
   H) ON SOIGNE AUSSI LES AUTRES — la D2 et l'Europe guérissent, elles aussi.
   La récupération hebdomadaire ne balayait que `G.clubs`, votre division : un joueur de D2 ou de la
   Juventus blessé restait éclopé jusqu'à la fin des temps. Sans conséquence tant que rien ne les
   blessait, mortel le jour où les coupes passeront par `simuleMatch` — leurs effectifs se videraient
   saison après saison et `onze()` finirait par aligner des dépanneurs hors poste.
   ============================================================================ */
console.log("\nH) La D2 et l'Europe guérissent aussi");
try {
  api.nouvellePartie(api.CLUBS[6].id);
  const G = api.getG();
  const cobayes = [];
  const pose = (vivier, nom) => {
    const c = (G[vivier] || [])[0];
    if (!c || !c.joueurs || !c.joueurs.length) { fail("vivier " + nom + " introuvable ou sans effectif"); return; }
    const j = c.joueurs[0];
    j.bless = 3; j.susp = 2; j.fraich = 40;
    cobayes.push({ uid: j.uid, nom: nom, club: c.nom });
  };
  pose("autre", "D2");
  pose("europe", "Europe");

  for (let d = 0; d < 4; d++) api.jouerJournee();

  const partout = [].concat(G.clubs || [], G.autre || [], G.europe || []).flatMap(c => c.joueurs || []);
  for (const co of cobayes) {
    const j = partout.find(x => x.uid === co.uid);
    if (!j) { fail(co.nom + " : le cobaye a disparu des viviers"); continue; }
    if (j.bless > 0) fail(co.nom + " (" + co.club + ") : blessure toujours à " + j.bless + " après 4 journées — personne ne le soigne");
    else if (j.susp > 0) fail(co.nom + " (" + co.club + ") : suspension toujours à " + j.susp + " après 4 journées — elle ne se purge pas");
    else if (!(j.fraich > 40)) fail(co.nom + " (" + co.club + ") : fraîcheur toujours à " + Math.round(j.fraich) + " — aucun repos hebdomadaire");
    else ok(co.nom + " (" + co.club + ") : guéri, suspension purgée, fraîcheur remontée à " + Math.round(j.fraich));
  }
} catch (e) { fail("exception dans la récupération des autres viviers : " + e.stack); }

/* ============================================================================
   I) LES EFFECTIFS DE VILLAGE — les amateurs ont des joueurs, et ce sont les bons.
   Seize hommes par club réellement au tableau, une moyenne de onze qui vaut exactement la note de
   force du club (sans quoi le calibrage des coupes partirait à la dérive), le Petit Poucet bâti sur
   sa force majorée, des noms qui n'empiètent pas sur ceux des vrais joueurs, un effectif STABLE d'un
   tour à l'autre — c'est tout l'intérêt : suivre le buteur du Poucet pendant son parcours — et remis
   à neuf à chaque intersaison, comme l'a voulu l'auteur.
   ============================================================================ */
console.log("\nI) Les effectifs de village");
try {
  api.nouvellePartie(api.CLUBS[4].id);
  const G = api.getG();
  const co = G.coupe;
  const auTableau = co.vivants.filter(api.estAmateur);

  /* À LA DEMANDE : au tirage, aucun vestiaire n'est encore monté. Les bâtir tous d'un bloc ajoutait
     ~100 Ko par sauvegarde et faisait passer quatre carrières au-dessus des ~5 Mo du navigateur. */
  if (Object.keys(co.effectifs || {}).length !== 0)
    fail("au tirage, " + Object.keys(co.effectifs).length + " effectifs déjà bâtis : ils doivent naître à la première affiche");
  else ok("au tirage, aucun effectif de village n'est encore monté (ils naissent quand ils jouent)");

  /* structure : seize hommes, 2 gardiens / 5 défenseurs / 5 milieux / 4 attaquants */
  let malFormes = 0;
  for (const id of auTableau) {
    const c = api.clubAmateur(id);
    const n = { G: 0, D: 0, M: 0, A: 0 };
    for (const j of c.joueurs) n[j.pos]++;
    if (c.joueurs.length !== 16 || n.G !== 2 || n.D !== 5 || n.M !== 5 || n.A !== 4) malFormes++;
  }
  if (malFormes) fail(malFormes + " effectif(s) hors format (attendu 16 hommes : 2G 5D 5M 4A)");
  else ok("tous les effectifs sont au format : 16 hommes, 2G 5D 5M 4A");

  /* calibrage : la moyenne du onze vaut la force du club, au point près. C'est CE chiffre que
     l'ancien modèle lisait, donc c'est lui qui garantit que le calibrage ne dérive pas. */
  let pire = 0, pireNom = "";
  for (const id of auTableau) {
    const c = api.clubAmateur(id);
    const cible = api.amaById(id).force + (id === co.poucetId ? api.COUPE_POUCET_BONUS : 0);
    const d = Math.abs(api.forceClub(c) - cible);
    if (d > pire) { pire = d; pireNom = c.nom + " (visé " + cible + ", obtenu " + api.forceClub(c).toFixed(2) + ")"; }
  }
  if (pire > 1) fail("recentrage rate : ecart de " + pire.toFixed(2) + " sur " + pireNom);
  else ok("moyenne du onze conforme à la force du club partout (écart max " + pire.toFixed(2) + ")");

  /* le Petit Poucet joue bien au-dessus de son rang */
  const p = api.clubAmateur(co.poucetId);
  if (!p) fail("le Petit Poucet n'a pas d'effectif");
  else if (api.forceClub(p) < api.amaById(co.poucetId).force + api.COUPE_POUCET_BONUS - 1)
    fail("le Petit Poucet n'a pas reçu son bonus : " + api.forceClub(p).toFixed(1));
  else ok("le Petit Poucet (" + p.nom + ") est bâti à " + api.forceClub(p).toFixed(1) + ", loin au-dessus de son rang");

  /* aucun joueur de village ne porte le nom d'un vrai joueur */
  const vrais = new Set([].concat(G.clubs || [], G.autre || [], G.europe || []).flatMap(c => c.joueurs || []).map(j => j.nom));
  const collisions = auTableau.flatMap(id => api.clubAmateur(id).joueurs).filter(j => vrais.has(j.nom));
  if (collisions.length) fail(collisions.length + " joueur(s) de village portent le nom d'un vrai joueur (ex. " + collisions[0].nom + ")");
  else ok("aucun homonyme entre les villages et les vrais effectifs");

  /* On traverse les 32es (J10), puis on relève l'état. ATTENTION à l'ordre : lire `clubAmateur` d'un
     club éliminé lui rebâtit un vestiaire — la mesure du rangement doit donc précéder toute lecture. */
  const temoin = auTableau[0];
  for (let d = api.getG().journee; d < 11; d++) api.jouerJournee();

  /* ON RANGE CE QUI SORT : un village éliminé ne pèse plus rien dans la sauvegarde */
  const enLice = api.getG().coupe.vivants.filter(api.estAmateur);
  const gardes = Object.keys(api.getG().coupe.effectifs || {});
  const fantomes = gardes.filter(id => !enLice.includes(id));
  if (fantomes.length) fail(fantomes.length + " vestiaire(s) gardé(s) pour des villages éliminés (ex. " + fantomes[0] + ")");
  else ok(gardes.length + " vestiaires pour " + enLice.length + " villages encore en lice — les éliminés sont rangés");
  if (!gardes.includes(temoin) && enLice.includes(temoin)) fail("un village encore en lice a perdu son vestiaire");

  /* STABILITÉ : tant qu'un village est en lice, ce sont les MÊMES onze hommes. C'est tout l'intérêt de
     l'effectif à la saison — suivre le buteur du Petit Poucet d'un tour à l'autre. */
  const snap = {};
  for (const id of enLice) { const e = api.getG().coupe.effectifs[id]; if (e) snap[id] = e.joueurs.map(j => j.uid).join(","); }
  for (let d = api.getG().journee; d < 16; d++) api.jouerJournee();   // on traverse les 16es (J15)
  let testes = 0, bouges = 0;
  for (const id of api.getG().coupe.vivants.filter(api.estAmateur)) {
    if (!snap[id]) continue;
    testes++;
    const e = api.getG().coupe.effectifs[id];
    if (!e || e.joueurs.map(j => j.uid).join(",") !== snap[id]) bouges++;
  }
  if (bouges) fail(bouges + " village(s) encore en lice ont vu leur effectif changer d'un tour à l'autre");
  else if (!testes) console.log("   (aucun village n'a franchi deux tours ce coup-ci — stabilité non mesurée)");
  else ok(testes + " village(s) ont franchi un tour de plus avec exactement les mêmes onze hommes");

  /* et tout est remis à neuf à l'intersaison */
  for (let d = api.getG().journee; d < 38; d++) api.jouerJournee();
  api.getG().vire = null;
  api.intersaison();
  const neuf = api.getG().coupe;
  const memeClub = neuf.effectifs && neuf.effectifs[temoin];
  if (memeClub && memeClub.joueurs.map(j => j.uid).join(",") === avant)
    fail("l'intersaison a gardé le même effectif de village : il devait être tiré à neuf");
  else ok("l'intersaison tire des effectifs de village neufs");

  /* filet : une sauvegarde d'avant le chantier n'a pas d'effectifs — on les rebâtit à la volée */
  neuf.effectifs = null;
  const rattrape = api.clubAmateur(neuf.vivants.filter(api.estAmateur)[0]);
  if (!rattrape || !rattrape.joueurs || rattrape.joueurs.length !== 16)
    fail("une sauvegarde sans effectifs ne se rattrape pas : clubAmateur devrait en rebâtir un");
  else ok("une sauvegarde d'avant le chantier se rattrape toute seule (effectif rebâti à la volée)");
} catch (e) { fail("exception dans les effectifs de village : " + e.stack); }

/* ============================================================================
   J) CE QUE LE MOTEUR A APPRIS POUR LES SOIRS DE SEMAINE
   Terrain neutre, affluence de coupe, prolongations, tirs au but. Tout cela doit rester INERTE en
   championnat : le samedi, `simuleMatch` appelé sans options se comporte exactement comme avant.
   ============================================================================ */
console.log("\nJ) Terrain neutre, prolongations, tirs au but");
try {
  api.nouvellePartie(api.CLUBS[2].id);
  const G = api.getG();
  const A = G.clubs[3], B = G.clubs[4];
  const village = api.clubAmateur(G.coupe.vivants.filter(api.estAmateur)[0]); // sert aux t.a.b. ET à l'affluence
  const lot = (h, v, opts, n) => {
    let buts = 0, butsH = 0, prolongs = 0, tabs = 0, nuls = 0;
    for (let i = 0; i < n; i++) {
      const r = api.simuleMatch(h, v, false, opts);
      buts += r.sh + r.sa; butsH += r.sh;
      if (r.prolong) prolongs++;
      if (r.tab) tabs++;
      if (r.sh === r.sa && !r.tab) nuls++;
    }
    return { buts: buts / n, partH: butsH / buts, prolongs, tabs, nuls };
  };

  /* 1) le samedi, rien n'a changé : pas de prolongation, pas de séance, et l'avantage du terrain est là */
  const samedi = lot(A, B, undefined, 3000);
  if (samedi.prolongs || samedi.tabs) fail("un match de championnat est parti en prolongation ou aux tirs au but");
  else ok("le championnat ignore tout des prolongations (" + samedi.nuls + " nuls sur 3000, laissés nuls)");

  /* 2) TERRAIN NEUTRE : jouer A chez lui ou chez B ne doit plus rien changer pour A.
        Test sans hypothèse : on compare A recevant et A se déplaçant, sur terrain neutre. */
  const neutreChezA = lot(A, B, { neutre: true }, 4000);
  const neutreChezB = lot(B, A, { neutre: true }, 4000);
  const partAChezLui = neutreChezA.partH, partAEnDepl = 1 - neutreChezB.partH;
  const dissym = Math.abs(partAChezLui - partAEnDepl);
  if (dissym > 0.035) fail("terrain neutre : A prend " + pct(partAChezLui) + " des buts chez lui contre " + pct(partAEnDepl) + " chez B — le terrain compte encore");
  else ok("terrain neutre : A pèse pareil des deux côtés (" + pct(partAChezLui) + " contre " + pct(partAEnDepl) + ")");

  const domChezA = lot(A, B, undefined, 4000).partH;
  if (domChezA - partAChezLui < 0.02) fail("le terrain neutre ne se distingue pas d'un match à domicile (" + pct(domChezA) + " vs " + pct(partAChezLui) + ")");
  else ok("l'avantage du terrain existe bien et disparaît en neutre (" + pct(domChezA) + " à domicile, " + pct(partAChezLui) + " en neutre)");

  if (Math.abs(neutreChezA.buts - samedi.buts) > 0.10) fail("terrain neutre : " + neutreChezA.buts.toFixed(3) + " buts contre " + samedi.buts.toFixed(3) + " — le total a bougé, seule la répartition devait changer");
  else ok("le total de buts ne bouge pas en neutre (" + neutreChezA.buts.toFixed(3) + " contre " + samedi.buts.toFixed(3) + ")");

  /* 3) PROLONGATIONS : une affiche de coupe ne peut pas finir à égalité */
  const coupe = lot(A, B, { prolong: true }, 3000);
  if (coupe.nuls) fail(coupe.nuls + " affiche(s) de coupe se sont terminées sur un nul sans séance de tirs au but");
  else ok("aucune affiche de coupe ne reste indécise (" + coupe.prolongs + " prolongations, " + coupe.tabs + " séances de tirs au but sur 3000)");
  if (!coupe.prolongs) fail("aucune prolongation en 3000 affiches : la rallonge ne se déclenche jamais");
  else if (!coupe.tabs) fail("aucune séance de tirs au but en 3000 affiches");
  else ok(Math.round(100 * coupe.tabs / coupe.prolongs) + " % des prolongations vont jusqu'aux tirs au but, le reste se décide sur le terrain");
  if (coupe.buts <= samedi.buts) fail("les prolongations n'ajoutent aucun but (" + coupe.buts.toFixed(3) + " contre " + samedi.buts.toFixed(3) + ")");
  else ok("les prolongations ajoutent " + (coupe.buts - samedi.buts).toFixed(3) + " but par affiche, en moyenne");

  /* 4) L'USURE : trente minutes de plus coûtent d'autant plus qu'on y arrive entamé */
  const frais = api.onze(A).map(j => j.fraich);
  api.onze(A).forEach(j => { j.fraich = 100; });
  const plein = api.usureProlong(A);
  api.onze(A).forEach(j => { j.fraich = 65; });
  const cuit = api.usureProlong(A);
  api.onze(A).forEach((j, k) => { j.fraich = frais[k]; });
  if (Math.abs(plein - 1) > 0.001) fail("une équipe au plein régime devrait garder son rendement en prolongation (" + plein.toFixed(3) + ")");
  else if (!(cuit < plein - 0.10)) fail("une équipe entamée ne paie pas la prolongation (" + cuit.toFixed(3) + " contre " + plein.toFixed(3) + ")");
  else ok("l'usure de la prolongation mord : 1,000 au plein régime, " + cuit.toFixed(3) + " à 65 de fraîcheur");

  /* 5) LA SÉANCE : elle désigne toujours un qualifié, et jamais sur un score nul */
  let nulTab = 0, courtes = 0, victoiresA = 0;
  for (let i = 0; i < 3000; i++) {
    const t = api.tirsAuBut(A, B, false, null);
    if (t.h === t.a) nulTab++;
    if (t.h + t.a < 2) courtes++;
    if (t.win === A.id) victoiresA++;
  }
  if (nulTab) fail(nulTab + " séance(s) de tirs au but se sont terminées à égalité");
  else if (courtes > 30) fail(courtes + " séances bouclées en moins de deux frappes : la mécanique s'arrête trop tôt");
  else ok("3000 séances, toujours un qualifié (" + pct(victoiresA / 3000) + " pour " + A.nom + ")");

  /* LA SÉANCE DOIT RESTER UNE LOTERIE. C'est tout le sel de la coupe : si le niveau y pesait comme
     dans le jeu, un village n'éliminerait jamais un cador et le Petit Poucet n'existerait plus. Un
     premier réglage donnait 5 % au village contre le PSG — beaucoup trop sévère. Bornes larges à
     dessein : on garde le grand favori, jamais assuré. */
  if (village) {
    const gros = G.clubs.slice().sort((x, y) => (api.forceClub(y) - api.forceClub(x)))[0];
    let vil = 0;
    for (let i = 0; i < 6000; i++) if (api.tirsAuBut(village, gros, false, null).win === village.id) vil++;
    const part = vil / 6000;
    if (part < 0.12) fail("aux tirs au but, " + village.nom + " ne sort " + gros.nom + " que " + pct(part) + " du temps : la séance n'est plus une loterie, la légende de la coupe meurt");
    else if (part > 0.45) fail("aux tirs au but, " + village.nom + " sort " + gros.nom + " " + pct(part) + " du temps : le niveau ne pèse plus rien du tout");
    else ok("la séance reste une loterie : " + village.nom + " sort " + gros.nom + " " + pct(part) + " du temps");
  }

  /* 6) L'AFFLUENCE D'UN SOIR DE COUPE : ce qui remplit, c'est qui descend */
  if (!village) fail("pas de village sous la main pour mesurer l'affluence");
  else {
    const gros = G.clubs.slice().sort((x, y) => (y.pres || 0) - (x.pres || 0))[0];
    const remplissageVillage = api.affluenceCoupe(village, gros) / village.cap;
    const remplissageGros = api.affluenceCoupe(gros, village) / gros.cap;
    if (remplissageVillage < 0.85) fail("le village n'affiche pas complet quand " + gros.nom + " descend (" + pct(remplissageVillage) + ")");
    else if (remplissageGros > 0.65) fail("le grand stade se remplit trop pour recevoir des amateurs (" + pct(remplissageGros) + ")");
    else ok("le village est plein pour recevoir " + gros.nom + " (" + pct(remplissageVillage) + "), le grand stade sonne creux pour l'inverse (" + pct(remplissageGros) + ")");
  }
} catch (e) { fail("exception dans les soirs de semaine : " + e.stack); }

console.log("\n" + (FAILS ? "✗ " + FAILS + " ÉCHEC(S)" : "TOUT EST VERT"));
process.exit(FAILS ? 1 : 0);
