/* Harnais headless : LE CENTRE D'ENTRAÎNEMENT EN CAMPUS (v1.53)
   A) une nouvelle partie démarre avec un campus à zéro partout
   B) une vieille sauvegarde (G.centre de 1 à 5) donne le bon campus, borné par l'époque
   C) le chantier : un seul à la fois au centre, possible pendant un chantier du stade, refusé sans argent, livré, entretenu
   D) les époques : clinique pas avant 1998, cellule d'analyse pas avant 2002, laboratoire pas avant 2004
   E) le château : refusé avant 15 points ou avec un bâtiment sous le niveau 2, puis livré (palmarès, palier)
   F) les effets, bornés : chacun vérifié à zéro et au maximum, pour VOTRE club seulement ; plafond de soin 0,70
   G) le calibrage : buts par match dans la tolérance de harness.cjs, campus au maximum
   H) le rendu : vingt états sans exception, ni « undefined » ni « NaN », et aucun tiret long dans les textes
   I) une carrière de six saisons avec un campus qui monte, sans exception
   Usage : node harness-centre.cjs                                                            */
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const a = html.indexOf("<script>") + "<script>".length;
const b = html.lastIndexOf("</script>");
const script = html.slice(a, b);

function makeStub() {
  let stub;
  const fn = function () { return stub; };
  stub = new Proxy(fn, {
    get(_t, p) { if (p === Symbol.toPrimitive) return () => ""; if (p === "length") return 0; return stub; },
    set() { return true; }, apply() { return stub; }, has() { return true; }, construct() { return stub; },
  });
  return stub;
}
const ls = { _m: {}, get length() { return 0; }, key() { return null; }, getItem() { return null; }, setItem() {}, removeItem() {}, clear() {} };
const STUB = makeStub();
global.document = STUB;
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, localStorage: ls, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.localStorage = ls;
global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,migre,clubById,CLUBS,CENTRE3D,campusDefaut,etatCampus,campusEff," +
  "lanceCentre,avanceChantierCentre,motifCentre,campusEntretienJour,monteesMax,MONTEES_MAX,miseAuVert,jeuneDuCru,monteeCentre," +
  "maquetteCentre,carteLivraisonCentre,centreHTML,briefAdverse,pointFaible,tirageBlessure,recupJoueur,reposHebdo,forces,lambdasZones," +
  "demandePrime,lanceProjet,avanceChantier,anneeJeu,CHATEAU_EFF,CHATEAU_SOUS,ZONES," +
  "getG:function(){return G;},setG:function(x){G=x;}};";
