/* Harnais des FORMATIONS — MULTIPLEX 95 (v1.12)
   Demande de l'auteur : « j'aimerais qu'on puisse changer de formation pour augmenter l'aspect tactique, un peu
   pauvre pour l'instant (4-4-2 forcé) ». Et sa règle : « avoir plus de joueurs dans une zone augmente mon contrôle
   dans celle-ci — 5-3-2 plus solide en défense mais pauvre en attaque, 4-4-2 plus solide au milieu, 4-3-3 plus
   agressif en attaque — bien sûr conditionné par la qualité des joueurs : un 4-3-3 peut être meilleur au milieu avec
   trois bons joueurs qu'un 4-4-2 avec des milieux moyens ».
     A) le 4-4-2 reste le jeu d'avant : réglage par défaut, IA, coupe neutre
     B) chaque formation aligne ses lignes : onze, rotation de coupe, titularisations ★
     C) les trois caractères, à joueurs de même valeur — et aucune formation ne rapporte de points gratuits
     D) la qualité compte : trois bons milieux valent mieux que quatre moyens, pas que quatre bons
     E) sur les vrais effectifs : pas de formation miracle, et le bon choix dépend des joueurs
     F) le vrai moteur (simuleMatch) : le 5-3-2 ferme le match, le 4-3-3 l'ouvre, l'IA n'en sait rien
     G) les soirs de coupe et d'Europe portent le caractère de la formation
     H) sauvegarde : la formation est retenue, une valeur inconnue est réparée
     I) l'avant-match se rend : boutons, onze ligne par ligne, rapport de forces, annonce au coup d'envoi
     J) deux saisons en changeant de formation chaque semaine : aucune exception, calibrage tenu
   Usage : node harness-formations.cjs                                                               */
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

const api = new Function(script + "\n;return {nouvellePartie,jouerJournee,intersaison,clubById,onze,onzeRotation,forces,simuleMatch," +
  "lambdasZones,styleFormation,multTactique,titulariser,migre,blocConsignePrime,ecranCalendrier,placeXI,HORS_POSTE," +
  "FORMATIONS,ZONES,K_ZONES,CLUBS,CLUBS_D2,getG:function(){return G;}};")();

let F = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) F++; };
const r2 = x => Math.round(x * 100) / 100, r3 = x => Math.round(x * 1000) / 1000;
const pct = x => (x >= 1 ? "+" : "") + Math.round((x - 1) * 100) + " %";
const FORMS = ["4-4-2", "4-3-3", "5-3-2"];
const neuve = id => { api.nouvellePartie(id); const G = api.getG(); G.intro = null; return G; };
const lignes = xi => ["G", "D", "M", "A"].map(p => xi.filter(j => j.pos === p).length).join("-");
// points attendus d'un match (loi de Poisson sur les buts : 0,42 but par évènement du moteur)
function pois(l, k) { let p = Math.exp(-l); for (let i = 1; i <= k; i++) p *= l / i; return p; }
function points(lh, la) {
  const mh = 0.42 * lh, ma = 0.42 * la; let h = 0, a = 0;
  for (let i = 0; i < 11; i++) for (let j = 0; j < 11; j++) { const q = pois(mh, i) * pois(ma, j); if (i > j) h += 3 * q; else if (i === j) { h += q; a += q; } else a += 3 * q; }
  return [h, a];
}
// un club « de laboratoire » : tous les joueurs se valent, pour que seule la formation parle
function uniformise(c, note) {
  c.joueurs.forEach(j => Object.assign(j, { note: note || 75, moral: 65, fraich: 100, ego: 5, age: 27, venal: 5, tireurElite: false, titu: false, repos: false, bless: 0, susp: 0 }));
}

