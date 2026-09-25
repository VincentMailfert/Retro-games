/* Harnais des RENDEZ-VOUS DE SEMAINE — MULTIPLEX 95 (v1.10)
   Retour de playtest : « Quand on a un match de coupe, on nous demande l'équipe dès qu'on clique sur Prochaine
   journée, et le match commence directement après : on ne peut agir sur rien — mercato, finances, onze type,
   tactique. Et certains matchs, je ne peux pas changer la stratégie en cours de match. »
     A) la consigne et la prime valent aussi les soirs de coupe — et restent NEUTRES par défaut
     B) elles pèsent vraiment : offensif ouvre le match, prudent le ferme, la prime pousse votre attaque
     C) la prime se règle comme le samedi : payée si l'on gagne (qualification, manche aller), puis remise à zéro
     D) la consigne changée EN DIRECT rejoue la fin du match : ce qui a été montré ne bouge pas, le score suit le fil
     E) découper le match ne change pas la loi du score (rejouer sans changer de consigne = même moyenne)
     F) le verdict européen se recalcule sur le score rejoué (cumul, but à l'extérieur, finale)
     G) le Calendrier montre le rendez-vous à préparer au lieu d'imposer une fenêtre verrouillée
   Usage : node harness-rdv.cjs                                                                   */
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</scr" + "ipt>"));

function makeStub() {
  let s; const fn = function () { return s; };
  s = new Proxy(fn, {
    get(_t, p) { if (p === Symbol.toPrimitive) return () => ""; if (p === "length") return 0; if (p === "forEach" || p === "map") return () => []; return s; },
    set() { return true; }, apply() { return s; }, has() { return true; }, construct() { return s; },
  });
  return s;
}
const APP = { _h: "", innerHTML: "", querySelectorAll: () => [], querySelector: () => makeStub() };
Object.defineProperty(APP, "innerHTML", { get() { return APP._h; }, set(v) { APP._h = String(v); } });
const generic = makeStub();
global.document = new Proxy(function () {}, {
  get(_t, p) {
    if (p === "getElementById") return id => (id === "app" ? APP : generic);
    if (p === "querySelectorAll") return () => [];
    if (p === Symbol.toPrimitive) return () => "";
    return generic;
  },
  set() { return true; }, apply() { return generic; }, has() { return true; }, construct() { return generic; },
});
const ls = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; }, get length() { return Object.keys(this._m).length; }, key(i) { return Object.keys(this._m)[i] ?? null; } };
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, localStorage: ls, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.localStorage = ls; global.navigator = { userAgent: "h" };
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = cb => setTimeout(cb, 0); global.cancelAnimationFrame = id => clearTimeout(id);

const api = new Function(script + "\n;return {nouvellePartie,jouerJournee,clubById,salaire," +
  "multTactique,lambdasCoupe,lambdasRdv,scoreCoupe,resoudreCoupe,issueCoupe,soldePrime,forceCoupe,forceEuro," +
  "genEvCoupe,corpsCoupe,finCoupe,rejoueRdv,annoteButs,clubAffiche,onzeEuro," +
  "coupeTireTour,coupeResoutTour,COUPE_TOURS,COUPE_TERRAIN,COUPE_RECETTE," +
  "euroInit,euroTireTour,euroResoutTour,euroManche,euroCloture,euroClotureAvec,euroFinaleSeche,euroFinaleAvec,EURO_TOURS,EURO_TERRAIN,COMPETS," +
  "rdvEnAttente,panneauRdv,ecranCalendrier,prochainsRdv,blocProchains,CONSIGNES,getG:function(){return G;}};")();

let F = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) F++; };
const neuve = id => { api.nouvellePartie(id || "MET", "1998-99"); const G = api.getG(); G.intro = null; return G; };
const r2 = x => Math.round(x * 100) / 100;

