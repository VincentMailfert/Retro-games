/* Harnais de L'HOMME DU MATCH et de L'ALMANACH — MULTIPLEX 95 (v1.06)
   Deux ajouts qui ne touchent pas au moteur mais relisent ce qu'il produit :
     A) une distinction par rencontre, dans TOUTE la division (pas seulement votre match)
     B) le barème : un rouge disqualifie, une cage inviolée pèse, la victoire départage
     C) votre homme du match gagne du moral et un mot dans le debrief
     D) le compteur `j.hdm` se remet à zéro à l'intersaison, comme les buts
     E) le classement des hommes du match se rend dans l'onglet Classement
     F) l'almanach retient la phrase qui claque et la dépêche qui sent le soufre
     G) le bilan de saison se calcule ET se rend — et il se rend AVANT l'intersaison
     H) le tout ne pèse presque rien dans la sauvegarde
   Usage : node harness-hdm.cjs                                                              */
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
/* un vrai nœud pour #app : les écrans y écrivent, on relit ce qu'ils ont écrit */
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

const api = new Function(script + "\n;return {nouvellePartie,jouerJournee,intersaison,simuleMatch,hommeDuMatch,designeHdm,motifHdm,faitsDuFil,eclatLigne,retientAlmanach,bilanSaison,ecranBilan,equipeType,matchDeLannee,coteSaison,ecranClassement,ecranCalendrier,clubById,byUid,onze,MOTS_ECLAT,MOTS_SOUFRE,CLUBS,getG:function(){return G;}};")();

let F = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) F++; };

/* ===== A) une distinction par rencontre, dans toute la division ===== */
console.log("A) Une distinction par rencontre, et pas seulement dans votre match");
api.nouvellePartie("LEN");
let G = api.getG();
{
  let total = 0, horsClub = 0, pepin = null;
  for (let d = 0; d < 38; d++) {
    const avant = G.clubs.flatMap(c => c.joueurs).reduce((s, j) => s + (j.hdm || 0), 0);
    try { api.jouerJournee(); } catch (e) { pepin = "J" + (d + 1) + " → " + e.message; break; }
    const apres = G.clubs.flatMap(c => c.joueurs).reduce((s, j) => s + (j.hdm || 0), 0);
    total += apres - avant;
  }
  ok(!pepin, pepin || "38 journées jouées sans exception");
  // 10 matchs par journée, 38 journées : au plus 380 distinctions (une rencontre à 0-0 sans gardien
  // identifiable n'en produit aucune — le cas est rarissime mais il ne doit pas casser le compte)
  ok(total >= 360 && total <= 380, "distinctions décernées sur la saison : " + total + " (10 par journée, 380 au plafond)");
  const clubsDecores = new Set(G.clubs.flatMap(c => c.joueurs).filter(j => (j.hdm || 0) > 0).map(j => j.club));
  horsClub = [...clubsDecores].filter(id => id !== G.monClub).length;
  ok(horsClub >= 18, "les rencontres muettes désignent aussi : " + horsClub + " clubs adverses ont un homme du match");
  const top = G.clubs.flatMap(c => c.joueurs).sort((a, b) => (b.hdm || 0) - (a.hdm || 0))[0];
  ok(top && top.hdm >= 3 && top.hdm <= 30, "le meilleur de la division en cumule " + (top && top.hdm) + " — ni zéro, ni toute la saison");
}

