# D1 MANAGER 95-96 — mémoire projet

## Ce que c'est
Jeu de management de football rétro, **fichier HTML unique autonome** (`index.html`).
Saison de départ : Division 1 française 1995-96, vrais clubs et joueurs, puis carrière multi-saisons.
Hébergé sur GitHub Pages dans le repo `retro-games`, servi à l'URL `…/championnat/`.
Joué par la famille et les amis de l'auteur, qui remontent des retours de playtest.

Philosophie de design : **« la contrainte est le produit »**. On n'ajoute une fonctionnalité que si
elle crée un moment mémorable, dont on parle — pas juste du contenu en plus. L'entre-match doit
toujours « raconter quelque chose ».

## Langue & ton
- **Tout en français.** Code, commentaires, textes du jeu, et réponses à l'auteur : français.
- Réponses à l'auteur : **prose fluide, style article de presse**, pas de listes à puces techniques,
  pas de jargon inutile. L'auteur n'est pas développeur professionnel.
- Le ton du jeu est léger, drôle, parfois sulfureux mais bon enfant. Jamais de registre tragique.

## Architecture (un seul fichier)
- `index.html` : tout est dedans — `<style>`, `<body>` minimal, gros `<script>` vanilla.
- **Aucun framework, aucune dépendance externe, aucun build.** HTML/CSS/JS pur.
- État global dans l'objet `G` (club, journée, joueurs, finances, réputation, incidents…).
- **Sauvegarde** : sauvegarde rapide en 1 clic dans le `localStorage` (clé `SAVEKEY`) — auto à chaque
  fin de journée et à chaque transition d'écran (`montre`), plus un bouton « 💾 Sauvegarder » en pied de
  page et un bouton « Reprendre » sur l'accueil (`sauvegardeLocale`/`chargeLocale`/`infoSauvegarde`, qui
  réutilisent `migre()`). L'export/import d'un fichier JSON reste pour la sauvegarde de secours et le
  transfert entre appareils. Le `localStorage` ne porte PAS de logique de jeu — juste la sérialisation de
  `G` ; et les helpers court-circuitent en mode test (`EN_TEST`) pour ne pas peser sur le harnais.
- Numéro de version centralisé dans la constante `const VERSION` (en tête de script) et recopié aux **deux**
  pieds de page — l'accueil (`Prototype vX.Y`) et le jeu (`D1 MANAGER 95-96 · vX.Y ·`). L'incrémenter à
  chaque livraison **à un seul endroit** (la constante) pour que les testeurs sachent sur quelle version ils
  jouent, et pour éviter que les deux pieds de page se désynchronisent.

## Conventions de code
- **Éditions chirurgicales** : modifier le strict nécessaire, préserver l'art ASCII, les blasons SVG,
  le rendu existant. Ne JAMAIS réécrire le fichier en entier sauf nécessité absolue.
- Constantes de données en MAJUSCULES (`CLUBS`, `STARS`, `INCIDENTS`, `SPONSORS_SULFUREUX`…).
- Helpers courts en camelCase (`clubById`, `onze`, `majReput`, `tireIncident`…).
- Montants en francs (FF) ou millions de francs (MF). Époque oblige.
- Style visuel : télétexte Championship Manager 2 — fond bleu nuit `#0b1626`, jaune `#ffd24a`,
  cyan `#6fd6e8`, monospace. Respecter cette palette.

## Systèmes de jeu en place (ne pas casser)
- **Effectifs réels** : la constante `STARS` (par club) contient de vrais joueurs de la D1 95-96
  `[nom, poste, âge, note, pot]`, curés à la main et **vérifiés par recherche** — viser ~97% de vrais
  noms (16+ par club, postes 2G-5D-5M-4A = `CIBLE`) ; `genJoueur` ne complète qu'à la marge. Un joueur
  est « réel » si `j.reel` (= pas de `j.histoire`). Ne pas réintroduire de faux noms ni de joueur au
  mauvais club/âge ; ne jamais dupliquer un même joueur entre deux clubs **ni entre un club et le vivier**.
- **Vivier du recruteur** (jokers signables hors fenêtre) : `VIVIER` (cibles réelles été 95) + une
  `JOKERS_RESERVE` de vrais noms des années 90. À l'intersaison, le vivier subit ~50% de rotation et se
  recomplète **en priorité avec de vrais noms** (réserve) ; une pépite procédurale n'arrive qu'en
  dépannage si la réserve est momentanément épuisée → ~90%+ (en pratique ~100%) de vrais noms. Les gens
  n'accrochent pas aux jokers factices : garder le vivier réel, et `enJeu` (effectifs D1 **+ D2** + vivier)
  empêche tout doublon d'un joueur entre un club et le vivier.
- **Moteur** : 38 journées, `simuleMatch` calibré à ~2,3 buts/match. Calibrage à préserver.
- **Moments de match** interactifs (penalty pour/contre, tacle, provocation, but de 50m, geste技, etc.).
- **Incidents de vie de club** : catalogue `INCIDENTS` (~38 cartes), tiré ~1 journée sur 3,
  chacun avec un joueur, 2-3 choix, des effets via `eff(j, {…})`. Anti-répétition sur 8 journées.