/* ===== A) le 4-4-2 reste le jeu d'avant ===== */
console.log("A) Le 4-4-2 reste le jeu d'avant");
{
  const G = neuve("NAN");
  ok(G.formation === "4-4-2", "une carrière neuve démarre en 4-4-2");
  ok(Object.keys(api.FORMATIONS).join(" ") === "4-4-2 4-3-3 5-3-2", "trois formations au choix : " + Object.keys(api.FORMATIONS).join(", "));
  const s = api.styleFormation("4-4-2");
  ok(s[0] === 1 && s[1] === 1, "le caractère du 4-4-2 est neutre : [" + s + "]");
  const moi = api.clubById(G.monClub);
  ok(lignes(api.onze(moi)) === "1-4-4-2", "votre onze en 4-4-2 : " + lignes(api.onze(moi)));
  let tousIA442 = true;
  for (const f of FORMS) { G.formation = f; for (const c of G.clubs) if (c.id !== G.monClub && lignes(api.onze(c)) !== "1-4-4-2") tousIA442 = false; }
  ok(tousIA442, "les dix-neuf autres clubs restent en 4-4-2, quelle que soit votre formation");
  G.formation = "4-4-2"; G.consigne = "equilibre"; G.primeMatch = 0;
  const adv = G.clubs.find(c => c.id !== G.monClub).id;
  const m = api.multTactique(G.monClub, adv);
  ok(m[0] === 1 && m[1] === 1, "un soir de coupe en 4-4-2, Équilibré, sans prime : tirage rigoureusement inchangé");
}

/* ===== B) chaque formation aligne ses lignes ===== */
console.log("\nB) Chaque formation aligne ses lignes");
{
  const G = neuve("NAN"), moi = api.clubById(G.monClub);
  const attendu = { "4-4-2": "1-4-4-2", "4-3-3": "1-4-3-3", "5-3-2": "1-5-3-2" };
  for (const f of FORMS) {
    G.formation = f;
    ok(lignes(api.onze(moi)) === attendu[f] && api.onze(moi).length === 11, f + " : le onze aligne " + lignes(api.onze(moi)));
    ok(lignes(api.onzeRotation(moi, "reserve")) === attendu[f] && lignes(api.onzeRotation(moi, "mixte")) === attendu[f],
      f + " : la réserve et l'équipe mixte des soirs de coupe suivent la même formation");
  }
  // les titularisations ★ suivent la ligne de VOTRE formation
  moi.joueurs.forEach(j => { j.titu = false; j.repos = false; });
  const avants = moi.joueurs.filter(j => j.pos === "A").sort((a, b) => a.note - b.note);
  G.formation = "4-3-3";
  avants.slice(0, 3).forEach(j => api.titulariser(j));
  ok(avants.slice(0, 3).every(j => j.titu), "en 4-3-3, on titularise trois attaquants");
  if (avants[3]) { api.titulariser(avants[3]); ok(!avants[3].titu, "…mais pas un quatrième : la ligne est complète"); }
  ok(avants.slice(0, 3).every(j => api.onze(moi).includes(j)), "les trois ★ jouent, même les moins bien notés");
  G.formation = "4-4-2";
  const xi = api.onze(moi);
  ok(xi.filter(j => j.pos === "A").length === 2 && xi.filter(j => j.pos === "A").every(j => j.titu),
    "repassé en 4-4-2, deux des trois ★ jouent et le onze reste à onze");
  moi.joueurs.forEach(j => { j.titu = false; });
}
/* PIÈGE trouvé ici même : un dépanneur compté dans la zone de son VRAI poste faisait d'un 5-3-2 sans cinquième
   défenseur une équipe meilleure que le 4-4-2 dans les trois zones à la fois. Il joue désormais là où il bouche le trou. */
console.log("\nB bis) Un effectif décimé : le dépanneur joue dans la ligne qu'il bouche");
{
  const G = neuve("NAN"), moi = api.clubById(G.monClub);
  uniformise(moi);
  const defs = moi.joueurs.filter(j => j.pos === "D");
  defs.slice(4).forEach(j => { j.bless = 5; }); // plus que quatre défenseurs valides
  G.formation = "5-3-2";
  const xi = api.onze(moi), place = api.placeXI(xi, api.FORMATIONS["5-3-2"]);
  const dep = place.filter(p => p.hors);
  ok(xi.length === 11 && dep.length === 1 && dep[0].z === "D" && dep[0].j.pos !== "D",
    "5-3-2 avec quatre défenseurs : un " + (dep[0] ? dep[0].j.pos : "?") + " recule en défense, signalé hors poste");
  ok(["G", "D", "M", "A"].map(z => place.filter(p => p.z === z).length).join("-") === "1-5-3-2", "chaque zone reçoit exactement ses places : 1-5-3-2");
  const f5 = api.forces(moi); G.formation = "4-4-2"; const f4 = api.forces(moi);
  ok(!(f5.def >= f4.def && f5.mil >= f4.mil && f5.att >= f4.att),
    "le 5-3-2 décimé ne bat plus le 4-4-2 dans les trois zones (milieu " + r2(f5.mil) + " contre " + r2(f4.mil) + ")");
  ok(r3(f5.def / f4.def) < r3(Math.pow(6 / 5, api.ZONES.ad)), "…et sa défense paie le dépanneur : " + pct(f5.def / f4.def) + " au lieu de " + pct(Math.pow(6 / 5, api.ZONES.ad)) + " avec un vrai cinquième défenseur");
  defs.forEach(j => { j.bless = 0; });
}

