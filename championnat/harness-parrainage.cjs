/* Harnais headless — LE PARRAINAGE (v3.03)
   Même faux Supabase que harness-compte.cjs (fetch remplacé, aucun réseau réel), avec en plus les tables
   codes_parrainage et parrainages, la fonction mon_parrainage() et le déclencheur parrainage_confirme
   tels que les tient supabase/schema.sql.
   A) l'adresse ?p=CODE : lue sans requête, rangée, rien d'écrit sans code, code invalide ignoré
   B) le lien du parrain : code créé au premier appel, toujours le même ensuite, relu au plus une fois par minute
   C) l'inscription du filleul : le code part dans data.parrain, puis s'efface du navigateur
   D) la confirmation de l'adresse inscrit le parrainage ; sans confirmation, rien
   E) les points : +500 au solde du parrain, plafond de 20 filleuls, annonce une seule fois
   F) les refus : son propre code, un code inconnu, un compte qui a déjà un parrain, un code trop vieux
   G) toujours aucune requête pour un invité
   Usage : node harness-parrainage.cjs                                                       */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const a = html.indexOf("<script>") + "<script>".length;
const b = html.lastIndexOf("</script>");
const script = html.slice(a, b);

/* ---- stubs DOM/navigateur ---- */
function makeStub() {
  let stub;
  const fn = function () { return stub; };
  stub = new Proxy(fn, {
    get(_t, p) { if (p === Symbol.toPrimitive) return () => ""; if (p === "length") return 0; return stub; },
    set() { return true; }, apply() { return stub; }, has() { return true; }, construct() { return stub; },
  });
  return stub;
}
function nouveauLS() { // un localStorage fidèle par appareil : length/key pour le balayage, quota possible
  return {
    _m: {}, quota: 0,
    get length() { return Object.keys(this._m).length; },
    key(i) { return Object.keys(this._m)[i] ?? null; },
    getItem(k) { return this._m[k] ?? null; },
    setItem(k, v) {
      v = String(v);
      if (this.quota) {
        let poids = v.length;
        for (const c of Object.keys(this._m)) if (c !== k) poids += this._m[c].length;
        if (poids > this.quota) { const e = new Error("quota"); e.name = "QuotaExceededError"; e.code = 22; throw e; }
      }
      this._m[k] = v;
    },
    removeItem(k) { delete this._m[k]; },
    clear() { this._m = {}; },
  };
}
global.document = makeStub();
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.location = { origin: "https://vincentmailfert.github.io", pathname: "/Retro-games/championnat/" };

