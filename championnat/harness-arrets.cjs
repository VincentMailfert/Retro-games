/* Harnais headless — LES ARRÊTS DU COACH (v2.57)
   Le match s'arrête de lui-même sur une situation de jeu et pose une question courte. Ce harnais garde :
   A) le rythme, sur des journées réellement jouées : jamais zéro arrêt, jamais plus de trois, deux en moyenne,
      la mi-temps toujours, et chaque situation finit par se présenter (but encaissé, homme cuit, score serré)
   B) les questions : deux ou trois réponses, « garder le plan » toujours là, aucune consigne proposée deux fois,
      pas de tiret long, pas de chiffre de mécanique
   C) l'homme cuit : le plus entamé des titulaires encore sur la pelouse, jamais le gardien, jamais un homme que le
      banc sort déjà, et plus personne quand les trois changements sont faits
   D) le changement d'un clic (changementDirect) prend l'une des trois places et s'annonce au téléscripteur
   E) chaque consigne a un avantage ET un risque : « Offensif » gagne plus souvent que « Prudent », et perd aussi
      plus souvent ; aucune réponse n'est toujours la meilleure
   F) le réglage : coupé, le match ne s'arrête jamais ; rallumé, la mi-temps pose sa question, et un clic reprend
   Usage : node harness-arrets.cjs                                                                  */
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</scr" + "ipt>"));

function makeStub() {
  let stub;
  const fn = function () { return stub; };
  stub = new Proxy(fn, {
    get(_t, p) { if (p === Symbol.toPrimitive) return () => ""; if (p === "length") return 0; return stub; },
    set() { return true; }, apply() { return stub; }, has() { return true; }, construct() { return stub; },
  });
  return stub;
}
/* un vrai petit nœud pour #fiche : il retient ce qu'on lui écrit et rend des boutons cliquables */
function noeud() {
  const n = { _h: "", style: {}, dataset: {}, disabled: false, onclick: null, _enfants: {} };
  Object.defineProperty(n, "innerHTML", { get() { return n._h; }, set(v) { n._h = String(v); n._enfants = {}; } });
  n.querySelector = () => null;
  n.querySelectorAll = sel => {
    const out = [], re = /<button([^>]*)>/g, veut = sel.replace(".", "");
    let mm;
    while ((mm = re.exec(n._h))) {
      const attrs = mm[1];
      const cls = (/class="([^"]*)"/.exec(attrs) || [, ""])[1].split(" ");
      const dn = (/data-n="([^"]*)"/.exec(attrs) || [, ""])[1];
      if (!cls.includes(veut)) continue;
      if (!n._enfants[dn]) { const b = noeud(); b.dataset.n = dn; n._enfants[dn] = b; }
      out.push(n._enfants[dn]);
    }
    return out;
  };
  return n;
}
const FICHE = noeud(), generic = makeStub();
const ls = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
global.document = new Proxy(function () {}, {
  get(_t, p) {
    if (p === "getElementById") return id => (id === "fiche" ? FICHE : generic);
    if (p === "querySelector") return () => null;
    if (p === Symbol.toPrimitive) return () => "";
    return generic;
  },
  set() { return true; }, apply() { return generic; }, has() { return true; }, construct() { return generic; },
});
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, localStorage: ls, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.localStorage = ls; global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = cb => setTimeout(cb, 0); global.cancelAnimationFrame = id => clearTimeout(id);

const api = new Function(script + "\n;return {nouvellePartie,jouerJournee,clubById,enJeu,tireSubs,simuleMatch,rejoueDepuis," +
  "lignesChangements,fraich,planArrets,situationArret,questionArret,hommeCuit,changementDirect,arretsDuMatch," +
  "arretsActifs,poseArrets,ARRETS,ARRETS_DIT,CONSIGNES,simuleReste," +
  "getChg:function(){return CHANGEMENTS;},setChg:function(x){CHANGEMENTS=x;},getG:function(){return G;}};")();

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
let G;

