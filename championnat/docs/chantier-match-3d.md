# Chantier : le match en maquette 3D

Point de départ : un reel Instagram (jeu de tennis « Love All », court posé sur une île flottante, rendu 3D affiché
en gros pixels). L'auteur a validé le 13/11/2026 un premier test, puis le réglage de pixels « Fins » (un pixel de jeu
pour 1,5 pixel d'écran), et a demandé de brancher la scène sur les vrais matchs du jeu.

## Ce qui existe

- `docs/prototype-match-3d.html` : la maquette, autonome (Three.js 0.160 chargé depuis jsDelivr, rien d'autre).
  Stade sur son île, tribunes et public, toit et écran géant, pylônes, club-house, jour, soir, nuit, pluie, neige,
  brouillard. Les onze de la feuille de match en figurines, aux couleurs des blasons (`BLASONS`), le visiteur inverse
  les siennes si elles ressemblent trop à celles du club qui reçoit, comme au direct du jeu.
- `docs/construit-match-3d.cjs` : remplit la page avec trois VRAIS matchs du moteur (`simuleMatch` en mode verbeux,
  celui du direct). Depuis `championnat/` : `node docs/construit-match-3d.cjs`. Rejouable.

## Le principe : la scène ne décide de rien

Le moteur reste le seul maître. La scène lit le fil du direct, une ligne toutes les 2,3 s comme au jeu (vitesse
« Normale »), et met en scène chaque ligne :

- **Entre deux lignes**, les équipes se passent le ballon dans leur formation (lue dans le onze : autant de lignes que
  de postes). Personne ne tire jamais : un tir, un but ou un carton ne vient QUE d'une ligne du moteur.
- **Une ligne d'occasion, de but ou de carton** devient une petite action. Elle démarre quand la ligne précédente
  s'affiche, et le ballon arrive au fond, dans les gants ou à côté au moment exact où la ligne tombe au fil.
  Le camp vient de `g.cote`, `q.cote`, `c.cote` ou du code entre parenthèses en fin de ligne ; le joueur, du nom cité.
- **La forme de l'action** suit la phase du tir (`ph`) ou le texte : centre et tête, débordement (`aile`), frappe de
  loin, coup franc avec le mur, corner en deux temps (annonce `ca`, puis la suite), face-à-face, lob, combinaison,
  penalty. **L'issue** suit l'icône et le texte : but (filet qui tremble, buteur au poteau de corner, son virage qui
  saute), arrêt (plongeon), à côté (six mètres), poteau ou barre (rebond), hors-jeu, ballon perdu, carton (faute,
  joueur au sol, carton au-dessus du fautif, le rouge quitte la pelouse).
- **La mi-temps** inverse les côtés. **La météo** vient de la ligne du coup d'envoi (`METEO_MATCH.ouv`).

## La greffe (faite en v2.89, branche chantier/match-3d)

Le bloc MATCH3D du prototype est recopié dans `index.html` par `node docs/greffe-match-3d.cjs`, juste avant `let STD=null;`.
Le collage du jeu (`match3dOuvre`, `match3dLigne`, `match3dAnnonce`, `match3dSuite`, `match3dFerme`) est décrit dans
`CLAUDE.md`, section « LE MATCH EN MAQUETTE 3D ». Pour faire évoluer la scène : retoucher le prototype, l'essayer, relancer
la greffe, puis `node harness-match3d.cjs`.
