/* Harnais headless : LE STADE EN MAQUETTE (v1.36)
   A) une nouvelle partie démarre avec un stade adapté à la taille réelle du club
   B) une vieille sauvegarde (booléens, chantier « pylones ») se convertit et s'affiche sans erreur
   C) le chemin jusqu'à 100 000 places : tribunes, virages, toutes les familles jusqu'au niveau 3
   D) les effets restent des nudges bornés (affluence, ferveur, recettes)
   E) le rendu : maquette et cartes de livraison sans NaN ni undefined, dans tous les états
   F) entrer dans l'histoire, dans chacun des six styles (palmarès, prestige, affluence, rendu)
   G) ça rapporte : vos places s'entretiennent à 6 FF, les accès pèsent, la pelouse chauffante protège l'hiver
   Usage : node harness-stade.cjs                                                            */
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
global.document = makeStub();
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, localStorage: ls, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.localStorage = ls;
global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

const epilogue = "\n;return {nouvellePartie,jouerJournee,migre,clubById,CLUBS,CLUBS_D2,MSG_JOURNAL," +
  "STADE_PROJETS,projetById,lanceProjet,avanceChantier,migreStade,inferStade,maquetteStade,etatStade3D,STADE3D," +
  "stadeBonusAff,stadeFerveur,STYLES_STADE,affluence,palierBillet,stadeRecetteMatch,stadeRecetteJour,etapeStade,STADE_MAX,PLACES_TRIB," +
  "fraisJournee,tirageBlessure,pelouseChauffee," +
  "getG:function(){return G;},setG:function(x){G=x;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (c, m) => { if (c) console.log("  ✓ " + m); else fail(m); };
const propre = s => typeof s === "string" && s.length > 100 && !/NaN|undefined|Infinity/.test(s);
const parTaille = () => api.CLUBS.concat(api.CLUBS_D2).slice().sort((x, y) => x.cap - y.cap);
const livrer = () => { let l = null, n = 0; while (api.getG().chantier && n++ < 50) l = api.avanceChantier() || l; return l; };
const lancer = (id) => { api.lanceProjet(id); return livrer(); };

/* ===== A) nouvelle partie ===== */
console.log("A) Une nouvelle partie démarre avec un stade à sa taille");
{ const petit = parTaille()[0], grand = parTaille().slice(-1)[0];
  api.nouvellePartie(petit.id); let G = api.getG(), c = api.clubById(G.monClub);
  ok(G.stade.eclairage === 1 && !G.stade.toit && !G.stade.virages && G.stade.buvette === 1 && G.stade.boutique === 1,
    `petit club (${c.nom}, ${c.cap} places) : mâts d'origine, pas de toit ni de virages, kiosque et frites`);
  ok(propre(api.maquetteStade(c, 0.6, null, null)), "sa maquette se dessine sans valeur manquante");
  api.nouvellePartie(grand.id); G = api.getG(); c = api.clubById(G.monClub);
  ok(G.stade.eclairage === 2 && G.stade.toit === 1 && (c.cap < 35000 || G.stade.virages === 1),
    `grand club (${c.nom}, ${c.cap} places) : pylônes, toit${c.cap >= 35000 ? ", virages et drapeaux au kop" : ""}`);
  ok(api.etapeStade(c.cap) !== "Temple du football", `nom de palier : ${api.etapeStade(c.cap)}`);
}

