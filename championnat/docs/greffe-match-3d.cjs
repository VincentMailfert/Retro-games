/* Greffe du MATCH EN MAQUETTE 3D dans le jeu.
   Recopie le bloc compris entre « MATCH3D : DÉBUT » et « MATCH3D : FIN » de docs/prototype-match-3d.html dans
   index.html, au même endroit à chaque passe (juste avant `let STD=null;` la première fois, puis entre les marqueurs).
   Rejouable et idempotent : deux passes donnent le même fichier. On ne touche jamais le bloc dans index.html :
   on retouche le prototype, puis on relance ce script.
   Usage, depuis championnat/ :  node docs/greffe-match-3d.cjs */
const fs = require("fs"), path = require("path");
const RACINE = path.join(__dirname, "..");
const DEBUT = "/* ---- MATCH3D : DÉBUT ----", FIN = "/* ---- MATCH3D : FIN ---- */";
const proto = fs.readFileSync(path.join(__dirname, "prototype-match-3d.html"), "utf8");
const a = proto.indexOf(DEBUT), b = proto.indexOf(FIN);
if (a < 0 || b < a) throw new Error("Marqueurs MATCH3D introuvables dans le prototype");
const bloc = proto.slice(a, b + FIN.length).replace(/\r\n/g, "\n");
if (/<\/script/i.test(bloc)) throw new Error("Le bloc contient une fin de script : il casserait le jeu");

const cible = path.join(RACINE, "index.html");
const html = fs.readFileSync(cible, "utf8");
let neuf;
const x = html.indexOf(DEBUT), y = html.indexOf(FIN);
if (x >= 0 && y > x) neuf = html.slice(0, x) + bloc + html.slice(y + FIN.length);
else {
  const ancre = "\nlet STD=null;";
  const k = html.indexOf(ancre);
  if (k < 0) throw new Error("Ancre « let STD=null; » introuvable dans index.html");
  neuf = html.slice(0, k + 1) + bloc + "\n" + html.slice(k + 1);
}
if (neuf === html) console.log("Rien à changer : le bloc MATCH3D est déjà à jour.");
else { fs.writeFileSync(cible, neuf); console.log("Bloc MATCH3D greffé (" + bloc.length + " caractères)."); }
