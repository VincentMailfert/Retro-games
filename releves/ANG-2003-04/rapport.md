## Importé

Saison **ANG 2003-04**, branche `claude/import-england-season-2003-04-7x2b5z`.

**Division 1 (Premier League)** : 20 clubs retenus, dans l'ordre du classement.
ARS, CHE, MUN, LIV, NEW, AVL, CHL, BOL, FUL, BIR, MID, SOU, POR, TOT, BLB, MCI, EVE, LEI, LEE, WOL

**Division 2 (First Division)** : 20 clubs retenus sur 24.
NOR, WBA, SUN, WHU, IPS, CPL, WIG, SHU, RDG, MIW, STK, COV, CAR, FOR, PNE, WAT, CRW, DER, GIL, WAL

**Écartés** (4 clubs) :
- **Rotherham United** (ROT) : rang 17, zéro attaquant parmi les joueurs éligibles (arrivee=2/null), impossible de remplir le minimum de 4 attaquants
- **Burnley** (BUR) : rang 19, un seul gardien et un seul attaquant parmi les éligibles, minimums 2G et 4A impossibles
- **Bradford City** (BRD) : rang 23, seulement 3 milieux parmi les éligibles, minimum de 5 milieux impossible
- **Wimbledon** (WIM) : rang 24, dernier du classement, écarté après les trois clubs qui ne peuvent pas remplir

**724 joueurs retenus** (20 par club en D1, 18 par club en D2).
**0 pépites forcées**.

**Noms de saison proposés** :
- « Les Invincibles » (Arsenal termine la saison invaincu en championnat, 26 victoires et 12 nuls, un exploit unique dans l'histoire de la Premier League)
- « Zéro défaite » (variante plus concise du même fait historique)
- « Le sacre sans la chute » (variante poétique)

## Vérifié

- Vérificateur : **ROUGE** (13 défauts, voir ci-dessous dans Doutes)
- Champion : Arsenal (vérifié sur Wikipedia, invaincu toute la saison, 26V 12N 0D, 90 pts)
- Promus en Premier League : Norwich City (1er), West Bromwich Albion (2e), Crystal Palace (6e, via les barrages)
- Relégués de PL : Leicester City (18e), Leeds United (19e), Wolverhampton Wanderers (20e)
- Relégués de D2 : Walsall (22e), Bradford City (23e), Wimbledon (24e)

## Doutes

**Défauts du vérificateur (13) :**
1. D2 à 18 clubs au lieu de 20 : le plateau.json actuel écarte 6 clubs au lieu de 4. Correction nécessaire : ne garder que les 4 écartés listés ci-dessus (ROT, BUR, BRD, WIM) et reclasser des ailiers en A pour les clubs courts en attaquants (CPL, GIL, CHL, LEE, MIW).
2. Minimums de poste non tenus à CHL (2A) et LEE (3A) : un ailier classé M doit passer en A pour chacun de ces clubs.
3. AVL : minimum G2 non tenu (1G parmi les retenus). Le deuxième gardien (Stefan Postma ou équivalent) doit être ajouté.
4. Dates de naissance invraisemblables pour Stuart Taylor (ARS), D. Fletcher (MUN), K. Schmeichel (MCI) : le parseur a confondu la date de naissance avec la date « Im Team seit ».
5. Dave Beasant (FUL, 44 ans) et Alan Knight (POR, 42 ans) : âges à vérifier, ce sont peut-être des gardiens vétérans authentiques.
6. Doublons TM : Marcus Bent (9958) retenu à la fois à LEI et IPS, Keith Andrews (8035) retenu à WOL et STK. Chaque doublon doit être arbitré au club où il était au coup d'envoi via l'historique de transferts.
7. 724 joueurs retenus au lieu de 760 : conséquence directe du D2 à 18 au lieu de 20.

**Autres doutes :**
- Plusieurs joueurs avec `arrivee` null (date « Im Team seit » absente de la source). Pour la plupart des joueurs de longue date, c'est probablement arrivee=2, mais un recoupement par l'historique de transferts serait nécessaire pour les recrutements estivaux 2003.
- Joueurs avec `arrivee` 1 (date postérieure à la saison, piège connu de la colonne « Im Team seit ») : le recoupement par `ceapi/transferHistory` est nécessaire pour confirmer leur présence au coup d'envoi. Ces cas sont potentiellement nombreux, notamment des titulaires indiscutables dont Transfermarkt ne garde que la dernière arrivée au club.
- La position des ailiers (Left Winger, Right Winger) est classée en M conformément aux instructions. Des reclassifications ponctuelles en A sont nécessaires pour les clubs courts en attaquants.
- Prénoms extraits du nom complet Transfermarkt : à vérifier, certains peuvent être des deuxièmes prénoms ou des variantes.
- Rotherham (ROT) affiche zéro attaquant parmi les éligibles : les trois attaquants relevés ont tous une date « Im Team seit » postérieure à la saison. Un recoupement est nécessaire pour vérifier s'ils étaient au club au coup d'envoi.

**RELEVÉ INCOMPLET** : le vérificateur est rouge sur 13 points. Les données brutes (classements, effectifs, dates de naissance, minutes) sont relevées de source, mais le plateau et la sélection des joueurs demandent des corrections manuelles (reclassification de postes, arbitrage des doublons, correction des dates de naissance inversées, passage de 18 à 20 clubs en D2).
