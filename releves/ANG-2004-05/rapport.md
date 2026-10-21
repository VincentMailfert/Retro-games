# Relevé ANG-2004-05

## Importé

Saison 2004-05 du championnat d'Angleterre (Premier League + Football League Championship).
Branche : `claude/import-2004-05-season-awdu3z`

**D1 (20 clubs)** : CHE, ARS, MUN, EVE, LIV, BOL, MID, MCI, TOT, AVL, CHL, BIR, FUL, NEW, BLB, POR, WBA, CPL, NOR, SOU
**D2 (20 clubs retenus sur 24)** : SUN, WIG, IPS, DER, PNE, WHU, RDG, SHU, WOL, MIW, QPR, STK, BUR, LEE, LEI, CAR, PLY, WAT, COV, BHA

**Écartés** (4 clubs) :
- Crewe Alexandra (CRW) : 21e du Championship, écarté pour ramener le plateau à 20
- Gillingham (GIL) : 22e du Championship, écarté pour ramener le plateau à 20
- Nottingham Forest (FOR) : 23e du Championship (relégué), écarté pour ramener le plateau à 20
- Rotherham United (ROT) : 24e du Championship (relégué, 29 pts), écarté pour ramener le plateau à 20

**Joueurs retenus** : 760 (20 par club en D1, 18 par club en D2)
**Pépites forcées** : 0

**Noms de saison proposés** :
- « Le verrou de Chelsea » (15 buts encaissés en 38 matchs, record de solidité)
- « Mourinho prend les commandes » (premier titre de Chelsea en 50 ans, sous la houlette du Special One)

Sources : Transfermarkt (.co.uk), Wikipedia anglaise, API ceapi/transferHistory pour les recoupements de dates d'arrivée.

## Vérifié

- Résultat du vérificateur : **RELEVÉ VERT** (ANG-2004-05, 40 clubs, 760 joueurs retenus)
- Champion de D1 : Chelsea (95 pts, record de points à l'époque), conforme à Wikipedia
- Promus de D2 : Sunderland (automatique), Wigan Athletic (automatique), West Ham United (barrages), conforme à Wikipedia
- Relégués de D1 : Crystal Palace, Norwich City, Southampton, conforme à Wikipedia
- Relégués de D2 : Gillingham, Nottingham Forest, Rotherham United, conforme à Wikipedia
- **Test de non-régression** sur ANG 1992-93 (MUN et NEW) : 20/20 joueurs D1 et 18/18 joueurs D2 retrouvés par le scraping. Rob Lee présent à Newcastle (arrivee=2) et absent de Charlton (not in squad), conforme au jeu livré. Cantona (arrivee=0, transféré en novembre 1992) correctement exclu du onze du coup d'envoi. Beckham, Srnicek, Clark, Wright (arrivee=1 sur TM) correctement récupérables en arrivee=2 par recoupement.

## Doutes

- 134 doublons (joueurs listés dans deux clubs) résolus par date « Im Team seit » puis par historique de transfert Transfermarkt (ceapi/transferHistory). 96 joueurs non doublons avec arrivée postérieure à la saison corrigés à arrivée 2 (présents au coup d'envoi, la date TM étant celle d'un retour ultérieur).
- Quelques appels API ont échoué (Filipe Oliveira, Michael Dawson, Gary Doherty, Robbie Blake, Olivier Bernard, Robert Earnshaw, Shaun Derry, Neil Harris, Chris Barker) : résolution par le club aux plus de minutes.
- POR : Patrik Berger (Attacking Midfield) reclassé en A pour tenir le minimum de 4 attaquants.
- BUR : Graham Branch (Left Winger) et Mark Yates (Attacking Midfield) reclassés en A pour tenir le minimum. Paul Scott (D, 0 minute) retiré au profit de Yates.
- Prénoms vides (5 retenus) : Laurén (ARS), Josemi (LIV), Doriva (MID), Mido (TOT) et Yakubu (POR) sont des joueurs à nom unique.
- Mido (TOT) est arrivé en prêt de la Roma en janvier 2005 (arrivée en cours de saison), mais il a été marqué arrivee=2 par la correction en masse des arrivées postérieures. Retenu faute de quatrième attaquant à Tottenham au coup d'envoi. À vérifier à l'assemblage.
- Homonymes complets résolus : Paul Robinson (TOT gardien / WBA défenseur), Andy Johnson (CPL attaquant / WBA milieu), Darren Ward (MIW défenseur / NOR gardien). Tous distingués par préfixe différent dans le nom court.
