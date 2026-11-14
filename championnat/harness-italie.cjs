/* Harnais de validation — LE HARNAIS DE PAYS, ITALIE (ITA-C)
   Troisième et dernière étape du lot structure qui précède l'Italie. ITA-A a posé les clubs, ITA-B le
   cadre local (sièges, étés, noms, petits clubs) ; celle-ci pose LE GARDIEN DU PLATEAU, c'est-à-dire le
   harnais que chacune des vingt saisons italiennes devra passer avant d'être livrée, comme
   `harness-angleterre.cjs` (ANG-E) le fait pour l'Angleterre, dont il est la copie fidèle.
   Il est GÉNÉRIQUE : il balaie `SAISONS` à la recherche des entrées `pays:"ITA"` et joue la batterie sur
   CHACUNE. Tant qu'aucune n'est enregistrée, il la joue sur un PLATEAU D'ESSAI bâti sur les vrais clubs
   d'ITA-A (effectifs procéduraux, exprès) : c'est une répétition générale, elle est annoncée comme telle,
   et les contrôles qui ne valent que sur de la donnée curée se taisent au lieu de mentir.
     A) les saisons italiennes au registre : clé préfixée, champ pays, nom, titre, sous-titre
     B) le plateau : 20 + 20, quarante codes uniques, tous italiens, toutes métadonnées résolues
     C) les effectifs : postes, bornes, un gardien réel, et les comptes de la curation
     D) aucun doublon : dans la saison, contre les autres saisons italiennes, et les prénoms
     E) le mur européen : aucun club des deux côtés, seize clubs au tableau, sièges = SIEGES_ITA
     F) le cadre du pays en situation : libellés, monnaie, coupe nationale, sélection, été (un seul sacre, 2006)
     G) six saisons de carrière : aucune exception, vieillissement, calibrage, libellés stables
   Ce qui diffère de l'Angleterre, et pourquoi :
     - aucun club ANGLAIS non plus dans un plateau italien (le troisième pays ne doit marcher sur les pieds
       d'aucun des deux premiers) ;
     - six codes partagés avec le vivier d'Europe (JUV, MIL, INT, ROM, LAZ, PAR) au lieu de quatre ;
     - les libellés ne changent pas d'époque (Serie A / Serie B de 1990 à 2010), donc pas de bascule à
       guetter en carrière : on vérifie au contraire qu'ils NE bougent PAS sur quatre saisons ;
     - l'Italie a UN été de sacre, 2006 : il doit porter le marqueur, et aucun autre ;
     - le mur européen s'éprouve sur 1990, 1991 (Milan banni, une seule C1), 1994 (cinq clubs en C3),
       1999 (quatre en C1) et 2006 (Juventus en Serie B, quatre en C1).
   Usage : node harness-italie.cjs                                                                      */
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

const epilogue = "\n;return {PAYS,SAISONS,SAISON_DEFAUT,SIEGES_ITA,CLUBS_ITA,CLUBS_ANG,CLUBS,CLUBS_D2,CLUBS_EXTRA," +
  "EUROCLUBS,COMPETS,CIBLE,PLANCHER,PRENOMS_VRAIS,CLUBS_AMATEURS,CLUBS_AMATEURS_ANG,CLUBS_AMATEURS_ITA," +
  "metaClub,metaSaison,nouvellePartie,jouerJournee,intersaison,anneeJeu,libDiv,tagDiv,libCoupeNat," +
  "libCoupeLigue,libChampion,natPays,honneurEte,adjPays,clubsAmateurs,plateauDeSaison,plateauEnCours," +
  "viviersEuroDe,vivierEuro,siegePays,euroInit,MM,UU," +
  "getG:function(){return G;}};";
const api = new Function(script + epilogue)();
const { PAYS, SAISONS, SIEGES_ITA, CLUBS_ITA, PRENOMS_VRAIS,
  CLUBS_AMATEURS, CLUBS_AMATEURS_ANG, CLUBS_AMATEURS_ITA } = api;

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const idle = (m) => console.log("  · " + m);
const extrait = (l, n = 6) => l.slice(0, n).join(", ") + (l.length > n ? ` … (+${l.length - n})` : "");

