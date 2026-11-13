/* Harnais de validation — LA MESURE DU PARCOURS (v2.74)
   Le jeu envoie à GoatCounter quelques événements de parcours, chacun une seule fois par navigateur.
   A) rien ne part au harnais, ni en local, ni pour un nom d'événement inconnu
   B) en ligne, un événement part une fois et une seule, sous le chemin « parcours/… »
   C) GoatCounter pas encore chargé : rien n'est noté, l'événement repartira
   D) les retours J1, J7, J30 se calculent sur les jours de calendrier, même au changement d'heure
   E) le démarrage note la première visite, puis ne renvoie rien le même jour
   F) les cinq points du parcours sont bien branchés dans le jeu
   Usage : node harness-mesure.cjs                                                                      */
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
const generic = makeStub();
global.document = new Proxy(function () {}, {
  get(_t, p) { if (p === Symbol.toPrimitive) return () => ""; return generic; },
  set() { return true; }, apply() { return generic; }, has() { return true; }, construct() { return generic; },
});
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, localStorage: ls, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.localStorage = ls; global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0); global.cancelAnimationFrame = (id) => clearTimeout(id);

const api = new Function(script + "\n;return {mesure,mesureDemarrage,mesureRetoursDus,mesureLit,mesureJour,mesureEcart,MESURE_KEY,MESURE_EVTS};")();
const { mesure, mesureDemarrage, mesureRetoursDus, mesureLit, mesureJour, mesureEcart, MESURE_KEY, MESURE_EVTS } = api;

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const envois = [];
const faux = { count(o) { envois.push(o); } };
const vraiTimeout = global.setTimeout;
let timers = 0;
const enLigne = (host = "multiplex.club", proto = "https:") => { global.location = { protocol: proto, hostname: host }; window.__TEST__ = false; };
const remiseAZero = () => { ls._m = {}; envois.length = 0; timers = 0; };
global.setTimeout = (fn, ms) => { timers++; return 0; }; // les relances ne doivent pas tourner pour de vrai

/* ===== A ===== */
console.log("A) Rien ne part au harnais, en local, ni pour un nom inconnu");
{
  remiseAZero(); window.goatcounter = faux; window.__TEST__ = true; global.location = { protocol: "https:", hostname: "multiplex.club" };
  ok(mesure("partie-lancee") === false && envois.length === 0, "au harnais (EN_TEST), aucun envoi");
  enLigne("localhost", "http:");
  ok(mesure("partie-lancee") === false && envois.length === 0, "en local (http://localhost), aucun envoi");
  enLigne("127.0.0.1");
  ok(mesure("partie-lancee") === false && envois.length === 0, "sur 127.0.0.1, aucun envoi");
  enLigne();
  ok(mesure("n-importe-quoi") === false && envois.length === 0, "un nom d'événement inconnu est refusé");
  ok(!ls._m[MESURE_KEY], "et rien n'est écrit dans le navigateur");
}

/* ===== B ===== */
console.log("B) En ligne, un événement part une fois et une seule");
{
  remiseAZero(); enLigne(); window.goatcounter = faux;
  ok(mesure("partie-lancee") === true, "la partie lancée part");
  ok(envois.length === 1 && envois[0].path === "parcours/partie-lancee" && envois[0].event === true,
    `sous le chemin « ${envois[0] && envois[0].path} », en événement`);
  mesure("partie-lancee"); mesure("partie-lancee");
  ok(envois.length === 1, "relancée deux fois, elle ne repart pas");
  ok(mesureLit().vus && mesureLit().vus["partie-lancee"] === mesureJour(), "le carnet note le jour de l'envoi");
  for (const e of MESURE_EVTS) mesure(e);
  ok(envois.length === MESURE_EVTS.length, `les ${MESURE_EVTS.length} événements partent chacun une fois : ${envois.map(x => x.path.slice(9)).join(", ")}`);
  ok(envois.every(x => Object.keys(x).sort().join() === "event,path,title"), "rien d'autre que le nom ne part (chemin, titre, drapeau d'événement)");
}