/* ---- le faux Supabase ---- */
const URL_SB = "https://faux-projet.supabase.co", CLE = "sb_publishable_FAUSSE";
const SRV = {
  users: {}, parEmail: {}, jetons: {}, rafraich: {}, lignes: [],
  prog: {},          // la table progression : une ligne par compte {maj, donnees, version}
  avantProg: null,   // un autre appareil qui écrit pile entre la lecture et l'envoi (une fois)
  panne: false,      // plus de réseau : fetch lève, comme un navigateur hors ligne
  force: null,       // un statut HTTP imposé aux appels de la base (500, 413…)
  confirmer: false,  // l'adresse doit-elle être confirmée par email avant la première connexion ?
  appels: 0, pousses: 0, n: 0,
  codes: {},         // codes_parrainage : uid → code
  parrainages: {},   // parrainages : filleul → parrain
  inscriptions: [],  // les corps reçus par /auth/v1/signup
  tirages: ["K7Q2MX", "K7Q2MX", "ZZ9ABC", "PQR234", "MNB567"], // les codes que « random() » sortira, dans l'ordre
};
function declencheur(uid) { // parrainage_confirme, à la confirmation de l'adresse
  const c = String((SRV.users[uid].meta || {}).parrain || "").toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(c)) return;
  const p = Object.keys(SRV.codes).find((u) => SRV.codes[u] === c);
  if (!p || p === uid || SRV.parrainages[uid]) return;
  SRV.parrainages[uid] = p;
}
function confirme(email) { const u = SRV.users[SRV.parEmail[email]]; u.confirme = true; declencheur(u.id); }
function monParrainage(uid) {
  while (!SRV.codes[uid]) { const c = SRV.tirages.length ? SRV.tirages.shift() : Math.random().toString(36).slice(2, 8).toUpperCase();
    if (!Object.values(SRV.codes).includes(c)) SRV.codes[uid] = c; } // collision : on retire
  return { code: SRV.codes[uid], filleuls: Object.values(SRV.parrainages).filter((p) => p === uid).length };
}
const rep = (st, o) => ({ ok: st >= 200 && st < 300, status: st, text: async () => (o == null ? "" : JSON.stringify(o)) });
function sessionPour(uid) {
  const at = "at" + (++SRV.n), rt = "rt" + (++SRV.n);
  SRV.jetons[at] = uid; SRV.rafraich[rt] = uid;
  return { access_token: at, refresh_token: rt, expires_in: 3600, token_type: "bearer", user: { id: uid, email: SRV.users[uid].email } };
}
function pousse(uid, p) { // la fonction pousse_carriere telle que la base la tiendra (lot 2)
  if (typeof p.p_donnees !== "string" || p.p_donnees.length > 2000000) return { refus: "lourd" };
  const miennes = SRV.lignes.filter((l) => l.uid === uid);
  const l = miennes.find((x) => x.id === p.p_id);
  if (!l) {
    if (miennes.length >= 10) return { refus: "plein" };
    SRV.lignes.push({ uid, id: p.p_id, maj: p.p_maj, fiche: p.p_fiche, donnees: p.p_donnees, version: p.p_version });
    return { ok: true };
  }
  if (l.maj === p.p_maj) { l.fiche = p.p_fiche; return { ok: true }; } // renvoi d'un envoi déjà reçu (réponse perdue), ou simple renommage
  if (l.maj !== p.p_attendu) return { conflit: true, maj: l.maj, fiche: l.fiche };
  if (p.p_copie) { // la version écrasée continue à part : rien n'est détruit
    if (miennes.length >= 12) return { refus: "plein" };
    SRV.lignes.push({ uid, id: p.p_copie.id, maj: l.maj, fiche: Object.assign({}, l.fiche, { nom: p.p_copie.nom }), donnees: l.donnees, version: l.version });
  }
  Object.assign(l, { maj: p.p_maj, fiche: p.p_fiche, donnees: p.p_donnees, version: p.p_version });
  return { ok: true };
}
function pousseProg(uid, p) { // la fonction pousse_progression telle que la tient supabase/schema.sql
  if (!p.p_donnees || typeof p.p_donnees !== "object" || Array.isArray(p.p_donnees)) return { refus: "forme" };
  if (JSON.stringify(p.p_donnees).length > 200000) return { refus: "lourd" };
  if (SRV.avantProg) { const f = SRV.avantProg; SRV.avantProg = null; f(); }
  const l = SRV.prog[uid];
  if (!l) {
    if ((p.p_attendu || 0) !== 0) return { conflit: true, maj: 0 };
    SRV.prog[uid] = { maj: p.p_maj || 0, donnees: p.p_donnees, version: p.p_version };
    return { ok: true };
  }
  if (l.maj !== p.p_attendu) return { conflit: true, maj: l.maj };
  Object.assign(l, { maj: p.p_maj || 0, donnees: p.p_donnees, version: p.p_version });
  return { ok: true };
}
global.fetch = async (url, init) => {
  SRV.appels++;
  if (SRV.panne) throw new TypeError("Failed to fetch");
  const u = new URL(url), p = u.pathname, h = init.headers || {};
  const corps = init.body ? JSON.parse(init.body) : null;
  if (u.origin !== URL_SB) return rep(404, null);
  if (h.apikey !== CLE) return rep(401, { message: "Invalid API key" });
  const uid = SRV.jetons[String(h.Authorization || "").replace(/^Bearer /, "")];
  if (p === "/auth/v1/signup") {
    if (SRV.parEmail[corps.email]) return rep(422, { error_code: "user_already_exists" });
    if (String(corps.password).length < 6) return rep(422, { error_code: "weak_password" });
    const id = "u" + (++SRV.n);
    SRV.users[id] = { id, email: corps.email, mdp: corps.password, confirme: !SRV.confirmer, meta: corps.data || {} };
    SRV.parEmail[corps.email] = id;
    SRV.inscriptions.push(corps);
    if (SRV.users[id].confirme) declencheur(id);
    return rep(200, SRV.confirmer ? { id, email: corps.email } : sessionPour(id));
  }
  if (p === "/auth/v1/token") {
    const g = u.searchParams.get("grant_type");
    if (g === "password") {
      const us = SRV.users[SRV.parEmail[corps.email]];
      if (!us || us.mdp !== corps.password) return rep(400, { error_code: "invalid_credentials" });
      if (!us.confirme) return rep(400, { error_code: "email_not_confirmed" });
      return rep(200, sessionPour(us.id));
    }
    const qui = SRV.rafraich[corps.refresh_token];
    if (!qui || !SRV.users[qui]) return rep(400, { error_code: "refresh_token_not_found" });
    delete SRV.rafraich[corps.refresh_token]; // rotation, comme le vrai
    return rep(200, sessionPour(qui));
  }
  if (p === "/auth/v1/recover") return rep(200, {});
  if (p === "/auth/v1/user" && init.method === "PUT") {
    if (!uid) return rep(401, { message: "JWT expired" });
    if (String(corps.password).length < 6) return rep(422, { error_code: "weak_password" });
    SRV.users[uid].mdp = corps.password; return rep(200, { id: uid, email: SRV.users[uid].email });
  }
  if (p === "/auth/v1/logout") { for (const t in SRV.jetons) if (SRV.jetons[t] === uid) delete SRV.jetons[t]; for (const t in SRV.rafraich) if (SRV.rafraich[t] === uid) delete SRV.rafraich[t]; return rep(204, null); }
  if (!uid) return rep(401, { message: "JWT expired" });
  if (SRV.force) return rep(SRV.force, { message: "forcé" });
  if (p === "/rest/v1/rpc/pousse_carriere") { SRV.pousses++; return rep(200, pousse(uid, corps)); }
  if (p === "/rest/v1/rpc/mon_parrainage") { SRV.parrainAppels = (SRV.parrainAppels || 0) + 1; return rep(200, monParrainage(uid)); }
  if (p === "/rest/v1/rpc/pousse_progression") return rep(200, pousseProg(uid, corps));
  if (p === "/rest/v1/progression" && init.method === "GET") { // les règles de la base : chacun ne lit que sa ligne
    const l = SRV.prog[uid]; return rep(200, l ? [{ maj: l.maj, donnees: JSON.parse(JSON.stringify(l.donnees)) }] : []);
  }
  if (p === "/rest/v1/rpc/supprime_mon_compte") {
    SRV.lignes = SRV.lignes.filter((l) => l.uid !== uid); delete SRV.prog[uid]; // on delete cascade
    delete SRV.parEmail[SRV.users[uid].email]; delete SRV.users[uid];
    for (const t in SRV.jetons) if (SRV.jetons[t] === uid) delete SRV.jetons[t];
    return rep(200, null);
  }
  if (p === "/rest/v1/carrieres" && init.method === "DELETE") { // les règles de la base : on n'efface que les siennes
    const f = u.searchParams.get("id");
    SRV.lignes = SRV.lignes.filter((x) => !(x.uid === uid && "eq." + x.id === f));
    return rep(204, null);
  }
  if (p === "/rest/v1/carrieres" && init.method === "GET") { // les règles de la base : chacun ses lignes
    const champs = (u.searchParams.get("select") || "*").split(",");
    const filtreId = u.searchParams.get("id");
    let l = SRV.lignes.filter((x) => x.uid === uid && (!filtreId || "eq." + x.id === filtreId));
    l = l.slice().sort((x, y) => y.maj - x.maj);
    return rep(200, l.map((x) => Object.fromEntries(champs.map((c) => [c, x[c]]))));
  }
  return rep(404, { message: "route inconnue " + p });
};

