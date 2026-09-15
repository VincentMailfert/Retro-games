/* Harnais headless — LA FRAÎCHEUR, ÉTAT DE FORME PHYSIQUE (v1.00)
   Vérifie le système de fatigue joueur par joueur demandé par l'auteur :
   A) le barème de base : un match coûte 20, une semaine en rend 20 — un joueur dans la force de
      l'âge repart toujours de 100 le samedi suivant, un vétéran non (98 à 33 ans, puis ça glisse)
   B) le vétéran se dégrade de match en match sur une saison complète, le jeune jamais
   C) jouer tous les trois jours (rendez-vous de semaine) creuse la jauge pour de bon
   D) le onze se protège tout seul : un cadre sur les rotules cède sa place, ★ passe outre,
      🛌 Repos l'écarte, et l'équipe reste alignable même si l'on met tout le monde au vert
   E) la fatigue pèse sur la performance et sur le risque de blessure, dans les proportions annoncées
   F) les VINGT clubs de la division sont concernés, pas seulement le vôtre — et l'IA fait tourner
   G) l'intersaison remet tout le monde à neuf, et une vieille sauvegarde reprend avec un effectif frais
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
  "fraich,useFraich,reposHebdo,recupAge,recupJoueur,facteurFraich,noteSel,libFraich,jaugeFraich,fatigueSemaine," +
  "apercuRotation,ecranEffectif,ouvreFiche,ecranCoupe,ecranEurope,mettreAuRepos," +
  "dispo,alignable,tireSubs,FRAICH_MATCH,FRAICH_BANC,FRAICH_SEM,getG:function(){return G;},setG:function(x){G=x;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const r2 = (x) => Math.round(x * 100) / 100;

/* ============ A) le barème de base ============ */
console.log("A) Le barème : −20 par match, +20 par semaine, moins après 29 ans");
ok(api.FRAICH_MATCH === 20 && api.FRAICH_BANC === 8 && api.FRAICH_SEM === 20,
  `constantes conformes à la consigne : match ${api.FRAICH_MATCH}, banc ${api.FRAICH_BANC}, semaine ${api.FRAICH_SEM}`);
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
  const cible = api.onze(moi)[5];
  const avant = api.fraich(cible);
  // deux matchs dans la même semaine : le championnat du samedi, puis le rendez-vous du mercredi
  api.useFraich(cible, api.FRAICH_MATCH);
  api.fatigueSemaine("cadres");
  const apres = api.fraich(cible);
  ok(apres <= avant - 35,
    `deux matchs en une semaine coûtent ${r2(avant - apres)} points, pour une seule semaine de repos (${api.FRAICH_SEM}) en face`);
  api.reposHebdo(moi);
  ok(api.fraich(cible) < avant,
    `même après la semaine de repos, il reste ${r2(avant - api.fraich(cible))} points de déficit : le rythme n'est pas tenable`);
  // la réserve, elle, épargne les cadres
  moi.joueurs.forEach(j => { j.fraich = 100; });
  const cadres = api.onze(moi).slice();
  api.fatigueSemaine("reserve");
  const cadresTouches = cadres.filter(j => api.fraich(j) < 100).length;
  ok(cadresTouches <= 4,
    `en envoyant la réserve, ${cadresTouches} cadres seulement sont entamés (sur 11) : la rotation protège vraiment`);
  moi.joueurs.forEach(j => { j.fraich = 100; });
  api.fatigueSemaine("cadres");
  ok(api.onze(moi).filter(j => api.fraich(j) < 100).length >= 8,
    "en envoyant les cadres, ce sont bien les titulaires qui paient l'addition");
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
  // un cadre entamé mais pas cramé garde sa place : la rotation ne part pas en vrille
  att.fraich = 70;
  ok(api.onze(moi).includes(att), `à 70/100 ${att.nom} garde sa place : un tiré n'est pas un remplacé`);
  att.fraich = 100;
}

/* ============ E) l'effet sur la performance et sur les blessures ============ */
console.log("E) Ce que la fatigue coûte vraiment");
{
  const f = (v) => api.facteurFraich({ fraich: v });
  ok(f(100) === 1 && f(85) === 1, "au-dessus de 85, aucun effet : on ne punit pas un joueur simplement parce qu'il a joué");
  ok(f(60) < 1 && f(60) > 0.95, `à 60 (émoussé) : ${Math.round((1 - f(60)) * 1000) / 10} % de rendement en moins`);
  ok(f(35) < 0.94 && f(35) > 0.88, `à 35 (jambes lourdes) : ${Math.round((1 - f(35)) * 1000) / 10} % en moins`);
  ok(f(0) >= 0.79 && f(0) <= 0.81, `plancher à ${Math.round((1 - f(0)) * 1000) / 10} % : dur, mais jamais une spirale sans retour`);
  ok(f(100) > f(70) && f(70) > f(40) && f(40) > f(10), "la pente est monotone : plus on est cuit, moins on rend");
  // la force du onze bouge bien quand l'équipe est à plat
  api.nouvellePartie("NAN");
  G = api.getG(); const c = api.clubById(G.monClub);
  c.joueurs.forEach(j => { j.fraich = 100; });
  const fr = api.forces(c).att;
  c.joueurs.forEach(j => { j.fraich = 20; });
  const cuit = api.forces(c).att;
  ok(cuit < fr * 0.94, `un onze à bout de souffle perd ${Math.round((1 - cuit / fr) * 1000) / 10} % d'attaque`);
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
  ok(bCuit > bFrais * 1.6,
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

console.log("");
if (FAILS) { console.log("❌ HARNAIS FRAÎCHEUR : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS FRAÎCHEUR : TOUT EST VERT");
