/* Harnais de validation — SAISON DE DÉPART ANG 2000-01
   La ONZIÈME saison anglaise, la première assemblée par la tâche planifiée à partir d'un relevé.
   `harness-angleterre.cjs` tient le cadre ; ici, les FAITS :
   1) le plateau réel, 2) les sièges européens de 2000,
   3) les hommes : Sheringham joueur de l'année, Gerrard meilleur espoir, Hasselbaink meilleur buteur,
      Ferdinand encore à West Ham au coup d'envoi, et les pépites (O'Shea, Defoe, Jenas)
   4) les corrections du relevé : les titulaires présents au coup d'envoi qu'il avait laissés de côté
      (Henry, Fowler, Joe Cole, Solano…), les quatre hommes sans nom libre ou trop âgés, et « P. Gray »
   5) une carrière
   Usage : node harness-ang0001.cjs                                                        */
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
  "voitPays,SAISONS,STARS_ANG0001,STARS_D2_ANG0001,D1_ANG0001,D2_ANG0001,SIEGES_ANG,VIVIER_SAISON," +
  "PRENOMS_VRAIS,CLUBS_ANG,STARS_ANG9900,STARS_D2_ANG9900,getG:function(){return G;}};";
const api = new Function(script + epilogue)();

let FAILS = 0;
const fail = (m) => { console.error("  ✗ " + m); FAILS++; };
const ok = (m) => console.log("  ✓ " + m);
const dit = (c, m) => (c ? ok(m) : fail(m));
const KEY = "ANG-2000-01";
const S = api.SAISONS[KEY];
const meme = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

const PAR_NOM = new Map();
for (const [club, lst] of Object.entries(api.STARS_ANG0001)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 1 });
for (const [club, lst] of Object.entries(api.STARS_D2_ANG0001)) for (const t of lst) PAR_NOM.set(t[0], { club, t, div: 2 });
const au = (nom, club) => (PAR_NOM.get(nom) || {}).club === club;

const note = n => (PAR_NOM.get(n) || { t: [0, 0, 0, 0, 0] }).t;

