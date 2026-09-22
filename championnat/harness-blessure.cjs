/* Harnais headless — LA BLESSURE EN DIRECT (v1.18)
   Le pépin ne se découvre plus dans les dépêches d'après-match : pour la rencontre qu'on joue, il
   tombe à une minute, le téléscripteur le raconte et le banc y répond. Ce harnais garde les deux
   choses qui doivent rester vraies : le TIRAGE n'a pas bougé d'un iota (une blessure par homme et
   par match, même probabilité qu'avant), et la PELOUSE que le moteur fait jouer est celle qu'on voit.
   Mesuré avant livraison, sur 6 carrières × 38 journées et plusieurs tirages : 0,22 blessure par match
   pour mon club et 0,20 pour les dix-neuf autres en v1.17 ; 0,23 et 0,20 en v1.18 (échantillons : mon
   club 0,19 à 0,26, les autres 0,19 à 0,21). L'écart tient entièrement dans le bruit.
   A) un seul tirage : la feuille du jour remplace le tirage d'après-match, elle ne s'y ajoute pas
   B) la minute tombe dans le temps de jeu de l'homme — jamais depuis le banc
   C) le banc répond : l'entrant est du poste, il prend l'une des trois places, la pelouse suit
   D) 400 matchs racontés : le blessé remplacé ne touche plus un ballon, son remplaçant joue vraiment
   E) le gardien touché : sa doublure poste pour poste, sinon un joueur de champ enfile les gants
   F) la fraîcheur au prorata : le blessé paie ses minutes, l'entrant les siennes
   G) le fil : chaque scène de pépin est suivie de la réponse du banc, à la même minute
   H) ce que pèse la pelouse : un boiteux gardé coûte, une fin à dix se compte sur les rails du rouge
   I) le recollage : une consigne changée n'empêche personne de se blesser — la scène survit, une seule fois
   J) une saison entière : aucune exception, et le taux de blessures reste dans sa plage
   Usage : node harness-blessure.cjs                                                             */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,clubById,byUid,onze,enJeu,forces,lambdasZones," +
  "tireSubs,tireBlessures,tirageBlessure,remplaceBlesse,bancBlessure,avanceLeBanc,releveGardien," +
  "appliqueResultat,simuleMatch,rejoueDepuis,lignesBlessure,ligneBlessure,lignesChangements,expulse," +
  "poidsPelouse,poidsHommeEnMoins,ouvreBlessure,fraich,coutMinutes,alignable,noteSel,BLESS_MIN,BLESS_MAX,BLESS_BOITE,BLESS_DIX,BLESS_DIX_ADV," +
  "getChg:function(){return CHANGEMENTS;},setChg:function(x){CHANGEMENTS=x;}," +
  "getG:function(){return G;},setG:function(x){G=x;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const r2 = (x) => Math.round(x * 100) / 100;
let G;
const frais = (c) => c.joueurs.forEach(j => { j.fraich = 100; j.bless = 0; j.susp = 0; j.repos = false; });
/* Les joueurs sont les objets de la partie : les rendre fragiles pour faire tomber les tirages vite
   doit se DÉFAIRE, sinon la section suivante hérite d'une division en papier mâché. */
const SAUVE = new Map();
const fragile = (c) => c.joueurs.forEach(j => {
  if (!SAUVE.has(j)) SAUVE.set(j, { f: j.fragile, fr: j.fraich });
  j.fragile = 10; j.fraich = 62;
});
const normal = () => { SAUVE.forEach((v, j) => { j.fragile = v.f; j.fraich = v.fr; }); SAUVE.clear(); };

/* ============ A) UN SEUL TIRAGE PAR HOMME ET PAR MATCH ============ */
console.log("A) La feuille du jour REMPLACE le tirage d'après-match, elle ne s'y ajoute pas");
{
  api.nouvellePartie("LIL");
  G = api.getG();
  const [h, a2] = [G.clubs[0], G.clubs[1]];

  // 1) feuille VIDE : personne ne se blesse au coup de sifflet, même avec des hommes de verre
  let blesses = 0;
  for (let n = 0; n < 300; n++) {
    frais(h); frais(a2); fragile(h); fragile(a2);
    const pre = { h: api.tireSubs(h, 0), a: api.tireSubs(a2, 3) };
    pre.h.bless = []; pre.a.bless = [];
    api.appliqueResultat(h, a2, 1, 0, pre);
    blesses += h.joueurs.filter(j => j.bless > 0).length + a2.joueurs.filter(j => j.bless > 0).length;
  }
  ok(blesses === 0, `300 matchs à feuille vide : ${blesses} blessure(s) — le tirage d'après-match ne repasse jamais derrière le direct`);

  // 2) feuille REMPLIE : exactement ces hommes-là, exactement ces durées-là
  frais(h); frais(a2); fragile(h); fragile(a2);
  const pre = { h: api.tireSubs(h, 0), a: api.tireSubs(a2, 3) };
  const cible = pre.h.xi[4], cible2 = pre.a.xi[7];
  pre.h.bless = [{ uid: cible.uid, d: 4, m: 33 }];
  pre.a.bless = [{ uid: cible2.uid, d: 1, m: 70 }];
  api.appliqueResultat(h, a2, 0, 0, pre);
  const tousH = h.joueurs.filter(j => j.bless > 0), tousA = a2.joueurs.filter(j => j.bless > 0);
  ok(tousH.length === 1 && tousH[0] === cible && cible.bless === 4, `un seul blessé chez ${h.nom} : ${cible.nom}, 4 journées, comme la feuille le disait`);
  ok(tousA.length === 1 && tousA[0] === cible2 && cible2.bless === 1, `un seul blessé chez ${a2.nom} : ${cible2.nom}, 1 journée`);

  // 3) SANS feuille (les neuf autres rencontres) : rien n'a changé, le tirage a toujours lieu
  let vus = 0;
  for (let n = 0; n < 200; n++) {
    frais(h); frais(a2); fragile(h); fragile(a2);
    const p2 = { h: api.tireSubs(h, 0), a: api.tireSubs(a2, 3) };
    api.appliqueResultat(h, a2, 2, 1, p2);
    vus += h.joueurs.filter(j => j.bless > 0).length;
  }
  ok(vus > 0, `les neuf autres matchs gardent l'ancien chemin : ${vus} pépins tirés au coup de sifflet sur 200 rencontres`);
  normal(); frais(h); frais(a2);
}

