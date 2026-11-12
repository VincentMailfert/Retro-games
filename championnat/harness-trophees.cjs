/* Harnais headless — LES DÉFIS ET LA SALLE DES TROPHÉES (v2.75)
   Des défis rapportent des points (jamais stockés : ils se déduisent des défis réussis), une salle des
   trophées réunit, à l'accueil, tout ce que le joueur a gagné, toutes carrières confondues.
   A) une progression neuve : aucun défi, zéro point, la porte de l'accueil dit ⭐ 0
   B) les défis de match tombent au soir de la journée, et seulement quand le score le dit
   C) un défi ne rapporte qu'une fois, et les points sont la somme des défis réussis
   D) la fin de saison : titre, podium, montée, coupe, Europe, doublé, forteresse, invincibles
   E) la carrière : cinq et dix saisons, trois saisons ouvertes, champion dans deux championnats
   F) le rattrapage depuis les résultats déjà rangés, sans notification, une seule fois
   G) la fusion de deux appareils réunit les défis, la plus ancienne réussite fait foi
   H) le nettoyage de ce qui vient du navigateur ou du serveur
   I) l'écran : la vitrine, les blasons des clubs sacrés, les trois familles de défis
   J) une vraie carrière de six saisons : pas d'erreur, chaque défi de match réussi est justifié par un score
   K) les défis de club (v2.76) : clubs réels du bon championnat, règles, fin de saison, rattrapage, fiche, écran
   L) la boutique (v2.77) : solde, limites d'achat, effets des coups de pouce et des avantages permanents, fusion
   Usage : node harness-trophees.cjs                                                            */
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</scr" + "ipt>"));

function makeStub() {
  let stub; const fn = function () { return stub; };
  stub = new Proxy(fn, {
    get(_t, p) { if (p === Symbol.toPrimitive) return () => ""; if (p === "length") return 0; return stub; },
    set() { return true; }, apply() { return stub; }, has() { return true; }, construct() { return stub; },
  });
  return stub;
}
function nouveauLS() {
  return {
    _m: {},
    get length() { return Object.keys(this._m).length; },
    key(i) { return Object.keys(this._m)[i] ?? null; },
    getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; },
  };
}
const noeud = () => { const n = { _h: "", style: {}, querySelector: () => null, querySelectorAll: () => [] };
  Object.defineProperty(n, "innerHTML", { get() { return n._h; }, set(v) { n._h = String(v); } }); return n; };
const APP = noeud(), FICHE = noeud();
const generic = makeStub();
global.document = new Proxy(function () {}, {
  get(_t, p) { if (p === "getElementById") return id => (id === "app" ? APP : id === "fiche" ? FICHE : generic); if (p === Symbol.toPrimitive) return () => ""; return generic; },
  set() { return true; }, apply() { return generic; }, has() { return true; }, construct() { return generic; },
});
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, location: { href: "" }, scrollTo() {}, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0); global.cancelAnimationFrame = (id) => clearTimeout(id);

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,classement,clubById,SAISONS,prog,progMag,progVide,progNette," +
  "progFusionne,progEmpreinte,ecranAccueil,ecranTrophees,DEFIS,DEFI_DE,defiReussi,pointsDefis,defiGagne,mesMatchs," +
  "defisJournee,defisFinSaison,defisCarriere,defisConstate,vitrine,DEFIS_CLUB,defiClubRempli,defisClubDe,ficheClubAccueil,metaClub,BOUTIQUE,soldePoints,depensePoints,achete,achatPossible,acquis,boutiqueHTML,clubById," +
  "getG:function(){return G;},setG:function(x){G=x;},setAccueil:function(k){SAISON_ACCUEIL=k;}};";
function appareil(ls) { global.localStorage = ls; global.window.localStorage = ls; return new Function(script + epilogue)(); }

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const ids = api => api.prog().defis.map(d => d.id).sort();
/* une journée forgée : le seul match du club, à domicile ou dehors */
function journee(G, dom, bp, bc) {
  const adv = "ADV";
  G.histo.push([dom ? { h: G.monClub, a: adv, sh: bp, sa: bc, mien: true } : { h: adv, a: G.monClub, sh: bc, sa: bp, mien: true },
    { h: "X1", a: "X2", sh: 9, sa: 0, mien: false }]);
}
function vide(api) { const p = api.prog(); p.defis = []; p.resultats = []; p.ouvertes = []; p.gagnees = []; }