/* ===== A) neutre par défaut ===== */
console.log("A) Consigne et prime les soirs de coupe — neutres par défaut");
{
  const G = neuve("MET");
  const adv = G.clubs.find(c => c.id !== G.monClub).id, autre = G.clubs.filter(c => c.id !== G.monClub)[3].id;
  G.consigne = "equilibre"; G.primeMatch = 0;
  ok(JSON.stringify(api.multTactique(G.monClub, adv)) === "[1,1]" && JSON.stringify(api.multTactique(adv, G.monClub)) === "[1,1]",
    "« Équilibré » sans prime : multiplicateurs [1,1] sur votre match");
  G.consigne = "offensif"; G.primeMatch = 0.3;
  ok(JSON.stringify(api.multTactique(adv, autre)) === "[1,1]", "un match qui n'est pas le vôtre n'est jamais touché, quelle que soit votre consigne");
  const [mh, ma] = api.multTactique(G.monClub, adv), [nh, na] = api.multTactique(adv, G.monClub);
  ok(r2(mh) === r2(1.15 * 1.3) && r2(ma) === 1.15 && r2(na) === r2(1.15 * 1.3) && r2(nh) === 1.15,
    "à domicile comme à l'extérieur, la prime ne pousse que VOTRE attaque, la consigne ouvre les deux");
  G.consigne = "equilibre"; G.primeMatch = 0;
  const [lh, la] = api.lambdasRdv(G.monClub, adv, api.COUPE_TERRAIN, api.forceCoupe);
  const [kh, ka] = api.lambdasCoupe(api.forceCoupe(G.monClub) + api.COUPE_TERRAIN, api.forceCoupe(adv));
  ok(lh === kh && la === ka, "sans consigne ni prime, les buts attendus sont exactement ceux du modèle de coupe d'avant");
}

/* ===== B) la consigne pèse ===== */
console.log("\nB) Elles pèsent vraiment sur le score (20 000 tirages par réglage)");
{
  const G = neuve("MET");
  const adv = G.clubs.find(c => c.id !== G.monClub && Math.abs(api.forceCoupe(c.id) - api.forceCoupe(G.monClub)) < 6) || G.clubs.find(c => c.id !== G.monClub);
  const moyenne = (consigne, prime) => {
    G.consigne = consigne; G.primeMatch = prime;
    let pour = 0, contre = 0; const N = 20000;
    for (let k = 0; k < N; k++) { const r = api.resoudreCoupe(G.monClub, adv.id); pour += r.sh; contre += r.sa; }
    G.consigne = "equilibre"; G.primeMatch = 0;
    return { pour: pour / N, contre: contre / N };
  };
  const pr = moyenne("prudent", 0), eq = moyenne("equilibre", 0), of = moyenne("offensif", 0), pm = moyenne("equilibre", 0.3);
  console.log("   — pour/contre : prudent " + r2(pr.pour) + "/" + r2(pr.contre) + " · équilibré " + r2(eq.pour) + "/" + r2(eq.contre) +
    " · offensif " + r2(of.pour) + "/" + r2(of.contre) + " · prime 30 % " + r2(pm.pour) + "/" + r2(pm.contre) + " —");
  ok(of.pour > eq.pour * 1.08 && of.contre > eq.contre * 1.08, "offensif : on marque plus, on encaisse plus");
  ok(pr.pour < eq.pour * 0.92 && pr.contre < eq.contre * 0.92, "prudent : on marque moins, on encaisse moins");
  ok(pm.pour > eq.pour * 1.15 && Math.abs(pm.contre - eq.contre) < eq.contre * 0.05, "la prime pousse votre attaque, et elle seule");
  // Europe : même effet sur une manche
  G.euroCompet = "C1"; api.euroInit();
  const eadv = G.europe[0].id;
  const moyE = consigne => { G.consigne = consigne; let s = 0; for (let k = 0; k < 20000; k++) { const [a, b] = api.euroManche(G.monClub, eadv); s += a + b; } G.consigne = "equilibre"; return s / 20000; };
  const e1 = moyE("prudent"), e2 = moyE("offensif");
  ok(e2 > e1 * 1.2, "en Europe aussi : une manche offensive est plus ouverte qu'une manche prudente (" + r2(e1) + " → " + r2(e2) + " buts)");
}

