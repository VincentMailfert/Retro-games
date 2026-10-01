/* Harnais de validation — LE RAPPORT DU RECRUTEUR, SAISON PAR SAISON (v1.69)
   Retour de l'auteur : « David Sommeil en D2 à Caen en 2003 », « on voit toujours les mêmes », « leur note aussi ».
   Vérifie : pour chaque saison de départ, un vivier de vrais noms tirés de la liste de CET été (club, âge, note),
   personne qui soit déjà sous contrat en France, des listes qui changent vraiment d'un été à l'autre, la relève
   à chaque intersaison, le relais après la dernière liste, la reprise d'une vieille sauvegarde, zéro tiret long.
   Usage : node harness-recruteur.cjs                                                                        */
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const script = html.slice(html.indexOf("<script>") + "<script>".length, html.lastIndexOf("</script>"));

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
global.localStorage = ls;
global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,SAISONS,VIVIER_SAISON,genRapport,migre,nomLong,joueurDeVivier,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const noms = (G) => { const l = []; for (const t in (G.vivier || {})) for (const e of G.vivier[t]) l.push(e); return l; };
const employes = (G) => { const s = new Set(); for (const c of G.clubs.concat(G.autre || [])) for (const j of c.joueurs) s.add(j.nom); return s; };
/* chaque entrée du vivier doit sortir, telle quelle, de la liste de l'été `an` */
function conforme(G, an, etiquette) {
  const L = api.VIVIER_SAISON[an], par = {}; for (const e of L) par[e[0]] = e;
  const emp = employes(G), v = noms(G);
  const faux = [];
  for (const e of v) {
    const r = par[e[0]];
    if (!r) { faux.push(e[0] + " absent de la liste " + an); continue; }
    if (e[5] !== r[5]) faux.push(e[0] + " à " + e[5] + " (liste : " + r[5] + ")");
    if (e[2] !== an - r[2]) faux.push(e[0] + " a " + e[2] + " ans (attendu " + (an - r[2]) + ")");
    if (e[3] !== r[3] || e[4] !== r[4]) faux.push(e[0] + " note " + e[3] + "/" + e[4] + " (liste " + r[3] + "/" + r[4] + ")");
    if (emp.has(e[0])) faux.push(e[0] + " est aussi sous contrat en France");
  }
  if (faux.length) fail(etiquette + " : " + faux.slice(0, 5).join(" ; "));
  return { v, faux };
}

/* ===== A) Chaque saison de départ ===== */
console.log("A) Chaque saison de départ a son vivier d'époque");
for (const k in api.SAISONS) {
  try {
    const S = api.SAISONS[k];
    api.nouvellePartie(S.d1[0], k);
    const G = api.getG(), an = api.anneeJeu();
    if (!api.VIVIER_SAISON[an]) { fail(k + " : pas de liste pour l'été " + an); continue; }
    const { v, faux } = conforme(G, an, k);
    if (v.length < 25) fail(k + " : vivier maigre (" + v.length + " noms)");
    if (G.rapport.length !== 4) fail(k + " : " + G.rapport.length + " cartes au lieu de 4");
    const sansPrenom = G.rapport.filter(o => /^\p{Lu}\. /u.test(o.j.nom) && api.nomLong(o.j.nom) === o.j.nom).map(o => o.j.nom);
    if (sansPrenom.length) fail(k + " : carte sans prénom : " + sansPrenom.join(", "));
    if (!faux.length && v.length >= 25) ok(k + " : " + v.length + " noms de l'été " + an + ", ex. " + G.rapport.map(o => o.j.nom + " (" + o.j.lieu + ", " + o.j.note + ")").slice(0, 2).join(" · "));
  } catch (e) { fail("exception " + k + " : " + e.stack); }
}

/* ===== B) Le cas signalé ===== */
console.log("B) David Sommeil n'est plus à Caen en 2003");
try {
  api.nouvellePartie(api.SAISONS["2003-04"].d1[0], "2003-04");
  const s = noms(api.getG()).find(e => e[0] === "D. Sommeil");
  if (s) fail("D. Sommeil figure encore au vivier 2003 (" + s[5] + ")"); else ok("D. Sommeil absent du vivier 2003");
  const caen = noms(api.getG()).filter(e => /Caen/.test(e[5]));
  if (caen.length) fail("des joueurs « de Caen » dans le vivier 2003 : " + caen.map(e => e[0]).join(", ")); else ok("plus personne n'y est annoncé à Caen");
} catch (e) { fail("exception cas Sommeil : " + e.stack); }