/* ===== A) progression neuve ===== */
console.log("A) Une progression neuve : aucun défi, zéro point");
let api = appareil(nouveauLS());
{
  ok(api.prog().defis.length === 0 && api.pointsDefis() === 0, "aucun défi réussi, zéro point");
  ok(api.DEFIS.length >= 20 && new Set(api.DEFIS.map(d => d.id)).size === api.DEFIS.length, `${api.DEFIS.length} défis, identifiants uniques`);
  ok(api.DEFIS.every(d => ["pas", "saison", "carriere"].includes(d.fam) && d.pts > 0 && d.nom), "chaque défi a une famille, un nom et des points");
  ok(!api.DEFIS.some(d => /—/.test(d.nom)), "aucun tiret long dans les noms des défis");
  api.ecranAccueil();
  ok(/id="bTrophees"/.test(APP.innerHTML) && /⭐ 0</.test(APP.innerHTML), "l'accueil porte la salle des trophées, ⭐ 0");
}

/* ===== B) les défis de match ===== */
console.log("B) Les défis de match tombent au soir de la journée");
{
  api.nouvellePartie(api.SAISONS["1995-96"].d1[0], "1995-96"); const G = api.getG(); G.histo = []; vide(api); G.notifs = [];
  journee(G, true, 1, 1); api.defisJournee();
  ok(ids(api).length === 0, "un nul 1-1 ne rapporte rien");
  journee(G, true, 2, 1); api.defisJournee();
  ok(ids(api).join() === "vic", "une victoire à domicile : « Une première victoire » seulement");
  ok(G.notifs.some(n => /DÉFI RÉUSSI : Une première victoire · \+10 pts/.test(n)), "le debrief l'annonce");
  journee(G, false, 1, 0); api.defisJournee();
  ok(api.defiReussi("ext") && api.defiReussi("zero"), "1-0 dehors : gagner à l'extérieur, et sans encaisser");
  journee(G, true, 5, 2); api.defisJournee();
  ok(api.defiReussi("large") && api.defiReussi("cinq"), "5-2 : trois buts d'écart, cinq buts");
  const avant = G.notifs.length; journee(G, true, 3, 0); api.defisJournee();
  ok(G.notifs.length === avant, "rien de neuf, rien d'annoncé");
  ok(!api.defiReussi("serie6"), "quatre victoires d'affilée, pas encore six");
  journee(G, true, 1, 0); journee(G, true, 1, 0); api.defisJournee();
  ok(api.defiReussi("serie6"), "six victoires d'affilée");
  ok(!api.defiReussi("murs10"), "cinq matchs sans encaisser ne suffisent pas");
  for (let i = 0; i < 6; i++) journee(G, i % 2 === 0, 0, 0); api.defisJournee(); // 4 + 6 = 10 matchs sans encaisser
  ok(api.defiReussi("murs10") && api.defiReussi("invaincu10"), "dix matchs sans encaisser, dix sans défaite");
}

/* ===== C) une seule fois ===== */
console.log("C) Un défi ne rapporte qu'une fois");
{
  const n = api.prog().defis.length, pts = api.pointsDefis();
  ok(api.defiGagne("vic") === false && api.prog().defis.length === n, "regagner un défi ne l'ajoute pas");
  ok(api.defiGagne("inconnu") === false, "un défi inconnu est refusé");
  ok(pts === api.prog().defis.reduce((s, d) => s + api.DEFI_DE[d.id].pts, 0), `les points sont la somme des défis réussis (${pts})`);
  ok(!("points" in api.prog()), "les points ne sont stockés nulle part");
}

