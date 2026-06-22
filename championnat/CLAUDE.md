# D1 MANAGER 95-96 — mémoire projet

## Ce que c'est
Jeu de management de football rétro, **fichier HTML unique autonome** (`index.html`).
Saison de départ : France 1995-96, deux divisions jouables (D1 et **D2 — où l'OM purge sa relégation
post-affaire VA-OM**), vrais clubs et joueurs, puis carrière multi-saisons avec montées/descentes.
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
- **Aucun framework, aucun build, et aucune dépendance externe dans la logique de jeu.** HTML/CSS/JS pur.
  Deux entorses purement cosmétiques chargées depuis le `<head>`, sans effet sur le moteur (voir plus bas) :
  les fontes Google (VT323/Silkscreen) et le compteur GoatCounter — toutes deux dégradent proprement si le
  réseau manque (repli `monospace`, pas de comptage).
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
- **Suivi de fréquentation (GoatCounter)** : une balise de comptage dans le `<head>` envoie une visite au
  compte `d1manager` (`https://d1manager.goatcounter.com`). C'est l'une des deux entorses (avec les fontes
  Google) au « aucune dépendance externe » — et elle ne concerne pas la logique de jeu : un petit script de chargement conditionnel n'injecte
  le compteur **que sur l'URL publique HTTPS** (pas en `file://`, pas en `localhost`, et le harnais Node sans
  DOM ne l'exécute jamais), pour que les tests ne polluent pas les stats. Sans cookie, donc pas de bannière de
  consentement. **Piège** : cette balise est un **second bloc `<script>`**, volontairement marqué
  `type="text/javascript"` pour qu'elle ne soit **pas** capturée par le motif `<script>` *nu* de la commande
  d'extraction (validation §1). Ne pas lui retirer cet attribut, et ne jamais ajouter d'autre bloc `<script>`
  nu hors du gros script de jeu, sinon l'extraction du JS attrape le mauvais bloc.

## Conventions de code
- **Éditions chirurgicales** : modifier le strict nécessaire, préserver l'art ASCII, les blasons SVG,
  le rendu existant. Ne JAMAIS réécrire le fichier en entier sauf nécessité absolue.
- Constantes de données en MAJUSCULES (`CLUBS`, `STARS`, `INCIDENTS`, `SPONSORS_SULFUREUX`…).
- Helpers courts en camelCase (`clubById`, `onze`, `majReput`, `tireIncident`…).
- Montants en francs (FF) ou millions de francs (MF). Époque oblige.
- Style visuel : télétexte Championship Manager 2 — fond bleu nuit `#0b1626`, jaune `#ffd24a`,
  cyan `#6fd6e8`. Respecter cette palette.
- **Typographie** : deux fontes d'écran rétro, déclarées en variables `:root` (toujours garder le repli
  `monospace`). `--font-ui` = **VT323** (toute l'interface, portée par `body`) ; `--font-led` = **Silkscreen**
  (la « voix tableau d'affichage » : flash de but `#butFlash .gros`, `.scoreline`, et les chiffres de score
  `.tSc`/`.tSep`). **Piège de métrique** : VT323 rend nettement plus petit que Consolas à taille égale — la base
  est à `17px` (pas 14) et toutes les `font-size` (sous-éléments **et** bloc mobile) ont été remontées d'environ
  20 % pour rester lisibles. Si on change de fonte ou qu'on ajoute un écran, relire les tailles (surtout les
  tableaux mercato/classement). Les temps forts LED portent un **halo serré + ombre pixel**
  (`text-shadow:0 0 2px currentColor, 0 1px 0 rgba(0,0,0,.6)`), pas un néon flou — ne pas réintroduire le
  `0 0 9px`.

