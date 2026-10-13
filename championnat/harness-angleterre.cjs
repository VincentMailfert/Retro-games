/* Harnais de validation — LE HARNAIS DE PAYS, ANGLETERRE (ANG-E)
   Cinquième et dernière étape du lot structure qui précède l'Angleterre. Les quatre premières ont posé le
   cadre (ANG-A), les clubs (ANG-B), le mur européen (ANG-C) et les textes (ANG-D) ; celle-ci pose LE
   GARDIEN DU PLATEAU, c'est-à-dire le harnais que chacune des vingt saisons anglaises devra passer avant
   d'être livrée, comme `harness9900.cjs` le fait pour une saison française.
   Il est GÉNÉRIQUE : il balaie `SAISONS` à la recherche des entrées `pays:"ANG"` et joue la batterie sur
   CHACUNE. Tant qu'aucune n'est enregistrée, il la joue sur un PLATEAU D'ESSAI bâti sur les vrais clubs
   d'ANG-B (effectifs procéduraux, exprès) — c'est une répétition générale, elle est annoncée comme telle,
   et les contrôles qui ne valent que sur de la donnée curée se taisent au lieu de mentir.
     A) les saisons anglaises au registre : clé préfixée, champ pays, nom, titre, sous-titre
     B) le plateau : 20 + 20, quarante codes uniques, tous anglais, toutes métadonnées résolues
     C) les effectifs : postes, bornes, un gardien réel, et les comptes de la curation
     D) aucun doublon : dans la saison, contre les autres saisons anglaises, et les prénoms
     E) le mur européen : aucun club des deux côtés, seize clubs au tableau, sièges = SIEGES_ANG
     F) le cadre du pays en situation : libellés d'époque, monnaie, coupe nationale, sélection, été
     G) six saisons de carrière : aucune exception, vieillissement, calibrage
   Usage : node harness-angleterre.cjs                                                                  */
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
const ls = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
global.document = makeStub();
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, localStorage: ls, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.localStorage = ls; global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0); global.cancelAnimationFrame = (id) => clearTimeout(id);

const epilogue = "\n;return {PAYS,SAISONS,SAISON_DEFAUT,SIEGES_ANG,CLUBS_ANG,CLUBS,CLUBS_D2,CLUBS_EXTRA," +
  "EUROCLUBS,COMPETS,CIBLE,PLANCHER,PRENOMS_VRAIS,CLUBS_AMATEURS,CLUBS_AMATEURS_ANG," +
  "metaClub,metaSaison,nouvellePartie,jouerJournee,intersaison,anneeJeu,libDiv,tagDiv,libCoupeNat," +
  "libCoupeLigue,libChampion,natPays,honneurEte,adjPays,clubsAmateurs,plateauDeSaison,plateauEnCours," +
  "viviersEuroDe,vivierEuro,siegePays,euroInit,MM,UU," +
  "getG:function(){return G;}};";
const api = new Function(script + epilogue)();
const { PAYS, SAISONS, SIEGES_ANG, CLUBS_ANG, EUROCLUBS, CIBLE, PRENOMS_VRAIS,
  CLUBS_AMATEURS, CLUBS_AMATEURS_ANG } = api;

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const idle = (m) => console.log("  · " + m);
const extrait = (l, n = 6) => l.slice(0, n).join(", ") + (l.length > n ? ` … (+${l.length - n})` : "");

const CODES_ANG = new Set(CLUBS_ANG.map(c => c.id));
const CODES_FR = new Set([].concat(api.CLUBS || [], api.CLUBS_D2 || [], api.CLUBS_EXTRA || []).map(c => c.id));
/* Les quatre codes qu'ANB-B partage EXPRÈS avec le vivier d'Europe, pour qu'ANG-C puisse réconcilier. */
const PARTAGES = ["BLB", "EVE", "FOR", "LIV"];

