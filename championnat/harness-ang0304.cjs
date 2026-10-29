/* Harnais de validation — SAISON DE DÉPART ANG 2003-04
   La QUATORZIÈME saison anglaise, assemblée par la tâche planifiée sans accès à Transfermarkt.
   `harness-angleterre.cjs` tient le cadre ; ici, les FAITS :
   1) le plateau réel (Arsenal invaincu), 2) les sièges européens de 2003,
   3) les hommes : Henry joueur de l'année PFA et FWA et meilleur buteur, Parker meilleur espoir,
      Shearer et Saha, Lampard et Terry, Defoe en deuxième division
   4) les corrections du relevé : les pépites sans preuve dehors, celles que les relevés voisins
      prouvent gardées, huit doublons rendus au club du coup d'envoi, « A. Cissé » graphie du jeu
   5) une carrière
   Usage : node harness-ang0304.cjs                                                        */
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const a = html.indexOf("<script>") + "<script>".length;
const b = html.lastIndexOf("</script>");
const script = html.slice(a, b);

function makeStub() {
  let stub; const fn = function () { return stub; };
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,metaSaison,libDiv," +
  "voitPays,SAISONS,STARS_ANG0304,STARS_D2_ANG0304,D1_ANG0304,D2_ANG0304,SIEGES_ANG,VIVIER_SAISON," +
  "PRENOMS_VRAIS,CLUBS_ANG,STARS_ANG0203,STARS_D2_ANG0203,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ANG-2003-04";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ANG0304)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ANG0304)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;

const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

