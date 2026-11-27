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

## Les joueurs animés (prototype du 14/11/2026, branche chantier/joueurs-3d)

Inspiration : un reel de vib3coded (stade de foot en 3D isométrique pixel art). L'auteur : « c'est surtout l'animation
des joueurs que je trouve cool ». Dans le prototype seulement, pas encore greffé :

- des figurines articulées (genoux, coudes, buste qui pivote aux hanches), cinq coiffures, chaussettes et crampons ;
- des allures : à l'arrêt on respire et on suit le ballon des yeux, puis marche, trot, sprint (foulée plus longue,
  buste penché, bras pliés), freinage (buste qui se redresse), virages (corps incliné), pivot en douceur ;
- la frappe (jambe qui arme puis fouette) à chaque passe et au départ de chaque tir, le saut de la tête quand le
  ballon est haut, le gardien en position d'attente quand le ballon approche, bras tendus dans le plongeon ;
- des ombres en pixels, longues, dans l'axe de la lumière (plus d'ombres calculées sur les joueurs), et une ombre du
  ballon qui rapetisse quand il monte ; le ballon roule dans le sens du jeu.

La greffe a été essayée sur une copie : `harness-match3d.cjs` reste vert.

## L'entrée des équipes et l'arbitre (v2.93, greffés avec les joueurs animés)

Choix de l'auteur du 14/11/2026 (« 1a et 2c ») : brancher les joueurs animés dans le jeu, et ajouter l'entrée des
équipes et un arbitre. Deux files sortent de la tribune d'en face derrière l'arbitre (ballon sous le bras), se rangent
de part et d'autre de la ligne médiane, se tournent vers la caméra et saluent, puis courent à leurs places quand la ligne
du coup d'envoi est tombée. L'arbitre suit ensuite le jeu en diagonale et lève le bras sur les cartons.

## Le bord du terrain et les célébrations (v2.94)

Choix de l'auteur du 14/11/2026 (« 2a et 2b »). Abris, remplaçants assis, entraîneurs qui vivent le match, et six fêtes
de but tirées au hasard : poing, avion, glissade à genoux, salto, berceau, pile humaine. Pour en essayer une dans le
prototype : `window.__fete='berceau'` dans la console avant le but.

## Retours de partie du 16/11/2026 (v2.99)

Quatre retours de l'auteur après plusieurs matchs. **La question du banc en plein écran** : elle s'ouvrait derrière le
match, invisible, et le direct attendait sa réponse pendant que les joueurs couraient dans le vide. Le plein écran prend
maintenant toute la page, et les fenêtres du jeu (`#fiche`, `#msgbox`, `#butFlash`) passent devant. **Le filet** : la
texture quadrillée se brouillait en motifs de loin ; c'est désormais un voile blanc léger barré de vrais traits espacés
d'un mètre et demi. **Les gardiens couchés au coup de sifflet** : un plongeon ne survit plus à l'action qui l'a lancé
(`releveGardiens`, et un garde-fou à chaque image). **Les frappes de loin et les lobs** : le drapeau `ph` du moteur passe
avant les mots de la ligne, la frappe de loin part de 25 à 32 mètres, le lob a sa propre mise en scène (gardien sorti à
dix-huit mètres de sa ligne, ballon très haut, gardien qui court vers sa cage sans plonger), et les moments-buts de la 90e
(`but50`, `geste`, `cagade`, `cadeau`, `gkbut`) sont enfin joués sur la pelouse : le but de cinquante mètres avec gardien
monté, le gardien qui monte sur le corner et marque. Côté moteur, quatre lignes de frappe lointaine et de lob s'ajoutent à
`BUT_LOIN`, `ARRET_LOIN`, `BUT_LOB` et `ARRET_LOB`, pour qu'on en voie plus souvent.

## L'image d'accord avec le texte, et les trois plans (v3.14, branche chantier/accord-image-texte)

Doute de l'auteur du 18/11/2026 : courir après de belles animations est-il vain ? Décision : **on gèle les gestes**, et
on ne travaille plus que l'accord entre l'image et le commentaire. Quand la scène ne sait pas montrer ce que dit la ligne,
elle montre moins, jamais autre chose.

Le constat de départ, sur un PSG-Nantes : « N'Doram place son corner au point de penalty... le gardien repousse du poing »
montrait un penalty. En passant toutes les phrases du moteur dans le lecteur de lignes, on trouvait la même famille
d'erreurs partout : « second poteau » lu comme un poteau, « termine » comme une mine, une passe trop appuyée montrée
comme une frappe de vingt-cinq mètres, un sauvetage de défenseur montré comme un arrêt du gardien, un carton pour
contestation montré comme un tacle.