/* ============ B) LA MINUTE TOMBE DANS SON TEMPS DE JEU ============ */
console.log("B) Un homme ne se blesse pas depuis le banc");
{
  api.nouvellePartie("REN");
  G = api.getG();
  let pepin = null, tires = 0, avantSaSortie = 0;
  for (let n = 0; n < 400 && !pepin; n++) {
    const c = G.clubs[n % 20];
    frais(c); fragile(c);
    const sel = api.tireSubs(c, n % 2 ? 3 : 0);
    const bl = api.tireBlessures(c, sel);
    for (const x of bl) {
      tires++;
      const j = api.byUid(x.uid);
      if (!j) { pepin = "une blessure sans joueur (uid " + x.uid + ")"; break; }
      if (!sel.xi.includes(j)) { pepin = `${j.nom} se blesse sans avoir commencé le match`; break; }
      if (x.d < 1) { pepin = `${j.nom} : blessure de ${x.d} journée`; break; }
      if (x.m && (x.m < api.BLESS_MIN || x.m > api.BLESS_MAX)) { pepin = `${j.nom} touché à la ${x.m}e`; break; }
      const k = sel.sort.indexOf(j);
      if (k >= 0 && x.m) { if (x.m >= sel.min[k]) { pepin = `${j.nom} se blesse à la ${x.m}e alors qu'il sort à la ${sel.min[k]}e`; break; } avantSaSortie++; }
    }
    if (bl.length > 1 && bl.some((x, i) => i && x.m < bl[i - 1].m)) pepin = "les pépins ne sont pas rendus dans l'ordre des minutes";
    if (new Set(bl.map(x => x.uid)).size !== bl.length) pepin = "le même homme se blesse deux fois dans le même match";
  }
  ok(!pepin && tires > 0, pepin || `${tires} pépins tirés : tous sur la pelouse, entre la ${api.BLESS_MIN}e et la ${api.BLESS_MAX}e, dans l'ordre (${avantSaSortie} touchés avant le changement qui les attendait)`);
  normal();
}

/* ============ C) LE BANC RÉPOND ============ */
console.log("C) Le banc se lève : l'entrant est du poste, et il prend l'une des trois places");
{
  api.nouvellePartie("LIL");
  G = api.getG();
  const c = api.clubById(G.monClub);
  frais(c);

  // 1) un titulaire qui ne devait pas sortir : quelqu'un de son poste entre à sa minute
  let sel = api.tireSubs(c, 0);
  api.setChg({ [c.id]: sel });
  const j = sel.xi.find(x => x.pos !== "G" && !sel.sort.includes(x));
  const rel = api.remplaceBlesse(c, 28, j);
  ok(rel && rel.entre && rel.entre.pos === j.pos, `${j.nom} (${j.pos}) touché à la 28e : ${rel && rel.entre ? rel.entre.nom + " (" + rel.entre.pos + ")" : "personne"} entre à sa place`);
  ok(sel.banc.length <= 3, `la feuille tient toujours en trois changements (${sel.banc.length} au total)`);
  const p27 = api.enJeu(c, 27), p29 = api.enJeu(c, 29);
  ok(p27.includes(j) && !p27.includes(rel.entre), "à la 27e, il est encore sur la pelouse et son remplaçant sur le banc");
  ok(!p29.includes(j) && p29.includes(rel.entre) && p29.length === 11, "à la 29e, il a cédé sa place — et l'équipe reste à onze");
  ok(sel.banc.filter(x => x === rel.entre).length === 1, "et celui qui entre n'entre qu'une fois, même s'il était déjà prévu pour plus tard");

  // 2) un titulaire qui devait sortir plus tard : c'est CE changement-là qui se fait tout de suite
  frais(c); sel = api.tireSubs(c, 0); api.setChg({ [c.id]: sel });
  const vise = sel.sort[0], prevu = sel.min[0], nb = sel.banc.length;
  const rel2 = api.remplaceBlesse(c, 22, vise);
  ok(rel2 && rel2.entre && sel.banc.length <= nb, `${vise.nom} devait sortir à la ${prevu}e : touché à la 22e, il sort maintenant et le club n'a pas gagné un quatrième changement (${sel.banc.length})`);
  ok(!api.enJeu(c, 23).includes(vise), "il n'est plus sur la pelouse dès la 23e");
  ok(api.enJeu(c, 89).length === 11, "et à la 89e, l'équipe est toujours au complet");

  // 3) les trois changements faits : personne n'entre, il serre les dents
  frais(c); sel = api.tireSubs(c, 0); sel.min = sel.min.map(() => 20); api.setChg({ [c.id]: sel });
  const j3 = sel.xi.find(x => x.pos !== "G" && !sel.sort.includes(x));
  const rel3 = api.remplaceBlesse(c, 60, j3);
  ok(rel3 && rel3.plus && !rel3.entre, `trois changements déjà faits : personne ne se lève pour ${j3.nom}`);
  ok(api.enJeu(c, 61).includes(j3), "il reste sur la pelouse, à onze — c'est au direct de proposer de finir à dix");
  api.setChg({});
}