/* ===== B) le barème ===== */
console.log("\nB) Le barème : le rouge disqualifie, la cage inviolée pèse, la victoire départage");
{
  const h = G.clubs[0], a = G.clubs[1];
  const buteur = h.joueurs.find(j => j.pos === "A");
  const passeur = h.joueurs.find(j => j.pos === "M");
  const gkH = api.onze(h).find(j => j.pos === "G");
  const gkA = api.onze(a).find(j => j.pos === "G");

  // un doublé bat une passe décisive
  let e = api.hommeDuMatch(h, a, 2, 1, [{ u: buteur.uid, b: 1 }, { u: buteur.uid, b: 1 }, { u: passeur.uid, p: 1 }], gkH, gkA);
  ok(e && e.j === buteur, "un doublé passe devant une passe décisive : " + (e && e.j.nom));
  ok(api.motifHdm(e) === "un doublé", "le motif se dit en français : « " + api.motifHdm(e) + " »");

  // le même doublé, mais l'auteur a fini au vestiaire : il sort du palmarès
  e = api.hommeDuMatch(h, a, 2, 1, [{ u: buteur.uid, b: 1 }, { u: buteur.uid, b: 1 }, { u: passeur.uid, p: 1 }, { u: buteur.uid, r: 1 }], gkH, gkA);
  ok(e && e.j === passeur, "expulsé, le buteur est écarté et la passe décisive l'emporte : " + (e && e.j.nom));

  // 0-0 : le gardien qui a tenu sa cage est le seul candidat possible
  e = api.hommeDuMatch(h, a, 0, 0, [], gkH, gkA);
  ok(e && (e.j === gkH || e.j === gkA), "0-0 : c'est un gardien qu'on décore (" + (e && e.j.nom) + ")");
  ok(e && api.motifHdm(e) === "la cage inviolée", "et son motif est la cage inviolée");

  // un but sec en gagnant 1-0 bat le gardien adverse battu ; le portier vainqueur reste en lice
  e = api.hommeDuMatch(h, a, 1, 0, [{ u: buteur.uid, b: 1 }], gkH, gkA);
  ok(e && e.j === buteur, "1-0 : le buteur passe devant son gardien (" + (e && e.j.nom) + ")");

  // aucun fait de jeu exploitable et pas de clean sheet : personne n'est décoré plutôt qu'un nom au hasard
  ok(api.hommeDuMatch(h, a, 1, 1, [], null, null) === null, "sans feuille de match lisible, personne n'est nommé");

  // la lecture du téléscripteur (votre match) donne la même matière que le tableau brut
  const fil = [
    { g: { uid: buteur.uid, pasUid: passeur.uid } },
    { c: { rouge: true, uid: gkA.uid } },
    { t: "amb", x: "rien du tout" },
  ];
  const f = api.faitsDuFil(fil);
  ok(f.length === 3 && f[0].b === 1 && f[1].p === 1 && f[2].r === 1, "faitsDuFil relit but, passe décisive et rouge sur le fil du téléscripteur");
}

/* ===== C) votre homme du match : moral et debrief ===== */
console.log("\nC) Votre homme du match repart avec du moral et un mot dans le debrief");
{
  api.nouvellePartie("PSG");
  G = api.getG();
  // `horsPlafond` sort du compte les décorés déjà à 100 de moral : le leur ne PEUT pas monter, et les
  // garder au dénominateur faisait tomber ce harnais sous la barre un soir sur cent sans qu'aucune
  // régression ne s'y cache. Le plafond n'explique d'ailleurs pas tout : le moral d'un homme bouge pour
  // plusieurs raisons le même jour, et il arrive qu'une saison compte un décoré rentré à l'équilibre.
  // Mesuré sur 199 saisons : 0,92 au pire, 0,996 en moyenne — la barre à 0,8 laisse de la marge.
  let vuChezMoi = 0, vuEnFace = 0, moralMonte = 0, horsPlafond = 0;
  for (let d = 0; d < 34; d++) {
    const avant = {};
    api.clubById(G.monClub).joueurs.forEach(j => { avant[j.uid] = (j.moral == null ? 65 : j.moral); });
    api.jouerJournee();
    if (!G.hdm) continue;
    const j = api.byUid(G.hdm.uid);
    if (!j) continue;
    if (j.club === G.monClub) { vuChezMoi++;
      if (avant[j.uid] < 100) { horsPlafond++; if ((j.moral || 65) > avant[j.uid]) moralMonte++; } }
    else vuEnFace++;
    if (!(G.notifs || []).some(n => /Homme du match/.test(n))) { F++; console.log("  ✗ J" + (d + 1) + " : pas de ligne de debrief pour l'homme du match"); break; }
  }
  ok(vuChezMoi > 0 && vuEnFace > 0, "sur une saison, l'honneur revient tantôt à vous (" + vuChezMoi + "), tantôt à l'adversaire (" + vuEnFace + ")");
  ok(horsPlafond > 0 && moralMonte >= horsPlafond * 0.8, "le moral du décoré monte presque toujours (" + moralMonte + "/" + horsPlafond + " hors plafond ; " + (vuChezMoi - horsPlafond) + " étaient déjà à 100)");
  ok(G.hdm && G.hdm.nom && G.hdm.motif && G.hdm.club, "G.hdm porte de quoi écrire la ligne de la feuille de match : " + JSON.stringify(G.hdm));
}

/* ===== D) remise à zéro à l'intersaison ===== */
console.log("\nD) Le compteur de distinctions se remet à zéro avec les buts");
{
  G.vire = null;
  for (let d = G.journee; d < 38; d++) api.jouerJournee();
  const avant = G.clubs.flatMap(c => c.joueurs).reduce((s, j) => s + (j.hdm || 0), 0);
  ok(avant > 0, "la saison s'achève avec " + avant + " distinctions au compteur");
  const B = api.bilanSaison(); // le bilan se lit AVANT que l'intersaison ne balaie tout
  api.intersaison();
  const apres = G.clubs.concat(G.autre).flatMap(c => c.joueurs).reduce((s, j) => s + (j.hdm || 0), 0);
  ok(apres === 0, "après l'intersaison, plus une seule distinction dans les DEUX divisions");
  ok(!G.alm.phrase && !G.alm.depeche && !G.hdm, "l'almanach et l'homme du match de la journée sont remis à neuf");
  ok(B.xi.length === 11, "et le bilan lu juste avant tenait bien ses onze joueurs");
}

