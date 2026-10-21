# Relevé ANG 1999-00

## Importé

Saison 1999-2000 du championnat d'Angleterre, relevée sur Transfermarkt (.de) et Wikipédia.
Branche : `claude/import-england-season-1999-v509k2`

**D1 (Premier League, 20 clubs) :** MUN, ARS, LEE, LIV, CHE, AVL, SUN, LEI, WHU, TOT, NEW, MID, EVE, COV, SOU, DER, BRD, WIM, SHW, WAT
**D2 (First Division, 20 clubs retenus sur 24) :** MCI, IPS, BNS, BIR, BOL, WOL, HUD, FUL, QPR, BLB, NOR, TRM, FOR, CPL, SHU, SKP, POR, CRW, GRI, WBA

**Écartés (4) :**
- CHL (Charlton Athletic) : données Transfermarkt inaccessibles (anti-robot), club écarté faute de données
- SWI (Swindon Town) : 24e du classement de First Division, écarté par le rang pour ramener la division à 20 clubs
- PTV (Port Vale) : 23e du classement de First Division, écarté par le rang pour ramener la division à 20 clubs
- WAL (Walsall) : 22e du classement de First Division, écarté par le rang pour ramener la division à 20 clubs

**Joueurs retenus :** 760
**Pépites forcées :** aucune

**Doublons inter-clubs arbitrés :** 116
- David May (3538) : MUN/HUD -> MUN
- John Curtis (7913) : MUN/BNS -> MUN
- Michael Clegg (106894) : MUN/IPS -> MUN
- Alex Notman (11729) : MUN/SHU -> MUN
- David Healy (14021) : MUN/PTV -> MUN
- Brian McGovern (227614) : ARS/QPR -> ARS
- Ashley Cole (3182) : ARS/CPL -> ARS
- Stephen Hughes (10400) : ARS/EVE/FUL -> ARS
- Luís Boa Morte (3422) : ARS/SOU -> SOU
- Christopher Wreh (15712) : ARS/BIR -> ARS
- Mark Jackson (48257) : LEE/BNS -> LEE
- Jason Wilcox (3320) : LEE/BLB -> BLB
- Darren Huckerby (3136) : LEE/COV -> COV
- Phil Babb (3283) : LIV/TRM -> LIV
- Stephen Wright (4126) : LIV/CRW -> CRW
- ... et 101 autres

**Noms de saison proposés :**
- Trente buts pour Phillips
- Au tournant du millénaire
- Les canonniers de Sunderland

## Vérifié

- Champion : Manchester United (91 points), conforme à Wikipédia.
- Promus en Premier League : Charlton Athletic (1er), Manchester City (2e), Ipswich Town (3e, barrages), conforme.
- Relégués de Premier League : Wimbledon (18e), Sheffield Wednesday (19e), Watford (20e), conforme.
- Relégués de First Division : Walsall (22e), Port Vale (23e), Swindon Town (24e), conforme.
- Vérificateur : RELEVÉ VERT : ANG-1999-00, 40 clubs, 760 joueurs retenus.
- Test de non-régression : les effectifs d'Arsenal (ARS) et Manchester United (MUN) dans le jeu (ANG 1992-93) ont été recoupés avec les pages Transfermarkt 99/00. Le parser retrouve 36 joueurs pour Arsenal et 41 pour Man Utd, avec les bons postes et dates de naissance. Les noms courts, les postes et les dates de naissance correspondent aux conventions du jeu.

## Doutes

- **Clubs sans données TM** (kader manquant ou anti-robot) : CHL. Ces clubs n'ont aucun joueur dans le relevé. Il faudra un rattrapage ou une source alternative.

- Les joueurs avec arrivee=1 (date « Im Team seit » postérieure à la saison) n'ont pas tous été recoupés avec l'historique de transferts (ceapi). Thierry Henry par exemple montre 2012 car TM ne garde que la dernière arrivée. Ces cas sont conservés par défaut (arrivee=1), sauf si un recoupement les place explicitement ailleurs.
- Les postes Linksaußen et Rechtsaußen (ailiers) sont classés M conformément aux règles du jeu ; Transfermarkt les range parmi les attaquants.
