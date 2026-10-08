# MULTIPLEX — mémoire projet

## Ce que c'est
Jeu de management de football rétro, **fichier HTML unique autonome** (`index.html`).
Saison de départ : France 1995-96, deux divisions jouables (D1 et **D2 — où l'OM purge sa relégation
post-affaire VA-OM**), vrais clubs et joueurs, puis carrière multi-saisons avec montées/descentes.
Hébergé sur GitHub Pages dans le repo `retro-games`, servi à la racine de https://multiplex.club/ : le workflow `.github/workflows/publication.yml` publie le contenu de `championnat/` (sans harnais, notes, `docs/`, `audit/`) à chaque push sur main ; l'ancienne adresse `/championnat/` redirige vers la racine.
**Joué par l'auteur SEUL (constat du 25/09/2026 : « personne ne joue au jeu, sauf moi pour l'instant »).** Il n'y a
pas de testeurs : les « retours de playtest » cités dans ce fichier sont les siens, et son ressenti en jouant est le
seul retour qui existe. Ne pas justifier une décision par « les testeurs » ni proposer de « faire tester » à
d'autres ; une livraison sur `main` n'expose que sa propre partie (dont la sauvegarde doit rester compatible).
**Nom & identité (v0.82)** : le jeu s'appelle **MULTIPLEX** (sans « 95 » depuis v1.44 : le jeu couvre 1990 à 2000 ; le multiplex radio — « tous les stades en
direct », l'oreille collée au transistor, très 1995). Le logo (**v1.58**, choisi par l'auteur parmi cinq pistes, cf. `docs/logos.html`) est le **générique télé des années 90** :
« MULTIPLEX » en lettres chromées italiques (Archivo Black), relief rouge, trajectoire de frappe finie sur un ballon, et le
slogan **« LE PLAISIR DU FOOT RETRO »** sur bandeau rouge, dont le bord gauche prolonge au pixel le jambage du M (même pente
de 12°). `logoGenerique()` le rend entier (bandeau d'accueil, et l'image de partage `img/partage.png` en est une capture),
`logoMultiplex(s)` son icône : le M seul, en **tracé** (pas en texte, pour ne dépendre d'aucune fonte), sur tuile bleu nuit
(barre du haut) ; le favicon en est la copie figée en `data:` URI, à régénérer si l'icône change. Chaque appel numérote
ses dégradés (`LOGO_N`). Marque affichée à l'accueil (bandeau + pieds de page + `<title>`/`majTitre`),
mais **le bandeau EN JEU reste au club** (blason + nom). **Piège** : le rebranding est cosmétique et ne touche
NI la clé de sauvegarde `SAVEKEY` (`d1manager_sauvegarde_v1`) NI le compte GoatCounter (`d1manager`) — les
changer casserait les sauvegardes des testeurs et l'historique de stats. L'ancien nom « D1 MANAGER » ne subsiste
donc volontairement que dans ces deux identifiants techniques.

Philosophie de design : **« la contrainte est le produit »**. On n'ajoute une fonctionnalité que si
elle crée un moment mémorable, dont on parle — pas juste du contenu en plus. L'entre-match doit
toujours « raconter quelque chose ».

## Langue & ton
- **Tout en français.** Code, commentaires, textes du jeu, et réponses à l'auteur : français.
- Réponses à l'auteur : **prose fluide, style article de presse**, pas de listes à puces techniques,
  pas de jargon inutile. L'auteur n'est pas développeur professionnel.
- Le ton du jeu est léger, drôle, parfois sulfureux mais bon enfant. Jamais de registre tragique.
- **FINIR SYSTÉMATIQUEMENT PAR DES QUESTIONS À CHOIX MULTIPLES — SANS EXCEPTION (consigne auteur,
  22/09/2026, durcie le 23/09/2026)** : « pose-moi des questions plus claires, à choix multiples », puis
  « termine **systématiquement** par une question à choix multiples, car tes messages sont difficiles à
  décrypter. **On ne comprend pas à quel point tu attends une réponse** ». Les poser **fermées**, deux à
  quatre questions, deux à quatre options chacune, chaque option disant ce qu'elle IMPLIQUE (ce qui part en
  ligne, ce que ça coûte, ce qu'on perd), et recommander la meilleure en la mettant en premier. L'auteur
  répond d'un clic, et la session enchaîne.
  **Le corollaire du 22/09 est ANNULÉ.** Il disait : « quand rien n'est réellement ouvert, on ne fabrique
  pas de questions pour la forme ». L'auteur a tranché dans l'autre sens le 23/09, après une réponse qui
  s'était terminée sur un simple récapitulatif : **mieux vaut une question dont la réponse est évidente
  qu'un message où il ne sait pas s'il doit répondre.** Le bloc de questions est le seul signal non
  ambigu de « à vous » dans une réponse en prose. Donc : **aucune réponse ne se termine sur un
  récapitulatif**, même quand tout est livré et vert. S'il ne reste aucune décision de fond, la question
  porte sur la suite — quoi lancer ensuite, où livrer, quoi approfondir.
- **ON N'EXPLIQUE PAS LE JEU, ON LE FAIT DÉCOUVRIR (consigne auteur, 22/09/2026)** : « un peu trop de texte
  explicatif dans le jeu. Il faut laisser les gens découvrir par eux-mêmes. Ça fait partie du délire de
  comprendre comment fonctionne le jeu, d'en découvrir les ficelles. » Un grand ménage a donc retiré en v1.17
  les paragraphes de mode d'emploi qui meublaient les écrans : le barème et la zone rouge du classement, le
  barème de l'homme du match, l'usage des boutons de l'effectif et du mercato, les huit cents signes qui
  récitaient la fraîcheur, le fonctionnement des finances, de la billetterie, du staff et de la réputation,
  et les modes d'emploi des choix (promo billets, nouvelle ère, offre sur un prêté, mallette).
  **La ligne de partage** : on GARDE ce qui est une **information de situation** (un délai qui court,
  une règle qui refuse un geste, la mise d'un pari, un glossaire de pictos sans lequel l'écran est illisible)
  et ce qui est de la **narration** ; on COUPE ce qui **explique une mécanique** que jouer suffit à révéler,
  ce qui décrit une **affordance** (« cliquez sur un club », « survolez pour le détail ») et ce qui **répète
  un tableau** placé juste au-dessus. **À tenir pour tout nouvel écran** : si un paragraphe commence par
  décrire comment le jeu marche, il n'a rien à y faire.
- **ÉPURER, ENCORE (consigne auteur, 25/09/2026)** : « c'est un des écueils de l'IA : on remplit de beaucoup de
  contenu, et l'utilisateur est écrasé par l'info, ce qui le fait partir. Aussi, trop de texte brise le mystère. »
  Retirés ce jour-là : les sous-titres d'ambition de l'accueil (« L'élite. Ici, on ne se contente pas… »), la phrase
  sous chaque formation, consigne, prime et rotation, la lecture des trois duels (remplacée par l'adversaire du samedi :
  rang, onze, trois dangers, cf. `briefAdverse`), le mode d'emploi du rendez-vous de semaine. Préférer une information
  concrète à une explication. Dans les trois directs, le bouton **« 👥 Compos »** (`composDirect`/`rendCompos`, état
  `COMPOS`) ouvre les deux onze tels qu'ils sont sur la pelouse à la minute affichée (`enJeu`, relu sous la feuille de
  rotation les soirs de coupe) ; `majMinute` le tient à jour. Gardé par la section I de `harness-formations.cjs`.
  **Piège** : le score s'écrit « 2 - 1 », jamais « 2 · 1 » (le point sépare, il ne marque pas un score).
- **AUCUN TIRET LONG « — » DANS LE TEXTE DU JEU (consigne auteur, 25/09/2026)** : 400 retirés d'un coup. Virgule dans
  la prose, « : » après une étiquette en capitales (« 🏥 BLESSURE : »), « · » comme séparateur (titres, jointures),
  « - » pour une case vide ou le tiret du score. Les commentaires du code peuvent le garder. Vaut aussi pour tout
  contenu écrit en atelier (saisons, incidents, commentaires du direct).

## Architecture (un seul fichier)
- `index.html` : tout est dedans — `<style>`, `<body>` minimal, gros `<script>` vanilla.
- **Aucun framework, aucun build, et aucune dépendance externe dans la logique de jeu.** HTML/CSS/JS pur.
  Deux entorses purement cosmétiques chargées depuis le `<head>`, sans effet sur le moteur (voir plus bas) :
  les fontes Google (IBM Plex Sans/VT323/Silkscreen) et le compteur GoatCounter — toutes deux dégradent proprement si le
  réseau manque (repli `monospace`, pas de comptage). Un troisième ajout au `<head>` ne compte PAS comme une
  dépendance : le favicon est embarqué en `data:` URI (un ballon jaune sur bleu nuit, aux couleurs du jeu) —
  zéro requête réseau, il évite simplement le 404 `/favicon.ico`.
- État global dans l'objet `G` (club, journée, joueurs, finances, réputation, incidents…).
- **Sauvegarde — PLUSIEURS CARRIÈRES EN PARALLÈLE (v0.94)** : le `localStorage` garde jusqu'à
  **`MAX_PARTIES` = 4 carrières** de front. Chacune a **sa propre clé** (`PARTPFX`+id), et un **index
  léger** (`IDXKEY`) retient leur carte d'identité — club, saison, journée, division, trophées, date de
  dernière partie, nom personnalisé — pour dresser la liste de l'accueil **sans relire les sauvegardes**,
  qui pèsent ~500 Ko pièce. `PARTIE` = {id, clé} de la carrière dans laquelle on écrit ; la sauvegarde est
  auto à chaque fin de journée et à chaque transition d'écran (`montre`), plus le bouton « 💾 Sauvegarder »
  en pied de page. L'accueil liste les carrières (`panneauCarrieres`) : la dernière jouée en gros bouton
  vert « ▶ REPRENDRE », les autres en lignes avec blason, et sur chacune ✏️ (`renommePartie`, via `saisie`)
  et 🗑️ (`supprimePartie`, via `confirme`). En jeu, « 📁 Mes carrières » (`retourAccueil`) sauvegarde et rend
  la main à la liste. API : `partiesListe`/`sauvegardeLocale`/`chargeLocale(id)`/`supprimePartie`/`renommePartie`/
  `placeDispo`/`ficheDe`/`ilYA`, toutes au-dessus de `migre()`.
  **La clé historique `SAVEKEY` n'est pas migrée mais ADOPTÉE** : la carrière d'un testeur d'avant v0.94
  entre dans l'index en gardant SA clé (l'index porte un champ `k` par entrée), donc elle continue de
  s'écrire au même endroit — rien n'est recopié, rien n'est perdu, et une ancienne version du jeu la
  relirait encore. L'index **se répare tout seul** : entrée dont la sauvegarde a disparu → retirée ;
  sauvegarde absente de l'index → adoptée par balayage des clés (`clesParties`), remise en ordre grâce à
  `G._maj` (la date que chaque sauvegarde porte en elle).
  **Mémoire pleine** : `setItem` qui déborde ne casse plus rien — `SAVE_KO` passe à vrai, le joueur est
  prévenu **une seule fois par session** (`SAVE_CRIE`) avec la marche à suivre, un bandeau rouge s'affiche
  en pied de page, et la partie continue de se jouer.
  **UN MATCH EN COURS NE PART JAMAIS DANS LA SAUVEGARDE (v1.05)** : `G._pend` porte des **références** aux
  vrais clubs et aux vrais joueurs (cf. `jouerJournee`). Sérialisé, il les **duplique** — la sauvegarde
  doublerait de taille — et au rechargement `finirJournee` appliquerait le résultat à des **clones détachés** :
  la journée serait comptée dans le vide et le classement perdrait un match. Deux verrous : la propriété est
  posée **non énumérable** par **`posePend()`** (JSON.stringify l'ignore, comme la mémoire `vus` du
  téléscripteur), et **`sauvegardeLocale` refuse d'écrire tant qu'elle est levée** — la dernière sauvegarde
  reste donc celle d'AVANT le coup d'envoi, la seule cohérente (les autres matchs de la journée sont déjà
  appliqués dès que le vôtre commence, donc un état intermédiaire ne se reprend pas). En pratique aucun
  chemin n'y menait déjà (`montre()` passe par `abandonneDirect()`, et le bouton 💾 vit dans un pied de page
  masqué en `mode-direct`) : c'est une ceinture. Pour les sauvegardes d'AVANT qui en porteraient un,
  `migre()` appelle **`relieClones()`**, qui rebranche clubs et joueurs par `id`/`uid` avant de finir la
  journée. Gardé par la **section H de `harness-sauvegardes.cjs`**.
  L'export/import d'un fichier JSON reste pour la sauvegarde de secours et le transfert entre appareils
  (nom de fichier parlant : `multiplex95-rc-lens-1995-96-J12.json`) ; **un import ouvre toujours une
  carrière DE PLUS**, il n'écrase jamais celles du navigateur. **Un fichier importé passe par `assainit()`**
  (v1.05), qui retire les chevrons de **toutes** ses chaînes en profondeur : un nom de club bricolé à la main
  ressortirait sinon dans du HTML par l'un des ~115 points d'écriture qui ne passent pas par `esc()`. On coupe
  à la racine, à l'entrée, plutôt que de parier sur l'exhaustivité d'un audit. Le `localStorage` ne porte PAS de logique de
  jeu — juste la sérialisation de `G` ; et les helpers court-circuitent en mode test (`EN_TEST`) pour ne
  pas peser sur le harnais (`harness-sauvegardes.cjs` lève le drapeau le temps de l'appel pour les tester).
- Numéro de version centralisé dans la constante `const VERSION` (en tête de script) et recopié aux **deux**
  pieds de page — l'accueil (`Multiplex · prototype vX.Y ·`) et le jeu (`MULTIPLEX · vX.Y ·`). L'incrémenter à
  chaque livraison **à un seul endroit** (la constante) pour que les testeurs sachent sur quelle version ils
  jouent, et pour éviter que les deux pieds de page se désynchronisent.
- **Formulaire « À propos » (v1.62)** : `ecranApropos` poste vers la fonction Supabase `contact` (projet `hemedkhebhllymdgvuka`,
  sans JWT) qui range le message dans `public.messages_contact` (RLS sans règle : clé de service seule) puis le mail à
  l'auteur par Resend si le secret `RESEND_API_KEY` existe. Plafond 30 messages / 10 min, champ piège `ctcPiege` anti-robot.
  L'ancien `mailto:` ne faisait rien sans logiciel de messagerie. Le bouton devient « ✅ Message envoyé, merci ! ».
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
- **Style visuel (refonte d'interface du 23/09/2026, direction « Vestiaire de nuit »)** : fond bleu nuit
  `#0b1626`, texte `--txt`, blanc cassé `--clair` `#f2f5fa`, gris `--dim`. **Le jaune `#ffd24a` ne veut dire
  que trois choses** : VOTRE club (le « XI », le capitaine, votre ligne, vos victoires), l'ACTION offerte (bouton
  plein, cf. v1.02) et l'AVERTISSEMENT (carton, fraîcheur entamée, moral moyen, match nul) ; les scores du match
  le gardent aussi. Tout nom ou montant qu'on veut faire ressortir prend la classe `.fort` (blanc gras), jamais
  `.jaune`. Vert/rouge = hausse/baisse. **Plus de cyan ni de violet** (retirés à la demande de l'auteur) ; les
  titres `h2`/`h3` sont en blanc cassé. Plancher de texte : **13 px**.
- **Typographie** : trois fontes déclarées en variables `:root`, chacune avec sa pile de repli.
  `--font-texte` = **IBM Plex Sans** (tout ce qu'on lit, porté par `body` : tableaux, textes, boutons ;
  chiffres `tabular-nums`). Le rétro est réservé aux MOMENTS : `--font-ui` = **VT323** (le téléscripteur
  `#ticker` seulement) ; `--font-led` = **Silkscreen** (la « voix tableau d'affichage » : flash de but
  `#butFlash .gros`, `.scoreline`, les chiffres de score `.tSc`/`.tSep`, la note du mercato). Base à `15px`
  (14 sur téléphone), tableaux et boutons à 14. **Piège de métrique** : VT323 rend bien plus petit que Plex à
  taille égale — si on le remet quelque part, remonter sa taille d'environ 20 %. Les temps forts LED portent un
  **halo serré + ombre pixel** (`text-shadow:0 0 2px currentColor, 0 1px 0 rgba(0,0,0,.6)`), pas un néon flou —
  ne pas réintroduire le `0 0 9px`. **Le match en direct est le seul écran où le rétro domine** : `#tabScore` est un
  panneau noir à points (noms en Silkscreen capitales, chiffres qui luisent, minute `.tMin` tenue par `majMinute`,
  appelée depuis `ajouteLigne`) ; le flash de but parle VT323 + Silkscreen, **plus de Courier New** ; les lignes de
  service du téléscripteur (`.sys`) sont grises, le vert restant réservé à la hausse.

## Systèmes de jeu en place (ne pas casser)
- **APRÈS CE MATCH — LES PROCHAINS RENDEZ-VOUS (v1.20, idée prise à RFM27)** : sous l'affiche du jour, trois
  lignes au plus disent ce qui vient — l'adversaire, son rang, le lieu, et les soirs de semaine marqués comme
  tels. Sans ça, la rotation se décidait à l'aveugle : on ménageait un cadre le samedi sans savoir qu'un
  huitième de finale tombait le mercredi. `prochainsRdv(o, n, rdv)` est **PUR** (prend G, ou une sauvegarde
  relue) et rend une liste triée `{j, ordre, ico, semaine, txt}` ; `blocProchains(o, rdv)` la rend. Posé sous
  l'affiche dans `ecranCalendrier` (le samedi comme les soirs de semaine, une seule insertion) et dans le
  panneau « ⚽ LE PROCHAIN MATCH » de `ecranReprise`.
  **La règle, et elle est stricte : on n'annonce que ce qu'on SAIT** (cf. le piège « une ligne ne doit jamais
  affirmer une phase de jeu qu'elle ne connaît pas »). Les journées de championnat à venir, oui — le calendrier
  les porte. Le **prochain** tour de coupe et la **prochaine** manche européenne, oui, à leur journée
  (`COUPE_TOURS[tourIdx].j`, `EURO_TOURS[tourIdx].j`/`.jr`) — mais **jamais les tours d'après**, qui n'existeront
  que si l'on y est encore, et dont l'adversaire n'est pas tiré ; un tour à venir se dit d'ailleurs
  « adversaire à tirer », alors qu'une manche RETOUR nomme l'adversaire de l'aller (`eu.attente.mien`). Éliminé,
  le tour disparaît. **Le rendez-vous qu'on joue ce soir n'y figure pas** (`rdv`, celui de `rdvEnAttente`) : il
  est déjà à l'écran, mais le samedi de la même journée, lui, y entre. **L'ordre à l'intérieur d'une journée est
  celui de `rdvEnAttente`** : Europe, puis Coupe de France, puis le championnat. Un tour encore lointain ne prend
  pas la place d'un samedi : la liste est chronologique et coupée à trois.
  Gardé par la **section H de `harness-rdv.cjs`**.
- **LE BANC EN DIRECT (v1.19, arbitrage de l'auteur : « un bouton Banc, les changements automatiques restent
  le défaut »)** — un bouton **🔁 Banc** dans le bandeau du direct (`htmlCtlTactique`, masqué partout sauf en
  championnat : les soirs de coupe n'ont pas de `CHANGEMENTS`). **Si on ne l'ouvre jamais, rien ne change** :
  les trois changements restent tirés par `tireSubs` (57e/65e/73e) et le match se joue comme en v1.18. Mais à
  tout moment on peut reprendre la main sur CEUX QUI RESTENT : chaque changement décidé consomme l'une des trois
  places et fait sauter le dernier que le banc avait prévu (`poseRemplacement`, la même que pour un blessé et
  pour le gardien relevé). La fenêtre se lit en deux temps — « Qui entre ? » puis « À la place de qui ? » —
  chaque nom avec son poste, sa note et sa fraîcheur, et se referme sur un verdict **en mots** (`verdictBanc`) :
  le jeu ne montre jamais un multiplicateur.
  **Deux limites du modèle, assumées et dites** : on ne remplace qu'un **titulaire encore sur la pelouse**
  (`p.xi` apparie un entrant à un homme du onze de départ — `enJeu` ne saurait pas faire entrer quelqu'un à la
  place d'un remplaçant), et **le gardien ne sort que sur blessure ou carton rouge** (consigne v1.13).
  **Mécanique** : `ouvreBanc(ctx)` vit au niveau du module (testable), `ctx` = `{monMatch, eM, mul:{h,a}, pos(),
  reprendre(), suite()}` où `pos()` rend `{from, mNow}` — la position du téléscripteur, calculée exactement
  comme pour une consigne changée (on recolle APRÈS une action déjà annoncée par la montée de tension). Le poids
  passe par `poidsPelouse` (onze contre onze : la formule des trois zones), puis `rejoueDepuis` rejoue la fin du
  match et la ligne « Changement pour X : A entre à la place de B. » est posée en tête de ce qui reste à lire.
  **Piège corrigé en v1.55** (retour auteur : « il est rentré une 2e fois automatiquement ») : faire entrer un homme que
  le banc gardait pour plus tard fait sauter son changement prévu (`avanceLeBanc`), mais sa ligne pré-écrite survivait
  au recollage, car `enFeuille` (dans `rejoueDepuis`) ne comparait que l'uid de l'entrant, qui est toujours sur la
  feuille, à la minute du banc. Il compare désormais l'uid ET la minute. Gardé par la section J de `harness-banc.cjs`.
  **Le vivier est commun au pépin et au choix** : `bancDispo(c,p,m)` (jamais le gardien remplaçant, jamais un
  homme déjà entré, mais OUI un homme que le banc comptait faire entrer plus tard — `avanceLeBanc` retire alors
  ce changement-là). **`ligneChangement` distingue trois causes** : `blessure` (SUBS_BLESSURE), le gardien
  appelé par un rouge (SUBS_URGENCE), et `banc` — un changement voulu s'annonce comme n'importe quel autre, sans
  `l.urg` : c'est un choix, pas un drame. Le bouton s'éteint avec la tactique quand le résultat est acté
  (`figeTac`). Gardé par **`harness-banc.cjs`** (sections A à I).
- **LA BLESSURE EN DIRECT (v1.18, partie d'une capture de RFM27 rapportée par l'auteur)** — jusqu'ici un pépin
  se découvrait APRÈS la rencontre, dans les dépêches (« INFIRMERIE : X touché »), et le téléscripteur faisait
  grimacer des hommes qui se tenaient la cuisse sans que rien n'arrive jamais. Désormais, pour LA rencontre qu'on
  joue, il tombe à une minute, le direct s'arrête et le banc se lève.
  **Le tirage n'a pas bougé d'un iota.** `tirageBlessure(c,j)` est la seule règle (fragilité, centre de formation,
  préparateur physique, fraîcheur d'AVANT le coup d'envoi — les chiffres d'avant, au centième près) et n'est
  appelée qu'UNE fois par homme et par match. Ce qui change, c'est QUAND : pour mon match, `tireBlessures` la joue
  avant le coup d'envoi et range le résultat sur la feuille du jour (`sel.bless` = `[{uid, d, m}]`) ;
  `appliqueResultat` la RELIT au lieu de tirer une seconde fois (`sel.bless` présent → plus de tirage). Les neuf
  autres rencontres gardent l'ancien chemin, intact. Mesuré sur 6 carrières × 38 journées et plusieurs tirages :
  0,22 blessure par match pour mon club et 0,20 pour les dix-neuf autres en v1.17, 0,23 et 0,20 en v1.18 — dans
  le bruit. (Mon club a toujours eu un taux un peu supérieur : incidents de vestiaire et moment de la 90e.)
  **La minute tombe dans SON temps de jeu**, jamais depuis le banc : si un changement devait le sortir à la 57e,
  le pépin tombe avant. `m:0` = il sortait trop tôt pour que la scène ait lieu — la blessure existe quand même et
  se découvre aux dépêches, comme avant.
  **Le banc répond AVANT la simulation.** `remplaceBlesse(c,m,j)` fait entrer celui de son poste qui rend le plus
  (sinon le meilleur dépanneur resté assis), y compris un homme qu'on comptait faire entrer plus tard —
  `avanceLeBanc` retire alors ce changement-là, sans quoi il entrerait deux fois. C'est l'un des TROIS changements
  (`poseRemplacement`, désormais partagée avec `releveGardien`, qui s'en servait déjà mot pour mot). Un gardien
  passe par `releveGardien(…, "blessure")` ; sans doublure valide, `p.sorti[uid]=m` le sort de la pelouse et un
  joueur de champ enfile les gants. **`enJeu` et le prorata de fraîcheur lisent `sorti` comme ils lisent `rouge`**
  (la minute où l'on quitte le terrain, quelle qu'en soit la raison). Conséquence essentielle : le moteur travaille
  avec la bonne pelouse dès la PREMIÈRE simulation — au téléscripteur, en résultat instantané et au harnais.
  **La fenêtre du banc** (`ouvreBlessure(ctx, lg, idx)`, posée HORS de `lanceMatch` pour être jouable au harnais ;
  `ctx` = `{monMatch, eM, mul:{h,a}, reprendre(), suite()}`) ne s'ouvre que pour VOTRE club, en direct, résultat
  non acté, hors match truqué. **Le remplacement rapide est la réponse PAR DÉFAUT — celle que le moteur a déjà
  jouée — et ne rejoue donc rien.** Trois déviations, chacune recollée par `rejoueDepuis` depuis la minute du
  pépin : un autre homme du banc, « il serre les dents » (le remplaçant se rassoit, et le changement que le pépin
  avait fait sauter revient à sa minute), et « le sortir quand même » quand il n'y a plus de banc. Règle qui tient
  tout l'édifice : **on ne rejoue JAMAIS le défaut**, sinon le même choix coûterait au téléscripteur ce qu'il ne
  coûte pas en résultat instantané.
  **Ce que coûte une déviation — deux questions, deux réponses, à ne pas mélanger.** À onze contre onze (faire
  entrer un autre), c'est `poidsPelouse` : la formule des trois zones repassée sur le onze réellement aligné, et
  l'on garde le rapport des buts attendus. Quand il MANQUE un homme, entier ou par morceaux (finir à dix, ou garder
  un boiteux), c'est `poidsHommeEnMoins(part)` : les rails du carton rouge (0,78 pour nos buts, 1,18 pour les leurs)
  au prorata. **Pourquoi** : la formule des zones divise par les PLACES de la formation — un attaquant manquant sur
  deux ferait fondre l'attaque de moitié (×0,49 mesuré) alors qu'une équipe à dix se réorganise. Un boiteux
  (`BLESS_BOITE`=0,55, donc 45 % d'homme en moins) vaut ×0,89/×1,08 : toujours mieux qu'un trou, le choix n'est
  jamais joué d'avance. **S'entêter se paie** : 45 % du temps (`BLESS_AGGRAVE`) l'absence s'allonge de 1 à 3
  journées, sinon le virage scande son nom (+4 de moral).
  **PIÈGE PAYÉ, trouvé par `harness-effectif`** : le changement posé au coup d'envoi peut avoir SAUTÉ pendant la
  simulation — un rouge annule le changement prévu pour l'expulsé, un gardien à relever fait sauter le dernier
  changement à venir. Les lignes du fil s'écrivent donc APRÈS `simuleMatch`, en revérifiant que l'entrant est
  toujours sur la feuille (sinon on écrit « il reste sur la pelouse ») ; et un blessé qu'un rouge avait déjà sorti
  n'a pas de scène du tout (`b.m=0`).
  **Le fil** : `ligneBlessure` porte `bl:{cote,nom,uid}` et surtout PAS de `uid` en propre — `enFeuille`, dans
  `rejoueDepuis`, le prendrait pour un entrant et jetterait la ligne. `rejoueDepuis` fait survivre la scène au
  recollage : une consigne changée n'empêche personne de se blesser. Icône `soin` (la croix rouge) dans `ICO`,
  textes dans `BLESSURE_DIT` et `SUBS_BLESSURE` (`ligneChangement` choisit son vivier selon `u.cause`).
  Gardé par **`harness-blessure.cjs`**, sections A à K.
- **CHANTIER « UN SEUL MOTEUR » — les fondations (22/09/2026, ouvert après la v1.16)**. Objectif : router la
  Coupe de France et la Coupe d'Europe par **`simuleMatch`**, le moteur du championnat, au lieu du modèle de
  force autonome — « je ne veux pas d'un moteur au rabais pour les coupes » (l'auteur). La fatigue, le moral,
  la cohésion, les cartons et les blessures doivent y peser comme le samedi ; **les buteurs, eux, ne doivent
  jamais se mélanger**. Deux pièces sont déjà posées, toutes deux NEUTRES tant que les coupes n'y sont pas
  routées (le jeu se comporte exactement comme avant, les dix-huit harnais le prouvent) :
  1. **`appliqueResultat` est coupé en deux.** `majTableau(h,a,sh,sa)` remplit le classement (points, buts
     pour et contre, série de `forme`) ; `registreDesHommes(h,a,pre)` tient le registre des joueurs (un match
     de plus, les blessures, le prix payé en fraîcheur, et le `_joue` qui nourrit `progression`).
     `appliqueResultat` reste leur somme et c'est toujours elle que la journée appelle. Un soir de coupe
     n'appellera QUE le second : un tour de coupe ne doit déposer ni point ni but au classement — et surtout
     pas toucher à `forme`, que relit `affluence`.
  2. **Le contexte de compétition `COMPET`** (`"L"` championnat · `"CF"` Coupe de France · `"EU"` Europe), posé
     près de `CHANGEMENTS`/`MIN_JEU`. Il dit au moteur dans quel carnet écrire : `j.buts`/`j.passes`/`j.matchs`
     en championnat, `j.butsC`/`j.passesC`/`j.matchsC` en coupe. `marque()` et l'annulation de but de
     `rejoueDepuis` passent par `cleButs()`/`clePasses()`, `registreDesHommes` par `cleMatchs()`. **Toujours
     entrer par `enCompet(quoi, fn)`**, qui rend le maillot dans un `finally` : une variable laissée sur `"CF"`
     ferait disparaître la journée de championnat suivante de tous les classements. Les totaux toutes
     compétitions (`butsTous`, `passesTous`, `matchsTous`) servent à ce qui juge un joueur sur ce qu'il vaut —
     l'intérêt des autres clubs (`_momeStat`/`statMark`) — jamais aux classements officiels. **Arbitrages de
     l'auteur** : les buts de coupe comptent pour la progression et la cote, mais ne s'affichent QUE sur la
     fiche du joueur (ligne « En coupe : … », masquée tant qu'elle est vide) ; les suspensions restent
     communes aux trois compétitions (un rouge en coupe coûtera donc un match de championnat) ; les
     prolongations se joueront pour de vrai, deux fois quinze minutes puis tirs au but ; les clubs amateurs
     recevront un effectif de seize joueurs généré au tirage du tableau et gardé jusqu'à l'intersaison ; et le
     nouveau moteur doit ADOUCIR le parcours en coupe (viser 15-20 % de sortie aux 32es contre 35 % au modèle
     actuel), parce que la profondeur d'effectif doit enfin peser. Reste à faire : les effectifs amateurs, le
     terrain neutre, l'affluence de coupe, les prolongations, puis la bascule elle-même, l'Europe d'abord.
  3. **La récupération hebdomadaire soigne les TROIS viviers.** La boucle de fin de journée ne passait que
     sur `G.clubs` : un joueur de D2 (`G.autre`) ou d'un club européen (`G.europe`) blessé ne guérissait
     jamais, et sa fraîcheur ne remontait jamais. C'était sans conséquence visible — ils ne jouent pas le
     championnat, et l'ancien modèle de coupe ne distribuait ni carton ni pépin — à une exception près, le
     joueur blessé vendu en D2 qui y restait éclopé pour toujours. Mais dès que les coupes passeront par
     `simuleMatch`, ces effectifs accumuleraient blessés et suspendus à vie, `onze()` finirait par aligner
     des dépanneurs hors poste et leur force s'effondrerait toute seule au fil de la saison. `reposHebdo`
     porte en plus une ceinture (club sans effectif dans une vieille sauvegarde). **Gardé par la section H
     de `harness-coupes.cjs`**, vérifiée rouge sur le code d'avant le correctif.
  4. **LES CLUBS AMATEURS ONT DES JOUEURS.** Un club de village n'était qu'une ligne de `CLUBS_AMATEURS`
     (nom, ville, note de force) et le téléscripteur lui inventait des buteurs à chaque affiche : le héros
     du tour précédent n'existait plus au tour suivant. `batitAmateur` lui monte désormais un vestiaire de
     **seize hommes (2G 5D 5M 4A, `AMA_CIBLE`)**, ce qu'exige `simuleMatch` — onze sur la pelouse, un
     gardien qu'on nomme, un banc, des jambes. **Calibrage** : les notes sont recentrées d'un décalage
     constant (qui ne change pas l'ordre, donc `onze` retient les mêmes hommes et le recentrage est exact
     du premier coup) pour que `forceClub` tombe sur la note de force du club — la mesure même que lisait
     l'ancien modèle, donc le calibrage des coupes ne dérive pas. Le **Petit Poucet** est bâti sur sa force
     MAJORÉE (`COUPE_POUCET_BONUS`) : son talent vit dans ses joueurs, plus dans un bonus accroché au
     résultat, ce qui permettra au vrai moteur de le faire briller tout seul. **Trois pièges, tous payés** :
     (a) **le poids** — les bâtir tous d'un bloc au tirage ajoutait ~100 Ko par sauvegarde et faisait passer
     quatre carrières à 5,6 Mo, au-dessus des ~5 Mo du navigateur (attrapé par `harness-sauvegardes`) ; un
     village naît donc **à sa première affiche** (`clubAmateur`, appelé par `clubAffiche`) et son vestiaire
     est **rangé dès l'élimination** (`rangeAmateursSortis`, appelé par `coupeResoutTour`) — on est retombé
     à 559 Ko et 4,0 Mo. Corollaire à retenir : **lire `clubAmateur` d'un club éliminé lui rebâtit un
     vestiaire neuf**, donc toute mesure du rangement doit précéder les lectures. (b) **les homonymes** —
     `coupeInit` est descendu APRÈS `construitDivision` de l'Europe dans `nouvellePartie` : lancé avant, il
     ignorait les remplaçants générés des clubs européens et l'on voyait un villageois porter le nom d'un
     homme de la Juventus. `nomsPris` balaie les trois viviers, le vivier de transferts et les villages déjà
     bâtis. (c) **pas de biographie** pour un villageois (personne n'ouvre sa fiche, et 384 `genHistoire`
     pesaient lourd) ; `reel:false` est posé en dur, sans passer par `j.reel=!j.histoire`. L'affichage
     (`clubAffiche`, `nomsAffiche`, `gardienAff`) est branché sur ces effectifs et garde un filet de noms de
     circonstance pour un club sans vestiaire. **Gardé par la section I de `harness-coupes.cjs`.**
  5. **CE QUE LE MOTEUR A APPRIS POUR LES SOIRS DE SEMAINE.** `simuleMatch` prend un 4ᵉ argument `opts`
     — `{neutre, prolong}` — **inerte quand il est absent** : le samedi, tout se comporte exactement comme
     avant (vérifié, le calibrage du championnat ne bouge pas). Trois ajouts. **(a) Terrain neutre** pour
     la finale européenne : `ferveur` figée à 1 et l'avantage du terrain remplacé, des deux côtés, par la
     moyenne géométrique de 1,18 et 0,92 (≈ 1,042) — le total de buts attendu ne bouge donc pas, seule la
     répartition change. Une finale est un match sans maître, pas un match fermé. **(b) `affluenceCoupe`**,
     parce que `affluence` lit la série de forme et le classement, que n'ont ni un village ni la Juventus :
     ce qui remplit un stade un soir de coupe, c'est QUI DESCEND (le village affiche complet quand l'élite
     vient chez lui, un grand stade sonne creux pour recevoir des amateurs), et l'on retrouve la moyenne de
     ~75 % de remplissage de l'ancien modèle. **(c) Les prolongations** : l'horloge de `simuleMatch` a une
     borne MOBILE (`fin`, 90 → 120) — les cadences étant exprimées en /90, chaque minute ajoutée compte
     juste. `usureProlong` applique alors l'usure propre aux trente minutes, d'autant plus forte qu'on y
     arrive entamé (1,00 au plein régime, 0,88 à 65 de fraîcheur) : **c'est là qu'un banc court se paie**.
     Puis `tirsAuBut` tire la séance pour de vrai, cinq frappes chacun et mort subite, chaque tir opposant
     un tireur à un gardien. **PIÈGE DE CALIBRAGE, corrigé** : un premier barème faisait peser la qualité
     à un centième de point de réussite par point de note — un village n'éliminait le PSG aux tirs au but
     que 5 % du temps, deux clubs de D1 séparés de dix points s'écartaient déjà à 70-30. C'est faux, et
     surtout contraire à ce que la coupe raconte : **une séance est une loterie, et c'est exactement pour
     ça que les petits y battent les grands**. Coefficient ramené à 0,002 et fourchette resserrée à
     [0,60 ; 0,88] → le village sort le PSG 22 % du temps, Rennes 39 %. Second piège : la mort subite
     bornée trop court laissait deux séances sur trois mille finir à égalité. **Gardé par la section J.**
  **FUSION DU 22/09/2026** : `main` (v1.18 à v1.20 — la blessure en direct, le banc, les prochains
  rendez-vous) a été fusionnée dans ce chantier. Un seul conflit, dans `registreDesHommes` : les deux côtés
  y touchaient au même bloc. Résolu en gardant les deux — le contexte de compétition (`kM=cleMatchs()`) du
  chantier ET le tirage unique de la blessure de la v1.18. **Conséquence à retenir pour la bascule** : un
  soir de coupe passe par `registreDesHommes` sans `sel.bless`, donc son pépin se tire au coup de sifflet,
  comme avant. Le jour où les coupes ouvriront la fenêtre du banc (l'auteur l'a demandé le 22/09 : « partout »),
  il faudra leur poser une feuille du jour — `tireBlessures` + `remplaceBlesse` avant `simuleMatch`, comme
  `jouerJournee` le fait pour le samedi.
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
- **LE RECRUTEUR, SAISON PAR SAISON (v1.69, retour auteur)** : « David Sommeil en D2 à Caen en 2003 », « on voit
  toujours les mêmes », « leur note aussi ». Le vivier de l'été 95 projeté dans le temps gardait le club de 1995,
  et chaque carrière démarrait sur les mêmes trente noms. Désormais `VIVIER_SAISON[an]` donne, pour chaque été
  de 1990 à 2009 (2005-2009 ajoutés en v1.70, avant même les saisons de départ correspondantes, pour les longues carrières), une quarantaine de vrais joueurs **au club où ils jouent cet été-là**, avec une note à leur
  niveau du moment : `[nom, poste, année de naissance, note, pot, club, drapeau, prénom]`, drapeau `""`,
  `"FR"` (Français de l'étranger, nationalité FR à la signature) ou `"froid"` (décote ; le club porte alors
  la raison, « Inter Milan, en rééducation »). Le profil affiché se déduit (`profilSaison`). `vivierDeSaison(an)`
  bâtit le vivier au départ (`genRapport`) et le **remplace entièrement à chaque intersaison** : les clubs ont
  bougé, les notes aussi. Au-delà de la dernière liste, l'ancien vieillissement (`ageJoker` + réserves) prend le
  relais. Une sauvegarde d'avant v1.69 est refaite sur la liste de sa saison au chargement (`migre`, repère
  `G._vivierAn`). Clubs et années de naissance **vérifiés par script contre Wikidata** (P54 avec dates, P569) ;
  un été ne partage pas plus de ~50 % de ses noms avec le précédent. Le prénom de la liste n'entre dans
  `PRENOMS_VRAIS` que si le nom court n'y figure pas déjà (« M. Hughes » y est Michael, de Strasbourg : Mark
  Hughes n'est donc PAS dans les listes ; même prudence pour tout nom court ambigu). La clé « En froid avec son
  club » a perdu son tiret long. Gardé par `harness-recruteur.cjs`.
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
- **Saison de départ au choix (v0.62)** : un sélecteur à l'accueil (`#selSaison`) permet de démarrer une
  carrière neuve sur une saison **réelle** au choix — point de départ UNIQUEMENT : une fois lancée, la
  carrière est procédurale comme avant (joueurs conservés, pas de transfert « magique »). Registre
  **`SAISONS`** (clé → `{an, titre, d1:[ids], d2:[ids], starsD1, starsD2, sous}`) : `"1995-96"` (base,
  pointe sur CLUBS/STARS) et `"1996-97"` (vrais effectifs curés `STARS_9697`/`STARS_D2_9697`, source
  **Transfermarkt** `…/kader/verein/<id>/saison_id/1996`, scrapés au proxy *stealth* ; **âge_jeu = âge
  Transfermarkt − 1** pour coller à la convention « 1996 − naissance »). `nouvellePartie(clubId, saisonKey)`
  charge la saison choisie via `metaClub(id)` (cherche CLUBS/CLUBS_D2/**CLUBS_EXTRA** = les 4 clubs absents
  de 95-96 : Beauvais, Briochin, Troyes, Toulon) et pose **`G.anBase`** (année civile de la 1re saison).
  **`anneeJeu() = anBase + saisonIdx − 1`** (généralisé) ; `G.saison` et les **`HONNEURS`** (étés Euro/Mondial)
  sont réindexés par année civile → corrects quel que soit le départ. `SAISON_ACCUEIL` = saison sélectionnée
  à l'accueil. **Le vivier exclut désormais à l'init tout joueur déjà employé** (`genRapport`, pour ne pas
  proposer Papin/Gallas/… déjà sous contrat en 96/97). En 96/97 : l'OM remonte en D1 (avec Caen, Nancy),
  Saint-Étienne/Gueugnon/Martigues descendent en D2 ; la vraie D2 96/97 comptait 22 clubs → **2 écartés**
  (Charleville, Louhans) pour tenir les 20. Doublons inter-clubs de Transfermarkt (transfert en cours de
  saison : Coupet→STE, Luccin→CAN, Cascarino→NCY, Diao→EPI, Kosecki→NAN…) **résolus à la main**. Validation
  dédiée : **`harness9697.cjs`** (20+20, doublons, année de base, été 98 bien daté, carrières + calibrage).
  **1997-98 (v0.92)** : `STARS_9798`/`STARS_D2_9798`, `D1_9798`/`D2_9798`, `an:1997` (le Mondial 98 tombe dès la
  1re intersaison). **La vraie D1 97/98 n'avait que 18 clubs** (4 relégués en 96/97 pour 2 promus : Toulouse,
  Châteauroux) et la D2 en comptait 22 → 18 + 22 = 40 pile : **Caen et Nancy, meilleurs relégués de 96/97 (37 pts),
  sont REPÊCHÉS en D1** (choix de l'auteur, moteur intact à 20 clubs/38 journées) et la D2 retombe à 20 sans écarter
  aucun club réel. Deux clubs neufs dans `CLUBS_EXTRA` : **Nîmes** (`NIM`, Costières) et **Wasquehal** (`WAS`, Stadium
  Nord de Villeneuve-d'Ascq, jaune et noir), avec blason et malédiction. Sièges européens réels : Monaco + PSG en C1,
  **Nice en C2 depuis la D2** (vainqueur de la Coupe 97, relégué), Nantes/Bordeaux/Metz/Strasbourg/Auxerre/Lyon/Bastia
  en C3. **Méthode de relevé (à réutiliser pour 98/99)** : DEUX pages Transfermarkt par club — l'effectif détaillé
  `…/kader/verein/<id>/saison_id/1997/plus/1` (naissance, poste) ET les temps de jeu
  `…/leistungsdaten/verein/<id>/reldata/%261997/plus/1` (matchs, minutes, et surtout la mention « Pas dans l'effectif
  cette saison » qui démasque les erreurs de TM — Lamouchi listé à Monaco alors qu'il n'y arrive qu'en 1998). **Piège** :
  la colonne « Membre depuis » ne donne que la DERNIÈRE arrivée au club (Wallemme « depuis 2001 » à Lens) → inutilisable
  pour dater un transfert. Effectifs = joueurs ayant joué, triés par minutes (20 en D1, 18 en D2, minimums 2-5-5-4),
  plus quelques jeunes notables forcés (Malbranque, Gallas, Malouda, Maoulida) ; 36 ans et plus écartés. Un joueur
  présent dans DEUX clubs (29 cas) est rangé à son club du **coup d'envoi d'août 1997** (Giuly à Lyon, Kaba Diawara à
  Bordeaux, Libbra à l'OM). Notes : les joueurs déjà curés repartent de leur note 96/97 (+2 jusqu'à 21 ans, +1 jusqu'à
  24, −1 de 30 à 32, −2 au-delà), les autres sont notés à la main (médiane D1 70, D2 67, plafond 87 — Barthez).
  Homonymes à initiale identique (deux « S. N'Diaye », « L. Leroy », « B. Clément ») → l'un est remplacé par un autre
  vrai joueur de son club (convention de désambiguïsation). Si la page TM oppose un anti-robot, le domaine
  `transfermarkt.com` passe. Validation dédiée : **`harness9798.cjs`**.
  **Réconciliation France ↔ Europe au coup d'envoi (v0.92)** : les clubs européens restent figés en 95-96, donc un
  joueur passé en France depuis (Ravanelli à l'OM, Simone au PSG, Papin à Bordeaux, Collins à Monaco dès 96/97…)
  aurait joué sur deux terrains. `nouvellePartie` **retire désormais des effectifs européens tout nom présent dans les
  effectifs français de la saison choisie** (avant `construitDivision`, qui recomplète) — sans effet en 95-96 (aucune
  collision), correctif rétroactif pour 96/97.
  **1998-99 (v0.93)** : `STARS_9899`/`STARS_D2_9899`, `D1_9899`/`D2_9899`, `an:1998` (aucun tournoi à la 1re intersaison —
  l'Euro 2000 tombe à la 2e). **La vraie D1 98/99 n'avait que 18 clubs et la D2 exactement 20** : le compte ne tombait plus
  juste comme en 97/98, d'où un **double repêchage, dans les deux sens** — **Guingamp (35 pts) et Châteauroux (31)**,
  meilleurs relégués de D1 97/98, montent en D1 (qui passe à 20) ; la D2 retombant alors à 18, **Louhans-Cuiseaux (49 pts)
  et Martigues (45)**, meilleurs relégués de D2 97/98, y sont repêchés à leur tour. **Toulon, pourtant 20e et donc
  prioritaire, a été écarté** : Transfermarkt ne lui connaît qu'UN joueur en 98/99 (le club s'effondrait financièrement),
  son effectif aurait été procédural à 95 %. Deux clubs neufs dans `CLUBS_EXTRA` : **Sedan** (`SED`, Émile-Albeau, vert et
  rouge) et **Ajaccio** (`AJA`, François-Coty, champion du National), avec blason et malédiction ; Ajaccio apporte au
  passage **le derby corse** (`RIVAL` + `NOMS_RIVALITES`, dormant tant que les deux Corses ne sont pas dans la même
  division). Sièges européens réels : **Lens (champion) et Metz en C1**, **PSG en C2** (vainqueur de la Coupe 98),
  Monaco/OM/Bordeaux **plus les trois vainqueurs de l'Intertoto 98 — Bastia, Auxerre, Lyon** — en C3.
  **Méthode de relevé** : identique à 97/98 (deux pages TM par club), mais **l'extraction passe par Firecrawl en proxy
  *stealth*** — WebFetch est bloqué par Transfermarkt. **Découverte qui simplifie tout** : l'âge affiché par TM sur une page
  de saison passée est celui **au 30 juin**, donc décalé d'un an pour les joueurs nés au second semestre ; mais comme
  `âge_jeu = 1998 − naissance`, **un joueur déjà curé en 97/98 se contente de `âge + 1`** (vérifié joueur par joueur sur
  Bordeaux). **Notes** : les 600+ noms déjà curés repartent de leur note 97/98 **vieillie** (+2 jusqu'à 21 ans, +1 jusqu'à
  24, −1 de 30 à 32, −2 au-delà ; plafond remonté à **88** pour Barthez, champion du monde) ; les ~90 noms neufs reçoivent
  une **note de base calculée** (médiane D1 70 / D2 67, modulée par le rang réel du club en 98/99 et par le rang de temps de
  jeu dans l'effectif), puis une **table d'ajustements à la main** pour tout ce qui se reconnaît (Okocha 84, Wörns 80,
  Nonda 76…). **Sélection** : joueurs ayant joué, triés par minutes (20 en D1, 18 en D2, minimums 2-5-5-4), 36 ans et plus
  écartés — Cascarino et Oceano sautent ainsi, alors qu'ils étaient titulaires.
  **PIÈGE DU TRI PAR MINUTES, à ne pas rouvrir** : il écarte les pépites qui n'ont pas encore joué — **Thierry Henry
  (993 min, 5e attaquant de Monaco) passait à la trappe**. D'où une liste de **forçage** des jeunes notables (Henry, Riise,
  Drogba, Malouda, D. Cissé, Diouf, Feindouno, Méité, Frau, Djimi Traoré…), à rallonger si l'on ajoute une saison.
  **Second piège** : le format « X. Surname » se déduit du PREMIER mot, donc un prénom composé sans trait d'union donne un
  nom faux (« J. Arne Riise ») — passer en revue tous les noms à trois mots avant livraison ; les particules Le/De/Da/Van,
  elles, sont correctement gardées dans le patronyme. Un joueur listé dans deux clubs (26 cas) est rangé **là où il a le
  plus joué** (arbitrage plus sûr que « club du coup d'envoi », la colonne « Membre depuis » de TM étant inutilisable).
  Validation dédiée : **`harness9899.cjs`**.
  **1999-00 (v1.15)** : `STARS_9900`/`STARS_D2_9900`, `D1_9900`/`D2_9900`, `an:1999` (**l'Euro 2000 tombe dès la
  1re intersaison** — c'est la première saison où le grand tournoi arrive immédiatement). **La vraie D1 99/00 n'avait
  que 18 clubs et la D2 exactement 20**, même configuration qu'en 98/99, d'où le même **double repêchage dans les deux
  sens** : **Lorient (35 pts) et Sochaux (33)**, meilleurs relégués de D1 98/99, montent en D1 (Toulouse, 29 pts et
  18e, reste en D2) ; la D2 retombant à 18, **Red Star (39 pts) et Beauvais (38)**, les deux relégués de D2 98/99,
  y sont repêchés — tous deux jouaient le National en 99/00 mais Transfermarkt les documente largement (39 et 20
  joueurs), contrairement au cas Toulon de 98/99. Un seul club neuf dans `CLUBS_EXTRA` : **Créteil** (`CRE`,
  Dominique-Duvauchelle, **bleu et jaune**), avec blason et malédiction. **Vérifier les couleurs, ne pas les supposer** :
  Créteil avait d'abord été fait en bleu et blanc, à tort (la fiche Wikipédia du club donne les couleurs réelles).
  Au passage, les **cinq clubs qui tombaient encore sur l'écu gris générique** ont reçu leur blason, couleurs vérifiées
  elles aussi : Troyes (bleu et blanc), Amiens (blanc), Valence (rouge et blanc), Louhans-Cuiseaux (jaune et noir),
  Beauvais (rouge et blanc). Il ne reste sans blason que Mulhouse, Toulon, Épinal et Briochin, qui n'apparaissent
  qu'en 96/97 et 97/98. Sièges européens réels : **Bordeaux (champion),
  l'OM et Lyon en C1** (Lyon par le tour préliminaire), **Nantes en C2** (vainqueur de la Coupe 99, dernière édition
  de la C2), Monaco/Lens **plus Montpellier, vainqueur de l'Intertoto 99**, en C3.
  **Méthode de relevé — le proxy n'est plus nécessaire** : depuis cette machine, `curl` avec un simple User-Agent
  navigateur passe chez Transfermarkt (HTTP 200). Les 80 pages (40 clubs × 2) sont donc aspirées en local puis parsées
  hors ligne, ce qui remplace Firecrawl/WebFetch et ne coûte plus rien en contexte. **Attention, l'encodage varie d'une
  réponse à l'autre** (UTF-8 ou cp1252) : décoder en UTF-8 strict et retomber sur cp1252 en cas d'échec.
  **Découverte qui règle le piège des noms** : la page « temps de jeu » fournit une colonne **nom court** déjà au
  format « X. Patronyme », et TM y délimite correctement le patronyme (« Bjørn Tore Kvarme » → « B. Kvarme »,
  « John Arne Riise » → « J. Riise »). Le piège documenté en 98/99 disparaît donc — **mais TM réduit un prénom composé
  à une seule initiale** (« Jay-Jay » → « J. ») là où le jeu écrit « J.-J. Okocha ». D'où la règle : **prendre le
  patronyme chez TM, mais recomposer les initiales depuis le nom complet**. Sans cela, 40 joueurs déjà curés
  échappaient à l'appariement et recevaient une note recalculée (Okocha retombait de 84 à 75).
  **Notes** : 595 des 760 noms étaient déjà curés en 98/99 (ou 97/98) et repartent de leur note **vieillie** (+2
  jusqu'à 21 ans, +1 jusqu'à 24, −1 de 30 à 32, −2 au-delà ; plafond 88) ; les 165 neufs reçoivent une **note de base
  calculée** (médiane D1 70 / D2 67, modulée par le rang réel du club en 99/00 et par le rang de temps de jeu dans
  l'effectif), puis une **table d'ajustements à la main** de 14 entrées pour ce qui se reconnaît (Sonny Anderson 84 —
  meilleur buteur de D1 avec 23 buts —, Gallardo 79, Trezeguet 82, Márquez 75/88…). **Garde-fou qui a payé** :
  l'appariement n'est accepté que si l'âge concorde (âge 98/99 + 1). Il a isolé exactement les deux homonymes que
  CLAUDE.md signalait déjà — « S. N'Diaye » et « B. Clément » — au lieu de leur coller la note d'un autre.
  **Doublons** : dédoublonner **par identifiant Transfermarkt**, pas par nom — 9 transferts d'hiver (Dugarry, Pouget,
  Legwinski, Caveglia…) apparaissent dans deux clubs et vont à celui où ils ont le plus joué. Restent alors trois vrais
  **« S. N'Diaye »** (Samba/Amiens, Seyni/Caen, Sylvain/Toulouse) : le plus utilisé garde l'initiale, les deux autres
  prennent leur prénom complet (consigne auteur sur les homonymes).
  **Le tri par minutes écarte toujours les pépites** : forçage de **Mexès, D. Cissé, Pedretti, Tacalfred, Itandje et
  Péricard**.
  **LE PLAFOND D'ÂGE EST LEVÉ À PARTIR DE 99/00 (décision auteur)** : les saisons 96/97 → 98/99 écartaient les 36 ans
  et plus, ce qui coûtait ici quatre vrais titulaires — **Kastendeuch** (36 ans, 4026 minutes, le joueur le PLUS utilisé
  de tout le championnat), **Lama** (36 ans, 40 matchs, gardien n°1 du PSG), **Cascarino** (37 ans, 15 buts, 7e buteur
  de D1) et **Bravo** (36 ans, Nice). Ils sont désormais gardés : aucun mécanisme nouveau n'est nécessaire, puisque
  `vieillirClub()` incrémente l'âge AVANT de tester `age>=36` — un homme de 36 ans au coup d'envoi joue donc sa saison
  réelle puis raccroche à la 1re intersaison, exactement comme l'histoire. Seul Flucklinger (36 ans, 0 minute) reste
  dehors, écarté par le tri aux minutes et non par l'âge. Le harnais borne les âges à 38 et vérifie nommément la
  présence des quatre vétérans. À reconduire pour 00/01.
  Deux effectifs sont incomplets à la source et `genJoueur` complète : Lorient n'a que 4 défenseurs répertoriés chez
  TM, Caen qu'un seul gardien. Validation dédiée : **`harness9900.cjs`**.
  **1990-91 (v1.16)** : `STARS_9091`/`STARS_D2_9091`, `D1_9091`/`D2_9091`, `an:1990`, `saison_id/1990` — **la plus
  ANCIENNE saison du jeu**, et la première qu'on ajoute en remontant le temps au lieu de le descendre. La D1 réelle
  avait déjà ses **vingt clubs** : aucun repêchage, pour une fois. C'est la D2 qui posait la question, puisqu'elle se
  jouait alors en **DEUX GROUPES DE DIX-HUIT** : la règle retenue est la plus simple et la plus fidèle, **les dix
  premiers de chaque groupe** (groupe A : Nîmes, Strasbourg, Valenciennes, Alès, Istres, Bastia, Avignon, Rodez,
  Annecy, Mulhouse ; groupe B : Le Havre, Lens, Laval, Angers, Rouen, Reims, Guingamp, Beauvais, Tours, Red Star).
  Une seule exception, et c'est la jurisprudence Toulon 98/99 qui la commande : **l'AS Saint-Seurin, 8e du groupe B,
  a été écartée** parce que Transfermarkt ne lui connaît que **17 joueurs pour 18 places** — compléter aurait voulu
  dire inventer un homme, ce qu'on ne fait pas sur une saison réelle ; **Beauvais, 11e**, entre à sa place. Onze
  clubs neufs dans `CLUBS_EXTRA`, un record : **Brest** (`BRE`, Francis-Le Blé, rouge et blanc) en D1, et en D2
  **Valenciennes** (`VAN`, Nungesser — *attention, à ne pas confondre avec `VAL`, qui est Valence*), **Alès**
  (`ALE`, Pierre-Pibarot, bleu et blanc), **Istres** (`IST`, Bernard-Bardin — Parsemain n'ouvre qu'en 1997 —,
  violet et noir), **Avignon** (`AVI`), **Rodez** (`ROD`, rouge et jaune), **Annecy** (`ANN`), **Angers** (`ANG`,
  noir et blanc), **Rouen** (`ROU`), **Reims** (`REI`, Auguste-Delaune) et **Tours** (`TRS`, bleu ciel et noir),
  tous avec blason, malédiction et **couleurs vérifiées une à une sur leur fiche Wikipédia** (jurisprudence Créteil).
  Sièges européens réels : **l'OM en C1** (champion 89-90, il ira jusqu'à la finale de Bari), **Montpellier en C2**
  (vainqueur de la Coupe de France 1990), **Bordeaux et Monaco en C3** — la France n'avait que deux places UEFA
  cette année-là, vérifié sur le tableau de la Coupe UEFA 1990-91.
  **`HONNEURS` complété** : **1992** (Euro en Suède, le Danemark repêché et sacré) et **1994** (Mondial aux
  États-Unis, le Brésil aux tirs au but). Partir de 90/91 est **le seul cas du jeu où la PREMIÈRE intersaison ne
  porte aucun tournoi** : l'été 91 est muet, l'Euro 92 tombe à la deuxième, le Mondial 94 à la quatrième. Ni l'une
  ni l'autre de ces deux dépêches ne doit contenir la chaîne « LA FRANCE » en capitales, que `finDeSaison` lit comme
  un triomphe français.
  **LE SENS DU TEMPS EST INVERSÉ, et c'est le piège neuf de cette saison.** Les cinq saisons précédentes héritaient
  d'une note curée et la **vieillissaient** ; ici il faut la **rajeunir**, et l'inversion pure de la règle d'âge
  (+2/+1/0/−1/−2) **ment dans les deux sens** : elle rend +5 à un trentenaire (Amoros montait à 88, au-dessus de
  Papin) et retire huit points à un espoir sans jamais descendre assez bas (Zidane à 18 ans ressortait à 80).
  D'où la méthode retenue : **moyenne à parts égales entre la note rajeunie et une note calculée sur la saison
  elle-même** (médiane D1 70 / D2 67, modulée par le rang réel du club, par le rang de temps de jeu dans l'effectif
  et par une **courbe d'âge** — le pic à 26-29 ans, −8 à dix-sept ans, −7 à trente-sept). 288 des 760 noms étaient
  déjà curés ailleurs dans le jeu et repartent ainsi ; les autres sont entièrement calculés. **Et surtout, une table
  d'ajustements à la main de 64 entrées** (`AJUST`), sans laquelle rien ne tient debout : le calcul plafonne vers 79
  et ne sait pas qu'un homme a gagné le Ballon d'or. Papin 88, Waddle 86, Abedi Pelé 84, Valderrama, Blanc, Scifo,
  Amoros, Mozer et Sauzée 83, Sušić et Fernandez 82, puis Weah et Cantona 80 — **la note d'un joueur est sa valeur,
  pas son temps de jeu** (Stojković n'a joué que 1084 minutes, blessé toute l'année, et reste à 79).
  **Le tri par minutes écarte toujours les pépites** : forçage de **Thuram** (18 ans, **quinze minutes dans toute la
  saison**), Mboma, Déhu, Pedros, Ouédec et Grimandi. Attention, un forcé ne doit pas pouvoir être éjecté par le
  forçage suivant — c'est arrivé, Thuram sortait pour faire place à Grimandi.
  **Relevé — ce que Transfermarkt sert en 1990 et qu'il ne servait pas en 1999** : (1) un **anti-robot AWS WAF**
  répond HTTP 405 avec une page « Human Verification » sur une requête sur quatre ; **réessayer sur
  `transfermarkt.com`, `.de` ou `.co.uk` suffit** (27 pages sur 112 ont dû l'être, zéro échec au bout du compte).
  (2) Les pages sont servies **en trois langues au hasard** : les postes arrivent en français, en anglais
  (« Sweeper ») *et en allemand* (« Innenverteidiger », « Mittelstürmer ») — il faut les trois tables sous peine de
  perdre 72 joueurs sans poste. (3) La date de naissance s'écrit tantôt « 12 janv. 1962 (29) », tantôt
  « 08/02/1960 (31) ». (4) **Sur la page effectif, le nom du joueur est le `hauptlink` de la table imbriquée** : les
  `title="…"` de la ligne sont ceux des infobulles de transfert, et les lire donne des joueurs qui s'appellent
  « USL Dunkerque: Ablöse ? ». (5) Un joueur que la source **ne sait pas dater** est écarté plutôt que deviné — TM
  donne à Sébastien Gautier (Laval) une naissance en 1985, soit cinq ans au coup d'envoi.
  **Dédoublonnage par identifiant TM, toujours**, y compris pour les remplaçants jamais utilisés qu'on ajoute en
  comblement : Reuzeau et Simba réapparaissaient dans un second club par cette porte-là. L'arbitrage « là où il a le
  plus joué » a été vérifié sur le cas le plus surprenant : **Amara Simba, listé au PSG ET à Cannes, était bien
  prêté à Cannes cette saison-là** (32 matchs, 13 buts).
  **Deux patronymes en deux mots sont authentiques** et doivent être blanchis dans le contrôle « prénom composé
  avalé » du harnais : **Michael Mio Nielsen** (Lille) et **Mass Sarr Jr** (Monaco).
  **Un correctif de moteur, exigé par cette saison** : `regarnitVivier` tire un nom procédural
  `PICK(PRENOMS)+" "+PICK(NOMS)` **sans vérifier qu'il n'est pas déjà employé**. Le défaut ne se voyait pas avant,
  parce que la réserve de jokers (ancrée sur 1995, `vieillitJoker` refusant de remonter le temps) suffisait ; en
  partant de 1990 elle ne rend plus rien, cette branche garnit tout le vivier, et le même homme se retrouvait dans
  un effectif ET chez les recrues possibles. Le nom est désormais retiré au sort jusqu'à en trouver un inconnu.
  Neuf effectifs que la source laisse incomplets et que `genJoueur` complète à la marge (Lyon et le PSG n'ont qu'un
  gardien répertorié, Laval que quatre milieux). Validation dédiée : **`harness9091.cjs`**.
  **1991-92 (v1.21)** : `STARS_9192`/`STARS_D2_9192`, `D1_9192`/`D2_9192`, `an:1991`, `saison_id/1991` — la
  deuxième saison ajoutée en remontant le temps, mais la première qui **redescend** le cours du temps depuis une
  saison déjà curée : 90/91 est juste derrière, et c'est ce qui change tout (voir les notes plus bas).
  **Le plateau tombe juste tout seul, pour la première fois depuis 96/97** : la D1 réelle avait ses vingt clubs et
  n'a repêché personne. Elle le doit à trois rétrogradations **administratives** — Bordeaux (10e), Brest (11e) et
  Nice (14e), tous trois coulés par leurs finances — qui sauvent Toulouse (19e) et Rennes (20e) de la descente
  sportive ; Le Havre, Lens et Nîmes montent. **Vérifier ce genre de chose plutôt que de lire un classement** :
  prendre les deux derniers pour des relégués aurait donné un championnat faux de trois clubs.
  La D2 se jouait toujours en **deux groupes de dix-huit** : on reconduit la règle de 90/91, **les dix premiers de
  chaque groupe** (groupe A : Valenciennes, Angers, Le Mans, Louhans-Cuiseaux, Laval, Guingamp, Rouen, Bourges,
  Dunkerque ; groupe B : Bordeaux, Strasbourg, Istres, Bastia, Gazélec Ajaccio, Rodez, Perpignan, Châteauroux,
  Nice, Alès). **Tours, 9e du groupe A, a été écarté** — Transfermarkt ne lui connaît que seize joueurs pour
  dix-huit places, et cinq de ses vingt lignes sont inexploitables (jurisprudence Saint-Seurin) ; **Ancenis, 11e,
  a été sauté à son tour** parce qu'il n'est pas mieux servi (dix-sept), et c'est **Beauvais, 12e**, qui entre.
  Deux clubs neufs seulement dans `CLUBS_EXTRA`, le plateau étant déjà presque entièrement connu du jeu :
  **Bourges** (`BOU`, Jacques-Rimbault, **rouge et bleu**) et le **Gazélec Ajaccio** (`GFC`, **Mezzavia** —
  attention, le stade ne devient Ange-Casanova qu'en 1994 —, rouge et bleu rayé), couleurs vérifiées une à une.
  **`GFC` n'est pas `AJA`** : le Gazélec et l'AC Ajaccio sont deux clubs distincts, comme `VAN` (Valenciennes) et
  `VAL` (Valence) le sont depuis 90/91. Sièges européens réels : **l'OM en C1** (champion), **Monaco en C2**
  (vainqueur de la Coupe de France 1991, contre l'OM en finale), **Auxerre, Cannes et Lyon en C3** — trois places
  UEFA cette année-là contre deux en 90/91, vérifié sur le tableau de la Coupe UEFA 1991-92.
  `HONNEURS` n'a rien eu à apprendre : partir de 91/92 fait tomber **l'Euro 92 dès la première intersaison** et le
  Mondial 94 à la troisième, deux étés déjà écrits par 90/91.
  **LE SENS DU TEMPS EST REDEVENU NORMAL, et c'est la bonne nouvelle de cette saison.** 90/91 est à un an de
  distance : **495 des 758 noms héritent simplement de leur note 90/91 vieillie d'un an** (+2 jusqu'à 21 ans, +1
  jusqu'à 24, −1 de 30 à 32, −2 au-delà), c'est-à-dire par la règle éprouvée et dans le bon sens. Le piège de
  l'inversion documenté en 90/91 ne concerne plus que 86 noms, ancrés sur 95/96 ou plus tard, qui passent par la
  moyenne rajeunie/calculée ; 151 sont entièrement calculés. **Règle neuve, et à garder** : le **potentiel se
  reprend tel quel à l'ancre** au lieu d'être recalculé — sans cela Zidane ressortait à 91 de potentiel en 91/92
  alors que 90/91 lui en donne 95, et Thuram à 84 contre 90. Le potentiel d'un homme ne rétrécit pas d'une saison
  à l'autre. Table d'ajustements à la main de 26 entrées, plus courte qu'en 90/91 parce que l'héritage fait le
  travail : Papin 89 (**Ballon d'or 1991**, vingt-sept buts, meilleur buteur pour la cinquième année), Waddle 86,
  Abedi Pelé 85 (meilleur joueur africain 1991 *et* 1992), Weah et Boli 83, Márcico, Moravčík et Fernandez 82,
  Cantona 81, Valdo et Ricardo Gomes 80 — les deux Brésiliens que le PSG a fait venir de Benfica, que le calcul ne
  pouvait pas connaître.
  **Aucun forçage nécessaire cette année**, une première : le tri aux minutes n'a écarté aucune pépite, parce que
  les dix premiers de chaque groupe offrent des effectifs généreux et que les minimums de poste rattrapent le
  reste. Zidane (19 ans, 3 042 minutes à Cannes), Thuram, Barthez, Desailly, Djorkaeff, Petit, Laigle, Déhu, Goma,
  Grimandi, Pedros, Ouédec, Karembeu, Guivarc'h, Vairelles (18 ans) et Lamouchi passent tous tout seuls, comme
  Lizarazu et Dugarry dans le Bordeaux de Division 2. La liste `FORCES` reste en place, vide, pour la saison où
  il faudra s'en servir.
  **Trois homonymes** réglés à la convention de 99/00 (le plus utilisé garde l'initiale) : **Jean-Michel Ferri**
  (Nantes) écrit en toutes lettres face au **J.-M. Ferri** du Gazélec, qui a joué davantage ; **Zoran Vujovic**
  (Cannes) face à son frère jumeau **Z. Vujovic** (Zlatko, Sochaux). Le troisième cas n'avait aucune issue —
  **deux Olivier Baudry**, prénom ET patronyme identiques, à Sochaux et à Louhans : le plus marginal cède sa
  place à un autre vrai joueur de son club (convention de 97/98).
  **Deux découvertes de relevé.** (1) Transfermarkt sert aussi des **libellés de poste génériques en français**
  (« Défense », « Milieu ») en plus des libellés précis des trois langues : sans eux, trente-cinq joueurs
  perdaient leur poste, Châteauroux tombait à dix hommes et Tours à cinq. La règle de blocage (plus de trois
  clubs sous dix joueurs) n'aurait pas été déclenchée pour autant, et c'est bien le danger : on aurait livré
  deux effectifs fantômes en croyant la source pauvre. **Contrôler les libellés non reconnus avant de conclure
  qu'un club est mal documenté.**
  (2) Les **mononymes brésiliens** (Valdo, Geraldão, Baltazar) ne doivent pas recevoir d'initiale : `nom_jeu`
  les écrit tels quels, comme le jeu le fait déjà pour Bebeto ou Aldair.
  Vingt et un joueurs procéduraux au total, dont **quinze deuxièmes gardiens** : la source mentionne bien la
  doublure de chaque club, mais la marque « pas dans l'effectif cette saison », ce qui l'écarte à juste titre.
  C'est la même marge qu'en 90/91 (Lyon et le PSG à un seul gardien). L'OM n'a que dix-neuf hommes ayant joué et
  Istres dix-sept — la source fait foi, et la D1 n'offre aucun remplaçant possible. Validation dédiée :
  **`harness9192.cjs`**.
  **1992-93 (v1.27)** : `STARS_9293`/`STARS_D2_9293`, `D1_9293`/`D2_9293`, `an:1992`, `saison_id/1992` — la
  saison que l'OM gagne en Europe et perd au bureau : sacré à Munich le 26 mai (une tête de Boli), déclassé du
  championnat le 22 septembre par le Conseil fédéral, et le PSG, deuxième, **refuse le titre** au motif qu'il ne
  l'a pas gagné sur le terrain. Le palmarès de 1993 reste vide, ce que le sous-titre de la saison raconte.
  **Le plateau tombe juste tout seul, comme en 91/92** : la D1 réelle avait ses vingt clubs et n'a repêché
  personne — Bordeaux, Strasbourg et Valenciennes montent, Cannes, Nancy et Rennes descendent.
  La D2 se jouait toujours en **deux groupes de dix-huit** : on reconduit la règle de 90/91, **les dix premiers
  de chaque groupe** (groupe A : Martigues, Cannes, Nice, Nancy, Valence, Sedan, Bastia, Istres, Charleville,
  Alès ; groupe B : Angers, Rennes, Rouen, Red Star, Le Mans, Dunkerque, Bourges, Beauvais, Laval, Niort).
  **Aucun club écarté, et surtout AUCUN CLUB NEUF — une première depuis l'ouverture du chantier** : les quarante
  clubs du plateau étaient déjà au registre, Charleville (`CHV`) et Niort (`NIO`) compris, hérités des saisons
  précédentes. Rien à dessiner, rien à vérifier côté couleurs : la journée a été entièrement consacrée aux hommes.
  Sièges européens réels : **l'OM en C1** (champion en titre, il ira la gagner), **Monaco en C2** — et c'est le
  piège d'époque de cette saison : **la Coupe de France 1992 n'a PAS eu de vainqueur**, la compétition ayant été
  arrêtée après le drame de Furiani, si bien que c'est le **finaliste** qui prend le siège —, **Auxerre, le PSG et
  Caen en C3**, vérifié sur le tableau de la Coupe UEFA 1992-93.
  `HONNEURS` n'a rien eu à apprendre, et **partir de 92/93 est le second cas du jeu où la PREMIÈRE intersaison ne
  porte aucun tournoi** (après 90/91) : l'été 93 est muet, le Mondial 94 tombe à la deuxième.
  **Le sens du temps reste normal, et l'héritage fait presque tout le travail** : 91/92 est à un an de distance,
  **504 des 757 noms reprennent leur note 91/92 vieillie d'un an** par la règle éprouvée, 36 de plus viennent de
  90/91, et il ne reste que 104 noms à passer par la moyenne rajeunie/calculée et 101 à calculer entièrement.
  Table d'ajustements à la main réduite à **douze entrées**, la plus courte du chantier : Klinsmann 85 et Völler 83
  (champions du monde 1990, débarqués l'un sur le Rocher, l'autre au Vélodrome), **Bokšić 83** (vingt-trois buts,
  meilleur buteur du championnat), Márcio Santos 79 (futur champion du monde 1994 avec le Brésil), Martín Vázquez 79,
  Dobrovolskiy 78, Calderón 77, Songo'o et Verlaat 76, Hadji 75. Papin et Waddle ont quitté l'OM à l'été 92 et
  sont donc **absents du jeu** : le relevé le confirme tout seul, c'est un bon contrôle de la méthode.
  **Forçage de six pépites** que le tri aux minutes écartait : **Vincent Candela** (19 ans, 107 minutes à Toulouse,
  champion du monde 1998), Legwinski, Pouget, Lambourde, Charvet et Ipoua.
  **Trois découvertes de relevé, à garder.** (1) **Transfermarkt n'abrège pas les prénoms courts** : la colonne
  « nom court » rend « Eric Roy », « Luc Sonor », « Abedi Pelé » en toutes lettres là où elle rend « F. Barthez ».
  Sans correctif, onze joueurs se retrouvaient traités comme des mononymes brésiliens — et Abedi Pelé perdait son
  ancre, donc sa note de 85. La règle : **un nom court à deux mots ou plus s'abrège comme les autres**, seul un
  vrai mononyme d'un seul mot (Valdo, Valdeir) reste tel quel.
  (2) **L'appariement des ancres doit être insensible aux accents et à la forme des initiales** : « Jean-Michel Ferri »
  (écrit en toutes lettres en 91/92 pour le distinguer du Gazélec) et « J.-M. Ferri » sont le même homme, « É. Di Meco »
  et « Eric Di Meco » aussi. On cherche donc d'abord le nom exact, puis une clé aplatie (sans accents, prénom réduit à
  sa première lettre), **toujours sous le garde-fou de l'âge**, et **on refuse l'appariement approché dès que deux noms
  distincts y répondent** — c'est ce refus qui protège les **jumeaux Vujović**.
  (3) Et justement : **Zlatko ET Zoran Vujović jouaient tous les deux à Nice en 92/93**. Transfermarkt date Zoran de
  1986, ce qui lui ferait six ans au coup d'envoi ; plutôt que d'écarter un titulaire de 1 246 minutes, on corrige sa
  naissance (1958, il est le jumeau de Zlatko, et le jeu le connaît déjà à cet âge depuis 90/91) et on applique la
  convention de 99/00 : le plus utilisé garde l'initiale, l'autre passe en toutes lettres. **Corriger une date que
  deux sources concordantes tranchent n'est pas la deviner** — six autres joueurs, que rien ne permet de dater,
  restent écartés.
  Vingt-trois joueurs procéduraux au total, dont **douze deuxièmes gardiens**, même marge qu'en 91/92. Le PSG n'a que
  dix-neuf hommes ayant joué — la source fait foi. Validation dédiée : **`harness9293.cjs`**.
  **1993-94 (v1.33)** : `STARS_9394`/`STARS_D2_9394`, `D1_9394`/`D2_9394`, `an:1993`, `saison_id/1993` — la
  saison où la sanction tombe pour de bon. L'OM finit deuxième du championnat et descend quand même :
  rétrogradé en D2 le 22 avril 1994 par la Fédération, exclu d'Europe par l'UEFA, il joue là son dernier
  printemps dans l'élite avant le purgatoire que la saison fondatrice 95-96 raconte. Le PSG prend le titre
  avec cinquante-neuf points, Ginola est élu meilleur joueur de l'année et Zidane meilleur espoir.
  **Le plateau tombe juste tout seul pour la troisième fois de suite** : la D1 réelle avait ses vingt clubs
  et n'a repêché personne — Cannes, Martigues et Angers montent, Valenciennes et Nîmes descendent, et
  **Toulon, dix-neuvième, n'est nulle part** : la DNCG l'a rétrogradé directement en National pour dettes,
  ce qui a **sauvé Mulhouse**, repêché en D2 à sa place. Vérifier ce genre de chose plutôt que de lire un
  classement, une fois de plus.
  **La D2 change de forme cette année-là, et c'est la nouveauté de structure de la saison** : finis les
  deux groupes de dix-huit des trois saisons précédentes, elle devient un **groupe unique de vingt-deux
  clubs**, la « Super D2 ». La règle des dix premiers de chaque groupe n'a donc plus d'objet : on prend
  simplement **les vingt premiers du classement réel** et on **écarte les deux derniers**, Bourges (21e) et
  Istres (22e). Aucun club n'a eu à être repêché faute de source.
  **Aucun club neuf, pour la deuxième fois** : les quarante clubs du plateau étaient déjà au registre, et la
  journée est allée entièrement aux hommes.
  Sièges européens réels, et ils racontent l'année à eux seuls : **Monaco en C1** — l'OM, tenant du titre,
  est exclu par l'UEFA, et le PSG, deuxième, **refuse la place** comme il avait refusé le titre de 92/93, si
  bien qu'elle revient au troisième —, **le PSG en C2** (vainqueur de la Coupe de France 1993 contre Nantes),
  **Bordeaux, Auxerre et Nantes en C3**, vérifié sur le tableau de la Coupe UEFA 1993-94.
  `HONNEURS` n'a rien eu à apprendre, mais **partir de 93/94 fait tomber le Mondial 94 dès la PREMIÈRE
  intersaison** — et les Bleus n'y étaient pas, éliminés par la Bulgarie au Parc le 17 novembre 1993, ce que
  la dépêche déjà écrite dit exactement (« La France, elle, regardait à la télévision »). Le harnais vérifie
  nommément qu'elle **ne contient pas « LA FRANCE » en capitales**, que `finDeSaison` lirait comme un triomphe.
  **Le sens du temps reste normal, et l'héritage n'a jamais fait autant de travail** : 92/93 est à un an de
  distance, **559 des 759 noms reprennent leur note 92/93 vieillie d'un an** par la règle éprouvée, 38 de plus
  viennent de 91/92 et 12 de 90/91 ; il ne reste que 93 noms à passer par la moyenne rajeunie/calculée (ancres
  postérieures, de 95/96 à 98/99) et 57 à calculer entièrement. Distribution finale collée à celle de 92/93
  (D1 : moyenne 70,9 et médiane 71, contre 70,8 et 71 ; D2 : 66,4 et 66, contre 66,0 et 66) — c'est le meilleur
  contrôle qu'on ait qu'une saison ne dérive pas.
  Table d'ajustements à la main de **sept entrées**, la plus courte du chantier : **Ginola 84** (meilleur
  joueur de l'année, 4 226 minutes), **Djorkaeff 83**, **Roger Boli 79** et **Ouédec 78** (vingt buts chacun,
  co-meilleurs buteurs), **Desailly 82** (champion d'Europe 93, parti à Milan en janvier pour y gagner la C1 94),
  **Sonny Anderson 81** (seize buts en vingt matchs, arrivé fin novembre) et **Thuram 73** (titulaire à
  vingt et un ans, international dès l'été suivant).
  **Forçage de huit pépites** que le tri aux minutes écartait : **Patrick Vieira** (dix-sept ans, 562 minutes
  à Cannes), **Grégory Coupet** (Saint-Étienne), **Vikash Dhorasoo** (Le Havre), **Laurent Batlles** (Toulouse),
  **Olivier Tébily** (Niort), **Taribo West** (Auxerre), **David Sommeil** (Caen) et **Vincent Hognon** (Nancy).
  Méthode pour les trouver, à reprendre telle quelle : **comparer les écartés aux ancres des saisons
  POSTÉRIEURES du jeu** — un homme que 95/96 ou 97/98 connaît déjà et que 93/94 laisse dehors est une pépite
  par construction. Zidane, Makélélé, Thuram, Pirès, Micoud et Wiltord passent tous tout seuls au temps de jeu.
  **Quatre points de relevé à garder.** (1) Transfermarkt a servi les quarante clubs **en français**, sans le
  panachage de langues de 90/91 ; un seul libellé de poste neuf (« Deuxième attaquant »). L'anti-robot AWS
  reste là : vingt-deux pages sur quatre-vingts ont dû passer par `.com`, `.de` ou `.co.uk`, zéro échec au bout
  du compte. (2) **Bokšić est parti à la Lazio fin novembre** mais a disputé douze matchs sous le maillot de
  l'OM : la source le crédite de 1 078 minutes marseillaises et il reste au plateau, noté à sa valeur (84) et
  non à son temps de jeu — jurisprudence Stojković. (3) **Trois joueurs que la source ne sait pas dater sont
  écartés** plutôt que devinés (Saouchi et Grail à Valence, Belvalette à Valenciennes) : vingt-trois, quarante-cinq
  et quatre-vingt-cinq minutes, aucune conséquence. (4) **Quatre mononymes** chez TM — Valdo et Raí au PSG,
  **Futre** à l'OM (le hauptlink ne dit pas « Paulo Futre ») et **Oliveira** à Lens — restent tels quels, comme
  Bebeto ou Aldair. Un seul homonyme à régler, **deux Martins sans lien** : Afonso (Nancy, 2 009 minutes) garde
  l'initiale, Anthony (Nantes, 121 minutes) passe en toutes lettres.
  **La borne d'âge du harnais monte à 39** : **Joseph-Antoine Bell tient les buts de Saint-Étienne à
  trente-neuf ans** (2 460 minutes) et Ettori ceux de Monaco à trente-huit (4 530 minutes, le plus utilisé du
  championnat). Tous deux raccrochent à la première intersaison, comme l'histoire.
  Le Red Star n'a que dix-sept hommes ayant joué et Valence que deux attaquants — la source fait foi, `genJoueur`
  complète à la marge. Validation dédiée : **`harness9394.cjs`**.
  **1994-95 (v1.50)** : `STARS_9495`/`STARS_D2_9495`, `D1_9495`/`D2_9495`, `an:1994`, `saison_id/1994` — la
  saison où le football français se range enfin par le jeu plutôt que par le bureau. Le **FC Nantes de
  Suaudeau ne perd qu'un seul match en trente-huit journées**, un record que personne n'a égalé depuis ;
  Loko plante vingt-deux buts et finit meilleur buteur, Karembeu, Makélélé et Pedros font le jeu à la
  nantaise. Le PSG de Weah et Ginola prend la Coupe de France et va en demi-finale de Ligue des champions.
  Et la **victoire vaut trois points pour la première fois** — un changement de règle qui ne touche pas le
  moteur, qui compte déjà ainsi, mais qui appartient au récit de l'année. Le nom de la saison, **« Une
  seule défaite »**, dit tout cela d'un trait.
  **Le plateau tombe juste tout seul pour la quatrième fois de suite** : la D1 réelle avait ses vingt
  clubs et n'a repêché personne — Nice, Rennes et Bastia montent, Toulouse et Angers descendent, et
  **l'OM purge en D2 la rétrogradation prononcée en avril 94**.
  La D2 reste le **groupe unique de vingt-deux clubs** inauguré en 93/94 : on reprend la règle, **les
  vingt premiers du classement réel**, et on écarte **Sedan (21e) et Nîmes (22e)**. Aucun club n'a eu à
  être repêché faute de source.
  **Aucun club neuf, pour la troisième fois** : les quarante étaient déjà au registre, et la journée est
  allée entièrement aux hommes.
  Sièges européens réels, vérifiés sur les tableaux de 1994-95 : **le PSG en C1** (champion 93/94, il ira
  en demi-finale), **Auxerre en C2** (vainqueur de la Coupe de France 1994 contre Montpellier, 3-0), et
  en C3 **Bordeaux, Nantes, Cannes — et l'OM, qui joue la Coupe UEFA DEPUIS LA DEUXIÈME DIVISION** au
  titre de sa deuxième place de 93/94 : il sort l'Olympiakos avant de tomber à Sion. C'est le second cas
  du jeu après Nice en C2 depuis la D2 en 97/98, et il faut le vérifier plutôt que de le supposer — la
  tentation était de croire qu'un club rétrogradé perdait sa place, ce qui était vrai en 93/94 (exclusion
  UEFA) et faux ici.
  `HONNEURS` n'a rien eu à apprendre, mais **partir de 94/95 est le troisième cas du jeu où la PREMIÈRE
  intersaison ne porte aucun tournoi** (après 90/91 et 92/93) : l'été 95 est muet, l'Euro 96 tombe à la
  deuxième.
  **Le sens du temps reste normal, et l'héritage fait presque tout** : 93/94 est à un an de distance,
  **536 des 759 noms reprennent leur note 93/94 vieillie d'un an**, 68 de plus viennent de 92/93, 91/92 et
  90/91 ; il ne reste que 96 noms à passer par la moyenne rajeunie/calculée (ancres postérieures, de 95/96
  à 99/00) et 49 à calculer entièrement. **Règle neuve, et à garder : quand un homme est ancré des DEUX
  côtés à égale distance** — 93/94 derrière, 95/96 devant —, **on prend toujours l'ancre du passé**. Sans
  cela, 403 noms passaient par la moyenne rajeunie au lieu de la règle éprouvée, et la distribution
  dérivait. Résultat final collé à celle de 93/94 (D1 : moyenne 70,8 et médiane 71, contre 70,9 et 71 ;
  D2 : 66,8 et 67, contre 66,4 et 66).
  Table d'ajustements à la main de **dix entrées** : **Weah 86** (Ballon d'or 1995, meilleur buteur de la
  Ligue des champions), **Guérin 82** (élu meilleur joueur du championnat 1994-95), **Lama 82** (gardien
  n°1 des Bleus), **Loko 81** et **Pedros 77** (les deux Nantais du titre), **Karembeu 72**, **Zidane 82**
  (première sélection le 17 août 1994, deux buts en vingt minutes contre la Tchéquie), **Thuram 79**,
  **Maurice 74** et **Cascarino 82** — trente et un buts en D2, meilleur buteur de France toutes divisions
  confondues, et le jeu le connaissait déjà à 83 l'année suivante.
  **Forçage de dix pépites** que le tri aux minutes écartait, trouvées par la méthode de 93/94 (comparer
  les écartés aux ancres des saisons postérieures) : **Ludovic Giuly** (18 ans, 208 minutes à Lyon),
  **Didier Domi** — **seize ans, UNE minute**, entré le 24 janvier 1995 contre Lyon, c'est le plus jeune
  vrai joueur du jeu et la borne basse du harnais —, Ducrocq, **François Grenet**, **Matthieu
  Louis-Jean**, **Philippe Delaye**, **David Jemmali**, **Olivier Echouafni**, **Ulrich Ramé** (900
  minutes à Angers) et **Vincent Hognon**, déjà forcé en 93/94. Zidane, Makélélé, Thuram, Vieira,
  Dhorasoo, Candela, Marlet et **Thierry Henry** (17 ans, 279 minutes sur le Rocher) passent tous tout
  seuls au temps de jeu.
  **Trois points de relevé à garder.** (1) Transfermarkt a servi les quarante clubs **en français**,
  tous les libellés de poste reconnus, **un seul joueur non daté** (Descamps, Dunkerque, 253 minutes) et
  aucun club sous dix hommes documentés — la source est la plus généreuse du chantier, Dunkerque et ses
  dix-sept hommes exceptés. L'anti-robot AWS reste là : six pages sur quatre-vingts ont dû passer par
  `.com`, `.de` ou `.co.uk`. **Et le piège du jour n'était pas chez Transfermarkt mais dans le script
  d'aspiration : une liste d'arguments `curl` à laquelle on avait oublié d'ajouter l'URL renvoie un
  échec muet qu'on prend pour un blocage.** Vérifier qu'une requête isolée passe avant de conclure que
  la source ferme. (2) Un seul homonyme à régler, **deux Cissé sans lien** : Aboubacar (Niort, 1 420
  minutes) garde l'initiale, qui est celle que le jeu suit depuis 90/91 ; **Aliou Cissé**, 18 ans à
  Lille, passe en toutes lettres. (3) Le relevé a démasqué **trois prénoms faux dans `PRENOMS_VRAIS`**,
  corrigés sur pièces : « R. Gomes » est **Ricardo** et non Raymundo (le Brésilien du PSG, parti à
  Benfica en 1995), « C. Garcia » est **Clément** et non Carlos (né en 1968, Grenoble-Montpellier-Caen-
  Lille-Gueugnon), « A. Ferreira » est **Armindo** et non Abel (né à Niort en 1976, Niort puis
  Châteauroux, ce que la chaîne du jeu confirme).
  Quinze joueurs procéduraux au total, dont **huit deuxièmes gardiens** : c'est la plus petite marge du
  chantier. Le Mans n'a que trois défenseurs répertoriés et Gueugnon deux attaquants — la source fait
  foi, `genJoueur` complète. Validation dédiée : **`harness9495.cjs`**.
  **DEUX HARNAIS QUI ROUGISSENT PAR HASARD, découverts au passage et laissés tels quels.** Aucun des deux
  n'est une régression, et les deux sont **prouvés** : en forçant le même flux d'aléa (`Math.random`
  remplacé par un générateur à graine fixe) des deux côtés, ils rendent **exactement le même résultat
  avant et après l'ajout de 94/95**.
  (1) **`harness-formations.cjs`** borne son calibrage à [2,2 ; 2,6] but par match sur **760 matchs
  seulement** et déborde environ une fois sur douze (2,722 des deux côtés avec la même graine).
  (2) **`harness-hdm.cjs`** vérifie que « le buteur et le gardien de l'équipe type sont nommés » en
  cherchant leur **nom court** dans la page — or depuis la v1.48 l'almanach écrit le **prénom** de son
  meilleur buteur (« celui que les tribunes ont fini par appeler par son prénom »). L'assertion ne tient
  donc que lorsque ce buteur est, par chance, aussi à l'équipe type, dont les listes serrées gardent
  l'initiale : elle échoue environ deux fois sur cinq, avant comme après. **C'est l'assertion qui a
  vieilli, pas le jeu** — la corriger est un travail de moteur, pas de saison, et on ne le fait pas un
  jour de livraison de données.
  On ne touche à ni l'une ni l'autre : assouplir un harnais pour le faire passer est précisément le geste
  interdit. Mais qui verra ces deux rouges un jour doit savoir d'où ils viennent.
  **2000-01 (v1.51)** : `STARS_0001`/`STARS_D2_0001`, `D1_0001`/`D2_0001`, `an:2000`, `saison_id/2000` —
  sous le nom **« Le jeu à la nantaise »**, et c'est la **saison la plus RÉCENTE du jeu**, la première
  qu'on ajoute après la base au lieu d'avant. Le FC Nantes de Denoueix prend son huitième titre avec
  soixante-huit points ; **Éric Carrière est élu meilleur joueur ET meilleur passeur** du championnat,
  Mickaël Landreau garde les buts à vingt et un ans et joue 4 590 minutes, le plus utilisé de la division.
  Sonny Anderson plante vingt-deux buts pour Lyon et finit meilleur buteur, Nicolas Anelka rentre du Real
  Madrid en janvier, et **José Luis Chilavert**, deux fois meilleur gardien du monde, débarque à
  Strasbourg. Toute la seconde moitié de la saison est empoisonnée par **l'affaire des faux passeports**,
  qui emporte Saint-Étienne.
  **La D1 réelle n'avait que dix-huit clubs**, comme en 97/98, 98/99 et 99/00, et la D2 exactement vingt :
  même configuration qu'en 98/99, donc le même **double repêchage dans les deux sens**. **Nancy (42 pts) et
  Le Havre (34)**, meilleurs relégués de D1 99/00, montent en D1 — **Montpellier, dix-huitième avec 31
  points, reste en D2**, où il finira troisième et remontera pour de bon. La D2 retombant à dix-huit,
  **Amiens (37 pts) et Valence (33)**, meilleurs relégués de D2 99/00, y sont repêchés à leur tour ;
  **Louhans-Cuiseaux, vingtième avec 24 points, reste dehors**. Les deux repêchés de D2 jouaient le
  National en 2000-01 mais Transfermarkt les documente (18 et 19 joueurs), comme Red Star et Beauvais
  en 99/00 et contrairement au cas Toulon de 98/99.
  **Aucun club neuf, pour la quatrième fois** : les quarante clubs du plateau étaient déjà au registre,
  Martigues et Angers compris, et la journée est allée entièrement aux hommes.
  **Sièges européens, et c'est là que la saison change d'époque : la Coupe des Coupes n'existe plus.**
  `euroC2` est **vide pour la première fois du jeu** (`nouvellePartie` lit `(S.euroC2||[]).includes(...)`,
  donc un tableau vide ne demande aucun mécanisme neuf). **Monaco (champion) et le PSG (2e) en phase de
  groupes de Ligue des champions, Lyon (3e) au tour préliminaire** ; en Coupe UEFA **Bordeaux (4e), Nantes
  (vainqueur de la Coupe de France 2000) — et GUEUGNON, vainqueur de la Coupe de la Ligue 2000, QUI JOUAIT
  LA DEUXIÈME DIVISION**. C'est le **troisième cas du jeu** après Nice en C2 depuis la D2 en 97/98 et l'OM
  en C3 depuis la D2 en 94/95, vérifié sur le tableau de la Coupe UEFA 2000-01 : Gueugnon y tombe au
  premier tour contre l'Iraklis Thessalonique.
  `HONNEURS` n'a rien eu à apprendre — il connaît 1992 → 2006 — mais **partir de 00/01 est le quatrième cas
  du jeu où la PREMIÈRE intersaison ne porte aucun tournoi** (après 90/91, 92/93 et 94/95) : l'été 2001 est
  muet, le Mondial 2002 tombe à la deuxième intersaison et l'Euro 2004 à la quatrième.
  **Le sens du temps est normal, et l'héritage n'a jamais été aussi propre** : 99/00 est à un an de
  distance et **528 des 760 noms reprennent leur note 99/00 vieillie d'un an**, 70 de plus viennent de
  98/99 et plus loin, et **162 seulement sont calculés**. Surtout, **c'est la première saison où TOUTES les
  ancres sont derrière** : il n'y a plus de saison postérieure, donc plus de moyenne rajeunie, plus de piège
  d'inversion, et la règle éprouvée s'applique seule. Distribution collée à celle de 99/00 au dixième près
  (D1 : moyenne 70,5 et médiane 70, contre 70,5 et 70 ; D2 : 66,5 et 67, contre 66,5 et 67) — le meilleur
  contrôle qu'on ait qu'une saison ne dérive pas.
  **Conséquence à garder pour 01/02 : la méthode de 93/94 pour trouver les pépites ne marche plus.**
  Comparer les écartés aux ancres des saisons POSTÉRIEURES n'a plus d'objet quand on est la dernière saison.
  La parade retenue, et elle est meilleure que la mémoire : **lister les écartés que le jeu connaît DÉJÀ**
  (ancre passée, âge concordant) — c'est ainsi qu'on a retrouvé **Didier Drogba, vingt-deux ans, 419 minutes
  au Mans, que le jeu note 59 de note et 90 de potentiel depuis 98/99** et que le tri aux minutes jetait.
  **Forçage de dix pépites** : **Drogba**, **John Arne Riise** et **Éric Abidal** (Monaco), **Patrice Evra**
  (19 ans, 205 minutes à Nice), **Mikel Arteta** (18 ans) et **Didier Domi** (PSG), **Teemu Tainio**
  (Auxerre), **Mamadou Niang** (254 minutes à Troyes), **Abdoulaye Méïté** (OM) et **Benoît Cheyrou**
  (Lille). Mexès (18 ans, 3 495 minutes), Djibril Cissé, Boumsong, Kapo, Landreau, Malbranque, Govou,
  Armand, Bodmer, M'Bami, **Michael Essien** (18 ans à Bastia) et **Seydou Keita** (20 ans, 3 534 minutes
  à Lorient) passent tous tout seuls au temps de jeu. **Le prix du forçage, assumé** : deux forcés dans un
  même club coûtent deux vrais joueurs, et à Monaco ce sont **Christian Panucci et Pablo Contreras**, deux
  internationaux, qui sortent pour Riise et Abidal. On le préfère à perdre les deux carrières qui suivent.
  Table d'ajustements à la main de **vingt-deux notes et dix-neuf potentiels** : **Sonny Anderson 84**
  (meilleur buteur), **Éric Carrière 82** (meilleur joueur et meilleur passeur — l'héritage seul le laissait
  à 71), **Chilavert 82**, **Landreau 80**, **Anelka 80**, **Laurent Robert 78** (vendu à Newcastle),
  **Pauleta 78** (deuxième buteur), **Edmílson 79**, **Wilmots 78**, **Moldovan 77**, **Smertin 76**,
  **Fadiga 75**, **Mondragón 75**, **Rothen 75**, **Bejbl 74**, **Francileudo Santos 74** (meilleur buteur
  de D2, vingt et un buts), **Keita 72**, **Fuertes 72**, **Djibril Cissé 68**, **Essien 66** — et les
  potentiels des gamins que le calcul ne pouvait pas connaître (Essien et Drogba 90, Cissé 90, Keita 88,
  Evra et Abidal 86, Arteta 85, Niang 84).
  **Un défaut de méthode corrigé, à ne pas rouvrir** : remplir les **minimums de poste AVANT** de remplir au
  temps de jeu écarte des titulaires — un remplaçant de complément passait devant un homme à 1 500 minutes.
  Le bon ordre est **d'abord le temps de jeu, puis la réparation des minimums**, en ne sacrifiant que le
  **moins utilisé d'un poste excédentaire**. Ce qui reste, et qu'il faut assumer, c'est le compromis quand la
  source est pauvre à un poste : Wasquehal n'a que trois attaquants dans ses dix-huit premiers au temps de
  jeu, si bien qu'**Oumar Bakari (1 583 minutes, milieu) sort quand même** pour faire entrer un quatrième
  attaquant réel à 647 minutes. On le préfère à laisser `genJoueur` inventer cet attaquant — **aucun joueur
  inventé sur une saison réelle** passe avant le classement aux minutes.
  **Une règle neuve sur les homonymes, et elle prime sur celle de 99/00** : quand deux hommes portent le même
  nom court, **celui qui le portait DÉJÀ dans le jeu le garde** (appariement exact à une ancre), l'autre passe
  en toutes lettres — la convention « le plus utilisé garde l'initiale » ne tranche qu'à défaut. Sans cela
  **« F. Lemasson » changeait d'homme** d'une saison à l'autre (François, le gardien né en 1963, contre
  Frédéric, le défenseur né en 1974, qui a joué deux fois plus en 2000-01) et il aurait fallu **vider son
  prénom**. Quatre cas cette année : les frères **Bruno et Benoît Cheyrou**, tous deux à Lille ; les deux
  **Lemasson** ; **Laurent et Ludovic Leroy** ; et de nouveau **TROIS N'Diaye** — Sylvain (Lille) garde
  l'initiale qu'il portait en 99/00, Samba (Niort) et Sada (Gueugnon) passent en toutes lettres.
  **Un prénom faux corrigé sur pièces** dans `PRENOMS_VRAIS` : « M. dos Santos » est **Manuel** et non
  Márcio — Manuel dos Santos Fernandes, né le 28 mars 1974, Montpellier de 1997 à 2000 puis l'OM jusqu'en
  2004, confondu avec le Brésilien Márcio Santos que le jeu écrit « M. Santos ». En revanche « J.-L. Montero »
  reste **Juan-Luis** : Transfermarkt et les sources françaises écrivent Jean-Louis, Wikidata écrit Juan-Luis,
  et **on ne remplace pas une graphie discutable par une autre**. 152 entrées neuves, dont aucune vide.
  **Trois points de relevé à garder.** (1) Transfermarkt a servi les quarante clubs **sans un seul trou** :
  tous les postes reconnus, **aucun joueur non daté**, et aucun club sous dix hommes documentés — c'est la
  source la plus généreuse du chantier, Amiens (18 hommes) et Valence (19) exceptés, et tous deux jouaient
  le National. L'anti-robot AWS reste là : **42 pages sur 80** ont dû passer par `.com`, `.de` ou `.co.uk`,
  zéro échec au bout du compte. (2) Les identifiants de club se prennent en deux requêtes sur les **pages de
  compétition** (`…/startseite/wettbewerb/FR1/plus/?saison_id=2000` et `FR2`), ce qui évite de chercher
  quarante clubs un par un ; les deux repêchés du National se prennent sur la page **FR2 de 1999**.
  (3) **« Aït » est une particule de patronyme** et doit être blanchie dans le contrôle « prénom composé
  avalé » (Ahmed Aït Ouarab, Martigues), comme « Mio » et « Sarr » l'ont été en 90/91.
  Dix joueurs procéduraux au total, dont **six deuxièmes gardiens** : c'est la plus petite marge du chantier
  avec 94/95. Lorient n'a qu'un gardien et quatre défenseurs répertoriés, Auxerre, Châteauroux et Valence
  trois attaquants — la source fait foi, `genJoueur` complète. Validation dédiée : **`harness0001.cjs`**.
  **2001-02 (v1.52)** : `STARS_0102`/`STARS_D2_0102`, `D1_0102`/`D2_0102`, `an:2001`, `saison_id/2001` —
  sous le nom **« Le premier des sept »**, et c'est désormais la saison la plus RÉCENTE du jeu. Le
  **dernier championnat qui s'appelle Division 1** (elle devient la Ligue 1 l'année suivante, la D2 la
  Ligue 2) se décide **le 4 mai 2002 à Gerland** : Lyon reçoit Lens, son dauphin d'un point, et gagne
  3-1 — Govou à la 8e, un second but à la 14e, Laigle à la 53e, Bąk réduisant pour Lens contre le club
  qui l'avait vendu en décembre. **Jamais le titre ne s'était joué sur un duel direct entre les deux
  premiers**, et c'est le premier des **sept titres consécutifs** que Lyon va enchaîner : le nom de la
  saison dit exactement cela. Juninho débarque du Brésil, **Ronaldinho a vingt et un ans au Parc des
  Princes**, Pauleta est élu meilleur joueur et partage le titre de meilleur buteur avec **Djibril Cissé,
  vingt ans, vingt-deux buts chacun**.
  **La D1 réelle n'avait que dix-huit clubs**, comme de 97/98 à 00/01, mais **la D2 en avait vingt tout
  juste** : le compte ne tombe donc pas comme en 00/01, et le repêchage est **asymétrique, une
  configuration neuve**. Les deux meilleurs relégués de D1 00/01 montent — **Toulouse (37 pts) et
  Saint-Étienne (34)** —, et comme **Toulouse jouait le National** (rétrogradé par la DNCG) il ne coûte
  rien à la D2, qui ne perd que Saint-Étienne et retombe à **dix-neuf**. Un seul repêché suffit donc :
  **Cannes (19e de D2 00/01, 34 pts)**, devant **Angers (20e, 33 pts)**. **Strasbourg, dix-huitième de D1
  avec 29 points, n'est PAS repêché** — et c'est heureux, puisque c'est de la D2 qu'il jouera l'Europe.
  **Un seul club neuf dans `CLUBS_EXTRA` : Grenoble** (`GRE`, **Lesdiguières** — le stade des Alpes
  n'ouvre qu'en 2008 —, **bleu et blanc**, couleurs vérifiées sur sa fiche Wikipédia, jurisprudence
  Créteil), monté du National, avec blason et malédiction.
  **Sièges européens, et ils racontent l'année** : **Nantes (champion) et Lyon (2e) en Ligue des
  champions, Lille (3e) par le tour préliminaire** ; en Coupe UEFA **Bordeaux (4e), Sedan (5e), le PSG et
  Troyes — les deux vainqueurs de l'Intertoto 2001 — et STRASBOURG, vainqueur de la Coupe de France 2001,
  QUI JOUAIT LA DEUXIÈME DIVISION**. C'est le **quatrième cas du jeu** après Nice en C2 depuis la D2 en
  97/98, l'OM en C3 depuis la D2 en 94/95 et Gueugnon en 00/01. `euroC2` est vide pour la deuxième fois :
  la Coupe des Coupes n'existe plus depuis 1999.
  `HONNEURS` n'a rien eu à apprendre — il connaît 1992 → 2006 —, mais **partir de 01/02 est le premier cas
  depuis 99/00 où la PREMIÈRE intersaison porte un grand tournoi** : le **Mondial 2002** tombe tout de
  suite (le Brésil de Ronaldo sacré, la France sortie au premier tour), l'Euro 2004 à la troisième, le
  Mondial 2006 à la cinquième. Rien à voir avec 90/91, 92/93, 94/95 et 00/01, dont le premier été est muet.
  **L'héritage fait presque tout, et toutes les ancres sont derrière** : **500 des 760 noms reprennent leur
  note 00/01 vieillie d'un an**, 82 de plus viennent de 99/00 et plus loin, **178 seulement sont calculés**,
  et il n'y a plus ni moyenne rajeunie ni piège d'inversion. Distribution collée à celle de 00/01 (D1 :
  moyenne 70,1 et médiane 70, contre 70,5 et 70 ; D2 : 65,9 et 66,5, contre 66,5 et 67).
  Table d'ajustements à la main de **trente-huit entrées** : **Pauleta 84** (meilleur joueur, vingt-deux
  buts — l'héritage seul le laissait à 78), **Juninho 82** et **Ronaldinho 81/96** (deux arrivées que le
  calcul ne pouvait pas connaître), **Coupet 82**, **Djibril Cissé 78/90**, **Pochettino 79**, **Bierhoff
  78** (champion d'Europe 1996, débarqué de Milan sur le Rocher), **Heinze 76** (4 307 minutes, le plus
  utilisé du PSG), **Jugović 76**, **Van Buyten 76**, **Alfonso 76**, **Mexès 76/88**, puis les potentiels
  des gamins (**Essien et Adebayor 90**, **Mexès 88**, **Evra, Malouda, Boumsong et Abidal 86**,
  **Sinama-Pongolle 86**, **Arteta, Le Tallec et Toulalan 85**, **Kapo, Govou, Givet, Pedretti et Yobo
  84**, **Djemba-Djemba, Plašil, Didot, Diakhaté, Emaná et Eduardo Costa 82**).
  **Forçage de onze pépites**, par la parade de 00/01 (lister les écartés que le jeu connaît déjà, puisque
  comparer aux saisons postérieures n'a plus d'objet) : **Éric Abidal**, **Jaroslav Plašil** et **Ludovic
  Giuly** (Monaco), **Florent Sinama-Pongolle** (dix-sept ans au Havre), **Jérémy Toulalan** (dix-huit ans,
  97 minutes à Nantes), **Matt Moussilou** (Lille, vingt-quatre minutes), **Franck Béria** (Metz),
  **Anthar Yahia** et **Chaouki Ben Saada** (Bastia), **Étienne Didot** (Rennes) et **Pape Diakhaté**
  (Nancy). Ronaldinho, Juninho, Mexès, Djibril Cissé, Kapo, Boumsong, Arteta, Govou, Essien, Adebayor,
  Evra, Le Tallec, Keita, Pedretti, Frau, Malouda et Djemba-Djemba passent tous tout seuls au temps de jeu.
  **Le prix du forçage, assumé et plus lourd qu'en 00/01** : Monaco paie trois hommes, dont **Giuly, 958
  minutes** — et il est là le cas instructif, parce qu'il ne vient pas du tri aux minutes mais de la
  **réparation des postes**. Monaco n'avait que trois attaquants dans ses vingt premiers, et la règle « on
  ne sacrifie que le moins utilisé d'un poste excédentaire » désignait Giuly, milieu le moins utilisé, pour
  faire entrer un quatrième attaquant à 377 minutes. **À retenir : la réparation des postes peut coûter un
  international là où le tri aux minutes ne l'aurait jamais touché — contrôler ce qu'elle éjecte, et forcer
  au besoin.**
  **Quatre points de relevé, dont deux pièges neufs.**
  (1) **LE PIÈGE DU JOUR, ET IL COÛTAIT UN JOUEUR PAR CLUB** : découper le tableau d'effectif avec une
  expression dont la sentinelle de fin est `\Z` **perd systématiquement la DERNIÈRE ligne**, parce qu'après
  le dernier `</tr>` vient `</tbody>`, qui n'est pas de l'espace. Le défaut est invisible quarante fois sur
  quarante — la dernière ligne est d'ordinaire un remplaçant à zéro minute — et il a coûté **Pauleta,
  meilleur joueur du championnat, et Adebayor**, qui ressortaient sans poste ni date de naissance. Le
  symptôme à reconnaître : **exactement un joueur par club sans poste ET sans date**. Découper franchement
  sur les balises d'ouverture de ligne, jamais sur une sentinelle de fin.
  (2) **LES IDENTIFIANTS TRANSFERMARKT NE SE DEVINENT PAS.** Les tables d'homonymes et d'écartés sont
  indexées par identifiant TM, et six identifiants posés de mémoire ont **rebaptisé six joueurs au hasard**
  — un défenseur de Nîmes est devenu « Abdoulaye Cissé », et le mauvais Frédéric Mendy a été écarté.
  Le harnais ne l'aurait pas vu : les noms restaient uniques et bien formés. **Relever chaque identifiant
  sur la page avant de l'écrire.**
  (3) **TM n'abrège pas les surnoms brésiliens à deux mots** : la colonne « nom court » rend « Juninho
  Pernambucano » en entier, et la règle de 92/93 (« un nom court à deux mots s'abrège comme les autres »)
  en faisait **« J. Pernambucano »**. Juninho est un surnom, pas un prénom : le jeu l'écrit en mononyme,
  comme Raí, Bebeto ou Ronaldinho. Et TM écrit **« Eric Djemba Djemba » sans trait d'union**, là où le
  patronyme est bien composé — on lui rend le sien, ce qui le sort du contrôle « prénom composé avalé ».
  (4) **Le panachage de langues de 90/91 est de retour** : sur les quatre-vingts pages, vingt-sept sont
  arrivées en anglais et onze en allemand, d'où les trois tables de postes ; aucun libellé inconnu, **aucun
  club sous dix-neuf hommes documentés**, et **un seul joueur que la source ne sait pas dater** (Cédric
  Stoll, Strasbourg, 215 minutes), écarté plutôt que deviné. L'anti-robot AWS reste là, contourné sur
  `.com`, `.de` ou `.co.uk`.
  **Six homonymes, tous tranchés par la règle de 00/01** (celui qui portait DÉJÀ le nom court le garde) :
  **Pape Malick Diop** (Lorient, 1974) garde « P. Diop » et **Papa Bouba Diop** passe en toutes lettres ;
  **Laurent Leroy** garde « L. Leroy » face à **Ludovic** ; **Sylvain N'Diaye** face à **Samba** ;
  **Bruno Cheyrou** face à son frère **Benoît**, tous deux à Lille de nouveau ; **Aliou Cissé** face à
  **Abdoulaye** ; **David Coulibaly** (Châteauroux) face à **Dramane** (Laval). Le septième cas n'avait
  aucune issue — **deux Frédéric Mendy**, prénom ET patronyme identiques, à Bastia (né en 1973) et à
  Saint-Étienne (né en 1981), tous deux titulaires à plus de 2 200 minutes : le jeu porte « F. Mendy »
  depuis 93/94 et c'est le Bastiais, donc **le Stéphanois cède sa place à un autre vrai joueur de son
  club** (jurisprudence Olivier Baudry, 91/92).
  **Cannes est le cas Toulon 98/99 revisité, et il valait la vérification** : la source lui connaît
  dix-neuf hommes, ce qui passe la règle des dix, **mais aucun au-delà de 270 minutes** — Transfermarkt ne
  documente que trois matchs de sa saison de National. On l'a gardé quand même, après avoir relevé
  **Angers, le repêché suivant, qui est bien pire : treize hommes et un seul match**. Dix-neuf hommes pour
  dix-huit places, c'est exactement la marge d'Amiens et de Valence en 00/01. **Compter les hommes ne suffit
  pas : regarder aussi les minutes.**
  Neuf joueurs procéduraux au total, une marge du même ordre qu'en 00/01 : quatre clubs n'ont qu'un gardien
  répertorié (Lyon, Lens, Le Havre, Cannes) et trois n'ont que trois attaquants (Sochaux, Lorient) — Cannes
  n'en a même qu'un, et pèse quatre des neuf à lui seul. La source fait foi, `genJoueur` complète. Validation dédiée : **`harness0102.cjs`**.
  **2002-03 (v1.56)** : `STARS_0203`/`STARS_D2_0203`, `D1_0203`/`D2_0203`, `an:2002`, `saison_id/2002` —
  sous le nom **« Bienvenue en Ligue 1 »**, et c'est désormais la saison la plus RÉCENTE du jeu. Le
  championnat **change de nom et de taille le même été** : la Division 1 devient la **Ligue 1** et passe
  de dix-huit à **vingt clubs**, la D2 devient la Ligue 2. Lyon garde son titre d'un point sur Monaco
  (68 contre 67) et le décroche le 20 mai 2003 par un 1-1 à Montpellier — c'est **le deuxième des sept**.
  Shabani Nonda plante vingt-six buts sur le Rocher et finit meilleur buteur, **Pauleta est élu meilleur
  joueur pour la deuxième année de suite**, Jérôme Rothen meilleur passeur avec dix-huit offrandes. Et à
  Guingamp, un attaquant de vingt-quatre ans en met dix-sept et emmène le club à une **septième place
  inédite** : **Didier Drogba** se fait un nom, servi par Florent Malouda — il part pour l'OM l'été
  suivant. **Petr Čech** garde les buts de Rennes à vingt ans.
  **LE PLATEAU TOMBE JUSTE TOUT SEUL, ET C'EST UNE PREMIÈRE DU CHANTIER FRANÇAIS** : la Ligue 1 réelle
  a ses vingt clubs et la Ligue 2 les siens, donc **aucun repêchage, aucun écarté, ni d'un côté ni de
  l'autre** — les deux listes du jeu sont exactement les deux listes réelles, ce qu'on vérifie désormais
  par **égalité** et non par inclusion (`harness0203.cjs`, section 1). L'expansion se lit dans les
  mouvements : **Ajaccio, Strasbourg, Nice et Le Havre montent** (quatre promus au lieu de deux),
  **Metz et Lorient seuls descendent**. Un seul club neuf dans `CLUBS_EXTRA` : **Clermont**
  (`CLE`, **Gabriel-Montpied**, **rouge et bleu**, couleurs vérifiées sur sa fiche Wikipédia,
  jurisprudence Créteil), avec blason et malédiction.
  **Sièges européens, et le sel est encore en deuxième division** : **Lyon (champion) et Lens (2e) en
  phase de groupes de Ligue des champions, Auxerre (3e) au troisième tour de qualification** ; en Coupe
  UEFA **le PSG (4e), Bordeaux (vainqueur de la Coupe de la Ligue 2002) — et LORIENT, vainqueur de la
  COUPE DE FRANCE 2002, QUI JOUAIT LA DEUXIÈME DIVISION**, éliminé au premier tour par Denizlispor.
  C'est le **cinquième cas du jeu** après Nice en C2 depuis la D2 en 97/98, l'OM en C3 depuis la D2 en
  94/95, Gueugnon en 00/01 et Strasbourg en 01/02. `euroC2` est vide pour la troisième fois. **Vérifié
  plutôt que supposé** : Lille, Troyes et Sochaux n'ont PAS de siège au titre de l'Intertoto, parce
  qu'**aucun club français n'a gagné l'Intertoto 2002** (Fulham, Málaga et Stuttgart).
  `HONNEURS` n'a rien eu à apprendre — il connaît 1992 → 2006 — et **partir de 02/03 est le cinquième cas
  du jeu où la PREMIÈRE intersaison est muette** (après 90/91, 92/93, 94/95 et 00/01) : l'été 2003 ne
  porte aucun tournoi, l'**Euro 2004 tombe à la deuxième** intersaison et le Mondial 2006 à la quatrième.
  **L'héritage fait presque tout, et toutes les ancres sont derrière** : **584 des 760 noms reprennent
  leur note 01/02 vieillie d'un an**, **176 seulement sont calculés**, et il n'y a ni moyenne rajeunie ni
  piège d'inversion. Distribution collée à celle de 01/02 (D1 : moyenne 70,5 et médiane 70, contre 70,1
  et 70 ; D2 : 66,7 et 67, contre 65,9 et 66,5).
  Table d'ajustements à la main de **quarante-cinq entrées**, et le gros du travail est de **rattraper les
  révélations que le vieillissement laisse en arrière** : **Pauleta 86** (meilleur joueur), **Nonda 84**
  (vingt-six buts), **Ronaldinho 84**, **Coupet 83**, **Juninho 83**, **Cissé 82**, **Rothen 80**,
  **Landreau 80** — et surtout **Drogba 76/90** (l'héritage seul le laissait à **65** alors qu'il faisait
  la saison de sa vie), **Čech 76/92**, **Adebayor 68/90** (laissé à 60 pour 3 237 minutes), **Malouda 78**,
  **Sinama-Pongolle 70**, **Le Tallec 69**, **Evra 75**, **Pedretti 77**, **Mahamadou Diarra 75/86**,
  **Chamakh 67/84** (dix-huit ans à Bordeaux), **Mathieu 69/84**, **Ziani 68/82**. Une correction en sens
  inverse, qui vaut d'être notée : **Rigobert Song, ancré en 1997 et vieilli par la règle, ressortait à 83**,
  deuxième meilleur joueur du championnat — ramené à **79**. **Le vieillissement dérape dans les deux sens,
  et il faut relire le haut du classement comme le bas.**
  **Forçage de seize pépites**, la plus grosse fournée du chantier, parce que 2002-03 est l'année où toute
  une génération débute : **Jimmy Briand (dix-sept ans, vingt-quatre minutes à Rennes)** et **Jacques Faty**,
  **Ronald Zubar (dix-sept ans à Caen)**, **Guirane N'Daw (dix-huit ans, UNE minute à Sochaux)**,
  **Jérémy Morel**, **Alaixys Romao**, **Hassan Yebda**, **Ludovic Obraniak**, **Lorik Cana**,
  **Jean Makoun** et **Marc-Antoine Fortuné** (Lille), **Jaroslav Plašil** (prêté à Créteil),
  **Madjid Bougherra**, **Yohann Pelé**, **Franck Béria** et **Rod Fanni**. Les six derniers viennent de la
  parade de 00/01 (lister les écartés que le jeu connaît déjà) ; les dix autres sont des débutants purs.
  Drogba, Malouda, Nonda, Rothen, Evra, Squillaci, Givet, Čech, Cissé, Mexès, Kapo, Essien, Adebayor, Keita,
  Toulalan, Sinama-Pongolle, Le Tallec, Ziani, Mathieu, Chamakh, Govou, Juninho, Ronaldinho, Abidal et
  Mahamadou Diarra passent tous tout seuls au temps de jeu.
  **UNE RÈGLE NEUVE, ET C'EST LA LEÇON DU JOUR : LA RÈGLE DES HOMONYMES VAUT AUSSI D'UNE SAISON À
  L'AUTRE.** Jusqu'ici on ne tranchait qu'entre deux hommes présents **la même année**. Or **un nom court
  que le jeu attribue déjà à quelqu'un ne se reprend pas, même si cet homme ne joue plus en France** :
  Bruno Cheyrou étant parti de Lille pour Liverpool à l'été 2002, son frère **Benoît héritait de
  « B. Cheyrou »** et le nom changeait d'homme en silence. Le contrôle est le même que celui des notes —
  **l'ancre doit concorder en âge** (garde-fou de 99/00, jurisprudence des jumeaux Vujović) — et à défaut
  l'homme garde son nom en toutes lettres. Trois cas cette année, et **tous trois reconduisent une
  décision déjà prise** : **Benoît Cheyrou**, **Abdoulaye Cissé** (« A. Cissé » est Aliou depuis 98/99) et
  **Kor Sarr** (« K. Sarr » est un Beauvaisien de 96/97). Quatre homonymes de la même année se tranchent
  par la règle de 00/01, et tous les quatre comme l'an dernier : **Amdy Faye** garde « A. Faye » face à
  Abdoulaye, **Anthar Yahia** face à Alaeddine, **Pape Malick Diop** face à Papa Bouba, **David Coulibaly**
  face à Dramane.
  **Un prénom vidé dans `PRENOMS_VRAIS`, et c'est une erreur ancienne réparée** : « I. Ba » disait
  **Ibrahim**, ce qui est juste pour l'ailier du Havre de 95-96 mais faux pour **Issa Ba**, le Lavallois
  que le jeu porte depuis 00/01. Deux hommes, deux prénoms, un seul nom court : la table passe à `""` et
  le jeu garde l'initiale, comme la consigne l'exige. Les douze autres écarts relevés entre la table et
  Transfermarkt sont des **variantes de graphie du même homme** (Peguy/Péguy Luyindula, Rafael/Rafa
  Márquez, Éric/Eric Durand, Sékou/Sekou Berthé…) : **on ne remplace pas une graphie discutable par une
  autre**, la table garde la sienne. 166 entrées neuves, dont aucune vide.
  **Quatre pièges de relevé, et trois sont des variantes du même.**
  (1) **La sentinelle de fin frappe encore, et cette fois dans le LECTEUR d'ancres** : découper les blocs
  de club d'une table `STARS_*` avec une expression dont la fin regarde le club suivant **perd le dernier
  joueur de chaque bloc** — Djibril Cissé et Philippe Mexès n'avaient plus d'ancre et repartaient d'une
  note calculée. **Symptôme à reconnaître : un index d'ancres trop petit** (8 906 apparitions au lieu de
  9 100). Découper sur les **ouvertures de clé**, jamais sur ce qui suit.
  (2) **Le même piège chez Transfermarkt, en HTML** : les lignes d'effectif contiennent une
  `<table class="inline-table">`, donc une expression non gourmande `<table class="items">(.*?)</table>`
  se ferme sur **la table interne de la première ligne** et ne rend qu'un joueur. Prendre depuis
  `<table class="items">` jusqu'au bout, puis découper sur `<tr class="odd|even">`.
  (3) **TM sert la date de naissance en trois formats selon la langue** — `31.12.1972` (allemand),
  `11/03/1970` (anglais), `10 févr. 1976` (français). Une expression calée sur le format européen a
  rendu **trente-cinq clubs sur quarante entièrement non datés**. Seule l'**année** compte
  (`âge_jeu = 2002 − naissance`) : la lire dans la cellule qui porte aussi l'âge entre parenthèses.
  (4) **« J. Riise » et « J.-J. Okocha » n'obéissent pas à la même règle** : **seul un prénom À TRAIT
  D'UNION donne une double initiale**. Recomposer les initiales sur *tous* les prénoms donnait
  « J.-A. Riise » pour John Arne Riise, alors que le jeu écrit « J. Riise » depuis 99/00 — et
  « P. Diop » pour Pape Malick Diop est juste pour la même raison. On ne retient donc que le **premier**
  prénom, éclaté sur ses traits d'union.
  **Un défaut de méthode corrigé, vérifié neutre sur cette saison** : la réparation des postes
  **abandonnait les postes suivants** dès qu'un poste était incomblable — Auxerre, qui n'a qu'un gardien
  répertorié, ne voyait jamais examiner ses attaquants. Corrigé en traitant les quatre postes
  indépendamment ; les tables de 02/03 sont **identiques avant et après**, la source étant de toute façon
  muette dans les deux cas.
  **La source est la plus généreuse du chantier** : **aucun club sous vingt-deux hommes documentés**, tous
  les postes reconnus dans les trois langues (aucun libellé inconnu sur cinquante-trois relevés), et **un
  seul joueur que la source ne sait pas dater** — **Cédric Stoll (Strasbourg, 4 minutes), le même qu'en
  01/02** —, écarté plutôt que deviné. L'anti-robot AWS reste là, contourné en faisant tourner les quatre
  domaines (`.fr`, `.com`, `.de`, `.co.uk`) avec relance : **79 des 80 pages au premier passage**, la
  dernière à la reprise. Dix joueurs procéduraux au total, du même ordre qu'en 00/01 et 01/02 : Auxerre et
  Guingamp n'ont qu'**un gardien** répertorié, et sept clubs n'ont que deux ou trois attaquants (Lens deux
  seulement). La source fait foi, `genJoueur` complète. Validation dédiée : **`harness0203.cjs`**.
  **2003-04 (v1.57)** : `STARS_0304`/`STARS_D2_0304`, `D1_0304`/`D2_0304`, `an:2003`, `saison_id/2003` —
  sous le nom **« Le printemps des finalistes »**, et c'est désormais la saison la plus RÉCENTE du
  jeu. Le nom dit la singularité de l'année, qui ne s'est jamais reproduite : **la France place deux
  clubs en finale européenne le même printemps et n'en ramène aucune coupe** — Monaco perd la Ligue
  des champions 3-0 contre Porto à Gelsenkirchen le 26 mai, Marseille la Coupe UEFA 2-0 contre
  Valence à Göteborg trois jours plus tôt. Lyon prend son **troisième titre d'affilée avec
  soixante-dix-neuf points**, un record du championnat, et Grégory Coupet est élu meilleur gardien.
  **Didier Drogba fait la saison de sa vie au Vélodrome** — meilleur joueur du championnat aux
  trophées UNFP, dix-neuf buts en Ligue 1 et trente-deux toutes compétitions, puis Chelsea pour
  vingt-quatre millions de livres —, **Djibril Cissé en plante vingt-six pour Auxerre** et finit
  meilleur buteur pour la deuxième fois avant de filer à Liverpool, Alex Frei en met vingt pour
  Rennes. Sur le Rocher, Didier Deschamps est élu meilleur entraîneur et lance Morientes (prêté par
  le Real, meilleur buteur de la C1 avec neuf buts), Giuly, Rothen et un **Patrice Evra élu meilleur
  espoir**. À Rennes, Petr Čech garde les buts avant Chelsea, et un gamin de dix-sept ans entre en
  jeu : **Yoann Gourcuff**. Saint-Étienne écrase la Ligue 2 et remonte enfin ; Besançon la découvre.
  **LE PLATEAU TOMBE JUSTE TOUT SEUL POUR LA DEUXIÈME FOIS DE SUITE** : la Ligue 1 réelle a ses
  vingt clubs et la Ligue 2 les siens, donc **aucun repêchage, aucun écarté**, et le harnais vérifie
  les deux listes par égalité comme en 02/03. Trois promus (**Toulouse** champion de Ligue 2,
  **Metz** et **Le Mans**), trois descendus (**Troyes, Sedan, Le Havre**). Un seul club neuf dans
  `CLUBS_EXTRA` : **Besançon** (`BES`, **Léo-Lagrange**, **rouge et blanc**, couleurs vérifiées sur
  sa fiche Wikipédia, jurisprudence Créteil), monté du National et redescendu au bout d'un an.
  **Sièges européens — et pour la première fois depuis 96/97, les sept sont en première division** :
  **Lyon (champion) et Monaco (2e) en phase de groupes de Ligue des champions, Marseille (3e) au
  troisième tour de qualification** ; en Coupe UEFA **Bordeaux (4e), Sochaux (5e), Auxerre
  (vainqueur de la Coupe de France 2003) et LENS, qualifié au CLASSEMENT DU FAIR-PLAY** — un motif
  qu'aucune autre saison du jeu n'avait encore servi. `euroC2` est vide pour la quatrième fois.
  **Vérifié plutôt que supposé** : Guingamp, Nantes et Nice ont joué l'Intertoto 2003 mais n'ont pas
  de siège, **aucun club français n'ayant gagné cette édition** (Schalke 04, Villarreal et Perugia).
  `HONNEURS` n'a rien eu à apprendre — il connaît 1992 → 2006 — et **partir de 03/04 fait tomber
  l'EURO 2004 dès la PREMIÈRE intersaison**, celui de la Grèce : l'été 2005 est muet et le Mondial
  2006 attend la troisième. Le harnais vérifie que cette dépêche ne contient pas « LA FRANCE » en
  capitales, que `finDeSaison` lirait comme un triomphe.
  **L'héritage fait presque tout, et toutes les ancres sont derrière** : **516 des 760 noms
  reprennent leur note 02/03 vieillie d'un an**, 87 viennent de plus loin, **157 seulement sont
  calculés**. Distribution collée à celle de 02/03 (L1 : moyenne 70,4 et médiane 70, contre 70,5
  et 70 ; L2 : 66,6 et 67, contre 66,7 et 67).
  Table d'ajustements à la main de **soixante-six entrées**, la deuxième plus longue du chantier
  après 90/91, parce que 2003-04 est une saison de prêts prestigieux que le calcul ne peut pas
  connaître : **Morientes 83** (Real Madrid), **Élber 80** (Bayern), **Sorín 79** (Argentine),
  **Celades 75** et **Riera 72/85** (Real et Majorque, tous deux à Bordeaux), **Ibarra 75** (Boca),
  **Mido 72/86** (Ajax), **Tavlaridis 71/78** et **Dante 64/84** (Arsenal et Juventude, tous deux à
  Lille). Le reste rattrape les révélations : **Drogba 85/91** (l'héritage seul le laissait à 77),
  **Coupet 85**, **Cissé 85/91**, **Frau 80/85**, **Evra 79/88**, **Essien 82/91**, **Čech 82/93**,
  **Frei 78/84**, **Gourcuff 61/90**. Et **deux corrections en sens inverse**, parce que **le
  vieillissement dérape dans les deux sens** : **Florian Maurice ressortait à 82** à Bastia, huitième
  note du championnat, ramené à **77** ; **Lilian Laslandes à 79** à trente-deux ans, ramené à **75**.
  **Forçage de dix-sept pépites**, par la parade de 00/01 (lister les écartés que le jeu connaît
  déjà) doublée du relevé des débutants : **Yoann Gourcuff (dix-sept ans, 315 minutes à Rennes)**,
  **Yoan Gouffran (dix-sept ans, 55 minutes à Caen)**, **Guillaume Hoarau (dix-neuf ans, QUINZE
  minutes au Havre)**, **Mathieu Debuchy**, **Dante**, **Jimmy Briand**, **Jérémy Clément**,
  **Guirane N'Daw**, **Benoît Assou-Ekotto**, **Ludovic Obraniak**, **Loïc Perrin**, **Ronald
  Zubar**, **Christopher Samba**, **Mounir Obbadi**, **Mehdi Lacen**, **Madjid Bougherra** et
  **Philippe Christanval** — le seul vétéran de la liste, prêté par le Barça à l'OM, 1 452 minutes
  et noté 79, que la profondeur du Vélodrome jetait hors des vingt. Lille, Rennes et Caen paient
  chacun deux hommes. Drogba, Cissé, Coupet, Evra, Čech, Essien, Morientes, Giuly, Rothen, Frau,
  Mavuba, Flamini, Adebayor, Chamakh et Élber passent tous tout seuls au temps de jeu.
  **LE PIÈGE DU JOUR, ET C'EST LA SENTINELLE DE FIN POUR LA TROISIÈME FOIS** : découper le tableau de
  temps de jeu sur les ouvertures de ligne laisse la **DERNIÈRE ligne collée à tout le bas de page**,
  si bien qu'une expression ancrée sur la fin de morceau (`\Z`) ne trouve plus la cellule des minutes
  et rend **zéro**. Un joueur par club, donc quarante, et le tri aux minutes les jetait tous. **Treize
  avaient leur place dans un effectif** — dont **Pierre-Alain Frau, cinquième buteur du championnat
  avec dix-sept buts et 3 796 minutes**, **Bernard Diomède, champion du monde 1998, titulaire à
  Ajaccio**, **Chaouki Ben Saada** et **Bafétimbi Gomis, dix-huit ans à Saint-Étienne**. Le symptôme à
  reconnaître, comme en 01/02 et 02/03 : **exactement un joueur par club à zéro minute**, et un poste
  qui manque là où la source n'a pas de trou (Sochaux se retrouvait à deux attaquants). La parade :
  **borner la ligne à la main** — le `</table>` ferme la table imbriquée du nom, le premier `</tr>`
  d'après ferme la ligne —, jamais une sentinelle de fin. `harness0304.cjs` garde nommément les treize.
  **LA DÉCOUVERTE DU JOUR, ET ELLE CORRIGE UNE DÉCISION DE 02/03 : LES DEUX TABLES 96/97 SONT
  DÉCALÉES D'UN AN.** Elles ont été curées avec « âge_jeu = âge TM − 1 » (la convention notée plus
  haut pour 96/97), là où les vingt-quatre autres suivent « âge = AN − naissance ». Mesuré sur cette
  saison : **48 ancres sur 86 en D1 et 32 sur 60 en D2 accusent ce +1, contre zéro dans toutes les
  autres tables** — c'est la moitié des hommes, soit exactement ceux qui sont nés au second semestre.
  Le garde-fou d'âge prenait donc un seul homme pour deux. Trois appariements en dépendaient, tous
  trois **vérifiés par identifiant Transfermarkt** sur la page d'effectif 96/97 du club concerné
  (Beauvais, Châteauroux, Gueugnon) : **Kor Sarr, Paulo Vida et Mansour Boutabout** sont bien les
  mêmes hommes qu'en 96/97. Conséquence : **« K. Sarr » lui revient**, alors que 02/03 l'avait écrit
  en toutes lettres au motif d'un homonyme qui n'existait pas — et la table `PRENOMS_VRAIS` le disait
  déjà, « K. Sarr » → Kor. **Règle à garder : tolérer un écart d'un an, et lui seul, sur une ancre
  96/97 ; et trancher l'identité par l'identifiant TM, jamais par l'âge.** Les tables de 02/03 n'ont
  pas été retouchées : une saison livrée ne se refait pas.
  **Trois autres points de relevé.** (1) **Un mononyme brésilien ne se déduit pas du seul prénom** :
  la règle de 01/02 (« si le premier mot du nom complet est un mononyme connu du jeu, on l'écrit en
  mononyme ») transformait **Christian Bassila en « Christian »**, au seul motif qu'un Brésilien
  prénommé Christian existe ailleurs dans le jeu — et pareil pour Christian Nadé et Christian Mendy.
  La condition manquante : **TM n'a PAS abrégé le nom court**. Juninho Pernambucano arrive en entier,
  Christian Bassila arrive en « C. Bassila ». (2) **On reprend désormais l'orthographe de l'ancre** :
  la colonne « nom court » de TM rend « J. Plasil » là où le jeu écrit parfois « J. Plašil », et
  écrire le nom de l'ancre garde un homme sous le même nom d'une saison de départ à l'autre (zéro
  divergence sur les 603 appariements de cette saison). (3) **Vérifier avant d'ajouter un homme qu'on
  croit connaître** : Franck Ribéry est absent du relevé de Metz, et c'est la source qui a raison —
  il jouait à **Brest, en National**, en 2003-04, et n'arrive à Metz qu'à l'été 2004. De même Jérémy
  Ménez et Charles N'Zogbia ne débutent qu'en 2004-05, et Bacary Sagna est bien à Auxerre mais à
  **zéro minute**.
  **Un homonyme parfait écarté, et c'est une reconduction** : **deux Frédéric Mendy**, prénom ET
  patronyme identiques, le Bastiais né en 1973 que le jeu porte depuis 93/94 et le Stéphanois né en
  1981, titulaire à 2 877 minutes. Le jeu garde le premier, le second **cède sa place à un autre vrai
  joueur de son club** (jurisprudence Olivier Baudry 91/92, déjà appliquée en 01/02). Trois autres
  noms courts restent à d'autres : **Benoît Cheyrou** (Bruno est parti pour Liverpool mais le nom est
  à lui), **Serge Simon** (dix-neuf ans à Laval — « S. Simon » est Segundo Simon depuis 90/91) et
  **Abdoulaye Faye** (« A. Faye » est Amdy depuis 00/01, parti en Angleterre : **un nom ne se libère
  pas parce que son homme a quitté la France**). Et un patronyme en deux mots blanchi sur pièces :
  **Gilles Donald YAPI YAPO**, l'Ivoirien que Nantes recrute en janvier 2004, comme Michael Mio
  Nielsen l'avait été en 90/91.
  **La source est généreuse, à peine moins qu'en 02/03** : aucun libellé de poste inconnu sur les
  trois langues, **un seul joueur que la source ne sait pas dater** (Clément Halet, Laval, 155
  minutes — présent sur la page de temps de jeu mais absent de l'effectif), écarté plutôt que deviné,
  et le club le plus pauvre est **Amiens avec vingt et un hommes ayant joué** pour dix-huit places.
  144 prénoms neufs dans `PRENOMS_VRAIS`, **dont aucun vide**. Quatre écarts relevés avec la table
  existante, tous des variantes du même homme, et la table garde la sienne (règle de 02/03) : le
  « Juan-Luis Montero » du jeu est le « Jean-Louis Montero » de TM, et Wikipédia donne les deux.
  **Six joueurs procéduraux seulement**, le meilleur score du chantier : cinq clubs n'ont qu'**un
  gardien** répertorié (Auxerre, Guingamp, Bastia, Toulouse, Besançon) et Sochaux que trois
  attaquants. La source fait foi, `genJoueur` complète. Validation dédiée : **`harness0304.cjs`**.
  **2004-05 (v1.68)** : `STARS_0405`/`STARS_D2_0405`, `D1_0405`/`D2_0405`, `an:2004`, `saison_id/2004` —
  sous le nom **« Quatre fois de suite »**, et c'est désormais la saison la plus RÉCENTE du jeu. Lyon
  prend son **quatrième titre d'affilée avec soixante-dix-neuf points, exactement le total de
  l'année d'avant** : avant lui, seuls Saint-Étienne (1967-1970) et Marseille (1989-1992) avaient
  gagné quatre championnats de suite. **Michael Essien est élu meilleur joueur** avant de filer à
  Chelsea pour vingt-quatre millions de livres, Grégory Coupet meilleur gardien pour la troisième
  fois, **Paul Le Guen meilleur entraîneur pour sa dernière saison sur le banc**, et Jérémy Toulalan
  meilleur espoir à Nantes. Lille finit **deuxième**, sa meilleure place depuis des décennies, avec
  les seize buts de Matt Moussilou. Alexander Frei plante vingt buts pour Rennes et finit meilleur
  buteur ; Javier Saviola arrive en prêt du Barça sur le Rocher ; **un Franck Ribéry de vingt et un
  ans fait la saison de sa vie à Metz** avant Galatasaray puis le Vélodrome. Et à Lyon, un gamin de
  dix-sept ans entre en jeu **cent sept minutes** : Karim Benzema.
  **LE PLATEAU TOMBE JUSTE TOUT SEUL POUR LA TROISIÈME FOIS DE SUITE** : les deux échelons réels ont
  vingt clubs, donc **aucun repêchage, aucun écarté**, et le harnais vérifie les deux listes par
  égalité comme en 02/03 et 03/04. Trois promus (**Saint-Étienne** champion de Ligue 2, **Caen** et
  **Istres**), trois descendus (**Guingamp, Le Mans, Montpellier**). Un seul club neuf dans
  `CLUBS_EXTRA` : **Dijon** (`DIJ`, **Gaston-Gérard**, **rouge et blanc**, couleurs vérifiées sur sa
  fiche Wikipédia, jurisprudence Créteil), monté du National en 2004 pour sa **première saison
  professionnelle**, qu'il termine quatrième après avoir sorti Bordeaux en Coupe de la Ligue.
  **Sièges européens — et un siège repart en deuxième division** : **Lyon (champion) et le Paris SG
  (2e) en phase de groupes de Ligue des champions, Monaco (3e, finaliste sortant) au troisième tour
  de qualification** ; en Coupe UEFA **Auxerre (4e), Sochaux (5e et vainqueur de la Coupe de la
  Ligue), LILLE au titre de l'INTERTOTO 2004** — le premier club français à gagner cette coupe
  depuis Montpellier en 1999, après deux saisons où il fallait justement constater qu'aucun ne
  l'avait gagnée — et **CHÂTEAUROUX, finaliste BATTU de la Coupe de France 2004**, le Paris SG
  vainqueur étant déjà qualifié en C1. La Berrichonne jouait la Ligue 2 : c'est le **sixième club du
  jeu à jouer l'Europe depuis la deuxième division**, et **le premier à y aller pour avoir PERDU une
  finale** — un motif qu'aucune autre saison n'avait servi. Marseille, septième, n'a aucun siège.
  `euroC2` est vide pour la cinquième fois.
  `HONNEURS` n'a rien eu à apprendre — il connaît 1992 → 2006 — mais **partir de 04/05 laisse la
  PREMIÈRE intersaison MUETTE** (sixième cas, après 90/91, 92/93, 00/01 et 02/03) : l'été 2005 ne
  porte aucun tournoi et **le Mondial 2006 attend la deuxième**, celui que l'Italie gagne aux tirs au
  but à Berlin. Le harnais vérifie que cette dépêche ne contient pas « LA FRANCE » en capitales, que
  `finDeSaison` lirait comme un triomphe — la France a perdu cette finale. **`HONNEURS` doit toujours
  apprendre 2008**, comme depuis 03/04 ; aucune saison ne l'exige encore, un été inconnu restant
  simplement muet.
  **L'héritage fait presque tout, et toutes les ancres sont derrière** : **513 des 760 noms
  reprennent leur note 03/04 vieillie d'un an**, 75 viennent de plus loin, **172 seulement sont
  calculés**. Distribution collée à celle de 03/04 (L1 : moyenne 70,7 et médiane 70, contre 70,4
  et 70 ; L2 : 66,8 et 67, contre 66,6 et 67).
  **MESURE QUI FIXE ENFIN LA RÈGLE DE VIEILLISSEMENT, et il fallait la faire** : les seuils
  (+2 jusqu'à 21 ans, +1 jusqu'à 24, −1 de 30 à 32, −2 au-delà) se lisent sur **l'âge À L'ANCRE**, pas
  sur l'âge d'arrivée. Vérifié en rejouant 02/03 → 03/04 sur les 516 hommes appariés : lus sur l'âge
  de départ, **487 notes sur 516 ressortent à l'identique** ; lus sur l'âge d'arrivée, seulement 362,
  et les 132 écarts tombent tous sur les âges de bascule (22, 25, 30, 33). À faire une fois, et à ne
  plus refaire.
  Table d'ajustements à la main de **quarante-six entrées**, parce que 2004-05 est une saison de
  prêts et d'arrivées que le calcul ne peut pas connaître : **Saviola 81/86** (prêté par le Barça),
  **Isaksson 79/86** (international suédois à Rennes), **Maicon 77/88** (Monaco, avant le triplé de
  l'Inter), **Chevantón 77**, **Kallon 77**, **Zokora 77/84**, **Ačimović 76**, **Odemwingie 74/80**,
  et deux palmarès que rien dans un classement ne trahit : **Kapsis 75**, CHAMPION D'EUROPE 2004 avec
  la Grèce, et **Jankauskas 74**, vainqueur de la LIGUE DES CHAMPIONS 2004 avec Porto. Le reste
  rattrape les révélations : **Essien 86/91** (l'héritage seul le laissait à 84), **Frei 82/85**,
  **Coupet 85**, **Cristiano 80/84**, **Ribéry 74/88**, **Moussilou 76/82**, **Sagna 74/86**,
  **Toulalan 72/86**, **Benzema 64/93**, **Mandanda 60/88**, **Koscielny 64/85**, **Matuidi 62/87**.
  Et **trois corrections en sens inverse**, le vieillissement dérapant toujours dans les deux sens :
  **Titi Camara ressortait à 78** en Ligue 2 à trente-deux ans, ramené à **74** ; **Djetou à 78**,
  ramené à **75** ; **Karembeu à 68** à trente-quatre ans, remonté à **70**.
  **Forçage de dix-huit pépites**, la plus grosse fournée du chantier après 03/04, par la parade de
  00/01 (lister les écartés que le jeu connaît déjà) doublée du relevé des débutants : **Karim
  Benzema (dix-sept ans, CENT SEPT MINUTES à Lyon)**, **Blaise Matuidi (dix-sept ans, cent
  cinquante-huit minutes à Troyes)**, **Steve Mandanda (dix-neuf ans, QUATRE-VINGT-DIX MINUTES au
  Havre — un seul match)**, **Yohan Cabaye**, **Laurent Koscielny**, **André-Pierre Gignac**, **Abou
  Diaby**, **Didier Digard**, **François Clerc** (nommé meilleur espoir), **Bafétimbi Gomis** (prêté
  à Troyes), **Dante**, **Yoan Gouffran**, **Guillaume Hoarau**, et cinq noms que le jeu portait déjà
  — **Christian Karembeu** (trente-quatre ans à Bastia), **Bernard Diomède**, **Martin Djetou**,
  **Titi Camara** et **Patrick Blondeau** (trente-six ans). **Le Havre paie TROIS hommes**, Troyes,
  Créteil, Lille et Nice deux chacun. Ribéry, Nasri, Ménez, Ben Arfa, Sagna, Kaboul, Lassana Diarra,
  Toulalan, Mavuba, Gourcuff, Essien, Saviola, Adebayor et Evra passent tous tout seuls au temps de
  jeu — et **Hugo Lloris, dix-huit ans à Nice, est absent parce qu'il n'a pas joué une minute** : la
  source fait foi, on ne force pas un homme qui n'était pas sur le terrain.
  **LE PIÈGE DU JOUR, ET IL VIENT D'UNE RÈGLE ÉCRITE EN 03/04 : LA TOLÉRANCE D'UN AN DES TABLES
  96/97 FABRIQUE DE FAUX APPARIEMENTS.** 03/04 avait découvert que les deux tables 96/97 sont
  décalées d'un an (curées avec « âge TM − 1 ») et autorisé un écart d'un an sur leurs ancres. Mais
  appliquée sans garde-fou, cette tolérance a pris **Ludovic Leroy** (Reims, défenseur né en
  septembre 1975, vingt-neuf ans) pour **Laurent Leroy** (attaquant né en avril 1976, vingt-huit
  ans), que le jeu porte sous « L. Leroy » depuis 96/97 : le Rémois héritait de sa note **et de son
  nom**. La parade, et c'est la règle à garder : **la tolérance d'un an ne vaut que pour un nom que
  SEULES les deux tables 96/97 connaissent**. Dès qu'une table non décalée porte le même nom, c'est
  elle qui dit l'âge vrai, et un écart d'un an signifie deux hommes. Les trois appariements de 03/04
  (Kor Sarr, Paulo Vida, Mansour Boutabout) sont justement des noms que seul 96/97 connaissait : la
  règle neuve les conserve et ne coûte rien.
  **LE NOM QUI N'ÉTAIT PAS LIBRE, ET C'EST UN CAS SANS PRÉCÉDENT : DEUX MONONYMES « Cris ».** Le jeu
  donne « Cris » depuis 03/04 au défenseur brésilien d'Angers, né en 1979 ; le Cris de Lyon — patron
  de la défense championne, 4 083 minutes — est un **autre homme**, né en 1977, et la règle de 02/03
  est formelle : un nom court que le jeu attribue déjà ne se reprend pas. Les remèdes connus ne
  marchaient ni l'un ni l'autre : « écrire en toutes lettres » suppose un prénom à déplier (Benoît
  Cheyrou, Serge Simon), et la jurisprudence Olivier Baudry — le plus marginal cède sa place —
  aurait coûté un titulaire de la saison, alors que l'Angevin n'est même pas du plateau 04/05 (715
  minutes en Ligue 2, écarté au tri). La décision : **le Lyonnais s'écrit « Cristiano »**, son prénom
  civil, que Transfermarkt donne en entier (« Cristiano Márques Gómes ») — un vrai nom, dans le style
  des mononymes brésiliens que le jeu emploie déjà, et qui ne marche sur personne. **Et l'on n'a PAS
  retouché 03/04 pour lui donner « Cris » : une saison livrée ne se refait pas.**
  **La source est la plus généreuse du chantier** : **aucun club sous vingt-trois hommes ayant
  joué** (Lens et Rennes, pour vingt places), **aucun joueur que la source ne sache dater** — une
  première —, et un seul libellé de poste inconnu à ajouter aux trois langues (« Deuxième
  attaquant »). Le relevé n'a coûté aucun échec : les quatre-vingts pages sont passées du premier
  coup, l'anti-robot ne frappant qu'une fois, sur la page de classement de Ligue 2, et la rotation de
  domaines (`.com`, `.de`, `.fr`, `.co.uk`) l'a réglée. **Quarante-quatre hommes listés dans deux
  clubs** sont allés là où ils ont le plus joué (Fiorèse du Paris SG à l'OM, Ziani à Lorient, Gomis
  prêté à Troyes), dédoublonnés **par identifiant Transfermarkt**.
  157 prénoms neufs dans `PRENOMS_VRAIS`, **dont aucun vide** — pour la deuxième fois de suite.
  Trois écarts relevés avec la table existante, tous des variantes du même homme, et la table garde
  la sienne (règle de 02/03) : « J. Francia » dit Juan quand TM dit Juan Pablo, « J.-L. Montero »
  Juan-Luis contre Jean-Louis, « E. Kroupi » Éli contre Elie.
  **Quatre joueurs procéduraux seulement, le meilleur score du chantier** : Rennes et Toulouse n'ont
  qu'**un gardien** ayant joué (Isaksson et Revault ont tout disputé, et aucune doublure n'est entrée
  une minute), Lens que **trois attaquants**, Saint-Étienne que **quatre milieux**. La source fait
  foi, `genJoueur` complète. Validation dédiée : **`harness0405.cjs`**.
  **2005-06 (v1.71)** : `STARS_0506`/`STARS_D2_0506`, `D1_0506`/`D2_0506`, `an:2005`, `saison_id/2005` —
  sous le nom **« Le coup franc de Juninho »**, et c'est désormais la saison la plus RÉCENTE du jeu.
  Lyon prend son **cinquième titre d'affilée, et le plus large de tous** : quatre-vingt-quatre
  points, **quinze de plus que Bordeaux**. **Juninho Pernambucano est élu meilleur joueur du
  championnat**, Grégory Coupet meilleur gardien **pour la quatrième fois**, et Claude Puel meilleur
  entraîneur d'un Lille troisième qui va chercher les **huitièmes de la Ligue des champions**.
  Pauleta plante **vingt et un buts** pour le Paris SG et finit meilleur buteur ; **Franck Ribéry,
  élu meilleur espoir**, règne sur le Vélodrome avant le Mondial. **Nancy, qui n'avait plus vu la
  première division depuis 1997**, remonte et gagne la **Coupe de la Ligue 2006** à Saint-Denis
  contre Nice, par Zerka et Kim — deux hommes que le jeu a dans son effectif lorrain ; le Paris SG
  prend la **Coupe de France 2006** contre Marseille. À Nice, un gardien de dix-neuf ans fait ses
  premiers matchs : **Hugo Lloris**.
  **LE PLATEAU TOMBE JUSTE TOUT SEUL POUR LA QUATRIÈME FOIS DE SUITE** : les deux échelons réels ont
  vingt clubs, donc **aucun repêchage, aucun écarté**, et le harnais vérifie les deux listes par
  égalité comme depuis 02/03. Trois promus (**Nancy** champion de Ligue 2, **Le Mans** et **Troyes**),
  trois descendus (**Caen, Bastia, Istres**). Un seul club neuf dans `CLUBS_EXTRA` : **Sète**
  (`SET`, **Louis-Michel**, 8 700 places, **vert et blanc**, couleurs vérifiées sur sa fiche
  Wikipédia, jurisprudence Créteil), monté du National, **dernier avec vingt-trois points et
  redescendu aussitôt** — une seule saison dans l'antichambre.
  **Sièges européens — HUIT sièges, tous en Ligue 1, la plus grosse délégation depuis 97/98** :
  **Lyon (champion) et LILLE (2e) en phase de groupes de Ligue des champions, Monaco (3e) au
  troisième tour de qualification** ; en Coupe UEFA **Rennes (4e)**, **Auxerre** au titre de la
  Coupe de France 2005, **Strasbourg** au titre de la Coupe de la Ligue 2005, et **MARSEILLE ET
  LENS, tous DEUX vainqueurs de l'INTERTOTO 2005** — c'est la première fois que le jeu place **deux
  clubs français qualifiés par la même Intertoto**, et il fallait le vérifier plutôt que le
  supposer, Lens n'étant que septième du championnat précédent. `euroC2` est vide pour la sixième
  fois. **Et un contrôle que le harnais garde parce que c'est l'erreur la plus facile et la plus
  invisible : Bordeaux, DEUXIÈME du championnat 2005-06, part sans Europe** — les sièges se gagnent
  l'année d'AVANT, et les Girondins n'étaient que quinzièmes en 2004-05.
  **Partir de 05/06 fait tomber le Mondial 2006 dès la PREMIÈRE intersaison** — celui que l'Italie
  gagne aux tirs au but à Berlin, et que la France perd : le harnais vérifie que cette dépêche ne
  contient pas « LA FRANCE » en capitales, que `finDeSaison` lirait comme un triomphe. L'été 2007
  est ensuite **muet**. **`HONNEURS` doit toujours apprendre 2008**, et **06/07 sera la première
  saison qui le réclame vraiment**, à sa deuxième intersaison.
  **L'héritage fait presque tout, et toutes les ancres sont derrière** : **526 des 760 noms
  reprennent leur note 04/05 vieillie d'un an**, 78 viennent de plus loin, **156 seulement sont
  calculés**. Distribution collée à celle de 04/05 (L1 : moyenne 70,0 et médiane 70, contre 70,7
  et 70 ; L2 : 66,8 et 67, comme l'an passé au dixième près).
  Table d'ajustements à la main de **soixante-deux entrées** : les palmarès de l'année d'abord
  (**Juninho 85/86**, **Coupet 85/87**, **Pauleta 84/86**, **Ribéry 80/89** — l'héritage seul le
  laissait à 76), puis les arrivées que le calcul ne peut pas connaître (**John Carew 77/80**,
  ex-Valence et Roma ; **Tiago Mendes 78/83**, arrivé de Chelsea ; **Hélder Postiga 73/80**, prêté
  à Saint-Étienne ; **Grafite 70/78**, futur meilleur buteur de Bundesliga), les gamins que rien
  dans un classement ne trahit (**Lloris 64/92**, **Gourcuff 70/91**, **Payet 60/89**, **Giroud
  58/86**, **Benzema 66/93**, **Mandanda 70/89** — deux mille huit cent quarante minutes, il tient
  vraiment les buts), et **quatorze corrections en sens inverse**, le vieillissement dérapant
  toujours dans les deux sens : **Pius N'Diefi ressortait à 79** pour cent une minutes de Ligue 2 à
  trente ans, ramené à **73** ; Carrière, Déhu, Lamouchi, Laslandes, Šmicer et Frau redescendus eux
  aussi.
  **Forçage de dix-neuf pépites** par la parade de 00/01 (lister les écartés que le jeu connaît
  déjà) doublée du relevé des débutants : **Karim Benzema** (dix-huit ans, 796 minutes) et **Hatem
  Ben Arfa** à Lyon, **Younès Kaboul** et **Abou Diaby** à Auxerre, **Kevin Mirallas** et **Dante**
  à Lille, **Kévin Gameiro** et **Ricardo Faty** à Strasbourg, **Dimitri Payet (QUATRE-VINGT-HUIT
  MINUTES)** et **Dennis Oliech** à Nantes, **OLIVIER GIROUD, dix-neuf ans et CENT QUATORZE MINUTES
  en Ligue 2 à Grenoble**, **Moussa Sow**, **Laurent Koscielny**, **André-Pierre Gignac** (neuf
  minutes), **Hassan Yebda**, **Madjid Bougherra**, **Gaëtan Bong** (dix-sept ans), **Bernard
  Diomède** et **Martin Djetou**. **Cinq clubs paient DEUX hommes chacun** (Lyon, Auxerre, Lille,
  Strasbourg, Nantes). Ribéry, Nasri, Ménez, Gourcuff, Toulalan, Cabaye, Matuidi, Sagna, Mandanda,
  Gomis, Chamakh, Mavuba et Briand passent tous tout seuls au temps de jeu — **et HUGO LLORIS
  ENTRE ENFIN** : écarté de 04/05 parce qu'il n'avait pas joué une minute, il en joue **mille
  cinquante** à Nice en 05/06. **La source fait foi dans les deux sens**, et c'est la meilleure
  illustration qu'on ait eue de la règle.
  **LE PIÈGE DU JOUR NE VIENT PAS DE TRANSFERMARKT MAIS DE LA SENTINELLE DE FIN, POUR LA QUATRIÈME
  FOIS — ET CETTE FOIS ELLE A FRAPPÉ DU CÔTÉ DES ANCRES.** Le script qui relit les tables
  `STARS_*` du jeu pour en tirer les notes héritées perdait **le DERNIER club de chaque table**
  (vingt hommes en L1, dix-huit en L2, parce que la dernière entrée est suivie de `,` puis de `}`
  et non d'un club suivant) : 04/05 ressortait à 380 et 342 au lieu de 400 et 360. Le symptôme est
  **un compte d'ancres rond mais trop petit**, et la conséquence aurait été invisible — une
  quarantaine d'hommes recalculés au lieu d'héritiers, sans qu'aucun harnais s'en plaigne.
  **À retenir : la sentinelle de fin se vérifie sur les tables du jeu comme sur les pages de la
  source.**
  **LA DÉCOUVERTE DU JOUR, ET C'EST UNE RÈGLE NEUVE : UN FORCÉ NE DOIT PAS CONTREDIRE LE RECRUTEUR.**
  **Christian Vieri a 747 minutes au Monaco de 2005-06** et le tri aux minutes l'écartait : un nom
  pareil appelait le forçage. Mais Vieri **n'est arrivé sur le Rocher qu'en janvier**, et les
  « vitrines du désir » de l'été 2005 le placent — à raison — **au Milan AC**. Le forcer aurait mis
  le même homme à deux endroits au coup d'envoi. **Il reste donc dehors**, et la règle à garder est
  celle-là : avant de forcer un homme venu de l'étranger en cours de saison, **vérifier qu'il n'est
  pas déjà au vivier ou aux vitrines de l'été**. Croisement fait, `VIVIER_SAISON[2005]` et les
  effectifs n'ont **aucun nom en commun**.
  **Troisième leçon, de relevé : la page de temps de jeu ne sert le NOM COURT que dans son span
  `show-for-small`**, le `hide-for-small` donnant le nom complet — et pour un patronyme déjà court
  elle sert **le nom complet des deux côtés** (« Alex Frei », « Rudy Riou », « Issa Ba », « Hervé
  Tum », « Marco Paulo »…). Seize hommes étaient dans ce cas : la forme abrégée a été **reprise des
  tables du jeu**, à l'âge qui concorde, plutôt que devinée. Sans cela seize vrais joueurs
  changeaient de nom d'une saison à l'autre.
  **Deux mononymes « Adailton », et c'est le cas « Cris » de 04/05 qui se rejoue** : le jeu donne
  « Adailton » depuis 04/05 au Rennais né en 1983 ; celui de Nancy, né en 1979, est un autre homme.
  Sa fiche Transfermarkt donne son nom civil en entier — **Adailton da Silva Santos** —, il s'écrit
  donc **« Adailton Santos »**, et **04/05 n'a pas été retouché**. Au total **six homonymes résolus
  dans la saison, un record** (Moké Diarra, Benoît Cheyrou, Alaeddine Yahia, Frédéric Mendy, Ismaël
  Bangoura, Dramane Coulibaly), plus **Mamadou Diallo** qui garde son nom en toutes lettres,
  « M. Diallo » étant à l'Amiénois de 03/04.
  **La source est aussi généreuse qu'en 04/05** : **aucun club sous vingt-deux hommes ayant joué**,
  **aucun joueur que la source ne sache dater** (deuxième fois de suite), **quatre-vingts pages
  aspirées sans un seul échec et sans un seul anti-robot**, et un seul libellé de poste inconnu à
  ajouter aux trois langues (« Défense »). **Trente-quatre hommes listés dans deux clubs** sont
  allés là où ils ont le plus joué (Frau de Lyon à Lens, Luyindula à Auxerre, Pagis à Strasbourg),
  dédoublonnés **par identifiant Transfermarkt**. Les quarante identifiants de clubs ont été
  **relevés sur les pages de championnat `wettbewerb/FR1` et `FR2` de la saison** plutôt que posés
  de mémoire — la leçon de 01/02, où six identifiants de mémoire avaient rebaptisé six joueurs.
  138 prénoms neufs dans `PRENOMS_VRAIS`, **dont aucun vide** — pour la troisième fois de suite.
  **DEUX joueurs procéduraux seulement, le meilleur score du chantier** : Troyes n'a qu'**un
  gardien** ayant joué (Le Crom a tout disputé) et Saint-Étienne que **quatre milieux**. La source
  fait foi, `genJoueur` complète.
  **Une imperfection connue et laissée telle quelle** : le registre appelle encore Valenciennes
  « US Valenciennes-Anzin », son nom de 1990-91 ; le club s'appelle **Valenciennes FC** depuis 1996.
  Le jeu n'a pas de mécanisme de nom par saison (seuls le stade, le prestige et le mot du club en
  ont un), et en fabriquer un n'était pas le travail de la journée. Validation dédiée :
  **`harness0506.cjs`**.
  **2006-07 (v1.75)** : `STARS_0607`/`STARS_D2_0607`, `D1_0607`/`D2_0607`, `an:2006`, `saison_id/2006` —
  sous le nom **« La chute des Canaris »**, et c'est désormais la saison la plus RÉCENTE du jeu. Lyon
  prend son **sixième titre d'affilée, et le plus écrasant de tous** : quatre-vingt-un points,
  **dix-sept d'avance sur Marseille**, le titre acquis le 22 avril à cinq journées de la fin.
  **Florent Malouda est élu meilleur joueur du championnat** avant Chelsea, Teddy Richert meilleur
  gardien à Sochaux, **Samir Nasri meilleur espoir à dix-neuf ans** au Vélodrome, Gérard Houllier
  meilleur entraîneur. **Pauleta finit meilleur buteur avec QUINZE buts seulement, le plus petit
  total qu'on ait vu en France** ; Savidan en met treize pour Valenciennes et Ismaël Bangoura douze
  pour Le Mans. Toulouse surprend tout le monde et prend la troisième place ; Sochaux gagne la Coupe
  de France aux tirs au but contre Marseille, Bordeaux la Coupe de la Ligue contre Lyon. Et tout en
  bas, **le FC Nantes descend pour la première fois de son histoire, après quarante-quatre saisons
  d'affilée dans l'élite** — c'est cela que le nom de la saison raconte, et c'est l'écho du « Jeu à
  la nantaise » de 00/01. Au Parc des Princes, un défenseur de seize ans entre en jeu : **Mamadou Sakho**.
  **LE PLATEAU TOMBE JUSTE TOUT SEUL POUR LA CINQUIÈME FOIS DE SUITE** : les deux échelons réels ont
  vingt clubs, donc **aucun repêchage, aucun écarté**, et le harnais vérifie les deux listes par
  égalité comme depuis 02/03. Trois promus (**Valenciennes** champion de Ligue 2, **Lorient** et
  **Sedan**), trois descendus (**Ajaccio, Metz, Strasbourg**) ; en Ligue 2, trois montées du National
  (**Niort**, **Tours** et Libourne) pour trois descentes (Clermont, Laval, Sète). Un seul club neuf
  dans `CLUBS_EXTRA` : **Libourne** (`LIB`, **Jean-Antoine-Moueix**, 7 000 places, **bleu et blanc**,
  couleurs vérifiées sur sa fiche Wikipédia, jurisprudence Créteil), né de la fusion de 1998 et monté
  du National pour sa **première saison professionnelle**.
  **Sièges européens — HUIT sièges, tous en Ligue 1, comme en 05/06** : **Lyon (champion) et
  BORDEAUX (2e) en phase de groupes de Ligue des champions, Lille (3e) au troisième tour de
  qualification** ; en Coupe UEFA **Lens (4e)**, le **Paris SG** au titre de la Coupe de France 2006,
  **Nancy** au titre de la Coupe de la Ligue 2006, et **MARSEILLE ET AUXERRE, tous DEUX vainqueurs de
  l'INTERTOTO 2006** — deux clubs français qualifiés par la même Intertoto pour la **deuxième année
  de suite**, ce qu'il fallait vérifier plutôt que supposer. `euroC2` est vide pour la septième fois.
  **Et le contrôle que le harnais garde, parce que c'est l'erreur la plus facile et la plus
  invisible : Toulouse, TROISIÈME du championnat 2006-07, part sans Europe** — les sièges se gagnent
  l'année d'AVANT, et Toulouse n'était que quinzième en 2005-06. Même chose pour Rennes et Sochaux.
  **`HONNEURS` A ENFIN APPRIS 2008, ET 06/07 EST LA SAISON QUI LE RÉCLAMAIT** : c'est le premier été
  que la table ait eu à apprendre depuis l'ouverture du chantier, annoncé depuis 03/04. Partir de
  06/07 laisse la **PREMIÈRE intersaison MUETTE** (septième cas, après 90/91, 92/93, 94/95, 00/01,
  02/03 et 04/05) et fait tomber l'**Euro 2008 à la DEUXIÈME** : l'Espagne met fin à quarante-quatre
  ans d'attente par une frappe de Torres à Vienne, et les Bleus rentrent dès le premier tour. Le
  harnais vérifie que cette dépêche ne contient pas « LA FRANCE » en capitales, que `finDeSaison`
  lirait comme un triomphe — d'où « les Bleus » dans le texte.
  **L'héritage fait presque tout, et toutes les ancres sont derrière** : **532 des 760 noms reprennent
  leur note 05/06 vieillie d'un an**, 63 viennent de plus loin, **165 seulement sont calculés**.
  Distribution collée à celle de 05/06 (L1 : moyenne 70,2 et médiane 70, contre 70,0 et 70 ; L2 :
  66,7 et 67, contre 66,8 et 67).
  Table d'ajustements à la main de **quarante-huit entrées** : les palmarès de l'année d'abord
  (**Malouda 85/87**, **Richert 78/80**, **Nasri 78/90**, **Savidan 73/75**, **Ismaël Bangoura 71/84**),
  puis les arrivées que le calcul ne peut pas connaître — **Yaya Touré 78/88** (venu de l'Olympiakos
  sur le Rocher, le Barça un an plus tard), **Jan Koller 77/79** (de Dortmund), **Johan Elmander 76/80**
  et **Mario Melchiot 76/78**, **Michel Bastos 72/85**, **Valter Birsa 70/85**, **Jerko Leko** et
  **Leandro Cufré 73/76** —, les gamins que rien dans un classement ne trahit (**Benzema 71/93**,
  **Lloris 72/92**, **Mandanda 75/90**, **Payet 68/89**, **Ben Arfa 72/89**, **Benatia 63/88**), et
  **deux corrections EN SENS INVERSE** : **Djibril Cissé, ancré en 2003 et vieilli trois fois,
  ressortait à 88, c'est-à-dire AU PLAFOND DU JEU**, pour une saison de prêt au Vélodrome — ramené à
  **80** ; et **Barthez à 80** à trente-cinq ans dans un Nantes relégué, ramené à **78**. **Une ancre
  lointaine vieillie plusieurs fois dérape beaucoup plus qu'une ancre d'un an : relire le haut du
  classement, toujours.**
  **Forçage de vingt-deux pépites, LA PLUS GROSSE FOURNÉE DU CHANTIER**, parce que 2006-07 est l'année
  où une génération entière débute : **MAMADOU SAKHO, SEIZE ANS et cent soixante-quinze minutes au Parc
  des Princes** — le deuxième seizième anniversaire du jeu après Didier Domi en 94/95 —, **David
  N'Gog** (dix-sept ans, PSG), **Morgan Schneiderlin** (dix-sept ans, soixante-quatre minutes à
  Strasbourg), **Adel Taarabt** (dix-sept ans, Lens), **Cédric Mongongu** (dix-sept ans, quarante et
  une minutes à Monaco), **Mapou Yanga-Mbiwa** (dix-sept ans, Montpellier), **Romain Alessandrini**
  (dix-sept ans, Gueugnon), **Sofiane Feghouli** (dix-sept ans, Grenoble), **KÉVIN CONSTANT, DEUX
  MINUTES dans toute la saison à Toulouse**, **Adil Rami** (champion du monde 2018), **Loïc Rémy**,
  **William Vainqueur**, **Jirès Kembo Ekoko**, **Alain Traoré**, **Bakary Koné**, **Bakary Sako**,
  **Charles Kaboré** (le seul Libournais que le jeu reverra), **Aly Cissokho**, **Mevlüt Erdinç**, et
  trois reconductions de 05/06 — **Olivier Giroud**, **Gaëtan Bong** et **Hassan Yebda**. **Hatem Ben
  Arfa a été forcé lui aussi, non pas pour entrer mais pour ne pas SORTIR** : vingtième aux minutes à
  Lyon, le forçage de Loïc Rémy l'éjectait — c'est le piège signalé en 90/91 (Thuram sortait pour
  Grimandi), et il faut y penser dès qu'un club paie deux hommes. **Le Paris SG, Lyon, Grenoble et
  Gueugnon paient DEUX hommes chacun**, et le Paris SG les paie cher : **Péguy Luyindula (1 225
  minutes) et Mauricio Gallardo (1 077)** sortent pour un gamin de seize ans et un de dix-sept. On le
  préfère à perdre les carrières qui suivent (jurisprudence Panucci-Contreras, 00/01).
  **SEPT HOMONYMES RÉSOLUS DANS LA SAISON, un record**, tous par la règle de 00/01 (celui qui portait
  DÉJÀ le nom court le garde) : **Seydou Keita** garde « S. Keita » face à **Sidi Keita**, son
  coéquipier à Lens ; **Rudy Riou** face à **Rémy Riou** ; **Bakari Koné** (Nice) face à **Bakary Koné**
  (Guingamp) ; **Pape Malick Diop** (Metz) face à **Pape Diop** (Tours) ; **Moussa N'Diaye** face à
  **Momar N'Diaye** ; **Bruno Cheyrou** face à **Benoît** ; **Antar Yahia** face à **Alaeddine**.
  **ET UN CAS QUE LE CHANTIER N'AVAIT JAMAIS RENCONTRÉ : TROIS Traoré sans lien, et « M. Traoré »
  appartient à un QUATRIÈME homme** que le jeu porte depuis 1990 et qui aurait trente-cinq ans en
  2006 — aucun des trois ne peut le reprendre, et **Mahamane** (Nice), **Mody** (Valenciennes) et
  **Mustapha** (Caen) passent tous les trois en toutes lettres. Enfin l'homonyme parfait, prénom ET
  patronyme : **deux Frédéric Mendy** de nouveau, et le Bastiais né en 1981 cède sa place à un autre
  vrai joueur de son club (jurisprudence Olivier Baudry 91/92, quatrième application).
  **LE PIÈGE DU JOUR, ET IL NE VIENT PAS DE LA SENTINELLE DE FIN POUR UNE FOIS : LA FORME ABRÉGÉE DES
  TABLES DU JEU DOIT PASSER AVANT LA RÈGLE DU MONONYME, ET EXIGER UNE CONCORDANCE D'ÂGE EXACTE.**
  Quand Transfermarkt sert le nom complet des deux côtés (patronyme court, leçon de 05/06), on cherche
  la forme abrégée dans les tables du jeu. Avec la règle du mononyme en premier, **« Eduardo Oliveira »,
  trente-quatre ans à Brest, devenait le mononyme « Eduardo »** — qui est au Toulousain de 03/04 —
  alors que le jeu le porte sous **« E. Oliveira » depuis 1998** ; et avec une tolérance d'un an sur
  l'âge, **« Álvaro Santos » (Sochaux, vingt-six ans) héritait du nom d'« Adailton Santos »** (Nancy,
  vingt-sept en 2006), parce que la clé aplatie réduit les deux prénoms à la même initiale. **Les deux
  défauts se voient au même symptôme : un homme qui change de nom d'une saison de départ à l'autre, ou
  qui prend celui d'un autre.** Correction : forme du jeu d'abord, âge exact, mononyme ensuite. Álvaro
  Santos s'écrit donc **« Á. Santos »**.
  **Deux autres contrôles qui ont servi.** (1) **Un forcé ne doit pas contredire le recruteur** (règle
  de 05/06) : le croisement de `VIVIER_SAISON[2006]` et des quarante effectifs ne rend **aucun nom en
  commun**. (2) **Transfermarkt crédite de quelques minutes des hommes qui avaient déjà quitté la
  France** — **Mahamadou Diarra, trois matchs et trois cents minutes à Lyon** alors qu'il était au Real
  Madrid depuis juillet 2006, **Arthur Boka** à Strasbourg alors qu'il était à Stuttgart. Le tri aux
  minutes les écarte tout seuls, et **c'est une raison de plus de ne pas les forcer** : un grand nom
  mal placé est pire qu'un nom absent.
  **La source est aussi généreuse qu'en 04/05 et 05/06, et même un peu plus** : **aucun club sous
  vingt-deux hommes ayant joué**, **aucun joueur que la source ne sache dater** (troisième fois de
  suite), **quatre-vingts pages aspirées sans un seul échec et sans un seul anti-robot** (deuxième
  fois de suite), et tous les libellés de poste reconnus dans les trois langues. **Quarante et un
  hommes listés dans deux clubs** sont allés là où ils ont le plus joué, dédoublonnés **par
  identifiant Transfermarkt** ; les quarante identifiants de clubs ont été **relevés sur les pages
  `wettbewerb/FR1` et `FR2` de la saison** (leçon de 01/02), et les vingt-trois identifiants des
  forcés **lus un à un sur la page de leur club**.
  151 prénoms neufs dans `PRENOMS_VRAIS`, **dont aucun vide** — pour la quatrième fois de suite ; une
  seule correction de graphie, « J.-F. Douence », que TM écrit sans cédille (**le prénom s'écrit avec
  ses accents**).
  **QUATRE joueurs procéduraux seulement, le meilleur score du chantier à égalité avec 04/05** : Nice
  n'a que **quatre milieux** ayant joué, et Grenoble, Créteil et Istres n'ont qu'**un gardien** chacun.
  La source fait foi, `genJoueur` complète.
  **UN HARNAIS QUI ROUGIT PAR HASARD, DÉCOUVERT CE JOUR-LÀ ET LAISSÉ TEL QUEL** — le troisième cas
  après les deux de 94/95, et il relève du même diagnostic. **`harness-recruteur.cjs`** vérifie en
  section F que chaque carte du recruteur affiche un prénom ; or **`PRENOMS_VRAIS` porte
  `"J. S. Verón":""`**, un prénom volontairement vide, et la consigne auteur de la v1.46 est formelle :
  `""` veut dire **on garde l'initiale, jamais de prénom deviné**. Les deux règles se contredisent, et
  cela ne se voit que lorsque le tirage du vivier pose Verón sur une carte : le harnais échoue environ
  **trois fois sur dix**. **Prouvé non régressif** : `Math.random` remplacé par un générateur à graine
  fixe, les deux versions rendent **exactement le même résultat, le même homme et la même saison**,
  avant comme après l'ajout de 06/07 ; et sur douze lancements de la version d'avant, deux rougissent
  déjà. **C'est l'assertion qui a vieilli, pas le jeu** — la corriger est un travail de moteur, pas de
  saison, et on ne touche pas à une assertion un jour de livraison de données. Validation dédiée :
  **`harness0607.cjs`**.
  **2007-08 (v1.76)** : `STARS_0708`/`STARS_D2_0708`, `D1_0708`/`D2_0708`, `an:2007`, `saison_id/2007` —
  sous le nom **« Les vingt buts de Benzema »**, et c'est désormais la saison la plus RÉCENTE du jeu.
  Lyon prend son **septième titre d'affilée, et le dernier de la série** : soixante-dix-neuf points,
  quatre d'avance sur un Bordeaux de Laurent Blanc qui a mené la danse jusqu'au printemps, le titre
  acquis le dernier soir à l'Abbé-Deschamps. **Karim Benzema, vingt ans, est élu meilleur joueur du
  championnat ET meilleur buteur avec vingt buts** — le seul doublé individuel depuis Pauleta en
  02/03, et le nom de la saison le raconte. **Hatem Ben Arfa est meilleur espoir**, deuxième Lyonnais
  primé de l'année ; **Steve Mandanda meilleur gardien** au Vélodrome sans manquer une minute (4 350) ;
  **Jérôme Leroy meilleur passeur à TRENTE-TROIS ANS** à Rennes, avec dix offrandes ; Laurent Blanc
  meilleur entraîneur. Le Paris SG, **seizième**, sauve sa saison en gagnant la Coupe de la Ligue
  contre Lens, et Lyon le bat en finale de Coupe de France. En Ligue 2, **Guillaume Hoarau plante
  vingt-huit buts**, le plus gros total de la division, et ramène Le Havre dans l'élite ; le FC
  Nantes remonte dans la foulée, un an après la chute que 06/07 racontait. Et à Lille, un Belge de
  seize ans entre en jeu pour la première fois : **Eden Hazard**.
  **LE PLATEAU TOMBE JUSTE TOUT SEUL POUR LA SIXIÈME FOIS DE SUITE** : les deux échelons réels ont
  vingt clubs, donc **aucun repêchage, aucun écarté**, et le harnais vérifie les deux listes par
  égalité comme depuis 02/03. Trois promus (**Metz** champion de Ligue 2, **Caen** et **Strasbourg**),
  trois descendus (**Nantes, Troyes, Sedan**) ; en Ligue 2, trois montées du National (**Clermont**
  champion, **Angers** et Boulogne) pour trois descentes (Créteil, Istres, Tours). Un seul club neuf
  dans `CLUBS_EXTRA` : **Boulogne** (`BLG`, **stade de la Libération**, 8 700 places, **rouge et
  noir**, couleurs vérifiées sur sa fiche Wikipédia, jurisprudence Créteil), monté du National pour
  sa **première saison professionnelle après cent neuf ans d'existence**. **Attention au code** :
  `BOU` est pris depuis 91/92 par le **FC Bourges**, d'où `BLG` — et le harnais garde les deux.
  **Sièges européens — SEPT sièges, tous en Ligue 1** : **Lyon (champion) et MARSEILLE (2e de
  2006-07) en phase de groupes de Ligue des champions, TOULOUSE (3e) au troisième tour de
  qualification, pour la première fois de son histoire** ; en Coupe UEFA **Rennes (4e)**, **Lens** au
  titre de l'**Intertoto 2007** (l'un des onze vainqueurs de l'édition, Hambourg emportant le titre
  général), **Bordeaux** au titre de la Coupe de la Ligue 2007 et **Sochaux** au titre de la Coupe de
  France 2007. `euroC2` est vide pour la huitième fois. **Et le contrôle que le harnais garde joue
  ici DANS LES DEUX SENS, ce qui n'était jamais arrivé** : Nancy (4e) et Saint-Étienne (5e) du
  championnat 2007-08 partent **sans** Europe, parce que les sièges se gagnent l'année d'AVANT ; et
  **TOULOUSE, QUI FINIRA DIX-SEPTIÈME, JOUE BEL ET BIEN LA LIGUE DES CHAMPIONS** — le siège le plus
  invraisemblable que le jeu ait eu à poser, et celui qu'on aurait corrigé à tort en relisant le
  classement de la saison elle-même.
  **`HONNEURS` A APPRIS L'ÉTÉ 2010, le deuxième été que la table ait eu à écrire** après 2008, et
  c'est 07/08 qui le réclame : partir de cette saison fait tomber l'**EURO 2008 dès la PREMIÈRE
  intersaison** (celui de l'Espagne et de la frappe de Torres, les Bleus sortis au premier tour),
  laisse l'**été 2009 muet**, et porte le **MONDIAL 2010** à la **troisième** — l'Espagne sacrée pour
  la première fois, un but d'Iniesta à la 116e minute, et les Bleus qui rentrent de **Knysna** sans
  avoir gagné un match. Comme pour 2008, le harnais vérifie que **ni l'une ni l'autre dépêche ne
  contient « LA FRANCE » en capitales**, que `finDeSaison` lirait comme un triomphe.
  **L'héritage n'a JAMAIS autant porté, et toutes les ancres sont derrière** : **540 des 760 noms
  reprennent leur note 06/07 vieillie d'un an**, 73 viennent de plus loin, **147 seulement sont
  calculés** — le meilleur taux du chantier (81 %). Distribution collée à celle de 06/07 (L1 :
  moyenne 70,3 et médiane 70, contre 70,2 et 70 ; L2 : 67,1 et 67, contre 66,7 et 67).
  Table d'ajustements à la main de **cinquante-huit entrées** : les palmarès de l'année d'abord
  (**Benzema 84/93** — l'héritage seul le laissait à 73 —, **Mandanda 82/90**, **Ben Arfa 78/90**,
  **Hoarau 78/85**, **Jérôme Leroy 74/83**, **Lloris 78/92**), puis les arrivées que le calcul ne
  peut pas connaître — **Fabio Grosso 79/80** (le tireur du dernier penalty de la finale 2006),
  **Petter Hansson 76/78**, **Fernando Cavenaghi 76/85**, **Nenê 75/83**, **Adriano 75/80**,
  **Wendel 75/82**, **Hilton 74/78**, **Ceará 72/77** —, les gamins que rien dans un classement ne
  trahit (**Miralem Pjanić 67/92**, dix-sept ans et **2 839 minutes** dans un Metz dernier ;
  **Moussa Sissoko 66/89**, dix-huit ans à Toulouse ; **Mapou Yanga-Mbiwa 66/88**, dix-huit ans et
  3 571 minutes ; **Gervinho 72/90**, **Gomis 74/87**, **Matuidi 72/87**, **Sakho 64/90**), et
  **cinq corrections EN SENS INVERSE** : **Jean-Alain Boumsong, ancré en 2003 et vieilli QUATRE
  fois, ressortait à 79** pour mille deux cents minutes de remplaçant derrière Cris et Squillaci,
  ramené à **76** ; Dalmat, Frau, Pauleta et Arribagé redescendus eux aussi. **La règle de 06/07
  tient : une ancre lointaine vieillie plusieurs fois dérape beaucoup plus qu'une ancre d'un an.**
  **Forçage de vingt-trois pépites**, et la première de toutes vaut la journée : **EDEN HAZARD,
  SEIZE ANS ET TRENTE-TROIS MINUTES AU LOSC** — son premier match professionnel, le troisième
  seizième anniversaire du jeu après Didier Domi (94/95) et Mamadou Sakho (06/07), et **le plus haut
  potentiel du plateau (94)**. Avec lui **Pierre-Baptiste Baherlé, seize ans à Boulogne en Ligue 2**,
  ce qui donne **DEUX hommes de seize ans dans la même saison, une première** ; **Henri Saivet**
  (dix-sept ans, douze minutes à Bordeaux), **Abdelhamid El Kaoutari** (dix-sept ans, Montpellier),
  **Alfred N'Diaye** (dix-sept ans, Nancy), **Morgan Schneiderlin** (dix-huit ans, reconduit pour la
  troisième saison), **Cédric Mongongu**, **Medhi Benatia** (quatre-vingt-dix minutes, un seul match,
  et le Bayern au bout), **Loïc Rémy**, **Razak Boukari**, **Papiss Cissé**, **Kévin Constant**,
  **Bakary Sako**, **Gaëtan Bong**, **Bakary Koné**, **Grégory Borne**, **Jirès Kembo Ekoko**,
  **William Vainqueur**, **Mahamane Traoré**, **Lucas Deaux**, **Boukary Dramé**, **Jaroslav Plašil**
  et **Alain Traoré, gardé pour TROIS MINUTES** — la borne basse de l'année. **Lens, Rennes et Monaco
  paient DEUX hommes chacun, Châteauroux en paie TROIS.**
  **LE PIÈGE DU JOUR EST NEUF, ET IL EST GRAVE : DEUX HOMMES NÉS LA MÊME ANNÉE PEUVENT SE DISPUTER
  UNE SEULE ANCRE, ET LES MINUTES TRANCHENT À L'ENVERS.** « A. Traoré » est au milieu d'Auxerre que
  le jeu porte depuis 06/07 — **Alain**, né en 1988, trois minutes en 2007-08. Mais **Abdou Traoré**
  est né la même année, joue à Bordeaux, et avait soixante et onze minutes : l'arbitrage « le plus
  utilisé garde le nom » lui donnait **le nom ET la note** d'Alain, et **les deux hommes héritaient
  de la même ancre**. La règle à garder : **quand plusieurs hommes concordent avec une seule ancre,
  c'est le CLUB DE L'ANCRE qui tranche, pas les minutes**, et le perdant perd le nom ET l'héritage.
  D'où une vérification générale ajoutée au relevé — **aucune ancre ne doit servir deux fois**, et
  elle sort à zéro. Le symptôme aurait été parfaitement invisible.
  **Deuxième correctif de méthode, du même tonneau : l'ancre doit se chercher AUSSI sous le nom
  FINAL**, après le repli en toutes lettres. Sans cela, les hommes que le jeu porte en toutes lettres
  perdaient leur héritage en silence — **Benoît Cheyrou (3 798 minutes), André Luiz (3 627), Sidi
  Keita, Momar N'Diaye, Bakary Koné, Moké Diarra, Jérémy Acédo** et une douzaine d'autres repartaient
  sur une note recalculée. La correction fait passer l'héritage de **613 à 615 appariements directs**
  et surtout remet les bonnes notes sur les bons hommes.
  **Deux mononymes brésiliens qu'il a fallu descendre au NOM CIVIL** (jurisprudence Cristiano 04/05,
  Adailton Santos 05/06), les deux identités tranchées **par identifiant Transfermarkt** : **«
  Eduardo » est au Toulousain né en 1979** (id 6802, vérifié sur la page de Toulouse 2003-04), donc
  le Guingampais né en 1980 (id 3890) s'écrit **« Eduardo Ribeiro »** ; et **« Henrique » reste au
  Girondin né en 1983** que le jeu porte depuis 05/06, donc le Rémois né en 1982 s'écrit **«
  Henrique Gomes »** — un an d'écart, deux hommes. Les formes du jeu tiennent par ailleurs :
  **Cris garde « Cristiano »** depuis 04/05 et **Juninho Pernambucano garde « Juninho »** depuis
  01/02, l'une et l'autre posées à la main parce que la source ne les écrit pas comme ça.
  **Quatorze homonymes de registre au plateau**, dont **trois paires qui jouent en France la MÊME
  année** et cohabitent (Bruno Cheyrou face à Benoît, **Rudy Riou face à Rémy**, Bakari Koné face à
  Bakary), et **quatre noms courts qui doivent rester ABSENTS** parce que leur porteur ne joue plus
  en France cette année-là — Seydou Keita est à Séville, Antar Yahia à Bochum : « S. Keita », «
  M. N'Diaye », « A. Luiz » et « C. Sánchez » n'apparaissent nulle part, et Sidi, Momar, André Luiz
  et Carlos Sánchez passent en toutes lettres. **C'est ce contrôle-là que le harnais garde**, parce
  qu'un nom court qui réapparaît est le signe qu'un homme a pris celui d'un autre.
  **Un forcé ne doit pas contredire le recruteur** (règle de 05/06) : le croisement de
  `VIVIER_SAISON[2007]` — déjà écrit par la v1.70 — et des quarante effectifs rend **aucun nom en
  commun**.
  **La source est la plus généreuse du chantier, pour la troisième fois de suite** : **aucun club
  sous vingt-deux hommes ayant joué** (Angers ferme la marche à vingt-deux), **aucun joueur que la
  source ne sache dater, aucun libellé de poste inconnu**, et **quatre-vingts pages aspirées sans un
  seul échec ni un seul anti-robot** (troisième fois de suite). **Mille quatre-vingt-six hommes ont
  joué** pour sept cent soixante places ; **quarante-cinq listés dans deux clubs** sont allés là où
  ils ont le plus joué, dédoublonnés **par identifiant Transfermarkt**, et les quarante identifiants
  de clubs ont été **relevés sur les pages `wettbewerb/FR1` et `FR2` de la saison** (leçon de
  01/02). La sentinelle de fin a été vérifiée des deux côtés — **vingt derniers de tableau ont leur
  place dans un effectif**, dont **Marouane Chamakh et ses 2 692 minutes** chez les Girondins.
  131 prénoms neufs dans `PRENOMS_VRAIS`, **dont aucun vide** — pour la cinquième fois de suite ;
  une seule correction de graphie, « P. Baherlé », que TM écrit avec un **trait d'union insécable**
  (U+2011) qui n'a rien à faire dans le jeu.
  **TROIS joueurs procéduraux seulement, le meilleur score du chantier après les deux de 05/06** :
  Sochaux et Angers n'ont qu'**un gardien** ayant joué, Saint-Étienne que **quatre milieux**. La
  source fait foi, `genJoueur` complète.
  **Le rougissement aléatoire de `harness-recruteur.cjs` est toujours là, et toujours le même** : sa
  section F exige un prénom sur chaque carte alors que `PRENOMS_VRAIS` porte `"J. S. Verón":""`, un
  prénom volontairement vide (consigne v1.46). Quatre lancements sur douze rougissent. **Prouvé non
  régressif à graine fixe** : à `Math.random` remplacé par une suite déterministe de graine 10, la
  v1.75 et la v1.76 rendent **le même échec sur le même homme**. Aucune assertion n'a été touchée.
  Validation dédiée : **`harness0708.cjs`**.
  Pour ajouter 07/08 : même méthode avec `saison_id/2007`, entrée `"2007-08"` dans `SAISONS`, harnais
  calqué sur `harness0607.cjs`. Le plateau ne bouge plus (vingt et vingt depuis 02/03), donc **plus de
  repêchage à arbitrer** : la journée va entièrement aux hommes. `HONNEURS` connaît désormais 1992 →
  2008 ; **2010** (Mondial en Afrique du Sud, l'Espagne — et pour la France, Knysna) sera le prochain
  été à écrire, et **08/09 est la première saison qui le réclamera**, à sa deuxième intersaison.
  **2008-09 (v1.77)** : `STARS_0809`/`STARS_D2_0809`, `D1_0809`/`D2_0809`, `an:2008`, `saison_id/2008` —
  sous le nom **« Gourcuff fait tomber Lyon »**, et c'est désormais la saison la plus RÉCENTE du
  jeu. **Le huitième titre d'affilée de l'Olympique lyonnais n'arrive jamais** : les Girondins de
  Bordeaux de Laurent Blanc prennent le championnat avec **quatre-vingts points**, trois de plus
  que Marseille, et sept de plus qu'un Lyon qui finit troisième — la série de sept que 01/02
  ouvrait s'arrête là. **Yoann Gourcuff est élu meilleur joueur**, la saison de sa vie à vingt-deux
  ans ; **André-Pierre Gignac meilleur buteur avec vingt-quatre buts** à Toulouse ; **Hugo Lloris
  meilleur gardien**, arrivé de Nice à Gerland l'été d'avant ; **Eric Gerets meilleur entraîneur**
  d'un Marseille deuxième ; et **Eden Hazard, dix-sept ans, est meilleur espoir** — celui qui
  entrait en jeu trente-trois minutes en 07/08 joue mille six cent quatre-vingt-dix-huit minutes
  cette année-là. Caen, Nantes et Le Havre descendent, les Normands après une seule saison. En
  Ligue 2, Lens remonte aussitôt avec Montpellier et Boulogne, **Guingamp va chercher la Coupe de
  France depuis la deuxième division** (deux buts d'**Eduardo**, l'homme même dont 07/08 avait dû
  trancher le nom), et **Vannes, monté du National, perd la finale de la Coupe de la Ligue** au
  Stade de France.
  **LE PLATEAU TOMBE JUSTE TOUT SEUL POUR LA SEPTIÈME FOIS DE SUITE** : les deux échelons réels ont
  vingt clubs, donc **aucun repêchage, aucun écarté**, et le harnais vérifie les deux listes par
  égalité comme depuis 02/03. Trois promus (**Le Havre** champion de Ligue 2, **Nantes** et
  **Grenoble**), trois descendus (**Lens, Metz, Strasbourg**) ; en Ligue 2, trois montées du
  National (**Vannes** champion, **Tours** et **Nîmes**) pour trois descentes (Niort, Libourne,
  Gueugnon). Un seul club neuf dans `CLUBS_EXTRA` : **Vannes OC** (`VNS`, **stade de la Rabine**,
  7 500 places, **blanc et noir**, couleurs vérifiées — le club a porté le jaune et vert à sa
  naissance en 1998 et n'est passé au blanc et noir qu'en 2003-04, jurisprudence Créteil), monté du
  National pour sa **première saison professionnelle, dix ans après sa création**. **Attention au
  code, comme `BOU`/`BLG` en 07/08** : `VAN` est pris depuis 90/91 par **Valenciennes**, qui joue
  justement la Ligue 1 cette année-là — d'où `VNS`, et le harnais garde les deux clubs au même
  plateau. Le blason de Vannes est en chevron pour ne pas se confondre avec celui d'Angers, noir et
  blanc à rayures depuis 90/91.
  **Sièges européens — SEPT sièges, tous en Ligue 1 pour la quatrième fois de suite** : **Lyon
  (champion) et BORDEAUX (2e de 2007-08) en phase de groupes de Ligue des champions, MARSEILLE
  (3e) au troisième tour de qualification** ; en Coupe UEFA **Nancy (4e)**, **SAINT-ÉTIENNE (5e)**
  — la place de la Coupe de France lui est revenue, Lyon l'ayant gagnée mais étant déjà en C1 —,
  le **Paris SG** au titre de la **Coupe de la Ligue 2008** et **Rennes**, vainqueur de son barrage
  d'**INTERTOTO 2008**, la **dernière édition** de la compétition. `euroC2` est vide pour la
  neuvième fois. **Et le contrôle des deux sens trouve son pendant exact au Toulouse de 07/08** :
  Toulouse (4e) et Lille (5e) du championnat 2008-09 partent **sans** Europe, tandis que
  **SAINT-ÉTIENNE, QUI FINIRA DIX-SEPTIÈME, JOUE BEL ET BIEN LA COUPE UEFA** — et il ira jusqu'aux
  huitièmes. Vérifié plutôt que supposé : **Guingamp gagne la Coupe de France en mai 2009, donc son
  siège est pour 2009-10 et non pour cette saison.**
  **`HONNEURS` n'a rien eu à apprendre, pour la première fois depuis 05/06** : la table connaissait
  déjà 2010 depuis 07/08, et c'est 08/09 qui le réclamait en premier. Partir de cette saison laisse
  l'**été 2009 MUET** (septième cas) — l'Euro 2008 s'est joué **avant** le coup d'envoi — et porte
  le **MONDIAL 2010** à la **deuxième** intersaison, Knysna comprise et sans « LA FRANCE » en
  capitales.
  **L'héritage porte presque autant qu'en 07/08, et toutes les ancres sont derrière** : **520 des
  760 noms reprennent leur note 07/08 vieillie d'un an**, 69 viennent de plus loin, **171 sont
  calculés** — 77 %, contre 81 % l'an dernier, et la baisse a une cause honnête : le mercato de
  l'été 2008 a été large, et les arrivées de l'étranger n'ont pas d'ancre. Distribution collée à
  celle de 07/08 (L1 : moyenne 70,5 et médiane 70, contre 70,3 et 70 ; L2 : 67,6 et 68, contre 67,1
  et 67).
  Table d'ajustements à la main de **cent entrées, la plus grosse du chantier** : les palmarès de
  l'année d'abord (**Gourcuff 84/91** — l'héritage seul le laissait à 75, avec une ancre rennaise de
  2005 —, **Lloris 82/92**, **Gignac 80/88**, **Hazard 71/95**, **Benzema 85/93**, le mieux noté du
  plateau pour sa dernière saison française, **Bastos 78/86**), puis les arrivées que le calcul ne
  peut pas connaître — **Carlos Bocanegra 75/79** (le capitaine des États-Unis, et il marquera pour
  Rennes en finale de Coupe de France), **Chu-young Park 75/83**, **Dario Simic 74/78** (ex-Milan),
  **Mateja Kežman 74/77**, **César Delgado 76/79**, **Diego Placente 74/77**, **Brandão 75/79**,
  **Ivan Klasnic 72/76**, **Róbert Vittek 73/78**, **Tino Costa 74/84** —, et les gamins que rien
  dans un classement ne trahit : **Pierre-Emerick Aubameyang 70/93** (dix-neuf ans, prêté par le
  Milan AC à Dijon), **Nicolas N'Koulou 72/94** (dix-huit ans et 2 188 minutes à Monaco),
  **Steven Nzonzi 67/90** (vingt ans à Amiens, champion du monde dix ans plus tard), **Étienne
  Capoue 74/92**, **David Ospina 72/90**, **Marvin Martin 70/89**, **Benjamin André 67/89**,
  **Wahbi Khazri 68/90**, **Moussa Sissoko 71/89**, **Mapou Yanga-Mbiwa 70/89**, **Medhi Benatia
  69/89**. Et **une correction en sens inverse** : **Ludovic Giuly, ancré à Monaco en 2003 et
  vieilli CINQ fois, ressortait trop haut** pour une saison de trente-deux ans au Parc — la règle
  de 06/07 tient saison après saison, une ancre lointaine dérape beaucoup plus qu'une ancre d'un an.
  **Forçage de vingt-quatre pépites, et la récolte d'adolescents est sans précédent : NEUF hommes de
  dix-sept ans ou moins au plateau**, contre deux en 07/08. **SEGA KEÏTA, SEIZE ANS ET TRENTE ET UNE
  MINUTES À TROYES** ouvre la liste — le quatrième seizième anniversaire du jeu après Didier Domi
  (94/95), Mamadou Sakho (06/07) et Eden Hazard (07/08) — et sept dix-sept ans le suivent :
  **Timothée Kolodziejczak** et **Yannis Salibur**, **Rajiv van La Parra**, **Abdelhakim Omrani**,
  **Loïc Damour**, **Johan Martial**, plus Hazard et **Wahbi Khazri** que le temps de jeu suffisait
  à garder. Avec eux **Miralem Pjanić** (dix-huit ans, passé de Metz à Lyon), **JOSUHA GUILAVOGUI,
  GARDÉ POUR UNE MINUTE** à Saint-Étienne — la borne basse du chantier, sous les trois minutes
  d'Alain Traoré en 07/08 —, **Henri Saivet** (cinq minutes), **Grégory Sertic**, **Abdelhamid El
  Kaoutari** (reconduit pour la troisième saison), **Kévin Théophile-Catherine**, **Franck
  Tabanou**, **Jean-Armel Kana-Biyik**, **Fallou Diagne**, **Jonathan Kodjia**, **Tongo Doumbia**
  (cinq minutes), **Delvin N'Dinga**, **Yohan M'Vila**, **Guillaume Borne**, **Steven Mouyokolo**,
  **Youssouf Mulumbu** et **Sidi Keita**. **Lyon, Bordeaux et Lens paient DEUX hommes chacun.**
  **LE PIÈGE DU JOUR EST TOMBÉ AVANT MÊME LE RELEVÉ, ET IL ÉTAIT GRAVE : « OM » EST UN CODE DE CLUB
  À DEUX LETTRES.** Le script qui relit les tables du jeu pour en tirer les ancres découpait les
  blocs de club sur une expression `[A-Z]{3}`, si bien que **les vingt Marseillais partaient chez
  Bordeaux** — vingt ancres attribuées au mauvais club, et la règle « c'est le club de l'ancre qui
  tranche » faussée en silence. Le symptôme visible était minuscule : dix-neuf clubs lus au lieu de
  vingt. **À garder : `OM` est le seul code à deux lettres du jeu, et tout découpage par code de
  club doit l'accepter.** La correction a aussi rendu 95 entrées d'ancres perdues ailleurs.
  **Deuxième piège, celui de Ben Arfa qui se rejoue deux fois** : forcer un gamin éjecte un homme
  qu'on voulait garder. Le forçage de deux dix-sept ans à Lyon sortait **Miralem Pjanić et ses 924
  minutes** ; celui de deux jeunes à Lens sortait **Sidi Keita et ses 1 253 minutes**, un homme que
  le jeu porte depuis 03/04. **Le contrôle à reconduire : lister, club par club, les écartés de plus
  de neuf cents minutes et regarder en face ce que chaque forçage coûte.** Nolan Roux (39 minutes)
  et Freddy Adu (159) sont sortis de la liste pour cette raison — Adu laissant revenir **Adriano**,
  que le jeu porte depuis 07/08 pour 1 258 minutes.
  **Troisième piège, et c'est le recruteur qui l'a attrapé** : **Jérémy Ménez**, cent seize minutes
  au Rocher, figurait dans `VIVIER_SAISON[2008]` — il est parti à la Roma à l'été 2008, et les
  vitrines ont raison contre la page de temps de jeu. Il reste dehors, exactement comme Christian
  Vieri en 05/06. **La règle de 05/06 ne se contente pas d'être vraie : elle attrape des choses.**
  **Le piège de 07/08 se rejoue aussi, et le remède a dû être précisé** : deux hommes nés la même
  année se disputent l'ancre **« A. Traoré »**. Alain, que le jeu porte depuis 06/07, **a changé de
  club** (Auxerre → Brest) ; Abdou, né la même année, joue à Bordeaux. La règle de 07/08 disait « le
  club de l'ancre tranche » — elle ne suffit plus dès que l'homme déménage. **La formulation à
  garder : c'est l'HOMME de l'ancre qui la garde, identifié par son identifiant Transfermarkt, et le
  club de l'ancre n'est qu'un indice.** Alain garde « A. Traoré » à Brest ; Abdou, écarté au temps
  de jeu, n'est pas au plateau.
  **Cinq paires d'homonymes cohabitent**, dont trois reconduites de 07/08 (Bruno face à Benoît
  Cheyrou, Rudy face à Rémy Riou, Bakari face à Bakary Koné) et **deux neuves** : Abdul Kader Keita
  face à **Alphousseyni Keita**, et surtout **Marvin Martin face à Malaury Martin, nés la MÊME année
  et tous deux inconnus du registre** — aucune ancre, aucun garde-fou d'âge pour trancher, donc
  c'est le temps de jeu qui décide (1 811 minutes à Sochaux contre Nîmes). **Cinq noms courts
  doivent rester ABSENTS** parce que leur porteur ne joue plus en France : Marcos Paulo, Youssouf
  Touré, Maodomalick Faye, Hassoun Camara et Leyti N'Diaye passent en toutes lettres, et les cinq
  cessions de 07/08 sont reconduites.
  **Deux noms posés à la main que la source écrit autrement** : **Sega Keïta s'écrit en toutes
  lettres**, parce que « S. Keita » est à Seydou depuis 00/01 et que **le tréma ne se voit pas** —
  deux chaînes différentes pour l'œil du moteur, un seul nom pour celui du joueur, et c'est la
  première fois que le chantier cède un nom court sur une différence d'accent seule. Et **« El
  Fardou Ben » garde son nom entier** : découper son prénom au premier mot fabriquait « E. Fardou
  Ben », un nom qui n'existe pas.
  **La source est la plus généreuse du chantier pour la quatrième fois de suite** : **aucun club
  sous vingt-trois hommes ayant joué** (Toulouse, Amiens et Boulogne ferment la marche à
  vingt-trois), **aucun libellé de poste inconnu** après l'ajout de « Deuxième attaquant » et
  « Défense », **quatre-vingts pages aspirées sans un seul échec ni un seul anti-robot**, et
  **deux joueurs seulement que la source ne sache pas dater** — Moussa Sissoko et Pierre-Emerick
  Aubameyang, tous deux nés en 1989, vérifiés pièce en main. **Mille cent trente-huit hommes ont
  joué** pour sept cent soixante places ; **quarante-deux listés dans deux clubs** sont allés là où
  ils ont le plus joué, dédoublonnés **par identifiant Transfermarkt**, et les quarante identifiants
  de clubs ont été **relevés sur les pages `wettbewerb/FR1` et `FR2` de la saison** (leçon de
  01/02). La sentinelle de fin a été vérifiée des deux côtés — **six derniers de tableau ont leur
  place dans un effectif**, et le plus cher de tous est **Pierre-Emerick Aubameyang, dernière ligne
  du tableau dijonnais, 2 484 minutes** ; **Moussa Sissoko et ses 2 761 minutes** fermaient celui de
  Toulouse.
  **NEUF vétérans de 36 ans et plus, un record**, dont **cinq gardiens titulaires** ; et le doyen du
  jeu est le même que l'an dernier, **Gilles Wimbée, TRENTE-SEPT ANS**, qui garde les buts de
  Grenoble en Ligue 1 après l'y avoir fait monter — et le promu aligne DEUX de ces neuf vétérans à
  lui seul, Michaël Flachez tenant la défense à trente-six ans.
  156 prénoms neufs dans `PRENOMS_VRAIS`, **dont aucun vide** — pour la sixième fois de suite ; le
  découpage des **initiales composées** doit suivre exactement celui de `harness-prenoms.cjs`
  (`split(/\.-?/)`), sans quoi Jean-Jacques Gosso, Jean-Armel Kana-Biyik, Jean-Philippe Sabo,
  Jean-Alain Fanchone et Pierre-Emerick Aubameyang ressortaient **sans prénom** pour une raison
  purement typographique.
  **AUCUN joueur procédural : les quarante effectifs tiennent entièrement sur de vrais noms, et
  c'est une première du chantier.**
  **Le rougissement aléatoire de `harness-recruteur.cjs` est toujours là, et toujours le même** : sa
  section F exige un prénom sur chaque carte alors que `PRENOMS_VRAIS` porte `"J. S. Verón":""`, un
  prénom volontairement vide (consigne v1.46). Quatre lancements sur douze rougissent, comme en
  07/08. **Prouvé non régressif à graine fixe** : à `Math.random` remplacé par une suite
  déterministe de graine 10, la v1.76 et la v1.77 rendent **le même échec sur le même homme**.
  Aucune assertion n'a été touchée.
  **ET IL Y EN A UN DEUXIÈME, DÉCOUVERT CETTE NUIT : `harness-effectif.cjs` rougit environ une fois
  sur douze**, sur une assertion **statistique** du moteur — « les vétérans de 33 ans déclinent moins
  avec un coach que sans » —, dont les deux comptages se croisent quand le tirage est serré (12
  déclins contre 13). Le harnais **ne mentionne 08/09 nulle part**, le taux est **identique sur les
  deux versions** (une fois sur douze de part et d'autre), et c'est **prouvé non régressif à graine
  fixe** : à graine 4, la v1.76 et la v1.77 rendent **le même échec avec les mêmes chiffres**, et
  aux graines 3, 7, 11 et 21 les deux sont vertes. Aucune assertion n'a été touchée. **À garder pour
  les saisons suivantes : deux harnais rougissent désormais par hasard, et la parade est la même —
  comparer à graine fixe avant de conclure quoi que ce soit.**
  Validation dédiée : **`harness0809.cjs`**.
  Pour ajouter 09/10 : même méthode avec `saison_id/2009`, entrée `"2009-10"` dans `SAISONS`,
  harnais calqué sur `harness0809.cjs`. Le plateau ne bouge plus (vingt et vingt depuis 02/03). Deux
  choses à préparer : la Coupe UEFA devient la **LIGUE EUROPA** à l'été 2009 et passe à des barrages
  (l'appeler par son nom d'époque dans le sous-titre sans toucher aux libellés du moteur, comme la
  Ligue 1 en 02/03), et **`HONNEURS` devra apprendre l'été 2012** (Euro en Pologne et en Ukraine,
  l'Espagne encore) si l'on veut qu'une carrière de 09/10 ne traverse pas un été vide à sa troisième
  intersaison.
  **2009-10 (v1.79)** : `STARS_0910`/`STARS_D2_0910`, `D1_0910`/`D2_0910`, `an:2009`,
  `saison_id/2009` — sous le nom **« Le doublé de Deschamps »**, et c'est désormais la saison la plus
  RÉCENTE du jeu. **L'Olympique de Marseille reprend le titre après DIX-HUIT ANS** : soixante-dix-huit
  points, six d'avance sur Lyon, et **le doublé**, puisque Didier Deschamps ramène aussi la Coupe de la
  Ligue au Vélodrome — lui qui portait le brassard du dernier sacre, celui de 1992-93 que le jeu
  raconte déjà sous « Le sacre et le soupçon ». **Mamadou Niang est meilleur buteur avec dix-huit
  buts** et son retourné contre Lyon est élu **but de l'année** ; **Lisandro López**, arrivé de Porto
  pour vingt-quatre millions, est **meilleur joueur** ; **Hugo Lloris meilleur gardien pour la
  deuxième année de suite** et **Eden Hazard meilleur espoir pour la deuxième année aussi** ;
  **Jean Fernandez meilleur entraîneur** d'un Auxerre troisième ; et **Claude Makélélé reçoit le
  trophée d'honneur** à trente-six ans, au milieu de terrain du Parc. Le Paris SG, treizième, sauve
  son printemps en gagnant la Coupe de France contre Monaco. Le Mans, Boulogne et Grenoble descendent.
  En Ligue 2, **Olivier Giroud plante vingt et un buts pour Tours et finit meilleur joueur ET meilleur
  buteur de la division** — le troisième doublé individuel du chantier après Pauleta en 02/03 et
  Benzema en 07/08, et le jeu le porte depuis 05/06, où il entrait cent quatorze minutes à Grenoble ;
  Caen et Brest remontent (**Brest retrouve l'élite dix-neuf ans après la rétrogradation
  administrative que 91/92 raconte**), et Arles-Avignon, monté du National, se hisse troisième.
  **LE PLATEAU TOMBE JUSTE TOUT SEUL POUR LA HUITIÈME FOIS DE SUITE** : les deux échelons réels ont
  vingt clubs, donc **aucun repêchage, aucun écarté**, et le harnais vérifie les deux listes par
  égalité comme depuis 02/03. Trois promus (**Lens** champion de Ligue 2, **Montpellier** et
  **Boulogne**), trois descendus (**Caen, Nantes, Le Havre**) ; en Ligue 2, trois montées du National
  (**Arles-Avignon** champion, **Laval** et **Istres**) pour trois descentes (Amiens, Troyes, Reims).
  Un seul club neuf dans `CLUBS_EXTRA` : **AC Arles-Avignon** (`ARL`, **Parc des Sports d'Avignon**,
  17 500 places, **bleu et jaune** — « azur et or » —, couleurs vérifiées, jurisprudence Créteil), né
  de la fusion de l'Athlétic Club arlésien et du football avignonnais à l'été 2009 et monté du
  National. Deux détails de ce club valent d'être gardés : **il joue à trente kilomètres de la ville
  dont il porte le nom**, parce qu'Arles n'avait pas de stade aux normes professionnelles, ce que dit
  sa malédiction ; et **Créteil porte déjà le bleu et jaune depuis 99/00**, d'où un motif de blason
  différent, ce que le harnais vérifie nommément.
  **Sièges européens — SIX sièges seulement, la plus petite délégation depuis 02/03, ET LE SIXIÈME
  EST EN LIGUE 2** : **Bordeaux (champion 2008-09) et MARSEILLE (2e) en phase de groupes de Ligue des
  champions, LYON (3e) au barrage** ; en **Ligue Europa** — la Coupe UEFA a changé de nom à l'été
  2009, ce que le sous-titre dit par son nom d'époque sans toucher aux libellés du moteur, comme la
  Ligue 1 en 02/03 — **Toulouse (4e)**, **Lille (5e)** et **GUINGAMP, vainqueur de la Coupe de France
  2009 ALORS QU'IL JOUAIT DÉJÀ LA LIGUE 2**, et qui la joue encore cette année-là : c'est le premier
  siège de deuxième division depuis Châteauroux en 04/05, et il ira perdre ses deux matchs contre
  Hambourg. `euroC2` est vide pour la dixième fois. **Et le contrôle des deux sens trouve son plus
  beau cas** : **AUXERRE, QUI FINIRA TROISIÈME, ET MONTPELLIER, CINQUIÈME, PARTENT SANS EUROPE** —
  ils étaient quatorzième et huitième l'année d'avant — tandis qu'un club de Ligue 2 joue la coupe
  d'Europe. Vérifié plutôt que supposé : Bordeaux a gagné la Coupe de la Ligue 2009 en plus du
  championnat, si bien que **ce siège-là est redescendu au classement** et non à un vainqueur de coupe.
  **`HONNEURS` A APPRIS L'ÉTÉ 2012**, le troisième été que la table ait eu à écrire depuis l'ouverture
  du chantier, après 2008 (écrit par 06/07) et 2010 (écrit par 07/08) : l'Espagne conserve son titre
  et en met quatre à l'Italie à Kiev, et les Bleus sortent en quarts contre ce même adversaire — sans
  « LA FRANCE » en capitales, que `finDeSaison` lit comme un triomphe. Partir de 09/10 fait tomber le
  **MONDIAL 2010 dès la PREMIÈRE intersaison** (Knysna comprise), laisse l'**été 2011 MUET** (huitième
  cas) et porte l'**EURO 2012 à la TROISIÈME**.
  **L'héritage porte comme en 07/08, son meilleur niveau** : **529 des 760 noms reprennent leur note
  08/09 vieillie d'un an**, 88 viennent de plus loin, **143 sont calculés** — 81 %, le taux de 07/08
  retrouvé. Distribution collée à celle de 08/09 (L1 : moyenne 70,5 et médiane 70, comme l'an
  dernier ; L2 : 67,3 et 68, contre 67,6 et 68). Le mieux noté du plateau est **Yoann Gourcuff à 85**,
  sa dernière saison bordelaise avant les vingt-deux millions de Lyon.
  Table d'ajustements à la main de **soixante-dix-huit entrées** : les palmarès de l'année d'abord
  (**Lisandro López 84/88** — le calcul seul le laissait à 77, aucune ancre ne le connaissait —,
  **Niang 82/84**, **Lloris 84/92**, **Hazard 79/95**, **Giroud 76/86**, que l'héritage seul laissait
  à **64**, **Steeve Elana 72/75**, meilleur gardien de Ligue 2, **Makélélé 74/90**), puis les
  arrivées que le calcul ne peut pas connaître — **Lucho González 81/84** (meilleur passeur, dix-neuf
  millions de Porto), **Gabriel Heinze 78/86** (du Real Madrid), **Emir Spahic 77/80**, **Gelson
  Fernandes 71/79**, **Gonzalo Bergessio 71/75**, **Eduardo Ribeiro 71/76** —, les hausses que le
  temps a confirmées (**Koscielny 77/85**, signé par Arsenal l'été suivant, **Gyan 76/82**, vedette du
  Mondial 2010, **Gervinho 78/90**, **Rami 76/85**, **Debuchy 75/85**, **Nenê 78/83**), et les gamins
  que rien dans un classement ne trahit : **Alexandre Lacazette 63/93**, **Dejan Lovren 69/91**,
  **Maxime Gonalons 70/90**, **Serge Aurier 62/90**, **Yann M'Vila 74/90**, **Yacine Brahimi 67/90**,
  **Idrissa Gueye 66/90**, **Sébastien Corchia 70/90**, **Giannelli Imbula 58/89**, **Younès Belhanda
  68/88**, **Yaya Sanogo 60/88**, **Saphir Taïder 58/87**, **Andy Delort 60/87**, **Bryan Dabo 59/86**,
  **Florian Lejeune 61/86**, **Gueïda Fofana 63/86**.
  **TROIS CORRECTIONS EN SENS INVERSE, ET L'UNE VA DANS L'AUTRE SENS QUE LES DEUX AUTRES** : la règle
  de 06/07 sur les ancres lointaines se reconduit pour la quatrième saison — **Fernando Morientes**,
  ancré à Monaco en 2003 et vieilli six fois, ressortait trop haut pour six cent vingt et une minutes
  à trente-trois ans, et **Ludovic Giuly** a dû être retenu une seconde fois. **Mais Aly Cissokho
  montre que l'ancre lointaine se trompe dans les DEUX directions** : ancré à Gueugnon en 2007, il
  revient de Porto pour quinze millions et joue 4 206 minutes à Lyon — l'héritage seul le sortait à
  **63**, soit aussi faux que les 88 de Djibril Cissé en 06/07, mais par le bas. **La formulation à
  garder : une ancre de plus de deux ans n'est pas trop haute, elle est juste fausse, et il faut la
  regarder dans les deux sens.**
  **Dix-huit pépites forcées seulement, le plus petit forçage depuis 04/05, ET C'EST UN CHOIX** : le
  contrôle de 08/09 — « lister, club par club, les écartés de plus de neuf cents minutes et regarder
  en face ce que chaque forçage coûte » — a fait sortir quinze noms d'une première liste de
  trente-trois. **Il a payé trois fois** : forcer deux Lyonnais de plus coûtait **Ederson et ses 1 681
  minutes puis Mathieu Bodmer et ses 1 131**, deux hommes que le jeu porte depuis des années ; forcer
  Diafra Sakho et Fallou Diagne à Metz coûtait **SYLVAIN WILTORD, champion du monde 1998**, et
  **Frechaut et ses 1 718 minutes** ; et forcer Loïc Nego à Nantes coûtait **Papy Djilobodji**, futur
  Chelsea, c'est-à-dire la carrière plus grosse des deux. **Trois autres renoncements du même ordre** :
  **El Fardou Ben laissait sortir Ryan Mendes** (dix-neuf ans, cinquante sélections cap-verdiennes),
  **Loïc Damour laissait sortir Yacine Bezzaz** (1 062 minutes, international algérien) et **Paul Lasne
  laissait sortir Marc Giraudon** (1 193 minutes). **La règle à garder, et elle est plus sévère que
  celle de 08/09 : un forçage ne se juge pas sur la carrière du forcé, mais sur la différence entre sa
  carrière et celle de l'homme qu'il sort.** Restent **Alexandre Lacazette, dix-huit ans et DOUZE
  MINUTES à Gerland** (son premier match professionnel), **YAYA SANOGO, SEIZE ANS ET QUINZE MINUTES À
  AUXERRE** — le cinquième seizième anniversaire du jeu après Didier Domi (94/95), Mamadou Sakho
  (06/07), Eden Hazard (07/08) et Sega Keïta (08/09) —, **Bryan Dabo gardé pour SIX MINUTES** à
  Montpellier, Jordan Ayew, Idrissa Gueye, Henri Saivet, Josuha Guilavogui, Saphir Taïder, Sofiane
  Feghouli, Kévin Théophile-Catherine, Tongo Doumbia, Alain Traoré, Rajiv van La Parra, Mathias
  Autret, Vincent Manceau, Giannelli Imbula, Andy Delort et Florian Lejeune. **Grenoble, Rennes et
  Auxerre paient deux hommes chacun.** Et **sept hommes de dix-sept ans ou moins** sont au plateau,
  contre neuf en 08/09 — dont **Serge Aurier, dix-sept ans et 547 minutes à Lens, qui passe au temps
  de jeu tout seul**, et Darnel Situ dans le même vestiaire.
  **LE PIÈGE DU JOUR EST DOUBLE ET IL TIENT EN UNE PHRASE : LES FORMES DU JEU PASSENT AVANT CELLES DE
  LA SOURCE, MÊME QUAND LA SOURCE SERT UN MONONYME.** Transfermarkt écrit **« Cris »** pour le
  défenseur central de Lyon et **« Eduardo »** pour l'attaquant de Lens, deux noms d'un seul mot que
  le dédoublonnage traitait comme des mononymes brésiliens authentiques. Or le jeu réserve « Cris » à
  l'Angevin de 03/04 et « Eduardo » au Toulousain de 03/04 : le Lyonnais s'appelle **« Cristiano »**
  depuis 04/05, et le Lensois est **EDUARDO RIBEIRO DOS SANTOS**, celui même qui a marqué les deux
  buts de la Coupe de France 2009 pour Guingamp, que le jeu écrit **« Eduardo Ribeiro »** depuis 07/08
  et qui déménage à Lens à l'été 2009. Pris pour des mononymes, les deux perdaient leur ancre et
  recevaient une note recalculée. **Le contrôle à reconduire : pour chaque mononyme du relevé,
  chercher dans les tables du jeu un homme NÉ LA MÊME ANNÉE dont le nom commence par ce mot.** C'est
  ainsi que les deux ont été attrapés, et aucun autre des vingt-cinq mononymes de la saison n'était
  concerné.
  **Deuxième piège, un défaut de relevé neuf : Transfermarkt écrit parfois « N/A (31) » en colonne de
  naissance**, et le parseur, qui cherchait la première cellule contenant une date, retombait alors
  sur la colonne **« Membre depuis »** — Youssef Mokhtari, arrivé à Metz le 27 janvier 2010,
  ressortait **né en 2010**, soit moins un an au coup d'envoi. **La naissance est la PREMIÈRE cellule
  `zentriert` de la ligne, et elle seule** ; quand elle ne porte pas de date, le joueur est non daté,
  point. Lui et Mustafa Kučuković ont été datés sur **deux sources concordantes** — l'âge que TM
  affiche à côté du « N/A » et leur fiche Wikipédia (1979 et 1986) —, jurisprudence Vujović 92/93.
  **Troisième piège, et il n'a pas de solution propre : DEUX DAMIEN PERQUIS, prénom ET patronyme
  identiques**, l'un défenseur à Sochaux (3 179 minutes, le jeu le porte depuis 06/07), l'autre
  **gardien à Caen** (270 minutes). Aucune forme ne les sépare, exactement comme les deux Olivier
  Baudry de 91/92, et la convention dit que le marginal cède sa place à un autre vrai joueur de son
  club — **sauf que Caen n'a pas d'autre gardien ayant joué**. Le jeu complète donc avec **UN SEUL
  joueur procédural sur les sept cent soixante**, le deuxième gardien de Caen, et c'est exactement la
  marge de 99/00, où Caen n'avait déjà qu'un gardien répertorié. **La règle : quand l'homonymie est
  parfaite et qu'aucun remplaçant réel n'existe, on laisse le jeu compléter plutôt que de doubler un
  nom — mais on ne le fait jamais pour un homme que la source documente ailleurs.**
  **Six paires d'homonymes cohabitent**, dont trois reconduites de 08/09 (Bruno face à Benoît Cheyrou,
  Bakari face à Bakary Koné, Mamadou face à Mustapha Diallo) et **trois neuves**, dont une qui **se
  tranche à l'envers du temps de jeu** : **YANN M'VILA joue 3 318 minutes à Rennes et devient
  international français dans l'année, mais « Y. M'Vila » est à YOHAN depuis 08/09**, qui n'en joue
  que 1 527 à Dijon — c'est l'homme de l'ancre qui garde son nom, pas celui qui a le plus joué, et
  Yann passe en toutes lettres. Les deux autres : **Sadio Sow garde « S. Sow » sur une ancre de
  CRÉTEIL 2002-03** que Transfermarkt ne lui connaît pas et que sa fiche Wikipédia confirme (il y a
  joué de 2002 à 2006), donc Samba Sow cède ; et Alphousseyni Keita reconduit sa forme entière.
  **Quatre noms courts doivent rester ABSENTS** parce que leur porteur ne joue plus — Ismaël Bangoura,
  Alaeddine Yahia, Matar Fall et **Rémy Riou, dont le cas mérite d'être lu : RUDY RIOU EST BIEN À
  MARSEILLE en 2009-10, mais il n'y joue PAS UNE MINUTE**, donc le tri aux minutes l'écarte et
  « R. Riou » disparaît du plateau sans que la paire soit cassée. **Un nom court absent n'est pas une
  cession ratée : c'est parfois un homme qui n'a pas joué.** Les cessions de 07/08 et 08/09 sont
  reconduites, et **« C.-y. Park » garde la minuscule que 08/09 lui a donnée** — la source écrit
  autrement, le jeu ne change pas de nom en route.
  **Quatre assertions du harnais, écrites de mémoire, ont été démenties par le mercato de l'été 2009,
  et c'est le harnais qui a eu raison contre moi** : **Christophe Jallet** avait quitté Lorient pour
  le Paris SG, **Benjamin Gavanon** Nancy pour Sochaux, **Jérémy Mathieu** Toulouse pour Valence — il
  n'est donc nulle part au plateau —, et **ANDRÉ AYEW, prêté par Marseille, jouait la LIGUE 2 À
  ARLES-AVIGNON**, si bien que **les deux frères Ayew sont au plateau la même année**, Jordan à
  dix-huit ans au Vélodrome et André à vingt au Parc des Sports d'Avignon. Les quatre sont désormais
  contrôlés nommément, comme Savidan en 08/09. **Et une cinquième assertion s'est trompée d'un an sur
  l'âge d'Eden Hazard** : né en janvier 1991, il est **meilleur espoir à dix-neuf ans dans la réalité
  mais à DIX-HUIT au registre**, parce que l'âge du jeu est « année civile − naissance ». La
  convention est celle de 96/97, et un harnais qui raisonne sur l'âge réel d'un joueur né en janvier
  se trompera toujours.
  **La source est la plus généreuse du chantier pour la cinquième fois de suite** : **aucun club sous
  vingt-quatre hommes ayant joué** (Auxerre, Caen, Clermont, Laval et Tours ferment la marche à
  vingt-quatre), **aucun libellé de poste inconnu**, **quatre-vingts pages aspirées sans un seul échec
  ni un seul anti-robot**, et **sept joueurs seulement que la source ne sache pas dater** — cinq qui
  n'apparaissent que sur la page de temps de jeu (Aubameyang, Moussa Sissoko, Amiran Sanaia, Luboš
  Kamenár, Romain Thomas, relevés sur leur fiche TM) et les deux « N/A » ci-dessus. **Mille cent
  vingt-six hommes ont joué** pour sept cent soixante places ; **trente-quatre listés dans deux
  clubs** sont allés là où ils ont le plus joué, dédoublonnés **par identifiant Transfermarkt**, et
  les quarante identifiants de clubs ont été **relevés sur les pages `wettbewerb/FR1` et `FR2` de la
  saison** (leçon de 01/02). La sentinelle de fin a été vérifiée des deux côtés — **huit derniers de
  tableau ont leur place dans un effectif**, et le plus cher de tous est **RAFIK SAÏFI, 1 021 minutes
  à Istres**, soixante sélections algériennes et le Mondial 2010 devant lui ; Moussa Dembélé fermait
  celui de Châteauroux avec 1 002 minutes.
  **TREIZE vétérans de 36 ans et plus, un record qui écrase les neuf de 08/09**, dont **sept
  gardiens** ; **Dijon en aligne TROIS à lui seul** — Grégory Malicki, Anthony Lebrun et surtout
  **ÉRIC CARRIÈRE, MEILLEUR JOUEUR DU CHAMPIONNAT 2000-01**, qui finit sa carrière en Ligue 2 à
  trente-six ans, le plus bel écho que le chantier ait produit avec « Le jeu à la nantaise ». Les
  doyens sont six hommes de trente-sept ans : Ramé, Coupet, Echouafni, Alonzo, Revault et Cassard.
  135 prénoms neufs dans `PRENOMS_VRAIS`, **dont aucun vide** — pour la septième fois de suite.
  **Le rougissement aléatoire de `harness-recruteur.cjs` est toujours là, et toujours le même** : sa
  section F exige un prénom sur chaque carte alors que `PRENOMS_VRAIS` porte `"J. S. Verón":""`, un
  prénom volontairement vide (consigne v1.46). Deux lancements sur huit rougissent. **Prouvé non
  régressif à graine fixe** : à `Math.random` remplacé par une suite déterministe, la v1.78 et la
  v1.79 rendent **le même échec sur le même homme à la graine 4**, et sont vertes aux graines 3, 7,
  10, 11 et 21. Aucune assertion n'a été touchée. `harness-effectif.cjs`, l'autre rougissement
  aléatoire découvert en 08/09, est resté vert huit fois de suite.
  Validation dédiée : **`harness0910.cjs`**.
  Pour ajouter 10/11 : même méthode avec `saison_id/2010`, entrée `"2010-11"` dans `SAISONS`, harnais
  calqué sur `harness0910.cjs`. Le plateau ne bouge toujours pas (vingt et vingt depuis 02/03) ;
  **Arles-Avignon monte en Ligue 1** pour la seule saison de son histoire, avec Caen et Brest, et
  **Lille fera le doublé championnat-Coupe de France**. `HONNEURS` connaît déjà 2012 : partir de 10/11
  le fait tomber à la deuxième intersaison, l'été 2011 reste muet à la première, et **il faudra
  écrire 2014** (Mondial au Brésil, l'Allemagne, et le 7-1 de Belo Horizonte) pour la quatrième.
  **La file d'attente des saisons à venir — et les règles du chantier quotidien qui les ajoute une
  par une — sont dans `chantier-saisons.md`.**
- **Relégation = on continue en D2** (plus de game over) : `finDeSaison` ne licencie QUE sur objectif
  manqué de loin + confiance < 40 ; la relégation seule fait jouer la saison suivante en D2 (remontada).
- **Moteur** : 38 journées, `simuleMatch` calibré à ~2,3 buts/match (calibrage à préserver). Un **carton
  rouge en cours de match fait jouer l'équipe réduite à dix** pour les minutes restantes (`mulH`/`mulA` :
  attaque en baisse, on encaisse plus ; malus d'autant plus fort que le rouge tombe tôt ; gardien expulsé que le
  banc ne peut pas relever = cage encore plus fragile — voir « LES GARDIENS », v1.13). Les **gardiens fautent autrement** qu'un joueur de champ (`COMM.crGK`/`COMM.cjGK` :
  sortie kamikaze à la Schumacher, poings en avant, main hors surface) — branché sur `j.pos==="G"`.
  **Ferveur du public (v0.61)** : l'avantage du terrain est **modulé par l'affluence** — `simuleMatch` calcule `aff`
  d'abord, en tire `fill=aff/cap` et `ferveur=1+0.18*(fill−0.62)` (centré sur ~62 % = la moyenne), applique `lh*=…*ferveur`
  et `la*=…*(2−ferveur)` : un stade plein pousse l'attaque à domicile ET gêne le visiteur, un stade vide pèse. **Centré →
  ce que le domicile gagne, le visiteur le perd ≈ à l'identique : somme des buts ≈ constante, calibrage préservé** (mesuré
  au harnais : inchangé). S'applique à TOUS les matchs (réaliste). **Coups francs ~0,7/match (v0.61)** : décor narratif
  (`COMM.cf`, injecté ~0,0085/min dans le verbeux) qui **ne touche pas le score** (occasions, pas de but) → visible sans
  impact calibrage.
- **Consigne d'avant-match** (`CONSIGNES`, `G.consigne` ∈ `prudent`/`equilibre`/`offensif`, défaut `equilibre`) :
  un **choix restreint** avant chaque match (sélecteur sur l'écran du match, consigne active surlignée, elle
  persiste jusqu'au changement suivant). **Mais celle changée EN DIRECT ne vaut que pour ce match (v1.55,
  retour auteur)** : le premier changement en direct (`consigneEnDirect`, appelée par les trois contrôles du direct)
  met de côté la consigne d'avant-match dans `G._consigneAvant`, et `rendConsigne` la rétablit au coup de sifflet,
  depuis `soldePrime` (le point de fin de chacun de vos matchs, championnat, coupe et Europe). Modulateur d'agressivité appliqué **au SEUL match du joueur** dans
  `simuleMatch` (`att` = votre attaque, `adv` = l'attaque adverse contre vous) : offensif marque plus mais
  expose, prudent verrouille. Neutre (×1) pour tous les autres clubs et en `equilibre` → **le calibrage du
  championnat reste intact** (le harnais joue en `equilibre`). Multiplicateurs = réglages tunables. À migrer
  (`G.consigne||"equilibre"`). **Depuis v1.10, elle vaut aussi les soirs de coupe et d'Europe** (`multTactique`,
  réglée sur le panneau du rendez-vous) — voir « LE RENDEZ-VOUS DE SEMAINE SE PRÉPARE ».
- **LES FORMATIONS (v1.12, demande de l'auteur : « changer de formation pour augmenter l'aspect tactique, un peu pauvre
  avec le 4-4-2 forcé »)**. La règle est la sienne, mot pour mot : « plus de joueurs dans une zone, plus de contrôle dans
  celle-ci — 5-3-2 plus solide en défense mais pauvre en attaque, 4-4-2 plus solide au milieu, 4-3-3 plus agressif en
  attaque — conditionné par la qualité des joueurs : un 4-3-3 peut être meilleur au milieu avec trois bons joueurs qu'un
  4-4-2 avec des milieux moyens ». **Pourquoi le moteur a dû changer** : `forces()` ne voyait que deux blocs (milieux +
  attaquants ÷ 6, gardien + défenseurs ÷ 5). Un 4-3-3 n'y changeait RIEN (mesuré : le 3e attaquant d'un club de D1 vaut
  72,7 en moyenne, exactement le 4e milieu), et un 3-5-2 aurait gonflé l'attaque de ~50 % par simple arithmétique.
  **Données** : `FORMATIONS` (`4-4-2`/`4-3-3`/`5-3-2`, lignes G/D/M/A + `desc`), `G.formation` (défaut `"4-4-2"`, migré :
  toute valeur inconnue repasse en 4-4-2), `cleFormation(c)`/`formationDe(c)` — **votre club seul** : les dix-neuf
  autres restent en 4-4-2 (lot suivant possible : l'IA choisit la sienne). `FORMATION` (le 4-4-2 de référence) reste
  celui de l'équipe type de la saison et du plancher réglementaire. `onze`, `onzeRotation` et la limite des ★
  (`titulariser`) suivent la formation.
  **Moteur — trois zones, trois duels** : `forces()` rend `att`/`mil`/`def` = somme des `eff()` de la zone ÷ nombre de
  places que la formation lui donne × **effet du nombre** `(n/n du 4-4-2)^α` (`ZONES` : `aa`=0,9 attaque, `am`=0,5
  milieu, `ad`=1,1 défense gardien compris) × cohésion. `lambdasZones(fh,fa)` : `K_ZONES`(2,45) ×
  `(OFF/DEF adverse)^p` × `(MIL/MIL adverse)^c`, avec `OFF = att^wa · mil^(1−wa)` (`p`=2, `c`=0,9, `wa`=0,5) — le
  milieu décide qui se crée les occasions, l'attaque épaulée par son milieu contre la défense d'en face décide si elles
  finissent au fond. `simuleMatch` ET `simuleReste` l'appellent (puis terrain ×1,18/×0,92, ferveur, consignes comme
  avant). Le tireur d'élite garde exactement son poids d'avant (`TIR_ELITE` = 1,03^2,5 sur la lambda). **Au milieu,
  α=0,5 : trois milieux à 80 valent quatre milieux à 69** — la phrase de l'auteur, chiffrée.
  **Réglages trouvés par recherche sur les vrais effectifs** (80 clubs de D1 et D2, deux départs de carrière) : à
  joueurs de même valeur, 4-3-3 = buts marqués +10 %, encaissés +14 % ; 5-3-2 = −24 % des deux côtés ; le 4-4-2 face
  au 4-3-3 se crée +14 % d'occasions au duel du milieu ; **aucune formation ne rapporte de points gratuits** (±0,03
  point par match). Sur effectifs réels : 37 clubs ont intérêt au 4-4-2, 21 au 4-3-3, 22 au 5-3-2, et le gain du 4-3-3
  suit la valeur du 3e attaquant face au 4e milieu (corrélation 0,43) — c'est l'effectif qui décide. **Limite à
  connaître** (dite à l'auteur) : sur vingt minutes de fin de match, l'effet d'une formation se compte en quelques
  points de pourcentage ; ça se voit surtout au téléscripteur et sur la saison. **Calibrage** : tous les clubs en
  4-4-2, la formule à trois zones ne coïncide pas au chiffre près avec l'ancienne (le milieu joue désormais dans les
  deux sens) : à `K_ZONES`=2,45, trente passes de `harness.cjs` donnaient **2,3833** contre **2,4097** en v1.11
  (erreur-type ~0,0035, écart réel de −1,1 %) ; `K_ZONES` remonté à **2,477** → **2,4119** (trente passes,
  erreur-type 0,0031), dans le bruit. Une passe seule ne suffit pas à trancher (écart-type 0,02). Écart de points
  attendus par club sur une saison ≤ 3,2 (moyenne 1,2).
  **Coupe et Europe** : leur modèle de force ne connaît pas les lignes ; la qualité y passe déjà (le onze aligné
  change), et `multTactique` y ajoute le **caractère** de la formation à joueurs égaux (`styleFormation(k)`,
  [1,1] en 4-4-2 → tirages de coupe inchangés par défaut). Se combine à la consigne.
  **Écran** : `blocFormation(xi, adv)` en tête de `blocConsignePrime(quand, xi, adv)` — trois boutons `.bFormation`
  (câblés dans `ecranCalendrier`, **verrouillés par `lanceMatch`** comme la consigne), la `desc`, le **petit terrain**
  `.terrainXI` (attaque en haut, chacun dans la ligne où il joue, « (dépanne) » en rouge pour un hors-poste) et, le
  samedi seulement, **`lectureDuels(adv)`** : les trois duels en mots (« Au milieu, vos 3 contre leurs 4 : le ballon
  se partagera »…), seuils `DUEL_MIL`/`DUEL_BUT` = quartiles mesurés sur toutes les affiches dans les trois formations.
  Les soirs de coupe, pas de lecture (le modèle de coupe ne joue pas zone contre zone) mais la formation et le onze de
  la rotation. Le direct annonce les deux dispositifs au coup d'envoi (`sys`, m:0 : « Les deux équipes se présentent
  en 4-4-2. » ou « X se présente en 5-3-2, Y en 4-4-2. »). **Pas encore de changement de formation en cours de match**
  (lot 2 envisagé : un changement de système = un remplacement réel, à brancher sur les changements v1.11).
  Validation : **`harness-formations.cjs`**.
- **Changement de tactique EN DIRECT** (v0.61, retour de playtest « si on perd, pouvoir passer offensif ») :
  le téléscripteur est pré-calculé au coup d'envoi (`jouerJournee`→`simuleMatch` verrouille score ET `j.buts`), donc
  pour qu'un changement de consigne en cours de match pèse **vraiment**, deux mécanismes. (1) **Finalisation différée** :
  pour un match joué au direct (`window._diffEnDirect`, posé par `lanceMatch` autour du seul appel `jouerJournee`),
  `finirJournee(null)` n'est PAS appelé au coup d'envoi mais **au coup de sifflet** (dans `fin()`, gardé
  par `if(G._pend)`). **EN_TEST et le résultat instantané finalisent au coup d'envoi comme avant** → harnais et calibrage
  intacts. `abandonneDirect` et le chemin de reprise d'un `G._pend` restauré finalisent aussi (filets de sécurité). (2)
  **Re-simulation du reste** : `simuleReste(home,away,mStart,sh,sa,mulH,mulA)` rejoue uniquement les minutes restantes
  avec la consigne/prime **du moment** (lh/la recalculés à l'identique de `simuleMatch`) ; `rejoueDepuis(r,h,a,fromIdx,
  mNow,mulH,mulA)` **annule les stats du tail pré-tiré** (buts/passes/suspensions, via les **`uid`** désormais portés par
  `g`/`c`), repart du score affiché et recolle le nouveau cours + sifflet, en mutant `r.ev`/`r.sh`/`r.sa` en place. Le
  contrôle `#ctlTactique` (boutons `.bTacD`) n'apparaît qu'en direct ; le ticker suit `liveMin`/`liveMulH`/`liveMulA`
  (l'infériorité numérique en cours) pour passer le bon état à la re-sim. Invariant vérifié au harnais
  (somme `j.buts` == lignes-but, score == comptage par côté, 0 incohérence sur 400 re-sims).
  **DISPONIBLE À CHAQUE MATCH DU DIRECT (v1.05, retour de playtest « je ne peux pas changer la stratégie en cours de
  match »)** : le contrôle était masqué dès qu'un **moment** attendait à la 90e — soit près d'un match sur cinq, ce qui
  se vit comme une panne, pas comme une règle. Trois verrous levés. (a) `jouerJournee` **diffère TOUS les matchs joués
  au téléscripteur**, moment compris : un moment **non interactif** (cagade, but d'anthologie, gkbut…) n'est donc plus
  résolu au coup d'envoi mais **dans `tic()`, à l'affichage de sa ligne de 90e** (`if(G._pend){ finirJournee(autoMoment(
  monMatch.moment)); majSifflet(); }`), juste avant le sifflet ; le décor (chien/pigeon/streaker) et tout moment resté
  en suspens sont tranchés dans `fin()` par `finirJournee(monMatch.moment?autoMoment(...):null)`, comme le fait déjà
  `abandonneDirect`. (b) `rejoueDepuis` **fait survivre au recollage** l'annonce du temps additionnel ET la ligne du
  moment (`queue` = les lignes du tail portant `l.mo` ou « temps additionnel », ré-empilées avant le sifflet) — sans ça,
  changer de consigne effaçait le penalty à venir. (c) `penIdx` devient un `let` recalculé par `idxMoment()` après
  chaque re-sim (le fil devant l'annonce s'allonge ou se raccourcit). **Seul le match truqué reste verrouillé**
  (`monMatch._truque`, sinon le re-roll effacerait la victoire achetée) — mais les boutons sont désormais **affichés et
  grisés**, avec le libellé `#libTacD` qui dit pourquoi (« sans objet ce soir, le résultat est déjà écrit… ») plutôt que
  de disparaître sans explication. Validation : **section B bis de `harness.cjs`** (moment présent une seule fois après
  300 recollages, sifflet toujours dernier, temps additionnel conservé, score == lignes-but).
  **v1.10** : (a) le contrôle existe aussi les **soirs de coupe et d'Europe** (voir « LE RENDEZ-VOUS DE SEMAINE SE
  PRÉPARE ») ; (b) **une action déjà annoncée par la montée de tension va à son terme** — si `lignes[i]._monte` est
  posé, on recolle à partir de `i+1` (minute = celle de l'action), sinon « X se présente seul… » restait en l'air et
  le fil repartait sur autre chose ; même règle dans les trois directs ; (c) une fois le résultat **acté** (moment de
  la 90e tranché, `G._pend` vidé), `figeTac()` **éteint les boutons en le disant** au lieu de les laisser cliquables
  et muets.
- **Prime de match** (v0.61, `PRIMES_MATCH` 0/10/20/30 %, `G.primeMatch`, défaut 0) : un **coup de fouet à l'attaque**
  promis AVANT le match (sélecteur `.bPrime` sous la consigne, verrouillé au coup d'envoi). Booste votre lambda d'attaque
  dans `simuleMatch` (`lh`/`la` ×(1+pm), **votre seul match**), **payé UNIQUEMENT en cas de victoire** (`soldePrime`,
  appelé par `finirJournee` : `masse×pm×3` prélevé sur la trésorerie), puis **remis à 0** (opt-in à chaque match).
  Depuis v1.10 elle se promet aussi pour un soir de coupe ou d'Europe, et `soldePrime` la règle à la qualification
  (ou à la victoire de la manche aller). Défaut 0 → neutre, le harnais n'y
  touche pas → **calibrage intact**. À migrer (`+G.primeMatch||0`).
- **Promo billets « tribunes scolaires »** (v0.61, `G.promoBillets`, `PROMO_PRIX`=15 FF) : avant un match **à domicile**
  dont l'affluence prévue est **< 60 %** du stade, `ouvrePromo` (en fin de chaîne d'avant-match, après le debrief) propose
  de remplir les gradins à prix cassé. Active → `affluence()` (paramètre `sansPromo` pour calculer la jauge normale) pousse
  le taux à ≥0,92 (stade quasi comble → **ambiance + ferveur**, cf. ci-dessous), et `finirJournee` facture les places
  ajoutées à `PROMO_PRIX` (recette maigre), puis **remet `G.promoBillets` à 0** (ponctuel). Offert une fois par journée
  (`G._promoVue`), jamais en `EN_TEST`. À migrer (`!!G.promoBillets`). **Réputation = gain ACQUIS** : chaque promo
  applique `majReput(2, …)` — un ajout **permanent** à `G.reput` (il ne redescend pas parce qu'on arrête la promo) ;
  seuls les mauvais résultats, le tarif cher, etc. peuvent l'éroder **ensuite**. C'est l'attrait principal de l'opé
  (financièrement à perte) : un investissement-image cumulable, surtout précieux pour un club décrié qui se reconstruit.
- **Offre d'achat sur un joueur PRÊTÉ** (v0.61, `G.offrePret` ; `genOffrePret`/`accepterOffrePret`/`refuserOffrePret`) :
  un de vos joueurs prêtés (sortant, `G.prets` `sens:"out"`) brille ailleurs et **on veut l'acheter à demeure**.
  **L'acheteur (`o.acq`) est souvent le club d'accueil (~60 %), mais parfois un AUTRE club qui l'a flairé pendant le prêt**
  (`o.interlope`, ~40 %, choisi dans D1+D2 hors monClub/hôte ; il paie un peu plus cher, concurrence) — un prêté n'est PAS
  bloqué, il peut être convoité par un tiers. Généré dans `finirJournee` (~6 %/journée si un prêté `note≥70` ou `pot≥80`
  existe), expire à la journée suivante (`G.offrePret=null` en tête de `jouerJournee`). Panneau vert sur l'écran calendrier,
  libellé différent selon accueil/tiers (boutons `bPretAcc`/`bPretRef`). **Accepter** = vente sèche : on retire le prêt, on
  **sort le joueur de l'effectif de l'hôte** et on l'envoie chez l'acheteur (`j.club=o.acq`, `delete j.pretOut`), l'argent
  file au **budget transferts** — il ne reviendra pas. **Refuser** = le prêt suit son cours, il vous revient à l'échéance
  (et progresse, cf. retour de prêt). Prix proche de la valeur (1,0-1,45× ; tiers 1,15-1,6×). À migrer (`G.offrePret||null`).
- **Moments de match**, deux familles. **Interactifs** (`MOMENTS_INTERACTIFS` : penalty pour/contre, tacle,
  provocation) — overlay à choix. **Non interactifs qui changent le score** (`MOMENTS_BUT` : but de 50m, geste
  d'anthologie, et les **cagades de gardien** `cagade`/`cadeau`) : tirés par `tireMoment`, résolus par
  `autoMoment` AVANT le direct ; `buteurMoment()` reconstruit la ligne-but pour que tableau, feuille et sifflet
  restent cohérents (sinon le flash affiche un score que le sifflet contredit). Les **cagades** = bourdes de
  gardien (Arconada, relance dans les pieds, sortie ratée, faux rebond sur passe en retrait), **but sec dans les
  deux sens** : `cagade` (le vôtre se troue) / `cadeau` (celui d'en face).
  **Trois moments rares (v0.67), écrits par Fable 5** : **`gkbut`** (« LE GARDIEN MARQUE ! » — votre portier monte sur
  le dernier corner et catapulte le ballon au fond) est un **MOMENTS_BUT** de plus (`autoMoment`→+1, buteur = votre
  gardien via `buteurMoment`, titre de flash dédié) — freak absolu, slice de ~1,5 % dans `tireMoment`, **impact
  calibrage négligeable** (moments = MON match seul ; mesuré : 2,407 buts/match, inchangé). **`pigeon`** (volatile
  assommé, `PIGEON_ART`) et **`streaker`** (intrus en bottes) sont du **PUR DÉCOR** (`autoMoment`→0, absents de
  MOMENTS_BUT) affichés comme le `chien` via `celebreFlash` ; la queue de `tireMoment` tire au sort `chien`/`pigeon`/
  `streaker`. Vérifiés par `test-moments.cjs`.
  **Retour visuel du choix** : un overlay interactif tranché ne laisse plus tous les boutons en jaune. `finMoment`
  reçoit le **bouton cliqué** (4ᵉ argument) et applique les classes `.choisi` (le retenu s'illumine en jaune + coche
  ✅, via `dataset.coche` pour ne préfixer qu'une fois) et `.ecarte` (les autres en fond sombre estompé). Tous les
  `.zPen`/`.zChoix` portent l'une ou l'autre → chaque appelant (`momentPenPour/PenContre/CoupFranc/Tacle/Provoc`)
  passe son bouton ; `momentTacle` le fait via son helper `conclure`. Même esprit que la décision d'incident
  (« masquer les options non choisies »), mais sans réécrire le DOM des boutons.
- **Incidents de vie de club** : catalogue `INCIDENTS` (~38 cartes), tiré ~1 journée sur 3,
  chacun avec un joueur, 2-3 choix, des effets via `eff(j, {…})`. Anti-répétition sur 8 journées.
- **Conférence de presse interactive** (v0.57, `CONF_PRESSE`/`tireConfPresse`/`ouvreConf`/`effConf`,
  `G.confPresse` la conf en attente, `G.confRecents` l'anti-répétition sur 6 journées) : pendant des
  années la presse ne parlait qu'à sens unique (`G.declar`, un adversaire vous chambre). Désormais **on
  vous tend le micro** autour d'un **fait saillant** et vous choisissez le **TON** de la réponse. Le
  catalogue est **ordonné par priorité** (le 1ᵉʳ scénario éligible non récent l'emporte) : `declar`
  (répliquer à la pique adverse — synergie avec `G.declar` affiché sur l'écran match), `scandale`
  (`G.risque>0`), `derby`, `serie_noire`/`serie_or` (3 défaites / 3 victoires via `forme`, encodée
  victoire=1 nul=0 défaite=−1), `releg` (zone rouge, J≥18), `titre` (top 3, J≥22), `president`
  (`confiance<35`). Chaque ton porte un `eff{moral,reput,conf,buzz,presse}` appliqué par `effConf` (moral
  du vestiaire, `majReput`, `G.confiance`, `G.buzz`, ligne de revue de presse) — magnitudes **modestes**,
  c'est un nudge narratif, pas un levier. **Déclenchement** (dans `finirJournee`, après le bloc incident) :
  seulement s'il existe un fait saillant, **jamais le même week-end qu'un incident** (`!G.incident`, pas de
  fatigue de modale), prob 0,5 → en pratique ≈1 conf toutes les 7-8 journées. **Calibrage intact** : les
  effets sont appliqués AU CLIC dans la modale `#fiche` (même flux/`window._penEnCours` que `ouvreIncident`,
  option retenue mise en valeur, autres masquées) ; le harnais ne rend pas les modales (`EN_TEST` → `montre`
  no-op), donc il n'y touche jamais. Chaînée dans `ecranCalendrier` **entre incident et debrief**
  (`ouvreConf(ouvreDebrief)`). `G.confPresse`/`confRecents` migrés par `migre`. Étendre = ajouter une entrée
  `{id,cond,q,rep}` au bon rang de priorité.
- **Arcs narratifs de saison (v0.64)** : là où incidents et confs étaient des événements ISOLÉS, un **arc**
  est un feuilleton qui s'installe, monte et se dénoue sur **plusieurs journées**, avec des embranchements qui
  RÉAGISSENT à vos choix ET à vos résultats. Un seul objet d'état : **`G.arc = {id, beat, prochaine, data}`**
  (`beat` = clé du chapitre en attente, `null` = terminé ; `prochaine` = journée à partir de laquelle il
  s'affiche ; `data` = variables de l'arc, dont **`data.mark`** = `forme.length` au dernier chapitre, pour lire
  « ce qui s'est passé depuis » via **`_arcGagneDepuis(a)`** = une victoire est-elle tombée depuis). Catalogue
  **`ARCS`** (clé → `{titre, couleur, cond(), start(), beats}`) ; chaque `beats[clé](a)` renvoie `{txt, choix}`
  et chaque choix `{lib, go(a)}` où `go` renvoie `{res, eff?, next?, gap?}` (**pas de `next` = dénouement**).
  Les chapitres se **résolvent à l'ouverture** (une fonction de `a`) → ils peuvent lire `forme` et brancher sur
  le résultat sportif au dernier moment. **Effets par `effArc(e)`** (`{arg,moral(vestiaire),reput,conf,buzz,
  presse}`) — AUCUN effet moteur, rien ne touche le calibrage. **Cycle de vie** : `armeArc()` (dans
  `finirJournee`, jamais en `EN_TEST`, **un seul arc/saison** via `G._arcFait`, fenêtre J4-30, prob 0,5 si
  éligible) pose l'arc au chapitre `b1` ; `migre` fait `G.arc||null` + `G._arcFait` ; `intersaison` **remet les
  deux à zéro** (un arc ne straddle pas deux saisons). **Exclusivité du week-end** : quand un chapitre est mûr
  (`arcDu` en tête du bloc incident de `finirJournee`), on **saute incident ET conf** ce jour-là (une seule
  modale). `ouvreArc(suite)` est **chaîné en tête** dans `ecranCalendrier` (`ouvreArc(()=>ouvreConf(()=>
  ouvreDebrief(ouvrePromo)))`), même flux/modale `#fiche`/`window._penEnCours` que `ouvreIncident` (choix →
  résultat mis en valeur → Continuer). **Séparation pur/impératif** : `go(a)` **reste PUR** (renvoie un descriptif,
  aucun effet de bord) → exerçable N fois au test ; les mutations vivent dans **`appliqueArc(a,out)`** (appelé une
  seule fois, sur le choix cliqué) qui applique `out.eff` via `effArc(e,a)`, une **vente** `out.sell` via `vendMome`,
  et fusionne `out.data` dans `a` (route, vitrine, offreBonus…). **`effArc(e,a)`** gère les effets club (`arg,budget,
  moral,reput,conf,buzz,presse`) ET ciblés sur le joueur `a.uid` (`egoJ,moralJ,noteJ`). **`vendMome(a,{prix,mode})`** :
  `sec`/`rabais` = départ immédiat (retiré de l'effectif, budget crédité, `assureCapitaine`) ; `pret` = payé maintenant
  mais le joueur **finit la saison chez vous** (flag `j._departMome`, purgé à l'`intersaison` juste après montées/
  descentes). **Le harnais ne couvre pas les arcs** (EN_TEST les neutralise) → test dédié `test-arcs.cjs` (armement,
  chemins narratifs, `effArc`, rendu `ouvreArc`, ET pour diamant : vente sèche / prêt / écusson embrassé). Arcs livrés :
  **`sortilege`** (« Le sortilège de la buvette » — 4 sans victoire → superstition/Professeur Wamba), **`diamant`**
  (« Le diamant brut » — pépite ≤20 ans/pot≥86 convoitée post-Bosman, 3 chapitres, 4 dénouements : embrasse l'écusson /
  pont d'or / clash / vendu-mais-prêté) et **`shopi`** (« Le sac Shopi » — caisse noire du vice-président Gégé Brémont,
  confiance 35-65, effets argent/réputation/confiance seulement ; chapitre `bEclate` = le scandale qui ressort si on
  enterre l'affaire ; une fin recase Gégé **vendeur de merguez** → clin d'œil bouclant avec `sortilege`). Les trois
  écrits par **Fable 5**. **Piège** : dans les `go:a=>({…})` (retour d'objet fléché), bien fermer `}})` (objet + parenthèse) ;
  un `}}` manquant casse la syntaxe. Étendre = ajouter une entrée à `ARCS`.
- **Mallette / match truqué** (`G.affaire` l'offre, `G.truque` la victoire promise, `G.risque` le compte à
  rebours d'enquête) : un intermédiaire propose une victoire garantie (3-7 MF) ; accepter arme `G.truque`
  (match suivant gagné), puis `G.risque=RNDI(4,7)` ouvre une **fenêtre d'enquête bornée** (~10 %/journée
  d'éclatement : −6 pts, −8 MF, −35 de confiance ; sinon la piste se refroidit → ~44 % de se faire prendre).
  **Ne JAMAIS** rendre `G.risque` permanent : l'ancien booléen valait ~94 % de scandale, donc refuser était
  toujours optimal et le dilemme était mort. L'intermédiaire **rôde davantage quand le club coule** (confiance
  < 45 ou bas de tableau). `G.risque` est un entier (migrer `+G.risque||0`).
- **CALENDRIER DE LA SAISON — règle fondamentale (consigne auteur, v0.85)** : une saison de football va
  d'**AOÛT à FIN MAI**. Les 38 journées traversent **quatre saisons de jeu bien distinctes**, et tout contenu
  daté dans la saison doit s'y conformer : **J1-J7 = été indien** (août-septembre, soleil rasant, terrain sec),
  **J8-J15 = automne** (octobre-novembre, la pluie s'installe, le terrain se gâte), **J16-J26 = hiver**
  (décembre-février, froid de canard et parfois des conditions dantesques), **J27-J38 = printemps**
  (mars-mai, les meilleures conditions de l'année). **Corollaire à ne jamais perdre de vue : le titre, la
  descente et le maintien se jouent au PRINTEMPS**, sous un ciel dégagé — jamais dans la gadoue de novembre.
  Erreur commise une fois, à ne pas refaire : situer une lutte pour le maintien en plein automne. La règle
  vaut pour la météo (`tireMeteo`) mais aussi pour tout futur contenu daté à l'intérieur d'une saison
  (incidents saisonniers, arcs narratifs, dépêches).
- **Datation par époque** : chaque incident/sponsor peut porter `de:` et/ou `a:` (années).
  `anneeJeu()` = 1994 + saisonIdx. **Toujours dater un contenu marqué par son époque**
  (réseaux sociaux ≥ 2009, paris en ligne ≥ 2010, etc.). L'anachronisme casse l'immersion.
- **Sponsors maillot** : 3 familles formant un vrai dilemme image/argent — terroir/ringards (peu payés mais
  **gros bonus de réputation**, +3 à +8 selon le sponsor : on sacrifie l'argent pour l'image), propres
  (équilibré, +1), sulfureux (pont d'or mais réputation en baisse, parfois défaut de paiement). Le bonus de
  réputation à la signature est porté par le champ `rep` de chaque entrée de `SPONSORS_RINGARDS`. **Bonus
  RÉCURRENT du terroir (v0.60)** : sans lui, le terroir n'était JAMAIS choisi (un `rep` ponctuel de +3..+8 est
  vite lessivé face à un pont d'or qui paie ~3× plus CHAQUE journée). `genSponsors` ajoute donc à l'offre
  terroir un champ **`repJ = rep×0,06`** (≈ +0,18 à +0,48/journée), appliqué **en silence** chaque journée dans
  le bloc sponsor de `finirJournee` (comme la dérive du tarif billet, sans notif) → ~+7 à +18 de réputation
  cumulés sur une saison, en plus du bonus de signature : le « petit » sponsor devient un vrai choix « image ».
  **Réservé au terroir positif** : la seule entrée à `rep<0` (3617 Monique, minitel rose) a `repJ:0` et une
  description distincte (pas de « le public l'adore »). Badge d'offre et `desc` exposent le bonus récurrent.
  **Noms (v1.82, choix de l'auteur le 08/10/2026)** : de VRAIES marques de l'époque (Mammouth, Cochonou, Prisunic,
  Air Inter, Bi-Bop, La Cinq, Enron…) mêlées de pastiches maison (Copytoo, Doozer, Madoff Consulting, Jens Lehmann
  Brothers, Kachkar.biz, BetCash). Toutes datées (`de`/`a`), propres compris (objets `{nom,de,a}`) ; `datedDispo`
  retombe sur la liste entière si une année est vide. Liste arrêtée par l'auteur : ne pas en ajouter sans lui.
- **Équipementiers** (`EQUIPEMENTIERS`, `genEquip`/`choisirEquip`) : 2e source de revenu, **se signe comme un
  sponsor** — rien au début de saison, on choisit parmi des offres (`G.offresEquip`) qui dépendent de la
  **notoriété** (prestige nuancé par la réputation) ; le contrat (`G.equip`) verse un cachet chaque journée et
  expire à l'intersaison (à re-signer). 3 offres types : gros fixe / fixe moindre + prime à la victoire /
  atelier local modeste mais +réputation. **v1.82 (demande auteur)** : l'offre à prime est calée sur le cachet du
  N°1 (fixe ×0,5, prime ×1,4 par victoire : point mort vers 14 victoires, +30-40 % pour un club de tête, −20 % pour
  un mal classé) ; l'atelier local donne **+10 à la signature puis +0,3/journée** (`repJ`, appliqué en silence dans
  `finirJournee` comme le sponsor du terroir). Noms **fictifs** (Athéna, Triax, Cheetah, Ombra, Oméga,
  Le Faisan Sportif, Ringbok, Tombola, Sportec Vosges, Le Grand Échalas…) — jamais de vraie marque.
- **Économie — « l'argent est une contrainte »** : chaque journée, pour MON club, `finirJournee` encaisse
  billetterie à domicile (`affluence×70`), droits TV (**450 kF en D1, 200 kF en D2** — remonter, c'est le
  jackpot télé), sponsor et équipementier, puis prélève **deux charges** : la **masse salariale**
  (`salaire(j)=note²×10`, grimpe vite avec la qualité — empiler des cracks coûte cher) et les **frais de
  fonctionnement** (`fraisJournee(c)=cap×18`, entretien stade + personnel : un grand stade vide devient un
  fardeau ; depuis v1.41, les places que VOUS avez ajoutées au-delà de `G.stade.capBase` ne coûtent que 6 FF, cf. stade). Trésorerie négative = `G.confiance−1`/journée + alerte (flag `G._deficit`). Plancher mesuré dans
  le moteur : club moyen ~+6 MF/saison sans sponsor, **D2 en déficit** (survie). Le **budget mercato `G.budget`**
  reste un pot séparé (réalimenté à 70 % par la prime de classement à l'intersaison). Les **prêts** sont un
  appoint, pas une rente (`tarifPret` abaissé) : prêter libère surtout le salaire. **Le prêt fait progresser (v0.61)** :
  un prêté `sens:"out"` revient **aguerri** — `retourPret` lui rajoute de la note (jeune ≤21 : +3, ≤25 : +2, sinon +1,
  **jamais au-dessus du potentiel `j.pot`, jamais à la baisse**) et +12 de moral (en plus du +1,5/journée pendant le
  prêt). Tous ces coefficients sont **réglages** à durcir/adoucir après playtest. L'écran Finances détaille chaque poste.
  **RAPPELER UN PRÊTÉ AVANT TERME (v1.03, demande de l'auteur)** : un prêt sortant peut être **rompu en cours de
  route**, contre une **indemnité de rupture** versée au club hôte — `coutRappel(p,j)` = les journées restantes
  **rendues au triple** (le dédit) + 1 % de la valeur du joueur, cette part s'éteignant à mesure qu'on approche du
  terme (`min(1, reste/10)`), plancher 100 000 FF. Elle se paie sur la **TRÉSORERIE**, jamais sur le budget
  transferts : c'est une dépense d'urgence (l'infirmerie qui se remplit en mars), et c'est la caisse qui doit faire
  mal. Le rappel marche **hors fenêtre de mercato** — c'est tout l'intérêt — mais il est refusé à **une journée du
  terme** (« il rentre de toute façon ») et si la caisse ne suit pas. **Le bénéfice du prêt est PRORATISÉ** : le
  gain de note et le +12 de moral sont multipliés par la part de pige réellement faite, et le moral encaisse
  **−10 de contrariété** (on arrache un homme à un club où il était titulaire) — rentrer un joueur à 20 % de sa
  pige le laisse donc plus aigri qu'au départ. D'où le champ **`p.debut`** (journée de signature), désormais posé
  sur TOUS les prêts et rétro-comblé par `migre()` à `fin−10` (durée médiane) pour les sauvegardes d'avant —
  `debutPret(p)` centralise ce repli. `retourPret(p, rappel)` porte le second paramètre ; les deux appels normaux
  (`traiterPrets`, intersaison) le laissent tomber et gardent le bénéfice plein. Le rappel **annule une offre
  d'achat en cours** sur ce joueur (`G.offrePret`) et appelle **`veilleEffectif()`** : le club hôte qui rend son
  prêté peut passer sous le plancher et doit se dépanner aussitôt. **Pas d'exploit possible** : rappeler coûte
  toujours plus que ce que le prêt rapporte. UI : bouton « 📞 Rappeler — X MF » dans le tableau « En prêt à
  l'extérieur » de l'écran Effectif (qui a gagné une ligne d'en-tête au passage) **et** sur la fiche du joueur,
  qui affiche désormais où il est prêté. Validation : **section F de `harness-effectif.cjs`**.
  **LE PRÊT D'UNE SAISON (v1.72, demande de l'auteur)** : `dureesPret()` ajoute aux piges de 5/10/15 journées une
  pige qui court **jusqu'à la J38** dès qu'il reste plus de 15 journées : « Toute la saison » l'été (J0-J4),
  « Jusqu'en juin » ensuite. Aucun autre câblage : le prêté joue titulaire chez l'hôte (`_joue=1`) et progresse
  au rythme d'un titulaire, SANS le bonus du campus (réservé à `monClub`), puis rentre par `traiterPrets` à la J38
  avec le bonus de retour plein. Mesure (19 ans, 65/88, une saison) : prêt 74, titulaire à la maison 71 (73 avec le
  campus au maximum), banc 67 (68). **Le bonus de retour suit désormais la durée** (choix auteur, même version) :
  `plein × min(1, (journées faites + 5)/30)`, soit un tiers pour 5 journées, deux tiers pour 15, plein dès 25 ; avant,
  5 journées valaient un an et le prêt court était le meilleur placement du jeu. **LE STAFF FORME (v1.73, choix
  auteur)** : `coachFormation(pos)` ajoute à la progression des joueurs de `monClub` +15 %/étoile du coach de leur
  secteur (`coachSecteur` : G → gardien, D → defense, M → **milieu**, A → attaque), cumulé avec le campus dans
  `progression`. Un prêté n'en profite pas (il est dans le club hôte). Mesure (19 ans, 65/88, une saison, campus max
  + coach ★★★) : banc 69, titulaire 76, prêt 74. **v1.74, l'auteur : « un entraîneur doit faire progresser TOUS les
  joueurs »** : (1) un 7e poste **`milieu`** (« Coach du milieu », 🧭) : +1 %/étoile devant et −1 %/étoile encaissé dans
  `simuleMatch`, et il forme les milieux ; ajouté aux deux inits de `G.staff` (les vieilles sauvegardes sans la clé le
  voient vacant, `coachTier` tolère `undefined`). (2) les **confirmés (24-30 ans)** de votre club progressent avec le
  coach de leur secteur, `0.02 × étoiles × max(part, 0.3)` par journée (moitié après 27 ans), **jusqu'à `pot + 2 × étoiles`**
  (v1.78, choix auteur, d'abord `pot + étoiles` en v1.74) : le coach fait dépasser le plafond (78/78 → 80 en une saison
  de titulaire avec ★★★, 84 au maximum en trois saisons environ). Sans coach, rien ne
  change. (3) les **vétérans (31+)** déclinent 20 % moins souvent par étoile. L'IA n'a pas de staff : calibrage des
  autres clubs intact. Validation : **section H**. Validation : **section G de `harness-effectif.cjs`** (une saison jouée pour de bon).
- **Affluence** (`affluence(home,away,sansPromo)`) : depuis v0.61, le **club hôte pèse plus que le visiteur** (`home.pres*0.022`
  + `away.pres*0.016`, base 0,46) et le **classement** compte fort (top 3 : +0,13 ; 4-6 : +0,06 ; ≥16 : −0,06) — retour de
  playtest « 2e avec le PSG et le stade pas plein, illogique ». Plus derby (+0,15), buzz/réputation/tarif (votre club). Le
  paramètre `sansPromo` calcule la jauge **hors** opé scolaires (cf. promo billets). Plafonné à 1 (`min(1,taux)`).
- **LE STADE EN MAQUETTE (v1.36, refonte de « brique par brique » v0.68)** : « je construis mon club ». On bâtit **un
  projet à la fois** depuis l'écran Club. **Référence visuelle et fonctionnelle : `docs/prototype-stade.html`**, conçu avec
  l'auteur ; on ne réinvente rien, on reprend son code.
  **Le rendu** : le moteur du prototype (`vueMaquette`, la maquette isométrique ; `vueVille`, le stade dans sa ville un soir
  de match) est **greffé tel quel** dans le bloc `STADE3D` par **`node docs/greffe-stade.cjs .`** (depuis `championnat/`,
  rejouable : il remplace le bloc entre ses deux marqueurs). Enfermé dans une fermeture pour que ses noms courts (`L`, `W`,
  `P`, `D`, `COTES`, `FMT`, `G` local…) ne croisent pas ceux du jeu. **Quatre retouches seulement**, faites par le script :
  le cyan du ruban LED devient blanc (cyan banni), le gabarit de la prochaine tribune peut s'afficher **seul et cliquable**
  (`R.cible` → `<g class="stTrib">`, câblé comme `.bProj`), la grue n'apparaît que pendant un chantier, et le côté suivant
  reste positif sous 5 000 places. **Si le prototype évolue, on le modifie, puis on relance le script** : ne jamais retoucher
  le bloc `STADE3D` à la main. `etatStade3D(c, aff, o)` traduit `G.stade` + capacité + remplissage au format du prototype ;
  **`maquetteStade(c, aff, chInfo, cible)`** met le SVG en **cache** (`CACHE_STADE`, clé = l'état sérialisé, remplissage
  arrondi à 5 %) : la maquette pèse jusqu'à ~700 Ko à 100 000 places, elle ne se redessine que si quelque chose change.
  Le badge « 🏗 <label> · J-<reste> » est ajouté par-dessus. Animations (`.clign`, `.feu`, `.eclat`, `.defile`) coupées
  sous `prefers-reduced-motion`. L'ancien `svgStade` a disparu.
  **Le modèle, `G.stade` en niveaux** : 0/1 pour les chantiers uniques (`virages`, `toit`, `loges`, `ecran`, `chauffante`,
  `led`, `retract`, `legende`), 0 à 3 pour les familles (`boutique`, `buvette`, `restaurant`, `musee`, `hotel`, `transport`,
  `kop`), **1 à 3 pour `eclairage`** (les mâts d'origine sont acquis), plus `ferme` (toit rétractable, décoratif), `style`
  et `cote`. `c.cap` reste le socle. **Une tribune = +3 500 places**, côté **lu dans la capacité** (`coteTribune(c)` =
  `COTES[STADE3D.coteSuivante(cap − 5 000 × virages)]`, exactement comme le dessin) ; `G.stade.cote` n'est plus qu'un
  compteur gardé pour la compatibilité. **Plafond `STADE_MAX` = 100 000** (tribune possible tant que cap ≤ 96 500).
  Après les virages, la cuvette s'uniformise en grandissant (`profondeurs`, dans le prototype). Paliers de nom
  (`PALIERS_STADE`/`etapeStade(cap, stade)`) : municipal, D1 (12k), Grande enceinte (20k), Enceinte internationale (30k),
  Arène européenne (50k), Cathédrale du football (75k), puis **Temple du football** une fois dans l'histoire.
  **Départ et migration** : `inferStade(c)` déduit le stade de la taille réelle (pylônes ≥18k et toit ≥30k, les seuils
  d'avant ; virages ≥35k ; parking ≥20k ; kiosque et baraque à frites partout ; drapeaux au kop s'il y a des virages).
  **`migreStade`** (appelé par `migre()`) convertit les vieilles parties : `pylones` → éclairage 2, « boutique & musée »
  (`boutique:true`) → boutique 2 + musée 1, buvette 1 si absente, booléens → 0/1 ; **`migreChantier`** reprend un chantier
  `pylones`/`boutique` en cours sous son nouveau nom ; l'ancien `G.chantier={reste,places}` reste honoré.
  **Le catalogue `STADE_PROJETS`** repose sur deux gabarits, **`projetUnique`** et **`projetNiveaux`** (le niveau
  proposé est toujours le suivant ; tables dans `NIVEAUX_STADE`), plus tribune, virages, toit rétractable et histoire.
  Interface commune : `niv(c)`, `cout(c,n)`, `duree(n)`, `pres(n)`, `label(c,n)`, `dispo(c)`, `fait(c)`, `applique(c,n,ch)`
  qui renvoie la livraison `{titre, sous, chiffres}`. Le chantier retient son niveau (`G.chantier.niv`) et, pour l'histoire,
  son style. `projetsHTML` range les boutons par famille (Tribunes, Confort, Commerces, Accès et ambiance, Grands travaux).
  **Équilibrage (validé par l'auteur le 25/09/2026)**, T = prix d'une tribune (`T_STADE` = 9 MF + 280 FF/place) :
  virages 2T/6 j (dès 20k, +5 000 places, ferveur +0,015) ; éclairage pylônes 6 MF/2 j puis rampe 14 MF/3 j (exige le
  toit), +1,5 pt d'affluence chacun ; toit 12 MF/4 j (+0,025 ferveur), loges 9 MF/3 j (+0,15 MF/match), écran 5 MF/2 j
  (+2 pts), pelouse chauffante 7 MF/2 j (v1.41 : de J8 à J26, blessures ×0,5 pour les deux camps sur VOTRE pelouse,
  `pelouseChauffee`, via le 3e paramètre de `tireBlessures`/`tirageBlessure`) ; ruban LED 6 MF/2 j (+50 kF/journée) ; boutique 2/5/14 MF (+40/100/250 kF par
  journée) ; buvette 1,5/4/10 MF (+30/80/180 kF par match à domicile × remplissage, fan zone +1 pt) ; restaurant 3/9/20 MF
  (+60/150/300 kF par match, étoilé : réputation +3) ; musée 2/7/18 MF (+20/60/150 kF par journée) ; hôtel 8/20/45 MF
  (+1,5/4/9 MF à l'intersaison, moral +1/+2/+3 après chaque match à domicile) ; accès 3/9/18 MF (+2/4,5/8 pts, v1.41 : avant 4/15/35 MF pour
  +1/2,5/4, la gare demandait 50 à 200 saisons pour se rembourser) ; kop
  1/3/6 MF, exige les virages (ferveur +0,005/0,01/0,02) ; **toit rétractable** 2T/8 j (dès 75k, avec toit) : +4 pts
  d'affluence **de J8 à J26**, la saison froide (la météo est tirée APRÈS l'affluence, on ne s'y branche donc pas ; le bouton
  Ouvrir/Fermer est **décoratif**, choix de l'auteur) ; **Entrer dans l'histoire** 5T/12 j (~180 MF), à capacité maximale
  avec toit et virages, unique et définitif : **prestige 10**, réputation +5, **affluence jamais sous 95 % AVANT l'effet du
  tarif** (un tarif prohibitif peut encore vider un peu : le prix des billets reste un choix), et une ligne au palmarès
  (« Saison 1995-96 : <stade> entre dans l'histoire (<style>) »). Les six styles (`STYLES_STADE`) : Robe de lumière, Nid
  d'acier, Forêt blanche, Brutaliste, Art déco, Cathédrale ; le choix se fait dans la fenêtre de lancement, avec un
  aperçu du stade dans sa ville (`choixStyleHTML`/`cableChoixStyle`). **Tous les effets sont lus dans `STADE_EFFETS`** par
  `stadeBonusAff`, `stadeFerveur`, `stadeRecetteMatch`, `stadeRecetteJour`, et restent **réservés à MON club** (calibrage
  intact, mesuré 2,402). Au sommet : +14 pts d'affluence (hors hiver ; +10 avant la v1.41), +0,06 de ferveur, 0,63 MF par soir de match plein.
  **La carte de livraison** : `avanceChantier()` photographie l'état du dessin avant et après, `finirJournee` range la
  livraison dans `G.livraison`, et **`ouvreLivraison`** l'ouvre **en tête de la semaine suivante** (avant la nouvelle ère et
  l'incident, dans la chaîne d'`ecranCalendrier`). C'est la modale du prototype : `vueVille` en mode focus (le stade et
  l'élément livré, rien d'autre), 1,9 s de l'état d'avant à l'état d'après, grue qui repart ; sous prefers-reduced-motion,
  la scène finale directement. **Aucun tiret cadratin** dans les textes de livraison (consigne auteur, vérifiée par le harnais).
  **Donnée d'affluence** (v0.71, inchangée) : **`G.affHist`** est une file glissante des 8 derniers taux à domicile, poussée
  dans `finirJournee` là où `fill` est déjà calculé ; **`affMoyenne(c)`** en fait la moyenne, sinon une estimation d'attente
  `0.42 + pres*0.03 + (reput−60)*0.002 + (confiance−50)*0.0015` (bornée), signalée « (estim.) » jusqu'au 1er match réel.
  Elle colore les gradins de la maquette et nourrit la jauge d'affluence moyenne sous le stade. Validation :
  **`harness-stade.cjs`**.
  **Retour sur investissement (audit du 25/09/2026, v1.41)** : mesuré sur 4 saisons simulées, un club remplit de 58 %
  (Martigues) à 94 % (PSG). À 18 FF la place sur 38 journées contre 70 FF sur 19 matchs, une place neuve ne couvrait ses
  frais qu'au-delà de 51 % de remplissage : la tribune, geste central, se remboursait en 11 à 37 saisons. Demande de
  l'auteur : « que ça rapporte plus vite, on investit dans une tribune pour gonfler la tréso et faire des transferts ».
  D'où **`G.stade.capBase`** (taille d'origine, posée par `inferStade`, déduite par `migreStade` pour une vieille partie :
  cap − tribunes bâties × 3 500) et le rabais d'entretien à 6 FF sur les places ajoutées : environ 4 à 7 saisons sans le
  prestige, 3 à 5 avec. Les commerces (kiosque remboursé en 1,3 saison) restent **volontairement** généreux : c'est la
  récompense (choix de l'auteur). **Prestige découplé de l'objectif (v1.43, choix de l'auteur)** : avant, une tribune
  au Havre (prestige 4 → 5) faisait passer l'objectif de top 16 à top 10 à l'intersaison. `avanceChantier` note le
  prestige gagné au stade dans **`G.stade.presStade`** ; **`presObjectif(c)`** le retire avant `objectifPour`
  (intersaison et `migre`). Le prestige garde tous ses autres effets (affluence, sponsors, équipementier, jeunes).
  Seul le stade fait monter `c.pres` dans le jeu. Vieille partie : `presStade` absent = 0 (comportement d'avant).
- **LE CENTRE D'ENTRAÎNEMENT EN CAMPUS (v1.53)** : l'ancien `G.centre` (un niveau de 1 à 5, 8 MF × niveau, une ligne de
  texte) devient un **campus de six bâtiments à trois niveaux, plus un château**. **Référence visuelle et fonctionnelle :
  `docs/prototype-centre.html`**, conçu avec l'auteur (copie de l'artifact « Le centre d'entraînement ») ; on ne réinvente
  rien, on reprend son code.
  **La greffe** : le prototype délimite un bloc entre « CENTRE3D : DÉBUT » et « CENTRE3D : FIN » (catalogue `FAMS`,
  `PALIERS`, `SOUS_PALIER`, `CHATEAU`, calculs `points`/`palier`/`nivMax`/`chateauOuvert`/`nomNiveau`/`effets`, et tout le
  moteur de dessin : `scene`, bâtiments, séances animées, car des pros, brume, lumière). **`node docs/greffe-centre.cjs .`**
  (depuis `championnat/`) le copie dans `index.html` entre les marqueurs `/* ---- CENTRE3D : DÉBUT` et
  `/* ---- CENTRE3D : FIN ---- */`, juste après le bloc `STADE3D`, dans une fermeture qui expose `CENTRE3D`. **Rejouable,
  et idempotent** (deux passes, même fichier) : si le prototype évolue, on relance le script, **on ne touche jamais le bloc
  à la main**. Deux retouches seulement, faites par le script : les classes `.vapeur`/`.eclat`/`.clign`, qui existent déjà
  pour le stade avec d'autres réglages, deviennent `cVapeur`/`cEclat`/`cClign` ; les dégradés `cHalo`/`cAube`/`cOr`/
  `cBrume`/`cEau` deviennent `ct…`. Le script refuse un tiret long. Le bloc lit **`REDUIT`** (défini par le jeu depuis
  `prefers-reduced-motion`) pour couper ses animations SMIL ; le CSS coupe `.bob .vv .arrive .brume .jet .cEclat .cClign
  .cVapeur` et le fondu de la carte.
  **Le modèle** : `G.campus = {terrains, physique, medical, vie, academie, video : 0 à 3, chateau : 0/1, chantier : null |
  {fam, niv, reste}}`. **`CENTRE3D.FAMS` est la seule source de vérité** : noms, coûts (MF), durées (journées), entretien
  (kF par journée), textes (`eff` = l'effet, `sous` = la phrase de livraison) et même les valeurs d'effet
  (`CENTRE3D.effets(R)`, lu par `campusEff()`). On ne construit que le niveau suivant ; trois niveaux ont une époque
  (`des`) : clinique dès 1998, cellule d'analyse dès 2002, laboratoire dès 2004, lue avec `anneeJeu()` ; le terrain
  éclairé du niveau 2 est un stabilisé avant 2002, un synthétique ensuite (`nomNiveau`). Paliers : Terrain annexe (0),
  Centre d'entraînement (3), Domaine du club (7), Centre de haute performance (11), Campus (15), puis Le Château. **Le
  château** : 15 points et tous les bâtiments au niveau 2 (`chateauOuvert`), 60 MF, 12 journées, définitif, une ligne au
  palmarès « Saison xxxx-xx : le club s'offre un château ».
  **Le chantier** : **un seul à la fois AU CENTRE, indépendant de celui du stade** (deux grues possibles). `motifCentre(fam)`
  dit ce qui bloque (époque « Pas avant 1998-99 », seuil du château, chantier en cours, caisse), dans cet ordre ; il sert à
  la fois au refus, à l'infobulle des boutons grisés (`aria-disabled`, pas `disabled`, pour que l'infobulle et le clic qui
  explique marchent partout) et à `lanceCentre`, qui passe par `modalSignature` et **re-vérifie tout dans `onOk`**.
  `avanceChantierCentre()` décompte dans `finirJournee` (juste après `avanceChantier`) et range la livraison
  `{fam, niv, avant, apres}` dans **`G.livraisonCentre`** (deux petits états, pas de SVG dans la sauvegarde). L'entretien
  (`campusEntretienJour`, 400 kF par journée campus complet, château compris) est prélevé avec la masse salariale et
  s'affiche aux Finances, ligne « Entretien du centre ».
  **Les effets, VOTRE club seulement** (chaque lecture passe par `campusEff()`, jamais d'autres clubs) : progression des
  jeunes +10/20/30 % (terrains) et +10 % au château (`progression`) ; blessures −8/16/25 % (physique) et durée −15/30/45 %
  (médical, arrondie, jamais sous une journée) (`tirageBlessure`) ; soin 0,10/0,20/0,30 (physique) **additionné au
  préparateur physique sous le plafond 0,70** (`recupJoueur`) ; fragilité −1/−2 l'été au médical 2/3 (`intersaison`) ;
  jeunes montés note +2/4/7 et potentiel +3/6/10 (`monteeCentre`), montées `monteesMax()` = 2, 3 à l'académie de renom, +1
  au château (`MONTEES_MAX` reste la base, 2) ; fraîcheur +3 par semaine de J16 à J26 avec la halle et +2 avec le labo
  (`reposHebdo`, plafond 100) ; moral +0,3/0,6/1 par journée, +0,2 au château (`finirJournee`) ; prime de signature
  −10/20/30 % (`demandePrime`) ; cohésion +2/+3 % (`forces`, APRÈS le bornage de la cohésion) ; vidéo : duel du milieu
  +1/2/3 % pour votre match (`forces` pose `tac`, `lambdasZones` le lit ; `styleFormation` et les autres clubs ont `tac`
  à 0), point faible désigné à la cellule d'analyse
  (`pointFaible` : la zone où l'adversaire est le plus en retard sur vous) ; **jeune du cru** (académie 2 ou château) :
  un gamin de 17 ans chaque été, note 55-62, potentiel 78-86 (84-90 au château), annoncé au debrief (`jeuneDuCru`,
  appelé après le changement de saison) ; **mise au vert** (château) : +3 de moral avant un derby (`jouerJournee`), un tour
  de Coupe de France (`coupeJoue`) ou une manche européenne (`euroJoue`).
  **L'écran Club** (`centreHTML`, sous le stade) : titre = le palier, sa phrase, la maquette (`maquetteCentre`, en cache
  `CACHE_CENTRE` comme le stade, ~80 Ko, badge « 🏗 … · J-n » pendant un chantier), le compteur « x / 18 » et sa jauge vers
  le palier suivant, un bouton par famille (niveau suivant · coût · durée), le bouton doré du château. **Sur téléphone
  (< 600 px)** la maquette est à 190 % dans un cadre qui défile, centrée à l'ouverture, avec « Faites glisser la maquette
  du doigt pour faire le tour du campus. » **Aucun paragraphe de mode d'emploi** : l'effet d'un niveau se lit dans la
  fenêtre de lancement.
  **La carte de livraison** : `ouvreLivraisonCentre`, chaînée juste après `ouvreLivraison` du stade dans `ecranCalendrier`.
  `scene(etat, {focus, aube:true})` avant et après, l'après en fondu par-dessus, le car des pros, la brume ; surtitre
  « LIVRAISON · LUNDI, 7 H 30 · CENTRE D'ENTRAÎNEMENT », titre = nom du niveau, sous-titre = `sous`, chiffres = `eff`,
  « Le centre devient : … » si le palier change. Château : « INAUGURATION · LE CHÂTEAU », lumière dorée et feu d'artifice.
  **Migration** (`migreCampus`, dans `migre`) : `G.centre = n` donne `min(3, n−1)` aux terrains, à la physique et au médical,
  `min(2, n−1)` à l'académie, 0 à la vie et à la vidéo, chaque niveau borné par `nivMax` de la saison en cours ; `G.centre`
  est supprimé. `ameliorerCentre` et le bloc « Centre d'entraînement · niveau x/5 » ont disparu.
  **Calibrage mesuré** : `harness.cjs` 2,393 / 2,409 / 2,416 avant, 2,421 / 2,388 / 2,410 après ; section G de
  `harness-centre.cjs`, même graine : 2,473 campus à zéro, 2,475 au maximum.
  **Pièges rencontrés** : (a) **collision d'identifiants SVG** : `vueVille` du stade prend le préfixe `c` par défaut et
  produirait `cHalo`, le même nom que le halo du centre (d'où le préfixe `ct`). (b) **La formation adverse reste visible de tous
  (choix de l'auteur, 28/09/2026)** : la consigne la réservait au magnétoscope (vidéo niveau 1), livré ainsi en v1.53 ;
  l'auteur l'a rendue à tout le monde en v1.54. Le magnétoscope ne garde que +1 % au duel du milieu (texte corrigé dans
  le prototype, puis greffe relancée). (c) **Le niveau 0 de l'académie ne donne rien** alors que
  l'ancien centre au niveau 1 donnait +2 de note aux jeunes montés : une partie neuve fait monter des gamins un peu plus
  bruts qu'avant (voulu par la consigne). (d) Au harnais, **l'entretien se mesure en différentiel** (même graine, une
  seule différence : deux terrains, 10 000 FF d'écart exact) ; et le compte à rebours d'un chantier se lit AVANT la
  journée, l'objet étant décrémenté pendant. (e) Les bornes de `monteeCentre` (45 à 72) rognent la mesure de l'académie
  pour un club prestigieux : le harnais mesure à prestige 4. Validation : **`harness-centre.cjs`** (A à I).
- **Staff technique — coachs spécialisés (v0.69)** : le 2e pilier « je construis mon club ». Six **postes fonctionnels**
  (`STAFF_POSTES` : attaque, defense, gardien, cpa, physique, mental) qu'on POURVOIT en recrutant un coach — modèle
  **hybride** : chaque recrue a un **nom généré** (`COACH_PRENOMS`+`NOMS`) et une **petite phrase** de caractère
  (`COACH_PHRASES`, distinctes entre candidats). État : **`G.staff`** (objet, migré, vide au départ), chaque poste
  `null` ou `{nom, tier (1-3), phrase, salaire}`. `genCandidatsCoach(id)` offre **toujours un éventail fixe** — un
  **as (★★★)**, un **confirmé (★★☆)**, un **espoir (★☆☆)** — pour que le choix soit vrai (v0.70 : avant, deux ★★★
  identiques pouvaient sortir) ; le prestige ne gate plus la qualité, c'est l'**indemnité + le salaire** qui réservent
  l'as aux clubs qui en ont les moyens. `ouvreRecrutement(id)` (modale `#fiche`, candidats en var module `_COACHCANDS`)
  → `embaucherCoach(idx)` (débite l'indemnité `tier*1.8 MF` de `G.tresorerie`, pose le coach) ; `remercierCoach(id)`
  libère. Panneau `staffHTML()` sur l'écran Club (boutons `.bCoachIn`/`.bCoachOut`). **Effets = NUDGE, mon match seul**
  (via `coachTier(id)`, neutre sans coach et vide au harnais → **calibrage intact, mesuré**) : **attaque** +2 %/tier à
  l'attaque et **defense**/**gardien** −2 %/−1,5 %/tier sur l'adverse (`simuleMatch`, à côté de la consigne) ; **cpa**
  +0,04/tier à la conversion penalty/coup franc (`autoMoment`) ; **gardien** aussi −0,03/tier sur le penalty contre ;
  **physique** −12 %/tier de blessures (tirage de blessure) ; **mental** +0,4/tier de moral/journée (`finirJournee`).
  **Salaire/journée** `tier*130 000 FF` prélevé dans `finirJournee` (`staffCoutJournee()`, affiché à l'écran Finances) —
  l'argent reste une contrainte. Test dédié `test-staff.cjs` (embauche, salaire, effets attaque/CPA mesurés). À migrer
  (`if(!G.staff) G.staff={…null}`). Étendre = ajouter un poste à `STAFF_POSTES` + brancher son `coachTier`.
- **FRAÎCHEUR — l'état de forme physique, joueur par joueur (v1.00)** : chaque joueur des **VINGT clubs de la
  division jouée** porte `j.fraich` (0-100, défaut 100 via l'accesseur `fraich(j)` — un joueur sans jauge, vivier
  ou autre division, est donc toujours traité comme frais, sans exception à écrire). **Barème** : `FRAICH_MATCH`=20
  pour un match complet, **au prorata des minutes pour un bout de match** (`coutMinutes(min)` = 20×min/90, v1.11 —
  voir « LES CHANGEMENTS » ci-dessous ; l'ancien forfait `FRAICH_BANC`=8 a disparu), `FRAICH_SEM`=20 rendus par semaine. **L'horloge
  du jeu est la journée = une semaine** : `reposHebdo(c)` crédite la semaine pour les 20 clubs dans `finirJournee`
  (au même endroit que le décompte blessures/suspensions), et chaque match joué débite. Un match de semaine
  (coupe/Europe) est donc un match de PLUS dans une semaine qui n'est créditée qu'une fois — c'est exactement
  « jouer tous les trois jours ne laisse pas le temps de récupérer », sans aucune arithmétique de dates à tenir.
  **LE VIEILLISSEMENT PORTE SUR LE TAUX DE RÉCUPÉRATION, jamais sur le coût du match** — c'est la clé du design :
  `recupAge(age)` vaut 1 jusqu'à 29 ans puis −0,025/an (plancher 0,78), donc un joueur de 33 ans est à **98 %**
  sept jours après un match (la valeur donnée par l'auteur), perd ~2 points par journée et doit être ménagé vers
  la mi-saison. Le jeune, lui, repart toujours de 100 : le rythme d'une semaine est tenable, et il DOIT l'être.
  `recupJoueur(j,c)` ajoute vos investissements (centre d'entraînement + préparateur physique, ≤ 0,70 de « soin »)
  qui **comblent une partie du déficit de l'âge sans jamais le supprimer** (`k+(1-k)*soin+0,08*soin`).
  **BARÈME À QUATRE PALIERS, posé par l'auteur (v1.01) — `facteurFraich(j)`** : au-dessus de **90**, RIEN ;
  de **80 à 90**, la performance suit LITTÉRALEMENT le pourcentage de forme (à 82 on rend 82 %) ; de **65 à 80**,
  le coefficient d'impact s'aggrave (pente 0,016/point au lieu de 0,010) ; **sous 65**, impact massif
  (pente 0,020/point, plancher 0,35) **et le moral se met à fuir**. Table : 100→1,00 · 90→1,00 · 89→0,89 ·
  85→0,85 · 80→0,80 · 75→0,72 · 70→0,64 · 65→0,56 · 60→0,46 · 54 et moins→0,35. **Il y a une MARCHE assumée
  à 90** (1,00 → 0,899) : c'est la consigne, et elle rend le décrochage très lisible — ne pas la « lisser »
  sans l'accord de l'auteur. **Quatre effets** : (a) **rendement** — dans `eff()` de `forces()`, à côté du moral ;
  (b) **blessures** — `coefBlessureFraich(j)` multiplie la proba du tirage de `appliqueResultat` : neutre au-dessus
  de 80, ×2 à 65, jusqu'à ×4 au fond (mesuré ×3,5 sur une saison d'effectif cuit) ; (c) **moral** — dans
  `majMoral`, sous 65 : `d -= 0,08*(65−f)` (−1,2/journée à 50, −2,8 à 30), **qu'il joue ou non** — c'est un état,
  pas une sanction de banc, et le seul remède est le repos ; une notification une fois par descente (`j._cuit`,
  levé à 75) ; (d) **sélection** — `noteSel(j)` = note × facteur, **sans autre malus** (la courbe suffit désormais ;
  l'ancien malus de préservation sous 40 a été retiré). C'est (d) qui fait que
  **`onze()` fait tourner tout seul, pour VOUS COMME POUR L'IA, avec la même fonction et sans code dédié** :
  un cadre à 84 sur les rotules passe derrière une doublure fraîche à 72. **Le ★ (`j.titu`) reste plus fort que
  tout** — on peut toujours assumer un cadre cramé. **🛌 `j.repos`** (bouton de l'écran Effectif, `mettreAuRepos`)
  l'écarte du onze ET du banc via `alignable(j)` = `dispo(j) && !j.repos` — mais **`dispo()` n'a PAS changé**, donc
  la feuille de match réglementaire et le plancher d'effectif ne bougent pas, et `onze()` le rappelle si son poste
  est trop dégarni (jamais de forfait). Le repos se lève tout seul à ≥ 90 avec une notification.
  **PIÈGE ÉVITÉ, à ne pas réintroduire** : dans `majMoral`, un joueur `repos` ou sous 70 de fraîcheur **ne fait plus
  tourner `sansJouer`** — sinon ménager un cadre le punissait DEUX fois (jambes lourdes + moral en berne) et la
  décision que la fraîcheur rend nécessaire devenait une faute. Un homme qu'on ménage n'est pas un homme qu'on écarte.
  **Affichage** (mot d'époque, choix auteur) : `libFraich` → Frais ≥ 90 / Entamé ≥ 80 / Émoussé ≥ 65 / Jambes
  lourdes ≥ 50 / Sur les rotules — **les paliers d'affichage épousent EXACTEMENT les bornes du barème**, le mot lu
  et la sanction encaissée désignent la même chose ; toucher à l'un impose de toucher à l'autre. **Depuis v1.09**
  (retour de playtest « la barre de forme prend trop de place »), chaque palier de `FRAICH_PALIERS` porte aussi un
  **émoji** (4ᵉ case : 💪 😐 😓 🥵 🥴) : la colonne « Forme » de l'écran Effectif affiche **le chiffre coloré + l'émoji**
  (le mot passe en infobulle), et le ⏳ des 30 ans et plus a glissé devant l'**âge**, dont il parle. La jauge
  `jaugeFraich` reste dans la fiche joueur, qui a la place (jauge + émoji + mot + x/100),
  ligne détaillée dans la fiche joueur, `apercuRotation(rot)` sous les boutons de rotation des trois écrans de
  rendez-vous de semaine, et un **avertissement d'avant-match** sous la feuille de match quand des titulaires sont
  sous 90 (rouge sous 65). **ÉQUILIBRE À CONNAÎTRE** : `FRAICH_MATCH` = `FRAICH_SEM` = 20, et `finirJournee`
  débite le match PUIS crédite la semaine — donc un joueur qui joue chaque samedi se présente **toujours à 100**,
  mais un seul rendez-vous de semaine le laisse **à 80 durablement** : jouer chaque semaine ne rend jamais les
  vingt points perdus, seule une journée sautée les rend. C'est la rotation automatique qui la lui offre — et si
  sa doublure est trop faible pour le dépasser même à 80 %, c'est au manager de trancher avec 🛌 Repos.
  **Remises à zéro** : `razStatsClub` (intersaison — deux mois sans match, tout le monde à 100, `repos`
  levé) et `migre()` (`j.fraich=100`, `j.repos=false` → une carrière en cours reprend au frais).
  **LES CHANGEMENTS (v1.11, question de l'auteur : « un joueur qui rentre perd-il autant que les titulaires ? »)** —
  avant, l'entrant payait un forfait de 8 quelle que soit sa minute d'entrée, **personne ne sortait** (les onze
  payaient 20, soit 244 points par équipe au lieu de 220), les minutes n'existaient que dans le texte du direct,
  et le moteur tirait buteurs, passeurs, cartons et figurants parmi les onze du coup d'envoi pendant 90 minutes :
  l'entrant ne marquait jamais, et l'homme qu'il relevait pouvait marquer après être sorti. Désormais :
  (a) **`tireSubs(c, decal)`** rend `{xi, banc, sort, min}` pour les **vingt clubs**, tiré **AVANT le coup d'envoi**
  par `jouerJournee` : chaque entrant relève le titulaire **de son poste** qui rend le moins (`noteSel`), vers la
  57e/65e/73e (+3 pour le visiteur) ; un remplaçant sans titulaire de son poste à relever (deux gardiens tirés au
  banc, trois avants pour deux places) reste assis. (b) **`appliqueResultat`** fait payer à chacun ses minutes :
  `coutMinutes(sortie)` au titulaire (90, sa minute de remplacement, ou celle de son **rouge**), `coutMinutes(sortie−entrée)`
  à l'entrant — **un poste coûte toujours 20**. (c) **`CHANGEMENTS`** (id du club → sa feuille) et l'horloge
  **`MIN_JEU`** (posée à chaque minute par `simuleMatch` et `simuleReste`) font de **`enJeu(c, m)`** « qui est sur la
  pelouse à la minute m » : `tireur`, `passeur`, `agressif`, `quelconque`, les tireurs de coups francs, `tireMoment`
  (à la 90e), `gardienDe` et les deux fenêtres de moment qui cherchent le gardien adverse passent par lui. **`expulse(c, j, m)`**
  sort l'expulsé de la pelouse et **annule le changement prévu plus tard pour lui** (on ne remplace pas un
  expulsé). `rejoueDepuis` garde les lignes de changement pas encore montrées (sauf celle qu'un rouge du fil recollé
  annule) et rend sa place à l'homme dont il efface le rouge. **`forces()` reste sur `onze()`** : la force d'une
  équipe ne bouge pas avec ses changements. `CHANGEMENTS` est **vidé par `jouerJournee` et par `finirJournee`** : la
  coupe et l'Europe, jouées ensuite, retombent sur `onze()` comme avant (elles n'ont toujours pas de remplaçants).
  Le direct écrit « **X entre à la place de Y** » (lignes `ic:"sub"` portant `cote` et `uid` de l'entrant).
  **Mesuré** : 2,4073 → 2,4079 buts/match (20 passes de `harness.cjs` par version, 15 120 matchs chacune) ; les
  entrants marquent ~9 % des buts. **PIÈGE, à ne pas réintroduire** : un nouveau tirage de joueur « en jeu » dans le
  moteur ou dans un direct de championnat doit passer par `enJeu`, jamais par `onze()` — sinon un sortant revient.
  **LES GARDIENS (v1.13, consigne de l'auteur : « un gardien ne peut pas être remplacé en cours de match, sauf blessure
  ou carton rouge ; si le titulaire prend un rouge, on remplace un joueur de champ par le gardien remplaçant, qui prend
  son poste de gardien »)** — avant, `tireSubs` relevait poste pour poste, donc le gardien du banc entrait souvent à
  la place du titulaire pour la tactique, et un gardien expulsé laissait toujours la cage vide (×1,34). Désormais :
  (a) **`tireSubs` saute les gardiens** : les trois entrants prévus sont des joueurs de champ. (b) **`expulse` rend
  `releveGardien(c, m, gk, "rouge")`** quand l'expulsé est un gardien et qu'il n'en reste plus sur la pelouse : un
  **joueur de champ du onze de départ** sort — un attaquant d'abord, de préférence celui qu'on comptait déjà sortir,
  sinon celui qui rend le moins — et le **meilleur gardien `alignable` hors du onze** entre **à la minute même**,
  sur l'une des **trois places** : s'il reste un changement prévu plus tard, il saute (celui du sacrifié, sinon le
  dernier). **Un seul gardien par feuille** : si un gardien est déjà dans `banc`, pas de second relais. Sans
  gardien sur le banc (`raison:"banc"`) ou changements épuisés (`raison:"trois"`), un joueur de champ — un défenseur
  si possible — **enfile les gants** et la cage reste une passoire. (c) **`malusRouge(gardien, rel)`** : ×1,34 seulement
  quand plus personne de métier ne garde les buts, ×1,18 sinon — le direct relit le même barème grâce au drapeau
  `c.releve` de la ligne du rouge. (d) **La ligne suit le rouge** : `ligneApresRouge` écrit le relais (`SUBS_URGENCE`,
  ligne `ic:"sub"` avec `urg:"rouge"`) ou le joueur de champ dans les buts, **juste sous le rouge, par le moteur
  lui-même** (simuleMatch ET simuleReste) ; `jouerJournee` n'écrit plus que les changements prévus
  (`lignesChangements`). `poolRougeGK` retire « son remplaçant enfile les gants » quand personne n'entre. Toute ligne de
  changement porte aussi `out` (uid du sortant). (e) **La blessure** : le moment `gants` de la 90e appelle
  `releveGardien(moi, 90, gk, "blessure")` — le gardien du banc relève le blessé poste pour poste s'il reste un
  changement (rare : il faut qu'un rouge en ait fait sauter un), sinon un joueur de champ nommé enfile les gants.
  C'est la SEULE blessure en plein match du moteur (les autres se tirent après le coup de sifflet). (f) **Défaire un
  rouge** : la feuille garde `annules` (changements sautés, avec `par` = l'uid de l'expulsé) et `urgence` (uid de
  l'entrant → `{cause, par}`) ; `rejoueDepuis` efface les rouges du fil **à rebours**, renvoie le gardien d'urgence sur
  le banc, rend les changements sautés **avec leur ligne**, et trie les lignes de changement contre la feuille AVANT et
  APRÈS la re-simulation (sinon la ligne d'un relais effacé puis refait par le nouveau fil sortirait en double).
  **PIÈGE** : `enJeu` ne fait qu'un saut (onze de départ → entrant) — c'est pourquoi on ne sacrifie jamais un entrant.
  Gardé par la **section J de `harness-fraicheur.cjs`**.
  **Calibrage intact** : l'effet est SYMÉTRIQUE (les 20 clubs le subissent, l'IA tourne comme vous), donc ce que
  l'attaque perd, la défense adverse le perd aussi — mesuré 2,419 (sans fatigue) → 2,432 buts/match sur 15 120
  matchs. **Contre-intuitif mais vérifié** : un barème PLUS dur laisse les effectifs PLUS frais en fin de saison
  (98/100 en championnat seul, 87 avec une campagne européenne jouée à fond), parce que la sélection écarte plus
  tôt et que personne n'a le temps de sombrer ; en contrepartie un cadre ne joue plus que ~21-28 journées sur 34.
  Une **trêve internationale** coûte 8 points aux sélectionnés (`selections`) : la trêve n'en est une que pour
  ceux qui restent. Harnais dédié : **`harness-fraicheur.cjs`** (barème, saison du vétéran, rythme à trois jours,
  sélection, effets mesurés, symétrie IA, intersaison/migration, et un **test de rendu** qui appelle réellement
  les six surfaces d'affichage à toutes les valeurs de jauge).
- **L'HOMME DU MATCH (v1.06)** — le moment de plus par journée, pour presque rien : la feuille de match
  portait déjà tout (buteurs, passeurs, gardiens, rouges), il ne restait qu'à **nommer** celui qui a fait la
  différence. **Rien de neuf n'est simulé** : on relit. Trois pièces :
  • **La matière**. Votre rencontre s'écrit au téléscripteur (`ev` porte `uid`/`pasUid`/`c.uid`) et se relit par
    **`faitsDuFil(ev)`** ; les dix-neuf autres sont **muettes** (aucune ligne n'est tirée quand `verbeux` est faux)
    et alimentent désormais **`FAITS`**, un tableau module où `marque()` dépose deux entiers par but, quoi qu'il
    arrive. `simuleMatch` **le réaffecte** (`FAITS=[]`, jamais `.length=0` — le match précédent garde le sien) et
    le rend sur `R.faits`, avec `R.gk` = les **uid des deux portiers du coup d'envoi** (l'effectif aura bougé
    quand on relira la feuille : fatigue, blessures).
  • **Le barème** (`hommeDuMatch`) : but 3,0 · passe décisive 1,7 · cage inviolée 2,4 (+0,3 si l'équipe gagne) ·
    victoire 0,8 · départage discret par `note/400`. **Un carton rouge DISQUALIFIE** — on ne décore pas l'homme
    qui a laissé les siens à dix. Les chiffres sont calés pour que **le 1-0 reste le match de SON buteur**
    (3,8 contre 3,5) et que le gardien l'emporte quand il n'y a rien d'autre à raconter (le 0-0). Mesuré sur
    trois saisons : 75 % d'attaquants/milieux buteurs, ~5 % de gardiens, 1 % de défenseurs — et des motifs variés
    (`motifHdm` : « un doublé et une passe décisive », « la cage inviolée »…).
  • **Le branchement**. `designeHdm` incrémente **`j.hdm`** (compteur de saison, remis à zéro par `razStatsClub`,
    migré par `migre`) et renvoie une fiche LÉGÈRE (uid/nom/club/motif, pas de référence au joueur : elle part
    dans `G.hdm` donc dans la sauvegarde). Les matchs IA sont nommés dans `jouerJournee` (après
    `appliqueResultat`) ; **le vôtre l'est dans `finirJournee`**, et pas ailleurs — c'est le seul endroit où
    `r.ev` est définitif (une re-sim tactique a pu effacer des buts pré-tirés) et où le but du **moment de la 90ᵉ**
    est connu, qu'on ajoute à la main aux faits. Rendu : une ligne sous la feuille de match (`.fmatch .hdm`),
    une ligne de debrief (`notif`, différente selon qu'il est à vous ou en face) et **+4 de moral** s'il est à vous.
  **Championnat seulement** : la coupe et l'Europe ont leurs propres soirées, et le classement des hommes du
  match (3ᵉ table de l'écran Classement, `grid3`) n'aurait plus de sens s'il mélangeait les compétitions.
  Harnais dédié : **`harness-hdm.cjs`** (sections A à E).
- **LE BILAN DE SAISON — LA PAGE D'ALMANACH (v1.06)** : l'intersaison enchaînait les opérations sans qu'on ait
  jamais relu la saison vécue. `ecranBilan()` remplace le maigre panneau « Saison terminée » et raconte
  **l'équipe type** (le 4-4-2 de la division, `coteSaison` = note + 3×hdm + 1,5×buts + passes, ≥ 12 matchs joués),
  **le buteur**, **le match de l'année** (`matchDeLannee` relit `G.histo` : total de buts + 1,2× le score du perdant,
  bonus si vous y étiez), **la phrase de la saison**, **la dépêche la plus sulfureuse** et **l'homme de la saison**
  (le plus décoré de VOTRE effectif). C'est le pendant de fin de saison du mot d'ouverture (`ecranIntro`).
  **PIÈGE STRUCTURANT** : il se rend **ENTRE `G.finie` et `intersaison()`**, parce que `razStatsClub` remet buts,
  passes et `hdm` à zéro et que `intersaison` vide `G.histo`. Rendu après, il ne trouverait que des compteurs à
  zéro — ne jamais le déplacer dans la chaîne. **On n'archive rien pour lui** : tout est déjà en mémoire au coup
  de sifflet final… **sauf deux chaînes**. La revue de presse ne garde que 6 lignes et les dépêches 60 : en mai,
  tout ce que la saison a produit de mémorable a depuis longtemps défilé. D'où **`G.alm`** = `{phrase, depeche}`,
  deux `{t, j, s}` et pas un octet de plus, alimentés **une fois par journée** par `retientAlmanach()` (appelé dans
  `finirJournee` juste après `genPresse`), qui garde le **maximum courant** d'un score d'éclat (`eclatLigne` :
  lexique `MOTS_ECLAT`/`MOTS_SOUFRE` + capitales du titreur + points d'exclamation, chaque ingrédient plafonné).
  Réinitialisé à `nouvellePartie` et à `intersaison`, migré par `migre`. Coût mesuré : **~300 octets** pour
  l'almanach, **~1 % de la sauvegarde** compteurs `j.hdm` compris.
  **Un manager remercié garde sa page** : l'écran LIMOGÉ porte un bouton « 📖 Lire le bilan de la saison » quand
  `G.finie` est vrai (les stats sont intactes, `intersaison` n'a jamais tourné), et le bouton du bas du bilan
  devient « ← Revenir » au lieu de « PASSER À L'INTERSAISON ». Harnais : **`harness-hdm.cjs`** (sections F et G).
- **LA MÉMOIRE LONGUE DU CLUB (v1.08)** — jusqu'ici la carrière était une ligne droite sans repères : on
  reprenait une sauvegarde sans savoir pourquoi on jouait, aucune saison n'en avait vu une autre, et un joueur
  n'était qu'une note. Cinq pièces, toutes en **LECTURE** de ce que le moteur produit déjà — **aucun effet
  moteur, calibrage mesuré identique** (2,509 → 2,510 buts/match sur 2 280 matchs, six carrières complètes
  avant/après). Le module vit d'un bloc juste après `retientAlmanach()`.
  • **LES ACTES** (`ACTES`, `acteDe(j)`) — les quatre saisons du calendrier (règle fondamentale plus haut)
    deviennent des **chapitres visibles** : un bandeau en tête de l'écran match (« ACTE III · L'HIVER —
    journée 22 sur 38 »), et à chaque bascule (J8, J16, J27) un **mini-bilan** au debrief (`bilanActe`) qui
    relit `moi.forme` sur la tranche — V/N/D, points pris, où l'on en est, ce qui s'ouvre.
  • **L'ENJEU** (`enjeuDe(o)`, `PALIERS_D1`/`PALIERS_D2`) — le rang et l'écart en points avec le **palier le
    plus proche** (titre, podium, Europe, montée, maintien), formulé selon qu'on le **chasse** ou qu'on le
    **garde** : « 5ᵉ, à 2 points de l'Europe », « 17ᵉ, 3 points d'avance sur la zone rouge ». **PUR** : prend
    un OBJET (G **ou une sauvegarde relue**) et n'appelle jamais `classement()`, qui lit G. C'est ce qui permet
    d'écrire la ligne sur la carte d'accueil d'une carrière **sans rouvrir ses 500 Ko** (voir `ligneEnjeu`).
    **Une barre qui bouge** : à la **J19 (trêve)** et à la **J29**, `motDuPresident()` reformule l'enjeu RÉEL au
    debrief et dans la presse — l'écart, les matchs restants, et le nom des deux voisins de classement.
  • **« CE MATCH COMPTE PARCE QUE… »** (`raisonsMatch(o)`, également pur) — six raisons, par ordre de priorité :
    derby (`RIVAL`), bête noire non battue, adversaire direct (±3 places, à partir de J8), **ancien du club en
    face** (`j.exMien`, posé par `quitteMaison`), série de 3+ victoires/défaites, record du club à portée.
    Rendu sous l'affiche de l'écran match (3 lignes au plus) et sur l'écran de reprise ; le champ `court` de
    chaque raison sert la carte d'accueil (« samedi, le derby »).
  • **LES RECORDS DU CLUB** (`G.records`, `RECORDS`, `poseRecord`/`crieRecord`) — six lignes, `{v,t,s,j,anc}` :
    meilleur classement, plus large victoire, plus longue série sans défaite (`G.serieInv`, compteur qui
    traverse les saisons), record d'affluence, meilleur buteur sur une saison, plus jeune buteur (`v` comparé
    **à l'envers**). **Le PREMIER record se pose EN SILENCE** — en saison 1 tout est un record, ça n'a aucune
    valeur ; c'est celui qui en fait **tomber** un qui part au debrief et à la presse. Le **palmarès** retient
    désormais aussi la **montée**, la **finale de Coupe** (`G.coupe.tourSortie==="Finale"`), le **maintien
    arraché** (D1, entre n−5 et n−3) et le **jubilé** d'une légende — le mur du club que lit le mot d'ouverture
    a enfin quelque chose à afficher. Affiché sur l'écran Club (panneau « Direction & mémoire »).
  • **LA FICHE DE VIE** (`j.bio`, `ouvreBio`/`cumulBio`/`soldeBio`/`ajouteMoment`) — **pour VOTRE effectif
    seulement** (un objet de plus sur 800 joueurs pèserait ; sur seize, non) : saison et **mode d'arrivée**
    (`origine`/`forme`/`achat`/`libre`/`joker`, libellés dans `BIO_MODES`), matchs/buts/passes/distinctions
    cumulés **sous nos couleurs**, et **trois moments au maximum** (premier but en pro, but dans le derby,
    triplé, penalty ou coup franc décisif de la 90ᵉ, but d'anthologie) — au quatrième, c'est le moins marquant
    (`w`) qui sort. **PIÈGE DU DÉCOMPTE** : `razStatsClub` remet buts/matchs à zéro chaque été, donc
    `soldeBio()` **solde la saison dans la fiche au coup de sifflet final** (dans `finDeSaison`, avant
    l'intersaison) et `b.dec` retient les compteurs **au moment de l'arrivée** pour ne pas s'attribuer ce
    qu'un joueur a fait ailleurs avant janvier ; `intersaison` remet `b.dec` à `null` juste après les
    `razStatsClub`. Ne jamais lire `b.m` seul : toujours `cumulBio(j)`. **Où ça ressort** : le bloc « Sous nos
    couleurs » de la fiche joueur, le **jubilé** dans `vieillirClub` (≥ 80 matchs maison → récit d'adieux,
    presse, palmarès, +3 de réputation), les **sifflets du virage** quand on vend un enfant du club
    (`enfantDuClub` → `quitteMaison` : −5 de réputation, −4 de moral au vestiaire, −3 de confiance, une ligne
    de presse), et le mot d'ouverture qui désigne **l'homme sur qui on compte** par son HISTOIRE et plus par sa
    seule note. L'étoile **« Suivre »**, qui ne servait qu'à filtrer le mercato, remonte au debrief :
    `noteSuivis()` relève les chouchous AVANT le coup d'envoi (dans `jouerJournee`), `debriefSuivis()` raconte
    leur samedi — **trois lignes au plus par journée**.
  • **LE BAROMÈTRE DES TRIBUNES** (`G.affJ` la saison en cours, `G.affS` les douze dernières, `baroTribunes`,
    `veilleAffluence`) — l'affluence n'était qu'une jauge instantanée ; sans tendance on ne sait jamais s'il
    faut agrandir le stade ou toucher au prix des places. La dépêche de billetterie dit maintenant le **sens**
    (« ▲ +2 618 par rapport au dernier match à domicile »), l'écran Club porte un **histogramme** des matchs à
    domicile + la moyenne + la comparaison à l'an dernier + le record + un conseil (`conseilTribunes`), et
    `veilleAffluence` prévient au debrief quand trois matchs de suite frôlent le guichet fermé (« le stade est
    devenu trop petit ») ou quand le remplissage décroche de 10 points sur un mois (« les gradins se vident » —
    avec le palier tarifaire nommé). **Une alerte par tendance et par saison** (`G._affCri`, remis à zéro à
    l'intersaison). `G.affHist` (la jauge existante) est conservé tel quel.
  • **« OÙ EN ÉTIONS-NOUS ? »** (`pointDeSituation`/`ecranReprise`, `REPRISE_DELAI`=24 h) — `chargeLocale`
    l'affiche quand la dernière sauvegarde date de **plus d'un jour** ET que la carrière est en cours (pas
    `vire`/`finie`/`intro`/`recap`, journée < 38) ; sinon on va droit au terrain comme avant. **On n'archive
    RIEN pour lui** : rang et écart, les cinq derniers scores relus dans `G.histo`, la phrase que l'almanach a
    retenue, l'arc en cours, le prêté qui rentre, le chantier du stade, le coup de la semaine, les offres en
    attente, et le prochain match avec ses raisons. Accessible à la demande par le bouton **📖 Où en étions-nous ?**
    du bandeau d'acte. Le rendu passe par `chrome("calendrier", …)` : la nav reste là, on n'est jamais coincé.
  **Poids mesuré** : records + baromètre ≈ 1,1 Ko, toutes les fiches de vie de l'effectif ≈ 2,8 Ko, soit
  **0,6 % de la sauvegarde**. Harnais dédié : **`harness-memoire.cjs`** (sections A à I).
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
- **PLANCHER RÉGLEMENTAIRE DE L'EFFECTIF (v0.91)** — le garde-fou qui manquait, remonté en playtest :
  « j'ai vendu mes deux gardiens et j'ai quand même pu jouer ; ensuite j'ai vendu presque tous mes joueurs
  et j'ai perdu 36-0 ». Rien n'empêchait de vider son effectif, et `forces()` divise l'attaque par 6 et la
  défense par 5 **quel que soit le nombre de joueurs présents** → un onze à quatre s'effondre à −37 de
  différence de buts. La règle posée est celle de la Ligue de l'époque : **une feuille de match, c'est
  11 titulaires + 5 remplaçants, dont deux gardiens**, donc un club engagé tient en permanence
  **`PLANCHER_TOTAL`=16 joueurs sous contrat** et **`PLANCHER={G:2,D:4,M:4,A:2}`** (de quoi aligner le 4-4-2
  avec un portier de rechange). Trois pièces :
  • **`manqueEffectif(c, sansJ)`** = ce qui manque à un club, le départ de `sansJ` déjà déduit (objet vide =
    en règle) ; **`refusDepart(c, j)`** = le motif de refus d'un **départ volontaire**, ou `null`. Branché sur
    **TOUTES** les sorties choisies : `listerVente`, `ventesEnCours` (un départ déjà listé est **gelé**, pas
    exécuté), `venteEclair`, `preteJoueur` (un prêté sort de `moi.joueurs`, donc de la feuille de match) et
    `accepterOffreExt`. Les boutons « Vendre »/« Prêter » de l'écran effectif sont **grisés avec le motif en
    infobulle** (calculé une fois par poste dans `blocVente`), et le bouton « Accepter » de l'offre étrangère
    aussi — on ne découvre pas le refus après coup.
    **La FICHE du joueur porte le même bouton depuis v1.04** (demande de l'auteur : elle n'offrait que la vente
    éclair, donc la seule sortie proposée sur cet écran était celle qui brade à −40 %). `#bListe` appelle
    `listerVente(j)` — même garde, même motif en infobulle via `blocL` — puis **rejoue `ouvreFiche(j)`** pour
    que le libellé bascule en « Retirer de la liste » : `listerVente` rafraîchit l'écran DERRIÈRE la modale
    (`montre("effectif")`), pas la modale elle-même. La fiche affiche aussi désormais les deux **lignes de
    situation** (📤 prêté à tel club, 🏷️ sur la liste des transferts avec ce que la fenêtre autorise),
    rangées **après** le bloc identité/stats pour ne pas couper Poste → Note → Valeur.
  • **`veilleEffectif()`** = le filet de sécurité, passé **avant chaque journée** (tête de `jouerJournee`,
    après `ventesEnCours` dans `finirJournee`, tête de `ecranCalendrier`) et dans **`migre()`** (une
    sauvegarde déjà saccagée se remet en règle au chargement). Il balaie **les deux divisions** : tout club
    sous le plancher signe des joueurs libres (**`pige()`**, note ~45-60, jamais un crack), et tout club dont
    `onze()` ne rend pas 11 disponibles (cascade de blessures) est complété de même. Pour VOTRE club c'est
    **facturé** (0,25 MF par pige) et annoncé (dépêche + notif) ; les clubs IA se dépannent en silence —
    **c'est ce qui fait qu'un adversaire à qui on prend son gardien en rachète un autre** au lieu de jouer
    sans portier. Idempotent, donc appelable partout sans risque.
  • **La soupape** : les petits clubs démarrent PILE à 16 (Le Havre, Bastia…) → sans issue, ils ne pourraient
    rien vendre de la saison. **`monteeCentre(pos)`** fait monter un jeune du centre de formation en pro,
    **`MONTEES_MAX`=2 par saison** (compteur `G.montees`, remis à zéro à l'intersaison), qualité indexée sur
    `G.centre` — boutons G/D/M/A sous la ligne de plancher de l'écran effectif. On retrouve de la marge en
    échange d'un joueur **brut**, pas d'un renfort : la contrainte reste une contrainte. (À partir de la 2ᵉ
    saison le problème se pose moins : `vieillirClub` ajoute déjà un jeune de plus que `CIBLE` chaque été.)
  **L'adversaire n'est pas un supermarché** : `acheter()` refuse au-delà de **`QUOTA_CESSIONS`=2 joueurs par
  club et par saison**, et de **`QUOTA_CESSIONS_G`=1 gardien** (compteurs `c._cedes`/`c._cedesG`, remis à zéro
  par `razStatsClub`). En contrepartie `finaliseAchat` **ne fabrique plus un clone à chaque vente** (c'était un
  `genJoueur` systématique, donc un faux nom de plus par transfert) : le vendeur **encaisse 90 % du prix** sur
  son budget et ne se dépanne que s'il passe réellement sous le plancher, via `veilleEffectif()`. **Aucun effet
  moteur** (rien dans `simuleMatch`) → calibrage intact, mesuré 2,392 / 2,371. Validation dédiée :
  **`harness-effectif.cjs`**. **Piège à ne pas rouvrir** : toute NOUVELLE façon de faire sortir un joueur de
  l'effectif doit passer par `refusDepart` si elle est volontaire ; si elle est subie (arc narratif `vendMome`,
  retraite), la laisser passer et compter sur `veilleEffectif` — jamais bloquer une décision de scénario.
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
  **Lisibilité (v0.61, retour de playtest « on a du mal à comprendre qui a marqué »)** : la fenêtre `#butFlash .led` est
  **plus grande** (`min-width:560px`, `max-width:640px`) et le texte d'explication `.dettxt` est **aligné à gauche**, plus
  gros (18px), dans un encadré filet cyan — on y lit le buteur. Ne pas re-centrer ni rétrécir `.dettxt`.
- **Images de moment (« humaniser le jeu »)** : des **vignettes pixel-art** embarquées en **`data:` URI** (zéro
  requête réseau préservée) illustrent certains temps forts. Toutes les data: URI vivent dans la table
  **`IMG_MOMENT`** (déclarée près de `DOG_ART`), une entrée par moment, **chaque entrée est un tableau** (on
  **pioche au sort** via `PICK` pour varier). Deux canaux d'affichage :
  • **Flash** (`celebreFlash`) — champ **`o.img`** : rend une vignette avec titre + score **en bandeau
    surimpression** (CSS `.vignette`/`.vimg`/`.bandeau`, dégradé sombre en haut pour la lisibilité) au lieu du
    gros titre seul. Branché sur **`cagade`** (titre rouge, classe `contre`), **`but50`** et **`geste`** (les deux
    en « 🌟 BUT D'ANTHOLOGIE ! ») via `img:IMG_MOMENT[lg.mo]?PICK(IMG_MOMENT[lg.mo]):null` — `cadeau` reste sans
    image (clé absente → null).
  • **Overlay interactif** — le moment **`coupfranc`** (`momentCoupFranc`) n'est pas un flash mais une carte de
    choix (`cadreMoment`) : son image est un **bandeau d'illustration** en tête du corps (`<img class="momImg">`,
    plafonné à 200px de haut, `image-rendering:pixelated`).
  Les **PNG source** vivent dans `championnat/img/` (`cagade-arconada/general`, `lucarne` = but50,
  `retourné` = geste, `coup-franc` = coupfranc) **uniquement pour régénérer** — le jeu ne les charge pas. Pipeline
  d'ajout : redimensionner ~360px côté max + quantifier la palette (~64 couleurs, renforce le pixel et allège) via
  Pillow, encoder en base64, ajouter à la bonne clé d'`IMG_MOMENT`. **Ne pas** mettre d'images brutes 1 Mo en
  data: URI (poids HTML — l'index.html pèse déjà ~545 Ko avec ces 5 vignettes). Mêmes contraintes que les autres
  overlays : flash nettoyé par `abandonneDirect()`, tout court-circuité en `EN_TEST`.
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
- **Commentaires du direct — enrichissement sur corpus réel (v0.83, lot 1)** : le téléscripteur ne
  racontait que le tir et le carton. Dépouillement de **17 lives réels de L1** (1 539 entrées, minute 1
  au coup de sifflet) + 5 lives SoFoot, qui a dicté les réglages plutôt que l'intuition. Enseignements :
  un vrai live tient **90,5 entrées/match**, dont **54 % de texte courant** parlant de ce que le jeu
  ignorait — le **sauvetage défensif en premier poste**, puis les parades, les débordements, l'état du
  rapport de force. D'où **4 familles nouvelles** dans `COMM` : **`sauve`** (11 lignes, `{A}` = l'attaquant
  qui a tenté, le sauveur reste anonyme), **`corner`** (9, `{A}` = le tireur), **`hj`** (6, hors-jeu,
  `{A}` = l'attaquant signalé), **`soin`** (6, choc/infirmerie, `{A}` = le joueur touché). Et surtout le
  bloc **`ETAT`** (15 lignes en 5 groupes **conditionnés par score et minute** : `reprise`, `large`,
  `serre`, `finTendue`, `mou` ; **l'ordre vaut priorité**), lu par **`ligneEtat(m,sh,sa)`** — c'est lui qui
  fait passer le direct de « phrases au hasard » à « on suit un match ». Familles maigres renforcées
  (`amb` +8, `cj` +8, `cr` +6, `arret` +5, `but` +4, `rate` +4, `cjGK`/`crGK`/`cf` +3) : **`COMM` passe de
  90 à 194 lignes**, et de ~13 à **20,6 lignes affichées par match**. **Fréquences** (par minute, calées sur
  le corpus mais **volontairement en retrait du réel** — un vrai live à 90 entrées noierait un téléscripteur
  qui se lit en 90 tics) : `corner` 0,020 · `sauve` 0,018 · `cf` **0,014** · `etat` 0,014 (plus condition) ·
  `hj` 0,010 · `soin` 0,008. Le **coup franc était 3× sous-injecté** (0,0085 alors que le réel est à 0,024) —
  corrigé. **Branché aux DEUX points d'injection** : `simuleMatch` (gardé par `verbeux`) **et** `simuleReste`
  (re-simulation après changement de tactique en direct), sinon le direct retomberait dans l'ancien vocabulaire
  au premier changement de consigne. **Aucune de ces lignes ne touche au score** (même statut que `cf`) →
  **calibrage intact par construction**, mesuré : 2,412 buts/match. Registre : ~70 % « reporter » (la mécanique
  de l'action) / ~30 % « chambreur » (l'ironie SoFoot **transposée en 1995** — on garde le procédé comique,
  jamais les références modernes). **Méthode d'extraction des lives** consignée dans `commentaires-lot1.md` :
  SoFoot rend tout le match au premier chargement ; L'Équipe n'affiche que les 20 dernières minutes mais sa
  page appelle une API interne `sdwh.lequipe.fr/iPhoneDatas/EFR/STD/ALL/V1/Football/Commentaires/<2 derniers
  chiffres de l'id>/<id>.json` qui contient tout, chaque entrée déjà étiquetée par type (`picto_web`).
  **Anti-répétition des lignes de commentaire (v0.88, retour de playtest « le "chacun son métier" du hors-jeu
  revient trop vite »)** : les familles de décor étaient tirées au `PICK` uniforme, sans mémoire → dans un match
  à deux hors-jeu, la même vanne pouvait tomber deux fois. Nouveau helper **`pickNR(pool, vus, garde=40)`** (à
  côté de `PICK`) qui **écarte les lignes déjà servies récemment** (fenêtre `garde`, repli sur le pool complet si
  tout a été vu). Une **mémoire par match `vusC`** (tableau, déclarée en tête de `simuleMatch` ET de `simuleReste`)
  est passée à chaque tirage de décor : `amb`, `cf`, `corner`, `sauve`, `hj`, `soin`, `poteau`, `refuse` (les DEUX
  points d'injection, comme les fréquences). `garde=40` est **volontairement large** pour couvrir tout un match
  (~10-25 lignes de décor) → **aucune ligne de décor ne se répète dans une même rencontre** ; aucun risque
  d'épuiser un pool (les familles rares ne sortent qu'~1×/match). **Purement cosmétique** (ne touche ni au score,
  ni aux `uid`, ni aux stats) → calibrage intact (harnais vert, 2,417) et invariants de re-sim préservés. Le
  `PICK(COMM.but)` du flash de but reste en tirage simple (contexte différent, hors boucle de décor). Vérifié par
  un test dédié (5 000 matchs verbeux : 1 125 avaient 2+ hors-jeu, **0 répétition** d'une même ligne).
  **Extension aux lignes de MONTÉE (v0.90, retour de playtest « la montée "prend sa chance des vingt mètres" revient
  à la 16e et à la 19e »)** : les montées de tension (`MONTEE_BUT`/`MONTEE_FRAPPE`/`MONTEE_CONTRE`) sont générées
  dans le **téléscripteur en direct** (`tic()`), PAS dans `simuleMatch`, donc hors de portée de `vusC`. Nouveau
  helper **`pickM(pool, lignes)`** (à côté de `pickNR`) dont la mémoire vit sur le tableau `lignes` du match
  (`lignes._vusM`, créé à la volée) → **une mémoire par rencontre, sans déclarer de variable**, réutilisable dans
  les **trois** `tic()` (championnat/coupe/europe, qui ont tous `lignes` en portée). Les 7 `PICK(MONTEE_*)` passent
  en `pickM(...,lignes)`. Purement cosmétique (le direct ne touche jamais le moteur). Vérifié : 3 000 matchs de
  5 montées, **0 montée répétée**.
  **Vrai « deuxième jaune » (v0.89, retour de playtest « un 2e jaune sans qu'on ait vu le 1er, ça étonne »)** : les
  lignes de rouge « Deuxième jaune… et donc ROUGE » sortaient au hasard du pool `cr`, même quand le joueur n'avait
  jamais été averti. Elles sont **isolées dans une famille dédiée `cr2j`** (retirées de `cr`, qui ne contient plus
  QUE des rouges directs), et une **mémoire par match `booked`** (Set d'`uid`, déclarée en tête de `simuleMatch`
  ET de `simuleReste`) note qui a déjà pris un jaune. À l'expulsion : `cr2j` **uniquement si `booked.has(uid)`**,
  sinon rouge direct (`cr`/`crGK`) ; chaque jaune (`cj`/`cjGK`) ajoute l'uid à `booked`. **Purement narratif** : le
  taux de rouges et les effets (`susp`, `mulH`/`mulA`) sont INCHANGÉS → calibrage intact (harnais 2,383). Les
  familles de cartons passent aussi en `pickNR` (anti-répétition). Vérifié : 8 000 matchs, 92 « deuxième jaune »,
  **0 sans un premier jaune préalable**.
  **Le coup franc est une phase à part (v0.89, retour de playtest « une montée sur le but ne peut pas finir en coup
  franc »)** : la ligne « Coup franc de {A}… qui frôle la lucarne ! » était mal rangée dans **`COMM.rate`** (le pool
  du tir manqué en JEU OUVERT, qui porte le flag de montée `q.bu`). Une montée de tension (« l'attaque déboule », « X
  à la conclusion ») pouvait donc se dénouer sur un coup franc — incohérent. Cette ligne est **remplacée par un tir
  manqué de jeu ouvert** ; les coups francs vivent **exclusivement** dans `COMM.cf`, injecté comme une **phase
  distincte** (sans `q`, donc jamais précédé d'une montée). Règle générale : **aucune ligne de balle arrêtée dans les
  pools d'occasion de jeu ouvert** (`rate`/`arret`/`rateContre`/`arretContre`). Vérifié : 8 000 matchs, 11 815
  occasions montées, **0 coup franc en résolution de montée**.
  **LA MONTÉE DOIT CONNAÎTRE LA CONCLUSION — DISTANCE ET BALLE ARRÊTÉE (v1.04, retour de playtest « une
  dernière passe arrive en général devant le but, un but de trente mètres arrive de manière soudaine »)** :
  quatrième épisode de la famille météo/contre/coup franc, et dernier point ouvert de la mise en scène. Le
  direct enchaînait « Coup de billard devant le but, ça chauffe… », « Dernière passe pour X, l'occasion est
  immense… », puis « PRALINE DE TRENTE MÈTRES ! » — trois mètres du but, puis trente. Cause : les deux temps
  de la montée sont tirés **sans rien savoir de la ligne de résolution**, pourtant déjà composée (elle vit
  dans `lg.x` depuis `simuleMatch`). Correctif : les conclusions qui **imposent une géométrie** sont déclarées
  à part, recollées dans leur pool par `...` (tirage rigoureusement inchangé) et rassemblées en deux jeux —
  **`TIRS_LOIN`** (6 lignes : la praline de trente mètres, la récupération aux vingt mètres, le lob des
  quarante…) et **`TIRS_ARRET`** (3 lignes nées d'un **corner**). Le helper **`phaseTir(ligne)`** en tire un
  drapeau court **`ph`** (`""` jeu ouvert et finition proche · `"loin"` · `"bal"`) que les **sept** points de
  génération (`marque`, les 4 occasions de `simuleMatch`/`simuleReste`, les 2 de `genEvCoupe`) posent sur
  `g`/`q` — d'où la règle d'écriture : **tirer la ligne dans une variable AVANT de la formater**, le drapeau
  se lit sur le gabarit, jamais sur le texte affiché (noms déjà substitués). `monteeUn` et le nouveau
  **`monteeDeux`** lisent `ph` : le contre garde la priorité au premier temps (il ne croise jamais une balle
  arrêtée — `butContre`/`arretContre` n'en contiennent pas), la distance ne joue qu'au second. Deux paires de
  pools s'ajoutent : **`MONTEE_LOIN`/`MONTEE_LOIN_FRAPPE`** (le bloc tient, rien ne passe, le ballon ressort
  aux vingt-cinq mètres → le porteur arme de loin) et **`MONTEE_ARRET`/`MONTEE_ARRET_FRAPPE`** (le corner
  s'installe, la surface se remplit → le porteur est dans la bousculade, **sans dire s'il tire ou s'il
  conclut**, puisque l'une des deux lignes de but le nomme tireur et l'autre buteur de la tête). Deux lignes
  de `MONTEE_FRAPPE` violaient au passage la règle « agnostique au geste » écrite au-dessus du pool :
  « prend sa chance des vingt mètres » (partie dans le pool lointain) et « Centre au cordeau… au point de
  penalty » (neutralisée). **Purement narratif** : aucun évènement créé, aucun score touché → calibrage
  mesuré 2,410. Vérifié par la **section G de `harness-repetitions.cjs`** : les listes collent aux pools,
  aucune conclusion étiquetable n'est oubliée (filet par le vocabulaire de distance, et par « sur corner »
  — l'origine — contre « en corner » — l'aboutissement), drapeau exact sur 8 909 conclusions en
  championnat/re-sim/coupe, et les trois décors ne se mélangent jamais, ni au premier ni au second temps.
  **Refermé en v1.05** : « Corner rentrant… BUT DIRECT ! » s'affichait suivie d'une « Passe décisive de X »
  alors que la ligne dit justement que PERSONNE n'a touché le ballon. `marque` **tire désormais la ligne
  AVANT de désigner le passeur** (elle servait déjà au drapeau `ph`, elle sert maintenant aussi à cela) et
  coupe le passeur sur les lignes de **`BUT_SANS_PASSE`** — un Set qui ne contient pour l'instant que
  **`BUT_CORNER_DIRECT`**, la ligne extraite de `BUT_ARRET` pour être nommable. **Pour étendre** : écrire la
  nouvelle ligne dans `BUT_CORNER_DIRECT`-bis et l'ajouter au Set, jamais directement dans le pool.
  **Prix mesuré, et plus élevé que l'estimation d'origine** (qui annonçait ~1 %) : le corner direct sort sur
  **3,6 % des buts racontés**, et les passes décisives passent de **~72 % à 68,8 %** des buts, soit **~4,5 % de
  passes en moins** au tableau des passeurs. Aucun effet sur le score ni sur le calibrage (2,443 buts/match).
  Gardé par la **section H de `harness-repetitions.cjs`** : zéro corner direct avec passeur sur ~9 400 buts,
  ni dans le texte ni dans les données de l'évènement.
  **Deux derniers trous refermés en v1.09 (captures de playtest)**. (1) **LE LOB** : « Chevtchenko se présente
  seul devant Szeiler, tout le stade debout… », puis « tente le lob sur le gardien monté trop haut ». On ne lobe
  pas un gardien resté sur sa ligne : la ligne dormait dans `COMM.arret` **sans drapeau** (elle ne contenait
  aucun chiffre, donc le filet « vingt mètres et plus » ne la voyait pas). Le lob devient une **quatrième
  géométrie** : `ph:"lob"`, jeu **`TIRS_LOB`** (`BUT_LOB`/`RATE_LOB`/`ARRET_LOB`, le lob des quarante mètres y a
  rejoint son cousin), et sa mise en scène **`MONTEE_LOB`** (le gardien QUITTE sa surface : long ballon, relance
  manquée, libéro) / **`MONTEE_LOB_FRAPPE`** (le porteur voit le portier loin de sa ligne). Un but et un raté ont
  été écrits exprès : une montée qui ne précéderait que des arrêts **annoncerait l'issue**. La montée ne dit ni
  « lob » ni « recule » — deux résolutions le racontent. (2) **LA MONTÉE NE CHIFFRE JAMAIS LA DISTANCE** :
  « prend sa chance des vingt mètres », puis « PRALINE DE TRENTE MÈTRES ». Toutes les montées ont perdu leurs
  chiffres (« aux vingt-cinq mètres », « à vingt-deux mètres », « aux dix-huit mètres », et « à vingt mètres de
  sa cage » dans `MONTEE_CONTRE`, qui contredisait « avale quarante mètres balle au pied ») : **seule la
  résolution donne la distance**. Et `MONTEE_LOIN_FRAPPE` a été réécrite : elle **installe un homme seul, loin,
  sans raconter ni le geste (« arme », « prend sa chance ») ni la prise de balle** — la résolution les raconte
  déjà (« arme des vingt mètres », « récupère un ballon mal dégagé ») et les aurait dits deux fois, ou dans le
  désordre. **Règle générale, à appliquer à toute nouvelle montée** : le second temps pose un décor (où est
  l'homme, où est le gardien), jamais une mesure ni un geste. Gardé par la **section G de
  `harness-repetitions.cjs`** : lob sans drapeau (au mot « lob » — « lobe son propre gardien », la déviation,
  n'en est pas un), lob présent en but/raté/arrêt, aucun chiffre de dix mètres et plus dans les **neuf** pools de
  montée (fonctions évaluées avec des noms factices ; « six mètres » la zone et « deux mètres » d'avance restent
  permis), aucun geste dans `MONTEE_LOIN_FRAPPE`, et les **quatre** décors qui ne se mélangent jamais. Purement
  narratif : aucun évènement créé, aucun score touché.
- **Météo de match (v0.84, affinée v0.85)** : le même corpus signalait un événement `pluie` qu'on n'avait pas.
  **`METEO`** = 8 temps (`clair`, `eteIndien`, `pluie`, `vent`, `froid`, `brouillard`, `boue`, `neige`), chacun
  avec un `ouv` (fragment ajouté à la ligne de coup d'envoi) et un jeu de lignes `amb` distillées pendant la
  rencontre. **`tireMeteo(journee)` fait tourner le climat AVEC LE CALENDRIER RÉEL DU FOOTBALL** (cf. la règle
  des quatre saisons de jeu ci-dessous) : été indien 44 % en août, pluie 31 % en octobre, froid 37 % dont 10 %
  de neige en janvier, et **77 % de conditions parfaites au printemps** — mesuré.
  Le tirage a lieu **une fois au coup d'envoi** et est mémorisé dans la variable de module **`METEO_MATCH`**,
  **relue par `simuleReste`** pour qu'un changement de tactique en direct ne change pas le temps qu'il fait.
  **Aucun effet moteur** : la météo ne touche ni au score ni à l'affluence (choix assumé — c'est du décor,
  le calibrage reste étalonné). Rien à migrer (transitoire, pas dans `G`). Étendre = ajouter une entrée à
  `METEO` et la citer dans le `pool` de la bonne période dans `tireMeteo`.
  Le même lot ajoute **`poteau`** (6 lignes, le bois) et **`refuse`** (5, le but refusé — **pas de vidéo en
  1995**, la décision est sans appel, ce qui est un ressort narratif et non une limite), trois variantes de
  **contre son camp** dans `but` (narration seule, le buteur reste crédité comme avant, **aucun changement
  moteur**), et l'**annonce du temps additionnel** juste avant le coup de sifflet final. Le téléscripteur
  atteint **22,0 lignes par match** (contre ~13 avant le lot 1). Calibrage mesuré : 2,381.
- **Vitesses du téléscripteur** (boutons `#ctlVitesse` : `vR`/`vN`/`vL`/`vTL`) : 4 paliers, toute l'échelle reculée
  d'un cran après playtest (v0.48, « ça défile trop vite ») — **Rapide** 950 ms, **Normale** 1600 ms (défaut,
  `tickerDelai` à l'init et au reset de `lanceMatch`), **Lente** 2300 ms, **Très lente** 3000 ms (nouveau plancher).
  Pur réglage de pacing UI, sans effet moteur. Le palier actif est **surligné** (jaune, comme les boutons de
  consigne) via `surligneVitesse()` : appelé à chaque clic, au câblage des boutons, et au coup d'envoi dans
  `lanceMatch` (qui remet d'abord `tickerDelai=1600`) — avant v0.51 les 4 boutons étaient identiques et on ne
  voyait pas la vitesse choisie.
- **Mode direct plein écran (v0.79, retour de playtest « le match est trop petit et noyé sur mobile »)** : au coup
  d'envoi, la page bascule en **immersion totale** — le match prend tout l'écran, tout le reste s'efface. Mécanique
  volontairement **100 % CSS + une classe** : `lanceMatch`, `lanceCoupe` et `lanceEuroLeg` posent
  `document.body.classList.add("mode-direct")` au coup d'envoi ; **`abandonneDirect`** la retire (`classList.remove`)
  — c'est le **point de passage obligé** de toute transition (`montre` l'appelle en tête), donc le coup de sifflet
  suivant comme la sortie mid-match nettoient le mode sans code dédié. En `mode-direct`, le CSS masque `.topbar`,
  `nav`, `.footer` et **tous les `#corps > .panel`** (offres, consignes, revue de presse, dépêches), puis ré-affiche
  les deux seuls utiles : `#pTableau` (le score, figé en haut) et le panneau du téléscripteur — marqué de la classe
  **`.panelDirect`** — qui s'étire en `flex:1` pour prendre toute la hauteur, `#ticker` en `font-size:19px` (contre
  13 sur mobile) pour la lisibilité. **Piège** : en championnat, `#preMatchAct` (le bouton « Prochaine journée ») vit
  DANS le panneau consignes, donc masqué en mode-direct → c'est le bouton `#bSuite` en bas du téléscripteur (dans la
  feuille de match) qui assure la continuation. En coupe/europe, `#preMatchAct` est un `<p>` frère direct de `#corps`
  (pas un `.panel`) → il reste visible et porte le « verdict → ». **Profite aux trois compétitions** (même
  téléscripteur/ids). **Purement cosmétique, aucun effet moteur** : les launchers ne tournent jamais en `EN_TEST`
  (montre no-op), calibrage intact (harnais verts, mesuré). Étendre = si on ajoute un écran de match, marquer son
  panneau téléscripteur `.panelDirect` et poser la classe dans son launcher.
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
  variante « Boucher légendaire ». **`TIREURS_CF`** (Set) consigne les **rois du coup franc** (Sauzée, Caveglia,
  Zidane…) → `tireurElite=true` **d'office, quelle que soit la note** (court-circuite le seuil M/A≥79).
  **Les deux Juninho (v1.55)** : celui du vivier (Middlesbrough, été 95) est Juninho Paulista et s'appelle désormais
  « Juninho Paulista » (avant, sur une carrière 2001-02, il était même chassé du vivier par l'homonymie) ; « Juninho »
  tout court est Juninho Pernambucano, Lyon 2001-02. **`MAITRES_CF`** (Juninho, puis Ronaldinho, D. Beckham, C. Ronaldo,
  L. Messi, tirés du classement mondial des buteurs sur coup franc fourni par l'auteur ; « A. Pelé » est Abedi Pelé,
  exclu), le cran au-dessus du tireur
  d'élite (retour auteur : « ses coups francs étaient presque considérés comme des pénaltys ») : `j.maitreCF`, poids
  `TIR_MAITRE` = `TIR_ELITE`×1,08 sur la lambda (`forces().tir` vaut 2), ~14 % des buts de son équipe signés sur coup
  franc direct quand il est sur la pelouse (`P_CF_MAITRE` dans `marque`, sans passeur, lignes `BUT_CF_MAITRE`, phase
  de montée `"cf"` avec `MONTEE_CF`/`MONTEE_CF_FRAPPE`), et le coup franc de la 90e à ×6 plafonné à 70 % (0,55 en
  auto). Picto 🎯 inchangé, titre « Maître du coup franc ». `migre` pose le statut sur les sauvegardes lancées en 2001
  ou après, et renomme « Juninho » en « Juninho Paulista » sur celles d'avant.
  Seuls les joueurs **présents** dans le jeu matchent (Di Meco/Sauzée/Caveglia/Rool en 95-96) ;
  le reste est de la donnée correcte-par-construction si un nom surgit (procédural multi-saisons). Étendre ces
  listes par simple ajout de nom au bon format d'initiale.
- **Picto « Car. » partout** (`pictos(j, avecTireur)`) : la colonne caractère figure à l'**effectif** (sans 🎯,
  déjà affiché à côté du nom) **et au mercato** (`pictos(j,true)` → inclut 🎯). Le placeholder `·` quand rien.
- **Coupe de France** (`G.coupe`, module dédié juste avant `finDeSaison`) : compétition parallèle jouée
  **en milieu de semaine** entre les journées (`coupeTick` en fin de `finirJournee`, tours aux journées
  10/15/20/26/31/36 via `COUPE_TOURS`). **64 équipes aux 32es** : les **40 clubs pros (D1+D2) y entrent**,
  rejoints par 24 **clubs amateurs** de villages (`CLUBS_AMATEURS` : vraies communes + noms inventés bon
  enfant — Trifouilly-les-Oies, Montcuq, Nœud-les-Mines… **que des faux joueurs**, et ils n'ont d'ailleurs
  pas d'effectif : un amateur n'existe qu'en tant que `force`). **Ton des noms** : on garde les communes
  réelles qui font sourire (Montcuq, Vatan, Arnac-la-Poste…) mais **pas de gag trop cheap** (Poil,
  Trou-Paumé, Trécon, Andouille, Saint-Glinglin, Sainte-Cuisse, Perpète-les-Olivettes, Corps-Nuds,
  Cornebidouille, Trifouilly-les-Oies ont été retirés v0.54→56 au profit de vraies villes à belle consonance
  française — Vierzon, Vesoul, Salers, Romorantin, Landerneau, Carpentras, Pithiviers — plus un gag tenu
  bon enfant, Cassolette-sur-Gers). **`CLUBS_AMATEURS` ne doit jamais descendre sous 24 entrées** : le tableau
  a besoin de `64 − 40 pros = 24` amateurs pour un bracket qui se divise proprement (64→32→…→1) ; sous 24 le
  champ n'est plus une puissance de 2 et `coupeTireTour` perd silencieusement l'équipe surnuméraire d'un tour
  impair. On tient 26 entrées (marge de 2), 24 tirées par saison. Tirage **sans tête de série**, **le petit
  reçoit** (`niveauCoupe` : amateur 0 < D2 1 < D1 2), **pas de match nul** (tirs au but). Un **Petit Poucet**
  est désigné chaque saison (`poucetId`, dopé de `COUPE_POUCET_BONUS`) et joue très au-dessus de son rang →
  parcours marquant, et il peut vous tomber dessus (le petit reçoit, vous jouez chez lui). **La coupe ne
  touche JAMAIS les stats de championnat** : depuis la bascule (v1.33) elle se joue par `simuleMatch` sous le
  maillot « CF » (`resoudreCoupe` → `coupeMatchReel`), ses buts vont dans `butsC`, jamais par
  `appliqueResultat` ; le vieux modèle de force (`forceCoupe`/`scoreCoupe`) ne reste qu'en repli pour un club
  sans effectif. Les villages sont rehaussés de `AMA_REHAUSSE` (5 points) pour garder ~16 % d'exploits. **Dilemme du mercredi** : `G.coupe.rotation` (cadres/mixte/réserve, réglé soit sur
  l'écran COUPE, soit dans la **fenêtre d'avant-match** — voir flux événementiel plus bas) module votre force
  en coupe ET appelle **`fatigueSemaine(rot)`** : les onze qui ont RÉELLEMENT disputé le tour (`onzeRotation`)
  encaissent chacun `FRAICH_MATCH` points de fraîcheur — voir la section **FRAÎCHEUR** plus bas. *(Avant v1.00,
  c'était un forfait d'équipe `G.coupe.fatigue=1` → −5 % d'attaque à votre seul match suivant ; ce drapeau et
  les deux lignes qu'il pilotait dans `simuleMatch` ont été SUPPRIMÉS. Ne pas les réintroduire : la fatigue ne
  vit plus que dans la jauge par joueur.)* Les trois écrans de rotation affichent `apercuRotation(rot)` — la
  fraîcheur moyenne du onze envisagé et les hommes déjà émoussés, pour que l'arbitrage se fasse en connaissance
  de cause. **La réserve fait jouer
  d'autres noms (v0.61)** : retour de playtest « on envoie la réserve mais ce sont les mêmes joueurs ». `onzeRotation(c,rot)`
  bâtit le onze réellement aligné (`reserve` = les moins bien notés à chaque poste, `mixte` = moitié-moitié, `cadres` = le
  meilleur onze) ; `onzeCoupe(c)` = ce onze pour VOTRE club. Branché sur l'**affichage** du tour (`nomsAffiche`/`gardienAff`
  → buteurs et gardien du direct). Le **score**, lui, reste piloté par `forceCoupe` (mult de rotation **inchangé** → équilibrage
  mesuré préservé) ; seuls les noms changent. Onglet **COUPE**
  (`ecranCoupe`, 3ᵉ de la nav) : statut, rotation, votre parcours, la fiche du Poucet, résultats du dernier
  tour. **Économie** : billetterie `COUPE_RECETTE` (600 kF à chaque tour franchi) **plus une dotation
  progressive de la Fédération** `COUPE_DOTATION` (barème selon le tour ATTEINT — 0,3 / 0,6 / 1,0 / 1,8 / 3,0
  MF, 5 MF au finaliste battu — versée à l'élimination) et `COUPE_DOTATION_VAINQUEUR` (8 MF au sacre) ; le
  cumul de la saison est porté par `G.coupe.gains` et affiché sur l'écran. À distinguer de la **prime de
  classement du championnat** (déjà en place dans `finDeSaison` : 40 MF au 1er → 0 au dernier, ÷2 en D2, dont
  70 % bascule au budget transferts). (Re)tirée à `nouvellePartie` et à `intersaison` (nouveau tableau + nouveau Poucet), migrée par `migre`
  (`if(!G.coupe) coupeInit()`). **Équilibrage mesuré** (test dédié, 80 saisons) : club fort **~13 % de
  victoire en « cadres »** contre ~6 % en mixte (le choix de rotation pèse), Poucet en quarts+ ~10-19 % et
  sacré très exceptionnellement.
  - **Flux événementiel du tour de coupe (v0.54)** : un tour de coupe où VOUS jouez n'est plus résolu en
    silence. `coupeTick` tire d'abord les affiches (`coupeTireTour` → pose `G.coupe.aJouer={tourIdx,nom,court,
    paires}`) **sans résoudre** ; l'écran calendrier (`ecranCalendrier`, AVANT debrief/incident/ère) détecte
    `G.coupe.aJouer` et ouvre `ouvreCoupe(suite)` — une séquence de **trois fenêtres `#fiche`** : 1) avant-match
    (l'affiche + l'adversaire + domicile/extérieur + **choix de l'équipe** cadres/mixte/réserve, qui écrit
    `G.coupe.rotation`) → bouton « Jouer le match » ; 2) le **verdict** de votre match (qualifié + tour suivant
    + recette, ou fin du parcours + dotation, ou sacre) ; 3) **tous les résultats du tour** (table scrollable,
    le Poucet marqué 🐭, votre match en classe `me`). La résolution (`coupeResoutTour(interactif)`, ex-corps de
    `coupeJoueTour`) se fait au clic « Jouer » (rotation déjà posée → elle pèse vraiment), et `interactif`
    **coupe les `notif()` perso** (la fenêtre fait déjà le job ; le debrief ne les duplique pas — mais Poucet
    et exploits restent en dépêche). **Pièges à préserver** : (a) hors UI (`EN_TEST`, harnais) **ou** si vous
    n'avez pas de match ce tour (déjà éliminé), `coupeTick` appelle `coupeResoutTour(false)` **immédiatement**
    → résolution muette, le harnais et la suite de la saison ne se bloquent jamais ; (b) `G.coupe.aJouer`
    (nouveau champ, init `null`, sérialisé) reste pendant entre la fin du match de championnat et l'ouverture
    de la fenêtre — au rechargement d'une sauvegarde mid-coupe, l'écran calendrier rouvre la fenêtre, c'est
    voulu ; (c) la fenêtre vit dans `#fiche` avec `window._penEnCours=true` (pas de fermeture Échap tant qu'on
    n'a pas joué), nettoyée par `fermeFiche()` au bout du flux qui enchaîne sur `suiteApresCoupe`.
  - **Coupe au téléscripteur (v0.59)** : depuis la fenêtre d'avant-match, deux façons de jouer VOTRE tie —
    **« ▶ Jouer le match »** (direct) ou **« Résultat instantané »** (l'ancien flux, résolution immédiate).
    Le **direct** est un téléscripteur dédié et ISOLÉ : `jouerDirect` tire d'abord le score par le modèle de
    coupe (`resoudreCoupe`, donc upsets/Poucet/calibrage préservés), le mémorise dans `G.coupe.enDirect`
    (`{hid,aid,advId,tourIdx,nom,sh,sa,tab,win}`), ferme la modale et fait `montre("coupematch")`. `ecranCoupeMatch`
    rebâtit un écran match (mêmes ids `#pTableau/#tabScore/#tabButs/#ticker/#ctlVitesse/#preMatchAct` → les
    helpers du direct marchent tels quels) et lance `lanceCoupe`, qui **réutilise** `ajouteLigne`, `celebreFlash`,
    la montée de tension (`MONTEE_BUT/FRAPPE`) et les vitesses. Les événements viennent de **`genEvCoupe(H,A,r)`** :
    pure mise en scène qui ATTERRIT sur le score `r` (buts répartis sur 3-89', occasions, ambiance, mi-temps,
    sifflet, t.a.b. si nul). **Règle d'or maintenue** : `genEvCoupe` ne touche AUCUNE stat (les buteurs cités sont
    des chaînes, aucun `j.buts++`) — invariant vérifié (total buts/passes des clubs inchangé après un tie). Les
    **amateurs** (sans effectif) reçoivent un objet d'affichage via `clubAffiche` (id court `court` pour le blason
    via `blasonAff`, écu gris générique, stade « municipal »), des **noms de buteurs générés** (`nomsAffiche` →
    `PRENOMS`/`NOMS`) et un gardien générique (`gardienAff`) ; un pro garde son vrai blason, son `onze` et son
    gardien. Au coup de sifflet, `lanceCoupe` affiche la feuille de match puis **`coupeResoutTour(true, r)`** —
    le 2ᵉ argument `forced` **réinjecte le score déjà joué** pour VOTRE affiche (les 31 autres au modèle), pour que
    tableau et direct coïncident — puis bouton « Le verdict → ». Les **fenêtres verdict/résultats sont extraites**
    en fonctions top-level réutilisées par les deux voies : `coupeFenetreVerdict(advId,tourIdx,nom,suite)` (la
    résolution a déjà eu lieu, elle ne fait qu'afficher) et `coupeFenetreResultats(suite)`. Côté direct, `suite`
    = `montre("calendrier")` : on revient au calendrier (aJouer résolu → on saute `ouvreCoupe`) et le fil reprend
    naturellement (incident/conf/debrief, qui ne **redouble pas** le verdict car `interactif=true` a coupé la
    notif perso). **Pièges** : (a) `G.coupe.enDirect` est un nouveau champ (init `null`, sérialisé) ; abandonner
    en cours (clic nav → `montre` → `abandonneDirect` purge `tickerTimer/butFlashTimer`) laisse aJouer/enDirect en
    attente → on rejoue depuis l'avant-match (resume voulu) ; (b) `EN_TEST` → `montre` no-op, le harnais ne voit
    jamais le direct (et `coupeTick` résout en muet), calibrage intact ; (c) ne jamais router une coupe par
    `simuleMatch` (il fait `j.buts++` → pollue les buteurs, et écrase les amateurs 5-0 → tue le Poucet).
  - **LE RENDEZ-VOUS DE SEMAINE SE PRÉPARE (v1.10, retour de playtest : « quand on a un match de coupe, on nous
    demande l'équipe dès qu'on clique sur Prochaine journée, et le match commence juste après — on ne peut agir sur
    rien : mercato, finances, onze type, tactique ; et certains matchs je ne peux pas changer la stratégie en cours de
    match »)**. Les fenêtres verrouillées `ouvreCoupe`/`ouvreEuro` (posées d'office par `ecranCalendrier`, AVANT tout
    le reste, `_penEnCours` levé) ont **disparu**. Trois changements. (1) **`rdvEnAttente()`** (Europe d'abord, puis
    Coupe de France ; un tour qui n'est pas le vôtre se résout en muet) fait afficher **`panneauRdv(rdv,h,a)` À LA
    PLACE du match du samedi** sur l'écran Calendrier : affiche + blasons (`clubAffiche`/`blasonAff`), lieu, contexte
    (aller/retour avec le score de l'aller, finale neutre, Poucet — « le petit reçoit » seulement si l'hôte est
    réellement d'un niveau inférieur), rotation `.bRdvRot` + `apercuRotation`, **consigne et prime** (bloc partagé
    **`blocConsignePrime(quand)`**, le même que le samedi), et les deux coups d'envoi `#bRdvGo`/`#bRdvVite` qui
    appellent **`coupeJoue(instant)`/`euroJoue(instant)`** (le corps des anciennes fenêtres ; `suite` =
    `montre("calendrier")`, le samedi reprend sa place). **Rien n'est verrouillé** : les onglets restent ouverts, on
    revient quand on veut. Les boutons s'éteignent au clic (un double appui sur « Résultat instantané » refermait le
    verdict à peine ouvert). (2) **La semaine passe AVANT** : ère → incident → arc → conf → debrief s'enchaînent dès
    l'arrivée (on compose son équipe de coupe en sachant qui est blessé) ; seule la **promo billets attend** que la
    coupe soit jouée — elle concerne le samedi. Chaque étape se consume (`G.incident`, `G.confPresse`, `G.notifs`…),
    donc revenir sur l'écran ne rejoue rien. (3) **La consigne et la prime valent aussi les soirs de coupe** :
    **`multTactique(hid,aid)`** (consigne sur les deux attaques, prime sur la vôtre, **[1,1]** si ce n'est pas votre
    match ou en « Équilibré » sans prime → tirages de coupe **rigoureusement inchangés** par défaut) passe dans
    `scoreCoupe(fh,fa,mh,ma)` via `resoudreCoupe`, `euroManche`, `euroFinaleSeche` ; **`soldePrime(gagne, quoi)`** (qui
    remplace aussi le bloc du samedi dans `finirJournee`) paie la prime à la **qualification** en Coupe de France et au
    retour européen, à la **victoire de la manche** à l'aller, puis la remet à zéro. Et le contrôle **« Tactique en
    direct » existe désormais dans les trois directs** (`htmlCtlTactique()` + **`cableTactiqueRdv(o)`**) : c'était ça,
    les « certains matchs » — un stress de 152 matchs de championnat au navigateur avait montré 151 changements réussis
    (le 152ᵉ tombait après le coup de sifflet), le trou était la semaine. Le score de coupe étant tiré d'un bloc,
    **`rejoueRdv(gen, lignes, from, mNow, r, avant, apres)`** fait l'équivalent de `rejoueDepuis` : garde ce qui a été
    montré, retire la fin pré-écrite, la réécrit via **`corpsCoupe`/`finCoupe`** (le corps de `genEvCoupe`, découpé ; le
    décor et la mémoire anti-répétition voyagent dans `gen.ctx`, non énumérable), puis l'appelant recalcule le verdict
    (**`issueCoupe`**, **`euroClotureAvec`**, **`euroFinaleAvec`** — `euroCloture`/`euroFinaleSeche` en sont devenus de
    simples enveloppes) et met à jour en place ce que `fin()` relit (`r`, `legScore`, `ed.tie`).
    **PIÈGE MESURÉ, à ne pas réintroduire** : re-TIRER la fin à neuf (λ × temps restant, comme `simuleReste`) ajoutait
    **~3 % de buts même à consigne inchangée**. Le fil de coupe n'est pas un processus minute par minute : il compte un
    nombre FIXE d'évènements, donc savoir où l'on en est dans le fil renseigne sur les buts à venir (une fin de match
    sans évènement est une fin sans but). `rejoueRdv` **rééchelonne** donc les buts que le fil réservait encore, au
    rapport des buts attendus après/avant (chacun gardé avec cette probabilité, ou des buts en plus au prorata du temps
    restant) : à consigne égale, **pas un but ne bouge** ; offensif puis retour à Équilibré revient à la moyenne à 0,4 %.
    Validation dédiée : **`harness-rdv.cjs`** (neutralité, effet des consignes et de la prime, règlement de la prime,
    2 600 recollages sans anomalie ni ligne resservie, loi du score, verdicts européens, rendu du Calendrier).
- **Coupe d'Europe — Ligue des Champions (v0.72, lot 1 d'une livraison progressive)** : 2ᵉ compétition
  parallèle, bâtie sur le **moule de la Coupe de France** — modèle de force **autonome** (`forceEuro`
  réutilise `forceClub` + `scoreCoupe`/`poissonC`, exposant 2,6), **jamais `simuleMatch`** → **calibrage
  championnat intact par construction** (mesuré : 2,400 buts/match inchangé). **Vrais effectifs européens
  curés** (`CLUBS_EUROPE` métadonnées + `STARS_EUROPE`, 15 clubs × 18 joueurs, vrais joueurs 95-96 scrapés
  sur **Transfermarkt** `saison_id/1995`, filtrés des arrivées été 96 via la colonne « Joined » et des jeunes
  non utilisés ; plafond de note 90 comme la D1, potentiels 91-96 pour les futurs monstres — Raúl, Kluivert,
  Titov, S. Iversen, Grønkjær, A. Ilie). Les clubs vivent dans **`G.europe`** (bâti par `construitDivision` à
  `nouvellePartie`, **vieilli à l'intersaison** comme les divisions françaises → dérive procédurale des noms en
  carrière longue, même compromis que D1/D2 ; per-country name pools = raffinement futur). **Élimination directe
  à 16, en ALLER-RETOUR** (`EURO_TOURS` : 8es/quarts/demies/finale, journées **8/16/27/33** distinctes de la coupe
  nationale) : deux manches (aller chez a, retour chez b), **cumul des buts**,
  **but à l'extérieur double** (règle de l'époque), t.a.b. si tout est à égalité ; **sauf la finale** = match sec
  sur terrain neutre (`euroFinaleSeche`, sans `EURO_TERRAIN`). L'aller-retour **resserre aussi la distribution** (deux
  manches = moins d'upsets) : élite ~68 vs modestes ~6 sur 120 C1, réaliste.
  **L'ALLER ET LE RETOUR SONT DEUX SOIRÉES SÉPARÉES (v0.99, retour de playtest « les matchs aller et retour se
  sont suivis le même jour »)** : chaque tour occupe désormais **deux milieux de semaine espacés d'une semaine** —
  `EURO_TOURS` porte `j` (l'aller) **et `jr` = j+1** (le retour), soit 8/9 · 16/17 · 27/28, la finale gardant son
  unique J33. Les huit dates évitent toujours les tours de Coupe de France (10/15/20/26/31/36) : un seul
  rendez-vous de semaine à la fois — **une section du harnais le vérifie**, à réexécuter si on déplace une date.
  Le tie est donc coupé en deux : **`euroManche(a,b)`** joue l'aller, **`euroCloture(a,b,l1)`** joue le retour et
  tranche (cumul + but à l'extérieur + t.a.b.). Entre les deux, **`G.euro.attente`** = `{tourIdx, paires, allers,
  mien}` garde les huit scores de l'aller (sérialisé, donc il survit à une sauvegarde) ; `aJouer` porte un champ
  **`manche`** (1 = aller, 2 = retour) et, au retour, les `allers` à reprendre. `euroTick` pose l'aller à `j`
  puis, **une fois `attente` posée**, le retour à `jr` (`euroPoseRetour`) — et **ne tire jamais rien tant qu'une
  manche attend d'être jouée** (`if(eu.aJouer) return`), sinon une manche restée en plan serait écrasée par un
  nouveau tirage. `euroResoutTour` aiguille : manche 1 → **`euroResoutAller`**, qui joue, affiche et range dans
  `attente` **sans éliminer personne ni incrémenter `tourIdx`** ; manche 2 (ou finale) → l'ancien corps, verdict
  compris. **Conséquence de game design assumée** : la rotation (cadres/mixte/réserve) se choisit **deux fois**,
  donc « les cadres » peuvent coûter **deux** matchs de championnat à −5 % — c'est le prix d'une double
  confrontation. Côté écrans, une **quatrième fenêtre** `euroFenetreAller` (entre l'avant-match et les résultats)
  annonce le score de l'aller et la date du retour, `euroFenetreResultats`/`ecranEurope` lisent `dt.manche===1`
  pour afficher la colonne « Aller » **sans mettre de vainqueur en gras**, et le parcours montre le tie en cours
  avec la mention `aller`. Le direct (`lanceEuroLeg`) ne joue **plus qu'une manche par écran** : le bouton
  « Match retour → » a disparu, remplacé au sifflet de l'aller par la réinjection de VOTRE manche
  (`euroResoutTour(true, {aid,bid,l1})`). **Piège de lecture des vieilles sauvegardes** : `migre()` donne
  `manche:1` à un `aJouer` sans manche, `manche:2` à un `dernierTour` sans manche (sinon `f.agg[0]` lit
  `undefined` et l'écran EUROPE casse), et **annule un `enDirect` de l'ancienne forme** (`{tie,leg}`) — le joueur
  reprend depuis l'avant-match, comme pour tout direct abandonné.
  **Registre multi-compétitions (v0.75-0.76, lot 2 étapes 3-4) : LES TROIS COUPES C1 + C2 + C3.** `COMPETS={C1,C2,C3}`
  (nom, emoji ⭐/🏆/🌍, `pool` de clubs, `siege` français, dotations, recette) ; `competActif()` = la compétition en cours
  (`G.euro.compet`). Chacune ajoute **15 clubs étrangers curés** (`CLUBS_EUROPE_C2`/`_C3` + `STARS_EUROPE_C2`/`_C3`) :
  **C3 — Coupe UEFA** (champ TRÈS relevé — Milan/Barça/Bayern/Inter/Liverpool, car seuls les champions allaient en C1 →
  **plus dure que la C1**) ; **C2 — Coupe des Coupes** (plateau plus modeste, vainqueurs de coupes nationales : Parme/
  Deportivo/Feyenoord…). `G.europe` fusionne les **45 clubs** ; `EUROCLUBS`=toutes les métadonnées ; `euroMeta`/`estEuropeen`
  balaient les trois. **Qualification (`G.euroCompet` ∈ C1/C2/C3/null, remplace l'ancien booléen `G._euroC1`) : champion de
  D1 → C1 (priorité), sinon vainqueur de la Coupe de France → C2, sinon 2ᵉ-4ᵉ → C3** (posé à l'intersaison, à l'init par
  `SAISONS[key].euroC1`/`euroC2`/`euroC3`). Sièges français réels : **Nantes** (C1) / **PSG** (C2, vainqueur 96) / **Bordeaux**
  (C3, l'épopée 96 vs Milan) en 95-96. Seule VOTRE compétition a un tableau ; **qualifié ou non, une compétition se joue
  toujours** (C1 par défaut, siège français) pour désigner un vainqueur → la scène européenne vit sa vie.
  **Qualif visible à l'accueil (v0.77)** : `euroSeedDe(id, S)` lit la graine de la saison de départ ; l'écran de choix
  de club affiche une **pastille** (⭐ C1 / 🏆 C2 / 🌍 C3) sur la carte, et la **fiche club** une ligne « Coupe d'Europe :
  <compét> dès la 1re saison » — on sait donc AVANT de choisir quel club joue quelle coupe.
  **Réconciliation joker↔Europe étendue** : en plus de `acheterJoker` (vous), le bloc « la concurrence rôde sur le
  vivier » (un club IA prestigieux rafle un joker dans `finirJournee`) appelle aussi **`retireDEurope`** → un joker
  raflé par l'IA quitte son club européen (sinon doublon curé sur deux terrains — ex. Papin vivier→Monaco ET Bayern).
  **Flux événementiel interactif (v0.73, lot 2 étape 1)** : `euroTick` **tire** les affiches (`euroTireTour` → pose
  `G.euro.aJouer`, sérialisé/migré) **sans résoudre** ; `euroResoutTour(interactif)` résout `aJouer`. Hors UI
  (`EN_TEST`) **ou** si ce n'est pas votre tie (déjà éliminé) → résolution muette immédiate ; sinon `ecranCalendrier`
  ouvre **`ouvreEuro(suite)`** — trois fenêtres `#fiche` calquées sur `ouvreCoupe` : avant-match (affiche + **choix de
  rotation** cadres/mixte/réserve) → `euroFenetreVerdict` → `euroFenetreResultats`, chaînées **avant** la Coupe de
  France (`ouvreEuro(apresEuro)`, journées distinctes). **Chaque manche se paie en fraîcheur** : `euroResoutAller` ET
  `euroResoutTour` appellent `fatigueSemaine(eu.rotation)` — un aller-retour européen coûte donc DEUX matchs à ceux
  qui les ont joués, pour une seule semaine de récupération chacun (v1.00 ; avant, un forfait `G.coupe.fatigue=1`
  de −5 %, supprimé). Deux façons de jouer : **« ▶ Jouer au direct »** ou **« Résultat instantané »**.
  **Téléscripteur direct des nuits européennes (v0.74, lot 2 étape 2)** : `jouerDirect` tire le tie (`resoudreEuroTie`),
  le mémorise dans **`G.euro.enDirect`** (`{aid,bid,advId,tourIdx,nom,finale,tie,leg}`, sérialisé/migré) et bascule sur
  **`ecranEuroMatch`** → **`lanceEuroLeg`** (jumeau AUTONOME de `lanceCoupe` — dupliqué à dessein pour ne rien risquer sur
  le direct de la Coupe de France) : réutilise `genEvCoupe`/`celebreFlash`/la montée de tension sur un flux **ISOLÉ**
  (aucune stat de championnat touchée). **Deux manches jouées à la suite** : aller (bouton « Match retour → ») puis retour ;
  chaque manche atterrit sur son score (`tie.l1`/`tie.l2`), t.a.b. sur l'ensemble annoncés au sifflet du retour ; **finale =
  manche unique** sur terrain neutre (les t.a.b. y passent par `genEvCoupe`). Au sifflet de la dernière manche,
  `euroResoutTour(true, forced)` **réinjecte** le tie déjà joué (les 7 autres affiches au modèle) pour que tableau et direct
  coïncident, puis `euroFenetreVerdict`→résultats, retour au calendrier (le fil reprend). Trois adaptations « europe-aware » :
  **`clubAffiche`** trouve les clubs de `G.europe`, **`onzeEuro(c)`** applique la rotation `G.euro` à VOTRE club (au lieu de
  `G.coupe`), et `nomsAffiche`/`gardienAff`/`genEvCoupe` prennent une **fonction `onze` optionnelle** (défaut `onzeCoupe`) →
  les buteurs cités sont de **vrais joueurs des deux clubs** (curés). Les clubs européens ont un **stade + capacité** réels
  (`CLUBS_EUROPE`) pour l'ambiance. Abandon en cours (nav → `abandonneDirect` purge les timers) : `aJouer` reste, on reprend
  depuis l'avant-match (resume voulu). **Court-circuité en `EN_TEST`** (montre no-op) → harnais/calibrage intacts.
  **Économie — prime UEFA par tour (v0.78)** : au-delà de la billetterie (`CP.recette`/tour franchi), une **prime UEFA
  versée à CHAQUE tour REMPORTÉ**, **croissante** à l'approche de la finale et **pondérée par le prestige** (`CP.prime` =
  barème 8es/quarts/demies/finale : C1 `EURO_PRIME_C1` 2/3,5/6/10 · C3 1,3/2,3/3,9/6,5 · C2 1/1,75/3/5 MF) + `CP.dotV` au
  sacre (trophée : C1 20 · C3 12 · C2 10 MF). Payée dans le bloc « gagne » de `euroResoutTour` (`CP.prime[eu.tourIdx]`) →
  un finaliste banque 3 primes croissantes, un vainqueur de C1 ≈ 46 MF cumulés. Remplace l'ancienne dotation-en-un-coup à
  l'élimination (le verdict d'élimination affiche désormais le **total du parcours** `eu.gains`). Onglet **EUROPE**
  (`ecranEurope`, 4ᵉ de la nav, calqué sur `ecranCoupe`) : statut, parcours, résultats du dernier tour, vainqueur.
  **Réconciliation joker ↔ Europe** (retour de l'auteur) : les stars européennes sont **aussi** signables via
  `VIVIER`/`JOKERS_RESERVE` (Deschamps, Del Piero, tout l'Ajax…) — on ne les exclut PAS du vivier ; à la
  signature (`acheterJoker`), **`retireDEurope(nom)`** retire le joueur de son club européen (« Deschamps signé
  quitte la Juve »). Le chevauchement **club européen ↔ joker est donc VOLONTAIRE** (résolu à la signature),
  contrairement à l'interdiction club-français ↔ vivier. Validation dédiée : **`harness-euro.cjs`** (vivier 15×18,
  plafond 90, tableau à 16, résolution complète, qualif du champion, réconciliation, zéro doublon **curé**
  Europe↔France — les homonymies de jeunes **procéduraux** sont tolérées comme entre deux clubs français, et le
  test les ignore ; F = distribution des vainqueurs ; G/H = C3/C2 : Bordeaux → Coupe UEFA, PSG → Coupe des Coupes, pools
  et résolutions vérifiés ; I = **aller et retour espacés d'une semaine** — dates non collisionnées avec la Coupe de
  France, aucun qualifié au soir de l'aller, cumul du retour qui reprend bien l'aller de la semaine d'avant, finale
  restée un match sec). **Les trois compétitions sont livrées.** Reste (optionnel) : lot 4 = phase de poules de la C1.
  **Convention de désambiguïsation des noms (consigne auteur)** : deux joueurs RÉELS différents affichés pareil (frères,
  homonymes) → **préfixer l'initiale du prénom** au nom (ex. Benfica « J. Pinto » vs Porto « João Pinto »), plutôt que
  d'écarter un vrai joueur ou d'utiliser une initiale de 2ᵉ prénom. Si l'initiale du prénom collisionne aussi (deux « R.
  Witschge » : Richard/Rob ; deux « Nando »/Fernando), garder l'autre vrai joueur du club scrapé (ex. Iwan, Aira). Le
  balayage anti-doublon interdit toute collision de nom **curé** entre clubs français (STARS/STARS_D2 base) et européens.
- **Réputation du club** (0-100), **confiance du président**, **moral des joueurs**, **traits**
  (ego, agressivité, fragilité, vénalité), **centre de formation**, **mercato bidirectionnel**.
- **Buteurs & passeurs vivent sur l'écran CLASSEMENT (v0.96, 100 % présentation)** : les deux tableaux
  (top 8, calculés sur `G.clubs`, donc sur la **division jouée**) étaient dans la colonne de droite de
  l'écran Club, alors qu'ils parlent du championnat et pas du club — ils sont passés sous le classement,
  en deux panneaux `grid2` (`Buteurs` / `Passeurs décisifs`), là où ils sont cohérents avec le titre
  « Division N » juste au-dessus. Les lignes n'ont **pas** la classe `click` : elles ne perturbent pas le
  `app.querySelectorAll("tr.click")` de l'écran, qui n'adresse que les clubs du classement. Côté Club, la
  colonne de droite ainsi libérée accueille un panneau **« Direction & mémoire »** (le président,
  la confiance, le palmarès, la réputation, la mémoire du club) — sortir ces blocs du panneau de gauche
  évite qu'il reste seul dans un `grid2` à deux colonnes, donc à moitié vide. Les deux tableaux gardent
  `class="fit"` (voir le piège mobile plus bas). Aucun effet moteur.

- **LE MULTIPLEX DE FIN DE JOURNÉE (v1.17, retour de playtest : « après chaque match ça passe à la journée
  suivante, je ne suis même pas sûr qu'on voie les résultats des autres matchs ni le classement mis à jour
  avec les évolutions — il faudrait une notif story de fin de journée, pour qu'on garde le fil »)**. Les neuf
  autres scores tombaient bien au coup de sifflet, mais en **vrac, en gris, sous la feuille de match** : rien
  ne disait lesquels comptaient, le classement n'apparaissait pas, et sur un téléphone tout cela vivait
  **sous la ligne de flottaison** du téléscripteur. Le sifflet déroule désormais **deux cartes**, à la suite
  de la feuille, et c'est par elles qu'on passe à la journée suivante.
  • **Carte 1 — « 📻 TOUS LES STADES »** (`mpxStades`) : les neuf autres affiches, vainqueur en jaune, avec
    **trois pastilles et AUCUNE légende** (on comprend à la deuxième journée, c'est la consigne « laisser
    découvrir ») — 👑 le match du leader, ⚔️ celui de votre rival historique (`RIVAL`), 🎯 celui d'un club qui
    vous encadre au classement. Dessous, **la une de la semaine** (`mpxUne`), **deux lignes au plus et
    seulement s'il y a quelque chose** : un changement de leader passe avant tout (c'est LE fil qu'on veut
    garder), sinon la claque du jour (3 buts d'écart) ou le festival (6 buts). Une journée sans relief n'écrit
    rien — la carte reste maigre plutôt que bavarde.
  • **Carte 2 — « 📊 LE CLASSEMENT »** (`mpxTable`) : pas les vingt lignes (l'onglet CLASSEMENT est là pour
    ça) mais **la tranche utile** — le podium, vos deux voisins de part et d'autre, le bas de tableau, les
    rangs sautés dits `⋯`. Chaque ligne porte **ce qu'elle a gagné ou perdu comme places** (▲n vert / ▼n
    rouge / `·`), et l'en-tête reprend `enjeuDe(G)` (« 5ᵉ, à égalité de points pour l'Europe ») suivi de votre
    propre mouvement. Le bouton **« Prochaine journée 📆 »** vit au bas de cette seconde carte.
  • **Les données sont FIGÉES, pas relues** : `bilanJournee(res)` écrit `G.multiplex` = `{j, div, moi, enjeu,
    tab:[{id,nom,pts,r,av}], m:[{h,hn,a,an,sh,sa,mien}]}` **à la fin de `finirJournee`**, juste après
    `G.histo.push`. Deux raisons, et la première est un piège : **la J38 passe dans la MÊME `finirJournee`**
    (`finDeSaison` → `razStatsClub`), donc une carte qui relirait `classement()` à l'affichage parlerait d'un
    championnat remis à zéro ; la seconde est qu'une carte figée se relit telle quelle après un rechargement.
    Le rang d'AVANT vient de **`G.rangAv`**, pris **en tête de `jouerJournee`** — il le faut, les neuf autres
    matchs sont appliqués dès la boucle qui suit. Poids mesuré : **2,2 Ko, 0,46 % de la sauvegarde**, écrasés
    chaque semaine (on ne garde que la dernière journée).
  • **Branchement** : `afficheFeuille` (dans `fin()` de `lanceMatch`) pose `<div id="mpxHote">` puis la feuille
    **par-dessus** (le téléscripteur écrit du plus récent au plus ancien, cf. le piège dédié plus bas), et
    appelle **`rendMultiplex(hote, 1, ()=>montre("calendrier"))`**, qui rend la carte 1, puis la carte 2 au
    clic, puis la suite. **`mpxVise(hote)`** amène le haut de la carte en haut du téléscripteur
    (`tk.scrollTop += rect.top − rectTk.top`) : sans ça, la feuille de match la repoussait hors de l'écran à
    390 px — le défaut même que l'auteur signalait. Repli intégral si `G.multiplex` manque (carrière d'avant
    la v1.17, nœud sans géométrie) : le bouton de sortie est quand même écrit, on n'est jamais coincé.
  • **Championnat seulement.** Les soirs de coupe et d'Europe ont leurs propres verdicts, et `finirJournee`
    n'y passe pas. Aucun effet moteur : rien n'est simulé, on relit ce que la journée a produit.
  Validation dédiée : **`harness-multiplex.cjs`** (sections A à G).

- **PLUS UNE SEULE BOÎTE DU NAVIGATEUR (v1.05)** : le jeu appelait encore `alert` **32 fois**, `confirm` une
  fois (supprimer une carrière) et `prompt` une fois (renommer une carrière). Chaque apparition crevait le
  décor télétexte — police du système, bouton « OK » en anglais selon la machine — et sur mobile le navigateur
  les dessine à sa façon quand il ne les bloque pas. Trois remplaçantes, toutes au-dessus de `esc()` dans la
  section INTERFACE : **`message(txt, o)`** (un message, un bouton — remplace `alert`), **`confirme(o)`**
  (deux boutons, `onOui`/`onNon` — remplace `confirm`), **`saisie(o)`** (un champ, `onOk(valeur)` — remplace
  `prompt`). **Elles sont ASYNCHRONES là où les boîtes bloquaient** : la suite passe par les callbacks, jamais
  par la ligne d'après — c'était sans conséquence ici, les 32 appels étaient des gardes en `return alert(…)`.
  **Elles vivent dans leur PROPRE calque `#msgbox`** (nouveau `<div>` après `#fiche`, `z-index` 20 contre 10) :
  un refus peut donc répondre à un clic fait DANS une fenêtre — « trésorerie insuffisante » par-dessus
  l'embauche d'un coach — **sans effacer la fenêtre du dessous**, et sans jamais toucher à `window._penEnCours`,
  qui reste le verrou de `#fiche`. Tout ce qui s'y écrit passe par `esc()` (titre, corps, libellés de boutons,
  et l'attribut `value` du champ de saisie). Au harnais (`EN_TEST`), chemin direct comme `modalSignature` :
  un message se tait, une confirmation est acquise, une saisie valide `window._saisie` (ou la valeur par
  défaut). Un **`MSG_JOURNAL`** de 20 entrées retient les derniers messages poussés au joueur — c'est par lui
  que `harness-effectif.cjs` et `harness-sauvegardes.cjs` vérifient qu'un refus a bien été expliqué, et une
  seule fois. **Pour étendre** : ne jamais réintroduire `alert`/`confirm`/`prompt` ; un `grep` sur ces trois
  noms doit ne rendre que les commentaires qui racontent leur disparition.

### LES SAISONS NOMMÉES (v1.22)

Sept saisons de départ affichées « Saison 1990-91 », « Saison 1991-92 »… faisaient déjà un mur de dates, et
la routine quotidienne en ajoute une par nuit : soixante-quatorze au bout du chantier. Chaque entrée de
`SAISONS` porte donc désormais un champ **`nom`**, et c'est lui que l'écran d'accueil met en avant — le menu
déroulant lit « Sur tapis vert — 1991-92 », et le nom s'affiche en jaune au-dessus du `sous` déjà écrit.

**`nom` s'ajoute à `titre`, il ne le remplace jamais.** `titre` reste le créneau daté (« 1991-92 ») parce
qu'il alimente `G.saison`, donc les sauvegardes et une assertion de chaque harnais de saison : y toucher
casserait les carrières en cours et rougirait la moitié du dossier. `harness-noms.cjs` tient cette frontière.

Les sept noms — *Le bal des débutants*, *Sur tapis vert*, *Retour à la case départ*, *Ascenseur pour
l'élite*, *L'été sera chaud*, *Lendemain de fête*, *Le bug de l'an 2000* — sont écrits par **Fable 5.1 en
atelier**, jamais au runtime, comme tout le contenu narratif du jeu. L'idée vient des scénarios nommés de
RFM27 ; la **contrainte de jeu qui les accompagne chez eux a été écartée** (décision de l'auteur) : ici le
nom est une accroche, il ne change pas une ligne de moteur.

**Pour étendre** — c'est le geste que la routine quotidienne devra faire à chaque saison neuve : un `nom` de
deux à cinq mots, trente-quatre caractères au plus, français d'époque, ton léger, **aucun mot marquant
partagé avec une autre saison ni avec le titre d'un feuilleton** (`ARCS` : le diamant, le sac, le sortilège
et la buvette sont pris). `harness-noms.cjs` refuse tout le reste.

### LES DERNIERS MOMENTS DE PUR DÉCOR (v1.23)

La 90ᵉ tire parfois une respiration comique qui ne touche à rien : ni au score, ni à un joueur, ni à une
statistique. Il y en avait trois (`chien`, `pigeon`, `streaker`), il y en a cinq — **`projos`** (les quatre
pylônes qui lâchent, briquets dans les tribunes, halogènes qui refusent de redémarrer) et **`banderole`**
(quarante mètres de drap dans le virage, une vanne pour l'arbitre). Textes de **Fable 5.1 en atelier**.

Le câblage tient en trois endroits, et c'est le gabarit à recopier pour un sixième : le `PICK` de la branche
décor en fin de `tireMoment` (après le seuil `t < 0.97`), un `if(decor==="…") return {type, annonce}` juste
à côté, et un bloc `if(lg && lg.mo==="…")` dans le téléscripteur qui appelle `celebreFlash`. **Ne jamais
l'inscrire dans `MOMENTS_BUT`** : c'est cette table qui distingue un moment qui change le score d'un moment
qui n'est que raconté, et `autoMoment` rend alors 0 sans qu'on ait rien à écrire.

`PROJOS_ART` rejoint `DOG_ART` et `PIGEON_ART`. **Attention : `celebreFlash` écrit `o.art` SANS
l'échapper** (contrairement à `o.detail`) — un dessin ne doit donc contenir ni `<`, ni `>`, ni `&`.

**Ce qui les garde désormais** : `harness.cjs`, section **B ter**. Elle force le premier `Math.random()` de
`tireMoment` (la variable `t`) pour tomber dans la branche décor et laisse courir le reste, ce qui fait
sortir les cinq au fil des essais. Elle vérifie pour chacun : une annonce à lire, **aucune accolade**
survivante, **aucun `uid`** (un décor ne nomme personne), et **`autoMoment` qui rend 0**. Jusqu'ici ces
moments n'avaient aucun harnais du tout — rien n'empêchait l'un d'eux de se mettre un jour à toucher au
score. Choisir un adversaire qui ne soit pas le rival du club : le derby a sa propre porte de sortie
(`provoc`) avant même la branche du décor.

### LA BASCULE DE L'EUROPE — FAITE (résolution ET direct)

**Ce qui est fait.** Une manche européenne se joue par `simuleMatch` : `euroManche`, `euroCloture` et
`euroFinaleSeche` passent toutes par `euroMatchReel`, qui entre par `enCompet("EU")` et garde un repli sur
l'ancien modèle si un club n'a pas d'effectif (vieille sauvegarde). La finale se joue sur terrain neutre
avec prolongations ; la manche retour prolonge **seulement si la double confrontation partirait sinon aux
tirs au but** — c'est le rôle du nouvel `opts.egalite` de `simuleMatch`, qui dit « rien ne les sépare
encore » autrement que par le score du soir. Les t.a.b. viennent désormais du moteur (`r.tab`), plus d'un
rapport de forces. `multTactique` n'est plus nécessaire : `simuleMatch` connaît déjà consigne et prime.

**Étalon réécrit sciemment** : `butsMancheEuro` 2,369 → 2,484, `tabEuro` 0,083 → 0,038,
`favoriEuro` 0,652 → 0,669. Les trois bougent pour la même raison voulue — on joue les prolongations. Tout
le reste du fichier est resté conforme sans y toucher : le calibrage se transfère d'un moteur à l'autre.
L'invariant des buteurs a gagné sa seconde moitié (les buts de coupe doivent ATTERRIR dans `butsC`, pas
seulement épargner le championnat) et il a été vérifié rouge en retirant `enCompet`.

**Le dernier kilomètre, fait le 24/09/2026.** VOTRE soirée européenne se joue BAVARDE : `euroJoue` passe un
objet `sortie` à `euroManche`/`euroCloture`/`euroFinaleSeche`, qui y rendent le fil même du moteur (`sortie.r`,
le `r.ev` de `simuleMatch`) et ses options (`sortie.o` : `neutre`, `prolong`, `egalite`). Il voyage dans
`eu.enDirect._sim`, **non énumérable** (hors sauvegarde) : une reprise en plein match retombe sur le fil de secours
`genEvCoupe` sans rien casser. `lanceEuroLeg` met ce fil en scène tel quel — **les buteurs du téléscripteur sont
ceux que les fiches ont enregistrés** — suit la minute et l'infériorité numérique (`liveMul`), et arrête le fil
sur un carton rouge comme le samedi. Le changement de consigne passe par **`cableTactiqueDirect`** (le geste de
`changeTactique`), qui appelle `rejoueDepuis` **sous `enCompet("EU")`** ; le verdict (cumul, but à l'extérieur,
t.a.b.) reprend la séance tirée par le moteur (`R.tab`). `cableTactiqueRdv`/`rejoueRdv` ne servent plus qu'au
fil de secours — et à la Coupe de France, qui n'a pas encore basculé.

**Ce que le moteur a appris pour ça.** `simuleReste` et `rejoueDepuis` prennent un `opts` de soir de coupe :
public de coupe ou terrain neutre, mi-temps, **prolongations** (y compris un recollage en pleine prolongation,
`enProlong`), sifflet à 90 ou 120, et **séance de tirs au but rejouée** quand `egalite` le dit (`r.tab` suit).
Sans `opts` (le samedi), rien ne change, pas même le nombre de tirages au hasard. **PIÈGE PAYÉ** :
`byUid` ne connaît que votre division — un soir d'Europe, les buts effacés de l'adversaire restaient sur sa
fiche. `rejoueDepuis` cherche désormais d'abord dans les deux vestiaires du match (`qui`). Gardé par la
**section J de `harness-euro.cjs`** (90 manches aller/retour/finale, rouge avant le correctif, 25/25 vert
après) : fil = fiches, recollage = fiches, score = fil, championnat intact, sifflet à la bonne minute, séance
exactement quand il le faut. Au passage, `aStade` contracte « à le Stadio » en « au Stadio ».

**LA COUPE DE FRANCE A SUIVI (v1.33, 24/09/2026).** Même câblage : `coupeJoue` passe un `sortie` à
`resoudreCoupe`, `lanceCoupe` met en scène le fil du moteur, la consigne passe par `cableTactiqueDirect` →
`coupeRejoue` (maillot « CF » + feuille). Un village joue avec son vestiaire (`coupeClub` → `clubAmateur`),
votre onze suit la rotation (`onzeCoupe`, feuille posée comme en Europe depuis la v1.32), pas de nul :
prolongations puis tirs au but du moteur. **Calage arbitré par l'auteur** : sur le vrai moteur, les villages
bâtis à leur note brute ne sortaient plus un pro que 9 % du temps ; `AMA_REHAUSSE`=5 les ramène à ~16,5 %
(3,1 buts contre les pros, comme avant) et `COUPE_POUCET_BONUS` passe de 14 à 11 pour garder le Poucet vers
12 % de quarts. Votre sortie dès les 32es : ~38 % en équipe mixte, ~25 % avec vos cadres — la rotation
décide, et la cible de 15-20 % du lancement du chantier est abandonnée (elle tuait les exploits). Étalon
réécrit valeur par valeur dans `harness-coupes.cjs` ; sa section F exige désormais que chaque but de coupe
atterrisse un pour un au compteur de son buteur, villages compris, et sa section K garde le direct.
**Le chantier « un seul moteur » est terminé** : championnat, Coupe de France et Coupe d'Europe passent tous
par `simuleMatch`.

### LES PRÉNOMS (v1.46)
Le nom court (« B. Lama ») reste **la clé du moteur** : traits (`TRAITS`), doublons, téléscripteur, sauvegardes et
harnais s'appuient dessus, on n'y touche pas. Le prénom se **déduit** de ce nom au moment d'afficher, par
`prenomDe(nom)` / `nomLong(nom)`, et seulement là où il y a de la place (choix de l'auteur) : titre de la fiche
joueur, fenêtres Signer / Brader / Rappeler, buteurs et homme du match de la feuille de match. Les listes serrées
(effectif, classement des buteurs, compositions, téléscripteur) gardent l'initiale.
**LES VITRINES DU DÉSIR (v1.48, consigne auteur)** : « c'est l'association d'un prénom et d'un nom qui peut faire rêver,
et se dire qu'on VEUT ce joueur chez nous ». Le prénom sort donc aussi, sans aller partout, là où l'on convoite un joueur
et là où on le célèbre : les cartes du **rapport du recruteur** (« Carlos Valderrama », « Éric Cantona »), la fiche
dépliée du **marché** (la recherche y trouve aussi un joueur par son prénom), les **trois dangers** de l'adversaire du
samedi (le terrain garde les noms courts), l'**almanach** (buteur, passeur, homme de la saison, dont la phrase « celui
que les tribunes ont fini par appeler par son prénom » prend enfin son sens), et les dépêches **TRANSFERT**, **RECRUE
JOKER** et le joueur **raflé sous votre nez**. **v1.49** : l'effectif réel de la **carte du club à l'accueil**
(« Patrick Vieira, 17 ans » à Cannes en 93-94) et **l'homme sur qui on compte** de l'ouverture de saison ; le bouton
« Prendre les rênes » est collé au bas de la carte (`.ficheActions`, sticky) : avec vingt joueurs il tombait sous l'écran
du téléphone. Section F de `harness-prenoms.cjs`. Rien n'entre dans la sauvegarde :
une vieille carrière a ses prénoms sans migration.
**Vrais joueurs** : table `PRENOMS_VRAIS` (au-dessus de `PRENOMS_GEN`), une entrée par nom à initiale des tables
curées. `""` = prénom introuvable, douteux, ou même nom court porté par deux hommes aux prénoms différents :
**on garde l'initiale, jamais de prénom deviné** (consigne auteur). Constituée en atelier le 25/09/2026 : moitié
par recherche vérifiée saison par saison (Transfermarkt, footballdatabase, archives de clubs), moitié par
**Wikidata** (requête SPARQL par nom de famille, footballeur né à deux ans près de l'âge du jeu, un seul candidat
dont le prénom colle à l'initiale ; 842 accords sur 859 recoupements). **Seconde passe (v1.47)** : recherche
plein texte Wikidata (`list=search` `"Nom" haswbstatement:P106=Q937857`, puis `wbgetentities`), qui retrouve les fiches
sans nom de famille renseigné et tolère les accents ; jokers et vivier datés 1995 (2000 pour `JOKERS_RESERVE_2000`).
Contrôle à l'aveugle sur 255 joueurs vérifiés : **zéro erreur d'identité**, 5 % de graphies discutables (Johann/Johan,
Michaël/Mickaël). Bilan : **2 836 / 3 083 (92 %)**. Wikidata ne coûte aucun jeton : c'est la voie à privilégier
(l'auteur a jugé la recherche par agents trop chère).
**v1.47, quatre doublons de jokers corrigés** : « G. Ferrara », « G. Casiraghi », « J. Alkorta », « C. Lombardo » de
`JOKERS_RESERVE` étaient Ciro Ferrara, Pierluigi Casiraghi, Rafael Alkorta et Attilio Lombardo, déjà présents sous
leur bonne initiale dans les clubs européens : ils portent désormais le même nom, ce qui permet aussi à
`retireDEurope` de les reconnaître (un seul homme sur un seul terrain). « R. Vidaković » (Betis) est juste : Risto.
**Joueurs générés** (`genJoueur`, amateurs de coupe, vivier procédural) : un prénom d'époque tiré de
`PRENOMS_GEN` selon l'origine du nom de famille (`origineDuNom`), qui commence par l'initiale, **haché sur le nom**
pour rester le même d'une ouverture à l'autre.
**La routine de nuit** doit remplir la table pour chaque saison ajoutée (étape 3 de `chantier-saisons.md`).
Gardé par `harness-prenoms.cjs` (couverture de tous les vrais joueurs, prénom collé à l'initiale, prénom composé,
générés toujours prénommés, noms sans initiale laissés tels quels).

### COMMENT UN PAYS ENTRE DANS LE JEU (ANG-A, v1.80)
Première étape du lot structure qui précède l'Angleterre. Rien n'est joué ici : **aucune saison étrangère n'est
ajoutée**, on pose seulement le cadre qui permettra d'en ajouter une. La décision a été écrite AVANT la première
ligne de code, comme l'exige `chantier-saisons.md`.

**Le principe, en une phrase** : le moteur reste un moteur français, et un pays est une **couche d'affichage**
par-dessus. Les montants restent en francs dans `G`, les divisions restent `G.div` 1 et 2, le championnat garde ses
vingt clubs et ses trente-huit journées, la coupe nationale reste `G.coupe`. Ce qui change d'un pays à l'autre,
c'est **le nom qu'on donne aux choses et l'unité dans laquelle on les écrit**. Aucune règle de jeu n'est
paramétrée par pays, et c'est volontaire : un moteur qui se plie par pays se casse par pays.

**La table `PAYS`** (en tête de script, juste sous `VERSION`) décrit chaque pays : son nom, son adjectif, son
drapeau, les libellés de ses deux divisions (en fonction de l'année, voir plus bas), les étiquettes courtes du
bandeau, sa coupe nationale, sa coupe de la ligue, la formule « champion de … », son unité monétaire et son
**taux d'affichage**. Deux entrées pour l'instant, `FR` et `ANG`.
**Piège de vocabulaire, à ne pas confondre** : `CLUBS_EUROPE` porte DÉJÀ un champ `pays`, qui contient un nom de
pays en français (« Angleterre », « Pays-Bas ») et sert à la présentation d'un adversaire de Coupe d'Europe. Le
champ `pays` de `SAISONS` est d'une autre nature : c'est un **code** (`"FR"`, `"ANG"`), clé de la table `PAYS`.

**Le champ `pays` dans `SAISONS`** : chaque saison dit de quel pays elle est. Les vingt saisons françaises portent
`pays:"FR"`, et **l'absence du champ vaut `"FR"`** — une saison sans pays est française, ce qui garde toute
sauvegarde d'avant la v1.80 valide sans migration de données. `G.pays` est posé par `nouvellePartie` et rattrapé
par `migre()` pour les carrières déjà ouvertes.

**Les clés de `SAISONS` : préfixées, sauf la France.** `"ANG-1990-91"`, `"ITA-1990-91"`, `"ESP-1990-91"` — mais la
France garde ses clés nues, `"1995-96"`, `"2009-10"`. Ce n'est pas une exception de confort, c'est le choix le
moins risqué : ces clés nues sont écrites en dur dans **vingt harnais** (`const KEY = "1990-91"`), dans
`SAISON_DEFAUT`, et dans toute l'histoire de ce fichier. Les préfixer coûterait vingt fichiers de retouche pour
zéro gain, puisque **la vérité sur le pays d'une saison est son champ `pays`, pas sa clé**. La clé n'est qu'un
espace de noms : elle empêche `"1990-91"` français et `"1990-91"` anglais de se recouvrir. Règle, donc : *la clé
d'une saison est son créneau daté, préfixé du code pays pour tout pays autre que la France.*

**Le pays REGARDÉ, et non le pays joué** (`PAYS_VU`, `AN_VU`, `voitPays(code, an)`). Les libellés et les montants
s'affichent aussi à l'accueil, avant qu'aucune carrière n'existe — et l'accueil peut montrer une saison anglaise
alors que `G` porte encore une carrière française, puisque « 📁 Mes carrières » ne vide pas `G`. Lire `G.pays` pour
afficher serait donc faux à l'accueil. On tient deux variables de session, le code du pays regardé et l'année
regardée, posées à **exactement trois endroits** : `ecranAccueil()` (la saison choisie au sélecteur),
`nouvellePartie()` (le pays de la saison de départ) et `migre()` (donc tout chargement de carrière). Rien n'entre
dans la sauvegarde hors `G.pays`. Les helpers `paysVu()`, `libDiv(n, an)`, `tagDiv(n, an)`, `libCoupeNat()`,
`libCoupeLigue()`, `libChampion()` et `adjPays()` lisent ces deux variables.

**Les libellés de divisions suivent l'ANNÉE, pas seulement le pays** — c'est le détail d'époque qui vaut le
détour, et il est vérifié : en Angleterre, l'élite est la **First Division** jusqu'en 1991-92 et la **Premier
League** à partir de 1992-93 ; l'échelon du dessous est la **Second Division** jusqu'en 1991-92, la **Division
One** de 1992-93 à 2003-04, et le **Championship** à partir de 2004-05. Une carrière anglaise commencée en 1990-91
voit donc son bandeau passer de « D1 » à « PL » au bout de deux saisons, tout seul.
**En France, les libellés ne bougent PAS.** La D1 réelle devient la Ligue 1 en 2002, mais `chantier-saisons.md`
tranche depuis le début : on dit le nom d'époque dans le sous-titre de la saison et **on ne touche pas aux
libellés du moteur**. `PAYS.FR` rend donc « Division 1 » et « Division 2 » quelle que soit l'année, et c'est la
garantie que la v1.80 ne change pas un pixel d'une partie française.

**La monnaie d'affichage** : le moteur compte en francs, point. Chaque pays porte un **taux d'affichage** qui
convertit au moment d'écrire, et son unité. `FR` : taux 1, « FF » et « MF ». `ANG` : taux 1/8, « £ » et « M£ »,
parce que **huit francs valaient une livre** dans les années 90 — vérifié sur les moyennes annuelles de la Réserve
fédérale (1995 : 4,9864 FF/$ × 1,5785 $/£ = 7,87 FF/£ ; 1996 : 5,1158 × 1,5607 = 7,99). Le chiffre est juste
d'époque et rond à retenir. Conséquence agréable : un budget de 100 MF devient 12,5 M£, et un billet à 70 FF
devient 9 £, deux ordres de grandeur conformes à l'Angleterre de 1995. **L'économie n'est donc calibrée qu'une
fois**, en francs, pour tous les pays — on ne rejoue pas l'équilibrage à chaque frontière.
Cinq helpers écrivent les montants, et **en France ils rendent exactement ce que rendaient les expressions
qu'ils remplacent, à l'octet près** : `MM(n, d)` pour les millions (point décimal, comme la grande majorité des
sites existants), `MMv(n, d)` pour les millions à virgule (les quelques sites qui faisaient
`.replace(".", ",")`), `MMC(n)` pour le catalogue du centre de formation (qui passe par `MF_C`), `UU(n)` pour
un montant à l'unité, et `MMn(n, d)` pour le **nombre seul**. Ce cinquième est né d'un piège : sur cent
soixante-sept sites, **deux ne portaient pas leur unité** — la cellule « Valeur MF » de l'effectif, dont
l'unité est dans l'en-tête de colonne, et le « au lieu de 3.0 » du coup de la semaine. Les convertir comme
les autres y aurait ajouté un « MF » qui n'y était pas. Le point et la virgule qui cohabitent sont une verrue héritée des cent dix sites d'origine,
pas une décision : la régulariser un jour se fera d'un coup, en touchant aux deux helpers et à rien d'autre —
c'est précisément ce que le cadre apporte.
**Ce qui N'EST PAS passé au cadre, et pourquoi** : les montants écrits **en toutes lettres dans un récit**
(« 6 points de pénalité, 8 MF d'amende », « 300 000 francs » pour le guérisseur, « 0,8 MF retenus sur salaire »,
les tarifs cités dans les commentaires de la billetterie). Ce sont des **textes**, pas des montants calculés :
les convertir veut dire réécrire la phrase, ce qui est le travail d'**ANG-D**. La ligne de partage retenue : *un
montant calculé passe par le cadre ; un montant écrit dans une phrase est du texte.* Même raison pour
`PALIERS_STADE` (« Stade de Division 1 »), les historiques de clubs et les sous-titres de saisons.
**Piège à ne pas rouvrir** : `"Pépite de Division 2"` est une **clé du vivier**, sérialisée dans `G.vivier` et
testée par `harness-recruteur.cjs`. Ce n'est pas un libellé : on n'y touche jamais.

**Le sélecteur d'accueil est groupé par pays, et ne se montre groupé que s'il y a de quoi.** Tant que `SAISONS`
ne contient qu'un pays, le `<select>` reste la liste plate d'aujourd'hui ; dès qu'un deuxième pays entre, les
`<optgroup>` apparaissent tout seuls, drapeau et nom en tête de groupe, dans l'ordre de la table `PAYS`. Le code
est en place et gardé par le harnais (qui enregistre une fausse saison anglaise le temps de son contrôle), mais
l'écran d'aujourd'hui est inchangé : c'est voulu, un groupe unique n'est pas un groupe.

**Ce que ce cadre ne fait PAS, et qui reste aux étapes suivantes** : les clubs anglais et leurs couleurs (ANG-B),
la réconciliation avec `CLUBS_EUROPE` — un club anglais ne peut pas être à la fois au championnat et dans le
vivier de Coupe d'Europe (ANG-C), tout ce qui dit « France » sans le savoir : `HONNEURS`, la sélection nationale,
les dépêches, la presse, les noms de villages de la coupe, les prénoms procéduraux, les incidents datés (ANG-D),
et le harnais de plateau (ANG-E). Gardé par **`harness-pays.cjs`**.

### LES CLUBS ANGLAIS (ANG-B, v1.81)
Deuxième étape du lot structure. Toujours aucune saison anglaise jouable : on pose les **clubs**, c'est-à-dire
la matière que les vingt saisons anglaises iront piocher. Rien du moteur n'est touché, une seule ligne de code
l'est (`metaClub`, qui cherche désormais aussi dans la nouvelle table).

**Combien de clubs, et comment on l'a su.** La file d'attente annonçait « ~45 clubs » ; ils sont **72**. Le
chiffre n'a pas été deviné : les **quarante classements** de la période ont été relevés un par un sur Wikipédia
(First Division puis Premier League, Second Division puis Division One puis Championship), et l'union de ces
quarante plateaux donne soixante-douze clubs. Les quarante tables ont été lues, pas trente-sept : les sept
dernières se cachaient derrière trois formats différents — une table transcluse d'un article séparé
(`{{:1997–98 Football League First Division}}`), un renvoi `{{main|…}}` vers un article qui porte la table, et
un `team_order=` où le « code » d'équipe est le nom du club en clair. **Leçon pour l'Italie et l'Espagne : une
table de classement Wikipédia se lit de trois façons, et s'arrêter à la première laisse des clubs dehors.**
C'est ce qui a rattrapé Bury et Walsall, deux clubs que les trente-sept premières tables ne montraient pas.

**Une table à part, `CLUBS_ANG`, et pas une rallonge de `CLUBS_EXTRA`.** Les clubs français ont grandi par
sédimentation, un club neuf par saison ajoutée ; les clubs anglais arrivent d'un bloc, et les mélanger aurait
rendu les deux listes illisibles. `metaClub` cherche dans l'ordre `CLUBS`, `CLUBS_D2`, `CLUBS_EXTRA`, puis
`CLUBS_ANG` : **un club français répond donc toujours en premier**, ce qui est la garantie qu'aucune partie
française ne change de fiche.

**Les identifiants : aucun vol, et quatre partages voulus.** Cent quinze codes étaient déjà pris (clubs
français et vivier de Coupe d'Europe). Les soixante-douze codes anglais les évitent tous — d'où `CHL` pour
Charlton (`CHA` est Châteauroux), `CRW` pour Crewe (`CRE` est Créteil), `TOT` pour Tottenham (`TOU` est
Toulouse), `BNS` pour Barnsley (`BAR` est le Barça). **Quatre codes sont en revanche partagés exprès** :
`BLB`, `EVE`, `FOR` et `LIV` — Blackburn, Everton, Nottingham Forest et Liverpool sont **déjà** dans
`CLUBS_EUROPE`. Même club, même code : c'est précisément ce qui permettra à **ANG-C** de retirer Liverpool du
vivier européen le jour où l'on jouera le championnat anglais. Leur donner un second code aurait rendu la
réconciliation impossible. Le harnais vérifie que les codes partagés sont **exactement** ces quatre-là.
Conséquence agréable et assumée : ces quatre clubs **gagnent leurs couleurs** dans `BLASONS`, donc une partie
française voit enfin Liverpool en rouge et Everton en bleu en Coupe d'Europe, au lieu du gris de repli.

**Les capacités sont celles de l'après-rapport Taylor, et c'est une décision.** Un stade anglais de 1990
annonçait 57 000 places debout et en remplissait 36 000 ; la capacité du jeu fait la recette, donc c'est la
seconde qui compte. La capacité de base est celle du stade **tout assis** du début des années 90, pas la
capacité à terrasses. Highbury entre donc à 38 500 et non à 57 000.

**Les budgets suivent le barème FRANÇAIS du moteur**, prestige par prestige (10 → 95 MF, 9 → 75, 8 → 58,
7 → 42, 6 → 36, 5 → 26, 4 → 18, 3 → 13, 2 → 8, 1 → 6). Manchester United pesait en vrai dix fois le PSG : le
reporter tel quel aurait fait sauter l'équilibrage. Le choix d'ANG-A tient — **l'économie n'est calibrée
qu'une fois, en francs** — et la couche `PAYS` divise par huit à l'affichage, ce qui donne des ordres de
grandeur anglais justes (58 MF = 7,3 M£ pour Arsenal en 1990). Le harnais refuse tout budget hors barème.

**Les déménagements, tous datés sur l'année d'ouverture du stade.** C'est le point où une erreur se verrait :
un club dans un stade qui n'existe pas encore. Les trente-cinq déménagements de la fenêtre sont donc dans
`STADE_EPOQUE`, chacun vérifié sur l'infobox de l'article du stade — Emirates **2006**, City of Manchester
Stadium **2003** (le stade a ouvert en 2002, mais pour l'athlétisme), Stadium of Light **30 juillet 1997**,
St Mary's **11 août 2001**, Riverside **26 août 1995**, Pride Park **18 juillet 1997**, Reebok et Britannia
**1997**, Walkers **2002**, Ricoh **2005**, JJB **1999**, KC **décembre 2002**, Madejski **1998**, Kassam
**2001**, Liberty **2005**, New Den **4 août 1993**, Alfred McAlpine **1994**, Keepmoat **2007**, le stade de
Colchester **août 2008**, Cardiff City Stadium **22 juillet 2009**. Le harnais épingle **cinquante-trois faits
de stade**, en vérifiant chaque fois l'année d'avant ET l'année d'après. Trois cas valaient le détour :
**Charlton** joue à Selhurst Park en 90/91, à Upton Park en 91/92 et ne rentre à The Valley qu'en décembre
1992 ; **Wimbledon** quitte Plough Lane pour Selhurst Park en 1991 puis part à Milton Keynes en 2003 ;
**Brighton** perd le Goldstone Ground en 1997, squatte Priestfield deux ans, et atterrit à Withdean.

**Le standing, lui, raconte l'argent.** `PRES_EPOQUE` porte trente-neuf clubs anglais, parce que la fenêtre
1990-2010 est exactement celle où le football anglais change de mains : l'argent de Jack Walker fait passer
Blackburn de 3 à 8 entre 1990 et 1995, celui d'Abramovitch Chelsea de 7 à 10 en deux ans, celui d'Abou Dhabi
Manchester City de 6 à 9, pendant que Leeds tombe de 8 à 4 et Nottingham Forest de 6 à 3. Le budget suit tout
seul, `metaSaison` le recalculant dans la proportion du prestige.

**Les couleurs sont vérifiées club par club**, sur deux sources concordantes de la page Wikipédia de chaque
club : les **hex du maillot** de l'infobox (`body1`, `leftarm1`, `shorts1`, `socks1`) et la **phrase de la
section couleurs** qui dit le motif (« red and white striped shirts », « blue-and-white halves »,
« red and white hoops »). Les valeurs sont ensuite ramenées à la **palette maison** — le harnais refuse toute
couleur qui n'est pas déjà employée par un club français, pour que les deux pays se ressemblent à l'écran.
Vingt et un clubs sont donc rayés (Newcastle, Sunderland, Stoke, Sheffield United, Southampton, QPR, Reading,
Brighton, Crystal Palace, Grimsby, Notts County, Hull, Bradford, Huddersfield, Colchester, Brentford,
Doncaster, Scunthorpe, Sheffield Wednesday, West Bromwich Albion, Wigan), neuf coupés en deux (Aston Villa,
West Ham, Burnley, Blackburn, Bristol Rovers, Bury, Crewe, Fulham, Ipswich), quarante-deux unis. **Des clubs
partagent une allure** et c'est voulu : Rennes et Guingamp la partagent déjà dans le jeu, et on a préféré la
couleur juste au blason distinctif.

**Vingt-huit derbys**, tous réciproques et tous nommés : Manchester, le Merseyside, le nord de Londres,
l'ouest de Londres, le Tyne-et-Wear, la seconde ville, le Black Country, Sheffield, le Yorkshire de l'Ouest,
l'East Anglia, les Potteries, les East Midlands, le Lancashire de l'Est, la M61, la côte sud, le sud du Pays
de Galles, Bristol, la M23, les dockers, la M69, la Tamise, le Lancashire de l'Ouest, la M1, la vallée de la
Tamise, le Lincolnshire, le Yorkshire du Sud, l'Essex, les Fens. Le harnais vérifie qu'**aucune paire n'est
franco-anglaise** dans un sens ni dans l'autre, qu'aucun club n'a deux rivaux, et que les trente-sept noms de
derby du jeu sont tous différents.

**Le piège neuf, et il est petit mais il est réel : l'esperluette.** « Brighton & Hove Albion » est le premier
nom de club du jeu à porter un `&` — aucun club français n'en a. Vérification faite, tout nom de club atteint
l'écran par `esc()`, jusqu'au texte des dilemmes (`esc(cp.q)`), donc le nom passe. Le harnais ne cache pas le
cas, il l'**épingle** : il refuse tout chevron et tout guillemet, compte **une seule** esperluette dans toute
la table, et vérifie que `esc()` la rend bien en `&amp;`.

**Ce qui N'EST PAS fait ici, et reste aux étapes suivantes** : la réconciliation avec `CLUBS_EUROPE`
(ANG-C), tout ce qui dit « France » sans le savoir — `HONNEURS`, la sélection, les dépêches, la presse, les
noms procéduraux (ANG-D), le harnais de plateau (ANG-E). Et deux tables de **lore** sont restées françaises
exprès, parce qu'elles sont du texte et non de la métadonnée : `JAMAIS_CHAMPION`/`MALEDICTIONS` ne connaissent
aucun club anglais, donc aucun d'eux ne vit de malédiction — c'est le travail d'ANG-D, et en attendant le jeu
ne raconte rien de faux. Gardé par **`harness-clubs-ang.cjs`**.

**Le correctif de moteur livré au passage (v1.81), et pourquoi ce jour-là.** La validation d'ANG-B a fait
remonter le rouge intermittent de `harness-recruteur.cjs` que les livraisons de 06/07, 07/08 et 08/09 avaient
diagnostiqué et laissé, chaque fois pour la même bonne raison : *corriger une assertion est un travail de
moteur, pas de saison*. ANG-B **est** une journée de moteur, et le diagnostic d'alors, qui accusait
l'assertion, s'est révélé incomplet : la faute était dans **`nomLong`**. La fonction ne consommait qu'**une**
initiale en tête (`^\p{Lu}\.(?:-\p{Lu}\.)* `), alors que **dix vrais joueurs** en portent deux — séparées
par une **espace** (« T. A. Flo », « J. S. Verón », « J. C. Unzué », « B. T. Kvarme », « J. L. Diezma »,
« J. L. Vidigal », « J. M. Prieto », « J. O. Hjelde », « T. K. Staurvik ») ou par un **trait d'union suivi
d'une minuscule** (« C.-y. Park », comme souvent dans un prénom coréen). Le jeu écrivait donc **« Tore André
A. Flo »** et **« Juan Carlos C. Unzué »** sur la fiche, la signature et la feuille de match, et gardait
« C.-y. Park » au nom court alors que son prénom était connu. Le motif devient
`^\p{Lu}\.(?:[-\s]\p{L}\.)* `, et le `""` de « J. S. Verón » — un prénom laissé vide alors que Juan
Sebastián Verón ne fait aucun doute, et le seul des dix à tomber dans le vivier du recruteur — reçoit son
prénom. Sur les **4 457** noms à prénom connu, il ne reste **aucune** initiale orpheline. **Garde-fou : la
section G de `harness-prenoms.cjs`**, et son motif `INI` aligné sur celui de `nomLong` — le harnais avait
exactement le même angle mort, et rangeait « C.-y. Park » parmi les noms *sans* initiale.


## Validation AVANT toute livraison (non négociable)
1. Extraire le JS et vérifier la syntaxe :
   `python3 -c "import re; open('game.js','w').write(re.search(r'<script>(.*)</script>', open('index.html').read(), re.S).group(1))" && node --check game.js`
2. Lancer un **harnais headless Node** : stub minimal de `window`/`document`, puis `nouvellePartie(id)`
   et boucle `jouerJournee()` sur plusieurs saisons. Vérifier : pas d'erreur, calibrage des buts,
   pas de joueur 36+ actif après vieillissement, incidents sans exception.
3. Pour l'UI : capture **Playwright** (voir `/audit-ui`), en desktop ET en mobile 390px.
4. Toujours tester une **carrière multi-saisons** (au moins 6 saisons) pour les régressions.
5. Harnais spécialisés à repasser quand on touche à leur domaine (tous doivent finir « TOUT EST VERT ») :
   `harness9697.cjs` (saison de départ 96/97), `harness9798.cjs` (saison de départ 97/98 : repêchés, Nice en C2,
   réconciliation France ↔ Europe), `harness9899.cjs` (saison de départ 98/99 : double repêchage, clubs neufs
   Sedan/Ajaccio, Euro 2000 à la 2e intersaison), `harness9900.cjs` (saison de départ 99/00 : double repêchage,
   Créteil, Euro 2000 dès la 1re intersaison, homonymes et prénoms composés),
   `harness0001.cjs` (saison de départ 00/01, **la plus récente du jeu** : double repêchage dans les deux
   sens, aucun club neuf, `euroC2` VIDE puisque la Coupe des Coupes a disparu, Gueugnon en Coupe UEFA
   depuis la D2, été 2001 muet et Mondial 2002 à la 2e intersaison, les trois N'Diaye et les deux frères
   Cheyrou, les dix pépites forcées dont Drogba),
   `harness9293.cjs` (saison de départ 92/93 : aucun repêchage, aucun club neuf, Monaco en C2 faute de
   vainqueur de la Coupe 92, été 93 muet, jumeaux Vujović),
   `harness9192.cjs` (saison de départ 91/92 : aucun repêchage en D1, Tours écarté et Beauvais repêché,
   Bourges et le Gazélec, Euro 92 dès la 1re intersaison, homonymes Ferri/Vujovic), `harness-euro.cjs` (les trois coupes d'Europe),
   `harness-prenoms.cjs` (les prénoms, v1.46 : chaque vrai joueur a son entrée, le prénom colle à l'initiale),
   `harness-pays.cjs` (le cadre des pays, ANG-A v1.80 : la table PAYS complète, les libellés de divisions
   qui suivent le pays ET l'année côté anglais sans bouger d'un mot côté français, le champ `pays` et la
   convention de clé, les cinq helpers de montants prouvés IDENTIQUES aux expressions qu'ils remplacent en
   France et convertis à huit francs la livre en Angleterre, le pays regardé qui n'est pas le pays joué,
   le sélecteur qui se groupe dès qu'un deuxième pays entre — contrôlé en enregistrant une fausse saison
   anglaise le temps du test),
   `harness-noms.cjs` (les saisons nommées : un nom par saison, la collection sans doublon, et surtout le
   créneau daté laissé intact dans `titre` et `G.saison`),
   `harness-effectif.cjs` (plancher réglementaire, quotas de cession, soupape du centre de formation,
   rappel d'un prêt avant terme),
   `harness-stade.cjs` (le stade en maquette, v1.36 : nouvelle partie à la taille du club, vieille sauvegarde convertie,
   chemin jusqu'à 100 000 places, effets bornés, rendu dans vingt états, Entrer dans l'histoire dans les six styles ;
   section G v1.41 : entretien réduit des places ajoutées, remboursement d'une tribune, accès, pelouse chauffante),
   `harness-centre.cjs` (le centre d'entraînement en campus, v1.53 : campus à zéro dans une partie neuve, migration d'un
   vieux `G.centre` bornée par l'époque, un chantier à la fois au centre mais possible pendant celui du stade, refus sans
   argent, livraison et entretien, les trois époques, le château refusé puis livré, chaque effet à zéro et au maximum
   pour votre club seulement avec le plafond de soin 0,70, le calibrage en différentiel, vingt états de rendu sans NaN ni
   tiret long, et une carrière de six saisons où le campus monte),
   `harness-sauvegardes.cjs` (poids des sauvegardes, plusieurs carrières, adoption de la clé historique,
   index qui se répare, mémoire pleine), `harness-repetitions.cjs` (téléscripteur : anti-répétition
   des lignes et des motifs narratifs en championnat, en coupe et après un changement de consigne ;
   **et cohérence de la mise en scène** — un contre s'annonce comme un contre, une frappe de trente mètres
   ne s'annonce pas comme une dernière passe, un but sur corner s'annonce comme un corner, un lob suit un
   gardien sorti de sa surface, et aucune montée ne chiffre une distance que la résolution contredirait),
   `harness-fraicheur.cjs` (l'état de forme physique : barème, décrochage du vétéran sur une saison, rythme à
   trois jours, rotation automatique pour vous ET pour l'IA, effets mesurés sur le rendement et les blessures,
   intersaison et migration, rendu des six écrans à toutes les valeurs de jauge, et **depuis v1.11 les
   changements** : poste pour poste, 220 points par équipe, prorata de l'entrant/du sortant/de l'expulsé, rouge qui
   annule un changement, 400 matchs sans sortant nommé après sa sortie ni entrant avant son entrée, entrants qui
   marquent, consigne changée en direct qui garde ses changements, et « X entre à la place de Y » au direct ;
   **section J depuis v1.13, les gardiens** : jamais entrés pour la tactique, rouge du titulaire relevé par le gardien
   du banc à la place d'un attaquant sur l'une des trois places, cage vide quand les changements sont faits ou le banc
   sans gardien, pas de troisième gardien, relais sur la blessure de la 90e, rouge effacé par le direct qui rend le
   changement sauté, et 600 matchs à gardiens nerveux, dont 300 recollés, sans ligne orpheline ni changement en double),
   `harness-banc.cjs` (le banc en direct, v1.19 : la fenêtre qui s'ouvre et qui sait se taire — ne pas
   l'ouvrir, c'est le jeu d'avant —, le vivier des entrants et des sortants, le changement voulu qui prend
   l'une des trois places sans jamais en créer une quatrième, 60 changements où la pelouse suit et où le
   moteur ne nomme personne hors de son temps de jeu, la ligne annoncée tout de suite avec les mots d'un
   choix, le poids d'un meilleur et d'un moins bon entrant, les trois changements épuisés, la fraîcheur au
   prorata et l'échappement des noms),
   `harness-blessure.cjs` (la blessure en direct, v1.18 : un seul tirage par homme et par match — la feuille du
   jour REMPLACE le tirage d'après-match au lieu de s'y ajouter —, la minute qui tombe dans le temps de jeu de
   l'homme, le banc qui répond dans les trois changements (y compris en avançant un entrant prévu plus tard),
   400 matchs où le blessé remplacé ne touche plus un ballon et où son remplaçant marque pour de bon, le gardien
   touché avec et sans doublure, la fraîcheur au prorata, la scène toujours suivie de la réponse du banc à sa
   minute, le poids d'un boiteux et d'une fin à dix, la survie de la scène au recollage d'une consigne, une saison
   entière sans exception avec le taux de blessures dans sa plage, et **la fenêtre du banc cliquée pour de vrai**
   sur un vrai nœud DOM — les quatre boutons, ce que chacun change sur la feuille du jour, l'échappement des noms,
   et le résultat déjà acté qui ne rouvre rien),
   `harness-modales.cjs` (les fenêtres maison qui ont remplacé alert/confirm/prompt : rendu réel dans un vrai
   nœud `#msgbox`, échappement de tout ce qui vient du joueur ou d'un fichier, la confirmation qui ne dit
   « oui » que si on clique « oui », et **Échap qui dépile le message sans percer une fenêtre verrouillée**),
   `harness-hdm.cjs` (l'homme du match et l'almanach : une distinction par rencontre dans TOUTE la division,
   le barème — rouge disqualifiant, cage inviolée, 1-0 au buteur —, le moral et le mot de debrief, la remise à
   zéro à l'intersaison, le rendu du classement des hommes du match, la mémoire de l'almanach, et le bilan de
   saison qui se calcule ET se rend, y compris sur une saison à peine entamée).
   `harness-progression.cjs` (le cap franchi : `aMoi()` qui tranche sur le contrat et non sur le vestiaire,
   la notification qui part au Debrief et plus dans les dépêches, la carte postale du prêté, le silence sur
   l'emprunté, un prêt de quinze journées joué pour de bon, et le +1 de la sélection nationale),
   `harness-rdv.cjs` (les rendez-vous de semaine, **et depuis v1.20 le bloc « APRÈS CE MATCH »** — les
   trois prochains rendez-vous, le tour de coupe qui ne s'annonce qu'à sa journée et sans promettre
   d'adversaire, la manche retour qui nomme le sien, le soir qu'on joue déjà et qui n'y figure pas, l'ordre
   Europe → coupe → championnat, et la fin de saison qui n'annonce plus rien : consigne et prime neutres par défaut puis efficaces en coupe et
   en Europe, prime payée à la qualification et remise à zéro, consigne changée en direct qui rejoue la fin sans
   toucher au montré ni fausser la loi du score, verdicts européens recalculés, et le Calendrier qui montre le
   rendez-vous à préparer au lieu d'une fenêtre verrouillée),
   `harness-memoire.cjs` (la mémoire longue : les quatre actes et leurs bascules, l'enjeu calculé aussi bien
   sur une sauvegarde relue que sur la partie en cours, les six raisons de « ce match compte parce que… »,
   le premier record qui se tait et celui qui se crie, le palmarès élargi, le cumul d'une fiche de vie sur
   deux saisons, le jubilé, les sifflets du virage, le baromètre des tribunes et ses alertes, l'étoile
   « Suivre » au debrief, et l'écran de reprise qui se calcule ET se rend).
   `harness-multiplex.cjs` (le multiplex de fin de journée, v1.17 : la carte construite à chaque journée,
   les mouvements de rang qui ne divergent jamais du classement réel, la carte figée qui survit à la remise à
   zéro de l'intersaison, le rendu des deux cartes — noms échappés, podium et voisins toujours montrés, une
   qui n'annonce un nouveau leader qu'à bon escient —, l'enchaînement carte 1 → carte 2 → journée suivante
   avec le défilement qui amène la carte sous les yeux, le repli quand la carte manque, le poids dans la
   sauvegarde, et 114 cartes rendues sur trois saisons d'affilée),
   `harness-formations.cjs` (les formations, v1.12 : le 4-4-2 neutre par défaut et pour l'IA, le onze / la rotation de
   coupe / les ★ qui suivent la formation, le dépanneur d'un effectif décimé qui joue dans la ligne qu'il bouche, les
   trois caractères à joueurs égaux sans points gratuits, « trois bons milieux valent mieux que quatre moyens », le
   bon choix qui dépend de l'effectif sur 80 vrais clubs, 5 000 matchs du vrai moteur par formation, le caractère
   porté les soirs de coupe, la sauvegarde, l'avant-match rendu — boutons, petit terrain, rapport de forces, nom
   échappé, annonce au coup d'envoi — et deux saisons en changeant de formation chaque semaine),
   `harness-coupes.cjs` (**l'ÉTALON des coupes**, posé le 22/09/2026 en ouverture du chantier « un seul moteur » :
   sur un hasard à graine fixe — deux lancers rendent les mêmes chiffres, `GRAINE=…` pour un autre tirage — il
   joue 150 saisons × 3 clubs (60 jusqu'au 24/09/2026) et mesure ce que le modèle de force autonome produit, puis le compare à des valeurs
   gravées dans le fichier : buts par match en Coupe de France (2,63), pro contre pro (2,37) et pro contre amateur
   (3,06), part des tirs au but (21,5 %), **taux d'exploit d'un amateur sur un pro (16,1 %)**, parcours du Petit
   Poucet (12,2 % de quarts ou mieux), tour de sortie de votre club (35 % dès les 32es), Europe (2,37 buts par
   manche, 8,3 % de t.a.b., 65,2 % de qualifications du favori), et **l'invariant des buteurs** — résoudre des
   milliers d'affiches ne doit toucher aucun compteur de joueur, dans aucun vivier. Quand la bascule vers
   `simuleMatch` sera faite ces chiffres bougeront : c'est attendu, et l'étalon devra être réécrit SCIEMMENT,
   valeur par valeur. Ce qu'on refuse, c'est qu'ils bougent sans que personne le voie. **Sa section G** garde le
   contexte de compétition : 400 matchs du vrai moteur joués sous le maillot « CF » ne déposent pas un but au
   classement des buteurs du championnat et les déposent tous dans le compteur de coupe, le championnat écrit
   toujours dans le sien, et le maillot est rendu même quand le match lève une exception).

## Workflow de livraison
- Itérer dans le fichier → valider (ci-dessus) → **incrémenter la version** en pied de page →
  commit git avec un message clair en français → push (GitHub Pages déploie tout seul).
- Tag git aux jalons (`v1.0`…).
- Résumer les changements à l'auteur en français, style article de presse, à la fin.
- **Une saison par jour (chantier automatisé, depuis le 22/09/2026)** : une routine cloud quotidienne
  (4h du matin) ajoute une saison de départ par jour et la **livre directement sur `main`** — donc en ligne
  chez les testeurs, sans relecture préalable (choix de l'auteur, 22/09/2026 ; la première saison, 1990-91,
  était passée par une PR avant ce basculement). Sa file d'attente, ses règles et son journal vivent dans
  **`chantier-saisons.md`** : quinze saisons françaises (1990-91 → 1994-95, puis 2000-01 → 2009-10), puis
  l'Angleterre, l'Italie et l'Espagne de 1990-91 à 2009-10, chacune précédée d'un lot « structure » (le jeu
  ne connaît qu'un pays aujourd'hui). **En livraison directe, les harnais sont la seule chose qui sépare une
  erreur des joueurs** : un harnais rouge arrête la livraison du jour, il ne se contourne pas. Si l'on
  ajoute une saison à la main, cocher sa ligne dans ce fichier.

## Pièges connus (déjà corrigés, ne pas réintroduire)
- **UN DÉPANNEUR JOUE DANS LA LIGNE QU'IL BOUCHE (v1.12)** — trouvé par `harness-formations.cjs` avant livraison.
  Quand un effectif décimé ne peut pas remplir une ligne, `onze()` complète avec le meilleur joueur de champ restant.
  Compté dans la zone de son **vrai** poste (comme l'ancien moteur le faisait sans dommage, ses deux blocs ne
  dépendant pas de la formation), un milieu qui bouche le trou d'un 5-3-2 sans cinquième défenseur mettait **quatre
  milieux pour trois places** : le 5-3-2 « décimé » battait alors le 4-4-2 dans les **trois** zones à la fois —
  une formation à choisir justement quand on manque de défenseurs. Correctif : **`placeXI(xi, F)`** répartit le
  onze par ligne (hommes de métier d'abord, puis chaque dépanneur dans la ligne qui manque d'hommes : défense, milieu,
  attaque, but), et le dépanneur y vaut **`HORS_POSTE`=0,85** (0,5 s'il enfile les gants ou si un gardien joue dans
  le champ). Le petit terrain d'avant-match lit la même répartition et marque « (dépanne) ». **Règle** : tout calcul
  par zone passe par `placeXI`, jamais par `j.pos` directement. Gardé par la **section B bis** du harnais.
- **UN PRÊTÉ N'EST PLUS DANS VOTRE EFFECTIF — NE TESTEZ JAMAIS L'APPARTENANCE SUR `j.club` (v1.07)** :
  `preteJoueur` **déplace physiquement** le joueur dans `hote.joueurs`, et `empruntJoueur` fait l'inverse.
  Tout code qui écrit `c.id===G.monClub` ou `j.club===G.monClub` pour décider « est-ce mon joueur ? » se
  trompe donc deux fois : il **oublie le prêté** (qui reste à vous) et **adopte l'emprunté** (qui ne l'est
  pas). C'est ce qui rendait la progression des jeunes muette pendant toute la durée d'un prêt — le joueur
  gagnait ses points dans le silence complet, alors que c'est justement *l'intérêt* de la pige — pendant
  qu'un emprunté déclenchait la nouvelle à sa place. Correctif : le helper **`aMoi(j)`** (juste au-dessus de
  `progression`), qui tranche sur le **contrat** (`G.prets`) et pas sur le vestiaire. **À réutiliser** pour
  toute question d'appartenance. Gardé par **`harness-progression.cjs`**.
- **UN POINT GAGNÉ SE DIT AU DEBRIEF, PAS DANS LES DÉPÊCHES (v1.07)** : le jeu a deux canaux, et ils ne
  pèsent pas pareil. **`notif()`** empile dans la modale « 📋 LE DEBRIEF », qu'on ne peut pas rater ;
  **`G.news`** alimente le panneau « Dépêches », qui n'affiche que les **six dernières** ligne 7276. Une
  semaine chargée (transfert + prime + incident + deux blessures) chassait donc « Untel progresse ! » de
  l'écran avant qu'il soit lu. **Règle** : tout ce qui change durablement un joueur (note gagnée, cap
  franchi) passe par `notif()` ; les dépêches restent la chronique de fond. Les deux `+1` du jeu —
  `progression()` et le retour de sélection dans `selections()` — sont désormais préfixés **📈** (le harnais
  s'appuie sur ce préfixe pour les compter). **📈 leur est RÉSERVÉ** (v1.14) : l'alerte d'affluence « Le public
  revient » l'empruntait, et `harness-progression.cjs` la prenait de temps en temps pour la progression d'un joueur
  qui n'est pas à vous (faux échec aléatoire, ~1 passe sur 7) — elle porte désormais **🏟️**. Aucune autre notif ne
  doit commencer par 📈.
- **ÉCHAP NE DOIT JAMAIS PERCER UNE FENÊTRE VERROUILLÉE (v1.05)** : l'écouteur clavier du bas de fichier
  faisait `fiche.style.display="none"` **à la main**, sans regarder `window._penEnCours`. On évacuait donc
  d'un coup de touche un incident, une conférence de presse, un chapitre d'arc, l'avant-match d'un tour de
  Coupe de France ou d'Europe, un penalty à la 90ᵉ. Trois dégâts d'un coup : la chaîne de l'entre-match
  (`ouvreEuro` → `ouvreCoupe` → `ouvreEre` → `ouvreIncident` → `ouvreArc` → `ouvreConf` → `ouvreDebrief` →
  `ouvrePromo` — depuis v1.10 les deux premières ont disparu au profit du panneau `panneauRdv`) s'arrêtait net puisque `suite()` n'était jamais appelée ; le **verrou restait LEVÉ**, donc
  `fermeFiche()` ne fermait plus rien ensuite ; et un tour de coupe pouvait rester en attente. Correctif :
  la touche passe par **`fermeFiche()`**, seule porte qui respecte le verrou, après avoir laissé
  **`fermeMessage()`** dépiler un éventuel message maison (qui, lui, vit au-dessus).
  **LA MÊME FAILLE AVAIT UNE SECONDE PORTE** : le clic sur le FOND de la fenêtre. Les gestionnaires
  `fiche.onclick=e=>{ if(e.target===fiche) … }` sont posés **sur l'élément**, donc ils **survivent à la
  fenêtre qui les a posés** — une fenêtre verrouillée qui suit ne fait que réécrire `innerHTML`. Un clic à
  côté d'un incident refermait donc tout, exactement comme Échap. Les trois gestionnaires de fond (prêt,
  fiche joueur, nomination du capitaine) et leurs boutons « Fermer » passent désormais par `fermeFiche()`.
  **Règle** : aucune fermeture de `#fiche` ne doit s'écrire en touchant `display` directement — toujours
  `fermeFiche()`. Les trois seules exceptions assumées sont `fermeFiche()` elle-même, `abandonneDirect()`
  et `retourAccueil()`, qui **lèvent le verrou d'abord** parce qu'elles mettent fin à la séquence.
  Gardé par la **section G de `harness-modales.cjs`**.
- **UNE OFFRE PEUT SURVIVRE À SON OBJET (v1.05)** : `G.offreExt` (l'offre étrangère de la semaine) est tirée
  en début de journée et reste affichée jusqu'au coup d'envoi — rien n'empêchait de **prêter** le joueur
  entre-temps. `accepterOffreExt` filtrait alors `moi.joueurs` **sans rien y trouver** (il vit chez le club
  hôte), on encaissait le transfert, et le prêt le **ramenait quand même** à l'échéance : vendu ET rendu.
  Deux verrous : `preteJoueur` **périme l'offre** sur le joueur qu'il fait partir (comme `rappelPret` le
  faisait déjà pour `G.offrePret`), et `accepterOffreExt` refuse une offre dont le joueur n'est plus dans
  l'effectif. Même famille : `traiterPrets` **solde** un prêt dont le joueur a disparu au lieu d'en facturer
  la pige jusqu'au bout, et `retourPret` ne suppose plus que le porteur et le club de destination existent
  encore. **Règle** : toute offre mémorisée dans `G` doit revérifier son objet AU MOMENT DU CLIC, pas
  seulement à la génération.
- **`MF` comparait une chaîne à `undefined` (v1.05)** : `FMT(n/1e6*10)/10 !== undefined` est **toujours vrai**
  (`NaN !== undefined`), donc le repli était du code mort et un montant absent se serait affiché « NaN MF ».
  Remplacé par `Number.isFinite(n)`, repli « — ». Sans effet en jeu, mais la branche morte aurait fini par
  se voir à l'écran Finances.
- Les lignes de commentaire du direct (`COMM.amb`/`arret`/`rate`/`but`/`cj`/`cr`/`cf`…) sont rendues
  par `fmtC`, qui ne remplace QUE trois jetons : `{A}` (le joueur concerné), `{G}` (« le gardien »)
  et `{D}` (l'adversaire). **Pas de `{B}`** : une ligne qui nomme un second joueur (passeur, etc.)
  afficherait « {B} » en clair. Pour évoquer un relais, rester générique (« un relais traverse… »).
  **Deux corollaires découverts à l'écriture du lot 1 (v0.83), qui ont tous deux fait apparaître des
  jetons en clair à l'écran** : (a) `fmtC` fait un `String.replace` avec une *chaîne*, donc il ne
  remplace que la **PREMIÈRE occurrence** de chaque jeton — une ligne qui emploie deux fois `{A}` ou
  `{G}` affiche le second en clair, donc **un jeton au plus une fois par ligne** ; (b) les lignes
  d'ambiance **ne passent PAS par `fmtC`** (`ev.push({t:"amb",x:PICK(COMM.amb)})`, brut) — `COMM.amb`
  et les lignes de `ETAT` ne doivent donc contenir **aucun jeton**, et `ETAT` doit rester de
  formulation **neutre** (dans `simuleMatch` on ne sait pas de quel côté est le joueur). Contrôle
  utile avant livraison : balayer toutes les familles à la recherche d'un jeton doublé, puis simuler
  quelques centaines de matchs verbeux en comptant les `{A}`/`{G}`/`{D}` restés visibles (doit être 0).
- **UNE LIGNE NE DOIT JAMAIS AFFIRMER UNE PHASE DE JEU QU'ELLE NE CONNAÎT PAS (v0.87)** : même famille
  d'erreur que la météo, sur le **contre**. Cinq lignes de `but`/`rate` et une de `MONTEE_BUT` disaient
  « contre fulgurant », « contre éclair », « contre-attaque » alors qu'elles sont **tirées au hasard, sans
  accès au contexte** — d'où le bug de playtest : l'équipe est en pleine attaque et le direct annonce un
  contre. Or un contre naît **forcément** d'une attaque adverse avortée. Correctif : (a) **purge** de tout
  vocabulaire de contre des pools génériques (reformulés en attaque construite) ; (b) **`DERN_ATT`** mémorise
  la dernière action offensive et **`estContre(c,m)`** décide — jamais si le même camp attaquait déjà
  (`dt<=3` → `false`, interdit **par construction**), jamais juste après avoir encaissé (on engage), 70 %
  si l'attaque adverse vient d'échouer, 12 % hors phase ; (c) mise en scène **en trois temps** : le premier
  temps devient **`MONTEE_CONTRE`** (10 formulations, des **fonctions** `(récupérateur, dépossédé)` comme
  `MONTEE_FRAPPE` — `fmtC` ne connaît qu'un seul joueur, donc nommer deux personnes impose ce format ;
  trois origines conformes à la consigne auteur : ballon piqué au milieu, incompréhension adverse, passe
  hasardeuse dans leur défense), puis le porteur arme, puis la résolution tirée de **`butContre`** /
  **`rateContre`** / **`arretContre`**. Un contre force toujours sa mise en place (`q.bu=true`).
  **PIÈGE MAJEUR, découvert au test** : `DERN_ATT` ne doit être mise à jour que quand l'événement est
  **réellement poussé dans `ev`**, donc **affiché**. En la mettant à jour sur tout événement du moteur, on
  autorisait un contre après une attaque adverse que le joueur **n'avait jamais vue** (l'occasion n'avait pas
  passé le filtre `Math.random()<.7`) — la séquence restait illogique à l'écran. **La narration doit se caler
  sur ce qui est montré, pas sur ce que le moteur sait.** Vérification : zéro violation sur 600 matchs,
  ~0,70 contre/match. Aucun événement créé, aucun score modifié → calibrage intact (2,376).
- **LE CONTRE ANNONCÉ COMME UNE ATTAQUE PLACÉE (v0.98)** — troisième épisode de la même famille
  que la météo (v0.86) et que le contre (v0.87) : **une ligne ne doit jamais affirmer une phase de
  jeu qu'elle ne connaît pas**. Retour de playtest : « l'enchaînement des commentaires n'a pas trop de
  sens, « l'attaque prend feu » suivi par un contre ». Cause : la mise en scène du contre
  (`MONTEE_CONTRE`, construite en v0.87) **n'avait été branchée que sur le direct de COUPE**. Le direct
  du CHAMPIONNAT — celui que le joueur voit chaque semaine — et celui d'Europe tiraient toujours
  `MONTEE_BUT`, donc annonçaient une attaque placée avant de conclure « Contre fulgurant ! ».
  Mesuré sur l'ancien code : **14 % des montées concernaient un contre, et 43 % des matchs** en
  contenaient au moins un, mal annoncé. `MONTEE_CONTRE` n'apparaissait que **deux fois** dans tout le
  fichier (sa définition et la branche coupe) — un bon réflexe de relecture : compter les occurrences
  d'un pool pour vérifier qu'il est bien câblé partout où il doit l'être.
  **La duplication était la cause**, d'où le correctif : une seule fonction **`monteeUn(info, lignes,
  campA, campD)`** décide du premier temps, et les **trois `tic()`** (championnat, coupe, Europe)
  l'appellent. Elle lit le drapeau `contre` que le moteur pose déjà sur `g` (but) et sur `q`
  (occasion) ; sans camps connus, elle retombe proprement sur la montée générique. **Règle à tenir :
  tout nouveau direct passe par `monteeUn`, jamais par `pickM(MONTEE_BUT, …)` en direct.**
  Le même lot nettoie **deux lignes de `MONTEE_BUT`** : « L'attaque prend feu, ça va très vite… »
  (l'auteur a demandé ce que ça voulait dire — quand une ligne appelle cette question, elle a raté son
  travail) devient « Ça circule à une touche de balle, la défense ne suit plus… », et « Le corner est
  joué à deux… » **imposait un corner** alors que le pool se veut agnostique au type de finition
  (règle écrite au-dessus de `MONTEE_BUT`, violée par cette seule ligne) → « Le ballon revient dans
  la surface… ». Deux tests de garde dans le harnais balaient désormais `MONTEE_BUT` à la recherche
  de vocabulaire de contre et de coup de pied arrêté.
  **Résidu refermé en v1.04** : l'inverse restait possible dans l'autre sens — une montée de jeu ouvert
  (« Ouverture limpide dans le dos des défenseurs… ») pouvait précéder une **ligne de but qui, elle, nomme
  un corner**. `TIRS_ARRET` + le drapeau `ph` + `MONTEE_ARRET` sont exactement le « drapeau de plus sur
  l'évènement » et le « petit pool de montées sur coup de pied arrêté » esquissés ici. Voir **LA MONTÉE DOIT
  CONNAÎTRE LA CONCLUSION** dans la section des commentaires du direct.
  **Note d'implémentation** : `motifDe` (anti-répétition, v0.97) ignore désormais explicitement ce qui
  n'est pas une chaîne — les pools de montée sont des **fonctions**, et tester une regex dessus
  reviendrait à la passer sur leur code source.
- **DEUX FOIS LE MÊME BUT DANS UN MATCH (v0.97)** — retour de playtest : « j'ai eu trois fois le même
  but dans le match, mais écrit un peu différemment » (Bordeaux - Auxerre 4-0 : les lignes de la 34ᵉ et
  de la 81ᵉ **mot pour mot identiques**, et celle de la 72ᵉ racontant le même fait de jeu). Deux causes,
  toutes deux corrigées. **(a) L'anti-répétition existait (`pickNR`) mais ne couvrait pas les lignes les
  plus lues** : le décor (ambiance, corner, hors-jeu, cartons, poteau, but refusé…) y passait, mais le
  **BUT**, l'**occasion** et l'**arrêt** restaient sur un `PICK` avec remise. Sur 23 lignes de `COMM.but`,
  un match à quatre buts avait ~24 % de chances de resservir le même commentaire — mesuré sur l'ancien
  code : **206 matchs sur 1500 (13,7 %)** avec une ligne en double, et **377 tours de coupe sur 800 (47 %)**,
  les pools étant plus sollicités sur un score fleuve. **(b) Plusieurs lignes racontent LE MÊME FAIT DE JEU
  avec d'autres mots** : le but contre son camp en a quatre formulations dans `COMM.but`, et deux d'entre
  elles dans la même rencontre suffisent à donner l'impression d'avoir revu le même but (**97 matchs sur
  1500, 6,5 %**). D'où les **MOTIFS** (`MOTIFS_COMM`) : un motif = une expression qui reconnaît sa famille
  (`csc` le contre son camp, `glisse` la glissade au moment de conclure, `crochet` le crochet de trop — ce
  dernier à cheval sur `rate` ET `rateContre`), et un motif déjà raconté écarte ses autres formulations
  pour le reste du match. **La détection est déclarative** : une formulation ajoutée à un pool est
  rattachée toute seule — mais **vérifier au grep qu'une nouvelle expression n'attrape aucune ligne
  étrangère**, un faux positif bloquerait silencieusement une ligne innocente. Trois détails qui comptent :
  la fenêtre `garde` passe de 40 à **200** (la mémoire couvre maintenant ~17 lignes reconnues par match,
  34 au pire, là où elle n'en voyait qu'une poignée) ; quand un pool étroit est vraiment épuisé (le
  « second jaune » n'a que deux formulations), le repli ne tire plus au hasard mais **ressort la ligne la
  plus ancienne** (LRU), pour que la répétition inévitable soit au moins lointaine ; et la mémoire
  **voyage avec l'objet match** (`memoireDe`) pour survivre à un changement de consigne en direct
  (`rejoueDepuis` → `simuleReste`), où l'ancienne ardoise vierge laissait revenir une ligne déjà lue
  (237 reprises sur 600). **Elle est posée NON ÉNUMÉRABLE** : l'objet match dort dans `G._pend`, donc dans
  la sauvegarde, et rien qui grossit n'entre dans `G` (cf. la leçon des 2,6 Mo) — `JSON.stringify`
  l'ignore. **Limite assumée** : les lignes du cours de match annulé par un changement de consigne restent
  brûlées (jamais affichées, mais comptées) ; ça ne coûte qu'un peu plus de variété, et le harnais en
  tient compte pour ne pas crier au loup. Aucun effet moteur : **calibrage mesuré 2,385**.
  Validation dédiée : **`harness-repetitions.cjs`** (il reconnaît le gabarit d'origine de chaque ligne
  affichée en rebatissant une expression par ligne de pool — **piège à la relecture : un nom de joueur
  contient un point (« L. Laslandes »), donc le joker doit accepter le point, sinon le harnais ne
  reconnaît presque rien et dort les yeux ouverts**).
- **UNE SEULE VOIX POUR LE TEMPS QU'IL FAIT (v0.86)** : depuis la météo (v0.84), `METEO_MATCH` est le
  **seul** propriétaire du ciel et de l'état du terrain. Les lignes génériques — `COMM.amb` et les groupes
  de `ETAT` — ne doivent **JAMAIS affirmer** qu'il pleut, qu'il gèle, que le terrain est gras ou sec, etc.
  Sinon deux tirages indépendants se contredisent **dans le même match** : bug remonté en playtest, un
  « terrain gras, ça glisse » à la 67ᵉ suivi d'un « terrain sec et dur comme du béton » à la 82ᵉ. Les deux
  lignes fautives (terrain gras, ballon flottant dans le vent) ont été **déplacées dans le bon temps**
  (`boue` et `vent`) plutôt que supprimées, et remplacées dans `amb` par des lignes neutres. Contrôle avant
  livraison : balayer `COMM.amb` et `ETAT` à la recherche du vocabulaire météo (pluie, boue, gras, soleil,
  froid, neige, brouillard, flaque, crampons vissés…) — doit être vide. Une métaphore reste piégeuse : la
  ligne du fumigène disait « on joue dans le brouillard », reformulée pour lever l'ambiguïté.
- **NE JAMAIS RANGER UN OBJET CLUB DANS `G` (v0.94)** — le piège le plus coûteux trouvé à ce jour, parce
  qu'il ne se voit nulle part à l'écran. `G.histo.push(res)` archivait les résultats de la journée avec les
  **objets clubs passés par référence** : à la sérialisation, `JSON.stringify` les déplie en entier, chaque
  journée pesait ~100 Ko et une sauvegarde de milieu de saison atteignait **2,6 Mo** (5 Mo une fois comptée
  en UTF-16). Au-delà du quota du navigateur, `setItem` lève — et comme la sauvegarde auto était
  *silencieuse*, **elle échouait sans un mot** : le joueur revenait le lendemain sur une partie figée des
  semaines plus tôt. Une carrière de 16 saisons montait à 5 Mo de texte, donc n'était plus sauvegardable du
  tout. Correctif : l'historique n'archive que **les ID et le score**, les dépêches (`G.news`, dont on
  n'affiche que les 10 dernières) sont plafonnées à 60, `migre()` allège les vieilles sauvegardes au
  chargement (−76 % mesuré sur un cas réel) et `sauvegardeLocale` prévient désormais quand la mémoire est
  pleine. Règle : dans `G`, on référence un club **par son `id`** (`clubById` fait le reste) ; tout tableau
  qui grossit sans fin doit être plafonné.
- **RIEN DE JAUNE NI DE CYAN SUR LE BANDEAU (v0.94)** : `.topbar` a un fond `var(--jaune)`. La division
  y était rendue par `<b class="jaune">D1</b>` — **jaune sur jaune, contraste 1,00:1, purement invisible**
  (et le `.cyan` de la D2 plafonnait à 1,17:1). Le défaut a vécu des mois sans être vu : à l'œil, la ligne
  se lit « 1995-96 ·  · J12/38 », avec un trou qu'on prend pour une espace. Correctif : une **pastille
  inversée** `.topbar .divTag` (fond `#16243c`, texte jaune, cyan en `.d2`) — 10,78:1 et 9,22:1. Règle
  générale : les classes de couleur `.jaune`/`.cyan`/`.vert`/`.dim` sont pensées pour le **fond bleu nuit** ;
  sur un fond clair (bandeau, bouton `.big`, ligne sélectionnée) il faut inverser, jamais les réutiliser
  telles quelles. Contrôle : mesurer le contraste rendu, pas le juger sur le code.
- **LE JAUNE PLEIN NE SE PORTE QUE SUR UNE ACTION ENCORE OFFERTE (v1.02)** — cousin du piège précédent,
  mais sur le SENS de la couleur plutôt que sur son contraste. Retour de playtest, sur la prime à la
  signature : « après qu'on ait négocié, tous les boutons restent en jaune ce qui crée de la confusion ».
  Cause : `demandePrime` faisait `b.disabled=true` sur ses trois boutons, or **`button.big` n'avait AUCUN
  style `:disabled`** (seul `button.act` en avait un) — trois boutons éteints restaient donc strictement
  identiques au seul qui cliquait encore (« Signer »). Règle posée : **fond jaune plein = cliquable
  maintenant** ; dès qu'un bouton s'éteint il **s'inverse** (fond bleu nuit, cadre et typo jaune) — on lit
  toujours ce qu'il dit, on ne le prend plus pour une action. Trois états dans le `<style>` :
  `button.big:disabled` (indisponible : jaune éteint `#c9a63a`, cadre `#6b5a22`), `button.choisi`
  (la décision qu'on a prise : cadre et typo jaune vif + coche ✅) et `button.ecarte` (les options que ce
  choix a fermées : gris, opacité .55). Le `.big` plein porte un `border:2px solid transparent` pour que
  l'inversion ne décale rien. **Un seul helper les pose** : `figeChoix(noeuds, choisi)`, partagé par
  `finMoment` (moments de match) et `demandePrime`. Le correctif a aussi rattrapé trois écrans où la même
  ambiguïté dormait : la zone de penalty retenue était **jaune plein comme « Reprendre le match »**
  (deux boutons pleins, un seul cliquable), et « ACHETER » / « Payer la prime » restaient pleins quand la
  fenêtre de mercato ou la caisse les interdisaient. Contrôle : après un choix tranché, **compter les
  boutons au fond jaune plein à l'écran — il doit y en avoir exactement un** (ou zéro s'il n'y a plus
  rien à faire), et le mesurer au `getComputedStyle` en Playwright, pas à la lecture du code.
- **ON NE S'ENGAGE JAMAIS SUR DES MILLIONS EN UN SEUL CLIC (v1.02)** — retour de playtest : « il me semble
  avoir acheté un joueur en 1 seul clic sur l'écran de l'effectif d'une équipe, ça m'a surpris ». Exact :
  `acheter()` n'ouvrait la modale de prime que pour les joueurs **vénaux ou vedettes** (`venal>=5 ||
  note>=80`) ; pour tous les autres, le bouton « Acheter » de `ecranClubVue` appelait `finaliseAchat`
  séance tenante. Le geste engageait donc 23 MF sans un mot, et de façon **imprévisible** — parfois un
  écran, parfois rien, selon un trait du joueur que rien n'affiche. Correctif : un helper
  **`modalSignature({titre, corps, ok, annul, onOk, onNon})`** qui récapitule ce qu'on signe, ce que ça
  coûte et ce qu'il reste en caisse, branché sur **les cinq engagements irréversibles** — achat mercato
  (`acheter`, en amont de la prime, qui reste le second temps de la négociation), recrue joker
  (`acheterJoker` → le corps est passé à `signeJoker`), vente éclair (`venteEclair`, qui abandonne au
  passage le `confirm()` du navigateur, hors décor et muet sur ce qu'on perd), chantier de stade
  (`lanceProjet`) et centre d'entraînement (`ameliorerCentre`, devenu `lanceCentre` en v1.53). Les deux derniers **re-vérifient leurs
  conditions dans `onOk`** : entre l'ouverture et la confirmation, la situation a pu changer.
  **`modalSignature` court-circuite en `EN_TEST()`** (appel direct de `onOk`) — sans quoi
  `harness-euro.cjs`, qui appelle `acheterJoker(0)` sans DOM pour cliquer, dormirait les yeux ouverts.
  L'embauche d'un coach n'a PAS été touchée : `ouvreRecrutement` est déjà un écran de choix chiffré.
- L'overlay d'un moment de match ne doit jamais surgir hors d'un match : `abandonneDirect()`
  sur chaque transition d'écran nettoie le ticker.
- Reset des stats de TOUS les clubs à l'intersaison (`razStatsClub`), y compris ceux qui restent.
- Backstories cohérentes avec l'origine du patronyme (un Traoré ne grandit pas en RDA).
- Après un choix d'incident, masquer les options non choisies et mettre en valeur la décision prise.
- En mobile, la règle `table{min-width:540px}` (scroll horizontal des grands tableaux) s'applique à TOUTES
  les `table`. Les tableaux étroits libellé/valeur (Finances, Buteurs, Passeurs) doivent porter
  `class="fit"` (qui remet `min-width:0`), sinon leur colonne de droite — montants, compteurs de buts/passes —
  sort de l'écran et devient invisible.
- **L'ÉCRAN EFFECTIF TIENT SUR UNE LIGNE PAR JOUEUR (v1.09, retour de playtest capture iPhone : 225 px par
  joueur)**. Mesuré en Playwright à 390 px : **88 → 43 px** par ligne en mobile, **62 → 35 px** sur ordinateur.
  Trois causes : la jauge + le mot de forme (→ chiffre + émoji, cf. FRAÎCHEUR), « 50.6 MF » coupé en deux (→ l'unité
  monte dans l'en-tête « Valeur MF »), et quatre boutons sur deux cellules empilés en trois étages (→ **une barre
  de quatre pictos collés** `.effBtns` : ★ titulariser · 🛌 repos · 🏷️ vendre · 📤 prêter). Règles à tenir :
  (a) **pictos seuls, partout** — avec leurs libellés, le tableau débordait de 130 px **même sur ordinateur**
  (le panneau n'y scrolle pas) ; ils sont nommés par `aria-label`, l'infobulle et la légende sous le tableau.
  (b) L'état en cours s'**allume en cyan** (`.on` + `aria-pressed`), jamais en jaune plein (règle v1.02).
  (c) « [au repos] » et « [à vendre] » ont quitté le nom (dits par la colonne d'état ET par le bouton allumé) ;
  seuls blessé/suspendu/prêt restent, en petit **sous** le nom. (d) Le clic de ligne teste
  **`e.target.closest(".effBtns")`**, jamais `classList.contains` : le doigt tombe sur le `<span>` du picto,
  et la fiche s'ouvrait par ricochet. (e) En mobile, le **nom reste collé à gauche** quand on défile vers les
  boutons : `position:sticky; left:-8px` (−8 = la marge intérieure du `.panel`, sinon les chiffres défilent dans
  une bande visible) et le filet est un **`::after`** — en tableau à bordures fusionnées, ni `border` ni
  `box-shadow` ne suivent une cellule collante. Vérifié au navigateur (script de clics : picto qui agit sans
  ouvrir la fiche, grisé inerte, nom qui ouvre la fiche, zéro bouton jaune plein, nom au bord après défilement).
- **LE TÉLÉSCRIPTEUR ÉCRIT DU PLUS RÉCENT AU PLUS ANCIEN (v1.04, demande de l'auteur)** : la dernière action
  se lit **tout en haut**, on ne suit plus le bas du cadre au fil du match. Deux règles à tenir dans les
  **TROIS** directs (championnat, Coupe de France, Europe) : on insère en **`"afterbegin"`** (jamais
  `"beforeend"`) et le retour en tête se fait avec **`scrollTop=0`** (jamais `scrollTop=scrollHeight`).
  `ajouteLigne` porte la règle pour les lignes de jeu ; les blocs de fin de match l'appliquent à la main.
  **Conséquence contre-intuitive, le vrai piège** : un bloc inséré APRÈS un autre ressort AU-DESSUS de lui.
  Un panneau en plusieurs morceaux doit donc être posé dans l'ordre **INVERSE** de la lecture voulue — c'est
  pourquoi `afficheFeuille` (championnat) pose d'abord le **multiplex de fin de journée** (v1.17) **puis** la
  feuille de match, pour qu'on lise feuille → cartes → bouton. En Europe l'ordre naturel joue à l'endroit : la ligne
  « Fin de l'aller » / « TIRS AU BUT » est posée après la feuille, donc s'affiche au-dessus — le verdict
  d'abord, le détail ensuite, ce qu'on veut. **Ne PAS toucher** aux trois `insertAdjacentHTML("beforeend")`
  qui restent : ce sont les colonnes de buteurs du tableau d'affichage (`tBuH`/`tBuA`), qui doivent, elles,
  rester chronologiques. Vérification en navigateur : les minutes lues de haut en bas doivent être
  **décroissantes**, et `scrollTop` valoir 0 au coup de sifflet final.
- Le téléscripteur (`#ticker`) a `overflow-y:auto`, donc c'est un bloc de formatage indépendant ; il cohabite
  avec les boutons de vitesse (`#ctlVitesse`) en `float:right`. Il doit garder `clear:both` (et les contrôles
  passent sur leur propre ligne en mobile), sinon il se rétrécit en une mince colonne à côté du flottant.
- Les filtres du mercato (poste, âge, division, recherche, favoris, tri) sont conservés dans l'objet module
  `MERCF`, pas dans des locales de `ecranMercato` : un achat passe par `rafraichir()`→`montre("mercato")` qui
  ré-exécute tout l'écran, et sans `MERCF` chaque achat réinitialiserait les filtres (la case « Mes favoris »
  se décochait). `rend()` recopie l'état dans `MERCF` à chaque rendu, les contrôles le reflètent (`selected`/
  `checked`/`value`), et `nouvellePartie` le remet à neuf. **Depuis v0.81, `MERCF` porte AUSSI `page` (pagination)
  et `sel` (uid du joueur dont la fiche est ouverte)** — les deux à réinitialiser comme le reste à `nouvellePartie`.
- **Écran mercato refondu (v0.81, 100 % présentation, calibrage intact)** : le **rapport du recruteur** est en
  **cartes** (`carteJoker`, panneau à filet cyan, `.mercRap` en grille 3 colonnes desktop / empilées mobile),
  un **bandeau d'état** dédié (filet vert si `fenetreOuverte()`, rouge sinon) porte `msgMercato()` + le budget
  transferts, et les trois `<select>` (poste/âge/division) sont devenus des **chips segmentées** (`.mChip`,
  `data-f`/`data-v`, classe `on` = jaune, `onD2` = cyan pour la seule chip D2) plus la recherche texte et un
  bouton chip « ★ Favoris ». **Pagination** (`PAR_PAGE=20`) : plus de `slice(0,60)` + « masqués », un vrai pageur
  `◀ Précédente · Page x/y · N correspondants · Suivante ▶` rend **tout le pool national atteignable** ; tout
  changement de filtre/tri fait `page=1`. **Fiche joueur mercato** : la modale `ouvreFiche` n'est PLUS appelée
  depuis le tableau — le clic sur une ligne pose `MERCF.sel=j.uid` et affiche `ficheMercato(j)` dans un
  **panneau latéral sticky** (`.mercWrap` grille `1fr 360px`, `#ficheM`) sur desktop, **ET** dans une **ligne
  dépliée** (`<tr class="mercDet"><td colspan="11">…`) sous la ligne cliquée sur mobile — les deux canaux
  rendent le MÊME HTML, CSS masque celui qui ne sert pas (`@media(min-width:701px){tr.mercDet{display:none}}` /
  `.mercFiche{display:none}` en mobile). **Piège** : la fiche existe donc en double dans le DOM → ses boutons
  sont câblés **par classe** (`.mfBuy`/`.mfLoan`/`.mfFav` via `querySelectorAll`), **jamais par id** (id
  dupliqué = invalide), en fermant sur le seul `selJ` sélectionné. Le `.mercDetInner` est `position:sticky;
  left:0;max-width:calc(100vw−44px)` pour que le bouton ACHETER reste dans le viewport malgré le scroll
  horizontal de la table. `ouvreFiche` reste utilisée partout ailleurs (effectif, clic sur une carte joker…)
  — ne pas la supprimer. Aucun effet moteur : le harnais ne rend pas l'écran, calibrage mesuré inchangé.
- Le penalty CONTRE (`momentPenContre`) : la narration doit coller à l'issue réelle. Plonger du bon côté ne
  garantit pas l'arrêt (les frappes pures passent quand même) ; le texte ne doit donc jamais clamer la réussite
  (« vous aviez lu son regard ! ») quand le but rentre — d'où le verdict « BUT QUAND MÊME — la frappe était
  trop pure » dans ce cas. Cohérence texte/résultat obligatoire.
- La **sélection du XI** (`onze`) complète un secteur décimé (blessures/suspensions) en servant les **joueurs
  de champ d'abord** ; un 2e gardien ne bouche un trou qu'en **tout dernier recours** (tri
  `(a.pos==="G")-(b.pos==="G")||note`). Bug d'origine signalé en playtest : on alignait un gardien remplaçant
  à la place d'un joueur de champ disponible. Gardé en régression par la **section E** du harnais.
