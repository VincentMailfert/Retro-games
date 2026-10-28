/* Harnais headless — LES SAISONS VERROUILLÉES (v2.22)
   La plupart des saisons de départ sont fermées ; un titre de D1 dès la première année d'une carrière
   rapporte une clé dans son championnat, et la clé ouvre une saison fermée du même championnat.
   A) une partie neuve ne voit ouvertes que les six saisons de départ (la saison de la semaine à part)
   B) un titre de D1 en première année crédite une clé ; en deuxième année ou en D2, non
   C) regagner la même saison ne crédite pas une deuxième clé
   D) une clé ouvre une saison, et une seule (et jamais dans l'autre championnat)
   E) une carrière existante sur une saison fermée se recharge et se joue
   F) le rattrapage crédite les titres déjà gagnés dans les carrières du navigateur, une seule fois
   G) la saison de la semaine : jouable avant sa date de fin, refermée après, et sa victoire compte
   H) la fusion entre deux appareils garde le meilleur des deux
   I) l'écran : cadenas, clés, mention de la semaine, bouton de lancement fermé, la ligne du bilan
   J) le résultat structuré de chaque fin de saison
   Usage : node harness-cadenas.cjs                                                           */
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
function nouveauLS() {
  return {
    _m: {},
    get length() { return Object.keys(this._m).length; },
    key(i) { return Object.keys(this._m)[i] ?? null; },
    getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; },
  };
}
/* deux vrais petits nœuds, #app et #fiche : ils retiennent ce que le jeu leur écrit (l'accueil, la fiche d'un club) */
const noeud = () => { const n = { _h: "", style: {}, querySelector: () => null, querySelectorAll: () => [] };
  Object.defineProperty(n, "innerHTML", { get() { return n._h; }, set(v) { n._h = String(v); } }); return n; };
const APP = noeud(), FICHE = noeud();
const generic = makeStub();
global.document = new Proxy(function () {}, {
  get(_t, p) { if (p === "getElementById") return id => (id === "app" ? APP : id === "fiche" ? FICHE : generic); if (p === Symbol.toPrimitive) return () => ""; return generic; },
  set() { return true; }, apply() { return generic; }, has() { return true; }, construct() { return generic; },
});
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0); global.cancelAnimationFrame = (id) => clearTimeout(id);

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,classement,clubById,sauvegardeLocale,chargeLocale,partiesListe," +
  "ecranAccueil,ficheClubAccueil,ecranBilan,SAISONS,CLUBS,CLUBS_D2,PROGKEY,SAVEKEY,SAISONS_OUVERTES,SAISON_SEMAINE," +
  "saisonOuverte,estSaisonSemaine,clesDispo,ouvreSaison,progGagne,progRattrape,progFusionne,progEmpreinte,progNette,prog,progMag," +
  "titrePremiereAnnee,cleDepart,cleDuBilan,chDeSaison,progVide," +
  "getG:function(){return G;},setG:function(x){G=x;},setAccueil:function(k){SAISON_ACCUEIL=k;},getPARTIE:function(){return PARTIE;}};";
function appareil(ls) { global.localStorage = ls; global.window.localStorage = ls; return new Function(script + epilogue)(); }
function reel(fn) { global.window.__TEST__ = false; try { return fn(); } finally { global.window.__TEST__ = true; } }

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const AVANT = new Date(2026, 10, 5, 22, 0).getTime();  // le jeudi 5 novembre 2026 au soir : la saison de la semaine court encore
const APRES = new Date(2026, 10, 6, 0, 30).getTime();  // le vendredi d'après, minuit et demie : elle est refermée

/* Joue une saison jusqu'à la 37e journée, pose le club du joueur en tête ou non, puis la 38e (finDeSaison). */
function finitSaison(api, enTete) {
  const G = api.getG();
  while (G.journee < 37) api.jouerJournee();
  const moi = api.clubById(G.monClub);
  if (enTete) moi.pts += 300; else { moi.pts = -300; }
  api.jouerJournee();
  return api.classement().findIndex(c => c.id === G.monClub) + 1;
}

