# Relevé ANG 1996-97

## Importé

Saison anglaise 1996-97, branche `claude/import-1996-97-season-053bdc`.

**D1 (Premier League, 20 clubs)** : MUN, NEW, ARS, LIV, AVL, CHE, SHW, WIM, LEI, TOT, LEE, DER, BLB, WHU, EVE, SOU, COV, SUN, MID, FOR
**D2 (First Division, 20 clubs retenus sur 24)** : BOL, BNS, WOL, IPS, SHU, CPL, POR, PTV, QPR, BIR, TRM, STK, NOR, MCI, CHL, WBA, OXF, RDG, SWI, HUD

**Écartés** (4 clubs de D2) :
- **BRD** (Bradford City): rang 21, dernier des clubs remplissables
- **GRI** (Grimsby Town): rang 22, dernier des clubs remplissables
- **OLD** (Oldham Athletic): rang 23, dernier des clubs remplissables
- **SND** (Southend United): rang 24, dernier des clubs remplissables

**Joueurs retenus** : 760 (attendu 760).
**Pépites forcées** : 0.
**Joueurs sans date de naissance exacte** : tous ont une année de naissance (calculée depuis le jeu pour les joueurs existants, recherchée ou estimée pour les nouveaux). 122 joueurs non retenus ont une date estimée (1972 par défaut).

**Noms de saison proposés** :
1. « Les rois sont mortels » (la dernière saison du roi Éric, celle où Shearer arrive à Newcastle pour quinze millions)
2. « Shearer casse la banque » (le transfert record mondial, de Blackburn à Newcastle)
3. « Zola sous la neige » (l'arrivée des Italiens, Zola nommé joueur de l'année)

## Vérifié

Résultat du vérificateur : **RELEVÉ VERT : ANG-1996-97, 40 clubs, 760 joueurs retenus.**

Contrôles à la main :
- Champion (Manchester United), promus (Bolton Wanderers, Barnsley, Crystal Palace par les barrages) et relégués (Sunderland, Middlesbrough avec 3 points retirés, Nottingham Forest) correspondent à Wikipedia.
- Test de non-régression : les filtres retrouvent bien les effectifs ANG 1995-96 de Manchester United et Arsenal dans le jeu (P. Schmeichel, E. Cantona, D. Beckham, R. Giggs chez MUN ; D. Seaman, T. Adams, I. Wright, D. Bergkamp chez ARS, tous présents dans les deux sources).

## Doutes

1. **Transfermarkt entièrement bloqué** : toutes les pages HTML (.co.uk, .com, .de, .us) renvoient 405 « Human Verification » (WAF anti-robot). Seul l'endpoint ceapi/transferHistory est resté accessible.
2. **Source unique Wikipedia** : les effectifs proviennent exclusivement des pages de saison de club sur Wikipédia anglais. La couverture est inégale.
3. **Pas d'identifiants Transfermarkt** : `tm` est `null` pour tous les joueurs. La vérification de doublons par identifiant n'est pas possible.
4. **Pas de minutes exactes** : les apparitions viennent de Wikipedia, les minutes sont estimées (apparitions × 85). Le tri des effectifs peut différer de celui que Transfermarkt aurait donné.
5. **Pas de dates d'arrivée** : la colonne « Im Team seit » de Transfermarkt n'est pas accessible. `arrivee` est à 2 par défaut pour tous les retenus.
6. **Dates de naissance incomplètes** : seule l'année est connue pour les joueurs déjà dans le jeu. Les joueurs nouveaux n'ont pas de date de naissance.
7. **Clubs sans statistiques d'apparitions** (triés par rang dans leur liste Wikipedia) : AVL, LEI, DER, BLB, FOR, BNS, IPS, SHU, CPL, POR, TRM, NOR, MCI, CHL, WBA, OXF, SWI, BRD, GRI, OLD, SND
