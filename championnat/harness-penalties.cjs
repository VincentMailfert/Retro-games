/* Harnais du DUEL DU POINT DE PENALTY et de la SÉANCE DE TIRS AU BUT JOUÉE — MULTIPLEX (v2.51)
   La devinette décide de la situation, le niveau décide du résultat. On vérifie :
     A) les repères du bloc PEN_REGLAGES tombent juste (80/95 % du mauvais côté, 30/85 % d'arrêt du bon côté)
     B) mesurés sur des milliers de frappes, les pourcentages réels collent aux repères ; le centre est sans appel
     C) les habitudes sont fixes par joueur et bien réparties
     D) l'indice est d'autant plus fiable que l'observateur est bon, d'autant plus flou que l'observé est bon
     E) l'ordinateur suit son habitude la plupart du temps, pas toujours
     F) les tireurs de la séance sont ceux du moteur, dans le même ordre
     G) trois mille séances jouées au hasard respectent la règle : vous tirez d'abord, alternance, arrêt dès que
        c'est plié, mort subite par séries, lignes du téléscripteur au format du moteur
     H) dans un direct, la séance jouée remplace celle du moteur dans le fil
   Usage : node harness-penalties.cjs                                                        */
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
/* un faux nœud juste assez vrai pour la fenêtre du duel : ses enfants renaissent à chaque innerHTML,
   et ses trois boutons portent leur côté comme les vrais */