/* ---------- A) le rythme, sur des journées réellement jouées ---------- */
console.log("A) le rythme des arrêts");
{
  const compte = [], types = {}, mt = [];
  let matchs = 0;
  for (const club of ["NAN", "PSG", "MET", "LEN"]) {
    api.nouvellePartie(club); G = api.getG();
    for (let j = 0; j < 30; j++) {
      const moi = api.clubById(G.monClub);
      const avant = new Map(moi.joueurs.map(x => [x, x.fraich])); // la fraîcheur d'AVANT le coup d'envoi, celle que lit le direct
      const { monMatch } = api.jouerJournee();
      if (!monMatch || !monMatch.ev) continue;
      const apres = new Map(moi.joueurs.map(x => [x, x.fraich]));
      for (const [x, f] of avant) x.fraich = f;
      const L = monMatch.ev, eM = { hId: monMatch.h ? monMatch.h.id : null };
      const hId = L.find(l => l.t === "sys" && /^MI-TEMPS/.test(l.x || "")).x.split(" ")[1];
      const A = api.planArrets();
      let nMt = 0;
      for (let k = 0; k < L.length; k++) {
        const l = L[k];
        if (l.bl && l.bl.cote === G.monClub && l.m < 90) { A.fait++; A.dernier = l.m; types.blessure = (types.blessure || 0) + 1; continue; }
        const s = api.situationArret(A, L, k, { moiId: G.monClub, hId, cuit: m => api.hommeCuit(moi, m) });
        if (!s) continue;
        A.vus[s.type] = true; A.fait++; A.dernier = s.m;
        types[s.type] = (types[s.type] || 0) + 1;
        if (s.type === "mt") nMt++;
      }
      for (const [x, f] of apres) x.fraich = f;
      compte.push(A.fait); mt.push(nMt); matchs++;
    }
  }
  const moy = compte.reduce((a, b) => a + b, 0) / compte.length;
  console.log("    " + matchs + " matchs, " + moy.toFixed(2) + " arrêts en moyenne ; répartition " +
    [1, 2, 3].map(n => n + ":" + compte.filter(x => x === n).length).join(" ") + " ; " + JSON.stringify(types));
  ok(compte.every(x => x >= 1), "jamais zéro arrêt");
  ok(compte.every(x => x <= 3), "jamais plus de trois arrêts (blessures des vôtres comprises)");
  ok(moy >= 1.75 && moy <= 2.25, "deux arrêts en moyenne (" + moy.toFixed(2) + ")");
  ok(mt.every(x => x === 1), "la mi-temps s'arrête une fois, et une seule, à chaque match");
  // l'homme cuit est rare le samedi (la semaine de repos remet presque tout le monde à 100) : section C le monte exprès
  ok((types.encaisse || 0) > 0 && (types.serre || 0) > 0, "but encaissé et score serré finissent par se présenter");
}

/* ---------- B) les questions ---------- */
console.log("B) les questions");
{
  const faux = { nom: "X. Durand", pos: "M" }, ent = { nom: "Y. Martin", pos: "M" };
  const sits = [{ type: "mt", m: 45 }, { type: "encaisse", m: 30 }, { type: "rouge", m: 50, nous: true, nom: "Z. Petit" },
    { type: "rouge", m: 50, nous: false, nom: "Z. Petit" }, { type: "serre", m: 75 }, { type: "cuit", m: 65, sortant: faux, entrant: ent }];
  let bon = true, gardeToujours = true, pasDeDouble = true, propre = true;
  for (const s of sits) for (const c of ["prudent", "equilibre", "offensif"]) for (const d of [-1, 0, 1]) {
    const Q = api.questionArret(s, c, "Nantes 1 - 0 Lens", d);
    if (Q.rep.length < 2 || Q.rep.length > 3) bon = false;
    if (!Q.rep.some(r => r.act.k === "garde")) gardeToujours = false;
    const vs = Q.rep.filter(r => r.act.k === "consigne").map(r => r.act.v);
    if (new Set(vs).size !== vs.length || vs.includes(c)) pasDeDouble = false;
    const txt = Q.titre + Q.q + Q.rep.map(r => r.lab).join("");
    if (/—|×|\d+ ?%/.test(txt)) propre = false;
  }
  ok(bon, "deux ou trois réponses à chaque question");
  ok(gardeToujours, "« garder le plan » est toujours proposé");
  ok(pasDeDouble, "aucune réponse ne propose la consigne déjà en place, ni deux fois la même");
  ok(propre, "ni tiret long, ni multiplicateur, ni pourcentage dans le texte");
}

