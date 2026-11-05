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

const epilogue = "\n;return {nouvellePartie,simuleMatch,simuleReste,genEvCoupe,clubById,COMM,MOTIFS_COMM,motifDe,monteeUn,monteeDeux,phaseTir,MONTEE_BUT,MONTEE_CONTRE,MONTEE_FRAPPE,MONTEE_LOIN,MONTEE_LOIN_FRAPPE,MONTEE_LOB,MONTEE_LOB_FRAPPE,MONTEE_ARRET,MONTEE_ARRET_FRAPPE,TIRS_LOIN,TIRS_LOB,TIRS_ARRET,TIRS_CF,MONTEE_VOIE,VOIES_TIR,voieTir,BUT_SANS_PASSE,BUT_CORNER_DIRECT,onze,CLUBS,getG:function(){return G;}};";
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

/* ===== F) mise en scène : la montée colle à la phase de jeu ===== */
console.log("F) Mise en scène du premier temps (monteeUn)");
const h0 = G.clubs[0], a0 = G.clubs[1];
// toutes les formulations de contre possibles pour ces deux effectifs, AVEC LES ONZE DU MOMENT : les matchs
// simulés entre-temps (section G) fatiguent et blessent, les titulaires changent, et une liste figée ici
// déclarait « hors contre » un vrai titulaire entré depuis (rouge une fois sur dix environ, 25/09/2026)
const contres = () => { const s = new Set();
  for (const f of api.MONTEE_CONTRE)
    for (const r of api.onze(h0)) for (const v of api.onze(a0)) s.add(f(r.nom, v.nom));
  return s; };
const CONTRES = contres();
const BUTS = new Set(api.MONTEE_BUT);

let horsContre = 0, horsGenerique = 0;
for (let k = 0; k < 400; k++) {
  const info = { contre: true, but: api.onze(h0)[0].nom, cote: h0.id };
  if (!CONTRES.has(api.monteeUn(info, [], h0, a0))) horsContre++;
  const info2 = { contre: false, but: api.onze(h0)[0].nom, cote: h0.id };
  if (!BUTS.has(api.monteeUn(info2, [], h0, a0))) horsGenerique++;
}
if (horsContre === 0) ok("un évènement marqué « contre » est TOUJOURS annoncé comme un contre");
else fail(horsContre + " contre(s) sur 400 annoncés par une montée générique");
if (horsGenerique === 0) ok("une action de jeu ouvert n'emprunte jamais la montée de contre");
else fail(horsGenerique + " action(s) de jeu ouvert annoncée(s) comme un contre");
if (BUTS.has(api.monteeUn({ contre: true, but: "X" }, []))) ok("sans camps connus, repli propre sur la montée générique");
else fail("le repli sans camps ne retombe pas sur MONTEE_BUT");

// la montée générique ne doit imposer AUCUNE phase de jeu (règle écrite au-dessus du pool)
const imposeContre = api.MONTEE_BUT.filter((l) => /bcontreb|contre-attaque/i.test(l));
const imposeArret = api.MONTEE_BUT.filter((l) => /corner|coup franc|penalty|touche de but/i.test(l));
if (!imposeContre.length) ok("aucune ligne de MONTEE_BUT n'annonce un contre");
else fail(imposeContre.length + " ligne(s) de MONTEE_BUT parlent de contre : « " + imposeContre[0].slice(0, 50) + "… »");
if (!imposeArret.length) ok("aucune ligne de MONTEE_BUT n'impose un coup de pied arrêté");
else fail(imposeArret.length + " ligne(s) de MONTEE_BUT imposent un coup de pied arrêté : « " + imposeArret[0].slice(0, 50) + "… »");

/* ===== G) mise en scène : le décor doit coller à la CONCLUSION (v1.04) =====
   Retour de playtest : « Coup de billard devant le but… », « Dernière passe pour X… », puis
   « PRALINE DE TRENTE MÈTRES ! ». Même famille que la météo, le contre et le coup franc. Le moteur
   étiquette désormais chaque résolution (`ph` : "" jeu ouvert proche, "loin", "bal" = sur corner)
   et les deux temps de la montée piochent dans le décor correspondant. On vérifie les trois
   maillons : les listes collent aux pools, le drapeau est posé partout, le décor suit.        */