/* ===== D) la fin de saison ===== */
console.log("D) La fin de saison");
{
  const G = api.getG(); vide(api); G.histo = []; G.div = 1;
  for (let i = 0; i < 38; i++) journee(G, i % 2 === 0, 2, i % 5 === 0 ? 2 : 0);
  api.defisFinSaison(1, ["CN", "C1"]);
  for (const id of ["forteresse", "podium", "titre", "coupe", "europe", "double", "invincibles"]) ok(api.defiReussi(id), "réussi : " + api.DEFI_DE[id].nom);
  ok(!api.defiReussi("montee"), "pas de montée depuis la D1");
  vide(api); G.histo = []; G.div = 1;
  for (let i = 0; i < 38; i++) journee(G, i % 2 === 0, i === 4 ? 0 : 2, i === 4 ? 1 : 0);
  api.defisFinSaison(1, []);
  ok(api.defiReussi("titre") && !api.defiReussi("invincibles") && !api.defiReussi("forteresse"), "une défaite à domicile : champion, mais ni invincible ni forteresse");
  ok(!api.defiReussi("coupe") && !api.defiReussi("double") && !api.defiReussi("europe"), "sans coupe, ni coupe ni doublé ni Europe");
  vide(api); G.div = 2; api.defisFinSaison(3, []);
  ok(api.defiReussi("montee") && !api.defiReussi("podium") && !api.defiReussi("titre"), "3ᵉ de D2 : la montée, pas le podium de D1");
  vide(api); G.div = 2; api.defisFinSaison(4, []);
  ok(!api.defiReussi("montee"), "4ᵉ de D2 : pas de montée");
}

/* ===== E) la carrière ===== */
console.log("E) Les défis de la carrière");
{
  vide(api); const p = api.prog();
  p.resultats = [1, 2, 3, 4].map(an => ({ pid: "A", ch: "FR", an, club: "AUX", div: 1, rang: 8, coupes: [] }));
  api.defisCarriere("A", true);
  ok(!api.defiReussi("fidele"), "quatre saisons : pas encore fidèle");
  p.resultats.push({ pid: "B", ch: "FR", an: 4, club: "LEN", div: 1, rang: 9, coupes: [] });
  api.defisCarriere("A", true);
  ok(!api.defiReussi("fidele"), "quatre saisons dans deux carrières ne font pas cinq");
  p.resultats.push({ pid: "A", ch: "FR", an: 5, club: "AUX", div: 1, rang: 1, coupes: [] });
  api.defisCarriere("A", true);
  ok(api.defiReussi("fidele") && !api.defiReussi("decennie"), "cinq saisons dans une carrière, pas dix");
  ok(!api.defiReussi("deuxPays"), "champion en France seulement");
  p.resultats.push({ pid: "C", ch: "ANG", an: 1, club: "ARS", div: 1, rang: 1, coupes: [] });
  api.defisCarriere(null, true);
  ok(api.defiReussi("deuxPays"), "champion en France et en Angleterre");
  p.ouvertes = ["1991-92", "1992-93"]; api.defisCarriere(null, true);
  ok(!api.defiReussi("cles3"), "deux saisons ouvertes, pas trois");
  p.ouvertes.push("1993-94"); api.defisCarriere(null, true);
  ok(api.defiReussi("cles3"), "trois saisons ouvertes");
}

/* ===== F) le rattrapage ===== */
console.log("F) Le rattrapage depuis les résultats déjà rangés");
{
  const G = api.getG(); vide(api); G.notifs = []; const p = api.prog();
  p.resultats = [
    { pid: "A", ch: "FR", an: 1, club: "AUX", div: 2, rang: 2, coupes: [] },
    { pid: "A", ch: "FR", an: 2, club: "AUX", div: 1, rang: 1, coupes: ["CN"] },
    { pid: "B", ch: "FR", an: 1, club: "PSG", div: 1, rang: 5, coupes: ["C2"] },
  ];
  const n = api.defisConstate();
  ok(["montee", "podium", "titre", "coupe", "double", "europe"].every(api.defiReussi), `six défis rattrapés (${n})`);
  ok(G.notifs.length === 0, "sans un mot au debrief");
  ok(api.defisConstate() === 0, "repasser ne rapporte plus rien");
  ok(!api.defiReussi("vic") && !api.defiReussi("forteresse"), "un défi de match ou de G.histo ne se rattrape pas");
}

