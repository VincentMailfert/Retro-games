/* Recopie le moteur MATCH3D de docs/prototype-match-3d.html dans docs/prototype-vrais-stades.html (les vrais stades, prototype du 27/11/2026).
   Rejouable : on retouche le moteur dans prototype-match-3d.html, puis on relance.
   Usage, depuis championnat/ :  node docs/construit-vrais-stades.cjs */
const fs = require("fs"), path = require("path");
const DEBUT = "/* ---- MATCH3D : DÉBUT ----", FIN = "/* ---- MATCH3D : FIN ---- */";
const src = fs.readFileSync(path.join(__dirname, "prototype-match-3d.html"), "utf8");
const a = src.indexOf(DEBUT), b = src.indexOf(FIN);
if (a < 0 || b < a) throw new Error("Marqueurs MATCH3D introuvables dans le prototype du match");
const bloc = src.slice(a, b + FIN.length);
const cible = path.join(__dirname, "prototype-vrais-stades.html");
const html = fs.readFileSync(cible, "utf8");
const x = html.indexOf(DEBUT), y = html.indexOf(FIN);
if (x < 0 || y < x) throw new Error("Marqueurs MATCH3D introuvables dans prototype-vrais-stades.html");
fs.writeFileSync(cible, html.slice(0, x) + bloc + html.slice(y + FIN.length));
console.log("Moteur recopié (" + bloc.length + " caractères).");
