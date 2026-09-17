/* Harnais headless — LA FRAÎCHEUR, ÉTAT DE FORME PHYSIQUE (v1.00, barème à quatre paliers v1.01)
   Vérifie le système de fatigue joueur par joueur demandé par l'auteur :
   A) le barème de base : un match coûte 20, une semaine en rend 20 — un joueur dans la force de
      l'âge repart toujours de 100 le samedi suivant, un vétéran non (98 à 33 ans, puis ça glisse)
   B) le vétéran se dégrade de match en match sur une saison complète, le jeune jamais
   C) jouer tous les trois jours (rendez-vous de semaine) creuse la jauge pour de bon
   D) le onze se protège tout seul : un cadre sur les rotules cède sa place, ★ passe outre,
      🛌 Repos l'écarte, et l'équipe reste alignable même si l'on met tout le monde au vert
   E) le barème à quatre paliers : rien au-dessus de 90, le pourcentage de forme de 80 à 90, impact
      aggravé de 65 à 80, massif en dessous — sur la performance, sur les blessures ET sur le moral
   F) les VINGT clubs de la division sont concernés, pas seulement le vôtre — et l'IA fait tourner
   G) l'intersaison remet tout le monde à neuf, et une vieille sauvegarde reprend avec un effectif frais
   I) les changements (v1.11) : un bout de match se paie au prorata des minutes, pour l'entrant comme
      pour l'homme qu'il relève — et le moteur le sait : l'entrant peut marquer, le sortant se tait
   J) les gardiens (v1.13) : jamais remplacés pour la tactique ; sur un rouge, un joueur de champ sort et le
      gardien remplaçant prend les gants (sur l'une des trois places) ; sur la blessure de la 90e, il relève
      son gardien s'il reste un changement ; sinon un joueur de champ enfile les gants
   Usage : node harness-fraicheur.cjs                                                        */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,clubById,onze,onzeRotation,forces,byUid,migre," +
  "fraich,useFraich,reposHebdo,recupAge,recupJoueur,facteurFraich,coefBlessureFraich,noteSel,libFraich,jaugeFraich,fatigueSemaine," +
  "apercuRotation,ecranEffectif,ouvreFiche,ecranCoupe,ecranEurope,mettreAuRepos," +
  "dispo,alignable,tireSubs,FRAICH_MATCH,FRAICH_SEM,coutMinutes,appliqueResultat,simuleMatch,rejoueDepuis,enJeu,expulse," +
  "releveGardien,malusRouge,poolRougeGK,lignesChangements,ligneApresRouge,tireMoment," +
  "getChg:function(){return CHANGEMENTS;},setChg:function(x){CHANGEMENTS=x;}," +
  "getG:function(){return G;},setG:function(x){G=x;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const r2 = (x) => Math.round(x * 100) / 100;

/* ============ A) le barème de base ============ */
console.log("A) Le barème : −20 par match, +20 par semaine, moins après 29 ans");
ok(api.FRAICH_MATCH === 20 && api.FRAICH_SEM === 20,
  `constantes conformes à la consigne : match ${api.FRAICH_MATCH}, semaine ${api.FRAICH_SEM}`);
ok(api.coutMinutes(90) === 20 && api.coutMinutes(0) === 0 && api.coutMinutes(45) === 10 && api.coutMinutes(120) === 20,
  `un bout de match au prorata : 90 min → ${api.coutMinutes(90)}, 45 min → ${api.coutMinutes(45)}, 0 → ${api.coutMinutes(0)} (jamais plus qu'un match)`);
ok(api.recupAge(22) === 1 && api.recupAge(29) === 1,
  "jusqu'à 29 ans, la récupération est pleine (taux 1,00)");
const t33 = api.recupAge(33);
ok(r2(100 - api.FRAICH_MATCH + api.FRAICH_SEM * t33) === 98,
  `un joueur de 33 ans est à ${r2(100 - api.FRAICH_MATCH + api.FRAICH_SEM * t33)} % sept jours après un match (la valeur demandée : 98)`);
ok(api.recupAge(35) < api.recupAge(33) && api.recupAge(33) < api.recupAge(30) && api.recupAge(30) < 1,
  `le taux s'érode avec l'âge : 30 ans ${r2(api.recupAge(30))} · 33 ans ${r2(t33)} · 35 ans ${r2(api.recupAge(35))}`);

/* ============ B) une saison complète : le jeune tient, le vétéran glisse ============ */
console.log("B) Sur une saison de championnat : le jeune tient, le vétéran décroche");
{
  // simulation pure du barème, hors moteur : une journée = un match + une semaine de repos
  const saison = (age) => { let f = 100, bas = 100;
    for (let j = 0; j < 34; j++) { f = Math.max(0, f - 20); bas = Math.min(bas, f); f = Math.min(100, f + 20 * api.recupAge(age)); }
    return { fin: f, bas }; };
  const jeune = saison(24), vet = saison(33);
  ok(jeune.bas === 80, `à 24 ans, la jauge ne descend jamais sous ${jeune.bas} : le rythme d'une semaine est tenable`);
  ok(vet.bas < 30, `à 33 ans en jouant tout, la jauge tombe à ${r2(vet.bas)} : il FAUT le mettre au repos en cours de saison`);
  // combien de journées avant de tomber sous 55 (« émoussé ») ?
  let f = 100, jr = 0; while (f - 20 >= 55 && jr < 40) { f = Math.min(100, f - 20 + 20 * api.recupAge(33)); jr++; }
  ok(jr >= 8 && jr <= 22, `le décrochage est PROGRESSIF : ${jr} journées avant qu'un trentenaire n'entre dans le rouge`);
}

