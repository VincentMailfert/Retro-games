# Relevé ANG 2009-10

## Importé

Saison **ANG 2009-10** (Premier League et Championship), branche `claude/import-2009-10-season-v12jpc`.

**D1 (Premier League) : 20 clubs retenus** (dans l'ordre du classement) :
CHE, MUN, ARS, TOT, MCI, AVL, LIV, EVE, BIR, BLB, STK, FUL, SUN, BOL, WOL, WIG, WHU, BUR, HUL, POR.

**D2 (Championship) : 20 clubs retenus** (sur 24) :
NEW, WBA, FOR, CAR, LEI, BLP, SWA, SHU, RDG, BSC, MID, DON, QPR, DER, IPS, WAT, PNE, BNS, COV, SCU.

**Écartés** (4 clubs, par rang descendant) :
- PET (Peterborough United) : rang 24, dernier du classement.
- PLY (Plymouth Argyle) : rang 23, avant-dernier.
- SHW (Sheffield Wednesday) : rang 22.
- CPL (Crystal Palace) : rang 21, pénalité de 10 points pour administration.

**Joueurs retenus** : 760 (400 en D1, 360 en D2). Tous avec arrivee=2 (présents au coup d'envoi).

**Pénalités de points** :
- Portsmouth (POR) : -9 points (administration). Points bruts : 28, après déduction : 19.
- Crystal Palace (CPL) : -10 points (administration). Points bruts : 59, après déduction : 49. Écarté (rang 21).

**Pépites forcées** : aucune. Les joueurs notables (Sturridge, Borini chez Chelsea ; Carroll chez Newcastle ; Bale chez Tottenham ; Joe Allen chez Swansea) sont entrés dans les effectifs par le tri aux minutes ou le comblement des minimums de poste (2G, 5D, 5M, 4A).

**Doublons inter-clubs résolus** (10 joueurs) :
- Craig Gardner : gardé à AVL (retiré de BIR).
- Zurab Khizanishvili : gardé à BLB (retiré de RDG).
- Steven Reid : gardé à BLB (retiré de WBA).
- Andy Griffin : gardé à STK (retiré de RDG).
- Steve Simonsen : gardé à STK (retiré de SHU).
- Nyron Nosworthy : gardé à SUN (retiré de SHU).
- Daryl Murphy : gardé à SUN (retiré de IPS).
- Freddie Sears : gardé à CPL (retiré de WHU, CPL écarté mais le doublon est résolu).
- Stephen Dobbie : gardé à SWA (retiré de BLP).
- Billy Sharp : gardé à DON (retiré de SHU).

Les clubs ayant perdu un joueur ont été complétés par le joueur éligible suivant par minutes.

**Noms de saison proposés** :
1. La cavale de Chelsea
2. Pompey coule
3. Les milliards de Manchester

## Vérifié

**Vérificateur** : `node releves/verifie-releve.cjs releves/ANG-2009-10` renvoie **RELEVÉ VERT : ANG-2009-10, 40 clubs, 760 joueurs retenus.**

**Contrôle 1 : champion, promus et relégués.**
- D1 : Chelsea champion (1er, 86 pts). Relégués : Burnley (18e), Hull City (19e), Portsmouth (20e, -9 pts). Conforme à Wikipedia.
- D2 : Newcastle champion (1er, 102 pts). Promus directs : Newcastle, West Brom. Promu via les play-offs : Blackpool (vainqueur de la finale contre Cardiff). Relégués : Scunthorpe (20e), Crystal Palace (21e, -10 pts), Sheffield Wednesday (22e), Plymouth (23e), Peterborough (24e). Conforme à Wikipedia.

**Contrôle 2 : test de non-régression contre ANG 1992-93.**
Manchester United (1992-93) : 20 joueurs retrouvés dans le jeu, dont P. Schmeichel, G. Pallister, S. Bruce, D. Irwin, P. Ince, R. Giggs, D. Beckham, Mark Hughes. Les filtres de position (G/D/M/A) et le tri par minutes reproduisent bien la sélection livrée.
Arsenal (1992-93) : 20 joueurs dont D. Seaman, T. Adams, L. Dixon, P. Merson, I. Wright, Alan Smith. Conforme.

## Doutes

**Arrivées rectifiées (66 joueurs).** Transfermarkt affiche dans sa colonne « Im Team seit » la date du dernier passage au club, pas celle de la saison en cours. Pour 66 joueurs retenus, cette date était postérieure à la saison 2009-10 (arrivee=1). L'historique des transferts (ceapi/transferHistory) a été consulté pour chacun : 49 confirmés (aucun transfert enregistré, joueur de formation ou au club de longue date), 17 sans réponse de l'API. Tous ayant des minutes significatives dans la saison 2009-10, leur arrivee a été rectifiée à 2 (présents au coup d'envoi). Joueurs les plus notables concernés : Didier Drogba (Chelsea, 3793 min), Ashley Young (Aston Villa, 4500 min), Andy Carroll (Newcastle, 3057 min), Gareth Bale (Tottenham), Paul Scholes (Man United), Steven Pienaar (Everton), Clint Dempsey (Fulham), Leon Britton (Swansea).

**Prénoms laissés vides (14 joueurs mononymiques).** Alex, Deco, Hilário, Bosingwa (Chelsea), Nani, Anderson, Rafael (Man United), Denílson, Eduardo (Arsenal), Benjani (Man City), Yakubu (Everton), Didi (Bolton), Pizzi (Burnley), Kamil Zayatte (Hull). Ces joueurs sont connus par un seul nom sur Transfermarkt ; le prénom est laissé vide, conformément à la règle (on ne devine jamais un prénom).

**Nadir Çiftçi** (Portsmouth, A) : 0 minute jouée en Premier League 2009-10, inclus pour atteindre le minimum de 4 attaquants. Joueur de formation, 17 ans, arrivee rectifiée à 2.

**Sources.** Transfermarkt (.com) pour les effectifs (kader + leistungsdaten, 88 pages sur 44 clubs), Wikipedia anglaise pour les classements. Les domaines .co.uk et .de retournaient 405 ; seul .com a répondu.
