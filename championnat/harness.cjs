/* Harnais headless de validation — D1 MANAGER 95-96
   Stub minimal window/document, charge le <script> d'index.html, puis :
   - A) carrière multi-saisons (calibrage des buts, vieillissement, zéro exception)
   - B) couverture des moments (cagade/cadeau : delta + uid résolus)
   - C) fautes de gardien + carton rouge (verbeux) : pas d'explosion du score
   Usage : node harness.cjs                                                   */
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const a = html.indexOf("<script>") + "<script>".length;
const b = html.lastIndexOf("</script>");
const script = html.slice(a, b);
fs.writeFileSync(path.join(__dirname, "game.js"), script); // pour node --check

/* ---- stubs DOM/navigateur : l'init de bas de page est gardée par !__TEST__ ---- */
function makeStub() {
  let stub;
  const fn = function () { return stub; };
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

/* ---- évaluation du script + épilogue qui expose l'API ---- */
const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,tireMoment,autoMoment,simuleMatch,rejoueDepuis,byUid,onze,clubById,leadership,capitaineDuXI,assureCapitaine,CLUBS,CLUBS_D2,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const PICK = (a) => a[Math.floor(Math.random() * a.length)];

let totalButs = 0, totalMatchs = 0;

// invariant capitanat : MON club a toujours exactement un capitaine, et c'est un joueur de l'effectif
function capInvariant(tag) {
  const G = api.getG();
  const c = G.clubs.find(x => x.id === G.monClub);
  const caps = c.joueurs.filter(j => j.capitaine);
  if (caps.length !== 1) { fail(tag + " : " + caps.length + " capitaine(s) (attendu 1)"); return false; }
  return true;
}

/* ===== A) carrière multi-saisons ===== */
const omId = (api.CLUBS_D2.find(c => /marseille/i.test(c.nom)) || api.CLUBS_D2[0]).id;
const departs = [api.CLUBS[0].id, api.CLUBS[5].id, omId, api.CLUBS_D2[3].id];
const SAISONS = 6;
console.log("A) Carrière multi-saisons (" + SAISONS + " saisons × " + departs.length + " clubs)");
for (const dep of departs) {
  try {
    api.nouvellePartie(dep);
    capInvariant("départ " + dep);       // un capitaine est nommé dès le coup d'envoi
    for (let s = 0; s < SAISONS; s++) {
      for (let d = 0; d < 38; d++) api.jouerJournee();
      capInvariant(dep + " S" + (s + 1) + " fin");
      const G = api.getG();
      let bp = 0, jSum = 0;
      for (const c of G.clubs) { bp += c.bp; jSum += c.j; }
      totalButs += bp; totalMatchs += jSum / 2;
      G.vire = null;            // on ignore le limogeage pour tester la continuité pluri-saisons
      api.intersaison();
      capInvariant(dep + " S" + (s + 1) + " intersaison");
      let mx = 0, actif36 = null;
      for (const c of api.getG().clubs) for (const j of c.joueurs) { if (j.age > mx) mx = j.age; if (j.age >= 36) actif36 = j; }
      if (actif36) fail("joueur 36+ encore présent après vieillissement : " + actif36.nom + " (" + actif36.age + ")");
      if (mx > 35) fail("âge max " + mx + " > 35 après intersaison");
    }
    ok("club " + dep + " : " + SAISONS + " saisons sans exception (âge max ≤ 35)");
  } catch (e) { fail("exception carrière (" + dep + ") : " + e.stack); }
}

/* ===== B) couverture des moments (cagade / cadeau) ===== */
console.log("B) Moments : cagade / cadeau (delta + uid)");
try {
  api.nouvellePartie(api.CLUBS[2].id);
  const G = api.getG();
  const moi = G.clubs.find(c => c.id === G.monClub);
  const types = {};
  let cagOK = 0, cadOK = 0;
  for (let i = 0; i < 8000; i++) {
    const adv = PICK(G.clubs.filter(c => c.id !== G.monClub));
    const mo = api.tireMoment(moi, adv);
    if (!mo) continue;
    types[mo.type] = (types[mo.type] || 0) + 1;
    if (mo.type === "cagade" || mo.type === "cadeau") {
      if (!api.byUid(mo.uid)) { fail(mo.type + " : uid buteur introuvable"); break; }
      if (!api.byUid(mo.gk)) { fail(mo.type + " : uid gardien introuvable"); break; }
      const d = api.autoMoment(mo);
      if (mo.type === "cagade") { if (d !== -1) { fail("cagade delta=" + d + " (attendu -1)"); break; } cagOK++; }
      else { if (d !== +1) { fail("cadeau delta=" + d + " (attendu +1)"); break; } cadOK++; }
    }
  }
  if (cagOK === 0) fail("aucune cagade tirée sur 8000 essais");
  if (cadOK === 0) fail("aucun cadeau tiré sur 8000 essais");
  if (cagOK && cadOK) ok("cagade (" + cagOK + ") et cadeau (" + cadOK + ") résolus correctement");
  ok("types vus : " + Object.keys(types).sort().join(", "));
} catch (e) { fail("exception moments : " + e.stack); }

/* ===== B ter) les moments de PUR DÉCOR : ça se raconte, ça ne change rien =====
   Un match sur cent environ, la 90e tire une respiration comique — un chien, un pigeon, un intrus, les
   projecteurs qui lâchent, une banderole du kop. Ils n'avaient jusqu'ici aucun harnais : rien ne garantissait
   qu'un jour l'un d'eux ne se mette pas à toucher au score, ou à nommer un joueur qu'il n'a pas.
   Le tirage se force par le PREMIER `Math.random()` de `tireMoment` (la variable `t`) ; le reste court
   librement, ce qui fait sortir les cinq décors au fil des essais. */
console.log("B ter) Pur décor : la 90e se raconte, et ne touche à rien");
try {
  api.nouvellePartie(api.CLUBS[2].id);
  const G = api.getG();
  const moi = G.clubs.find(c => c.id === G.monClub);
  // jamais un derby : il a sa propre porte de sortie (« provoc ») avant même la branche du décor
  const adv = G.clubs.find(c => c.id !== moi.id && c.id !== "OM" && c.id !== "PSG");
  const DECOR = ["chien", "pigeon", "streaker", "projos", "banderole"];
  const vus = {};
  let pb = null;
  const vraiRandom = Math.random;
  try {
    for (let i = 0; i < 4000 && !pb; i++) {
      let premier = true;
      Math.random = () => { if (premier) { premier = false; return 0.99; } return vraiRandom(); };
      const mo = api.tireMoment(moi, adv);
      Math.random = vraiRandom;
      if (!mo) { pb = "la branche du décor a rendu null"; break; }
      if (!DECOR.includes(mo.type)) { pb = "type inattendu dans la branche du décor : " + mo.type; break; }
      if (!mo.annonce || mo.annonce.length < 40) { pb = mo.type + " : pas d'annonce à lire"; break; }
      if (/[{}]/.test(mo.annonce)) { pb = mo.type + " : une accolade a survécu dans l'annonce"; break; }
      if (mo.uid != null) { pb = mo.type + " : un décor ne nomme personne, il ne doit pas porter d'uid"; break; }
      const d = api.autoMoment(mo);
      if (d !== 0) { pb = mo.type + " : delta=" + d + " — un décor ne touche pas au score"; break; }
      vus[mo.type] = (vus[mo.type] || 0) + 1;
    }
  } finally { Math.random = vraiRandom; }
  if (pb) fail(pb);
  const manquants = DECOR.filter(t => !vus[t]);
  if (manquants.length) fail("décors jamais tirés en 4000 essais : " + manquants.join(", "));
  else if (!pb) ok("les " + DECOR.length + " décors sortent tous, sans uid, sans accolade, et sans toucher au score");
  if (!pb) ok("tirages : " + DECOR.map(t => t + " " + (vus[t] || 0)).join(" · "));
} catch (e) { fail("exception décor : " + e.stack); }

/* ===== B bis) tactique en direct SUR UN MATCH À MOMENT (v1.04) =====
   Depuis v1.04 on peut changer de consigne même quand un moment attend à la 90e : le recollage doit donc
   rendre un fil qui tient encore debout — moment présent une seule fois, sifflet en dernier, score = lignes-but. */
console.log("B bis) Tactique en direct sur un match à moment (le recollage préserve la 90e)");
try {
  api.nouvellePartie(api.CLUBS[3].id);
  const G = api.getG();
  const moi = G.clubs.find(c => c.id === G.monClub);
  let essais = 0, perdus = 0, doubles = 0, scoreKO = 0, sifKO = 0, addKO = 0;
  for (let i = 0; i < 2000 && essais < 300; i++) {
    const adv = PICK(G.clubs.filter(c => c.id !== G.monClub));
    for (const c of [moi, adv]) for (const j of c.joueurs) { j.susp = 0; j.bless = 0; }
    const r = api.simuleMatch(moi, adv, true);
    const mo = api.tireMoment(moi, adv);
    if (!mo) continue;
    // on greffe la ligne du moment juste avant le sifflet, exactement comme le fait jouerJournee
    const sifflet = r.ev.pop();
    r.ev.push({ m: 90, t: "crd", x: mo.annonce, mo: mo.type });
    r.ev.push(sifflet);
    const coupe = r.ev.findIndex(e => e.m > 45);
    if (coupe < 0) continue;
    G.consigne = "offensif";                                   // le banc passe offensif à la pause
    api.rejoueDepuis(r, moi, adv, coupe, 45, 1, 1);
    G.consigne = "equilibre";
    essais++;
    const lignesMo = r.ev.filter(e => e.mo === mo.type);
    if (lignesMo.length === 0) perdus++;
    else if (lignesMo.length > 1) doubles++;
    const der = r.ev[r.ev.length - 1];
    if (!der || der.t !== "sys" || !/COUP DE SIFFLET FINAL/.test(der.x)) sifKO++;
    if (!r.ev.some(e => e.t === "sys" && /temps additionnel/.test(e.x || ""))) addKO++;
    let sh = 0, sa = 0;
    for (const e of r.ev) if (e.g) { if (e.g.cote === moi.id) sh++; else sa++; }
    if (sh !== r.sh || sa !== r.sa) scoreKO++;
  }
  if (essais < 100) fail("trop peu de matchs à moment re-simulés (" + essais + ")");
  else {
    if (perdus) fail(perdus + " re-sim(s) sur " + essais + " ont effacé le moment de la 90e");
    else if (doubles) fail(doubles + " re-sim(s) ont dupliqué la ligne du moment");
    else ok("le moment de la 90e survit intact à " + essais + " changements de consigne");
    if (sifKO) fail(sifKO + " fil(s) ne se terminent pas par le coup de sifflet");
    else ok("le coup de sifflet reste la dernière ligne du fil");
    if (addKO) fail(addKO + " fil(s) ont perdu l'annonce du temps additionnel");
    else ok("l'annonce du temps additionnel survit au recollage");
    if (scoreKO) fail(scoreKO + " fil(s) où le score ne correspond plus aux lignes-but");
    else ok("score et lignes-but restent d'accord après recollage");
  }
} catch (e) { fail("exception tactique en direct : " + e.stack); }

/* ===== C) fautes de gardien + carton rouge (verbeux) ===== */
console.log("C) Verbeux : fautes de gardien + rouge (jouer à 10)");
try {
  api.nouvellePartie(api.CLUBS[1].id);
  const G = api.getG();
  let crd = 0, gkFoul = 0, gkRed = 0, bp = 0, n = 6000;
  for (let i = 0; i < n; i++) {
    const h = PICK(G.clubs), a2 = PICK(G.clubs.filter(c => c !== h));
    // en vrai, finirJournee purge susp/bless chaque journée ; ici on rejoue à froid, donc on remet les effectifs au complet
    for (const c of [h, a2]) for (const j of c.joueurs) { j.susp = 0; j.bless = 0; }
    const r = api.simuleMatch(h, a2, true);
    bp += r.sh + r.sa;
    for (const e of r.ev) {
      if (e.t === "crd") crd++;
      if (e.c && e.c.gardien) { gkFoul++; if (e.c.rouge) gkRed++; }
    }
  }
  totalButs += bp; totalMatchs += n;
  if (crd === 0) fail("aucun carton rouge sur " + n + " matchs verbeux");
  if (gkFoul === 0) fail("aucune faute de gardien sur " + n + " matchs verbeux");
  else ok("fautes de gardien : " + gkFoul + " (dont " + gkRed + " rouges) ; rouges totaux : " + crd);
  const gpmV = bp / n;
  if (gpmV < 2.0 || gpmV > 3.0) fail("calibrage verbeux hors plage : " + gpmV.toFixed(2) + " buts/match");
  else ok("calibrage verbeux : " + gpmV.toFixed(2) + " buts/match (le malus du rouge n'explose pas le score)");
} catch (e) { fail("exception verbeux : " + e.stack); }

/* ===== D) capitanat : nomination par défaut, leadership, réattribution ===== */
console.log("D) Capitanat : défaut, leadership, réattribution après départ");
try {
  api.nouvellePartie(api.CLUBS[0].id);
  const G = api.getG();
  const c = G.clubs.find(x => x.id === G.monClub);
  const cap0 = c.joueurs.find(j => j.capitaine);
  if (!cap0) fail("aucun capitaine par défaut au démarrage");
  else {
    const tri = c.joueurs.slice().sort((a, b) => api.leadership(b) - api.leadership(a));
    if (cap0 !== tri[0]) fail("le capitaine par défaut n'est pas le meilleur meneur du groupe");
    else ok("capitaine par défaut = meilleur meneur (" + cap0.nom + ", " + cap0.age + " ans, ego " + (cap0.ego || 5) + ", note " + cap0.note + ")");
  }
  const cadre = api.leadership({ age: 30, ego: 7, note: 82, venal: 3, moral: 65 });
  const jeune = api.leadership({ age: 19, ego: 5, note: 62, venal: 6, moral: 65 });
  if (!(cadre > jeune)) fail("leadership incohérent : cadre(" + cadre.toFixed(2) + ") ≤ jeune(" + jeune.toFixed(2) + ")");
  else ok("leadership cohérent : cadre " + cadre.toFixed(2) + " > jeune " + jeune.toFixed(2));
  // le capitaine s'en va → assureCapitaine doit en désigner un nouveau
  c.joueurs = c.joueurs.filter(j => !j.capitaine);
  api.assureCapitaine();
  const cap1 = c.joueurs.find(j => j.capitaine);
  if (!cap1) fail("aucun capitaine réassigné après le départ du capitaine");
  else if (c.joueurs.filter(j => j.capitaine).length !== 1) fail("réattribution : plusieurs capitaines");
  else ok("brassard réattribué après départ : " + cap1.nom);
} catch (e) { fail("exception capitanat : " + e.stack); }

/* ===== E) sélection du XI : un gardien ne bouche un trou qu'en tout dernier recours ===== */
console.log("E) Sélection : pas de 2e gardien titularisé tant qu'un joueur de champ est dispo");
try {
  api.nouvellePartie(api.CLUBS[5].id);
  const G = api.getG();
  const c = G.clubs.find(x => x.id === G.monClub);
  c.joueurs.filter(j => j.pos === "D").slice(2).forEach(j => j.bless = 2); // défense décimée → complétion hors-poste forcée
  const xi = api.onze(c);
  const gks = xi.filter(j => j.pos === "G").length;
  if (xi.length !== 11) fail("XI incomplet après décimation : " + xi.length + " joueurs");
  else if (gks > 1) fail("un 2e gardien a bouché un trou alors que des joueurs de champ étaient dispo (" + gks + " gardiens dans le XI)");
  else ok("XI complet à 11 avec un seul gardien (joueurs de champ servis avant tout 2e gardien)");
} catch (e) { fail("exception sélection XI : " + e.stack); }

/* ===== bilan calibrage global ===== */
const gpm = totalButs / totalMatchs;
console.log("— Calibrage global : " + gpm.toFixed(3) + " buts/match sur " + Math.round(totalMatchs) + " matchs —");
if (gpm < 2.0 || gpm > 2.8) fail("calibrage global hors plage (cible ~2,3) : " + gpm.toFixed(3));
else ok("calibrage global dans la plage attendue");

console.log(FAILS === 0 ? "\n✅ HARNAIS : TOUT EST VERT" : "\n❌ HARNAIS : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
