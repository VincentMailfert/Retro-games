/* Harnais de L'IMAGE D'ACCORD AVEC LE TEXTE (v3.14) : la maquette 3D ne montre jamais autre chose que ce que dit la ligne.
     A) le moteur étiquette ses familles de lignes (sc) partout où il les tire
     B) chaque famille étiquetée donne la scène de sa famille, sur de vrais matchs
     C) les phrases qui trompaient la scène (point de penalty, second poteau, termine, contestation…) sont bien lues
     D) aucun penalty, aucun poteau, aucun tir inventé : la scène ne montre un tir que si la ligne en raconte un
     E) toute occasion, tout but et tout carton a sa scène
   Usage : node harness-accord3d.cjs */
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
let F = 0; const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) F++; };

console.log("A) Le moteur étiquette ses familles");
for (const k of ["cf", "sauve", "meurt", "hj", "poteau", "refuse"]) {
  const tires = (html.match(new RegExp("pickNR\\(COMM\\." + k + ",", "g")) || []).length;
  const etiq = (html.match(new RegExp('sc:"' + k + '",x:fmtC\\(pickNR\\(COMM\\.' + k + ",", "g")) || []).length;
  ok(tires > 0 && tires === etiq, "COMM." + k + " : " + etiq + " tirage(s), tous étiquetés « " + k + " »");
}
ok((html.match(/sc:"corner",x:fmtC\(pickNR\(COMM\.corner(Suite)?,/g) || []).length === 2, "le corner d'un seul tenant et la suite du corner annoncé sont étiquetés « corner »");

/* le moteur, sans navigateur */
const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</scr" + "ipt>"));
function makeStub() { let st; const fn = function () { return st; };
  st = new Proxy(fn, { get(_t, p) { if (p === Symbol.toPrimitive) return () => ""; if (p === "length") return 0; if (p === "forEach" || p === "map") return () => []; return st; },
    set() { return true; }, apply() { return st; }, has() { return true; }, construct() { return st; } }); return st; }
const generic = makeStub();
global.document = new Proxy(function () {}, { get(_t, p) { if (p === "getElementById") return () => generic; if (p === "querySelectorAll") return () => []; if (p === Symbol.toPrimitive) return () => ""; return generic; },
  set() { return true; }, apply() { return generic; }, has() { return true; }, construct() { return generic; } });
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = cb => setTimeout(cb, 0); global.cancelAnimationFrame = id => clearTimeout(id);
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.localStorage = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; }, get length() { return 0; }, key() { return null; } };
global.navigator = { userAgent: "h" };
const api = new Function(script + "\n;return {nouvellePartie, simuleMatch, onze, clubById, getG:()=>G};")();
api.nouvellePartie("LEN"); const G = api.getG();

/* le lecteur de lignes de la maquette, pris dans le bloc greffé */
const a = html.indexOf("  function trouveNom("), b = html.indexOf("  function porteNom(");
ok(a > 0 && b > a, "le lecteur de lignes est dans le bloc MATCH3D");
const fabrique = new Function("joueurs", "EQ", "CODE_FIN", "adverse", html.slice(a, b) + "\n return lireLigne;");

const ids = G.clubs.map(c => c.id), L = [];
for (let k = 0; k < 500; k++) {
  const h = ids[(Math.random() * ids.length) | 0]; let v; do { v = ids[(Math.random() * ids.length) | 0]; } while (v === h);
  G.journee = 1 + ((Math.random() * 30) | 0);
  const H = api.clubById(h), V = api.clubById(v);
  for (const c of [H, V]) for (const j of c.joueurs) { j.susp = 0; j.bless = 0; }
  const joueurs = []; for (const [camp, c] of [["dom", H], ["ext", V]]) for (const j of api.onze(c)) joueurs.push({ nom: j.nom, camp, gardien: j.pos === "G" });
  const lire = fabrique(joueurs, { dom: { id: h }, ext: { id: v } }, /\(([A-Z]{2,4})\)\s*$/, c => c === "dom" ? "ext" : "dom");
  for (const e of api.simuleMatch(H, V, true).ev) L.push({ e, i: lire(e) });
}
const jeu = L.filter(o => o.e.t !== "sys" && o.e.t !== "amb");

console.log("B) Chaque famille donne sa scène (" + L.length + " lignes de 500 matchs)");
const famille = (sc, test, quoi) => { const l = jeu.filter(o => o.e.sc === sc), faux = l.filter(o => !o.i || !test(o.i));
  ok(l.length > 0 && !faux.length, "« " + sc + " » (" + l.length + " lignes) : " + quoi + (faux.length ? "  ✗ ex. " + faux[0].e.x.slice(0, 90) : "")); };
famille("meurt", i => i.genre === "meurt" && i.voie === "combi" && !!i.fin, "l'action s'éteint, personne ne tire");
famille("sauve", i => i.genre === "bloque", "un défenseur s'interpose, pas le gardien");
famille("hj", i => i.genre === "horsjeu", "le drapeau se lève");
famille("refuse", i => i.genre === "refuse", "au fond, mais l'arbitre refuse");
famille("poteau", i => i.genre === "poteau", "le cadre tremble");
famille("cf", i => i.voie === "cf" && /^(rate|arret|bloque|poteau)$/.test(i.genre), "un coup franc, avec son mur");
famille("corner", i => i.voie === "corner" && /^(meurt|rate|poteau)$/.test(i.genre), "un corner, repris seulement si le texte le dit");

console.log("C) Les phrases qui trompaient la scène");
const phrase = (re, test, quoi) => { const l = jeu.filter(o => re.test(o.e.x)), faux = l.filter(o => !o.i || !test(o.i));
  ok(l.length > 0 && !faux.length, quoi + " (" + l.length + ")" + (faux.length ? "  ✗ lu " + (faux[0].i ? faux[0].i.genre + "/" + faux[0].i.voie : "rien") : "")); };