## Systèmes de jeu en place (ne pas casser)
- **Effectifs réels** : la constante `STARS` (par club) contient de vrais joueurs de la D1 95-96
  `[nom, poste, âge, note, pot]`, curés à la main et **vérifiés par recherche** (référence de curation :
  **Transfermarkt**, page effectif par club et saison — `…/kader/verein/<id>/saison_id/1995`) — viser ~97% de vrais
  noms (16+ par club, postes 2G-5D-5M-4A = `CIBLE`) ; `genJoueur` ne complète qu'à la marge. Un joueur
  est « réel » si `j.reel` (= pas de `j.histoire`). Ne pas réintroduire de faux noms ni de joueur au
  mauvais club/âge ; ne jamais dupliquer un même joueur entre deux clubs **ni entre un club et le vivier**.
  **Convention d'âge** : `âge = 1995 − année de naissance` (l'âge atteint dans l'année civile 1995) — s'y
  tenir pour éviter les décalages d'un an, écueil récurrent à la curation. Un contrôle de doublons utile :
  balayer tous les tuples `["Nom","POS",n,n,n]` (STARS + STARS_D2 + VIVIER + JOKERS_RESERVE) et vérifier
  qu'aucun nom n'apparaît deux fois.
- **Vivier du recruteur** (jokers signables hors fenêtre) : `VIVIER` (cibles réelles été 95) + une
  `JOKERS_RESERVE` de vrais noms des années 90. À l'intersaison, le vivier subit ~50% de rotation et se
  recomplète **en priorité avec de vrais noms** (réserve) ; une pépite procédurale n'arrive qu'en
  dépannage si la réserve est momentanément épuisée → ~90%+ (en pratique ~100%) de vrais noms. Les gens
  n'accrochent pas aux jokers factices : garder le vivier réel, et `enJeu` (effectifs D1 **+ D2** + vivier)
  empêche tout doublon d'un joueur entre un club et le vivier.
- **Deux divisions** (`CLUBS`/`STARS` = D1, `CLUBS_D2`/`STARS_D2` = D2, 20 clubs chacune). On peut choisir
  un club de D1 OU de D2 à l'accueil (OM est en D2). `G.div` (1/2), `G.clubs` = la division JOUÉE (simulée
  en détail par le moteur), `G.autre` = l'autre division (simulée en **abstrait** via `classementAbstrait`
  = force des onze + bruit). À l'intersaison : **3 montées / 3 descentes** entre D1 et D2 (`montent`/
  `descendent`), les deux divisions vieillissent. `construitDivision()` bâtit une division ; `clubById`
  cherche dans les deux. Depuis v0.45, **les 20 clubs de D2 sont curés au même standard que la D1**
  (vrais effectifs 95-96 dans `STARS_D2`, `genJoueur` ne complétant qu'à la marge) ; la case `PER`
  (« Perpignan FC ») porte l'effectif réel de **Canet-Roussillon** — club voisin retenu faute de club
  perpignanais en D2 cette saison-là — et Angers/Alès, sans case dans le jeu, sont restés de côté.
  Toujours garder D1 et D2 à 20 clubs et **aucun joueur dupliqué entre les divisions**.
  Le **mercato est national** (`ecranMercato` liste D1 + D2, colonne « Div », filtre par division) ;
  la **fiche d'accueil affiche l'effectif réel curé** (STARS/STARS_D2) avant de choisir son club.
- **Relégation = on continue en D2** (plus de game over) : `finDeSaison` ne licencie QUE sur objectif
  manqué de loin + confiance < 40 ; la relégation seule fait jouer la saison suivante en D2 (remontada).
- **Moteur** : 38 journées, `simuleMatch` calibré à ~2,3 buts/match (calibrage à préserver). Un **carton
  rouge en cours de match fait jouer l'équipe réduite à dix** pour les minutes restantes (`mulH`/`mulA` :
  attaque en baisse, on encaisse plus ; malus d'autant plus fort que le rouge tombe tôt ; gardien expulsé =
  cage encore plus fragile). Les **gardiens fautent autrement** qu'un joueur de champ (`COMM.crGK`/`COMM.cjGK` :
  sortie kamikaze à la Schumacher, poings en avant, main hors surface) — branché sur `j.pos==="G"`.
