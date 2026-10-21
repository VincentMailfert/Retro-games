## Importé

Saison **ANG 2003-04**, branche `claude/import-england-season-2003-04-7x2b5z`.

**Division 1 (Premier League)**, 20 clubs retenus dans l'ordre du classement :
ARS, CHE, MUN, LIV, NEW, AVL, CHL, BOL, FUL, BIR, MID, SOU, POR, TOT, BLB, MCI, EVE, LEI, LEE, WOL.

**Division 2 (First Division)**, 20 clubs retenus sur 24 :
NOR, WBA, SUN, WHU, IPS, CPL, WIG, SHU, RDG, MIW, STK, COV, CAR, FOR, PNE, WAT, CRW, DER, GIL, WAL.

**Écartés** (4 clubs) :
- **Rotherham United** (ROT, 17e) : aucun attaquant éligible au coup d'envoi, tous arrivés en cours de saison.
- **Burnley** (BUR, 19e) : un seul gardien et un seul attaquant éligibles, impossible de tenir les minimums de poste.
- **Bradford City** (BRD, 23e) : seulement 3 milieux éligibles pour 5 places requises.
- **Wimbledon** (WIM, 24e) : dernier du classement, relégué.

**760 joueurs retenus** au total (20 par club en D1, 18 par club en D2).
**0 pépites forcées.**
**6 joueurs reclassés** de M en A pour tenir le minimum de 4 attaquants.

**Noms de saison proposés** :
- « Les Invincibles » (Arsenal termine la saison invaincu : 26 victoires, 12 nuls, 0 défaite)
- « Zéro défaite »
- « Le sacre sans la chute »

## Vérifié

- Vérificateur : **RELEVÉ VERT** (ANG-2003-04, 40 clubs, 760 joueurs retenus).
- **Champion** : Arsenal (invaincu toute la saison, 90 points), vérifié sur Wikipedia.
- **Promus en Premier League** : Norwich City (1er, automatique), West Bromwich Albion (2e, automatique), Crystal Palace (6e, via les barrages), vérifiés sur Wikipedia.
- **Relégués de Premier League** : Leicester City (18e, 33 pts), Leeds United (19e, 33 pts), Wolverhampton Wanderers (20e, 33 pts).
- **Relégués de First Division** : Walsall (22e), Bradford City (23e), Wimbledon (24e).

## Doutes

- **12 joueurs retenus avec arrivée inconnue** : la date « Im Team seit » est absente de la source pour ces joueurs. La plupart sont des joueurs de longue date du club (arrivée antérieure à la saison), mais un recoupement par l'API `ceapi/transferHistory` confirmerait leur présence au coup d'envoi.
- **0 joueurs retenus avec arrivée postérieure à la saison** : la date « Im Team seit » de Transfermarkt montre la dernière arrivée au club, pas celle de 2003. Le recoupement par l'historique de transferts est nécessaire pour chaque cas.
- **Rotherham United (ROT)** : l'identifiant Transfermarkt 1199 pourrait ne pas correspondre au bon club. Les joueurs relevés portent des noms inhabituels pour Rotherham. Un recoupement avec d'autres sources serait nécessaire.
- **Reclassifications M vers A** : 6 joueurs ont été reclassés d'ailier (M) en attaquant (A) pour tenir le minimum de poste. Ces reclassifications sont conformes aux instructions.
- **Prénoms** : extraits du nom complet Transfermarkt. Certains peuvent être des deuxièmes prénoms ou des variantes orthographiques.
