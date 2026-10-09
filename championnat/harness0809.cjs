/* Harnais de validation — SAISON DE DÉPART 2008-09
   Vérifie : intégrité du registre SAISONS, doublons de noms, année de base/étés,
   sièges européens, carrière multi-saisons depuis 08/09 (calibrage, vieillissement).
   C'est la saison la plus RÉCENTE du jeu, comme 07/08 l'était avant elle : toutes les
   ancres de notes sont derrière elle. Six singularités à surveiller ici — le plateau tombe
   juste tout seul pour la SEPTIÈME fois de suite (vingt et vingt, aucun repêchage) ; le
   huitième titre d'affilée de Lyon n'arrive pas, et c'est BORDEAUX qui prend le championnat ;
   l'été 2009 est MUET et le MONDIAL 2010 tombe à la DEUXIÈME intersaison ; les SEPT sièges
   européens sont tous en Ligue 1, et le contrôle joue encore DANS LES DEUX SENS, puisque
   SAINT-ÉTIENNE, qui finira dix-septième, joue la Coupe UEFA ; NEUF hommes de dix-sept ans
   ou moins sont au plateau, un record, dont SEGA KEÏTA à SEIZE ANS à Troyes ; et le dernier
   de tableau de Dijon s'appelle PIERRE-EMERICK AUBAMEYANG, ce que la sentinelle de fin
   aurait coûté sans bruit.
   Usage : node harness0809.cjs                                                    */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,CIBLE,SAISONS,STARS_0809,STARS_D2_0809,D1_0809,D2_0809,STARS_EUROPE,STARS_EUROPE_C2,STARS_EUROPE_C3,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const KEY = "2008-09";