- **Datation par époque** : chaque incident/sponsor peut porter `de:` et/ou `a:` (années).
  `anneeJeu()` = 1994 + saisonIdx. **Toujours dater un contenu marqué par son époque**
  (réseaux sociaux ≥ 2009, paris en ligne ≥ 2010, etc.). L'anachronisme casse l'immersion.
- **Sponsors maillot** : 3 familles — ringards (terroir, peu payés, image neutre/+), propres, sulfureux
  (pont d'or mais réputation en baisse, parfois défaut de paiement). Noms = pastiches inventés,
  jamais de vraie marque déposée (risque juridique).
- **Équipementiers** (`EQUIPEMENTIERS`, `genEquip`/`choisirEquip`) : 2e source de revenu, **se signe comme un
  sponsor** — rien au début de saison, on choisit parmi des offres (`G.offresEquip`) qui dépendent de la
  **notoriété** (prestige nuancé par la réputation) ; le contrat (`G.equip`) verse un cachet chaque journée et
  expire à l'intersaison (à re-signer). 3 offres types : gros fixe / fixe moindre + prime à la victoire /
  atelier local modeste mais +réputation. Noms **fictifs** (Athéna, Triax, Cheetah, Ombra, Oméga,
  Le Faisan Sportif, Ringbok, Tombola, Sportec Vosges, Le Grand Échalas…) — jamais de vraie marque.
- **Marché des transferts IA** (`transfertIA`) : pendant les fenêtres (`fenetreOuverte`), un club IA achète
  un joueur à un autre, dans la limite de **son** budget (`c.budget`, réapprovisionné à l'intersaison). Règles :
  ne vend que le **surplus** (au-delà des `CIBLE` meilleurs au poste, jamais une star ni un titulaire), et
  **jamais un de VOS joueurs** (eux partent via les offres `offreExt` que vous acceptez, ou un incident `vend`).
  Toute sortie d'un de vos joueurs déclenche une `notif`.
- **Fenêtres de temps fort** (`celebreFlash`) : en match **en direct**, un but ou un carton rouge déclenche un
  overlay LED clignotant (`#butFlash`) avec titre + score/joueur + **détail** (le commentaire `l.x`), ~5 s ou
  jusqu'au clic (« cliquez pour continuer »). Comme les overlays de moment, il doit être nettoyé par
  `abandonneDirect()` (sinon il surgit hors match). Pas de fenêtre en « résultat instantané » (rapide). Les
  penalties ont déjà leur propre fenêtre interactive (le moment de match).
- **Réputation du club** (0-100), **confiance du président**, **moral des joueurs**, **traits**
  (ego, agressivité, fragilité, vénalité), **centre de formation**, **mercato bidirectionnel**.

## Validation AVANT toute livraison (non négociable)
1. Extraire le JS et vérifier la syntaxe :
   `python3 -c "import re; open('game.js','w').write(re.search(r'<script>(.*)</script>', open('index.html').read(), re.S).group(1))" && node --check game.js`
2. Lancer un **harnais headless Node** : stub minimal de `window`/`document`, puis `nouvellePartie(id)`
   et boucle `jouerJournee()` sur plusieurs saisons. Vérifier : pas d'erreur, calibrage des buts,
   pas de joueur 36+ actif après vieillissement, incidents sans exception.
3. Pour l'UI : capture **Playwright** (voir `/audit-ui`), en desktop ET en mobile 390px.
4. Toujours tester une **carrière multi-saisons** (au moins 6 saisons) pour les régressions.

## Workflow de livraison
- Itérer dans le fichier → valider (ci-dessus) → **incrémenter la version** en pied de page →
  commit git avec un message clair en français → push (GitHub Pages déploie tout seul).
- Tag git aux jalons (`v1.0`…).
- Résumer les changements à l'auteur en français, style article de presse, à la fin.

## Pièges connus (déjà corrigés, ne pas réintroduire)
- L'overlay d'un moment de match ne doit jamais surgir hors d'un match : `abandonneDirect()`
  sur chaque transition d'écran nettoie le ticker.
- Reset des stats de TOUS les clubs à l'intersaison (`razStatsClub`), y compris ceux qui restent.
- Backstories cohérentes avec l'origine du patronyme (un Traoré ne grandit pas en RDA).
- Après un choix d'incident, masquer les options non choisies et mettre en valeur la décision prise.
- En mobile, la règle `table{min-width:540px}` (scroll horizontal des grands tableaux) s'applique à TOUTES
  les `table`. Les tableaux étroits libellé/valeur (Finances, Buteurs, Passeurs) doivent porter
  `class="fit"` (qui remet `min-width:0`), sinon leur colonne de droite — montants, compteurs de buts/passes —
  sort de l'écran et devient invisible.
- Le téléscripteur (`#ticker`) a `overflow-y:auto`, donc c'est un bloc de formatage indépendant ; il cohabite
  avec les boutons de vitesse (`#ctlVitesse`) en `float:right`. Il doit garder `clear:both` (et les contrôles
  passent sur leur propre ligne en mobile), sinon il se rétrécit en une mince colonne à côté du flottant.
