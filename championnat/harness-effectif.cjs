/* Harnais headless — LE PLANCHER RÉGLEMENTAIRE DE L'EFFECTIF (v0.91)
   Reproduit le bug de playtest (« j'ai vendu mes deux gardiens puis presque tout l'effectif,
   et j'ai quand même joué — 36-0 ») et vérifie les garde-fous :
   A) on ne peut plus vendre / prêter / céder sous le plancher (16 joueurs, 2 G, 4 D, 4 M, 2 A)
   B) une sauvegarde déjà saccagée est remise en règle, et le match ne finit plus en fessée
   C) un club adverse n'est pas un supermarché (2 cessions/saison, 1 gardien maximum)
   D) sur une carrière longue, AUCUN club des deux divisions ne passe sous le plancher,
      et aucun ne présente un onze incomplet
   E) le centre de formation reste la soupape (2 promotions par saison, pas une de plus)
   Usage : node harness-effectif.cjs                                                        */
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
let ALERTES = [];
global.alert = (t) => { ALERTES.push(String(t)); };
global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,simuleMatch,clubById,onze,byUid," +
  "manqueEffectif,refusDepart,veilleEffectif,listerVente,venteEclair,ventesEnCours,preteJoueur," +
  "acheter,finaliseAchat,accepterOffreExt,migre,monteeCentre,intersaison,rappelPret,coutRappel,retourPret,traiterPrets," +
  "PLANCHER,PLANCHER_TOTAL,QUOTA_CESSIONS,MONTEES_MAX,getG:function(){return G;},setG:function(x){G=x;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const compte = (c, p) => c.joueurs.filter(j => j.pos === p).length;
const horsClous = (c) => Object.keys(api.manqueEffectif(c)).length > 0;

/* ============ A) les départs volontaires butent sur le plancher ============ */
console.log("A) Départs volontaires : le plancher tient");
api.nouvellePartie("LEH");
let G = api.getG();
let moi = api.clubById(G.monClub);
const n0 = moi.joueurs.length;

// on brade tout ce que le règlement autorise : mise en vente + vente éclair jusqu'au refus
let vendus = 0;
for (const j of moi.joueurs.slice()) {
  ALERTES = [];
  api.venteEclair(j);
  if (!moi.joueurs.includes(j)) vendus++;
}
ok(moi.joueurs.length >= api.PLANCHER_TOTAL,
  `vente éclair en boucle : effectif descendu de ${n0} à ${moi.joueurs.length} (plancher ${api.PLANCHER_TOTAL}), ${vendus} cédés`);
ok(compte(moi, "G") >= api.PLANCHER.G, `les deux gardiens sont restés (${compte(moi, "G")} en poste)`);
ok(!horsClous(moi), "effectif en règle après la razzia");

// le refus est motivé
ALERTES = [];
api.venteEclair(moi.joueurs.find(j => j.pos === "G"));
ok(ALERTES.length === 1 && /gardiens sous contrat/.test(ALERTES[0]),
  "vendre un gardien est refusé, motif à l'appui : « " + (ALERTES[0] || "").split("\n").pop() + " »");

// mise sur la liste des transferts, prêt sortant : mêmes barrières
ALERTES = [];
api.listerVente(moi.joueurs[0]);
ok(moi.joueurs[0].avendre !== true && ALERTES.length === 1, "mise sur la liste des transferts refusée au plancher");
ALERTES = [];
api.preteJoueur(moi.joueurs[0], 5, 20000, api.clubById(G.clubs.find(c => c.id !== G.monClub).id));
ok(moi.joueurs.length >= api.PLANCHER_TOTAL && ALERTES.length === 1, "prêt sortant refusé au plancher");

