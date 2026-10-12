/* Harnais de validation — LES TEXTES VUS D'ANGLETERRE (ANG-D, v1.91)
   Quatrième étape du lot structure qui précède l'Angleterre. Aucune saison anglaise n'est encore jouable :
   ce qui se vérifie ici, c'est que le jeu ne dit plus « France » sans le savoir, et SURTOUT qu'une partie
   française ne change pas d'un caractère.
   A) les étés internationaux par pays : onze étés chacun, et pas un mot de travers
   B) le marqueur de SACRE est propre au pays, et aucun été anglais ne le porte (1990-2012)
   C) la sélection nationale appelle les joueurs du PAYS de la carrière, pas les Français
   D) les noms procéduraux : un vivier de patronymes par pays, contrôlé contre tous les noms curés
   E) les petits clubs de la coupe : vingt-huit clubs anglais, et le tirage ne mélange jamais les pays
   F) les dépêches, la presse et les incidents : plus un « France » dans une carrière anglaise
   G) les éternels seconds : quarante-neuf clubs anglais jamais champions, et aucun premier titre
   H) et tout cela tient une saison entière jouée pour de vrai, dans les deux pays
   Usage : node harness-textes-ang.cjs                                                                  */
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

const epilogue = "\n;return {PAYS,HONNEURS_PAYS,honneurEte,voitPays,paysVu,natPays,leP,LeP,duP,adjPays,adjPaysM," +
  "titreChampion,NOMS,NOMS_ANG,PRENOMS,PRENOMS_ANG,NOMS_TOUS,nomsGen,prenomsGen,PRENOMS_GEN,ORIGINES,origineDuNom," +
  "prenomDe,genJoueur,genHistoire,CLUBS_AMATEURS,CLUBS_AMATEURS_ANG,AMATEURS_TOUS,clubsAmateurs,estAmateur,amaById," +
  "coupeInit,INCIDENTS,tireIncident,selections,jamaisChampion,JAMAIS_CHAMPION,JAMAIS_CHAMPION_ANG,PREMIER_TITRE," +
  "PREMIER_TITRE_PAYS,CLUBS_ANG,CLUBS,CLUBS_D2,SAISONS,SAISON_DEFAUT,SIEGES_ANG,nouvellePartie,jouerJournee," +
  "intersaison,clubById,esc,anneeJeu,eff," +
  "getG:function(){return G;},setG:function(x){G=x;}};";
const api = new Function(script + epilogue)();
const { PAYS, HONNEURS_PAYS, honneurEte, voitPays, NOMS, NOMS_ANG, PRENOMS, PRENOMS_ANG, NOMS_TOUS,
  PRENOMS_GEN, ORIGINES, CLUBS_AMATEURS, CLUBS_AMATEURS_ANG, CLUBS_ANG, SAISONS, SIEGES_ANG,
  JAMAIS_CHAMPION, JAMAIS_CHAMPION_ANG, INCIDENTS } = api;

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const extrait = l => l.slice(0, 6).join(", ") + (l.length > 6 ? " (+" + (l.length - 6) + ")" : "");

/* Un plateau anglais d'ESSAI, repris de harness-europe-ang : vingt clubs de l'élite, vingt de
   l'échelon du dessous, effectifs PROCÉDURAUX exprès — c'est justement eux qu'on vient regarder. */
const ANG_D1 = ["ARS", "AVL", "BLB", "BOL", "CHE", "COV", "EVE", "LEE", "LIV", "MCI",
  "MUN", "MID", "NEW", "FOR", "QPR", "SHW", "SOU", "TOT", "WHU", "WIM"];
