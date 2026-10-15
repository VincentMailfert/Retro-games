/* Harnais headless — LE COMPTE JOUEUR ET LA COPIE EN LIGNE DES CARRIÈRES
   Le jeu parle à Supabase par fetch : ici, fetch est remplacé par un FAUX SERVEUR en mémoire qui imite
   la connexion (/auth/v1) et la base (/rest/v1, dont la fonction pousse_carriere). Aucun réseau réel.
   Chaque « appareil » a son propre localStorage et sa propre instance du jeu ; ils partagent le serveur.
   A) invité : aucune requête, aucune écriture de plus, le jeu d'avant
   B) la compression : aller-retour exact, neuf fois moins lourd, repli sans CompressionStream, paquet corrompu
   C) invité puis compte : les carrières du navigateur partent en ligne, l'adoptée reçoit un vrai identifiant
   D) hors connexion puis retour : rien ne se perd, même après un rechargement de la page
   E) le rythme : deux minutes entre deux envois de fin de journée, tout de suite en quittant
   F) deux appareils en conflit : la plus avancée garde sa place, l'autre continue à part, rien n'est détruit
   G) serveur qui refuse : étagère pleine, panne, jeton expiré, session révoquée
   H) ce qui revient du serveur passe par assainit() et migre(), comme un import
   I) un match en cours ne part jamais en ligne
   J) un navigateur partagé : les carrières d'un compte ne partent pas sur un autre
   K) suppression du compte
   L) le retour d'un lien reçu par email (confirmation, mot de passe oublié), lu sans requête
   M) le nouvel appareil : les carrières en ligne dans la liste, rapatriées à l'ouverture, le navigateur qui ne
      garde que les quatre plus récentes (sans jamais retirer une carrière pas encore en ligne), la suppression
   Usage : node harness-compte.cjs                                                           */
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
  panne: false,      // plus de réseau : fetch lève, comme un navigateur hors ligne
  force: null,       // un statut HTTP imposé aux appels de la base (500, 413…)
  confirmer: false,  // l'adresse doit-elle être confirmée par email avant la première connexion ?
  appels: 0, pousses: 0, n: 0,
};
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
    SRV.users[id] = { id, email: corps.email, mdp: corps.password, confirme: !SRV.confirmer };
    SRV.parEmail[corps.email] = id;
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
  if (p === "/rest/v1/rpc/supprime_mon_compte") {
    SRV.lignes = SRV.lignes.filter((l) => l.uid !== uid);
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
  /* ===== A) invité ===== */
  console.log("A) Invité : le jeu d'avant, sans une requête");
  const A = appareil("salon");
  let api = sur(A);
  ok(/^https:\/\/\w+\.supabase\.co$/.test(api.NUAGE.url) && /^sb_publishable_/.test(api.NUAGE.cle), "le jeu porte l'adresse du projet et sa clé PUBLIQUE, jamais une clé secrète");
  ok(!/sb_secret_|service_role/.test(html), "aucune clé secrète dans le fichier");
  api.NUAGE.url = ""; api.NUAGE.cle = ""; // d'abord, le nuage éteint
  api.nouvellePartie(api.CLUBS[0].id);
  ok(joue(api, 4), "la sauvegarde locale marche comme avant");
  const clesAvant = Object.keys(A.ls._m).sort().join("|");
  await api.nuageSynchronise(); api.nuagePlanifie("journee"); api.nuagePlanifie("quitte");
  ok(SRV.appels === 0, "aucune requête réseau sans projet configuré");
  allume(api);
  await api.nuageSynchronise(); api.nuagePlanifie("quitte");
  ok(SRV.appels === 0, "aucune requête non plus avec le projet configuré, tant qu'on n'a pas de compte");
  ok(Object.keys(A.ls._m).sort().join("|") === clesAvant, "aucune clé de plus dans le navigateur (ni session, ni état de synchro)");
  ok(api.getEtat() === "aucun", "l'état du nuage est « aucun » : l'indicateur ne s'affichera pas");

  /* ===== B) la compression ===== */
  console.log("\nB) La compression");
  const brut = A.ls.getItem(api.getPARTIE().k);
  const paquet = await api.nuageCompresse(brut);
  ok(paquet.slice(0, 3) === "gz:", "le paquet est compressé en gzip");
  ok(await api.nuageDecompresse(paquet) === brut, "aller-retour exact, caractère pour caractère");
  const ratio = brut.length / paquet.length;
  ok(ratio > 5, `${(brut.length / 1024).toFixed(0)} Ko deviennent ${(paquet.length / 1024).toFixed(0)} Ko une fois compressés et encodés (÷${ratio.toFixed(1)})`);
  ok(zlib.gunzipSync(Buffer.from(paquet.slice(3), "base64")).toString("utf8") === brut, "c'est du vrai gzip, lisible par n'importe quel outil");
  const CS = global.CompressionStream; delete global.CompressionStream;
  const repli = await api.nuageCompresse(brut);
  global.CompressionStream = CS;
  ok(repli.slice(0, 3) === "js:" && await api.nuageDecompresse(repli) === brut, "sans CompressionStream (vieux navigateur), le texte part brut et revient intact");
  let leve = false; try { await api.nuageDecompresse("gz:Y2VjaSBuJ2VzdCBwYXMgZHUgZ3ppcA=="); } catch (e) { leve = true; }
  ok(leve, "un paquet corrompu lève au lieu de rendre n'importe quoi");
  leve = false; try { await api.nuageDecompresse("<script>"); } catch (e) { leve = true; }
  ok(leve, "un paquet d'un format inconnu lève aussi");

  /* ===== C) invité puis compte ===== */
  console.log("\nC) Invité puis compte : les carrières du navigateur partent en ligne");
  // une carrière d'avant le multi-parties, sous la clé historique : elle sera ADOPTÉE par l'index
  api.nouvellePartie(api.CLUBS[3].id);
  for (let i = 0; i < 2; i++) api.jouerJournee();
  const vieille = JSON.parse(JSON.stringify(api.getG())); delete vieille.pid; vieille._maj = Date.now() - 86400000;
  A.ls.setItem(api.SAVEKEY, JSON.stringify(vieille));
  let liste = api.partiesListe();
  ok(liste.length === 2 && liste.some((e) => /^adopt_/.test(e.id)), "deux carrières dans le navigateur, dont une adoptée de l'ancienne clé");
  SRV.confirmer = true;
  let r = await api.compteInscription("vincent@exemple.fr", "12345");
  ok(!r.ok && r.code === "weak_password", "un mot de passe trop court est refusé, avec son motif");
  r = await api.compteInscription("vincent@exemple.fr", "motdepasse");
  ok(r.ok && r.confirmer && !api.compteLit(), "avec confirmation par email : compte créé, mais pas encore de session");
  r = await api.compteConnexion("vincent@exemple.fr", "motdepasse");
  ok(!r.ok && r.code === "email_not_confirmed", "la connexion attend le clic dans l'email");
  SRV.users[SRV.parEmail["vincent@exemple.fr"]].confirme = true; // le joueur a cliqué le lien
  r = await api.compteConnexion("vincent@exemple.fr", "mauvais");
  ok(!r.ok && r.code === "invalid_credentials", "un mauvais mot de passe est refusé");
  r = await api.compteConnexion("vincent@exemple.fr", "motdepasse");
  ok(r.ok && api.compteLit() && api.compteLit().email === "vincent@exemple.fr", "connecté : la session est gardée dans le navigateur");
  r = await api.compteInscription("vincent@exemple.fr", "autrechose");
  ok(!r.ok && r.code === "user_already_exists", "on ne crée pas deux fois le même compte");
  ok((await api.compteOubli("vincent@exemple.fr")).ok, "mot de passe oublié : la demande part");
  SRV.confirmer = false;
  await api.nuageSynchronise();
  ok(api.getEtat() === "ok", "état : sauvegardé en ligne");
  const miennes = lignesDe("vincent@exemple.fr");
  ok(miennes.length === 2, `les deux carrières sont en ligne (${miennes.length})`);
  ok(miennes.every((l) => !/^adopt_/.test(l.id)), "l'adoptée a reçu un vrai identifiant avant de partir (« adopt_… » serait le même sur deux appareils)");
  liste = api.partiesListe();
  const adoptee = liste.find((e) => e.k === api.SAVEKEY);
  ok(adoptee && !/^adopt_/.test(adoptee.id) && JSON.parse(A.ls.getItem(api.SAVEKEY)).pid === adoptee.id,
    "elle garde sa clé historique SAVEKEY ; l'index et la sauvegarde portent le nouvel identifiant");
  let exact = true;
  for (const e of liste) { const l = miennes.find((x) => x.id === e.id); if (!l || await api.nuageDecompresse(l.donnees) !== A.ls.getItem(e.k) || l.maj !== e.maj) exact = false; }
  ok(exact, "ce qui est en ligne est exactement ce qui dort dans le navigateur, date comprise");
  ok(miennes.every((l) => l.fiche && l.fiche.club && l.fiche.av > 0 && l.version), "chaque ligne porte sa carte d'identité (club, avancement, version du jeu)");
  let avant = SRV.pousses;
  await api.nuageSynchronise();
  ok(SRV.pousses === avant, "une seconde passe sans rien de neuf n'envoie rien");

  /* ===== D) hors connexion puis retour ===== */
  console.log("\nD) Hors connexion puis retour");
  reel(() => api.chargeLocale(liste[0].id));
  SRV.panne = true;
  ok(joue(api, 3), "hors connexion, on joue et la sauvegarde locale marche");
  const cleD = api.getPARTIE().k, idD = api.getPARTIE().id, majD = api.getG()._maj;
  await api.nuagePlanifie("quitte");
  ok(api.getEtat() === "attente", "état : en attente de connexion");
  ok(A.ls.getItem(cleD) && JSON.parse(A.ls.getItem(cleD))._maj === majD, "la sauvegarde locale est intacte");
  ok(api.compteLit(), "la session survit à la panne");
  // la page est rechargée pendant la panne : une nouvelle instance du jeu, le même navigateur
  const A2 = appareil("salon, rechargé", A.ls); api = sur(A2); allume(api);
  await api.nuageSynchronise();
  ok(api.getEtat() === "attente", "après rechargement, toujours en attente (et rien n'a planté)");
  SRV.panne = false;
  await api.nuagePlanifie("reseau");
  ok(api.getEtat() === "ok", "le réseau revient : état sauvegardé en ligne");
  const lD = SRV.lignes.find((l) => l.id === idD);
  ok(lD && lD.maj === majD, "la carrière jouée hors connexion est arrivée en ligne, à sa dernière journée");

  /* ===== E) le rythme ===== */
  console.log("\nE) Le rythme des envois");
  reel(() => api.chargeLocale(idD));
  joue(api, 1); api.setDernier(Date.now());
  avant = SRV.pousses;
  ok(api.nuagePlanifie("journee") === null && SRV.pousses === avant, "fin de journée moins de deux minutes après un envoi : on attend");
  api.setDernier(Date.now() - 121000);
  await api.nuagePlanifie("journee");
  ok(SRV.pousses === avant + 1, "deux minutes plus tard, la fin de journée envoie");
  joue(api, 1);
  await api.nuagePlanifie("cache");
  ok(SRV.pousses === avant + 2, "l'onglet passe en arrière-plan : envoi immédiat");
  joue(api, 1);
  await api.nuagePlanifie("quitte");
  ok(SRV.pousses === avant + 3, "on quitte la carrière : envoi immédiat");
  // deux demandes pendant une passe : la seconde n'est pas perdue
  joue(api, 1);
  const p1 = api.nuageSynchronise();
  joue(api, 1); const majE = api.getG()._maj;
  const p2 = api.nuageSynchronise();
  await p1; await p2;
  ok(SRV.lignes.find((l) => l.id === idD).maj === majD || SRV.lignes.find((l) => l.id === idD).maj === majE, "passe en cours : pas d'envoi en double");
  await api.nuageSynchronise();
  ok(SRV.lignes.find((l) => l.id === idD).maj === majE, "la sauvegarde faite pendant la passe finit par partir");

  /* ===== F) deux appareils en conflit ===== */
  console.log("\nF) Deux appareils en conflit");
  const B = appareil("téléphone"); let apiB = sur(B); allume(apiB);
  ok((await apiB.compteConnexion("vincent@exemple.fr", "motdepasse")).ok, "le téléphone se connecte au même compte");
  const enLigne = await apiB.nuageListe();
  ok(Array.isArray(enLigne) && enLigne.length === 2 && enLigne.every((l) => l.fiche && !("donnees" in l)), "il voit les deux carrières en ligne, sans télécharger leurs données");
  r = await apiB.nuageRapatrie(idD);
  ok(r.ok && apiB.partiesListe().some((e) => e.id === idD), "il rapatrie la carrière");
  ok(reel(() => apiB.chargeLocale(idD)) && apiB.getG().monClub, "et l'ouvre");
  joue(apiB, 2); const majB = apiB.getG()._maj, avB = apiB.avanceDe(apiB.getG());
  await apiB.nuageSynchronise();
  ok(SRV.lignes.find((l) => l.id === idD).maj === majB, "le téléphone joue deux journées et les envoie");
  // pendant ce temps, le salon (qui ne sait rien) joue cinq journées de la même carrière
  api = sur(A2);
  joue(api, 5); const majA = api.getG()._maj;
  ok(api.avanceDe(api.getG()) > avB, "le salon est allé plus loin");
  await api.nuageSynchronise();
  let lF = SRV.lignes.find((l) => l.id === idD);
  ok(lF.maj === majA, "conflit : la version du salon, plus avancée, garde sa place en ligne");
  let copie = lignesDe("vincent@exemple.fr").find((l) => l.maj === majB);
  ok(copie && copie.id !== idD && /\(autre version\)$/.test(copie.fiche.nom), "celle du téléphone n'est pas détruite : elle continue en ligne sous « … (autre version) »");
  ok(api.NUAGE_AVIS.some((t) => /autre appareil/.test(t)), "le joueur est prévenu");
  ok(api.getEtat() === "ok", "l'état reste « sauvegardé en ligne »");
  // le téléphone rejoue une journée depuis sa vieille version : il est maintenant en retard
  api = sur(B); apiB = api;
  r = await apiB.nuageRapatrie(idD);
  ok(!r.ok && r.code === "ouverte", "on ne rapatrie jamais sous la carrière ouverte (la partie en mémoire la réécrirait)");
  joue(apiB, 1);
  const Gouverte = apiB.getG(); apiB.setG(null);
  r = await apiB.nuageRapatrie(idD);
  apiB.setG(Gouverte);
  ok(!r.ok && r.code === "modifiee", "ni par-dessus des journées jamais envoyées");
  const majB2 = apiB.getG()._maj, nAvant = lignesDe("vincent@exemple.fr").length;
  await apiB.nuageSynchronise();
  lF = SRV.lignes.find((l) => l.id === idD);
  ok(lF.maj === majA, "conflit inverse : la version en ligne, plus avancée, garde sa place");
  const renommee = apiB.partiesListe().find((e) => e.maj === majB2);
  ok(renommee && renommee.id !== idD && /\(autre version\)$/.test(renommee.nom), "celle du téléphone continue à part, renommée « … (autre version) »");
  ok(apiB.getPARTIE().id === renommee.id && apiB.getG().pid === renommee.id, "la partie ouverte suit : les prochaines journées s'écrivent dans la bonne carrière");
  ok(lignesDe("vincent@exemple.fr").length === nAvant + 1 && SRV.lignes.some((l) => l.maj === majB2), "et elle part en ligne comme une carrière de plus");
  ok([majA, majB, majB2].every((m) => SRV.lignes.some((l) => l.maj === m)), "aucune des trois versions n'est perdue");

  /* ===== G) serveur qui refuse ===== */
  console.log("\nG) Le serveur refuse");
  api = sur(A2);
  const uidV = SRV.parEmail["vincent@exemple.fr"];
  while (lignesDe("vincent@exemple.fr").length < 10) SRV.lignes.push({ uid: uidV, id: "remplie" + SRV.lignes.length, maj: 1, fiche: { club: "X", av: 100 }, donnees: "js:{}" });
  api.nouvellePartie(api.CLUBS[5].id); joue(api, 1);
  const idG = api.getPARTIE().id;
  await api.nuageSynchronise();
  ok(api.getEtat() === "refus" && !SRV.lignes.some((l) => l.id === idG), "dix carrières en ligne : la onzième est refusée");
  ok(api.NUAGE_AVIS.some((t) => /10 carrières en ligne/.test(t)), "le joueur est prévenu qu'elle reste dans ce navigateur");
  ok(A.ls.getItem(api.getPARTIE().k), "elle reste sauvegardée localement");
  avant = SRV.pousses;
  await api.nuageSynchronise();
  ok(SRV.pousses === avant, "refusée telle quelle, elle n'est pas renvoyée en boucle");
  joue(api, 1); await api.nuageSynchronise();
  ok(SRV.pousses === avant + 1, "elle retente une fois qu'elle a changé");
  SRV.lignes = SRV.lignes.filter((l) => !/^remplie/.test(l.id));
  joue(api, 1); await api.nuageSynchronise();
  ok(SRV.lignes.some((l) => l.id === idG), "de la place s'est libérée : elle part");
  SRV.force = 500; joue(api, 1); await api.nuageSynchronise();
  ok(api.getEtat() === "attente", "serveur en panne (500) : en attente, pas en refus");
  SRV.force = null; await api.nuageSynchronise();
  ok(api.getEtat() === "ok", "il revient : tout part");
  // jeton d'accès expiré ou révoqué avant l'heure : on le renouvelle une fois et on réessaie
  const s0 = api.compteLit(); delete SRV.jetons[s0.at];
  joue(api, 1); await api.nuageSynchronise();
  ok(api.getEtat() === "ok" && api.compteLit().at !== s0.at, "jeton refusé : renouvelé en silence, l'envoi passe");
  // jeton arrivé à échéance : renouvelé AVANT l'appel
  const s1 = api.compteLit(); s1.exp = Date.now() - 1000; A.ls.setItem(api.COMPTEKEY, JSON.stringify(s1));
  joue(api, 1); await api.nuageSynchronise();
  ok(api.getEtat() === "ok" && api.compteLit().at !== s1.at, "jeton échu : renouvelé avant l'envoi");
  // session révoquée (mot de passe changé ailleurs) : on se retrouve invité, sans rien perdre
  const s2 = api.compteLit(); delete SRV.jetons[s2.at]; delete SRV.rafraich[s2.rt];
  joue(api, 1); await api.nuageSynchronise();
  ok(!api.compteLit() && api.getEtat() === "aucun", "session révoquée : déconnecté proprement, le jeu redevient invité");
  ok(reel(() => api.sauvegardeLocale(true)), "et la sauvegarde locale continue");
  ok((await api.compteConnexion("vincent@exemple.fr", "motdepasse")).ok, "on se reconnecte");
  await api.nuageSynchronise();
  ok(api.getEtat() === "ok", "et ce qui était resté en rade part");

  /* ===== H) ce qui revient du serveur ===== */
  console.log("\nH) Ce qui revient du serveur est assaini, puis migré à l'ouverture");
  const C = appareil("tablette"); let apiC = sur(C); allume(apiC);
  await apiC.compteConnexion("vincent@exemple.fr", "motdepasse");
  const piege = JSON.parse(A.ls.getItem(api.getPARTIE().k));
  piege.clubs[0].nom = "<img src=x onerror=alert(1)>Piégé";
  delete piege.records; delete piege.affJ; // champs d'une version plus récente : migre() doit les reposer
  SRV.lignes.push({ uid: uidV, id: "piege1", maj: 5, fiche: { club: "Piégé", av: 101 }, donnees: await apiC.nuageCompresse(JSON.stringify(piege)) });
  r = await apiC.nuageRapatrie("piege1");
  const relu = C.ls.getItem(apiC.PARTPFX + "piege1");
  ok(r.ok && relu && relu.indexOf("<img") < 0 && relu.indexOf("Piégé") >= 0, "les chevrons sont retirés avant d'écrire dans le navigateur");
  ok(reel(() => apiC.chargeLocale("piege1")) && apiC.getG().records && Array.isArray(apiC.getG().affJ), "à l'ouverture, migre() a reposé les champs manquants");
  SRV.lignes.push({ uid: uidV, id: "casse1", maj: 6, fiche: {}, donnees: "gz:AAAAAAAA" });
  SRV.lignes.push({ uid: uidV, id: "autre1", maj: 7, fiche: {}, donnees: await apiC.nuageCompresse(JSON.stringify({ bonjour: 1 })) });
  const clesC = Object.keys(C.ls._m).length;
  ok((await apiC.nuageRapatrie("casse1")).code === "illisible" && (await apiC.nuageRapatrie("autre1")).code === "illisible", "un paquet corrompu ou étranger est refusé");
  ok(Object.keys(C.ls._m).length === clesC, "et rien n'est écrit dans le navigateur");
  ok((await apiC.nuageRapatrie("inconnue")).code === "absente", "une carrière qui n'existe pas en ligne : « absente »");
  SRV.lignes = SRV.lignes.filter((l) => !["piege1", "casse1", "autre1"].includes(l.id));

  /* ===== I) un match en cours ===== */
  console.log("\nI) Un match en cours ne part jamais en ligne");
  api = sur(A2);
  joue(api, 1); await api.nuageSynchronise();
  const idI = api.getPARTIE().id, majI = api.getG()._maj;
  api.posePend({ faux: api.getG().clubs[0] });
  ok(reel(() => api.sauvegardeLocale(true)) === false, "match en cours : la sauvegarde locale refuse d'écrire");
  avant = SRV.pousses;
  await api.nuagePlanifie("cache");
  ok(SRV.pousses === avant && SRV.lignes.find((l) => l.id === idI).maj === majI, "et le nuage n'envoie rien : il ne lit que la sauvegarde locale");
  let pendEnLigne = false;
  for (const l of SRV.lignes) if (l.donnees.slice(0, 3) === "gz:" && (await api.nuageDecompresse(l.donnees)).indexOf('"_pend"') >= 0) pendEnLigne = true;
  ok(!pendEnLigne, "aucune sauvegarde en ligne ne porte de match en cours");
  api.posePend(null);

  /* ===== J) un navigateur partagé ===== */
  console.log("\nJ) Un navigateur partagé entre deux comptes");
  await api.compteDeconnexion();
  ok(!api.compteLit() && api.getEtat() === "aucun", "déconnexion : plus de session");
  ok(api.partiesListe().length > 0, "les carrières restent dans le navigateur");
  await api.compteInscription("soeur@exemple.fr", "motdepasse");
  api.nouvellePartie(api.CLUBS[7].id); joue(api, 1); const idSoeur = api.getPARTIE().id;
  await api.nuageSynchronise();
  const siennes = lignesDe("soeur@exemple.fr");
  ok(siennes.length === 1 && siennes[0].id === idSoeur, "le second compte n'emporte que sa carrière, pas celles du premier");
  ok(!(await api.nuageListe()).some((l) => l.id === idD), "et il ne voit pas celles du premier en ligne");
  await api.compteDeconnexion();
  await api.compteConnexion("vincent@exemple.fr", "motdepasse");
  await api.nuageSynchronise();
  ok(!lignesDe("vincent@exemple.fr").some((l) => l.id === idSoeur), "de retour sur le premier compte : la carrière de l'autre reste chez elle");

  /* ===== K) suppression du compte ===== */
  console.log("\nK) Suppression du compte");
  const locales = api.partiesListe().length;
  r = await api.compteSupprime();
  ok(r.ok && lignesDe("vincent@exemple.fr").length === 0 && !SRV.parEmail["vincent@exemple.fr"], "le compte et toutes ses carrières en ligne sont effacés");
  ok(!api.compteLit() && api.getEtat() === "aucun", "le navigateur est déconnecté");
  ok(api.partiesListe().length === locales, "les carrières du navigateur restent jouables");
  ok(!Object.values(api.nuageEtatLit()).some((x) => x && x.uid === uidV), "l'état de synchro oublie le compte supprimé");
  ok(!(await api.compteConnexion("vincent@exemple.fr", "motdepasse")).ok, "on ne peut plus s'y connecter");

  /* ===== L) le retour d'un lien reçu par email ===== */
  console.log("\nL) Le retour d'un lien reçu par email");
  const L = appareil("lien"); let apiL = sur(L); allume(apiL);
  await apiL.compteInscription("lien@exemple.fr", "motdepasse");
  const s0L = apiL.compteLit(); await apiL.compteDeconnexion();
  // le vrai jeton de Supabase est un JWT : l'identité du joueur est écrite dedans
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const uidL = SRV.parEmail["lien@exemple.fr"], sess = sessionPour(uidL);
  delete SRV.jetons[sess.access_token];
  const jwt = "xx." + b64({ sub: uidL, email: "lien@exemple.fr", nom: "Éloïse" }) + ".yy";
  SRV.jetons[jwt] = uidL;
  avant = SRV.appels;
  ok(apiL.compteDepuisLien("") === null && apiL.compteDepuisLien("#section-3") === null, "une adresse sans lien ne fait rien");
  r = apiL.compteDepuisLien("#access_token=" + jwt + "&expires_in=3600&refresh_token=" + sess.refresh_token + "&token_type=bearer&type=signup");
  ok(r && r.type === "signup" && apiL.compteLit() && apiL.compteLit().email === "lien@exemple.fr" && apiL.compteLit().uid === uidL,
    "lien de confirmation : connecté, l'identité lue dans le jeton (accents compris)");
  ok(SRV.appels === avant, "sans la moindre requête");
  ok(s0L && apiL.compteLit().at === jwt, "la session du lien remplace l'ancienne");
  r = apiL.compteDepuisLien("#access_token=" + jwt + "&refresh_token=" + sess.refresh_token + "&type=recovery");
  ok(r.type === "recovery", "lien « mot de passe oublié » : reconnu");
  ok(!(await apiL.compteNouveauMdp("123")).ok, "un nouveau mot de passe trop court est refusé");
  ok((await apiL.compteNouveauMdp("nouveau-mdp")).ok && SRV.users[uidL].mdp === "nouveau-mdp", "le nouveau mot de passe est enregistré");
  await apiL.compteDeconnexion();
  ok((await apiL.compteConnexion("lien@exemple.fr", "nouveau-mdp")).ok, "et il ouvre la session");
  r = apiL.compteDepuisLien("#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired");
  ok(r && r.erreur === "otp_expired" && /expiré/.test(apiL.texteErreur(r.erreur)), "lien périmé : le motif est dit en français");
  ok(apiL.compteDepuisLien("#access_token=pasunjwt&refresh_token=x").erreur === "jeton", "un jeton illisible est refusé");
  ok(!/—/.test(["invalid_credentials", "weak_password", "reseau", "otp_expired", "inconnu"].map(apiL.texteErreur).join(" ")), "aucun tiret long dans les messages");

  /* ===== M) le nouvel appareil, la place, la suppression ===== */
  console.log("\nM) Le nouvel appareil, le navigateur qui ne garde que les récentes, la suppression");
  const M = appareil("ordinateur"); let apiM = sur(M); allume(apiM);
  const ids = [];
  for (let c = 0; c < 4; c++) { apiM.nouvellePartie(apiM.CLUBS[c + 8].id); joue(apiM, 1 + c); ids.push(apiM.getPARTIE().id); }
  await apiM.compteInscription("marc@exemple.fr", "motdepasse");
  await apiM.nuageSynchronise();
  ok(lignesDe("marc@exemple.fr").length === 4, "quatre carrières, toutes en ligne");
  apiM.setG(null); // on est à l'accueil
  ok(apiM.placeDispo() && apiM.partiesListe().length === 3, "une cinquième carrière : la place se fait toute seule");
  ok(!apiM.partiesListe().some((e) => e.id === ids[0]) && lignesDe("marc@exemple.fr").some((l) => l.id === ids[0]), "c'est la plus ancienne qui quitte le navigateur, et elle reste en ligne");
  await apiM.nuageRafraichitListe();
  let aff = apiM.carrieresAffichees();
  ok(aff.length === 4 && aff.find((e) => e.id === ids[0]).enLigne && aff.filter((e) => e.enLigne).length === 1, "« Mes carrières » la montre quand même, marquée en ligne");
  apiM.nouvellePartie(apiM.CLUBS[14].id); joue(apiM, 1); const id5 = apiM.getPARTIE().id; apiM.setG(null);
  r = await apiM.nuagePrepare(ids[0]);
  ok(r.ok && apiM.partiesListe().some((e) => e.id === ids[0]) && apiM.partiesListe().length === 4, "l'ouvrir la rapatrie, en retirant la plus ancienne à jour en ligne");
  ok(apiM.partiesListe().some((e) => e.id === id5), "jamais celle qui n'est pas encore en ligne");
  ok(reel(() => apiM.chargeLocale(ids[0])) && apiM.getG().pid === ids[0], "et elle s'ouvre");
  // hors connexion, quatre carrières jamais envoyées : on ne retire rien
  SRV.panne = true;
  for (const e of apiM.partiesListe()) { reel(() => apiM.chargeLocale(e.id)); joue(apiM, 1); }
  apiM.setG(null);
  const avantMsg = apiM.MSG_JOURNAL.length;
  ok(!apiM.nuageEvincable() && !apiM.placeDispo() && apiM.partiesListe().length === 4, "hors connexion, quatre carrières pas encore envoyées : rien n'est retiré, la cinquième attend");
  ok(apiM.MSG_JOURNAL.length > avantMsg, "et le joueur est prévenu");
  const horsNav = lignesDe("marc@exemple.fr").map((l) => l.id).find((x) => !apiM.partiesListe().some((e) => e.id === x));
  ok((await apiM.nuagePrepare(horsNav)).code === "reseau" || !(await apiM.nuagePrepare(horsNav)).ok, "une carrière en ligne ne s'ouvre pas sans réseau ni place");
  SRV.panne = false; await apiM.nuageSynchronise();
  // la même carrière a avancé sur un autre appareil : la liste le montre, l'ouverture la rapatrie
  const N = appareil("portable"); let apiN = sur(N); allume(apiN);
  await apiN.compteConnexion("marc@exemple.fr", "motdepasse");
  await apiN.nuageRafraichitListe();
  ok(apiN.carrieresAffichees().length === 5 && apiN.carrieresAffichees().every((e) => e.enLigne), "le portable, tout neuf, voit les cinq carrières en ligne");
  const idX = sur(M).partiesListe()[0].id; apiN = sur(N);
  ok((await apiN.nuagePrepare(idX)).ok && reel(() => apiN.chargeLocale(idX)), "il en ouvre une");
  joue(apiN, 2); const majN = apiN.getG()._maj, jN = apiN.getG().journee; await apiN.nuageSynchronise();
  apiM = sur(M); apiM.setG(null);
  await apiM.nuageRafraichitListe();
  const vue = apiM.carrieresAffichees().find((e) => e.id === idX);
  ok(vue.ailleurs && vue.journee === jN + 1 && vue.maj === majN, "l'ordinateur la montre à la journée jouée sur le portable");
  ok((await apiM.nuagePrepare(idX)).ok && JSON.parse(M.ls.getItem(apiM.partiesListe().find((e) => e.id === idX).k))._maj === majN, "et l'ouvre à ce point-là, sans conflit");
  // la suppression
  const idS = apiM.partiesListe()[1].id;
  apiM.supprimePartie(idS); await apiM.nuageSynchronise();
  ok(!apiM.partiesListe().some((e) => e.id === idS) && !lignesDe("marc@exemple.fr").some((l) => l.id === idS), "supprimer une carrière (connecté) l'efface du navigateur ET en ligne");
  SRV.panne = true;
  const idS2 = apiM.partiesListe()[1].id;
  apiM.supprimePartie(idS2); await apiM.nuageSynchronise();
  ok(!apiM.partiesListe().some((e) => e.id === idS2) && lignesDe("marc@exemple.fr").some((l) => l.id === idS2) && apiM.getEtat() === "attente", "hors connexion : effacée du navigateur, la suppression en ligne attend");
  const A3 = appareil("ordinateur, rechargé", M.ls); apiM = sur(A3); allume(apiM);
  SRV.panne = false; await apiM.nuageSynchronise();
  ok(!lignesDe("marc@exemple.fr").some((l) => l.id === idS2) && !apiM.nuageEtatLit()._suppr, "même après un rechargement, elle part au retour du réseau");
  await apiM.nuageRafraichitListe(); apiM.setG(null);
  const seule = apiM.carrieresAffichees().find((e) => e.enLigne);
  ok(seule, "il reste une carrière qui ne vit qu'en ligne");
  apiM.supprimePartie(seule.id); await apiM.nuageSynchronise();
  ok(!lignesDe("marc@exemple.fr").some((l) => l.id === seule.id) && !apiM.carrieresAffichees().some((e) => e.id === seule.id), "on peut la supprimer depuis la liste, sans la rapatrier");
  // un invité qui supprime : rien ne part (il n'y a rien en ligne)
  const I = appareil("invité"); let apiI = sur(I); allume(apiI);
  apiI.nouvellePartie(apiI.CLUBS[1].id); joue(apiI, 1); const avI = SRV.appels;
  apiI.supprimePartie(apiI.getPARTIE().id); await apiI.nuageSynchronise();
  ok(SRV.appels === avI && apiI.partiesListe().length === 0, "un invité qui supprime : zéro requête");

  console.log(FAILS ? `\n❌ ${FAILS} test(s) en échec` : "\n✅ HARNAIS COMPTE : TOUT EST VERT");
  process.exit(FAILS ? 1 : 0);
})().catch((e) => { console.error("\n💥 " + (e && e.stack || e)); process.exit(1); });
