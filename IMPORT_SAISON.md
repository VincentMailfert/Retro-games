# Importer une saison de championnat dans Multiplex

Ce fichier s'adresse à une session Claude Code (souvent une session cloud) qui ne connaît rien du projet.
Lis-le en entier avant de commencer.

## Ce qu'il faut savoir d'abord

**Multiplex** est un jeu de gestion de football rétro, dans un seul fichier HTML :
`championnat/index.html` (environ 20 000 lignes, servi sur https://multiplex.club). Chaque saison de
départ jouable est une vraie saison, avec deux divisions de **20 clubs** et de **vrais joueurs**.
La documentation complète du projet est `championnat/CLAUDE.md` (très long : lis seulement les
sections citées ici).

**Il n'existe ni script d'import ni fichier de données tout prêt.** Les effectifs se relèvent sur
Internet, saison par saison, puis on les cure à la main. L'import se fait en **deux phases** :

| Phase | Qui | Ce qu'elle produit | Ce qu'elle touche |
|---|---|---|---|
| **1. Le relevé** | une session par saison, **en parallèle** | trois fichiers dans `releves/ANG-AAAA-AA/` | **uniquement ce dossier** |
| **2. L'assemblage** | une seule session, **saison après saison, dans l'ordre des années** | la saison jouable dans `index.html`, son harnais, sa documentation | le jeu |

Pourquoi deux phases : la note d'un joueur reprend celle qu'il a dans la saison voisine, en la faisant
vieillir ; le nom d'une saison ne doit reprendre aucun mot des autres ; un même nom court ne peut pas
servir à deux hommes. Quinze sessions qui écriraient chacune dans `index.html` ne se verraient pas entre
elles, et produiraient des conflits à chaque fusion. Le relevé, lui, ne dépend que de sa propre saison.

**Si on te demande d'« importer la saison X »**, sans autre précision : **tu fais la phase 1, et
seulement elle.** La phase 2 ne se fait que si la demande dit explicitement « assemble ».

---

## Phase 1 : le relevé d'une saison

### Règle de travail

1. Pars de `main` à jour : `git checkout main && git pull`.
2. Crée la branche **`import/<championnat>-<saison>`**, par exemple `import/angleterre-1994-95`.
   Si la plateforme cloud t'a déjà placé sur une branche `claude/…`, garde-la : c'est la seule où tu
   as le droit de pousser.
3. **N'écris que dans `releves/ANG-AAAA-AA/`** (par exemple `releves/ANG-1994-95/`). Tu peux LIRE tout
   le dépôt, mais tu ne modifies **rien d'autre** : ni `championnat/index.html`, ni `CLAUDE.md`, ni
   `championnat/chantier-saisons.md`, ni les harnais, ni la constante `VERSION`.
4. Tes scripts de relevé et les pages téléchargées vont dans un dossier temporaire **hors du dépôt**
   (par exemple `/tmp/releve`). Ne les committe pas.
5. Termine par **un seul commit** sur ta branche (message en français, par exemple
   `Relevé ANG 1994-95 : 40 clubs, 760 joueurs, 3 doutes`), puis `git push -u origin <ta-branche>`.
   **Ne pousse jamais sur `main`.** N'ouvre pas de pull request : l'auteur fusionne lui-même.

### Où sont les données

Tout est en ligne. Aucune donnée d'effectif n'est dans le dépôt, sauf les saisons déjà livrées dans
`championnat/index.html`.

| Source | Ce qu'elle donne | Adresse |
|---|---|---|
| **Transfermarkt**, page d'effectif | naissance, poste, colonne « Im Team seit » (date d'arrivée) | `https://www.transfermarkt.co.uk/x/kader/verein/<id>/saison_id/<AAAA>/plus/1` |
| **Transfermarkt**, temps de jeu | matchs, minutes, nom court, mentions de statut | `https://www.transfermarkt.co.uk/x/leistungsdaten/verein/<id>/reldata/%26<AAAA>/plus/1` |
| Transfermarkt, historique de transferts | dates exactes de transfert | `https://www.transfermarkt.co.uk/ceapi/transferHistory/list/<idJoueur>` |
| Transfermarkt, fiche de joueur | naissance, poste | `https://www.transfermarkt.co.uk/x/profil/spieler/<idJoueur>` |
| Classements finaux | le classement réel des deux divisions | Wikipedia anglaise, « 1994–95 FA Premier League » et « 1994–95 Football League First Division » (« Football League Championship » à partir de 2004-05) |
| Base neilbrown, Wikidata, Wikipedia | recoupements quand Transfermarkt a un trou | voir la section « DIVERSIFIER LES SOURCES » de `championnat/CLAUDE.md` |