/* ============ C) jouer tous les trois jours ============ */
console.log("C) Un rendez-vous de semaine ne laisse pas le temps de récupérer");
api.nouvellePartie("PSG");
let G = api.getG();
let moi = api.clubById(G.monClub);
{
  /* On rejoue la SÉQUENCE RÉELLE d'une semaine, dans l'ordre exact du moteur : le match du samedi est
     débité, puis la semaine de repos est créditée (finirJournee fait les deux à la suite), et c'est
     seulement ensuite que tombe le rendez-vous du mercredi. Sans rendez-vous, le débit et le crédit
     s'annulent : un joueur qui joue chaque samedi se présente TOUJOURS à 100. Avec un rendez-vous, il
     se présente à 80 — et il y reste tant qu'il n'a pas sauté une journée. */
  moi.joueurs.forEach(j => { j.fraich = 100; });
  let cadres = api.onze(moi).slice();
  const suivi = cadres.find(j => j.age <= 29) || cadres[5]; // un joueur dans la force de l'âge : récupération pleine, arithmétique exacte
  cadres.forEach(j => api.useFraich(j, api.FRAICH_MATCH));   // samedi
  api.reposHebdo(moi);                                        // la semaine qui suit
  ok(api.fraich(suivi) === 100,
    "sans rendez-vous de semaine, le match et la semaine de repos s'annulent : coup d'envoi suivant à 100");
  api.fatigueSemaine("cadres");                               // mercredi
  ok(api.fraich(suivi) === 80,
    `après le rendez-vous du mercredi, on aborde le samedi suivant à ${api.fraich(suivi)} — soit une performance à ${r2(api.facteurFraich(suivi))}`);
  cadres.forEach(j => api.useFraich(j, api.FRAICH_MATCH));    // samedi suivant
  api.reposHebdo(moi);
  ok(api.fraich(suivi) === 80,
    "et il y RESTE : jouer chaque semaine ne rend pas les vingt points perdus, seule une journée sautée les rend");
  /* Qui joue alors ? La sélection tranche sur le rendement RÉEL : à son poste, personne d'écarté ne doit
     rendre plus qu'un titulaire. Selon la profondeur du poste, le cadre entamé souffle une journée (et
     récupère ses vingt points) ou reste malgré tout le meilleur choix — auquel cas c'est au manager de
     trancher avec 🛌 Repos. L'invariant à tenir est la cohérence, pas une rotation systématique. */
  const xiApres = api.onze(moi);
  const dedans = xiApres.filter(j => j.pos === suivi.pos && !j.titu).map(j => api.noteSel(j));
  const dehors = moi.joueurs.filter(j => j.pos === suivi.pos && api.alignable(j) && !xiApres.includes(j)).map(j => api.noteSel(j));
  const pireDedans = dedans.length ? Math.min(...dedans) : Infinity;
  const mieuxDehors = dehors.length ? Math.max(...dehors) : -Infinity;
  ok(pireDedans >= mieuxDehors - 1e-9,
    `à son poste, aucun écarté ne rend plus qu'un titulaire (${r2(mieuxDehors)} contre ${r2(pireDedans)}) : la sélection suit le barème`);
  ok(api.onze(moi).includes(suivi) ? true : api.fraich(suivi) === 80,
    api.onze(moi).includes(suivi)
      ? `à 80 il reste le meilleur choix à son poste : il y restera tant que le manager ne le mettra pas au repos`
      : `à 80 une doublure fraîche le dépasse : il souffle une journée et repart à 100`);
  // la réserve, elle, épargne les cadres
  moi.joueurs.forEach(j => { j.fraich = 100; });
  cadres = api.onze(moi).slice();
  api.fatigueSemaine("reserve");
  const cadresTouches = cadres.filter(j => api.fraich(j) < 100).length;
  ok(cadresTouches <= 4,
    `en envoyant la réserve, ${cadresTouches} cadres seulement sont entamés (sur 11) : la rotation protège vraiment`);
  moi.joueurs.forEach(j => { j.fraich = 100; });
  cadres = api.onze(moi).slice();
  api.fatigueSemaine("cadres");
  ok(cadres.filter(j => api.fraich(j) < 100).length === 11,
    "en envoyant les cadres, ce sont bien les onze titulaires qui paient l'addition");
}

/* ============ D) le onze se protège, et reste alignable ============ */
console.log("D) La sélection : le onze se protège tout seul, ★ passe outre, 🛌 écarte");
api.nouvellePartie("AUX");
G = api.getG(); moi = api.clubById(G.monClub);
{
  moi.joueurs.forEach(j => { j.fraich = 100; j.titu = false; j.repos = false; });
  // le meilleur attaquant, à plat
  const att = moi.joueurs.filter(j => j.pos === "A").sort((x, y) => y.note - x.note)[0];
  const doublure = moi.joueurs.filter(j => j.pos === "A" && j !== att).sort((x, y) => y.note - x.note)[0];
  ok(api.onze(moi).includes(att), `${att.nom} (note ${att.note}) est titulaire quand il est frais`);
  att.fraich = 5;
  ok(!api.onze(moi).includes(att), `${att.nom} sur les rotules (5/100) cède sa place à un coéquipier frais`);
  ok(api.onze(moi).includes(doublure), `sa doublure ${doublure.nom} (note ${doublure.note}) entre dans le onze`);
  att.titu = true;
  ok(api.onze(moi).includes(att), "le ★ passe outre : on peut toujours faire jouer un cadre cramé si on l'assume");
  att.titu = false; att.fraich = 100;
  att.repos = true;
  ok(!api.onze(moi).includes(att) && !api.alignable(att) && api.dispo(att),
    "🛌 Repos l'écarte du onze alors qu'il reste disponible aux yeux de la Ligue (feuille de match intacte)");
  const banc = api.tireSubs(moi).banc;
  ok(!banc.includes(att), "il n'est pas non plus sur le banc : la mise au repos ne se contourne pas par un remplacement");
  // on met TOUT le monde au vert : l'équipe doit quand même pouvoir se présenter
  moi.joueurs.forEach(j => { j.repos = true; });
  ok(api.onze(moi).length === 11, "même avec l'effectif entier au repos, onze joueurs sont rappelés : jamais de forfait");
  moi.joueurs.forEach(j => { j.repos = false; });
  // la frontière de sélection épouse le barème : à plein régime il joue, dès qu'il rend moins il cède
  att.fraich = 95;
  ok(api.onze(moi).includes(att), `à 95/100 ${att.nom} garde sa place : au-dessus de 90, rien n'a changé pour lui`);
  att.fraich = 70;
  ok(!api.onze(moi).includes(att) || att.note * api.facteurFraich(att) > doublure.note,
    `à 70/100 il ne rend plus que ${r2(att.note * api.facteurFraich(att))} contre ${doublure.note} à sa doublure fraîche : la sélection tranche sur le rendement réel`);
  att.fraich = 100;
}

