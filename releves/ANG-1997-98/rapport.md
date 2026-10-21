# Relevé ANG 1997-98

## Importé

Saison 1997-98 du championnat d'Angleterre (Premier League et First Division).
Branche : `claude/import-1997-98-season-oe7n21`

**D1 (Premier League), 20 clubs retenus :**
- Arsenal (ARS)
- Manchester United (MUN)
- Liverpool (LIV)
- Chelsea (CHE)
- Leeds United (LEE)
- Blackburn Rovers (BLB)
- Aston Villa (AVL)
- West Ham United (WHU)
- Derby County (DER)
- Leicester City (LEI)
- Coventry City (COV)
- Southampton (SOU)
- Newcastle United (NEW)
- Tottenham Hotspur (TOT)
- Wimbledon (WIM)
- Sheffield Wednesday (SHW)
- Everton (EVE)
- Bolton Wanderers (BOL)
- Barnsley (BNS)
- Crystal Palace (CPL)

**D2 (First Division), 20 clubs retenus :**
- Nottingham Forest (FOR)
- Middlesbrough (MID)
- Sunderland (SUN)
- Charlton Athletic (CHL)
- Ipswich Town (IPS)
- Sheffield United (SHU)
- Birmingham City (BIR)
- Stockport County (SKP)
- Wolverhampton (WOL)
- West Bromwich Albion (WBA)
- Crewe Alexandra (CRW)
- Oxford United (OXF)
- Bradford City (BRD)
- Tranmere Rovers (TRM)
- Norwich City (NOR)
- Huddersfield Town (HUD)
- Bury (BRY)
- Swindon Town (SWI)
- Port Vale (PTV)
- Portsmouth (POR)

**Écartés (4) :**
- Reading (RDG) : 24e, dernier du classement
- Stoke City (STK) : 23e
- Manchester City (MCI) : 22e
- Queens Park Rangers (QPR) : 21e
Les quatre derniers du classement D2, tous remplissables. Aucun club plus haut classé n'avait d'effectif insuffisant.

**Joueurs retenus :** 760
**Pépites forcées :** aucune
**Doublons résolus :** 140 joueurs listé dans deux clubs, arbitrés par les minutes jouées

**Noms de saison proposés :**
1. Wenger prend les commandes
2. Le double d'Arsene

## Vérifié

- Champion : Arsenal, vérifié avec Wikipedia (premier titre de Premier League pour Arsene Wenger)
- Promus de D2 vers la D1 : Nottingham Forest (champion), Middlesbrough (2e), Charlton Athletic (barrages)
- Relégués de D1 : Bolton Wanderers, Barnsley, Crystal Palace (les trois promus de la saison précédente, tous redescendus)
- Relégués de D2 : Manchester City (22e), Stoke City (23e), Reading (24e)
- Vérificateur : 841 défauts, relevé NON conforme (voir Doutes)

**Test de non-régression :** Arsenal et Liverpool, présents en ANG 1995-96 dans le jeu : les joueurs communs (Adams, Bergkamp, Vieira pour Arsenal ; Fowler, McManaman, Redknapp pour Liverpool) sont retrouvés sous le même nom court.

## Doutes

**RELEVÉ INCOMPLET.** Les trois fichiers sont produits et la structure est conforme (40 clubs, 760 joueurs retenus, classements vérifiés), mais des données essentielles manquent.

### Ce qui bloque

1. **Dates de naissance : 503 retenus sur 760 n'ont pas de date de naissance** (66 %).
   La source principale (Transfermarkt) a opposé un CAPTCHA AWS WAF après une trentaine de pages chargées. Les noms, postes et minutes ont été extraits, mais le parseur HTML n'a pas capté les dates (format DD/MM/YYYY non reconnu lors de la première passe). La correction du parseur est arrivée trop tard : l'IP de la session était blacklistée sur les trois domaines (.co.uk, .com, .de). Les dates de naissance ont été cherchées en repli via Wikidata (propriété P2446, identifiant TM du joueur), mais la couverture n'est que de 257 joueurs sur 1329, les joueurs de deuxième division anglaise des années 1990 étant peu référencés.

2. **Dates d'arrivée (Im Team seit) : absentes pour 43 clubs sur 44.**
   Seul Chelsea a pu être parsé correctement (HTML sauvegardé avant le blocage). Pour tous les autres, `arrivee` est fixé à 2 (présent au coup d'envoi) par défaut. Les 140 doublons ont été arbitrés par les minutes jouées et non par « Im Team seit ». Un recoupement par l'API CEAPI (historique de transferts) serait nécessaire.

3. **Positions MUN et LIV :** le premier parseur a stocké le nom du joueur dans le champ position. Corrigé à la main à partir de connaissances footballistiques, sans pouvoir vérifier sur la source.

4. **Minimum de 2 gardiens non tenu pour BRY et PTV.**
   Bury : un seul gardien (Dean Kiely) dans la source, le second (Les Sealey) marqué « not in squad ». Port Vale : un seul gardien éligible (Paul Musselwhite), le second (Arjan van Heusden) attribué à Oxford United en doublon (1230 min contre 450).

### Ce qui a été fait et peut servir de base

- Classements D1 et D2 complets et vérifiés (intégrité victoires/défaites, buts, points).
- 1483 joueurs relevés sur 44 clubs, avec identifiant TM, nom complet, poste et minutes jouées.
- 257 dates de naissance recoupées via Wikidata.
- 36 joueurs Chelsea avec dates de naissance ET dates d'arrivée (parseur HTML corrigé, appliqué au HTML sauvegardé).
- Plateau (20 + 20) et écartés conformes.
- Homonymes (15) résolus.

### Pour compléter

- Relancer le scraping Transfermarkt depuis une IP non bloquée, avec le parseur corrigé (format DD/MM/YYYY pour les dates).
- Ou compléter les dates de naissance via les fiches individuelles de joueurs sur Wikipedia/Wikidata.
- Vérifier les arrivées mid-saison par l'historique de transferts CEAPI quand il sera accessible.
