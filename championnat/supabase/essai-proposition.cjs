/* ESSAI AU NAVIGATEUR — LA PROPOSITION DE COMPTE sous le debrief : absente avant le premier match, tutoyée,
   un seul bouton jaune, « Créer mon compte » qui ouvre la création, « Non merci » qui la fait taire pour de
   bon, trois apparitions au plus pour qui l'ignore, et zéro requête. Aucun serveur, même faux.
   Il faut Playwright hors du dépôt (npm i playwright dans un dossier à part), comme essai-navigateur.cjs. */
const path = require("path");
const { chromium } = require("playwright");
const URL = require("url").pathToFileURL(path.join(__dirname, "..", "index.html")).href;
let F = 0; const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) F++; };
(async () => {
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 } }); const page = await ctx.newPage();
  const err = []; page.on("pageerror", (e) => err.push(e.message)); let req = 0; page.on("request", (r) => { if (/supabase/.test(r.url())) req++; });
  await page.goto(URL);
  const unMatch = async () => { await page.evaluate(() => { window._diffEnDirect = false; jouerJournee(); if (G._pend) abandonneDirect(); videMessage(); G.notifs = (G.notifs || []).concat(["Une nouvelle de la semaine."]); montre("calendrier"); }); await page.waitForTimeout(300);
    for (let i = 0; i < 8 && !(await page.isVisible("#bDebOk")) && await page.isVisible("#fiche .fbox"); i++) { // on répond aux fenêtres qui passent avant (incident, presse…)
      const t = await page.textContent("#fiche h2").catch(() => ""); const b = page.locator("#fiche button:enabled").first();
      if (!(await b.count())) break; await b.click().catch(() => {}); await page.waitForTimeout(250); VUS.push(t); } };
  const VUS = [];
  await page.evaluate(() => { nouvellePartie(CLUBS[3].id); montre("calendrier"); });
  await page.click("#bIntro"); await page.waitForTimeout(200);
  const debriefVisible = async () => page.isVisible("#bDebOk");
  // avant le premier match : pas de proposition
  ok(!(await page.isVisible("#propCompte")), "avant le premier match : rien");
  await unMatch();
  ok(await debriefVisible(), "après le premier match : le debrief s'ouvre");
  ok(await page.isVisible("#propCompte") && /Crée ton compte/.test(await page.textContent("#propCompte")), "la ligne est là, tutoyée");

  const jaunes = await page.$$eval("#fiche button", (bs) => bs.filter((b) => getComputedStyle(b).backgroundColor === "rgb(255, 210, 74)").length);
  ok(jaunes === 1, "un seul bouton jaune plein dans le debrief (" + jaunes + ")");
  await page.click("#bPropOui"); await page.waitForTimeout(200);
  ok(await page.isVisible("#cForm") && /CRÉER UN COMPTE/.test(await page.textContent("#msgbox h2")), "« Créer mon compte » ouvre la fenêtre, sur la création");
  await page.keyboard.press("Escape"); await page.waitForTimeout(100);
  await unMatch(); await page.waitForTimeout(100);
  ok(await page.isVisible("#propCompte"), "ignorée, elle revient une deuxième fois");
  await page.click("#bPropNon"); await page.waitForTimeout(100);
  ok(!(await page.isVisible("#propCompte")) && await debriefVisible(), "« Non merci » : la ligne disparaît, le debrief reste");
  await page.click("#bDebOk");
  for (let i = 0; i < 3; i++) { await unMatch(); if (await debriefVisible()) { ok(!(await page.isVisible("#propCompte")), "après « Non merci », plus jamais (" + (i + 1) + ")"); await page.click("#bDebOk").catch(() => {}); } }
  // un autre navigateur qui ignore : trois fois au plus
  const c2 = await br.newContext(); const p2 = await c2.newPage(); await p2.goto(URL);
  await p2.evaluate(() => { nouvellePartie(CLUBS[4].id); montre("calendrier"); });
  await p2.click("#bIntro"); await p2.waitForTimeout(200);
  let vues = 0;
  for (let i = 0; i < 6; i++) { await p2.evaluate(() => { window._diffEnDirect = false; jouerJournee(); if (G._pend) abandonneDirect(); videMessage(); G.notifs = ["x"]; montre("calendrier"); }); await p2.waitForTimeout(250);
    if (await p2.isVisible("#propCompte")) vues++; await p2.evaluate(() => fermeFiche()); }
  ok(vues === 3, "jamais acceptée ni refusée : trois fois, pas une de plus (" + vues + ")");
  ok(req === 0, "tout ça sans une requête (" + req + ")");
  ok(!err.length, "aucune erreur JS " + err.join(" | "));
  console.log(F ? `❌ ${F} échec(s)` : "✅ LOT 6 AU NAVIGATEUR : TOUT EST VERT");
  await br.close();
})();