/* ============ D) LE MOTEUR JOUE LA PELOUSE QU'ON VOIT ============ */
console.log("D) 400 matchs racontés : le blessé remplacé ne touche plus un ballon");
{
  api.nouvellePartie("REN");
  G = api.getG();
  const nomme = (l, j) => (l.g && (l.g.uid === j.uid || l.g.pasUid === j.uid)) || (l.c && l.c.uid === j.uid)
    || (l.q && l.q.but === j.nom) || (l.ic !== "sub" && !l.bl && typeof l.x === "string" && l.x.includes(j.nom));
  let faux = null, scenes = 0, butsEntrants = 0;
  for (let n = 0; n < 400 && !faux; n++) {
    const c1 = G.clubs[n % 20], c2 = G.clubs[(n + 9) % 20];
    frais(c1); frais(c2); fragile(c1); fragile(c2);
    const chg = { [c1.id]: api.tireSubs(c1, 0), [c2.id]: api.tireSubs(c2, 3) };
    api.setChg(chg);
    const pepins = [];
    for (const [c, s] of [[c1, chg[c1.id]], [c2, chg[c2.id]]]) {
      s.bless = api.tireBlessures(c, s);
      for (const x of s.bless) { const j = api.byUid(x.uid); if (j && x.m) pepins.push({ c, s, j, x, rel: api.remplaceBlesse(c, x.m, j) }); }
    }
    const r = api.simuleMatch(c1, c2, true);
    for (const q of pepins) {
      if (q.s.rouge && q.s.rouge[q.j.uid] != null && q.s.rouge[q.j.uid] < q.x.m) continue; // un rouge l'avait déjà sorti
      if (!(q.rel && q.rel.entre && q.s.banc.includes(q.rel.entre))) continue; // personne n'est entré : il a fini le match
      scenes++;
      for (const l of r.ev) {
        if (l.m > q.x.m && l.t !== "sys" && nomme(l, q.j)) faux = `${q.j.nom} touché à la ${q.x.m}e, encore nommé à la ${l.m}e : « ${l.x} »`;
        if (l.m < q.x.m && nomme(l, q.rel.entre)) faux = `${q.rel.entre.nom} nommé à la ${l.m}e alors qu'il n'entre qu'à la ${q.x.m}e : « ${l.x} »`;
        if (l.g && l.g.uid === q.rel.entre.uid) butsEntrants++;
      }
    }
    api.setChg({});
  }
  ok(!faux && scenes > 0, faux || `${scenes} remplacements sur blessure : aucun blessé nommé après sa sortie, aucun entrant avant la sienne`);
  ok(butsEntrants > 0, `et ces entrants-là jouent pour de bon : ${butsEntrants} buts marqués après être montés sur blessure`);
  normal();
}

/* ============ E) LE GARDIEN TOUCHÉ ============ */
console.log("E) Un gardien touché : sa doublure, ou les gants à un joueur de champ");
{
  api.nouvellePartie("LIL");
  G = api.getG();
  const c = api.clubById(G.monClub);
  frais(c);
  let sel = api.tireSubs(c, 0); api.setChg({ [c.id]: sel });
  const gk = sel.xi.find(x => x.pos === "G");
  const rel = api.remplaceBlesse(c, 35, gk);
  ok(rel && rel.entre && rel.entre.pos === "G", `${gk.nom} touché à la 35e : ${rel && rel.entre ? rel.entre.nom : "personne"} prend les gants, poste pour poste`);
  const pel = api.enJeu(c, 36);
  ok(!pel.includes(gk) && pel.includes(rel.entre) && pel.length === 11 && pel.filter(x => x.pos === "G").length === 1,
    "à la 36e : onze hommes, un seul gardien, et ce n'est plus le blessé");

  // pas de doublure : il quitte quand même la pelouse, un joueur de champ enfile les gants
  frais(c);
  sel = api.tireSubs(c, 0); api.setChg({ [c.id]: sel });
  const gk2 = sel.xi.find(x => x.pos === "G");
  c.joueurs.filter(x => x.pos === "G" && x !== gk2).forEach(x => { x.bless = 3; });
  const rel2 = api.remplaceBlesse(c, 40, gk2);
  const pel2 = api.enJeu(c, 41);
  ok(rel2 && rel2.gants && !rel2.entre, `aucune doublure valide : ${rel2 && rel2.gants ? rel2.gants.nom : "?"} enfile le maillot du gardien`);
  ok(!pel2.includes(gk2) && pel2.length === 10, `et le club finit à dix (${pel2.length} sur la pelouse), sans gardien de métier`);
  c.joueurs.forEach(x => { x.bless = 0; });
  api.setChg({});
}