/* ===== G) la fusion ===== */
console.log("G) La fusion de deux appareils");
{
  const a = api.progVide(), b = api.progVide();
  a.defis = [{ id: "vic", t: 200, pid: "A" }, { id: "titre", t: 500, pid: "A" }];
  b.defis = [{ id: "vic", t: 100, pid: "B" }, { id: "coupe", t: 300, pid: "B" }];
  const f = api.progFusionne(a, b);
  ok(f.defis.map(d => d.id).sort().join() === "coupe,titre,vic", "la réunion des défis");
  ok(f.defis.find(d => d.id === "vic").t === 100, "la plus ancienne réussite fait foi");
  ok(api.progEmpreinte(a) !== api.progEmpreinte(f), "un défi de plus change l'empreinte (donc part au serveur)");
  ok(api.progFusionne(a, null).defis.length === 2, "fusionner avec rien ne perd rien");
  const vieux = api.progVide(); delete vieux.defis;
  ok(api.progFusionne(vieux, b).defis.length === 2, "une progression d'avant la v2.75 (sans défis) fusionne");
}

/* ===== H) le nettoyage ===== */
console.log("H) Le nettoyage de ce qui arrive");
{
  const n = api.progNette({ defis: [{ id: "vic", t: 1 }, { id: "<script>" }, null, { id: 3 }, { id: "x".repeat(40) }] });
  ok(n.defis.length === 1 && n.defis[0].id === "vic", "seuls les identifiants propres passent");
  ok(Array.isArray(api.progNette({}).defis) && Array.isArray(api.progNette(null).defis), "une progression sans défis en reçoit une liste vide");
}

/* ===== I) l'écran ===== */
console.log("I) La salle des trophées");
{
  vide(api); const p = api.prog();
  p.resultats = [
    { pid: "A", ch: "FR", an: 1, club: "AUX", div: 1, rang: 1, coupes: ["CN"] },
    { pid: "A", ch: "FR", an: 2, club: "AUX", div: 1, rang: 1, coupes: ["C1"] },
    { pid: "B", ch: "FR", an: 1, club: "MET", div: 2, rang: 1, coupes: [] },
  ];
  const v = api.vitrine();
  ok(v.d1 === 2 && v.d2 === 1 && v.cn === 1 && v.C1 === 1 && v.C2 === 0, "la vitrine compte deux titres, une D2, une coupe, une C1");
  ok(Object.keys(v.clubs).length === 1 && v.clubs["FR|AUX"] === 2, "un seul club sacré, deux fois");
  api.ecranTrophees(); const h = APP.innerHTML;
  ok(/SALLE DES TROPHÉES/.test(h) && /⭐ /.test(h), "le titre et les points");
  ok(/class="trBlason"/.test(h) && /×2/.test(h), "le blason du club sacré, marqué ×2");
  ok(/Premiers pas/.test(h) && /La saison/.test(h) && /La carrière/.test(h), "les trois familles de défis");
  ok((h.match(/class="trDefi[ "]/g) || []).length === api.DEFIS.length + api.DEFIS_CLUB.length, "tous les défis sont listés, ceux des clubs compris");
  ok(/trDefi ok/.test(h) && /✅ Champion de première division/.test(h), "un défi rattrapé est coché");
  ok(!/—/.test(h.replace(/<[^>]+>/g, "")), "aucun tiret long à l'écran");
  ok(/id="bRetourAcc"/.test(h), "un retour à l'accueil");
}

/* ===== J) une vraie carrière ===== */
console.log("J) Une carrière de six saisons");
{
  api = appareil(nouveauLS());
  let err = null, justes = true, saisons = 0;
  try {
    api.nouvellePartie(api.SAISONS["1995-96"].d1[0], "1995-96");
    for (saisons = 0; saisons < 6; saisons++) {
      const G = api.getG();
      while (!G.finie) {
        const avant = new Set(api.prog().defis.map(d => d.id));
        api.jouerJournee();
        const ms = api.mesMatchs(), x = ms[ms.length - 1];
        const neufs = api.prog().defis.map(d => d.id).filter(id => !avant.has(id));
        const VRAI = { vic: x && x.bp > x.bc, ext: x && !x.dom && x.bp > x.bc, zero: x && x.bc === 0, large: x && x.bp - x.bc >= 3, cinq: x && x.bp >= 5 };
        for (const id of neufs) if (id in VRAI && !VRAI[id]) justes = false;
      }
      api.intersaison();
    }
  } catch (e) { err = e; }
  ok(!err, "aucune erreur sur six saisons" + (err ? " : " + err.stack.split("\n").slice(0, 3).join(" | ") : ""));
  ok(justes, "chaque défi de match réussi l'a été sur un vrai score");
  ok(api.prog().resultats.length === 6, "six fins de saison rangées");
  ok(api.defiReussi("vic") && api.defiReussi("fidele"), "au moins une victoire, et la fidélité après cinq saisons");
  console.log("    défis : " + ids(api).join(", ") + " · " + api.pointsDefis() + " pts");
}