function El() {
  const kids = {};
  const e = { style: {}, dataset: {}, disabled: false, onclick: null, _h: "",
    classList: { add() {}, remove() {}, toggle() {} },
    insertAdjacentHTML(_o, h) { e._h = h + e._h; },
    querySelector(sel) { return kids[sel] || (kids[sel] = El()); },
    querySelectorAll(sel) {
      if (sel === ".zDuel") return kids._btns || (kids._btns = ["g", "c", "d"].map(c => { const b = El(); b.dataset.c = c; return b; }));
      return [];
    } };
  Object.defineProperty(e, "innerHTML", { get() { return e._h; }, set(v) { e._h = String(v); for (const k in kids) delete kids[k]; } });
  return e;
}
const FICHE = El();
const APP = { _h: "", innerHTML: "", querySelectorAll: () => [], querySelector: () => makeStub() };
const generic = makeStub();
global.document = new Proxy(function () {}, {
  get(_t, p) {
    if (p === "getElementById") return id => (id === "app" ? APP : id === "fiche" ? FICHE : generic);
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

const api = new Function(script + "\n;return {nouvellePartie,clubById,onze,PEN_REGLAGES,penReussite,penArret,penIssue,penHabitude,penIndice,penSuit,ordreTireurs,xiSeance,seanceTAB,seanceDirect,getG:function(){return G;}};")();

/* LE TEMPS EN BOÎTE : les délais du duel (envol, bandeau, frappe suivante) passent dans une file qu'on vide
   à la main, et le chrono ne tourne pas, c'est le harnais qui clique. */
const FILE = [];
global.setTimeout = fn => { FILE.push(fn); return FILE.length; };
global.clearTimeout = () => {}; global.setInterval = () => 0; global.clearInterval = () => {};
const vide = () => { let n = 0; while (FILE.length && n++ < 1e5) FILE.shift()(); };

let F = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) F++; };
const pct = x => (Math.round(x * 1000) / 10) + " %";
const R = api.PEN_REGLAGES;

/* ===== A) les repères ===== */
console.log("A) Les repères du bloc de réglages");
{
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  ok(near(api.penReussite(R.tireurFaible), 0.80) && near(api.penReussite(R.tireurElite), 0.95),
    "mauvais côté : 80 % pour un tireur noté " + R.tireurFaible + ", 95 % pour un tireur noté " + R.tireurElite);
  ok(near(api.penReussite(50), 0.80) && near(api.penReussite(99), 0.95), "et ça ne sort jamais de la fourchette");
  ok(near(api.penArret(R.tireurElite, R.gardienMoyen), 0.30) && near(api.penArret(R.tireurFaible, R.grandGardien), 0.85),
    "bon côté : 30 % d'arrêt (élite contre gardien moyen), 85 % (faible contre grand gardien)");
  const eg = api.penArret(75, 75);
  ok(eg > 0.45 && eg < 0.60, "à niveaux égaux, le gardien du bon côté arrête " + pct(eg));
  ok(api.penArret(80, 70) < api.penArret(75, 75) && api.penArret(70, 80) > api.penArret(75, 75), "l'écart de notes fait glisser le curseur dans le bon sens");
}

/* ===== B) mesurés ===== */
console.log("\nB) Les pourcentages réels, sur des milliers de frappes");
{
  const N = 100000, compte = (tir, plonge, nt, ng) => { const c = { but: 0, arret: 0, poteau: 0, cote: 0 };
    for (let k = 0; k < N; k++) c[api.penIssue(tir, plonge, nt, ng)]++; return c; };
  let c = compte("g", "d", 88, 72);
  ok(Math.abs(c.but / N - 0.95) < 0.01, "élite, gardien du mauvais côté : " + pct(c.but / N) + " de buts");
  ok(c.arret === 0 && Math.abs(c.poteau - c.cote) / N < 0.01, "ses ratés : poteau " + pct(c.poteau / N) + ", à côté " + pct(c.cote / N) + ", jamais d'arrêt");
  c = compte("d", "c", 62, 86);
  ok(Math.abs(c.but / N - 0.80) < 0.01, "faible, gardien resté au centre (donc du mauvais côté) : " + pct(c.but / N));
  c = compte("g", "g", 88, 72);
  ok(Math.abs(c.arret / N - 0.30) < 0.01 && c.poteau + c.cote === 0, "élite contre gardien moyen, bon côté : " + pct(c.arret / N) + " d'arrêts");
  c = compte("d", "d", 62, 86);
  ok(Math.abs(c.arret / N - 0.85) < 0.01, "faible contre grand gardien, bon côté : " + pct(c.arret / N) + " d'arrêts");
  ok(compte("c", "c", 99, 40).arret === N, "tir au centre, gardien resté : arrêt à coup sûr");
  ok(compte("c", "g", 40, 99).but === N && compte("c", "d", 40, 99).but === N, "tir au centre, gardien qui plonge : but à coup sûr");
}

api.nouvellePartie("PSG");
const G = api.getG();
const tous = G.clubs.flatMap(c => c.joueurs);

/* ===== C) les habitudes ===== */
console.log("\nC) Une habitude par joueur, une fois pour toutes");
{
  const fixe = tous.every(j => api.penHabitude(j, false) === api.penHabitude(j, false) && api.penHabitude(j, true) === api.penHabitude(j, true));
  ok(fixe, "un même joueur garde son côté d'un penalty à l'autre (" + tous.length + " joueurs)");
  const r = { g: 0, c: 0, d: 0 }; tous.forEach(j => r[api.penHabitude(j, false)]++);
  ok(r.g / tous.length > 0.35 && r.d / tous.length > 0.35 && r.c / tous.length > 0.04 && r.c / tous.length < 0.18,
    "tireurs : " + pct(r.g / tous.length) + " à gauche, " + pct(r.d / tous.length) + " à droite, " + pct(r.c / tous.length) + " au centre");
  const gks = tous.filter(j => j.pos === "G"), q = { g: 0, c: 0, d: 0 }; gks.forEach(j => q[api.penHabitude(j, true)]++);
  ok(q.c > 0 && q.g > 0 && q.d > 0, "gardiens : " + q.g + " plongent à gauche, " + q.d + " à droite, " + q.c + " restent debout");
}

/* ===== D) l'indice ===== */
console.log("\nD) L'indice, fiable ou flou");
{
  const N = 40000, juste = (nObs, nVu) => { let n = 0;
    for (let k = 0; k < N; k++) if (api.penIndice("g", nObs, nVu, false) === "Tire souvent à gauche") n++; return n / N; };
  const fort = juste(86, 62), egal = juste(75, 75), flou = juste(62, 88);
  ok(Math.abs(fort - R.indiceMax) < 0.015, "grand gardien face à un tireur faible : l'indice dit vrai " + pct(fort));
  ok(Math.abs(egal - R.indiceBase) < 0.015, "à niveaux égaux : " + pct(egal));
  ok(flou < 0.47 && flou > 0.36, "gardien faible face à un tireur d'élite : " + pct(flou) + ", à peine mieux que le hasard");
  const g = api.penIndice("c", 80, 70, true);
  ok(/^(Plonge souvent à (gauche|droite)|Reste souvent debout)$/.test(g), "sur un gardien, l'indice parle de plongeon : « " + g + " »");
}

/* ===== E) l'ordinateur ===== */
console.log("\nE) L'ordinateur suit son habitude, pas toujours");
{
  const N = 60000; let n = 0; for (let k = 0; k < N; k++) if (api.penSuit("d") === "d") n++;
  ok(Math.abs(n / N - R.habitude) < 0.01, "il la suit " + pct(n / N) + " du temps");
}

/* ===== F) les tireurs ===== */
console.log("\nF) Les tireurs de la séance sont ceux du moteur");
{
  const c = api.clubById(G.monClub), xi = api.xiSeance(c);
  const ancien = xi.filter(j => j.pos !== "G").sort((a, b) => (b.note + ("A".includes(b.pos) ? 6 : "M".includes(b.pos) ? 3 : 0)) - (a.note + ("A".includes(a.pos) ? 6 : "M".includes(a.pos) ? 3 : 0)));
  const nouv = api.ordreTireurs(c, xi);
  ok(nouv.length === 11 && ancien.every((j, k) => j === nouv[k]), "l'ordre de l'ancien tirsAuBut pour les joueurs de champ : " + nouv.slice(0, 5).map(j => j.nom).join(", ") + "…");
  ok(nouv[10].pos === "G", "et le gardien en dernier (" + nouv[10].nom + ", " + nouv[10].note + "), quelle que soit sa note");
}

/* ===== G) trois mille séances ===== */
console.log("\nG) Trois mille séances jouées au hasard");
const joueSeance = (home, away, choix) => {
  let fin = null;
  api.seanceTAB(home, away, api.xiSeance(home), api.xiSeance(away), r => { fin = r; });
  for (let garde = 0; garde < 500 && !fin; garde++) {
    const ok_ = FICHE.querySelector("#penRes").querySelector("#bPenOk");
    if (ok_.onclick) { ok_.onclick(); break; }
    const b = FICHE.querySelector("#duelPen").querySelectorAll(".zDuel");
    const pick = choix ? choix() : "gcd"[Math.floor(Math.random() * 3)];
    b.find(x => x.dataset.c === pick).onclick();
    vide();
  }
  return fin;
};
{
  const moi = api.clubById(G.monClub), adv = G.clubs.find(c => c.id !== G.monClub);
  const tirMoi = api.ordreTireurs(moi, api.xiSeance(moi)), tirAdv = api.ordreTireurs(adv, api.xiSeance(adv));
  let pepins = [], gagnees = 0, mortes = 0, maxi = 0, decisifs = 0, vuDomicile = false;
  for (let s = 0; s < 3000; s++) {
    const dom = s % 2 === 0, home = dom ? moi : adv, away = dom ? adv : moi;
    const r = joueSeance(home, away);
    if (!r) { pepins.push("séance " + s + " jamais finie"); continue; }
    const tirs = r.lignes.filter(l => l.tab), der = r.lignes[r.lignes.length - 1];
    if (!(der.t === "sys" && /^TIRS AU BUT : .+ se qualifie \(\d+-\d+\)\.$/.test(der.x))) pepins.push("séance " + s + " : dernière ligne « " + der.x + " »");
    // alternance, vous d'abord
    if (tirs.some((l, k) => l.tab.tireur !== (k % 2 === 0 ? moi.id : adv.id))) pepins.push("séance " + s + " : l'alternance casse");
    // les tireurs dans l'ordre
    const kk = { [moi.id]: 0, [adv.id]: 0 };
    for (const l of tirs) { const liste = l.tab.tireur === moi.id ? tirMoi : tirAdv, t = liste[kk[l.tab.tireur]++ % liste.length];
      if (l.x.indexOf(t.nom) !== 0) { pepins.push("séance " + s + " : « " + l.x + " » n'est pas de " + t.nom); break; } }
    // le décompte et le vainqueur
    const h = tirs.filter(l => l.tab.tireur === home.id && l.tab.dedans).length, a = tirs.filter(l => l.tab.tireur === away.id && l.tab.dedans).length;
    if (h !== r.h || a !== r.a || r.win !== (h > a ? home.id : away.id) || h === a) pepins.push("séance " + s + " : décompte " + h + "-" + a + " contre " + r.h + "-" + r.a);
    // jamais un tir de trop : la séance n'était pliée à aucune frappe d'avant, elle l'est à la dernière
    const plie = n => { const p = tirs.slice(0, n), na = p.filter(l => l.tab.tireur === moi.id).length, nb = n - na,
      ga = p.filter(l => l.tab.tireur === moi.id && l.tab.dedans).length, gb = p.filter(l => l.tab.tireur === adv.id && l.tab.dedans).length;
      return (na < 5 || nb < 5) ? (ga > gb + (5 - nb) || gb > ga + (5 - na)) : (na === nb && ga !== gb); };
    for (let n = 1; n < tirs.length; n++) if (plie(n)) { pepins.push("séance " + s + " : pliée au tir " + n + " sur " + tirs.length); break; }
    if (!plie(tirs.length)) pepins.push("séance " + s + " : s'arrête sans être pliée");
    if (tirs.length < 6) pepins.push("séance " + s + " : finie en " + tirs.length + " tirs");
    // l'arrêt qui qualifie : seulement quand la dernière frappe du perdant ne rentre pas
    const dt = tirs[tirs.length - 1].tab;
    if (dt.decisif && (dt.dedans || dt.tireur === r.win || dt.decisif !== r.win)) pepins.push("séance " + s + " : drapeau décisif à tort");
    if (!dt.dedans && dt.tireur !== r.win && !dt.decisif) pepins.push("séance " + s + " : arrêt décisif sans drapeau");
    if (dt.decisif) decisifs++;
    if (r.win === moi.id) gagnees++;
    if (tirs.length > 10) mortes++;
    maxi = Math.max(maxi, tirs.length);
    if (!dom && tirs[0].tab.tireur === moi.id) vuDomicile = true;
  }
  ok(!pepins.length, pepins.length ? pepins.length + " anomalies, dont : " + pepins.slice(0, 3).join(" | ") : "aucune anomalie sur 3000 séances (alternance, ordre des tireurs, décompte, arrêt au bon moment, lignes)");
  ok(vuDomicile, "à l'extérieur aussi, c'est vous qui tirez le premier");
  ok(mortes > 100 && maxi > 12, "la mort subite arrive (" + mortes + " séances au-delà de cinq tirs chacun, la plus longue en " + maxi + " frappes)");
  ok(decisifs > 0, "l'arrêt qui qualifie porte son drapeau pour le flash (" + decisifs + " fois)");
  // le PSG face à un adversaire plus faible, en cliquant au hasard : favori, jamais assuré (avec les repères de
  // l'auteur, le niveau pèse environ deux fois plus que dans la séance automatique du moteur, ~58 % ici contre ~53 %)
  ok(gagnees > 1500 && gagnees < 2550, "en cliquant au hasard, le PSG en gagne " + gagnees + " sur 3000 contre " + adv.id + " : favori, jamais assuré");
}

/* ===== H) dans le fil du direct ===== */
console.log("\nH) Dans un direct, la séance jouée remplace celle du moteur");
{
  const moi = api.clubById(G.monClub), adv = G.clubs.find(c => c.id !== G.monClub);
  const lignes = [{ m: 118, t: "amb", x: "Ça pousse." }, { m: 120, t: "sys", x: "COUP DE SIFFLET FINAL. A 1 - 1 B après prolongations." },
    { m: 120, t: "but", tab: { tireur: moi.id, dedans: true }, x: "vieux 1" }, { m: 120, t: "occ", tab: { tireur: adv.id, dedans: false }, x: "vieux 2" },
    { m: 120, t: "sys", x: "TIRS AU BUT : A se qualifie (5-4)." }];
  let rendu = null;
  api.seanceDirect(lignes, 2, moi, adv, El(), (tab, n) => { rendu = { tab, n }; });
  for (let garde = 0; garde < 500 && !rendu; garde++) {
    const b = FICHE.querySelector("#penRes").querySelector("#bPenOk");
    if (b.onclick) { b.onclick(); break; }
    FICHE.querySelector("#duelPen").querySelectorAll(".zDuel")[1].onclick(); vide();
  }
  ok(!!rendu, "la séance se joue et rend la main au direct");
  ok(rendu && !lignes.some(l => /^vieux/.test(l.x)) && lignes.filter(l => /^TIRS AU BUT/.test(l.x || "")).length === 1,
    "plus une ligne de la séance du moteur, une seule ligne de verdict");
  ok(rendu && rendu.n === lignes.length && lignes[1].x.indexOf("COUP DE SIFFLET") === 0, "le direct reprend juste après la séance, le sifflet n'a pas bougé");
  ok(rendu && rendu.tab.win === (rendu.tab.h > rendu.tab.a ? moi.id : adv.id), "le verdict rendu (" + (rendu && rendu.tab.h) + "-" + (rendu && rendu.tab.a) + ") est celui de la séance jouée");
}

console.log(F ? "\n❌ PENALTIES : " + F + " ÉCHEC(S)" : "\n✅ PENALTIES & TIRS AU BUT : TOUT EST VERT");
process.exit(F ? 1 : 0);