/* ===== C) les trois caractères, à joueurs de même valeur ===== */
console.log("\nC) Les trois caractères, à joueurs de même valeur (tous notés 75)");
{
  const G = neuve("NAN"), moi = api.clubById(G.monClub), adv = G.clubs.find(c => c.id !== G.monClub);
  uniformise(moi); uniformise(adv);
  const mesure = f => { G.formation = f; return api.lambdasZones(api.forces(moi), api.forces(adv)); };
  const [h0, a0] = mesure("4-4-2");
  ok(Math.abs(h0 - a0) < 1e-9, "4-4-2 contre 4-4-2 : autant d'occasions de part et d'autre (" + r3(h0) + " / " + r3(a0) + ")");
  const [h3, a3] = mesure("4-3-3"), [h5, a5] = mesure("5-3-2");
  ok(h3 / h0 >= 1.06 && a3 / a0 >= 1.06, "4-3-3, « plus agressif » : buts marqués " + pct(h3 / h0) + ", encaissés " + pct(a3 / a0));
  ok(h5 / h0 <= 0.85 && a5 / a0 <= 0.85, "5-3-2, « solide derrière mais pauvre devant » : encaissés " + pct(a5 / a0) + ", marqués " + pct(h5 / h0));
  // le 4-4-2 tient le milieu face au 4-3-3 : on fait jouer l'adversaire en 4-3-3 le temps de la mesure
  G.formation = "4-3-3"; const monClub = G.monClub; G.monClub = adv.id;
  const fAdv433 = api.forces(adv), fMoi442 = api.forces(moi); G.monClub = monClub;
  const occ = Math.pow(fMoi442.mil / fAdv433.mil, api.ZONES.c);
  ok(occ >= 1.10, "« 4-4-2 plus solide au milieu » : face au 4-3-3, ses occasions valent " + pct(occ) + " au seul duel du milieu");
  // aucune formation ne rapporte de points gratuits à joueurs égaux (terrain neutre)
  const pts = f => { const [h, a] = mesure(f); return points(h / api.K_ZONES * 2.45 * 1.05, a / api.K_ZONES * 2.45 * 1.05)[0]; };
  const p0 = pts("4-4-2");
  for (const f of ["4-3-3", "5-3-2"]) ok(Math.abs(pts(f) - p0) <= 0.04, f + " face au 4-4-2 : " + r3(pts(f) - p0) + " point par match — pas de formation miracle");
  // et entre elles (le caractère pur, lignes contre lignes)
  const z = f => ({ att: Math.pow(f.A / 2, api.ZONES.aa), mil: Math.pow(f.M / 4, api.ZONES.am), def: Math.pow((f.G + f.D) / 5, api.ZONES.ad) });
  const [x, y] = api.lambdasZones(z(api.FORMATIONS["4-3-3"]), z(api.FORMATIONS["5-3-2"]));
  const d = points(x * 1.05, y * 1.05); ok(Math.abs(d[0] - d[1]) <= 0.08, "4-3-3 contre 5-3-2 : " + r2(d[0]) + " – " + r2(d[1]) + " points attendus, ni l'un ni l'autre ne domine");
}