/* ---------------------------------------------------------------------------------------------------
   Le plateau d'essai de la répétition générale. Vingt clubs de l'élite 1995-96 et vingt autres clubs
   d'ANG-B en dessous — un PLATEAU D'ESSAI, pas un classement relevé (c'est le travail des vingt saisons
   anglaises à venir). Mêmes listes que `harness-europe-ang.cjs` et `harness-textes-ang.cjs`, pour qu'un
   écart entre les trois harnais se voie. Effectifs PROCÉDURAUX : on éprouve le cadre, pas la donnée.
   --------------------------------------------------------------------------------------------------- */
const ESSAI_D1 = ["ARS", "AVL", "BLB", "BOL", "CHE", "COV", "EVE", "LEE", "LIV", "MCI",
  "MUN", "MID", "NEW", "FOR", "QPR", "SHW", "SOU", "TOT", "WHU", "WIM"];
const CLE_ESSAI = "ANG-1990-91";
function plateauEssai(an = 1990) {
  return {
    pays: "ANG", an, titre: an + "-" + String((an + 1) % 100).padStart(2, "0"),
    nom: "Répétition générale", sous: "Plateau d'essai du harnais de pays, retiré aussitôt.",
    d1: ESSAI_D1.slice(), d2: CLUBS_ANG.map(c => c.id).filter(id => !ESSAI_D1.includes(id)).slice(0, 20),
    starsD1: {}, starsD2: {},
    euroC1: SIEGES_ANG[an].C1, euroC2: SIEGES_ANG[an].C2, euroC3: SIEGES_ANG[an].C3,
  };
}

/* Les saisons anglaises DU REGISTRE. C'est la seule liste qui compte : le jour où « ANG-1995-96 » entre
   dans `SAISONS`, elle est reprise ici toute seule et passe la batterie sans qu'on touche au harnais. */
let CLES = Object.keys(SAISONS).filter(k => (SAISONS[k].pays || "FR") === "ANG");
const REPET = CLES.length === 0;
if (REPET) { SAISONS[CLE_ESSAI] = plateauEssai(); CLES = [CLE_ESSAI]; }

console.log(REPET
  ? "RÉPÉTITION GÉNÉRALE — aucune saison anglaise au registre, la batterie tourne sur un plateau d'essai.\n"
    + "Le jour où la première saison anglaise entre dans SAISONS, elle est prise ici automatiquement.\n"
  : `Saisons anglaises au registre : ${CLES.length} (${extrait(CLES, 8)})\n`);

/* ===== A) Les saisons anglaises au registre ===== */
console.log("A) Le registre : clé préfixée, champ pays, et les trois textes de la saison");
for (const cle of CLES) {
  const S = SAISONS[cle];
  ok(S.pays === "ANG", `${cle} : champ pays = "ANG" (la vérité sur le pays est le champ, pas la clé)`);
  /* Convention d'ANG-A : la France garde ses clés NUES, tout autre pays préfixe la sienne du code pays. */
  ok(/^ANG-\d{4}-\d{2}$/.test(cle), `${cle} : clé préfixée du code pays, au créneau daté`);
  ok(Number.isInteger(S.an) && S.an >= 1990 && S.an <= 2009, `${cle} : année de base ${S.an} dans la fenêtre du chantier`);
  const attenduTitre = S.an + "-" + String((S.an + 1) % 100).padStart(2, "0");
  ok(S.titre === attenduTitre, `${cle} : titre « ${S.titre} » = le créneau daté de son année`);
  /* `titre` alimente G.saison, donc les sauvegardes : la clé et le titre ne doivent pas divergerner. */
  ok(cle === "ANG-" + S.titre, `${cle} : la clé et le titre disent la même saison`);
  ok(typeof S.nom === "string" && S.nom.length > 0 && S.nom.length <= 34,
    `${cle} : nom de saison « ${S.nom} » (${(S.nom || "").length} caractères, trente-quatre au plus)`);
  ok(typeof S.sous === "string" && S.sous.length > 0, `${cle} : sous-titre présent`);
  /* Consigne auteur du 25/09/2026 : aucun tiret long dans le texte du jeu. */
  const longs = [S.nom, S.sous].filter(t => /—/.test(t || ""));
  ok(longs.length === 0, `${cle} : aucun tiret long dans le nom ni le sous-titre`);
}

