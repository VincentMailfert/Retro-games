/* Harnais de validation — LE CADRE DES PAYS (ANG-A, v1.80)
   Première étape du lot structure qui précède l'Angleterre. Aucune saison étrangère n'est encore ajoutée :
   ce qui se vérifie ici, c'est que le cadre existe, qu'il dit vrai, et SURTOUT qu'il ne change pas d'un
   octet ce qu'une partie française affichait avant lui.
   A) la table PAYS se tient : chaque pays décrit, aucun trou, aucun taux absurde
   B) les libellés de divisions suivent le pays ET l'année, et la France ne bouge jamais
   C) le champ `pays` de SAISONS, et la convention de clé (nue en France, préfixée ailleurs)
   D) les montants : en France, rendu IDENTIQUE aux expressions remplacées ; en Angleterre, huit francs
      valent une livre
   E) le pays REGARDÉ n'est pas le pays joué : l'accueil, la carrière, et la vieille sauvegarde
   F) et tout cela arrive jusqu'à l'écran : sélecteur groupé, bandeaux, onglet de coupe
   G) rien d'un libellé ne peut ouvrir une balise
   Usage : node harness-pays.cjs                                                                        */
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
/* un vrai petit nœud pour #app : il retient la page que le jeu lui écrit, seul moyen de lire l'écran
   d'accueil et le bandeau en jeu tels qu'un joueur les voit */
const APP = { _h: "", querySelector: () => null, querySelectorAll: () => [] };
Object.defineProperty(APP, "innerHTML", { get() { return APP._h; }, set(v) { APP._h = String(v); } });
const generic = makeStub();
global.document = new Proxy(function () {}, {
  get(_t, p) { if (p === "getElementById") return id => (id === "app" ? APP : generic); if (p === Symbol.toPrimitive) return () => ""; return generic; },
  set() { return true; }, apply() { return generic; }, has() { return true; }, construct() { return generic; },
});
global.window = { __TEST__: true, addEventListener() {}, removeEventListener() {}, localStorage: ls, location: { href: "" }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
global.localStorage = ls; global.navigator = { userAgent: "harness" };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => null;
global.getComputedStyle = () => makeStub();
global.requestAnimationFrame = (cb) => setTimeout(cb, 0); global.cancelAnimationFrame = (id) => clearTimeout(id);

const api = new Function(script + "\n;return {PAYS,voitPays,paysVu,anVu,paysDeSaison,libDiv,tagDiv,libCoupeNat," +
  "libCoupeLigue,libChampion,adjPays,libEcran,MM,MMv,MMC,MMn,UU,FMT,MF_C,PALIERS_D2,SAISONS,SAISON_DEFAUT," +
  "nouvellePartie,ecranAccueil,chrome,migre,esc,anneeJeu,EN_TEST:true," +
  "getG:function(){return G;},setG:function(x){G=x;},setAccueil:function(k){SAISON_ACCUEIL=k;}};")();
const { PAYS, SAISONS, voitPays, libDiv, tagDiv, MM, MMv, MMC, MMn, UU, FMT, MF_C } = api;

let FAILS = 0;
const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) FAILS++; };
const cles = Object.keys(SAISONS);