const api = new Function(script + epilogue)();
const C3 = api.CENTRE3D;

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (c, m) => { if (c) console.log("  ✓ " + m); else fail(m); };
const propre = s => typeof s === "string" && s.length > 100 && !/NaN|undefined|Infinity/.test(s);
const TIRET = "—";
const G_ = () => api.getG();
const moi = () => api.clubById(G_().monClub);
const pose = (o) => Object.assign(G_().campus, { chantier: null }, o);
const MAX = { terrains: 3, physique: 3, medical: 3, vie: 3, academie: 3, video: 3, chateau: 1 };
const ZERO = { terrains: 0, physique: 0, medical: 0, vie: 0, academie: 0, video: 0, chateau: 0 };
const an = (y) => { G_().anBase = y - (G_().saisonIdx - 1); }; // la saison en cours démarre l'année y
const livrer = () => { let l = null, n = 0; while (G_().campus.chantier && n++ < 60) l = api.avanceChantierCentre() || l; return l; };
// hasard à graine fixe, pour les mesures différentielles
function graine(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const RND0 = Math.random;
const avecGraine = (s, fn) => { Math.random = graine(s); try { return fn(); } finally { Math.random = RND0; } };

/* ===== A) nouvelle partie ===== */
console.log("A) Nouvelle partie : campus à zéro partout");
try {
  api.nouvellePartie(api.CLUBS[3].id);
  const G = G_(), s = G.campus;
  ok(s && ["terrains", "physique", "medical", "vie", "academie", "video", "chateau"].every(k => s[k] === 0) && s.chantier === null,
    "six bâtiments au niveau 0, pas de château, pas de chantier");
  ok(!("centre" in G), "plus de G.centre dans une partie neuve");
  ok(C3.points(api.etatCampus()) === 0 && C3.palier(api.etatCampus()) === "Terrain annexe", "0 point, palier « Terrain annexe »");
  ok(api.campusEntretienJour() === 0, "aucun entretien à payer");
  const e = api.campusEff();
  ok(e.prog === 0 && e.bless === 0 && e.duree === 0 && e.recup === 0 && e.moral === 0 && e.prime === 0 && e.coh === 0 && e.tac === 0 && !e.cru,
    "tous les effets à zéro");
  ok(api.monteesMax() === api.MONTEES_MAX && api.MONTEES_MAX === 2, "deux montées du centre par saison, comme avant");
} catch (e) { fail("exception A : " + e.stack); }

/* ===== B) migration ===== */
console.log("B) Migration : un vieux G.centre de 1 à 5 donne le bon campus, borné par l'époque");
try {
  for (const annee of [1995, 1999, 2005]) for (let n = 1; n <= 5; n++) {
    api.nouvellePartie(api.CLUBS[3].id);
    const G = G_(); an(annee); delete G.campus; G.centre = n; delete G.livraisonCentre;
    api.migre();
    const s = G.campus, k = Math.min(3, n - 1);
    const att = { terrains: k, physique: Math.min(k, annee < 2004 ? 2 : 3), medical: Math.min(k, annee < 1998 ? 2 : 3),
      academie: Math.min(2, n - 1), vie: 0, video: 0, chateau: 0 };
    const bon = Object.keys(att).every(x => s[x] === att[x]) && s.chantier === null && !("centre" in G) && G.livraisonCentre === null;
    if (!bon) fail(`centre ${n} en ${annee} → ${JSON.stringify(s)} (attendu ${JSON.stringify(att)})`);
  }
  ok(FAILS === 0, "quinze cas (niveaux 1 à 5, saisons 1995, 1999, 2005) : terrains, physique, médical, académie, bornés par l'époque");
  api.nouvellePartie(api.CLUBS[3].id);
  const G = G_(); G.campus = { terrains: 2, chantier: { fam: "vie", niv: 1, reste: 2 } }; api.migre();
  ok(G.campus.terrains === 2 && G.campus.video === 0 && G.campus.chateau === 0 && G.campus.chantier && G.campus.chantier.fam === "vie",
    "un campus déjà là est complété sans rien perdre (chantier compris)");
  G.campus.chantier = { fam: "piscine", niv: 1, reste: 2 }; api.migre();
  ok(G.campus.chantier === null, "un chantier au nom inconnu est effacé");
  ok(propre(api.centreHTML()), "l'écran Club se rend après migration");
} catch (e) { fail("exception B : " + e.stack); }

/* ===== C) chantier ===== */
console.log("C) Chantier : un seul au centre, possible pendant celui du stade, refusé sans argent, livré, entretenu");
try {
  api.nouvellePartie(api.CLUBS[3].id);
  const G = G_(); an(2000); G.tresorerie = 200e6;
  const t0 = G.tresorerie;
  api.lanceCentre("terrains");
  ok(G.campus.chantier && G.campus.chantier.fam === "terrains" && G.campus.chantier.niv === 1 && G.campus.chantier.reste === 2,
    "chantier lancé : terrains niveau 1, 2 journées");
  ok(Math.abs(t0 - G.tresorerie - 3e6) < 1, "3 MF prélevés sur la trésorerie");
  const t1 = G.tresorerie; api.lanceCentre("vie");
  ok(G.campus.chantier.fam === "terrains" && G.tresorerie === t1, "un second chantier au centre est refusé, sans rien prélever");
  ok(api.motifCentre("vie") === "Un chantier tourne déjà au centre", "et le bouton dit pourquoi");
  api.lanceProjet("loges");
  ok(G.chantier && G.chantier.id === "loges" && G.campus.chantier, "le stade lance ses loges pendant ce temps : deux grues à la fois");
  let l = api.avanceChantierCentre();
  ok(l === null && G.campus.chantier.reste === 1 && G.campus.terrains === 0, "après une journée : pas encore livré");
  l = api.avanceChantierCentre();
  ok(l && l.fam === "terrains" && l.niv === 1 && G.campus.terrains === 1 && G.campus.chantier === null && l.avant.terrains === 0 && l.apres.terrains === 1,
    "après deux journées : livré, avec l'état d'avant et d'après pour la carte");
  ok(G.chantier && G.chantier.id === "loges", "le chantier du stade continue, indépendant");
  G.tresorerie = 1e6; api.lanceCentre("vie");
  ok(!G.campus.chantier && G.tresorerie === 1e6 && api.motifCentre("vie") === "La caisse ne suit pas", "sans argent : refusé, motif « La caisse ne suit pas »");
  // l'entretien : même graine, même journée, une seule différence (les terrains, 10 kF) → exactement 10 000 FF d'écart
  api.nouvellePartie(api.CLUBS[3].id);
  const base = JSON.stringify(G_());
  const tour = (terr) => { const g = JSON.parse(base); api.setG(g); api.migre(); g.campus.terrains = terr;
    return avecGraine(77, () => { const t = g.tresorerie; api.jouerJournee(); return t - api.getG().tresorerie; }); };
  const d0 = tour(0), d1 = tour(1);
  ok(Math.abs((d1 - d0) - 10000) < 1, `l'entretien est prélevé chaque journée (${Math.round(d1 - d0)} FF de plus avec deux terrains)`);
  pose(MAX);
  ok(api.campusEntretienJour() === (55 + 45 + 40 + 60 + 65 + 35 + 100) * 1000, `campus complet : ${api.campusEntretienJour()} FF par journée`);
} catch (e) { fail("exception C : " + e.stack); }

/* ===== D) époques ===== */
console.log("D) Époques : clinique dès 1998, cellule dès 2002, laboratoire dès 2004");
try {
  api.nouvellePartie(api.CLUBS[3].id);
  const G = G_();
  for (const [fam, des] of [["medical", 1998], ["video", 2002], ["physique", 2004]]) {
    pose({ ...ZERO, [fam]: 2 }); G.tresorerie = 500e6;
    an(des - 1); api.lanceCentre(fam);
    const refuse = !G.campus.chantier && /^Pas avant /.test(api.motifCentre(fam) || "");
    an(des); api.lanceCentre(fam);
    ok(refuse && G.campus.chantier && G.campus.chantier.niv === 3, `${fam} niveau 3 : refusé en ${des - 1} (« ${api.motifCentre ? "Pas avant " + des + "-" + String((des + 1) % 100).padStart(2, "0") : ""} »), accepté en ${des}`);
  }
  const f = C3.FAM.terrains;
  ok(/stabilisé/.test(C3.nomNiveau(f, 2, 2001)) && /synthétique/.test(C3.nomNiveau(f, 2, 2002)), "le terrain éclairé : stabilisé jusqu'en 2001, synthétique ensuite");
} catch (e) { fail("exception D : " + e.stack); }

/* ===== E) château ===== */
console.log("E) Château : 15 points et tout au niveau 2, puis livré");
try {
  api.nouvellePartie(api.CLUBS[3].id);
  const G = G_(); an(2006); G.tresorerie = 500e6;
  pose({ terrains: 3, physique: 3, medical: 3, vie: 2, academie: 2, video: 1 }); // 14 points, la vidéo sous le niveau 2
  api.lanceCentre("chateau"); ok(!G.campus.chantier, "14 points : refusé");
  pose({ terrains: 3, physique: 3, medical: 3, vie: 3, academie: 2, video: 1 }); // 15 points, mais la vidéo au niveau 1
  api.lanceCentre("chateau"); ok(!G.campus.chantier && api.motifCentre("chateau") === "15 points, et chaque bâtiment au niveau 2", "15 points avec un bâtiment au niveau 1 : refusé");
  pose({ terrains: 3, physique: 3, medical: 3, vie: 2, academie: 2, video: 2 }); // 15 points, tout au niveau 2
  const t = G.tresorerie, pal0 = G.palmares.length;
  api.lanceCentre("chateau");
  ok(G.campus.chantier && G.campus.chantier.fam === "chateau" && G.campus.chantier.reste === 12 && Math.abs(t - G.tresorerie - 60e6) < 1,
    "15 points, tout au niveau 2 : 60 MF, 12 journées");
  const l = livrer();
  ok(l && l.fam === "chateau" && G.campus.chateau === 1, "le château est livré");
  ok(G.palmares.length === pal0 + 1 && G.palmares[G.palmares.length - 1] === "Saison " + G.saison + " : le club s'offre un château", `palmarès : « ${G.palmares[G.palmares.length - 1]} »`);
  ok(C3.palier(api.etatCampus()) === "Le Château" && api.motifCentre("chateau") === "Le château est construit", "le centre s'appelle désormais « Le Château », et on ne l'achète pas deux fois");
  const html = api.carteLivraisonCentre(l);
  ok(propre(html) && html.includes("INAUGURATION · LE CHÂTEAU") && html.includes("ctOr") && html.includes("cEclat"), "carte d'inauguration : surtitre, lumière dorée, feu d'artifice");
} catch (e) { fail("exception E : " + e.stack); }

/* ===== F) effets bornés ===== */
console.log("F) Effets : à zéro et au maximum, pour votre club seulement");
try {
  api.nouvellePartie(api.CLUBS[3].id);
  const G = G_(); an(2006); const c = moi(), autre = G.clubs.find(x => x.id !== c.id);
  pose(ZERO); const e0 = api.campusEff();
  pose(MAX); const e1 = api.campusEff();
  ok(e0.prog === 0 && e1.prog === 40, "progression des jeunes : +0 % → +40 % (30 + 10 du château)");
  ok(e0.bless === 0 && e1.bless === 25 && e0.duree === 0 && e1.duree === 45, "blessures −25 %, durée −45 % au maximum");
  ok(e1.recup === 30 && e1.fraich === 2 && e1.hiver === 3, "récupération +30 %, laboratoire +2 par semaine, halle +3 l'hiver");
  ok(e0.frag === 0 && e1.frag === 2, "fragilité soignée : 0 → −2 l'été");
  ok(e1.note === 7 && e1.pot === 10 && api.monteesMax() === 4 && e1.cru, "académie : note +7, potentiel +10, quatre montées avec le château, jeune du cru");
  ok(Math.abs(e1.moral - 1.2) < 1e-9 && e1.prime === 30 && e1.coh === 3 && e1.tac === 3, "moral +1,2 par journée, primes −30 %, cohésion +3 %, duel du milieu +3 %");

  // tirage des blessures (votre club) : fréquence et durée mesurées sur 150 000 tirages
  const j = c.joueurs.find(x => x.pos !== "G"); j.fragile = 5; j.fraich = 100; G.staff = {};
  const mesure = (etat, club) => { pose(etat); let n = 0, d = 0; avecGraine(9, () => { for (let i = 0; i < 150000; i++) { const x = api.tirageBlessure(club, j); if (x) { n++; d += x; if (x < 1) fail("durée sous une journée"); } } }); return { n, moy: d / Math.max(1, n) }; };
  const b0 = mesure(ZERO, c), b1 = mesure(MAX, c), bA = mesure(MAX, autre);
  ok(Math.abs(b1.n / b0.n - 0.75) < 0.03, `blessures au maximum : ×${(b1.n / b0.n).toFixed(3)} (attendu 0,75)`);
  ok(b1.moy < b0.moy * 0.62 && b1.moy >= 1, `durée moyenne ${b0.moy.toFixed(2)} → ${b1.moy.toFixed(2)} journées, jamais sous 1`);
  ok(Math.abs(bA.n / b0.n - 1) < 0.03, `un autre club n'en profite pas (×${(bA.n / b0.n).toFixed(3)})`);

  // récupération : sous le plafond 0,70
  const vieux = { age: 35 }, k = Math.max(0.78, 1 - 0.025 * 6), formule = soin => k + (1 - k) * soin + 0.08 * soin;
  pose(MAX); G.staff = { physique: { tier: 3 } };
  ok(Math.abs(api.recupJoueur(vieux, c) - formule(0.60)) < 1e-9, "campus (0,30) + préparateur ★★★ (0,30) s'additionnent : 0,60");
  G.staff = { physique: { tier: 5 } };
  ok(Math.abs(api.recupJoueur(vieux, c) - formule(0.70)) < 1e-9, "le soin ne dépasse jamais le plafond de 0,70");
  G.staff = {}; pose(ZERO);
  ok(Math.abs(api.recupJoueur(vieux, c) - k) < 1e-9 && Math.abs(api.recupJoueur(vieux, autre) - k) < 1e-9, "à zéro : le barème de l'âge, ni plus ni moins");

  // fraîcheur hebdomadaire : halle l'hiver, laboratoire toute l'année, plafond 100
  const fr = (etat, J, club) => { pose(etat); G.journee = J - 1; const x = club.joueurs[0]; x.age = 25; x.fraich = 50; api.reposHebdo(club); return x.fraich - 50; };
  const soin = 20 * 0.08 * 0.30; // un joueur de 25 ans récupère déjà tout : le soin du campus ne lui ajoute que sa petite part
  ok(Math.abs(fr(MAX, 18, c) - fr(ZERO, 18, c) - (5 + soin)) < 1e-9 && Math.abs(fr(MAX, 5, c) - fr(ZERO, 5, c) - (2 + soin)) < 1e-9, "fraîcheur : +5 par semaine en hiver (halle + labo), +2 le reste de l'année");
  ok(fr(MAX, 18, autre) === fr(ZERO, 18, autre), "les autres clubs récupèrent au barème");
  pose(MAX); G.journee = 17; c.joueurs[0].fraich = 99; api.reposHebdo(c); ok(c.joueurs[0].fraich === 100, "jamais au-dessus de 100");
  G.journee = 0;

  // cohésion et duel du milieu
  pose(ZERO); const f0 = api.forces(c), fA0 = api.forces(autre);
  pose(MAX); const f1 = api.forces(c), fA1 = api.forces(autre);
  ok(Math.abs(f1.coh / f0.coh - 1.03) < 1e-9 && f1.mil / f0.mil > 1.029 && fA1.coh === fA0.coh && fA1.mil === fA0.mil, "cohésion +3 % pour vous, rien pour les autres");
  ok(f0.tac === 0 && f1.tac === 0.03 && fA1.tac === 0, "vidéo : +3 % au duel du milieu, votre club seulement");
  const l0 = api.lambdasZones(f1, fA1), l1 = api.lambdasZones({ ...f1, tac: 0 }, fA1), rc = Math.pow(1.03, api.ZONES.c);
  ok(Math.abs(l0[0] / l1[0] - rc) < 1e-9 && Math.abs(l1[1] / l0[1] - rc) < 1e-9, `le duel penche de ${((rc - 1) * 100).toFixed(2)} % de buts attendus de votre côté`);

  // prime de signature : lue dans la vraie fenêtre (un faux DOM le temps de l'appel)
  const lirePrime = (etat) => { pose(etat); const els = {}; global.document = { getElementById: id => (els[id] = els[id] || { style: {}, innerHTML: "" }), querySelectorAll: () => [] };
    try { api.demandePrime(autre.joueurs[0], 10e6, 1e6); } finally { global.document = STUB; }
    const m = /signature de <b class="fort">([\d.]+) MF/.exec(els.fiche.innerHTML); return m ? +m[1] : NaN; };
  ok(lirePrime(ZERO) === 1 && lirePrime({ ...ZERO, vie: 1 }) === 0.9 && lirePrime({ ...ZERO, vie: 3 }) === 0.7, "prime à la signature : 1,00 → 0,90 → 0,70 MF");

  // montées du centre : l'académie ajoute note et potentiel
  c.pres = 4; // un prestige moyen : les bornes du jeu (45 à 72) ne rognent pas la mesure
  const monte = (etat) => { pose(etat); let s = 0, p = 0; const N = 300; avecGraine(5, () => { for (let i = 0; i < N; i++) { G.montees = 0; api.monteeCentre("M"); const x = c.joueurs.pop(); s += x.note; p += x.pot; } }); return [s / N, p / N]; };
  const m0 = monte(ZERO), m3 = monte({ ...ZERO, academie: 3 });
  ok(Math.abs(m3[0] - m0[0] - 7) < 0.6, `jeunes montés : note +${(m3[0] - m0[0]).toFixed(1)} au niveau 3 (attendu +7, bornes du jeu comprises)`);
  pose({ ...ZERO, academie: 3 }); G.montees = 2; const n0 = c.joueurs.length; api.monteeCentre("A");
  ok(c.joueurs.length === n0 + 1, "académie de renom : une troisième montée est permise");
  G.montees = 3; api.monteeCentre("A"); ok(c.joueurs.length === n0 + 1, "la quatrième est refusée (sans château)");

  // jeune du cru
  pose({ ...ZERO, academie: 1 }); ok(api.jeuneDuCru(c) === null, "pas de jeune du cru avant l'agrément");
  let okCru = true;
  for (const [etat, lo, hi] of [[{ ...ZERO, academie: 2 }, 78, 86], [{ ...ZERO, chateau: 1 }, 84, 90]]) for (let i = 0; i < 40; i++) {
    pose(etat); G.notifs = []; const x = api.jeuneDuCru(c);
    if (!x || x.age !== 17 || x.note < 55 || x.note > 62 || x.pot < lo || x.pot > hi || !c.joueurs.includes(x) || !G.notifs.some(t => t.includes(x.nom))) okCru = false;
    c.joueurs.pop(); }
  ok(okCru, "jeune du cru : 17 ans, note 55 à 62, potentiel 78 à 86 (84 à 90 avec le château), annoncé au debrief");

  // mise au vert
  c.joueurs.forEach(x => x.moral = 60); pose(ZERO); api.miseAuVert(); const sans = c.joueurs.every(x => x.moral === 60);
  pose({ ...ZERO, chateau: 1 }); api.miseAuVert();
  ok(sans && c.joueurs.every(x => x.moral === 63), "mise au vert : +3 de moral avec le château, rien sans");

  // l'adversaire vu par la vidéo
  pose(ZERO); const br0 = api.briefAdverse(autre);
  pose({ ...ZERO, video: 2 }); const br2 = api.briefAdverse(autre);
  pose({ ...ZERO, video: 3 }); const br3 = api.briefAdverse(autre);
  const fo = /\d-\d-\d/;
  ok(fo.test(br0) && !br2.includes("cellule d'analyse") && br3.includes("La cellule d'analyse a trouvé la faille"),
    "brief adverse : la formation pour tout le monde (choix de l'auteur), le point faible à la cellule d'analyse seulement");
  ok(/^La cellule d'analyse a trouvé la faille : leur (défense|milieu|attaque)/.test(api.pointFaible(autre)), `« ${api.pointFaible(autre)} »`);
} catch (e) { fail("exception F : " + e.stack); }

/* ===== G) calibrage ===== */
console.log("G) Calibrage : campus au maximum, les buts par match ne bougent pas");
try {
  // même graine, même club : une fois campus à zéro, une fois au maximum. Les matchs des autres ne doivent pas bouger.
  const mesure = (etat) => avecGraine(2024, () => { let tous = 0, miens = 0;
    for (const i of [0, 7, 14, 19]) {
      api.nouvellePartie(api.CLUBS[i].id); pose(etat);
      for (let s = 0; s < 2; s++) {
        for (let d = 0; d < 38; d++) api.jouerJournee();
        const m = moi(); tous += G_().clubs.reduce((t, c) => t + c.bp, 0); miens += m.bp + m.bc;
        api.intersaison(); pose(etat);
      }
    }
    const n = 8 * 380, nm = 8 * 38; return { tous: tous / n, miens: miens / nm, autres: (tous - miens) / (n - nm) }; });
  const z = mesure(ZERO), x = mesure(MAX);
  ok(z.tous >= 2.0 && z.tous <= 2.8 && x.tous >= 2.0 && x.tous <= 2.8,
    `calibrage : ${z.tous.toFixed(3)} buts/match campus à zéro, ${x.tous.toFixed(3)} au maximum (tolérance de harness.cjs : 2,0 à 2,8)`);
  ok(Math.abs(x.autres - z.autres) < 0.08, `les 342 autres matchs de chaque saison : ${z.autres.toFixed(3)} → ${x.autres.toFixed(3)} buts/match (bruit)`);
  console.log(`    (vos matchs : ${z.miens.toFixed(3)} → ${x.miens.toFixed(3)} buts/match)`);
} catch (e) { fail("exception G : " + e.stack); }

/* ===== H) rendu ===== */
console.log("H) Rendu : vingt états, sans NaN ni undefined, sans tiret long");
try {
  api.nouvellePartie(api.CLUBS[3].id);
  const G = G_(); const r = graine(31); let n = 0, pire = "";
  const FAMS = ["terrains", "physique", "medical", "vie", "academie", "video"];
  const etats = [ZERO, MAX, { ...MAX, chateau: 0 }];
  while (etats.length < 20) { const e = { chateau: 0 }; FAMS.forEach(f => e[f] = Math.floor(r() * 4)); e.chateau = r() < 0.2 ? 1 : 0; etats.push(e); }
  etats.forEach((e, i) => {
    const annee = 1990 + (i % 20);
    const R = { ...e, annee }, fam = FAMS[i % 6], chN = Math.min(3, R[fam] + 1);
    const vues = [C3.scene(R).svg, C3.scene(R, { ch: { fam, niv: chN } }).svg, C3.scene(R, { focus: fam, aube: true }).svg,
      C3.scene(R, { ch: { fam: "chateau", niv: 1 } }).svg, C3.scene({ ...R, chateau: 1 }, { focus: "chateau", aube: true }).svg];
    for (const v of vues) { n++; if (!propre(v) || !v.startsWith("<svg") || !v.endsWith("</svg>")) pire = pire || `état ${i} (${JSON.stringify(R)})`; }
    an(annee); pose(e); G.campus.chantier = r() < 0.5 ? { fam, niv: chN, reste: 3 } : null;
    const club = api.centreHTML(), carte = api.carteLivraisonCentre({ fam, niv: chN, avant: { ...R, [fam]: chN - 1 }, apres: { ...R, [fam]: chN } });
    for (const v of [club, carte]) { n++; if (!propre(v) || v.includes(TIRET)) pire = pire || `écran ${i}`; }
  });
  ok(!pire, `${n} rendus (maquette, chantier, aube, château, écran Club, carte) propres${pire ? " · premier fautif : " + pire : ""}`);
  const textes = [];
  for (const f of C3.FAMS) textes.push(f.nom, ...f.niv, ...f.court, ...f.eff, ...f.sous, C3.nomNiveau(f, 2, 1995), C3.nomNiveau(f, 2, 2005));
  textes.push(...C3.PALIERS.map(p => p[1]), ...Object.values(C3.SOUS_PALIER), api.CHATEAU_EFF, api.CHATEAU_SOUS);
  ok(textes.every(t => !String(t).includes(TIRET)), `aucun tiret long dans les ${textes.length} textes du centre`);
  const svg = C3.scene(MAX).svg;
  ok(svg.includes("cVapeur") && svg.includes("ctHalo") && !/class="(vapeur|eclat|clign)/.test(svg) && !/id="c(Halo|Aube|Or|Brume|Eau)"/.test(svg),
    "classes et dégradés du centre préfixés : aucune collision avec le stade");
  const k0 = api.maquetteCentre(); ok(api.maquetteCentre() === k0, `maquette en cache (${Math.round(k0.length / 1024)} Ko)`);
} catch (e) { fail("exception H : " + e.stack); }

/* ===== I) carrière ===== */
console.log("I) Carrière de six saisons : le campus monte, sans exception");
try {
  api.nouvellePartie(api.CLUBS[2].id);
  const G = G_(); let livres = 0, cartes = 0, errs = 0;
  for (let s = 0; s < 6; s++) {
    for (let d = 0; d < 38; d++) {
      G_().tresorerie = Math.max(G_().tresorerie, 80e6);
      if (!G_().campus.chantier) {
        const cand = ["terrains", "physique", "medical", "vie", "academie", "video", "chateau"].filter(f => !api.motifCentre(f));
        if (cand.length) api.lanceCentre(cand.includes("chateau") ? "chateau" : cand.sort((x, y) => G_().campus[x] - G_().campus[y])[0]);
      }
      const ch = G_().campus.chantier, resteAvant = ch ? ch.reste : 0;
      try { api.jouerJournee(); } catch (e) { errs++; if (errs < 3) fail("exception journée : " + e.stack); }
      const l = G_().livraisonCentre;
      if (l) { livres++; if (propre(api.carteLivraisonCentre(l))) cartes++; G_().livraisonCentre = null; }
      else if (resteAvant === 1) fail("un chantier arrivé à terme n'a pas été livré");
    }
    api.intersaison();
    if (!propre(api.centreHTML())) fail("écran Club illisible en saison " + (s + 2));
  }
  const s = G_().campus, pts = C3.points(api.etatCampus());
  ok(errs === 0, "six saisons sans exception");
  ok(livres > 10 && cartes === livres, `${livres} livraisons, ${cartes} cartes rendues · campus à ${pts}/18, palier « ${C3.palier(api.etatCampus())} »`);
  ok(C3.FAMS.every(f => s[f.id] >= 0 && s[f.id] <= C3.nivMax(f, api.anneeJeu())), "aucun niveau au-delà de son époque");
} catch (e) { fail("exception I : " + e.stack); }

console.log(FAILS === 0 ? "\n✅ HARNAIS CENTRE : TOUT EST VERT" : "\n❌ HARNAIS CENTRE : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
