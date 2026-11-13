/* Harnais de validation — LE CADRE ITALIEN (ITA-B)
   Deuxième étape du lot structure qui précède l'Italie, sur le modèle d'ANG-C (la réconciliation
   européenne) et d'ANG-D (les textes). Aucune saison italienne n'est encore jouable : on vérifie ici
   le cadre sur un plateau d'ESSAI bâti avec les vrais clubs d'ITA-A, et SURTOUT qu'une partie française
   ou anglaise ne change pas d'un caractère.
   A) SIEGES_ITA : vingt saisons de Coupe d'Europe italienne, relevées et non devinées
   B) le plateau italien quitte le vivier d'Europe, et le tableau garde ses seize clubs
   C) les étés internationaux vus d'Italie, et un seul sacre : 2006
   D) la sélection nationale appelle les Italiens
   E) les noms procéduraux italiens, contrôlés contre tous les noms curés du fichier
   F) les petits clubs de la Coppa Italia
   G) les incidents propres à un pays : la taupe du journal rose et la maturità
   H) les éternels seconds italiens, et le premier titre de la Sampdoria
   I) une saison italienne entière, jouée pour de vrai, sans un mot de France
   Usage : node harness-textes-ita.cjs                                                                  */
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
global.document = makeStub();
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, localStorage: ls, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.localStorage = ls; global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0); global.cancelAnimationFrame = (id) => clearTimeout(id);

const epilogue = "\n;return {PAYS,HONNEURS_PAYS,honneurEte,voitPays,paysVu,natPays,leP,LeP,duP,adjPaysM,titreChampion," +
  "NOMS,NOMS_ANG,NOMS_ITA,PRENOMS_ITA,NOMS_TOUS,NOMS_LUS,PRENOMS_GEN,ORIGINES,origineDuNom,prenomDe," +
  "CLUBS_AMATEURS,CLUBS_AMATEURS_ANG,CLUBS_AMATEURS_ITA,AMATEURS_TOUS,estAmateur,amaById," +
  "INCIDENTS,tireIncident,selections,jamaisChampion,JAMAIS_CHAMPION,JAMAIS_CHAMPION_ANG,JAMAIS_CHAMPION_ITA," +
  "PREMIER_TITRE_PAYS,CLUBS_ITA,CLUBS_ANG,SAISONS,SAISON_DEFAUT,SIEGES_ITA,SIEGES_ANG,SIEGES_PAYS,COMPETS,EUROCLUBS," +
  "nouvellePartie,jouerJournee,intersaison,clubById,euroInit,vivierEuro,siegePays,viviersEuroDe,plateauEnCours," +
  "plateauHorsVivier," +
  "getG:function(){return G;},setG:function(x){G=x;}};";
const api = new Function(script + epilogue)();
const { PAYS, HONNEURS_PAYS, honneurEte, voitPays, NOMS, NOMS_ANG, NOMS_ITA, PRENOMS_ITA, PRENOMS_GEN, ORIGINES,
  CLUBS_AMATEURS, CLUBS_AMATEURS_ANG, CLUBS_AMATEURS_ITA, INCIDENTS, JAMAIS_CHAMPION, JAMAIS_CHAMPION_ANG,
  JAMAIS_CHAMPION_ITA, CLUBS_ITA, CLUBS_ANG, SAISONS, SIEGES_ITA, SIEGES_PAYS, EUROCLUBS } = api;

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const extrait = l => l.slice(0, 6).join(", ") + (l.length > 6 ? " (+" + (l.length - 6) + ")" : "");
const CODES_ITA = new Set(CLUBS_ITA.map(c => c.id));
const ANS = Object.keys(SIEGES_ITA).map(Number).sort((a, b) => a - b);

/* Le plateau italien d'ESSAI : vingt clubs de Serie A, dont les six codes partagés avec le vivier d'Europe
   (JUV, MIL, INT, ROM, LAZ, PAR), et vingt autres clubs d'ITA-A dessous. Effectifs PROCÉDURAUX, exprès : on
   teste le cadre, pas la donnée, qui viendra avec les vingt saisons italiennes. */
const ITA_D1 = ["JUV", "MIL", "INT", "ROM", "LAZ", "PAR", "NAP", "SAM", "FIO", "TOR",
  "GEN", "ATA", "BGN", "UDI", "CAG", "HEL", "BAI", "LEC", "FOG", "CRM"];
