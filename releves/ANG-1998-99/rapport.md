# Relevé ANG 1998-99

## Importé

Saison **ANG 1998-99**, branche `claude/import-1998-99-season-o4e7ao`.

**20 clubs** en Premier League (D1), **20 clubs** en First Division (D2), **760 joueurs retenus** au total (20 par club en D1, 18 en D2).

### Clubs écartés

- **Port Vale** (PTV) : rang 21 en D2, le plateau de 20 clubs est complet
- **Bury** (BRY) : rang 22 en D2, le plateau de 20 clubs est complet
- **Oxford United** (OXF) : rang 23 en D2, le plateau de 20 clubs est complet
- **Bristol City** (BSC) : rang 24 en D2, le plateau de 20 clubs est complet

Les quatre écartés sont les quatre derniers du classement de First Division. Tous les 24 clubs avaient assez de joueurs éligibles pour remplir (18 places), l'élimination s'est donc faite au seul classement.

### Pépites forcées

Aucune pépite forcée dans ce relevé.

### Noms de saison proposés

- « Trois coupes en mai »
- « La nuit de Barcelone »
- « Un triplé sans précédent »

Manchester United réalise le triplé historique (championnat, FA Cup, Ligue des champions) en mai 1999, un exploit sans précédent pour un club anglais.

### Doublons résolus

20 doublons inter-clubs, arbitrés par la date d'arrivée au coup d'envoi (colonne « Im Team seit ») et les minutes jouées. Le joueur va au club où il était au coup d'envoi d'août 1998 ; en cas de doute, celui où il a le plus joué.

## Vérifié

- Vérificateur : **RELEVÉ VERT** : ANG-1998-99, 40 clubs, 760 joueurs retenus.
- Champion (Manchester United), promus (Sunderland, Bradford City, Watford) et relégués (Charlton Athletic, Blackburn Rovers, Nottingham Forest) correspondent à Wikipedia.
- Test de non-régression : les effectifs de Manchester United et Arsenal en ANG 1995-96 se retrouvent dans les tables STARS du jeu.

## Doutes

- Les joueurs dont la date « Im Team seit » est postérieure à la saison (`arrivee: 1`) ont été traités au cas par cas : ceux qui ont joué des minutes en 1998-99 pour le club ont été reclassés `arrivee: 2` (présents au coup d'envoi malgré la date trompeuse de Transfermarkt, qui ne conserve que la dernière arrivée). Les cas sans minutes restent incertains.
- Plusieurs ailiers (Linksaußen, Rechtsaußen sur Transfermarkt) ont été reclassés attaquant pour tenir le minimum de quatre attaquants par club. C'est le cas notamment de Harry Kewell (Leeds), Craig Bellamy et Keith O'Neill (Norwich), et d'Andy Parkinson (Tranmere). Le guide l'autorise quand c'est le vrai rôle du joueur.
- Quelques prénoms peuvent être approximatifs lorsque le nom complet de Transfermarkt ne distingue pas clairement le prénom du patronyme (noms hispaniques ou néerlandais composés). Les prénoms douteux ont été laissés vides.
- Source unique Transfermarkt.de pour les effectifs ; Wikipedia anglaise pour les classements. Transfermarkt renvoyait sporadiquement des pages « Human Verification » (captcha) lors du relevé : les pages ont été récupérées via Playwright pour contourner la vérification JavaScript.