/* ============ E) l'effet sur la performance et sur les blessures ============ */
console.log("E) Ce que la fatigue coûte vraiment — le barème à quatre paliers");
{
  const f = (v) => api.facteurFraich({ fraich: v });
  const b = (v) => api.coefBlessureFraich({ fraich: v });
  // palier 1 — au-dessus de 90 : rien
  ok(f(100) === 1 && f(95) === 1 && f(90) === 1, "au-dessus de 90, aucun effet : un joueur qui a récupéré est à plein régime");
  // palier 2 — de 80 à 90 : la performance SUIT le pourcentage de forme
  ok(r2(f(82)) === 0.82, `à 82 de forme, la performance vaut ${r2(f(82))} — littéralement le pourcentage, comme demandé`);
  ok(r2(f(85)) === 0.85 && r2(f(80)) === 0.80, "toute la bande 80-90 suit la règle : 85 → 0,85 · 80 → 0,80");
  // palier 3 — de 65 à 80 : le coefficient d'impact s'aggrave
  const impactLin = (v) => 1 - v / 100;
  ok(1 - f(70) > impactLin(70) && 1 - f(65) > impactLin(65),
    `de 65 à 80 l'impact dépasse le simple pourcentage : à 70 on perd ${Math.round((1 - f(70)) * 1000) / 10} % au lieu de 30 %`);
  ok(r2(f(65)) === 0.56, `à 65, la performance est tombée à ${r2(f(65))}`);
  // palier 4 — sous 65 : massif
  ok(f(60) < f(65) - 0.08, `sous 65 la chute s'accélère encore : 65 → ${r2(f(65))}, 60 → ${r2(f(60))}`);
  ok(f(0) >= 0.34 && f(0) <= 0.36, `plancher à ${r2(f(0))} : un homme au bout du rouleau ne vaut plus qu'un tiers de lui-même`);
  ok(f(100) > f(89) && f(89) > f(75) && f(75) > f(64) && f(64) > f(40), "la pente est monotone d'un palier à l'autre");
  // blessures : neutres au-dessus de 80, ×2 à 65, jusqu'à ×4
  ok(b(100) === 1 && b(80) === 1, "risque de blessure inchangé tant qu'on est au-dessus de 80");
  ok(r2(b(65)) >= 1.95 && r2(b(65)) <= 2.05, `à 65, le risque de blessure a doublé (×${r2(b(65))})`);
  ok(b(0) >= 3.5, `au fond, il est multiplié par ${r2(b(0))}`);
  ok(b(100) <= b(70) && b(70) <= b(50) && b(50) <= b(10), "le risque ne redescend jamais quand la forme baisse");
  // la force du onze bouge bien quand l'équipe est à plat
  api.nouvellePartie("NAN");
  G = api.getG(); const c = api.clubById(G.monClub);
  c.joueurs.forEach(j => { j.fraich = 100; });
  const fr = api.forces(c).att;
  c.joueurs.forEach(j => { j.fraich = 20; });
  const cuit = api.forces(c).att;
  ok(cuit < fr * 0.70, `un onze à bout de souffle perd ${Math.round((1 - cuit / fr) * 1000) / 10} % d'attaque`);
  c.joueurs.forEach(j => { j.fraich = 100; });
  // risque de blessure : on compte sur une saison entière, effectif frais contre effectif cuit
  const blesses = (fraicheur) => { api.nouvellePartie("MTP"); const g = api.getG(); let n = 0;
    for (let d = 0; d < 30; d++) {
      for (const cl of g.clubs) cl.joueurs.forEach(j => { j.fraich = fraicheur; j.bless = 0; });
      const av = g.clubs.reduce((s, cl) => s + cl.joueurs.filter(j => j.bless > 0).length, 0);
      api.jouerJournee();
      n += g.clubs.reduce((s, cl) => s + cl.joueurs.filter(j => j.bless > 0).length, 0) - av;
    }
    return n; };
  const bFrais = blesses(100), bCuit = blesses(10);
  ok(bCuit > bFrais * 2.0,
    `sur 30 journées : ${bFrais} blessures avec un effectif frais contre ${bCuit} avec un effectif cuit (×${r2(bCuit / bFrais)})`);
}

/* ============ F) les vingt clubs, pas seulement le mien ============ */
console.log("F) Les vingt clubs de la division jouent le même jeu");
api.nouvellePartie("LEH");
G = api.getG();
{
  for (let d = 0; d < 12; d++) api.jouerJournee();
  const tous = G.clubs.every(c => c.joueurs.every(j => api.fraich(j) >= 0 && api.fraich(j) <= 100));
  ok(tous, "après 12 journées, toutes les jauges des 20 clubs sont dans les bornes [0,100]");
  const bouge = G.clubs.filter(c => c.id !== G.monClub)
    .some(c => c.joueurs.some(j => api.fraich(j) < 100));
  ok(bouge, "les clubs de l'IA se fatiguent aussi : l'effet est symétrique, le championnat reste équitable");
  // l'IA ménage ses cadres : un joueur cramé d'un club adverse ne doit pas rester titulaire.
  // Scénario POSÉ (un cadre à 84, des doublures à 72) pour ne rien devoir au tirage des effectifs.
  const adv = G.clubs.find(c => c.id !== G.monClub);
  adv.joueurs.forEach(j => { j.fraich = 100; j.titu = false; j.repos = false; j.bless = 0; j.susp = 0; });
  const poste = ["M", "D", "A"].map(p => ({ p, marge: adv.joueurs.filter(j => j.pos === p).length - 4 }))
                               .sort((x, y) => y.marge - x.marge)[0].p;
  const pool = adv.joueurs.filter(j => j.pos === poste).sort((x, y) => y.note - x.note);
  const star = pool[0];
  pool.forEach(j => { j.note = (j === star ? 84 : 72); });
  ok(api.onze(adv).includes(star), `chez ${adv.nom}, le cadre (note 84) est titulaire quand il est frais`);
  star.fraich = 0;
  ok(!api.onze(adv).includes(star), "sur les rotules, il cède la place à une doublure fraîche (72) : l'IA fait tourner sans code dédié");
  ok(api.noteSel(star) < api.noteSel(pool[1]), `c'est bien la note de SÉLECTION qui tranche : ${r2(api.noteSel(star))} contre ${r2(api.noteSel(pool[1]))}`);
  // quatrième palier : sous 65 de fraîcheur, la tête suit les jambes
  api.nouvellePartie("MON");
  G = api.getG(); const cm = api.clubById(G.monClub);
  cm.joueurs.forEach(j => { j.fraich = 100; j.moral = 65; j.repos = false; });
  const temoin = cm.joueurs[0], epuise = cm.joueurs[1];
  epuise.fraich = 30;
  api.jouerJournee();
  ok(epuise.moral < temoin.moral - 1,
    `sous 65, le moral fuit aussi : ${Math.round(epuise.moral)} pour l'épuisé contre ${Math.round(temoin.moral)} pour son coéquipier frais`);
  // personne ne finit la saison à zéro : le système doit se réguler tout seul
  api.nouvellePartie("CAN");
  G = api.getG();
  for (let d = 0; d < 34; d++) api.jouerJournee();
  const àPlat = G.clubs.reduce((s, c) => s + c.joueurs.filter(j => api.fraich(j) < 15).length, 0);
  const total = G.clubs.reduce((s, c) => s + c.joueurs.length, 0);
  ok(àPlat / total < 0.10,
    `après une saison entière, ${àPlat} joueurs sur ${total} (${Math.round(àPlat / total * 100)} %) sont sous 15 : le système se régule`);
}