/* ===== C) la prime se règle ===== */
console.log("\nC) La prime se paie si l'on gagne, puis s'efface");
{
  const G = neuve("MET");
  const masse = api.clubById(G.monClub).joueurs.reduce((s, j) => s + api.salaire(j), 0);
  // Coupe de France : on force le résultat de VOTRE affiche
  const joueTour = gagne => {
    G.coupe.aJouer = null; G.coupe.elimine = false;
    api.coupeTireTour(api.COUPE_TOURS[G.coupe.tourIdx]);
    const p = G.coupe.aJouer.paires.find(x => x.hid === G.monClub || x.aid === G.monClub);
    const moiH = p.hid === G.monClub, win = gagne ? G.monClub : (moiH ? p.aid : p.hid);
    const forced = { hid: p.hid, aid: p.aid, sh: moiH === gagne ? 2 : 0, sa: moiH === gagne ? 0 : 2, tab: false, win };
    G.primeMatch = 0.2; const avant = G.tresorerie;
    api.coupeResoutTour(true, forced);
    return G.tresorerie - avant;
  };
  const dGagne = joueTour(true);
  ok(Math.round(dGagne) === Math.round(api.COUPE_RECETTE - masse * 0.2 * 3), "qualifié : recette encaissée, prime de " + r2(masse * 0.6 / 1e6) + " MF payée");
  ok(G.primeMatch === 0, "…et la prime est remise à zéro");
  ok(G.news.some(n => /PRIME DE MATCH honorée \(qualification en Coupe de France, 20 %\)/.test(n)), "…avec sa dépêche");
  const dPerd = joueTour(false);
  ok(dPerd >= 0 && G.primeMatch === 0, "éliminé : pas un franc de prime (seule la dotation tombe), et la promesse s'efface");
  // Europe : l'aller gagné suffit, le retour se paie à la qualification
  G.euroCompet = "C1"; api.euroInit();
  api.euroTireTour();
  const pr = G.euro.aJouer.paires.find(x => x[0] === G.monClub || x[1] === G.monClub);
  const moiA = pr[0] === G.monClub;
  G.primeMatch = 0.1; let avant = G.tresorerie;
  api.euroResoutTour(true, { aid: pr[0], bid: pr[1], l1: moiA ? [3, 1] : [1, 3] });
  ok(Math.round(avant - G.tresorerie) === Math.round(masse * 0.1 * 3) && G.primeMatch === 0, "Europe : l'aller gagné déclenche la prime, puis elle s'efface");
  G.primeMatch = 0.1; avant = G.tresorerie;
  G.euro.aJouer = { ...G.euro.aJouer }; // (le retour est posé par euroTick en jeu ; on le pose à la main)
  G.euro.aJouer = { tourIdx: G.euro.attente.tourIdx, nom: "retour", court: "retour", finale: false, manche: 2, paires: G.euro.attente.paires, allers: G.euro.attente.allers };
  const l1 = moiA ? [3, 1] : [1, 3];
  const tie = api.euroClotureAvec(pr[0], pr[1], l1, moiA ? [4, 0] : [0, 4]); // retour perdu lourdement : éliminé
  api.euroResoutTour(true, tie);
  ok(tie.win !== G.monClub && Math.round(avant - G.tresorerie) === 0 && G.primeMatch === 0, "Europe : éliminé au retour, la prime ne se paie pas et s'efface");
}