console.log("G) Phase de la conclusion (TIRS_LOIN / TIRS_LOB / TIRS_ARRET, monteeUn / monteeDeux)");
const POOLS_TIR = [].concat(api.COMM.but, api.COMM.rate, api.COMM.arret, api.COMM.rateContre);
const ETIQUETEES = [...api.TIRS_LOIN, ...api.TIRS_LOB, ...api.TIRS_ARRET];
const orphelines = ETIQUETEES.filter((l) => !POOLS_TIR.includes(l));
if (!orphelines.length) ok("les " + ETIQUETEES.length + " conclusions étiquetées sont bien recollées dans leur pool");
else fail(orphelines.length + " ligne(s) étiquetée(s) ne sont dans aucun pool : « " + orphelines[0].slice(0, 45) + "… »");

// filets de rattrapage : une conclusion écrite directement dans le pool serait muette
const RX_LOIN = /(vingt|vingt-cinq|trente|quarante) m[èe]tres/i;
// (un lob part de loin lui aussi, mais il a sa propre famille : il y est compté)
const oubliees = POOLS_TIR.filter((l) => RX_LOIN.test(l) && !api.TIRS_LOIN.has(l) && !api.TIRS_LOB.has(l));
if (!oubliees.length) ok("aucune frappe de loin restée dans un pool sans son drapeau");
else fail(oubliees.length + " ligne(s) parlent de vingt mètres et plus hors de TIRS_LOIN : « " + oubliees[0].slice(0, 45) + "… »");
// v1.09 — « se présente seul devant Y » puis « tente le lob sur le gardien monté trop haut » : le lob
// était resté dans le pool sans drapeau. « lobe son propre gardien » (la déviation) n'est pas un lob tenté.
const RX_LOB = /\blob\b/i;
const oubliLob = POOLS_TIR.filter((l) => RX_LOB.test(l) && !api.TIRS_LOB.has(l));
if (!oubliLob.length) ok("aucun lob resté dans un pool sans son drapeau");
else fail(oubliLob.length + " lob(s) hors de TIRS_LOB : « " + oubliLob[0].slice(0, 45) + "… »");
const lobIssues = ["but", "rate", "arret"].filter((k) => api.COMM[k].some((l) => api.TIRS_LOB.has(l)));
if (lobIssues.length === 3) ok("le lob existe en but, en raté ET en arrêt : sa mise en scène ne trahit pas l'issue");
else fail("le lob n'a d'issue qu'en " + lobIssues.join("/") + " : sa montée annonce le dénouement");
// « détournée EN corner » est un aboutissement, « sur corner » une origine : seule l'origine compte
const RX_ARRET = /(sur|de|du) corner|corner (rentrant|au second|direct)/i;
const oubliArret = POOLS_TIR.filter((l) => RX_ARRET.test(l) && !api.TIRS_ARRET.has(l));
if (!oubliArret.length) ok("aucune conclusion sur corner restée dans un pool sans son drapeau");
else fail(oubliArret.length + " ligne(s) naissent d'un corner hors de TIRS_ARRET : « " + oubliArret[0].slice(0, 45) + "… »");

// le décor lointain n'impose ni balle arrêtée ni contre ; le décor de corner ne parle jamais de contre
const horsRegle = api.MONTEE_LOIN.filter((l) => /corner|coup franc|penalty|contre-attaque|en contre/i.test(l));
if (!horsRegle.length) ok("MONTEE_LOIN n'impose aucune phase de jeu qu'elle ne connaît pas");
else fail(horsRegle.length + " ligne(s) de MONTEE_LOIN imposent une phase : « " + horsRegle[0].slice(0, 45) + "… »");
const horsRegle3 = api.MONTEE_LOB.filter((l) => /corner|coup franc|penalty|contre-attaque|en contre|recule|\blob\b/i.test(l));
if (!horsRegle3.length) ok("MONTEE_LOB ne dit ni balle arrêtée, ni contre, ni « recule », ni « lob » (la résolution s'en charge)");
else fail(horsRegle3.length + " ligne(s) de MONTEE_LOB en disent trop : « " + horsRegle3[0].slice(0, 45) + "… »");