/* ===== A) partie neuve ===== */
console.log("A) Une partie neuve ne voit ouvertes que les six saisons de départ");
let LS = nouveauLS(), api = appareil(LS);
{
  const S = api.SAISONS, cles = Object.keys(S);
  const ouv = cles.filter(k => api.saisonOuverte(k, APRES));
  ok(ouv.length === 6 && ["1990-91", "1995-96", "2005-06", "ANG-1990-91", "ANG-1995-96", "ANG-2000-01"].every(k => ouv.includes(k)),
    "six saisons ouvertes, trois par championnat : " + ouv.join(", "));
  ok(api.SAISONS_OUVERTES.every(k => S[k]), "les six saisons de la constante existent toutes dans SAISONS");
  ok(["FR", "ANG"].every(ch => api.SAISONS_OUVERTES.filter(k => api.chDeSaison(k) === ch).length === 3), "trois en France, trois en Angleterre");
  ok(cles.length - ouv.length >= 20, (cles.length - ouv.length) + " saisons fermées sur " + cles.length);
  ok(api.clesDispo("FR") === 0 && api.clesDispo("ANG") === 0, "zéro clé dans chaque championnat");
  ok(api.saisonOuverte(api.SAISON_SEMAINE.cle, AVANT) && api.saisonOuverte("1995-96"), "la saison de la semaine s'ajoute tant qu'elle court");
  ok(Object.keys(LS._m).length === 0, "rien n'est écrit dans le navigateur au simple fait de regarder");
}

/* ===== B) le titre de première année ===== */
console.log("\nB) Un titre de D1 en première année crédite une clé ; en deuxième année ou en D2, non");
let pidChampion;
{
  api.nouvellePartie(api.CLUBS[0].id, "1995-96");
  const G = api.getG(); pidChampion = G.pid;
  ok(api.cleDepart(G) === "1995-96", "la carrière sait de quelle saison elle part (relu dans G, sans champ de plus)");
  const r = finitSaison(api, true);
  ok(r === 1 && G.finie, "champion de D1 au bout de la première saison");
  ok(api.clesDispo("FR") === 1 && api.clesDispo("ANG") === 0, "une clé en France, aucune en Angleterre");
  ok(api.prog().gagnees.length === 1 && api.prog().gagnees[0].k === "1995-96" && api.prog().gagnees[0].pid === G.pid, "la saison 1995-96 est gagnée, au nom de cette carrière");
  ok(api.cleDuBilan(), "le bilan de cette saison saura dire qu'une clé est tombée");
  ok(api.titrePremiereAnnee(G) === "1995-96", "le mur du club porte bien le titre de la saison de départ");
  // deuxième année : un nouveau titre ne rapporte rien
  G.vire = null; api.intersaison();
  ok(G.saisonIdx === 2 && !api.cleDuBilan(), "deuxième saison : le bilan ne parle plus de clé");
  const r2 = finitSaison(api, true);
  ok(r2 === 1 && G.div === 1, "champion de D1 en deuxième année");
  ok(api.clesDispo("FR") === 1 && api.prog().gagnees.length === 1, "toujours une seule clé : la deuxième année ne compte pas");
  // en D2 dès la première année
  const omId = (api.CLUBS_D2.find(c => /marseille/i.test(c.nom)) || api.CLUBS_D2[0]).id;
  api.nouvellePartie(omId, "1995-96");
  const G2 = api.getG();
  ok(G2.div === 2, "une carrière qui part de D2 (" + api.clubById(omId).nom + ")");
  ok(finitSaison(api, true) === 1, "champion de D2 en première année");
  ok(G2.palmares.some(p => /^Champion de /.test(p)) && api.titrePremiereAnnee(G2) === null, "le titre de D2 est au mur, mais ce n'est pas celui qui compte");
  ok(api.clesDispo("FR") === 1, "aucune clé de plus");
  // un club qui finit loin du titre en première année
  api.nouvellePartie(api.SAISONS["2005-06"].d1[7], "2005-06");
  ok(finitSaison(api, false) > 1 && api.prog().gagnees.length === 1, "une première saison sans titre ne crédite rien");
}

