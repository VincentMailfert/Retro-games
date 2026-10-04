/* Harnais de validation — SAISON DE DÉPART 2007-08
   Vérifie : intégrité du registre SAISONS, doublons de noms, année de base/étés,
   sièges européens, carrière multi-saisons depuis 07/08 (calibrage, vieillissement).
   C'est la saison la plus RÉCENTE du jeu, comme 06/07 l'était avant elle : toutes les
   ancres de notes sont derrière elle. Cinq singularités à surveiller ici — le plateau
   tombe juste tout seul pour la SIXIÈME fois de suite (vingt et vingt, aucun repêchage) ;
   l'EURO 2008 tombe dès la PREMIÈRE intersaison, et c'est le MONDIAL 2010 qui arrive à la
   troisième, le deuxième été que `HONNEURS` ait eu à apprendre ; les SEPT sièges européens
   sont tous en Ligue 1, et le plus invraisemblable est celui de TOULOUSE, dix-septième du
   championnat, qui joue la Ligue des champions ; Eden Hazard entre en jeu à SEIZE ANS à
   Lille ; et deux hommes nés la même année se disputent une seule ancre, « A. Traoré »,
   que le club de l'ancre doit trancher et non les minutes.
   Usage : node harness0708.cjs                                                    */
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

const epilogue = "\n;return {nouvellePartie,jouerJournee,intersaison,anneeJeu,metaClub,CIBLE,SAISONS,STARS_0708,STARS_D2_0708,D1_0708,D2_0708,STARS_EUROPE,STARS_EUROPE_C2,STARS_EUROPE_C3,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const KEY = "2007-08";