/* ===== A) la table PAYS se tient ===== */
console.log("A) La table PAYS : un pays décrit, pas un pays esquissé");
{
  const codes = Object.keys(PAYS);
  ok(codes.length >= 2 && codes.includes("FR") && codes.includes("ANG"),
    `la table connaît ${codes.length} pays, dont la France et l'Angleterre : ${codes.join(", ")}`);
  const champs = ["code", "nom", "adj", "drapeau", "coupe", "coupeLigue", "champion", "unite", "millions", "monNom"];
  const trous = [];
  for (const c of codes) {
    for (const f of champs) if (!PAYS[c][f] || !String(PAYS[c][f]).trim()) trous.push(c + "." + f);
    for (const f of ["div1", "div2", "tag1", "tag2"]) if (typeof PAYS[c][f] !== "function") trous.push(c + "." + f);
  }
  ok(trous.length === 0, `aucun champ vide ni manquant sur aucun pays${trous.length ? " — " + trous.join(", ") : ""}`);
  const codeFaux = codes.filter(c => PAYS[c].code !== c);
  ok(codeFaux.length === 0, `chaque entrée porte son propre code${codeFaux.length ? " — " + codeFaux.join(", ") : ""}`);
  const tauxFaux = codes.filter(c => !(PAYS[c].taux > 0 && PAYS[c].taux <= 1));
  ok(tauxFaux.length === 0, `tous les taux d'affichage sont plausibles${tauxFaux.length ? " — " + tauxFaux.join(", ") : ""}`);
  ok(PAYS.FR.taux === 1, "la France est la référence : son taux vaut exactement 1, donc elle ne convertit rien");
  // deux pays ne peuvent pas porter la même coupe nationale, sinon le libellé ne distingue plus rien
  const coupes = new Set(codes.map(c => PAYS[c].coupe));
  ok(coupes.size === codes.length, "chaque pays a sa propre coupe nationale, aucune en double");
}

/* ===== B) les libellés de divisions ===== */
console.log("B) Les divisions se nomment par pays ET par année");
{
  // La France ne bouge pas : la D1 devient la Ligue 1 en 2002 dans les sous-titres, jamais dans le moteur.
  voitPays("FR", 1995, false);
  const ansFR = [1990, 1995, 1999, 2002, 2005, 2009];
  const toutDiv1 = ansFR.map(a => libDiv(1, a)), toutDiv2 = ansFR.map(a => libDiv(2, a));
  ok(toutDiv1.every(l => l === "Division 1"), `en France, l'élite reste « Division 1 » de 1990 à 2009 (${new Set(toutDiv1).size} libellé)`);
  ok(toutDiv2.every(l => l === "Division 2"), `et l'antichambre reste « Division 2 », Ligue 2 ou pas (${new Set(toutDiv2).size} libellé)`);
  ok(ansFR.every(a => tagDiv(1, a) === "D1" && tagDiv(2, a) === "D2"), "les étiquettes courtes françaises restent « D1 » et « D2 »");

  // L'Angleterre, elle, change deux fois de vocabulaire : c'est le détail d'époque du cadre.
  voitPays("ANG", 1990, false);
  ok(libDiv(1, 1990) === "First Division" && libDiv(1, 1991) === "First Division",
    "en Angleterre, l'élite est la First Division jusqu'en 1991-92");
  ok(libDiv(1, 1992) === "Premier League" && libDiv(1, 2009) === "Premier League",
    "puis la Premier League à partir de 1992-93, et jusqu'au bout");
  ok(libDiv(2, 1990) === "Second Division", "l'échelon du dessous est la Second Division jusqu'en 1991-92");
  ok(libDiv(2, 1992) === "Division One" && libDiv(2, 2003) === "Division One",
    "la Division One de 1992-93 à 2003-04");
  ok(libDiv(2, 2004) === "Championship" && libDiv(2, 2009) === "Championship",
    "et le Championship à partir de 2004-05");
  ok(tagDiv(1, 1991) === "D1" && tagDiv(1, 1992) === "PL",
    "le bandeau d'une carrière anglaise passe donc de « D1 » à « PL » tout seul, en 1992");
  ok(tagDiv(2, 1991) === "D2" && tagDiv(2, 1992) === "D1" && tagDiv(2, 2004) === "CH",
    "et l'étiquette de l'antichambre suit : « D2 », puis « D1 », puis « CH »");
  // la coupe et la formule de titre suivent le pays
  ok(api.libCoupeNat() === "FA Cup" && api.libCoupeLigue() === "League Cup", "la coupe nationale anglaise est la FA Cup, la coupe de la ligue la League Cup");
  ok(api.libChampion() === "champion d'Angleterre" && api.adjPays() === "anglaise", "« champion d'Angleterre », et l'adjectif qui va avec");
  voitPays("FR", 1995, false);
  ok(api.libCoupeNat() === "Coupe de France" && api.libChampion() === "champion de France",
    "et de retour en France, la Coupe de France et le champion de France, inchangés");
  // les paliers d'objectif de la 2e division nomment leur division : la table est paresseuse, donc elle suit
  const pFR = api.PALIERS_D2()[0];
  voitPays("ANG", 1992, false);
  const pANG = api.PALIERS_D2()[0];
  voitPays("FR", 1995, false);
  ok(pFR.court === "le titre de Division 2" && pANG.court === "le titre de Division One",
    "l'objectif du président se dit dans la langue du pays : « le titre de Division 2 » / « le titre de Division One »");
  // un pays inconnu retombe sur la France, jamais sur un libellé vide
  voitPays("ZZZ", 1995, false);
  ok(api.paysVu().code === "FR" && libDiv(1) === "Division 1", "un code de pays inconnu retombe sur la France, il ne casse rien");
  voitPays("FR", 1995, false);
}