/* ===== C) regagner la même saison ===== */
console.log("\nC) Regagner la même saison ne crédite pas une deuxième clé");
{
  api.nouvellePartie(api.CLUBS[4].id, "1995-96");
  ok(finitSaison(api, true) === 1, "une autre carrière gagne aussi 1995-96 dès la première année");
  ok(api.clesDispo("FR") === 1 && api.prog().gagnees.length === 1, "toujours une seule clé pour cette saison");
  ok(api.prog().gagnees[0].pid === pidChampion && !api.cleDuBilan(), "la clé reste à la première carrière, et ce bilan-ci n'en parle pas");
  ok(!api.progGagne("1995-96", "pXXX"), "progGagne refuse une saison déjà gagnée");
  ok(!api.progGagne("1987-88", "pXXX") && !api.progGagne(null), "et une saison qui n'existe pas");
}

/* ===== D) une clé, une saison ===== */
console.log("\nD) Une clé ouvre une saison, et une seule");
{
  ok(!api.saisonOuverte("1993-94", APRES), "1993-94 est fermée");
  ok(!api.ouvreSaison("1995-96") && api.clesDispo("FR") === 1, "une saison déjà ouverte ne consomme pas la clé");
  ok(!api.ouvreSaison("ANG-1993-94") && api.clesDispo("FR") === 1, "une clé française n'ouvre pas une saison anglaise");
  ok(api.ouvreSaison("1993-94"), "la clé ouvre 1993-94");
  ok(api.saisonOuverte("1993-94", APRES) && api.clesDispo("FR") === 0, "1993-94 est ouverte, il ne reste aucune clé");
  ok(!api.ouvreSaison("1994-95") && !api.saisonOuverte("1994-95", APRES), "sans clé, 1994-95 reste fermée");
  ok(!api.ouvreSaison("1993-94") && api.prog().ouvertes.length === 1, "rouvrir 1993-94 ne fait rien");
  ok(!api.ouvreSaison("1888-89"), "une saison inconnue ne s'ouvre pas");
  api.progGagne("ANG-1995-96", "pANG");
  ok(api.clesDispo("ANG") === 1 && api.clesDispo("FR") === 0, "une victoire anglaise donne une clé anglaise");
  ok(!api.ouvreSaison("1994-95") && api.ouvreSaison("ANG-1997-98") && api.clesDispo("ANG") === 0, "et elle ouvre une saison anglaise, pas une française");
}

/* ===== E) une carrière commencée sur une saison fermée ===== */
console.log("\nE) Une carrière existante sur une saison fermée se recharge et se joue");
{
  const ls = nouveauLS(), a = appareil(ls);
  ok(!a.saisonOuverte("1997-98", APRES), "1997-98 est fermée pour ce navigateur neuf");
  a.nouvellePartie(a.SAISONS["1997-98"].d1[2], "1997-98"); // une carrière d'avant les cadenas
  for (let i = 0; i < 3; i++) a.jouerJournee();
  ok(reel(() => a.sauvegardeLocale(true)), "elle est sauvegardée");
  const id = a.getPARTIE().id;
  const b = appareil(ls); // la page rechargée
  ok(b.chargeLocale(id) && b.getG().journee === 3 && b.cleDepart(b.getG()) === "1997-98", "elle se recharge, à sa journée, sur sa saison");
  let erreur = null; try { for (let i = 0; i < 4; i++) b.jouerJournee(); } catch (e) { erreur = e; }
  ok(!erreur && b.getG().journee === 7, "et elle se joue" + (erreur ? " (" + erreur.message + ")" : ""));
  ok(!b.saisonOuverte("1997-98", APRES), "la saison reste fermée pour une NOUVELLE carrière");
  const fiche = JSON.parse(ls.getItem(Object.keys(ls._m).find(k => k.indexOf("d1manager_partie_") === 0)));
  ok(!("cadenas" in fiche) && !Object.keys(fiche).some(k => /prog|cle/i.test(k)), "la sauvegarde de carrière ne porte aucun champ de plus");
}

