/* ESSAI AU NAVIGATEUR — LE NOUVEL APPAREIL : un premier appareil met sa carrière en ligne, un second, tout neuf,
   se connecte, la voit dans « Vos carrières » (marquée ☁️ en ligne), l'ouvre d'un clic (rapatriée), et la
   retrouve ensuite dans le navigateur. Bureau et 390 px. Faux Supabase (page.route) : rien ne part en vrai.
   Il faut Playwright hors du dépôt (npm i playwright dans un dossier à part), comme essai-navigateur.cjs. */
const path = require("path");
const { chromium } = require("playwright");
const URL = require("url").pathToFileURL(path.join(__dirname, "..", "index.html")).href;
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const JWT = "xx." + b64({ sub: "u-essai", email: "vincent@exemple.fr" }) + ".yy";
let F = 0; const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) F++; };
(async () => {
  const br = await chromium.launch();
  // 1) un premier appareil fabrique une vraie carrière en ligne
  const lignes = [];
  const serveur = async (route) => {
    const req = route.request(), u = req.url();
    if (/grant_type=password/.test(u)) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ access_token: JWT, refresh_token: "rt", expires_in: 3600, user: { id: "u-essai", email: "vincent@exemple.fr" } }) });
    if (/pousse_carriere/.test(u)) { const p = JSON.parse(req.postData()); const l = lignes.find((x) => x.id === p.p_id);
      if (l) Object.assign(l, { maj: p.p_maj, fiche: p.p_fiche, donnees: p.p_donnees }); else lignes.push({ id: p.p_id, maj: p.p_maj, fiche: p.p_fiche, donnees: p.p_donnees });
      return route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }); }
    if (req.method() === "DELETE") { const id = new globalThis.URL(u).searchParams.get("id").slice(3); lignes.splice(lignes.findIndex((x) => x.id === id), 1); return route.fulfill({ status: 204, body: "" }); }
    if (/\/rest\/v1\/carrieres/.test(u)) { const q = new globalThis.URL(u).searchParams; const f = q.get("id"); const champs = q.get("select").split(",");
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(lignes.filter((l) => !f || "eq." + l.id === f).map((l) => Object.fromEntries(champs.map((c) => [c, l[c]])))) }); }
    return route.fulfill({ status: 404, body: "" });
  };
  const c1 = await br.newContext({ viewport: { width: 1280, height: 860 } }); const p1 = await c1.newPage(); await p1.route("https://hemedkhebhllymdgvuka.supabase.co/**", serveur);
  await p1.goto(URL);
  await p1.evaluate(() => { nouvellePartie(CLUBS[5].id); window._diffEnDirect = false; jouerJournee(); if (G._pend) abandonneDirect(); videMessage(); montre("calendrier"); });
  await p1.click("#bCompte"); await p1.fill("#cEmail", "vincent@exemple.fr"); await p1.fill("#cMdp", "motdepasse"); await p1.click("#cGo"); await p1.waitForTimeout(800);
  ok(lignes.length === 1, "le premier appareil a mis sa carrière en ligne");
  // 2) un appareil neuf
  for (const [nom, vp] of [["bureau", { width: 1280, height: 860 }], ["mobile", { width: 390, height: 844 }]]) {
    const c2 = await br.newContext({ viewport: vp }); const p2 = await c2.newPage(); await p2.route("https://hemedkhebhllymdgvuka.supabase.co/**", serveur);
    const err = []; p2.on("pageerror", (e) => err.push(e.message));
    await p2.goto(URL);
    ok(await p2.isVisible("#bMagie") && !(await p2.isVisible("#bReprendre")), `[${nom}] appareil neuf : l'accueil d'un nouveau venu`);
    await p2.click("#bCompteAcc"); await p2.fill("#cEmail", "vincent@exemple.fr"); await p2.fill("#cMdp", "motdepasse"); await p2.click("#cGo"); await p2.waitForTimeout(900);
    ok(await p2.isVisible("#bReprendre"), `[${nom}] connecté : la carrière en ligne apparaît dans « Vos carrières »`);
    ok(/en ligne/.test(await p2.textContent("#bReprendre")), `[${nom}] marquée ☁️ en ligne`);
    
    await p2.click("#bReprendre"); await p2.waitForTimeout(900);
    ok(await p2.evaluate(() => !!G && G.pid) === lignes[0].id, `[${nom}] un clic : rapatriée et ouverte`);
    await p2.click("#bMenu"); await p2.waitForTimeout(600);
    ok(!/en ligne/.test(await p2.textContent("#bReprendre")), `[${nom}] de retour à l'accueil, elle vit maintenant dans le navigateur`);
    ok(!err.length, `[${nom}] aucune erreur JS ${err.join(" | ")}`);
    await c2.close();
  }
  console.log(F ? `❌ ${F} échec(s)` : "✅ LOT 5 AU NAVIGATEUR : TOUT EST VERT");
  await br.close();
})();