- **Consigne d'avant-match** (`CONSIGNES`, `G.consigne` ∈ `prudent`/`equilibre`/`offensif`, défaut `equilibre`) :
  un **choix restreint** avant chaque match (sélecteur sur l'écran du match, consigne active surlignée, elle
  persiste jusqu'au changement suivant). Modulateur d'agressivité appliqué **au SEUL match du joueur** dans
  `simuleMatch` (`att` = votre attaque, `adv` = l'attaque adverse contre vous) : offensif marque plus mais
  expose, prudent verrouille. Neutre (×1) pour tous les autres clubs et en `equilibre` → **le calibrage du
  championnat reste intact** (le harnais joue en `equilibre`). Multiplicateurs = réglages tunables. À migrer
  (`G.consigne||"equilibre"`).
- **Moments de match**, deux familles. **Interactifs** (`MOMENTS_INTERACTIFS` : penalty pour/contre, tacle,
  provocation) — overlay à choix. **Non interactifs qui changent le score** (`MOMENTS_BUT` : but de 50m, geste
  d'anthologie, et les **cagades de gardien** `cagade`/`cadeau`) : tirés par `tireMoment`, résolus par
  `autoMoment` AVANT le direct ; `buteurMoment()` reconstruit la ligne-but pour que tableau, feuille et sifflet
  restent cohérents (sinon le flash affiche un score que le sifflet contredit). Les **cagades** = bourdes de
  gardien (Arconada, relance dans les pieds, sortie ratée, faux rebond sur passe en retrait), **but sec dans les
  deux sens** : `cagade` (le vôtre se troue) / `cadeau` (celui d'en face).
  **Retour visuel du choix** : un overlay interactif tranché ne laisse plus tous les boutons en jaune. `finMoment`
  reçoit le **bouton cliqué** (4ᵉ argument) et applique les classes `.choisi` (le retenu s'illumine en jaune + coche
  ✅, via `dataset.coche` pour ne préfixer qu'une fois) et `.ecarte` (les autres en fond sombre estompé). Tous les
  `.zPen`/`.zChoix` portent l'une ou l'autre → chaque appelant (`momentPenPour/PenContre/CoupFranc/Tacle/Provoc`)
  passe son bouton ; `momentTacle` le fait via son helper `conclure`. Même esprit que la décision d'incident
  (« masquer les options non choisies »), mais sans réécrire le DOM des boutons.
- **Incidents de vie de club** : catalogue `INCIDENTS` (~38 cartes), tiré ~1 journée sur 3,
  chacun avec un joueur, 2-3 choix, des effets via `eff(j, {…})`. Anti-répétition sur 8 journées.
- **Mallette / match truqué** (`G.affaire` l'offre, `G.truque` la victoire promise, `G.risque` le compte à
  rebours d'enquête) : un intermédiaire propose une victoire garantie (3-7 MF) ; accepter arme `G.truque`
  (match suivant gagné), puis `G.risque=RNDI(4,7)` ouvre une **fenêtre d'enquête bornée** (~10 %/journée
  d'éclatement : −6 pts, −8 MF, −35 de confiance ; sinon la piste se refroidit → ~44 % de se faire prendre).
  **Ne JAMAIS** rendre `G.risque` permanent : l'ancien booléen valait ~94 % de scandale, donc refuser était
  toujours optimal et le dilemme était mort. L'intermédiaire **rôde davantage quand le club coule** (confiance
  < 45 ou bas de tableau). `G.risque` est un entier (migrer `+G.risque||0`).
- **Datation par époque** : chaque incident/sponsor peut porter `de:` et/ou `a:` (années).
  `anneeJeu()` = 1994 + saisonIdx. **Toujours dater un contenu marqué par son époque**
  (réseaux sociaux ≥ 2009, paris en ligne ≥ 2010, etc.). L'anachronisme casse l'immersion.
- **Sponsors maillot** : 3 familles formant un vrai dilemme image/argent — terroir/ringards (peu payés mais
  **gros bonus de réputation**, +3 à +8 selon le sponsor : on sacrifie l'argent pour l'image), propres
  (équilibré, +1), sulfureux (pont d'or mais réputation en baisse, parfois défaut de paiement). Le bonus de
  réputation est porté par le champ `rep` de chaque entrée de `SPONSORS_RINGARDS`. Noms = pastiches inventés,
  jamais de vraie marque déposée (risque juridique).
- **Équipementiers** (`EQUIPEMENTIERS`, `genEquip`/`choisirEquip`) : 2e source de revenu, **se signe comme un
  sponsor** — rien au début de saison, on choisit parmi des offres (`G.offresEquip`) qui dépendent de la
  **notoriété** (prestige nuancé par la réputation) ; le contrat (`G.equip`) verse un cachet chaque journée et
  expire à l'intersaison (à re-signer). 3 offres types : gros fixe / fixe moindre + prime à la victoire /
  atelier local modeste mais +réputation. Noms **fictifs** (Athéna, Triax, Cheetah, Ombra, Oméga,
  Le Faisan Sportif, Ringbok, Tombola, Sportec Vosges, Le Grand Échalas…) — jamais de vraie marque.
- **Économie — « l'argent est une contrainte »** : chaque journée, pour MON club, `finirJournee` encaisse
  billetterie à domicile (`affluence×70`), droits TV (**450 kF en D1, 200 kF en D2** — remonter, c'est le
  jackpot télé), sponsor et équipementier, puis prélève **deux charges** : la **masse salariale**
  (`salaire(j)=note²×10`, grimpe vite avec la qualité — empiler des cracks coûte cher) et les **frais de
  fonctionnement** (`fraisJournee(c)=cap×15`, entretien stade + personnel : un grand stade vide devient un
  fardeau). Trésorerie négative = `G.confiance−1`/journée + alerte (flag `G._deficit`). Plancher mesuré dans
  le moteur : club moyen ~+6 MF/saison sans sponsor, **D2 en déficit** (survie). Le **budget mercato `G.budget`**
  reste un pot séparé (réalimenté à 70 % par la prime de classement à l'intersaison). Les **prêts** sont un
  appoint, pas une rente (`tarifPret` abaissé) : prêter libère surtout le salaire. Tous ces coefficients sont
  des **réglages** à durcir/adoucir après playtest. L'écran Finances détaille chaque poste.
- **Vases communicants — pont budget ↔ trésorerie** (`transvaser(sens, montant)`, `FRAIS_VIRE`=0,10) : les
  deux poches restent **séparées** (le trésor de guerre mercato ne paie pas les salaires), mais on peut en
  **transvaser** de l'une à l'autre depuis l'écran Finances pour débloquer un projet (typiquement renflouer la
  caisse pour agrandir le stade quand le budget transferts déborde). `sens="caisse"` = `G.budget`→`G.tresorerie`,
  `sens="mercato"` = l'inverse ; **commission de 10 %** dans les deux sens (`FRAIS_VIRE`, réglage tunable) pour
  que ce soit un **vrai arbitrage** et pas un jonglage gratuit — sans cette friction, le découvert
  (`G._deficit`) cesserait de mordre. Refuse si le montant dépasse la poche de départ, ignore les montants
  ≤ 0, et un renflouement au-dessus de 2 MF éteint l'alerte de découvert. Pas d'état persistant nouveau (rien
  à migrer). Les messages « Trésorerie insuffisante » du stade et du centre renvoient vers ce levier.
- **Politique tarifaire de la billetterie** (`PRIX_BILLET`, 5 paliers ; `G.prixBillet` = index, défaut `2` =
  « Normal », 70 FF ; helper `palierBillet()`) : un **vrai dilemme argent / image**, réglé depuis l'écran
  Finances. Chaque palier porte `prix` (recette par spectateur), `aff` (modulateur d'affluence appliqué **au
  seul match à domicile de MON club** dans `affluence`), `rep` (dérive de réputation par match à domicile) et
  `moral` (nudge moral). **Brader** (Populaire/Modéré) remplit le stade, **monte la réputation et le moral**
  (donc la performance, via `forces()`) mais la recette à l'unité fond ; **faire payer cher** (Majoré/Premium)
  gonfle la caisse mais **vide les gradins, écorne l'image et plombe le moral**. Dans `finirJournee`, le bloc
  domicile encaisse `aff×prix`, applique la dérive `rep`, puis un **nudge moral combiné tarif + remplissage**
  (`pb.moral+(fill−0.70)×0.8`, centré sur ~70 % de remplissage → club moyen quasi neutre). **Le palier 2
  (Normal, ×1, neutre) préserve le calibrage** : le harnais ne touche pas `G.prixBillet`, l'économie et les
  buts restent étalonnés. À migrer (`G.prixBillet==null?2:…`).
- **Marché des transferts IA** (`transfertIA`) : pendant les fenêtres (`fenetreOuverte`), un club IA achète
  un joueur à un autre, dans la limite de **son** budget (`c.budget`, réapprovisionné à l'intersaison). Règles :
  ne vend que le **surplus** (au-delà des `CIBLE` meilleurs au poste, jamais une star ni un titulaire), et
  **jamais un de VOS joueurs** (eux partent via les offres `offreExt` que vous acceptez, ou un incident `vend`).
  Toute sortie d'un de vos joueurs déclenche une `notif`.
- **Fenêtres de temps fort** (`celebreFlash`) : en match **en direct**, un but ou un carton rouge déclenche un
  overlay LED clignotant (`#butFlash`) avec titre + score/joueur + **détail** (le commentaire `l.x`), ~5 s ou
  jusqu'au clic (« cliquez pour continuer »). Comme les overlays de moment, il doit être nettoyé par
  `abandonneDirect()` (sinon il surgit hors match). Pas de fenêtre en « résultat instantané » (rapide). Les
  penalties ont déjà leur propre fenêtre interactive (le moment de match). **TOUS les moments-buts** allument ce
  flash : `cagade` en **rouge (« CAGADE ! »)**, `cadeau` en version festive, et `geste`/`but50` en
  **« 🌟 BUT D'ANTHOLOGIE ! »** — détail = l'annonce du moment. Le **chien sur la pelouse** (`chien`) a aussi son
  flash, avec une **« image » ASCII** (`DOG_ART`) affichée sur le panneau via le champ `o.art` de `celebreFlash`.
- **Montée de tension** (`MONTEE_BUT` + `MONTEE_FRAPPE`, en direct seulement) : avant un but du téléscripteur **MAIS
  AUSSI avant certaines grosses occasions ratées**, l'action se construit en **deux temps**, chacun suivi d'un
  battement (`Math.max(650, tickerDelai)`) AVANT la résolution et son flash. 1er temps = l'action s'installe (ambiance
  générique, `MONTEE_BUT` : « ça s'emballe dans la surface… »). 2e temps = le **porteur nommé** arme son geste face au
  **gardien adverse cité** (`gardienDe(defClub)` = le portier du `onze` du club qui n'attaque pas) via `MONTEE_FRAPPE`
  (« X arme sa frappe… », « X en face à face avec Y… »). **Anti-spoiler** (retour de playtest, v0.48) : auparavant la
  montée ne précédait QUE les buts → texte blanc = but garanti, suspense mort. Désormais une occasion ratée hérite
  d'une montée avec proba `MONTEE_RATEE` (≈0,6, **réglage tunable** ; ~1/3 des montées font alors long feu) — la
  « grosse action » en blanc ne garantit plus le but, on ne sait qu'à la résolution si ça rentre (ligne jaune `lg.g`)
  ou si ça fuit (occasion cyan). Mécanique : `simuleMatch` attache aux occasions verbeuses un objet `q:{but,cote,bu}`
  (le tireur nommé + le flag de montée) ; `tic()` déclenche les deux temps si `lg.g || (lg.q && lg.q.bu)` via le
  **compteur** `lg._monte` (0→1→2), en piochant `info=lg.g||lg.q` pour le nom du porteur et le camp. N'altère ni le
  score ni le calibrage (purement cosmétique). Le harnais ne rend pas le direct, donc rien à vérifier côté moteur.
- **Vitesses du téléscripteur** (boutons `#ctlVitesse` : `vR`/`vN`/`vL`/`vTL`) : 4 paliers, toute l'échelle reculée
  d'un cran après playtest (v0.48, « ça défile trop vite ») — **Rapide** 950 ms, **Normale** 1600 ms (défaut,
  `tickerDelai` à l'init et au reset de `lanceMatch`), **Lente** 2300 ms, **Très lente** 3000 ms (nouveau plancher).
  Pur réglage de pacing UI, sans effet moteur.
- **Cycle du bouton d'action de l'écran de match** : le bloc `#preMatchAct` (un `<p>` centré) porte avant le coup
  d'envoi « Jouer le match » (`#bJouer`) + « Résultat instantané » (`#bVite`). `lanceMatch` les **masque**
  (`style.display="none"`, plus seulement `disabled`) pour qu'ils ne traînent pas pendant le direct ; au coup de
  sifflet, `fin()` réécrit `#preMatchAct` avec un unique **« Prochaine journée 📆 »** (`#bNext` → `montre("calendrier")`,
  qui affiche la journée suivante puisque `finirJournee` a déjà incrémenté `G.journee`). Le bouton de bas de
  téléscripteur (`#bSuite`) porte le même libellé pour rester cohérent. `montre("calendrier")` re-rend tout, donc
  les boutons d'avant-match reviennent intacts.
- **Moral des joueurs prêtés dehors** : un prêté (`G.prets` `sens:"out"`, retiré de `moi.joueurs` → club hôte)
  n'est jamais touché par `majMoral` (qui n'itère que `moi.joueurs`). `finirJournee` lui pose `_joue=1` ET lui
  remonte le moral (~+1,5/journée) : titulaire ailleurs, il revient « aguerri ».
- **Onglet « À propos »** (`ecranApropos`, 7ᵉ onglet de la `nav`) : pitch de l'auteur + **formulaire de contact**
  (objet + message → `mailto:` vers `CONTACT_MAIL`, pré-rempli avec club/saison/journée). Pas de backend : c'est
  un simple lien `mailto`. Garder le ton léger.
- **Capitanat** (`leadership`, `capitaineDuXI`, `assureCapitaine`, `nommerCapitaine`) : chaque club a un
  capitaine (flag `j.capitaine`). Sa **qualité de meneur** = âge (expérience) × ego (autorité) × note (respect)
  × vénalité (intégrité), modulée par le moral (investissement). Elle agit dans `forces()` : un fort capitaine
  **tempère les divas** (réduit le malus `exces`) et **soude le vestiaire** (±~2 % de cohésion). Tous les clubs
  en profitent (l'IA prend son meneur naturel via `capitaineDuXI`) ; **vous** nommez le vôtre depuis la fiche
  joueur — un cadre cupide (ego/vénalité élevés) **réclame une prime** (`G.tresorerie`) : payée il est à fond
  (moral +), vexé il mène mollement (moral −). `assureCapitaine()` garantit toujours un capitaine valide
  (démarrage, départ, retraite, vieille sauvegarde) ; ne jamais laisser MON club sans brassard.
- **Tireur d'élite** (`tireurDuXI`, flag `j.tireurElite`, badge 🎯) : don **RARE et inné** des coups de pied arrêtés
  (penaltys + coups francs), **pas un rôle qu'on attribue** — semé dans `initTraits` (réservé aux bons M/A note≥79,
  ~9 % → ~3-4 clubs sur 20 en D1, souvent 0 en D2 ; tombe sur de vrais spécialistes : Djorkaeff, Moravčík…). **On ne
  le nomme pas** : on l'a ou pas (le recrutement d'un spécialiste devient un vrai enjeu). `tireurDuXI(xi)` = l'élite
  sur la pelouse sinon le meilleur frappeur M/A — il prend les penaltys `pen_pour`/`pen_contre` ET le **coup franc**
  (`coupfranc` : moment **interactif** à 16-25 m, on choisit la frappe ; un élite convertit ~30-34 % contre ~10 %).
  En avoir un **augmente la proba de marquer** : sang-froid bonus au penalty interactif (`momentPenPour` : `pOff`×0,6,
  `pSave`×0,82), forte conversion du coup franc, et **+3 % d'attaque** dans `forces()` si le XI en compte un. Badge 🎯
  (effectif + fiche), aucune désignation. Curation possible d'un spécialiste réel via `TRAITS[nom].tireur=true`.
- **Curation des caractères réels** (deux tables nommées, lues dans `initTraits` après `TRAITS`, clé = nom exact
  au format jeu « X. Surname ») : **`BOUCHERS`** (nom → agressivité forcée) consigne le **panthéon des bouchers
  notoires de la L1** (Di Meco « le pire » et Rool à 10, etc.) → ils portent le picto 🪝 ; ≥10 affiche la
  variante « Boucher légendaire ». **`TIREURS_CF`** (Set) consigne les **rois du coup franc** (Juninho, Sauzée,
  Caveglia, Zidane…) → `tireurElite=true` **d'office, quelle que soit la note** (court-circuite le seuil M/A≥79).
  Seuls les joueurs **présents** dans le jeu matchent (Di Meco/Sauzée/Caveglia/Rool en 95-96, Juninho au vivier) ;
  le reste est de la donnée correcte-par-construction si un nom surgit (procédural multi-saisons). Étendre ces
  listes par simple ajout de nom au bon format d'initiale.
- **Picto « Car. » partout** (`pictos(j, avecTireur)`) : la colonne caractère figure à l'**effectif** (sans 🎯,
  déjà affiché à côté du nom) **et au mercato** (`pictos(j,true)` → inclut 🎯). Le placeholder `·` quand rien.
- **Coupe de France** (`G.coupe`, module dédié juste avant `finDeSaison`) : compétition parallèle jouée
  **en milieu de semaine** entre les journées (`coupeTick` en fin de `finirJournee`, tours aux journées
  10/15/20/26/31/36 via `COUPE_TOURS`). **64 équipes aux 32es** : les **40 clubs pros (D1+D2) y entrent**,
  rejoints par 24 **clubs amateurs** de villages (`CLUBS_AMATEURS` : vraies communes + noms inventés bon
  enfant — Trifouilly-les-Oies, Montcuq, Nœud-les-Mines… **que des faux joueurs**, et ils n'ont d'ailleurs
  pas d'effectif : un amateur n'existe qu'en tant que `force`). Tirage **sans tête de série**, **le petit
  reçoit** (`niveauCoupe` : amateur 0 < D2 1 < D1 2), **pas de match nul** (tirs au but). Un **Petit Poucet**
  est désigné chaque saison (`poucetId`, dopé de `COUPE_POUCET_BONUS`) et joue très au-dessus de son rang →
  parcours marquant, et il peut vous tomber dessus (le petit reçoit, vous jouez chez lui). **La coupe ne
  touche JAMAIS les stats de championnat ni le calibrage des buts** : tout y est résolu par un modèle de
  force autonome (`forceCoupe`/`scoreCoupe`, exposant ~2,6, Poisson `poissonC`, calibrage doux), jamais par
  `appliqueResultat`. **Dilemme du mercredi** : `G.coupe.rotation` (cadres/mixte/réserve, réglé sur l'écran
  COUPE) module votre force en coupe ET, pour « les cadres », pose `G.coupe.fatigue=1` → **−5 % d'attaque à
  VOTRE SEUL match de championnat suivant** (une ligne gardée dans `simuleMatch`, dissipée en tête de
  `finirJournee` ; **neutre quand `fatigue=0`** → le harnais joue en mixte, calibrage intact). Onglet **COUPE**
  (`ecranCoupe`, 3ᵉ de la nav) : statut, rotation, votre parcours, la fiche du Poucet, résultats du dernier
  tour. (Re)tirée à `nouvellePartie` et à `intersaison` (nouveau tableau + nouveau Poucet), migrée par `migre`
  (`if(!G.coupe) coupeInit()`). **Équilibrage mesuré** (test dédié, 80 saisons) : club fort **~13 % de
  victoire en « cadres »** contre ~6 % en mixte (le choix de rotation pèse), Poucet en quarts+ ~10-19 % et
  sacré très exceptionnellement. **v1** : résolution automatique des tours (pas encore de direct façon
  championnat — piste d'évolution si on veut « jouer » son tie au téléscripteur).
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
- Les filtres du mercato (poste, âge, division, recherche, favoris, tri) sont conservés dans l'objet module
  `MERCF`, pas dans des locales de `ecranMercato` : un achat passe par `rafraichir()`→`montre("mercato")` qui
  ré-exécute tout l'écran, et sans `MERCF` chaque achat réinitialiserait les filtres (la case « Mes favoris »
  se décochait). `rend()` recopie l'état dans `MERCF` à chaque rendu, les contrôles le reflètent (`selected`/
  `checked`/`value`), et `nouvellePartie` le remet à neuf.
- Le penalty CONTRE (`momentPenContre`) : la narration doit coller à l'issue réelle. Plonger du bon côté ne
  garantit pas l'arrêt (les frappes pures passent quand même) ; le texte ne doit donc jamais clamer la réussite
  (« vous aviez lu son regard ! ») quand le but rentre — d'où le verdict « BUT QUAND MÊME — la frappe était
  trop pure » dans ce cas. Cohérence texte/résultat obligatoire.
- La **sélection du XI** (`onze`) complète un secteur décimé (blessures/suspensions) en servant les **joueurs
  de champ d'abord** ; un 2e gardien ne bouche un trou qu'en **tout dernier recours** (tri
  `(a.pos==="G")-(b.pos==="G")||note`). Bug d'origine signalé en playtest : on alignait un gardien remplaçant
  à la place d'un joueur de champ disponible. Gardé en régression par la **section E** du harnais.
