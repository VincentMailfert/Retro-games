# Enrichissement du téléscripteur — lot 1

**LOT 1 INTÉGRÉ** dans `index.html`. Ce document reste utile pour deux raisons :
la **méthode d'extraction** (§1, réutilisable pour tout futur lot) et les
**fréquences mesurées sur corpus réel** (§2), qui ont servi de réglages.

---

## 1. Comment lire un live EN ENTIER (méthode, réutilisable)

### SoFoot
Rien à faire : la page rend **tout le match** au premier chargement (~75 messages).
Le bouton « Afficher tous les messages » est un leurre, le contenu est déjà là.
Extraction : découper `document.body.innerText` sur le motif de minute `\n(\d{1,3})e\n`.

### L'Équipe
La page n'affiche que les ~20 dernières minutes et ne charge rien au défilement
(le mur de cookies pose `no-scroll` sur `<html>`, et de toute façon le reste ne vient pas du scroll).
En revanche la page appelle une **API interne** qui contient le match entier :

```
https://sdwh.lequipe.fr/iPhoneDatas/EFR/STD/ALL/V1/Football/Commentaires/<2 derniers chiffres de l'id>/<id>.json
```

Exemple : match `690263` → `.../Commentaires/63/690263.json`
L'identifiant est le dernier segment de l'URL du live.

Chaque entrée expose : `libelle_info` (la minute), `picto_web` (**le type d'événement**),
`temps_fort` (booléen), `titre`, `texte`. C'est la mine : le type est déjà étiqueté.

---

## 2. Ce que dit le corpus

**Corpus** : 9 matchs L'Équipe (J1 de L1) = **833 entrées**, minute 1 → coup de sifflet.
Plus 4 lives SoFoot (Rennes-PSG, OM-Strasbourg, Fenerbahçe-Lyon, Lens-PSG).

### Densité
**~92 entrées par match.** Notre moteur en produit une fraction. Même sans rien changer
au calibrage, il y a de la place pour tripler le volume de texte.

### Fréquences par match (réglages directement transposables)
| Événement | par match |
|---|---|
| corner | 3,9 |
| carton jaune | 3,1 |
| but | 2,8 |
| coup franc | 2,2 |
| blessure / soin | 1,6 |
| temps additionnel | 1,4 |
| hors-jeu | 1,1 |
| carton rouge | 0,3 |
| penalty | 0,3 |
| poteau / barre | 0,2 |

### Le gisement : 54 % du live est du texte courant
Répartition des mécaniques dans ces 448 entrées :
1. **sauvetage défensif** (le premier poste) — tacle, retour, interception, dégagement sur la ligne
2. **parade de gardien** — claquette, horizontale, sortie, ballon capté
3. **centre / débordement** — le couloir, la remise, le centre en retrait
4. **état du match** — qui pousse, qui recule, le rythme qui retombe
5. occasion manquée, duel/percée, ambiance, arbitrage, poteau, frappe lointaine

**Conclusion** : nos familles existantes couvrent le tir et le carton. Il manque tout
le reste du football — ce qui se passe entre deux frappes.

---

## 3. Contraintes d'écriture (rappel)
- Chaque ligne est **autonome** (le moteur pioche au hasard, aucune continuité possible).
- Jetons : `{A}` (joueur concerné), `{G}` (« le gardien »), `{D}` (club adverse).
  **Pas de `{B}`** — jamais de second joueur nommé.
- **Époque 1995-96** : pas de VAR ni d'arbitrage vidéo, pas de xG, pas de « bloc bas » ni de
  « pressing haut », c'est la D1 et pas la Ligue 1, pas de carton à un entraîneur (c'est la
  tribune), la passe en retrait au gardien est interdite à la main depuis 1992.

---

## 4. LES DEUX REGISTRES

Le corpus oppose deux voix, et le jeu gagnerait à avoir les deux :

