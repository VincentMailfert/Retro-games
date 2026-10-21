# Relevé ANG 2007-08

## Importé

Saison 2007-08 du championnat d'Angleterre, relevée sur la branche `claude/import-2007-08-season-2fy4dl`.

**Premier League (D1)** : 20 clubs retenus (sur 20 classés), dans l'ordre du classement :
MUN, CHE, ARS, LIV, EVE, AVL, BLB, POR, MCI, WHU, TOT, NEW, MID, WIG, SUN, BOL, FUL, RDG, BIR, DER

**Championship (D2)** : 20 clubs retenus (sur 24 classés), dans l'ordre du classement :
WBA, STK, HUL, BSC, CPL, WAT, WOL, IPS, SHU, PLY, CHL, CAR, BUR, QPR, PNE, SHW, NOR, BNS, BLP, SOU

**Écartés** (4 clubs, les quatre derniers du Championship) :
- **Coventry City** (COV) : 21e du Championship, hors des 20 premières places retenues pour le jeu ; 36 joueurs éligibles au coup d'envoi
- **Leicester City** (LEI) : 22e du Championship, hors des 20 premières places retenues pour le jeu ; 43 joueurs éligibles au coup d'envoi
- **Scunthorpe United** (SCU) : 23e du Championship, hors des 20 premières places retenues pour le jeu ; 34 joueurs éligibles au coup d'envoi
- **Colchester United** (COL) : 24e du Championship, hors des 20 premières places retenues pour le jeu ; 32 joueurs éligibles au coup d'envoi

Les quatre écartés ont tous largement de quoi remplir un effectif de 18 joueurs ; ils sont écartés uniquement par le classement.

**Joueurs retenus** : 760 au total (20 par club en D1, 18 par club en D2).

**Pépites forcées** : aucune (à déterminer à l'assemblage, quand les notes des saisons voisines seront connues).

**Joueurs déjà dans le jeu** : 69 noms courts retrouvés dans les saisons anglaises existantes (1990-91 à 1995-96).

**Doublons résolus** (9 joueurs listés dans deux clubs, attribués au club du coup d'envoi) :
- Gary Speed (TM 3459) : conservé à Bolton, retiré de Sheffield United
- Peter Enckelman (TM 3719) : conservé à Blackburn, retiré de Cardiff
- Shefki Kuqi (TM 12398) : conservé à Crystal Palace (son club), retiré de Fulham (prêt fin août 2007)
- Gavin Mahon (TM 13798) : conservé à Watford, retiré de QPR
- Lewin Nyatanga (TM 37014) : conservé à Derby, retiré de Barnsley
- Ben Sahar (TM 40436) : conservé à QPR (prêté par Chelsea le 27 juillet 2007), retiré de Chelsea
- Caleb Folan (TM 46816) : conservé à Wigan (transféré à Hull le 31 août 2007), retiré de Hull
- David Cotterill (TM 40207) : conservé à Wigan, retiré de Sheffield United
- Ross Turnbull (TM 29159) : conservé à Cardiff (prêté par Middlesbrough en juillet 2007), retiré de Middlesbrough

**Reclassifications de poste** (ailiers ou milieux offensifs passés attaquants pour tenir le minimum de 4 par club) :
- Joe Cole (Chelsea) : de M à A
- Dirk Kuyt (Liverpool) : de M à A
- Niko Kranjcar (Portsmouth) : de M à A
- Luís Boa Morte (West Ham) : de M à A
- Diomansy Kamara (Fulham) : de M à A

**Noms de saison proposés** :
- Moscou sous la pluie
- Le sacre de Ronaldo
- Derby au fond du puits

## Vérifié

- Résultat du vérificateur : **RELEVÉ VERT** (ANG-2007-08, 40 clubs, 760 joueurs retenus)
- Champion : Manchester United (87 points), conforme à Wikipedia. Promus du Championship : West Bromwich Albion (1er), Stoke City (2e), Hull City (3e, vainqueur des barrages). Relégués de Premier League : Reading (18e), Birmingham City (19e), Derby County (20e, 11 points, record de faiblesse). Conforme.
- Test de non-régression : les noms courts existants dans le jeu (69 joueurs retrouvés sur les saisons ANG 1990-91 à 1995-96) reprennent exactement la graphie du jeu.

## Doutes

**Arrivées non résolues (arrivee=1)** : 53 joueurs retenus portent une date d'arrivée Transfermarkt postérieure à la saison 2007-08. C'est le piège documenté dans CLAUDE.md : Transfermarkt ne conserve que la dernière date d'arrivée au club. L'API d'historique de transferts (ceapi) était bloquée par un captcha anti-robot au moment du relevé, et le recoupement n'a pas pu être mené pour la plupart. Parmi les cas les plus notables :

- Cristiano Ronaldo (Manchester United, TM 8198) : date TM 2021-08-31 (son retour), mais il jouait bien à Old Trafford en 2007-08 (42 buts toutes compétitions)
- Paul Scholes (Manchester United, TM 3397) : date TM 2012-01-08 (son comeback), mais il était titulaire en 2007-08
- Didier Drogba (Chelsea, TM 3924) : date TM postérieure (retour ultérieur)
- Gareth Bale (Tottenham, TM 39381) : date TM postérieure
- Robbie Keane (Tottenham, TM 3144) : date TM postérieure
- Aaron Ramsey (Cardiff, TM 68737) : date TM 2019-02-01 (retour bien plus tard)

Tous ces joueurs étaient manifestement au club au coup d'envoi d'août 2007 d'après leurs statistiques de la saison (matchs et minutes joués significatifs). Leur arrivee reste à 1 dans le relevé, à corriger à 2 lors de l'assemblage si l'API devient accessible.

**Prénoms laissés vides** (13 joueurs mononymiques ou au prénom non distinct du nom) :
Anderson (Manchester United), Nani (Manchester United), Alex (Chelsea), Denílson (Arsenal), Eduardo (Arsenal), Laurén (Portsmouth), Benjani (Portsmouth), Elano (Manchester City), Geovanni (Manchester City), Mido (Middlesbrough), Stelios (Bolton), Juninho (Middlesbrough), Darius (Crystal Palace/Blackpool si applicable)

**Sources** : Transfermarkt (.com) pour les effectifs et les temps de jeu (pages kader et leistungsdaten, saison 2007), Wikipedia anglaise pour les classements finaux des deux divisions. Les domaines .co.uk et .de de Transfermarkt renvoyaient des erreurs 502 au moment du relevé. L'API ceapi/transferHistory était bloquée par un captcha AWS WAF pour la plupart des requêtes.