/* ===== D) la consigne changée en direct ===== */
console.log("\nD) Changer de consigne en direct rejoue la fin, sans toucher à ce qui a été montré");
{
  const G = neuve("MET");
  const pros = G.clubs.filter(c => c.id !== G.monClub);
  let essais = 0, pb = [], doublons = 0, lignesVues = 0;
  for (let k = 0; k < 1500; k++) {
    const H = api.clubAffiche(k % 2 ? G.monClub : pros[k % pros.length].id), A = api.clubAffiche(k % 2 ? pros[(k * 7) % pros.length].id : G.monClub);
    const r0 = api.resoudreCoupe(H.id, A.id), r = { ...r0 };
    const gen = api.genEvCoupe(H, A, r);
    const L = gen.ev;
    // un à trois changements de consigne, à des minutes au hasard, comme un joueur nerveux
    let i = 1 + Math.floor(Math.random() * (L.length - 2));
    for (let c = 0; c < 1 + (k % 3); c++) {
      const sif = L.findIndex(l => l.t === "sys" && /^COUP DE SIFFLET FINAL/.test(l.x));
      if (i > sif) break;
      if (k % 5 === 0) L[i]._monte = 1; // une action déjà annoncée : on recolle APRÈS elle
      const from = L[i] && L[i]._monte ? i + 1 : i;
      if (from > sif) break;
      const avant = L.slice(0, from).map(l => l.x), mNow = from > 0 ? L[from - 1].m : 0;
      const lamAv = api.lambdasRdv(H.id, A.id, api.COUPE_TERRAIN, api.forceCoupe);
      G.consigne = ["prudent", "equilibre", "offensif"][(k + c) % 3];
      api.rejoueRdv(gen, L, from, mNow, r, lamAv, api.lambdasRdv(H.id, A.id, api.COUPE_TERRAIN, api.forceCoupe));
      Object.assign(r, api.issueCoupe(r.hid, r.aid, r.sh, r.sa));
      api.finCoupe(gen.ctx, L, r); api.annoteButs(L);
      essais++;
      // 1) ce qui a été montré n'a pas bougé (les textes des doublés s'annotent une seule fois)
      if (L.slice(0, from).some((l, n) => l.x !== avant[n])) pb.push("préfixe modifié");
      // 2) le score = les lignes de but ; chaque but incrémente le bon compteur
      let sh = 0, sa = 0, suite = true;
      for (const l of L) if (l.g) { if (l.g.cote === H.id) sh++; else sa++; if (l.g.sh !== sh || l.g.sa !== sa) suite = false; }
      if (sh !== r.sh || sa !== r.sa) pb.push("score " + r.sh + "-" + r.sa + " contre " + sh + "-" + sa + " lignes");
      if (!suite) pb.push("compteurs de but incohérents");
      // 3) les minutes ne reculent jamais, et les nouveaux buts tombent après la minute atteinte
      for (let n = 1; n < L.length; n++) if (L[n].m < L[n - 1].m) { pb.push("minute qui recule (" + L[n - 1].m + " → " + L[n].m + ")"); break; }
      if (L.slice(from).some(l => l.g && l.g.cote && l.m <= mNow && mNow > 0)) pb.push("but rejoué avant la minute atteinte");
      // 4) une seule mi-temps, au bon score ; un seul sifflet, au bon score ; t.a.b. si et seulement si nul
      const mt = L.filter(l => l.t === "sys" && /^MI-TEMPS/.test(l.x));
      let h45 = 0, a45 = 0; for (const l of L) if (l.g && l.m <= 45) { if (l.g.cote === H.id) h45++; else a45++; }
      if (mt.length !== 1) pb.push(mt.length + " mi-temps");
      else if (mt[0].x.indexOf(" " + h45 + " - " + a45 + " ") < 0) pb.push("mi-temps au mauvais score : " + mt[0].x);
      const sifs = L.filter(l => l.t === "sys" && /^COUP DE SIFFLET FINAL/.test(l.x));
      if (sifs.length !== 1 || sifs[0].x.indexOf(" " + r.sh + " - " + r.sa + " ") < 0) pb.push("sifflet absent, doublé ou faux");
      const tab = L.some(l => /TIRS AU BUT :/.test(l.x));
      if (tab !== (r.sh === r.sa) || tab !== !!r.tab) pb.push("tirs au but incohérents avec le score");
      i = Math.min(L.length - 1, from + 1 + Math.floor(Math.random() * 6));
    }
    const vus = new Set();
    for (const l of L) { if (l.t === "sys" || l.t === "amb") continue; lignesVues++; if (vus.has(l.x)) doublons++; vus.add(l.x); }
  }
  ok(pb.length === 0, essais + " changements de consigne rejoués" + (pb.length ? " — " + pb.length + " anomalies, dont : " + [...new Set(pb)].slice(0, 3).join(" ; ") : " : préfixe intact, score = lignes de but, minutes en ordre, une mi-temps, un sifflet, t.a.b. si nul"));
  ok(doublons === 0, "aucune ligne de jeu resservie après un recollage (" + lignesVues + " lignes relues, " + doublons + " doublon" + (doublons > 1 ? "s" : "") + ")");
}