// et une liste de transferts posée AVANT le plancher ne le franchit pas non plus
moi.joueurs.forEach(j => { j.avendre = true; });
for (let k = 0; k < 40; k++) api.ventesEnCours();
ok(moi.joueurs.length >= api.PLANCHER_TOTAL && !horsClous(moi),
  `tout l'effectif « à vendre » pendant 40 journées : il reste ${moi.joueurs.length} joueurs, dont ${compte(moi, "G")} gardiens`);

/* ============ B) la sauvegarde déjà saccagée est remise en règle ============ */
console.log("B) Sauvegarde saccagée : remise en règle et fin des fessées");
api.nouvellePartie("LEH");
G = api.getG();
moi = api.clubById(G.monClub);
moi.joueurs = moi.joueurs.filter(j => j.pos !== "G").slice(0, 4); // 4 joueurs de champ, zéro gardien : le save du playtest
const adv = G.clubs.find(c => c.id !== G.monClub);
const avant = api.simuleMatch(moi, adv, false);
const fessee = Math.abs(avant.sh - avant.sa);
api.veilleEffectif();
ok(moi.joueurs.length >= api.PLANCHER_TOTAL && compte(moi, "G") >= api.PLANCHER.G,
  `effectif reconstitué à ${moi.joueurs.length} joueurs dont ${compte(moi, "G")} gardiens (avant : 4 joueurs, 0 gardien)`);
ok(api.onze(moi).length === 11, "le onze est de nouveau alignable");
const ecarts = [];
for (let k = 0; k < 300; k++) { const r = api.simuleMatch(moi, adv, false); ecarts.push(r.sa - r.sh); }
const moy = ecarts.reduce((s, x) => s + x, 0) / ecarts.length, pire = Math.max(...ecarts);
// un effectif de piges reste faible (et doit le rester) : on vérifie qu'il perd normalement, plus absurdement
ok(moy < 5 && pire <= 12,
  `300 matchs contre ${adv.nom} : écart moyen ${moy.toFixed(2)}, pire défaite ${pire} buts (avant remise en règle : un seul match donnait déjà ${fessee} d'écart)`);

/* ============ C) l'adversaire n'est pas un supermarché ============ */
console.log("C) Quota de cessions chez l'adversaire");
api.nouvellePartie("PSG");
G = api.getG();
G.budget = 900e6; G.tresorerie = 900e6; G.journee = 0;
const cible = G.clubs.find(c => c.id !== G.monClub);
const nCible = cible.joueurs.length;
let achats = 0;
for (const j of cible.joueurs.slice().filter(x => x.pos !== "G")) {
  ALERTES = [];
  api.finaliseAchat(j, 1, 0);          // achat direct : on teste le quota via acheter() juste après
  if (j.club === G.monClub) achats++;
  if (achats >= api.QUOTA_CESSIONS) break;
}
ALERTES = [];
api.acheter(cible.joueurs.find(j => j.pos !== "G"));
ok(ALERTES.length === 1 && /supermarché/.test(ALERTES[0]), "un 3ᵉ achat au même club est refusé : « " + (ALERTES[0] || "") + " »");
ok(cible.joueurs.length >= api.PLANCHER_TOTAL, `le club dévalisé reste en règle (${cible.joueurs.length} joueurs, départ de ${nCible})`);

api.nouvellePartie("PSG");
G = api.getG();
G.budget = 900e6; G.tresorerie = 900e6; G.journee = 0;
const cible2 = G.clubs.find(c => c.id !== G.monClub);
api.finaliseAchat(cible2.joueurs.find(j => j.pos === "G"), 1, 0);
ALERTES = [];
api.acheter(cible2.joueurs.find(j => j.pos === "G"));
ok(ALERTES.length === 1 && /portier/.test(ALERTES[0]), "le second gardien du même club est intransférable : « " + (ALERTES[0] || "") + " »");
ok(compte(cible2, "G") >= api.PLANCHER.G, `l'adversaire a racheté un gardien (${compte(cible2, "G")} en poste)`);

