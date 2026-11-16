/* Harnais de validation : les trêves et la taille des divisions (v2.97). Détail plus bas. */
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

const epilogue = "\n;return {SAISONS,CLUBS_ITA,SIEGES_ITA,berger,TREVES_ORDRE,estTreve,tailleD1,echangesDiv,echangesSaison," +
  "nouvellePartie,jouerJournee,intersaison,anneeJeu,clubById,panneauTreve,passeTreve,majMoral,finirJournee,libTreve," +
  "objectifEntr,getG:function(){return G;}};";
const api = new Function(script + epilogue)();
const { SAISONS, CLUBS_ITA, SIEGES_ITA } = api;

let FAILS = 0;
const ok = (c, m) => { if (c) console.log("  ✓ " + m); else { FAILS++; console.log("  ✗ " + m); } };

/* =====================================================================================================
   Harnais de validation — LES TRÊVES ET LA TAILLE DES DIVISIONS (v2.97)
   Décision de l'auteur du 16/11/2026 : la Serie A se joue à sa vraie taille, DIX-HUIT clubs jusqu'en
   2003-04 et VINGT ensuite. Le calendrier garde trente-huit journées, dont quatre de trêve quand une
   division n'a que dix-huit clubs ; quatre montées et quatre descentes à dix-huit ; l'été 2004, trois
   relégués et cinq promus (la Serie B tombe alors à dix-huit et joue à son tour avec quatre trêves).
     A) le calendrier : 38 journées, 4 trêves à 18 clubs aux bonnes dates, aucune à 20, chaque paire deux fois
     B) les tailles et les échanges : Italie avant et après 2004, France et Angleterre inchangées
     C) une saison italienne à dix-huit : 34 matchs par club, trêves vécues sans exception ni rancune de banc
     D) l'été 2004 en carrière : la Serie A passe à vingt, la Serie B à dix-huit, et chacune a son calendrier
     E) la France n'a pas bougé : vingt clubs, aucune trêve, trois montées et trois descentes
   Usage : node harness-treves.cjs
   ===================================================================================================== */

const ESSAI_D1 = ["JUV", "MIL", "INT", "ROM", "LAZ", "PAR", "NAP", "SAM", "FIO", "TOR",
  "GEN", "ATA", "BGN", "UDI", "CAG", "HEL", "BAI", "LEC", "FOG", "CRM"];
function plateauEssai(an) {
  const t1 = api.tailleD1("ITA", an), d1 = ESSAI_D1.slice(0, t1);
  return {
    pays: "ITA", an, titre: an + "-" + String((an + 1) % 100).padStart(2, "0"),
    nom: "Essai des trêves", sous: "Plateau d'essai du harnais, retiré aussitôt.",
    d1, d2: CLUBS_ITA.map(c => c.id).filter(id => !ESSAI_D1.includes(id)).slice(0, 20),
    starsD1: {}, starsD2: {},
    euroC1: SIEGES_ITA[an].C1, euroC2: SIEGES_ITA[an].C2, euroC3: SIEGES_ITA[an].C3,
  };
}
const cleEssai = an => "ESSAI-TREVES-" + an;
for (const an of [1990, 2003]) SAISONS[cleEssai(an)] = plateauEssai(an);

/* ===== A) Le calendrier ===== */
console.log("A) Le calendrier de Berger, à dix-huit et à vingt");
for (const n of [18, 20]) {
  const ids = Array.from({ length: n }, (_, i) => "C" + i);
  const cal = api.berger(ids);
  ok(cal.length === 38, `${n} clubs : ${cal.length} journées au calendrier (38 attendues)`);
  const vides = cal.map((d, i) => d.length ? -1 : i).filter(i => i >= 0);
  const attendu = n === 18 ? [8, 17, 18, 28] : [];
  ok(JSON.stringify(vides) === JSON.stringify(attendu),
    `${n} clubs : trêves aux journées ${vides.map(i => "J" + (i + 1)).join(", ") || "aucune"} (attendu ${attendu.map(i => "J" + (i + 1)).join(", ") || "aucune"})`);
  ok(cal[0].length > 0 && cal[37].length > 0, `${n} clubs : ni la première ni la dernière journée ne sont des trêves`);
  const matchs = {}, dom = {}, paires = {};
  for (const d of cal) {
    const vus = new Set();
    for (const [h, a] of d) {
      if (vus.has(h) || vus.has(a)) { ok(false, `${n} clubs : un club joue deux fois la même journée`); }
      vus.add(h); vus.add(a);
      matchs[h] = (matchs[h] || 0) + 1; matchs[a] = (matchs[a] || 0) + 1; dom[h] = (dom[h] || 0) + 1;
      paires[h + ">" + a] = (paires[h + ">" + a] || 0) + 1;
    }
    if (d.length && d.length !== n / 2) ok(false, `${n} clubs : une journée jouée n'a que ${d.length} matchs`);
  }
  ok(ids.every(id => matchs[id] === 2 * (n - 1)), `${n} clubs : chacun joue ${2 * (n - 1)} matchs`);
  ok(ids.every(id => dom[id] === n - 1), `${n} clubs : chacun reçoit ${n - 1} fois`);
  ok(Object.keys(paires).length === n * (n - 1) && Object.values(paires).every(v => v === 1),
    `${n} clubs : chaque club reçoit chacun des autres exactement une fois`);
}