/* ===== D) la qualité compte ===== */
console.log("\nD) La qualité compte : « un 4-3-3 peut être meilleur au milieu avec trois bons joueurs »");
{
  const G = neuve("NAN"), moi = api.clubById(G.monClub), adv = G.clubs.find(c => c.id !== G.monClub);
  uniformise(moi); uniformise(adv);
  const milieu = (club, f, noteMil) => {
    club.joueurs.filter(j => j.pos === "M").forEach((j, k) => { j.note = k < (f === "4-4-2" ? 4 : 3) ? noteMil : 50; });
    const monClub = G.monClub; G.monClub = club.id; G.formation = f;
    const fz = api.forces(club); G.monClub = monClub;
    return fz.mil / fz.coh;
  };
  const trois82 = milieu(moi, "4-3-3", 82), quatre70 = milieu(adv, "4-4-2", 70);
  ok(trois82 > quatre70, "trois milieux à 82 (" + r2(trois82) + ") dominent quatre milieux à 70 (" + r2(quatre70) + ")");
  const trois75 = milieu(moi, "4-3-3", 75), quatre72 = milieu(adv, "4-4-2", 72);
  ok(trois75 < quatre72, "mais trois à 75 (" + r2(trois75) + ") cèdent face à quatre à 72 (" + r2(quatre72) + ") : le nombre compte aussi");
  const trois80 = milieu(moi, "4-3-3", 80), quatre69 = milieu(adv, "4-4-2", 69.3);
  ok(Math.abs(trois80 - quatre69) < 0.3, "le point d'équilibre : trois milieux à 80 valent quatre milieux à 69 (" + r2(trois80) + " / " + r2(quatre69) + ")");
}

/* ===== E) sur les vrais effectifs ===== */
console.log("\nE) Sur les vrais effectifs (D1 et D2, deux départs de carrière) : le bon choix dépend des joueurs");
{
  const choix = { "4-4-2": 0, "4-3-3": 0, "5-3-2": 0 }, gain433 = [], gain532 = [], ecart = [];
  let nb = 0;
  for (const dep of ["NAN", api.CLUBS_D2[4].id]) {
    const G = neuve(dep), monClub = G.monClub;
    for (const div of [G.clubs, G.autre]) {
      const base = div.map(o => ({ o, f: api.forces(o) })); // l'IA : 4-4-2 (G.monClub pointe ailleurs pendant la mesure)
      for (const c of div) {
        G.monClub = c.id; const r = {};
        for (const f of FORMS) {
          G.formation = f; const fc = api.forces(c); let p = 0;
          for (const { o, f: fo } of base) { if (o === c) continue;
            const [lh, la] = api.lambdasZones(fc, fo); p += points(lh * 1.18, la * 0.92)[0];
            const [mh, ma] = api.lambdasZones(fo, fc); p += points(mh * 1.18, ma * 0.92)[1]; }
          r[f] = p;
        }
        choix[FORMS.slice().sort((x, y) => r[y] - r[x])[0]]++; nb++;
        gain433.push(r["4-3-3"] - r["4-4-2"]); gain532.push(r["5-3-2"] - r["4-4-2"]);
        const par = p => c.joueurs.filter(j => j.pos === p).sort((a, b) => b.note - a.note);
        ecart.push((par("A")[2] ? par("A")[2].note : 50) - (par("M")[3] ? par("M")[3].note : 50));
      }
    }
    G.monClub = monClub; G.formation = "4-4-2";
  }
  const moy = a => a.reduce((s, x) => s + x, 0) / a.length;
  ok(FORMS.every(f => choix[f] >= nb * 0.12), "chaque formation est le meilleur choix d'au moins 12 % des " + nb + " clubs : " + JSON.stringify(choix));
  ok(Math.abs(moy(gain433)) <= 1.5 && Math.abs(moy(gain532)) <= 1.5,
    "en moyenne, aucune ne rapporte de points gratuits sur une saison : 4-3-3 " + r2(moy(gain433)) + ", 5-3-2 " + r2(moy(gain532)));
  const mx = moy(ecart), my = moy(gain433);
  const cov = moy(ecart.map((x, i) => (x - mx) * (gain433[i] - my)));
  const corr = cov / Math.sqrt(moy(ecart.map(x => (x - mx) ** 2)) * moy(gain433.map(y => (y - my) ** 2)));
  ok(corr >= 0.3, "le 4-3-3 paie quand le troisième attaquant vaut mieux que le quatrième milieu (corrélation " + r2(corr) + ")");
}