// v1.09 — « prend sa chance des VINGT mètres », puis « PRALINE DE TRENTE MÈTRES ». La montée ne chiffre
// jamais la distance : seule la résolution le fait. On balaie les SEPT pools de montée, fonctions
// comprises (évaluées avec des noms factices) — « six mètres » (la zone) et « deux mètres » (d'avance)
// ne sont pas des distances au but et restent permis.
const RX_CHIFFRE = /(dix|onze|douze|quinze|seize|dix-huit|vingt|trente|quarante|cinquante|\d{2,})[- ]?\S* m[èe]tres/i;
const texteMontee = (x) => (typeof x === "function" ? x("Joueur", "Gardien") : x);
const chiffrees = [].concat(api.MONTEE_BUT, api.MONTEE_FRAPPE, api.MONTEE_LOIN, api.MONTEE_LOIN_FRAPPE,
  api.MONTEE_LOB, api.MONTEE_LOB_FRAPPE, api.MONTEE_ARRET, api.MONTEE_ARRET_FRAPPE, api.MONTEE_CONTRE.map((f) => f("Joueur", "Rival")))
  .map(texteMontee).filter((t) => RX_CHIFFRE.test(t));
if (!chiffrees.length) ok("aucune montée ne chiffre la distance : la résolution est seule à le faire");
else fail(chiffrees.length + " montée(s) chiffrent une distance : « " + chiffrees[0].slice(0, 50) + "… »");
// et le second temps d'une frappe de loin ne décrit pas le geste que la résolution racontera
const gestesLoin = api.MONTEE_LOIN_FRAPPE.map(texteMontee).filter((t) => /\barme|prend sa chance|frapp|\btire\b|décoche|ramasse|récup/i.test(t));
if (!gestesLoin.length) ok("MONTEE_LOIN_FRAPPE installe l'homme sans raconter le geste ni la prise de balle");
else fail(gestesLoin.length + " ligne(s) de MONTEE_LOIN_FRAPPE racontent déjà le geste : « " + gestesLoin[0].slice(0, 45) + "… »");
const horsRegle2 = api.MONTEE_ARRET.filter((l) => /coup franc|penalty|contre-attaque|en contre/i.test(l));
if (!horsRegle2.length) ok("MONTEE_ARRET ne parle que du corner qu'elle connaît");
else fail(horsRegle2.length + " ligne(s) de MONTEE_ARRET imposent une autre phase");

// le drapeau suit la ligne tirée, sur les sept points de génération
function verifieDrapeau(ev, cpt) {
  for (const e of ev) {
    const info = e.g || e.q;
    if (!info || !e.x) continue;
    const g = gabaritDe(e.x);
    if (!g) continue;
    const attendu = api.phaseTir(g.ligne);
    if ((info.ph || "") !== attendu) cpt.ko++;
    cpt[attendu || "ouvert"] = (cpt[attendu || "ouvert"] || 0) + 1;
  }
}
const cpt = { ko: 0 };
for (let k = 0; k < 600; k++) {
  const h = G.clubs[k % G.clubs.length], v = G.clubs[(k * 7 + 3) % G.clubs.length];
  if (h === v) continue;
  frais(h, v);
  const r = api.simuleMatch(h, v, true);
  verifieDrapeau(r.ev, cpt);
  const garde = r.ev.filter((e) => e.m <= 45);
  let sh = 0, sa = 0;
  for (const e of garde) if (e.g) { if (e.g.cote === h.id) sh++; else sa++; }
  verifieDrapeau(api.simuleReste(h, v, 45, sh, sa, 1, 1, r.vus).ev, cpt);
  verifieDrapeau(api.genEvCoupe(h, v, { sh: 1 + (k % 4), sa: k % 3, tab: null, win: h }).ev, cpt);
}
if (cpt.ko === 0 && cpt.lob > 0) ok("drapeau exact sur " + Object.entries(cpt).filter(([k]) => k !== "ko").reduce((t, [, n]) => t + n, 0) + " conclusions (" + cpt.loin + " de loin, " + cpt.lob + " lobs, " + cpt.bal + " sur corner) — championnat, re-sim et coupe");
else fail(cpt.ko ? cpt.ko + " conclusion(s) mal étiquetées" : "aucun lob tiré sur l'échantillon : le drapeau « lob » n'est pas prouvé");