const ITA_D2 = CLUBS_ITA.map(c => c.id).filter(id => !ITA_D1.includes(id)).slice(0, 20);
const PARTAGES = ["JUV", "MIL", "INT", "ROM", "LAZ", "PAR"];
const CLE_ITA = "ITA-1995-96";
function ouvreItalienne(clubId, an = 1995, compet) {
  SAISONS[CLE_ITA] = {
    pays: "ITA", an, titre: an + "-" + String((an + 1) % 100).padStart(2, "0"), nom: "Essai du harnais",
    d1: ITA_D1, d2: ITA_D2, starsD1: {}, starsD2: {},
    euroC1: SIEGES_ITA[an].C1, euroC2: SIEGES_ITA[an].C2, euroC3: SIEGES_ITA[an].C3,
    sous: "Saison d'essai, retirée aussitôt.",
  };
  api.nouvellePartie(clubId || ITA_D1[0], CLE_ITA);
  const G = api.getG();
  if (compet !== undefined) { G.euroCompet = compet; api.euroInit(); }
  return G;
}
function fermeItalienne() { delete SAISONS[CLE_ITA]; }
function ouvreFrancaise(cle) { api.nouvellePartie(SAISONS[cle || api.SAISON_DEFAUT].d1[0], cle || api.SAISON_DEFAUT); return api.getG(); }

/* ===== A) la table des sièges italiens ===== */
console.log("A) SIEGES_ITA : vingt saisons de Coupe d'Europe italienne, relevées et non devinées");
{
  ok(ANS.length === 20 && ANS[0] === 1990 && ANS[19] === 2009,
    `la table couvre les vingt saisons du chantier, de ${ANS[0]}-91 à ${ANS[19]}-10`);
  const inconnus = [];
  for (const an of ANS) for (const k of ["C1", "C2", "C3"])
    for (const id of SIEGES_ITA[an][k]) if (!CODES_ITA.has(id)) inconnus.push(an + " " + k + " " + id);
  ok(inconnus.length === 0, `tous les codes sont de vrais clubs de CLUBS_ITA${inconnus.length ? " — " + inconnus.join(", ") : ""}`);
  ok(ANS.every(an => ["C1", "C2", "C3"].every(k => Array.isArray(SIEGES_ITA[an][k]))),
    "chaque saison porte ses trois compétitions, même vides");
  const croise = [];
  for (const an of ANS) {
    const vus = new Set();
    for (const k of ["C1", "C2", "C3"]) for (const id of SIEGES_ITA[an][k]) { if (vus.has(id)) croise.push(an + " " + id); vus.add(id); }
  }
  ok(croise.length === 0, `aucun club n'est listé dans deux compétitions la même saison${croise.length ? " — " + croise.join(", ") : ""}`);
  const tailles = ANS.map(an => SIEGES_ITA[an].C1.length + SIEGES_ITA[an].C2.length + SIEGES_ITA[an].C3.length);
  ok(Math.min(...tailles) === 6 && Math.max(...tailles) === 8,
    `la délégation italienne va de six à huit clubs (${Math.min(...tailles)} à ${Math.max(...tailles)})`);
  const c2Vivants = ANS.filter(an => SIEGES_ITA[an].C2.length > 0);
  ok(c2Vivants.length === 9 && c2Vivants.every(an => an <= 1998),
    `la Coupe des Coupes n'a de siège italien que jusqu'en 1998-99 (${c2Vivants.length} saisons), après elle n'existe plus`);
  ok(ANS.every(an => SIEGES_ITA[an].C1.length >= 1), "chaque saison a au moins un club italien en C1, le champion");
  // quelques faits nommés, chacun relevé sur le tableau de participants de son édition
  const faits = [
    [1990, "C1", "NAP", "Napoli, champion 1989-90, ouvre la C1 1990-91 devant Milan, tenant du titre"],
    [1991, "C1", "SAM", "la Sampdoria, championne 1990-91 pour la première fois, joue la C1 1991-92"],
    [1997, "C2", "VIC", "Vicenza joue la Coupe des Coupes 1997-98 par la Coppa Italia"],
    [1998, "C2", "LAZ", "la Lazio joue la dernière Coupe des Coupes, 1998-99"],
    [1999, "C1", "PAR", "Parme, quatrième, est en C1 1999-00 (éliminé au tour préliminaire, il n'est listé que là)"],
    [2002, "C3", "CHI", "le Chievo, cinquième de sa première Serie A, joue la Coupe UEFA 2002-03"],
    [2003, "C3", "PRG", "Perugia entre en Coupe UEFA 2003-04 par l'Intertoto"],
    [2006, "C3", "LVR", "Livourne joue la Coupe UEFA 2006-07"],
    [2007, "C3", "EMP", "Empoli joue la Coupe UEFA 2007-08"],
    [2009, "C3", "GEN", "le Genoa revient en Europe en Ligue Europa 2009-10"],
  ];
  for (const [an, k, id, dit] of faits) ok(SIEGES_ITA[an][k].includes(id), dit);
  ok(!["C1", "C2", "C3"].some(k => SIEGES_ITA[1991][k].includes("MIL")),
    "Milan n'est dans aucune coupe en 1991-92 : banni un an après la panne d'éclairage de Marseille");
  ok(!["C1", "C2", "C3"].some(k => SIEGES_ITA[2006][k].includes("JUV")),
    "la Juventus n'est dans aucune coupe en 2006-07 : reléguée en Serie B par le Calciopoli");
  ok(SIEGES_ITA[2006].C1.join() === "INT,ROM,MIL,CHI", "et la C1 2006-07 suit le classement corrigé : Inter, Roma, Milan, Chievo");
  ok(SIEGES_PAYS.ITA === SIEGES_ITA, "l'Italie lit la ligne de son année de départ, comme l'Angleterre");
  ok(SIEGES_PAYS.FR === null && SIEGES_PAYS.ANG === api.SIEGES_ANG, "la France et l'Angleterre gardent leur réglage");
}