/* ===== B) Le plateau ===== */
console.log("\nB) Le plateau : 20 + 20, quarante clubs anglais uniques et résolus");
for (const cle of CLES) {
  const S = SAISONS[cle];
  ok(S.d1.length === 20, `${cle} : ${S.d1.length} clubs à l'élite (le moteur en veut 20)`);
  ok(S.d2.length === 20, `${cle} : ${S.d2.length} clubs à l'échelon du dessous (le moteur en veut 20)`);
  const tous = S.d1.concat(S.d2);
  ok(new Set(tous).size === 40, `${cle} : quarante codes uniques, aucun club dans les deux divisions`);
  const inconnus = tous.filter(id => !CODES_ANG.has(id));
  ok(inconnus.length === 0, `${cle} : tous les clubs viennent de CLUBS_ANG${inconnus.length ? " — " + extrait(inconnus) : ""}`);
  /* Le contrôle qui a des dents : un club FRANÇAIS ne doit jamais entrer dans un plateau anglais. Les
     quatre codes partagés avec le vivier d'Europe sont anglais et légitimes, ils ne sont pas français. */
  const francais = tous.filter(id => CODES_FR.has(id));
  ok(francais.length === 0, `${cle} : aucun club français dans le plateau${francais.length ? " — " + extrait(francais) : ""}`);
  const sansMeta = tous.filter(id => !api.metaClub(id));
  ok(sansMeta.length === 0, `${cle} : toutes les métadonnées résolues${sansMeta.length ? " — " + extrait(sansMeta) : ""}`);
  /* Un club sans stade ni capacité casse l'affluence, donc la recette, donc l'économie. */
  const creux = tous.filter(id => { const m = api.metaClub(id); return !m || !m.stade || !m.cap; });
  ok(creux.length === 0, `${cle} : chaque club a son stade et sa capacité${creux.length ? " — " + extrait(creux) : ""}`);
  /* Le stade doit être celui de l'ANNÉE (trente-cinq déménagements datés par ANG-B). */
  const horsEpoque = tous.filter(id => { const m = api.metaSaison(id, S.an); return !m || !m.stade || !m.cap; });
  ok(horsEpoque.length === 0, `${cle} : chaque club a un stade daté de ${S.an}${horsEpoque.length ? " — " + extrait(horsEpoque) : ""}`);
}