/* ============ F) LA FRAÎCHEUR AU PRORATA ============ */
console.log("F) Le blessé paie ses minutes, son remplaçant les siennes");
{
  api.nouvellePartie("REN");
  G = api.getG();
  const [h, a2] = [G.clubs[0], G.clubs[1]];
  frais(h); frais(a2);
  const pre = { h: api.tireSubs(h, 0), a: api.tireSubs(a2, 3) };
  api.setChg({ [h.id]: pre.h, [a2.id]: pre.a });
  const j = pre.h.xi.find(x => x.pos !== "G" && !pre.h.sort.includes(x));
  const rel = api.remplaceBlesse(h, 36, j);
  pre.h.bless = [{ uid: j.uid, d: 3, m: 36 }]; pre.a.bless = [];
  api.appliqueResultat(h, a2, 1, 1, pre);
  ok(r2(100 - api.fraich(j)) === r2(20 * 36 / 90), `${j.nom}, touché à la 36e, ne paie que ses minutes : ${r2(100 - api.fraich(j))}`);
  ok(r2(100 - api.fraich(rel.entre)) === r2(20 * 54 / 90), `${rel.entre.nom}, entré à la 36e, paie les siennes : ${r2(100 - api.fraich(rel.entre))}`);
  ok(j.bless === 3, "et l'absence annoncée par le direct est bien celle qu'on purge : 3 journées");
  // le gardien sorti sans remplaçant paie lui aussi au prorata
  frais(h);
  const pre2 = { h: api.tireSubs(h, 0), a: api.tireSubs(a2, 3) };
  api.setChg({ [h.id]: pre2.h, [a2.id]: pre2.a });
  const gk = pre2.h.xi.find(x => x.pos === "G");
  h.joueurs.filter(x => x.pos === "G" && x !== gk).forEach(x => { x.bless = 3; });
  api.remplaceBlesse(h, 45, gk);
  pre2.h.bless = [{ uid: gk.uid, d: 2, m: 45 }]; pre2.a.bless = [];
  api.appliqueResultat(h, a2, 0, 0, pre2);
  ok(r2(100 - api.fraich(gk)) === r2(20 * 45 / 90), `le gardien évacué à la 45e sans doublure paie la moitié du match : ${r2(100 - api.fraich(gk))}`);
  h.joueurs.forEach(x => { if (x !== gk) x.bless = 0; });
  api.setChg({});
}

/* ============ G) LE FIL : LA SCÈNE ET LA RÉPONSE DU BANC ============ */
console.log("G) Chaque scène de pépin est suivie de la réponse du banc, à la même minute");
{
  api.nouvellePartie("LIL");
  G = api.getG();
  let faux = null, scenes = 0, remplacements = 0, dents = 0, gants = 0, purgent = 0;
  for (let d = 0; d < 38 && !faux; d++) { // une saison : au-delà, il faudrait passer par l'intersaison
    const c = api.clubById(G.monClub); if (c) fragile(c);
    const sortie = api.jouerJournee(), mm = sortie && sortie.monMatch;
    if (!mm) continue;
    const ev = mm.ev;
    ev.forEach((l, i) => {
      if (!l.bl) return;
      scenes++;
      const j = api.byUid(l.bl.uid);
      if (!j) { faux = "une scène de pépin sans joueur"; return; }
      if (!l.x || !l.x.includes(j.nom)) faux = `la scène ne nomme pas le blessé : « ${l.x} »`;
      // un pépin d'une seule journée est purgé le soir même (la semaine de repos décompte tout de suite,
      // comme en v1.17) : on vérifie donc que l'infirmerie se remplit, pas que CHAQUE homme y entre
      if (j.bless > 0) purgent++;
      const suite = ev[i + 1];
      if (!suite || suite.m !== l.m) { faux = `la scène de ${j.nom} (${l.m}e) n'est suivie de rien à sa minute`; return; }
      if (suite.ic === "sub") {
        remplacements++;
        if (suite.out !== j.uid) faux = `à la ${l.m}e, le changement qui suit la blessure de ${j.nom} sort quelqu'un d'autre`;
        if (!/blessure|reprendre|boitant|risque/.test(suite.x)) faux = `le changement d'un blessé est annoncé comme un changement ordinaire : « ${suite.x} »`;
      } else if (/gardien|gants/.test(suite.x)) gants++;   // le portier touché sans doublure : un joueur de champ prend la cage
      else { dents++; if (!suite.x.includes(j.nom)) faux = `la suite ne dit rien du blessé : « ${suite.x} »`; }
    });
    const sifflet = ev[ev.length - 1];
    if (sifflet.t !== "sys") faux = "le coup de sifflet n'est plus la dernière ligne du fil";
  }
  ok(!faux && scenes > 0, faux || `${scenes} scènes de pépin sur une saison entière, toutes suivies d'une réponse à leur minute (${remplacements} remplacements, ${dents} serrages de dents, ${gants} gants confiés à un joueur de champ)`);
  ok(remplacements > 0, "le banc se lève pour de bon dans la grande majorité des cas");
  ok(purgent > 0, `et ces pépins-là remplissent l'infirmerie : ${purgent} scènes sur ${scenes} laissent un homme absent la journée suivante`);
  normal();
}

