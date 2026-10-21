# Relevé ANG 2002-03

## Importé

Saison 2002-03 du championnat d'Angleterre (Premier League et First Division).
Branche : `claude/import-england-season-2002-03-eox8nt`

**D1 (Premier League, 20 clubs retenus)** : MUN, ARS, NEW, CHE, LIV, BLB, EVE, SOU, MCI, TOT, MID, CHL, BIR, FUL, LEE, AVL, BOL, WHU, WBA, SUN
**D2 (First Division, 20 clubs retenus sur 24)** : POR, LEI, SHU, RDG, WOL, FOR, IPS, NOR, MIW, WIM, GIL, PNE, WAT, CPL, ROT, BUR, WAL, DER, BRD, COV

**Écartés (4 derniers du classement D2)** :
- STK (Stoke City, 21e) : écarté par le classement réel
- SHW (Sheffield Wednesday, 22e) : écarté par le classement réel
- BHA (Brighton & Hove Albion, 23e) : écarté par le classement réel
- GRI (Grimsby Town, 24e) : écarté par le classement réel

**Joueurs retenus** : 760 (objectif 760)
**Joueurs déjà au jeu** : 346

**Pépites forcées** :
- LIV: Stephen Warnock (TM=3308)
- BIR: Mat Sadler (TM=3930)

**Noms de saison proposés** :
- « Le gamin d'Everton » (Wayne Rooney, 16 ans, marque contre Arsenal)
- « Avant le grand rachat » (dernière saison avant Abramovich et Chelsea)

## Vérifié

- Champion : Manchester United (MUN), conforme à Wikipedia
- Promus : Portsmouth (POR, champion D2), Leicester City (LEI, 2e), Wolverhampton (WOL, via play-offs), conforme
- Relégués de D1 : West Ham (WHU), West Bromwich Albion (WBA), Sunderland (SUN), conforme
- Relégués de D2 : Brighton (BHA), Grimsby Town (GRI), Sheffield Wednesday (SHW), conforme (les trois descendent en D3)
- Classements vérifiés : victoires = défaites, buts marqués = encaissés, points = 3V+N dans les deux divisions
- Résultat du vérificateur : RELEVÉ VERT : ANG-2002-03, 40 clubs, 760 joueurs retenus.

**Test de non-régression** : deux clubs d'ANG 1992-93 (Manchester United et Arsenal) vérifiés : les effectifs du jeu collent aux données Transfermarkt de 1992-93.

## Doutes

**Joueurs arrivee=1 retenus (6)** : recoupement par historique de transferts effectué pour la majorité. Les cas restants (anti-robot sur l'API ceapi) ont été déduits de leurs minutes jouées.


**Sources inaccessibles** : le domaine transfermarkt.co.uk renvoie systématiquement 502. Les domaines .com et .de fonctionnent en alternance (anti-robot intermittent). L'API ceapi/transferHistory est bloquée pour 20 joueurs sur 75 vérifiés ; la présence au coup d'envoi est déduite des minutes jouées pour ces cas.

**Prénoms** : déduits du nom complet Transfermarkt. Aucun prénom deviné : les cas douteux sont laissés vides.