/* ---- les appareils ---- */
const epilogue = "\n;return {nouvellePartie,jouerJournee,sauvegardeLocale,chargeLocale,partiesListe,idxLit,posePend," +
  "CLUBS,CLUBS_D2,SAVEKEY,IDXKEY,PARTPFX,NUAGE,NUAGEKEY,COMPTEKEY,NUAGE_AVIS,MSG_JOURNAL," +
  "nuageEvincable,nuageLibere,nuageOublie,nuageRafraichitListe,carrieresAffichees,nuagePrepare,placeDispo,supprimePartie,MAX_PARTIES," +
  "compteInscription,compteConnexion,compteDepuisLien,compteNouveauMdp,texteErreur,compteDeconnexion,compteSupprime,compteOubli,compteLit," +
  "nuageSynchronise,nuagePlanifie,nuageListe,nuageRapatrie,nuageCompresse,nuageDecompresse,nuageEtatLit,avanceDe," +
  "parrainageDepuisAdresse,parrainageRafraichit,parrainageAnnonce,codeRecu,pointsParrainage,pointsGagnes,soldePoints,parrainageHTML,lienParrainage,PARRAINKEY,PARRAIN_PTS,PARRAIN_MAX," +
  "PARRAIN_GRILLE,palierParrain,palierSuivant,multParrain,primesParrain,bonusDefisParrain,pointsDefis,parrainSeuilAtteint,invitationASignaler,parrainMatchJoue,PARRAIN_SEUILS,PARRAIN_PAS," +
  "progGagne,ouvreSaison,clesDispo,saisonOuverte,progSynchronise," +
  "libIndicateur,ligneAppareil,panneauCarrieres,propCompte,propLit,cablePropCompte,cleDepart,PROPKEY," +
  "getG:function(){return G;},setG:function(x){G=x;},getPARTIE:function(){return PARTIE;}," +
  "getEtat:function(){return NUAGE_ETAT;},setDernier:function(v){NUAGE_DERNIER=v;}};";