/* ===== F) le vrai moteur ===== */
console.log("\nF) Le vrai moteur (simuleMatch, 5 000 matchs par formation)");
{
  const G = neuve("NAN"), moi = api.clubById(G.monClub), adv = G.clubs.find(c => c.id !== G.monClub && c.id !== "NAN");
  G.consigne = "equilibre"; G.primeMatch = 0;
  const avantIA = FORMS.map(f => { G.formation = f; const x = api.forces(adv); return [x.att, x.mil, x.def].join("/"); });
  ok(new Set(avantIA).size === 1, "la force de l'adversaire ne dépend pas de VOTRE formation");
  const N = 5000, res = {};
  for (const f of FORMS) {
    G.formation = f; let pour = 0, contre = 0;
    for (let i = 0; i < N; i++) {
      const r = api.simuleMatch(moi, adv, false); pour += r.sh; contre += r.sa;
      for (const c of [moi, adv]) c.joueurs.forEach(j => { j.susp = 0; j.bless = 0; }); // un rouge ne doit pas vider l'effectif du laboratoire
    }
    res[f] = [pour / N, contre / N];
  }
  const [p0, c0] = res["4-4-2"], [p3, c3] = res["4-3-3"], [p5, c5] = res["5-3-2"];
  console.log("    " + FORMS.map(f => f + " : " + r2(res[f][0]) + " – " + r2(res[f][1])).join(" · "));
  ok(p5 + c5 <= (p0 + c0) * 0.85, "le 5-3-2 ferme le match : " + r2(p5 + c5) + " buts contre " + r2(p0 + c0) + " en 4-4-2");
  ok(c5 < c0 * 0.88, "…et d'abord derrière : " + r2(c5) + " encaissés contre " + r2(c0));
  ok(p3 + c3 >= (p0 + c0) * 1.04 && c3 > c0, "le 4-3-3 ouvre le match : " + r2(p3 + c3) + " buts, dont " + r2(c3) + " encaissés");
  G.formation = "4-4-2";
}

/* ===== G) coupe et Europe ===== */
console.log("\nG) Les soirs de coupe et d'Europe portent le caractère de la formation");
{
  const G = neuve("NAN"); G.consigne = "equilibre"; G.primeMatch = 0;
  const autres = G.clubs.filter(c => c.id !== G.monClub);
  G.formation = "4-3-3"; const m3 = api.multTactique(G.monClub, autres[0].id), m3ext = api.multTactique(autres[0].id, G.monClub);
  ok(m3[0] > 1.05 && m3[1] > 1.05 && r3(m3ext[1]) === r3(m3[0]) && r3(m3ext[0]) === r3(m3[1]),
    "4-3-3 : vos buts " + pct(m3[0]) + ", les leurs " + pct(m3[1]) + " — à domicile comme à l'extérieur");
  G.formation = "5-3-2"; const m5 = api.multTactique(G.monClub, autres[0].id);
  ok(m5[0] < 0.85 && m5[1] < 0.85, "5-3-2 : vos buts " + pct(m5[0]) + ", les leurs " + pct(m5[1]));
  const neutre = api.multTactique(autres[1].id, autres[2].id);
  ok(neutre[0] === 1 && neutre[1] === 1, "un match qui n'est pas le vôtre reste neutre");
  G.consigne = "offensif"; G.formation = "5-3-2"; const combo = api.multTactique(G.monClub, autres[0].id);
  ok(r3(combo[0]) === r3(1.15 * m5[0]) && r3(combo[1]) === r3(1.15 * m5[1]), "la formation se combine à la consigne (5-3-2 « Offensif » : une équipe de contre)");
  G.consigne = "equilibre"; G.formation = "4-4-2";
}

/* ===== H) sauvegarde ===== */
console.log("\nH) Sauvegarde");
{
  const G = neuve("NAN");
  G.formation = "5-3-2";
  ok(JSON.parse(JSON.stringify(G)).formation === "5-3-2", "la formation part dans la sauvegarde");
  api.migre(); ok(api.getG().formation === "5-3-2", "une formation connue survit au chargement");
  api.getG().formation = "3-4-3"; api.migre(); ok(api.getG().formation === "4-4-2", "une formation inconnue (fichier bricolé) repasse en 4-4-2");
  delete api.getG().formation; api.migre(); ok(api.getG().formation === "4-4-2", "une sauvegarde d'avant v1.12 démarre en 4-4-2");
}

