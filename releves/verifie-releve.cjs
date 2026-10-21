// Vérificateur d'un relevé de saison (phase 1 de IMPORT_SAISON.md).
// Usage : node releves/verifie-releve.cjs releves/ANG-1994-95
// Il ne touche à rien : il lit le relevé et le registre des clubs du jeu, et dit
// « RELEVÉ VERT » ou la liste des défauts. Code de sortie 0 si vert, 1 sinon.
"use strict";
const fs = require("fs");
const path = require("path");

const dossier = process.argv[2];
if (!dossier) { console.error("Usage : node releves/verifie-releve.cjs releves/ANG-AAAA-AA"); process.exit(2); }

const erreurs = [];
const alertes = [];
const err = m => erreurs.push(m);
const alerte = m => alertes.push(m);

function litJSON(nom) {
  const f = path.join(dossier, nom);
  if (!fs.existsSync(f)) { err(`fichier absent : ${f}`); return null; }
  try { return JSON.parse(fs.readFileSync(f, "utf8")); }
  catch (e) { err(`${nom} n'est pas du JSON valide : ${e.message}`); return null; }
}

// Registre des clubs anglais du jeu, lu dans index.html (lecture seule).
const racine = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(racine, "championnat", "index.html"), "utf8");
const bloc = html.slice(html.indexOf("const CLUBS_ANG=["), html.indexOf("];", html.indexOf("const CLUBS_ANG=[")));
const CODES_ANG = new Set([...bloc.matchAll(/id:"([A-Z]+)"/g)].map(m => m[1]));
if (CODES_ANG.size < 50) err(`registre CLUBS_ANG illisible (${CODES_ANG.size} codes trouvés)`);

// Identifiants Transfermarkt vérifiés des clubs (releves/clubs-tm.json).
const TABLE_TM = JSON.parse(fs.readFileSync(path.join(__dirname, "clubs-tm.json"), "utf8")).clubs;