/* ===== 1) Intégrité du registre SAISONS ===== */
console.log("1) Registre SAISONS : composition, métadonnées, effectifs");
try {
  const S = api.SAISONS[KEY];
  if (!S) fail("saison " + KEY + " absente du registre");
  else {
    if (S.d1.length !== 20) fail("L1 08/09 a " + S.d1.length + " clubs (attendu 20)");
    if (S.d2.length !== 20) fail("L2 08/09 a " + S.d2.length + " clubs (attendu 20)");
    const tous = S.d1.concat(S.d2);
    const setIds = new Set(tous);
    if (setIds.size !== 40) fail("ids dupliqués entre L1 et L2 (uniques: " + setIds.size + "/40)");
    const metaManquante = tous.filter(id => !api.metaClub(id));
    if (metaManquante.length) fail("métadonnées manquantes : " + metaManquante.join(","));
    if (!metaManquante.length && setIds.size === 40 && S.d1.length === 20 && S.d2.length === 20)
      ok("08/09 = 20 L1 + 20 L2, 40 clubs uniques, toutes métadonnées résolues");

    // LE PLATEAU TOMBE JUSTE TOUT SEUL POUR LA SEPTIÈME FOIS DE SUITE : les deux échelons
    // réels ont vingt clubs, donc aucun repêchage, aucun écarté. Listes vérifiées par ÉGALITÉ.
    const REELS_D1 = ["LYO", "BOR", "OM", "NCY", "STE", "REN", "LIL", "NIC", "LMN", "LOR",
                      "CAE", "MON", "VAN", "SOC", "AJA", "PSG", "TOU", "LEH", "NAN", "GRE"];
    const REELS_D2 = ["SED", "CLE", "TRO", "BRE", "MTP", "ACA", "ANG", "BAS", "GUI", "REI",
                      "AMI", "CHA", "BLG", "DIJ", "LEN", "STR", "MET", "TRS", "NIM", "VNS"];
    const absentsD1 = REELS_D1.filter(id => !S.d1.includes(id));
    const intrusD1 = S.d1.filter(id => !REELS_D1.includes(id));
    if (absentsD1.length || intrusD1.length)
      fail("L1 08/09 : absents " + (absentsD1.join(",") || "—") + " / intrus " + (intrusD1.join(",") || "—"));
    else ok("les vingt clubs de la vraie Ligue 1 2008-09 sont au plateau, et eux seuls (Le Havre champion de L2, Nantes et Grenoble promus)");
    const absentsD2 = REELS_D2.filter(id => !S.d2.includes(id));
    const intrusD2 = S.d2.filter(id => !REELS_D2.includes(id));
    if (absentsD2.length || intrusD2.length)
      fail("L2 08/09 : absents " + (absentsD2.join(",") || "—") + " / intrus " + (intrusD2.join(",") || "—"));
    else ok("les vingt clubs de la vraie Ligue 2 2008-09 sont au plateau, et eux seuls (Lens, Metz et Strasbourg descendus)");
    if (S.d1.length + S.d2.length !== REELS_D1.length + REELS_D2.length)
      fail("le compte de 08/09 doit tomber juste sans repêcher personne");
    else ok("AUCUN repêchage ni d'un côté ni de l'autre — la septième fois de suite, depuis 02/03");

    // Vannes OC est le seul club neuf du plateau : monté du National pour sa PREMIÈRE saison
    // professionnelle, dix ans après sa naissance, et il ira perdre la finale de la Coupe de
    // la Ligue au Stade de France.
    const vns = api.metaClub("VNS");
    if (!vns) fail("Vannes OC (VNS) doit être au registre des clubs");
    else if (!S.d2.includes("VNS")) fail("Vannes joue la Ligue 2 en 2008-09");
    else if (!/Rabine/.test(vns.stade)) fail("le stade de Vannes est le stade de la Rabine, pas « " + vns.stade + " »");
    else if (vns.cap !== 7500) fail("la Rabine comptait sept mille cinq cents places en 2008, pas " + vns.cap);
    else ok("Vannes OC, seul club neuf de la saison, au stade de la Rabine et en Ligue 2");
    // LE PIÈGE DE CODE, COMME « BOU »/« BLG » EN 07/08 : « VAN » est pris depuis 90/91 par
    // Valenciennes, qui joue justement la Ligue 1 cette année-là. Vannes prend donc « VNS ».
    const valenciennes = api.metaClub("VAN");
    if (!valenciennes || !/Valenciennes/.test(valenciennes.nom))
      fail("« VAN » doit rester Valenciennes, que le jeu porte depuis 90/91");
    else if (!S.d1.includes("VAN"))
      fail("Valenciennes joue la Ligue 1 en 2008-09 : les deux clubs sont au plateau la même année");
    else ok("« VAN » reste à Valenciennes, en Ligue 1 : Vannes prend « VNS », et les deux jouent la même saison");

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

    // pas de plafond d'âge depuis 99/00 : les vétérans jouent leur saison réelle puis raccrochent.
    // Ils sont NEUF cette année, un record, dont CINQ gardiens titulaires — et le doyen du jeu,
    // Gilles Wimbée, monte en Ligue 1 avec Grenoble à TRENTE-SEPT ANS.
    const vets = { BOR: "U. Ramé", NIC: "O. Echouafni", GRE: "G. Wimbée", NAN: "J. Alonzo", LEH: "C. Revault" };
    const vetsD2 = { STR: "S. Cassard", BRE: "O. Guégan", AMI: "C. Tourenne" };
    const absentsV = Object.entries(vets).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom))
      .concat(Object.entries(vetsD2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom)));
    if (absentsV.length)
      fail("vétérans 36+ manquants : " + absentsV.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("les vétérans de 36 ans et plus sont conservés : Ramé, Echouafni, Wimbée, Alonzo, Revault, Cassard, Guégan, Tourenne");
    const wimbee = (S.starsD1.GRE || []).find(t => t[0] === "G. Wimbée");
    if (!wimbee || wimbee[2] !== 37 || wimbee[1] !== "G")
      fail("Gilles Wimbée garde les buts de Grenoble à TRENTE-SEPT ANS, en Ligue 1 cette fois : 3 330 minutes");
    else ok("Gilles Wimbée, trente-sept ans et 3 330 minutes dans les buts de Grenoble — le doyen du jeu, deux ans de suite");
    const flachez = (S.starsD1.GRE || []).find(t => t[0] === "M. Flachez");
    if (!flachez || flachez[2] !== 36)
      fail("Michaël Flachez joue sa saison à trente-six ans à Grenoble");
    else ok("Michaël Flachez, trente-six ans à Grenoble : le promu aligne deux des neuf vétérans à lui seul");

    // LE PIÈGE DES SEPT DERNIÈRES SAISONS, QU'UN HARNAIS DOIT GARDER : le découpage des tableaux
    // laisse la DERNIÈRE ligne collée au bas de page, si bien qu'une sentinelle de fin ne trouve
    // plus la cellule des minutes et rend ZÉRO. Cette année, le dernier de tableau de Dijon
    // s'appelle PIERRE-EMERICK AUBAMEYANG et il a joué 2 484 minutes ; celui de Toulouse est
    // MOUSSA SISSOKO et ses 2 761 minutes. Deux pertes qu'aucun autre contrôle n'aurait vues.
    const DERNIERS = { BOR: "D. Bellion", TOU: "M. Sissoko" };
    const DERNIERS_D2 = { DIJ: "P.-E. Aubameyang", SED: "B. Guèye", AMI: "N. Raynier", TRO: "Sega Keïta" };
    const zappes = Object.entries(DERNIERS).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom))
      .concat(Object.entries(DERNIERS_D2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom)));
    if (zappes.length)
      fail("derniers de tableau perdus (la sentinelle de fin a frappé) : " + zappes.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("les derniers de tableau ont leurs vraies minutes : Aubameyang, Moussa Sissoko, Bellion, Babacar Guèye, Raynier et Sega Keïta");
    const auba = (S.starsD2.DIJ || []).find(t => t[0] === "P.-E. Aubameyang");
    if (!auba || auba[2] !== 19 || auba[4] < 90)
      fail("Pierre-Emerick Aubameyang : dix-neuf ans à Dijon, prêté par le Milan AC, 2 484 minutes — et tout devant lui");
    else ok("Pierre-Emerick Aubameyang, dix-neuf ans en Ligue 2, noté " + auba[3] + " pour un potentiel de " + auba[4]);

    // les gamins de 2008 : le tri au temps de jeu les écartait, la liste de forçage les rattrape.
    const forces = { BOR: "H. Saivet", LYO: "M. Pjanić", TOU: "F. Tabanou", LIL: "Y. Salibur",
                     PSG: "Y. Mulumbu", REN: "K. Théophile-Catherine", AJA: "D. N'Dinga",
                     STE: "J. Guilavogui", CAE: "R. van La Parra", LEH: "J.-A. Kana-Biyik" };
    const forcesD2 = { LEN: "A. Omrani", MTP: "A. El Kaoutari", BLG: "S. Mouyokolo", STR: "L. Damour",
                       MET: "F. Diagne", DIJ: "Y. M'Vila", BAS: "J. Martial", BRE: "G. Borne",
                       CHA: "T. Doumbia", TRO: "Sega Keïta", REI: "J. Kodjia" };
    const perdus = Object.entries(forces).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom))
      .concat(Object.entries(forcesD2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom)));
    if (perdus.length) fail("pépites forcées absentes : " + perdus.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("pépites forcées présentes : Sega Keïta, Kolodziejczak, Salibur, van La Parra, Omrani, Damour, Martial, Pjanić, Guilavogui, Saivet, Sertic, El Kaoutari, Théophile-Catherine, Tabanou, Kana-Biyik, Diagne, Kodjia, Doumbia, N'Dinga, M'Vila, Borne, Mouyokolo, Mulumbu, Sidi Keita");
    // SEGA KEÏTA A SEIZE ANS ET TRENTE ET UNE MINUTES à Troyes, en Ligue 2 : le quatrième
    // seizième anniversaire du jeu après Didier Domi (94/95), Mamadou Sakho (06/07) et
    // Eden Hazard (07/08). Il s'écrit en TOUTES LETTRES, parce que « S. Keita » est à
    // Seydou depuis 00/01 et que l'œil ne distingue pas le tréma.
    const sega = (S.starsD2.TRO || []).find(t => t[0] === "Sega Keïta");
    if (!sega || sega[2] !== 16)
      fail("Sega Keïta : seize ans à Troyes, trente et une minutes en Ligue 2");
    else ok("Sega Keïta, SEIZE ANS à Troyes, le plus jeune du plateau — et en toutes lettres, « S. Keita » étant à Seydou");
    // NEUF HOMMES DE DIX-SEPT ANS OU MOINS AU PLATEAU, UN RECORD DU CHANTIER : la récolte de
    // 07/08 en comptait deux. Eden Hazard, dix-sept ans et 1 698 minutes, est MEILLEUR ESPOIR.
    const jeunots = [];
    for (const id in S.starsD1) for (const t of S.starsD1[id]) if (t[2] <= 17) jeunots.push(t[0] + " (" + id + ", " + t[2] + ")");
    for (const id in S.starsD2) for (const t of S.starsD2[id]) if (t[2] <= 17) jeunots.push(t[0] + " (" + id + ", " + t[2] + ")");
    if (jeunots.length < 9) fail("08/09 compte neuf hommes de dix-sept ans ou moins, reçu " + jeunots.length + " : " + jeunots.join(", "));
    else ok("NEUF hommes de dix-sept ans ou moins au plateau, un record : " + jeunots.join(", "));
    const hazard = (S.starsD1.LIL || []).find(t => t[0] === "E. Hazard");
    if (!hazard || hazard[2] !== 17 || hazard[4] < 93)
      fail("Eden Hazard : MEILLEUR ESPOIR du championnat 2008-09, dix-sept ans et 1 698 minutes à Lille");
    else ok("Eden Hazard, meilleur espoir à dix-sept ans, noté " + hazard[3] + " pour un potentiel de " + hazard[4] + " — le plus haut du plateau avec N'Koulou");
    // JOSUHA GUILAVOGUI N'A JOUÉ QU'UNE MINUTE de toute la saison : la borne basse du chantier,
    // sous les trois minutes d'Alain Traoré en 07/08.
    const guila = (S.starsD1.STE || []).find(t => t[0] === "J. Guilavogui");
    if (!guila || guila[2] !== 18)
      fail("Josuha Guilavogui : dix-huit ans à Saint-Étienne, UNE minute dans toute la saison");
    else ok("Josuha Guilavogui gardé pour UNE MINUTE à Saint-Étienne — la borne basse du chantier");
    // Lyon, Bordeaux et Lens paient DEUX hommes chacun : le prix du forçage, assumé
    const paires = [["LYO", ["M. Pjanić", "T. Kolodziejczak"]], ["BOR", ["H. Saivet", "G. Sertic"]]];
    const pairesD2 = [["LEN", ["A. Omrani", "Sidi Keita"]]];
    const manquePaire = paires.filter(([id, ns]) => ns.some(n => !(S.starsD1[id] || []).some(t => t[0] === n)))
      .concat(pairesD2.filter(([id, ns]) => ns.some(n => !(S.starsD2[id] || []).some(t => t[0] === n))));
    if (manquePaire.length) fail("forçage multiple incomplet : " + manquePaire.map(p => p[0]).join(", "));
    else ok("Lyon, Bordeaux et Lens paient DEUX hommes chacun");

    // celles que le temps de jeu suffisait à garder
    const seuls = { BOR: ["Y. Gourcuff", "M. Chamakh", "F. Cavenaghi", "A. Diarra", "M. Planus", "B. Trémoulinas", "Wendel", "Henrique"],
                    OM: ["S. Mandanda", "H. Ben Arfa", "M. Valbuena", "Benoît Cheyrou", "M. Niang", "T. Taiwo", "Brandão"],
                    LYO: ["H. Lloris", "K. Benzema", "Juninho", "Cristiano", "J. Toulalan", "J. Makoun", "S. Govou"],
                    TOU: ["A.-P. Gignac", "É. Capoue", "M. Sissoko", "C. M'Bengue", "J. Mathieu"],
                    LIL: ["E. Hazard", "M. Bastos", "Y. Cabaye", "A. Rami", "M. Debuchy", "A. Chedjou"],
                    PSG: ["G. Hoarau", "M. Landreau", "J. Rothen", "S. Armand", "Ceará"],
                    REN: ["C. Bocanegra", "S. Mbia", "J. Briand", "R. Fanni"],
                    STE: ["B. Gomis", "B. Matuidi", "D. Payet", "Ilan"],
                    NIC: ["D. Ospina", "L. Rémy", "Mahamane Traoré"],
                    MON: ["N. N'Koulou", "Adriano", "C.-y. Park", "D. Simic"],
                    AJA: ["Rémy Riou", "B. Pedretti", "D. Dudka"],
                    LMN: ["Gervinho", "M. Maïga", "T. Helstad"],
                    NCY: ["André Luiz", "B. Gavanon"], LOR: ["C. Jallet", "J. Morel"],
                    CAE: ["S. Savidan", "N. Seube"], VAN: ["Carlos Sánchez", "Mody Traoré", "G. Danic"],
                    SOC: ["M. Martin", "Santos"], NAN: ["I. Klasnic", "J. Alonzo"],
                    GRE: ["G. Wimbée", "S. Paillot"], LEH: ["C. Revault", "A. Ba"] };
    const rates = [];
    for (const id in seuls) for (const nom of seuls[id])
      if (!(S.starsD1[id] || []).some(t => t[0] === nom)) rates.push(nom + " (" + id + ")");
    for (const [id, nom] of [["MTP", "M. Yanga-Mbiwa"], ["MET", "P. Cissé"], ["CLE", "M. Benatia"],
                             ["GUI", "Eduardo Ribeiro"], ["GUI", "Bakary Koné"], ["BAS", "W. Khazri"],
                             ["AMI", "S. Nzonzi"], ["ACA", "B. André"], ["VNS", "F. Sammaritano"],
                             ["TRO", "C. Beauvue"], ["SED", "I. Traoré"], ["BLG", "Z. Touré"],
                             ["VNS", "B. Costil"]])
      if (!(S.starsD2[id] || []).some(t => t[0] === nom)) rates.push(nom + " (" + id + ")");
    if (rates.length) fail("pépites passées au temps de jeu et pourtant absentes : " + rates.join(", "));
    else ok("Gourcuff, Lloris, Benzema, Hazard, Gignac, Capoue, N'Koulou, Ospina, Aubameyang, Nzonzi, Yanga-Mbiwa et Khazri passent au temps de jeu");
    // DEUX DÉMÉNAGEMENTS DE L'ÉTÉ 2008 QU'IL FAUT PRENDRE DANS LE BON SENS, et c'est une
    // assertion écrite de mémoire qui s'est fait prendre : Steve Savidan quitte Valenciennes
    // pour CAEN, et Benoît Costil, vingt et un ans, va garder les buts de VANNES en Ligue 2 —
    // le club neuf du plateau aligne un futur international français dans sa cage.
    if ((S.starsD1.VAN || []).some(t => t[0] === "S. Savidan"))
      fail("Steve Savidan a quitté Valenciennes pour Caen à l'été 2008 : il ne peut pas être aux deux");
    else if (!(S.starsD1.CAE || []).some(t => t[0] === "S. Savidan"))
      fail("Steve Savidan joue à Caen en 2008-09, 3 457 minutes");
    else ok("Steve Savidan a bien déménagé de Valenciennes à Caen à l'été 2008");
    const costil = (S.starsD2.VNS || []).find(t => t[0] === "B. Costil");
    if (!costil || costil[1] !== "G" || costil[2] !== 21)
      fail("Benoît Costil, vingt et un ans, garde les buts de Vannes en 2008-09 : 2 395 minutes");
    else ok("Benoît Costil, vingt et un ans dans la cage du club neuf — Vannes aligne un futur international français");
    // YOANN GOURCUFF, MEILLEUR JOUEUR du championnat 2008-09, la saison de sa vie à Bordeaux :
    // l'héritage seul le laissait à 75, avec une ancre rennaise de 2005.
    const gourcuff = (S.starsD1.BOR || []).find(t => t[0] === "Y. Gourcuff");
    if (!gourcuff || gourcuff[3] < 83 || gourcuff[2] !== 22)
      fail("Yoann Gourcuff : meilleur joueur du championnat 2008-09, vingt-deux ans à Bordeaux, il ne peut pas sortir sous 83");
    else ok("Yoann Gourcuff, meilleur joueur du championnat, noté " + gourcuff[3] + " pour un potentiel de " + gourcuff[4]);
    // HUGO LLORIS, MEILLEUR GARDIEN, et il a changé de club : Nice → Gerland
    const lloris = (S.starsD1.LYO || []).find(t => t[0] === "H. Lloris");
    if (!lloris || lloris[1] !== "G" || lloris[3] < 81)
      fail("Hugo Lloris : meilleur gardien du championnat 2008-09, arrivé de Nice à Lyon");
    else ok("Hugo Lloris, meilleur gardien, noté " + lloris[3] + " à Lyon — il gardait les buts de Nice l'année d'avant");
    if ((S.starsD1.NIC || []).some(t => t[0] === "H. Lloris"))
      fail("Hugo Lloris ne peut pas être à Nice ET à Lyon en 2008-09");
    // ANDRÉ-PIERRE GIGNAC, MEILLEUR BUTEUR avec vingt-quatre buts, à Toulouse
    const gignac = (S.starsD1.TOU || []).find(t => t[0] === "A.-P. Gignac");
    if (!gignac || gignac[3] < 79)
      fail("André-Pierre Gignac : meilleur buteur du championnat avec vingt-quatre buts");
    else ok("André-Pierre Gignac, meilleur buteur avec vingt-quatre buts, noté " + gignac[3]);
    // KARIM BENZEMA reste le mieux noté du plateau, dix-sept buts avant le Real Madrid
    const benzema = (S.starsD1.LYO || []).find(t => t[0] === "K. Benzema");
    if (!benzema || benzema[3] < 84 || benzema[2] !== 21)
      fail("Karim Benzema : vingt et un ans, dix-sept buts, et le Real Madrid l'été suivant");
    else ok("Karim Benzema, le mieux noté du plateau à " + benzema[3] + " — sa dernière saison française");
    // LE VIEILLISSEMENT DÉRAPE DANS LES DEUX SENS (leçon de 06/07, reconduite en 07/08) : une
    // ancre lointaine vieillie plusieurs fois dérape beaucoup plus qu'une ancre d'un an.
    // Ludovic Giuly, ancré à Monaco en 2003 et vieilli cinq fois, ne peut pas ressortir au-dessus
    // de 80 pour une saison de trente-deux ans au Parc des Princes.
    const giuly = (S.starsD1.PSG || []).find(t => t[0] === "L. Giuly");
    if (!giuly || giuly[3] > 81)
      fail("Ludovic Giuly ne peut pas ressortir au-dessus de 81 : l'ancre de 2003 vieillie cinq fois dérape");
    else ok("Ludovic Giuly tenu à " + giuly[3] + " : une ancre de 2003 vieillie cinq fois demande une correction à la main");

    const nD1 = S.d1.reduce((s, id) => s + S.starsD1[id].length, 0);
    const nD2 = S.d2.reduce((s, id) => s + S.starsD2[id].length, 0);
    if (nD1 !== 400) fail("L1 08/09 : " + nD1 + " joueurs curés (attendu 20 × 20)");
    if (nD2 !== 360) fail("L2 08/09 : " + nD2 + " joueurs curés (attendu 20 × 18)");
    if (nD1 === 400 && nD2 === 360) ok("760 joueurs réels relevés : 20 par club en L1, 18 en L2");
  }
} catch (e) { fail("exception registre : " + e.stack); }