/* ===== C) Les effectifs ===== */
console.log("\nC) Les effectifs curés : postes, bornes, gardien réel, et les comptes");
for (const cle of CLES) {
  const S = SAISONS[cle];
  const curee = Object.keys(S.starsD1 || {}).length > 0;
  if (!curee) { idle(`${cle} : plateau d'essai aux effectifs procéduraux, les contrôles de curation se taisent`); continue; }
  const tous = S.d1.concat(S.d2);
  const pb = [];
  for (const id of tous) {
    const L = (S.d1.includes(id) ? S.starsD1 : S.starsD2)[id];
    if (!L || !L.length) { pb.push(id + " vide"); continue; }
    if (L.length < 14) pb.push(id + " maigre (" + L.length + ")");
    for (const t of L) {
      if (!["G", "D", "M", "A"].includes(t[1])) pb.push(id + " poste invalide " + t[0]);
      if (!(t[2] >= 15 && t[2] <= 40)) pb.push(id + " âge hors bornes " + t[0] + " " + t[2]);
      if (!(t[3] >= 55 && t[3] <= 90)) pb.push(id + " note hors bornes " + t[0] + " " + t[3]);
      if (!(t[4] >= t[3] && t[4] <= 97)) pb.push(id + " potentiel incohérent " + t[0]);
    }
    if (!L.some(t => t[1] === "G")) pb.push(id + " sans gardien réel");
  }
  ok(pb.length === 0, `${cle} : quarante effectifs valides (postes, 15-40 ans, notes ≤ 90, pot ≥ note)${pb.length ? " — " + extrait(pb) : ""}`);
  /* La curation vise vingt hommes par club à l'élite et dix-huit en dessous (méthode du chantier). */
  const nD1 = S.d1.reduce((s, id) => s + (S.starsD1[id] || []).length, 0);
  const nD2 = S.d2.reduce((s, id) => s + (S.starsD2[id] || []).length, 0);
  ok(nD1 === 400, `${cle} : ${nD1} hommes à l'élite (attendu 20 × 20)`);
  ok(nD2 === 360, `${cle} : ${nD2} hommes en dessous (attendu 20 × 18)`);
  /* « Aucun joueur inventé sur une saison réelle » : la source doit tenir le plateau presque seule. On
     compte les clubs que la source documente mal — plus de trois sous dix hommes, la saison bloque. */
  const maigres = tous.filter(id => ((S.d1.includes(id) ? S.starsD1 : S.starsD2)[id] || []).length < 10);
  ok(maigres.length <= 3, `${cle} : ${maigres.length} club(s) sous dix hommes documentés (la règle du chantier en tolère trois)${maigres.length ? " — " + extrait(maigres) : ""}`);
}

