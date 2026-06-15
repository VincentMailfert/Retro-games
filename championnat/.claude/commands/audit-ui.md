---
description: Audite l'interface de D1 Manager via le navigateur, détecte bugs et défauts d'UX, corrige et re-vérifie
---

Tu es l'inspecteur-réparateur UI de D1 Manager 95-96 (fichier `d1-manager-9596.html`).
Objectif : jouer le jeu dans un vrai navigateur, repérer ce qui cloche visuellement ou
ergonomiquement, corriger dans le fichier, puis prouver le correctif par une nouvelle capture.

## Parcours à exécuter (via le serveur MCP Playwright)
1. Ouvre le fichier `d1-manager-9596.html` en local (file://).
2. Sur l'écran d'accueil : vérifie la liste des clubs, les blasons, les statuts colorés.
   Capture en 1280px de large ET en 390px (mobile).
3. Choisis un club (par défaut **RC Lens**), ouvre sa fiche de présentation, lance la partie.
4. Joue **5 journées** en « résultat instantané » :
   - à chaque écran rencontré (calendrier, classement, effectif, mercato, finances, club,
     match, overlay de moment, incident, débrief, fenêtre « les temps changent »),
     capture en desktop et en mobile ;
   - relève **toutes les erreurs console** (`pageerror`, messages d'erreur).
5. Résous au moins un **moment de match** interactif (penalty ou tacle) et un **incident**
   de vie de club, pour vérifier que les overlays s'ouvrent et se ferment proprement.
6. Ouvre l'écran **Finances** et vérifie l'affichage des trois offres de sponsors.

## Ce que tu cherches
- Texte qui déborde, se chevauche ou est illisible (surtout en mobile 390px).
- Boutons inatteignables, trop petits au doigt, ou qui restent affichés après un choix.
- Overlays mal centrés, fond transparent, ou qui ne se ferment pas.
- Tableaux non scrollables sur mobile.
- Incohérences de palette (hors bleu nuit / jaune / cyan).
- Toute erreur JavaScript en console.

## Ce que tu fais ensuite
1. Dresse la liste des problèmes, classés par gravité (bloquant → cosmétique).
2. Corrige directement dans `d1-manager-9596.html`, par **éditions chirurgicales**
   (jamais de réécriture complète).
3. Après correction, re-lance le parcours sur les écrans concernés et capture l'avant/après.
4. Avant de conclure : extrais le JS et vérifie la syntaxe avec `node --check`,
   puis lance le harnais headless de régression sur 6 saisons.
5. Incrémente le numéro de version en pied de page.
6. Résume en français (style article de presse) ce qui a été trouvé et corrigé.

## Garde-fous
- Ne touche pas au calibrage du moteur (~2,3 buts/match) sans raison explicite.
- Respecte la datation par époque des incidents et sponsors.
- Ne réintroduis pas les bugs listés dans CLAUDE.md.
