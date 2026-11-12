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

## Suite : le stade en vrai pixel art (prototype, 10/11/2026)

Après la greffe, trois pistes de redessin ont été montrées à l'auteur sur une même tribune (vignette d'album, vrai
pixel art, plan d'architecte). **Il a retenu le vrai pixel art.** Premier jet dans `docs/prototype-stade-pixel.html` :
un moteur `STADEPIX` qui pose chaque pixel sur une grille de 320 x 224, palette fermée de vingt couleurs, contours à
l'encre, aucun filtre. Il reprend les règles de taille de la maquette d'origine (`rangs`, `profondeurs`, virages,
uniformisation) et sait déjà dessiner : les quatre tribunes qui grandissent, les virages, la toiture, les trois
éclairages, l'écran géant, le public selon le remplissage, deux images par seconde.
Corrigé à la demande de l'auteur (11/11/2026) : **les virages sont des coins arrondis** (le tour du stade reprend
`contour()` de la maquette d'origine, profondeur lissée d'une tribune à l'autre), **les projecteurs sont tournés vers la
pelouse** (lampes de face, caisson de dos, tranche de profil, lumière au sol), **l'écran géant pend sous la toiture**.
Ajoutés ensuite : boutique, buvette, restaurant, musée, hôtel et transports, trois niveaux chacun.
Puis, toujours le 11/11 : annexes grossies à la demande de l'auteur (loupe `T`, facteur `G` de 1,4 à 1,9 selon la
capacité), et le stade terminé : kop au virage nord-ouest (drapeaux, tifos, sono), loges, ruban LED, toit rétractable
(ouvert ou fermé), grue et gabarit du rang à venir, six styles de l'histoire sur le mur extérieur.
**Reste à faire** : le centre d'entraînement dans le même style, la carte de livraison, le gabarit cliquable de la
prochaine tribune, et le branchement dans le jeu (`maquetteStade` attend une chaîne SVG, ce moteur dessine dans un
canvas). L'auteur a tranché : le pixel art REMPLACERA la maquette actuelle sur l'écran Club.

## Branché dans le jeu (v2.63)

`node docs/greffe-stade-pixel.cjs .` copie le moteur dans `index.html` (bloc `STADEPIX`). `maquetteStade` rend un canvas,
`peintStades()` le peint après la pose de l'écran Club. Vérifié dans une vraie partie, au téléphone et sur ordinateur.
Harnais verts : stade, général, centre, multiplex. Restent en dessin vectoriel : les cartes de livraison, le choix du
style (`vueVille`) et tout le centre d'entraînement.

## Le centre d'entraînement en vrai pixel art (prototype, 12/11/2026)

`docs/prototype-centre-pixel.html`, moteur `CAMPUSPIX`, frère de `STADEPIX` : même grille de 320 x 224, même façon
de poser les pixels (polygones pleins, contours à l'encre, aucun filtre), palette du stade complétée des matériaux du
campus (brique, tuile, verre, pierre, ardoise, eau, orange de chantier), une quarantaine de couleurs. Même plan que la
maquette d'origine (`docs/prototype-centre.html`) : les quatre terrains, les six familles à trois niveaux et le château,
aux mêmes coordonnées en mètres, pour que la greffe lise le même état. Dessiné : terrain bosselé et friches, herbe,
stabilisé ou synthétique selon l'année, pylônes et lumière au sol, la halle ; préfabriqué, vestiaires en brique, maison
des pros avec terrasse, résidence ; infirmerie, cabinet, clinique avec l'IRM et l'ambulance ; muscu en tôle, balnéo avec
nageurs, laboratoire et cryothérapie ; tableau, magnétoscope, salle vidéo à parabole, cellule d'analyse et ses mâts ;
internat, centre agréé, académie avec la tribune des U17 ; le bois, puis le château, ses douves, sa fontaine. La vie sur
les terrains reprend les séances d'origine (footing, toro, match, slalom des gamins, frappes) à quatre images par
seconde. Un chantier dessine le niveau en orange avec sa grue. Signature : `CAMPUSPIX.rendre(ctx, R, image)`.
**Reste à faire** : le regard de l'auteur, puis le branchement dans le jeu à la place de la maquette du Campus.
