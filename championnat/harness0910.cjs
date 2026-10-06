/* Harnais de validation — SAISON DE DÉPART 2009-10
   Vérifie : intégrité du registre SAISONS, doublons de noms, année de base/étés,
   sièges européens, carrière multi-saisons depuis 09/10 (calibrage, vieillissement).
   C'est la saison la plus RÉCENTE du jeu, comme 08/09 l'était avant elle : toutes les
   ancres de notes sont derrière elle. Six singularités à surveiller ici — le plateau tombe
   juste tout seul pour la HUITIÈME fois de suite (vingt et vingt, aucun repêchage) ;
   MARSEILLE reprend le titre après DIX-HUIT ANS, et fait le doublé avec la Coupe de la
   Ligue ; le MONDIAL 2010 tombe dès la PREMIÈRE intersaison, l'été 2011 est MUET et
   l'EURO 2012 arrive à la TROISIÈME ; et surtout, pour la première fois depuis 04/05,
   UN SIÈGE EUROPÉEN EST EN LIGUE 2 — Guingamp, vainqueur de la Coupe de France 2009,
   joue la Ligue Europa depuis la deuxième division. Le contrôle des sièges joue encore
   dans les deux sens : AUXERRE, futur TROISIÈME, part sans Europe. Enfin, le plateau
   compte TREIZE vétérans de trente-six ans et plus, un record, et UN SEUL joueur
   procédural de tout le chantier depuis 07/08 : le deuxième gardien de Caen.
   Usage : node harness0910.cjs                                                    */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,CIBLE,SAISONS,STARS_0910,STARS_D2_0910,D1_0910,D2_0910,STARS_EUROPE,STARS_EUROPE_C2,STARS_EUROPE_C3,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const KEY = "2009-10";

