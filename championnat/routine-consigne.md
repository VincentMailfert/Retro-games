# Consigne de la tâche planifiée : une étape par nuit (Italie, Espagne, Allemagne, Portugal, Écosse)

Ce fichier est la consigne complète de la tâche « MULTIPLEX 95, une saison par nuit ». La tâche elle-même
renvoie ici. Le projet est en français : code, commentaires, messages de commit et compte rendu compris.
L'auteur n'est pas développeur : écris-lui en prose simple.

**Mise à jour du 07/11/2026.** Les vingt saisons anglaises sont livrées (la dernière, 2009-10, le
05/11/2026). La file continue avec l'**Italie**, puis l'**Espagne**, puis l'**Allemagne**, puis le **Portugal**
et l'**Écosse** (ajoutés le 09/11/2026), chacun de
**1990-91 à 2009-10**, dans l'ordre des années, comme pour l'Angleterre.

## Ta mission de la nuit

**Une seule étape par nuit, jamais deux.** L'étape du jour est la **première ligne non cochée** de
`championnat/chantier-saisons.md`, en lisant les sections dans cet ordre et en ignorant tout le reste :

1. « Avant l'Italie : le lot structure », puis « Italie, 20 saisons » ;
2. « Avant l'Espagne : le lot structure », puis « Espagne, 20 saisons » ;
3. « Avant l'Allemagne : le lot structure », puis « Allemagne, 20 saisons » ;
4. « Avant le Portugal : le lot structure », puis « Portugal, 20 saisons » ;
5. « Avant l'Écosse : le lot structure », puis « Écosse, 20 saisons ».

**L'Écosse commence par une décision de l'auteur** (SCO-A, le format à 10 ou 12 clubs). Tant que
la ligne SCO-A n'est pas cochée par lui, n'y touche pas : écris au journal que l'Écosse attend son
choix, et arrête-toi.

Dans les sections de saisons, plusieurs cases tiennent sur une ligne (« [ ] **ITA 1990-91** · [ ] … ») :
l'étape est la **première case** `[ ]` rencontrée. La ligne **ANG-F** de la section anglaise n'est pas à
toi : ne la touche pas.

Si plus aucune case de ces dix sections n'est vide, ne fais rien d'autre et dis simplement que les cinq
pays sont livrés.

### Si l'étape est un lot structure (ITA-A, ITA-B, ITA-C, puis ESP-…, DEU-…, POR-…, SCO-…)

