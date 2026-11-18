# ITA 1990-91 : relevé BRUT, en attente d'une décision de l'auteur

Travail de la nuit du 15/11/2026, sur `secours/2026-11-15`. **Ce n'est pas encore un relevé au format de
phase 1** (`plateau.json`, `joueurs.json`, `rapport.md`) : le plateau n'est pas arrêté.

## Ce qui est fait

- **Accès** : Transfermarkt répond sur `.de` (et `.co.uk`), `.com` répond 405. Wikipédia anglaise joignable.
- **Classements** lus sur la Wikipédia anglaise (« 1990–91 Serie A », « 1990–91 Serie B », et les deux
  pages 1989–90 pour les repêchages). **Deux points la victoire** (jusqu'en 1993-94), **Udinese pénalisée
  de 5 points** en Serie B 1990-91 (corruption).
- **Identifiants Transfermarkt** des 41 clubs utiles, lus sur les pages de championnat Transfermarkt 1990-91
  (Serie A `IT1`, Serie B `IT2`, Serie C1 `IT3A` et `IT3B`), notés dans `releves/clubs-tm.json` (champ
  `pays: "ITA"`). Licata (verein 31154) n'y est pas, faute de code dans `CLUBS_ITA`.
- **`brut.json`** : pour chacun des 41 clubs (18 de Serie A, 20 de Serie B, Monza, Licata, Como), les
  hommes des deux pages Transfermarkt (effectif détaillé et temps de jeu, saison 1990) : identifiant,
  nom, poste Transfermarkt et poste du jeu, naissance, « Im Team seit » (`seit`, **non recoupé** avec
  l'historique de transferts), nom court, matchs et minutes **toutes compétitions**, et le marqueur
  (`pas_au_club` = « Stand in dieser Spielzeit nicht im Kader », `non_utilise` = « Wurde in dieser
  Spielzeit nicht eingesetzt »). Source généreuse : de 20 à 32 hommes par club, une seule date de
  naissance manquante (Monza), aucun poste inconnu.

## Ce qui reste (une fois le plateau tranché)

Le plateau, puis `arrivee` par club (recoupement des `seit` postérieurs au coup d'envoi avec
`ceapi/transferHistory`), la présélection 20 / 18, les noms courts et prénoms, les doublons, le rapport,
et l'adaptation de `verifie-releve.cjs` au pays (il ne connaît que `CLUBS_ANG`, trois points la victoire
et une deuxième division à 24 clubs).

## La décision attendue

Serie A 18 clubs + Serie B 20 clubs = 38 : il en manque deux pour faire 20 + 20. La règle de la D1
française 98/99 donne :

- **en haut**, les deux meilleurs relégués de Serie A 1989-90 : **Udinese (27 pts) et Hellas Verona (25)**,
  qui jouent la Serie B 1990-91 (Cremonese, 23, et Ascoli, 21, restent en bas) ;
- **en bas**, les deux meilleurs relégués de Serie B 1989-90, qui jouent la Serie C1 1990-91 :
  **Monza (34 pts, descendu au match d'appui contre Messina) et Licata (28)**, devant Como (27) et
  Catanzaro (25).

**Licata n'est pas dans `CLUBS_ITA`** (74 clubs, l'union des Serie A et B de 1990-91 à 2009-10) et
Transfermarkt le documente entièrement (24 hommes au club, 2 G, 9 D, 9 M, 4 A) : on ne peut pas l'écarter
comme Toulon en 98/99. Voir la ligne du 15/11/2026 au journal de `championnat/chantier-saisons.md`.