`<AAAA>` est l'année du coup d'envoi (1994 pour 1994-95). `<id>` est l'identifiant Transfermarkt du club,
**à prendre obligatoirement dans `releves/clubs-tm.json`** (les 72 clubs anglais du jeu, vérifiés). Ne le
cherche jamais ailleurs : en 2003-04, une session a relevé Bologne sous le nom de West Bromwich et un club
espagnol sous celui de Wigan, parce qu'elle avait deviné les identifiants.

**L'anti-robot de Transfermarkt.** Laisse au moins 3 secondes entre deux pages. Si une page répond
« Human Verification » (ou 403, 405), attends dix minutes et reprends là où tu en étais ; essaie aussi
`.com` et `.de`. Après trois reprises sans succès, **arrête-toi** : livre ce qui est sûr et termine par
« RELEVÉ INCOMPLET ». **Ne remplace jamais Transfermarkt en bloc par une autre source**, et **n'estime
jamais une donnée** : une minute inconnue s'écrit `null`, pas « matchs × 85 ».
Requêtes : `curl` avec un User-Agent de navigateur, pages décodées en UTF-8 (repli cp1252). Si un domaine
renvoie une page anti-robot, essaie `.com` puis `.de`. **Une page est valable si elle contient des lignes
de joueurs**, pas parce qu'elle est grosse.

**Teste l'accès au réseau avant tout le reste** : une seule page Transfermarkt et une page Wikipedia.
Si aucune ne répond (« connexion refusée », « host not allowed », « 403 » sur tous les domaines), la
machine n'a pas le droit de sortir sur ces sites : arrête-toi tout de suite, ne crée rien, et termine
par **« RÉSEAU FERMÉ »** en citant l'erreur exacte.

### Lis d'abord ces sections de `championnat/CLAUDE.md`

Elles contiennent les pièges qui ont déjà coûté des livraisons. Cherche-les par leur titre :

- la puce **« Saison de départ au choix (v0.62) »** (dans « Systèmes de jeu en place ») : la méthode de relevé ;
- **« ANG 1992-93 — LA PREMIÈRE PREMIER LEAGUE »** : le plateau à 22 et 24 clubs, les noms libres,
  l'arbitrage des doublons au coup d'envoi par « Im Team seit » ;
- **« ANG 1990-91 »** et **« ANG 1991-92 »** : pourquoi les écartés ne sont pas toujours les derniers ;
- **« DIVERSIFIER LES SOURCES »** et **« LES DEUX MARQUEURS DE TRANSFERMARKT »** : « not in squad »
  (il n'était pas au club, on l'écarte) n'est pas « nicht eingesetzt » (il y était sans jouer, on le garde) ;
- **« LES PRÉNOMS »** et **« LES SAISONS NOMMÉES »**.

### Les étapes, dans l'ordre

1. **Le classement réel.** Relève le classement final des deux divisions (rang, matchs, victoires, nuls,
   défaites, buts pour et contre, points, pénalité éventuelle). Associe chaque club à son **code** dans la
   table `CLUBS_ANG` de `championnat/index.html` (par exemple `MUN` pour Manchester United, `BLB` pour
   Blackburn). **Si un club à retenir manque à `CLUBS_ANG`, arrête-toi** : c'est du moteur, pas un relevé.