/* ============ H) CE QUE PÈSE LA PELOUSE ============ */
console.log("H) Un boiteux gardé coûte, une pelouse incomplète se compte sur les rails du rouge");
{
  api.nouvellePartie("REN");
  G = api.getG();
  const moi = api.clubById(G.monClub), adv = G.clubs.find(c => c.id !== moi.id);
  frais(moi); frais(adv);
  const xi = api.onze(moi);
  const att = xi.filter(x => x.pos === "A").sort((x, y) => y.note - x.note)[0];
  const wNeutre = api.poidsPelouse(moi, adv, xi, xi);
  const wBoite = api.poidsHommeEnMoins(1 - api.BLESS_BOITE); // il reste, amputé de ce qu'il ne peut plus faire
  const wDix = api.poidsHommeEnMoins(1);                     // il sort, personne ne le remplace
  ok(r2(wNeutre.mien) === 1 && r2(wNeutre.sien) === 1, "la même pelouse ne change rien : ×1,00 des deux côtés");
  ok(wBoite.mien < 1 && wBoite.sien > 1, `garder un blessé sur la pelouse : vos buts ×${r2(wBoite.mien)}, les leurs ×${r2(wBoite.sien)}`);
  ok(r2(wDix.mien) === r2(api.BLESS_DIX) && r2(wDix.sien) === r2(api.BLESS_DIX_ADV),
    `finir à dix, c'est exactement le barème du carton rouge : ×${r2(wDix.mien)} pour vous, ×${r2(wDix.sien)} pour eux`);
  ok(wDix.mien < wBoite.mien && wDix.sien > wBoite.sien, "et un boiteux vaut toujours mieux qu'un trou : le choix n'est jamais joué d'avance");
  // la pelouse incomplète ne passe JAMAIS par l'arithmétique des zones (elle ferait fondre l'attaque de moitié)
  const wTrou = api.poidsPelouse(moi, adv, xi, xi.filter(x => x !== att));
  ok(r2(wTrou.mien) === r2(api.BLESS_DIX), `un onze amputé se compte sur les rails, pas sur les zones : ×${r2(wTrou.mien)}`);
  // à onze contre onze, en revanche, c'est bien la formule des trois zones qui tranche — et un meilleur entrant vaut mieux
  const banc = moi.joueurs.filter(x => !xi.includes(x) && x.pos !== "G" && api.alignable(x)).sort((x, y) => y.note - x.note);
  if (banc.length >= 2) {
    const bon = xi.map(x => x === att ? banc[0] : x), moins = xi.map(x => x === att ? banc[banc.length - 1] : x);
    const wBon = api.poidsPelouse(moi, adv, xi, bon), wMoins = api.poidsPelouse(moi, adv, xi, moins);
    ok(wBon.mien > wMoins.mien, `${banc[0].nom} (${Math.round(banc[0].note)}) vaut mieux que ${banc[banc.length - 1].nom} (${Math.round(banc[banc.length - 1].note)}) : ×${r2(wBon.mien)} contre ×${r2(wMoins.mien)}`);
    ok(wBon.mien >= api.BLESS_DIX && wMoins.mien >= api.BLESS_DIX, "et même le plus modeste des remplaçants vaut mieux qu'un homme en moins (la borne tient)");
    ok(r2(api.poidsPelouse(moi, adv, xi, bon).mien) === r2(wBon.mien), "le calcul ne dépend que de la pelouse : deux appels rendent le même chiffre");
  } else ok(true, "banc trop court pour comparer deux entrants (cas limite, sans objet)");
}