/* ===== 1) Intégrité du registre SAISONS ===== */
console.log("1) Registre SAISONS : composition, métadonnées, effectifs");
try {
  const S = api.SAISONS[KEY];
  if (!S) fail("saison " + KEY + " absente du registre");
  else {
    if (S.d1.length !== 20) fail("L1 09/10 a " + S.d1.length + " clubs (attendu 20)");
    if (S.d2.length !== 20) fail("L2 09/10 a " + S.d2.length + " clubs (attendu 20)");
    const tous = S.d1.concat(S.d2);
    const setIds = new Set(tous);
    if (setIds.size !== 40) fail("ids dupliqués entre L1 et L2 (uniques: " + setIds.size + "/40)");
    const metaManquante = tous.filter(id => !api.metaClub(id));
    if (metaManquante.length) fail("métadonnées manquantes : " + metaManquante.join(","));
    if (!metaManquante.length && setIds.size === 40 && S.d1.length === 20 && S.d2.length === 20)
      ok("09/10 = 20 L1 + 20 L2, 40 clubs uniques, toutes métadonnées résolues");

    // LE PLATEAU TOMBE JUSTE TOUT SEUL POUR LA HUITIÈME FOIS DE SUITE : les deux échelons
    // réels ont vingt clubs, donc aucun repêchage, aucun écarté. Listes vérifiées par ÉGALITÉ.
    const REELS_D1 = ["LYO", "OM", "BOR", "LIL", "PSG", "TOU", "REN", "MON", "STE", "AUX",
                      "NIC", "NCY", "LOR", "VAN", "MTP", "LMN", "SOC", "LEN", "GRE", "BLG"];
    const REELS_D2 = ["NAN", "CAE", "LEH", "MET", "BRE", "ANG", "GUI", "STR", "TRS", "CHA",
                      "ARL", "SED", "DIJ", "CLE", "BAS", "VNS", "AJA", "NIM", "IST", "LAV"];
    const absentsD1 = REELS_D1.filter(id => !S.d1.includes(id));
    const intrusD1 = S.d1.filter(id => !REELS_D1.includes(id));
    if (absentsD1.length || intrusD1.length)
      fail("L1 09/10 : absents " + (absentsD1.join(",") || "—") + " / intrus " + (intrusD1.join(",") || "—"));
    else ok("les vingt clubs de la vraie Ligue 1 2009-10 sont au plateau, et eux seuls (Lens champion de L2, Montpellier et Boulogne promus)");
    const absentsD2 = REELS_D2.filter(id => !S.d2.includes(id));
    const intrusD2 = S.d2.filter(id => !REELS_D2.includes(id));
    if (absentsD2.length || intrusD2.length)
      fail("L2 09/10 : absents " + (absentsD2.join(",") || "—") + " / intrus " + (intrusD2.join(",") || "—"));
    else ok("les vingt clubs de la vraie Ligue 2 2009-10 sont au plateau, et eux seuls (Caen, Nantes et Le Havre descendus)");
    if (S.d1.length + S.d2.length !== REELS_D1.length + REELS_D2.length)
      fail("le compte de 09/10 doit tomber juste sans repêcher personne");
    else ok("AUCUN repêchage ni d'un côté ni de l'autre — la huitième fois de suite, depuis 02/03");

    // AC Arles-Avignon est le seul club neuf du plateau : né de la fusion de l'Athlétic Club
    // arlésien et du football avignonnais à l'été 2009, monté du National, il joue au Parc des
    // Sports d'AVIGNON — à trente kilomètres d'Arles — et montera en Ligue 1 au bout de l'année.
    const arl = api.metaClub("ARL");
    if (!arl) fail("AC Arles-Avignon (ARL) doit être au registre des clubs");
    else if (!S.d2.includes("ARL")) fail("Arles-Avignon joue la Ligue 2 en 2009-10");
    else if (!/Parc des Sports/.test(arl.stade)) fail("Arles-Avignon joue au Parc des Sports d'Avignon, pas à « " + arl.stade + " »");
    else if (arl.cap !== 17500) fail("le Parc des Sports comptait dix-sept mille cinq cents places, pas " + arl.cap);
    else ok("AC Arles-Avignon, seul club neuf de la saison, au Parc des Sports d'Avignon et en Ligue 2");
    // SES COULEURS SONT VÉRIFIÉES, JURISPRUDENCE CRÉTEIL : bleu et jaune (azur et or), et non
    // le vert que l'on prêterait à un club du Midi. Créteil porte déjà le bleu et jaune depuis
    // 99/00 : les deux blasons ne doivent pas se confondre, d'où un motif différent.
    const blasons = /const BLASONS=\{([\s\S]*?)\n\};/.exec(script);
    if (!blasons) fail("table BLASONS introuvable");
    else {
      const ligne = /ARL:\{a:"([^"]+)",b:"([^"]+)",st:"([^"]+)"\}/.exec(blasons[1]);
      const cre = /CRE:\{a:"([^"]+)",b:"([^"]+)",st:"([^"]+)"\}/.exec(blasons[1]);
      if (!ligne) fail("Arles-Avignon doit avoir son blason : sans lui, l'écu gris générique");
      else if (ligne[1] !== "#1c4fa0") fail("Arles-Avignon joue en BLEU ET JAUNE, couleurs vérifiées : fond reçu " + ligne[1]);
      else if (!cre) fail("le blason de Créteil doit rester au registre");
      else if (ligne[3] === cre[3]) fail("Arles-Avignon et Créteil sont tous deux bleu et jaune : il leur faut deux motifs différents");
      else ok("Arles-Avignon en bleu et jaune, couleurs vérifiées, et un motif qui le distingue de Créteil");
    }

    // effectifs : non vides, postes valides, notes dans les bornes, aucun trou
    let pb = [];
    for (const id of tous) {
      const L = (S.d1.includes(id) ? S.starsD1 : S.starsD2)[id];
      if (!L || !L.length) { pb.push(id + " vide"); continue; }
      if (L.length < 14) pb.push(id + " maigre (" + L.length + ")");
      for (const t of L) {
        if (!["G", "D", "M", "A"].includes(t[1])) pb.push(id + " poste invalide " + t[0]);
        if (!(t[2] >= 15 && t[2] <= 38)) pb.push(id + " âge hors bornes " + t[0] + " " + t[2]);
        if (!(t[3] >= 55 && t[3] <= 90)) pb.push(id + " note hors bornes " + t[0] + " " + t[3]);
        if (!(t[4] >= t[3] && t[4] <= 97)) pb.push(id + " pot incohérent " + t[0]);
      }
      if (!L.filter(t => t[1] === "G").length) pb.push(id + " sans gardien réel");
    }
    if (pb.length) pb.forEach(fail); else ok("40 effectifs réels valides (postes, âges, notes ≤ 90, pot ≥ note)");

    // LE SEUL JOUEUR PROCÉDURAL DU PLATEAU, ET IL A UNE RAISON : Caen n'a qu'UN gardien réel,
    // parce que son deuxième s'appelle DAMIEN PERQUIS — prénom ET patronyme identiques à ceux
    // du Sochalien que le jeu porte depuis 06/07. Aucune forme ne les sépare (jurisprudence des
    // deux Olivier Baudry, 91/92), et Caen n'a pas d'autre gardien ayant joué : le marginal cède
    // sa place, et le jeu complète. C'est la même marge qu'en 99/00, où Caen n'avait déjà qu'un
    // gardien répertorié.
    const gkCaen = (S.starsD2.CAE || []).filter(t => t[1] === "G");
    if (gkCaen.length !== 1)
      fail("Caen n'a qu'UN gardien réel en 09/10 (le second est l'homonyme parfait de Damien Perquis), reçu " + gkCaen.length);
    else ok("Caen n'aligne qu'un gardien réel, Alexis Thébaux : le second Damien Perquis cède sa place plutôt que de doubler un nom");
    const perquis = (S.starsD1.SOC || []).find(t => t[0] === "D. Perquis");
    if (!perquis || perquis[1] !== "D")
      fail("« D. Perquis » reste au Sochalien que le jeu porte depuis 06/07, défenseur, 3 179 minutes");
    else ok("« D. Perquis » reste au défenseur de Sochaux : l'homonyme parfait du gardien de Caen ne le lui prend pas");

    // pas de plafond d'âge depuis 99/00 : les vétérans jouent leur saison réelle puis raccrochent.
    // Ils sont TREIZE cette année, un record qui écrase les neuf de 08/09, et SEPT d'entre eux
    // sont gardiens. Dijon en aligne TROIS à lui seul — dont ÉRIC CARRIÈRE, meilleur joueur du
    // championnat 2000-01, qui finit sa carrière en Ligue 2 à trente-six ans.
    const vets = { BOR: "U. Ramé", PSG: "G. Coupet", NIC: "O. Echouafni", PSG2: "C. Makélélé", NIC2: "L. Létizi" };
    const vetsD2 = { NAN: "J. Alonzo", LEH: "C. Revault", STR: "S. Cassard", ANG: "P. Brunel",
                     GUI: "S. Trévisan", DIJ: "G. Malicki", DIJ2: "A. Lebrun", DIJ3: "É. Carrière" };
    const absentsV = [];
    for (const [k, nom] of Object.entries(vets))
      if (!(S.starsD1[k.replace(/\d$/, "")] || []).some(t => t[0] === nom)) absentsV.push(nom + " (" + k + ")");
    for (const [k, nom] of Object.entries(vetsD2))
      if (!(S.starsD2[k.replace(/\d$/, "")] || []).some(t => t[0] === nom)) absentsV.push(nom + " (" + k + ")");
    if (absentsV.length) fail("vétérans 36+ manquants : " + absentsV.join(", "));
    else ok("les vétérans de 36 ans et plus sont conservés : Ramé, Coupet, Echouafni, Makélélé, Létizi, Alonzo, Revault, Cassard, Brunel, Trévisan, Malicki, Lebrun et Carrière");
    const tousVets = [];
    for (const id in S.starsD1) for (const t of S.starsD1[id]) if (t[2] >= 36) tousVets.push(t[0] + " (" + id + ", " + t[2] + ")");
    for (const id in S.starsD2) for (const t of S.starsD2[id]) if (t[2] >= 36) tousVets.push(t[0] + " (" + id + ", " + t[2] + ")");
    if (tousVets.length < 13) fail("09/10 compte TREIZE vétérans de 36 ans et plus, reçu " + tousVets.length + " : " + tousVets.join(", "));
    else ok("TREIZE vétérans de trente-six ans et plus au plateau, un record : " + tousVets.join(", "));
    const carriere = (S.starsD2.DIJ || []).find(t => t[0] === "É. Carrière");
    if (!carriere || carriere[2] !== 36)
      fail("Éric Carrière, meilleur joueur du championnat 2000-01, joue sa dernière saison à Dijon à trente-six ans");
    else ok("Éric Carrière, meilleur joueur de 2000-01, finit en Ligue 2 à trente-six ans — l'écho du « Jeu à la nantaise »");

    // LE PIÈGE DES HUIT DERNIÈRES SAISONS, QU'UN HARNAIS DOIT GARDER : le découpage des tableaux
    // laisse la DERNIÈRE ligne collée au bas de page, si bien qu'une sentinelle de fin ne trouve
    // plus la cellule des minutes et rend ZÉRO. Cette année, le dernier de tableau d'Istres
    // s'appelle RAFIK SAÏFI — soixante sélections algériennes et le Mondial 2010 — et il a joué
    // 1 021 minutes ; celui de Châteauroux, Moussa Dembélé, en a 1 002, et celui de Bastia,
    // Dominique Agostini, 810. Trois pertes qu'aucun autre contrôle n'aurait vues.
    const DERNIERS = { TOU: "Luan", NCY: "D. Grégorini", SOC: "C. Davies", VAN: "J. Saez" };
    const DERNIERS_D2 = { IST: "R. Saïfi", CHA: "M. Dembélé", BAS: "D. Agostini", LAV: "M. Pichot" };
    const zappes = Object.entries(DERNIERS).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom))
      .concat(Object.entries(DERNIERS_D2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom)));
    if (zappes.length)
      fail("derniers de tableau perdus (la sentinelle de fin a frappé) : " + zappes.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("les derniers de tableau ont leurs vraies minutes : Rafik Saïfi, Moussa Dembélé, Agostini, Pichot, Luan, Grégorini, Davies et Saez");
    const saifi = (S.starsD2.IST || []).find(t => t[0] === "R. Saïfi");
    if (!saifi || saifi[2] !== 34)
      fail("Rafik Saïfi : trente-quatre ans à Istres, 1 021 minutes, et le Mondial 2010 avec l'Algérie derrière");
    else ok("Rafik Saïfi, trente-quatre ans et 1 021 minutes au bas du tableau d'Istres");

    // les gamins de 2009 : le tri au temps de jeu les écartait, la liste de forçage les rattrape.
    const forces = { LYO: "A. Lacazette", OM: "J. Ayew", BOR: "H. Saivet", LIL: "I. Gueye",
                     REN: "K. Théophile-Catherine", STE: "J. Guilavogui", AUX: "Y. Sanogo",
                     MTP: "B. Dabo", GRE: "S. Feghouli" };
    const forcesD2 = { CAE: "R. van La Parra", BRE: "M. Autret", ANG: "V. Manceau",
                       GUI: "G. Imbula", NIM: "A. Delort", IST: "F. Lejeune" };
    const perdus = Object.entries(forces).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom))
      .concat(Object.entries(forcesD2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom)));
    if (perdus.length) fail("pépites forcées absentes : " + perdus.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("pépites forcées présentes : Lacazette, Sanogo, Ayew, Gueye, Saivet, Guilavogui, Dabo, Taïder, Feghouli, Théophile-Catherine, Doumbia, Alain Traoré, van La Parra, Autret, Manceau, Imbula, Delort et Lejeune");
    // ALEXANDRE LACAZETTE A DIX-HUIT ANS ET DOUZE MINUTES à Gerland : son premier match
    // professionnel, et le plus haut potentiel du plateau avec Lovren. Le tri aux minutes le
    // mettait dehors, et c'est le seul forçage que Lyon paie — au prix d'Ederson et ses 1 681
    // minutes, assumé.
    const laca = (S.starsD1.LYO || []).find(t => t[0] === "A. Lacazette");
    if (!laca || laca[2] !== 18 || laca[4] < 90)
      fail("Alexandre Lacazette : dix-huit ans à Lyon, douze minutes, et tout Arsenal devant lui");
    else ok("Alexandre Lacazette, dix-huit ans et DOUZE MINUTES à Gerland, noté " + laca[3] + " pour un potentiel de " + laca[4]);
    // YAYA SANOGO, SEIZE ANS ET QUINZE MINUTES À AUXERRE : le cinquième seizième anniversaire
    // du jeu, après Didier Domi (94/95), Mamadou Sakho (06/07), Eden Hazard (07/08) et
    // Sega Keïta (08/09).
    const sanogo = (S.starsD1.AUX || []).find(t => t[0] === "Y. Sanogo");
    if (!sanogo || sanogo[2] !== 16)
      fail("Yaya Sanogo : seize ans à Auxerre, quinze minutes en Ligue 1");
    else ok("Yaya Sanogo, SEIZE ANS à Auxerre, le plus jeune du plateau — le cinquième du chantier");
    // SEPT HOMMES DE DIX-SEPT ANS OU MOINS, dont SERGE AURIER à Lens, qui passe au temps de jeu
    // tout seul avec ses 547 minutes, et DARNEL SITU dans le même vestiaire.
    const jeunots = [];
    for (const id in S.starsD1) for (const t of S.starsD1[id]) if (t[2] <= 17) jeunots.push(t[0] + " (" + id + ", " + t[2] + ")");
    for (const id in S.starsD2) for (const t of S.starsD2[id]) if (t[2] <= 17) jeunots.push(t[0] + " (" + id + ", " + t[2] + ")");
    if (jeunots.length < 7) fail("09/10 compte sept hommes de dix-sept ans ou moins, reçu " + jeunots.length + " : " + jeunots.join(", "));
    else ok("SEPT hommes de dix-sept ans ou moins au plateau : " + jeunots.join(", "));
    const aurier = (S.starsD1.LEN || []).find(t => t[0] === "S. Aurier");
    if (!aurier || aurier[2] !== 17 || aurier[4] < 88)
      fail("Serge Aurier : dix-sept ans à Lens, 547 minutes, futur capitaine de la Côte d'Ivoire");
    else ok("Serge Aurier, dix-sept ans à Lens, noté " + aurier[3] + " pour un potentiel de " + aurier[4] + " — et il passe au temps de jeu, sans forçage");
    // BRYAN DABO EST GARDÉ POUR SIX MINUTES à Montpellier : la borne basse du chantier passe
    // sous la minute unique de Josuha Guilavogui en 08/09 ? Non — six minutes, mais il est le
    // plus petit temps de jeu de cette saison-ci.
    const dabo = (S.starsD1.MTP || []).find(t => t[0] === "B. Dabo");
    if (!dabo || dabo[2] !== 17)
      fail("Bryan Dabo : dix-sept ans à Montpellier, SIX minutes dans toute la saison");
    else ok("Bryan Dabo gardé pour SIX MINUTES à Montpellier — le plus petit temps de jeu de la saison");
    // GRENOBLE, RENNES ET AUXERRE PAIENT DEUX HOMMES CHACUN : le prix du forçage, assumé
    const paires = [["GRE", ["S. Feghouli", "S. Taïder"]], ["REN", ["K. Théophile-Catherine", "T. Doumbia"]],
                    ["AUX", ["Y. Sanogo", "A. Traoré"]]];
    const manquePaire = paires.filter(([id, ns]) => ns.some(n => !(S.starsD1[id] || []).some(t => t[0] === n)));
    if (manquePaire.length) fail("forçage multiple incomplet : " + manquePaire.map(p => p[0]).join(", "));
    else ok("Grenoble, Rennes et Auxerre paient DEUX hommes chacun");

    // celles que le temps de jeu suffisait à garder
    const seuls = { OM: ["S. Mandanda", "M. Niang", "L. González", "H. Ben Arfa", "M. Valbuena", "G. Heinze", "T. Taiwo", "Brandão"],
                    LYO: ["H. Lloris", "L. López", "M. Pjanić", "J. Toulalan", "M. Bastos", "B. Gomis", "Cristiano", "D. Lovren", "M. Gonalons"],
                    AUX: ["B. Pedretti", "I. Jeleń", "D. Oliech", "S. Grichting", "Rémy Riou"],
                    LIL: ["E. Hazard", "Y. Cabaye", "A. Rami", "M. Debuchy", "Gervinho", "R. Mavuba", "P.-E. Aubameyang"],
                    MTP: ["E. Spahic", "Y. Belhanda", "M. Yanga-Mbiwa"],
                    BOR: ["Y. Gourcuff", "M. Chamakh", "A. Diarra", "Wendel", "Jussiê", "B. Trémoulinas"],
                    LOR: ["L. Koscielny", "K. Gameiro", "A. Mvuemba", "J. Morel", "F. Audard"],
                    MON: ["N. N'Koulou", "Nenê", "C.-y. Park", "S. Ruffier", "C. Mongongu"],
                    REN: ["A. Gyan", "Yann M'Vila", "J. Briand", "S. Marveaux", "F. Lemoine", "R. Fanni"],
                    VAN: ["Carlos Sánchez", "G. Ndy Assembé", "G. Danic"],
                    LEN: ["Eduardo Ribeiro", "Alaeddine Yahia", "K. Monnet-Paquet", "S. Aurier", "Samba Sow"],
                    NCY: ["André Luiz", "Alfred N'Diaye", "D. Grégorini"],
                    PSG: ["G. Hoarau", "M. Sakho", "S. Sessègnon", "C. Makélélé", "G. Coupet", "L. Giuly", "Ceará"],
                    TOU: ["A.-P. Gignac", "M. Sissoko", "C. M'Bengue", "É. Capoue", "F. Tabanou"],
                    NIC: ["D. Ospina", "L. Rémy", "A. Mounier"],
                    STE: ["B. Matuidi", "D. Payet", "B. Sako", "L. Perrin"],
                    SOC: ["M. Martin", "D. Perquis", "B. Ideye"],
                    LMN: ["S. Corchia", "D. Ovono"], GRE: ["S. Taïder"], BLG: ["O. Kapo"] };
    const rates = [];
    for (const id in seuls) for (const nom of seuls[id])
      if (!(S.starsD1[id] || []).some(t => t[0] === nom)) rates.push(nom + " (" + id + ")");
    for (const [id, nom] of [["TRS", "O. Giroud"], ["BRE", "S. Elana"], ["BRE", "N. Roux"],
                             ["CLE", "Y. Brahimi"], ["CAE", "Y. El Arabi"], ["CAE", "T. Heurtaux"],
                             ["LEH", "G. Fofana"], ["LEH", "R. Mendes"], ["MET", "S. Wiltord"],
                             ["MET", "P. Cissé"], ["MET", "J. Pied"], ["NAN", "P. Djilobodji"],
                             ["ANG", "P. Oniangué"], ["ANG", "G. Charbonnier"], ["LAV", "R. Hamouma"],
                             ["NIM", "B. Moukandjo"], ["STR", "M. Gueye"], ["ARL", "S. Piocelle"],
                             ["IST", "R. Saïfi"], ["GUI", "Bakary Koné"], ["TRS", "Youssouf Touré"],
                             ["AJA", "Leyti N'Diaye"], ["NIM", "Alphousseyni Keita"], ["GUI", "M. Diallo"]])
      if (!(S.starsD2[id] || []).some(t => t[0] === nom)) rates.push(nom + " (" + id + ")");
    if (rates.length) fail("pépites passées au temps de jeu et pourtant absentes : " + rates.join(", "));
    else ok("Gourcuff, Lloris, Hazard, Gignac, Giroud, Brahimi, Koscielny, Belhanda, Aubameyang, Corchia, Djilobodji et Hamouma passent au temps de jeu");
    // QUATRE DÉMÉNAGEMENTS DE L'ÉTÉ 2009 À PRENDRE DANS LE BON SENS, et ce sont quatre assertions
    // écrites de mémoire qui s'y sont fait prendre, comme Savidan en 08/09 : CHRISTOPHE JALLET
    // quitte Lorient pour le PARIS SG, BENJAMIN GAVANON Nancy pour SOCHAUX, JÉRÉMY MATHIEU
    // Toulouse pour VALENCE — il n'est donc nulle part au plateau —, et ANDRÉ AYEW, prêté par
    // Marseille, va jouer la LIGUE 2 À ARLES-AVIGNON, si bien que les DEUX FRÈRES AYEW sont au
    // plateau la même année, Jordan au Vélodrome et André au Parc des Sports d'Avignon.
    const DEMENAGE = [["C. Jallet", "LOR", "PSG", true], ["B. Gavanon", "NCY", "SOC", true]];
    for (const [nom, de, vers] of DEMENAGE) {
      if ((S.starsD1[de] || []).some(t => t[0] === nom)) fail(nom + " a quitté " + de + " pour " + vers + " à l'été 2009 : il ne peut pas être aux deux");
      else if (!(S.starsD1[vers] || []).some(t => t[0] === nom)) fail(nom + " joue à " + vers + " en 2009-10");
    }
    if (Object.values(S.starsD1).concat(Object.values(S.starsD2)).some(L => L.some(t => t[0] === "J. Mathieu")))
      fail("Jérémy Mathieu a signé à Valence à l'été 2009 : il ne joue plus en France en 2009-10");
    else ok("Jallet passé à Paris, Gavanon à Sochaux, et Jérémy Mathieu parti à Valence n'est nulle part au plateau");
    const andre = (S.starsD2.ARL || []).find(t => t[0] === "A. Ayew");
    const jordan = (S.starsD1.OM || []).find(t => t[0] === "J. Ayew");
    if (!andre || andre[2] !== 20) fail("André Ayew, prêté par Marseille, joue la Ligue 2 à Arles-Avignon : 1 832 minutes à vingt ans");
    else if (!jordan || jordan[2] !== 18) fail("Jordan Ayew, dix-huit ans, reste au Vélodrome : soixante-six minutes");
    else ok("LES DEUX FRÈRES AYEW au plateau la même année : André prêté en Ligue 2 à Arles-Avignon, Jordan à dix-huit ans au Vélodrome");

    // MARSEILLE REPREND LE TITRE APRÈS DIX-HUIT ANS, et c'est Didier Deschamps qui l'y ramène —
    // lui qui portait le brassard du dernier sacre, celui de 1992-93 que le jeu raconte déjà.
    // MAMADOU NIANG est MEILLEUR BUTEUR avec dix-huit buts, et son retourné contre Lyon est élu
    // BUT DE L'ANNÉE : l'héritage seul le laissait à 77 pour une saison de trente ans.
    const niang = (S.starsD1.OM || []).find(t => t[0] === "M. Niang");
    if (!niang || niang[3] < 80 || niang[2] !== 30)
      fail("Mamadou Niang : meilleur buteur du championnat avec dix-huit buts, capitaine du champion à trente ans");
    else ok("Mamadou Niang, meilleur buteur et but de l'année, noté " + niang[3] + " à trente ans");
    // LISANDRO LÓPEZ, MEILLEUR JOUEUR, arrivé de Porto pour vingt-quatre millions : aucune ancre
    // ne le connaissait, le calcul l'a sorti à 77 et il a fallu une correction à la main.
    const lisandro = (S.starsD1.LYO || []).find(t => t[0] === "L. López");
    if (!lisandro || lisandro[3] < 83)
      fail("Lisandro López : meilleur joueur du championnat 2009-10, arrivé de Porto, il ne peut pas sortir sous 83");
    else ok("Lisandro López, meilleur joueur du championnat, noté " + lisandro[3] + " — et le calcul seul le laissait à 77");
    // HUGO LLORIS, MEILLEUR GARDIEN POUR LA DEUXIÈME ANNÉE DE SUITE
    const lloris = (S.starsD1.LYO || []).find(t => t[0] === "H. Lloris");
    if (!lloris || lloris[1] !== "G" || lloris[3] < 83)
      fail("Hugo Lloris : meilleur gardien du championnat pour la deuxième année de suite");
    else ok("Hugo Lloris, meilleur gardien deux ans de suite, noté " + lloris[3]);
    // EDEN HAZARD, MEILLEUR ESPOIR POUR LA DEUXIÈME ANNÉE DE SUITE, à dix-neuf ans et 3 718 minutes
    // Son âge de jeu est « 2009 − naissance » : né en janvier 1991, Hazard est à DIX-HUIT ans au
    // registre, même s'il a fêté ses dix-neuf ans en cours de saison. C'est la convention du jeu
    // depuis 96/97, et une assertion écrite sur l'âge réel s'y est fait prendre.
    const hazard = (S.starsD1.LIL || []).find(t => t[0] === "E. Hazard");
    if (!hazard || hazard[2] !== 18 || hazard[3] < 78 || hazard[4] < 93)
      fail("Eden Hazard : meilleur espoir pour la DEUXIÈME année de suite, 3 718 minutes à Lille, et dix-huit ans à la convention du jeu");
    else ok("Eden Hazard, meilleur espoir deux ans de suite, noté " + hazard[3] + " pour un potentiel de " + hazard[4]);
    // OLIVIER GIROUD, MEILLEUR JOUEUR **ET** MEILLEUR BUTEUR DE LIGUE 2 avec vingt et un buts à
    // Tours : le jeu le porte depuis 05/06, où il entrait en jeu cent quatorze minutes à Grenoble,
    // et l'héritage seul le laissait à 64. C'est le troisième doublé individuel du chantier après
    // Pauleta en 02/03 et Benzema en 07/08.
    const giroud = (S.starsD2.TRS || []).find(t => t[0] === "O. Giroud");
    if (!giroud || giroud[3] < 74)
      fail("Olivier Giroud : meilleur joueur ET meilleur buteur de Ligue 2 avec vingt et un buts, il ne peut pas sortir sous 74");
    else ok("Olivier Giroud, meilleur joueur et meilleur buteur de Ligue 2, noté " + giroud[3] + " — l'héritage seul le laissait à 64");
    // STEEVE ELANA, MEILLEUR GARDIEN DE LIGUE 2, 3 720 minutes dans le Brest d'Alex Dupont
    const elana = (S.starsD2.BRE || []).find(t => t[0] === "S. Elana");
    if (!elana || elana[1] !== "G" || elana[3] < 70)
      fail("Steeve Elana : meilleur gardien de Ligue 2, 3 720 minutes, et Brest qui remonte");
    else ok("Steeve Elana, meilleur gardien de Ligue 2, noté " + elana[3] + " dans le Brest qui remonte");
    // LE VIEILLISSEMENT DÉRAPE DANS LES DEUX SENS (leçon de 06/07, reconduite trois fois) : une
    // ancre lointaine vieillie plusieurs fois dérape beaucoup plus qu'une ancre d'un an. Fernando
    // Morientes, ancré à Monaco en 2003 et vieilli six fois, ne peut pas ressortir au-dessus de 75
    // pour six cent vingt et une minutes à trente-trois ans ; Ludovic Giuly, déjà corrigé en 08/09,
    // doit l'être encore.
    const morientes = (S.starsD1.OM || []).find(t => t[0] === "F. Morientes");
    if (!morientes || morientes[3] > 75)
      fail("Fernando Morientes ne peut pas ressortir au-dessus de 75 : l'ancre de 2003 vieillie six fois dérape");
    else ok("Fernando Morientes tenu à " + morientes[3] + " pour sa dernière demi-saison au Vélodrome");
    const giuly = (S.starsD1.PSG || []).find(t => t[0] === "L. Giuly");
    if (!giuly || giuly[3] > 78)
      fail("Ludovic Giuly ne peut pas ressortir au-dessus de 78 à trente-trois ans : la correction de 08/09 se reconduit");
    else ok("Ludovic Giuly tenu à " + giuly[3] + " : la correction de 08/09 se reconduit, l'ancre lointaine dérape encore");
    // ALY CISSOKHO DANS L'AUTRE SENS : ancré à Gueugnon en 2007, il revient de Porto pour quinze
    // millions et joue 4 206 minutes à Lyon. L'héritage seul le laissait à 63, ce qui est faux
    // aussi — une ancre lointaine se trompe dans les DEUX directions.
    const cissokho = (S.starsD1.LYO || []).find(t => t[0] === "A. Cissokho");
    if (!cissokho || cissokho[3] < 74)
      fail("Aly Cissokho : arrivé de Porto pour quinze millions, 4 206 minutes à Lyon, il ne peut pas rester à 63");
    else ok("Aly Cissokho relevé à " + cissokho[3] + " : l'ancre de Gueugnon 2007 se trompait vers le BAS");

    const nD1 = S.d1.reduce((s, id) => s + S.starsD1[id].length, 0);
    const nD2 = S.d2.reduce((s, id) => s + S.starsD2[id].length, 0);
    if (nD1 !== 400) fail("L1 09/10 : " + nD1 + " joueurs curés (attendu 20 × 20)");
    if (nD2 !== 360) fail("L2 09/10 : " + nD2 + " joueurs curés (attendu 20 × 18)");
    if (nD1 === 400 && nD2 === 360) ok("760 joueurs réels relevés : 20 par club en L1, 18 en L2");
  }
} catch (e) { fail("exception registre : " + e.stack); }

