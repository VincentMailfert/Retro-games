/* Harnais headless — LE CAP FRANCHI SE DIT, ET IL SE DIT AU BON MANAGER (v1.07)
   Retour de playtest : « est-ce qu'on reçoit bien une notification quand un joueur gagne 1 point ?
   même quand il est en prêt ? » — la réponse était non deux fois. La progression partait dans les
   dépêches (panneau à six lignes : la nouvelle sortait de l'écran avant d'être lue) et le test
   d'appartenance regardait `c.id===G.monClub`, or `preteJoueur` déplace physiquement le prêté dans
   l'effectif du club hôte. Il progressait donc en silence, et l'emprunté — qui ne vous appartient
   pas — déclenchait la nouvelle à sa place.
   A) aMoi() tranche sur le contrat, pas sur le vestiaire (maison / prêté / emprunté)
   B) un joueur maison qui franchit un cap le dit au DEBRIEF, et plus dans les dépêches
   C) un PRÊTÉ envoie sa carte postale, en nommant son club hôte
   D) un EMPRUNTÉ ne déclenche rien : il n'est pas à vous
   E) en conditions réelles (prêt de 15 journées joué pour de bon), la carte postale arrive
   F) le +1 de la sélection nationale passe lui aussi par le Debrief
   Usage : node harness-progression.cjs                                                        */
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const a = html.indexOf("<script>") + "<script>".length;
const b = html.lastIndexOf("</script>");
const script = html.slice(a, b);

/* ---- stubs DOM/navigateur (identiques aux autres harnais) ---- */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,clubById,onze,byUid,aMoi,progression,selections," +
  "preteJoueur,empruntJoueur,tarifPret,retourPret,traiterPrets,refusDepart," +
  "getG:function(){return G;},setG:function(x){G=x;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const dit = (t) => (G.notifs || []).filter(n => n.includes(t));
const depeches = (t) => (G.news || []).filter(n => n.includes(t));
/* amène un joueur à un cheveu du cap, et lui donne la semaine de jeu qui le fera basculer */
const auBordDuCap = (j) => { if (j.age > 23) j.age = 21; if (j.pot <= j.note) j.pot = j.note + 10; j.prog = 0.99; j._joue = 1; };
const razCanaux = () => { G.notifs = []; G.news = []; };

api.nouvellePartie("LEH");
let G = api.getG();
let moi = api.clubById(G.monClub);

/* Un club de départ est PILE au plancher réglementaire (16 joueurs, 2-4-4-2 minimum) : on ne peut
   donc pas prêter avant d'avoir recruté. On emprunte d'abord un joueur du MÊME poste — l'ordre qu'un
   vrai manager suivrait —, ce qui dégage la marge nécessaire au prêt sortant. */
const jeunes = moi.joueurs.filter(j => j.age <= 23 && j.pot > j.note).sort((x, y) => (y.pot - y.note) - (x.pot - x.note));
const maison = jeunes[0];
const aPreter = jeunes.find(j => j !== maison && j.pos !== "G") || jeunes[1];
const adv = G.clubs.find(c => c.id !== G.monClub && c.joueurs.some(j => j.age <= 23 && j.pot > j.note && j.pos === aPreter.pos));
const aEmprunter = adv.joueurs.filter(j => j.age <= 23 && j.pot > j.note && j.pos === aPreter.pos)
  .sort((x, y) => (y.pot - y.note) - (x.pot - x.note))[0];
ok(!!maison && !!aPreter && !!aEmprunter, "trois cobayes trouvés (maison, à prêter, à emprunter)");

/* ============ mise en place des deux prêts ============ */
const hote = G.clubs.filter(c => c.id !== G.monClub && c.id !== adv.id && c.pres <= moi.pres).sort((x, y) => x.pres - y.pres)[0];
api.empruntJoueur(aEmprunter, 15, api.tarifPret(aEmprunter));   // +1 au poste : la marge est là
api.preteJoueur(aPreter, 15, api.tarifPret(aPreter), hote);
ok(aPreter.pretOut === true && !moi.joueurs.includes(aPreter) && hote.joueurs.includes(aPreter),
  "le prêté a quitté mon effectif pour celui de " + hote.nom);
ok(aEmprunter.pretIn === true && moi.joueurs.includes(aEmprunter), "l'emprunté dort dans mon effectif");

/* ============ A) aMoi() tranche sur le contrat ============ */
console.log("A) À qui appartient vraiment ce joueur ?");
ok(api.aMoi(maison) === true, "un joueur maison est à moi");
ok(api.aMoi(aPreter) === true, "un PRÊTÉ reste à moi, même logé ailleurs");
ok(api.aMoi(aEmprunter) === false, "un EMPRUNTÉ n'est pas à moi, même logé chez moi");
ok(api.aMoi(adv.joueurs.find(j => !j.pretIn && !j.pretOut)) === false, "un joueur adverse n'est pas à moi");