2. **Les effectifs de chaque club classé** (les deux divisions entières, 42 à 46 clubs), avec les deux
   pages Transfermarkt. Tu gardes les hommes **présents au coup d'envoi** : `arrivee` vaut 2 si
   « Im Team seit » est antérieure au début de la saison, 0 s'il est arrivé en cours de saison, 1 si la
   date est postérieure à la saison.
   **Une date postérieure est fréquente et ne prouve rien** (Transfermarkt ne garde que la DERNIÈRE
   arrivée : Sheringham, Klinsmann ou Fowler en 1994-95). Recoupe chaque cas avec l'historique de
   transferts (`ceapi/transferHistory/list/<idJoueur>`) : s'il était au club au coup d'envoi, écris 2 ;
   s'il est arrivé pendant la saison, écris 0. Garde `1` seulement si le recoupement est impossible, et
   dis-le dans `remarque`.
   **Les postes** : Goalkeeper → `G` ; Centre-Back, Left-Back, Right-Back, Sweeper → `D` ; tous les
   Midfield **et les ailiers (Left Winger, Right Winger)** → `M` ; Centre-Forward, Second Striker → `A`.
   Transfermarkt range les ailiers parmi les attaquants : ne le suis pas.
3. **Les trous.** Un club à zéro joueur ou presque est un trou de la source, pas un club pauvre :
   interroge les saisons voisines et les autres sources avant de conclure.
4. **Les doublons.** Un homme listé dans deux clubs se règle **par l'identifiant Transfermarkt**, et il
   va au club où il était au coup d'envoi.
5. **Le plateau de 20 + 20.** Le jeu a toujours 20 clubs en haut et 20 en bas. Quand l'élite en comptait
   22, les deux derniers qu'on ne peut pas remplir s'effacent ; l'échelon du dessous en compte 24, et
   quatre s'effacent, en priorité ceux qu'on ne peut pas remplir (moins de 18 hommes, ou un homme sans
   nom libre). Chaque écarté reçoit sa raison écrite.
6. **La présélection.** Pour chaque club retenu : **20 joueurs en haut, 18 en bas**, triés par minutes,
   avec au moins **2 gardiens, 5 défenseurs, 5 milieux, 4 attaquants**. Les **pépites** que le tri aux
   minutes écarte (un futur international qui a peu joué cette année-là) sont forcées à la main, avec
   `"force": true`.
   Si un minimum de poste n'est pas tenu, un ailier ou un milieu offensif peut passer en `A` (ou un
   attaquant de couloir en `M`), à condition que ce soit son vrai rôle : écris-le dans `remarque`.
   **Un club à qui il manque un ou deux hommes se comble, il ne s'abandonne pas.** Avant de conclure
   qu'il est incomplet, cherche dans cet ordre : les joueurs marqués « nicht eingesetzt » (présents mais
   jamais utilisés : ils comptent), les cas `arrivee` 1 ou `null` recoupés par l'historique de
   transferts, la liste d'effectif de la page Wikipedia de la saison du club (« 1994–95 Reading F.C.
   season »), la base neilbrown, puis les pages Transfermarkt des saisons voisines, avec à chaque fois
   l'historique de transferts pour prouver la présence au coup d'envoi. C'est ainsi qu'ANG 1993-94 a
   retrouvé Barnsley et Southend. Ne déclare un club incomplet qu'après ces cinq recherches, et dis
   dans `## Doutes` lesquelles ont été faites.
7. **Les noms.** Si un joueur est **déjà dans le jeu** (cherche son nom court dans `index.html`), reprends
   **exactement** la graphie du jeu. Si deux vrais joueurs portent le même nom, préfixe l'initiale du
   prénom (« Alan Smith » pour l'un, « A. Smith » pour l'autre, selon ce que le jeu utilise déjà).
8. **Les prénoms.** Pour chaque joueur, le prénom d'usage avec ses accents, tiré du nom complet de
   Transfermarkt. **S'il est douteux, écris `""`** : on ne devine jamais un prénom.
9. **Le nom de la saison.** Propose un à trois noms : deux à cinq mots, 34 caractères au plus, français,
   ton léger, tiré de ce que la saison a de singulier (exemples déjà pris : « La fin de l'exil »,
   « Cantona change de camp »). Pas de tiret long « — ».
10. **Le rapport** (`rapport.md`), puis **les vérifications** ci-dessous, puis le commit et le push.

### Le format exact attendu