console.log("1) Le plateau réel de 2003-04");
{
  dit(!!S && S.pays === "ANG" && S.an === 2003 && S.titre === "2003-04", "au registre : ANG, 2003, « 2003-04 »");
  dit(S.nom === "Trente-huit sans défaite", "son nom : « " + S.nom + " »");
  dit(S.d1[0] === "ARS" && S.d1[1] === "CHE" && S.d1[2] === "MUN" && S.d1[3] === "LIV", "Arsenal champion invaincu, devant Chelsea, Manchester United et Liverpool");
  dit(meme(S.d1.slice(-3), ["LEI", "LEE", "WOL"]), "Leicester, Leeds et Wolverhampton, les trois relégués, ferment l'élite");
  dit(S.d2[0] === "NOR" && S.d2[1] === "WBA" && S.d2.includes("CPL") && S.d2.includes("WHU"), "Norwich champion du dessous, West Bromwich deuxième, Crystal Palace et West Ham en barrages");
  for (const c of ["BUR", "WAL", "BRD", "WIM"]) dit(!S.d2.includes(c), c + " écarté (Burnley faute d'effectif complet, les trois autres derniers)");
  dit(S.d2.includes("CRW") && S.d2.includes("WIG"), "Crewe et Wigan, montés de troisième division, au plateau");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ANG0304[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ANG0304[c].length, 0);
  dit(n1 === 400 && n2 === 360, "760 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 2003");
{
  const T = api.SIEGES_ANG[2003];
  dit(meme(S.euroC1, ["MUN", "ARS", "NEW", "CHE"]) && S.euroC2.length === 0 && meme(S.euroC3, ["LIV", "BLB", "SOU", "MCI"]), "United, Arsenal, Newcastle et Chelsea en C1, la C2 vide, Liverpool, Blackburn, Southampton et Manchester City en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ANG[2003]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("T. Henry", "ARS") && note("T. Henry")[3] >= 90, "Henry, joueur de l'année PFA et FWA, trente buts : " + note("T. Henry")[3]);
  dit(au("S. Parker", "CHL") && note("S. Parker")[3] >= 79, "Parker, meilleur espoir, à Charlton au coup d'envoi : " + note("S. Parker")[3]);
  dit(au("A. Shearer", "NEW") && note("A. Shearer")[3] >= 85, "Shearer, vingt-deux buts : " + note("A. Shearer")[3]);
  dit(au("L. Saha", "FUL") && note("L. Saha")[3] >= 80, "Saha à Fulham au coup d'envoi, vingt buts sur la saison : " + note("L. Saha")[3]);
  dit(au("R. van Nistelrooy", "MUN") && note("R. van Nistelrooy")[3] >= 89, "van Nistelrooy : " + note("R. van Nistelrooy")[3]);
  dit(au("F. Lampard", "CHE") && note("F. Lampard")[3] >= 81 && au("J. Terry", "CHE") && note("J. Terry")[3] >= 78, "Lampard " + note("F. Lampard")[3] + " et Terry " + note("J. Terry")[3] + " à Chelsea");
  dit(au("J. Defoe", "WHU") && note("J. Defoe")[3] >= 75, "Defoe à West Ham, en deuxième division : " + note("J. Defoe")[3]);
  dit(au("J. Lehmann", "ARS") && au("P. Vieira", "ARS") && au("R. Pirès", "ARS"), "Lehmann, Vieira et Pirès, des Invincibles, à Arsenal");
  dit(au("C. Ronaldo", "MUN") && note("C. Ronaldo")[2] === 18 && au("W. Rooney", "EVE") && note("W. Rooney")[2] === 18, "Ronaldo à United et Rooney à Everton, dix-huit ans au jeu");
  const tous = [].concat(...Object.values(api.STARS_ANG0304), ...Object.values(api.STARS_D2_ANG0304));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-Z][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 760, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
}
console.log("\n4) Les corrections du relevé");
{
  // pépites forcées par le relevé : sans historique de transferts, seules restent celles que les relevés voisins mettent au club
  dit(!au("C. Fàbregas", "ARS") && !au("S. Taylor", "NEW") && !au("Z. Rehman", "FUL") && !au("A. Lennon", "LEE") && !au("H. Bouazza", "WAT"),
    "Fàbregas, Steven Taylor, Rehman, Lennon et Bouazza, pépites sans preuve, ne sont pas au plateau");
  dit(au("S. Jordan", "MCI") && au("B. Watson", "CPL") && au("M. Phillips", "MIW") && au("L. Camp", "DER") && au("L. Doyley", "WAT"),
    "Jordan, Ben Watson, Mark Phillips, Lee Camp et Doyley, au club dans le relevé 2002-03, gardés");
  // doublons : l'homme qui joue cette saison pour son club de 2002-03 y était au coup d'envoi
  dit(au("A. Impey", "LEI") && au("H. Mullins", "CPL") && au("M. Bent", "IPS"), "Impey à Leicester, Mullins à Palace, Bent à Ipswich, leurs clubs au coup d'envoi");
  dit(!au("P. Devlin", "WAT") && !au("G. Horsfield", "WIG") && !au("M. Butler", "ROT") && !au("A. Lee", "CAR") && !au("Mathias Svensson", "NOR"),
    "Devlin, Horsfield, Butler, Alan Lee et Mathias Svensson ne sont pas aux clubs qu'ils ne rejoignent qu'après le coup d'envoi");
  dit(au("B. Deane", "LEI") && au("W. Hoskins", "ROT"), "Deane et Hoskins, quatrièmes attaquants de Leicester et de Rotherham");
  dit(au("J. Wilcox", "LEE") && !PAR_NOM.has("Alan Smith"), "Wilcox remplace Alan Smith, sans nom libre");
  const remis = [["J. Aliadière", "ARS"], ["H. Viana", "NEW"], ["S. McPhail", "LEE"], ["Marvin Elliott", "MIW"], ["P. Vernazza", "WAT"], ["J. Hand", "WAT"], ["P. Boertien", "DER"], ["P. Kennedy", "WIG"]];
  const manquent = remis.filter(([n, c]) => !au(n, c));
  dit(manquent.length === 0, "les hommes arrivés avant le coup d'envoi remis à leur club" + (manquent.length ? " — manquent " + manquent.map(x => x[0]).join(", ") : ""));
  dit(au("A. Cissé", "BIR") && note("A. Cissé")[2] === 27 && !PAR_NOM.has("Aliou Cissé"), "« A. Cissé », graphie du jeu, à Birmingham à vingt-sept ans");
}
console.log("\n5) Une carrière anglaise depuis 2003-04");
{
  api.nouvellePartie("ARS", KEY);
  const G = api.getG();
  dit(G.pays === "ANG" && G.saison === "2003-04" && api.anneeJeu() === 2003, "G.pays = ANG, « 2003-04 », 2003");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 2006, "carrière rendue en 2006-07");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ANG 2003-04 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ANG 2003-04 : TOUT EST VERT");
