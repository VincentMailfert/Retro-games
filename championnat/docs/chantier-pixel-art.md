# Chantier « pixel art 16 bits » : stade et centre d'entraînement

Branche `chantier/pixel-art-stade-centre`. **Seuls les prototypes ont bougé** (`docs/prototype-stade.html`,
`docs/prototype-centre.html`) et les deux scripts de greffe, qui exportent désormais `calePixels`.
`index.html` n'est pas touché : la greffe dans le jeu reste à faire, une fois le rendu validé.

## Ce qui change dans les prototypes

Le dessin reste celui d'avant, en SVG vivant. Il passe désormais par un filtre (`filtrePixel`) qui le découpe en gros
pixels, le trame et réduit sa palette. Les animations et les zones cliquables marchent toujours dessous.
`calePixels(racine)` cale la grille sur les pixels de l'écran, puis surveille chaque maquette pour se recaler seule.
Les animations passent en image par image (`steps()` en CSS, `calcMode="discrete"` pour les joueurs du campus) :
c'est plus rétro, et le filtre ne se recalcule que quelques fois par seconde.
L'habillage (bloc « HABILLAGE CONSOLE 16 BITS » en fin de feuille de style) refait le cadre en écran cathodique,
les boutons en touches à biseau, les jauges à crans et la carte de livraison.

## Ce qu'il faudra faire dans le jeu, au moment de la greffe

1. Relancer `node docs/greffe-stade.cjs .` puis `node docs/greffe-centre.cjs .` depuis `championnat/`.
2. Appeler `STADE3D.calePixels(el)` et `CENTRE3D.calePixels(el)` juste après chaque pose d'une maquette ou d'une
   carte de livraison dans la page (`maquetteStade`, `maquetteCentre`, `ouvreLivraison`, `ouvreLivraisonCentre`,
   aperçu du choix de style). Sans cet appel le rendu marche, mais la grille peut baver.
3. Reporter dans le CSS du jeu les animations en `steps()` (`.feu`, `.eclat`, `.defile`, `.vapeur`, et pour le
   centre `.arrive`, `.brume`, `.jet`, `.cEclat`, `.cVapeur`, `.bob`, `.vv`) et l'habillage du cadre et des boutons.
4. Relancer `harness-stade.cjs` et `harness-centre.cjs` (verts sur une copie d'essai avec la greffe).

## À vérifier sur de vrais appareils

Testé sous Chrome seulement (ordinateur et gabarit téléphone). Le filtre repose sur `feTile` et `feMorphology` :
à contrôler sur iPhone (Safari) avant de publier.