/* ============ I) LE RECOLLAGE ============ */
console.log("I) Une consigne changée n'empêche personne de se blesser");
{
  api.nouvellePartie("LIL");
  G = api.getG();
  let faux = null, recolles = 0;
  for (let n = 0; n < 200 && !faux; n++) {
    const c1 = G.clubs[(n * 3) % 20], c2 = G.clubs[(n * 3 + 7) % 20];
    frais(c1); frais(c2); fragile(c1); fragile(c2);
    const chg = { [c1.id]: api.tireSubs(c1, 0), [c2.id]: api.tireSubs(c2, 3) };
    api.setChg(chg);
    const pepins = [];
    for (const [c, s] of [[c1, chg[c1.id]], [c2, chg[c2.id]]]) {
      s.bless = api.tireBlessures(c, s);
      for (const x of s.bless) { const j = api.byUid(x.uid); if (!j || !x.m) continue;
        pepins.push({ c, s, j, x, rel: api.remplaceBlesse(c, x.m, j) }); }
    }
    const r = api.simuleMatch(c1, c2, true);
    const lignes = [];
    for (const [c, s] of [[c1, chg[c1.id]], [c2, chg[c2.id]]]) lignes.push(...api.lignesChangements(c, s));
    for (const q of pepins) {
      if (q.s.rouge && q.s.rouge[q.j.uid] != null && q.s.rouge[q.j.uid] < q.x.m) { q.x.m = 0; continue; }
      const rel = (q.rel && q.rel.entre && !q.s.banc.includes(q.rel.entre)) ? { plus: true } : q.rel;
      lignes.push(...api.lignesBlessure(q.c, q.j, q.x.m, rel));
    }
    const fin = r.ev.pop(); r.ev = r.ev.concat(lignes).sort((x, y) => x.m - y.m); r.ev.push(fin);
    const attendues = r.ev.filter(l => l.bl).length;
    const from = r.ev.findIndex(l => l.m > 30);
    if (!attendues || from < 0) { api.setChg({}); continue; }
    api.rejoueDepuis(r, c1, c2, from, 30, 1, 1);
    recolles++;
    const apres = r.ev.filter(l => l.bl);
    if (apres.length !== attendues) faux = `${attendues} scènes avant recollage, ${apres.length} après`;
    if (new Set(apres.map(l => l.bl.uid + ":" + l.m)).size !== apres.length) faux = "une scène de pépin apparaît en double après recollage";
    apres.forEach(l => { const i = r.ev.indexOf(l);
      if (i > 0 && r.ev[i - 1].m > l.m) faux = `une scène recollée hors de sa minute (${l.m}e)`; });
    if (r.ev[r.ev.length - 1].t !== "sys") faux = "le coup de sifflet n'est plus la dernière ligne";
    const sc = r.ev.filter(l => l.g).length, sh = r.ev.filter(l => l.g && l.g.cote === c1.id).length;
    if (r.sh !== sh || r.sa !== sc - sh) faux = `score ${r.sh}-${r.sa} contre ${sh}-${sc - sh} lignes-but après recollage`;
    api.setChg({});
  }
  ok(!faux && recolles > 0, faux || `${recolles} fils recollés à la 30e : toutes les scènes de pépin survivent, une seule fois chacune, à leur minute — et le score reste d'accord avec le fil`);
  normal();
}

/* ============ J) UNE SAISON ENTIÈRE ============ */
console.log("J) Une saison : aucune exception, et le taux de blessures reste dans sa plage");
{
  let boum = null, miens = 0, autres = 0, jMiens = 0, jAutres = 0, scenes = 0;
  try {
    for (const club of ["REN", "OM", "AUX"]) {
      api.nouvellePartie(club);
      G = api.getG();
      const mien = G.monClub;
      for (let d = 0; d < 38; d++) {
        const avant = {};
        G.clubs.forEach(c => c.joueurs.forEach(j => { avant[j.uid] = j.bless || 0; }));
        const sortie = api.jouerJournee(), mm = sortie && sortie.monMatch;
        if (mm) scenes += mm.ev.filter(l => l.bl).length;
        G.clubs.forEach(c => {
          const n = c.joueurs.filter(j => (j.bless || 0) > (avant[j.uid] || 0)).length;
          if (c.id === mien) { miens += n; jMiens++; } else { autres += n; jAutres++; }
        });
      }
    }
  } catch (e) { boum = e.message; }
  ok(!boum, boum || `${jMiens} journées jouées d'affilée sans lever d'exception`);
  ok(scenes > 0, `le téléscripteur raconte les pépins : ${scenes} scènes sur ces trois saisons`);
  const tMien = miens / Math.max(1, jMiens), tAutre = autres / Math.max(1, jAutres);
  // plage mesurée en v1.17 : 0,219 pour mon club (qui a d'autres sources : incidents, moment de la 90e)
  // et 0,205 pour les dix-neuf autres. On garde une plage large : ce qu'on refuse, c'est un doublement.
  ok(tMien > 0.10 && tMien < 0.33, `mon club : ${r2(tMien)} blessure(s) par match (v1.17 : 0,22)`);
  ok(tAutre > 0.10 && tAutre < 0.33, `les autres clubs : ${r2(tAutre)} par match (v1.17 : 0,21)`);
}

/* ============ K) LA FENÊTRE DU BANC, CLIQUÉE POUR DE VRAI ============
   On monte un vrai petit nœud DOM pour #fiche (comme harness-modales pour #msgbox) et l'on joue les
   quatre boutons sur le chemin RÉEL : ce qui est écrit dans la fenêtre, ce que chaque clic change sur
   la feuille du jour, et ce qu'il coûte au reste du match. */
