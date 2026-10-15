/* ESSAI RÉEL — le moteur du jeu contre le VRAI projet Supabase « multiplex » (pas un faux serveur).
   À rejouer à la main quand on touche à schema.sql ou au module « La copie en ligne des carrières ».
   Il lui faut deux comptes d'essai déjà confirmés. Les créer dans le SQL Editor (ou via le connecteur) :
     create extension if not exists pgcrypto with schema extensions;
     insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token,email_change_token_new,email_change)
     values ('00000000-0000-0000-0000-000000000000','11111111-1111-1111-1111-111111111111','authenticated','authenticated','essai-a@multiplex.test',extensions.crypt('motdepasse-a',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','',''),
            ('00000000-0000-0000-0000-000000000000','22222222-2222-2222-2222-222222222222','authenticated','authenticated','essai-b@multiplex.test',extensions.crypt('motdepasse-b',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','');
     (plus une ligne par compte dans auth.identities, provider 'email', provider_id = id)
   ET LES SUPPRIMER APRÈS : delete from auth.users where email like '%@multiplex.test';
   Leurs mots de passe sont écrits ici, dans un dépôt public : ils ne doivent pas survivre à l'essai.
   Usage : node supabase/essai-reel.cjs                                                          */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
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

const URL_SB = "https://hemedkhebhllymdgvuka.supabase.co", CLE = "sb_publishable_0wPT6Ao-wVGsS9HSASveSg_XCS07vEB";
const epilogue = "\n;return {nouvellePartie,jouerJournee,sauvegardeLocale,chargeLocale,partiesListe,NUAGE,NUAGE_AVIS," +
  "compteConnexion,compteDeconnexion,compteSupprime,compteLit,nuageSynchronise,nuageListe,nuageRapatrie,nuageDecompresse,CLUBS," +
  "getG:function(){return G;},setG:function(x){G=x;},getPARTIE:function(){return PARTIE;},getEtat:function(){return NUAGE_ETAT;}};";