/* ===== C) Des listes qui changent d'un été à l'autre ===== */
console.log("C) Toujours les mêmes ?");
{
  const ans = Object.keys(api.VIVIER_SAISON).map(Number).sort((a, b) => a - b);
  let pire = 0, paire = "";
  for (let i = 0; i + 1 < ans.length; i++) {
    const a = new Set(api.VIVIER_SAISON[ans[i]].map(e => e[0])), b = api.VIVIER_SAISON[ans[i + 1]].map(e => e[0]);
    const communs = b.filter(n => a.has(n)).length, r = communs / b.length;
    if (r > pire) { pire = r; paire = ans[i] + "→" + ans[i + 1]; }
  }
  if (pire > 0.55) fail("deux étés consécutifs partagent " + Math.round(pire * 100) + " % de leurs noms (" + paire + ")");
  else ok("d'un été au suivant, au plus " + Math.round(pire * 100) + " % de noms en commun (" + paire + ")");
  const a95 = new Set(api.VIVIER_SAISON[1995].map(e => e[0])), b99 = api.VIVIER_SAISON[1999].map(e => e[0]);
  const r = b99.filter(n => a95.has(n)).length / b99.length;
  if (r > 0.5) fail("1995 et 1999 partagent " + Math.round(r * 100) + " % de leurs noms");
  else ok("à quatre ans d'écart (1995 / 1999), " + Math.round(r * 100) + " % de noms en commun");
  // un même homme ne garde pas la même note dix ans de suite
  const notes = {}; for (const an of ans) for (const e of api.VIVIER_SAISON[an]) (notes[e[0]] = notes[e[0]] || []).push(e[3]);
  const figes = Object.keys(notes).filter(n => notes[n].length >= 4 && new Set(notes[n]).size === 1);
  if (figes.length) fail("note figée sur 4 étés ou plus : " + figes.join(", ")); else ok("aucune note figée sur quatre étés");
}

/* ===== D) La relève à chaque intersaison, puis le relais après la dernière liste ===== */
console.log("D) Carrière 2002-03 → 2006-07 : la liste suit l'été");
try {
  api.nouvellePartie(api.SAISONS["2002-03"].d1[0], "2002-03");
  for (let s = 0; s < 4; s++) {
    for (let d = 0; d < 38; d++) api.jouerJournee();
    const G = api.getG(); G.vire = null;
    api.intersaison();
    const an = api.anneeJeu(), G2 = api.getG();
    if (api.VIVIER_SAISON[an]) { const { faux } = conforme(G2, an, "été " + an); if (!faux.length) ok("été " + an + " : vivier relevé sur la liste de l'année (" + noms(G2).length + " noms)"); }
    else {
      const v = noms(G2);
      if (v.length < 20) fail("été " + an + " (après la dernière liste) : vivier maigre (" + v.length + ")");
      else if (G2.rapport.length !== 4) fail("été " + an + " : " + G2.rapport.length + " cartes");
      else ok("été " + an + " : l'ancien vieillissement prend le relais (" + v.length + " noms)");
    }
  }
} catch (e) { fail("exception carrière : " + e.stack); }

/* ===== E) Une sauvegarde d'avant v1.69 ===== */
console.log("E) Reprise d'une vieille sauvegarde");
try {
  api.nouvellePartie(api.SAISONS["2003-04"].d1[0], "2003-04");
  const G = api.getG();
  G.vivier = { "Pépite de Division 2": [["D. Sommeil", "D", 29, 81, 81, "SM Caen (D2)"]], "En froid avec son club — décote": [["R. Baggio", "A", 36, 70, 70, "Milan AC, barré par la concurrence"]] };
  delete G._vivierAn;
  api.migre();
  const v = noms(G);
  if (v.some(e => e[0] === "D. Sommeil")) fail("la vieille sauvegarde garde Sommeil à Caen");
  else conforme(G, 2003, "sauvegarde reprise").faux.length || ok("le vivier est refait sur la liste 2003 au chargement");
} catch (e) { fail("exception migration : " + e.stack); }

/* ===== F) Zéro tiret long, nationalités ===== */
console.log("F) Ce que la carte affiche");
try {
  let tirets = [];
  for (const k of ["1993-94", "1997-98", "2004-05"]) {
    api.nouvellePartie(api.SAISONS[k].d1[0], k);
    for (const t in api.getG().vivier) if (/—/.test(t)) tirets.push(t);
    for (const e of noms(api.getG())) if (/—/.test(e[5])) tirets.push(e[5]);
  }
  if (tirets.length) fail("tiret long sur une carte : " + [...new Set(tirets)].join(" | ")); else ok("aucun tiret long dans les profils ni les clubs");
  const z = api.joueurDeVivier(["Z. Zidane", "M", 25, 89, 91, "Juventus"], "Français de l'étranger");
  const h = api.joueurDeVivier(["T. Henry", "A", 26, 92, 92, "Arsenal"], "Vétéran en fin de carrière");
  const r = api.joueurDeVivier(["Ronaldo", "A", 21, 92, 97, "Inter Milan"], "International confirmé");
  if (z.nat !== "FR" || h.nat !== "FR" || r.nat !== "ETR") fail("nationalités : Zidane " + z.nat + ", Henry " + h.nat + ", Ronaldo " + r.nat);
  else ok("Zidane et Henry signent Français, Ronaldo étranger");
} catch (e) { fail("exception affichage : " + e.stack); }

console.log(FAILS ? "\n" + FAILS + " échec(s)" : "\nTout est vert.");
process.exit(FAILS ? 1 : 0);