// Effectifs connus, pour le contrôle d'identité : ceux du jeu (STARS_ANGxxxx) et ceux des
// autres relevés posés à côté de celui-ci. Clé : année du coup d'envoi → code → noms courts.
const connus = {};
for (const m of html.matchAll(/const STARS_(?:D2_)?ANG(\d{2})(\d{2})=\{([\s\S]*?)\n\};/g)) {
  const a = (+m[1] < 50 ? 2000 : 1900) + +m[1];
  connus[a] = connus[a] || {};
  for (const c of m[3].matchAll(/\n ([A-Z]{3}):\[([\s\S]*?)\]\],?/g))
    connus[a][c[1]] = new Set([...c[2].matchAll(/\["([^"]+)"/g)].map(x => x[1]));
}
const dossierReleves = path.dirname(path.resolve(dossier));
for (const k of fs.readdirSync(dossierReleves)) {
  const mk = /^ANG-(\d{4})-\d{2}$/.exec(k);
  if (!mk || k === path.basename(path.resolve(dossier))) continue;
  try {
    const p2 = JSON.parse(fs.readFileSync(path.join(dossierReleves, k, "plateau.json"), "utf8"));
    const j2 = JSON.parse(fs.readFileSync(path.join(dossierReleves, k, "joueurs.json"), "utf8"));
    const a = +mk[1];
    connus[a] = connus[a] || {};
    for (const c of [...(p2.d1 || []), ...(p2.d2 || [])])
      if (!connus[a][c]) connus[a][c] = new Set((j2[c] || []).filter(j => j.retenu).map(j => j.court));
  } catch (e) { /* relevé voisin illisible : on l'ignore ici, il a son propre contrôle */ }
}

const cleDossier = path.basename(path.resolve(dossier));
const mCle = /^ANG-(\d{4})-(\d{2})$/.exec(cleDossier);
if (!mCle) err(`le dossier doit s'appeler ANG-AAAA-AA (trouvé : ${cleDossier})`);
const an = mCle ? +mCle[1] : NaN;
if (mCle && (an + 1) % 100 !== +mCle[2]) err(`clé incohérente : ${cleDossier}`);

// ---------- plateau.json ----------
const P = litJSON("plateau.json");
function verifieClassement(nom, rangs, taillesPermises) {
  if (!Array.isArray(rangs)) { err(`${nom} absent`); return; }
  const n = rangs.length;
  if (!taillesPermises.includes(n)) err(`${nom} : ${n} clubs (attendu ${taillesPermises.join(" ou ")})`);
  const jAttendu = 2 * (n - 1);
  let sg = 0, sp = 0, sbp = 0, sbc = 0, ptsPrec = Infinity;
  rangs.forEach((r, i) => {
    const ou = `${nom} rang ${i + 1} (${r.club || "?"})`;
    if (r.rang !== i + 1) err(`${ou} : rang ${r.rang}, attendu ${i + 1}`);
    for (const k of ["j", "g", "n", "p", "bp", "bc", "pts"]) if (!Number.isInteger(r[k])) err(`${ou} : champ ${k} manquant ou non entier`);
    if (r.j !== jAttendu) err(`${ou} : ${r.j} matchs joués, attendu ${jAttendu}`);
    if (r.g + r.n + r.p !== r.j) err(`${ou} : g+n+p = ${r.g + r.n + r.p} ≠ j = ${r.j}`);
    const pen = r.penalite || 0;
    if (3 * r.g + r.n - pen !== r.pts) err(`${ou} : 3×${r.g}+${r.n}${pen ? "−" + pen : ""} = ${3 * r.g + r.n - pen} ≠ ${r.pts} points`);
    if (r.pts > ptsPrec) err(`${ou} : ${r.pts} points, plus que le club classé au-dessus`);
    ptsPrec = r.pts;
    if (r.code != null && !CODES_ANG.has(r.code)) err(`${ou} : code ${r.code} inconnu de CLUBS_ANG`);
    sg += r.g; sp += r.p; sbp += r.bp; sbc += r.bc;
  });
  if (sg !== sp) err(`${nom} : ${sg} victoires pour ${sp} défaites (doivent être égales)`);
  if (sbp !== sbc) err(`${nom} : ${sbp} buts marqués pour ${sbc} encaissés (doivent être égaux)`);
}
let d1 = [], d2 = [];
if (P) {
  if (P.cle !== cleDossier) err(`plateau.cle = ${P.cle}, attendu ${cleDossier}`);
  if (P.pays !== "ANG") err(`plateau.pays = ${P.pays}, attendu ANG`);
  if (P.an !== an) err(`plateau.an = ${P.an}, attendu ${an}`);
  if (!Array.isArray(P.sources) || P.sources.length === 0) err("plateau.sources vide : citer les pages réellement lues");
  verifieClassement("classementD1", P.classementD1, [20, 22]);
  verifieClassement("classementD2", P.classementD2, [24]);
  d1 = P.d1 || []; d2 = P.d2 || [];
  const tous = [...d1, ...d2];
  if (d1.length !== 20) err(`d1 : ${d1.length} clubs, attendu 20`);
  if (d2.length !== 20) err(`d2 : ${d2.length} clubs, attendu 20`);
  if (new Set(tous).size !== tous.length) err("un club figure deux fois dans d1/d2");
  tous.forEach(c => { if (!CODES_ANG.has(c)) err(`club retenu ${c} inconnu de CLUBS_ANG (arrêter : c'est du moteur, pas de la donnée)`); });
  const auClassement = new Set([...(P.classementD1 || []), ...(P.classementD2 || [])].map(r => r.code));
  tous.forEach(c => { if (!auClassement.has(c)) err(`club retenu ${c} absent des deux classements`); });
  const nbClassés = (P.classementD1 || []).length + (P.classementD2 || []).length;
  const ecartes = P.ecartes || [];
  if (nbClassés - 40 !== ecartes.length) err(`${nbClassés} clubs classés, 40 retenus : il faut ${nbClassés - 40} écartés justifiés, il y en a ${ecartes.length}`);
  ecartes.forEach(e => { if (!e.raison || e.raison.length < 10) err(`écarté ${e.code || e.club} sans raison écrite`); });
  ecartes.forEach(e => {
    if (/anti-?robot|inaccessible|bloqu|human verification|403|405/i.test(e.raison || ""))
      err(`écarté ${e.code || e.club} parce que la source a bloqué : ce n'est pas une raison, réessayer ou s'arrêter`);
  });
  const tete = (P.classementD2 || []).slice(0, 3).map(r => r.code);
  ecartes.forEach(e => { if (tete.includes(e.code)) err(`écarté ${e.code} alors qu'il finit dans les trois premiers de l'échelon du dessous`); });
  // Chaque club retenu doit avoir été relevé sous SON identifiant Transfermarkt.
  const tmClubs = P.tm_clubs || {};
  tous.forEach(c => {
    const attendu = TABLE_TM[c] && TABLE_TM[c].tm;
    if (tmClubs[c] == null) err(`tm_clubs : identifiant Transfermarkt du club ${c} manquant (attendu ${attendu})`);
    else if (+tmClubs[c] !== attendu) err(`tm_clubs : ${c} relevé sous l'identifiant ${tmClubs[c]}, or c'est ${attendu} (${TABLE_TM[c].nom_tm}) : mauvais club`);
  });
  const noms = P.noms_proposes || [];
  if (noms.length < 1 || noms.length > 3) err("noms_proposes : de un à trois noms");
  noms.forEach(nm => {
    const mots = nm.trim().split(/\s+/).length;
    if (nm.length > 34) err(`nom proposé trop long (${nm.length} > 34) : ${nm}`);
    if (mots < 2 || mots > 5) err(`nom proposé de ${mots} mots (2 à 5) : ${nm}`);
    if (nm.includes("—")) err(`tiret long interdit : ${nm}`);
  });
}

// ---------- joueurs.json ----------
const J = litJSON("joueurs.json");
if (J && P) {
  const vusTM = new Map();
  const maigres = { d1: 0, d2: 0 };
  [...d1.map(c => [c, "d1"]), ...d2.map(c => [c, "d2"])].forEach(([code, div]) => {
    const liste = J[code];
    if (!Array.isArray(liste)) { err(`joueurs.json : club ${code} absent`); return; }
    if (liste.length < 10) maigres[div]++;
    const retenus = liste.filter(j => j.retenu);
    const quota = div === "d1" ? 20 : 18;
    if (retenus.length !== quota) err(`${code} : ${retenus.length} retenus, attendu ${quota}`);
    const parPoste = { G: 0, D: 0, M: 0, A: 0 };
    const courts = new Set();
    liste.forEach((j, i) => {
      const ou = `${code} #${i + 1} (${j.court || j.nom || "?"})`;
      if (!j.nom || !j.court) err(`${ou} : nom ou court manquant`);
      if (!"GDMA".includes(j.poste) || !j.poste) err(`${ou} : poste « ${j.poste} » (G, D, M ou A)`);
      const mN = /^(\d{4})(-\d{2}-\d{2})?$/.exec(j.naissance || "");
      if (!mN) err(`${ou} : naissance « ${j.naissance} » (AAAA-MM-JJ, ou AAAA)`);
      else { const age = an - +mN[1]; if (age < 15 || age > 41) err(`${ou} : ${age} ans au coup d'envoi, invraisemblable`); }
      if (![0, 1, 2, null].includes(j.arrivee ?? null)) err(`${ou} : arrivee doit valoir 0, 1, 2 ou null`);
      if (j.retenu) {
        parPoste[j.poste] = (parPoste[j.poste] || 0) + 1;
        if (j.arrivee === 0) err(`${ou} : retenu alors qu'arrivé en cours de saison (arrivee 0)`);
        if (courts.has(j.court)) err(`${ou} : nom court en double dans le club`);
        courts.add(j.court);
        if (j.tm != null) {
          if (vusTM.has(j.tm)) err(`${ou} : identifiant TM ${j.tm} déjà retenu à ${vusTM.get(j.tm)} (dédoublonner au coup d'envoi)`);
          vusTM.set(j.tm, code);
        } else if (!j.source) err(`${ou} : sans identifiant TM, la source doit être nommée`);
      }
      const mI = /^([A-ZÀ-Ý][a-zà-ÿ]*(?:-[A-ZÀ-Ý][a-zà-ÿ]*)?)\. /.exec(j.court || "");
      if (j.prenom === undefined) err(`${ou} : champ prenom manquant (écrire "" si douteux)`);
      else if (mI && j.prenom && !j.prenom.startsWith(mI[1].split("-")[0])) err(`${ou} : prénom « ${j.prenom} » ne commence pas par l'initiale « ${mI[1]} »`);
    });
    if (retenus.length === quota) {
      if (parPoste.G < 2 || parPoste.D < 5 || parPoste.M < 5 || parPoste.A < 4)
        err(`${code} : minimums G2 D5 M5 A4 non tenus (G${parPoste.G} D${parPoste.D} M${parPoste.M} A${parPoste.A})`);
    }
    if (liste.some(j => j.retenu && j.invente)) err(`${code} : joueur inventé, interdit`);
  });
  // Identité : un vrai club garde une partie de ses hommes d'une saison à l'autre.
  [...d1, ...d2].forEach(code => {
    const ici = new Set((J[code] || []).filter(j => j.retenu).map(j => j.court));
    let meilleur = -1, ref = null;
    for (const v of [an - 1, an + 1, an - 2, an + 2]) {
      const e = connus[v] && connus[v][code];
      if (!e) continue;
      const o = [...ici].filter(x => e.has(x)).length;
      if (o > meilleur) { meilleur = o; ref = v; }
    }
    if (meilleur === -1) alerte(`${code} : aucune saison voisine connue, identité du club non contrôlée`);
    else if (meilleur < 3) err(`${code} : ${meilleur} joueur(s) en commun avec ${ref}-${String(ref + 1).slice(2)}, ce n'est sans doute pas le bon club`);
  });
  // Aucune donnée estimée : ni minutes fabriquées, ni effectifs sans Transfermarkt en masse.
  const tousRetenus = [...d1, ...d2].flatMap(c => (J[c] || []).filter(j => j.retenu));
  const avecMin = tousRetenus.filter(j => j.minutes > 0);
  const mult85 = avecMin.filter(j => j.minutes % 85 === 0).length;
  if (avecMin.length && mult85 / avecMin.length > 0.25) err(`${mult85}/${avecMin.length} minutes sont des multiples de 85 : minutes estimées, interdit (laisser null si inconnues)`);
  const sansTM = tousRetenus.filter(j => j.tm == null).length;
  if (sansTM > 40) err(`${sansTM} retenus sans identifiant Transfermarkt : la source principale a manqué, s'arrêter au lieu de tout prendre ailleurs`);
  for (const div of ["d1", "d2"]) if (maigres[div] > 3) err(`${div} : ${maigres[div]} clubs à moins de dix joueurs documentés, la saison n'est pas mûre`);
  const nbRetenus = [...d1, ...d2].reduce((s, c) => s + ((J[c] || []).filter(j => j.retenu).length), 0);
  if (nbRetenus !== 760) err(`${nbRetenus} joueurs retenus au total, attendu 760`);
  const sansPrenom = [...d1, ...d2].flatMap(c => (J[c] || []).filter(j => j.retenu && j.prenom === "")).length;
  if (sansPrenom > 40) alerte(`${sansPrenom} retenus sans prénom : vérifier qu'il ne s'agit pas d'un oubli`);
}

// ---------- rapport.md ----------
const fr = path.join(dossier, "rapport.md");
if (!fs.existsSync(fr)) err("rapport.md absent");
else {
  const t = fs.readFileSync(fr, "utf8");
  for (const titre of ["## Importé", "## Vérifié", "## Doutes"]) if (!t.includes(titre)) err(`rapport.md : section « ${titre} » manquante`);
}

alertes.forEach(a => console.log("ALERTE  " + a));
if (erreurs.length) {
  erreurs.forEach(e => console.log("ROUGE   " + e));
  console.log(`\n${erreurs.length} défaut(s) : relevé NON conforme.`);
  process.exit(1);
}
console.log(`RELEVÉ VERT : ${cleDossier}, 40 clubs, 760 joueurs retenus.`);