/* ===== D) Aucun doublon, et les prénoms ===== */
console.log("\nD) Aucun doublon de nom, et chaque vrai joueur a son prénom");
for (const cle of CLES) {
  const S = SAISONS[cle];
  if (!Object.keys(S.starsD1 || {}).length) { idle(`${cle} : effectifs procéduraux, le contrôle des doublons curés se tait`); continue; }
  const ou = {};
  for (const id in S.starsD1) for (const t of S.starsD1[id]) (ou[t[0]] = ou[t[0]] || []).push("D1:" + id);
  for (const id in S.starsD2) for (const t of S.starsD2[id]) (ou[t[0]] = ou[t[0]] || []).push("D2:" + id);
  const dup = Object.entries(ou).filter(([, s]) => s.length > 1);
  ok(dup.length === 0, `${cle} : aucun joueur dans deux clubs${dup.length ? " — " + extrait(dup.map(([n, s]) => n + " (" + s.join("+") + ")")) : ""}`);
  /* Piège de 98/99 : un prénom composé resté collé au patronyme (« J. Arne Riise »). Les particules
     font partie du patronyme et sont légitimes — la liste est celle des harnais de saison française,
     plus « Mio » et « Sarr » blanchis en 90/91 et « Aït » en 00/01. */
  const PARTICULES = new Set(["Le", "La", "Les", "De", "Del", "Della", "Da", "Das", "Dos", "Di", "Du",
    "Van", "Von", "Der", "Ten", "Ter", "El", "Al", "Ben", "Bin", "Mac", "Mc", "O", "Saint", "San",
    "Mio", "Sarr", "Aït"]);
  const suspects = Object.keys(ou).filter(n => {
    const m = /^[A-ZÀ-Þ]\.(-[A-ZÀ-Þ]\.)? ([A-ZÀ-Þ][a-zà-ÿ']+) [A-ZÀ-Þ]/.exec(n);
    return m && !PARTICULES.has(m[2]);
  });
  ok(suspects.length === 0, `${cle} : aucun prénom composé avalé par le patronyme${suspects.length ? " — " + extrait(suspects) : ""}`);
  /* Le prénom : consigne v1.46. `harness-prenoms.cjs` balaie tout le fichier ; ici le contrôle est
     RAMENÉ À LA SAISON, pour qu'un oubli nomme la saison anglaise au lieu de se perdre dans le tas. */
  const INI = /^\p{Lu}\.(?:[-\s]\p{L}\.)* /u;
  const aIni = Object.keys(ou).filter(n => INI.test(n));
  const sansPrenom = aIni.filter(n => !Object.prototype.hasOwnProperty.call(PRENOMS_VRAIS, n));
  ok(sansPrenom.length === 0, `${cle} : les ${aIni.length} noms à initiale ont leur entrée dans PRENOMS_VRAIS${sansPrenom.length ? " — " + extrait(sansPrenom) : ""}`);
  const faux = aIni.filter(n => { const p = PRENOMS_VRAIS[n]; return p && p[0].normalize("NFD")[0].toUpperCase() !== n[0].normalize("NFD")[0].toUpperCase(); });
  ok(faux.length === 0, `${cle} : chaque prénom commence par l'initiale affichée${faux.length ? " — " + extrait(faux) : ""}`);
}
/* D'une saison anglaise à l'autre, un même nom court doit désigner le MÊME homme (règle de 02/03,
   « la règle des homonymes vaut aussi d'une saison à l'autre ») : on le vérifie par l'âge, qui doit
   avancer exactement du nombre d'années qui séparent les deux saisons. */
if (CLES.length > 1) {
  const curees = CLES.filter(k => Object.keys(SAISONS[k].starsD1 || {}).length).sort((a, b) => SAISONS[a].an - SAISONS[b].an);
  const ageDe = (cle) => { const S = SAISONS[cle], m = {};
    for (const T of [S.starsD1, S.starsD2]) for (const id in T) for (const t of T[id]) m[t[0]] = t[2]; return m; };
  const ecarts = [];
  for (let i = 1; i < curees.length; i++) {
    const A = ageDe(curees[i - 1]), B = ageDe(curees[i]);
    const d = SAISONS[curees[i]].an - SAISONS[curees[i - 1]].an;
    for (const n in B) if (n in A && B[n] - A[n] !== d) ecarts.push(`${n} ${curees[i - 1]}→${curees[i]} (${A[n]}→${B[n]}, attendu +${d})`);
  }
  ok(ecarts.length === 0, `un nom court désigne le même homme d'une saison anglaise à l'autre${ecarts.length ? " — " + extrait(ecarts) : ""}`);
} else idle("une seule saison anglaise : le contrôle d'identité d'une saison à l'autre attend la suivante");

/* ===== E) Le mur européen ===== */
console.log("\nE) Le mur européen : on ne joue pas un club le mardi ET le samedi");
for (const cle of CLES) {
  const S = SAISONS[cle];
  /* Les sièges de la saison doivent être CEUX DE SON ANNÉE, relevés par ANG-C. C'est un vrai
     recoupement entre deux tables écrites séparément — sauf en répétition générale, où le plateau
     d'essai les recopie de SIEGES_ANG : le contrôle est alors circulaire, et on le dit. */
  const T = SIEGES_ANG[S.an];
  const meme = (a, b) => (a || []).slice().sort().join(",") === (b || []).slice().sort().join(",");
  const concordent = T && meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3);
  if (REPET) { idle(`${cle} : sièges recopiés de SIEGES_ANG par le plateau d'essai (recoupement circulaire, sans valeur ici)`); }
  else ok(concordent, `${cle} : les sièges européens sont ceux de SIEGES_ANG[${S.an}]`);
  /* La Coupe des Coupes n'existe plus après 1999, côté anglais comme côté français. */
  if (S.an >= 1999) ok((S.euroC2 || []).length === 0, `${cle} : euroC2 vide, la Coupe des Coupes a disparu en 1999`);
  /* Les trois listes doivent être DISJOINTES : nouvellePartie y lit la compétition d'un club. */
  const vus = new Set(); const croise = [];
  for (const k of ["euroC1", "euroC2", "euroC3"]) for (const id of (S[k] || [])) { if (vus.has(id)) croise.push(id); vus.add(id); }
  ok(croise.length === 0, `${cle} : aucun club dans deux compétitions${croise.length ? " — " + extrait(croise) : ""}`);
  /* Un siège ne vaut que pour un club du plateau : un club absent n'a pas de vestiaire (règle d'ANG-C). */
  const plateau = api.plateauDeSaison(S);
  const hors = [...vus].filter(id => !plateau.has(id));
  ok(hors.length === 0, `${cle} : chaque club à siège est au plateau, donc il a un vestiaire${hors.length ? " — " + extrait(hors) : ""}`);

  /* Et maintenant la vraie épreuve, en situation : on ouvre la carrière et on regarde le vivier. */
  const sel = S.d1[0];
  api.nouvellePartie(sel, cle);
  const G = api.getG();
  const enCours = api.plateauEnCours();
  ok(enCours.size === 40, `${cle} : la carrière ouvre sur quarante clubs${enCours.size !== 40 ? " — " + enCours.size : ""}`);
  const desDeuxCotes = (G.europe || []).filter(c => enCours.has(c.id)).map(c => c.id);
  ok(desDeuxCotes.length === 0, `${cle} : aucun club du championnat ne traîne dans le vivier d'Europe${desDeuxCotes.length ? " — " + extrait(desDeuxCotes) : ""}`);
  const partagesRestes = PARTAGES.filter(id => plateau.has(id) && (G.europe || []).some(c => c.id === id));
  ok(partagesRestes.length === 0, `${cle} : les codes partagés par ANG-B au plateau ont bien quitté le vivier${partagesRestes.length ? " — " + extrait(partagesRestes) : ""}`);
  /* La réconciliation par le NOM : un joueur curé employé au championnat quitte son club européen. */
  const auChampionnat = new Set();
  for (const c of G.clubs.concat(G.autre)) for (const j of c.joueurs) if (j.reel) auChampionnat.add(j.nom);
  const surDeuxTerrains = [];
  for (const c of (G.europe || [])) for (const j of c.joueurs) if (j.reel && auChampionnat.has(j.nom)) surDeuxTerrains.push(j.nom + " (" + c.id + ")");
  ok(surDeuxTerrains.length === 0, `${cle} : aucun joueur curé sur deux terrains${surDeuxTerrains.length ? " — " + extrait(surDeuxTerrains) : ""}`);
  /* Le tableau garde ses seize clubs quoi qu'il perde, sinon le tirage ne se divise plus par deux. */
  /* PIÈGE PAYÉ À L'ÉCRITURE DE CE HARNAIS : `vivierEuro` rend des IDENTIFIANTS, pas des objets club
     (c'est `viviersEuroDe` qui rend des objets). Lire `c.id` dessus donne `undefined` partout, et les
     deux contrôles qui suivent dormaient alors les yeux ouverts — `enCours.has(undefined)` est faux,
     donc « aucun intrus » passait toujours. On travaille sur les ids, et on le vérifie. */
  for (const compet of ["C1", "C2", "C3"]) {
    const t = api.vivierEuro(compet, false);
    ok(t.every(x => typeof x === "string"), `${cle} : le tableau de ${compet} est une liste d'identifiants`);
    ok(t.length === 16, `${cle} : tableau de ${compet} à seize clubs${t.length !== 16 ? " — " + t.length : ""}`);
    const intrus = t.filter(id => enCours.has(id));
    ok(intrus.length === 0, `${cle} : aucun club du championnat au tableau de ${compet}${intrus.length ? " — " + extrait(intrus) : ""}`);
    ok(new Set(t).size === t.length, `${cle} : aucun club deux fois au tableau de ${compet}`);
    /* Et chaque club du tableau doit avoir un vestiaire, sinon le tour se joue contre une coquille. */
    const creux = t.filter(id => !(G.europe || []).some(c => c.id === id) && !enCours.has(id));
    ok(creux.length === 0, `${cle} : chaque club du tableau de ${compet} a un vestiaire${creux.length ? " — " + extrait(creux) : ""}`);
  }
}

/* ===== F) Le cadre du pays, en situation ===== */
console.log("\nF) Le cadre du pays : libellés d'époque, monnaie, coupe, sélection, été international");
for (const cle of CLES) {
  const S = SAISONS[cle];
  api.nouvellePartie(S.d1[0], cle);
  const G = api.getG();
  ok(G.pays === "ANG", `${cle} : G.pays = "ANG"`);
  ok(G.saison === S.titre, `${cle} : G.saison = « ${G.saison} » (le créneau daté, pas la clé)`);
  ok(api.anneeJeu() === S.an, `${cle} : anneeJeu() = ${api.anneeJeu()}`);
  /* Les libellés suivent le pays ET l'année : vérifié contre la règle d'ANG-A, pas contre elle-même. */
  const elite = S.an >= 1992 ? "Premier League" : "First Division";
  const dessous = S.an >= 2004 ? "Championship" : (S.an >= 1992 ? "Division One" : "Second Division");
  ok(api.libDiv(1) === elite, `${cle} : l'élite s'appelle « ${api.libDiv(1)} » en ${S.an}`);
  ok(api.libDiv(2) === dessous, `${cle} : l'échelon du dessous s'appelle « ${api.libDiv(2)} »`);
  ok(api.libCoupeNat() === "FA Cup" && api.libCoupeLigue() === "League Cup",
    `${cle} : la coupe nationale est la FA Cup, la coupe de la ligue la League Cup`);
  ok(api.libChampion() === "champion d'Angleterre", `${cle} : « ${api.libChampion()} »`);
  ok(api.natPays() === "ANG", `${cle} : la sélection nationale appelle la nationalité ANG`);
  ok(/£/.test(api.UU(70)) && /M£/.test(api.MM(1e8)), `${cle} : les montants s'écrivent en livres (${api.UU(70)}, ${api.MM(1e8)})`);
  /* Huit francs la livre : un billet de 70 FF fait 9 £ et non 70. */
  const n = Number(String(api.UU(70)).replace(/[^\d.,]/g, "").replace(",", "."));
  ok(n > 7 && n < 10, `${cle} : 70 francs s'affichent ${api.UU(70)}, au taux de huit francs la livre`);
  /* L'été international se raconte d'Angleterre, et AUCUN été anglais ne porte le marqueur de sacre. */
  const ete = api.honneurEte(S.an + 2);
  if (ete) {
    ok(!ete.includes(PAYS.ANG.triomphe), `${cle} : l'été ${S.an + 2} ne proclame pas un sacre anglais`);
    ok(!/LA FRANCE/.test(ete), `${cle} : l'été ${S.an + 2} ne parle pas de la France en capitales`);
  } else idle(`${cle} : l'été ${S.an + 2} est muet, rien à relire`);
  /* La FA Cup se joue contre les petits clubs ANGLAIS : aucun village français au tirage. */
  const petits = api.clubsAmateurs();
  ok(petits === CLUBS_AMATEURS_ANG, `${cle} : le tirage de coupe pioche dans les petits clubs anglais`);
  ok(petits.length >= 24, `${cle} : ${petits.length} petits clubs anglais (le tableau en réclame 24)`);
  const nomsFR = new Set(CLUBS_AMATEURS.map(c => c.nom));
  const villages = (G.coupe && G.coupe.paires ? [] : []).concat(
    Object.values(G.coupe || {}).filter(Array.isArray).flat(2).filter(x => x && x.nom).map(x => x.nom));
  const intrusFR = villages.filter(nom => nomsFR.has(nom));
  ok(intrusFR.length === 0, `${cle} : aucun village français dans la FA Cup${intrusFR.length ? " — " + extrait(intrusFR) : ""}`);
}

/* ===== G) Six saisons de carrière ===== */
console.log("\nG) Six saisons de carrière depuis l'Angleterre : exceptions, vieillissement, calibrage");
{
  const cle = CLES[0], S = SAISONS[cle];
  let totalButs = 0, totalMatchs = 0;
  /* Un gros club, un club moyen, un club de l'échelon du dessous : les trois régimes économiques. */
  const departs = [S.d1[0], S.d1[10], S.d2[0]];
  const NS = 6;
  for (const dep of departs) {
    try {
      api.nouvellePartie(dep, cle);
      let casse = false;
      for (let s = 0; s < NS && !casse; s++) {
        for (let d = 0; d < 38; d++) api.jouerJournee();
        const G = api.getG();
        let bp = 0, jSum = 0;
        for (const c of G.clubs) { bp += c.bp; jSum += c.j; }
        totalButs += bp; totalMatchs += jSum / 2;
        G.vire = null;
        api.intersaison();
        let mx = 0, vieux = null;
        for (const c of api.getG().clubs) for (const j of c.joueurs) { if (j.age > mx) mx = j.age; if (j.age >= 36) vieux = j; }
        if (vieux) { ok(false, `${dep} : joueur de 36 ans et plus encore actif après vieillissement — ${vieux.nom} (${vieux.age})`); casse = true; }
        else if (mx > 35) { ok(false, `${dep} : âge max ${mx} > 35`); casse = true; }
      }
      if (!casse) ok(true, `${dep} : ${NS} saisons jouées sans exception, âge max ≤ 35`);
    } catch (e) { ok(false, `exception en carrière anglaise (${dep}) : ${e.stack}`); }
  }
  /* Le plateau anglais passe par le MÊME moteur et les budgets sont au barème français (ANG-B) : le
     calibrage doit donc tomber dans la même plage que le championnat de France, autour de 2,3. */
  const gpm = totalButs / totalMatchs;
  console.log(`— Calibrage anglais : ${gpm.toFixed(3)} buts/match sur ${Math.round(totalMatchs)} matchs —`);
  ok(gpm >= 2.0 && gpm <= 2.8, `calibrage dans la plage du moteur (cible ~2,3) : ${gpm.toFixed(3)}`);

  /* LE CONTRÔLE QUE SEULE UNE LONGUE CARRIÈRE PEUT FAIRE : d'un départ en 1990-91, l'élite change de
     NOM en cours de route — First Division les deux premières saisons, Premier League à partir de la
     troisième. Aucun autre harnais ne joue assez longtemps pour le voir. */
  if (S.an <= 1991) {
    api.nouvellePartie(S.d1[0], cle);
    const vus = [];
    for (let s = 0; s < 4; s++) {
      vus.push({ an: api.anneeJeu(), elite: api.libDiv(1), tag: api.tagDiv(1) });
      for (let d = 0; d < 38; d++) api.jouerJournee();
      api.getG().vire = null; api.intersaison();
    }
    const bascule = vus.filter(v => v.an >= 1992);
    ok(vus.filter(v => v.an < 1992).every(v => v.elite === "First Division" && v.tag === "D1"),
      `avant 1992 l'élite reste la First Division (${vus.filter(v => v.an < 1992).map(v => v.an).join(", ")})`);
    ok(bascule.length > 0 && bascule.every(v => v.elite === "Premier League" && v.tag === "PL"),
      `à partir de 1992 elle devient la Premier League, en pleine carrière (${bascule.map(v => v.an).join(", ")})`);
  } else idle(`départ en ${S.an} : la bascule vers la Premier League s'est faite avant le coup d'envoi`);
}

if (REPET) delete SAISONS[CLE_ESSAI];
console.log(FAILS === 0 ? "\n✅ HARNAIS ANGLETERRE : TOUT EST VERT" : "\n❌ HARNAIS ANGLETERRE : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