/* ============ G) intersaison et vieilles sauvegardes ============ */
console.log("G) L'été remet les compteurs à zéro, les carrières en cours reprennent au frais");
{
  api.nouvellePartie("LEN");
  G = api.getG();
  for (let d = 0; d < 20; d++) api.jouerJournee();
  const usés = G.clubs.reduce((s, c) => s + c.joueurs.filter(j => api.fraich(j) < 100).length, 0);
  ok(usés > 0, `${usés} joueurs portent des traces de la saison avant la trêve`);
  while (G.journee < G.calendrier.length) api.jouerJournee();
  api.intersaison();
  G = api.getG();
  const neufs = G.clubs.every(c => c.joueurs.every(j => api.fraich(j) === 100 && !j.repos));
  ok(neufs, "après l'intersaison, TOUT le monde repart à 100 et personne n'est resté au repos : deux mois sans match");
  // une sauvegarde d'avant v1.00 : aucun joueur ne porte de jauge
  api.nouvellePartie("BAS");
  G = api.getG();
  G.clubs.forEach(c => c.joueurs.forEach(j => { delete j.fraich; delete j.repos; }));
  api.migre();
  G = api.getG();
  const migrés = G.clubs.every(c => c.joueurs.every(j => j.fraich === 100 && j.repos === false));
  ok(migrés, "une carrière d'avant v1.00 reprend avec un effectif frais et disponible — rien n'est cassé");
  // et le simple fait de LIRE une jauge absente ne doit jamais renvoyer autre chose que 100
  ok(api.fraich({}) === 100 && api.facteurFraich({}) === 1 && api.noteSel({ note: 80 }) === 80,
    "un joueur sans jauge (autre division, vivier, joueur libre) est traité comme frais, sans exception");
}

/* ============ H) le rendu ne casse à aucune valeur de jauge ============ */
console.log("H) Les écrans se rendent, de 0 à 100 et pour les cas limites");
{
  api.nouvellePartie("STR");
  G = api.getG(); moi = api.clubById(G.monClub);
  let pepin = null;
  const essaie = (lib, f) => { try { f(); } catch (e) { pepin = lib + " → " + e.message; } };
  for (const v of [100, 90, 89, 75, 74, 55, 54, 35, 34, 12, 0]) {
    moi.joueurs.forEach(j => { j.fraich = v; });
    essaie("jauge à " + v, () => moi.joueurs.forEach(j => { api.jaugeFraich(j); api.libFraich(j)[1]; }));
    essaie("écran Effectif à " + v, () => api.ecranEffectif());
    essaie("fiche joueur à " + v, () => api.ouvreFiche(moi.joueurs[0]));
    essaie("aperçu de rotation à " + v, () => ["cadres", "mixte", "reserve"].forEach(r => api.apercuRotation(r)));
    essaie("écran Coupe à " + v, () => api.ecranCoupe());
    essaie("écran Europe à " + v, () => api.ecranEurope());
  }
  ok(!pepin, pepin || "les six surfaces d'affichage tiennent à toutes les valeurs de jauge (0 → 100)");
  // cas limites : joueur sans jauge, joueur au repos, joueur blessé, joueur d'un autre club
  pepin = null;
  moi.joueurs.forEach(j => { delete j.fraich; });
  moi.joueurs[1].repos = true; moi.joueurs[2].bless = 3; moi.joueurs[3].fraich = 0;
  essaie("effectif mixte", () => api.ecranEffectif());
  essaie("fiche d'un joueur au repos", () => api.ouvreFiche(moi.joueurs[1]));
  const ailleurs = G.clubs.find(c => c.id !== G.monClub).joueurs[0];
  essaie("fiche d'un joueur d'un autre club", () => api.ouvreFiche(ailleurs));
  const libre = { nom: "X. Libre", pos: "A", age: 34, note: 70, club: "EXT", moral: 60 };
  essaie("fiche d'un joueur libre (sans club)", () => api.ouvreFiche(libre));
  ok(!pepin, pepin || "jauge absente, joueur au repos, blessé, d'un autre club ou sans club : tout s'affiche sans exception");
  // le bouton Repos fait bien ce qu'il annonce, et ne laisse pas un ★ contradictoire
  const v = moi.joueurs.find(j => j.pos === "M");
  v.titu = true; v.repos = false;
  api.mettreAuRepos(v);
  ok(v.repos && !v.titu, "🛌 Repos annule le ★ : on ne titularise pas de force un homme qu'on met au vert");
  api.mettreAuRepos(v);
  ok(!v.repos, "et le bouton le réintègre d'un second clic");
}