/* ===== F) le rattrapage ===== */
console.log("\nF) Le rattrapage crédite les titres déjà gagnés");
{
  const ls = nouveauLS(), a = appareil(ls);
  const ecrit = (o) => reel(() => { a.setG(o); return a.sauvegardeLocale(true); });
  // trois carrières « d'avant » : un vrai titre de première année en 1990-91, un titre de deuxième année, un titre de D2
  a.nouvellePartie(a.SAISONS["1990-91"].d1[1], "1990-91"); finitSaison(a, true);
  const g1 = a.getG(); a.prog().gagnees = []; // on oublie ce que la fin de saison vient de créditer : c'est la version d'avant
  ok(a.titrePremiereAnnee(g1) === "1990-91", "une carrière 1990-91 championne dès la première année");
  ok(reel(() => a.sauvegardeLocale(true)), "sauvegardée");
  a.nouvellePartie(a.SAISONS["1990-91"].d1[3], "1990-91");
  const g2 = a.getG(); g2.palmares = ["Champion de France 1991-92"]; g2.saisonIdx = 2; g2.saison = "1991-92";
  ok(ecrit(g2) && a.titrePremiereAnnee(g2) === null, "une carrière 1990-91 championne seulement en deuxième année");
  a.nouvellePartie(a.SAISONS["2005-06"].d2[0], "2005-06");
  const g3 = a.getG(); g3.palmares = ["Champion de " + "Ligue 2 2005-06", "Montée en Ligue 1 2005-06"];
  ok(ecrit(g3) && a.titrePremiereAnnee(g3) === null, "une carrière 2005-06 championne de deuxième division");
  // une carrière anglaise « d'avant » : relue dans une sauvegarde bricolée sur une partie anglaise
  a.nouvellePartie(a.SAISONS["ANG-1990-91"].d1[0], "ANG-1990-91");
  const g4 = a.getG(); g4.palmares = ["Champion d'Angleterre 1990-91 : PREMIER TITRE DE L'HISTOIRE"];
  ok(ecrit(g4) && a.titrePremiereAnnee(g4) === "ANG-1990-91", "une carrière anglaise championne dès 1990-91 (avec la mention du premier titre)");
  ok(a.partiesListe().length === 4, "quatre carrières dans le navigateur");
  const b = appareil(ls); // la nouvelle version se charge pour la première fois
  ok(b.clesDispo("FR") === 0 && b.clesDispo("ANG") === 0, "au chargement, aucune clé encore");
  const n = reel(() => b.progRattrape());
  ok(n === 2, "le rattrapage trouve deux titres de première année (" + n + ")");
  ok(b.clesDispo("FR") === 1 && b.clesDispo("ANG") === 1, "une clé en France, une en Angleterre");
  ok(b.prog().gagnees.map(g => g.k).sort().join(",") === "1990-91,ANG-1990-91", "1990-91 et ANG-1990-91 sont gagnées");
  ok(reel(() => b.progRattrape()) === 0, "un second passage ne fait rien");
  ok(ls.getItem(b.PROGKEY) && JSON.parse(ls.getItem(b.PROGKEY)).ratt === 1, "la progression est rangée à part, sous sa propre clé");
  const c = appareil(ls); // rechargée encore : la progression a survécu, le rattrapage ne repasse pas
  ok(reel(() => c.clesDispo("FR") === 1 && c.clesDispo("ANG") === 1 && c.progRattrape() === 0), "après un rechargement : les deux clés sont là, et le rattrapage ne repasse pas");
  // une carrière en ligne rapatriée plus tard : son titre compte à l'ouverture
  const d = appareil(nouveauLS());
  d.nouvellePartie(d.SAISONS["1990-91"].d1[1], "1990-91"); finitSaison(d, true); d.prog().gagnees = [];
  const txt = JSON.stringify(d.getG()), ls2 = nouveauLS(); ls2.setItem("d1manager_partie_x1", txt);
  const e = appareil(ls2); e.chargeLocale(e.partiesListe()[0].id);
  ok(e.clesDispo("FR") === 1, "une carrière ouverte qui porte un titre de première année crédite sa clé (autre appareil, fichier importé)");
}