/* ===== B) Les tailles et les échanges ===== */
console.log("\nB) La taille de l'élite et les montées-descentes de l'été");
ok(api.tailleD1("ITA", 1990) === 18 && api.tailleD1("ITA", 2003) === 18, "Serie A à dix-huit de 1990-91 à 2003-04");
ok(api.tailleD1("ITA", 2004) === 20 && api.tailleD1("ITA", 2009) === 20, "Serie A à vingt à partir de 2004-05");
ok(api.tailleD1("FR", 1997) === 20 && api.tailleD1("ANG", 1990) === 20, "France et Angleterre à vingt quelle que soit l'année");
const eq = (x, d, m) => x.desc === d && x.mont === m;
ok(eq(api.echangesDiv("ITA", 1991, 18), 4, 4), "été 1991 en Italie : quatre descentes, quatre montées");
ok(eq(api.echangesDiv("ITA", 2003, 18), 4, 4), "été 2003 en Italie : quatre et quatre");
ok(eq(api.echangesDiv("ITA", 2004, 18), 3, 5), "été 2004 en Italie : trois relégués, cinq promus (passage à vingt)");
ok(eq(api.echangesDiv("ITA", 2005, 20), 3, 3), "été 2005 en Italie : trois et trois");
ok(eq(api.echangesDiv("FR", 1996, 20), 3, 3) && eq(api.echangesDiv("ANG", 2001, 20), 3, 3), "France et Angleterre : trois et trois");
ok(api.objectifEntr(0, 1, 18).place === 14 && api.objectifEntr(0, 1, 20).place === 17,
  "l'objectif « maintien » vise la 14e place à dix-huit (quatre descendent), la 17e à vingt");

/* ===== C) Une saison italienne à dix-huit ===== */
console.log("\nC) Une saison de Serie A à dix-huit, jouée de bout en bout");
try {
  api.nouvellePartie("JUV", cleEssai(1990));
  let G = api.getG();
  ok(G.clubs.length === 18 && G.autre.length === 20, `la carrière ouvre sur 18 clubs en Serie A et 20 en Serie B (${G.clubs.length} + ${G.autre.length})`);
  ok(G.calendrier.length === 38, `le calendrier a ${G.calendrier.length} journées`);
  let treves = 0, rancune = 0, ok38 = true;
  for (let d = 0; d < 38; d++) {
    G = api.getG();
    if (api.estTreve(G)) {
      treves++;
      const html = api.panneauTreve();
      if (!/PAS DE MATCH CE WEEK-END/.test(html) || !/bTreve/.test(html) || /—/.test(html)) ok(false, `J${d + 1} : panneau de trêve incomplet`);
      const moi = api.clubById(G.monClub), banc = moi.joueurs.map(j => j.sansJouer || 0), j0 = G.journee;
      ok(api.passeTreve() === true && api.getG().journee === j0 + 1, `J${d + 1} (${api.libTreve(j0)}) : la semaine passe d'une journée`);
      if (moi.joueurs.some((j, i) => (j.sansJouer || 0) > banc[i])) rancune++;
    } else {
      if (api.passeTreve() !== false) ok(false, `J${d + 1} : passeTreve a joué une journée qui n'est pas une trêve`);
      api.jouerJournee();
    }
    if (api.getG().journee !== d + 1) ok38 = false;
  }
  G = api.getG();
  ok(ok38, "chaque journée, trêve ou non, fait avancer le calendrier d'un cran");
  ok(treves === 4, `quatre trêves vécues (${treves})`);
  ok(rancune === 0, "une trêve ne fait cirer le banc à personne (aucun compteur sansJouer ne monte)");
  ok(G.clubs.every(c => c.j === 34), `chaque club de Serie A a joué 34 matchs (${[...new Set(G.clubs.map(c => c.j))].join(", ")})`);
  ok(G.finie === true, "la saison se referme à la J38");
  G.vire = null; api.intersaison(); G = api.getG();
  ok(G.clubs.length + G.autre.length === 38, "après l'été 1991, toujours 38 clubs");
  const sa = G.div === 1 ? G.clubs : G.autre, sb = G.div === 1 ? G.autre : G.clubs;
  ok(sa.length === 18 && sb.length === 20, `après l'été 1991, Serie A à 18 et Serie B à 20 (${sa.length} + ${sb.length})`);
  ok(G.calendrier.filter(d => !d.length).length === (G.clubs.length === 18 ? 4 : 0), "le nouveau calendrier a ses trêves s'il le faut");
} catch (e) { ok(false, "exception en saison italienne à dix-huit : " + e.stack); }

