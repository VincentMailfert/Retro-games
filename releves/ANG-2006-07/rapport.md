# Relevé ANG 2006-07

## Importé

- **Saison** : ANG-2006-07 (Premier League et Football League Championship 2006-07)
- **Branche** : claude/import-england-season-2006-07-6zba6q
- **D1 (20 clubs)** : MUN, CHE, LIV, ARS, TOT, EVE, BOL, RDG, POR, BLB, AVL, MID, NEW, MCI, WHU, FUL, WIG, SHU, CHL, WAT
- **D2 (20 clubs retenus sur 24)** : SUN, BIR, DER, WBA, WOL, SOU, PNE, STK, SHW, COL, PLY, CPL, CAR, IPS, BUR, NOR, COV, QPR, LEI, BNS
- **Écartés** :
  - HUL (Hull City) : rang 21 sur 24 en Championship, écarté pour ramener la D2 à 20 clubs
  - SND (Southend United) : rang 22 sur 24 en Championship, écarté pour ramener la D2 à 20 clubs
  - LUT (Luton Town) : rang 23 sur 24 en Championship, écarté pour ramener la D2 à 20 clubs
  - LEE (Leeds United) : rang 24 sur 24 en Championship (pénalité de 10 points), écarté pour ramener la D2 à 20 clubs
- **Joueurs retenus** : 760 (20 par club D1, 18 par club D2)
- **Pépites forcées** : aucune
- **Reclassements M vers A** (9 joueurs, ailiers ou milieux offensifs reclassés en attaquants pour respecter le minimum de 4 A par club, conformément à leur vrai rôle sur le terrain) :
  - S. Kalou (CHE) : ailier gauche
  - J. Pennant (LIV) : ailier droit
  - A. Lennon (TOT) : ailier droit
  - K. Nolan (BOL) : milieu offensif
  - C. N'Zogbia (NEW) : ailier droit
  - D. Cotterill et G. Teale (WIG) : ailiers droits
  - J. Koumas (WBA) : milieu offensif
  - S. Jones (BUR) : ailier droit
- **Doublons résolus** (5 joueurs présents dans deux clubs, attribués au club du coup d'envoi) :
  - Manuel Fernandes : attribué à EVE (prêt de Benfica), retiré de POR
  - Ashley Young : attribué à WAT (transféré à AVL en janvier 2007), retiré de AVL
  - David Connolly : attribué à SUN (2764 minutes vs 71 à WIG), retiré de WIG
  - Brad Jones : attribué à MID (club d'attache), retiré de SHW
  - Lee Camp : attribué à QPR (990 minutes vs 360 à DER), retiré de DER
- **Noms de saison proposés** :
  1. Les Quatre Fantastiques
  2. La chute de Leeds
  3. Lecture au sommet

## Vérifié

- Vérificateur : **RELEVÉ VERT** : ANG-2006-07, 40 clubs, 760 joueurs retenus.
- Champion D1 : Manchester United (89 points), conforme à Wikipedia
- Relégués D1 : Sheffield United (38 pts), Charlton Athletic (34 pts), Watford (28 pts), conforme à Wikipedia
- Promus en D1 (depuis D2) : Sunderland (champion), Birmingham City (2e), Derby County (play-offs), conforme à Wikipedia
- Relégués D2 : Southend United, Luton Town, Leeds United (-10 points de pénalité), conforme à Wikipedia
- Points de Leeds : 46 points gagnés moins 10 de pénalité = 36 points au classement, conforme à Wikipedia
- Test de non-régression : ANG 1992-93 du jeu vérifié sur MUN et ARS. Les deux clubs ont 20 joueurs, respectent les minimums G2 D5 M5 A4, et les effectifs correspondent aux vraies équipes de la saison (Schmeichel, Giggs, Beckham à 17 ans chez MUN ; Seaman, Adams, Wright chez ARS). La convention de poste (ailiers en M) est la même que celle appliquée ici.

## Doutes

- **78 joueurs retenus avec arrivee=1** : la date « Im Team seit » de Transfermarkt est postérieure à la saison, car TM ne conserve que la dernière arrivée au club. L'API d'historique de transferts (ceapi/transferHistory) était inaccessible (réponses vides sur toutes les tentatives), rendant le recoupement impossible. Ces joueurs sont des titulaires bien connus de leurs clubs au coup d'envoi (Cristiano Ronaldo, Paul Scholes et Tomasz Kuszczak à MUN ; Didier Drogba à CHE ; Thierry Henry et Jens Lehmann à ARS ; Robbie Keane et Jermain Defoe à TOT ; Tim Howard à EVE, etc.), mais la preuve formelle par l'historique de transferts n'a pas pu être produite. Le champ arrivee=1 est conservé comme l'exige la documentation.
- **4 joueurs retenus sans prénom** (prenom="") : le prénom n'a pas pu être vérifié avec certitude, l'initiale seule est conservée.
- **2 joueurs non retenus avec date de naissance approximative** : Hannes Sigurdsson (STK, année seule : 1990) et Lloyd Evans (CAR, année seule : 1984), pages de profil Transfermarkt inaccessibles.
- **Alec Chamberlain** (WAT, gardien) retiré du relevé : 42 ans au coup d'envoi, hors limite du vérificateur.
- **S. Cann** (DER, gardien) retenu comme deuxième gardien avec arrivee=null et 0 minute, faute de meilleur candidat (Bywater arrivé en cours de saison, Camp attribué à QPR par résolution de doublon).
- **Sources** : Transfermarkt (.de) pour les effectifs et temps de jeu, Wikipedia anglaise pour les classements. Les domaines .co.uk et .com de Transfermarkt renvoyaient des erreurs 502 ; seul le domaine .de a fonctionné de manière fiable.