Le dossier `releves/ANG-1994-95/` contient trois fichiers.

**`plateau.json`**

```json
{
  "cle": "ANG-1994-95",
  "pays": "ANG",
  "an": 1994,
  "sources": ["https://en.wikipedia.org/wiki/1994%E2%80%9395_FA_Premier_League", "…"],
  "classementD1": [
    {"rang": 1, "club": "Blackburn Rovers", "code": "BLB", "j": 42, "g": 27, "n": 8, "p": 7, "bp": 80, "bc": 39, "pts": 89, "penalite": 0}
  ],
  "classementD2": [ "… les 24 clubs de l'échelon du dessous, même forme …" ],
  "d1": ["BLB", "MUN", "…  20 codes, dans l'ordre du classement réel"],
  "d2": ["…  20 codes"],
  "tm_clubs": {"BLB": 164, "MUN": 985, "…": "l'identifiant Transfermarkt utilisé pour chaque club retenu, copié de releves/clubs-tm.json"},
  "ecartes": [{"code": "XXX", "club": "Nom du club", "raison": "rang, nombre d'hommes, et pourquoi lui"}],
  "noms_proposes": ["Premier nom", "Deuxième nom"]
}
```

`code` vaut `null` pour un club écarté qui n'est pas dans `CLUBS_ANG`. `penalite` est le nombre de points
retirés par la ligue (0 le plus souvent).

**`joueurs.json`** : un tableau par code de club, pour **tous les clubs classés** (retenus et écartés).

```json
{
  "MUN": [
    {"tm": 3200, "nom": "Peter Schmeichel", "court": "P. Schmeichel", "prenom": "Peter", "poste": "G",
     "naissance": "1963-11-18", "matchs": 32, "minutes": 2880, "arrivee": 2,
     "retenu": true, "force": false, "deja_au_jeu": true, "source": "tm", "remarque": ""}
  ]
}
```

(L'identifiant `tm`, les matchs et les minutes ci-dessus servent d'illustration, pas de donnée.)