- **Reporter** (voix L'Équipe) : la mécanique de l'action, précise, sans effet.
- **Chambreur** (voix SoFoot) : l'ironie, la digression, le décalage.
  **Attention** : on garde le *procédé* comique de SoFoot (le deadpan, l'absurde, l'aparté
  pop) mais **jamais ses références**, qui sont modernes. On transpose en 1995 : le Minitel,
  le magnétoscope, Téléfoot, les Guignols, la Safrane, la moustache, le walkman, le Mondial 98
  dont on rêve encore.

Les lignes ci-dessous sont marquées `[R]` reporter ou `[C]` chambreur.
Un mélange ~70/30 semble le bon dosage : le chambreur perd son sel s'il tombe trop souvent.

---

# A. NOUVELLES FAMILLES

## `sauve` — le sauvetage défensif *(premier poste du corpus, absent du jeu)*
Convention : `{A}` = **l'attaquant qui a tenté** (le sauveur reste anonyme).

1. [R] Le centre traverse toute la surface, {A} n'a plus qu'à pousser... SAUVÉ SUR LA LIGNE ! Un défenseur sorti de nulle part !
2. [R] {A} croit conclure du bout du pied... un crampon adverse traîne et détourne en corner !
3. [R] Tête piquée de {A}, le gardien est battu... et un défenseur dégage sous la barre ! Le stade avait déjà crié but !
4. [R] {A} arme dans la surface... contré par un tacle providentiel ! Le défenseur y est allé de tout son corps.
5. [R] {A} déborde et s'apprête à conclure... retour héroïque d'un défenseur qui le tacle proprement, ballon en touche !
6. [R] Le ballon traîne devant la ligne, {A} tend la jambe... dégagé en catastrophe par la défense de {D} ! Ça sentait le roussi.
7. [R] {A} pense avoir fait le plus dur... mais un défenseur de {D} surgit et détourne du crâne ! Le sauvetage du siècle, rien de moins !
8. [R] Le portier avait relâché, {A} suit... un défenseur arrive à fond de train et dégage en tribune ! Ouf pour les siens.
9. [C] {A} est à deux mètres du but vide. Un défenseur de {D} se transforme en gardien de but, en mur de Berlin et en pompier volontaire dans le même geste : dégagé !
10. [C] {A} n'en revient pas : il avait tout bien fait, et un défenseur a mis le tibia là où il ne fallait pas. Le football est une science cruelle.
11. [C] Sauvetage sur la ligne devant {A} ! Le défenseur se relève et hurle sur tout le monde, histoire de faire croire que c'était prévu.

## `corner` — le coup de pied de coin *(3,9 par match dans le corpus)*
Convention : `{A}` = **le tireur du corner**.

1. [R] Corner pour {D}, le centre fuse au second poteau... et finit dans les gants du gardien, tranquille.
2. [R] {A} place son corner au point de penalty... la défense sort le poing et éloigne le danger.
3. [R] Corner de {A}, tout le monde saute, personne ne touche... et ça ressort de l'autre côté !
4. [R] {A} tire son corner à ras de terre au premier poteau... dévié, mais ça file juste à côté !
5. [R] Corner de {A}, mêlée furieuse dans les six mètres... et l'arbitre siffle une faute sur le gardien.
6. [R] {A} s'installe au drapeau, prend son temps... son centre est trop long, ça sort directement en six mètres.
7. [R] Corner rentrant de {A} : le gardien sort dans les airs et cueille le ballon à deux mains. Autorité totale.
8. [C] {A} joue le corner à deux. On se fait des passes, on cherche l'ouverture, on réfléchit... et on perd le ballon. Le banc a fermé les yeux.
9. [C] Corner de {A}. Les grands montent, les petits font semblant de marquer quelqu'un, et le ballon file directement en six mètres. Un classique du genre.

## `hj` — le hors-jeu *(1,1 par match, absent du jeu)*
Convention : `{A}` = **l'attaquant signalé**.

1. [R] {A} part au but, seul... le drapeau se lève ! Hors-jeu d'une demi-semelle, et le banc de {D} respire.
2. [R] Superbe ouverture pour {A}, qui va au bout et loge le ballon au fond... mais le juge de touche avait tranché depuis longtemps.
3. [R] {A} croit ouvrir le score... hors-jeu ! Il conteste, il montre la ligne, il lève les bras : rien n'y fait.
4. [R] Le drapeau se lève sur la percée de {A}. À la vitesse où il courait, il n'aurait pas fallu grand-chose.
5. [C] {A} est signalé hors-jeu. Le stade siffle le juge de touche, le juge de touche regarde ailleurs : chacun son métier.
6. [C] Hors-jeu pour {A}, et de très peu. Un jour on aura une machine pour trancher ces choses-là ; en attendant, c'est un monsieur avec un drapeau, et il a toujours raison.

## `soin` — le choc et l'infirmerie *(1,6 par match)*
Convention : `{A}` = **le joueur touché**.

1. [R] {A} reste à terre après un choc à la tête. Le soigneur arrive avec l'éponge magique et le bidon.
2. [R] Choc violent entre {A} et son vis-à-vis : les deux restent au sol, l'arbitre arrête le jeu.
3. [R] {A} prend le dégagement en pleine figure à bout portant ! Il met un moment à retrouver ses esprits.
4. [R] {A} se tient la cuisse et grimace. Il fait signe au banc : ça sent le remplacement.
5. [C] {A} se relève en boitant, refuse de sortir, repart en clopinant et fait un signe rassurant à son banc. Personne n'est rassuré.
6. [C] Éponge magique sur {A}, spray glacé, deux tapes dans le dos, et le voilà reparti. La médecine du sport a fait des progrès fulgurants depuis dix minutes.

## `etat` — l'état du match *(CONDITIONNÉ, pas tiré au hasard)*
La vraie nouveauté de structure. Ces lignes ne se piochent que si l'état du match le justifie.
Forme proposée : un tableau `{cond(ctx), lignes:[…]}` avec `ctx = {m, sh, sa, jeMene}`.
Aucun effet moteur — purement décoratif, donc calibrage intact.

### `pousseEgaliser` — je suis mené, m ≥ 70
1. [R] Tout le monde est monté, même les défenseurs. On joue à une seule cage désormais.
2. [R] Les minutes filent et le ballon repart toujours devant. Ça sent la dernière cartouche.
3. [R] Le public s'est levé et pousse. Il reste peu de temps, et tout le monde le sait.
4. [C] On balance de longs ballons devant en espérant un rebond favorable. Ce n'est plus du football, c'est de la loterie — et on n'a jamais rien gagné au tirage.

### `defendAvance` — je mène, m ≥ 75
1. [R] Tout le monde est derrière le ballon, on défend à onze et on dégage loin devant.
2. [R] Le banc hurle de reculer, de tenir, de ne rien lâcher. Les dernières minutes vont être longues.
3. [R] On garde le ballon dans le coin du terrain, on gagne des secondes, et les sifflets d'en face montent.
4. [C] Le gardien met un temps invraisemblable sur chaque dégagement. L'arbitre le rappelle à l'ordre avec la fermeté d'un homme qui aimerait bien rentrer chez lui aussi.

### `nulSerre` — score nul, m ≥ 75
1. [R] Personne ne veut perdre, personne n'ose gagner. Le match se ferme comme une huître.
2. [R] Le match est tendu, chaque duel se gagne au chausson. Un rien fera la différence.
3. [C] Les deux équipes se regardent, le ballon circule sans jamais avancer. On sent qu'un point arrangerait tout le monde, y compris le public, qui pense déjà au parking.

### `large` — écart ≥ 3 buts
1. [R] L'écart est fait, le match a perdu de son sel. On joue les figurants.
2. [R] Le banc fait tourner, on donne du temps de jeu aux jeunes. La messe est dite.
3. [C] Têtes basses d'un côté, petits ponts gratuits de l'autre. Le public commence à siffler, et il a raison.

### `mou` — 55 ≤ m ≤ 75, rien depuis longtemps
1. [R] Le jeu se fait décousu, les passes se perdent, les jambes sont lourdes des deux côtés.
2. [R] Rien à signaler depuis un moment. Le ballon fait des allers-retours au milieu, et l'ambiance retombe.
3. [C] Long temps mort. Les entraîneurs font passer des consignes, les joueurs hochent la tête, et personne ne changera quoi que ce soit.

### `reprise` — 46 ≤ m ≤ 50
1. [R] Retour des vestiaires, et on sent que ça a parlé fort à la pause : le rythme est tout autre.
2. [R] Les vingt-deux acteurs reviennent sur la pelouse. Un changement de chaque côté, ça va s'expliquer.

### `sonne` — juste après un but encaissé
1. [R] Le but a fait mal. On voit des joueurs les mains sur les hanches et des regards qui s'évitent.
2. [C] Le stade est sonné. Quelque part dans les tribunes, quelqu'un remet sa écharpe dans son sac.

### `bouillant` — juste après un but marqué
1. [R] Le stade est en feu ! Les tambours ont repris, on ne s'entend plus.
2. [R] L'ambiance est montée d'un cran, le public pousse et l'équipe le sent.

---

# B. RENFORTS DES FAMILLES MAIGRES

## `cr` — carton rouge (6 → 12)
1. [R] ROUGE ! {A} règle un compte loin du ballon, l'arbitre n'a rien manqué. Vestiaire.
2. [R] {A} retient l'attaquant par le maillot alors qu'il filait au but : faute du dernier défenseur, c'est ROUGE.
3. [R] ROUGE ! Le tacle de {A} arrive en retard, très en retard, et par-derrière. Personne ne discute celui-là.
4. [C] CARTON ROUGE POUR {A} ! Le coude est parti tout seul, paraît-il. L'arbitre n'a pas cette lecture des faits.
5. [C] Rouge pour {A} ! Il a poussé l'arbitre du doigt — un doigt de trop. Ses coéquipiers l'écartent avant qu'il n'invente pire.
6. [C] Deuxième jaune pour {A}, pour une simulation grossière... et donc ROUGE ! Tomber tout seul et se faire expulser : il faut le faire.

## `cj` — carton jaune (8 → 16)
1. [R] {A} arrête le contre d'une faute cynique au milieu : jaune, et c'est de bonne guerre.
2. [R] Tacle glissé de {A}, un peu haut, un peu tard : l'arbitre s'approche, dialogue deux secondes, puis sort le jaune.
3. [R] Coup de coude discret de {A} dans un duel aérien. L'arbitre l'a vu, lui : avertissement.
4. [R] {A} envoie son adversaire dans le panneau publicitaire ! Jaune, et une main tendue pour se faire pardonner.
5. [C] Simulation de {A} dans la surface ! Personne n'y a cru, sauf lui. Jaune, et le public d'en face jubile.
6. [C] {A} met les mains sur le ballon pour empêcher le coup franc rapide. Jaune pour l'astuce — c'était bien tenté, mais ça se voit depuis la tribune d'honneur.
7. [C] {A} fait un pas de trop vers l'arbitre et entreprend de lui expliquer son métier. L'arbitre lui explique le sien : jaune.
8. [C] {A} traîne à sortir au moment du changement. Il marche comme s'il traversait un champ de betteraves : jaune pour perte de temps.

## `cjGK` — faute de gardien, jaune (3 → 6)
1. [R] {A} sort de sa surface et contrôle de la main, croyant être dedans. Il n'y était pas : avertissement.
2. [C] {A} s'assoit sur le ballon pour gagner du temps, sourire aux lèvres. L'arbitre ne rit pas : jaune.
3. [C] Six mètres interminable de {A}, quatrième rappel à l'ordre... et cette fois le jaune tombe. Il avait pourtant l'air sincèrement surpris.

## `crGK` — faute de gardien, rouge (3 → 6)
1. [R] ROUGE ! {A} plonge dans les jambes bien après le ballon. L'attaquant s'envole, le gardien s'en va.
2. [R] {A} déblaie l'attaquant d'un coup d'épaule à vingt mètres de sa cage : ROUGE pour le portier, et son remplaçant enfile les gants en catastrophe !
3. [C] {A} repousse l'attaquant des deux mains hors de sa surface. Ce n'est plus du football, c'est du catch : ROUGE.

## `amb` — ambiance (17 → 25)
1. [R] Le terrain est gras au milieu, ça glisse à chaque appui. Les crampons vissés vont faire la différence.
2. [R] Un ballon de rechange traverse la pelouse, l'arbitre le chasse du pied comme on chasse une mouche.
3. [R] Fumigène dans le virage, la fumée traverse la pelouse. On joue dans le brouillard pendant une minute.
4. [C] L'entraîneur de {D} sort de sa zone technique une fois de trop : l'arbitre le renvoie en tribune, et il n'y monte pas de bon cœur !
5. [C] Le speaker annonce l'affluence du soir. Le chiffre est accueilli par un mélange d'applaudissements polis et de ricanements francs.
6. [C] Un joueur remet ses protège-tibias en marchant, chaussettes à mi-mollet et short au ras du nombril. On est en 1995, et ça se voit.
7. [C] Passe en retrait au gardien, qui la prend au pied en soupirant. Trois ans que c'est interdit à la main, et certains cherchent encore.
8. [C] Le quatrième arbitre tente de calmer les deux bancs, qui se répondent par-dessus lui. Il note quelque chose sur sa feuille. Personne ne saura jamais quoi.

## `arret` — parade (12 → 17)
1. [R] Double parade ! {A} frappe, {G} repousse, {A} suit... et {G} se couche une seconde fois !
2. [R] {A} enroule à l'entrée de la surface, ça part sous la barre... {G} sort une horizontale du gant gauche ! On applaudit debout !
3. [R] Frappe vicieuse de {A} qui rebondit devant {G}... détournée du bout des doigts en corner ! Le rebond était traître.
4. [R] {A} se retourne dans un mouchoir et frappe des deux côtés coup sur coup — {G} dit non, et redit non !
5. [C] {A} tente le lob sur {G} monté trop haut. Le portier recule en marche arrière comme une Safrane dans un parking, et boxe au-dessus de sa barre !

## `rate` — occasion manquée (13 → 17)
1. [R] {A} arrive lancé sur le centre en retrait... et sa reprise part dans le décor ! Il se prend la tête à deux mains.
2. [R] {A} croit avoir le temps, contrôle, réajuste... et le retour du défenseur contre sa frappe. Il fallait la mettre du premier coup.
3. [C] {A} est trouvé au second poteau, tout seul, but ouvert, gardien à terre... et il glisse. La pelouse a encore frappé.
4. [C] Contre à trois contre deux. {A} garde le ballon pour lui, tente le crochet de trop, se fait reprendre. Ses deux coéquipiers lèvent les bras au ciel et l'y laisseront un moment.

## `but` — le but (16 → 20)
1. [R] Corner au second poteau, {A} monte au-dessus de la mêlée et pique sa tête dans le petit filet... BUUUT !
2. [R] {A} récupère un ballon mal dégagé aux vingt mètres et le remet dedans du premier coup... BUUUT ! Punition immédiate !
3. [R] Contre-attaque menée tambour battant, {A} au bout de la course... il croise du plat du pied... BUUUT ! Le gardien n'a pas bougé !
4. [R] {A} arrive lancé sur le centre à ras de terre et pousse le ballon au fond ! BUT ! Le plus simple du monde, encore fallait-il être là !

## `cf` — coup franc (12 → 15)
1. [R] {A} pose le ballon à vingt-deux mètres, recule de cinq pas, souffle... et sa frappe s'écrase sur la barre ! Le stade se prend la tête !
2. [R] Coup franc de {A} dévié par le mur... et le gardien, parti de l'autre côté, se retourne pour voir le ballon filer à côté ! Il a eu chaud.
3. [C] {A} et un coéquipier se disputent le ballon au-dessus du point de faute. Ils s'expliquent, ils négocient, ils tirent... et personne ne trouve le cadre. Trop de démocratie.

---

# Bilan — CE QUI A ÉTÉ LIVRÉ

Corpus final : **17 matchs L'Équipe (1 539 entrées)** + 5 lives SoFoot.
Densité d'un vrai live : **90,5 entrées/match**.

## Volume de texte
| | avant | après |
|---|---|---|
| lignes dans `COMM` | 90 | **194** |
| lignes affichées par match | ~13 | **20,6** (mesuré sur 400 matchs) |

## Familles ajoutées
`sauve` (11) · `corner` (9) · `hj` (6) · `soin` (6) — plus le bloc **`ETAT`**
(15 lignes en 5 groupes conditionnés par score et minute, via `ligneEtat(m,sh,sa)`).

## Renforts
`amb` +8 · `arret` +5 · `rate` +4 · `cj` +8 · `cr` +6 · `cjGK` +3 · `crGK` +3 · `cf` +3 · `but` +4

## Fréquences retenues (par minute) et résultat mesuré
Volontairement **en retrait du réel** : un vrai live tient 90 entrées, notre téléscripteur
se lit en ~90 tics et serait noyé à ce rythme.

| famille | réglage | mesuré /match | live réel /match |
|---|---|---|---|
| corner | 0,020 | 1,80 | 3,59 |
| sauve | 0,018 | 1,60 | 6,8 |
| hj | 0,010 | 0,83 | 1,12 |
| soin | 0,008 | 0,67 | 1,71 |
| cf | 0,014 *(était 0,0085)* | 1,25 | 2,29 |
| etat | 0,014 + condition | 0,49 | ~3,5 |

Le coup franc était **trois fois sous-injecté** par rapport au réel : corrigé.

## Branchement
Les cinq familles sont injectées **aux deux points** — `simuleMatch` (gardé par `verbeux`)
et `simuleReste` (re-simulation après changement de tactique en direct) — pour que le
changement de consigne ne fasse pas perdre la nouvelle saveur.

## Calibrage
**Intact, comme prévu par construction** (aucune de ces lignes ne touche au score) :
harnais principal 2,412 buts/match, 96-97 à 2,368, Europe vert. Les trois sont passés.

---

# PIÈGES RENCONTRÉS (à ne pas réintroduire)

1. **`fmtC` ne remplace que la PREMIÈRE occurrence de chaque jeton.** Une ligne qui emploie
   `{A}` ou `{G}` deux fois affiche le second en clair. Vérifié : plus aucun doublon.
2. **Les lignes `amb` ne passent PAS par `fmtC`** (`ev.push({t:"amb",x:PICK(COMM.amb)})`).
   Elles ne doivent donc contenir **aucun jeton**. C'est ce qui a fait apparaître `{D}` à
   l'écran au premier essai.
3. Les lignes de `ETAT` sont poussées telles quelles : **aucun jeton non plus**, et une
   formulation **neutre** (on ne sait pas de quel côté est le joueur dans `simuleMatch`).

Contrôle de non-régression disponible : le script de vérification compte les jetons restés
en clair et mesure la fréquence réelle de chaque famille sur 400 matchs verbeux.

---

# LOT 2 — LIVRÉ (v0.84)

Les quatre pistes ouvertes par le corpus ont toutes été traitées.

- **Météo de match** (la pièce maîtresse) : `METEO`, 6 temps, tirée au coup d'envoi et
  **variable selon le calendrier** via `tireMeteo(journee)`. Mesuré : ~65 % de clair en
  août-septembre, boue + froid dominants en décembre-février. Mémorisée dans `METEO_MATCH`,
  relue par `simuleReste` pour qu'un changement de tactique ne change pas le temps qu'il fait.
- **`poteau`** (6 lignes, réglage 0,004/min → 0,36/match ; corpus 0,24).
- **`refuse`** (5 lignes, 0,003/min → 0,27/match ; corpus 0,18). Pas de vidéo en 1995 :
  la décision est sans appel, ce qui est un ressort et non une limite.
- **Contre son camp** : 3 variantes de narration dans `but`, aucun changement moteur.
- **Temps additionnel** annoncé au coup de sifflet (1,00/match).

Téléscripteur : **22,0 lignes par match** (contre ~13 avant le lot 1).
Calibrage : 2,381 · 96-97 à 2,360 · Europe vert.

---

# LOT 3 — pistes encore ouvertes
Ce que le corpus contient et que le jeu n'exploite toujours pas :
- **`connect_stats`** (7,29/match, 2ᵉ poste du corpus !) : les encarts statistiques en cours de
  match. Le moteur a déjà toute la donnée (tirs, possession implicite, séries, historique des
  confrontations) — il ne la dit jamais pendant le direct.
- **`transfert`** (8,94/match, 1ᵉʳ poste) : les remplacements. Le jeu n'a pas de banc qui entre
  en cours de match ; ce serait un vrai système, pas une ligne de texte.
- Le **`envoye_special`** (0,65/match) : la note d'ambiance signée, façon reporter au bord du
  terrain — un registre de plus, distinct du reporter et du chambreur.
