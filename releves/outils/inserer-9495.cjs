// Insère ANG 1994-95 dans championnat/index.html (à partir de 9495.json produit par assemble.cjs).
"use strict";
const fs = require("fs"), path = require("path");
const R = process.argv[2];
const S = JSON.parse(fs.readFileSync(path.join(__dirname, "9495.json"), "utf8"));
const f = path.join(R, "championnat", "index.html");
let h = fs.readFileSync(f, "utf8");
const CRLF = h.includes("\r\n"); h = h.replace(/\r\n/g, "\n");
const remplace = (avant, apres) => { if (h.split(avant).length !== 2) throw new Error("ancre introuvable ou multiple : " + avant.slice(0, 60)); h = h.replace(avant, apres); };

// 1) la version
remplace('const VERSION = "2.06";', 'const VERSION = "2.07";');

// 2) les prénoms neufs, en tête de table comme ceux de 1993-94
const pr = S.prenoms.slice().sort((a, b) => a[0].localeCompare(b[0]));
let lignes = [], l = " ";
for (const [n, p] of pr) { const e = `"${n}":"${p}", `; if ((l + e).length > 100) { lignes.push(l.trimEnd()); l = " "; } l += e; }
if (l.trim()) lignes.push(l.trimEnd());
const vides = pr.filter(x => !x[1]).length;
remplace("const PRENOMS_VRAIS={\n", "const PRENOMS_VRAIS={\n" + ` /* ANG 1994-95 (v2.07) : ${pr.length} prénoms neufs, ${vides ? vides + " vides" : "aucun vide"} */\n` + lignes.join("\n") + "\n");

// 3) les tables de la saison, juste après celles de 1993-94
const entete = `/* ANG 1994-95 (v2.07) : « Walker a payé ». Assemblée en séance le 23/10/2026 à partir du relevé
   releves/ANG-1994-95 (Transfermarkt, identifiants de releves/clubs-tm.json). La Premier League comptait
   vingt-deux clubs, la dernière fois : Leicester et Ipswich, les deux derniers, s'effacent. L'échelon du
   dessous en comptait vingt-quatre : Notts County, Swindon et Port Vale ne remplissent pas leur effectif en
   vrais joueurs présents au coup d'envoi, ni Stoke, onzième ; Grimsby, que la source perd sur cette seule
   saison, est reconstitué (saisons encadrantes, neilbrown, Wikipedia). Notes : ${S.journal.herit.prec} héritées de 1993-94
   vieillies d'un an, ${S.journal.herit.suiv} par la moyenne rajeunie/calculée depuis 1995-96, ${S.journal.herit.loin} depuis une saison plus
   lointaine, ${S.journal.herit.vivier} depuis le recruteur de l'été 1994, ${S.journal.herit.calc} calculées ; cinq ajustements à la main (Shearer,
   Klinsmann, Fowler, Flowers, Sutton). Graphie du jeu imposée (E. Cantona, A. Cole, R. Keane). Cinq clubs
   du dessous n'ont que dix-sept hommes et quelques-uns un seul gardien : c'est la source, rien n'est inventé. */
`;
const ancreTables = h.match(/const D2_ANG9394=\[[^\]]*\];\n/)[0];
remplace(ancreTables, ancreTables + entete + S.texteStars);

// 4) l'entrée du registre, après celle de 1993-94
const SOUS = "Blackburn Rovers est champion d'Angleterre pour la première fois depuis 1914, et c'est l'argent de Jack Walker, l'industriel de l'acier enfant du club, que Kenny Dalglish a fait fructifier : Alan Shearer marque trente-quatre buts, Chris Sutton, recrue record de l'été, en ajoute quinze, et la presse les appelle SAS. Le titre se joue le dernier jour : Blackburn perd à Anfield, mais Manchester United ne fait que match nul à West Ham et finit à un point. United avait pourtant payé sept millions de livres en janvier pour Andy Cole, qui en marquera cinq contre Ipswich dans un 9-0 au mois de mars ; mais le 25 janvier, à Selhurst Park, Eric Cantona saute à pieds joints sur un supporter de Crystal Palace, et il ne rejouera plus de la saison. Jürgen Klinsmann, arrivé de Monaco à Tottenham, est élu joueur de l'année par la presse, Shearer par ses pairs, et Robbie Fowler meilleur espoir. Everton bat Manchester United en finale de la FA Cup, Liverpool gagne la Coupe de la Ligue, et Arsenal perd sa Coupe des Coupes en finale sur un lob de cinquante mètres de Nayim. En deuxième division, Middlesbrough de Bryan Robson est champion et Bolton monte par les barrages ; Reading, deuxième, reste en bas, car la Premier League passe à vingt clubs et une seule place est directe. La Premier League comptait vingt-deux clubs : les deux derniers s'effacent. L'échelon du dessous en comptait vingt-quatre, et les quatre écartés ne sont pas les quatre derniers : Stoke, onzième, ne peut pas remplir son effectif en vrais joueurs.";
const e93 = h.indexOf(' "ANG-1993-94":{'), finE93 = h.indexOf("\n", h.indexOf("\n", e93) + 1) + 1;
const entree = ` "ANG-1994-95":{ pays:"ANG", an:1994, titre:"1994-95", nom:"Walker a payé", d1:D1_ANG9495, d2:D2_ANG9495, starsD1:STARS_ANG9495, starsD2:STARS_D2_ANG9495, euroC1:["MUN"], euroC2:["CHE","ARS"], euroC3:["BLB","NEW","AVL"],\n   sous:${JSON.stringify(SOUS)} },\n`;
if (!h.slice(e93, finE93).trimEnd().endsWith("},")) throw new Error("l'entrée 1993-94 ne finit pas comme prévu : " + h.slice(finE93 - 40, finE93));
h = h.slice(0, finE93) + entree + h.slice(finE93);
fs.writeFileSync(f, CRLF ? h.replace(/\n/g, "\r\n") : h);
console.log("inséré :", pr.length, "prénoms,", Object.keys(S.stars1).length + Object.keys(S.stars2).length, "clubs");