- `tm` : identifiant Transfermarkt du joueur (`null` s'il vient d'une autre source, et `source` le dit) ;
- `court` : le nom affiché dans le jeu ; `poste` : `G`, `D`, `M` ou `A` ;
- `naissance` : `AAAA-MM-JJ`, ou `AAAA` si seule l'année est connue ;
- `arrivee` : 2, 1, 0 ou `null` (voir l'étape 2) ;
- `retenu` : dans les 20 (ou 18) présélectionnés ; `force` : pépite forcée ;
- `deja_au_jeu` : son nom court existe déjà dans `index.html`.

**Aucune note de joueur dans le relevé** : les notes se calculent à l'assemblage, à partir des saisons
voisines. N'ajoute jamais un joueur inventé.

**`rapport.md`** : le résumé final (voir plus bas), avec trois sections titrées exactement
`## Importé`, `## Vérifié` et `## Doutes`. Écris-le en vrai français, **avec tous ses accents**
(« écartés », « vérifié », « Walker a payé »), comme les noms de saison proposés.

**À quoi ressemble une saison une fois assemblée** (pour comprendre, pas pour l'écrire) : ANG 1992-93 dans
`championnat/index.html`, cherche `const D1_ANG9293`, `const STARS_ANG9293` et `"ANG-1992-93":` dans la
table `SAISONS`. Chaque joueur y devient `["P. Schmeichel","G",29,82,86]` : nom court, poste, âge, note,
potentiel.

### Les vérifications obligatoires avant de terminer

Lance le vérificateur, depuis la racine du dépôt :

```
node releves/verifie-releve.cjs releves/ANG-1994-95
```

Il doit finir par **« RELEVÉ VERT »**. Il contrôle, entre autres :

- **nombre d'équipes** : 20 retenues en haut et 20 en bas, toutes connues de `CLUBS_ANG`, aucune deux
  fois ; autant d'écartés justifiés que de clubs en trop ;
- **nombre de matchs** : chaque club a joué 2 × (clubs − 1) matchs (42 pour 22 clubs, 46 pour 24) ;
- **cohérence des classements** : victoires + nuls + défaites = matchs ; points = 3 × victoires + nuls
  − pénalité ; rangs dans l'ordre des points ; autant de victoires que de défaites et autant de buts
  marqués qu'encaissés sur toute la division ;
- **identité des clubs** : chaque club retenu a été relevé sous l'identifiant de `releves/clubs-tm.json`,
  et partage au moins trois joueurs avec le même club dans une saison voisine (déjà dans le jeu ou déjà
  relevée). Si ce contrôle est rouge, tu as lu la page d'un autre club : relève-le à nouveau ;
- **pas de données inventées** : pas de minutes estimées, pas plus de 40 joueurs sans identifiant
  Transfermarkt, aucun club de tête écarté, aucun club écarté parce que la source a bloqué ;
- **effectifs** : 20 / 18 retenus par club, minimums 2-5-5-4, 760 en tout, aucun identifiant
  Transfermarkt retenu deux fois, aucun arrivé en cours de saison parmi les retenus, prénoms cohérents
  avec l'initiale, et pas plus de trois clubs par division à moins de dix joueurs documentés.

Si le vérificateur est **rouge, corrige le relevé** : ne modifie jamais le vérificateur pour le faire
passer. Si tu ne peux pas corriger, livre quand même le relevé, mais écris le défaut dans `## Doutes`.

Fais aussi **deux contrôles à la main**, et note-les dans `## Vérifié` :

- le champion, les promus et les relégués correspondent à Wikipedia ;
- **le test de non-régression** : prends deux clubs d'une saison déjà livrée (par exemple ANG 1992-93) et
  vérifie que tes filtres retrouvent bien leurs effectifs tels qu'ils sont dans le jeu.

Il n'y a **aucun harnais de jeu à lancer** pendant le relevé, puisque le jeu n'est pas touché.

### Si une source est inaccessible

**Arrête-toi et explique-le clairement. N'invente aucune donnée**, pas même un joueur pour compléter un
effectif, une date de naissance ou un score.

- Essaie d'abord les autres domaines (`.co.uk`, `.com`, `.de`) et les autres sources du tableau.
- Si ça ne suffit pas : écris dans `rapport.md` ce qui manque (quelle page, quelle erreur, quels clubs),
  committe et pousse **ce que tu as relevé de sûr**, et termine ton message par la mention
  **« RELEVÉ INCOMPLET »** et la liste de ce qui bloque.
- Si plus de trois clubs d'une division ont moins de dix joueurs documentés, la saison **n'est pas mûre** :
  dis-le, plutôt que de livrer un championnat de fantômes.

### Le résumé final à produire

Ton dernier message, et la même chose dans `rapport.md` :

- **Importé** : la saison, le nom de la branche, les 20 + 20 clubs retenus, les écartés et pourquoi, le
  nombre de joueurs retenus, les pépites forcées, les noms de saison proposés ;
- **Vérifié** : le résultat du vérificateur (copie sa dernière ligne), les deux contrôles à la main ;
- **Doutes** : tout ce qui n'est pas sûr (sources contradictoires, prénoms laissés vides, trous de la
  source, homonymes), avec le nom des joueurs ou des clubs concernés.

---

## Phase 2 : l'assemblage (une seule session, dans l'ordre)

À ne faire **que sur demande explicite** (« assemble les relevés »), et jamais en parallèle.

1. Pars de `main` à jour, sur lequel les branches `import/…` ont été fusionnées.
2. Prends les relevés **dans l'ordre des années**, et pour chacun suis la « journée type » de
   `championnat/chantier-saisons.md` (étapes 2 à 6), en partant du relevé au lieu de relever à nouveau :
   notes reprises de la saison voisine et vieillies, noms libres vérifiés contre TOUT le jeu, nom de
   saison choisi parmi les propositions (ou un autre si un mot est déjà pris), entrées `PRENOMS_VRAIS`,
   ligne dans `SAISONS`, harnais `harness-angAAAA.cjs` calqué sur `harness-ang9293.cjs`, puis **tous les
   harnais** du dossier `championnat/` jusqu'à « TOUT EST VERT ».
3. Une saison, une version, un commit. Un harnais rouge arrête l'assemblage : on ne l'assouplit jamais.
