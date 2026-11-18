// Insère une saison assemblée dans championnat/index.html (anglaise par défaut, ou du pays de reglages.pays).
// Usage : node releves/outils/inserer.cjs <assemblage.json> <reglages.json>
//   assemblage.json : sortie d'assemble.cjs
//   reglages.json   : { an, version_avant, version_apres, nom, sous, euroC1, euroC2, euroC3, entete,
//                       pays (facultatif, ANG par défaut), reel (facultatif : {d1, d2}, la ligne de CLASSEMENT_REEL) }
//   La première saison d'un pays n'a pas de voisine : ses tables vont après les dernières tables anglaises, son
//   entrée à la fin du registre SAISONS.
// Les tables vont juste après celles de la saison précédente, l'entrée du registre juste après la sienne.
"use strict";
const fs = require("fs"), path = require("path");
const S = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const C = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
const f = path.join(__dirname, "..", "..", "championnat", "index.html");
let h = fs.readFileSync(f, "utf8");
const CRLF = h.includes("\r\n"); h = h.replace(/\r\n/g, "\n");
const yy = n => String(n % 100).padStart(2, "0");
const SUF = yy(C.an) + yy(C.an + 1), PREC = yy(C.an - 1) + yy(C.an), PAYS = C.pays || "ANG";
const remplace = (avant, apres) => { if (h.split(avant).length !== 2) throw new Error("ancre introuvable ou multiple : " + avant.slice(0, 60)); h = h.replace(avant, apres); };
if (h.includes(`const STARS_${PAYS}${SUF}=`)) throw new Error(`STARS_${PAYS}${SUF} est déjà dans le jeu : remettre index.html à HEAD avant de réinsérer`);

remplace(`const VERSION = "${C.version_avant}";`, `const VERSION = "${C.version_apres}";`);

const pr = S.prenoms.slice().sort((a, b) => a[0].localeCompare(b[0]));
const lignes = []; let l = " ";
for (const [n, p] of pr) { const e = `"${n}":"${p}", `; if ((l + e).length > 100) { lignes.push(l.trimEnd()); l = " "; } l += e; }
if (l.trim()) lignes.push(l.trimEnd());
const vides = pr.filter(x => !x[1]).length;
remplace("const PRENOMS_VRAIS={\n", "const PRENOMS_VRAIS={\n" + ` /* ${PAYS} ${C.an}-${yy(C.an + 1)} (v${C.version_apres}) : ${pr.length} prénoms neufs, ${vides ? vides + " vides" : "aucun vide"} */\n` + (lignes.length ? lignes.join("\n") + "\n" : ""));

// la saison voisine la plus proche déjà au jeu sert d'ancre pour les tables
const voisinesDe = p => [...h.matchAll(new RegExp(`const D2_${p}(\\d{4})=\\[[^\\]]*\\];\\n`, "g"))].map(m => ({ suf: m[1], an: (+m[1].slice(0, 2) < 50 ? 2000 : 1900) + +m[1].slice(0, 2), txt: m[0], pos: m.index }));
const voisines = voisinesDe(PAYS);
// première saison d'un pays : après les dernières tables anglaises du fichier
const ancre = voisines.length ? voisines.sort((a, b) => Math.abs(a.an - C.an) - Math.abs(b.an - C.an))[0] : voisinesDe("ANG").sort((a, b) => b.pos - a.pos)[0];
remplace(ancre.txt, ancre.txt + "/* " + C.entete.trim() + " */\n" + S.texteStars);

const L = a => JSON.stringify(a);
const entree = ` "${PAYS}-${C.an}-${yy(C.an + 1)}":{ pays:"${PAYS}", an:${C.an}, titre:"${C.an}-${yy(C.an + 1)}", nom:${L(C.nom)}, d1:D1_${PAYS}${SUF}, d2:D2_${PAYS}${SUF}, starsD1:STARS_${PAYS}${SUF}, starsD2:STARS_D2_${PAYS}${SUF}, euroC1:${L(C.euroC1)}, euroC2:${L(C.euroC2)}, euroC3:${L(C.euroC3)},\n   sous:${L(C.sous)} },\n`;
if (voisines.length) {
  const cleVoisine = `"${PAYS}-${ancre.an}-${yy(ancre.an + 1)}":{`;
  const e0 = h.indexOf(" " + cleVoisine), fin = h.indexOf("\n", h.indexOf("\n", e0) + 1) + 1;
  if (e0 < 0 || !h.slice(e0, fin).trimEnd().endsWith("},")) throw new Error("entrée voisine introuvable ou mal formée : " + cleVoisine);
  h = h.slice(0, fin) + entree + h.slice(fin);
} else {
  const s0 = h.indexOf("const SAISONS={\n"), fin = h.indexOf("\n};\n", s0) + 1;
  if (s0 < 0 || fin <= 0) throw new Error("registre SAISONS introuvable");
  h = h.slice(0, fin) + entree + h.slice(fin);
}
// le vrai classement final (CLASSEMENT_REEL), en fin de table
if (C.reel) {
  const r0 = h.indexOf("const CLASSEMENT_REEL={\n"), fin = h.indexOf("\n};\n", r0) + 1;
  if (r0 < 0 || fin <= 0) throw new Error("table CLASSEMENT_REEL introuvable");
  if (h.slice(r0, fin).includes(`"${PAYS}-${C.an}-${yy(C.an + 1)}":{`)) throw new Error("CLASSEMENT_REEL a déjà cette saison");
  h = h.slice(0, fin) + ` "${PAYS}-${C.an}-${yy(C.an + 1)}":{d1:${L(C.reel.d1)}, d2:${L(C.reel.d2)}},\n` + h.slice(fin);
}
fs.writeFileSync(f, CRLF ? h.replace(/\n/g, "\r\n") : h);
console.log(`inséré : ${PAYS} ${C.an}-${yy(C.an + 1)}, ${pr.length} prénoms, ${Object.keys(S.stars1).length + Object.keys(S.stars2).length} clubs, tables après D2_${voisines.length ? PAYS : "ANG"}${ancre.suf}`);