/* ===== I) l'avant-match se rend ===== */
console.log("\nI) L'avant-match se rend");
{
  const G = neuve("NAN"), moi = api.clubById(G.monClub);
  for (const f of FORMS) {
    G.formation = f;
    let err = null; try { api.ecranCalendrier(); } catch (e) { err = e.message; }
    const h = APP.innerHTML;
    const boutons = (h.match(/class="act bFormation"/g) || []).length;
    const actif = new RegExp('data-k="' + f + '" style="[^"]*background:#ffd24a').test(h);
    ok(!err && boutons === 3 && actif, f + " : l'écran Calendrier montre les trois formations, la vôtre allumée" + (err ? " — " + err : ""));
    const ligneA = (h.match(/<div class="fLigne"><span class="fLib dim">Attaque<\/span>(.*?)<\/div>/) || [])[1] || "";
    ok((ligneA.match(/<span>/g) || []).length === api.FORMATIONS[f].A, f + " : le petit terrain aligne " + api.FORMATIONS[f].A + " attaquant(s)");
    ok(new RegExp("Au milieu, vos " + api.FORMATIONS[f].M + " contre leurs 4").test(h) && /Devant, /.test(h) && /Derrière, /.test(h),
      f + " : le rapport de forces lit les trois duels face au 4-4-2 d'en face");
  }
  // les trois verdicts de chaque duel existent bien (vocabulaire)
  const bloc = api.blocConsignePrime("en cas de qualification", api.onze(moi));
  ok(/bFormation/.test(bloc) && /terrainXI/.test(bloc) && !/duelsXI/.test(bloc), "un soir de coupe : formation et onze, mais pas de lecture des lignes d'en face");
  // échappement : un nom bricolé ne passe pas en HTML
  const cobaye = api.onze(moi).find(j => j.pos === "M"), vrai = cobaye.nom;
  cobaye.nom = "<img src=x onerror=alert(1)>";
  const b2 = api.blocConsignePrime("en cas de victoire", api.onze(moi));
  ok(!/<img src=x/.test(b2) && /&lt;img/.test(b2), "un nom de joueur bricolé est échappé sur le petit terrain");
  cobaye.nom = vrai;
  // l'annonce au coup d'envoi
  G.formation = "5-3-2";
  const adv = G.clubs.find(c => c.id !== G.monClub);
  const r = api.simuleMatch(moi, adv, true);
  ok(r.ev.some(l => l.t === "sys" && l.m === 0 && l.x === moi.nom + " se présente en 5-3-2, " + adv.nom + " en 4-4-2."),
    "le direct annonce les deux formations au coup d'envoi");
  G.formation = "4-4-2";
  const r2m = api.simuleMatch(moi, adv, true);
  ok(r2m.ev.some(l => l.t === "sys" && l.x === "Les deux équipes se présentent en 4-4-2."), "…et le dit sobrement quand elles se ressemblent");
  moi.joueurs.forEach(j => { j.susp = 0; });
}

/* ===== J) deux saisons en changeant de formation chaque semaine ===== */
console.log("\nJ) Deux saisons en changeant de formation chaque semaine");
{
  let err = null, buts = 0, matchs = 0, malAlignes = 0, horsPoste = 0;
  try {
    neuve("AUX");
    for (let s = 0; s < 2; s++) {
      for (let d = 0; d < 38; d++) {
        const G = api.getG(); G.formation = FORMS[(d + s) % 3];
        const xi = api.onze(api.clubById(G.monClub)), F = api.FORMATIONS[G.formation], place = api.placeXI(xi, F);
        if (xi.length === 11 && ["G", "D", "M", "A"].map(z => place.filter(p => p.z === z).length).join("-") !== "1-" + F.D + "-" + F.M + "-" + F.A) malAlignes++;
        if (place.some(p => p.hors)) horsPoste++;
        api.jouerJournee();
      }
      const G = api.getG();
      for (const c of G.clubs) { buts += c.bp; matchs += c.j / 2; }
      G.vire = null; api.intersaison();
    }
  } catch (e) { err = e.stack; }
  ok(!err, "76 journées et deux intersaisons sans exception" + (err ? " : " + err : ""));
  ok(malAlignes === 0, "chaque semaine, les onze places de la formation sont occupées (" + horsPoste + " semaine(s) avec un dépanneur, effectif décimé)");
  const cal = buts / matchs;
  ok(cal >= 2.2 && cal <= 2.6, "calibrage de la division tenu : " + r3(cal) + " buts par match");
}

console.log(F ? "\n❌ HARNAIS FORMATIONS : " + F + " PROBLÈME(S)" : "\n✅ HARNAIS FORMATIONS : TOUT EST VERT");
process.exit(F ? 1 : 0);