/* ===== B) vieille sauvegarde ===== */
console.log("\nB) Une vieille sauvegarde se convertit");
{ api.nouvellePartie(api.CLUBS[2].id);
  const G = api.getG(), c = api.clubById(G.monClub);
  G.stade = { toit: true, pylones: true, ecran: false, loges: true, boutique: true, chauffante: false, cote: 5 };
  G.chantier = { reste: 2, id: "pylones" };
  api.migre();
  const s = api.getG().stade;
  ok(s.eclairage === 2 && s.toit === 1 && s.loges === 1 && s.ecran === 0, "pylônes → éclairage 2, toit et loges conservés");
  ok(s.boutique === 2 && s.musee === 1 && s.buvette === 1, "« boutique & musée » → boutique du club + salle des trophées");
  ok(!("pylones" in s) && s.cote === 5, "l'ancien champ disparaît, le compteur de côté est gardé");
  ok(api.getG().chantier.id === "eclairage" && api.getG().chantier.niv === 2, "le chantier « pylones » en cours reprend sous son nouveau nom");
  const l = livrer();
  ok(l && l.id === "eclairage" && api.getG().stade.eclairage === 2, "il se livre sans erreur");
  ok(propre(api.maquetteStade(c, 0.7, null, null)), "la maquette d'une vieille partie se dessine");
  // le plus vieux format : un chantier « places » d'avant le catalogue
  api.getG().chantier = { reste: 1, places: 3000 }; const cap0 = c.cap; livrer();
  ok(c.cap === cap0 + 3000, "l'ancien chantier « places » est toujours honoré");
  // et une sauvegarde sans aucun G.stade
  delete api.getG().stade; api.migre();
  ok(api.getG().stade && api.getG().stade.eclairage >= 1, "sans G.stade, le stade est déduit de la taille");
}

/* ===== C) jusqu'à 100 000 places ===== */
console.log("\nC) Le chemin jusqu'à 100 000 places");
{ api.nouvellePartie(parTaille()[0].id);
  const G = api.getG(), c = api.clubById(G.monClub);
  G.tresorerie = 1e13;
  let tribunes = 0, garde = 0, cotes = new Set(), textes = [];
  while (api.projetById("tribune").dispo(c) && garde++ < 60) {
    if (!G.stade.virages && api.projetById("virages").dispo(c)) { const l = lancer("virages"); textes.push(l); }
    const l = lancer("tribune"); tribunes++; textes.push(l); cotes.add(l.titre.split(" ")[1]);
  }
  ok(c.cap > api.STADE_MAX - api.PLACES_TRIB && c.cap <= api.STADE_MAX, `${tribunes} tribunes, le stade s'arrête à ${c.cap} places (plafond ${api.STADE_MAX})`);
  ok(G.stade.virages === 1, "les virages ont été bâtis en route");
  ok(cotes.size === 4, `les quatre côtés ont grandi (${[...cotes].join(", ")})`);
  ok(!api.projetById("tribune").dispo(c), "plus aucune tribune possible au sommet");
  // toutes les familles jusqu'au niveau 3, et tous les chantiers uniques
  let n = 0;
  for (let tour = 0; tour < 6; tour++)
    api.STADE_PROJETS.forEach(p => { if (p.id !== "tribune" && p.id !== "legende" && !p.fait(c) && p.dispo(c)) { textes.push(lancer(p.id)); n++; } });
  const reste = api.STADE_PROJETS.filter(p => p.id !== "tribune" && !p.fait(c)).map(p => p.id);
  ok(reste.length === 1 && reste[0] === "legende", `${n} chantiers livrés, toit rétractable compris ; il ne reste que l'histoire (${reste.join(", ")})`);
  ok(G.stade.retract === 1 && G.stade.ferme === 1, "le toit rétractable est livré fermé");
  ["boutique", "buvette", "restaurant", "musee", "hotel", "transport", "kop", "eclairage"].forEach(k => {
    if (G.stade[k] !== 3) fail(k + " n'est pas au niveau 3 (" + G.stade[k] + ")"); });
  ok(["boutique", "buvette", "restaurant", "musee", "hotel", "transport", "kop", "eclairage"].every(k => G.stade[k] === 3), "toutes les familles au niveau 3");
  ok(textes.every(l => l && l.titre && l.sous && !/—/.test(l.titre + l.sous + (l.chiffres || ""))), `${textes.length} livraisons, toutes titrées, aucune avec un tiret cadratin`);
  ok(api.etapeStade(c.cap) === "Cathédrale du football", "le palier au sommet : Cathédrale du football");
  ok(c.pres <= 10, `prestige plafonné (${c.pres}/10)`);
  ok(propre(api.maquetteStade(c, 0.95, null, null)), "la maquette à 100 000 places se dessine");
}