function appareil(nom, ls) {
  const d = { nom, ls: ls || nouveauLS() };
  global.localStorage = d.ls; global.window.localStorage = d.ls;
  d.api = new Function(script + epilogue)();
  return d;
}
let ICI = null;
function sur(d) { ICI = d; global.localStorage = d.ls; global.window.localStorage = d.ls; return d.api; }
function reel(fn) { // les sauvegardes se court-circuitent en mode test : on lève le drapeau le temps de l'appel
  global.window.__TEST__ = false;
  try { return fn(); } finally { global.window.__TEST__ = true; }
}
function joue(api, n) { for (let i = 0; i < n; i++) api.jouerJournee(); return reel(() => api.sauvegardeLocale(true)); }
function allume(api) { api.NUAGE.url = URL_SB; api.NUAGE.cle = CLE; }
const lignesDe = (email) => SRV.lignes.filter((l) => l.uid === SRV.parEmail[email]);

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (c, m) => { if (c) console.log("  ✓ " + m); else fail(m); };

(async () => {
  const lsDe = (d) => { try { return JSON.parse(d.ls.getItem("d1manager_parrainage_v1") || "null"); } catch (e) { return null; } };

  /* ===== A) l'adresse ===== */
  console.log("A) L'adresse ?p=CODE : lue sans requête");
  const ami = appareil("ami"); let api = sur(ami);
  let av = SRV.appels;
  ok(api.parrainageDepuisAdresse("") === null && api.parrainageDepuisAdresse("?x=1") === null, "sans code, rien");
  ok(ami.ls.getItem("d1manager_parrainage_v1") === null, "sans code, rien n'est écrit dans le navigateur");
  ok(api.parrainageDepuisAdresse("?p=abc") === null && ami.ls.getItem("d1manager_parrainage_v1") === null, "un code mal formé est ignoré");
  ok(api.parrainageDepuisAdresse("?p=k7q2mx&utm=insta") === "K7Q2MX", "le code est lu (majuscules) au milieu d'autres paramètres");
  ok(lsDe(ami).recu.code === "K7Q2MX" && api.codeRecu() === "K7Q2MX", "il est rangé et attend l'inscription");
  ok(SRV.appels === av, "aucune requête");

  /* ===== G) l'invité ===== */
  console.log("G) Un invité : toujours aucune requête");
  allume(api);
  av = SRV.appels;
  ok((await api.parrainageRafraichit(true)) === false && SRV.appels === av, "parrainageRafraichit ne fait rien sans compte");
  ok(api.pointsParrainage() === 0, "aucun point");
  ok(/Créer mon compte/.test(api.parrainageHTML()), "la salle des trophées propose de créer un compte");

  /* ===== B) le parrain ===== */
  console.log("B) Le lien du parrain");
  const vin = appareil("vincent"); api = sur(vin); allume(api);
  await api.compteInscription("vincent@ex.fr", "secret1");
  ok(SRV.inscriptions[0].data === undefined, "sans code reçu, l'inscription part sans data");
  ok(await api.parrainageRafraichit(true), "premier appel : le code naît");
  ok(SRV.codes[api.compteLit().uid] === "K7Q2MX", "le code est K7Q2MX");
  ok(/multiplex\.club\/\?p=K7Q2MX/.test(api.parrainageHTML()), "le lien s'affiche : " + api.lienParrainage("K7Q2MX"));
  av = SRV.parrainAppels;
  ok((await api.parrainageRafraichit()) === false && SRV.parrainAppels === av, "relu moins d'une minute après : pas de requête");
  await api.parrainageRafraichit(true);
  ok(SRV.codes[api.compteLit().uid] === "K7Q2MX" && SRV.tirages[0] === "K7Q2MX", "le code reste le même ensuite");
  ok(lsDe(vin).par[api.compteLit().uid].vu === 0, "le premier passage n'annonce rien (vu = 0 filleul)");

  /* ===== C/D) le filleul ===== */
  console.log("C) L'inscription du filleul, D) la confirmation");
  SRV.confirmer = true;
  api = sur(ami);
  const r = await api.compteInscription("ami@ex.fr", "secret2");
  ok(r.ok && r.confirmer, "inscription en attente de confirmation");
  ok(SRV.inscriptions[1].data && SRV.inscriptions[1].data.parrain === "K7Q2MX", "le code part dans data.parrain");
  ok(!(lsDe(ami) || {}).recu && api.codeRecu() === null, "le code s'efface du navigateur de l'ami");
  ok(Object.keys(SRV.parrainages).length === 0, "adresse pas confirmée : pas de parrainage");
  confirme("ami@ex.fr");
  ok(SRV.parrainages[SRV.parEmail["ami@ex.fr"]] === SRV.parEmail["vincent@ex.fr"], "adresse confirmée : le parrainage est inscrit");

  /* ===== E) les points ===== */
  console.log("E) Les points du parrain");
  api = sur(vin);
  const avant = api.soldePoints();
  ok(await api.parrainageRafraichit(true), "la relecture voit le nouveau filleul");
  ok(api.pointsParrainage() === api.PARRAIN_PTS && api.soldePoints() === avant + 500, "+500 au solde (" + avant + " → " + api.soldePoints() + ")");
  ok(api.MSG_JOURNAL.some((m) => /Un ami a rejoint Multiplex grâce à toi. \+500 ⭐/.test(m)), "le nouveau filleul est annoncé");
  ok(lsDe(vin).par[api.compteLit().uid].vu === 1 && api.parrainageAnnonce() === false, "annoncé une seule fois");
  ok(/1 \/ 3 · encore 2 amis pour/.test(api.parrainageHTML()), "« 1 / 3 · encore 2 amis » sous la grille");
  // le plafond
  const uidV = api.compteLit().uid;
  for (let i = 0; i < 30; i++) SRV.parrainages["faux" + i] = uidV;
  await api.parrainageRafraichit(true);
  ok(api.pointsParrainage() === api.PARRAIN_MAX * api.PARRAIN_PTS + 23000, "31 filleuls : plafonné à " + api.PARRAIN_MAX + " × 500 + 23 000 de primes = " + api.pointsParrainage());
  ok(api.multParrain() === 3 && /Stade plein/.test(api.parrainageHTML()), "au dernier palier : défis ×3, « Stade plein »");

  /* ===== H) la grille ===== */
  console.log("H) La grille des paliers (v3.24)");
  const grille = [[0,1,0,null],[1,1,0,"Premier supporter"],[2,1,0,"Premier supporter"],[3,1.25,1000,"Le comptoir"],[4,1.25,1000,"Le comptoir"],[5,1.5,3000,"Le kop"],[9,1.5,3000,"Le kop"],[10,2,8000,"La tribune"],[19,2,8000,"La tribune"],[20,3,23000,"Le stade plein"]];
  for (const [n, m, pr, nom] of grille) {
    const p = api.palierParrain(n);
    ok(api.multParrain(n) === m && api.primesParrain(n) === pr && (p ? p.nom : null) === nom, n + " ami(s) : ×" + m + ", primes " + pr + ", palier " + nom);
  }
  ok(api.palierSuivant(4).n === 5 && api.palierSuivant(20) === null, "le prochain palier après 4 est 5, rien après 20");
  // le multiplicateur s'applique aux points de défis, recalculés
  const pd = api.pointsDefis();
  ok(api.bonusDefisParrain() === Math.round(pd * 2) && api.pointsGagnes() === pd * 3 + api.pointsParrainage(), "défis " + pd + " ×3 dans les points gagnés");
  // l'annonce dit le palier franchi : de 1 à 5 amis
  for (let i = 0; i < 30; i++) delete SRV.parrainages["faux" + i];
  await api.parrainageRafraichit(true);
  ok(api.multParrain() === 1, "retour à 1 ami : ×1");
  for (let i = 0; i < 4; i++) SRV.parrainages["kop" + i] = uidV;
  await api.parrainageRafraichit(true);
  const der = api.MSG_JOURNAL[api.MSG_JOURNAL.length - 1] || "", net = der.replace(/[\s  ]/g, "");
  ok(/4amisontrejointMultiplexgrâceàtoi\.\+5000⭐/.test(net), "4 amis de plus : 2 000 + 1 000 + 2 000 de primes annoncés (« " + der.split("\n")[0] + " »)");
  ok(/LE KOP : points des défis ×1,5/.test(der), "le palier du kop est annoncé");
  for (let i = 0; i < 4; i++) delete SRV.parrainages["kop" + i];
  await api.parrainageRafraichit(true);

  /* ===== I) les seuils de la fenêtre ===== */
  console.log("I) La fenêtre d'invitation : ses seuils");
  const seuils = [[0,0],[7,0],[8,8],[24,8],[25,25],[59,25],[60,60],[109,60],[110,110],[160,160],[175,160]];
  for (const [mj, s] of seuils) ok(api.parrainSeuilAtteint(mj) === s, mj + " matchs : seuil " + s);
  for (let i = 0; i < 30; i++) delete SRV.parrainages["faux" + i];
  await api.parrainageRafraichit(true);
  // déconnecté : les points restent ceux du dernier compte connecté (comme la progression)
  await api.compteDeconnexion();
  ok(api.pointsParrainage() === 500, "déconnecté, le navigateur garde les points du dernier compte");

  /* ===== F) les refus ===== */
  console.log("F) Les refus");
  SRV.confirmer = false;
  // son propre code
  api = sur(vin);
  await api.compteConnexion("vincent@ex.fr", "secret1");
  api.parrainageDepuisAdresse("?p=K7Q2MX");
  ok(!(lsDe(vin) || {}).recu, "son propre lien (connecté) ne se range pas");
  const soi = appareil("soi"); api = sur(soi); allume(api);
  // un code inconnu
  api.parrainageDepuisAdresse("?p=AAAAAA");
  await api.compteInscription("inconnu@ex.fr", "secret3");
  ok(!SRV.parrainages[SRV.parEmail["inconnu@ex.fr"]], "code inconnu : rien, et l'inscription passe");
  // un code trop vieux
  const vieux = appareil("vieux"); api = sur(vieux); allume(api);
  vieux.ls.setItem("d1manager_parrainage_v1", JSON.stringify({ recu: { code: "K7Q2MX", t: Date.now() - 31 * 864e5 } }));
  ok(api.codeRecu() === null, "un code reçu il y a 31 jours ne compte plus");
  await api.compteInscription("vieux@ex.fr", "secret4");
  ok(!SRV.inscriptions[SRV.inscriptions.length - 1].data, "il ne part pas avec l'inscription");
  // un compte qui a déjà un parrain
  const filleul = SRV.parEmail["ami@ex.fr"];
  SRV.users[filleul].meta.parrain = "K7Q2MX"; declencheur(filleul);
  ok(Object.values(SRV.parrainages).filter((p) => p === SRV.parEmail["vincent@ex.fr"]).length === 1, "un filleul ne compte qu'une fois");
  // se parrainer soi-même côté serveur
  SRV.users[SRV.parEmail["vincent@ex.fr"]].meta = { parrain: "K7Q2MX" }; declencheur(SRV.parEmail["vincent@ex.fr"]);
  ok(!SRV.parrainages[SRV.parEmail["vincent@ex.fr"]], "on ne se parraine pas soi-même");

  console.log(FAILS ? `\n❌ HARNAIS PARRAINAGE : ${FAILS} ÉCHEC(S)` : "\n✅ HARNAIS PARRAINAGE : TOUT EST VERT");
  process.exit(FAILS ? 1 : 0);
})();