/* ===== D) L'été 2004 ===== */
console.log("\nD) L'été 2004 : la Serie A passe à vingt clubs");
for (const dep of ["JUV", CLUBS_ITA.map(c => c.id).filter(id => !ESSAI_D1.includes(id))[0]]) {
  try {
    api.nouvellePartie(dep, cleEssai(2003));
    let G = api.getG();
    const div0 = G.div;
    for (let d = 0; d < 38; d++) api.jouerJournee();
    G = api.getG(); G.vire = null;
    api.intersaison(); G = api.getG();
    const sa = G.div === 1 ? G.clubs : G.autre, sb = G.div === 1 ? G.autre : G.clubs;
    ok(api.anneeJeu() === 2004, `${dep} (départ en Serie ${div0 === 1 ? "A" : "B"}) : la carrière est en 2004-05`);
    ok(sa.length === 20 && sb.length === 18, `${dep} : Serie A à 20, Serie B à 18 (${sa.length} + ${sb.length})`);
    const vides = G.calendrier.filter(d => !d.length).length;
    ok(G.calendrier.length === 38 && vides === (G.clubs.length === 18 ? 4 : 0),
      `${dep} : le calendrier de la division jouée (${G.clubs.length} clubs) a ${vides} trêve(s)`);
    ok(G.recap && G.recap.some(l => /passe à 20 clubs : 3 relégués, 5 promus/.test(l)), `${dep} : l'intersaison l'annonce`);
    for (let d = 0; d < 38; d++) api.jouerJournee();
    G = api.getG();
    const n = G.clubs.length;
    ok(G.clubs.every(c => c.j === 2 * (n - 1)), `${dep} : en 2004-05, chacun joue ${2 * (n - 1)} matchs`);
    G.vire = null; api.intersaison(); G = api.getG();
    const sa2 = G.div === 1 ? G.clubs : G.autre, sb2 = G.div === 1 ? G.autre : G.clubs;
    ok(sa2.length === 20 && sb2.length === 18, `${dep} : en 2005-06, les tailles tiennent (${sa2.length} + ${sb2.length})`);
  } catch (e) { ok(false, `exception à l'été 2004 (${dep}) : ` + e.stack); }
}

/* ===== E) La France ===== */
console.log("\nE) La France n'a pas bougé");
try {
  api.nouvellePartie("NAN", "1995-96");
  let G = api.getG();
  ok(G.clubs.length === 20 && G.calendrier.every(d => d.length === 10), "1995-96 : vingt clubs, trente-huit journées pleines");
  ok(api.echangesSaison(G).desc === 3 && api.echangesSaison(G).mont === 3, "trois montées et trois descentes");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G = api.getG(); G.vire = null; api.intersaison(); G = api.getG();
  ok(G.clubs.length === 20 && G.autre.length === 20, "après l'été, toujours vingt et vingt");
} catch (e) { ok(false, "exception en France : " + e.stack); }

for (const an of [1990, 2003]) delete SAISONS[cleEssai(an)];
console.log(FAILS === 0 ? "\n✅ HARNAIS TRÊVES : TOUT EST VERT" : "\n❌ HARNAIS TRÊVES : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