C'est ce que les étapes ANG-A à ANG-E ont fait pour l'Angleterre : relis leurs lignes dans
`chantier-saisons.md` (« Avant l'Angleterre : le lot structure ») et leurs sections dans
`championnat/CLAUDE.md`, puis fais la même chose pour le nouveau pays, en réutilisant le cadre déjà posé
(champ `pays`, clés de sauvegarde, réconciliation européenne, textes). Le harnais de pays
(`harness-italie.cjs`, `harness-espagne.cjs`, `harness-allemagne.cjs`, `harness-portugal.cjs`,
`harness-ecosse.cjs`) se calque sur
`harness-angleterre.cjs`. Les couleurs, stades et derbys se vérifient à la source, rien ne s'invente.
Les sponsors et équipementiers d'un pays sont une liste **arrêtée par l'auteur** : ne les écris pas, note
au journal qu'ils l'attendent.

### Si l'étape est une saison (ITA AAAA-AA, ESP …, DEU …, POR …, SCO …)

Une saison se fait en deux temps, la même nuit si possible :

1. **Le relevé** (phase 1 d'`IMPORT_SAISON.md`), dans `releves/<PAYS>-AAAA-AA/` (`ITA`, `ESP`, `DEU`, `POR` ou `SCO`).
   Les sources changent avec le pays : la page d'effectif Transfermarkt du club pour la saison, et les
   classements finaux de la Wikipédia anglaise (« 1990–91 Serie A » et « 1990–91 Serie B » ;
   « 1990–91 La Liga » et « 1990–91 Segunda División » ; « 1990–91 Bundesliga » et
   « 1990–91 2. Bundesliga » ; « 1990–91 Primeira Divisão » et la deuxième division portugaise de la
   saison ; « 1990–91 Scottish Premier Division » et « 1990–91 Scottish First Division »). Les identifiants Transfermarkt des clubs se notent dans
   `releves/clubs-tm.json`. Pousse le relevé sur ta branche de secours dès qu'il est fini.
2. **L'assemblage** (phase 2), avec la méthode décrite plus bas, mot pour mot comme pour l'Angleterre :
   il suffit de remplacer `ANG` par le code du pays dans les noms de fichiers, de tables et de harnais
   (`harness-itaAAAA.cjs`, `D1_ITA9091`…). Les outils de `releves/outils/` ont été écrits pour
   l'Angleterre : à la **première saison d'un pays**, adapte-les pour qu'ils prennent le pays en
   paramètre, sans rien casser pour l'Angleterre (tous les harnais anglais doivent rester verts).

Si la nuit ne suffit pas pour les deux temps, livre seulement le relevé (sur `main`, dans son seul dossier
`releves/`), laisse la case non cochée, écris-le au journal : la nuit suivante repart du relevé déjà fait
et assemble.

**Les divisions à 18, 22 ou 24 clubs** (Serie A jusqu'en 2003-04, Primera de 1995 à 1997, Bundesliga,
2. Bundesliga du début des années 90, première division portugaise) : le jeu joue toujours à 20. Applique la règle déjà écrite pour la
D1 française 1997-98 dans `CLAUDE.md` (repêchés ou écartés selon le classement réel), et écris au journal
quels clubs entrent ou sortent.

**Sans accès au réseau, aucun relevé n'est possible.** Si Transfermarkt et Wikipédia sont injoignables
(essaie `.com`, `.de`, `.co.uk`), ne relève rien, n'invente rien : pousse seulement une ligne de journal
qui le dit, et la case reste vide.

---

# La méthode d'assemblage (écrite pour l'Angleterre, valable pour tous les pays)

## Ce que tu lis avant de toucher à quoi que ce soit

1. `IMPORT_SAISON.md` (racine), surtout la phase 2.
2. Dans `championnat/CLAUDE.md`, les sections **« ANG 1994-95 » à « ANG 1999-00 »** : ce sont les six
   premiers assemblages, et chacune contient un piège qui a déjà coûté une correction.
3. Les outils de `releves/outils/` : `assemble.cjs`, `inserer.cjs`, `controle-graphies.cjs`, et les
   fichiers `ajust-AAAA.json` / `reglages-AAAA.json` de la saison précédente, qui servent de modèle.
4. Le harnais de la saison précédente (`championnat/harness-angAAAA.cjs`), gabarit du tien.

## Sauvegarde en cours de route (règle du 12/10/2026, inchangée)

- Au début, liste `origin/secours/*`. Si la plus récente porte un travail commencé sur la saison du jour,
  repars de lui au lieu de tout refaire.
- Travaille sur `secours/AAAA-MM-JJ` (la date du jour), partie de `main` à jour, et pousse un commit
  « EN COURS : … » après chaque étape qui compte, au moins toutes les vingt minutes.
- La livraison sur `main` se fait seulement après « tous les harnais verts », par `git merge --squash`
  puis un seul commit propre. Tu n'effaces jamais une branche de secours.

## Les étapes, dans l'ordre

1. **Le relevé** : `node releves/verifie-releve.cjs releves/ANG-AAAA-AA`. Lis son `rapport.md`, surtout
   « Doutes ». Les petits manques de poste (un seul gardien) sont tolérés par le jeu ; un faux club non.
2. **Les réglages de la saison**, dans `releves/outils/` :
   - `ajust-AAAA.json` (AAAA = les deux années sur deux chiffres, par exemple `0001`) : les distinctions
     de l'année (joueur de l'année PFA et FWA, meilleur espoir, meilleurs buteurs), vérifiées une par une,
     en notes `[note, potentiel, raison]` ; les pépites à forcer dans `_forcer` ; les corrections du relevé
     dans `_retirer` et `_ajouter`. **Chaque pépite et chaque homme ajouté se vérifie à l'historique de
     transferts** (`https://www.transfermarkt.com/ceapi/transferHistory/list/<id>`) : il doit être au club
     au coup d'envoi. Sur sept candidats en 1997-98, trois étaient arrivés en cours de saison.
   - `reglages-AAAA.json` : `an`, `version_avant` et `version_apres` (la constante `VERSION` d'`index.html`,
     plus un centième), le **nom** de la saison (deux à cinq mots, aucun mot déjà pris : `harness-noms.cjs`
     le vérifie), le **sous-titre** (`sous`, faits vérifiés, aucun tiret long « — »), les sièges européens
     copiés de `SIEGES_ANG[AAAA]` dans `index.html`, et l'`entete` (le commentaire posé au-dessus des tables).
3. **L'assemblage** : `node releves/outils/assemble.cjs <racine> <AAAA> /tmp/AAAA.json`. Il doit donner
   **400 joueurs en haut et 360 en bas, pile** (le harnais de pays l'exige). Chaque « innommable » (aucun nom
   libre, ou plus de 40 ans) se remplace par un homme présent au coup d'envoi, ajouté dans `_ajouter`.
   Regarde le haut du classement des notes : un joueur important trop bas se corrige par un ajustement.
4. **L'insertion** : `index.html` doit être **exactement à HEAD** avant (sinon les prénoms déjà insérés
   faussent tout), puis `node releves/outils/inserer.cjs /tmp/AAAA.json releves/outils/reglages-AAAA.json`.
   Vérifie la syntaxe : extrais le script d'`index.html` et `node --check`.