// et la mise en scène pioche dans le bon décor, aux DEUX temps
const nomT = api.onze(h0)[0].nom, gkT = "Barthez";
const DECORS = { "": new Set(api.MONTEE_BUT), loin: new Set(api.MONTEE_LOIN), lob: new Set(api.MONTEE_LOB), bal: new Set(api.MONTEE_ARRET) };
const GESTES = {
  "": new Set(api.MONTEE_FRAPPE.map((f) => f(nomT, gkT))),
  loin: new Set(api.MONTEE_LOIN_FRAPPE.map((f) => f(nomT, gkT))),
  lob: new Set(api.MONTEE_LOB_FRAPPE.map((f) => f(nomT, gkT))),
  bal: new Set(api.MONTEE_ARRET_FRAPPE.map((f) => f(nomT, gkT))),
};
for (const [v, [un, deux]] of Object.entries(api.MONTEE_VOIE)) { // v2.41 : les voies du jeu ouvert
  DECORS[v] = new Set(un);
  GESTES[v] = new Set(deux.map((f) => f(nomT, gkT)));
}
let decorKo = 0, gesteKo = 0;
for (const ph of Object.keys(DECORS)) {
  for (let k = 0; k < 400; k++) {
    const info = { ph, but: nomT, cote: h0.id };
    if (!DECORS[ph].has(api.monteeUn(info, [], h0, a0))) decorKo++;
    if (!GESTES[ph].has(api.monteeDeux(info, [], gkT))) gesteKo++;
  }
}
if (decorKo === 0 && gesteKo === 0) ok("les " + Object.keys(DECORS).length + " phases (frappe nue, " + Object.keys(api.MONTEE_VOIE).join(", ") + ", de loin, lob, sur corner) ne se mélangent jamais, ni au premier ni au second temps");
else fail(decorKo + " décor(s) et " + gesteKo + " geste(s) pris dans la mauvaise phase");
if (contres().has(api.monteeUn({ ph: "loin", contre: true, but: nomT, cote: h0.id }, [], h0, a0)))
  ok("un contre conclu de loin garde sa mise en scène de contre (la distance ne joue qu'au second temps)");
else fail("un contre conclu de loin perd sa mise en scène de contre");

/* ===== H) le corner direct n'a jamais de passe décisive =====
   « Corner rentrant… et personne ne touche le ballon ! BUT DIRECT ! » était suivi, deux fois sur trois,
   d'une « Passe décisive de X » — alors que la ligne dit justement que PERSONNE n'a touché le ballon.
   Depuis v1.05, marque() tire la ligne AVANT de désigner le passeur et coupe celui-ci sur les lignes
   de BUT_SANS_PASSE. Ce test veille sur les deux bouts : la ligne est bien dans le Set, et aucun but
   raconté ainsi ne repart avec un passeur — ni dans le texte, ni dans les données de l'évènement. */
console.log("\nH) Le corner direct ne s'invente pas de passeur");
if (api.BUT_SANS_PASSE.has(api.BUT_CORNER_DIRECT))
  ok("la ligne du corner direct est bien déclarée sans passeur");
else fail("BUT_CORNER_DIRECT n'est plus dans BUT_SANS_PASSE : la coupure ne s'applique plus");

{
  let butsH = 0, avecPasse = 0, directs = 0, fautifs = 0;
  for (let k = 0; k < 4000; k++) {
    const h = G.clubs[k % G.clubs.length], a = G.clubs[(k * 7 + 3) % G.clubs.length];
    if (h === a) continue;
    frais(h, a);
    for (const e of api.simuleMatch(h, a, true).ev) {
      if (!e.g) continue;
      butsH++;
      if (e.g.pas) avecPasse++;
      if (e.x.indexOf("BUT DIRECT") >= 0) { directs++; if (e.g.pas || e.x.indexOf("Passe décisive") >= 0) fautifs++; }
    }
  }
  console.log("   — " + butsH + " buts racontés, dont " + directs + " corners directs (" +
    (directs / butsH * 100).toFixed(1) + " %) ; passes décisives : " + (avecPasse / butsH * 100).toFixed(1) + " % des buts —");
  if (directs > 50) ok("l'échantillon contient assez de corners directs pour conclure (" + directs + ")");
  else fail("trop peu de corners directs tirés (" + directs + ") : le test ne prouve rien");
  if (fautifs === 0) ok("aucun corner direct n'est suivi d'une passe décisive, ni au texte ni aux données");
  else fail(fautifs + " corner(s) direct(s) repartent avec un passeur");
}