/* ---------- C) l'homme cuit ---------- */
console.log("C) l'homme cuit");
{
  api.nouvellePartie("NAN"); G = api.getG();
  const moi = api.clubById(G.monClub);
  moi.joueurs.forEach(j => { j.fraich = 100; j.bless = 0; j.susp = 0; j.repos = false; });
  const p = api.tireSubs(moi, 0); api.setChg({ [moi.id]: p });
  ok(api.hommeCuit(moi, 62) === null, "tout le monde frais : personne n'est cuit");
  const libres = p.xi.filter(j => j.pos !== "G" && !p.sort.includes(j));
  const gk = p.xi.find(j => j.pos === "G");
  gk.fraich = 40; libres[0].fraich = 60; libres[1].fraich = 55;
  const c = api.hommeCuit(moi, 62);
  ok(c && c.sortant === libres[1], "le plus entamé des titulaires sort, jamais le gardien");
  ok(c && !p.xi.includes(c.entrant) && c.entrant.pos !== "G", "l'entrant vient du banc, et ce n'est pas le gardien remplaçant");
  if (p.sort[0]) { p.sort[0].fraich = 30; ok(api.hommeCuit(moi, 50).sortant !== p.sort[0], "un homme que le banc sort déjà plus tard n'est pas proposé"); }
  p.min = [40, 45, 50];
  ok(api.hommeCuit(moi, 62) === null, "les trois changements faits : plus de question");
}

/* ---------- D) le changement d'un clic ---------- */
console.log("D) le changement d'un clic");
{
  api.nouvellePartie("NAN"); G = api.getG();
  const moi = api.clubById(G.monClub), adv = G.clubs.find(c => c.id !== moi.id);
  [moi, adv].forEach(c => c.joueurs.forEach(j => { j.fraich = 100; j.bless = 0; j.susp = 0; j.repos = false; }));
  const chg = { [moi.id]: api.tireSubs(moi, 0), [adv.id]: api.tireSubs(adv, 3) };
  api.setChg(chg);
  const p = chg[moi.id];
  const r = api.simuleMatch(moi, adv, true);
  const fin = r.ev.pop(); r.ev = r.ev.concat(api.lignesChangements(moi, p), api.lignesChangements(adv, chg[adv.id])).sort((x, y) => x.m - y.m); r.ev.push(fin);
  const eM = { h: moi, a: adv, sh: r.sh, sa: r.sa, mien: true };
  G._pend = { res: [eM], pend: {}, monMatch: r };
  const m = 52, from = r.ev.findIndex(l => l.m > m);
  const libres = p.xi.filter(j => j.pos !== "G" && !p.sort.includes(j)); libres[0].fraich = 50;
  const c = api.hommeCuit(moi, m);
  const avant = p.min.filter(x => x <= m).length;
  let suites = 0;
  api.changementDirect({ monMatch: r, eM, mul: { h: 1, a: 1 }, pos: () => ({ from, mNow: m }), reprendre() {}, suite() { suites++; } }, c.entrant, c.sortant);
  const k = p.banc.indexOf(c.entrant);
  ok(k >= 0 && p.min[k] === m && p.sort[k] === c.sortant, "l'entrant prend sa place à la minute de la question");
  ok(p.min.length <= 3 && p.min.filter(x => x <= m).length === avant + 1, "une des trois places, jamais une quatrième");
  ok(r.ev[from] && r.ev[from].ic === "sub" && r.ev[from].uid === c.entrant.uid, "le téléscripteur l'annonce tout de suite");
  ok(suites === 1 && !api.enJeu(moi, 80).includes(c.sortant) && api.enJeu(moi, 80).includes(c.entrant), "la pelouse suit, et le verdict aussi");
  delete G._pend;
}

/* ---------- E) avantage et risque ---------- */
console.log("E) chaque consigne a un avantage et un risque");
{
  api.nouvellePartie("NAN"); G = api.getG();
  const moi = api.clubById(G.monClub), adv = G.clubs.find(c => c.id === "PSG") || G.clubs.find(c => c.id !== moi.id);
  // une feuille neuve à chaque essai : les rouges qu'un reste de match distribue s'inscrivent sur la feuille du jour
  // et dans les suspensions, et s'y accumuleraient d'un essai à l'autre jusqu'à vider la pelouse
  const neuf = () => { [moi, adv].forEach(c => c.joueurs.forEach(j => { j.fraich = 100; j.bless = 0; j.susp = 0; }));
    api.setChg({ [moi.id]: api.tireSubs(moi, 0), [adv.id]: api.tireSubs(adv, 3) }); };
  // la question du score serré, telle qu'elle se pose : à la 70e, on mène 1-0, ou l'on est mené 0-1
  const N = 8000, bilan = {};
  for (const [nom, sh, sa] of [["mène", 1, 0], ["mené", 0, 1]]) for (const k of ["prudent", "offensif"]) {
    G.consigne = k; let v = 0, d = 0;
    for (let n = 0; n < N; n++) { neuf(); const r = api.simuleReste(moi, adv, 70, sh, sa, 1, 1, []);
      if (r.sh > r.sa) v++; else if (r.sh < r.sa) d++; }
    bilan[nom + "/" + k] = { v: v / N, d: d / N };
  }
  G.consigne = "equilibre";
  console.log("    victoires/défaites depuis la 70e : " + Object.entries(bilan).map(([k, b]) => k + " " + Math.round(b.v * 100) + "/" + Math.round(b.d * 100)).join(" · "));
  ok(bilan["mène/prudent"].v > bilan["mène/offensif"].v, "on mène : « Prudent » garde la victoire plus souvent que « Offensif »");
  ok(bilan["mené/offensif"].d < bilan["mené/prudent"].d, "on est mené : « Offensif » évite la défaite plus souvent que « Prudent »");}

