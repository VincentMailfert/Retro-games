// Assemblage d'un relevé anglais (releves/ANG-AAAA-AA) en tables du jeu.
// Usage : node assemble.cjs <racine du dépôt> <AAAA> <sortie.json>
// Ne modifie rien : produit les blocs de texte à insérer et un compte rendu.
"use strict";
const fs = require("fs"), path = require("path");
const R = process.argv[2], AN = +process.argv[3], OUT = process.argv[4];
const yy = n => String(n % 100).padStart(2, "0");
const SUF = yy(AN) + yy(AN + 1), CLE = `ANG-${AN}-${yy(AN + 1)}`;
const P = JSON.parse(fs.readFileSync(`${R}/releves/${CLE}/plateau.json`, "utf8"));
const J = JSON.parse(fs.readFileSync(`${R}/releves/${CLE}/joueurs.json`, "utf8"));
const AJUST_BRUT = JSON.parse(fs.readFileSync(path.join(__dirname, `ajust-${SUF}.json`), "utf8"));
const FORCER = AJUST_BRUT._forcer || []; const AJUST = Object.fromEntries(Object.entries(AJUST_BRUT).filter(([k]) => !k.startsWith("_")));
const html = fs.readFileSync(`${R}/championnat/index.html`, "utf8");
const strip = s => s.replace(/æ/g, "ae").replace(/Æ/g, "Ae").replace(/[øØ]/g, "o").replace(/ß/g, "ss").replace(/[łŁ]/g, "l").replace(/[đĐðÐ]/g, "d").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z. -]/g, "");
const journal = { corrections: [], graphie: [], homonymes: [], innommables: [], forces: [], ajust: [], herit: { prec: 0, suiv: 0, loin: 0, vivier: 0, calc: 0 } };

// corrections à la main du relevé (ajust-AAAA.json) : _retirer / _ajouter, [club, nom entier, raison], chacune vérifiée
for (const [c, n, r] of (AJUST_BRUT._retirer || [])) { const j = (J[c] || []).find(x => x.nom === n); if (!j) throw new Error("_retirer : " + n + " absent de " + c); j.retenu = false; journal.corrections.push(`retiré de ${c} : ${n} (${r})`); }
for (const [c, n, r] of (AJUST_BRUT._ajouter || [])) { const j = (J[c] || []).find(x => x.nom === n); if (!j) throw new Error("_ajouter : " + n + " absent de " + c); j.retenu = true; j.arrivee = 2; journal.corrections.push(`ajouté à ${c} : ${n} (${r})`); }