/* ===== 2) Doublons de noms ===== */
console.log("2) Doublons de noms");
try {
  const compte = {};
  const ajoute = (nom, src) => { (compte[nom] = compte[nom] || []).push(src); };
  for (const id in api.STARS_0910) for (const t of api.STARS_0910[id]) ajoute(t[0], "L1:" + id);
  for (const id in api.STARS_D2_0910) for (const t of api.STARS_D2_0910[id]) ajoute(t[0], "L2:" + id);
  const dupClub = Object.entries(compte).filter(([n, s]) => s.length > 1);
  if (dupClub.length) dupClub.forEach(([n, s]) => fail("doublon 09/10 : « " + n + " » dans " + s.join(" + ")));
  else ok("aucun joueur dupliqué entre deux clubs en 09/10 (trente-quatre transferts arbitrés au temps de jeu)");

  // homonymes DANS la saison : celui qui portait DÉJÀ le nom court dans le jeu le garde (règle de
  // 00/01), l'autre passe en toutes lettres. Trois paires de 08/09 sont reconduites, et trois
  // sont neuves — dont une que le temps de jeu aurait tranchée à l'envers.
  const PAIRES = [["B. Cheyrou", "Benoît Cheyrou"], ["B. Koné", "Bakary Koné"],
                  ["Y. M'Vila", "Yann M'Vila"], ["S. Sow", "Samba Sow"], ["M. Diallo", "Mamadou Diallo"]];
  const mal = PAIRES.filter(([court, long]) => !compte[court] || !compte[long]);
  if (mal.length) fail("paires d'homonymes mal résolues : " + mal.map(p => p.join(" / ")).join(" ; "));
  else ok("Bruno Cheyrou garde « B. Cheyrou » face à Benoît, Bakari Koné face à Bakary, Yohan M'Vila face à Yann, Sadio Sow face à Samba et Mustapha Diallo face à Mamadou — cinq paires cohabitent");
  // LA PAIRE RIOU NE COHABITE PLUS, et il ne faut surtout pas en conclure qu'elle est cassée :
  // RUDY RIOU est bien à Marseille en 2009-10, mais il n'y joue PAS UNE MINUTE, donc le tri aux
  // minutes l'écarte. « R. Riou » doit alors rester ABSENT du plateau — Rémy garde sa forme en
  // toutes lettres de 08/09, et personne ne reprend le nom court de l'autre.
  // LE CAS QUI SE TRANCHE À L'ENVERS DU TEMPS DE JEU, ET C'EST LA RÈGLE DE 08/09 QUI LE SAUVE :
  // YANN M'VILA joue 3 318 minutes à Rennes et devient international français dans l'année, mais
  // « Y. M'Vila » est à YOHAN depuis 08/09, et Yohan n'en joue que 1 527 à Dijon. C'est l'HOMME
  // de l'ancre qui garde son nom, pas celui qui a le plus joué : Yann passe en toutes lettres.
  const yohan = (api.STARS_D2_0910.DIJ || []).find(t => t[0] === "Y. M'Vila");
  const yann = (api.STARS_0910.REN || []).find(t => t[0] === "Yann M'Vila");
  if (!yohan || yohan[2] !== 21) fail("« Y. M'Vila » reste à Yohan, que le jeu porte depuis 08/09 — vingt et un ans à Dijon");
  else if (!yann || yann[2] !== 19) fail("Yann M'Vila, dix-neuf ans à Rennes, passe en TOUTES LETTRES malgré ses 3 318 minutes");
  else ok("« Y. M'Vila » reste à Yohan et ses 1 527 minutes : Yann, pourtant trois fois plus utilisé, passe en toutes lettres");
  // SADIO SOW tient son nom court d'une ancre de CRÉTEIL 2002-03, vérifiée sur deux sources
  // (Transfermarkt ne lui connaît pas ce passage, sa fiche Wikipédia le date de 2002 à 2006) :
  // le garde-fou d'âge l'a apparié tout seul, et Samba Sow, né treize ans plus tard, cède.
  const sadio = (api.STARS_D2_0910.NIM || []).find(t => t[0] === "S. Sow");
  if (!sadio || sadio[2] !== 33) fail("« S. Sow » est à Sadio, ancré à Créteil en 2002-03 : trente-trois ans à Nîmes");
  else ok("« S. Sow » reste à Sadio, l'homme de l'ancre créteillaise de 2002 — vérifié plutôt que supposé");

  // Les noms courts qui doivent rester ABSENTS parce que leur porteur ne joue plus en France :
  // s'ils réapparaissent, c'est qu'un homme a pris celui d'un autre, et rien ne le dirait.
  const CEDENT = [["I. Bangoura", "Ismaël Bangoura"], ["A. Yahia", "Alaeddine Yahia"], ["M. Fall", "Matar Fall"],
                  ["R. Riou", "Rémy Riou"]];
  const usurpe = CEDENT.filter(([court, long]) => compte[court] || !compte[long]);
  if (usurpe.length)
    fail("nom court d'un homme absent du plateau repris : " + usurpe.map(p => p[0] + " au lieu de " + p[1]).join(" ; "));
  else ok("« I. Bangoura », « A. Yahia », « M. Fall » et « R. Riou » restent à leurs porteurs d'autrefois : Ismaël Bangoura, Alaeddine Yahia, Matar Fall et Rémy Riou passent en toutes lettres (Rudy Riou est à Marseille sans jouer une minute)");
  // les cessions de 07/08 et 08/09 tiennent, saison après saison
  const RECONDUITS = [["A. Luiz", "André Luiz"], ["C. Sánchez", "Carlos Sánchez"], ["A. N'Diaye", "Alfred N'Diaye"],
                      ["Y. Touré", "Youssouf Touré"], ["L. N'Diaye", "Leyti N'Diaye"], ["A. Keita", "Alphousseyni Keita"]];
  const casses = RECONDUITS.filter(([court, long]) => compte[court] || !compte[long]);
  if (casses.length)
    fail("reconduction cassée : " + casses.map(p => p[0] + " / " + p[1]).join(" ; "));
  else ok("les cessions de 07/08 et 08/09 sont reconduites : André Luiz, Carlos Sánchez, Alfred N'Diaye, Youssouf Touré, Leyti N'Diaye et Alphousseyni Keita restent en toutes lettres");

  // « M. Traoré » appartient toujours à un homme que le jeu porte depuis 1990 : aucun des six
  // Traoré de 2009 ne peut le reprendre, exactement comme en 06/07, 07/08 et 08/09.
  if (compte["M. Traoré"])
    fail("« M. Traoré » appartient à un homme de 1990 : aucun Traoré de 2009 ne peut le prendre");
  else ok("« M. Traoré » reste à son homme de 1990 : les six Traoré du plateau gardent chacun son initiale");
  // L'HOMME DE L'ANCRE GARDE SON NOM (règle de 08/09) : « A. Traoré » suit Alain, revenu de Brest
  // à Auxerre, où il ne joue que QUINZE MINUTES. Abdou, né la même année, est écarté au temps de jeu.
  const atr = (api.STARS_0910.AUX || []).find(t => t[0] === "A. Traoré");
  if (!atr) fail("« A. Traoré » doit rester à Alain, que le jeu porte depuis 06/07 — il est de retour à Auxerre en 2009-10");
  else if (atr[2] !== 21) fail("Alain Traoré a vingt et un ans en 2009-10, reçu " + atr[2]);
  else if (compte["Abdou Traoré"]) fail("Abdou Traoré est écarté au temps de jeu à Bordeaux : il ne peut pas être au plateau");
  else ok("« A. Traoré » suit Alain de Brest à Auxerre pour quinze minutes : l'homme de l'ancre la garde");

  // LES FORMES DU JEU PASSENT AVANT LA SOURCE, ET C'EST LE PIÈGE DU JOUR : Transfermarkt sert
  // « Cris » et « Eduardo », deux mononymes que le jeu réserve à d'autres hommes depuis 03/04.
  // Le Lyonnais garde « Cristiano », nom que le jeu lui donne depuis 04/05 ; et le Lensois est
  // EDUARDO RIBEIRO DOS SANTOS, celui même qui a marqué les deux buts de la Coupe de France 2009
  // pour Guingamp — le jeu l'écrit « Eduardo Ribeiro » depuis 07/08, et il déménage à Lens.
  if (compte["Cris"]) fail("« Cris » est à l'Angevin de 03/04 : le Lyonnais garde « Cristiano »");
  else if (!(api.STARS_0910.LYO || []).some(t => t[0] === "Cristiano"))
    fail("Cristiano Márques Gómes garde « Cristiano », le nom que le jeu lui donne depuis 04/05");
  else ok("« Cris » reste à l'Angevin de 03/04 : le Lyonnais garde « Cristiano », sa forme depuis 04/05");
  if (compte["Eduardo"]) fail("« Eduardo » est au Toulousain de 03/04 : le Lensois garde « Eduardo Ribeiro »");
  else if (!(api.STARS_0910.LEN || []).some(t => t[0] === "Eduardo Ribeiro"))
    fail("Eduardo Ribeiro dos Santos garde sa forme de 07/08 : il passe de Guingamp à Lens à l'été 2009");
  else ok("« Eduardo Ribeiro » suit son homme de Guingamp à Lens : la forme du jeu passe avant celle de la source");
  if (!(api.STARS_0910.MON || []).some(t => t[0] === "C.-y. Park"))
    fail("Chu-young Park garde « C.-y. Park », la forme que le jeu lui donne depuis 08/09");
  else ok("« C.-y. Park » garde sa minuscule de 08/09 : la source écrit autrement, le jeu ne change pas de nom en route");

  // piège « J. Arne Riise » : un prénom composé resté collé au patronyme.
  const PARTICULES = new Set(["Le", "La", "Les", "De", "Del", "Della", "Da", "Das", "Do", "Dos", "Di", "Du",
    "Van", "Von", "Der", "Ten", "Ter", "El", "Al", "Ben", "Bin", "Mac", "Mc", "O", "Saint", "San", "Aït", "Ait"]);
  // patronymes en deux mots vérifiés sur pièces, et non des prénoms avalés (jurisprudence Michael
  // Mio Nielsen, 90/91) : Bruno ECUELE MANGA, Moïse BROU APANGA, Jonathan MARTINS PEREIRA,
  // Paul ALO'O EFOULOU, et cette année Guy-Roland NDY ASSEMBÉ, gardien du Cameroun.
  const COMPOSES = new Set(["Pinto", "Dja", "Kembo", "Akpa", "Abd", "Sanches", "Moura", "Alo'o",
    "Aït", "Ben", "Da", "Dos", "Van", "De", "Le", "Ecuele", "Brou", "Martins", "Ndy"]);
  const suspects = Object.keys(compte).filter(n => {
    const m = /^[A-ZÀ-Þ]\.(-[A-ZÀ-Þ]\.)? ([A-ZÀ-Þ][a-zà-ÿ']+) [A-ZÀ-Þ]/.exec(n);
    return m && !PARTICULES.has(m[2]) && !COMPOSES.has(m[2]);
  });
  if (suspects.length) fail("noms à vérifier (prénom composé avalé dans le patronyme ?) : " + suspects.join(", "));
  else ok("aucun prénom composé resté collé au patronyme (« Ndy Assembé » est un vrai patronyme, comme « Ecuele Manga »)");

  // réconciliation France ↔ Europe (clubs européens figés en 95-96)
  const eur = new Set();
  for (const T of [api.STARS_EUROPE, api.STARS_EUROPE_C2, api.STARS_EUROPE_C3]) for (const id in T) for (const t of T[id]) eur.add(t[0]);
  const collE = Object.keys(compte).filter(n => eur.has(n));
  api.nouvellePartie("OM", KEY);
  const Gv = api.getG();
  const enFr = new Set(); for (const c of Gv.clubs.concat(Gv.autre)) for (const j of c.joueurs) if (j.reel) enFr.add(j.nom);
  const surDeux = []; for (const c of Gv.europe) for (const j of c.joueurs) if (j.reel && enFr.has(j.nom)) surDeux.push(j.nom + " (" + c.id + ")");
  if (surDeux.length) fail("joueurs réels à la fois en France et en Europe : " + surDeux.join(", "));
  else ok(collE.length + " joueurs passés en France retirés de leur club européen");
  const courts = Gv.europe.filter(c => ["G", "D", "M", "A"].some(p => c.joueurs.filter(j => j.pos === p).length < api.CIBLE[p]));
  if (courts.length) fail("clubs européens sous l'effectif cible après réconciliation : " + courts.map(c => c.id).join(","));
  // UN FORCÉ NE DOIT PAS CONTREDIRE LE RECRUTEUR (règle de 05/06) : le vivier de l'été 2009 et les
  // effectifs du championnat ne peuvent pas placer le même homme à deux endroits au coup d'envoi.
  const employes = new Set();
  for (const c of Gv.clubs.concat(Gv.autre || [])) for (const j of c.joueurs) employes.add(j.nom);
  const vivNoms = [];
  for (const t in (Gv.vivier || {})) for (const e of Gv.vivier[t]) vivNoms.push(e[0]);
  for (const r of (Gv.rapport || [])) if (r && r.nom) vivNoms.push(r.nom);
  const coll = [...new Set(vivNoms.filter(n => employes.has(n)))];
  if (coll.length) fail("vivier 09/10 contient des joueurs déjà employés : " + coll.join(", "));
  else ok("vivier de l'été 2009 disjoint des effectifs employés : aucun homme à deux endroits");
} catch (e) { fail("exception doublons : " + e.stack); }

/* ===== 3) Année de base + étés internationaux + sièges européens ===== */
console.log("3) Année de base, MONDIAL 2010 dès la première intersaison, été 2011 MUET, EURO 2012 à la troisième, sièges européens");
try {
  api.nouvellePartie("OM", KEY);
  let G = api.getG();
  if (G.saison !== KEY) fail("G.saison = " + G.saison + " (attendu " + KEY + ")");
  if (G.anBase !== 2009) fail("G.anBase = " + G.anBase + " (attendu 2009)");
  if (api.anneeJeu() !== 2009) fail("anneeJeu() = " + api.anneeJeu() + " (attendu 2009)");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G.vire = null;
  api.intersaison();
  G = api.getG();
  // PARTIR DE 09/10 FAIT TOMBER LE MONDIAL 2010 DÈS LA PREMIÈRE INTERSAISON : l'Espagne sacrée,
  // un but d'Iniesta à la 116e, et les Bleus qui rentrent de Knysna sans avoir gagné un match.
  // La dépêche ne doit surtout pas se lire comme un triomphe français.
  const ete2010 = (G.recap || []).join(" ");
  if (!/Afrique du Sud/i.test(ete2010))
    fail("été 2010 : le Mondial d'Afrique du Sud doit tomber dès la PREMIÈRE intersaison — reçu « " + ete2010.slice(0, 140) + " »");
  else ok("le MONDIAL 2010 tombe dès la PREMIÈRE intersaison : l'Espagne sacrée, un but d'Iniesta à la 116e");
  if (/LA FRANCE/.test(ete2010)) fail("l'été 2010 ne doit pas contenir « LA FRANCE » en capitales : les Bleus rentrent de Knysna");
  else ok("la dépêche de l'été 2010 ne se lit pas comme un triomphe français");
  if (G.saison !== "2010-11") fail("chaîne de saison : G.saison = " + G.saison + " (attendu 2010-11)");
  else ok("chaîne de saison correcte : 2009-10 → 2010-11");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  api.getG().vire = null; api.intersaison(); G = api.getG();
  const ete2011 = (G.recap || []).join(" ");
  if (/ÉTÉ 20\d\d/.test(ete2011))
    fail("l'été 2011 ne porte aucun tournoi : la 2e intersaison doit rester muette — reçu « " + ete2011.slice(0, 140) + " »");
  else ok("l'été 2011 est MUET — rien entre le Mondial 2010 et l'Euro 2012");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  api.getG().vire = null; api.intersaison(); G = api.getG();
  // L'EURO 2012 EST LE TROISIÈME ÉTÉ QUE LA TABLE AIT EU À APPRENDRE DEPUIS L'OUVERTURE DU
  // CHANTIER, après 2008 (écrit par 06/07) et 2010 (écrit par 07/08) : l'Espagne conserve son
  // titre et en met quatre à l'Italie à Kiev, et les Bleus sortent en quarts contre ce même
  // adversaire. Pas de « LA FRANCE » en capitales, là non plus.
  const ete2012 = (G.recap || []).join(" ");
  if (!/Pologne/i.test(ete2012))
    fail("été 2012 : l'Euro de Pologne et d'Ukraine doit tomber à la TROISIÈME intersaison — reçu « " + ete2012.slice(0, 140) + " »");
  else ok("l'EURO 2012 tombe à la TROISIÈME intersaison : l'Espagne conserve son titre, quatre buts à l'Italie à Kiev");
  if (/LA FRANCE/.test(ete2012)) fail("l'été 2012 ne doit pas contenir « LA FRANCE » en capitales : les Bleus sortent en quarts");
  else ok("la dépêche de l'été 2012 ne se lit pas comme un triomphe français");

  // L'Europe 2009-10 telle qu'elle s'est jouée : BORDEAUX (champion 2008-09) et MARSEILLE (2e) en
  // phase de groupes de Ligue des champions, LYON (3e) au barrage ; en LIGUE EUROPA — la Coupe
  // UEFA a changé de nom à l'été 2009 — TOULOUSE (4e), LILLE (5e) et GUINGAMP, vainqueur de la
  // Coupe de France 2009. Six sièges, et le sixième est EN LIGUE 2.
  const attendu = { BOR: "C1", OM: "C1", LYO: "C1", TOU: "C3", LIL: "C3", GUI: "C3",
                    PSG: null, REN: null, MON: null, STE: null, AUX: null, NIC: null, NCY: null,
                    LOR: null, VAN: null, MTP: null, LMN: null, SOC: null, LEN: null, GRE: null, BLG: null,
                    NAN: null, CAE: null, LEH: null, MET: null, BRE: null, ANG: null, STR: null,
                    TRS: null, CHA: null, ARL: null, SED: null, DIJ: null, CLE: null, BAS: null,
                    VNS: null, AJA: null, NIM: null, IST: null, LAV: null };
  for (const id in attendu) {
    api.nouvellePartie(id, KEY);
    const c = api.getG().euroCompet;
    if (c !== attendu[id]) fail("siège européen " + id + " = " + c + " (attendu " + attendu[id] + ")");
  }
  ok("sièges européens : Bordeaux, Marseille et Lyon en C1 ; Toulouse, Lille et Guingamp en Ligue Europa");
  const S = api.SAISONS[KEY];
  if ((S.euroC2 || []).length) fail("la Coupe des Coupes n'existe plus en 2009-10 : euroC2 doit être vide");
  else ok("aucun siège en Coupe des Coupes : la compétition a disparu après 1999 (dixième fois)");
  // LE CONTRÔLE QUI ATTRAPE L'ERREUR LA PLUS FACILE ET LA PLUS INVISIBLE, ET IL JOUE DANS LES DEUX
  // SENS : AUXERRE finira TROISIÈME et MONTPELLIER CINQUIÈME, et ni l'un ni l'autre ne joue
  // l'Europe cette année-là, parce que les sièges se gagnent sur le classement de 2008-09 ; et
  // GUINGAMP, QUI EST EN LIGUE 2, JOUE BEL ET BIEN LA LIGUE EUROPA.
  for (const id of ["AUX", "MTP", "LOR", "MON"])
    if ((S.euroC1 || []).includes(id) || (S.euroC3 || []).includes(id))
      fail(id + " n'a pas de siège en 2009-10 : les sièges se gagnent sur le classement de 2008-09");
  ok("Auxerre et Montpellier, futurs troisième et cinquième, partent sans Europe : les sièges se gagnent l'année d'avant");
  // ET LE SIÈGE DE DEUXIÈME DIVISION, LE PREMIER DEPUIS CHÂTEAUROUX EN 04/05 : Guingamp a gagné
  // la Coupe de France en mai 2009 contre Rennes, par deux buts d'Eduardo, alors qu'il jouait la
  // Ligue 2 — et il la joue encore en 2009-10. Il affrontera Hambourg et perdra ses deux matchs.
  if (!(S.euroC3 || []).includes("GUI"))
    fail("Guingamp joue la Ligue Europa en 2009-10 : il a gagné la Coupe de France 2009 depuis la Ligue 2");
  else if (S.d1.includes("GUI"))
    fail("Guingamp joue la LIGUE 2 en 2009-10 : son siège européen vient de la Coupe de France 2009");
  else ok("GUINGAMP joue la Ligue Europa DEPUIS LA DEUXIÈME DIVISION — le premier siège de L2 depuis Châteauroux en 04/05");
  const tousSieges = (S.euroC1 || []).concat(S.euroC3 || []);
  if (tousSieges.length !== 6) fail("2009-10 compte six sièges européens, reçu " + tousSieges.length);
  else ok("SIX sièges européens, la plus petite délégation depuis 02/03");
  const horsL1 = tousSieges.filter(id => !S.d1.includes(id));
  if (horsL1.length !== 1 || horsL1[0] !== "GUI")
    fail("exactement UN siège vient de la Ligue 2, et c'est Guingamp — reçu " + (horsL1.join(",") || "aucun"));
  else ok("un seul siège hors Ligue 1, et c'est bien Guingamp");
} catch (e) { fail("exception année/Europe : " + e.stack); }

/* ===== 4) Carrière multi-saisons depuis 09/10 ===== */
console.log("4) Carrière multi-saisons depuis 09/10 (calibrage, vieillissement)");
let totalButs = 0, totalMatchs = 0;
const departs = ["OM", "GRE", "ARL", "GUI"];  // le champion, le dernier, le club neuf, le Ligue 2 d'Europe
const NS = 6;
for (const dep of departs) {
  try {
    api.nouvellePartie(dep, KEY);
    for (let s = 0; s < NS; s++) {
      for (let d = 0; d < 38; d++) api.jouerJournee();
      const G = api.getG();
      let bp = 0, jSum = 0;
      for (const c of G.clubs) { bp += c.bp; jSum += c.j; }
      totalButs += bp; totalMatchs += jSum / 2;
      G.vire = null;
      api.intersaison();
      let mx = 0, actif36 = null;
      for (const c of api.getG().clubs) for (const j of c.joueurs) { if (j.age > mx) mx = j.age; if (j.age >= 36) actif36 = j; }
      if (actif36) { fail("joueur 36+ actif après vieillissement : " + actif36.nom + " (" + actif36.age + ")"); break; }
      if (mx > 35) { fail("âge max " + mx + " > 35"); break; }
    }
    ok("club " + dep + " : " + NS + " saisons sans exception (âge max ≤ 35)");
  } catch (e) { fail("exception carrière 09/10 (" + dep + ") : " + e.stack); }
}
const gpm = totalButs / totalMatchs;
console.log("— Calibrage 09/10 : " + gpm.toFixed(3) + " buts/match sur " + Math.round(totalMatchs) + " matchs —");
if (gpm < 2.0 || gpm > 2.8) fail("calibrage 09/10 hors plage (cible ~2,3) : " + gpm.toFixed(3));
else ok("calibrage 09/10 dans la plage attendue");

console.log(FAILS === 0 ? "\n✅ HARNAIS 09/10 : TOUT EST VERT" : "\n❌ HARNAIS 09/10 : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