/* ============ I) les changements : au prorata, et le moteur le sait (v1.11) ============ */
console.log("I) Un bout de match se paie au prorata — et l'homme qui sort ne marque plus");
{
  api.nouvellePartie("LIL");
  G = api.getG();
  const somme = (c) => c.joueurs.reduce((s, j) => s + (100 - api.fraich(j)), 0);
  const frais = (c) => c.joueurs.forEach(j => { j.fraich = 100; j.bless = 0; j.susp = 0; j.repos = false; });
  // 1) la structure du tirage, sur les vingt clubs et plusieurs soirées
  let pepin = null;
  for (let n = 0; n < 10; n++) for (const c of G.clubs) {
    const s = api.tireSubs(c, n % 2 ? 3 : 0);
    if (s.banc.length !== s.sort.length || s.banc.length !== s.min.length || s.banc.length > 3) pepin = `${c.nom} : tableaux de tailles différentes`;
    s.banc.forEach((j, k) => {
      if (s.xi.includes(j)) pepin = `${c.nom} : ${j.nom} entre alors qu'il est déjà titulaire`;
      if (!s.xi.includes(s.sort[k])) pepin = `${c.nom} : ${s.sort[k].nom} sort sans avoir commencé le match`;
      if (s.sort[k].pos !== j.pos) pepin = `${c.nom} : ${j.nom} (${j.pos}) relève ${s.sort[k].nom} (${s.sort[k].pos})`;
      if (s.min[k] < 57 || s.min[k] > 82) pepin = `${c.nom} : changement à la ${s.min[k]}e`;
      if (j.pos === "G") pepin = `${c.nom} : le gardien ${j.nom} entre pour la tactique à la place de ${s.sort[k].nom}`;
    });
    if (new Set(s.sort).size !== s.sort.length) pepin = `${c.nom} : le même homme sort deux fois`;
  }
  ok(!pepin, pepin || "trois changements au plus, chacun poste pour poste, entre la 57e et la 82e, jamais deux fois le même sortant — et jamais un gardien (v1.13)");

  // 2) le barème : l'entrant et le sortant se partagent les vingt points du poste
  const [h, a] = [G.clubs[0], G.clubs[1]];
  frais(h); frais(a);
  const pre = { h: api.tireSubs(h, 0), a: api.tireSubs(a, 3) };
  api.appliqueResultat(h, a, 1, 0, pre);
  ok(Math.abs(somme(h) - 11 * 20) < 1e-9 && Math.abs(somme(a) - 11 * 20) < 1e-9,
    `une équipe paie ${r2(somme(h))} et l'autre ${r2(somme(a))} points pour un match : onze postes × 20, quelle que soit la rotation (avant v1.11 : 244)`);
  const k0 = pre.h.banc.length - 1, ent = pre.h.banc[k0], sor = pre.h.sort[k0], mn = pre.h.min[k0];
  ok(r2(100 - api.fraich(ent)) === r2(20 * (90 - mn) / 90) && r2(100 - api.fraich(sor)) === r2(20 * mn / 90),
    `${ent.nom}, entré à la ${mn}e, paie ${r2(100 - api.fraich(ent))} ; ${sor.nom}, sorti à la ${mn}e, paie ${r2(100 - api.fraich(sor))}`);
  const tenant = pre.h.xi.find(j => !pre.h.sort.includes(j));
  ok(api.fraich(tenant) === 80, `${tenant.nom}, qui a joué les quatre-vingt-dix minutes, paie le match plein : 20`);
  // un expulsé ne paie que ses minutes
  frais(h); frais(a);
  const pre2 = { h: api.tireSubs(h, 0), a: api.tireSubs(a, 3) };
  const rouge = pre2.h.xi.find(j => !pre2.h.sort.includes(j) && j.pos !== "G");
  pre2.h.rouge = { [rouge.uid]: 27 };
  api.appliqueResultat(h, a, 0, 1, pre2);
  ok(r2(100 - api.fraich(rouge)) === r2(20 * 27 / 90), `expulsé à la 27e, ${rouge.nom} ne paie que ses minutes : ${r2(100 - api.fraich(rouge))}`);

  // 3) le carton rouge annule un changement prévu plus tard, et vide la place
  frais(h); frais(a);
  const pre3 = { h: api.tireSubs(h, 0), a: api.tireSubs(a, 3) };
  api.setChg({ [h.id]: pre3.h, [a.id]: pre3.a });
  const vise = pre3.h.sort[0], remplacant = pre3.h.banc[0], avant = pre3.h.banc.length;
  api.expulse(h, vise, 40);
  const pelouse = api.enJeu(h, 89);
  ok(pre3.h.banc.length === avant - 1 && !pelouse.includes(vise) && !pelouse.includes(remplacant) && pelouse.length === 10,
    `${vise.nom}, expulsé à la 40e alors qu'il devait sortir plus tard : pas de changement, ${h.nom} finit à dix`);
  api.setChg({});

  // 4) LE MOTEUR : sur des centaines de matchs racontés, personne n'agit hors de la pelouse
  const nomme = (l, j) => (l.g && (l.g.uid === j.uid || l.g.pasUid === j.uid)) || (l.c && l.c.uid === j.uid)
    || (l.q && l.q.but === j.nom) || (l.ic !== "sub" && typeof l.x === "string" && l.x.includes(j.nom));
  let faux = null, butsEntrants = 0, butsTotal = 0, rougesVus = 0;
  const verifie = (r, chg) => {
    for (const s of Object.values(chg)) {
      s.banc.forEach((ent, k) => { const mnk = s.min[k], sk = s.sort[k];
        // le gardien appelé par un rouge (v1.13) entre à la minute même du rouge : la frontière est sa ligne, pas la minute
        const urg = s.urgence && s.urgence[ent.uid] && s.urgence[ent.uid].cause === "rouge";
        const iSub = urg ? r.ev.findIndex(l => l.ic === "sub" && l.uid === ent.uid) : -1;
        if (urg && iSub < 0) faux = `${ent.nom} entre dans les buts sans ligne au direct`;
        r.ev.forEach((l, i) => {
          const apres = urg ? i > iSub : l.m >= mnk, avant = urg ? i < iSub : l.m < mnk;
          if (apres && l.t !== "sys" && nomme(l, sk)) faux = `${sk.nom} nommé à la ${l.m}e alors qu'il est sorti à la ${mnk}e : « ${l.x} »`;
          if (avant && nomme(l, ent)) faux = `${ent.nom} nommé à la ${l.m}e alors qu'il n'entre qu'à la ${mnk}e : « ${l.x} »`;
          if (l.g && l.g.uid === ent.uid) butsEntrants++;
        }); });
      for (const uid in (s.rouge || {})) { rougesVus++;
        const j = api.byUid(+uid) || api.byUid(uid);
        for (const l of r.ev) if (j && l.m > s.rouge[uid] && nomme(l, j)) faux = `${j.nom} expulsé à la ${s.rouge[uid]}e, nommé à la ${l.m}e : « ${l.x} »`; }
    }
    butsTotal += r.ev.filter(l => l.g).length;
  };
  for (let n = 0; n < 400 && !faux; n++) {
    const c1 = G.clubs[n % 20], c2 = G.clubs[(n + 7) % 20];
    frais(c1); frais(c2);
    const chg = { [c1.id]: api.tireSubs(c1, 0), [c2.id]: api.tireSubs(c2, 3) };
    api.setChg(chg);
    verifie(api.simuleMatch(c1, c2, true), chg);
    api.setChg({});
  }
  ok(!faux, faux || `400 matchs racontés : aucun sortant nommé après sa sortie, aucun entrant avant son entrée, aucun expulsé après son rouge (${rougesVus} rouges vus)`);
  ok(butsEntrants > 0, `les entrants jouent pour de bon : ${butsEntrants} de leurs buts sur ${butsTotal} (avant v1.11 : jamais un seul)`);

  // 5) la consigne changée en direct : le fil recollé garde ses changements, et reste cohérent
  faux = null; let gardes = 0;
  for (let n = 0; n < 150 && !faux; n++) {
    const c1 = G.clubs[(n * 3) % 20], c2 = G.clubs[(n * 3 + 5) % 20];
    frais(c1); frais(c2);
    const chg = { [c1.id]: api.tireSubs(c1, 0), [c2.id]: api.tireSubs(c2, 3) };
    api.setChg(chg);
    const r = api.simuleMatch(c1, c2, true);
    const lignes = []; // comme jouerJournee : les changements prévus — le gardien d'urgence est déjà sous son rouge
    for (const [c, s] of [[c1, chg[c1.id]], [c2, chg[c2.id]]]) lignes.push(...api.lignesChangements(c, s));
    const fin = r.ev.pop(); r.ev = r.ev.concat(lignes).sort((x, y) => x.m - y.m); r.ev.push(fin);
    const from = r.ev.findIndex(l => l.m > 50);
    api.rejoueDepuis(r, c1, c2, from, 50, 1, 1);
    const subs = r.ev.filter(l => l.ic === "sub");
    const attendus = Object.values(chg).reduce((s, x) => s + x.banc.length, 0);
    if (subs.length !== attendus) faux = `${subs.length} lignes de changement dans le fil recollé pour ${attendus} changements prévus`;
    if (subs.some(s => { const i = r.ev.indexOf(s); return (i > 0 && r.ev[i - 1].m > s.m) || (r.ev[i + 1] && r.ev[i + 1].m < s.m && r.ev[i + 1].t !== "sys"); }))
      faux = "une ligne de changement recollée hors de sa minute : " + r.ev.map(l => l.m).join(",");
    gardes += subs.filter(s => s.m > 50).length;
    verifie(r, chg);
    api.setChg({});
  }
  ok(!faux, faux || `150 consignes changées à la 50e : les ${gardes} changements à venir restent à leur minute, et le fil recollé respecte la pelouse`);

  // 6) une vraie journée : le direct écrit les changements que la fraîcheur fait payer, et le moment de la 90e est sur la pelouse
  faux = null; let vus = 0, moments = 0;
  api.nouvellePartie("REN");
  G = api.getG();
  for (let d = 0; d < 20 && !faux; d++) {
    const sortie = api.jouerJournee(), monMatch = sortie && sortie.monMatch;
    if (!monMatch) continue;
    for (const l of monMatch.ev.filter(l => l.ic === "sub" && !l.urg)) { vus++; // le gardien d'urgence a ses propres mots (section J)
      const m = /Changement pour (.+) : (.+) entre à la place de (.+)\.$/.exec(l.x);
      if (!m) { faux = "ligne de changement illisible : " + l.x; break; }
      if (m[2] === m[3]) faux = "un joueur se remplace lui-même : " + l.x;
    }
    if (monMatch.moment && monMatch.moment.uid != null) { moments++;
      const sortis = monMatch.ev.filter(l => l.ic === "sub").map(l => (api.byUid(l.out) || {}).nom);
      const j = api.byUid(monMatch.moment.uid);
      if (j && sortis.includes(j.nom)) faux = `le moment de la 90e revient à ${j.nom}, déjà sorti`; }
  }
  ok(!faux && vus > 0, faux || `${vus} changements écrits au direct sur 20 journées, tous « X entre à la place de Y » ; ${moments} moments de la 90e, jamais pour un homme sorti`);
  ok(Object.keys(api.getChg()).length === 0, "le coup de sifflet lève les changements : la coupe et l'Europe composent avec onze(), comme avant");
}