console.log("1) Le plateau réel de 2000-01");
{
  dit(!!S && S.pays === "ANG" && S.an === 2000 && S.titre === "2000-01", "au registre : ANG, 2000, « 2000-01 »");
  dit(S.d1[0] === "MUN" && S.d1[1] === "ARS" && S.d1[2] === "LIV", "Manchester United champion pour la troisième fois de suite, devant Arsenal et Liverpool");
  dit(S.d1[4] === "IPS", "Ipswich, tout juste promu, cinquième");
  dit(meme(S.d1.slice(-3), ["MCI", "COV", "BRD"]), "Manchester City, Coventry et Bradford, les trois relégués, ferment l'élite");
  dit(S.d2[0] === "FUL" && S.d2[1] === "BLB" && S.d2[2] === "BOL", "Fulham champion du dessous, Blackburn deuxième, Bolton vainqueur des barrages");
  for (const c of ["CPL", "HUD", "QPR", "TRM"]) dit(!S.d2.includes(c), c + " écarté, parmi les quatre derniers");
  const n1 = S.d1.reduce((s, c) => s + api.STARS_ANG0001[c].length, 0), n2 = S.d2.reduce((s, c) => s + api.STARS_D2_ANG0001[c].length, 0);
  dit(n1 === 400 && n2 === 360, "760 vrais joueurs (" + n1 + " + " + n2 + ")");
}
console.log("\n2) Les sièges européens de 2000");
{
  const T = api.SIEGES_ANG[2000];
  dit(meme(S.euroC1, ["MUN", "ARS", "LEE"]) && S.euroC2.length === 0 && meme(S.euroC3, ["CHE", "LIV", "LEI"]), "United, Arsenal et Leeds en C1, la C2 vide, Chelsea, Liverpool et Leicester en C3");
  dit(meme(S.euroC1, T.C1) && meme(S.euroC2, T.C2) && meme(S.euroC3, T.C3), "les trois listes concordent avec SIEGES_ANG[2000]");
}
console.log("\n3) Les hommes de la saison");
{
  dit(au("T. Sheringham", "MUN") && note("T. Sheringham")[3] >= 85, "Sheringham, joueur de l'année PFA et FWA : " + note("T. Sheringham")[3]);
  dit(au("S. Gerrard", "LIV") && note("S. Gerrard")[3] >= 80 && note("S. Gerrard")[4] >= 90, "Gerrard, meilleur espoir : " + note("S. Gerrard")[3] + "/" + note("S. Gerrard")[4]);
  dit(au("J. F. Hasselbaink", "CHE") && note("J. F. Hasselbaink")[3] >= 85, "Hasselbaink, meilleur buteur (vingt-trois) : " + note("J. F. Hasselbaink")[3]);
  dit(au("M. Stewart", "IPS") && note("M. Stewart")[3] >= 78, "Marcus Stewart, dix-neuf buts pour Ipswich : " + note("M. Stewart")[3]);
  dit(au("R. Ferdinand", "WHU"), "Rio Ferdinand à West Ham : il ne rejoint Leeds qu'en novembre");
  dit(au("J. O'Shea", "MUN") && au("J. Defoe", "WHU") && au("J. Jenas", "FOR"), "les pépites : O'Shea (United), Defoe (West Ham), Jenas (Forest)");
  dit(note("J. Defoe")[4] >= 88 && note("J. Jenas")[4] >= 88 && note("J. O'Shea")[4] >= 86, "leur potentiel à la hauteur de la suite");
  const tous = [].concat(...Object.values(api.STARS_ANG0001), ...Object.values(api.STARS_D2_ANG0001));
  dit(tous.every(t => t[2] >= 15 && t[2] <= 40 && t[3] >= 55 && t[3] <= 90 && t[4] >= t[3]), "âges de 15 à 40 ans, notes de 55 à 90, potentiel ≥ note");
  const sansPrenom = [...PAR_NOM.keys()].filter(n => /^[A-Z][a-z]*\. /.test(n) && !(n in api.PRENOMS_VRAIS));
  dit(sansPrenom.length === 0, "chaque nom à initiale a son entrée de prénom" + (sansPrenom.length ? " — " + sansPrenom.slice(0, 8).join(", ") : ""));
  dit(PAR_NOM.size === 760, "aucun nom court porté par deux hommes (" + PAR_NOM.size + " noms)");
}
console.log("\n4) Les corrections du relevé");
{
  // présents au coup d'envoi, vérifiés à l'historique de transferts, que le relevé avait écartés
  for (const [n, c] of [["T. Henry", "ARS"], ["R. Fowler", "LIV"], ["J. Cole", "WHU"], ["S. Hislop", "WHU"], ["N. Solano", "NEW"],
    ["T. Gravesen", "EVE"], ["S. Johnson", "DER"], ["D. Dunn", "BLB"], ["L. B. Morte", "FUL"], ["K. Lunt", "CRW"]])
    dit(au(n, c), n + " à " + c + ", présent au coup d'envoi");
  dit(!PAR_NOM.has("D. Beasant"), "Beasant, quarante et un ans au coup d'envoi, n'est pas au plateau");
  dit(PAR_NOM.has("S. Collis") && api.STARS_D2_ANG0001.FOR.filter(t => t[1] === "G").length >= 2, "Forest garde deux gardiens (Collis, arrivé de Barnet le 1er août)");
  dit(au("S. McPhail", "LEE") && au("D. Burrows", "BIR"), "McPhail (Leeds) et Burrows (Birmingham) remplacent Alan Smith et Marcelo, sans nom libre");
  dit(au("P. Gray", "BUR") && !html.includes('["Phil Gray",'), "« P. Gray » partout : l'homme de Luton en 1991-93 ne porte plus un second nom");
  const SHU = api.STARS_D2_ANG0001.SHU;
  dit(SHU.filter(t => t[1] === "G").length === 1, "Sheffield United n'a qu'un gardien : le seul autre présent au coup d'envoi avait quarante-deux ans");
}
console.log("\n5) Une carrière anglaise depuis 2000-01");
{
  api.nouvellePartie("IPS", KEY);
  const G = api.getG();
  dit(G.pays === "ANG" && G.saison === "2000-01" && api.anneeJeu() === 2000, "G.pays = ANG, « 2000-01 », 2000");
  let ex = null;
  try { for (let s = 0; s < 3; s++) { for (let j = 0; j < 38; j++) api.jouerJournee(); api.intersaison(); } } catch (e) { ex = e; }
  dit(!ex, "trois saisons jouées sans exception" + (ex ? " — " + ex.message : ""));
  const G2 = api.getG();
  dit(G2.clubs.concat(G2.autre || []).flatMap(c => (c.joueurs || []).filter(j => j.age > 38)).length === 0, "personne au-delà de trente-huit ans");
  dit(api.anneeJeu() === 2003, "carrière rendue en 2003-04");
}

console.log("");
if (FAILS) { console.error("❌ HARNAIS ANG 2000-01 : " + FAILS + " ÉCHEC(S)"); process.exit(1); }
console.log("✅ HARNAIS ANG 2000-01 : TOUT EST VERT");