/* ============ D) carrière longue : personne ne sort des clous ============ */
console.log("D) Carrière longue : contrôle réglementaire de toutes les divisions");
let violPlancher = 0, violXI = 0, minEff = 99, exemple = "";
for (const club of ["AUX", "OM", "MTP"]) {
  api.nouvellePartie(club);
  G = api.getG();
  for (let s = 0; s < 6; s++) {
    while (!G.finie) {
      api.jouerJournee();
      for (const c of G.clubs.concat(G.autre)) {
        if (horsClous(c)) { violPlancher++; if (!exemple) exemple = c.nom + " (" + c.joueurs.length + " joueurs)"; }
        if (api.onze(c).length < 11) violXI++;
        minEff = Math.min(minEff, c.joueurs.length);
      }
    }
    api.intersaison();
  }
}
ok(violPlancher === 0, `aucun club sous le plancher sur 3 carrières × 6 saisons${exemple ? " (ex. " + exemple + ")" : ""}`);
ok(violXI === 0, "aucun onze incomplet au coup d'envoi");
ok(minEff >= api.PLANCHER_TOTAL, `effectif le plus maigre rencontré : ${minEff} joueurs`);

/* ============ E) la soupape du centre de formation ============ */
console.log("E) Centre de formation : la soupape du plancher");
api.nouvellePartie("LEH"); // Le Havre démarre PILE à 16 : tout est bloqué au coup d'envoi
G = api.getG();
moi = api.clubById(G.monClub);
ok(moi.joueurs.length === api.PLANCHER_TOTAL && !!api.refusDepart(moi, moi.joueurs[0]),
  `Le Havre démarre à ${moi.joueurs.length} joueurs : aucun départ possible`);
api.monteeCentre("M");
ok(moi.joueurs.length === api.PLANCHER_TOTAL + 1 && !api.refusDepart(moi, moi.joueurs.find(j => j.pos === "M")),
  `un jeune monte du centre → ${moi.joueurs.length} joueurs, un départ redevient possible`);
api.monteeCentre("A");
ALERTES = [];
api.monteeCentre("D");
ok(ALERTES.length === 1 && moi.joueurs.length === api.PLANCHER_TOTAL + 2,
  `le centre s'arrête à ${api.MONTEES_MAX} promotions par saison (la 3ᵉ est refusée)`);
const avantVentes = moi.joueurs.length;
for (const j of moi.joueurs.slice()) api.venteEclair(j);
ok(moi.joueurs.length === api.PLANCHER_TOTAL,
  `on peut alors céder la marge — et seulement elle : ${avantVentes} → ${moi.joueurs.length} joueurs`);
G.finie = true; api.intersaison();
ok((G.montees || 0) === 0, "le compteur de promotions se recharge à l'intersaison");

/* ============ F) rappeler un prêté avant terme, moyennant compensation ============ */
console.log("F) Rappel d'un prêt avant terme");
api.nouvellePartie("PSG");
G = api.getG();
G.journee = 3; G.tresorerie = 40e6;
moi = api.clubById(G.monClub);

// on prête un jeune pour 15 journées, puis on le rappelle à mi-parcours
const jeune = moi.joueurs.slice().sort((a, b) => a.age - b.age).find(j => j.pos !== "G");
const uid = jeune.uid, noteAvant = jeune.note, moralAvant = jeune.moral;
api.preteJoueur(jeune, 15, 50000, null);
let pret = G.prets.find(p => p.uid === uid && p.sens === "out");
ok(!!pret && jeune.pretOut === true && !moi.joueurs.includes(jeune),
  `prêt signé : ${jeune.nom} part à ${api.clubById(pret.hote).nom} jusqu'à la J${pret.fin}`);
ok(pret.debut === 3, `la journée de signature est mémorisée (debut = J${pret.debut}) — elle sert au prorata`);