/* ===== D) les effets ===== */
console.log("\nD) Les effets restent des nudges");
{ const G = api.getG();
  const aff = api.stadeBonusAff(), fer = api.stadeFerveur(), m = api.stadeRecetteMatch(1), j = api.stadeRecetteJour();
  ok(aff >= 0.1 && aff < 0.2, `bonus d'affluence au sommet : +${(aff * 100).toFixed(1)} points`);
  ok(fer > 0.05 && fer <= 0.061, `bonus de ferveur au sommet : +${fer.toFixed(3)} (toit, virages, kop)`);
  ok(m === 150000 + 180000 + 300000, `recettes d'un soir de match plein : ${(m / 1e6).toFixed(2)} MF`);
  ok(j === 250000 + 150000 + 50000, `recettes par journée : ${(j / 1e6).toFixed(2)} MF`);
  ok(api.stadeRecetteMatch(0.5) < m, "les buvettes suivent le remplissage");
  const s0 = G.stade; G.stade = api.inferStade({ cap: 8000 });
  ok(api.stadeBonusAff() === 0 && api.stadeFerveur() === 0, "un stade municipal n'apporte aucun bonus");
  G.stade = s0;
}

/* ===== E) le rendu dans tous les états ===== */
console.log("\nE) Le rendu, dans tous les états");
{ const G = api.getG(), c = api.clubById(G.monClub);
  const R = api.etatStade3D(c, 0.8, {});
  const focus = ["tribune", "virages", "toit", "loges", "ecran", "chauffante", "led", "eclairage", "boutique", "buvette", "restaurant", "musee", "hotel", "transport", "kop", "retract", "legende"];
  ok(focus.every(f => propre(api.STADE3D.vueVille(R, "n", f))), `les ${focus.length} cartes de livraison se dessinent`);
  let bons = 0;
  for (const cap of [3000, 5000, 8500, 12000, 20000, 33000, 47000, 61000, 80000, 99500]) for (const vir of [0, 1]) {
    const r = { ...R, cap, virages: vir, chantier: 1, cible: "Lancer" };
    if (propre(api.STADE3D.vueMaquette(r)) && propre(api.STADE3D.vueVille(r, "n", "tribune"))) bons++; }
  ok(bons === 20, `20 états de 3 000 à 99 500 places, avec et sans virages, chantier en cours : ${bons}/20 propres`);
}


/* ===== F) entrer dans l'histoire, six fois ===== */
console.log("\nF) Entrer dans l'histoire, dans chacun des six styles");
{ const G = api.getG(), c = api.clubById(G.monClub), p = api.projetById("legende");
  ok(p.dispo(c), "au sommet, avec toit et virages, le chantier est ouvert");
  const base = JSON.stringify(G.stade), pres0 = c.pres, pal0 = G.palmares.length;
  const cout = p.cout(c, 1); ok(cout >= 150e6, `très cher : ${(cout / 1e6).toFixed(0)} MF, ${p.duree(1)} journées`);
  for (const st of Object.keys(api.STYLES_STADE)) {
    G.stade = JSON.parse(base); c.pres = pres0; G.palmares.length = pal0; G.tresorerie = 1e13;
    api.lanceProjet("legende", st); const liv = livrer();
    const ligne = G.palmares[G.palmares.length - 1] || "";
    const bons = G.stade.legende === 1 && G.stade.style === st && c.pres === 10 && api.etapeStade(c.cap) === "Temple du football"
      && ligne.indexOf("entre dans l'histoire (" + api.STYLES_STADE[st].nom + ")") > 0 && liv && liv.titre === api.STYLES_STADE[st].titre
      && !p.dispo(c) && propre(api.maquetteStade(c, 0.95, null, null)) && propre(api.STADE3D.vueVille(api.etatStade3D(c, 0.95), "n", "legende"));
    ok(bons, `${api.STYLES_STADE[st].nom} : ${liv && liv.titre} · « ${ligne} »`);
  }
  // l'affluence : jamais sous 95 % au tarif normal, contre n'importe quel visiteur
  const home = c, away = G.clubs.find(x => x.id !== c.id && x.pres <= 3) || G.clubs.find(x => x.id !== c.id);
  home.forme = [-1, -1, -1, -1, -1];
  const tx = api.affluence(home, away, true) / home.cap / api.palierBillet().aff;
  ok(tx >= 0.949, `un temple du football, même en crise, contre ${away.nom} : ${(tx * 100).toFixed(0)} % avant l'effet du tarif`);
}