const CLE_ANG = "ANG-1995-96";
function ouvreAnglaise(clubId, an = 1995) {
  SAISONS[CLE_ANG] = {
    pays: "ANG", an, titre: an + "-" + String((an + 1) % 100).padStart(2, "0"), nom: "Essai du harnais",
    d1: ANG_D1, d2: CLUBS_ANG.map(c => c.id).filter(id => !ANG_D1.includes(id)).slice(0, 20),
    starsD1: {}, starsD2: {},
    euroC1: SIEGES_ANG[an].C1, euroC2: SIEGES_ANG[an].C2, euroC3: SIEGES_ANG[an].C3,
    sous: "Saison d'essai, retirée aussitôt.",
  };
  api.nouvellePartie(clubId || ANG_D1[0], CLE_ANG);
  return api.getG();
}
function fermeAnglaise() { delete SAISONS[CLE_ANG]; }
function ouvreFrancaise(cle) { api.nouvellePartie(SAISONS[cle || api.SAISON_DEFAUT].d1[0], cle || api.SAISON_DEFAUT); return api.getG(); }

/* ===== A) les étés internationaux, par pays ===== */
console.log("A) L'été international se raconte du pays où l'on joue");
{
  const codes = Object.keys(HONNEURS_PAYS);
  ok(codes.includes("FR") && codes.includes("ANG"), `la table des étés connaît ${codes.join(", ")}`);
  const anFR = Object.keys(HONNEURS_PAYS.FR).map(Number).sort((a, b) => a - b);
  const anANG = Object.keys(HONNEURS_PAYS.ANG).map(Number).sort((a, b) => a - b);
  ok(anFR.join(",") === anANG.join(","),
    `les deux pays racontent EXACTEMENT les mêmes étés (${anFR.length}) : ${anFR[0]} → ${anFR[anFR.length - 1]}`);
  ok(anFR.every(a => a % 2 === 0) && anFR[0] === 1992 && anFR[anFR.length - 1] === 2012,
    "ce sont bien les onze étés pairs de 1992 à 2012, les seuls qui portent un grand tournoi");
  const tous = codes.flatMap(c => Object.entries(HONNEURS_PAYS[c]).map(([a, t]) => [c + " " + a, t]));
  const sales = tous.filter(([, t]) => /[<>"—]/.test(t));
  ok(sales.length === 0, `aucune dépêche ne porte de chevron, de guillemet droit ni de tiret long${sales.length ? " — " + extrait(sales.map(x => x[0])) : ""}`);
  const vides = tous.filter(([, t]) => !t || t.length < 60);
  ok(vides.length === 0, `aucune dépêche bâclée, la plus courte fait ${Math.min(...tous.map(x => x[1].length))} signes`);
  // le vainqueur d'un tournoi est le même partout : c'est le MÊME été, vu d'ailleurs
  const vainqueurs = { 1992: "Danemark", 1994: "Brésil", 1996: "Allemagne", 1998: "France", 2000: "France",
    2002: "Brésil", 2004: "Grèce", 2006: "Italie", 2008: "Espagne", 2010: "Espagne", 2012: "Espagne" };
  const faux = anFR.filter(a => !new RegExp(vainqueurs[a], "i").test(HONNEURS_PAYS.ANG[a]));
  ok(faux.length === 0, `l'été anglais nomme le même vainqueur que l'été français, année par année${faux.length ? " — " + faux.join(", ") : ""}`);
  // la version anglaise parle de l'Angleterre, pas de la France
  // insensible à la casse : l'été 96 crie « EURO EN ANGLETERRE », c'est le tournoi à la maison
  const muets = anFR.filter(a => !/Angleterre/i.test(HONNEURS_PAYS.ANG[a]));
  ok(muets.length === 0, `les onze étés anglais parlent du pays${muets.length ? " — " + muets.join(", ") : ""}`);
  const bleus = anFR.filter(a => /les Bleus|LA FRANCE/.test(HONNEURS_PAYS.ANG[a]));
  ok(bleus.length === 0, `et aucun ne parle des Bleus${bleus.length ? " — " + bleus.join(", ") : ""}`);
  // non-régression : les étés français n'ont pas bougé d'un caractère
  ok(HONNEURS_PAYS.FR[1998] === "ÉTÉ 98 · COUPE DU MONDE EN FRANCE : LA FRANCE CHAMPIONNE DU MONDE ! Un 3-0 en finale qui restera à jamais.",
    "l'été 98 français est identique à l'octet près");
  ok(HONNEURS_PAYS.FR[2000] === "ÉTÉ 2000 · Euro : LA FRANCE RÉALISE LE DOUBLÉ ! But en or en finale contre l'Italie.",
    "l'été 2000 français aussi");
  ok(/Knysna/.test(HONNEURS_PAYS.FR[2010]) && /Bloemfontein/.test(HONNEURS_PAYS.ANG[2010]),
    "le même Mondial 2010 laisse Knysna à la France et Bloemfontein à l'Angleterre");
  // honneurEte suit le pays REGARDÉ
  voitPays("FR", 1995, false);
  const eFR = honneurEte(1998);
  voitPays("ANG", 1995, false);
  const eANG = honneurEte(1998);
  ok(eFR !== eANG && eFR === HONNEURS_PAYS.FR[1998] && eANG === HONNEURS_PAYS.ANG[1998],
    "honneurEte rend l'été du pays regardé, et pas celui du voisin");
  ok(honneurEte(1997) === undefined, "un été sans tournoi reste muet, comme avant");
  voitPays("FR", 1995, false);
}

/* ===== B) le marqueur de sacre ===== */
console.log("\nB) Le sacre est une affaire de pays, et l'Angleterre n'en a aucun à fêter");
{
  ok(PAYS.FR.triomphe === "LA FRANCE", "le marqueur français est inchangé : « LA FRANCE »");
  const m = PAYS.ANG.triomphe;
  const porteurs = Object.entries(HONNEURS_PAYS.ANG).filter(([, t]) => t.includes(m)).map(([a]) => a);
  ok(porteurs.length === 0,
    `aucun des onze étés anglais ne porte le marqueur « ${m} » : entre 1966 et 2010, le pays n'a rien gagné${porteurs.length ? " — " + porteurs.join(", ") : ""}`);
  // et le piège d'origine tient toujours côté français : seuls 1998 et 2000 sont des sacres
  const sacresFR = Object.entries(HONNEURS_PAYS.FR).filter(([, t]) => t.includes(PAYS.FR.triomphe)).map(([a]) => +a);
  ok(sacresFR.sort((a, b) => a - b).join(",") === "1998,2000",
    "côté français, exactement deux étés sont lus comme un triomphe : 1998 et 2000");
  // sur le terrain : l'intersaison d'une carrière anglaise écrit la dépêche anglaise et ne fête personne
  const G = ouvreAnglaise("MUN", 1997); // l'été 98 tombe à la première intersaison
  for (const j of api.clubById("MUN").joueurs) { j.note = Math.max(j.note, 86); }
  api.selections();
  api.intersaison();
  const recap = (G.recap || []).join(" | ");
  ok(recap.includes("Coupe du monde en France") && !recap.includes("CHAMPIONNE DU MONDE"),
    "l'été 98 d'une carrière anglaise raconte le sacre des autres, pas le sien");
  ok(!recap.includes("revient au club en CHAMPION"),
    "et personne ne revient au club en champion du monde : la fête ne se déclenche pas");
  fermeAnglaise();
  // le même été, dans une carrière française, fête bien ses internationaux
  const H = ouvreFrancaise("1997-98");
  for (const j of api.clubById(H.monClub).joueurs) j.note = Math.max(j.note, 86);
  api.selections();
  api.intersaison();
  const recFR = (H.recap || []).join(" | ");
  ok(recFR.includes("LA FRANCE CHAMPIONNE DU MONDE") && recFR.includes("revient au club en CHAMPION"),
    "non-régression française : l'été 98 sacre la France et ses internationaux rentrent en héros");
}

/* ===== C) la sélection nationale ===== */
console.log("\nC) La sélection nationale est celle du pays de la carrière");
{
  ok(PAYS.FR.nat === "FR" && PAYS.ANG.nat === "ANG", "chaque pays porte sa nationalité locale");
  const G = ouvreAnglaise("ARS");
  voitPays("ANG", 1995, true);
  ok(api.natPays() === "ANG", "en carrière anglaise, la nationalité locale est ANG");
  const c = api.clubById("ARS");
  const generes = c.joueurs.filter(j => !j.reel);
  ok(generes.length > 0 && generes.every(j => j.nat === "ANG"),
    `les ${generes.length} joueurs générés de l'effectif sont anglais, plus français par défaut`);
  // un joker français signé en Angleterre n'est pas appelé par l'Angleterre
  const local = c.joueurs[0], etranger = c.joueurs[1];
  local.note = 90; local.selA = false; delete local.nat;
  etranger.note = 90; etranger.selA = false; etranger.nat = "FR";
  api.selections();
  ok(local.selA === true, "un joueur du pays qui passe 84 est appelé en sélection nationale");
  ok(!etranger.selA, "un Français du vestiaire anglais ne l'est pas : la sélection sait de quel pays elle est");
  fermeAnglaise();
  // non-régression : en France, rien ne change
  const H = ouvreFrancaise();
  const d = api.clubById(H.monClub);
  const fr = d.joueurs[0], ext = d.joueurs[1];
  fr.note = 90; fr.selA = false; delete fr.nat;
  ext.note = 90; ext.selA = false; ext.nat = "ETR";
  api.selections();
  ok(fr.selA === true && !ext.selA, "non-régression française : le Français est appelé, l'étranger non");
}

/* ===== D) les noms procéduraux ===== */
console.log("\nD) Un deuxième gardien anglais ne s'appelle pas Dubreuil");
{
  ok(NOMS_ANG.length >= 50, `le vivier anglais compte ${NOMS_ANG.length} patronymes (${NOMS.length} côté français)`);
  const doublons = NOMS_ANG.filter(n => NOMS.includes(n));
  ok(doublons.length === 0, `aucun patronyme commun aux deux viviers${doublons.length ? " — " + extrait(doublons) : ""}`);
  ok(new Set(NOMS_ANG).size === NOMS_ANG.length, "aucun doublon à l'intérieur du vivier anglais");
  ok(NOMS_TOUS.length === NOMS.length + NOMS_ANG.length, "la lecture travaille sur l'union des deux viviers");
  const sales = NOMS_ANG.concat(PRENOMS_ANG).filter(n => /[<>"&'—]/.test(n));
  ok(sales.length === 0, `aucun nom ne porte de caractère qui ouvre une balise${sales.length ? " — " + sales.join(", ") : ""}`);
  // LE CONTRÔLE QUI COMPTE : aucun patronyme anglais ne collisionne avec un nom CURÉ du jeu
  const cures = new Set();
  for (const m of script.matchAll(/\["([^"\]]{2,40}?)","[GDMA]"/g)) cures.add(m[1]);
  for (const m of script.matchAll(/"([A-ZÀ-Ý][^"]{1,30})":"/g)) cures.add(m[1]);
  const fam = new Set();
  for (const n of cures) { const p = n.split(" "); fam.add(p[p.length - 1]); if (p.length > 1) fam.add(p.slice(1).join(" ")); }
  const collisions = NOMS_ANG.filter(n => fam.has(n));
  ok(collisions.length === 0,
    `aucun des ${NOMS_ANG.length} patronymes anglais ne porte le nom d'un joueur curé (${fam.size} patronymes relevés dans le fichier)${collisions.length ? " — " + extrait(collisions) : ""}`);
  // les initiales anglaises ne sont pas les françaises
  ok(PRENOMS_ANG.includes("I.") && PRENOMS_ANG.includes("W.") && !PRENOMS_ANG.includes("Y."),
    "les initiales anglaises accueillent I. et W. (Ian, Wayne) et laissent tomber Y.");
  // chaque combinaison initiale × patronyme anglais a un prénom, comme en France
  const trous = [];
  for (const i of PRENOMS_ANG) for (const f of NOMS_ANG) {
    const nom = i + " " + f;
    if (!api.prenomDe(nom)) trous.push(nom);
  }
  ok(trous.length === 0, `les ${PRENOMS_ANG.length * NOMS_ANG.length} combinaisons anglaises ont un prénom${trous.length ? " — " + extrait(trous) : ""}`);
  ok(ORIGINES.ang && ORIGINES.ang.length >= 6 && PRENOMS_GEN.ang && PRENOMS_GEN.ang.length >= 40,
    `l'origine anglaise a ${ORIGINES.ang.length} récits et ${PRENOMS_GEN.ang.length} prénoms d'époque`);
  const origFausse = NOMS_ANG.filter(f => api.origineDuNom("M. " + f) !== "ang");
  ok(origFausse.length === 0, `chaque patronyme anglais rend l'origine « ang »${origFausse.length ? " — " + extrait(origFausse) : ""}`);
  const origFR = NOMS.filter(f => api.origineDuNom("M. " + f) === "ang");
  ok(origFR.length === 0, "et aucun patronyme français ne devient anglais au passage");
  // sur le terrain : un effectif anglais procédural porte des noms anglais
  const G = ouvreAnglaise("LIV");
  const patronyme = j => j.nom.split(" ").slice(1).join(" ");
  const tous = G.clubs.concat(G.autre).flatMap(c => c.joueurs).filter(j => !j.reel);
  const faux = tous.filter(j => NOMS.includes(patronyme(j)));
  ok(tous.length > 600 && faux.length === 0,
    `les ${tous.length} joueurs des deux divisions anglaises portent un nom anglais, pas un seul français${faux.length ? " — " + extrait(faux.map(j => j.nom)) : ""}`);
  const histoires = tous.filter(j => j.histoire);
  const recitFR = histoires.filter(j => /Bondy|bretonne|lorrain|phocéenne|sous-préfecture/.test(j.histoire));
  ok(histoires.length > 0 && recitFR.length === 0,
    `les ${histoires.length} biographies parlent de Hackney Marshes et du comté de Durham, plus de Bondy`);
  fermeAnglaise();
  const H = ouvreFrancaise();
  const tousFR = H.clubs.concat(H.autre).flatMap(c => c.joueurs).filter(j => !j.reel);
  const faussesANG = tousFR.filter(j => NOMS_ANG.includes(patronyme(j)));
  ok(faussesANG.length === 0, "non-régression française : aucun Ramsbottom n'apparaît en Division 2");
}

/* ===== E) les petits clubs de la coupe ===== */
console.log("\nE) La coupe se joue contre les petits clubs du pays");
{
  ok(CLUBS_AMATEURS_ANG.length >= 24,
    `vingt-quatre petits clubs au minimum, la liste anglaise en compte ${CLUBS_AMATEURS_ANG.length} (${CLUBS_AMATEURS.length} côté français)`);
  ok(CLUBS_AMATEURS.length >= 24, "la liste française tient toujours ses vingt-quatre");
  const ids = api.AMATEURS_TOUS.map(a => a.id);
  ok(new Set(ids).size === ids.length, "aucun identifiant partagé entre les deux listes : amaById ne se trompe jamais d'homme");
  const champs = CLUBS_AMATEURS_ANG.filter(a => !a.id || !a.nom || !a.ville || !(a.force >= 41 && a.force <= 50));
  ok(champs.length === 0, `chaque club anglais a son nom, sa ville et une force dans la fourchette française 41-50${champs.length ? " — " + extrait(champs.map(a => a.id)) : ""}`);
  const sales = CLUBS_AMATEURS_ANG.filter(a => /[<>"&']/.test(a.nom + a.ville));
  ok(sales.length === 0, `aucun nom ne porte d'esperluette, d'apostrophe ni de chevron${sales.length ? " — " + extrait(sales.map(a => a.nom)) : ""}`);
  const pros = new Set(CLUBS_ANG.map(c => c.nom));
  const deja = CLUBS_AMATEURS_ANG.filter(a => [...pros].some(n => n.includes(a.ville) || a.nom === n));
  ok(deja.length === 0, `aucun des petits clubs n'est déjà l'un des soixante-douze clubs d'ANG-B${deja.length ? " — " + extrait(deja.map(a => a.nom)) : ""}`);
  // le tirage ne mélange pas les pays
  const G = ouvreAnglaise("CHE");
  const idsANG = new Set(CLUBS_AMATEURS_ANG.map(a => a.id)), idsFR = new Set(CLUBS_AMATEURS.map(a => a.id));
  const petits = G.coupe.vivants.filter(id => api.estAmateur(id));
  ok(petits.length === 24, `le tableau anglais compte ses vingt-quatre petits clubs (${petits.length})`);
  ok(petits.every(id => idsANG.has(id)) && !petits.some(id => idsFR.has(id)),
    "et aucun village français ne s'y est glissé");
  ok(idsANG.has(G.coupe.poucetId), "le Petit Poucet anglais est anglais");
  ok(petits.every(id => api.amaById(id) && api.amaById(id).nom),
    "chacun se retrouve par son identifiant, nom en main");
  fermeAnglaise();
  const H = ouvreFrancaise();
  const petitsFR = H.coupe.vivants.filter(id => api.estAmateur(id));
  ok(petitsFR.length === 24 && petitsFR.every(id => idsFR.has(id)),
    "non-régression française : vingt-quatre villages, tous français");
}

/* ===== F) les dépêches, la presse et les incidents ===== */
console.log("\nF) Plus un « France » dans une carrière anglaise");
{
  voitPays("FR", 1995, false);
  ok(api.leP() === "la France" && api.LeP() === "La France" && api.duP() === "de France" && api.adjPaysM() === "français",
    "en France : la France, La France, de France, français");
  voitPays("ANG", 1995, false);
  ok(api.leP() === "l'Angleterre" && api.LeP() === "L'Angleterre" && api.duP() === "d'Angleterre" && api.adjPaysM() === "anglais",
    "en Angleterre : l'Angleterre, L'Angleterre, d'Angleterre, anglais");
  voitPays("FR", 1995, false);
  ok(api.titreChampion() === "Champion de France", "le palmarès français écrit « Champion de France »");
  voitPays("ANG", 1995, false);
  ok(api.titreChampion() === "Champion d'Angleterre", "le palmarès anglais écrit « Champion d'Angleterre »");
  // les cartes propres à un pays
  const minitel = INCIDENTS.find(i => i.id === "minitel_corbeau");
  const taupe = INCIDENTS.find(i => i.id === "taupe_tabloid");
  ok(minitel && minitel.pays === "FR", "la carte du Corbeau du Minitel est réservée à la France");
  const bac = INCIDENTS.find(i => i.id === "bac"), alev = INCIDENTS.find(i => i.id === "alevels");
  ok(bac && bac.pays === "FR" && alev && alev.pays === "ANG",
    "le bac reste français, les A-levels sont anglais, et les deux cartes ont le même poids et le même dilemme");
  ok(bac.poids === alev.poids && bac.choix.length === alev.choix.length && bac.pondJeune === alev.pondJeune,
    "un pays ne gagne ni ne perd rien au change : même poids, même pondération des jeunes, mêmes choix");
  ok(taupe && taupe.pays === "ANG", "son jumeau anglais, la taupe du tabloïd, est réservé à l'Angleterre");
  const sansPays = INCIDENTS.filter(i => i.pays && !PAYS[i.pays]);
  ok(sansPays.length === 0, "aucune carte n'est rattachée à un pays qui n'existe pas");
  // sur le terrain : mille tirages dans une carrière anglaise ne sortent jamais le Minitel
  const G = ouvreAnglaise("TOT");
  const vus = new Set();
  // tireIncident rend une ENVELOPPE {inc, j, k} : la carte est dans .inc, jamais à la racine
  for (let i = 0; i < 1200; i++) { G.incidentsRecents = []; const r = api.tireIncident(); if (r && r.inc) vus.add(r.inc.id); }
  ok(!vus.has("minitel_corbeau") && !vus.has("bac"), `sur ${vus.size} cartes vues en Angleterre, ni le Minitel ni le bac`);
  ok(vus.has("taupe_tabloid"), "mais bien la taupe du tabloïd");
  // les quatre dénouements qui nommaient la France, rendus pour de vrai
  const sujet = api.clubById(G.monClub).joueurs;
  const rendus = [];
  for (const id of ["parfum", "bebe_celebration", "vhs_espion", "chasse"]) {
    const inc = INCIDENTS.find(i => i.id === id);
    for (const ch of inc.choix) {
      for (let n = 0; n < 6; n++) rendus.push(String(ch.issue(sujet[0], sujet[1])));
    }
  }
  const restes = rendus.filter(t => /France|français/i.test(t));
  ok(restes.length === 0, `les ${rendus.length} dénouements rendus en Angleterre ne disent plus « France »${restes.length ? " — " + extrait(restes) : ""}`);
  ok(rendus.some(t => /Angleterre/.test(t)), "et plusieurs disent « Angleterre », au bon endroit de la phrase");
  const casse = rendus.filter(t => /\bl'Angleterre fond|Toute l'Angleterre/.test(t));
  ok(casse.length > 0, "« Toute l'Angleterre se gausse », « L'Angleterre fond » : l'article suit, la majuscule aussi");
  fermeAnglaise();
  // non-régression : les mêmes dénouements en France disent ce qu'ils ont toujours dit
  const H = ouvreFrancaise();
  const sFR = api.clubById(H.monClub).joueurs;
  const rFR = [];
  for (const id of ["parfum", "bebe_celebration", "vhs_espion", "chasse"]) {
    const inc = INCIDENTS.find(i => i.id === id);
    for (const ch of inc.choix) for (let n = 0; n < 6; n++) rFR.push(String(ch.issue(sFR[0], sFR[1])));
  }
  ok(rFR.some(t => t.includes("Toute la France se gausse")) && rFR.some(t => t.includes("La France fond")) &&
     rFR.some(t => t.includes("vestiaires de France")),
    "non-régression française : les trois phrases sont mot pour mot celles d'avant");
}

/* ===== G) les éternels seconds ===== */
console.log("\nG) Jamais champion, et c'est vrai dans les deux pays");
{
  ok(JAMAIS_CHAMPION_ANG.size === 49, `quarante-neuf clubs anglais n'ont jamais été champions (${JAMAIS_CHAMPION_ANG.size})`);
  const codes = new Set(CLUBS_ANG.map(c => c.id));
  const fantomes = [...JAMAIS_CHAMPION_ANG].filter(id => !codes.has(id));
  ok(fantomes.length === 0, `tous existent dans CLUBS_ANG${fantomes.length ? " — " + extrait(fantomes) : ""}`);
  const champions = ["ARS", "AVL", "BLB", "BUR", "CHE", "DER", "EVE", "HUD", "IPS", "LEE", "LIV", "MCI",
    "MUN", "NEW", "FOR", "POR", "PNE", "SHU", "SHW", "SUN", "TOT", "WBA", "WOL"];
  const faux = champions.filter(id => JAMAIS_CHAMPION_ANG.has(id));
  ok(faux.length === 0, `les vingt-trois clubs qui ont soulevé le titre n'y sont pas${faux.length ? " — " + faux.join(", ") : ""}`);
  ok(champions.length + JAMAIS_CHAMPION_ANG.size === CLUBS_ANG.length,
    `les deux listes couvrent les soixante-douze clubs sans trou ni doublon (${champions.length} + ${JAMAIS_CHAMPION_ANG.size})`);
  ok(JAMAIS_CHAMPION_ANG.has("BOL") && JAMAIS_CHAMPION_ANG.has("SOU") && JAMAIS_CHAMPION_ANG.has("NOR") && JAMAIS_CHAMPION_ANG.has("LEI"),
    "Bolton, Southampton, Norwich et Leicester en sont : leurs places d'honneur ne sont pas des titres");
  ok(!JAMAIS_CHAMPION_ANG.has("BLB"), "Blackburn n'en est pas : champion en 1912 et 1914, son titre de 1995 n'est pas un premier");
  ok(Object.keys(api.PREMIER_TITRE_PAYS.ANG).length === 0,
    "et aucun club anglais ne décroche son PREMIER titre entre 1990 et 2010 : la table est vide, exprès");
  voitPays("ANG", 1995, false);
  ok(api.jamaisChampion("WHU", 1995) && !api.jamaisChampion("LIV", 1995),
    "en Angleterre : West Ham attend toujours, Liverpool non");
  ok(!api.jamaisChampion("AJA", 1995), "et un code français ne répond pas au registre anglais");
  voitPays("FR", 1995, false);
  ok(api.jamaisChampion("AJA", 1994) && !api.jamaisChampion("AJA", 1996),
    "non-régression française : Auxerre est maudit avant 1995, plus après");
  ok(api.jamaisChampion("LEN", 1995) && !api.jamaisChampion("PSG", 1995),
    "non-régression française : Lens attend son heure, Paris a déjà gagné");
  ok(JAMAIS_CHAMPION.size === 15, "le registre français est intact, quinze clubs");
}

/* ===== H) une saison entière, dans les deux pays ===== */
console.log("\nH) Une saison jouée pour de vrai, de chaque côté de la Manche");
{
  const G = ouvreAnglaise("NEW", 1995);
  let erreur = null;
  try { for (let i = 0; i < 38; i++) api.jouerJournee(); api.intersaison(); for (let i = 0; i < 10; i++) api.jouerJournee(); }
  catch (e) { erreur = e; }
  ok(!erreur, "trente-huit journées anglaises, une intersaison et dix journées de plus, sans une exception" + (erreur ? " — " + erreur.message : ""));
  const patronyme = j => j.nom.split(" ").slice(1).join(" ");
  // un joueur CURÉ venu d'Europe peut porter « Costa » ou « Keita », qui sont aussi dans le vivier
  // procédural français : on ne juge donc que les noms que le jeu a FABRIQUÉS
  const tous = G.clubs.concat(G.autre).flatMap(c => c.joueurs).filter(j => !j.reel);
  const intrus = tous.filter(j => NOMS.includes(patronyme(j)));
  ok(intrus.length === 0, `après l'intersaison, les ${tous.length} joueurs portent toujours des noms anglais${intrus.length ? " — " + extrait(intrus.map(j => j.nom)) : ""}`);
  const petits = (G.coupe.vivants || []).filter(id => api.estAmateur(id));
  const idsFR = new Set(CLUBS_AMATEURS.map(a => a.id));
  ok(!petits.some(id => idsFR.has(id)), "le nouveau tableau de coupe est anglais lui aussi");
  const texte = (G.news || []).concat(G.presse || [], G.recap || []).join(" | ");
  /* LA SEULE EXCEPTION ADMISE, ET ELLE EST DOCUMENTÉE : le recruteur est encore un recruteur FRANÇAIS.
     Ses catégories (« Français de l'étranger », « Français en quête de come-back ») sont des CLÉS
     sérialisées dans G.vivier et lues par harness-recruteur : les renommer casserait les sauvegardes, et
     les traduire mentirait — David Ginola est bien un Français qui joue à l'étranger, même vu de Liverpool.
     Donner à l'Angleterre son propre vivier est une journée de curation à part entière (voir ANG-F dans
     chantier-saisons.md). Tout AUTRE « France » dans une saison anglaise est un défaut, et celui-là
     rougira. */
  const lignes=(G.news||[]).concat(G.presse||[], G.recap||[]).map(String);
  const restes=lignes.filter(t=>/\bFrance\b|français/i.test(t) && !/\(Français (?:de l'étranger|en quête de come-back)\)/.test(t));
  ok(restes.length===0,
    "et rien de ce que la saison a écrit, dépêches, presse et recap, ne nomme la France, hors les étiquettes de profil du recruteur"+(restes.length?" — "+extrait(restes):"") );
  fermeAnglaise();
  const H = ouvreFrancaise();
  let eFR = null;
  try { for (let i = 0; i < 38; i++) api.jouerJournee(); api.intersaison(); for (let i = 0; i < 10; i++) api.jouerJournee(); }
  catch (e) { eFR = e; }
  ok(!eFR, "non-régression française : la même carrière tourne en France sans une exception" + (eFR ? " — " + eFR.message : ""));
  const tousFR = H.clubs.concat(H.autre).flatMap(c => c.joueurs).filter(j => !j.reel);
  ok(!tousFR.some(j => NOMS_ANG.includes(j.nom.split(" ").slice(1).join(" "))),
    "et aucun nom anglais ne s'y est invité");
}

console.log(FAILS ? "\n✗ " + FAILS + " CONTRÔLE(S) EN ÉCHEC" : "\n✓ TOUT EST VERT");
process.exit(FAILS ? 1 : 0);
