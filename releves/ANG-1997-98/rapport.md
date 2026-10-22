# Relevé ANG 1997-98

## Importé

- **Saison** : ANG 1997-98 (Premier League et Football League First Division)
- **Branche** : `claude/import-1997-98-season-oe7n21`
- **D1** : 20 clubs : ARS, MUN, LIV, CHE, LEE, BLB, AVL, WHU, DER, LEI, COV, SOU, NEW, TOT, WIM, SHW, EVE, BOL, BNS, CPL
- **D2** : 20 clubs sur 24 : FOR, MID, SUN, CHL, IPS, SHU, BIR, SKP, WOL, WBA, CRW, OXF, BRD, TRM, NOR, HUD, BRY, SWI, PTV, POR
- **Écartés** : QPR (21e au classement, parmi les quatre derniers) ; MCI (22e au classement, parmi les quatre derniers) ; STK (23e au classement, parmi les quatre derniers) ; RDG (24e au classement, parmi les quatre derniers)
- **Joueurs retenus** : 760
- **Pépites forcées** : aucune
- **Noms proposés** : « Wenger pose ses valises » ; « Le doublé des Gunners »
- **Sources** : Transfermarkt (effectifs 44 clubs via Playwright sur transfermarkt.com), Wikidata SPARQL (dates de naissance par TM ID P2446, postes MUN/LIV par P413), Wikipedia (classements)

## Vérifié

- Vérificateur : ROUGE, 2 défauts. BRY : G1 (minimum G2 non tenu). PTV : G1 (minimum G2 non tenu). Irréparable sans inventer un joueur (voir Doutes).
- **Champion** : Arsenal (78 pts), conforme à Wikipedia
- **Relégués** : Bolton (18e), Barnsley (19e), Crystal Palace (20e), conforme
- **Promus** : Nottingham Forest (1er), Middlesbrough (2e), Charlton Athletic (4e, barrages), conforme
- **Non-régression** : ANG 1995-96, MUN : P. Schmeichel (G), R. Giggs (M), E. Cantona (A) ; ARS : D. Seaman (G), T. Adams (D), I. Wright (A) ; noms concordants.

## Doutes

- Dates d'arrivée (Im Team seit) non extraites du domaine .com de Transfermarkt (format DD/MM/YYYY non capté par le parseur initial ; l'IP a été bloquée avant la correction). Les joueurs ayant joué sont marqués arrivee=2, les autres null. Le recoupement par ceapi/transferHistory n'a pas pu être fait.
- 131 doublons résolus par les minutes (faute de Im Team seit), critère moins sûr que le coup d'envoi.
- Minimum de poste non tenu pour deux clubs (G1 au lieu de G2) :
  - BRY n'a qu'un seul gardien (Dean Kiely). Transfermarkt, Wikipedia (1997-98 Bury F.C. season) et la base neilbrown ne connaissent aucun autre gardien au club cette saison. Les Sealey (TM 176019) est marqué « not in squad ». Bruce Grobbelaar n'arrive qu'en 1998-99.
  - PTV n'a qu'un seul gardien (Paul Musselwhite). Le 2e gardien Arjan van Heusden (TM 88955) est un doublon avec Oxford United (1230 min chez Oxford contre 450 chez Port Vale) et lui est attribue. Aucun autre gardien dans la source.
  - Cinq sources consultees pour chaque : TM kader, TM leistungsdaten, Wikipedia saison du club, neilbrown, TM saisons voisines (1996-97, 1998-99). Defaut irreparable sans inventer un joueur.
- 14 homonymes résolus par prénom complet : R. Keane, M. Hughes, S. Campbell, A. Williams, C. Armstrong, D. Watson, D. Ferguson, A. Thompson, D. Holdsworth, C. Fleming, M. Gray, P. Butler, D. Smith, M. Robinson