/* ===== C) le champ `pays` et la convention de clé ===== */
console.log("C) Chaque saison dit de quel pays elle est");
{
  const sans = cles.filter(k => !SAISONS[k].pays);
  ok(sans.length === 0, `les ${cles.length} saisons portent un champ pays${sans.length ? " — sauf " + sans.join(", ") : ""}`);
  const inconnus = cles.filter(k => !PAYS[SAISONS[k].pays]);
  ok(inconnus.length === 0, `et chaque pays cité existe dans la table${inconnus.length ? " — " + inconnus.join(", ") : ""}`);
  ok(api.paysDeSaison("une-clé-qui-n-existe-pas") === "FR",
    "l'absence de champ vaut « FR » : une sauvegarde d'avant le cadre reste une carrière française, sans migration");
  // la convention : clé nue = France, clé préfixée = tout autre pays
  const maljoint = cles.filter(k => {
    const p = SAISONS[k].pays, nue = /^\d{4}-\d{2}$/.test(k);
    return p === "FR" ? !nue : !k.startsWith(p + "-");
  });
  ok(maljoint.length === 0,
    `la clé suit la convention partout : nue en France, préfixée du code ailleurs${maljoint.length ? " — " + maljoint.join(", ") : ""}`);
  ok(/^\d{4}-\d{2}$/.test(api.SAISON_DEFAUT) && SAISONS[api.SAISON_DEFAUT].pays === "FR",
    `la saison par défaut reste française et sa clé reste nue (« ${api.SAISON_DEFAUT} »)`);
  // ce qui est une CLÉ du moteur n'est pas un libellé : on n'y touche pas
  ok(script.includes('"Pépite de Division 2"'),
    "« Pépite de Division 2 » est restée intacte : c'est une clé du vivier, sérialisée, pas un libellé");
}

/* ===== D) les montants ===== */
console.log("D) Les montants : rien ne change en France, tout se convertit en Angleterre");
{
  const SOMMES = [0, 1e5, 450000, 2500, 12e6, 23.4e6, 1e8, 78500];
  voitPays("FR", 1995, false);
  // la condition de non-régression de la v1.80, écrite noir sur blanc : les expressions d'ORIGINE
  const ecarts = [];
  for (const v of SOMMES) {
    for (const d of [0, 1, 2]) {
      if (MM(v, d) !== (v / 1e6).toFixed(d) + " MF") ecarts.push(`MM(${v},${d})`);
      if (MMv(v, d) !== (v / 1e6).toFixed(d).replace(".", ",") + " MF") ecarts.push(`MMv(${v},${d})`);
      if (MMn(v, d) !== (v / 1e6).toFixed(d)) ecarts.push(`MMn(${v},${d})`);
    }
    if (MMC(v) !== MF_C(v / 1e6) + " MF") ecarts.push(`MMC(${v})`);
    if (UU(v) !== FMT(v) + " FF") ecarts.push(`UU(${v})`);
  }
  ok(ecarts.length === 0,
    `en France, les cinq helpers rendent exactement ce que rendaient les expressions remplacées, sur ${SOMMES.length} montants × 3 décimales${ecarts.length ? " — " + ecarts.slice(0, 5).join(", ") : ""}`);
  ok(MM(12e6, 1) === "12.0 MF" && MMv(12e6, 1) === "12,0 MF" && UU(2500) === "2 500 FF",
    "à l'œil : 12.0 MF, 12,0 MF, 2 500 FF");

  voitPays("ANG", 1990, false);
  ok(MM(8e6, 1) === "1.0 M£", "en Angleterre, huit millions de francs font un million de livres : « 1.0 M£ »");
  ok(UU(8000) === "1 000 £", "et huit mille francs font mille livres : « 1 000 £ »");
  ok(MM(100e6, 1) === "12.5 M£", "un budget de 100 MF se lit 12.5 M£, l'ordre de grandeur d'un club anglais de 1995");
  ok(UU(70) === "9 £", "un billet à 70 FF se lit 9 £, ce que coûtait une place à Highbury");
  const unites = new Set([MM(1e6), MMv(1e6), MMC(1e6), UU(1e6)].map(x => x.replace(/[\d.,\s]/g, "")));
  ok(unites.size === 2 && unites.has("M£") && unites.has("£"), `aucun helper n'oublie de changer d'unité : ${[...unites].join(" / ")}`);
  voitPays("FR", 1995, false);
}