/* ===== I) les voies du jeu ouvert (v2.41) =====
   Retour de l'auteur : « un attaquant qui dribble la défense et s'apprête à frapper ne termine pas par une
   reprise de volée ». La case "" mélangeait dribble, centre, face-à-face, une-deux et ballon qui traîne.
   Depuis v2.41 la voie est lue dans la ligne de résolution (VOIES_TIR) et chaque voie a ses deux temps de
   montée (MONTEE_VOIE). On vérifie : qu'aucune conclusion ne parle deux langues incompatibles (dribble ET
   centre), que chaque montée ne parle que la langue de sa voie, qu'aucune voie ne trahit l'issue, et que
   le second temps, servi aussi après un contre, ne raconte rien de lent ni de balle arrêtée.            */
console.log("\nI) Les voies du jeu ouvert (VOIES_TIR / MONTEE_VOIE)");
{
  const RX = Object.fromEntries(api.VOIES_TIR);
  const OUVERT = [].concat(api.COMM.but, api.COMM.rate, api.COMM.arret, api.COMM.butContre, api.COMM.rateContre, api.COMM.arretContre)
    .filter((l) => !api.TIRS_LOIN.has(l) && !api.TIRS_LOB.has(l) && !api.TIRS_ARRET.has(l) && !api.TIRS_CF.has(l));
  const parVoie = {};
  for (const l of OUVERT) { const v = api.voieTir(l) || "frappe nue"; parVoie[v] = (parVoie[v] || 0) + 1; }
  ok("répartition des " + OUVERT.length + " conclusions de jeu ouvert : " + Object.entries(parVoie).map(([v, n]) => v + " " + n).join(", "));

  // une conclusion ne mélange pas le dribble et le centre (le cas signalé par l'auteur)
  const bilingues = OUVERT.filter((l) => RX.drib.test(l) && RX.centre.test(l));
  if (!bilingues.length) ok("aucune conclusion ne raconte à la fois un dribble et un centre, une tête ou une volée");
  else fail(bilingues.length + " conclusion(s) mêlent dribble et centre : « " + bilingues[0].slice(0, 50) + "… »");

  // chaque montée ne parle que la langue de sa voie (aile et centre partagent le mot « centre »)
  const texte = (x) => (typeof x === "function" ? x("Joueur", "Gardien") : x);
  const voisines = [];
  for (const [v, [un, deux]] of Object.entries(api.MONTEE_VOIE))
    for (const t of [...un, ...deux].map(texte))
      for (const [w, rx] of api.VOIES_TIR)
        if (w !== v && !(v === "aile" && w === "centre") && !(v === "gardien" && w === "erreur") && rx.test(t)) voisines.push(v + " ← " + w + " : « " + t.slice(0, 45) + "… »");
  if (!voisines.length) ok("chaque montée ne parle que la langue de sa voie");
  else fail(voisines.length + " montée(s) parlent la langue d'une autre voie, ex. " + voisines[0]);
  const neutres = [...api.MONTEE_BUT, ...api.MONTEE_FRAPPE].map(texte).filter((t) => api.VOIES_TIR.some(([, rx]) => rx.test(t)));
  if (!neutres.length) ok("les montées de la frappe nue n'annoncent aucune construction");
  else fail(neutres.length + " montée(s) de la frappe nue annoncent une voie : « " + neutres[0].slice(0, 45) + "… »");

  // v2.44, retour de l'auteur : « si c'est le gardien qui fait une relance dans les pieds de l'attaquant, ensuite il
  // ne peut pas engueuler sa défense ». Le fautif, c'est lui : ni le second temps ni la conclusion ne l'en déchargent.
  const gkFautif = [...api.MONTEE_VOIE.gardien[1].map(texte),
    ...OUVERT.filter((l) => api.voieTir(l) === "gardien")].filter((t) => /sa défense|ses défenseurs|son défenseur|un défenseur/i.test(t));
  if (api.MONTEE_VOIE.gardien && !gkFautif.length) ok("après une relance ratée du gardien, personne ne le fait hurler sur sa défense");
  else fail(gkFautif.length + " ligne(s) font porter au gardien fautif la faute de sa défense : « " + (gkFautif[0] || "").slice(0, 50) + "… »");

  // pas de balle arrêtée, pas de chiffre, et un second temps qui tient aussi après un contre
  const toutes = Object.values(api.MONTEE_VOIE).flatMap(([un, deux]) => [...un, ...deux]).map(texte);
  const arretees = toutes.filter((t) => /corner|coup franc|penalty|touche de but|contre-attaque|en contre/i.test(t));
  if (!arretees.length) ok("aucune montée de voie n'impose une balle arrêtée ni un contre");
  else fail(arretees.length + " montée(s) de voie imposent une phase : « " + arretees[0].slice(0, 45) + "… »");
  const chiffrees = toutes.filter((t) => RX_CHIFFRE.test(t));
  if (!chiffrees.length) ok("aucune montée de voie ne chiffre la distance");
  else fail(chiffrees.length + " montée(s) de voie chiffrent une distance : « " + chiffrees[0].slice(0, 45) + "… »");
  const lentes = Object.values(api.MONTEE_VOIE).flatMap(([, deux]) => deux).map(texte)
    .filter((t) => /patiem|construi|tourne|lentement|prend son temps|bloc/i.test(t));
  if (!lentes.length) ok("aucun second temps de voie ne raconte une action lente (il sert aussi après un contre)");
  else fail(lentes.length + " second(s) temps trop lents pour un contre : « " + lentes[0].slice(0, 45) + "… »");

  // le suspense : chaque voie existe en but ET en échec, sinon sa montée annonce le dénouement
  const issues = (v) => ["but", "rate", "arret"].filter((k) => [...api.COMM[k], ...(api.COMM[k + "Contre"] || [])].some((l) => api.voieTir(l) === v && !api.TIRS_LOIN.has(l) && !api.TIRS_LOB.has(l) && !api.TIRS_ARRET.has(l)));
  const trahies = Object.keys(api.MONTEE_VOIE).filter((v) => { const i = issues(v); return !i.includes("but") || i.length < 2; });
  if (!trahies.length) ok("chaque voie mène au but comme à l'échec : sa montée ne trahit pas l'issue");
  else fail("la voie « " + trahies[0] + " » n'a que des issues " + issues(trahies[0]).join("/") + " : sa montée annonce le dénouement");

  // de bout en bout : sur des matchs simulés, l'enchaînement affiché respecte la voie de la conclusion
  let vus = 0, faux = 0, exemple = "";
  for (let k = 0; k < 400; k++) {
    const h = G.clubs[k % G.clubs.length], a = G.clubs[(k * 5 + 2) % G.clubs.length];
    if (h === a) continue;
    frais(h, a);
    for (const e of api.simuleMatch(h, a, true).ev) {
      const info = e.g || e.q;
      if (!info || !e.x || info.contre || !api.MONTEE_VOIE[info.ph]) continue;
      vus++;
      const un = api.monteeUn(info, [], h, a), deux = api.monteeDeux(info, [], "Barthez");
      const g = gabaritDe(e.x), v = g && api.voieTir(g.ligne);
      if (!DECORS[v] || !DECORS[v].has(un) || !GESTES[v] || ![...api.MONTEE_VOIE[v][1]].some((f) => f(info.but, "Barthez") === deux)) { faux++; exemple = exemple || un + " / " + deux + " / " + e.x; }
    }
  }
  // v2.43 bis : le but sur relance ratée n'a pas de passeur (BUT_SANS_PASSE), en championnat ET en coupe
  // (la coupe ignorait le Set jusque-là : le corner direct y repartait avec une passe décisive)
  let sansPasse = 0, passeIndue = 0;
  for (let k = 0; k < 1500; k++) {
    const h = G.clubs[k % G.clubs.length], a = G.clubs[(k * 3 + 1) % G.clubs.length];
    if (h === a) continue;
    frais(h, a);
    const evs = [...api.simuleMatch(h, a, true).ev, ...api.genEvCoupe(h, a, { sh: 2 + (k % 3), sa: 1 + (k % 2), tab: null, win: h }).ev];
    for (const e of evs) {
      if (!e.g || !e.x) continue;
      const g = gabaritDe(e.x);
      if (!g || !api.BUT_SANS_PASSE.has(g.ligne)) continue;
      sansPasse++;
      if (e.g.pas || /Passe décisive/.test(e.x)) passeIndue++;
    }
  }
  if (sansPasse > 50 && !passeIndue) ok(sansPasse + " buts sans passeur (corner direct, relance ratée), championnat et coupe : aucune passe décisive inventée");
  else fail(passeIndue ? passeIndue + " but(s) sans passeur repartent avec une passe décisive" : "trop peu de buts sans passeur pour conclure (" + sansPasse + ")");

  if (vus > 200 && !faux) ok(vus + " actions de jeu ouvert simulées, toutes mises en scène dans leur voie");
  else fail(faux ? faux + " action(s) sur " + vus + " mises en scène hors de leur voie, ex. " + exemple.slice(0, 120) : "trop peu d'actions de voie simulées (" + vus + ")");
}