/* ===== E) rejouer la fin ne fausse pas la loi du score =====
   Le premier jet re-tirait la fin à neuf (λ × temps restant) : +3 % de buts même à consigne inchangée, parce que le
   fil de coupe compte un nombre fixe d'évènements — savoir où l'on en est dans le fil renseigne sur les buts à venir.
   On rééchelonne désormais les buts que le fil réservait : on vérifie l'absence de biais, et l'effet dans les deux sens. */
console.log("\nE) Rejouer la fin ne fausse pas le score : neutre à consigne égale, juste dans les deux sens");
{
  const G = neuve("MET");
  G.consigne = "equilibre"; G.primeMatch = 0;
  const adv = G.clubs.find(c => c.id !== G.monClub);
  const H = api.clubAffiche(G.monClub), A = api.clubAffiche(adv.id);
  const lam = () => api.lambdasRdv(H.id, A.id, api.COUPE_TERRAIN, api.forceCoupe);
  const N = 12000;
  // chaque essai : un match tiré à « Équilibré », une fin rejouée sous `vers` (puis éventuellement ramenée à Équilibré)
  const essai = (vers, retour) => {
    let base = 0, apres = 0, stable = true;
    for (let k = 0; k < N; k++) {
      G.consigne = "equilibre";
      const s = api.resoudreCoupe(H.id, A.id), gen = api.genEvCoupe(H, A, s), L = gen.ev;
      base += s.sh + s.sa;
      const sif = L.findIndex(l => l.t === "sys" && /^COUP DE SIFFLET FINAL/.test(l.x));
      const from = 1 + Math.floor(Math.random() * sif), mNow = L[from - 1].m;
      const l0 = lam(), avantSh = s.sh, avantSa = s.sa;
      G.consigne = vers; const l1 = lam();
      api.rejoueRdv(gen, L, from, mNow, s, l0, l1);
      if (vers === "equilibre" && (s.sh !== avantSh || s.sa !== avantSa)) stable = false;
      if (retour) { G.consigne = "equilibre"; api.rejoueRdv(gen, L, from, mNow, s, l1, lam()); }
      apres += s.sh + s.sa;
    }
    G.consigne = "equilibre";
    return { base: base / N, apres: apres / N, stable };
  };
  const eq = essai("equilibre", false), of = essai("offensif", false), pr = essai("prudent", false), ar = essai("offensif", true);
  console.log("   — buts/match : " + r2(eq.base) + " tirés d'un bloc · fin rejouée offensive " + r2(of.apres) + " (depuis " + r2(of.base) + ")" +
    " · prudente " + r2(pr.apres) + " (depuis " + r2(pr.base) + ") · offensive puis ramenée " + r2(ar.apres) + " (depuis " + r2(ar.base) + ") —");
  ok(eq.stable && Math.abs(eq.apres - eq.base) < 1e-9, "à consigne inchangée, rejouer la fin ne déplace pas un seul but");
  ok(of.apres > of.base * 1.04, "passer offensif en cours de match ouvre la fin de match");
  ok(pr.apres < pr.base * 0.96, "passer prudent la ferme");
  ok(Math.abs(ar.apres - ar.base) < ar.base * 0.03, "offensif puis retour à Équilibré : la moyenne revient à " + r2(Math.abs(ar.apres - ar.base) / ar.base * 100) + " % près (tolérance 3 %)");
  // le cas attrapé le 25/09/2026 : un vrai 2-9 (le moteur unique ne plafonne plus à 8) rejoué à la 58e perdait un but
  { let pris = 0, garde = 0;
    for (let k = 0; k < 400; k++) {
      const s = { hid: H.id, aid: A.id, sh: 2, sa: 9, tab: false, win: A.id }, gen = api.genEvCoupe(H, A, s), L = gen.ev;
      const sif = L.findIndex(l => l.t === "sys" && /^COUP DE SIFFLET FINAL/.test(l.x));
      const from = 1 + Math.floor(Math.random() * sif), mNow = L[from - 1].m, l0 = lam();
      if (L.filter(l => l.g).length !== 11) continue; pris++;
      api.rejoueRdv(gen, L, from, mNow, s, l0, l0);
      if (s.sh === 2 && s.sa === 9) garde++;
    }
    ok(pris > 0 && garde === pris, "un 2-9 rejoué à consigne égale reste un 2-9 (" + garde + "/" + pris + ")");
  }
}

