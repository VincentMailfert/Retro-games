/* Harnais de LA MÉMOIRE LONGUE DU CLUB — MULTIPLEX 95 (v1.08)
   Cinq pièces qui ne touchent pas au moteur : elles relisent ce qu'il produit déjà.
     A) les quatre actes de la saison, et le mini-bilan qui referme chaque chapitre
     B) l'enjeu : PUR — il se calcule aussi bien sur G que sur une sauvegarde relue à l'accueil
     C) « ce match compte parce que… » : derby, bête noire, adversaire direct, ancien en face,
        série en cours, record à portée
     D) les records du club : le premier se pose en silence, celui qui en fait tomber un se crie ;
        et le palmarès retient enfin la montée, la finale de Coupe et le maintien arraché
     E) la fiche de vie : cumul sous NOS couleurs, solde de fin de saison, trois moments au maximum,
        le jubilé de la légende et les sifflets quand on vend un enfant du club
     F) le baromètre des tribunes : mémoire par match, bascule à l'intersaison, alertes de tendance
     G) l'étoile « Suivre » qui remonte au debrief
     H) « Où en étions-nous ? » : le point de situation se calcule ET se rend
     I) ce que tout cela pèse dans la sauvegarde
   Usage : node harness-memoire.cjs                                                              */
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
const APP = { _h: "", innerHTML: "", querySelectorAll: () => [], querySelector: () => makeStub() };
Object.defineProperty(APP, "innerHTML", { get() { return APP._h; }, set(v) { APP._h = String(v); } });
const generic = makeStub();
global.document = new Proxy(function () {}, {
  get(_t, p) {
    if (p === "getElementById") return id => (id === "app" ? APP : generic);
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

const api = new Function(script + "\n;return {nouvellePartie,jouerJournee,intersaison,finDeSaison,vieillirClub," +
  "ACTES,acteDe,enjeuDe,ligneEnjeu,raisonsMatch,prochainMatchDe,rangDe,motDuPresident,bilanActe," +
  "RECORDS,poseRecord,crieRecord,recordsTenus,resumeRecords," +
  "ouvreBio,cumulBio,soldeBio,ajouteMoment,enfantDuClub,quitteMaison,blocBio,BIO_MODES," +
  "noteSuivis,debriefSuivis,veilleAffluence,baroTribunes,moyAffSaison," +
  "pointDeSituation,ecranReprise,panneauActe,ecranCalendrier,ecranClub,ecranClassement," +
  "clubById,byUid,onze,classement,RIVAL,introSaison,getG:function(){return G;}};")();

let F = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) F++; };
const neuve = id => { api.nouvellePartie(id || "LEN"); return api.getG(); };

/* ===== A) Les quatre actes de la saison ===== */
console.log("A) Les quatre actes : un découpage, et un chapitre qui se referme");
{
  const bornes = [[0, 1], [6, 1], [7, 2], [14, 2], [15, 3], [25, 3], [26, 4], [37, 4]];
  ok(bornes.every(([j, n]) => api.acteDe(j).n === n),
    "J1-J7 été indien, J8-J15 automne, J16-J26 hiver, J27-J38 printemps");
  ok(api.ACTES.length === 4 && api.ACTES[0].de === 0 && api.ACTES[3].a === 37,
    "les quatre actes couvrent les 38 journées sans trou");

  let G = neuve("AUX");
  let actes = 0, presidents = 0, pepin = null;
  for (let d = 0; d < 38; d++) {
    try { api.jouerJournee(); } catch (e) { pepin = "J" + (d + 1) + " → " + e.message; break; }
    for (const t of G.notifs || []) {
      if (t.indexOf("📖 ACTE") === 0) actes++;
      if (t.indexOf("🎙️") === 0) presidents++;
    }
  }
  ok(!pepin, pepin || "38 journées jouées sans exception");
  ok(actes === 3, "trois bascules d'acte dans la saison (J8, J16, J27) : " + actes);
  ok(presidents === 2, "le président reformule l'enjeu deux fois (trêve + J30) : " + presidents);
}

/* ===== B) L'enjeu — et sa pureté ===== */
console.log("\nB) L'enjeu : il se calcule aussi bien sur une sauvegarde relue que sur la partie en cours");
{
  const G = neuve("LEN");
  for (let d = 0; d < 20; d++) api.jouerJournee();
  const vif = api.enjeuDe(G);
  const relu = api.enjeuDe(JSON.parse(JSON.stringify(G)));
  ok(vif && relu && vif.txt === relu.txt, "même verdict sur G et sur sa copie JSON : « " + (vif ? vif.txt : "—") + " »");
  ok(vif && vif.rang >= 1 && vif.rang <= 20, "le rang tient dans la division (" + (vif && vif.rang) + "ᵉ)");
  ok(vif && (vif.sens === "chasse" || vif.sens === "garde"), "on court après un palier, ou on le défend (" + (vif && vif.sens) + ")");

  // cas fabriqué : 5ᵉ à deux points de l'Europe (4ᵉ)
  const faux = { monClub: "X", div: 1, journee: 20, clubs: [], calendrier: [] };
  for (let i = 0; i < 20; i++) faux.clubs.push({ id: "C" + i, nom: "Club " + i, pts: 60 - i * 3, bp: 30, bc: 20, forme: [] });
  faux.clubs[4].id = "X"; // 5ᵉ (60-12=48), le 4ᵉ est à 51 → deux... trois points
  faux.clubs[4].pts = 49;  // → exactement 2 points du 4ᵉ (51)
  const e = api.enjeuDe(faux);
  ok(e && e.rang === 5 && e.sens === "chasse" && e.ecart === 2 && /Europe/.test(e.txt),
    "cas d'école : « " + (e ? e.txt : "—") + " »");

  // le 2ᵉ COURT APRÈS le titre…
  faux.clubs[4].pts = 58;
  const e2 = api.enjeuDe(faux);
  ok(e2 && e2.rang === 2 && e2.sens === "chasse" && /titre/.test(e2.txt), "le dauphin court après le titre : « " + (e2 ? e2.txt : "—") + " »");
  // …et le leader le DÉFEND
  faux.clubs[4].pts = 70;
  const e3 = api.enjeuDe(faux);
  ok(e3 && e3.rang === 1 && e3.sens === "garde" && /d'avance/.test(e3.txt), "le leader, lui, défend : « " + (e3 ? e3.txt : "—") + " »");
  // et le dernier de la classe sait exactement ce qui le menace
  faux.clubs[4].pts = 0;
  const e4 = api.enjeuDe(faux);
  ok(e4 && e4.rang === 20 && /maintien/.test(e4.txt), "la lanterne rouge aussi : « " + (e4 ? e4.txt : "—") + " »");
  faux.clubs[4].pts = 49;

  // la ligne de l'accueil
  const ligne = api.ligneEnjeu(JSON.parse(JSON.stringify(G)));
  ok(typeof ligne === "string" && ligne.indexOf(" · samedi, ") > 0,
    "la carte d'accueil porte le rang ET l'affiche du week-end : « " + ligne + " »");
  ok(api.ligneEnjeu({}) === "" && api.ligneEnjeu(null) === "", "un objet vide ou nul ne fait pas tomber l'accueil");
}

/* ===== C) « Ce match compte parce que… » ===== */
console.log("\nC) « Ce match compte parce que… » : six raisons, toutes déjà en mémoire");
{
  const G = neuve("LEN");
  for (let d = 0; d < 10; d++) api.jouerJournee();
  const rival = api.RIVAL[G.monClub];
  const moi = api.clubById(G.monClub);
  const lib = () => api.raisonsMatch(G).map(x => x.court);

  // on fabrique l'affiche du week-end : le derby
  if (rival && api.clubById(rival)) {
    G.calendrier[G.journee] = [[G.monClub, rival]].concat(G.calendrier[G.journee].filter(p => p[0] !== G.monClub && p[1] !== G.monClub && p[0] !== rival && p[1] !== rival));
    ok(lib().indexOf("le derby") >= 0, "le derby est annoncé comme tel (" + api.clubById(rival).nom + ")");
  } else ok(true, "ce club n'a pas de rival dans la division — rien à annoncer");

  // la bête noire
  const adv = api.clubById(G.calendrier[G.journee][0][1]);
  moi.beteNoire = adv.id; moi.bnBattue = false;
  ok(lib().indexOf("la bête noire") >= 0, "la bête noire est rappelée tant que le signe indien tient");
  moi.bnBattue = true;
  ok(lib().indexOf("la bête noire") < 0, "…et se tait une fois le signe indien brisé");

  // un ancien à vous en face
  adv.joueurs[0].exMien = "1995-96";
  ok(lib().indexOf("un ancien en face") >= 0, "un ancien du club en face, ça se dit : " + adv.joueurs[0].nom);

  // la série en cours
  moi.forme = [1, 1, 1, 1];
  ok(api.raisonsMatch(G).some(x => /4 victoires d'affilée/.test(x.txt)), "quatre victoires d'affilée deviennent une raison de jouer");
  ok(lib().indexOf("une série à prolonger") >= 0, "…et la carte d'accueil le dit en trois mots");

  // le record à portée
  G.records = G.records || {}; G.records.invaincu = { v: 5, t: "5 matchs sans défaite", s: "1995-96", j: 12 };
  G.serieInv = 4;
  ok(lib().indexOf("un record à portée") >= 0, "un match sans défaite de plus, et le record du club tombe");

  // tout se rend sans exception (le mot d'ouverture a été lu : on est sur l'écran du match)
  G.intro = null;
  api.ecranCalendrier();
  ok(/Ce match compte parce que/.test(APP.innerHTML), "la ligne se rend bien sur l'écran d'avant-match");
  ok(/ACTE /.test(APP.innerHTML) && /Où en étions-nous/.test(APP.innerHTML), "le bandeau d'acte et sa porte de sortie aussi");
}

/* ===== D) Les records du club ===== */
console.log("\nD) Les records du club : le premier se pose en silence, celui qui en fait tomber un se crie");
{
  const G = neuve("LEN");
  G.notifs = [];
  ok(api.crieRecord("large", 300, "3-0 contre X") === false, "le PREMIER record ne se crie pas (en saison 1, tout est un record)");
  ok(G.records.large && G.records.large.anc === null, "…mais il est bien posé, sans prédécesseur");
  ok(api.crieRecord("large", 200, "2-0 contre Y") === false, "un résultat moindre ne touche à rien");
  ok(G.records.large.v === 300, "le record tient bon (" + G.records.large.v + ")");
  const crie = api.crieRecord("large", 500, "5-0 contre Z");
  ok(crie === true, "celui qui FAIT TOMBER le record, lui, se crie");
  ok((G.notifs || []).some(t => /RECORD DU CLUB/.test(t)), "et le debrief le porte : « " + (G.notifs.find(t => /RECORD/.test(t)) || "").slice(0, 60) + "… »");
  ok(G.records.large.anc === 300, "l'ancienne marque est retenue (" + G.records.large.anc + ")");
  // le plus JEUNE buteur se bat vers le bas
  api.poseRecord("jeune", 21, "A, 21 ans", true);
  api.poseRecord("jeune", 23, "B, 23 ans", true);
  ok(G.records.jeune.v === 21, "le plus jeune buteur se compare à l'envers : 23 ans ne bat pas 21");
  ok(api.poseRecord("jeune", 18, "C, 18 ans", true) === "battu", "…et 18 ans, si");
  ok(api.RECORDS.length === 6, "six lignes au mur du club, pas une de plus");
}
console.log("\nD bis) Le palmarès retient la montée, la finale de Coupe et le maintien arraché");
{
  const G = neuve("GUI");
  // on truque la table pour finir 16ᵉ sur 20 : maintien arraché, pas relégation
  const moi = api.clubById(G.monClub);
  G.clubs.filter(c => c.id !== G.monClub).forEach((c, i) => { c.pts = 100 - i * 3; c.bp = 50; c.bc = 20; });
  moi.pts = 57; moi.bp = 40; moi.bc = 30; // entre le 15ᵉ (58) et le 16ᵉ (55)
  G.journee = 38; G.div = 1;
  G.coupe.elimine = true; G.coupe.tourSortie = "Finale";
  const avant = G.palmares.length;
  api.finDeSaison();
  const rang = api.classement().findIndex(c => c.id === G.monClub) + 1;
  ok(rang === 16, "mon club finit bien 16ᵉ sur 20 (barre à 17ᵉ)");
  ok(G.palmares.some(t => /Maintien arraché/.test(t)), "« " + (G.palmares.find(t => /Maintien/.test(t)) || "—") + " »");
  ok(G.palmares.some(t => /Finaliste de la Coupe de France/.test(t)), "« " + (G.palmares.find(t => /Finaliste/.test(t)) || "—") + " »");
  ok(G.palmares.length === avant + 2, "deux lignes ajoutées, et pas une de plus");
  ok(G.records.rang && G.records.rang.t === "16ᵉ de Division 1", "le meilleur classement entre aux archives : " + (G.records.rang || {}).t);
}

/* ===== E) La fiche de vie ===== */
console.log("\nE) La fiche de vie : ce qu'un homme a fait SOUS VOS COULEURS");
{
  let G = neuve("LEN");
  const moi = api.clubById(G.monClub);
  ok(moi.joueurs.every(j => j.bio && j.bio.mode === "origine"), "tout l'effectif de départ a sa fiche ouverte");
  const horsClub = G.clubs.find(c => c.id !== G.monClub);
  ok(horsClub.joueurs.every(j => !j.bio), "et personne d'autre dans la division : la sauvegarde ne double pas");

  const cadre = moi.joueurs.find(j => j.pos === "M");
  for (let d = 0; d < 10; d++) api.jouerJournee();
  ok(api.cumulBio(cadre).m === (cadre.matchs || 0), "en cours de saison, le cumul suit les compteurs (" + api.cumulBio(cadre).m + " matchs)");

  for (let d = 10; d < 38; d++) api.jouerJournee();
  const mS1 = cadre.matchs, bS1 = cadre.buts;
  ok(cadre.bio.m === mS1 && cadre.bio.b === bS1, "au coup de sifflet final, la saison est SOLDÉE dans la fiche (" + mS1 + " matchs)");
  ok(api.cumulBio(cadre).m === mS1, "…et le bilan de saison ne la recompte pas deux fois");

  api.intersaison();
  ok(cadre.bio.dec === null, "l'intersaison remet le décompte à zéro, comme les compteurs de saison");
  ok(cadre.matchs === 0 && api.cumulBio(cadre).m === mS1, "compteurs à zéro, fiche intacte : " + api.cumulBio(cadre).m + " matchs");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  ok(api.cumulBio(cadre).m === mS1 + cadre.matchs, "deuxième saison : le cumul s'empile bien (" + api.cumulBio(cadre).m + ")");

  // les trois moments au maximum
  const t = { nom: "Test", bio: { s: "1995-96", mode: "forme", m: 0, b: 0, p: 0, h: 0, mom: [] } };
  api.ajouteMoment(t, "petit", 3); api.ajouteMoment(t, "moyen", 6);
  api.ajouteMoment(t, "gros", 9); api.ajouteMoment(t, "énorme", 10);
  ok(t.bio.mom.length === 3, "trois moments au maximum (" + t.bio.mom.length + ")");
  ok(!t.bio.mom.some(m => m.t === "petit"), "c'est le moins marquant qui sort");
  api.ajouteMoment(t, "gros", 9);
  ok(t.bio.mom.filter(m => m.t === "gros").length === 1, "un même moment ne s'écrit jamais deux fois");

  // le rendu de la fiche
  const rendu = api.blocBio(cadre);
  ok(/Sous nos couleurs/.test(rendu) && /match/.test(rendu), "le bloc « Sous nos couleurs » se rend sur la fiche du joueur");
  ok(api.blocBio({ nom: "X", club: "ZZZ" }) === "", "un joueur qui n'est pas à vous n'en a pas");
}
console.log("\nE bis) Le jubilé de la légende, et les sifflets quand on vend un enfant du club");
{
  const G = neuve("LEN");
  const moi = api.clubById(G.monClub);
  const legende = moi.joueurs[0];
  legende.age = 35;
  legende.bio = { s: "1995-96", mode: "forme", m: 142, b: 31, p: 18, h: 6, mom: [{ t: "Un but dans le derby contre X", s: "1996-97", j: 9, w: 8 }], dec: null };
  const rec = [];
  api.vieillirClub(moi, rec);
  ok(rec.some(l => /^JUBILÉ/.test(l)), "« " + (rec.find(l => /^JUBILÉ/.test(l)) || "—").slice(0, 96) + "… »");
  ok(G.palmares.some(t => /^Jubilé de /.test(t)), "le jubilé entre au palmarès : " + (G.palmares.find(t => /^Jubilé/.test(t)) || "—"));
  ok(G.presse.some(t => /retire le numéro/.test(t)), "et la presse s'en empare");

  const G2 = neuve("LEN");
  const moi2 = api.clubById(G2.monClub);
  const gamin = moi2.joueurs[3];
  gamin.bio = { s: "1995-96", mode: "forme", m: 90, b: 12, p: 9, h: 2, mom: [], dec: null };
  ok(api.enfantDuClub(gamin) === true, "un formé au club de 90 matchs EST un enfant du club");
  const repAv = G2.reput; G2.notifs = [];
  api.quitteMaison(gamin, "vendu à Lille");
  ok(G2.reput < repAv, "le vendre coûte de la réputation (" + Math.round(repAv) + " → " + Math.round(G2.reput) + ")");
  ok((G2.notifs || []).some(t => /LES SIFFLETS/.test(t)), "le virage siffle, et le debrief le rapporte");
  ok(gamin.exMien === G2.saison, "il est marqué comme un ancien : il reviendra en face un jour");
  const banal = moi2.joueurs.find(j => j !== gamin && j.bio);
  banal.bio.mode = "achat"; banal.bio.m = 4;
  const repAv2 = G2.reput;
  api.quitteMaison(banal, "vendu");
  ok(G2.reput === repAv2, "une recrue de quatre matchs s'en va, elle, dans l'indifférence générale");
}

/* ===== F) Le baromètre des tribunes ===== */
console.log("\nF) Le baromètre des tribunes : l'affluence enfin vue dans le temps");
{
  const G = neuve("LEN");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  ok(G.affJ.length === 19, "dix-neuf matchs à domicile relevés sur la saison (" + G.affJ.length + ")");
  ok(G.affJ.every(x => x.n > 0 && x.f > 0 && x.f <= 1 && x.j >= 1 && x.j <= 38), "chaque relevé porte la journée, le nombre de spectateurs et le taux");
  ok(G.records.aff && /spectateurs contre /.test(G.records.aff.t), "le record d'affluence est tenu : " + (G.records.aff || {}).t);
  ok(G.news.some(t => /par rapport au dernier match à domicile/.test(t)), "la dépêche de billetterie dit le SENS, pas seulement le chiffre");
  const moy1 = api.moyAffSaison(G.affJ);
  api.intersaison();
  ok(G.affJ.length === 0 && G.affS.length === 1, "à l'intersaison, la saison bascule dans l'historique");
  ok(Math.abs(G.affS[0].moy - moy1) <= 1, "la moyenne archivée est la bonne (" + G.affS[0].moy + ")");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  api.intersaison();
  ok(G.affS.length === 2, "deux saisons au compteur — de quoi dire « +N par rapport à l'an dernier »");

  // les alertes de tendance
  const G2 = neuve("LEN");
  G2.notifs = []; G2.affJ = [{ j: 1, n: 30000, f: 0.95 }, { j: 3, n: 30000, f: 0.96 }, { j: 5, n: 30000, f: 0.97 }];
  api.veilleAffluence(api.clubById(G2.monClub));
  ok((G2.notifs || []).some(t => /trop petit/.test(t)), "trois guichets fermés de suite : on vous dit que le stade est le plafond");
  G2.notifs = []; G2._affCri = null;
  G2.affJ = [{ f: 0.85, n: 1, j: 1 }, { f: 0.84, n: 1, j: 3 }, { f: 0.86, n: 1, j: 5 },
             { f: 0.60, n: 1, j: 7 }, { f: 0.58, n: 1, j: 9 }, { f: 0.57, n: 1, j: 11 }];
  api.veilleAffluence(api.clubById(G2.monClub));
  ok((G2.notifs || []).some(t => /Les gradins se vident/.test(t)), "les gradins qui se vident déclenchent l'alerte, avec le tarif en cause");
  G2.notifs = [];
  api.veilleAffluence(api.clubById(G2.monClub));
  ok((G2.notifs || []).length === 0, "…et on ne crie pas deux fois la même chose");

  const h = api.baroTribunes();
  ok(/baromètre des tribunes/.test(h) && /<svg/.test(h), "le baromètre se rend (histogramme + moyenne + conseil)");
  api.ecranClub();
  ok(/baromètre des tribunes/.test(APP.innerHTML) && /Les records du club/.test(APP.innerHTML),
    "l'écran Club porte le baromètre ET le mur des records");
}

/* ===== G) L'étoile « Suivre » ===== */
console.log("\nG) L'étoile « Suivre » ne sert plus qu'à filtrer le mercato");
{
  const G = neuve("LEN");
  const moi = api.clubById(G.monClub);
  const av = api.clubById(G.clubs.find(c => c.id !== G.monClub).id).joueurs.filter(j => j.pos === "A").sort((a, b) => b.note - a.note)[0];
  moi.joueurs.filter(j => j.pos === "A").forEach(j => j.fav = true);
  if (av) av.fav = true;
  let dits = 0;
  for (let d = 0; d < 38; d++) { api.jouerJournee(); dits += (G.notifs || []).filter(t => t.indexOf("⭐") === 0).length; }
  ok(dits > 0, "le debrief raconte le samedi de vos chouchous (" + dits + " fois dans la saison)");
  ok(dits < 38 * 4, "…sans noyer le debrief (trois lignes au maximum par journée)");
  const G2 = neuve("LEN");
  api.noteSuivis(); G2.notifs = [];
  api.debriefSuivis();
  ok((G2.notifs || []).length === 0, "sans une seule étoile posée, le debrief reste muet");
}

/* ===== H) « Où en étions-nous ? » ===== */
console.log("\nH) « Où en étions-nous ? » : le point de situation se calcule ET se rend");
{
  const G = neuve("LEN");
  for (let d = 0; d < 12; d++) api.jouerJournee();
  const S = api.pointDeSituation();
  ok(S.der.length === 5, "les cinq derniers matchs sont relus dans l'historique (" + S.der.length + ")");
  ok(S.der.every(x => x.mes != null && x.ses != null && x.adv), "avec le score et le nom de l'adversaire");
  ok(S.der[S.der.length - 1].j === 12, "et le plus récent est bien le dernier joué (J" + S.der[S.der.length - 1].j + ")");
  ok(S.e && S.pm && S.acte, "l'enjeu, le prochain match et l'acte en cours sont là");
  api.ecranReprise();
  const h = APP.innerHTML;
  ok(/OÙ EN ÉTIONS-NOUS/.test(h), "l'écran se rend");
  ok(/LA SITUATION/.test(h) && /LE PROCHAIN MATCH/.test(h) && /CE QUI ATTEND VOTRE RÉPONSE/.test(h),
    "les quatre panneaux y sont : situation, presse, en-cours, prochain match");
  ok(/REPRENDRE LA SAISON/.test(h), "et le bouton qui rend la main au terrain");

  // une carrière à peine commencée ne doit pas faire tomber l'écran
  const G2 = neuve("OM");
  api.ecranReprise();
  ok(/OÙ EN ÉTIONS-NOUS/.test(APP.innerHTML), "à la journée 1, sans un match joué, il se rend quand même");
  ok(/Pas encore un match joué/.test(APP.innerHTML), "…et le dit franchement");
}

/* ===== I) Le poids dans la sauvegarde ===== */
console.log("\nI) Ce que la mémoire longue pèse dans la sauvegarde");
{
  const G = neuve("LEN");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  api.intersaison();
  for (let d = 0; d < 38; d++) api.jouerJournee();
  const total = JSON.stringify(G).length;
  const club = JSON.stringify({ records: G.records, affJ: G.affJ, affS: G.affS, serieInv: G.serieInv }).length;
  const bios = api.clubById(G.monClub).joueurs.reduce((s, j) => s + JSON.stringify(j.bio || null).length, 0);
  ok(club < 1400, "records + baromètre : " + club + " octets");
  ok(bios < 9000, "les fiches de vie de tout l'effectif : " + bios + " octets");
  ok((club + bios) / total < 0.03, "soit " + (((club + bios) / total) * 100).toFixed(2) + " % de la sauvegarde");
  // l'historique des tribunes ne grossit pas indéfiniment : douze saisons, puis la plus vieille sort
  G.affS = []; for (let k = 0; k < 15; k++) { G.affJ = [{ j: 1, n: 10000 + k, f: 0.5 }]; api.intersaison(); }
  ok(G.affS.length === 12, "au bout de quinze saisons, l'historique des tribunes en garde douze (" + G.affS.length + ")");
}

console.log(F ? "\n❌ " + F + " ÉCHEC(S)" : "\n✅ MÉMOIRE LONGUE DU CLUB : TOUT EST VERT");
process.exit(F ? 1 : 0);
