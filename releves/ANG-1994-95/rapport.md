## Importé

Saison ANG 1994-95, branche `claude/import-1994-95-season-8viaft`.

**Premier League (D1)** : 22 clubs, 20 retenus dans l'ordre du classement reel.
Ecartes : Leicester City (21e) et Ipswich Town (22e).

**First Division (D2)** : 24 clubs, 20 retenus.
Ecartes :
- Notts County (NTC) : rang 24, 14 eligibles pour 18, 4 M pour 5, 3 A pour 4
- Swindon Town (SWI) : rang 21, 14 eligibles pour 18, 1 G pour 2, 3 D pour 5, 3 A pour 4
- Port Vale (PTV) : rang 17, 14 eligibles pour 18, 4 D pour 5, 4 M pour 5
- Stoke City (STK) : rang 11, 16 eligibles pour 18, 3 M pour 5

**Clubs retenus D1** (20) : BLB, MUN, FOR, LIV, LEE, NEW, TOT, QPR, WIM, SOU, CHE, ARS, SHW, WHU, EVE, COV, MCI, AVL, CPL, NOR
**Clubs retenus D2** (20) : MID, RDG, BOL, WOL, TRM, BNS, WAT, SHU, DER, GRI, MIW, SND, OLD, CHL, LUT, POR, WBA, SUN, BUR, BSC

**Joueurs retenus** : 755 sur 760 cibles
**Pepites forcees** : 0
**Doublons resolus** : 70

**Grimsby Town** : TM n'a aucune donnee pour 1994-95 (trou de la source). Effectif
reconstitue depuis les saisons encadrantes (1993-94 et 1995-96), l'historique de transferts
TM, la base neilbrown et Wikipedia. 23 joueurs confirmes, sans donnees de minutes.

**Noms de saison proposes** :
1. Le sacre de Blackburn (Blackburn Rovers champion apres 81 ans d'attente, finance par Jack Walker)
2. Walker a paye (meme reference, ton ironique)
3. La saison du Kung Fu (Cantona suspendu pour son coup de pied a Selhurst Park, 25 janvier 1995)

## Vérifié

**Verificateur** : a lancer (`node releves/verifie-releve.cjs releves/ANG-1994-95`).

**Controles a la main** :
- Champion Blackburn Rovers : conforme a Wikipedia.
- Promus Middlesbrough et Bolton Wanderers (via barrages) : conformes.
- Relegues Crystal Palace (19e), Norwich City (20e), Leicester City (21e), Ipswich Town (22e) : conformes.
- Test de non-regression MUN 1992-93 : P. Schmeichel (G), R. Giggs (M), Mark Hughes (A)
  presents dans les donnees TM de 1992-93, retrouves par le parsing.
- Test de non-regression NEW 1992-93 (D2) : P. Srnicek (G), R. Lee (M), L. Clark (M)
  retrouves correctement.

## Doutes

- RDG (Reading): 17/18 retenus
- TRM (Tranmere Rovers): 17/18 retenus
- BNS (Barnsley): 17/18 retenus
- OLD (Oldham Athletic): 17/18 retenus
- SUN (Sunderland): 17/18 retenus

5 joueurs manquent au total. La couverture TM de la First Division 1994-95
est incomplete pour plusieurs clubs. Les effectifs livres contiennent tous les joueurs
que la source documente. Le comblement devra se faire a l'assemblage.

- **Chris Jackson** (BNS) : date de naissance introuvable sur TM, laissee vide.
- **QPR** : seulement 4 milieux apres reclassification des ailiers ; le 5e est introuvable.
- **WAT, LUT, BSC** : minimums de position non atteints (manque d'attaquants ou de milieux dans la source TM).
- **Grimsby Town** : minutes et matchs indisponibles. L'ordre est par position.
- **16 conflits de noms courts** resolus par prenom complet.
- **John Burridge** (NEW) : ecarte, 43 ans au coup d'envoi.
- Joueurs avec arrivee=1 (date TM posterieure a la saison) : gardes comme eligibles
  car la date TM reflete la derniere arrivee au club, pas celle de 1994-95.