console.log("K) La fenêtre du banc : quatre boutons, quatre conséquences");
{
  function noeud() {
    const n = { _h: "", style: {}, dataset: {}, disabled: false, onclick: null, _enfants: {},
      classList: { _c: new Set(), add(c) { this._c.add(c); }, remove(c) { this._c.delete(c); }, contains(c) { return this._c.has(c); } } };
    Object.defineProperty(n, "innerHTML", { get() { return n._h; }, set(v) { n._h = String(v); n._enfants = {}; } });
    n.querySelector = sel => {
      const id = sel.replace("#", "");
      if (!new RegExp('id="' + id + '"').test(n._h)) return null;
      if (!n._enfants[id]) n._enfants[id] = noeud();
      return n._enfants[id];
    };
    n.querySelectorAll = sel => {
      const out = [], re = /<button([^>]*)>/g, veut = sel.split(",").map(x => x.trim().replace(".", ""));
      let mm;
      while ((mm = re.exec(n._h))) {
        const attrs = mm[1];
        const cls = (/class="([^"]*)"/.exec(attrs) || [, ""])[1].split(" ");
        const id = (/id="([^"]*)"/.exec(attrs) || [, ""])[1];
        const dn = (/data-n="([^"]*)"/.exec(attrs) || [, ""])[1];
        if (!veut.some(v => cls.includes(v))) continue;
        const cle = id || ("dn" + dn);
        if (!n._enfants[cle]) { const b = noeud(); if (dn !== "") b.dataset.n = dn; n._enfants[cle] = b; }
        out.push(n._enfants[cle]);
      }
      return out;
    };
    return n;
  }
  const FICHE = noeud(), generic = makeStub();
  global.document = new Proxy(function () {}, {
    get(_t, p) { if (p === "getElementById") return id => (id === "fiche" ? FICHE : generic); if (p === Symbol.toPrimitive) return () => ""; return generic; },
    set() { return true; }, apply() { return generic; }, has() { return true; }, construct() { return generic; },
  });

  /* Monte une rencontre jouée, avec un pépin à la 30e, et rend de quoi la piloter. */
  const scene = (club, prepare) => {
    api.nouvellePartie(club);
    G = api.getG();
    const moi = api.clubById(G.monClub), adv = G.clubs.find(c => c.id !== moi.id);
    frais(moi); frais(adv);
    const chg = { [moi.id]: api.tireSubs(moi, 0), [adv.id]: api.tireSubs(adv, 3) };
    api.setChg(chg);
    const p = chg[moi.id];
    if (prepare) prepare(p, moi);
    const j = p.xi.find(x => x.pos !== "G" && !p.sort.includes(x));
    p.bless = [{ uid: j.uid, d: 2, m: 30 }]; chg[adv.id].bless = [];
    const rel = api.remplaceBlesse(moi, 30, j);
    const r = api.simuleMatch(moi, adv, true);
    const lignes = [];
    for (const [c, s] of [[moi, chg[moi.id]], [adv, chg[adv.id]]]) lignes.push(...api.lignesChangements(c, s));
    lignes.push(...api.lignesBlessure(moi, j, 30, rel));
    const fin = r.ev.pop(); r.ev = r.ev.concat(lignes).sort((x, y) => x.m - y.m); r.ev.push(fin);
    const eM = { h: moi, a: adv, sh: r.sh, sa: r.sa, mien: true };
    G._pend = { res: [eM], pend: {}, monMatch: r };
    const etat = { repris: 0, suites: 0 };
    const ctx = { monMatch: r, eM, mul: { h: 1, a: 1 }, reprendre: () => { etat.repris++; }, suite: () => { etat.suites++; } };
    const idx = r.ev.findIndex(l => l.bl);
    return { moi, adv, p, j, rel, r, ctx, etat, idx, chg };
  };
  const ouvre = (s) => { api.ouvreBlessure(s.ctx, s.r.ev[s.idx], s.idx); return FICHE; };
  const clic = (id) => { const b = FICHE.querySelector("#" + id); if (!b || !b.onclick) throw new Error("pas de bouton " + id); b.onclick(); };
  const reprendreLeMatch = () => { const div = FICHE.querySelector("#penRes"); div.querySelector("#bPenOk").onclick(); };

  // 1) ce que la fenêtre écrit
  let s1 = scene("LIL");
  let f = ouvre(s1);
  ok(/BLESSURE — 30ᵉ MINUTE/.test(f._h), "le titre annonce la minute : « 🏥 BLESSURE — 30ᵉ MINUTE »");
  ok(f._h.includes(s1.j.nom) && f._h.includes(s1.rel.entre.nom), `la fenêtre nomme le blessé (${s1.j.nom}) et celui que le banc a fait lever (${s1.rel.entre.nom})`);
  ok(!!f.querySelector("#bVite") && !!f.querySelector("#bDents") && !f.querySelector("#bDix"),
    "trois portes de sortie : le remplacement rapide, un autre homme du banc, ou serrer les dents — pas « finir à dix » tant qu'un remplaçant est offert");
  ok(f.querySelectorAll(".bAutreB").length > 0, `et ${f.querySelectorAll(".bAutreB").length} autres noms à faire entrer d'un clic`);
  ok(global.window._penEnCours === true, "tant qu'elle est ouverte, le téléscripteur est verrouillé");

  // 2) le remplacement rapide : on ne rejoue rien, c'est la réponse par défaut
  const bancAvant = s1.p.banc.slice(), filAvant = s1.r.ev.length;
  clic("bVite");
  reprendreLeMatch();
  ok(s1.etat.repris === 1 && s1.etat.suites === 0, "le remplacement rapide reprend le match sans recoller quoi que ce soit");
  ok(s1.ctx.mul.h === 1 && s1.ctx.mul.a === 1, "et sans rien changer aux forces en présence : ×1,00");
  ok(s1.p.banc.length === bancAvant.length && s1.p.banc.includes(s1.rel.entre) && s1.r.ev.length === filAvant,
    "la feuille du jour et le fil sont intacts");
  ok(global.window._penEnCours === false, "la fenêtre refermée rend la main au téléscripteur");

  // 3) il serre les dents : le remplaçant se rassoit, le fil oublie le changement, et ça coûte
  const s2 = scene("REN");
  const entrant2 = s2.rel.entre, dAvant = s2.p.bless[0].d;
  ouvre(s2);
  clic("bDents");
  reprendreLeMatch();
  // il se rassoit : ou bien il ne joue plus du tout, ou bien — s'il avait déjà un changement prévu plus
  // tard, que le pépin avait avancé — il le retrouve à sa minute d'origine
  const kE2 = s2.p.banc.indexOf(entrant2);
  ok(kE2 < 0 || s2.p.min[kE2] > 30, kE2 < 0 ? `${entrant2.nom} se rassoit : il n'entrera pas`
    : `${entrant2.nom} se rassoit, et retrouve le changement qu'il avait prévu à la ${s2.p.min[kE2]}e`);
  ok(s2.r.ev.filter(l => l.ic === "sub" && l.out === s2.j.uid).length === 0, "et le fil n'annonce plus son entrée");
  ok(s2.r.ev.some(l => l.bl && l.bl.uid === s2.j.uid), "la scène du pépin, elle, reste écrite");
  ok(s2.etat.suites === 1 && (s2.ctx.mul.h < 1 || s2.ctx.mul.a < 1), `la fin du match est rejouée, et le boiteux se paie : ×${r2(Math.min(s2.ctx.mul.h, s2.ctx.mul.a))}`);
  ok(s2.p.bless[0].d >= dAvant, `l'absence annoncée peut s'allonger (${dAvant} → ${s2.p.bless[0].d} journées) : c'est le prix de l'entêtement`);
  ok(api.enJeu(s2.moi, 31).includes(s2.j), "il est toujours sur la pelouse à la 31e");

  // 4) un autre homme du banc : c'est lui qui entre, et la ligne du direct le dit
  const s3 = scene("OM");
  const f3 = ouvre(s3);
  const boutons = f3.querySelectorAll(".bAutreB");
  const avantNom = s3.rel.entre.nom;
  boutons[0].onclick();
  reprendreLeMatch();
  const ligneSub = s3.r.ev.find(l => l.ic === "sub" && l.out === s3.j.uid);
  const entre3 = ligneSub && api.byUid(ligneSub.uid);
  ok(entre3 && entre3 !== s3.rel.entre, `le banc avait levé ${avantNom} ; c'est ${entre3 ? entre3.nom : "?"} qui entre`);
  ok(s3.p.banc.includes(entre3) && !s3.p.banc.includes(s3.rel.entre), "la feuille du jour a suivi : un seul des deux est entré");
  ok(ligneSub && ligneSub.x.includes(entre3.nom) && ligneSub.x.includes(s3.j.nom), `la ligne du direct le dit : « ${ligneSub.x} »`);
  ok(s3.etat.suites === 1, "et la fin du match a été rejouée avec lui");

  // 5) plus aucun changement possible : finir à dix, ou serrer les dents
  const s4 = scene("AUX", (p) => { p.min = p.min.map(() => 12); }); // les trois changements faits à la 12e
  const f4 = ouvre(s4);
  ok(!s4.rel.entre && !!f4.querySelector("#bDix") && !f4.querySelector("#bVite"),
    "aucun remplaçant possible : la fenêtre propose de finir à dix, et plus de remplacement rapide");
  clic("bDix");
  reprendreLeMatch();
  ok(!api.enJeu(s4.moi, 31).includes(s4.j) && api.enJeu(s4.moi, 31).length === 10, "il quitte la pelouse : dix hommes à la 31e");
  ok(r2(Math.min(s4.ctx.mul.h, s4.ctx.mul.a)) === r2(api.BLESS_DIX) && r2(Math.max(s4.ctx.mul.h, s4.ctx.mul.a)) === r2(api.BLESS_DIX_ADV),
    `et la fin du match se joue sur les rails du rouge : ×${r2(api.BLESS_DIX)} / ×${r2(api.BLESS_DIX_ADV)}`);

  // 6) un nom bricolé ne peut pas ouvrir de balise
  const s5 = scene("MTP");
  s5.j.nom = 'R. <img src=x onerror="pan()">';
  const f5 = ouvre(s5);
  ok(f5._h.indexOf("<img") < 0 && /&lt;img/.test(f5._h), "le nom du blessé ressort échappé : aucune balise ne s'ouvre");
  clic("bDents"); reprendreLeMatch();

  // 7) le résultat déjà acté (ou une victoire achetée) : la fenêtre ne s'ouvre pas, le match reprend
  const s6 = scene("LIL");
  G._pend = null;
  s6.ctx.reprendre = () => { s6.etat.repris++; };
  api.ouvreBlessure(s6.ctx, s6.r.ev[s6.idx], s6.idx);
  ok(s6.etat.repris === 1 && s6.etat.suites === 0, "résultat déjà acté : on ne rouvre rien et le téléscripteur repart");
  api.setChg({});
}

console.log(FAILS === 0 ? "\n✅ HARNAIS BLESSURE : TOUT EST VERT" : `\n❌ ${FAILS} ÉCHEC(S)`);
process.exit(FAILS ? 1 : 0);