/* ===== 1) Intégrité du registre SAISONS ===== */
console.log("1) Registre SAISONS : composition, métadonnées, effectifs");
try {
  const S = api.SAISONS[KEY];
  if (!S) fail("saison " + KEY + " absente du registre");
  else {
    if (S.d1.length !== 20) fail("L1 07/08 a " + S.d1.length + " clubs (attendu 20)");
    if (S.d2.length !== 20) fail("L2 07/08 a " + S.d2.length + " clubs (attendu 20)");
    const tous = S.d1.concat(S.d2);
    const setIds = new Set(tous);
    if (setIds.size !== 40) fail("ids dupliqués entre L1 et L2 (uniques: " + setIds.size + "/40)");
    const metaManquante = tous.filter(id => !api.metaClub(id));
    if (metaManquante.length) fail("métadonnées manquantes : " + metaManquante.join(","));
    if (!metaManquante.length && setIds.size === 40 && S.d1.length === 20 && S.d2.length === 20)
      ok("07/08 = 20 L1 + 20 L2, 40 clubs uniques, toutes métadonnées résolues");

    // LE PLATEAU TOMBE JUSTE TOUT SEUL POUR LA SIXIÈME FOIS DE SUITE : les deux échelons réels
    // ont vingt clubs, donc aucun repêchage, aucun écarté. On vérifie les deux listes par ÉGALITÉ.
    const REELS_D1 = ["LYO", "BOR", "OM", "NCY", "STE", "REN", "LIL", "NIC", "LMN", "LOR",
                      "CAE", "MON", "VAN", "SOC", "AUX", "PSG", "TOU", "LEN", "STR", "MET"];
    const REELS_D2 = ["LEH", "NAN", "GRE", "SED", "CLE", "TRO", "BRE", "MTP", "AJA", "ANG",
                      "BAS", "GUI", "REI", "AMI", "CHA", "BLG", "DIJ", "NIO", "LIB", "GUE"];
    const absentsD1 = REELS_D1.filter(id => !S.d1.includes(id));
    const intrusD1 = S.d1.filter(id => !REELS_D1.includes(id));
    if (absentsD1.length || intrusD1.length)
      fail("L1 07/08 : absents " + (absentsD1.join(",") || "—") + " / intrus " + (intrusD1.join(",") || "—"));
    else ok("les vingt clubs de la vraie Ligue 1 2007-08 sont au plateau, et eux seuls (Metz champion de L2, Caen et Strasbourg promus)");
    const absentsD2 = REELS_D2.filter(id => !S.d2.includes(id));
    const intrusD2 = S.d2.filter(id => !REELS_D2.includes(id));
    if (absentsD2.length || intrusD2.length)
      fail("L2 07/08 : absents " + (absentsD2.join(",") || "—") + " / intrus " + (intrusD2.join(",") || "—"));
    else ok("les vingt clubs de la vraie Ligue 2 2007-08 sont au plateau, et eux seuls (Nantes, Troyes et Sedan descendus)");
    if (S.d1.length + S.d2.length !== REELS_D1.length + REELS_D2.length)
      fail("le compte de 07/08 doit tomber juste sans repêcher personne");
    else ok("AUCUN repêchage ni d'un côté ni de l'autre — la sixième fois de suite, depuis 02/03");

    // Boulogne est le seul club neuf du plateau : il entre par CLUBS_EXTRA, en Ligue 2, monté du
    // National pour sa PREMIÈRE saison professionnelle après cent neuf ans d'existence.
    const blg = api.metaClub("BLG");
    if (!blg) fail("Boulogne (BLG) doit être au registre des clubs");
    else if (!S.d2.includes("BLG")) fail("Boulogne joue la Ligue 2 en 2007-08");
    else if (!/Libération/.test(blg.stade)) fail("le stade de Boulogne est le stade de la Libération, pas « " + blg.stade + " »");
    else if (blg.cap !== 8700) fail("le stade de la Libération compte huit mille sept cents places, pas " + blg.cap);
    else ok("US Boulogne, seul club neuf de la saison, au stade de la Libération et en Ligue 2");
    // « BOU » est déjà le FC Bourges depuis 91/92 : Boulogne ne peut pas le lui prendre
    const bourges = api.metaClub("BOU");
    if (!bourges || !/Bourges/.test(bourges.nom)) fail("« BOU » doit rester le FC Bourges de 91/92");
    else ok("« BOU » reste au FC Bourges de 91/92 : Boulogne prend « BLG »");

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
    // Ils sont QUATRE cette année, dont un gardien titulaire : Gilles Wimbée tient les buts de
    // Grenoble à trente-six ans et le fait monter en Ligue 1.
    const vets = { TOU: "D. Arribagé", NIC: "L. Laslandes" };
    const vetsD2 = { GRE: "G. Wimbée", GUE: "P. Correia" };
    const absentsV = Object.entries(vets).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom))
      .concat(Object.entries(vetsD2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom)));
    if (absentsV.length)
      fail("vétérans 36+ manquants : " + absentsV.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("les quatre vétérans de 36 ans et plus sont conservés : Arribagé, Laslandes, Wimbée et Correia");
    const wimbee = (S.starsD2.GRE || []).find(t => t[0] === "G. Wimbée");
    if (!wimbee || wimbee[2] !== 36 || wimbee[1] !== "G")
      fail("Gilles Wimbée garde les buts de Grenoble à trente-six ans : 3 330 minutes, et la montée au bout");
    else ok("Gilles Wimbée, trente-six ans et 3 330 minutes dans les buts de Grenoble — le plus vieux titulaire du plateau");

    // LE PIÈGE DES SIX DERNIÈRES SAISONS, QU'UN HARNAIS DOIT GARDER : le découpage des tableaux
    // laisse la DERNIÈRE ligne collée au bas de page, si bien qu'une sentinelle de fin ne trouve
    // plus la cellule des minutes et rend ZÉRO. Vingt derniers de tableau avaient leur place dans
    // un effectif cette année-là, dont Marouane Chamakh et ses 2 692 minutes à Bordeaux.
    const DERNIERS = { BOR: "M. Chamakh", OM: "M. Niang", LMN: "Gervinho", NCY: "M.-A. Fortuné",
                       CAE: "N. Florentin", VAN: "F. Sebo", TOU: "S. Arrache" };
    const DERNIERS_D2 = { SED: "D. Abdoun", BAS: "C. Ben Saada", MTP: "V. Montaño",
                          AMI: "F. Fiorèse", BRE: "J. Ayité", LIB: "C. Keșerü", GRE: "B. El Moubarki" };
    const zappes = Object.entries(DERNIERS).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom))
      .concat(Object.entries(DERNIERS_D2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom)));
    if (zappes.length)
      fail("derniers de tableau perdus (la sentinelle de fin a frappé) : " + zappes.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("les derniers de tableau ont leurs vraies minutes : Chamakh, Niang, Gervinho, Fortuné, Abdoun, Ben Saada, Montaño et les autres");
    const chamakh = (S.starsD1.BOR || []).find(t => t[0] === "M. Chamakh");
    if (!chamakh || chamakh[3] < 75)
      fail("Marouane Chamakh : 2 692 minutes chez les Girondins, il ne peut pas sortir d'un tableau à zéro minute");
    else ok("Marouane Chamakh, dernier du tableau girondin, noté " + chamakh[3] + " pour ses 2 692 minutes");

    // les gamins de 2007 : le tri au temps de jeu les écartait, la liste de forçage les rattrape.
    const forces = { LIL: "E. Hazard", BOR: "H. Saivet", NCY: "Alfred N'Diaye", MON: "C. Mongongu",
                     STR: "M. Schneiderlin", LEN: "L. Rémy", MET: "G. Bong", REN: "G. Borne",
                     NIC: "Mahamane Traoré", LOR: "M. Benatia", AUX: "A. Traoré", SOC: "B. Dramé" };
    const forcesD2 = { BLG: "P. Baherlé", MTP: "A. El Kaoutari", CHA: "P. Cissé",
                       GUI: "Bakary Koné", NAN: "W. Vainqueur", REI: "L. Deaux" };
    const perdus = Object.entries(forces).filter(([id, nom]) => !(S.starsD1[id] || []).some(t => t[0] === nom))
      .concat(Object.entries(forcesD2).filter(([id, nom]) => !(S.starsD2[id] || []).some(t => t[0] === nom)));
    if (perdus.length) fail("pépites forcées absentes : " + perdus.map(([id, n]) => n + " (" + id + ")").join(", "));
    else ok("pépites forcées présentes : Hazard, Baherlé, Saivet, El Kaoutari, Mongongu, Plašil, Dramé, Alfred N'Diaye, Schneiderlin, Rémy, Boukari, Papiss Cissé, Constant, Sako, Bong, Bakary Koné, Borne, Kembo Ekoko, Vainqueur, Mahamane Traoré, Benatia, Deaux, Alain Traoré");
    // EDEN HAZARD A SEIZE ANS ET TRENTE-TROIS MINUTES à Lille : le premier match professionnel
    // d'un futur Ballon d'or en puissance, et le troisième seizième anniversaire du jeu après
    // Didier Domi (94/95) et Mamadou Sakho (06/07). Le tri aux minutes ne pouvait pas le garder.
    const hazard = (S.starsD1.LIL || []).find(t => t[0] === "E. Hazard");
    if (!hazard || hazard[2] !== 16 || hazard[4] < 90)
      fail("Eden Hazard : seize ans à Lille, trente-trois minutes, et tout devant lui");
    else ok("Eden Hazard, SEIZE ANS au LOSC, noté " + hazard[3] + " pour un potentiel de " + hazard[4] + " — le plus haut du plateau");
    // PIERRE-BAPTISTE BAHERLÉ a seize ans lui aussi, et il joue en Ligue 2 à Boulogne : deux
    // seizièmes anniversaires dans la même saison, ce que le chantier n'avait jamais vu.
    const baherle = (S.starsD2.BLG || []).find(t => t[0] === "P. Baherlé");
    if (!baherle || baherle[2] !== 16)
      fail("Pierre-Baptiste Baherlé : seize ans à Boulogne, quarante-neuf minutes en Ligue 2");
    else ok("Pierre-Baptiste Baherlé, seize ans à Boulogne : DEUX hommes de seize ans dans la même saison, une première");
    // MEDHI BENATIA n'a joué que QUATRE-VINGT-DIX MINUTES à Lorient, un seul match
    const benatia = (S.starsD1.LOR || []).find(t => t[0] === "M. Benatia");
    if (!benatia || benatia[4] < 86)
      fail("Medhi Benatia : vingt ans à Lorient, quatre-vingt-dix minutes, et le Bayern plus tard");
    else ok("Medhi Benatia gardé pour un seul match à Lorient, potentiel " + benatia[4]);
    // ALAIN TRAORÉ N'A JOUÉ QUE TROIS MINUTES de toute la saison : la borne basse de l'année
    const atraore = (S.starsD1.AUX || []).find(t => t[0] === "A. Traoré");
    if (!atraore || atraore[2] !== 19)
      fail("Alain Traoré : dix-neuf ans à Auxerre, TROIS minutes dans toute la saison");
    else ok("Alain Traoré gardé pour TROIS minutes à Auxerre, reconduit depuis 06/07");
    // Lens, Châteauroux, Rennes et Monaco paient DEUX hommes chacun : le prix du forçage, assumé
    const paires = [["LEN", ["L. Rémy", "R. Boukari"]], ["REN", ["G. Borne", "J. Kembo Ekoko"]],
                    ["MON", ["C. Mongongu", "J. Plasil"]]];
    const pairesD2 = [["CHA", ["P. Cissé", "K. Constant", "B. Sako"]]];
    const manquePaire = paires.filter(([id, ns]) => ns.some(n => !(S.starsD1[id] || []).some(t => t[0] === n)))
      .concat(pairesD2.filter(([id, ns]) => ns.some(n => !(S.starsD2[id] || []).some(t => t[0] === n))));
    if (manquePaire.length) fail("forçage multiple incomplet : " + manquePaire.map(p => p[0]).join(", "));
    else ok("Lens, Rennes et Monaco paient DEUX hommes chacun, Châteauroux en paie TROIS");

    // celles que le temps de jeu suffisait à garder
    const seuls = { LYO: ["K. Benzema", "H. Ben Arfa", "Juninho", "G. Coupet", "Cristiano", "F. Grosso", "J. Toulalan", "S. Govou"],
                    BOR: ["M. Chamakh", "U. Ramé", "Wendel", "F. Cavenaghi", "Henrique", "Fernando"],
                    OM: ["S. Mandanda", "S. Nasri", "D. Cissé", "M. Valbuena", "Benoît Cheyrou", "M. Niang"],
                    NCY: ["André Luiz", "M.-A. Fortuné", "Kim"],
                    STE: ["B. Gomis", "B. Matuidi", "D. Payet", "Ilan"],
                    REN: ["J. Leroy", "J. Briand", "S. Mbia", "R. Fanni"],
                    LIL: ["Y. Cabaye", "A. Rami", "M. Debuchy", "M. Bastos", "L. Obraniak"],
                    NIC: ["H. Lloris", "Ederson", "O. Apam"],
                    LMN: ["Gervinho", "Romaric", "M. Coutadeur", "S. Sessègnon"],
                    LOR: ["C. Jallet", "J. Morel", "F. Abriel"],
                    CAE: ["Y. Gouffran", "B. Costil", "N. Seube"],
                    MON: ["Nenê", "J. Ménez", "Adriano"],
                    VAN: ["S. Savidan", "Carlos Sánchez", "Mody Traoré"],
                    SOC: ["S. Dalmat", "G. N'Daw"], AUX: ["K. Lejeune", "Rémy Riou", "B. Pedretti"],
                    PSG: ["Pauleta", "M. Landreau", "J. Rothen", "Ceará", "S. Armand"],
                    TOU: ["A.-P. Gignac", "M. Sissoko", "J. Elmander", "A. Emaná"],
                    LEN: ["Sidi Keita", "Hilton", "V. Runje"],
                    STR: ["Ferrugem", "M. Schneiderlin"], MET: ["M. Pjanić", "Momar N'Diaye", "C. Guèye"] };
    const rates = [];
    for (const id in seuls) for (const nom of seuls[id])
      if (!(S.starsD1[id] || []).some(t => t[0] === nom)) rates.push(nom + " (" + id + ")");
    for (const [id, nom] of [["LEH", "G. Hoarau"], ["MTP", "M. Yanga-Mbiwa"], ["SED", "I. Traoré"],
                             ["CLE", "M. Poté"], ["GUI", "Eduardo Ribeiro"], ["REI", "Henrique Gomes"],
                             ["AJA", "C. Medjani"], ["GRE", "F. Dja Djédjé"]])
      if (!(S.starsD2[id] || []).some(t => t[0] === nom)) rates.push(nom + " (" + id + ")");
    if (rates.length) fail("pépites passées au temps de jeu et pourtant absentes : " + rates.join(", "));
    else ok("Benzema, Ben Arfa, Mandanda, Lloris, Nasri, Cabaye, Matuidi, Gignac, Pjanić, Gervinho, Hoarau et Yanga-Mbiwa passent au temps de jeu");
    // KARIM BENZEMA, MEILLEUR JOUEUR du championnat 2007-08 ET MEILLEUR BUTEUR avec vingt buts,
    // à vingt ans : le sommet de la saison, et la seule fois qu'un homme prend les deux titres
    // depuis Pauleta en 02/03.
    const benzema = (S.starsD1.LYO || []).find(t => t[0] === "K. Benzema");
    if (!benzema || benzema[3] < 83 || benzema[2] !== 20)
      fail("Karim Benzema : meilleur joueur ET meilleur buteur du championnat 2007-08, vingt ans, il ne peut pas sortir sous 83");
    else ok("Karim Benzema, meilleur joueur ET meilleur buteur avec vingt buts, noté " + benzema[3] + " pour un potentiel de " + benzema[4]);
    // Steve Mandanda, MEILLEUR GARDIEN, 4 350 minutes au Vélodrome : il n'en a pas manqué une
    const mandanda = (S.starsD1.OM || []).find(t => t[0] === "S. Mandanda");
    if (!mandanda || mandanda[1] !== "G" || mandanda[3] < 80)
      fail("Steve Mandanda : meilleur gardien du championnat 2007-08, à Marseille");
    else ok("Steve Mandanda, meilleur gardien du championnat, noté " + mandanda[3] + " pour 4 350 minutes");
    // Hatem Ben Arfa, MEILLEUR ESPOIR à vingt ans, et c'est le deuxième Lyonnais primé de l'année
    const benarfa = (S.starsD1.LYO || []).find(t => t[0] === "H. Ben Arfa");
    if (!benarfa || benarfa[2] !== 20 || benarfa[3] < 76 || benarfa[4] < 88)
      fail("Hatem Ben Arfa : meilleur espoir du championnat, vingt ans à Lyon");
    else ok("Hatem Ben Arfa, meilleur espoir, noté " + benarfa[3] + " pour un potentiel de " + benarfa[4]);
    // Jérôme Leroy, MEILLEUR PASSEUR avec dix offrandes, à TRENTE-TROIS ANS à Rennes
    const leroy = (S.starsD1.REN || []).find(t => t[0] === "J. Leroy");
    if (!leroy || leroy[2] !== 33 || leroy[3] < 72)
      fail("Jérôme Leroy : meilleur passeur du championnat à trente-trois ans, à Rennes");
    else ok("Jérôme Leroy, meilleur passeur avec dix offrandes à trente-trois ans, noté " + leroy[3]);
    // Guillaume Hoarau, MEILLEUR JOUEUR DE LIGUE 2 et VINGT-HUIT BUTS, le plus gros total de la
    // division : il ramène Le Havre dans l'élite et file au Parc des Princes l'été suivant.
    const hoarau = (S.starsD2.LEH || []).find(t => t[0] === "G. Hoarau");
    if (!hoarau || hoarau[3] < 76)
      fail("Guillaume Hoarau : meilleur joueur de Ligue 2 et vingt-huit buts, il ne peut pas sortir sous 76");
    else ok("Guillaume Hoarau, meilleur joueur de Ligue 2 avec vingt-huit buts, noté " + hoarau[3] + " — la meilleure note de la division");
    // LE VIEILLISSEMENT DÉRAPE DANS LES DEUX SENS (leçon de 06/07) : Jean-Alain Boumsong, ancré
    // en 2003 et vieilli QUATRE fois, ressortait à 79 pour mille deux cents minutes de remplaçant
    // derrière Cris et Squillaci. Une ancre lointaine dérape beaucoup plus qu'une ancre d'un an.
    const boumsong = (S.starsD1.LYO || []).find(t => t[0] === "J.-A. Boumsong");
    if (!boumsong || boumsong[3] > 77)
      fail("Jean-Alain Boumsong ne peut pas ressortir à 79 : l'ancre de 2003 vieillie quatre fois dérape");
    else ok("Jean-Alain Boumsong ramené à " + boumsong[3] + " : mille deux cents minutes de remplaçant à Lyon");

    const nD1 = S.d1.reduce((s, id) => s + S.starsD1[id].length, 0);
    const nD2 = S.d2.reduce((s, id) => s + S.starsD2[id].length, 0);
    if (nD1 !== 400) fail("L1 07/08 : " + nD1 + " joueurs curés (attendu 20 × 20)");
    if (nD2 !== 360) fail("L2 07/08 : " + nD2 + " joueurs curés (attendu 20 × 18)");
    if (nD1 === 400 && nD2 === 360) ok("760 joueurs réels relevés : 20 par club en L1, 18 en L2");
  }
} catch (e) { fail("exception registre : " + e.stack); }