/* ---------- F) le réglage ---------- */
console.log("F) le réglage");
{
  api.nouvellePartie("NAN"); G = api.getG();
  const L = [{ m: 44, t: "occ", x: "x" }, { m: 45, t: "sys", x: "MI-TEMPS. NAN 0 - 0 LEN" }, { m: 45, t: "amb", x: "jugement" }, { m: 50, t: "occ", x: "y" }];
  const tk = { scrollTop: 0, insertAdjacentHTML() {}, children: [], firstChild: null, prepend() {}, appendChild() {} };
  const lance = () => {
    let repris = 0; FICHE.innerHTML = "";
    const a = api.arretsDuMatch({ lignes: L, tk, hId: "NAN", nomH: "Nantes", nomA: "Lens", ctxBanc: null, moiClub: () => api.clubById(G.monClub), actif: () => true });
    for (let k = 0; k < L.length; k++) a.apres(k, () => { repris++; });
    return { repris, fiche: FICHE.innerHTML };
  };
  api.poseArrets(false);
  ok(!api.arretsActifs(), "coupé, le réglage est retenu");
  const off = lance();
  ok(off.repris === L.length && off.fiche === "", "coupé, le match ne s'arrête jamais");
  api.poseArrets(true);
  const on = lance();
  ok(api.arretsActifs() && /MI-TEMPS/.test(on.fiche) && /Le discours/.test(on.fiche), "rallumé, la mi-temps pose sa question");
  ok(on.repris === L.length - 1, "le match attend la réponse");
  const b = FICHE.querySelectorAll(".bArret");
  const garde = b.find((x, n) => /garde le plan/.test(FICHE.innerHTML.split('data-n="' + n + '"')[1] || ""));
  let repris = 0;
  // un clic, et ça repart (on rejoue l'arrêt pour compter la reprise de CE clic)
  FICHE.innerHTML = "";
  const a = api.arretsDuMatch({ lignes: L, tk, hId: "NAN", nomH: "Nantes", nomA: "Lens", ctxBanc: null, moiClub: () => api.clubById(G.monClub), actif: () => true });
  a.apres(2, () => { repris++; });
  const bs = FICHE.querySelectorAll(".bArret");
  ok(bs.length === 3, "trois réponses à la mi-temps");
  G.consigne = "equilibre";
  const n = bs.findIndex(x => /garde le plan/.test(FICHE.innerHTML.split('data-n="' + x.dataset.n + '"')[1].split("</button>")[0]));
  if (n >= 0) bs[n].onclick();
  ok(repris === 1, "un clic sur « garder le plan », et le match reprend");
  // le samedi, une consigne changée avant la 45e recolle le fil sans le jalon « MI-TEMPS » : l'arrêt doit tomber quand même
  const sansJalon = [{ m: 12, t: "occ", x: "a" }, { m: 44, t: "occ", x: "b" }, { m: 48, t: "occ", x: "c" }];
  const A2 = api.planArrets(), vus = sansJalon.map((l, k) => api.situationArret(A2, sansJalon, k, { moiId: G.monClub, hId: "NAN" }));
  ok(vus[1] && vus[1].type === "mt" && !vus[0], "fil recollé sans jalon : la mi-temps s'arrête sur la dernière ligne de la première période");
}

console.log(FAILS ? "\n✗ " + FAILS + " échec(s)" : "\n✓ tout est vert");
process.exit(FAILS ? 1 : 0);