const CODES_ITA = new Set(CLUBS_ITA.map(c => c.id));
const CODES_FR = new Set([].concat(api.CLUBS || [], api.CLUBS_D2 || [], api.CLUBS_EXTRA || []).map(c => c.id));
const CODES_ANG = new Set((api.CLUBS_ANG || []).map(c => c.id));
/* Les six codes qu'ITA-A partage EXPRÈS avec le vivier d'Europe, pour que la réconciliation joue. */
const PARTAGES = ["JUV", "MIL", "INT", "ROM", "LAZ", "PAR"];

/* ---------------------------------------------------------------------------------------------------
   Le plateau d'essai de la répétition générale. Mêmes listes que `harness-textes-ita.cjs` (vingt clubs de
   Serie A dont les six codes partagés, vingt autres clubs d'ITA-A dessous), pour qu'un écart entre les
   deux harnais se voie. Un PLATEAU D'ESSAI, pas un classement relevé. Effectifs PROCÉDURAUX, exprès.
   --------------------------------------------------------------------------------------------------- */
const ESSAI_D1 = ["JUV", "MIL", "INT", "ROM", "LAZ", "PAR", "NAP", "SAM", "FIO", "TOR",
  "GEN", "ATA", "BGN", "UDI", "CAG", "HEL", "BAI", "LEC", "FOG", "CRM"];
const CLE_ESSAI = "ITA-1990-91";
const cleDe = (an) => "ITA-" + an + "-" + String((an + 1) % 100).padStart(2, "0");
function plateauEssai(an = 1990) {
  return {
    pays: "ITA", an, titre: an + "-" + String((an + 1) % 100).padStart(2, "0"),
    nom: "Répétition générale", sous: "Plateau d'essai du harnais de pays, retiré aussitôt.",
    d1: ESSAI_D1.slice(), d2: CLUBS_ITA.map(c => c.id).filter(id => !ESSAI_D1.includes(id)).slice(0, 20),
    starsD1: {}, starsD2: {},
    euroC1: SIEGES_ITA[an].C1, euroC2: SIEGES_ITA[an].C2, euroC3: SIEGES_ITA[an].C3,
  };
}

/* Les saisons italiennes DU REGISTRE. Le jour où « ITA-1990-91 » entre dans `SAISONS`, elle est reprise
   ici toute seule et passe la batterie sans qu'on touche au harnais. */
let CLES = Object.keys(SAISONS).filter(k => (SAISONS[k].pays || "FR") === "ITA");
const REPET = CLES.length === 0;
if (REPET) { SAISONS[CLE_ESSAI] = plateauEssai(); CLES = [CLE_ESSAI]; }

console.log(REPET
  ? "RÉPÉTITION GÉNÉRALE — aucune saison italienne au registre, la batterie tourne sur un plateau d'essai.\n"
    + "Le jour où la première saison italienne entre dans SAISONS, elle est prise ici automatiquement.\n"
  : `Saisons italiennes au registre : ${CLES.length} (${extrait(CLES, 8)})\n`);

/* ===== A) Les saisons italiennes au registre ===== */
console.log("A) Le registre : clé préfixée, champ pays, et les trois textes de la saison");
for (const cle of CLES) {
  const S = SAISONS[cle];
  ok(S.pays === "ITA", `${cle} : champ pays = "ITA" (la vérité sur le pays est le champ, pas la clé)`);
  ok(/^ITA-\d{4}-\d{2}$/.test(cle), `${cle} : clé préfixée du code pays, au créneau daté`);
  ok(Number.isInteger(S.an) && S.an >= 1990 && S.an <= 2009, `${cle} : année de base ${S.an} dans la fenêtre du chantier`);
  const attenduTitre = S.an + "-" + String((S.an + 1) % 100).padStart(2, "0");
  ok(S.titre === attenduTitre, `${cle} : titre « ${S.titre} » = le créneau daté de son année`);
  ok(cle === "ITA-" + S.titre, `${cle} : la clé et le titre disent la même saison`);
  ok(typeof S.nom === "string" && S.nom.length > 0 && S.nom.length <= 34,
    `${cle} : nom de saison « ${S.nom} » (${(S.nom || "").length} caractères, trente-quatre au plus)`);
  ok(typeof S.sous === "string" && S.sous.length > 0, `${cle} : sous-titre présent`);
  const longs = [S.nom, S.sous].filter(t => /—/.test(t || ""));
  ok(longs.length === 0, `${cle} : aucun tiret long dans le nom ni le sous-titre`);
}