/* ===== G) la saison de la semaine ===== */
console.log("\nG) La saison de la semaine");
{
  const a = appareil(nouveauLS()), k = a.SAISON_SEMAINE.cle;
  ok(a.SAISONS[k] && /^\d{4}-\d{2}-\d{2}$/.test(a.SAISON_SEMAINE.fin), "la constante nomme une vraie saison (" + k + ") et une date (" + a.SAISON_SEMAINE.fin + ")");
  ok(!a.SAISONS_OUVERTES.includes(k), "c'est une saison fermée");
  ok(a.estSaisonSemaine(k, AVANT) && a.saisonOuverte(k, AVANT), "jouable par tous le dernier soir");
  ok(!a.estSaisonSemaine(k, APRES) && !a.saisonOuverte(k, APRES), "refermée le lendemain");
  a.nouvellePartie(a.SAISONS[k].d1[0], k);
  ok(finitSaison(a, true) === 1 && a.clesDispo("FR") === 1, "une victoire sur la saison de la semaine rapporte sa clé");
  ok(!a.saisonOuverte(k, APRES) && a.ouvreSaison(k) && a.saisonOuverte(k, APRES), "après la date, la saison est refermée, mais la clé peut l'ouvrir pour de bon");
}

/* ===== H) la fusion ===== */
console.log("\nH) La fusion entre deux appareils garde le meilleur des deux");
{
  const a = appareil(nouveauLS());
  const salon = a.progNette({ gagnees: [{ k: "1995-96", pid: "p1", t: 100 }, { k: "ANG-1995-96", pid: "p2", t: 300 }], ouvertes: ["1993-94"],
    resultats: [{ pid: "p1", an: 1, rang: 1 }, { pid: "p1", an: 2, rang: 4 }] });
  const portable = a.progNette({ gagnees: [{ k: "1995-96", pid: "p9", t: 50 }, { k: "1990-91", pid: "p8", t: 200 }], ouvertes: ["1997-98", "ANG-1997-98"],
    resultats: [{ pid: "p8", an: 1, rang: 1 }, { pid: "p1", an: 1, rang: 1 }] });
  const f = a.progFusionne(salon, portable);
  ok(f.gagnees.map(g => g.k).sort().join(",") === "1990-91,1995-96,ANG-1995-96", "la réunion des saisons gagnées");
  ok(f.gagnees.find(g => g.k === "1995-96").pid === "p9", "pour une saison gagnée des deux côtés, la plus ancienne victoire fait foi");
  ok(f.ouvertes.sort().join(",") === "1993-94,1997-98,ANG-1997-98", "la réunion des saisons ouvertes");
  ok(f.resultats.length === 3, "la réunion des résultats, sans doublon (" + f.resultats.length + ")");
  ok(a.progEmpreinte(a.progFusionne(f, salon)) === a.progEmpreinte(f) && a.progEmpreinte(a.progFusionne(portable, salon)) === a.progEmpreinte(f), "fusionner encore ne change rien, et l'ordre n'importe pas");
  ok(a.progEmpreinte(a.progFusionne(salon, null)) === a.progEmpreinte(salon), "fusionner avec rien rend la même chose");
  const M = a.progMag(); M.par[""] = f;
  ok(a.clesDispo("FR") === 0 && a.clesDispo("ANG") === 0, "deux saisons gagnées, deux ouvertes en France : zéro clé ; une et une en Angleterre : zéro");
  // une même victoire dépensée sur les deux appareils, pour deux saisons différentes : on garde les deux
  M.par[""] = a.progFusionne(a.progNette({ gagnees: [{ k: "1995-96", t: 1 }], ouvertes: ["1993-94"] }), a.progNette({ gagnees: [{ k: "1995-96", t: 1 }], ouvertes: ["1994-95"] }));
  ok(a.saisonOuverte("1993-94", APRES) && a.saisonOuverte("1994-95", APRES) && a.clesDispo("FR") === 0, "la même clé dépensée deux fois sur deux appareils : les deux saisons restent ouvertes, et le compte ne passe jamais sous zéro");
  const sale = a.progNette({ gagnees: [{ k: "<img onerror=x>" }, { k: "1995-96" }], ouvertes: ["1993-94", 42, "<b>"], resultats: [1, null, { pid: "p" }] });
  ok(sale.gagnees.length === 1 && sale.ouvertes.length === 1 && sale.resultats.length === 1, "ce qui n'a pas la forme attendue est écarté");
}