/* ===== F) le verdict européen suit le score rejoué ===== */
console.log("\nF) Europe : cumul, but à l'extérieur et finale se recalculent sur le score rejoué");
{
  const G = neuve("MET");
  G.euroCompet = "C1"; api.euroInit();
  const a = G.monClub, b = G.europe[1].id;
  const t1 = api.euroClotureAvec(a, b, [1, 0], [1, 0]); // 1-0 à l'aller, 0-1 au retour (b gagne chez lui 1-0) → égalité, pas de but à l'extérieur
  ok(t1.agg[0] === 1 && t1.agg[1] === 1 && t1.tab, "1-0 puis 1-0 pour l'autre : cumul 1-1, aucun but à l'extérieur → tirs au but");
  const t2 = api.euroClotureAvec(a, b, [1, 2], [1, 0]); // aller 1-2 chez a, retour b 1 - a 0 → cumul a 1, b 3
  ok(t2.win === b && !t2.tab, "cumul défavorable : éliminé sans tirs au but");
  const t3 = api.euroClotureAvec(a, b, [0, 1], [1, 1]); // aller 0-1 chez a ; retour 1-1 chez b → cumul 1-2 ? a:0+1=1, b:1+1=2 → b
  ok(t3.win === b, "le cumul prime sur le reste");
  const t4 = api.euroClotureAvec(a, b, [1, 2], [0, 1]); // aller 1-2 ; retour b0 a1 → cumul 2-2, buts à l'ext. a 1 / b 2 → b
  ok(t4.win === b && !t4.tab, "cumul égal : le but à l'extérieur départage");
  const f1 = api.euroFinaleAvec(a, b, [2, 2]), f2 = api.euroFinaleAvec(a, b, [3, 1]);
  ok(f1.tab && (f1.win === a || f1.win === b) && !f2.tab && f2.win === a, "finale : nul → tirs au but, sinon le score tranche");
  let pareil = true;
  for (let k = 0; k < 2000; k++) { const l1 = api.euroManche(a, b), t = api.euroCloture(a, b, l1);
    const u = api.euroClotureAvec(a, b, l1, t.l2); if (u.agg[0] !== t.agg[0] || u.agg[1] !== t.agg[1] || (!t.tab && u.win !== t.win)) { pareil = false; break; } }
  ok(pareil, "euroCloture et euroClotureAvec rendent le même verdict sur 2 000 retours (hors tirage des t.a.b.)");
}

