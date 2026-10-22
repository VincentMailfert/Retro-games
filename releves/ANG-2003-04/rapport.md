# Relevé ANG 2003-04

Relevé fait en séance, sur le poste de l'auteur, le 22/10/2026 (pas en session cloud).

## Importé

**Premier League (20 clubs, aucun écarté)** : ARS, CHE, MUN, LIV, NEW, AVL, CHL, BOL, FUL, BIR, MID, SOU, POR, TOT, BLB, MCI, EVE, LEI, LEE, WOL. Arsenal champion avec 90 points, invaincu en trente-huit journées.

**First Division (24 clubs, 20 retenus)** : NOR, WBA, SUN, WHU, IPS, CPL, WIG, SHU, RDG, MIW, STK, COV, CAR, FOR, PNE, WAT, ROT, CRW, DER, GIL.

**Écartés** :
- Burnley (BUR) : 19e de l'échelon du dessous, effectif incomplet au coup d'envoi (18 hommes, G1 D8 M7 A2) : remplir demanderait un joueur inventé
- Wimbledon (WIM) : 24e et dernier remplissable du classement de l'échelon du dessous, écarté par le rang pour ramener la division à vingt clubs
- Bradford City (BRD) : 23e et dernier remplissable du classement de l'échelon du dessous, écarté par le rang pour ramener la division à vingt clubs
- Walsall (WAL) : 22e et dernier remplissable du classement de l'échelon du dessous, écarté par le rang pour ramener la division à vingt clubs

**760 joueurs retenus** (20 par club en haut, 18 en bas), tous relevés sur Transfermarkt sous les identifiants de `releves/clubs-tm.json`, avec leurs vraies minutes. 277 noms courts existent déjà dans le jeu.

**Dates d'arrivée** : 125 dates corrigées par l'historique de transferts (le cas Lehmann, que Transfermarkt donne « arrivé en 2011 », date de son retour). Aucun retenu n'est arrivé en cours de saison. **137 doublons** réglés par identifiant, au club du coup d'envoi.

**Pépites forcées (11)** : jeunes que le tri aux minutes écartait et que le même club fait beaucoup jouer la saison suivante :
- Cesc Fàbregas (ARS, 16 ans, 192 min, 3097 min la saison suivante)
- Steven Taylor (NEW, 17 ans, 100 min, 1553 min la saison suivante)
- Zesh Rehman (FUL, 20 ans, 34 min, 1992 min la saison suivante)
- Stephen Jordan (MCI, 21 ans, 9 min, 1669 min la saison suivante)
- Matthew Kilgallon (LEE, 19 ans, 721 min, 2511 min la saison suivante)
- Aaron Lennon (LEE, 16 ans, 394 min, 1803 min la saison suivante)
- Ben Watson (CPL, 18 ans, 1075 min, 1657 min la saison suivante)
- Mark Phillips (MIW, 21 ans, 7 min, 2340 min la saison suivante)
- Lloyd Doyley (WAT, 21 ans, 895 min, 2600 min la saison suivante)
- Hamer Bouazza (WAT, 18 ans, 493 min, 1559 min la saison suivante)
- Lee Camp (DER, 19 ans, 0 min, 4546 min la saison suivante)

**Noms de saison proposés** : « Trente-huit sans défaite », « Les Invincibles de Highbury », « Personne ne bat Arsenal ».

## Vérifié

- Vérificateur : voir la dernière ligne de `node releves/verifie-releve.cjs releves/ANG-2003-04`.
- Classements relevés sur Wikipedia, cohérence des points vérifiée par le vérificateur ; Arsenal champion invaincu (26 victoires, 12 nuls), Norwich et West Bromwich promus directement, Crystal Palace par les barrages ; Leicester, Leeds et Wolverhampton relégués.
- Identité des clubs : joueurs retenus en commun avec la saison voisine, 11.8 en moyenne sur 37 clubs (2002-03) et 9.8 en moyenne sur 40 clubs (2004-05).
- Le relevé faux de la première nuit (Bologne sous le nom de West Bromwich, un club espagnol sous celui de Wigan) est remplacé : West Bromwich a Hoult, Gregan, Gaardsøe, Koumas ; Wigan a Filan, Bullard, Ellington.

## Doutes

- **Crewe Alexandra (CRW)** : l'alerte du vérificateur vient de ce, qu'aucune saison voisine relevée ne contient, donc son identité n'est contrôlée que par l'identifiant Transfermarkt.
- **Burnley écarté bien que 19e** : un seul gardien et deux attaquants présents au coup d'envoi.
- Dave Beasant (FUL) : 44 ans, retiré de la liste
- Alan Knight (POR) : 42 ans, retiré de la liste
- Craig Mudd (ROT) : aucune date de naissance, retiré de la liste
- Sam Morrow : « S. Morrow » est déjà pris par un autre homme, il porte son nom entier
- Michael Stewart : « M. Stewart » est déjà pris par un autre homme, il porte son nom entier
- Jack Smith : « J. Smith » est déjà pris par un autre homme, il porte son nom entier
- Paul Edwards : « P. Edwards » est déjà pris par un autre homme, il porte son nom entier
- Leon Johnson : « L. Johnson » est déjà pris par un autre homme, il porte son nom entier
- Gareth Williams et Richard Walker n'ont aucun nom libre dans le jeu (nom court et nom entier déjà portés par d'autres hommes) : non retenus.
- 41 retenus sans prénom à part : ce sont des noms en toutes lettres (homonymes : Roy Keane, Andy Cole…) et des mononymes (Laurén, Jardel, Yakubu, Kléberson), qui n'en ont pas besoin.