/* ===== E) le pays regardé n'est pas le pays joué ===== */
console.log("E) Le pays REGARDÉ, et non le pays joué");
{
  const S = SAISONS[api.SAISON_DEFAUT];
  api.nouvellePartie(S.d1[0], api.SAISON_DEFAUT);
  const G = api.getG();
  ok(G.pays === "FR", "une carrière neuve note son pays dans G (« " + G.pays + " »)");
  ok(api.paysVu().code === "FR" && api.anVu() === G.anBase, `et le pays regardé devient le sien, à la bonne année (${api.anVu()})`);
  // en carrière, l'année n'est pas figée : elle est relue, donc elle avance d'une saison à l'autre
  G.saisonIdx = 3;
  ok(api.anVu() === G.anBase + 2, `l'année regardée suit la carrière : saison 3 → ${api.anVu()}`);
  G.saisonIdx = 1;
  // une sauvegarde d'avant la v1.80 n'a pas de champ pays : migre la rend française, sans rien perdre
  delete G.pays;
  voitPays("ANG", 1990, false);
  api.migre();
  ok(api.getG().pays === "FR", "une carrière d'avant le cadre est rattrapée par migre() : elle devient française");
  ok(api.paysVu().code === "FR", "et le pays regardé repasse au sien, même si l'accueil regardait ailleurs");
  // l'accueil regarde la saison choisie, PAS la carrière chargée : « Mes carrières » ne vide pas G
  api.setAccueil(api.SAISON_DEFAUT);
  api.ecranAccueil();
  ok(api.paysVu().code === "FR" && api.anVu() === S.an,
    `à l'accueil, le pays et l'année sont ceux de la saison choisie (${api.anVu()}), pas ceux de la carrière en mémoire`);
}