/* ===== G) le Calendrier montre le rendez-vous à préparer ===== */
console.log("\nG) Le Calendrier montre le rendez-vous à préparer, sans rien verrouiller");
{
  const G = neuve("MET");
  G.coupe.aJouer = null; G.coupe.elimine = false;
  api.coupeTireTour(api.COUPE_TOURS[0]);
  const rdv = api.rdvEnAttente();
  ok(rdv && rdv.type === "coupe", "un tour de Coupe de France en attente est bien vu comme VOTRE rendez-vous");
  let pepin = null;
  try { api.ecranCalendrier(); } catch (e) { pepin = e.message; }
  ok(!pepin, "l'écran Calendrier se rend avec une coupe en attente" + (pepin ? " : " + pepin : ""));
  const h1 = APP.innerHTML;
  ok(/Coupe de France/.test(h1) && /bRdvGo/.test(h1) && /bRdvVite/.test(h1), "il affiche l'affiche de coupe et ses deux coups d'envoi");
  ok(!/id="bJouer"/.test(h1), "…et PAS le coup d'envoi du samedi : la coupe se joue d'abord");
  ok(/bRdvRot/.test(h1) && /bConsigne/.test(h1) && /bPrime/.test(h1), "rotation, consigne et prime se règlent sur le même écran");
  ok(!/restent ouverts/.test(h1), "…sans mode d'emploi : que les onglets restent ouverts, le joueur le découvre (épure du 25/09/2026)");
  ok(/en cas de qualification/.test(h1), "la prime dit ce qui la déclenche un soir de coupe : la qualification");
  api.coupeResoutTour(false);
  api.ecranCalendrier();
  ok(/id="bJouer"/.test(APP.innerHTML) && !/bRdvGo/.test(APP.innerHTML), "le tour joué, le match du samedi reprend sa place");
  // Europe : aller, retour, finale
  G.euroCompet = "C1"; api.euroInit();
  const essaie = (quoi, prepare, motif) => {
    let err = null; try { prepare(); api.ecranCalendrier(); } catch (e) { err = e.message; }
    ok(!err && motif.test(APP.innerHTML) && /bRdvGo/.test(APP.innerHTML), quoi + (err ? " : " + err : ""));
  };
  essaie("Europe, match aller : l'écran le dit", () => api.euroTireTour(), /MATCH ALLER/);
  essaie("Europe, match retour : l'écran rappelle le score de l'aller", () => {
    const p = G.euro.aJouer.paires.find(x => x[0] === G.monClub || x[1] === G.monClub);
    api.euroResoutTour(true, { aid: p[0], bid: p[1], l1: [1, 1] });
    G.euro.aJouer = { tourIdx: G.euro.attente.tourIdx, nom: "Huitièmes", court: "8es", finale: false, manche: 2, paires: G.euro.attente.paires, allers: G.euro.attente.allers };
  }, /MATCH RETOUR[\s\S]*Aller : <b>1-1<\/b>/);
  essaie("Europe, finale : terrain neutre", () => {
    G.euro.attente = null;
    G.euro.aJouer = { tourIdx: 3, nom: "Finale", court: "Finale", finale: true, manche: 2, paires: [[G.monClub, G.europe[2].id]], allers: null };
  }, /FINALE · terrain neutre/);
  // un rendez-vous qui n'est pas le vôtre ne bloque rien : résolu en silence
  G.euro.aJouer = null;
  api.coupeTireTour(api.COUPE_TOURS[1]);
  G.coupe.aJouer.paires = G.coupe.aJouer.paires.filter(p => p.hid !== G.monClub && p.aid !== G.monClub);
  ok(api.rdvEnAttente() === null && G.coupe.aJouer === null, "un tour où vous ne jouez pas se résout en silence, sans rendez-vous");
}

