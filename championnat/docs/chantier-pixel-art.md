# Chantier « rétro » : stade et centre d'entraînement

Branche `chantier/pixel-art-stade-centre`. **Seuls les prototypes ont bougé** (`docs/prototype-stade.html`,
`docs/prototype-centre.html`). Rendu validé par l'auteur le 10/11/2026, puis greffé (voir en bas).

## Ce qui a été essayé puis retiré (10/11/2026)

Un filtre qui hachait le dessin en gros pixels, avec tramage et lignes d'écran cathodique. **Refusé par l'auteur** :
« on n'y voit pas grand-chose avec les traits superposés et tous les pixels ». Leçon : on ne pose pas un effet
16 bits par-dessus un dessin vectoriel fin, ça donne du bruit. Ne pas y revenir.

## Ce qui reste

- **Le dessin est net**, comme avant. Le rétro passe par le style : les dégradés lisses deviennent des paliers
  francs (`crans(svg)`, halos en anneaux, ciel en bandes), sans aucun filtre.
- **Animations image par image** (`steps()` en CSS, `calcMode="discrete"` pour les joueurs du campus).
- **Habillage console** (bloc « HABILLAGE CONSOLE 16 BITS » en fin de feuille de style) : cadres à angles droits,
  boutons à biseau, jauges à crans. Pas de lignes d'écran.
- **La carte de livraison du stade se consacre à l'élément livré** (demande de l'auteur : « la carte est surchargée
  à force d'additionner les éléments ») : pour une boutique, une buvette, un restaurant, un musée ou un hôtel,
  `vueVille` cadre serré sur l'élément (table `ELEM`), le stade ne reste qu'en toile de fond.

## Greffe faite (v2.62)

Les deux greffes ont été rejouées dans `index.html`, les animations en `steps()` et le cadre `.maquette` reportés dans
le CSS du jeu, `VERSION` passée à 2.62. Harnais verts : stade, centre, multiplex, coupes, Europe et le harnais général.
L'habillage du pupitre des prototypes (boutons à biseau, jauges à crans) n'a pas d'équivalent dans le jeu : le pupitre
est un outil de prototype. Seul le cadre des maquettes a été porté.