// ---------- toutes les tables STARS du jeu ----------
const TABLES = {}; // nom -> {an, pays, clubs:{code:[[nom,poste,age,note,pot]]}}
for (const m of html.matchAll(/const (STARS[A-Z0-9_]*)=\{([\s\S]*?)\n\};/g)) {
  const k = /(\d{2})(\d{2})$/.exec(m[1]);
  const an = k ? ((+k[1] < 50 ? 2000 : 1900) + +k[1]) : 1995;
  const clubs = {};
  for (const c of m[2].split(/\n (?=[A-Z]{2,4}:\[)/)) {
    const code = (/^\s*([A-Z]{2,4}):\[/.exec(c) || [])[1]; if (!code) continue;
    clubs[code] = [...c.matchAll(/\["([^"]+)","([GDMA])",(\d+),(\d+),(\d+)\]/g)].map(x => [x[1], x[2], +x[3], +x[4], +x[5]]);
  }
  TABLES[m[1]] = { an, ang: /ANG/.test(m[1]), clubs };
}
const NOMS_JEU = new Map(); // nom court -> [{by, an, tab}]
for (const [t, T] of Object.entries(TABLES)) for (const c in T.clubs) for (const j of T.clubs[c]) {
  const l = NOMS_JEU.get(j[0]) || []; l.push({ by: T.an - j[2], an: T.an, tab: t, note: j[3], pot: j[4], poste: j[1] }); NOMS_JEU.set(j[0], l);
}
// vivier du recruteur de l'été (échelle « vitrine », un cran au-dessus des effectifs)
const vi = html.indexOf("const VIVIER_SAISON={"), vj = html.indexOf(`\n ${AN}:[`, vi), vk = html.indexOf("\n ],", vj);
const VIVIER = new Map([...html.slice(vj, vk).matchAll(/\["([^"]+)","([GDMA])",(\d{4}),(\d+),(\d+),"([^"]+)"/g)].map(m => [m[1], { by: +m[3], note: +m[4], pot: +m[5], club: m[6], poste: m[2] }]));
for (const [n, v] of VIVIER) { const l = NOMS_JEU.get(n) || []; l.push({ by: v.by, an: AN, tab: "VIVIER", poste: v.poste }); NOMS_JEU.set(n, l); }
const PRENOMS = new Map([...html.slice(html.indexOf("const PRENOMS_VRAIS={"), html.indexOf("const PRENOMS_GEN")).matchAll(/"([^"]+)":"([^"]*)"/g)].map(m => [m[1], m[2]]));

// ---------- graphie : le jeu gagne ----------
// même homme : même naissance à un an près ET poste compatible (un gardien reste gardien, un défenseur ne devient pas avant-centre)
const compat = (a, b) => !a || !b || a === b || (a !== "G" && b !== "G" && !((a === "D" && b === "A") || (a === "A" && b === "D")));
const memeHomme = (l, by, po) => (l || []).some(e => Math.abs(e.by - by) <= 1 && compat(e.poste, po));
const autreHomme = (l, by, po) => (l || []).some(e => Math.abs(e.by - by) > 1 || !compat(e.poste, po));
function formeInitiale(nom) {
  const t = nom.trim().split(/\s+/); if (t.length < 2) return nom;
  return t[0][0].toUpperCase() + ". " + t.slice(1).join(" ");
}
// prénom composé : une initiale par prénom (« Lars Erik Andersen » → « L. E. Andersen »)
function formeInitiales(nom) { const t = nom.trim().split(/\s+/); if (t.length < 3) return formeInitiale(nom); return t.slice(0, -1).map(x => x[0].toUpperCase() + ".").join(" ") + " " + t[t.length - 1]; }
const PRIS = new Map(); // nom retenu -> tm
function resoudre(j) {
  if (!/^[0-9]{4}/.test(j.naissance || "")) return null;
  const by = +j.naissance.slice(0, 4);
  const t0 = j.nom.trim().split(/\s+/), formeCourte = t0.length > 2 ? t0[0][0].toUpperCase() + ". " + t0[t0.length - 1] : formeInitiale(j.nom);
  const formes = [...new Set([j.court, formeInitiale(j.nom), formeInitiales(j.nom), formeCourte, j.nom])];
  // toutes les graphies que le jeu donne à CE même homme (à l'accent près), la plus proche d'abord :
  // le recruteur de l'été, puis les tables anglaises par proximité d'année, puis le reste
  const cands = [];
  for (const [g, l] of NOMS_JEU) if (formes.some(f => strip(f) === strip(g))) for (const e of l) if (Math.abs(e.by - by) <= 1 && compat(e.poste, j.poste) && !autreHomme(l.filter(x => x !== e), by, j.poste))
    cands.push({ g, rang: e.tab === "VIVIER" ? 0 : (/ANG/.test(e.tab) ? 1 + Math.abs(e.an - AN) : 50 + Math.abs(e.an - AN)) });
  cands.sort((x, y) => x.rang - y.rang);
  for (const c of cands) if (!autreHommeIci(c.g, j.tm)) { if (c.g !== j.court) journal.graphie.push(`${j.nom} : « ${j.court} » → « ${c.g} » (graphie du jeu)`); return c.g; }
  for (const f of [formeInitiales(j.nom), formeInitiale(j.nom), j.court, j.nom].filter(f => !/^[A-ZÀ-Þ]\. [A-ZÀ-Þ][a-zà-ÿ']+ [A-ZÀ-Þ]/.test(f) || /^[A-ZÀ-Þ]\. (Van|Von|De|Da|Di|Du|Le|La|Mac|Mc|O|El|Al|Ben|Der|Ten|Ter|Saint|San) /.test(f))) if (!autreHomme(NOMS_JEU.get(f), by, j.poste) && !autreHommeIci(f, j.tm)) { if (f === j.nom && f !== j.court) journal.homonymes.push(`${j.nom} porte son nom entier (« ${formeInitiale(j.nom)} » est à un autre homme)`); return f; }
  return null;
}
function autreHommeIci(n, tm) { return PRIS.has(n) && PRIS.get(n) !== tm; }

// ---------- notes ----------
const vieillir = age => age <= 21 ? 2 : age <= 24 ? 1 : age <= 29 ? 0 : age <= 32 ? -1 : -2; // de age-1 à age
const COURBE = { 15: -10, 16: -9, 17: -8, 18: -6, 19: -4, 20: -3, 21: -2, 22: -1, 23: 0, 24: 0, 25: 0, 26: 1, 27: 1, 28: 1, 29: 1, 30: 0, 31: -1, 32: -2, 33: -3, 34: -4, 35: -5, 36: -6, 37: -7, 38: -7, 39: -8, 40: -8 };
const GAIN = { 15: 18, 16: 17, 17: 16, 18: 14, 19: 11, 20: 9, 21: 7, 22: 5, 23: 4, 24: 3, 25: 2, 26: 1 };
function calcule(div, rangClub, nClubs, rangMin, nEff, age) {
  const base = div === 1 ? 70.5 : 67.5;
  const club = div === 1 ? 6 - (rangClub - 1) * 10 / (nClubs - 1) : 3 - (rangClub - 1) * 6 / (nClubs - 1);
  const temps = 4 - rangMin * 10 / Math.max(1, nEff - 1);
  const n = Math.round(Math.min(80, Math.max(55, base + club + temps + (COURBE[age] ?? -8))));
  return [n, Math.min(92, n + (GAIN[age] || 0))];
}
function ancre(nom, age) {
  // la saison précédente d'abord, vieillie d'un an ; puis la suivante, rajeunie ; puis plus loin
  const cherche = (an) => { for (const [t, T] of Object.entries(TABLES)) if (T.ang && T.an === an) for (const c in T.clubs) for (const x of T.clubs[c]) if (x[0] === nom && Math.abs((x[2] + (AN - an)) - age) <= 1) return { note: x[3], pot: x[4], age: x[2], an }; return null; };
  return { prec: cherche(AN - 1), suiv: cherche(AN + 1), loin: cherche(AN - 2) || cherche(AN + 2) || cherche(AN - 3) || cherche(AN - 4) };
}
function note(nom, age, calc) {
  const A = ancre(nom, age), v = VIVIER.get(nom);
  if (A.prec) { journal.herit.prec++; const n = A.prec.note + vieillir(age); return [n, Math.max(A.prec.pot, n)]; }
  if (v) { journal.herit.vivier++; const n = v.note - 2; return [n, Math.max(v.pot - 1, n)]; }
  if (A.suiv) { journal.herit.suiv++; const raj = A.suiv.note - vieillir(age + 1); const n = Math.round((raj + calc[0]) / 2); return [n, Math.max(A.suiv.pot, n)]; }
  if (A.loin) {
    journal.herit.loin++; let n = A.loin.note, a = A.loin.age;
    if (A.loin.an < AN) for (let y = A.loin.an + 1; y <= AN; y++) { a++; n += vieillir(a); } else for (let y = A.loin.an; y > AN; y--) { n -= vieillir(a); a--; }
    const m = Math.round((n + calc[0]) / 2); return [m, Math.max(A.loin.pot, m)];
  }
  journal.herit.calc++; return calc;
}

// ---------- effectifs ----------
const ordre = ["G", "D", "M", "A"];
const sortie = { d1: P.d1, d2: P.d2, stars1: {}, stars2: {}, prenoms: [], vides: [] };
const SUIV = TABLES[`STARS_ANG${yy(AN + 1)}${yy(AN + 2)}`], SUIV2 = TABLES[`STARS_D2_ANG${yy(AN + 1)}${yy(AN + 2)}`];
for (const [div, codes, rangs] of [[1, P.d1, P.classementD1], [2, P.d2, P.classementD2]]) {
  for (const c of codes) {
    const rangClub = rangs.findIndex(r => r.code === c) + 1, quota = div === 1 ? 20 : 18;
    let retenus = J[c].filter(j => j.retenu);
    // pépites : jeunes présents au coup d'envoi que le jeu porte haut la saison suivante (même club)
    const plus = ((SUIV && SUIV.clubs[c]) || (SUIV2 && SUIV2.clubs[c]) || []);
    const candidats = J[c].filter(j => !j.retenu && j.arrivee === 2 && j.statut !== "not in squad" && AN - +j.naissance.slice(0, 4) <= 21)
      .map(j => ({ j, s: plus.find(x => strip(x[0]).endsWith(strip(j.nom.split(" ").slice(-1)[0])) && Math.abs((x[2] - 1) - (AN - +j.naissance.slice(0, 4))) <= 1 && x[4] >= 84) })).filter(x => x.s).slice(0, 2);
    for (const { j, s } of candidats) {
      const cpt = k => retenus.filter(x => x.poste === k).length, MIN = { G: 2, D: 5, M: 5, A: 4 };
      const sortant = retenus.filter(x => !x.force && x.poste !== "G" && cpt(x.poste) > MIN[x.poste]).sort((a, b) => a.minutes - b.minutes)[0];
      if (!sortant) continue;
      retenus = retenus.filter(x => x !== sortant).concat([{ ...j, retenu: true, force: true }]);
      journal.forces.push(`${j.nom} (${c}, ${AN - +j.naissance.slice(0, 4)} ans, ${j.minutes} min ; ${s[0]} ${s[3]}/${s[4]} la saison suivante) à la place de ${sortant.nom} (${sortant.minutes} min)`);
    }
    // pépites forcées à la main (ajust-AAAA.json, clé _forcer : [club, nom entier, raison])
    for (const [fc, fn, raison] of FORCER.filter(x => x[0] === c)) {
      const j = J[c].find(x => x.nom === fn); if (!j || retenus.some(x => x.tm === j.tm)) continue;
      const cpt = k => retenus.filter(x => x.poste === k).length, MIN = { G: 2, D: 5, M: 5, A: 4 };
      const sortant = retenus.filter(x => !x.force && x.poste !== "G" && cpt(x.poste) > MIN[x.poste]).sort((a, b) => a.minutes - b.minutes)[0];
      if (!sortant) continue;
      retenus = retenus.filter(x => x !== sortant).concat([{ ...j, retenu: true, force: true }]);
      journal.forces.push(`${j.nom} (${c}, ${AN - +j.naissance.slice(0, 4)} ans, ${j.minutes} min) à la place de ${sortant.nom} (${sortant.minutes} min) : ${raison}`);
    }
    retenus.sort((a, b) => b.minutes - a.minutes);
    const lignes = [];
    retenus.forEach((j, i) => {
      let nom = resoudre(j);
      if (!nom && !/^\d{4}/.test(j.naissance || "")) { journal.innommables.push(`${j.nom} (${c}) : aucune date de naissance, non retenu`); return; }
      const age = AN - +j.naissance.slice(0, 4);
      if (!nom) { journal.innommables.push(`${j.nom} (${c}) : aucun nom libre`); return; }
      PRIS.set(nom, j.tm);
      if (age > 40) { journal.innommables.push(`${j.nom} (${c}) : ${age} ans, au-delà de ce que le jeu accepte`); return; }
      let [n, p] = note(nom, age, calcule(div, rangClub, rangs.length, i, retenus.length, age));
      const aj = AJUST[nom] || AJUST[j.nom];
      if (aj) { journal.ajust.push(`${nom} : ${n}/${p} → ${aj[0]}/${aj[1]} (${aj[2]})`); [n, p] = aj; }
      n = Math.max(55, Math.min(90, n)); p = Math.min(92, Math.max(p, n));
      // cohérence avec le jeu : un homme connu la saison d'avant garde son âge de l'an passé plus un
      const Aprec = ancre(nom, age).prec; let ageJeu = age; if (Aprec && Aprec.age + 1 !== age) { journal.ages = journal.ages || []; journal.ages.push(`${nom} : ${age} → ${Aprec.age + 1} (âge du jeu la saison d'avant + 1)`); ageJeu = Aprec.age + 1; }
      lignes.push({ nom, poste: j.poste, age: ageJeu, n, p, prenom: j.prenom, nomEntier: j.nom });
    });
    lignes.sort((a, b) => ordre.indexOf(a.poste) - ordre.indexOf(b.poste) || b.n - a.n);
    (div === 1 ? sortie.stars1 : sortie.stars2)[c] = lignes;
    for (const l of lignes) {
      const m = /^([A-ZÀ-Ý][a-zà-ÿ]*(?:-[A-ZÀ-Ý][a-zà-ÿ]*)?)\. /.exec(l.nom);
      if (!m || PRENOMS.has(l.nom) || sortie.prenoms.some(x => x[0] === l.nom)) continue;
      let pr = l.prenom || "";
      if (pr && !pr.startsWith(m[1].split("-")[0])) pr = "";
      sortie.prenoms.push([l.nom, pr]); if (!pr) sortie.vides.push(l.nom);
    }
  }
}

// ---------- texte des tables ----------
const ligneClub = (c, L) => {
  const parPoste = ordre.map(k => L.filter(l => l.poste === k).map(l => `["${l.nom}","${l.poste}",${l.age},${l.n},${l.p}]`).join(",")).filter(Boolean);
  return ` ${c}:[` + parPoste.join(",\n   ") + "]";
};
sortie.texteStars = `const STARS_ANG${SUF}={\n` + P.d1.map(c => ligneClub(c, sortie.stars1[c])).join(",\n") + ",\n};\n"
  + `const STARS_D2_ANG${SUF}={\n` + P.d2.map(c => ligneClub(c, sortie.stars2[c])).join(",\n") + ",\n};\n"
  + `const D1_ANG${SUF}=${JSON.stringify(P.d1)};\nconst D2_ANG${SUF}=${JSON.stringify(P.d2)};\n`;
const stat = L => { const n = L.map(l => l.n).sort((a, b) => a - b); return { moy: +(n.reduce((s, x) => s + x, 0) / n.length).toFixed(1), med: n[n.length >> 1], max: n[n.length - 1], nb: n.length }; };
sortie.stats = { elite: stat(Object.values(sortie.stars1).flat()), dessous: stat(Object.values(sortie.stars2).flat()) };
sortie.journal = journal;
fs.writeFileSync(OUT, JSON.stringify(sortie, null, 1));
console.log(JSON.stringify({ stats: sortie.stats, herit: journal.herit, graphie: journal.graphie.length, homonymes: journal.homonymes.length, innommables: journal.innommables, forces: journal.forces.length, prenoms: sortie.prenoms.length, vides: sortie.vides.length }, null, 1));