/* ===== J) le corner en deux temps (v2.46) =====
   L'annonce (« Corner pour X. Untel s'installe au drapeau… ») et sa suite (COMM.cornerSuite) doivent se
   talonner : même minute, même équipe, rien entre les deux. La suite ne redit pas « Corner de… ». Et le
   piège trouvé au passage : « Corner pour {D} » donnait le corner à l'équipe qui DÉFEND ({D} = l'adversaire
   du tireur dans fmtC) ; aucune ligne de corner ne doit plus nommer {D} comme celle qui le tire.        */
console.log("\nJ) Le corner en deux temps");
{
  const ouvre = api.COMM.cornerSuite.filter((l) => /^corner/i.test(l));
  if (!ouvre.length) ok("aucune suite ne redit « Corner de… » : l'annonce l'a déjà dit");
  else fail(ouvre.length + " suite(s) rouvrent sur « Corner » : « " + ouvre[0].slice(0, 45) + "… »");
  const aLEnvers = [...api.COMM.corner, ...api.COMM.cornerSuite].filter((l) => /(pour|de) \{D\}/.test(l) && !/défense(ur)? de \{D\}/.test(l));
  if (!aLEnvers.length) ok("aucune ligne de corner ne donne le corner à l'équipe qui défend");
  else fail(aLEnvers.length + " ligne(s) de corner nomment {D} comme l'équipe qui tire : « " + aLEnvers[0].slice(0, 45) + "… »");

  let annonces = 0, orphelines = 0, seuls = 0, exemple = "";
  for (let k = 0; k < 600; k++) {
    const h = G.clubs[k % G.clubs.length], a = G.clubs[(k * 7 + 5) % G.clubs.length];
    if (h === a) continue;
    frais(h, a);
    const r = api.simuleMatch(h, a, true);
    const garde = r.ev.filter((e) => e.m <= 45);
    let sh = 0, sa = 0;
    for (const e of garde) if (e.g) { if (e.g.cote === h.id) sh++; else sa++; }
    for (const ev of [r.ev, api.simuleReste(h, a, 45, sh, sa, 1, 1, r.vus).ev]) {
      ev.forEach((e, i) => {
        const g = e.x && gabaritDe(e.x);
        if (g && g.famille === "corner") seuls++;
        if (!e.ca) return;
        annonces++;
        const s = ev[i + 1], gs = s && s.x && gabaritDe(s.x), tag = (x) => (x.match(/\((\w+)\)$/) || [])[1];
        if (!s || s.m !== e.m || !gs || gs.famille !== "cornerSuite" || tag(s.x) !== tag(e.x)) { orphelines++; exemple = exemple || e.x + " / " + (s ? s.x : "rien"); }
      });
    }
  }
  if (annonces > 300 && !orphelines) ok(annonces + " corners annoncés, tous suivis de leur issue (même minute, même équipe) ; " + seuls + " racontés d'un seul tenant");
  else fail(orphelines ? orphelines + " annonce(s) sans leur suite, ex. " + exemple.slice(0, 110) : "trop peu de corners annoncés (" + annonces + ")");
}

/* ===== bilan ===== */
console.log(FAILS ? "\n❌ HARNAIS RÉPÉTITIONS : " + FAILS + " PROBLÈME(S)" : "\n✅ HARNAIS RÉPÉTITIONS : TOUT EST VERT");
process.exit(FAILS ? 1 : 0);
