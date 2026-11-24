/* Greffe du CENTRE D'ENTRAÎNEMENT EN 3D (la vitrine de l'écran Club) dans le jeu.
   Recopie le bloc compris entre « CAMPUS3D : DÉBUT » et « CAMPUS3D : FIN » de docs/prototype-centre-3d.html dans
   index.html (juste après le bloc MATCH3D la première fois, puis entre les marqueurs).
   Rejouable et idempotent. On ne touche jamais le bloc dans index.html : on retouche le prototype, puis on relance.
   Usage, depuis championnat/ :  node docs/greffe-campus-3d.cjs */
const fs = require("fs"), path = require("path");
const RACINE = path.join(__dirname, "..");
const DEBUT = "/* ---- CAMPUS3D : DÉBUT ----", FIN = "/* ---- CAMPUS3D : FIN ---- */";
const proto = fs.readFileSync(path.join(__dirname, "prototype-centre-3d.html"), "utf8");
const a = proto.indexOf(DEBUT), b = proto.indexOf(FIN);
if (a < 0 || b < a) throw new Error("Marqueurs CAMPUS3D introuvables dans le prototype");
const bloc = proto.slice(a, b + FIN.length).replace(/\r\n/g, "\n");
if (/<\/script/i.test(bloc)) throw new Error("Le bloc contient une fin de script : il casserait le jeu");
const cible = path.join(RACINE, "index.html");
const html = fs.readFileSync(cible, "utf8");
let neuf;
const x = html.indexOf(DEBUT), y = html.indexOf(FIN);
if (x >= 0 && y > x) neuf = html.slice(0, x) + bloc + html.slice(y + FIN.length);
else {
  const ancre = "/* ---- MATCH3D : FIN ---- */";
  const k = html.indexOf(ancre);
  if (k < 0) throw new Error("Bloc MATCH3D introuvable dans index.html");
  neuf = html.slice(0, k + ancre.length) + "\n" + bloc + html.slice(k + ancre.length);
}
if (neuf === html) console.log("Rien à changer : le bloc CAMPUS3D est déjà à jour.");
else { fs.writeFileSync(cible, neuf); console.log("Bloc CAMPUS3D greffé (" + bloc.length + " caractères)."); }
