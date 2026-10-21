# Relevé ANG 2001-02

## Importé

Saison 2001-02 du championnat d'Angleterre, branche `claude/import-2001-02-season-az9tf6`.

**D1 (Premier League, 20 clubs retenus)** : ARS, LIV, MUN, NEW, LEE, CHE, WHU, AVL, TOT, BLB, SOU, MID, FUL, CHL, EVE, BOL, SUN, IPS, DER, LEI.

**D2 (First Division, 20 clubs retenus sur 24)** : MCI, WBA, WOL, MIW, BIR, NOR, BUR, PNE, WIM, CPL, COV, GIL, SHU, WAT, BRD, FOR, POR, WAL, GRI, SHW.

**Écartés (4 clubs)** :
- ROT (Rotherham United, 21e) : dernier des clubs pouvant remplir leurs 18 places
- CRW (Crewe Alexandra, 22e) : dernier des clubs pouvant remplir leurs 18 places
- BNS (Barnsley, 23e) : dernier des clubs pouvant remplir leurs 18 places
- SKP (Stockport County, 24e) : dernier des clubs pouvant remplir leurs 18 places

**760 joueurs retenus** (400 en D1, 360 en D2).

**Pépites forcées** : aucune dans cette passe (tri aux minutes suffisant pour les 40 clubs).

**Reclassifications M vers A** : quelques milieux offensifs reclassés en attaquants pour tenir le minimum de 4 A par club (Harry Kewell à Leeds, Jari Litmanen à Liverpool, entre autres). Chaque cas est documenté dans le champ `remarque` du joueur.

**Noms de saison proposés** :
1. Champions chez l'ennemi
2. Wiltord fait taire Trafford

Arsenal a remporté le doublé Championnat + FA Cup. Le titre a été acquis sur la pelouse de Manchester United (victoire 1-0, but de Wiltord), ce qui est l'image de la saison.

## Vérifié

**Vérificateur** : `node releves/verifie-releve.cjs releves/ANG-2001-02` exécuté après chaque correction.

**Contrôles manuels** :
- Champion D1 : Arsenal (87 pts), conforme à Wikipedia. Relégués : Ipswich Town (18e), Derby County (19e), Leicester City (20e).
- Champion D2 : Manchester City (99 pts, 108 buts). Promus : Man City (auto), West Bromwich Albion (auto), Birmingham City (play-offs).
- Test de non-régression : vérifié sur deux clubs de ANG 1992-93 (Arsenal et Manchester United). Les effectifs du jeu correspondent aux joueurs que le filtre retrouve sur les pages Transfermarkt de cette saison.

## Doutes

1. **Preston North End** : aucune page Transfermarkt accessible (kader ni leistungsdaten, anti-robot sur les trois domaines .co.uk, .com, .de). L'effectif a été reconstitué depuis la page Wikipedia « 2001-02 Preston North End F.C. season ». Les identifiants TM ont été récupérés par recherche individuelle quand c'était possible (21 joueurs sur 33). Les 12 restants ont `tm: null` et `source: "wikipedia"`. Les minutes et les matchs sont à zéro pour tous les joueurs de Preston : le classement interne se fait par l'ordre Wikipedia (titulaires probables en premier). Colin Hendry, listé comme milieu par Wikipedia, a été reclassé défenseur (son vrai poste).

2. **Clubs sans leistungsdaten** : Derby County (22), Newcastle United (762), Burnley (1132) et Walsall (899) n'ont pas de page de temps de jeu récupérable. Le classement interne de leurs joueurs se fait par l'ordre de la page kader de Transfermarkt (généralement triés par temps de jeu).

3. **Joueurs arrivee=1 corrigés en arrivee=2** : environ 60 joueurs dont la date « Im Team seit » de Transfermarkt pointe vers un passage ultérieur au club. Exemples : Shaun Wright-Phillips (Man City, date 01/08/2008), Paul Dickov (Man City, date 03/07/2006), Joey Barton (Man City, date 01/01/2003). Tous étaient au club au coup d'envoi d'août 2001 (academy ou transfert antérieur). L'API de transferts (`ceapi/transferHistory`) est inaccessible (anti-robot), la correction est faite par connaissance de la source.

4. **Joueurs arrivee=None** : environ 70 joueurs n'ont pas de date « Im Team seit » sur la page kader. Arrivee fixée à 2 par défaut (présents au coup d'envoi).

5. **Joueurs hors bornes d'âge (>41 ans)** exclus du relevé : Sven Andersson (WHU, né 1945 selon TM, probablement une erreur de la source), Kevin Blackwell (SHU, né 1958, entraîneur des gardiens enregistré comme joueur), Dave Beasant (POR, né 1959, gardien vétéran), Philip Scott (SHW, né 1942, erreur manifeste de la source).

6. **59 doublons inter-clubs** résolus par la règle du coup d'envoi (arrivee=2 l'emporte sur arrivee=0/1) puis par les minutes en cas d'égalité.

7. **Prénoms** : extraits du nom complet Transfermarkt. Les prénoms vides (`""`) correspondent à des joueurs dont le prénom d'usage est douteux.
