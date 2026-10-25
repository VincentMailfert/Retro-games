# Consigne de la tâche planifiée — une saison par nuit (assemblage)

Ce fichier est la consigne complète de la tâche « MULTIPLEX 95 — une saison par jour ». La tâche elle-même
ne contient qu'une ligne : « Lis championnat/routine-consigne.md et suis-le à la lettre. » Le projet est en
français : code, commentaires, messages de commit et compte rendu compris. L'auteur n'est pas développeur :
écris-lui en prose simple.

## Ta mission de la nuit

**Assembler UNE saison anglaise dans le jeu, à partir de son relevé, et la livrer.** Les quinze relevés
anglais sont déjà faits et sur `main` (`releves/ANG-AAAA-AA/`). Tu ne relèves rien de neuf : tu assembles.
La saison du jour est la **première ligne non cochée** de la section « Angleterre » de
`championnat/chantier-saisons.md`. Une seule saison, jamais deux.

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
- **Si tu bloques** (relevé faux, Transfermarkt injoignable pour vérifier une pépite, harnais rouge) : ne livre
  rien de la saison, laisse la ligne non cochée, et pousse **uniquement une ligne de journal** qui explique
  franchement le blocage. Sans accès à Transfermarkt, n'ajoute aucune pépite non vérifiée : livre sans elles
  et dis-le au journal.

## Le compte rendu final

En prose simple, en français : quelle saison, son nom, combien de vrais joueurs, ce qui a résisté et comment
tu l'as réglé, et le numéro de version livré (ou la raison du blocage).