/* ===== 2) Doublons de noms ===== */
console.log("2) Doublons de noms");
try {
  const compte = {};
  const ajoute = (nom, src) => { (compte[nom] = compte[nom] || []).push(src); };
  for (const id in api.STARS_0809) for (const t of api.STARS_0809[id]) ajoute(t[0], "L1:" + id);
  for (const id in api.STARS_D2_0809) for (const t of api.STARS_D2_0809[id]) ajoute(t[0], "L2:" + id);
  const dupClub = Object.entries(compte).filter(([n, s]) => s.length > 1);
  if (dupClub.length) dupClub.forEach(([n, s]) => fail("doublon 08/09 : « " + n + " » dans " + s.join(" + ")));
  else ok("aucun joueur dupliqué entre deux clubs en 08/09 (quarante-deux transferts arbitrés au temps de jeu)");

  // homonymes DANS la saison : celui qui portait DÉJÀ le nom court dans le jeu le garde (règle de
  // 00/01), l'autre passe en toutes lettres. Les trois paires de 07/08 sont reconduites, et deux
  // sont neuves — dont une que rien ne séparait, deux hommes nés la MÊME année.
  const PAIRES = [["B. Cheyrou", "Benoît Cheyrou"], ["R. Riou", "Rémy Riou"], ["B. Koné", "Bakary Koné"],
                  ["A. Keita", "Alphousseyni Keita"], ["M. Martin", "Malaury Martin"]];
  const mal = PAIRES.filter(([court, long]) => !compte[court] || !compte[long]);
  if (mal.length) fail("paires d'homonymes mal résolues : " + mal.map(p => p.join(" / ")).join(" ; "));
  else ok("Bruno Cheyrou garde « B. Cheyrou » face à Benoît, Rudy Riou face à Rémy, Bakari Koné face à Bakary, Abdul Kader Keita face à Alphousseyni, et Marvin Martin face à Malaury — les cinq paires cohabitent");
  // DEUX MARTIN NÉS LA MÊME ANNÉE, ET AUCUNE ANCRE POUR TRANCHER : « M. Martin » est neuf au
  // registre, donc c'est le temps de jeu qui décide — Marvin (1 811 minutes à Sochaux) le prend,
  // Malaury (Nîmes) passe en toutes lettres. Le garde-fou d'âge était muet sur ce cas.
  const marvin = (api.STARS_0809.SOC || []).find(t => t[0] === "M. Martin");
  const malaury = (api.STARS_D2_0809.NIM || []).find(t => t[0] === "Malaury Martin");
  if (!marvin || !malaury || marvin[2] !== malaury[2])
    fail("Marvin Martin (Sochaux) et Malaury Martin (Nîmes) sont nés la même année : le temps de jeu tranche, pas l'âge");
  else ok("Marvin et Malaury Martin, nés la même année : le temps de jeu tranche à Sochaux, Malaury passe en toutes lettres");

  // Et le contrôle qui compte vraiment : cinq hommes passent en toutes lettres parce que leur nom
  // court est à un homme que le JEU porte déjà et qui ne joue PLUS en France cette année-là. Le
  // nom court doit donc rester ABSENT du plateau : s'il réapparaît, c'est qu'un homme a pris
  // celui d'un autre, et rien ne le dirait.
  const CEDENT = [["M. Paulo", "Marcos Paulo"], ["Y. Touré", "Youssouf Touré"], ["M. Faye", "Maodomalick Faye"],
                  ["H. Camara", "Hassoun Camara"], ["L. N'Diaye", "Leyti N'Diaye"]];
  const usurpe = CEDENT.filter(([court, long]) => compte[court] || !compte[long]);
  if (usurpe.length)
    fail("nom court d'un homme absent du plateau repris : " + usurpe.map(p => p[0] + " au lieu de " + p[1]).join(" ; "));
  else ok("« M. Paulo », « Y. Touré », « M. Faye », « H. Camara » et « L. N'Diaye » restent à leurs porteurs d'autrefois : Marcos Paulo, Youssouf Touré, Maodomalick Faye, Hassoun Camara et Leyti N'Diaye passent en toutes lettres");
  // les reconductions de 07/08 tiennent : les quatre noms courts cédés l'an dernier le restent
  const RECONDUITS = [["S. Keita", "Sidi Keita"], ["M. N'Diaye", "Momar N'Diaye"], ["A. Luiz", "André Luiz"],
                      ["C. Sánchez", "Carlos Sánchez"], ["A. N'Diaye", "Alfred N'Diaye"]];
  const casses = RECONDUITS.filter(([court, long]) => compte[court] || !compte[long]);
  if (casses.length)
    fail("reconduction de 07/08 cassée : " + casses.map(p => p[0] + " / " + p[1]).join(" ; "));
  else ok("les cessions de 07/08 sont reconduites : Sidi Keita, Momar N'Diaye, André Luiz, Carlos Sánchez et Alfred N'Diaye restent en toutes lettres");

  // « M. Traoré » appartient toujours à un homme que le jeu porte depuis 1990 : ni Mahamane ni
  // Mody ne peut le reprendre, exactement comme en 06/07 et 07/08.
  if (compte["M. Traoré"])
    fail("« M. Traoré » appartient à un homme de 1990 : aucun Traoré de 2008 ne peut le prendre");
  else {
    const deux = [["Mahamane Traoré", "NIC"], ["Mody Traoré", "VAN"]];
    const absents = deux.filter(([n]) => !compte[n]);
    if (absents.length) fail("Mahamane et Mody Traoré doivent être au plateau en toutes lettres : manquent " + absents.map(a => a[0]).join(", "));
    else ok("Mahamane et Mody Traoré restent en toutes lettres : « M. Traoré » est à un homme de 1990");
  }

  // LE PIÈGE DE 07/08 SE REJOUE, ET LE REMÈDE TIENT : deux hommes nés la même année se disputent
  // l'ancre « A. Traoré ». Alain, que le jeu porte depuis 06/07, a changé de club (Auxerre →
  // Brest) ; Abdou, né la même année, joue à Bordeaux et avait plus de minutes. C'est l'HOMME de
  // l'ancre qui la garde, pas le club où elle a été posée, et pas les minutes : Alain garde
  // « A. Traoré » à Brest, et Abdou reste dehors, écarté au temps de jeu.
  const atr = (api.STARS_D2_0809.BRE || []).find(t => t[0] === "A. Traoré");
  if (!atr) fail("« A. Traoré » doit rester à Alain, que le jeu porte depuis 06/07 — il joue à Brest en 2008-09");
  else if (atr[2] !== 20) fail("Alain Traoré a vingt ans en 2008-09, reçu " + atr[2]);
  else if (compte["Abdou Traoré"]) fail("Abdou Traoré est écarté au temps de jeu à Bordeaux : il ne peut pas être au plateau");
  else ok("« A. Traoré » suit Alain d'Auxerre à Brest : l'homme de l'ancre la garde, et Abdou reste dehors");

  // LES MONONYMES BRÉSILIENS, reconduits de 07/08, tous tranchés par identifiant Transfermarkt
  if (compte["Eduardo"]) fail("« Eduardo » est au Toulousain de 03/04, né en 1979 : le Guingampais né en 1980 est un autre homme");
  else if (!(api.STARS_D2_0809.GUI || []).some(t => t[0] === "Eduardo Ribeiro"))
    fail("Eduardo Ribeiro dos Santos doit s'écrire « Eduardo Ribeiro » à Guingamp — il y marque les DEUX buts de la Coupe de France 2009");
  else ok("« Eduardo » reste au Toulousain de 03/04 : le Guingampais s'écrit « Eduardo Ribeiro », et c'est lui qui gagne la Coupe de France depuis la Ligue 2");
  if (compte["Cris"]) fail("« Cris » est à l'Angevin de 03/04 : le Lyonnais garde « Cristiano »");
  else if (!(api.STARS_0809.LYO || []).some(t => t[0] === "Cristiano"))
    fail("Cristiano Márques Gómes garde « Cristiano », le nom que le jeu lui donne depuis 04/05");
  else if (!(api.STARS_0809.LYO || []).some(t => t[0] === "Juninho"))
    fail("Juninho Pernambucano garde « Juninho », le nom que le jeu lui donne depuis 01/02 — sa dernière saison à Gerland");
  else ok("les formes du jeu passent avant la source : « Cristiano » depuis 04/05, « Juninho » depuis 01/02");
  // EL FARDOU BEN : la source écrit « El Fardou Ben », et découper le prénom au premier mot
  // fabriquait « E. Fardou Ben » — un nom qui n'existe pas. Il reste en toutes lettres.
  if (compte["E. Fardou Ben"]) fail("« E. Fardou Ben » n'est pas un nom : El Fardou Ben reste en toutes lettres");
  else if (!(api.STARS_0809.LEH || []).some(t => t[0] === "El Fardou Ben"))
    fail("El Fardou Ben doit figurer au Havre sous son nom entier");
  else ok("El Fardou Ben garde son nom entier : son prénom ne se découpe pas au premier mot");

  // piège « J. Arne Riise » : un prénom composé resté collé au patronyme.
  const PARTICULES = new Set(["Le", "La", "Les", "De", "Del", "Della", "Da", "Das", "Do", "Dos", "Di", "Du",
    "Van", "Von", "Der", "Ten", "Ter", "El", "Al", "Ben", "Bin", "Mac", "Mc", "O", "Saint", "San", "Aït", "Ait"]);
  // patronymes en deux mots vérifiés sur pièces, et non des prénoms avalés (jurisprudence Michael
  // Mio Nielsen, 90/91) : Bruno ECUELE MANGA, Moïse BROU APANGA, Jonathan MARTINS PEREIRA,
  // Paul ALO'O EFOULOU.
  const COMPOSES = new Set(["Pinto", "Dja", "Kembo", "Akpa", "Abd", "Sanches", "Moura", "Alo'o",
    "Aït", "Ben", "Da", "Dos", "Van", "De", "Le", "Ecuele", "Brou", "Martins"]);
  const suspects = Object.keys(compte).filter(n => {
    const m = /^[A-ZÀ-Þ]\.(-[A-ZÀ-Þ]\.)? ([A-ZÀ-Þ][a-zà-ÿ']+) [A-ZÀ-Þ]/.exec(n);
    return m && !PARTICULES.has(m[2]) && !COMPOSES.has(m[2]);
  });
  if (suspects.length) fail("noms à vérifier (prénom composé avalé dans le patronyme ?) : " + suspects.join(", "));
  else ok("aucun prénom composé resté collé au patronyme (« Ecuele Manga », « Brou Apanga » et « Martins Pereira » sont de vrais patronymes)");

  // réconciliation France ↔ Europe (clubs européens figés en 95-96)
  const eur = new Set();
  for (const T of [api.STARS_EUROPE, api.STARS_EUROPE_C2, api.STARS_EUROPE_C3]) for (const id in T) for (const t of T[id]) eur.add(t[0]);
  const collE = Object.keys(compte).filter(n => eur.has(n));
  api.nouvellePartie("BOR", KEY);
  const Gv = api.getG();
  const enFr = new Set(); for (const c of Gv.clubs.concat(Gv.autre)) for (const j of c.joueurs) if (j.reel) enFr.add(j.nom);
  const surDeux = []; for (const c of Gv.europe) for (const j of c.joueurs) if (j.reel && enFr.has(j.nom)) surDeux.push(j.nom + " (" + c.id + ")");
  if (surDeux.length) fail("joueurs réels à la fois en France et en Europe : " + surDeux.join(", "));
  else ok(collE.length + " joueurs passés en France retirés de leur club européen");
  const courts = Gv.europe.filter(c => ["G", "D", "M", "A"].some(p => c.joueurs.filter(j => j.pos === p).length < api.CIBLE[p]));
  if (courts.length) fail("clubs européens sous l'effectif cible après réconciliation : " + courts.map(c => c.id).join(","));
  // UN FORCÉ NE DOIT PAS CONTREDIRE LE RECRUTEUR (règle de 05/06) : le vivier de l'été 2008 et les
  // effectifs du championnat ne peuvent pas placer le même homme à deux endroits au coup d'envoi.
  // C'est ce contrôle qui a sorti JÉRÉMY MÉNEZ du forçage : cent seize minutes au Rocher, mais
  // les vitrines de l'été 2008 le placent à la Roma, et elles ont raison.
  const employes = new Set();
  for (const c of Gv.clubs.concat(Gv.autre || [])) for (const j of c.joueurs) employes.add(j.nom);
  const vivNoms = [];
  for (const t in (Gv.vivier || {})) for (const e of Gv.vivier[t]) vivNoms.push(e[0]);
  for (const r of (Gv.rapport || [])) if (r && r.nom) vivNoms.push(r.nom);
  const coll = [...new Set(vivNoms.filter(n => employes.has(n)))];
  if (coll.length) fail("vivier 08/09 contient des joueurs déjà employés : " + coll.join(", "));
  else ok("vivier de l'été 2008 disjoint des effectifs employés : aucun homme à deux endroits (Ménez reste à la Roma)");
} catch (e) { fail("exception doublons : " + e.stack); }

/* ===== 3) Année de base + étés internationaux + sièges européens ===== */
console.log("3) Année de base, été 2009 MUET, MONDIAL 2010 à la deuxième intersaison, sièges européens");
try {
  api.nouvellePartie("BOR", KEY);
  let G = api.getG();
  if (G.saison !== KEY) fail("G.saison = " + G.saison + " (attendu " + KEY + ")");
  if (G.anBase !== 2008) fail("G.anBase = " + G.anBase + " (attendu 2008)");
  if (api.anneeJeu() !== 2008) fail("anneeJeu() = " + api.anneeJeu() + " (attendu 2008)");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G.vire = null;
  api.intersaison();
  G = api.getG();
  // PARTIR DE 08/09 LAISSE LA PREMIÈRE INTERSAISON MUETTE : rien entre l'Euro 2008, qui s'est
  // joué AVANT le coup d'envoi de cette saison, et le Mondial 2010. C'est le septième cas.
  const ete2009 = (G.recap || []).join(" ");
  if (/ÉTÉ 200[0-9]|ÉTÉ 20[12][0-9]/.test(ete2009))
    fail("l'été 2009 ne porte aucun tournoi : la 1re intersaison doit rester muette — reçu « " + ete2009.slice(0, 140) + " »");
  else ok("l'été 2009 est MUET — l'Euro 2008 s'est joué avant le coup d'envoi, le Mondial 2010 attend");
  if (G.saison !== "2009-10") fail("chaîne de saison : G.saison = " + G.saison + " (attendu 2009-10)");
  else ok("chaîne de saison correcte : 2008-09 → 2009-10");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  api.getG().vire = null; api.intersaison(); G = api.getG();
  // LE MONDIAL 2010 TOMBE À LA DEUXIÈME INTERSAISON, et c'est 08/09 qui l'a réclamé en premier :
  // l'Espagne sacrée, un but d'Iniesta à la 116e, et les Bleus qui rentrent de Knysna sans avoir
  // gagné un match. La dépêche ne doit surtout pas se lire comme un triomphe français.
  const ete2010 = (G.recap || []).join(" ");
  if (!/Afrique du Sud/i.test(ete2010))
    fail("été 2010 : le Mondial d'Afrique du Sud doit tomber à la DEUXIÈME intersaison — reçu « " + ete2010.slice(0, 140) + " »");
  else ok("le MONDIAL 2010 tombe à la DEUXIÈME intersaison : l'Espagne sacrée, un but d'Iniesta à la 116e");
  if (/LA FRANCE/.test(ete2010)) fail("l'été 2010 ne doit pas contenir « LA FRANCE » en capitales : les Bleus rentrent de Knysna");
  else ok("la dépêche de l'été 2010 ne se lit pas comme un triomphe français");
  // L'Europe 2008-09 telle qu'elle s'est jouée : LYON (champion) et BORDEAUX (2e de 2007-08) en
  // phase de groupes de Ligue des champions, MARSEILLE (3e) au troisième tour de qualification ;
  // en Coupe UEFA NANCY (4e), SAINT-ÉTIENNE (5e, la place de la Coupe de France redistribuée
  // puisque Lyon, vainqueur, était déjà en C1), le PARIS SG au titre de la Coupe de la Ligue 2008
  // et RENNES, vainqueur de son barrage d'INTERTOTO 2008 — la dernière édition de la compétition.
  // Sept sièges, tous en Ligue 1.
  const attendu = { LYO: "C1", BOR: "C1", OM: "C1", NCY: "C3", STE: "C3", PSG: "C3", REN: "C3",
                    LIL: null, NIC: null, LMN: null, LOR: null, CAE: null, MON: null, VAN: null,
                    SOC: null, TOU: null, LEH: null, NAN: null, GRE: null,
                    SED: null, CLE: null, TRO: null, BRE: null, MTP: null, ACA: null, ANG: null,
                    BAS: null, GUI: null, REI: null, AMI: null, CHA: null, BLG: null, DIJ: null,
                    LEN: null, STR: null, MET: null, TRS: null, NIM: null, VNS: null };
  for (const id in attendu) {
    api.nouvellePartie(id, KEY);
    const c = api.getG().euroCompet;
    if (c !== attendu[id]) fail("siège européen " + id + " = " + c + " (attendu " + attendu[id] + ")");
  }
  ok("sièges européens : Lyon, Bordeaux et Marseille en C1 ; Nancy, Saint-Étienne, le Paris SG et Rennes en Coupe UEFA");
  const S = api.SAISONS[KEY];
  if ((S.euroC2 || []).length) fail("la Coupe des Coupes n'existe plus en 2008-09 : euroC2 doit être vide");
  else ok("aucun siège en Coupe des Coupes : la compétition a disparu après 1999 (neuvième fois)");
  // LE CONTRÔLE QUI ATTRAPE L'ERREUR LA PLUS FACILE ET LA PLUS INVISIBLE, ET IL JOUE ENCORE DANS
  // LES DEUX SENS : Toulouse (4e), Lille (5e) et le futur champion lui-même ne sont pas tous
  // servis par le classement de 2008-09, parce que les sièges se gagnent l'année d'AVANT ; et
  // SAINT-ÉTIENNE, QUI FINIRA DIX-SEPTIÈME, JOUE BEL ET BIEN LA COUPE UEFA, pour avoir été
  // cinquième en 2007-08. C'est le pendant exact du Toulouse de 07/08.
  for (const id of ["TOU", "LIL", "NIC", "AJA"])
    if ((S.euroC1 || []).includes(id) || (S.euroC3 || []).includes(id))
      fail(id + " n'a pas de siège en 2008-09 : les sièges se gagnent sur le classement de 2007-08");
  ok("Toulouse et Lille, futurs quatrième et cinquième, partent sans Europe : les sièges se gagnent l'année d'avant");
  if (!(S.euroC3 || []).includes("STE"))
    fail("Saint-Étienne joue la Coupe UEFA en 2008-09 : il était CINQUIÈME en 2007-08, et la place de la Coupe de France lui est revenue");
  else ok("SAINT-ÉTIENNE, futur dix-septième, joue la Coupe UEFA — le pendant du Toulouse de 07/08");
  const tousSieges = (S.euroC1 || []).concat(S.euroC3 || []);
  if (tousSieges.length !== 7) fail("2008-09 compte sept sièges européens, reçu " + tousSieges.length);
  const horsL1 = tousSieges.filter(id => !S.d1.includes(id));
  if (horsL1.length) fail("siège européen de deuxième division : " + horsL1.join(","));
  else ok("les SEPT sièges sont en Ligue 1, et aucun depuis la Ligue 2 pour la quatrième fois de suite");
} catch (e) { fail("exception année/Europe : " + e.stack); }

/* ===== 4) Carrière multi-saisons depuis 08/09 ===== */
console.log("4) Carrière multi-saisons depuis 08/09 (calibrage, vieillissement)");
let totalButs = 0, totalMatchs = 0;
const departs = ["BOR", "LEH", "VNS", "LEN"];  // le champion, le relégué, le club neuf, le futur promu
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
  } catch (e) { fail("exception carrière 08/09 (" + dep + ") : " + e.stack); }
}
const gpm = totalButs / totalMatchs;
console.log("— Calibrage 08/09 : " + gpm.toFixed(3) + " buts/match sur " + Math.round(totalMatchs) + " matchs —");
if (gpm < 2.0 || gpm > 2.8) fail("calibrage 08/09 hors plage (cible ~2,3) : " + gpm.toFixed(3));
else ok("calibrage 08/09 dans la plage attendue");

console.log(FAILS === 0 ? "\n✅ HARNAIS 08/09 : TOUT EST VERT" : "\n❌ HARNAIS 08/09 : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
