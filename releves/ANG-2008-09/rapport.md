# Relevé ANG 2008-09

## Importé

Saison **2008-09** du championnat d'Angleterre (Premier League et Football League Championship).
Branche : `claude/import-english-season-2008-up4mzm`

**D1 (20 clubs)** : MUN, LIV, CHE, ARS, EVE, AVL, FUL, TOT, WHU, MCI, WIG, STK, BOL, POR, BLB, SUN, HUL, NEW, MID, WBA

**D2 (20 clubs)** : WOL, BIR, SHU, RDG, BUR, PNE, CAR, SWA, IPS, BSC, QPR, SHW, WAT, DON, CPL, BLP, COV, DER, FOR, BNS

**Écartés (4 clubs, les quatre derniers du Championship)** :
- **Plymouth Argyle** (PLY) : rang 21 sur 24, 27 joueurs éligibles, les quatre derniers s'effacent
- **Norwich City** (NOR) : rang 22 sur 24, 26 joueurs éligibles, les quatre derniers s'effacent
- **Southampton** (SOU) : rang 23 sur 24, 31 joueurs éligibles, les quatre derniers s'effacent
- **Charlton Athletic** (CHL) : rang 24 sur 24, 32 joueurs éligibles, les quatre derniers s'effacent

**Joueurs retenus** : 760 (20 par club de D1, 18 par club de D2)

**Pépites forcées** : aucune. Gareth Bale, Theo Walcott, Aaron Ramsey, Jack Wilshere, Adam Lallana, Joe Allen et les autres jeunes notables passent tous par le seul temps de jeu.

**Reclassifications de poste** (ailiers reclassés attaquants pour tenir le minimum de 4 attaquants) :
- Florent Malouda (CHE), Luís Boa Morte (WHU), Daniël de Ridder (WIG), Jonathan Walters (IPS), Mark Gower (SWA)

**Doublons résolus** (3 joueurs dans deux clubs, arbitrés par les minutes et l'historique de transferts) :
- Tony McMahon : Sheffield Wednesday (retenu) / Middlesbrough
- Alan Lee : Crystal Palace (retenu) / Ipswich Town
- Adam Hammill : Blackpool (retenu) / Barnsley

**Homonymes** : Maik Taylor / Martin Taylor (BIR), et 30 autres paires résolues par nom complet.

**Noms de saison proposés** :
1. Le triplé de Fergie
2. Ronaldo fait ses adieux
3. Les tigres au festin

## Vérifié

- **Vérificateur** : `RELEVÉ VERT : ANG-2008-09, 40 clubs, 760 joueurs retenus.`
- **Champion D1** : Manchester United (90 pts), conforme à Wikipedia
- **Promus en D1** : Wolverhampton Wanderers (champion), Birmingham City (2e), Burnley (playoffs), conforme à Wikipedia
- **Relégués de D1** : Newcastle United (34 pts), Middlesbrough (32 pts), West Bromwich Albion (32 pts), conforme à Wikipedia
- **Relégués de D2** : Norwich City, Southampton, Charlton Athletic, conforme à Wikipedia
- **Test de non-régression** : R. Giggs (MUN) correctement identifié `deja_au_jeu=true` (présent depuis ANG 1990-91). S. Gerrard (LIV) correctement `deja_au_jeu=false`. 62 joueurs retenus sur 760 existent déjà dans le jeu.

## Doutes

- **David Cornell** (SWA, gardien, arrivée=1) : Transfermarkt date son entrée au 01/07/2009 (promotion du centre de formation), mais il figure dans l'effectif 2008-09. Gardé avec arrivée=1 pour le minimum de deux gardiens.
- **Crystal Palace** : pénalité d'un point (administration), vérifiée sur Wikipedia.
- Cinq ailiers reclassés attaquants pour tenir le minimum de quatre par club : Malouda (CHE), Boa Morte (WHU), de Ridder (WIG), Walters (IPS), Gower (SWA).
- 127 joueurs avec arrivée=1 recoupés par `ceapi/transferHistory` : 41 corrigés, le reste gardé tel quel.
- Cristiano Ronaldo : TM date « Im Team seit » après la saison (transfert à Madrid en 07/2009), historique confirme sa présence à Man Utd dès 2003, arrivée fixée à 2.