/* ===== B) le plateau quitte le vivier, le tableau garde ses seize ===== */
console.log("\nB) Un club de Serie A n'est plus un adversaire d'Europe, et le tableau garde ses seize clubs");
try {
  const vivier = api.viviersEuroDe({ pays: "ITA", d1: ITA_D1, d2: ITA_D2 }).map(c => c.id);
  ok(vivier.length === EUROCLUBS.length - 6,
    `le vivier perd ses six clubs italiens partagés et tombe à ${vivier.length} au lieu de ${EUROCLUBS.length}`);
  ok(PARTAGES.every(id => !vivier.includes(id)), "la Juventus, Milan, l'Inter, la Roma, la Lazio et Parme ne sont plus dans le vivier");
  ok(vivier.includes("BAR") && vivier.includes("LIV"), "le reste est là, le Barça et Liverpool compris");
  const vivierANG = api.viviersEuroDe({ pays: "ANG", d1: ["ARS", "LIV"], d2: [] }).map(c => c.id);
  ok(PARTAGES.every(id => vivierANG.includes(id)), "et une carrière anglaise garde les six Italiens au vivier");

  const G = ouvreItalienne("NAP", 1995);
  ok((G.europe || []).length === EUROCLUBS.length - 6, "une carrière italienne ouvre sur le vivier amputé des six");
  const plateau = api.plateauEnCours();
  ok(plateau.size === 40 && ITA_D1.every(id => plateau.has(id)), "le plateau compte ses quarante clubs italiens");
  const doublons = G.europe.filter(c => plateau.has(c.id)).map(c => c.id);
  ok(doublons.length === 0, `aucun club du plateau ne traîne dans le vivier${doublons.length ? " — " + doublons.join(", ") : ""}`);
  fermeItalienne();

  for (const compet of ["C1", "C2", "C3"]) {
    for (const [clubId, cible] of [[SIEGES_ITA[1995][compet][0], compet], ["CRM", null]]) {
      const H = ouvreItalienne(clubId, 1995, cible);
      const quali = H.euroCompet === compet;
      const v = api.vivierEuro(compet, quali);
      const pl = api.plateauHorsVivier();
      const intrus = v.filter(id => pl.has(id) && !(SIEGES_ITA[1995][compet] || []).includes(id) && id !== H.monClub);
      ok(v.length === 16 && new Set(v).size === 16, `${compet}, ${quali ? "qualifié" : "non qualifié"} : seize clubs distincts au départ (${v.length})`);
      ok(intrus.length === 0, `${compet}, ${quali ? "qualifié" : "non qualifié"} : seuls les sièges italiens de 1995 viennent du championnat${intrus.length ? " — " + intrus.join(", ") : ""}`);
      fermeItalienne();
    }
  }
  const I = ouvreItalienne("CRM", 1995);
  ok(api.siegePays("C1") === "JUV" && api.siegePays("C2") === "PAR" && api.siegePays("C3") === "LAZ",
    "non qualifié en 1995-96 : la Juventus tient la C1, Parme la C2, la Lazio la C3");
  fermeItalienne();
  const J = ouvreItalienne("CRM", 1991);
  ok(api.siegePays("C1") === "SAM", "en 1991-92, c'est la Sampdoria qui tient la C1");
  fermeItalienne();
  // la France ne bouge pas : son tableau de C1 est celui d'avant, le vivier puis Nantes
  ouvreFrancaise();
  const vFR = api.vivierEuro("C1", false);
  ok(vFR.length === 16 && vFR[15] === "NAN" && vFR.slice(0, 15).join("|") === api.COMPETS.C1.pool.join("|"),
    "non-régression française : le tableau de C1 se lit comme avant, le vivier puis Nantes");
} finally { fermeItalienne(); }

