# Relevé ANG 2005-06

## Importé

Saison : **ANG 2005-06** (Premier League et Football League Championship).  
Branche : `claude/import-2005-06-season-xy93t9`.

### D1 (20 clubs retenus, 20 joueurs chacun)

Chelsea, Manchester United, Liverpool, Arsenal, Tottenham Hotspur, Blackburn Rovers,
Newcastle United, Bolton Wanderers, West Ham United, Wigan Athletic, Everton, Fulham,
Charlton Athletic, Middlesbrough, Manchester City, Aston Villa, Portsmouth, Birmingham City,
West Bromwich Albion, Sunderland.

### D2 (20 clubs retenus, 18 joueurs chacun)

Reading, Sheffield United, Watford, Preston North End, Leeds United, Crystal Palace,
Wolverhampton Wanderers, Coventry City, Norwich City, Luton Town, Cardiff City, Southampton,
Stoke City, Plymouth Argyle, Ipswich Town, Leicester City, Burnley, Hull City,
Sheffield Wednesday, Derby County.

### Écartés (4 clubs)

- **QPR** (rang 21/24) : dernier quart du classement.
- **Crewe Alexandra** (rang 22/24) : relégué, dernier quart du classement.
- **Millwall** (rang 23/24) : relégué, dernier quart du classement.
- **Brighton & Hove Albion** (rang 24/24) : relégué, dernier quart du classement.

Les quatre clubs écartés disposaient d'effectifs suffisants (33 à 41 joueurs documentés).
L'écartement est purement au classement, pour ramener la D2 à 20 clubs.

### Joueurs retenus

760 joueurs retenus au total (400 en D1, 360 en D2).  
Aucune pépite forcée.

### Reclassifications de poste

Quatre ailiers reclassés en attaquants pour atteindre les minimums de poste (4A) :
Craig Bellamy (Blackburn, Left Winger), Gary Teale (Wigan, Right Winger),
Aaron Lennon (Tottenham, Left Winger), Charles N'Zogbia (Newcastle, Left Winger).  
Quatre autres reclassifications en D2 : Darren Currie (Ipswich, Right Winger),
Ryan France (Hull, Right Winger), Micah Hyde (Burnley, Attacking Midfield),
Gavin Mahon (Watford, Attacking Midfield).

### Doublons résolus

Six joueurs présents dans deux clubs ont été attribués au club du coup d'envoi :
- Jermaine Jenas : Tottenham (et non Newcastle).
- Grzegorz Rasiak : Derby (et non Tottenham).
- Andy Gray : Sunderland (et non Burnley).
- Andy Welsh : Sunderland (et non Leicester).
- Jason Jarrett : Norwich (et non Preston).
- Alan Lee : Cardiff (et non Ipswich).

### Noms de saison proposés

1. « Chelsea en roue libre »
2. « La loi du plus fort »
3. « Rien ne bouge au sommet »


## Vérifié

**Vérificateur automatique** : `node releves/verifie-releve.cjs releves/ANG-2005-06` termine par
« rapport.md absent » comme seul défaut avant la création de ce fichier. Avec le rapport en place,
le résultat attendu est **RELEVÉ VERT**.

**Contrôle 1 : champion, promus et relégués.**

- D1 : Chelsea champion (91 pts). Relégués : Birmingham City, West Bromwich Albion, Sunderland.
  Conforme à Wikipedia.
- D2 : Reading champion et promu (106 pts). Sheffield United promu (2e). Watford promu via les barrages (3e).
  Relégués : Crewe Alexandra, Millwall, Brighton & Hove Albion. Conforme à Wikipedia.

**Contrôle 2 : test de non-régression sur ANG 1992-93.**

Manchester United (ANG 1992-93 dans le jeu) : P. Schmeichel (G, 29 ans), G. Pallister, S. Bruce, D. Irwin (D),
P. Ince, R. Giggs (M), Mark Hughes (A), D. Beckham et G. Neville (pépites à 17 ans).  
Leeds (ANG 1992-93) : E. Cantona (A, 26 ans, au club au coup d'envoi avant son transfert en novembre).  
Les effectifs du jeu correspondent aux données Transfermarkt de la saison 1992-93.


## Doutes

### Arrivée de 45 joueurs retenus non vérifiable (arrivee = 1)

L'API de transferts Transfermarkt (`ceapi/transferHistory`) a renvoyé des réponses vides pour
environ la moitié des joueurs testés. Pour 45 joueurs retenus, la date « Im Team seit » de
Transfermarkt pointe après la saison 2005-06 (elle reflète un retour ultérieur, pas le transfert
original). L'historique de transferts n'a pas pu confirmer leur présence au coup d'envoi.

Ces joueurs sont quasi certainement au club au coup d'envoi (ils y ont joué toute la saison),
mais le recoupement automatique a échoué. Exemples marquants : Didier Drogba (Chelsea),
Cristiano Ronaldo et Paul Scholes (Manchester United), Robbie Keane (Tottenham),
James Milner (Aston Villa), Phil Jagielka (Sheffield United), Nicky Shorey et Dave Kitson (Reading).

### Prénoms

Les prénoms sont extraits du nom complet Transfermarkt. Pour les noms monosyllabiques ou les
surnoms (Mido, Juninho, Benjani), le prénom est le nom complet ou son prénom d'usage.
Aucun prénom n'a été laissé vide.

### Positions incertaines

Neuf joueurs mineurs (non retenus pour la plupart) avaient un poste manquant sur Transfermarkt.
Poste attribué d'après la classe CSS de la page (bg_Torwart, bg_Abwehr, etc.) ou défaut M.

### Kevin Poole (Derby)

Retiré de la liste : 42 ans au coup d'envoi, hors de la plage du moteur de jeu (15-40).

### Mark Reilly (Burnley)

Retiré de la liste : date de naissance introuvable sur Transfermarkt (joueur d'académie).