/* ===== C ===== */
console.log("C) GoatCounter pas encore chargé");
{
  remiseAZero(); enLigne(); window.goatcounter = undefined;
  ok(mesure("premier-match") === false && timers === 1, "l'événement attend et programme un nouvel essai");
  ok(!(mesureLit().vus || {})["premier-match"], "il n'est pas noté comme envoyé");
  ok(mesure("premier-match", 10) === false && timers === 1, "au dixième essai, il abandonne sans boucler");
  window.goatcounter = faux;
  ok(mesure("premier-match") === true && envois.length === 1, "le compteur arrivé, il part");
}

/* ===== D ===== */
console.log("D) Les retours J1, J7, J30");
{
  const d = (p, a, vus) => mesureRetoursDus({ premier: p, vus }, a).join(",");
  ok(d("2026-11-01", "2026-11-01") === "", "le jour même : aucun retour");
  ok(d("2026-11-01", "2026-11-02") === "retour-j1", "le lendemain : J1");
  ok(d("2026-11-01", "2026-11-08") === "retour-j1,retour-j7", "une semaine après : J1 et J7");
  ok(d("2026-11-01", "2026-12-01") === "retour-j1,retour-j7,retour-j30", "trente jours après : les trois");
  ok(d("2026-11-01", "2026-11-08", { "retour-j1": "2026-11-02" }) === "retour-j7", "un retour déjà envoyé ne revient pas");
  ok(mesureEcart("2026-10-24", "2026-10-25") === 1 && mesureEcart("2026-03-28", "2026-03-29") === 1, "le changement d'heure ne fausse pas le compte des jours");
  ok(mesureRetoursDus({}, "2026-11-08").length === 0, "sans première visite connue, aucun retour");
}

/* ===== E ===== */
console.log("E) Le démarrage");
{
  remiseAZero(); enLigne(); window.goatcounter = faux;
  mesureDemarrage();
  ok(mesureLit().premier === mesureJour() && envois.map(x => x.path).join() === "parcours/premiere-visite", "première fois : la date est notée, la première visite part");
  mesureDemarrage();
  ok(envois.length === 1, "relancé le même jour : rien de plus");
  ls._m[MESURE_KEY] = JSON.stringify({ premier: "2000-01-01", vus: { "premiere-visite": "2000-01-01" } });
  envois.length = 0; mesureDemarrage();
  ok(envois.map(x => x.path.slice(9)).join() === "retour-j1,retour-j7,retour-j30", "un ancien joueur qui revient : ses trois retours partent");
  ls._m[MESURE_KEY] = "{pas du json";
  envois.length = 0; let plante = false; try { mesureDemarrage(); } catch (e) { plante = true; }
  ok(!plante && mesureLit().premier === mesureJour(), "un carnet abîmé ne fait rien planter : il repart à neuf");
}

/* ===== F ===== */
console.log("F) Les points du parcours sont branchés");
{
  const corps = (nom) => { const i = script.indexOf("function " + nom + "("); return script.slice(i, i + 900); };
  ok(/mesure\("partie-lancee"\)/.test(corps("nouvellePartie")) && /if\(!suite\) mesure/.test(corps("nouvellePartie")), "nouvellePartie : la partie lancée, sauf l'été d'une carrière d'entraîneur");
  ok(/mesure\("premier-match"\)/.test(corps("finirJournee")), "finirJournee : le premier match");
  ok(/mesure\("saison-finie"\)/.test(corps("finDeSaison")), "finDeSaison : la première saison finie");
  ok(/mesure\("compte-cree"\)/.test(corps("compteInscription")), "compteInscription : le compte créé");
  ok(/setTimeout\(mesureDemarrage/.test(script), "le démarrage du jeu appelle mesureDemarrage");
  ok(!/mesure\([^)]*\)/.test(corps("migre")), "migre (une vieille sauvegarde relue) n'envoie rien");
}

global.setTimeout = vraiTimeout;
console.log(FAILS ? `\n✗ ${FAILS} ÉCHEC(S)` : "\nTOUT EST VERT");
process.exit(FAILS ? 1 : 0);