/* ===== K) les défis de club ===== */
console.log("K) Les défis de club");
{
  const DC = api.DEFIS_CLUB, S = api.SAISONS;
  ok(DC.length >= 40 && new Set(DC.map(d => d.id)).size === DC.length, `${DC.length} défis de club, identifiants uniques`);
  ok(DC.every(d => /^[A-Za-z0-9]+$/.test(d.id) && d.id.length <= 24), "des identifiants que la progression accepte");
  ok(!DC.some(d => api.DEFIS.some(x => x.id === d.id)), "aucun identifiant partagé avec les défis généraux");
  const absents = DC.filter(d => !Object.keys(S).some(k => (S[k].pays || "FR") === d.ch && S[k].d1.concat(S[k].d2).includes(d.club)));
  ok(absents.length === 0, "chaque club existe dans une saison de son championnat" + (absents.length ? " : " + absents.map(d => d.id).join(", ") : ""));
  ok(DC.every(d => !d.dep || (S[d.dep] && S[d.dep].d1.concat(S[d.dep].d2).includes(d.club))), "une saison de départ imposée existe et contient le club");
  ok(DC.every(d => ["titre", "maintien", "montee", "top", "coupe", "europe", "c1", "double", "invincibles"].includes(d.q) && d.pts > 0), "chaque défi a une règle connue et des points");
  ok(!DC.some(d => /—/.test(d.nom)), "aucun tiret long");
  const R = (o) => Object.assign({ club: "GUI", ch: "FR", div: 1, rang: 10, an: 3, dep: "1995-96", coupes: [] }, o);
  const D = id => api.DEFI_DE[id];
  ok(api.defiClubRempli(D("cGUI1"), R({ rang: 17 }), null, 20) && !api.defiClubRempli(D("cGUI1"), R({ rang: 18 }), null, 20), "maintien : 17ᵉ oui, 18ᵉ non");
  ok(!api.defiClubRempli(D("cGUI1"), R({ div: 2, rang: 1 }), null, 20), "le maintien ne se joue qu'en première division");
  ok(!api.defiClubRempli(D("cGUI1"), R({ club: "LEN" }), null, 20), "un autre club ne remplit pas le défi de Guingamp");
  ok(!api.defiClubRempli(D("cLIV1"), R({ club: "LIV", ch: "FR", rang: 1 }), null, 20), "le championnat compte : un LIV français ne sert pas Liverpool");
  ok(api.defiClubRempli(D("cOM1"), R({ club: "OM", div: 2, rang: 2, an: 1 }), null, 20), "l'OM remonte dès 1995-96");
  ok(!api.defiClubRempli(D("cOM1"), R({ club: "OM", div: 2, rang: 2, an: 2 }), null, 20), "pas en deuxième année");
  ok(!api.defiClubRempli(D("cOM1"), R({ club: "OM", div: 2, rang: 2, an: 1, dep: "1994-95" }), null, 20), "pas depuis une autre saison de départ");
  ok(api.defiClubRempli(D("cAJA1"), R({ club: "AJA", rang: 1, coupes: ["CN"] }), null, 20) && !api.defiClubRempli(D("cAJA1"), R({ club: "AJA", rang: 1 }), null, 20), "le doublé exige la coupe");
  ok(api.defiClubRempli(D("cMON1"), R({ club: "MON", coupes: ["C1"] })) && !api.defiClubRempli(D("cMON1"), R({ club: "MON", coupes: ["C3"] })), "la C1, pas une autre coupe");
  ok(api.defiClubRempli(D("cARS1"), R({ club: "ARS", ch: "ANG", rang: 1 }), true) && !api.defiClubRempli(D("cARS1"), R({ club: "ARS", ch: "ANG", rang: 1 }), null), "les invincibles ne se rattrapent pas sans les matchs");
  /* en fin de saison, dans une vraie partie */
  api.nouvellePartie("GUI", "1995-96"); const G = api.getG(); vide(api); G.notifs = []; G.histo = []; G.div = 1;
  api.defisFinSaison(15, []);
  ok(api.defiReussi("cGUI1") && G.notifs.some(n => /Se maintenir en première division · \+400 pts/.test(n)), "Guingamp 15ᵉ : défi de club réussi, annoncé au debrief");
  ok(!api.defiReussi("cGUI2") && !api.defiReussi("cLEN1"), "rien d'autre");
  /* rattrapage */
  vide(api); api.prog().resultats = [{ pid: "x", ch: "ANG", dep: "ANG-1995-96", an: 2, club: "NEW", div: 1, rang: 1, coupes: [] }];
  api.defisConstate();
  ok(api.defiReussi("cNEW1") && api.defiReussi("titre"), "un titre de Newcastle déjà rangé rapporte son défi de club");
  /* la fiche du club à l'accueil */
  api.setAccueil("1995-96"); api.ficheClubAccueil("OM");
  ok(/🎯 <b>Remonter en première division dès la première saison<\/b>/.test(FICHE.innerHTML) && /Gagner la Ligue des champions/.test(FICHE.innerHTML), "la fiche de l'OM en 1995-96 montre ses deux défis");
  api.setAccueil("1990-91"); api.ficheClubAccueil("OM");
  ok(!/dès la première saison/.test(FICHE.innerHTML) && /Gagner la Ligue des champions/.test(FICHE.innerHTML), "en 1990-91, le défi de la remontée n'apparaît pas");
  api.setAccueil("1995-96"); api.ficheClubAccueil("AUX" in {} ? "AUX" : api.SAISONS["1995-96"].d1.find(id => !DC.some(d => d.club === id)));
  ok(!/🎯/.test(FICHE.innerHTML), "un club sans défi n'affiche rien");
  /* l'écran */
  api.ecranTrophees(); const h = APP.innerHTML;
  ok(/Les défis de club/.test(h) && (h.match(/trDefiClub/g) || []).length === DC.length, "la salle liste tous les défis de club");
  ok(/✅ <svg[\s\S]*?Newcastle/.test(h) || /trDefi ok"><span class="trDefiClub">✅/.test(h), "le défi de Newcastle est coché");
  ok(new RegExp(`/${api.DEFIS.length + DC.length} défis`).test(h), "le compteur compte toutes les familles");
}

/* ===== L) la boutique ===== */
console.log("L) La boutique à points");
{
  api = appareil(nouveauLS()); const p = api.prog();
  const S0 = api.SAISONS["1995-96"], club = S0.d1[3];
  ok(api.soldePoints() === 0 && api.achatPossible("tresor") === "points", "sans points, rien ne s'achète");
  ok(api.BOUTIQUE.every(a => a.prix > 0 && ["perm", "coup"].includes(a.ray) && !/—/.test(a.nom + a.sous)), "chaque article a un rayon, un prix, et pas de tiret long");
  p.defis = [{ id: "titre", t: 1 }, { id: "europe", t: 2 }, { id: "invincibles", t: 3 }, { id: "double", t: 4 }]; // 2 300 pts
  ok(api.soldePoints() === 2300, "2 300 points gagnés, 2 300 à dépenser");
  ok(api.achatPossible("infirmerie") === "partie", "un coup de pouce exige une partie en cours");
  ok(api.achete("tresor") && api.acquis("tresor") && api.soldePoints() === 1300, "le trésor de guerre coûte 1 000 points");
  ok(api.achete("tresor") === false && api.soldePoints() === 1300, "un avantage permanent ne s'achète qu'une fois");
  p.defis.push({ id: "fidele", t: 5 }, { id: "decennie", t: 6 }); // +400 → 1 700 à dépenser
  ok(api.achete("tribune") && api.soldePoints() === 200, "la tribune coûte 1 500 points, il en reste 200");
  ok(api.achatPossible("president") === "points" && api.achete("president") === false, "plus assez de points : refusé");
  p.achats.push({ id: "president", art: "president", t: 9 }); // comme après la fusion de deux appareils qui ont chacun dépensé
  ok(api.depensePoints() === 3100 && api.soldePoints() === 0, "dépensé plus que gagné : le solde s'arrête à zéro, jamais en dessous");
  /* les avantages permanents s'appliquent aux carrières neuves */
  const sansAvant = (() => { const a2 = appareil(nouveauLS()); a2.nouvellePartie(club, "1995-96"); const G2 = a2.getG(); return { b: G2.budget, cap: a2.clubById(club).cap }; })();
  api.nouvellePartie(club, "1995-96"); let G = api.getG();
  ok(G.budget === sansAvant.b + 10e6, `trésor : +10 M au départ (${sansAvant.b / 1e6} → ${G.budget / 1e6})`);
  ok(api.clubById(club).cap === sansAvant.cap + 3000, `tribune : +3 000 places (${sansAvant.cap} → ${api.clubById(club).cap})`);
  ok(G.news.some(n => /Vos avantages vous suivent/.test(n)), "une dépêche le dit");
  /* les coups de pouce */
  for (const id of ["deuxPays", "cles3", "montee", "coupe", "podium", "serie6", "murs10", "buts70", "forteresse"]) p.defis.push({ id, t: 10 }); // +1 900 → 1 500 à dépenser
  const moi = api.clubById(G.monClub), j0 = moi.joueurs[0], j1 = moi.joueurs[1];
  j0.bless = 4; j1.susp = 2; j0.moral = 40;
  ok(api.achete("infirmerie") && j0.bless === 0, "vider l'infirmerie soigne tout le monde");
  ok(api.achatPossible("infirmerie") === "saison" && api.achete("infirmerie") === false, "une fois par saison");
  ok(api.achete("amnistie") && j1.susp === 0, "l'amnistie lève les suspensions");
  ok(api.achete("tournee") && j0.moral === 55, "la tournée remonte le moral de 15");
  const b0 = G.budget; ok(api.achete("rallonge") && G.budget === b0 + 5e6, "la rallonge ajoute 5 M");
  G.saisonIdx = 2; j0.bless = 3;
  ok(api.achatPossible("infirmerie") === (api.soldePoints() >= 150 ? null : "points"), "la saison suivante, le coup de pouce revient");
  /* fusion et nettoyage */
  const a = api.progVide(), b = api.progVide();
  a.achats = [{ id: "tresor", art: "tresor", t: 1 }, { id: "rallonge-X-1", art: "rallonge", t: 2 }];
  b.achats = [{ id: "tresor", art: "tresor", t: 5 }, { id: "rallonge-X-2", art: "rallonge", t: 3 }];
  const f = api.progFusionne(a, b);
  ok(f.achats.length === 3, "la fusion compte un achat une seule fois (même identifiant)");
  ok(api.progEmpreinte(a) !== api.progEmpreinte(f), "un achat de plus change l'empreinte");
  const n = api.progNette({ achats: [{ id: "tresor", art: "tresor" }, { id: "<x>", art: "tresor" }, { id: "y", art: "Tresor!" }, null] });
  ok(n.achats.length === 1, "seuls les achats propres passent");
  /* l'écran */
  const h = api.boutiqueHTML(false);
  ok(/Pour toutes vos carrières/.test(h) && /Pour la saison en cours/.test(h), "les deux rayons");
  ok(/✅ Acquis/.test(h) && (h.match(/class="boArt/g) || []).length === api.BOUTIQUE.length, "chaque article, les acquis marqués");
  api.ecranTrophees(); ok(/La boutique/.test(APP.innerHTML) && /gagnés/.test(APP.innerHTML), "la salle des trophées porte la boutique et le solde");
}

console.log(FAILS ? `\n${FAILS} ÉCHEC(S)` : "\nTOUT EST VERT");
process.exit(FAILS ? 1 : 0);
