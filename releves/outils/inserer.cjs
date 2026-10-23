// Insère une saison anglaise assemblée dans championnat/index.html.
// Usage : node releves/outils/inserer.cjs <assemblage.json> <reglages.json>
//   assemblage.json : sortie d'assemble.cjs
//   reglages.json   : { an, version_avant, version_apres, nom, sous, euroC1, euroC2, euroC3, entete }
// Les tables vont juste après celles de la saison précédente, l'entrée du registre juste après la sienne.
"use strict";
const fs = require("fs"), path = require("path");
const S = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const C = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
const f = path.join(__dirname, "..", "..", "championnat", "index.html");
let h = fs.readFileSync(f, "utf8");
const CRLF = h.includes("\r\n"); h = h.replace(/\r\n/g, "\n");
const yy = n => String(n % 100).padStart(2, "0");
const SUF = yy(C.an) + yy(C.an + 1), PREC = yy(C.an - 1) + yy(C.an);
const remplace = (avant, apres) => { if (h.split(avant).length !== 2) throw new Error("ancre introuvable ou multiple : " + avant.slice(0, 60)); h = h.replace(avant, apres); };
if (h.includes(`const STARS_ANG${SUF}=`)) throw new Error(`STARS_ANG${SUF} est déjà dans le jeu : remettre index.html à HEAD avant de réinsérer`);

remplace(`const VERSION = "${C.version_avant}";`, `const VERSION = "${C.version_apres}";`);

const pr = S.prenoms.slice().sort((a, b) => a[0].localeCompare(b[0]));
const lignes = []; let l = " ";
for (const [n, p] of pr) { const e = `"${n}":"${p}", `; if ((l + e).length > 100) { lignes.push(l.trimEnd()); l = " "; } l += e; }
if (l.trim()) lignes.push(l.trimEnd());
const vides = pr.filter(x => !x[1]).length;
remplace("const PRENOMS_VRAIS={\n", "const PRENOMS_VRAIS={\n" + ` /* ANG ${C.an}-${yy(C.an + 1)} (v${C.version_apres}) : ${pr.length} prénoms neufs, ${vides ? vides + " vides" : "aucun vide"} */\n` + (lignes.length ? lignes.join("\n") + "\n" : ""));

// la saison voisine la plus proche déjà au jeu sert d'ancre pour les tables
const voisines = [...h.matchAll(/const D2_ANG(\d{4})=\[[^\]]*\];\n/g)].map(m => ({ suf: m[1], an: (+m[1].slice(0, 2) < 50 ? 2000 : 1900) + +m[1].slice(0, 2), txt: m[0] }));
const ancre = voisines.sort((a, b) => Math.abs(a.an - C.an) - Math.abs(b.an - C.an))[0];
remplace(ancre.txt, ancre.txt + "/* " + C.entete.trim() + " */\n" + S.texteStars);

const cleVoisine = `"ANG-${ancre.an}-${yy(ancre.an + 1)}":{`;
const e0 = h.indexOf(" " + cleVoisine), fin = h.indexOf("\n", h.indexOf("\n", e0) + 1) + 1;
if (e0 < 0 || !h.slice(e0, fin).trimEnd().endsWith("},")) throw new Error("entrée voisine introuvable ou mal formée : " + cleVoisine);
const L = a => JSON.stringify(a);
const entree = ` "ANG-${C.an}-${yy(C.an + 1)}":{ pays:"ANG", an:${C.an}, titre:"${C.an}-${yy(C.an + 1)}", nom:${L(C.nom)}, d1:D1_ANG${SUF}, d2:D2_ANG${SUF}, starsD1:STARS_ANG${SUF}, starsD2:STARS_D2_ANG${SUF}, euroC1:${L(C.euroC1)}, euroC2:${L(C.euroC2)}, euroC3:${L(C.euroC3)},\n   sous:${L(C.sous)} },\n`;
h = h.slice(0, fin) + entree + h.slice(fin);
fs.writeFileSync(f, CRLF ? h.replace(/\n/g, "\r\n") : h);
console.log(`inséré : ANG ${C.an}-${yy(C.an + 1)}, ${pr.length} prénoms, ${Object.keys(S.stars1).length + Object.keys(S.stars2).length} clubs, tables après D2_ANG${ancre.suf}`);