/* ===== I) l'écran ===== */
console.log("\nI) À l'écran");
{
  const a = appareil(nouveauLS());
  const option = (h, k) => (h.match(new RegExp('<option value="' + k + '"[^>]*>([^<]*)</option>')) || [])[1] || "";
  a.setAccueil("1995-96"); a.ecranAccueil();
  let h = APP.innerHTML;
  ok(/🔒/.test(option(h, "1993-94")) && !/🔒/.test(option(h, "1995-96")) && !/🔒/.test(option(h, "1990-91")), "les saisons fermées sont dans le sélecteur, avec un cadenas ; les ouvertes sans");
  ok(/saison de la semaine/.test(option(h, a.SAISON_SEMAINE.cle)) === a.estSaisonSemaine(a.SAISON_SEMAINE.cle), "la saison de la semaine porte sa mention tant qu'elle court");
  ok(/id="accCles"[^>]*>🔑 0</.test(h), "le nombre de clés s'affiche près du sélecteur");
  ok(!/id="accFerme"/.test(h), "sur une saison ouverte, pas de ligne de cadenas");
  a.setAccueil("1993-94"); a.ecranAccueil(); h = APP.innerHTML;
  const ligne = (h.match(/<p id="accFerme"[^]*?<\/p>/) || [""])[0];
  ok(/Aucune clé en poche/.test(ligne) && !/bOuvreSaison/.test(ligne), "sur une saison fermée sans clé : une seule ligne, qui dit les clés, sans bouton");
  ok((h.match(/class="startclub"/g) || []).length >= 36, "les clubs de la saison fermée restent visibles");
  a.ficheClubAccueil(a.SAISONS["1993-94"].d1[0]);
  ok(/disabled[^>]*>🔒 SAISON FERMÉE</.test(FICHE.innerHTML) && !/PRENDRE LES RÊNES/.test(FICHE.innerHTML), "la fiche d'un club d'une saison fermée ne laisse pas lancer la carrière");
  a.progGagne("1995-96", "p1"); a.ecranAccueil(); h = APP.innerHTML;
  ok(/1 clé en poche/.test(h) && /id="bOuvreSaison"/.test(h) && /🔑 1</.test(h), "avec une clé : la ligne le dit, et un bouton propose d'ouvrir");
  a.setAccueil("ANG-1993-94"); a.ecranAccueil();
  ok(/🔑 0</.test(APP.innerHTML) && /Aucune clé/.test(APP.innerHTML), "le compte est par championnat : la clé française ne se voit pas en Angleterre");
  a.setAccueil("1995-96"); a.ficheClubAccueil(a.SAISONS["1995-96"].d1[0]);
  ok(/PRENDRE LES RÊNES/.test(FICHE.innerHTML), "sur une saison ouverte, le bouton de lancement est là");
  // le bilan de fin de saison
  a.nouvellePartie(a.SAISONS["1990-91"].d1[0], "1990-91"); finitSaison(a, true); a.ecranBilan();
  ok(/🔑 Titre dès la première saison : une clé de plus au trousseau\./.test(APP.innerHTML), "le bilan annonce la clé en une ligne");
  a.nouvellePartie(a.SAISONS["1990-91"].d1[1], "1990-91"); finitSaison(a, true); a.ecranBilan();
  ok(!/trousseau/.test(APP.innerHTML), "et se tait quand la saison avait déjà rapporté sa clé");
  // aucun tiret long dans ce que le système écrit
  const bout = html.slice(html.indexOf("LES SAISONS VERROUILLÉES (v2.22)"), html.indexOf("function progPlanifie"));
  const chaines = (html.match(/accFerme[^\n]*|SAISON FERMÉE[^\n]*|trousseau[^\n]*|OUVRIR "[^\n]*|s'ouvre pour de bon[^\n]*/g) || []).join("\n");
  ok(bout.length > 1000 && !/—/.test(chaines), "aucun tiret long dans les textes du jeu");
}

/* ===== J) les résultats ===== */
console.log("\nJ) Le résultat structuré de chaque fin de saison");
{
  const a = appareil(nouveauLS());
  a.nouvellePartie(a.SAISONS["2005-06"].d1[2], "2005-06"); const G = a.getG();
  finitSaison(a, false); G.vire = null; a.intersaison(); finitSaison(a, true);
  const R = a.prog().resultats.filter(r => r.pid === G.pid);
  ok(R.length === 2, "deux saisons jouées, deux résultats");
  const r1 = R.find(r => r.an === 1), r2 = R.find(r => r.an === 2);
  ok(r1 && r1.ch === "FR" && r1.dep === "2005-06" && r1.s === "2005-06" && r1.club === G.monClub && r1.div === 1 && r1.rang > 1 && Array.isArray(r1.coupes),
    "championnat, saison de départ, année, saison jouée, club, division, place, coupes : " + JSON.stringify(r1));
  ok(r2 && r2.s === "2006-07" && r2.rang === 1, "la deuxième année est rangée à part : " + JSON.stringify(r2));
  ok(!R.some(r => typeof r === "string"), "des données, pas une phrase du palmarès");
  // une saison rejouée (sauvegarde reprise avant la 38e journée) remplace son résultat au lieu de le doubler
  G.finie = false; G.journee = 37; a.jouerJournee();
  ok(a.prog().resultats.filter(r => r.pid === G.pid && r.an === 2).length === 1, "une fin de saison rejouée ne double pas le résultat");
  // les coupes : la Coupe nationale et l'Europe gagnées s'inscrivent
  a.nouvellePartie(a.CLUBS[3].id, "1995-96"); const G3 = a.getG();
  while (G3.journee < 37) a.jouerJournee();
  G3.coupe.vainqueur = G3.monClub; if (G3.euro) { G3.euro.vainqueur = G3.monClub; G3.euro.compet = G3.euro.compet || "C3"; }
  a.jouerJournee();
  const r3 = a.prog().resultats.find(r => r.pid === G3.pid);
  ok(r3 && r3.coupes.includes("CN") && (!G3.euro || r3.coupes.includes(G3.euro.compet)), "les coupes gagnées : " + JSON.stringify(r3 && r3.coupes));
  ok(JSON.stringify(a.prog()).length < 200000, "la progression reste légère");
}

console.log(FAILS ? `\n✗ ${FAILS} ÉCHEC(S)` : "\nTOUT EST VERT");
process.exit(FAILS ? 1 : 0);