5. **Les noms** : `node releves/outils/controle-graphies.cjs`. Toute paire qui touche ta saison est soit deux
   hommes distincts (des jumeaux, deux homonymes), soit **un même homme sous deux noms : à corriger**.
6. **Ton harnais** : `championnat/harness-angAAAA.cjs`, calqué sur le précédent, avec les FAITS de la saison
   (plateau réel, sièges, hommes et distinctions, corrections, une carrière de trois saisons).
7. **Tous les harnais** du dossier `championnat/`, jusqu'au dernier : tout doit finir vert.
8. **La documentation** : coche la ligne dans `chantier-saisons.md`, ajoute une ligne au journal, écris la
   section « ANG AAAA-AA » dans `CLAUDE.md` (juste avant « DIVERSIFIER LES SOURCES »), avec le même style que
   les précédentes : le plateau, les notes, les corrections, les pièges.
9. **La livraison** : commit des fichiers de la saison seulement (`index.html`, le harnais, la doc,
   `releves/outils/`), message en français dans le style des précédents (`git log`), push sur `main`.

## Les pièges déjà rencontrés (lis les sections de CLAUDE.md pour le détail)

- **La graphie du jeu gagne** : un joueur déjà dans le jeu garde son nom exact (« E. Cantona », « A. Cole »).
- **Même homme = même naissance à un an près ET poste compatible** (Kevin Scott n'est pas Keith Scott).
- **Prénoms composés** : une initiale par prénom (« L. E. Andersen »), ou initiale du premier prénom plus nom
  de famille si c'est la graphie du jeu (« O. Solskjær ») ; **les particules se gardent entières**
  (« S. Dalla Bona », « R. van der Gouw »).
- **L'âge suit le jeu** : un homme connu la saison d'avant prend son âge de l'an passé plus un.
- **Le coup d'envoi n'est pas le même pour les deux divisions** (la Premier League commence souvent une
  semaine après la Division One) : un homme arrivé entre les deux était là.
- **Transfermarkt date la montée d'un jeune chez les pros, pas son arrivée** : un jeune « arrivé en cours de
  saison » peut être au club depuis l'enfance. L'historique de transferts tranche.
- **`NOMS_ANG`** (les noms des joueurs fictifs) ne doit porter aucun patronyme de vrai joueur. Si
  `harness-textes-ang.cjs` rougit pour cette raison, remplace ce nom par un patronyme anglais qu'aucun joueur
  du fichier ne porte (vérifie-le), et écris-le au journal. C'est la seule correction de ce genre permise.
- Les fichiers du dépôt peuvent être en fins de ligne CRLF : les outils s'en accommodent.

## Les règles qui ne se négocient pas

- **Aucune donnée inventée** : ni joueur, ni date, ni minutes, ni prénom. Un prénom douteux s'écrit `""`.
- **Un harnais rouge arrête la livraison.** Il ne se contourne pas, ne s'assouplit pas, et on ne modifie pas
  une assertion pour la faire passer. Seule exception, déjà jugée par l'auteur : compléter une liste de
  référence d'un cas réel (une particule comme « Dalla », un patronyme de `NOMS_ANG`), avec une note.
- **Si tu bloques** (relevé faux, effectif impossible à compléter en vrais joueurs, harnais rouge) : ne livre
  rien de la saison, laisse la ligne non cochée, et pousse **uniquement une ligne de journal** qui explique
  franchement le blocage. Sans accès à Transfermarkt, n'ajoute aucune pépite non vérifiée : livre sans elles
  et dis-le au journal.

## Le compte rendu final

En prose simple, en français : quelle saison, son nom, combien de vrais joueurs, ce qui a résisté et comment
tu l'as réglé, et le numéro de version livré (ou la raison du blocage).
