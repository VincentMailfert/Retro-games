/* ESSAI AU NAVIGATEUR — les déclencheurs de la copie en ligne et l'indicateur du pied de page, dans un vrai
   Chromium, contre un faux Supabase (page.route) : rien ne part vers le vrai serveur.
   Il faut Playwright, qui n'est PAS une dépendance du dépôt : l'installer dans un dossier à part
   (npm i playwright), puis lancer depuis ce dossier :  node <chemin>/championnat/supabase/essai-navigateur.cjs
   Vérifie : invité muet, connexion qui envoie les carrières de l'invité, onglet caché, réseau coupé puis revenu,
   fin de journée au plus toutes les deux minutes, départ de la carrière, rechargement d'un joueur connecté. */
const path = require("path");
const { chromium } = require("playwright");
const URL = require("url").pathToFileURL(path.join(__dirname, "..", "index.html")).href;
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const JWT = "xx." + b64({ sub: "u-essai", email: "vincent@exemple.fr" }) + ".yy";
let F = 0; const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) F++; };
(async () => {
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const erreurs = []; page.on("pageerror", (e) => erreurs.push(e.message));
  let coupe = false, pousses = [], demarrage = [];
  await page.route("https://hemedkhebhllymdgvuka.supabase.co/**", async (route) => {
    const u = route.request().url();
    if (coupe) return route.abort("internetdisconnected");
    if (/grant_type=password/.test(u)) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ access_token: JWT, refresh_token: "rt", expires_in: 3600, user: { id: "u-essai", email: "vincent@exemple.fr" } }) });
    if (/pousse_carriere/.test(u)) { pousses.push(JSON.parse(route.request().postData()).p_id); return route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }); }
    return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
  await page.goto(URL); await page.waitForTimeout(300);
  // une carrière jouée en invité, puis connexion : elle part
  await page.evaluate(() => { nouvellePartie(CLUBS[2].id); montre("calendrier"); });
  await page.waitForTimeout(200);
  ok((await page.textContent("#bCompte")).trim() === "☁️ Compte", "invité : le bouton dit « ☁️ Compte », aucun envoi (" + pousses.length + ")");
  await page.click("#bCompte"); await page.fill("#cEmail", "vincent@exemple.fr"); await page.fill("#cMdp", "motdepasse"); await page.click("#cGo");
  await page.waitForTimeout(800);
  ok(pousses.length === 1, "connexion : la carrière de l'invité part en ligne (" + pousses.length + ")");
  ok((await page.textContent("#bCompte")).trim() === "☁️ Sauvegardé en ligne", "indicateur : « " + (await page.textContent("#bCompte")).trim() + " »");
  // l'onglet passe en arrière-plan après un changement
  await page.evaluate(() => { G.tresorerie += 1; });
  await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await page.waitForTimeout(600);
  ok(pousses.length === 2, "onglet caché : sauvegarde + envoi immédiat (" + pousses.length + ")");
  await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true }); });
  // coupure de réseau
  coupe = true;
  await page.evaluate(() => { G.tresorerie += 1; });
  await page.evaluate(() => { document.dispatchEvent(new Event("visibilitychange")); Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await page.waitForTimeout(800);
  ok((await page.textContent("#bCompte")).trim() === "☁️ En attente de connexion", "réseau coupé : « " + (await page.textContent("#bCompte")).trim() + " »");
  await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true }); });
  coupe = false;
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await page.waitForTimeout(800);
  ok(pousses.length === 3 && (await page.textContent("#bCompte")).trim() === "☁️ Sauvegardé en ligne", "le réseau revient : envoi, et « Sauvegardé en ligne » (" + pousses.length + ")");
  // fin de journée : au plus un envoi toutes les deux minutes
  const avantJ = pousses.length;
  const j0 = await page.evaluate(() => { window._diffEnDirect = false; NUAGE_DERNIER = Date.now(); const j = G.journee; jouerJournee(); if (G._pend) abandonneDirect(); videMessage(); return j; });
  await page.waitForTimeout(500);
  ok(await page.evaluate(() => G.journee) === j0 + 1 && pousses.length === avantJ, "une journée jouée moins de deux minutes après un envoi : sauvée en local, pas encore envoyée (" + (pousses.length - avantJ) + ")");
  await page.evaluate(() => { NUAGE_DERNIER = Date.now() - 121000; jouerJournee(); if (G._pend) abandonneDirect(); videMessage(); });
  await page.waitForTimeout(700);
  ok(pousses.length === avantJ + 1, "la suivante, deux minutes plus tard : envoyée en fin de journée (" + (pousses.length - avantJ) + ")");
  // quitter la carrière
  await page.evaluate(() => { G.tresorerie += 1; });
  await page.click("#bMenu"); await page.waitForTimeout(600);
  ok(pousses.length === avantJ + 2, "« Mes carrières » : la carrière part en quittant (" + pousses.length + ")");
  // rechargement : un joueur connecté envoie ce qui attendait
  await page.evaluate(() => { const l = JSON.parse(localStorage.getItem("d1manager_parties_v1")); const k = l[0].k; const o = JSON.parse(localStorage.getItem(k)); o._maj = Date.now(); localStorage.setItem(k, JSON.stringify(o)); l[0].maj = o._maj; localStorage.setItem("d1manager_parties_v1", JSON.stringify(l)); });
  await page.reload(); await page.waitForTimeout(2500);
  ok(pousses.length === avantJ + 3, "rechargement d'un joueur connecté : ce qui attendait part (" + pousses.length + ")");
  // un invité, lui, ne fait rien au démarrage
  const ctx2 = await br.newContext(); const p2 = await ctx2.newPage(); let req2 = 0;
  p2.on("request", (r) => { if (/supabase/.test(r.url())) req2++; });
  await p2.goto(URL); await p2.waitForTimeout(2500);
  ok(req2 === 0, "un invité : zéro requête au démarrage (" + req2 + ")");
  await 
  ok(!erreurs.length, "aucune erreur JS " + erreurs.join(" | "));
  console.log(F ? `❌ ${F} échec(s)` : "✅ LOT 4 AU NAVIGATEUR : TOUT EST VERT");
  await br.close();
})();