/* ===== F) et tout cela arrive jusqu'à l'écran ===== */
console.log("F) L'écran : sélecteur groupé par pays, bandeaux au bon libellé");
{
  api.setAccueil(api.SAISON_DEFAUT);
  api.ecranAccueil();
  let page = APP._h;
  ok(!page.includes("<optgroup"), "avec un seul pays, le sélecteur reste la liste plate d'avant : un groupe unique n'est pas un groupe");
  ok(page.includes("DIVISION 1") && page.includes("DIVISION 2"), "les deux colonnes de clubs s'annoncent « DIVISION 1 » et « DIVISION 2 »");
  ok(page.includes("Division 1 française"), "et le bandeau dit « Division 1 française », comme avant le cadre");
  ok(!/undefined/.test(page), "aucun « undefined » n'a fuité dans la page");

  /* On enregistre une FAUSSE saison anglaise le temps du contrôle : c'est le seul moyen de prouver
     aujourd'hui que les groupes apparaissent le jour où l'Angleterre entrera pour de vrai. */
  const FAUSSE = "ANG-1990-91";
  SAISONS[FAUSSE] = { pays: "ANG", an: 1990, titre: "1990-91", nom: "Essai du harnais",
    d1: SAISONS[api.SAISON_DEFAUT].d1, d2: SAISONS[api.SAISON_DEFAUT].d2,
    starsD1: SAISONS[api.SAISON_DEFAUT].starsD1, starsD2: SAISONS[api.SAISON_DEFAUT].starsD2,
    euroC1: [], euroC2: [], euroC3: [], sous: "Saison d'essai, retirée aussitôt." };
  try {
    api.setAccueil(api.SAISON_DEFAUT);
    api.ecranAccueil();
    page = APP._h;
    const groupes = [...page.matchAll(/<optgroup label="([^"]*)"/g)].map(m => m[1]);
    ok(groupes.length === 2, `dès qu'un deuxième pays entre, le sélecteur se groupe tout seul : ${groupes.length} groupe(s)`);
    ok(groupes.some(g => g.includes("France")) && groupes.some(g => g.includes("Angleterre")),
      `et chaque groupe porte son pays : ${groupes.join(" | ")}`);
    const dedansFR = (page.match(/<optgroup label="[^"]*France"[^>]*>([\s\S]*?)<\/optgroup>/) || ["", ""])[1];
    ok((dedansFR.match(/<option/g) || []).length === cles.length,
      `les ${cles.length} saisons françaises sont rangées sous la France, et la fausse anglaise hors d'elles`);
    // et l'écran d'une saison anglaise parle anglais
    api.setAccueil(FAUSSE);
    api.ecranAccueil();
    page = APP._h;
    ok(page.includes("FIRST DIVISION") && page.includes("SECOND DIVISION"),
      "choisie, la saison anglaise de 1990 annonce « FIRST DIVISION » et « SECOND DIVISION »");
    ok(page.includes("First Division anglaise"), "et le bandeau dit « First Division anglaise »");
    ok(!page.includes("DIVISION 2"), "plus une seule « DIVISION 2 » française à l'écran");
  } finally {
    delete SAISONS[FAUSSE];
    api.setAccueil(api.SAISON_DEFAUT);
    api.ecranAccueil();
  }

  // le bandeau EN JEU, et l'onglet de la coupe nationale
  api.nouvellePartie(SAISONS[api.SAISON_DEFAUT].d1[0], api.SAISON_DEFAUT);
  api.chrome("classement", "<p>corps</p>");
  const jeu = APP._h;
  ok(/class="divTag[^"]*">D1</.test(jeu), "en jeu, le bandeau d'une carrière française porte toujours l'étiquette « D1 »");
  ok(jeu.includes("Coupe de France"), "et l'onglet de la coupe s'appelle « Coupe de France »");
  ok(api.libEcran("coupe") === "Coupe de France" && api.libEcran("classement") === "Classement",
    "libEcran ne corrige que la coupe, il laisse les autres onglets tranquilles");
  voitPays("ANG", 1992, false);
  ok(api.libEcran("coupe") === "FA Cup", "et vu d'Angleterre, le même onglet s'appelle « FA Cup »");
  voitPays("FR", 1995, false);
}

/* ===== G) rien d'un libellé ne peut ouvrir une balise ===== */
console.log("G) Aucun libellé ne peut ouvrir une balise");
{
  const tous = [];
  for (const c of Object.keys(PAYS)) {
    const p = PAYS[c];
    tous.push(p.nom, p.adj, p.drapeau, p.coupe, p.coupeLigue, p.champion, p.unite, p.millions, p.monNom);
    for (const a of [1990, 1992, 2004, 2009]) tous.push(p.div1(a), p.div2(a), p.tag1(a), p.tag2(a));
  }
  const sales = tous.filter(t => /[<>&"]/.test(String(t)));
  ok(sales.length === 0, `aucun des ${tous.length} libellés ne porte de chevron, d'esperluette ni de guillemet${sales.length ? " — " + sales.join(", ") : ""}`);
  const vides = tous.filter(t => !String(t).trim());
  ok(vides.length === 0, "et aucun n'est vide");
}

console.log(FAILS === 0 ? "\n✅ CADRE DES PAYS : TOUT EST VERT" : "\n❌ CADRE DES PAYS : " + FAILS + " ÉCHEC(S)");
process.exit(FAILS ? 1 : 0);
