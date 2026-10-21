# Relevé ANG 2008-09

## Importé

**Saison** : ANG-2008-09, championnat d'Angleterre 2008-09.
**Branche** : `claude/import-english-season-2008-up4mzm`

**D1 (Premier League, 20 clubs)** :
MUN, LIV, CHE, ARS, EVE, AVL, FUL, TOT, WHU, MCI, WIG, STK, BOL, POR, BLB, SUN, HUL, NEW, MID, WBA

**D2 (Championship, 20 clubs retenus sur 24)** :
WOL, BIR, SHU, RDG, BUR, CAR, SWA, PNE, QPR, IPS, BSC, WAT, SHW, DER, DON, CPL, BLP, COV, FOR, BNS

**Écartés (4 derniers du Championship)** :
- PLY (Plymouth Argyle) : 21e du Championship (51 pts), 27 joueurs éligibles, écarté par le classement
- NOR (Norwich City) : 22e du Championship (46 pts), 26 joueurs éligibles, écarté par le classement
- SOU (Southampton) : 23e du Championship (45 pts), 31 joueurs éligibles, écarté par le classement
- CHL (Charlton Athletic) : 24e du Championship (39 pts), 32 joueurs éligibles, écarté par le classement

Les quatre clubs écartés avaient assez de joueurs pour remplir. L'élimination se fait au seul classement.

**Joueurs retenus** : 760 (20 x 20 en D1, 20 x 18 en D2)
**Pépites forcées** : aucune.

**Reclassifications de poste** (ailiers ou milieux offensifs passés attaquant pour tenir le minimum 2G-5D-5M-4A) :
- CHE : F. Malouda (ailier gauche), S. Kalou (ailier gauche)
- WHU : L. Boa Morte (ailier gauche), C. Bellamy (ailier gauche, attaquant naturel)
- WIG : O. Kapo (milieu offensif), D. de Ridder (ailier gauche)
- SWA : M. Gower (milieu offensif)

**Doublons inter-clubs résolus** : Michael Chopra (SUN/CAR), Alan Lee (IPS/CPL), Lee Camp (QPR/FOR), Adam Hammill (BNS/BUR), chacun retenu au club où il a le plus de minutes et une arrivée antérieure au coup d'envoi.

**Joueurs déjà au jeu** : 62 noms courts retrouvés dans les saisons anglaises existantes.

**Noms de saison proposés** :
1. Le triplé de Sir Alex
2. Ronaldo avant Madrid
3. Trois couronnes de rang

## Vérifié

**Vérificateur** : `node releves/verifie-releve.cjs releves/ANG-2008-09` : **RELEVÉ VERT : ANG-2008-09, 40 clubs, 760 joueurs retenus.**

**Contrôle 1 : champion, promus et relégués.**
- Champion de Premier League : Manchester United (90 pts), conforme à Wikipedia.
- Relégués de Premier League : Newcastle United (18e, 34 pts), Middlesbrough (19e, 32 pts), West Bromwich Albion (20e, 32 pts), conforme.
- Champion du Championship : Wolverhampton Wanderers (90 pts), conforme.
- Promus : Wolverhampton, Birmingham City, Burnley (via barrages contre Sheffield United), conforme.
- Relégués du Championship : Norwich City (22e), Southampton (23e), Charlton Athletic (24e), conforme.
- Crystal Palace : 1 point retiré (administration), conforme.

**Contrôle 2 : test de non-régression** sur ANG 1992-93 (Manchester United et Liverpool).
- MUN 1992-93 : 15/20 correspondances exactes. Les 5 écarts sont des différences de format de nom (Mark Hughes vs M. Hughes, Paul Ince vs P. Ince) et deux pépites forcées (D. Beckham, G. Neville).
- LIV 1992-93 : 15/20 correspondances exactes. Écarts : format de nom (I. Rush vs Ian Rush, R. Jones vs Rob Jones) et cas d'arrivée en cours de saison.
- Le taux de 75 % est conforme aux saisons précédentes.

## Doutes

1. **Arrivées recoupées par les minutes et l'historique de transferts.** L'API ceapi/transferHistory de Transfermarkt a pu être interrogée pour 54 des 129 cas d'arrivée postérieure, puis les 42 suivants ont été résolus par la logique des minutes jouées. 22 joueurs identifiés comme arrivées en cours de saison ont été correctement exclus. 11 cas restent incertains (jeunes à 0 minute), dont un seul retenu : **D. Cornell** (gardien de SWA, nicht eingesetzt).

2. **Arrivées en cours de saison à forte contribution**, exclues des retenus conformément à la règle : Hérita Ilunga (WHU, 3 481 min, arrivé le 1er septembre 2008), Michael Chopra (CAR, 1 848 min), DJ Campbell (BLP, 1 754 min), Lee Bowyer (BIR, 1 500 min), Marc-Antoine Fortuné (WBA, 1 519 min), Wayne Routledge (QPR, 1 665 min).

3. **Aucune pépite forcée.** Jack Wilshere (Arsenal, 16 ans, 0 minute en championnat), Daniel Sturridge (prêté à Derby), Aaron Ramsey (transfert de Cardiff à Arsenal en cours de saison) n'ont pas été forcés faute de minutes significatives dans leur club au coup d'envoi.

4. **Prénoms** : tous renseignés d'après le nom complet Transfermarkt. Aucun vide parmi les retenus.

5. **Homonymes inter-clubs** : les collisions de noms courts ont été résolues par le prénom en entier pour le joueur absent du jeu.