phrase(/place son corner au point de penalty|le place au point de penalty/, i => i.voie === "corner" && i.genre === "meurt" && i.fin === "gardien", "« au point de penalty » : un corner capté par le gardien, pas un penalty");
phrase(/Deux appels au point de penalty/, i => i.voie !== "pen" && i.genre === "perdu", "« deux appels au point de penalty » : un ballon perdu");
phrase(/fuse au second poteau\.\.\. et finit dans les gants/, i => i.genre === "meurt" && i.fin === "gardien", "« au second poteau… dans les gants » : le gardien, pas le poteau");
phrase(/Repris de la tête au second poteau\.\.\. au-dessus/, i => i.genre === "rate", "« au second poteau… au-dessus » : une tête à côté");
phrase(/au ras du poteau\.\.\. claquette/, i => i.genre === "arret", "« au ras du poteau… claquette » : un arrêt");
phrase(/frôle le (poteau|montant)/, i => i.genre === "rate", "« frôle le poteau » : à côté");
phrase(/cueille le ballon sous sa barre|boxe au-dessus de sa barre/, i => i.genre === "arret", "« sous sa barre », « au-dessus de sa barre » : le gardien l'a");
phrase(/trouve le POTEAU|BARRE TRANSVERSALE|Le bois sauve/, i => i.genre === "poteau", "le vrai poteau reste un poteau");
phrase(/termine la contre-attaque du plat du pied/, i => i.genre === "but" && i.voie !== "loin", "« termine… du plat du pied » : pas une mine de trente mètres");
phrase(/le portier fait le mur à lui tout seul/, i => i.voie !== "cf", "« le portier fait le mur » : pas un coup franc");
phrase(/Coup franc pour .*l'action s'arrête là/, i => i.genre === "meurt" && i.fin === "sifflet" && i.voie === "combi", "« Coup franc pour l'adversaire » : un coup de sifflet, pas un coup franc à tirer");
phrase(/le mur saute, contré|s'écrase sur le mur/, i => i.genre === "bloque" && i.voie === "cf", "« contré », « sur le mur » : le ballon s'arrête dans le mur");
phrase(/trop appuyée : le ballon file en sortie de but/, i => i.genre === "meurt" && i.fin === "sortie", "« la passe est trop appuyée » : une sortie de but, pas une frappe");
phrase(/le rend aussitôt à/, i => i.genre === "meurt" && i.fin === "adversaire", "« le rend aussitôt » : un ballon rendu, pas une frappe");
phrase(/Le ballon finit en touche/, i => i.genre === "meurt" && i.fin === "touche", "« finit en touche » : une touche");
phrase(/SAUVÉ SUR LA LIGNE|se transforme en gardien/, i => i.genre === "bloque" && i.voie !== "tir", "« sauvé sur la ligne » : devant la ligne, jamais de loin");
phrase(/averti pour contestation|traîne à sortir|s'assoit sur le ballon/, i => i.genre === "carton" && i.sec, "contestation, gain de temps : le carton sans tacle");
phrase(/tacle appuyé|Semelle appuyée|Tacle glissé/, i => i.genre === "carton" && !i.sec, "tacle, semelle : le carton avec sa faute");
phrase(/BUT DIRECT/, i => i.genre === "but" && i.voie === "corner", "« BUT DIRECT » : un but sur corner");

console.log("D) Rien d'inventé");
{ const pen = jeu.filter(o => o.i && o.i.voie === "pen" && !(o.e.g && o.e.g.pen) && !(/\bpenalty\b|onze mètres/i.test(o.e.x) && !/point de penalty/i.test(o.e.x)));
  ok(!pen.length, "aucun penalty montré sans penalty" + (pen.length ? "  ✗ " + pen[0].e.x.slice(0, 90) : ""));
  const neutre = /(premier|second|deuxième) poteau|poteau de corner|(au-dessus|par-dessus|sous|au ras|derrière) (de |du )?(la |sa |le )?(barre|transversale|poteau|montant)|(frôle|rase) (la |le )(barre|transversale|poteau|montant)/gi;
  const pot = jeu.filter(o => o.i && o.i.genre === "poteau" && !/\b(poteaux?|barre|transversale|montant|bois)\b/i.test(o.e.x.replace(neutre, " ")));
  ok(!pot.length, "aucun poteau montré sans poteau" + (pot.length ? "  ✗ " + pot[0].e.x.slice(0, 90) : ""));
  const tirs = jeu.filter(o => o.i && /^(rate|arret)$/.test(o.i.genre) && /^(meurt|refuse|hj)$/.test(o.e.sc || ""));
  ok(!tirs.length, "aucun tir montré sur une action sans tir");
  const but = jeu.filter(o => (o.e.t === "but") !== !!(o.i && o.i.genre === "but"));
  ok(!but.length, "un but est montré comme un but, et rien d'autre ne l'est" + (but.length ? "  ✗ " + but[0].e.x.slice(0, 90) : ""));
}

console.log("E) Tout a sa scène");
{ const sans = jeu.filter(o => !o.i);
  ok(!sans.length, jeu.length + " occasions, buts et cartons, tous mis en scène" + (sans.length ? "  ✗ " + sans.length + " sans image, ex. " + sans[0].e.x.slice(0, 90) : "")); }

console.log(F ? "\n❌ HARNAIS ACCORD 3D : " + F + " ÉCHEC(S)" : "\n✅ HARNAIS ACCORD 3D : TOUT EST VERT");
process.exit(F ? 1 : 0);
