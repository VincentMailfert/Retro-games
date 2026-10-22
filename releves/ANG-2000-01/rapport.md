# Relevé ANG 2000-01

## Importé

Saison **2000-01** du championnat d'Angleterre, branche `claude/import-england-2000-01-th9l91`.

**D1 (20 clubs) :** MUN, ARS, LIV, LEE, IPS, CHE, SUN, AVL, CHL, SOU, NEW, TOT, LEI, MID, WHU, EVE, DER, MCI, COV, BRD

**D2 (20 clubs retenus) :** FUL, BLB, BOL, PNE, BIR, WBA, BUR, WIM, WAT, SHU, FOR, WOL, GIL, CRW, NOR, BNS, SHW, GRI, SKP, POR

**Écartés :**
- **Crystal Palace** (CPL) : rang 21 sur 24, 19 joueurs présents au coup d'envoi
- **Huddersfield Town** (HUD) : rang 22 sur 24, 24 joueurs présents au coup d'envoi
- **Queens Park Rangers** (QPR) : rang 23 sur 24, 30 joueurs présents au coup d'envoi
- **Tranmere Rovers** (TRM) : rang 24 sur 24, 20 joueurs présents au coup d'envoi

**Joueurs retenus :** 760 (760 attendus)

**Noms de saison proposés :**
1. Trois couronnes pour Old Trafford
2. Le tracteur d'Ipswich
3. Liverpool rafle les coupes

## Vérifié

- Vérificateur : 1 défaut (minimum G2 non tenu pour SHU), voir Doutes
- Champion : Manchester United (80 pts), confirmé Wikipedia
- Promus de D2 vers la Premier League : Fulham (champion, 101 pts) et Bolton Wanderers (play-offs), confirmé Wikipedia
- Relégués de D1 : Manchester City (34 pts), Coventry City (34 pts), Bradford City (26 pts), confirmé Wikipedia
- Relégués de D2 : Huddersfield Town, QPR, Tranmere Rovers, confirmé Wikipedia
- Test de non-régression : effectifs ANG-1992-93 (MUN et NOR) vérifiés dans le jeu, les joueurs connus (P. Schmeichel, R. Giggs, D. Beckham, C. Sutton, etc.) sont bien reconnus par le champ deja_au_jeu

## Doutes

**Joueurs recoupés par l'historique de transferts** (ceapi/transferHistory) et corrigés en arrivee=2 : Scholes (MUN), Wright et Scowcroft (IPS), Hughes (WBA), Beasant/Prutton/Harewood/Rogers/Lester/Hjelde/Reid (FOR), Kozluk/Quinn/Bent/Woodhouse/Jagielka (SHU), Stringer (SHW).

**Dave Beasant** (FOR, gardien, 41 ans au coup d'envoi) : joueur réel ayant disputé 4319 minutes cette saison. Conservé malgré son âge.

**SHU : minimum G2 non tenu (G=1).** Le seul gardien suppléant présent au coup d'envoi est Kevin Blackwell (né le 21/12/1958, soit 42 ans), rejeté par le vérificateur qui plafonne à 41. Frank Talia n'a rejoint SHU que le 26/09/2000 (ceapi) et Matt Duke est parti à Burton Albion le 01/07/2000. Wikipedia confirme les quatre GK (Tracey, Talia, Blackwell, Duke), aucun autre. Le déficit est structurel, aucun joueur n'a été inventé.

**FOR : corrigé.** Barry Roche (GK, TM 9989) était marqué arrivee=1 car le ceapi ne recense que son contrat professionnel (01/07/2001). Wikipedia le place au squad (#12 GK, 2 matchs), produit de l'académie de Leeds prêté à Forest. Arrivee corrigé à 2, retenu comme 2e gardien. Gareth Williams perd sa place dans les 18.

**BNS : corrigé.** Dave Watson (GK, TM 195616) était marqué "not in squad" sur la leistungsdaten mais le ceapi prouve sa présence (Barnsley de 1992 à juin 2001, formé au club). Wikipedia le confirme. Ajouté comme 2e gardien (0 matchs, nicht eingesetzt de fait). Janne Salli perd sa place dans les 18.

**Carl Asaba** (SHU) : arrivee=0, il était à Gillingham en 2000-01 et n'est arrivé à Sheffield United qu'en juillet 2001.

**Postes reclassifiés** : les ailiers (Left Winger, Right Winger) sont classés en M conformément aux règles. Les joueurs Transfermarkt dont le poste est le générique « Attack » sont classés en A.