/* ===== H) « APRÈS CE MATCH » : ce qui vient, et rien de plus (v1.20) ===== */
console.log("\nH) Les prochains rendez-vous : on n'annonce que ce qu'on sait");
{
  const G = neuve("MET");
  G.coupe.elimine = true; G.euro.elimine = true; // d'abord le cas nu : rien que le championnat
  const advDe = (jj) => { const p = G.calendrier[jj].find(x => x[0] === G.monClub || x[1] === G.monClub);
    return { dom: p[0] === G.monClub, id: p[0] === G.monClub ? p[1] : p[0] }; };
  let l = api.prochainsRdv(G, 3, null);
  ok(l.length === 3 && l.every(x => x.ico === "⚽"), `trois rendez-vous annoncés, tous de championnat (${l.length})`);
  ok(l[0].j === 1 && l[1].j === 2 && l[2].j === 3, `et ce sont les journées qui SUIVENT celle qu'on prépare (J${l.map(x => x.j + 1).join(", J")})`);
  const a1 = advDe(1), nom1 = api.clubById(a1.id).nom;
  ok(l[0].txt.indexOf(nom1) === 0 && new RegExp(a1.dom ? "à domicile" : "à l'extérieur").test(l[0].txt),
    `le premier dit l'adversaire et le lieu : « ${l[0].txt} »`);
  ok(/\(\d+(er|ᵉ|e)\)/.test(l[0].txt), "avec le rang de l'adversaire au classement du moment");

  // un soir de coupe en attente : c'est LUI qu'on joue, donc il n'est pas dans la liste — mais le samedi y entre
  G.coupe.elimine = false; G.coupe.aJouer = null;
  api.coupeTireTour(api.COUPE_TOURS[0]);
  const rdv = api.rdvEnAttente();
  l = api.prochainsRdv(G, 3, rdv);
  ok(!l.some(x => x.ico === "🏆"), "le tour de coupe qu'on joue ce soir ne figure pas dans « après ce match »");
  ok(l[0].j === G.journee, `en revanche le match du samedi, lui, y entre (J${l[0].j + 1})`);

  // un tour de coupe encore loin ne prend pas la place d'un samedi : « après ce match », c'est ce qui vient
  api.coupeResoutTour(false);
  G.coupe.elimine = false;
  G.journee = 0;
  ok(!api.prochainsRdv(G, 3, null).some(x => x.ico === "🏆"),
    `le tour suivant tombe à la J${api.COUPE_TOURS[G.coupe.tourIdx].j + 1} : à la J1, il n'encombre pas la liste`);

  // …mais à sa veille, il s'annonce, en tête, et sans promettre d'adversaire (le tirage n'a pas eu lieu)
  const jCF = api.COUPE_TOURS[G.coupe.tourIdx].j;
  G.journee = jCF - 1;
  l = api.prochainsRdv(G, 3, null);
  const cf = l.find(x => x.ico === "🏆");
  ok(cf && cf.semaine && /adversaire à tirer/.test(cf.txt), cf ? `à la veille, il s'annonce sans mentir : « ${cf.txt} »` : "le tour suivant devrait être annoncé");
  ok(cf && cf.j === jCF, `à la journée où il se jouera (J${jCF + 1})`);
  ok(cf && l.indexOf(cf) === 0, "et AVANT le samedi de la même journée : en semaine, on joue d'abord la coupe");
  G.coupe.elimine = true;
  ok(!api.prochainsRdv(G, 3, null).some(x => x.ico === "🏆"), "éliminé, il disparaît : on n'annonce pas un tour qu'on ne jouera pas");

  // Europe : le retour se nomme, parce que l'adversaire de l'aller est connu, lui
  G.euroCompet = "C1"; api.euroInit();
  G.journee = api.EURO_TOURS[0].j;
  api.euroTireTour();
  const p = G.euro.aJouer.paires.find(x => x[0] === G.monClub || x[1] === G.monClub);
  api.euroResoutTour(true, { aid: p[0], bid: p[1], l1: [1, 1] });
  G.journee = api.EURO_TOURS[0].jr - 1;
  l = api.prochainsRdv(G, 3, null);
  const eu = l.find(x => x.semaine && /retour/.test(x.txt));
  ok(eu && /contre /.test(eu.txt), eu ? `la manche retour dit contre qui : « ${eu.txt} »` : "la manche retour devrait être annoncée");
  ok(eu && eu.j === api.EURO_TOURS[0].jr, `et à la bonne journée (J${api.EURO_TOURS[0].jr + 1})`);

  // le rendu, sur l'écran réel
  let pepin = null;
  try { api.ecranCalendrier(); } catch (e) { pepin = e.message; }
  ok(!pepin, "l'écran Calendrier se rend avec le bloc" + (pepin ? " : " + pepin : ""));
  ok(/APRÈS CE MATCH/.test(APP.innerHTML), "et l'on y lit « APRÈS CE MATCH »");
  ok(APP.innerHTML.indexOf("<img") < 0, "aucune balise ouverte par un nom de club");

  // fin de saison : plus rien à annoncer, et rien ne casse
  G.journee = 37;
  ok(api.prochainsRdv(G, 3, null).filter(x => x.ico === "⚽").length === 0, "à la dernière journée, plus un samedi à annoncer");
  G.journee = 38;
  let boum = null; try { api.prochainsRdv(G, 3, null); api.blocProchains(G, null); } catch (e) { boum = e.message; }
  ok(!boum, "et passé la 38e, la liste se calcule et se rend sans lever d'exception" + (boum ? " : " + boum : ""));
}

console.log(F ? "\n❌ HARNAIS RENDEZ-VOUS DE SEMAINE : " + F + " PROBLÈME(S)" : "\n✅ HARNAIS RENDEZ-VOUS DE SEMAINE : TOUT EST VERT");
process.exit(F ? 1 : 0);