/* ===== 2) Doublons de noms ===== */
console.log("2) Doublons de noms");
try {
  const compte = {};
  const ajoute = (nom, src) => { (compte[nom] = compte[nom] || []).push(src); };
  for (const id in api.STARS_0708) for (const t of api.STARS_0708[id]) ajoute(t[0], "L1:" + id);
  for (const id in api.STARS_D2_0708) for (const t of api.STARS_D2_0708[id]) ajoute(t[0], "L2:" + id);
  const dupClub = Object.entries(compte).filter(([n, s]) => s.length > 1);
  if (dupClub.length) dupClub.forEach(([n, s]) => fail("doublon 07/08 : « " + n + " » dans " + s.join(" + ")));
  else ok("aucun joueur dupliqué entre deux clubs en 07/08 (quarante-cinq transferts arbitrés au temps de jeu)");

  // homonymes DANS la saison : celui qui portait DÉJÀ le nom court dans le jeu le garde (règle de
  // 00/01), l'autre passe en toutes lettres. Les reconductions de 05/06 et 06/07 tiennent toutes.
  // Trois paires jouent en France la MÊME année, et les deux formes doivent cohabiter : le
  // porteur du nom court le garde, le second passe en toutes lettres.
  const PAIRES = [["B. Cheyrou", "Benoît Cheyrou"], ["R. Riou", "Rémy Riou"], ["B. Koné", "Bakary Koné"]];
  const mal = PAIRES.filter(([court, long]) => !compte[court] || !compte[long]);
  if (mal.length) fail("paires d'homonymes mal résolues : " + mal.map(p => p.join(" / ")).join(" ; "));
  else ok("Bruno Cheyrou garde « B. Cheyrou » face à Benoît, Rudy Riou face à Rémy, Bakari Koné face à Bakary — les trois paires cohabitent");
  // Et le contrôle qui compte vraiment : quatre hommes passent en toutes lettres parce que leur
  // nom court est à un homme que le JEU porte déjà et qui ne joue PLUS en France cette année-là
  // (Seydou Keita est à Séville, Antar Yahia à Bochum). Le nom court doit donc rester ABSENT du
  // plateau : s'il réapparaît, c'est qu'un homme a pris celui d'un autre, et rien ne le dirait.
  const CEDENT = [["S. Keita", "Sidi Keita"], ["M. N'Diaye", "Momar N'Diaye"],
                  ["A. Luiz", "André Luiz"], ["C. Sánchez", "Carlos Sánchez"]];
  const usurpe = CEDENT.filter(([court, long]) => compte[court] || !compte[long]);
  if (usurpe.length)
    fail("nom court d'un homme absent du plateau repris : " + usurpe.map(p => p[0] + " au lieu de " + p[1]).join(" ; "));
  else ok("« S. Keita », « M. N'Diaye », « A. Luiz » et « C. Sánchez » restent à leurs porteurs d'autrefois : Sidi, Momar, André Luiz et Carlos Sánchez passent en toutes lettres");

  // « M. Traoré » appartient toujours à un homme que le jeu porte depuis 1990 : ni Mahamane ni
  // Mody ne peut le reprendre, exactement comme en 06/07.
  if (compte["M. Traoré"])
    fail("« M. Traoré » appartient à un homme de 1990 : aucun Traoré de 2007 ne peut le prendre");
  else {
    const deux = [["Mahamane Traoré", "NIC"], ["Mody Traoré", "VAN"]];
    const absents = deux.filter(([n]) => !compte[n]);
    if (absents.length) fail("Mahamane et Mody Traoré doivent être au plateau en toutes lettres : manquent " + absents.map(a => a[0]).join(", "));
    else ok("Mahamane et Mody Traoré restent en toutes lettres : « M. Traoré » est à un homme de 1990");
  }

  // LA DÉCOUVERTE DU JOUR : DEUX HOMMES NÉS LA MÊME ANNÉE SE DISPUTENT UNE SEULE ANCRE, et c'est
  // le CLUB DE L'ANCRE qui tranche, pas les minutes. « A. Traoré » est au milieu d'Auxerre que le
  // jeu porte depuis 06/07 — Alain, né en 1988 ; Abdou Traoré, né la même année et à Bordeaux,
  // avait plus de minutes et prenait donc son nom ET sa note. Il reste dehors, écarté au temps de
  // jeu, et le symptôme aurait été invisible : un homme qui prend l'héritage d'un autre.
  const atr = (api.STARS_0708.AUX || []).find(t => t[0] === "A. Traoré");
  if (!atr) fail("« A. Traoré » doit rester au milieu d'Auxerre que le jeu porte depuis 06/07");
  else if ((api.STARS_0708.BOR || []).some(t => t[0] === "A. Traoré"))
    fail("Abdou Traoré ne peut pas prendre « A. Traoré » à Alain : c'est le club de l'ancre qui tranche");
  else ok("« A. Traoré » reste à l'Auxerrois : le club de l'ancre tranche, pas les minutes");

  // LA RÈGLE ÉTENDUE D'UNE SAISON À L'AUTRE : un nom court que le JEU attribue déjà à un autre
  // homme ne se reprend pas. Deux cas neufs cette année, tous deux des mononymes brésiliens que
  // le nom complet ne distingue pas : il faut descendre au NOM CIVIL (jurisprudence Cristiano
  // 04/05, Adailton Santos 05/06).
  if (compte["Eduardo"]) fail("« Eduardo » est au Toulousain de 03/04, né en 1979 : le Guingampais né en 1980 est un autre homme");
  else if (!(api.STARS_D2_0708.GUI || []).some(t => t[0] === "Eduardo Ribeiro"))
    fail("Eduardo Ribeiro dos Santos doit s'écrire « Eduardo Ribeiro » à Guingamp");
  else ok("« Eduardo » reste au Toulousain de 03/04 : le Guingampais s'écrit « Eduardo Ribeiro » (identités vérifiées par identifiant Transfermarkt)");
  if (!(api.STARS_0708.BOR || []).some(t => t[0] === "Henrique"))
    fail("« Henrique » est au Girondin né en 1983, que le jeu porte depuis 05/06");
  else if (!(api.STARS_D2_0708.REI || []).some(t => t[0] === "Henrique Gomes"))
    fail("Henrique da Silva Gomes, né en 1982 à Reims, doit s'écrire « Henrique Gomes »");
  else ok("« Henrique » reste au Girondin de 05/06, le Rémois s'écrit « Henrique Gomes » : un an d'écart, deux hommes");
  // et les formes du jeu tiennent : Cris garde « Cristiano », Juninho garde « Juninho »
  if (compte["Cris"]) fail("« Cris » est à l'Angevin de 03/04 : le Lyonnais garde « Cristiano »");
  else if (!(api.STARS_0708.LYO || []).some(t => t[0] === "Cristiano"))
    fail("Cristiano Márques Gómes garde « Cristiano », le nom que le jeu lui donne depuis 04/05");
  else if (!(api.STARS_0708.LYO || []).some(t => t[0] === "Juninho"))
    fail("Juninho Pernambucano garde « Juninho », le nom que le jeu lui donne depuis 01/02");
  else ok("les formes du jeu passent avant la source : « Cristiano » depuis 04/05, « Juninho » depuis 01/02");

  // piège « J. Arne Riise » : un prénom composé resté collé au patronyme.
  const PARTICULES = new Set(["Le", "La", "Les", "De", "Del", "Della", "Da", "Das", "Do", "Dos", "Di", "Du",
    "Van", "Von", "Der", "Ten", "Ter", "El", "Al", "Ben", "Bin", "Mac", "Mc", "O", "Saint", "San", "Aït", "Ait"]);
  // patronymes en deux mots vérifiés sur pièces, et non des prénoms avalés (jurisprudence Michael
  // Mio Nielsen, 90/91) : Franck DJA DJÉDJÉ, Jirès KEMBO EKOKO, Paul ALO'O EFOULOU.
  const COMPOSES = new Set(["Pinto", "Dja", "Kembo", "Akpa", "Abd", "Sanches", "Moura", "Alo'o",
    "Aït", "Ben", "Da", "Dos", "Van", "De", "Le"]);
  const suspects = Object.keys(compte).filter(n => {
    const m = /^[A-ZÀ-Þ]\.(-[A-ZÀ-Þ]\.)? ([A-ZÀ-Þ][a-zà-ÿ']+) [A-ZÀ-Þ]/.exec(n);
    return m && !PARTICULES.has(m[2]) && !COMPOSES.has(m[2]);
  });
  if (suspects.length) fail("noms à vérifier (prénom composé avalé dans le patronyme ?) : " + suspects.join(", "));
  else ok("aucun prénom composé resté collé au patronyme (« Dja Djédjé » et « Alo'o Efoulou » sont de vrais patronymes)");

  // réconciliation France ↔ Europe (clubs européens figés en 95-96)
  const eur = new Set();
  for (const T of [api.STARS_EUROPE, api.STARS_EUROPE_C2, api.STARS_EUROPE_C3]) for (const id in T) for (const t of T[id]) eur.add(t[0]);
  const collE = Object.keys(compte).filter(n => eur.has(n));
  api.nouvellePartie("LYO", KEY);
  const Gv = api.getG();
  const enFr = new Set(); for (const c of Gv.clubs.concat(Gv.autre)) for (const j of c.joueurs) if (j.reel) enFr.add(j.nom);
  const surDeux = []; for (const c of Gv.europe) for (const j of c.joueurs) if (j.reel && enFr.has(j.nom)) surDeux.push(j.nom + " (" + c.id + ")");
  if (surDeux.length) fail("joueurs réels à la fois en France et en Europe : " + surDeux.join(", "));
  else ok(collE.length + " joueurs passés en France retirés de leur club européen");
  const courts = Gv.europe.filter(c => ["G", "D", "M", "A"].some(p => c.joueurs.filter(j => j.pos === p).length < api.CIBLE[p]));
  if (courts.length) fail("clubs européens sous l'effectif cible après réconciliation : " + courts.map(c => c.id).join(","));
  // UN FORCÉ NE DOIT PAS CONTREDIRE LE RECRUTEUR (règle de 05/06) : le vivier de l'été 2007 et les
  // effectifs du championnat ne peuvent pas placer le même homme à deux endroits au coup d'envoi.
  const employes = new Set();
  for (const c of Gv.clubs.concat(Gv.autre || [])) for (const j of c.joueurs) employes.add(j.nom);
  const vivNoms = [];
  for (const t in (Gv.vivier || {})) for (const e of Gv.vivier[t]) vivNoms.push(e[0]);
  for (const r of (Gv.rapport || [])) if (r && r.nom) vivNoms.push(r.nom);
  const coll = [...new Set(vivNoms.filter(n => employes.has(n)))];
  if (coll.length) fail("vivier 07/08 contient des joueurs déjà employés : " + coll.join(", "));
  else ok("vivier de l'été 2007 disjoint des effectifs employés : aucun homme à deux endroits");
} catch (e) { fail("exception doublons : " + e.stack); }

/* ===== 3) Année de base + étés internationaux + sièges européens ===== */
console.log("3) Année de base, EURO 2008 à la PREMIÈRE intersaison, MONDIAL 2010 à la troisième, sièges européens");
try {
  api.nouvellePartie("LYO", KEY);
  let G = api.getG();
  if (G.saison !== KEY) fail("G.saison = " + G.saison + " (attendu " + KEY + ")");
  if (G.anBase !== 2007) fail("G.anBase = " + G.anBase + " (attendu 2007)");
  if (api.anneeJeu() !== 2007) fail("anneeJeu() = " + api.anneeJeu() + " (attendu 2007)");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  G.vire = null;
  api.intersaison();
  G = api.getG();
  // PARTIR DE 07/08 FAIT TOMBER L'EURO 2008 DÈS LA PREMIÈRE INTERSAISON : l'Espagne met fin à
  // quarante-quatre ans d'attente, et les Bleus rentrent dès le premier tour.
  const ete2008 = (G.recap || []).join(" ");
  if (!/l'Espagne met fin à quarante-quatre ans/i.test(ete2008))
    fail("été 2008 : l'Euro de l'Espagne doit tomber dès la PREMIÈRE intersaison quand on part de 07/08 — reçu « " + ete2008.slice(0, 140) + " »");
  else ok("l'EURO 2008 tombe dès la PREMIÈRE intersaison : l'Espagne sacrée à Vienne, une frappe de Torres");
  if (/LA FRANCE/.test(ete2008)) fail("l'été 2008 ne doit pas contenir « LA FRANCE » en capitales : les Bleus sortent au premier tour");
  else ok("la dépêche de l'été 2008 ne se lit pas comme un triomphe français");
  if (G.saison !== "2008-09") fail("chaîne de saison : G.saison = " + G.saison + " (attendu 2008-09)");
  else ok("chaîne de saison correcte : 2007-08 → 2008-09");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  api.getG().vire = null; api.intersaison(); G = api.getG();
  const ete2009 = (G.recap || []).join(" ");
  if (/ÉTÉ 200[0-9]|ÉTÉ 20[12][0-9]/.test(ete2009))
    fail("l'été 2009 ne porte aucun tournoi : la 2e intersaison doit rester muette — reçu « " + ete2009.slice(0, 120) + " »");
  else ok("l'été 2009 est MUET — rien entre l'Euro 2008 et le Mondial 2010");
  for (let d = 0; d < 38; d++) api.jouerJournee();
  api.getG().vire = null; api.intersaison(); G = api.getG();
  // L'ÉTÉ 2010 EST LE DEUXIÈME QUE `HONNEURS` AIT EU À APPRENDRE DEPUIS L'OUVERTURE DU CHANTIER,
  // après l'été 2008 écrit pour 06/07 : l'Espagne gagne son premier Mondial, et la France rentre
  // de Knysna sans avoir gagné un match. La dépêche ne doit surtout pas se lire comme un triomphe.
  const ete2010 = (G.recap || []).join(" ");
  if (!/Afrique du Sud/i.test(ete2010))
    fail("été 2010 : le Mondial d'Afrique du Sud doit tomber à la TROISIÈME intersaison — reçu « " + ete2010.slice(0, 140) + " »");
  else ok("le MONDIAL 2010 tombe à la TROISIÈME intersaison : l'Espagne sacrée, un but d'Iniesta à la 116e");
  if (/LA FRANCE/.test(ete2010)) fail("l'été 2010 ne doit pas contenir « LA FRANCE » en capitales : les Bleus rentrent de Knysna");
  else ok("la dépêche de l'été 2010 ne se lit pas comme un triomphe français");
  // L'Europe 2007-08 telle qu'elle s'est jouée : LYON (champion) et MARSEILLE (2e de 2006-07) en
  // phase de groupes de Ligue des champions, TOULOUSE (3e) au troisième tour de qualification,
  // pour la première fois de son histoire ; en Coupe UEFA RENNES (4e), LENS au titre de
  // l'INTERTOTO 2007, BORDEAUX (Coupe de la Ligue 2007) et SOCHAUX (Coupe de France 2007).
  // Sept sièges, tous en Ligue 1.
  const attendu = { LYO: "C1", OM: "C1", TOU: "C1", REN: "C3", LEN: "C3", BOR: "C3", SOC: "C3",
                    NCY: null, STE: null, LIL: null, NIC: null, LMN: null, LOR: null, CAE: null,
                    MON: null, VAN: null, AUX: null, PSG: null, STR: null, MET: null,
                    LEH: null, NAN: null, GRE: null, SED: null, CLE: null, TRO: null, BRE: null,
                    MTP: null, AJA: null, ANG: null, BAS: null, GUI: null, REI: null, AMI: null,
                    CHA: null, BLG: null, DIJ: null, NIO: null, LIB: null, GUE: null };
  for (const id in attendu) {
    api.nouvellePartie(id, KEY);
    const c = api.getG().euroCompet;
    if (c !== attendu[id]) fail("siège européen " + id + " = " + c + " (attendu " + attendu[id] + ")");
  }
  ok("sièges européens : Lyon, Marseille et Toulouse en C1 ; Rennes, Lens, Bordeaux et Sochaux en Coupe UEFA");
  const S = api.SAISONS[KEY];
  if ((S.euroC2 || []).length) fail("la Coupe des Coupes n'existe plus en 2007-08 : euroC2 doit être vide");
  else ok("aucun siège en Coupe des Coupes : la compétition a disparu après 1999 (huitième fois)");
  // LE CONTRÔLE QUI ATTRAPE L'ERREUR LA PLUS FACILE ET LA PLUS INVISIBLE, DANS LES DEUX SENS :
  // Nancy (4e) et Saint-Étienne (5e) du championnat 2007-08 partent SANS Europe, parce que les
  // sièges se gagnent l'année d'AVANT ; et TOULOUSE, qui finira DIX-SEPTIÈME, joue bel et bien la
  // Ligue des champions, pour avoir été troisième en 2006-07. C'est le cas le plus frappant du jeu.
  for (const id of ["NCY", "STE", "LIL", "NIC"])
    if ((S.euroC1 || []).includes(id) || (S.euroC3 || []).includes(id))
      fail(id + " n'a pas de siège en 2007-08 : les sièges se gagnent sur le classement de 2006-07");
  ok("Nancy et Saint-Étienne, futurs quatrième et cinquième, partent sans Europe : les sièges se gagnent l'année d'avant");
  if (!(S.euroC1 || []).includes("TOU"))
    fail("Toulouse joue la Ligue des champions en 2007-08, troisième tour de qualification : il était TROISIÈME en 2006-07");
  else ok("TOULOUSE, futur dix-septième, joue la Ligue des champions — le siège le plus invraisemblable du jeu");
  const tousSieges = (S.euroC1 || []).concat(S.euroC3 || []);
  if (tousSieges.length !== 7) fail("2007-08 compte sept sièges européens, reçu " + tousSieges.length);
  const horsL1 = tousSieges.filter(id => !S.d1.includes(id));
  if (horsL1.length) fail("siège européen de deuxième division : " + horsL1.join(","));
  else ok("les SEPT sièges sont en Ligue 1, et aucun depuis la Ligue 2 pour la troisième fois de suite");
} catch (e) { fail("exception année/Europe : " + e.stack); }

/* ===== 4) Carrière multi-saisons depuis 07/08 ===== */
console.log("4) Carrière multi-saisons depuis 07/08 (calibrage, vieillissement)");
let totalButs = 0, totalMatchs = 0;
const departs = ["LYO", "MET", "BLG", "LEH"];  // le champion, le relégué, le club neuf, le futur promu
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
  } catch (e) { fail("exception carrière 07/08 (" + dep + ") : " + e.stack); }
}
const gpm = totalButs / totalMatchs;
console.log("— Calibrage 07/08 : " + gpm.toFixed(3) + " buts/match sur " + Math.round(totalMatchs) + " matchs —");
if (gpm < 2.0 || gpm > 2.8) fail("calibrage 07/08 hors plage (cible ~2,3) : " + gpm.toFixed(3));
else ok("calibrage 07/08 dans la plage attendue");

console.log(FAILS === 0 ? "\n✅ HARNAIS 07/08 : TOUT EST VERT" : "\n❌ HARNAIS 07/08 : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS === 0 ? 0 : 1);
