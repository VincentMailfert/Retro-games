/* Harnais headless — ANTI-RÉPÉTITION DU TÉLÉSCRIPTEUR (v0.97)
   Retour de playtest : « j'ai eu trois fois le même but dans le match, mais écrit un peu
   différemment ». Deux lignes de but identiques (34' et 81') plus une troisième de la même
   famille (le ballon dévié dans ses propres filets) dans un Bordeaux - Auxerre 4-0.
   Ce harnais vérifie, sur un gros échantillon de matchs verbeux :
     A) aucune ligne de commentaire ne tombe DEUX FOIS dans la même rencontre ;
     B) aucun MOTIF narratif (le but contre son camp, la glissade, le crochet de trop)
        n'est raconté deux fois dans la même rencontre ;
     C) la mémoire survit à un changement de consigne en cours de match (simuleReste) ;
     D) les tours de coupe / d'Europe (genEvCoupe) sont logés à la même enseigne ;
     E) la mémoire ne part PAS dans la sauvegarde (propriété non énumérable).
   Usage : node harness-repetitions.cjs                                                    */
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const a = html.indexOf("<script>") + "<script>".length;
const b = html.lastIndexOf("</script>");
const script = html.slice(a, b);

/* ---- stubs DOM/navigateur (identiques au harnais principal) ---- */
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

const epilogue = "\n;return {nouvellePartie,simuleMatch,simuleReste,genEvCoupe,clubById,COMM,MOTIFS_COMM,motifDe,CLUBS,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);

/* ---- reconnaître de quelle ligne de pool vient un texte affiché ----
   fmtC a remplacé {A}/{G}/{D} par des noms : on rebâtit une expression par ligne de pool,
   et on retrouve ainsi le gabarit d'origine de chaque ligne du téléscripteur.
   PIÈGE : un nom de joueur contient un point (« L. Laslandes »), donc le joker doit accepter
   le point — sinon le harnais ne reconnaît presque aucune ligne et dort les yeux ouverts.  */
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const GABARITS = [];
for (const [famille, pool] of Object.entries(api.COMM)) {
  if (!Array.isArray(pool)) continue;
  for (const ligne of pool) {
    if (typeof ligne !== "string") continue;
    const re = new RegExp("^" + esc(ligne).replace(/\\\{A\\\}|\\\{G\\\}|\\\{D\\\}/g, ".{1,40}?"));
    GABARITS.push({ famille, ligne, re, motif: api.motifDe(ligne) });
  }
}
const gabaritDe = (txt) => GABARITS.find((g) => g.re.test(txt)) || null;

/* Le harnais enchaîne des milliers de matchs sur les mêmes effectifs, hors calendrier : les cartons
   rouges empileraient les suspensions jusqu'à vider un secteur entier (tireur() renverrait alors
   undefined). On remet donc les compteurs à zéro avant chaque rencontre. */
const frais = (...cs) => { for (const c of cs) for (const j of c.joueurs) { j.susp = 0; j.bless = 0; } };

/* ---- analyse d'une liste d'évènements ----
   Une répétition n'est pas toujours évitable : le carton du « second jaune » n'a que deux
   formulations, et trois seconds jaunes dans un match en resserviront forcément une (principe des
   tiroirs). On distingue donc la répétition FORCÉE (la famille a été tirée plus de fois qu'elle ne
   compte de lignes — tolérée, et servie le plus loin possible grâce au repli LRU) de la
   répétition FAUTIVE, celle qui tombe alors qu'il restait des lignes libres : celle-là est un bug. */
const TAILLE = {};
for (const g of GABARITS) TAILLE[g.famille] = (TAILLE[g.famille] || 0) + 1;

/* `ev` = ce que le spectateur LIT ; `evConso` = tout ce qui a consommé la mémoire du match. Les
   deux diffèrent après un changement de consigne : les lignes du cours de match annulé ont été
   tirées, donc brûlées, sans jamais s'afficher. Compter les tirages sur `evConso` est la seule
   façon honnête de savoir si un pool était vraiment épuisé au moment du doublon. */
function analyse(ev, evConso) {
  const vus = new Map(), motifs = new Map(), tires = {};
  for (const e of (evConso || ev)) {
    if (!e.x) continue;
    const g = gabaritDe(e.x);
    if (g) tires[g.famille] = (tires[g.famille] || 0) + 1;
  }
  let reconnues = 0;
  for (const e of ev) {
    if (!e.x) continue;
    const g = gabaritDe(e.x);
    if (!g) continue;
    reconnues++;
    vus.set(g.ligne, { n: (vus.get(g.ligne) || { n: 0 }).n + 1, famille: g.famille });
    if (g.motif) motifs.set(g.motif, (motifs.get(g.motif) || 0) + 1);
  }
  const repetees = [...vus].filter(([, v]) => v.n > 1);
  return {
    reconnues,
    repetees,
    fautives: repetees.filter(([, v]) => tires[v.famille] <= TAILLE[v.famille]),
    motifsEnDouble: [...motifs].filter(([, n]) => n > 1),
  };
}