/* ===== B) Le plateau ===== */
console.log("\nB) Le plateau : 20 + 20, quarante clubs italiens uniques et résolus");
for (const cle of CLES) {
  const S = SAISONS[cle];
  /* La Serie A n'avait que dix-huit clubs jusqu'en 2003-04 : le jeu en veut toujours vingt (règle de la
     D1 française 1997-98, repêchés selon le classement réel). Le harnais ne transige pas. */
  ok(S.d1.length === 20, `${cle} : ${S.d1.length} clubs à l'élite (le moteur en veut 20)`);
  ok(S.d2.length === 20, `${cle} : ${S.d2.length} clubs à l'échelon du dessous (le moteur en veut 20)`);
  const tous = S.d1.concat(S.d2);
  ok(new Set(tous).size === 40, `${cle} : quarante codes uniques, aucun club dans les deux divisions`);
  const inconnus = tous.filter(id => !CODES_ITA.has(id));
  ok(inconnus.length === 0, `${cle} : tous les clubs viennent de CLUBS_ITA${inconnus.length ? " — " + extrait(inconnus) : ""}`);
  const francais = tous.filter(id => CODES_FR.has(id));
  ok(francais.length === 0, `${cle} : aucun club français dans le plateau${francais.length ? " — " + extrait(francais) : ""}`);
  const anglais = tous.filter(id => CODES_ANG.has(id));
  ok(anglais.length === 0, `${cle} : aucun club anglais dans le plateau${anglais.length ? " — " + extrait(anglais) : ""}`);
  /* metaClub cherche la France et l'Angleterre AVANT l'Italie : un code italien qui en volerait un autre
     résoudrait sur le mauvais club. On exige donc que la fiche résolue soit bien celle de CLUBS_ITA. */
  const sansMeta = tous.filter(id => { const m = api.metaClub(id); return !m || CLUBS_ITA.indexOf(m) < 0; });
  ok(sansMeta.length === 0, `${cle} : toutes les métadonnées résolues sur la fiche italienne${sansMeta.length ? " — " + extrait(sansMeta) : ""}`);
  const creux = tous.filter(id => { const m = api.metaClub(id); return !m || !m.stade || !m.cap; });
  ok(creux.length === 0, `${cle} : chaque club a son stade et sa capacité${creux.length ? " — " + extrait(creux) : ""}`);
  /* Le stade et le nom doivent être ceux de l'ANNÉE (les déménagements et renommages datés par ITA-A). */
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
  const nD1 = S.d1.reduce((s, id) => s + (S.starsD1[id] || []).length, 0);
  const nD2 = S.d2.reduce((s, id) => s + (S.starsD2[id] || []).length, 0);
  ok(nD1 === 400, `${cle} : ${nD1} hommes à l'élite (attendu 20 × 20)`);
  ok(nD2 === 360, `${cle} : ${nD2} hommes en dessous (attendu 20 × 18)`);
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
  /* Le prénom composé avalé par le patronyme. Même liste de particules que `harness-angleterre.cjs` au
     jour d'ITA-C : on la complète ici, avec une note, pour chaque cas réel qu'une saison italienne
     rencontrera (seule exception admise à la règle « on ne touche pas aux assertions »). */
  const PARTICULES = new Set(["Le", "La", "Les", "De", "Del", "Della", "Da", "Das", "Dos", "Di", "Du",
    "Van", "Von", "Der", "Ten", "Ter", "El", "Al", "Ben", "Bin", "Mac", "Mc", "O", "Saint", "San",
    "Mio", "Sarr", "Aït", "Dalla", "Santa"]);
  const suspects = Object.keys(ou).filter(n => {
    const m = /^[A-ZÀ-Þ]\.(-[A-ZÀ-Þ]\.)? ([A-ZÀ-Þ][a-zà-ÿ']+) [A-ZÀ-Þ]/.exec(n);
    return m && !PARTICULES.has(m[2]);
  });
  ok(suspects.length === 0, `${cle} : aucun prénom composé avalé par le patronyme${suspects.length ? " — " + extrait(suspects) : ""}`);
  const INI = /^\p{Lu}\.(?:[-\s]\p{L}\.)* /u;
  const aIni = Object.keys(ou).filter(n => INI.test(n));
  const sansPrenom = aIni.filter(n => !Object.prototype.hasOwnProperty.call(PRENOMS_VRAIS, n));
  ok(sansPrenom.length === 0, `${cle} : les ${aIni.length} noms à initiale ont leur entrée dans PRENOMS_VRAIS${sansPrenom.length ? " — " + extrait(sansPrenom) : ""}`);
  const faux = aIni.filter(n => { const p = PRENOMS_VRAIS[n]; return p && p[0].normalize("NFD")[0].toUpperCase() !== n[0].normalize("NFD")[0].toUpperCase(); });
  ok(faux.length === 0, `${cle} : chaque prénom commence par l'initiale affichée${faux.length ? " — " + extrait(faux) : ""}`);
}
/* D'une saison italienne à l'autre, un même nom court désigne le MÊME homme : l'âge doit avancer
   exactement du nombre d'années qui séparent les deux saisons. */
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
  ok(ecarts.length === 0, `un nom court désigne le même homme d'une saison italienne à l'autre${ecarts.length ? " — " + extrait(ecarts) : ""}`);
} else idle("une seule saison italienne : le contrôle d'identité d'une saison à l'autre attend la suivante");

/* ===== E) Le mur européen ===== */
console.log("\nE) Le mur européen : on ne joue pas un club le mardi ET le samedi");
/* Plusieurs années, choisies pour leurs délégations : 1990 (deux en C1, quatre en C3), 1991 (Milan
   banni, une seule C1), 1994 (cinq clubs en C3), 1999 (quatre en C1, plus de C2) et 2006 (la Juventus en
   Serie B, quatre en C1). Leçon d'ANG-E : une seule année ne prouve rien. */
const EPREUVES = REPET ? [1990, 1991, 1994, 1999, 2006].map(an => {
  const k = cleDe(an); SAISONS[k] = plateauEssai(an); return k;
}) : CLES;
for (const cle of EPREUVES) {
  const S = SAISONS[cle];
  const T = SIEGES_ITA[S.an];
  const meme = (a, b) => (a || []).slice().sort().join(",") === (b || []).slice().sort().join(",");
  const concordent = T && meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3);
  if (REPET) { idle(`${cle} : sièges recopiés de SIEGES_ITA par le plateau d'essai (recoupement circulaire, sans valeur ici)`); }
  else ok(concordent, `${cle} : les sièges européens sont ceux de SIEGES_ITA[${S.an}]`);
  if (S.an >= 1999) ok((S.euroC2 || []).length === 0, `${cle} : euroC2 vide, la Coupe des Coupes a disparu en 1999`);
  const vus = new Set(); const croise = [];
  for (const k of ["euroC1", "euroC2", "euroC3"]) for (const id of (S[k] || [])) { if (vus.has(id)) croise.push(id); vus.add(id); }
  ok(croise.length === 0, `${cle} : aucun club dans deux compétitions${croise.length ? " — " + extrait(croise) : ""}`);
  const plateau = api.plateauDeSaison(S);
  const hors = [...vus].filter(id => !plateau.has(id));
  if (REPET) idle(`${cle} : ${hors.length} siège(s) hors du plateau d'essai, sans valeur ici${hors.length ? " (" + extrait(hors) + ")" : ""}`);
  else ok(hors.length === 0, `${cle} : chaque club à siège est au plateau, donc il a un vestiaire${hors.length ? " — " + extrait(hors) : ""}`);

  const sel = S.d1[0];
  api.nouvellePartie(sel, cle);
  const G = api.getG();
  const enCours = api.plateauEnCours();
  ok(enCours.size === 40, `${cle} : la carrière ouvre sur quarante clubs${enCours.size !== 40 ? " — " + enCours.size : ""}`);
  const desDeuxCotes = (G.europe || []).filter(c => enCours.has(c.id)).map(c => c.id);
  ok(desDeuxCotes.length === 0, `${cle} : aucun club du championnat ne traîne dans le vivier d'Europe${desDeuxCotes.length ? " — " + extrait(desDeuxCotes) : ""}`);
  const partagesRestes = PARTAGES.filter(id => plateau.has(id) && (G.europe || []).some(c => c.id === id));
  ok(partagesRestes.length === 0, `${cle} : les codes partagés par ITA-A au plateau ont bien quitté le vivier${partagesRestes.length ? " — " + extrait(partagesRestes) : ""}`);
  const auChampionnat = new Set();
  for (const c of G.clubs.concat(G.autre)) for (const j of c.joueurs) if (j.reel) auChampionnat.add(j.nom);
  const surDeuxTerrains = [];
  for (const c of (G.europe || [])) for (const j of c.joueurs) if (j.reel && auChampionnat.has(j.nom)) surDeuxTerrains.push(j.nom + " (" + c.id + ")");
  ok(surDeuxTerrains.length === 0, `${cle} : aucun joueur curé sur deux terrains${surDeuxTerrains.length ? " — " + extrait(surDeuxTerrains) : ""}`);
  /* `vivierEuro` rend des IDENTIFIANTS (piège payé par ANG-E) : on travaille sur les ids, et on le vérifie. */
  for (const compet of ["C1", "C2", "C3"]) {
    const t = api.vivierEuro(compet, false);
    ok(t.every(x => typeof x === "string"), `${cle} : le tableau de ${compet} est une liste d'identifiants`);
    ok(t.length === 16, `${cle} : tableau de ${compet} à seize clubs${t.length !== 16 ? " — " + t.length : ""}`);
    const siege = api.siegePays(compet);
    const intrus = t.filter(id => enCours.has(id) && id !== siege);
    ok(intrus.length === 0, `${cle} : hors le siège national (${siege || "aucun"}), aucun club du championnat au tableau de ${compet}${intrus.length ? " — " + extrait(intrus) : ""}`);
    ok(t.filter(id => enCours.has(id)).length <= 1, `${cle} : au plus un club du championnat au tableau de ${compet}, comme en France`);
    ok(new Set(t).size === t.length, `${cle} : aucun club deux fois au tableau de ${compet}`);
    const creux = t.filter(id => !(G.europe || []).some(c => c.id === id) && !enCours.has(id));
    ok(creux.length === 0, `${cle} : chaque club du tableau de ${compet} a un vestiaire${creux.length ? " — " + extrait(creux) : ""}`);
  }
}
if (REPET) for (const k of EPREUVES) if (k !== CLE_ESSAI) delete SAISONS[k];