/* ===== C) les étés internationaux vus d'Italie ===== */
console.log("\nC) L'été international se raconte d'Italie, et un seul est un sacre");
{
  const anFR = Object.keys(HONNEURS_PAYS.FR).map(Number).sort((a, b) => a - b);
  const anITA = Object.keys(HONNEURS_PAYS.ITA || {}).map(Number).sort((a, b) => a - b);
  ok(anITA.join(",") === anFR.join(","), `l'Italie raconte les mêmes onze étés que la France (${anITA.length})`);
  const sales = anITA.filter(a => /[<>"—]/.test(HONNEURS_PAYS.ITA[a]) || HONNEURS_PAYS.ITA[a].length < 60);
  ok(sales.length === 0, `aucune dépêche italienne n'est bâclée ni ne porte de chevron, de guillemet droit ou de tiret long${sales.length ? " — " + sales.join(", ") : ""}`);
  const vainqueurs = { 1992: "Danemark", 1994: "Brésil", 1996: "Allemagne", 1998: "France", 2000: "France",
    2002: "Brésil", 2004: "Grèce", 2006: "Italie", 2008: "Espagne", 2010: "Espagne", 2012: "Espagne" };
  const faux = anITA.filter(a => !new RegExp(vainqueurs[a], "i").test(HONNEURS_PAYS.ITA[a]));
  ok(faux.length === 0, `l'été italien nomme le même vainqueur que l'été français${faux.length ? " — " + faux.join(", ") : ""}`);
  const muets = anITA.filter(a => !/Italie/i.test(HONNEURS_PAYS.ITA[a]));
  ok(muets.length === 0, `chaque été italien parle de l'Italie${muets.length ? " — " + muets.join(", ") : ""}`);
  const bleus = anITA.filter(a => /les Bleus|LA FRANCE/.test(HONNEURS_PAYS.ITA[a]));
  ok(bleus.length === 0, "aucun été italien ne porte le marqueur de sacre français");
  const sacres = anITA.filter(a => HONNEURS_PAYS.ITA[a].includes(PAYS.ITA.triomphe));
  ok(sacres.join(",") === "2006", `un seul été porte « ${PAYS.ITA.triomphe} », et c'est 2006 (${sacres.join(",") || "aucun"})`);
  ok(/Grosso/.test(HONNEURS_PAYS.ITA[2006]) && /Berlin/i.test(HONNEURS_PAYS.ITA[2006]), "2006 : Berlin, et le dernier tir au but de Grosso");
  ok(/Baggio/.test(HONNEURS_PAYS.ITA[1994]) && /Trezeguet/.test(HONNEURS_PAYS.ITA[2000]) && /Kiev/.test(HONNEURS_PAYS.ITA[2012]),
    "les trois finales perdues sont là, sans marqueur : Baggio en 1994, Trezeguet en 2000, Kiev en 2012");
  ok(HONNEURS_PAYS.FR[1998] === "ÉTÉ 98 · COUPE DU MONDE EN FRANCE : LA FRANCE CHAMPIONNE DU MONDE ! Un 3-0 en finale qui restera à jamais.",
    "non-régression française : l'été 98 est mot pour mot celui d'avant");
  ok(Object.values(HONNEURS_PAYS.ANG).every(t => !t.includes(PAYS.ANG.triomphe)), "et aucun été anglais n'est devenu un sacre");
  voitPays("ITA", 1995, false);
  const eITA = honneurEte(2006);
  voitPays("FR", 1995, false);
  ok(eITA === HONNEURS_PAYS.ITA[2006] && honneurEte(2006) === HONNEURS_PAYS.FR[2006], "honneurEte rend l'été du pays regardé");
  // sur le terrain : l'été 2006 d'une carrière italienne fête ses internationaux
  const G = ouvreItalienne("MIL", 2005);
  for (const j of api.clubById("MIL").joueurs) j.note = Math.max(j.note, 86);
  api.selections();
  api.intersaison();
  const recap = (G.recap || []).join(" | ");
  ok(recap.includes("L'ITALIE SACRÉE À BERLIN") && recap.includes("revient au club en CHAMPION"),
    "l'été 2006 d'une carrière italienne sacre l'Italie, et ses internationaux rentrent en héros");
  fermeItalienne();
  const H = ouvreItalienne("MIL", 1999);
  for (const j of api.clubById("MIL").joueurs) j.note = Math.max(j.note, 86);
  api.selections();
  api.intersaison();
  const r2 = (H.recap || []).join(" | ");
  ok(r2.includes("Trezeguet") && !r2.includes("revient au club en CHAMPION"),
    "l'été 2000, finale perdue, ne fête personne");
  fermeItalienne();
}

/* ===== D) la sélection nationale ===== */
console.log("\nD) La sélection nationale est l'Italie");
{
  ok(PAYS.ITA.nat === "ITA", "le pays porte sa nationalité locale, ITA");
  const G = ouvreItalienne("JUV");
  voitPays("ITA", 1995, true);
  ok(api.natPays() === "ITA", "en carrière italienne, la nationalité locale est ITA");
  const c = api.clubById("JUV");
  const generes = c.joueurs.filter(j => !j.reel);
  ok(generes.length > 0 && generes.every(j => j.nat === "ITA"), `les ${generes.length} joueurs générés de l'effectif sont italiens`);
  const local = c.joueurs[0], etranger = c.joueurs[1];
  local.note = 90; local.selA = false; delete local.nat;
  etranger.note = 90; etranger.selA = false; etranger.nat = "FR";
  api.selections();
  ok(local.selA === true && !etranger.selA, "l'Italien qui passe 84 est appelé, le Français du vestiaire ne l'est pas");
  fermeItalienne();
}

/* ===== E) les noms procéduraux ===== */
console.log("\nE) Un deuxième gardien italien ne s'appelle ni Dubreuil ni Ramsbottom");
{
  ok(NOMS_ITA.length >= 50, `le vivier italien compte ${NOMS_ITA.length} patronymes`);
  ok(new Set(NOMS_ITA).size === NOMS_ITA.length, "aucun doublon à l'intérieur du vivier italien");
  const communs = NOMS_ITA.filter(n => NOMS.includes(n) || NOMS_ANG.includes(n));
  ok(communs.length === 0, `aucun patronyme commun avec les viviers français et anglais${communs.length ? " — " + extrait(communs) : ""}`);
  const sales = NOMS_ITA.concat(PRENOMS_ITA).filter(n => /[<>"&'—]/.test(n));
  ok(sales.length === 0, `aucun nom ne porte de caractère qui ouvre une balise ni d'apostrophe${sales.length ? " — " + sales.join(", ") : ""}`);
  ok(api.NOMS_TOUS.length === NOMS.length + NOMS_ANG.length && NOMS_ITA.every(n => api.NOMS_LUS.has(n)),
    "NOMS_TOUS reste l'union d'ANG-D, et la lecture (NOMS_LUS) connaît les patronymes italiens");
  // LE CONTRÔLE QUI COMPTE : aucun patronyme italien ne collisionne avec un nom CURÉ du jeu
  const cures = new Set();
  for (const m of script.matchAll(/\["([^"\]]{2,40}?)","[GDMA]"/g)) cures.add(m[1]);
  for (const m of script.matchAll(/"([A-ZÀ-Ý][^"]{1,30})":"/g)) cures.add(m[1]);
  const fam = new Set();
  for (const n of cures) { const p = n.split(" "); fam.add(p[p.length - 1]); if (p.length > 1) fam.add(p.slice(1).join(" ")); }
  const collisions = NOMS_ITA.filter(n => fam.has(n));
  ok(collisions.length === 0,
    `aucun des ${NOMS_ITA.length} patronymes italiens ne porte le nom d'un joueur curé (${fam.size} patronymes relevés)${collisions.length ? " — " + extrait(collisions) : ""}`);
  const trous = [];
  for (const i of PRENOMS_ITA) for (const f of NOMS_ITA) if (!api.prenomDe(i + " " + f)) trous.push(i + " " + f);
  ok(trous.length === 0, `les ${PRENOMS_ITA.length * NOMS_ITA.length} combinaisons italiennes ont un prénom${trous.length ? " — " + extrait(trous) : ""}`);
  ok(!PRENOMS_ITA.some(i => /^[HJKWY]\./.test(i)), "pas d'initiale que l'italien n'emploie pas (H, J, K, W, Y)");
  ok(ORIGINES.ita && ORIGINES.ita.length >= 6 && PRENOMS_GEN.ita && PRENOMS_GEN.ita.length >= 40,
    `l'origine italienne a ${ORIGINES.ita.length} récits et ${PRENOMS_GEN.ita.length} prénoms`);
  const origFausse = NOMS_ITA.filter(f => api.origineDuNom("M. " + f) !== "ita");
  ok(origFausse.length === 0, `chaque patronyme italien rend l'origine « ita »${origFausse.length ? " — " + extrait(origFausse) : ""}`);
  ok(NOMS.every(f => api.origineDuNom("M. " + f) !== "ita") && NOMS_ANG.every(f => api.origineDuNom("M. " + f) === "ang"),
    "et aucun patronyme français ou anglais ne change d'origine");
  const G = ouvreItalienne("ROM");
  const patronyme = j => j.nom.split(" ").slice(1).join(" ");
  const tous = G.clubs.concat(G.autre).flatMap(c => c.joueurs).filter(j => !j.reel);
  const faux = tous.filter(j => !NOMS_ITA.includes(patronyme(j)));
  ok(tous.length > 600 && faux.length === 0,
    `les ${tous.length} joueurs fabriqués des deux divisions portent un nom italien${faux.length ? " — " + extrait(faux.map(j => j.nom)) : ""}`);
  const histoires = tous.filter(j => j.histoire);
  const recitAilleurs = histoires.filter(j => /Bondy|bretonne|lorrain|phocéenne|Hackney|Durham|Yorkshire/.test(j.histoire));
  ok(histoires.length > 0 && recitAilleurs.length === 0, `les ${histoires.length} biographies se passent en Italie`);
  fermeItalienne();
  const H = ouvreFrancaise();
  const tousFR = H.clubs.concat(H.autre).flatMap(c => c.joueurs).filter(j => !j.reel);
  ok(!tousFR.some(j => NOMS_ITA.includes(patronyme(j))), "non-régression française : aucun nom italien fabriqué en Division 2");
}

/* ===== F) les petits clubs de la Coppa Italia ===== */
console.log("\nF) La Coppa Italia se joue contre les petits clubs italiens");
{
  ok(CLUBS_AMATEURS_ITA.length >= 24, `vingt-quatre petits clubs au minimum, la liste italienne en compte ${CLUBS_AMATEURS_ITA.length}`);
  const ids = api.AMATEURS_TOUS.map(a => a.id);
  ok(ids.length === CLUBS_AMATEURS.length + CLUBS_AMATEURS_ANG.length + CLUBS_AMATEURS_ITA.length && new Set(ids).size === ids.length,
    "la lecture balaie les trois listes, et aucun identifiant n'y est partagé");
  const champs = CLUBS_AMATEURS_ITA.filter(a => !a.id || !a.nom || !a.ville || !(a.force >= 41 && a.force <= 50));
  ok(champs.length === 0, `chaque club a son nom, sa ville et une force dans la fourchette 41-50${champs.length ? " — " + extrait(champs.map(a => a.id)) : ""}`);
  const sales = CLUBS_AMATEURS_ITA.filter(a => /[<>"&']/.test(a.nom + a.ville));
  ok(sales.length === 0, `aucun nom ne porte d'esperluette, d'apostrophe ni de chevron${sales.length ? " — " + extrait(sales.map(a => a.nom)) : ""}`);
  const pros = CLUBS_ITA.map(c => c.nom);
  // par le nom exact, pas par morceau : « Alma Juventus Fano » n'est pas la Juventus
  const deja = CLUBS_AMATEURS_ITA.filter(a => pros.some(n => n === a.nom || n === "AC " + a.nom || n === "AS " + a.nom));
  ok(deja.length === 0, `aucun n'est l'un des soixante-quatorze clubs d'ITA-A${deja.length ? " — " + extrait(deja.map(a => a.nom)) : ""}`);
  const G = ouvreItalienne("FIO");
  const idsITA = new Set(CLUBS_AMATEURS_ITA.map(a => a.id));
  const petits = G.coupe.vivants.filter(id => api.estAmateur(id));
  ok(petits.length === 24 && petits.every(id => idsITA.has(id)), `le tableau italien compte vingt-quatre petits clubs, tous italiens (${petits.length})`);
  ok(idsITA.has(G.coupe.poucetId), "le Petit Poucet est italien");
  fermeItalienne();
  const H = ouvreFrancaise();
  const idsFR = new Set(CLUBS_AMATEURS.map(a => a.id));
  const pFR = H.coupe.vivants.filter(id => api.estAmateur(id));
  ok(pFR.length === 24 && pFR.every(id => idsFR.has(id)), "non-régression française : vingt-quatre villages, tous français");
}

/* ===== G) les incidents propres à un pays ===== */
console.log("\nG) Ni Minitel ni bac en Italie, mais la taupe du journal rose et la maturità");
{
  const carte = id => INCIDENTS.find(i => i.id === id);
  const talpa = carte("talpa_rosa"), mat = carte("maturita"), taupe = carte("taupe_tabloid"), alev = carte("alevels");
  ok(talpa && talpa.pays === "ITA" && mat && mat.pays === "ITA", "les deux jumeaux italiens existent et sont réservés à l'Italie");
  ok(talpa.poids === taupe.poids && talpa.choix.length === taupe.choix.length,
    "la taupe italienne a le poids et les choix de ses jumelles");
  ok(mat.poids === alev.poids && mat.pondJeune === alev.pondJeune && mat.choix.length === alev.choix.length && mat.bon === alev.bon,
    "la maturità a le poids, la pondération des jeunes et les choix du bac et des A-levels");
  ok(String(talpa.test) === String(taupe.test) && String(mat.test) === String(alev.test), "et les mêmes conditions de tirage");
  const G = ouvreItalienne("LAZ");
  const vus = new Set();
  for (let i = 0; i < 1500; i++) { G.incidentsRecents = []; const r = api.tireIncident(); if (r && r.inc) vus.add(r.inc.id); }
  ok(!["minitel_corbeau", "bac", "taupe_tabloid", "alevels"].some(id => vus.has(id)),
    `sur ${vus.size} cartes vues en Italie, ni le Minitel, ni le bac, ni le tabloïd, ni les A-levels`);
  ok(vus.has("talpa_rosa"), "mais bien la taupe du journal rose");
  const sujet = api.clubById(G.monClub).joueurs;
  const rendus = [];
  for (const id of ["parfum", "bebe_celebration", "vhs_espion", "chasse", "talpa_rosa", "maturita"]) {
    const inc = carte(id);
    for (const ch of inc.choix) for (let n = 0; n < 6; n++) rendus.push(String(ch.issue(sujet[0], sujet[1])));
  }
  const restes = rendus.filter(t => /France|français|Angleterre/i.test(t));
  ok(restes.length === 0, `les ${rendus.length} dénouements rendus en Italie ne disent ni France ni Angleterre${restes.length ? " — " + extrait(restes) : ""}`);
  ok(rendus.some(t => /Italie/.test(t)), "et plusieurs disent « Italie »");
  fermeItalienne();
  ouvreFrancaise();
  const vusFR = new Set();
  for (let i = 0; i < 1500; i++) { api.getG().incidentsRecents = []; const r = api.tireIncident(); if (r && r.inc) vusFR.add(r.inc.id); }
  ok(!vusFR.has("talpa_rosa") && !vusFR.has("maturita"), "non-régression française : aucune carte italienne en France");
}

/* ===== H) les éternels seconds ===== */
console.log("\nH) Jamais champion d'Italie, et la Sampdoria qui l'est enfin en 1991");
{
  const champions = ["JUV", "INT", "MIL", "GEN", "TOR", "BGN", "NAP", "ROM", "LAZ", "FIO", "CAG", "HEL"];
  const fantomes = [...JAMAIS_CHAMPION_ITA].filter(id => !CODES_ITA.has(id));
  ok(fantomes.length === 0, `tous les jamais-champions existent dans CLUBS_ITA${fantomes.length ? " — " + extrait(fantomes) : ""}`);
  ok(champions.every(id => !JAMAIS_CHAMPION_ITA.has(id)), "les douze clubs déjà champions avant 1990 n'y sont pas");
  ok(JAMAIS_CHAMPION_ITA.size === 62 && champions.length + JAMAIS_CHAMPION_ITA.size === CLUBS_ITA.length,
    `les deux listes couvrent les soixante-quatorze clubs sans trou (${champions.length} + ${JAMAIS_CHAMPION_ITA.size})`);
  ok(JAMAIS_CHAMPION_ITA.has("SAM") && api.PREMIER_TITRE_PAYS.ITA.SAM === 1990 && Object.keys(api.PREMIER_TITRE_PAYS.ITA).length === 1,
    "la Sampdoria est la seule à décrocher son premier titre dans la fenêtre, en 1990-91");
  ok(JAMAIS_CHAMPION_ITA.has("SPE") && JAMAIS_CHAMPION_ITA.has("PAR") && JAMAIS_CHAMPION_ITA.has("LVR"),
    "La Spezia (une décoration, pas un titre), Parme et Livourne (deuxièmes, jamais premiers) en sont");
  voitPays("ITA", 1990, false);
  ok(api.jamaisChampion("SAM", 1990) && !api.jamaisChampion("SAM", 1991), "en Italie : la Sampdoria est maudite en 1990-91, plus après");
  ok(api.jamaisChampion("UDI", 2000) && !api.jamaisChampion("JUV", 2000), "Udinese attend toujours, la Juventus non");
  ok(!api.jamaisChampion("AJA", 1995) && !api.jamaisChampion("WHU", 1995), "un code français ou anglais ne répond pas au registre italien");
  voitPays("FR", 1995, false);
  ok(api.jamaisChampion("AJA", 1994) && !api.jamaisChampion("AJA", 1996) && JAMAIS_CHAMPION.size === 15,
    "non-régression française : Auxerre maudit avant 1995, le registre intact");
  voitPays("ANG", 1995, false);
  ok(api.jamaisChampion("WHU", 1995) && JAMAIS_CHAMPION_ANG.size === 49, "non-régression anglaise : West Ham attend toujours, quarante-neuf clubs");
  voitPays("FR", 1995, false);
}

/* ===== I) une saison italienne entière ===== */
console.log("\nI) Une saison jouée pour de vrai en Italie");
{
  const G = ouvreItalienne("SAM", 1995);
  let erreur = null;
  try { for (let i = 0; i < 38; i++) api.jouerJournee(); api.intersaison(); for (let i = 0; i < 10; i++) api.jouerJournee(); }
  catch (e) { erreur = e; }
  ok(!erreur, "trente-huit journées italiennes, une intersaison et dix journées de plus, sans une exception" + (erreur ? " — " + erreur.message : ""));
  const patronyme = j => j.nom.split(" ").slice(1).join(" ");
  const tous = G.clubs.concat(G.autre).flatMap(c => c.joueurs).filter(j => !j.reel);
  const intrus = tous.filter(j => !NOMS_ITA.includes(patronyme(j)));
  ok(intrus.length === 0, `après l'intersaison, les ${tous.length} joueurs fabriqués portent toujours des noms italiens${intrus.length ? " — " + extrait(intrus.map(j => j.nom)) : ""}`);
  const idsITA = new Set(CLUBS_AMATEURS_ITA.map(a => a.id));
  const petits = (G.coupe.vivants || []).filter(id => api.estAmateur(id));
  ok(petits.every(id => idsITA.has(id)), "le nouveau tableau de coupe est italien lui aussi");
  /* Même exception documentée qu'en Angleterre : le recruteur italien n'existe pas encore (c'est l'équivalent
     d'ANG-F (a), une journée de curation à part), et ses étiquettes de profil sont des clés de sauvegarde. */
  const lignes = (G.news || []).concat(G.presse || [], G.recap || []).map(String);
  const restes = lignes.filter(t => /\bFrance\b|français|Angleterre|anglais/i.test(t) &&
    !/\(Français (?:de l'étranger|en quête de come-back)\)/.test(t) && !/ÉTÉ \d+ ·/.test(t));
  ok(restes.length === 0,
    "rien de ce que la saison a écrit ne nomme la France ou l'Angleterre, hors étiquettes du recruteur et étés internationaux" + (restes.length ? " — " + extrait(restes) : ""));
  fermeItalienne();
}

console.log(FAILS ? "\n✗ " + FAILS + " CONTRÔLE(S) EN ÉCHEC" : "\n✓ TOUT EST VERT");
process.exit(FAILS ? 1 : 0);
