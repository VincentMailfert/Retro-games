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