/* ============ B) le joueur maison le dit au Debrief ============ */
console.log("B) Un cap franchi à la maison");
razCanaux(); auBordDuCap(maison);
const av = maison.note; api.progression();
ok(maison.note === av + 1, "il a bien gagné son point (" + av + " → " + maison.note + ")");
ok(dit(maison.nom + " progresse !").length === 1, "UNE notification au Debrief, et une seule");
ok(depeches("progresse").length === 0, "plus rien dans les dépêches : le panneau à six lignes ne l'avalera plus");

/* ============ C) le prêté envoie sa carte postale ============ */
console.log("C) Un cap franchi en prêt");
razCanaux(); auBordDuCap(aPreter);
const avP = aPreter.note; api.progression();
ok(aPreter.note === avP + 1, "le prêté a gagné son point (" + avP + " → " + aPreter.note + ")");
const carte = dit(aPreter.nom + " progresse à");
ok(carte.length === 1, "la carte postale est arrivée");
ok(carte.length === 1 && carte[0].includes(hote.nom), "elle nomme son club hôte (" + hote.nom + ")");
ok(carte.length === 1 && carte[0].includes("note " + aPreter.note), "elle donne la note atteinte");

/* ============ D) l'emprunté ne déclenche rien ============ */
console.log("D) Un cap franchi par un emprunté");
razCanaux(); auBordDuCap(aEmprunter);
const avE = aEmprunter.note; api.progression();
ok(aEmprunter.note === avE + 1, "il progresse quand même (c'est son club qui en profitera)");
ok(dit(aEmprunter.nom).length === 0, "AUCUNE notification : il ne vous appartient pas");

/* ============ E) en conditions réelles, sur un vrai prêt joué ============ */
console.log("E) Un prêt de 15 journées, joué pour de bon");
api.nouvellePartie("LEH");
G = api.getG(); moi = api.clubById(G.monClub);
const espoir = moi.joueurs.filter(j => j.age <= 21 && j.pot - j.note >= 8 && j.pos !== "G")
  .sort((x, y) => (y.pot - y.note) - (x.pot - x.note))[0];
ok(!!espoir, "un espoir prêtable trouvé : " + (espoir ? espoir.nom + " (" + espoir.age + " ans, note " + espoir.note + "/pot " + espoir.pot + ")" : "aucun"));
const adv2 = G.clubs.find(c => c.id !== G.monClub && c.joueurs.some(j => j.pos === espoir.pos && j.age >= 24));
const renfort = adv2.joueurs.find(j => j.pos === espoir.pos && j.age >= 24);
api.empruntJoueur(renfort, 15, api.tarifPret(renfort));         // on remplace avant de prêter
const hote2 = G.clubs.filter(c => c.id !== G.monClub && c.id !== adv2.id && c.pres <= moi.pres).sort((x, y) => x.pres - y.pres)[0];
api.preteJoueur(espoir, 15, api.tarifPret(espoir), hote2);
ok(espoir.pretOut === true, "il est parti s'aguerrir à " + hote2.nom);
const noteDepart = espoir.note;
const nomsAmoi = moi.joueurs.filter(j => !j.pretIn).map(j => j.nom).concat([espoir.nom]);
let cartes = 0, intrus = [];
for (let i = 0; i < 13; i++) {                                  // 13 < 15 : le prêt court toujours à la sortie
  api.jouerJournee();
  for (const n of (G.notifs || [])) {
    if (!n.startsWith("📈")) continue;                // 📈 : les seules notifications de progression
    if (n.includes(espoir.nom)) cartes++;
    else if (!nomsAmoi.some(nm => n.includes(nm))) intrus.push(n);
  }
}
ok(espoir.pretOut === true, "le prêt court encore : le gain mesuré n'est PAS le bonus de fin de pige");
ok(espoir.note > noteDepart, "la pige a payé pendant qu'il était là-bas : note " + noteDepart + " → " + espoir.note);
ok(cartes >= 1, "au moins une carte postale reçue pendant le prêt (" + cartes + ")");
ok(intrus.length === 0, "aucune notification pour un joueur qui n'est pas à moi" + (intrus.length ? " — " + intrus[0] : ""));

/* ============ F) le +1 de la sélection passe aussi par le Debrief ============ */
console.log("F) Le cap franchi au retour de Clairefontaine");
const inter = moi.joueurs.find(j => j.age <= 24 && (j.nat || "FR") === "FR" && !j.pretIn);
ok(!!inter, "un international maison trouvé : " + (inter ? inter.nom : "aucun"));
let vu = 0;
for (let i = 0; i < 300 && !vu; i++) {
  G.notifs = [];
  inter.selA = true; inter.butSel = true; inter.note = 80; inter.pot = 90; inter.age = 22;
  api.selections();
  vu = dit(inter.nom + " revient grandi").length;
}
ok(vu === 1, "le point gagné en sélection s'annonce au Debrief");

console.log(FAILS ? "\n✗ " + FAILS + " ÉCHEC(S)" : "\n✅ TOUT EST VERT");
process.exit(FAILS ? 1 : 0);