/* ===== G) le retour sur investissement (v1.41) ===== */
console.log("\nG) Investir dans le stade rapporte");
{ const moyen = parTaille().find(c => c.cap >= 30000 && c.cap <= 40000) || parTaille()[20];
  api.nouvellePartie(moyen.id); const G = api.getG(), c = api.clubById(G.monClub), cap0 = c.cap;
  ok(G.stade.capBase === cap0, `la taille d'origine est retenue (${cap0} places)`);
  ok(api.fraisJournee(c) === Math.round(cap0 * 18), "au départ, les frais sont ceux d'avant (calibrage intact)");
  G.tresorerie = 1e9; lancer("tribune");
  ok(c.cap === cap0 + api.PLACES_TRIB && api.fraisJournee(c) === Math.round(cap0 * 18 + api.PLACES_TRIB * 6), "une tribune bâtie : ses places ne coûtent que 6 FF par journée");
  // remboursement d'une tribune à 75 % de remplissage, tarif normal, sans compter le prestige
  const T = api.projetById("tribune").cout(c), net = api.PLACES_TRIB * (0.75 * 70 * 19 - 6 * 38);
  ok(T / net <= 7.5, `une tribune se rembourse en ${(T / net).toFixed(1)} saisons à 75 % (prestige en plus)`);
  // vieille sauvegarde sans taille d'origine : on retire les tribunes bâties
  const st = Object.assign({}, G.stade); delete st.capBase; st.cote = 2;
  ok(api.migreStade(st, c).capBase === c.cap - 2 * api.PLACES_TRIB, "vieille partie : la taille d'origine se déduit des tribunes bâties");
  // les accès : le parking vaut deux points, la gare huit
  G.stade.transport = 1; const a1 = api.stadeBonusAff(); G.stade.transport = 3; const a3 = api.stadeBonusAff(); G.stade.transport = 0; const a0 = api.stadeBonusAff();
  ok(Math.abs(a1 - a0 - 0.02) < 1e-9 && Math.abs(a3 - a0 - 0.08) < 1e-9, `accès : parking +${((a1 - a0) * 100).toFixed(1)} pts, gare +${((a3 - a0) * 100).toFixed(1)} pts`);
  // la pelouse chauffante : l'hiver seulement, et sur votre pelouse seulement
  const j = c.joueurs[0], R = Math.random; const tire = (p) => { let n = 0; for (let i = 0; i < 4000; i++) { Math.random = () => (i + 0.5) / 4000; if (api.tirageBlessure(c, j, p)) n++; } Math.random = R; return n; };
  G.stade.chauffante = 1; G.journee = 15;
  const sans = tire(false), avec = tire(true);
  ok(api.pelouseChauffee() && avec > 0 && Math.abs(avec / sans - 0.5) < 0.02, `en hiver chez vous : ${avec} pépins au lieu de ${sans} (moitié moins)`);
  G.journee = 32; ok(!api.pelouseChauffee() && tire(true) === sans, "au printemps, la pelouse chauffante ne change rien");
  G.stade.chauffante = 0; G.journee = 15; ok(!api.pelouseChauffee(), "sans pelouse chauffante, rien ne change");
}

console.log(FAILS ? `\n❌ HARNAIS STADE : ${FAILS} ÉCHEC(S)` : "\n✅ HARNAIS STADE : TOUT EST VERT");
process.exit(FAILS ? 1 : 0);