- **Le moteur dit la famille** : `sc` sur l'évènement (`meurt`, `sauve`, `hj`, `poteau`, `refuse`, `cf`, `corner`).
- **La scène lit l'étiquette d'abord**, puis les mots pour l'issue. Genres nouveaux : `meurt` (aucun tir), `bloque`
  (défenseur ou mur), `refuse` (au fond, bras levé de l'arbitre), carton `sec` (sans tacle).
- **Trois plans** : large et presque fixe sur les temps morts, moyen sur une action ordinaire, gros plan pour le but, le
  poteau, le rouge et le penalty.
- **Le jeu calme entre deux lignes** : moins de tacles, plus de chute que personne ne raconte.

Pour vérifier une famille à l'œil : fabriquer une page d'essai avec une ligne de chaque sorte, puis regarder.
Le garde-fou est `node harness-accord3d.cjs`.


## Les vrais stades (prototype du 27/11/2026, branche chantier/vrais-stades, PAS greffé dans le jeu)

Question de l'auteur : « est-ce qu'on est capable de reproduire le stade de chaque club, genre le Parc des Princes ? »,
avec une crainte : ne pas lancer un gros travail qu'il faudrait refaire. Réponse : on ne refait rien, on ajoute une
**fiche par club** que le moteur de toujours sait lire. Décision de l'auteur : le vrai stade est le **point de départ**
de la partie (« on retrouve le stade dès la première journée »), il grandit ensuite avec les travaux.

- `o.stade.forme` (facultative) règle les pièces existantes : `rangs` [N, S, E, O], `arrondi` (virages en vraie courbe),
  `etages` (1 ou 2, avec un balcon clair), `toits` par côté (`plat`, `incline`, `aucun`), `couv`, `poutres` (charpente
  apparente), les couleurs (`coulToit`, `coulCharpente`, `coulLisere`, `coulMur`, `coulBalcon`, `coulPortique`), `kop`
  (drapeaux sans virages), et deux signes distinctifs : `portiques` (les lames de béton du Parc des Princes) et `riviere`.
- **Sans fiche, rien ne change** : vérifié pièce par pièce sur les huit paliers de `prototype-stade-3d.html` (mêmes
  géométries, mêmes places, mêmes couleurs avant et après la retouche).
- `docs/prototype-vrais-stades.html` (moteur recopié par `node docs/construit-vrais-stades.cjs`) : trois fiches, Parc des
  Princes, Geoffroy-Guichard, Saint-Symphorien, version années 90 **dessinée de mémoire, à corriger sur photos d'époque**.
  « Jeu aujourd'hui » montre le stade déduit de la seule capacité, pour comparer. Le bouton jaune agrandit une tribune.
- **Deuxième lot (27/11/2026 au soir, l'auteur : « c'est top », « fais-le pour les autres stades les plus connus »)** :
  seize stades dans la page, rangés par pays. France : Parc des Princes, Vélodrome, Geoffroy-Guichard, Bollaert, Beaujoire,
  Gerland, Louis-II, Parc Lescure, Saint-Symphorien. Angleterre : Old Trafford, Anfield, Highbury. Italie : San Siro,
  Delle Alpi, Olimpico, Luigi Ferraris. Pièces ajoutées : `piste` (piste d'athlétisme, les tribunes reculent de 7 m),
  `tours` (rondes et cerclées avec les grandes poutres rouges de San Siro, ou carrées dans les coins de Marassi),
  `arches` (les portes de Gerland), `arcades` (les arches de Louis-II), et plus de toit de virage entre deux tribunes dont
  l'une est découverte. Codes et capacités repris de `CLUBS`, `CLUBS_ANG`, `CLUBS_ITA`.
- **Les virages (question de l'auteur)** : une fiche dit si le stade part fermé (`virages:1`, le projet « Virages » est alors
  déjà fait et le kop est disponible) ou à l'anglaise (`virages:0`, `forme.kop` autorise les drapeaux derrière le but sans
  virages). Le projet « Virages » du jeu ferme alors les quatre coins à la hauteur de la plus basse des deux tribunes
  voisines, en gardant toits, charpente et couleurs de la fiche ; les tours carrées des coins disparaissent. Le bouton
  « Construire les virages » de la page le montre.
- **Reste à faire si l'auteur valide** : une table `STADES_VRAIS` par code de club dans le jeu, lue par `inferStade` au départ
  de la partie ; passer `forme` au direct et à la vitrine ; dire comment les travaux du joueur font grandir chaque fiche
  (`ST.rangs` passe déjà devant `forme.rangs`) ; des fiches par époque pour les stades rénovés.
- **Le lissage (`o.lisse`, 27/11/2026, PAS greffé, à choisir par l'auteur)** : sur téléphone, la carte du stade ne fait qu'environ
  225 pixels de jeu de large ; une lame de béton ou une ligne de la pelouse y est plus fine qu'un pixel, elle s'allume et
  s'éteint quand le stade tourne. `o.lisse` (2 à 4) garde la même grille de pixels mais fait de chacun la moyenne de
  lisse × lisse points (rendu dans une cible plus grande, puis réduit). La page d'essai compare « Actuel » (pixels 1,5),
  « Lissé » (pixels 1,5, lisse 3) et « Fin et lissé » (pixels 1, lisse 2). Sans `o.lisse`, le rendu de toujours.