/* ===== F) Le cadre du pays, en situation ===== */
console.log("\nF) Le cadre du pays : libellés, monnaie, coupe, sélection, été international");
/* En répétition générale, on joue le cadre sur deux années, 1990 et 2004 : l'été « an + 2 » tombe alors
   sur 1992 (l'Italie absente de l'Euro) et sur 2006 (LE sacre), les deux cas du marqueur. */
const CADRE = REPET ? [1990, 2004].map(an => { const k = cleDe(an); if (!SAISONS[k]) SAISONS[k] = plateauEssai(an); return k; }) : CLES;
for (const cle of CADRE) {
  const S = SAISONS[cle];
  api.nouvellePartie(S.d1[0], cle);
  const G = api.getG();
  ok(G.pays === "ITA", `${cle} : G.pays = "ITA"`);
  ok(G.saison === S.titre, `${cle} : G.saison = « ${G.saison} » (le créneau daté, pas la clé)`);
  ok(api.anneeJeu() === S.an, `${cle} : anneeJeu() = ${api.anneeJeu()}`);
  ok(api.libDiv(1) === "Serie A" && api.tagDiv(1) === "SA", `${cle} : l'élite s'appelle « ${api.libDiv(1)} » (${api.tagDiv(1)})`);
  ok(api.libDiv(2) === "Serie B" && api.tagDiv(2) === "SB", `${cle} : l'échelon du dessous s'appelle « ${api.libDiv(2)} » (${api.tagDiv(2)})`);
  ok(api.libCoupeNat() === "Coppa Italia", `${cle} : la coupe nationale est la « ${api.libCoupeNat()} »`);
  ok(api.libChampion() === "champion d'Italie", `${cle} : « ${api.libChampion()} »`);
  ok(api.natPays() === "ITA", `${cle} : la sélection nationale appelle la nationalité ITA`);
  ok(api.UU(70) === "70" && api.MM(1e8) === "100,0 M", `${cle} : les montants s'écrivent sans devise, à l'échelle française (${api.UU(70)}, ${api.MM(1e8)})`);
  /* L'été international se raconte d'Italie, et SEUL l'été 2006 porte le marqueur de sacre. */
  const anEte = S.an + 2, ete = api.honneurEte(anEte);
  if (ete) {
    const sacre = ete.includes(PAYS.ITA.triomphe);
    ok(sacre === (anEte === 2006), `${cle} : l'été ${anEte} ${anEte === 2006 ? "proclame" : "ne proclame pas"} un sacre italien`);
    ok(!/LA FRANCE/.test(ete), `${cle} : l'été ${anEte} ne parle pas de la France en capitales`);
  } else idle(`${cle} : l'été ${anEte} est muet, rien à relire`);
  /* La Coppa Italia se joue contre les petits clubs ITALIENS : aucun village français ni anglais. */
  const petits = api.clubsAmateurs();
  ok(petits === CLUBS_AMATEURS_ITA, `${cle} : le tirage de coupe pioche dans les petits clubs italiens`);
  ok(petits.length >= 24, `${cle} : ${petits.length} petits clubs italiens (le tableau en réclame 24)`);
  const nomsAilleurs = new Set(CLUBS_AMATEURS.concat(CLUBS_AMATEURS_ANG).map(c => c.nom));
  const villages = Object.values(G.coupe || {}).filter(Array.isArray).flat(2).filter(x => x && x.nom).map(x => x.nom);
  const intrus = villages.filter(nom => nomsAilleurs.has(nom));
  ok(intrus.length === 0, `${cle} : aucun village français ni anglais dans la Coppa Italia${intrus.length ? " — " + extrait(intrus) : ""}`);
}
if (REPET) for (const k of CADRE) if (k !== CLE_ESSAI) delete SAISONS[k];