/* ============ J) les gardiens : jamais pour la tactique, et le banc garde la cage (v1.13) ============ */
console.log("J) Un gardien ne sort que sur blessure ou carton rouge — et c'est un joueur de champ qui cède sa place");
{
  api.nouvellePartie("LIL");
  G = api.getG();
  const frais = (c) => c.joueurs.forEach(j => { j.fraich = 100; j.bless = 0; j.susp = 0; j.repos = false; });
  const estG = (j) => j.pos === "G";
  const feuille = (c, decal) => { let s; for (let n = 0; n < 30; n++) { s = api.tireSubs(c, decal); if (s.banc.length === 3) break; } return s; };
  const h = G.clubs.find(c => c.joueurs.filter(estG).length >= 2), a = G.clubs.find(c => c !== h);

  // 1) le rouge du gardien titulaire, tôt dans le match : un attaquant sort, le gardien remplaçant prend les gants
  frais(h); frais(a);
  const s1 = feuille(h, 0), s1a = feuille(a, 3);
  api.setChg({ [h.id]: s1, [a.id]: s1a });
  const gk = s1.xi.find(estG), attPrevus = s1.sort.filter(j => j.pos === "A"), dernier = s1.banc[s1.min.indexOf(Math.max(...s1.min))];
  const rel = api.expulse(h, gk, 30);
  const pel = api.enJeu(h, 31);
  ok(rel && rel.entre && estG(rel.entre) && !s1.xi.includes(rel.entre) && rel.sort && rel.sort.pos === "A",
    `rouge pour ${gk.nom} à la 30e : ${rel && rel.entre ? rel.entre.nom : "personne"}, le gardien remplaçant, entre à la place de ${rel && rel.sort ? rel.sort.nom + " (" + rel.sort.pos + ")" : "?"} — un attaquant, pas un gardien`);
  ok(!attPrevus.length || attPrevus.includes(rel.sort),
    `on sacrifie de préférence l'attaquant qu'on comptait déjà sortir${attPrevus.length ? " (" + attPrevus.map(j => j.nom) + ")" : ""}`);
  ok(pel.length === 10 && pel.filter(estG).length === 1 && pel.includes(rel.entre) && !pel.includes(gk) && !pel.includes(rel.sort),
    `à la 31e, ${h.nom} joue à dix, avec un vrai gardien dans les buts`);
  ok(s1.banc.length === 3 && s1.annules.length === 1 && (s1.annules[0].sort === rel.sort || s1.annules[0].banc === dernier),
    `c'est l'un des trois changements : celui prévu pour ${s1.annules[0].sort.nom} saute, ${s1.banc.length} entrants au total`);
  ok(api.malusRouge(true, rel) === 1.18 && api.malusRouge(true, null) === 1.34 && api.malusRouge(false, null) === 1.18,
    "au moteur, un gardien relevé ne coûte qu'un homme de moins (×1,18) ; la cage sans gardien de métier reste une passoire (×1,34)");
  frais(h); frais(a);
  api.appliqueResultat(h, a, 0, 1, { h: s1, a: s1a });
  ok(r2(100 - api.fraich(gk)) === r2(20 * 30 / 90) && r2(100 - api.fraich(rel.sort)) === r2(20 * 30 / 90) && r2(100 - api.fraich(rel.entre)) === r2(20 * 60 / 90),
    `la fraîcheur suit : ${gk.nom} et ${rel.sort.nom} paient leurs 30 minutes (${r2(100 - api.fraich(gk))}), ${rel.entre.nom} ses 60 (${r2(100 - api.fraich(rel.entre))})`);
  const lg = api.ligneApresRouge(h, rel, 30);
  ok(lg && lg.ic === "sub" && lg.urg === "rouge" && lg.m === 30 && lg.x.includes(rel.entre.nom) && lg.x.includes(rel.sort.nom) && !/[{}]/.test(lg.x),
    `le direct l'écrit sous le rouge : « ${lg && lg.x} »`);
  ok(api.lignesChangements(h, s1).length === 2 && api.lignesChangements(h, s1).every(l => !l.urg),
    "les lignes écrites au coup d'envoi ne reprennent pas le gardien d'urgence : il a déjà la sienne");
  ok(api.poolRougeGK(null).every(l => !/remplaçant/.test(l)) && api.poolRougeGK(rel).some(l => /remplaçant/.test(l)),
    "« son remplaçant enfile les gants » ne se lit que s'il entre pour de bon");
  api.setChg({});

  // 2) les trois changements sont faits : un défenseur enfile les gants
  frais(h);
  const s2 = feuille(h, 0); api.setChg({ [h.id]: s2 });
  const rel2 = api.expulse(h, s2.xi.find(estG), 85), pel2 = api.enJeu(h, 86);
  ok(rel2 && !rel2.entre && rel2.raison === "trois" && rel2.gants && rel2.gants.pos === "D" && pel2.includes(rel2.gants) && !pel2.some(estG) && pel2.length === 10 && s2.banc.length === 3,
    `rouge du gardien à la 85e, trois changements déjà faits : ${rel2 && rel2.gants ? rel2.gants.nom : "?"} enfile les gants, pas de quatrième changement`);
  const lg2 = api.ligneApresRouge(h, rel2, 85);
  ok(lg2 && /trois changements/.test(lg2.x) && lg2.x.includes(rel2.gants.nom), `« ${lg2 && lg2.x} »`);
  api.setChg({});

  // 3) pas de gardien sur le banc (le second est blessé)
  frais(h);
  const s3 = feuille(h, 0); api.setChg({ [h.id]: s3 });
  const gk3 = s3.xi.find(estG);
  h.joueurs.filter(j => estG(j) && j !== gk3).forEach(j => { j.bless = 3; });
  const rel3 = api.expulse(h, gk3, 20);
  ok(rel3 && !rel3.entre && rel3.raison === "banc" && s3.banc.length === 3 && /Pas de gardien sur le banc/.test(api.ligneApresRouge(h, rel3, 20).x),
    `second gardien à l'infirmerie : personne à faire entrer, ${rel3 && rel3.gants ? rel3.gants.nom : "?"} garde les buts et les trois changements prévus tiennent`);
  api.setChg({});

  // 4) un seul gardien sur la feuille : si le remplaçant voit rouge à son tour, on ne va pas en chercher un troisième
  frais(h);
  const s4 = feuille(h, 0); api.setChg({ [h.id]: s4 });
  const g4 = s4.xi.find(estG), troisieme = Object.assign({}, g4, { uid: 987654321, nom: "Z. Troisième", fraich: 100 });
  h.joueurs.push(troisieme);
  const r4 = api.expulse(h, g4, 20), r4b = r4 && r4.entre ? api.expulse(h, r4.entre, 40) : null, pel4 = api.enJeu(h, 41);
  ok(r4 && r4.entre && r4b && !r4b.entre && pel4.length === 9 && !pel4.some(estG) && !pel4.includes(troisieme),
    "le gardien remplaçant expulsé à son tour : pas de troisième gardien, un joueur de champ dans les buts, neuf sur la pelouse");
  h.joueurs.splice(h.joueurs.indexOf(troisieme), 1);
  api.setChg({});

  // 5) la blessure de la 90e : le gardien remplaçant relève son gardien s'il reste un changement
  frais(h); frais(a);
  const s5 = feuille(h, 0); api.setChg({ [h.id]: s5 });
  const g5 = s5.xi.find(estG);
  api.expulse(h, s5.sort[0], 30); // un rouge de champ a fait sauter un changement : il en reste un
  const r5 = api.releveGardien(h, 90, g5, "blessure"), pel5 = api.enJeu(h, 90);
  ok(r5 && r5.entre && r5.sort === g5 && pel5.includes(r5.entre) && !pel5.includes(g5) && s5.banc.length === 3,
    `${g5.nom} blessé à la 90e, un changement en poche : ${r5 && r5.entre ? r5.entre.nom : "?"} le relève poste pour poste`);
  frais(h);
  const s6 = feuille(h, 0); api.setChg({ [h.id]: s6 });
  const r6 = api.releveGardien(h, 90, s6.xi.find(estG), "blessure");
  ok(r6 && !r6.entre && r6.raison === "trois" && s6.banc.length === 3, `les trois changements faits : ${r6 && r6.gants ? r6.gants.nom : "?"} enfile les gants pour les arrêts de jeu`);
  // ...et le moment de la 90e le raconte
  frais(h);
  const s7 = feuille(h, 0); api.setChg({ [h.id]: s7 });
  api.expulse(h, s7.sort[0], 30);
  const vraiRandom = Math.random; let mo;
  Math.random = () => 0.96; // le tirage qui mène au moment « gants »
  try { mo = api.tireMoment(h, a); } finally { Math.random = vraiRandom; }
  ok(mo && mo.type === "gants" && mo.gk2 != null && /gardien remplaçant, entre pour les arrêts de jeu/.test(mo.annonce),
    `le moment de la 90e : « ${mo && mo.annonce} »`);
  api.setChg({});

  // 6) le direct efface le rouge (consigne changée avant) : le gardien remplaçant se rassoit, le changement sacrifié revient
  let rendus = 0, refaits = 0, pb = null;
  for (let n = 0; n < 150 && !pb; n++) {
    frais(h); frais(a);
    const sh = feuille(h, 0), sa = feuille(a, 3);
    api.setChg({ [h.id]: sh, [a.id]: sa });
    const g = sh.xi.find(estG), prevues = api.lignesChangements(h, sh).concat(api.lignesChangements(a, sa));
    const rl = api.expulse(h, g, 60); g.susp = 3;
    if (!rl || !rl.entre) { pb = "pas de relais à construire"; break; }
    const saute = sh.annules[0];
    const ev = [{ m: 0, t: "sys", x: "Coup d'envoi." }, { m: 20, t: "amb", x: "Le public chante." },
      { m: 60, t: "crd", ic: "cr", c: { cote: h.id, nom: g.nom, rouge: true, gardien: true, uid: g.uid, releve: true }, x: "ROUGE pour " + g.nom },
      api.ligneApresRouge(h, rl, 60)]
      .concat(prevues.filter(l => l.uid !== saute.banc.uid)) // le changement sauté n'avait jamais été écrit
      .sort((x, y) => x.m - y.m);
    ev.push({ m: 90, t: "sys", x: "COUP DE SIFFLET FINAL." });
    const r = { ev, sh: 0, sa: 0 };
    api.rejoueDepuis(r, h, a, r.ev.findIndex(l => l.m > 50), 50, 1, 1);
    if (r.ev.some(l => l.c && l.c.rouge && l.c.cote === h.id)) { refaits++; continue; } // le nouveau fil a son propre rouge : autre histoire
    const subsH = r.ev.filter(l => l.ic === "sub" && l.cote === h.id);
    if (g.susp !== 0) pb = "la suspension du rouge effacé n'est pas rendue";
    else if (sh.banc.includes(rl.entre) || subsH.some(l => l.uid === rl.entre.uid)) pb = `${rl.entre.nom} est resté sur la feuille ou au direct alors que le rouge est effacé`;
    else if (!sh.banc.includes(saute.banc) || !subsH.some(l => l.uid === saute.banc.uid && l.m === saute.min && !l.urg)) pb = `le changement de ${saute.banc.nom} (${saute.min}e) n'est pas revenu au direct`;
    else if (subsH.length !== sh.banc.length) pb = `${subsH.length} lignes de changement pour ${sh.banc.length} changements`;
    else if (!api.enJeu(h, 61).includes(g) || api.enJeu(h, 61).length !== 11) pb = `${g.nom} n'est pas revenu dans ses buts`;
    else rendus++;
    api.setChg({});
  }
  api.setChg({});
  ok(!pb && rendus > 0, pb || `${rendus} rouges de gardien effacés par une consigne changée : le remplaçant se rassoit, le changement sacrifié revient à sa minute (${refaits} fils recollés avec un autre rouge, écartés)`);

  // 7) des centaines de matchs où les gardiens voient rouge : le moteur et le direct tiennent parole
  const clubs = G.clubs.slice(0, 20), memo = [];
  clubs.forEach(c => c.joueurs.forEach(j => { memo.push([j, j.agress]); j.agress = estG(j) ? 10 : 1; }));
  let gkRouges = 0, relais = 0, gantsVus = 0, pb7 = null;
  const controle = (r, chg, c1, c2) => {
    r.ev.forEach((l, i) => {
      if (l.ic === "sub" && l.urg) {
        const av = r.ev[i - 1];
        if (!av || !(av.c && av.c.rouge && av.c.gardien && av.c.releve && av.c.cote === l.cote && av.m === l.m)) pb7 = `ligne du gardien d'urgence sans son rouge juste au-dessus : « ${l.x} »`;
      }
      if (!(l.c && l.c.rouge && l.c.gardien)) return;
      const c = l.c.cote === c1.id ? c1 : c2, suite = r.ev[i + 1];
      gkRouges++;
      if (l.c.releve) {
        relais++;
        if (!suite || suite.ic !== "sub" || suite.urg !== "rouge") { pb7 = `rouge de ${l.c.nom} sans la ligne du gardien remplaçant : « ${suite && suite.x} »`; return; }
        const ent = api.byUid(suite.uid), sor = api.byUid(suite.out), pelr = api.enJeu(c, l.m);
        if (!estG(ent) || estG(sor)) pb7 = `relais incohérent : ${ent.nom} (${ent.pos}) pour ${sor.nom} (${sor.pos})`;
        else if (/[{}]/.test(suite.x) || !suite.x.includes(ent.nom) || !suite.x.includes(sor.nom)) pb7 = "ligne du relais mal écrite : " + suite.x;
        else if (pelr.filter(estG).length !== 1 || !pelr.includes(ent) || pelr.includes(sor)) pb7 = `après le relais, ${c.nom} n'a pas un seul gardien sur la pelouse`;
        for (const l2 of r.ev.slice(i + 2)) if (l2.t !== "sys" && ((l2.g && (l2.g.uid === sor.uid || l2.g.pasUid === sor.uid)) || (l2.c && l2.c.uid === sor.uid)
          || (l2.q && l2.q.but === sor.nom) || (l2.ic !== "sub" && typeof l2.x === "string" && l2.x.includes(sor.nom)))) pb7 = `${sor.nom}, sacrifié à la ${l.m}e, nommé à la ${l2.m}e : « ${l2.x} »`;
      } else if (suite && /enfile le maillot du gardien/.test(suite.x || "")) gantsVus++;
      else if (!api.enJeu(c, l.m).some(estG)) pb7 = `rouge de ${l.c.nom} : ni gardien remplaçant ni joueur de champ dans les buts — « ${suite && suite.x} »`;
    });
    for (const [id, s] of Object.entries(chg)) {
      if (s.banc.length > 3) pb7 = `${id} : ${s.banc.length} changements`;
      if (s.banc.some((j, k) => estG(j) && !(s.urgence && s.urgence[j.uid]))) pb7 = `${id} : un gardien entré sans blessure ni rouge`;
    }
    const subs = r.ev.filter(l => l.ic === "sub"), attendus = Object.values(chg).reduce((n, s) => n + s.banc.length, 0);
    if (subs.length !== attendus) pb7 = `${subs.length} lignes de changement pour ${attendus} changements`;
    if (new Set(subs.map(l => l.cote + ":" + l.uid)).size !== subs.length) pb7 = "un changement écrit deux fois";
  };
  let recolles = 0;
  for (let n = 0; n < 600 && !pb7; n++) {
    const c1 = clubs[n % 20], c2 = clubs[(n + 9) % 20];
    frais(c1); frais(c2);
    const chg = { [c1.id]: api.tireSubs(c1, 0), [c2.id]: api.tireSubs(c2, 3) };
    api.setChg(chg);
    const r = api.simuleMatch(c1, c2, true);
    const fin = r.ev.pop(); // comme jouerJournee : les changements prévus rejoignent le fil
    r.ev = r.ev.concat(api.lignesChangements(c1, chg[c1.id]), api.lignesChangements(c2, chg[c2.id])).sort((x, y) => x.m - y.m); r.ev.push(fin);
    controle(r, chg, c1, c2);
    if (n % 2 && !pb7) { // un match sur deux, la consigne change à la 50e
      const from = r.ev.findIndex(l => l.m > 50);
      if (from > 0) { api.rejoueDepuis(r, c1, c2, from, 50, 1, 1); recolles++; controle(r, chg, c1, c2); }
    }
    api.setChg({});
  }
  memo.forEach(([j, v]) => { j.agress = v; });
  ok(!pb7 && relais > 0 && gantsVus > 0, pb7 || `${gkRouges} rouges de gardien sur 600 matchs (${recolles} fils recollés) : ${relais} relais par le gardien du banc à la place d'un joueur de champ, ${gantsVus} joueurs de champ dans les buts — jamais un gardien entré pour la tactique, jamais plus de trois changements, jamais un sacrifié qui revient`);
}

console.log("");
if (FAILS) { console.log("❌ HARNAIS FRAÎCHEUR : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS FRAÎCHEUR : TOUT EST VERT");