function appareil(ls) { const d = { ls: ls || nouveauLS() }; global.localStorage = d.ls; global.window.localStorage = d.ls; d.api = new Function(script + epilogue)(); d.api.NUAGE.url = URL_SB; d.api.NUAGE.cle = CLE; return d; }
function sur(d) { global.localStorage = d.ls; global.window.localStorage = d.ls; return d.api; }
function reel(fn) { global.window.__TEST__ = false; try { return fn(); } finally { global.window.__TEST__ = true; } }
function joue(api, n) { for (let i = 0; i < n; i++) api.jouerJournee(); return reel(() => api.sauvegardeLocale(true)); }
let FAILS = 0; const ok = (c, m) => { if (c) console.log("  ✓ " + m); else { console.error("  ✗ " + m); FAILS++; } };
const brut = async (chemin, init) => { const r = await fetch(URL_SB + chemin, init); const t = await r.text(); return { st: r.status, t }; };
(async () => {
  console.log("Essai contre le VRAI serveur multiplex");
  const A = appareil(); let a = sur(A);
  ok((await a.compteConnexion("essai-a@multiplex.test", "mauvais")).code === "invalid_credentials", "mauvais mot de passe refusé (motif lu correctement)");
  ok((await a.compteConnexion("essai-a@multiplex.test", "motdepasse-a")).ok, "connexion du compte A");
  a.nouvellePartie(a.CLUBS[0].id); joue(a, 3);
  const idA = a.getPARTIE().id;
  const t0 = Date.now(); await a.nuageSynchronise();
  ok(a.getEtat() === "ok", `envoi réel d'une carrière (${Date.now() - t0} ms)`);
  let l = await a.nuageListe();
  ok(l && l.length === 1 && l[0].id === idA && l[0].fiche.club && !("donnees" in l[0]), "la liste revient, sans les données");
  const B = appareil(); let b = sur(B);
  ok((await b.compteConnexion("essai-b@multiplex.test", "motdepasse-b")).ok, "connexion du compte B");
  ok((await b.nuageListe()).length === 0, "B ne voit AUCUNE carrière de A");
  ok((await b.nuageRapatrie(idA)).code === "absente", "B ne peut pas rapatrier la carrière de A, même avec son identifiant");
  const jb = b.compteLit().at;
  let r = await brut("/rest/v1/carrieres", { method: "POST", headers: { apikey: CLE, Authorization: "Bearer " + jb, "Content-Type": "application/json" }, body: JSON.stringify({ id: "pirate", donnees: "js:{}", user_id: "11111111-1111-1111-1111-111111111111" }) });
  ok(r.st === 401 || r.st === 403, `écriture directe dans la table refusée (${r.st})`);
  r = await brut("/rest/v1/carrieres?id=eq." + idA, { method: "DELETE", headers: { apikey: CLE, Authorization: "Bearer " + jb, Prefer: "return=representation" } });
  ok(r.st < 300 && r.t === "[]", "B ne peut pas effacer la carrière de A (zéro ligne touchée)");
  r = await brut("/rest/v1/carrieres?select=id", { headers: { apikey: CLE } });
  ok(r.st === 401 || r.t === "[]", `sans connexion, rien à lire (${r.st} ${r.t.slice(0, 40)})`);
  r = await brut("/rest/v1/rpc/pousse_carriere", { method: "POST", headers: { apikey: CLE, "Content-Type": "application/json" }, body: JSON.stringify({ p_id: "x", p_attendu: 0, p_maj: 1, p_fiche: {}, p_donnees: "js:{}" }) });
  ok(r.st === 401 || r.st === 403, `sans connexion, pas d'envoi (${r.st})`);
  r = await brut("/rest/v1/rpc/supprime_mon_compte", { method: "POST", headers: { apikey: CLE, "Content-Type": "application/json" }, body: "{}" });
  ok(r.st === 401 || r.st === 403, `sans connexion, pas de suppression de compte (${r.st})`);
  // B envoie une carrière portant le MÊME identifiant que celle de A : elle ne doit pas l'écraser
  b.nouvellePartie(b.CLUBS[4].id); b.getG().pid = idA; b.getPARTIE().id = idA; joue(b, 1);
  await b.nuageSynchronise();
  a = sur(A); const donneesA = await a.nuageRapatrie(idA);
  l = await a.nuageListe();
  ok(l.length === 1 && l[0].fiche.clubId === a.CLUBS[0].id, "un identifiant identique chez B n'écrase jamais la carrière de A");
  // conflit réel : un second appareil de A
  const A2 = appareil(); let a2 = sur(A2);
  await a2.compteConnexion("essai-a@multiplex.test", "motdepasse-a");
  ok((await a2.nuageRapatrie(idA)).ok && reel(() => a2.chargeLocale(idA)), "second appareil de A : rapatrie et ouvre");
  joue(a2, 1); await a2.nuageSynchronise();
  a = sur(A); joue(a, 4); await a.nuageSynchronise();
  l = await a.nuageListe();
  ok(l.length === 2 && l.some((x) => /\(autre version\)/.test(x.fiche.nom || "")), "conflit réel : la plus avancée garde sa place, l'autre continue à part");
  // taille réelle en ligne
  r = await brut("/rest/v1/carrieres?select=id,donnees&id=eq." + idA, { headers: { apikey: CLE, Authorization: "Bearer " + a.compteLit().at } });
  ok(r.st === 200, `une carrière pèse ${(r.t.length / 1024).toFixed(0)} Ko en ligne`);
  // suppression du compte B
  b = sur(B);
  ok((await b.compteSupprime()).ok, "B supprime son compte depuis le jeu");
  ok(!(await b.compteConnexion("essai-b@multiplex.test", "motdepasse-b")).ok, "B ne peut plus se connecter");
  console.log(FAILS ? `\n❌ ${FAILS} échec(s)` : "\n✅ ESSAI RÉEL : TOUT EST VERT");
  process.exit(FAILS ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