/* ===== G) Six saisons de carrière ===== */
console.log("\nG) Six saisons de carrière depuis l'Italie : exceptions, vieillissement, calibrage");
{
  const cle = CLES[0], S = SAISONS[cle];
  let totalButs = 0, totalMatchs = 0;
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
      ok(api.getG().pays === "ITA", `${dep} : la carrière est toujours italienne après ${NS} intersaisons`);
    } catch (e) { ok(false, `exception en carrière italienne (${dep}) : ${e.stack}`); }
  }
  const gpm = totalButs / totalMatchs;
  console.log(`— Calibrage italien : ${gpm.toFixed(3)} buts/match sur ${Math.round(totalMatchs)} matchs —`);
  ok(gpm >= 2.0 && gpm <= 2.8, `calibrage dans la plage du moteur (cible ~2,3) : ${gpm.toFixed(3)}`);

  /* L'inverse du contrôle anglais : l'Italie ne change pas de libellés en cours de route (Serie A et
     Serie B de 1990 à 2010). Quatre saisons d'affilée, les mêmes mots à chaque coup d'envoi. */
  api.nouvellePartie(S.d1[0], cle);
  const vus = [];
  for (let s = 0; s < 4; s++) {
    vus.push({ an: api.anneeJeu(), e: api.libDiv(1), t: api.tagDiv(1), d: api.libDiv(2), c: api.libCoupeNat() });
    for (let d = 0; d < 38; d++) api.jouerJournee();
    api.getG().vire = null; api.intersaison();
  }
  ok(vus.every(v => v.e === "Serie A" && v.t === "SA" && v.d === "Serie B" && v.c === "Coppa Italia"),
    `les libellés tiennent quatre saisons d'affilée (${vus.map(v => v.an).join(", ")}) : Serie A, Serie B, Coppa Italia`);
  ok(vus.every((v, i) => v.an === S.an + i), `l'année avance d'une unité à chaque intersaison (${vus.map(v => v.an).join(" → ")})`);
}

if (REPET) delete SAISONS[CLE_ESSAI];
console.log(FAILS === 0 ? "\n✅ HARNAIS ITALIE : TOUT EST VERT" : "\n❌ HARNAIS ITALIE : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