// la caisse doit suivre
const cout = api.coutRappel(pret, jeune);
ok(cout > 0, `indemnité de rupture chiffrée : ${(cout / 1e6).toFixed(2)} MF pour ${pret.fin - G.journee} journées restantes`);
G.tresorerie = cout - 1e5;
ALERTES = [];
api.rappelPret(uid);
ok(ALERTES.length === 1 && /rupture/.test(ALERTES[0]) && !!G.prets.find(p => p.uid === uid),
  "caisse trop maigre : le rappel est refusé et le prêt court toujours");

// à mi-parcours, avec les moyens : il rentre, la caisse est débitée, le bénéfice est proratisé
G.journee = 11;            // 8 journées faites sur 15
G.tresorerie = 40e6;
pret = G.prets.find(p => p.uid === uid);
const coutReel = api.coutRappel(pret, jeune);
const caisseAvant = G.tresorerie, hote = api.clubById(pret.hote), nHote = hote.joueurs.length;
api.rappelPret(uid);
moi = api.clubById(G.monClub);
ok(!G.prets.find(p => p.uid === uid), "le prêt est retiré de G.prets");
ok(moi.joueurs.includes(jeune) && !jeune.pretOut && jeune.club === G.monClub,
  `${jeune.nom} est de retour dans l'effectif`);
ok(Math.round(caisseAvant - G.tresorerie) === Math.round(coutReel),
  `la trésorerie a bien payé l'indemnité (${(coutReel / 1e6).toFixed(2)} MF)`);
ok(hote.joueurs.length === nHote - 1 && !horsClous(hote),
  `${hote.nom} perd son prêté mais reste en règle (${hote.joueurs.length} joueurs)`);
const gainPlein = jeune.age <= 21 ? 3 : jeune.age <= 25 ? 2 : 1;
ok(jeune.note - noteAvant <= Math.round(gainPlein * 8 / 15),
  `pige écourtée : note ${noteAvant} → ${jeune.note} (au lieu de +${gainPlein} pour un prêt mené à terme)`);
ok(jeune.moral <= moralAvant + 2,
  `il n'en sort pas ravi : moral ${Math.round(moralAvant)} → ${Math.round(jeune.moral)}`);

// un prêt qui se termine la semaine prochaine ne se rachète pas
const autre = moi.joueurs.slice().sort((a, b) => a.age - b.age).find(j => j.pos !== "G" && j.uid !== uid);
api.preteJoueur(autre, 5, 50000, null);
const p2 = G.prets.find(p => p.uid === autre.uid);
G.journee = p2.fin - 1;
ALERTES = [];
api.rappelPret(autre.uid);
ok(ALERTES.length === 1 && /de toute façon/.test(ALERTES[0]) && !!G.prets.find(p => p.uid === autre.uid),
  "à une journée du terme, le rappel est refusé : « " + (ALERTES[0] || "").split(String.fromCharCode(10))[0] + " »");

// un prêt mené à son terme garde le bénéfice PLEIN (pas de régression sur le chemin normal)
api.nouvellePartie("PSG");
G = api.getG();
G.journee = 3; G.tresorerie = 40e6;
moi = api.clubById(G.monClub);
const jeune2 = moi.joueurs.slice().sort((a, b) => a.age - b.age).find(j => j.pos !== "G");
const n2 = jeune2.note, plein2 = jeune2.age <= 21 ? 3 : jeune2.age <= 25 ? 2 : 1;
const plafond2 = Math.max(jeune2.note, jeune2.pot || jeune2.note);
api.preteJoueur(jeune2, 5, 50000, null);
G.journee = 8; api.traiterPrets();
ok(jeune2.note === Math.min(plafond2, n2 + plein2),
  `prêt mené à terme : le bénéfice reste plein (note ${n2} → ${jeune2.note})`);

console.log(FAILS ? `\n❌ ${FAILS} test(s) en échec` : "\n✅ HARNAIS EFFECTIF : TOUT EST VERT");
process.exit(FAILS ? 1 : 0);