/* ===== A + B) championnat : 1500 matchs verbeux ===== */
api.nouvellePartie(api.CLUBS[0].id);
const G = api.getG();
const N = 1500;
console.log("A/B) Championnat — " + N + " matchs verbeux");
let doublons = 0, doublonsMotif = 0, forcees = 0, maxLignes = 0, totalLignes = 0, pire = null;
for (let k = 0; k < N; k++) {
  const h = G.clubs[k % G.clubs.length], v = G.clubs[(k * 7 + 3) % G.clubs.length];
  if (h === v) continue;
  frais(h, v);
  const r = api.simuleMatch(h, v, true);
  const an = analyse(r.ev);
  totalLignes += an.reconnues;
  if (an.reconnues > maxLignes) maxLignes = an.reconnues;
  if (an.fautives.length) { doublons++; if (!pire) pire = an.fautives[0][0]; }
  if (an.repetees.length) forcees++;
  if (an.motifsEnDouble.length) { doublonsMotif++; }
}
if (doublons === 0) ok("aucune répétition fautive : tant qu'il reste une ligne libre, elle sort");
else fail(doublons + " match(s) avec une ligne en double évitable — ex. « " + pire.slice(0, 60) + "… »");
console.log("   — répétitions forcées (pool plus petit que le nombre de tirages) : " + forcees + " match(s) sur " + N + " —");
if (doublonsMotif === 0) ok("aucun motif narratif raconté deux fois dans un même match");
else fail(doublonsMotif + " match(s) avec un motif en double (ex. deux buts contre son camp)");
console.log("   — " + (totalLignes / N).toFixed(1) + " lignes reconnues par match en moyenne, " + maxLignes + " au maximum (garde=200 : large) —");
if (maxLignes < 200) ok("la fenêtre de mémoire couvre le match le plus bavard");
else fail("un match a dépassé la fenêtre de mémoire (" + maxLignes + " lignes)");

/* ===== C) changement de consigne en cours de match ===== */
console.log("C) Changement de consigne à la mi-temps (simuleReste hérite de la mémoire)");
let doublonsReprise = 0, doublonsMotifReprise = 0, forceesReprise = 0, reprises = 0;
for (let k = 0; k < 600; k++) {
  const h = G.clubs[k % G.clubs.length], v = G.clubs[(k * 11 + 5) % G.clubs.length];
  if (h === v) continue;
  frais(h, v);
  const r = api.simuleMatch(h, v, true);
  // on coupe à la 45e comme le fait rejoueDepuis, puis on re-simule la seconde période
  const garde = r.ev.filter((e) => e.m <= 45);
  let sh = 0, sa = 0;
  for (const e of garde) if (e.g) { if (e.g.cote === h.id) sh++; else sa++; }
  const out = api.simuleReste(h, v, 45, sh, sa, 1, 1, r.vus);
  const an = analyse(garde.concat(out.ev), r.ev.concat(out.ev)); // le cours annulé a brûlé des lignes : il compte dans les tirages
  reprises++;
  if (an.fautives.length) doublonsReprise++;
  if (an.repetees.length) forceesReprise++;
  if (an.motifsEnDouble.length) doublonsMotifReprise++;
}
console.log("   — répétitions forcées (le cours annulé avait déjà vidé la famille) : " + forceesReprise + " sur " + reprises + " reprises —");
if (doublonsReprise === 0) ok("la seconde période re-simulée ne resert aucune ligne évitable de la première");
else fail(doublonsReprise + " reprise(s) avec une ligne déjà lue avant la pause alors qu'il restait du choix");
if (doublonsMotifReprise === 0) ok("aucun motif ne repasse après le changement de consigne");
else fail(doublonsMotifReprise + " reprise(s) avec un motif déjà raconté");

/* ===== D) coupe & Europe ===== */
console.log("D) Coupe / Europe (genEvCoupe)");
let doublonsCoupe = 0, doublonsMotifCoupe = 0, toursVus = 0;
for (let k = 0; k < 800; k++) {
  const H = G.clubs[k % G.clubs.length], A = G.clubs[(k * 13 + 9) % G.clubs.length];
  if (H === A) continue;
  const sh = 1 + (k % 5), sa = k % 4;                       // scores fleuves exprès : on cherche la répétition
  const g = api.genEvCoupe(H, A, { sh, sa, tab: null, win: sh >= sa ? H : A });
  const an = analyse(g.ev);
  toursVus++;
  if (an.fautives.length) doublonsCoupe++;
  if (an.motifsEnDouble.length) doublonsMotifCoupe++;
}
if (doublonsCoupe === 0) ok(toursVus + " tours sans une seule répétition évitable");
else fail(doublonsCoupe + " tour(s) avec une ligne en double évitable");
if (doublonsMotifCoupe === 0) ok("aucun motif en double sur un tour de coupe");
else fail(doublonsMotifCoupe + " tour(s) avec un motif en double");

/* ===== E) la mémoire ne pèse pas sur la sauvegarde ===== */
console.log("E) La mémoire reste hors de la sauvegarde");
frais(G.clubs[0], G.clubs[1]);
const rr = api.simuleMatch(G.clubs[0], G.clubs[1], true);
if (Array.isArray(rr.vus) && rr.vus.length) ok("le match porte bien sa mémoire (" + rr.vus.length + " entrées)");
else fail("le match ne porte pas de mémoire");
if (JSON.parse(JSON.stringify(rr)).vus === undefined) ok("JSON.stringify l'ignore : zéro octet de sauvegarde");
else fail("la mémoire part dans la sauvegarde — interdit (cf. la règle des 2,6 Mo)");

/* ===== bilan ===== */
console.log(FAILS ? "\n❌ HARNAIS RÉPÉTITIONS : " + FAILS + " PROBLÈME(S)" : "\n✅ HARNAIS RÉPÉTITIONS : TOUT EST VERT");
process.exit(FAILS ? 1 : 0);