/* ===== E) le classement des hommes du match se rend ===== */
console.log("\nE) Le classement des hommes du match, dans l'onglet Classement");
{
  api.nouvellePartie("AUX");
  G = api.getG();
  let pepin = null;
  try { api.ecranClassement(); } catch (e) { pepin = e.message; }
  ok(!pepin, pepin || "l'écran se rend dès la journée 1, compteurs vides");
  ok(/Hommes du match/.test(APP._h) && /Personne n'a encore été désigné/.test(APP._h), "et il annonce honnêtement qu'il n'y a encore personne");
  for (let d = 0; d < 12; d++) api.jouerJournee();
  api.ecranClassement();
  ok(/Hommes du match/.test(APP._h), "le panneau est là après douze journées");
  const decore = G.clubs.flatMap(c => c.joueurs).sort((a, b) => (b.hdm || 0) - (a.hdm || 0))[0];
  ok(APP._h.indexOf(decore.nom) >= 0, "le plus décoré y figure : " + decore.nom + " (" + decore.hdm + ")");
  ok(/Buteurs/.test(APP._h) && /Passeurs décisifs/.test(APP._h) && /grid3/.test(APP._h), "buteurs et passeurs n'ont pas été chassés : les trois tables tiennent en grille de trois");
}

/* ===== F) l'almanach retient ce qui mérite de rester ===== */
console.log("\nF) L'almanach retient la phrase qui claque et la dépêche qui sent le soufre");
{
  const banal = api.eclatLigne("Le club communique sur son organigramme.", api.MOTS_ECLAT);
  const fort = api.eclatLigne("« LA MALÉDICTION EST MORTE : Lens champion pour la première fois de son histoire ! »", api.MOTS_ECLAT);
  ok(fort > banal && banal === 0, "une ligne de titreur l'emporte sur une brève (" + fort + " contre " + banal + ")");
  const propre = api.eclatLigne("Billetterie : 18 000 spectateurs, recette 1,26 MF.", api.MOTS_SOUFRE);
  const sale = api.eclatLigne("L'AFFAIRE ÉCLATE ! Perquisitions au siège : 6 points de pénalité, 8 MF d'amende.", api.MOTS_SOUFRE);
  ok(sale > propre, "la perquisition sent plus le soufre que la recette du samedi (" + sale + " contre " + propre + ")");

  G = api.getG();
  G.alm = { phrase: null, depeche: null };
  G.presse = ["« Une saison de plus au stade Bollaert. »"];
  G.news = ["Billetterie : 18 000 spectateurs."];
  api.retientAlmanach();
  const faible = G.alm.phrase;
  G.presse = ["« LA MALÉDICTION EST MORTE : Lens CHAMPION pour la première fois de son histoire ! »"];
  G.news = ["L'AFFAIRE ÉCLATE ! Perquisitions au siège : 6 points de pénalité et 8 MF d'amende."];
  api.retientAlmanach();
  ok(/MALÉDICTION/.test(G.alm.phrase.t), "la phrase forte chasse la précédente : « " + G.alm.phrase.t.slice(0, 48) + "… »");
  ok(!faible || G.alm.phrase.s > faible.s, "et c'est bien le score qui tranche, pas l'ordre d'arrivée");
  ok(/AFFAIRE/.test(G.alm.depeche.t), "la dépêche sulfureuse est retenue : « " + G.alm.depeche.t.slice(0, 40) + "… »");
  G.presse = ["« Une brève sans intérêt. »"]; G.news = ["Une autre brève."];
  api.retientAlmanach();
  ok(/MALÉDICTION/.test(G.alm.phrase.t) && /AFFAIRE/.test(G.alm.depeche.t), "une semaine calme n'efface pas ce qui était retenu");
}

/* ===== G) le bilan de saison se calcule et se rend ===== */
console.log("\nG) Le bilan de fin de saison : une page d'almanach qui se lit");
{
  api.nouvellePartie("BOR");
  G = api.getG();
  for (let d = 0; d < 38; d++) api.jouerJournee();
  ok(G.finie === true, "la saison est déclarée terminée à la 38e journée");
  const B = api.bilanSaison();
  ok(B.xi.length === 11, "l'équipe type compte onze joueurs : " + B.xi.map(j => j.pos).join(""));
  ok(B.xi.filter(j => j.pos === "G").length === 1 && B.xi.filter(j => j.pos === "D").length === 4
    && B.xi.filter(j => j.pos === "M").length === 4 && B.xi.filter(j => j.pos === "A").length === 2,
    "et elle respecte le 4-4-2 du jeu");
  ok(new Set(B.xi.map(j => j.uid)).size === 11, "aucun joueur n'y figure deux fois");
  ok(B.buteur && B.buteur.buts >= 8, "le meilleur buteur de la division en a mis " + (B.buteur && B.buteur.buts));
  ok(B.match && B.match.j >= 1 && B.match.j <= 38 && (B.match.sh + B.match.sa) >= 4,
    "le match de l'année est daté et spectaculaire : J" + (B.match && B.match.j) + ", " + (B.match && (B.match.sh + "-" + B.match.sa)));
  ok(B.champion && B.rang >= 1 && B.rang <= 20, "champion et classement final relus : " + (B.champion && B.champion.nom) + ", vous " + B.rang + "e");
  ok(B.hommeSaison && B.hommeSaison.hdm > 0, "l'homme de la saison du club est désigné : " + (B.hommeSaison && B.hommeSaison.nom + " (" + B.hommeSaison.hdm + ")"));

  let pepin = null;
  const vire = G.vire; G.vire = null; // le président a pu remercier le manager : on teste les deux sorties
  try { api.ecranBilan(); } catch (e) { pepin = e.message; }
  ok(!pepin, pepin || "l'écran se rend sans exception");
  ok(/ALMANACH/.test(APP._h) && /L'ÉQUIPE TYPE/.test(APP._h) && /LE BUTEUR/.test(APP._h)
    && /L'HOMME DE LA SAISON/.test(APP._h) && /LE MATCH DE L'ANNÉE/.test(APP._h)
    && /LA PHRASE DE LA SAISON/.test(APP._h) && /LA DÉPÊCHE/.test(APP._h),
    "les six chapitres demandés sont à l'écran");
  ok(APP._h.indexOf(B.buteur.nom) >= 0 && APP._h.indexOf(B.xi[0].nom) >= 0, "le buteur et le gardien de l'équipe type y sont nommés");
  ok(/PASSER À L'INTERSAISON/.test(APP._h), "et le bouton d'intersaison reste au bout de la page");

  // remercié au coup de sifflet final : la page reste lisible, mais elle ne mène plus à l'intersaison
  G.vire = "objectif";
  api.ecranBilan();
  ok(/Revenir/.test(APP._h) && !/PASSER À L'INTERSAISON/.test(APP._h), "limogé, le bouton du bas devient « ← Revenir »");
  ok(/ALMANACH/.test(APP._h) && APP._h.indexOf(B.buteur.nom) >= 0, "et l'almanach reste entier : c'est la saison qu'on relit le plus");
  api.ecranCalendrier();
  ok(/LIMOGÉ/.test(APP._h) && /Lire le bilan de la saison/.test(APP._h), "l'écran LIMOGÉ propose d'aller lire le bilan");
  G.vire = vire;

  // cas limite : un bilan demandé sur une saison à peine entamée ne doit pas exploser
  api.nouvellePartie("GUI");
  G = api.getG();
  api.jouerJournee();
  pepin = null;
  try { api.bilanSaison(); api.ecranBilan(); } catch (e) { pepin = e.message; }
  ok(!pepin, pepin || "après UNE journée, le bilan se calcule et se rend quand même (carrière reprise en route)");
}

/* ===== H) le poids de la sauvegarde ===== */
console.log("\nH) Ce que tout cela pèse dans la sauvegarde");
{
  api.nouvellePartie("MON");
  G = api.getG();
  for (let d = 0; d < 20; d++) api.jouerJournee();
  const total = JSON.stringify(G).length;
  const alm = JSON.stringify(G.alm).length + JSON.stringify(G.hdm || null).length;
  const compteurs = G.clubs.concat(G.autre).flatMap(c => c.joueurs).length * 8; // « "hdm":12, » par joueur, au pire
  ok(alm < 1200, "l'almanach et l'homme du match de la journée tiennent en " + alm + " octets");
  ok((alm + compteurs) / total < 0.02, "soit moins de 2 % de la sauvegarde avec les compteurs (" + Math.round((alm + compteurs) / total * 1000) / 10 + " %)");
}

console.log(F ? "\n❌ HOMME DU MATCH : " + F + " ÉCHEC(S)" : "\n✅ HOMME DU MATCH & ALMANACH : TOUT EST VERT");
process.exit(F ? 1 : 0);
