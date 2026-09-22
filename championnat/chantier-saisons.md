# Chantier — une saison par jour

Une routine cloud (« MULTIPLEX 95 — une saison par jour », tous les jours à 4h du matin) ajoute **une
seule** saison de départ au jeu et la **livre sur le champ**. Ce fichier est sa mémoire : la file
d'attente, les règles du métier, et le journal de ce qui s'est passé. L'agent le lit avant tout le reste,
il le coche à la fin, et il ne travaille jamais deux saisons dans la même journée.

**Livraison directe, décidée par l'auteur le 22/09/2026** : la saison part sur `main`, donc en ligne chez
les testeurs, sans relecture préalable. Le chantier avance tout seul, une saison par jour, sans rien
attendre de personne. **Conséquence à prendre au sérieux : les harnais sont désormais la seule chose qui
sépare une erreur des joueurs.** Un harnais rouge n'est plus un contretemps, c'est un incident — on ne
livre pas, on écrit le blocage au journal, et on laisse la saison à demain.

---

## La journée type

1. **Partir du dépôt à jour** (`git pull --rebase` sur `main`) et **prendre la première ligne non cochée**
   de la file d'attente ci-dessous. C'est le travail du jour, et le seul.
2. **Faire le travail** en suivant la méthode (ci-dessous, et surtout la section « Saison de départ au
   choix » de `CLAUDE.md`, qui est la vraie documentation).
3. **Valider**, sans exception : extraction du JS + `node --check`, le nouveau harnais de la saison, puis
   **tous les autres harnais du dossier** en non-régression. Tout doit finir « TOUT EST VERT ».
4. **Cocher la ligne** dans ce fichier, ajouter une ligne au journal en bas, écrire le paragraphe de la
   saison dans `CLAUDE.md`, **incrémenter `VERSION`** dans `index.html`.
5. **Livrer** : commit sur `main`, message en français dans le style des livraisons précédentes
   (`git log` pour le ton), puis `git push`. Si le push est refusé parce que quelqu'un a poussé entre
   temps, `git pull --rebase`, relancer les harnais, et repousser.
6. **Si ça bloque** (source injoignable, effectifs trop pauvres, harnais rouge, structure à inventer) :
   ne rien inventer, ne pas livrer une saison à moitié fausse. **Committer et pousser la seule mise à jour
   du journal** ci-dessous, en expliquant le blocage, et laisser la ligne non cochée. C'est la trace que
   l'auteur lira au réveil.

---

## Les règles qui ne se négocient pas

- **Aucun joueur inventé sur une saison réelle.** Le jeu vit de ses vrais noms. `genJoueur` ne complète
  qu'à la marge, quand la source est réellement muette (cf. Lorient 99/00, quatre défenseurs répertoriés).
  **Si plus de trois clubs d'une division ont moins de dix joueurs documentés, la saison n'est pas mûre** :
  bloquer et le dire, plutôt que de livrer un championnat de fantômes.
- **20 clubs en D1, 20 en D2, 38 journées.** Le moteur ne se plie pas. Quand le championnat réel en
  comptait 18 ou 24, on applique la règle de repêchage déjà documentée : les **meilleurs relégués de la
  saison précédente** montent pour compléter, les derniers de l'échelon du dessous s'effacent, et on écarte
  en priorité les clubs que la source documente le plus mal (le cas Toulon 98/99 fait jurisprudence).
- **Vérifier, ne jamais supposer** — les couleurs d'un club, le format d'un championnat, le vainqueur d'une
  coupe. Créteil a d'abord été fait en bleu et blanc, à tort.
- **La validation d'abord, la livraison ensuite.** Rien ne part avec un harnais rouge — et en livraison
  directe, « rien ne part » veut dire qu'on s'arrête pour de bon ce jour-là, pas qu'on contourne.
- **Un seul endroit pour la version**, la constante `VERSION` en tête de script.
- **Tout en français**, code et commentaires compris.

## La méthode, en deux lignes

Elle est écrite en entier dans `CLAUDE.md`, section « Saison de départ au choix (v0.62) », et elle a servi
cinq fois. Le résumé : deux pages Transfermarkt par club (`…/kader/verein/<id>/saison_id/<AAAA>/plus/1`
pour naissance et poste, `…/leistungsdaten/verein/<id>/reldata/%26<AAAA>/plus/1` pour les minutes et le
nom court), `curl` avec un User-Agent de navigateur, décodage UTF-8 avec repli cp1252, effectifs triés par
minutes (20 en D1, 18 en D2, minimums 2-5-5-4), **forçage à la main des pépites** que le tri écarte,
dédoublonnage **par identifiant Transfermarkt** et non par nom, notes des joueurs déjà curés reprises et
vieillies (+2 jusqu'à 21 ans, +1 jusqu'à 24, −1 de 30 à 32, −2 au-delà), appariement refusé si l'âge ne
concorde pas, et une table d'ajustements à la main pour tout ce qui se reconnaît. `harness9900.cjs` est le
gabarit du harnais à recopier. Relire la section avant chaque saison : elle contient les pièges qui ont
déjà coûté une livraison.

**L'été international.** `HONNEURS` (dans `finDeSaison`) connaît 1992 → 2006 depuis l'ajout de 1990-91,
qui a écrit **1992** (Euro en Suède, le Danemark repêché et sacré) et **1994** (Mondial aux États-Unis, le
Brésil aux tirs au but). Attention : le texte d'un été ne doit contenir « LA FRANCE » en capitales que si
la France a gagné — `finDeSaison` lit cette chaîne comme un triomphe. Restent à écrire, le jour où la
première saison concernée arrive : **2008** (Euro, l'Espagne commence son règne), **2010** (Mondial en Afrique du Sud, l'Espagne — et pour la
France, Knysna), puis **2012**, **2014**, **2016**, **2018** tant qu'on y est, puisque les carrières durent.

---

## File d'attente

### France, avant la base — 5 saisons

Le plateau d'époque : la D1 tient bien ses 20 clubs, mais **la D2 était en deux groupes** une partie de ces
années-là — il faudra trancher quels 20 clubs entrent, par le classement réel, et l'écrire dans `CLAUDE.md`.
Transfermarkt documente moins bien le début des années 90 que la fin : c'est là que la règle du « plus de
trois clubs muets, on bloque » servira. Belle matière narrative, au passage : le doublé de l'OM, la
Coupe d'Europe 93, puis VA-OM.

- [x] **1990-91** — `STARS_9091`/`STARS_D2_9091`, `D1_9091`/`D2_9091`, `an:1990`, `saison_id/1990`
- [ ] **1991-92** — `STARS_9192`/`STARS_D2_9192`, `D1_9192`/`D2_9192`, `an:1991`, `saison_id/1991`
- [ ] **1992-93** — `STARS_9293`/`STARS_D2_9293`, `D1_9293`/`D2_9293`, `an:1992`, `saison_id/1992`
- [ ] **1993-94** — `STARS_9394`/`STARS_D2_9394`, `D1_9394`/`D2_9394`, `an:1993`, `saison_id/1993`
- [ ] **1994-95** — `STARS_9495`/`STARS_D2_9495`, `D1_9495`/`D2_9495`, `an:1994`, `saison_id/1994`

### France, après 1999-00 — 10 saisons

Terrain connu : c'est exactement la méthode de 99/00, saison après saison. Deux détails d'époque à ne pas
rater — la **Coupe des Coupes n'existe plus** après 1999 (les sièges européens se répartissent entre C1 et
C3, puis la C3 devient la Coupe UEFA moderne), et la D1 devient la **Ligue 1** en 2002, la D2 la Ligue 2 :
l'appeler par son nom d'époque dans le sous-titre de la saison sans toucher aux libellés du moteur.

- [ ] **2000-01** — `STARS_0001`/`STARS_D2_0001`, `D1_0001`/`D2_0001`, `an:2000`, `saison_id/2000`
- [ ] **2001-02** — `STARS_0102`/`STARS_D2_0102`, `D1_0102`/`D2_0102`, `an:2001`, `saison_id/2001`
- [ ] **2002-03** — `STARS_0203`/`STARS_D2_0203`, `D1_0203`/`D2_0203`, `an:2002`, `saison_id/2002`
- [ ] **2003-04** — `STARS_0304`/`STARS_D2_0304`, `D1_0304`/`D2_0304`, `an:2003`, `saison_id/2003`
- [ ] **2004-05** — `STARS_0405`/`STARS_D2_0405`, `D1_0405`/`D2_0405`, `an:2004`, `saison_id/2004`
- [ ] **2005-06** — `STARS_0506`/`STARS_D2_0506`, `D1_0506`/`D2_0506`, `an:2005`, `saison_id/2005`
- [ ] **2006-07** — `STARS_0607`/`STARS_D2_0607`, `D1_0607`/`D2_0607`, `an:2006`, `saison_id/2006`
- [ ] **2007-08** — `STARS_0708`/`STARS_D2_0708`, `D1_0708`/`D2_0708`, `an:2007`, `saison_id/2007`
- [ ] **2008-09** — `STARS_0809`/`STARS_D2_0809`, `D1_0809`/`D2_0809`, `an:2008`, `saison_id/2008`
- [ ] **2009-10** — `STARS_0910`/`STARS_D2_0910`, `D1_0910`/`D2_0910`, `an:2009`, `saison_id/2009`

---

### ⚠ Avant l'Angleterre : le lot structure

**Ce qui suit n'est pas de la donnée, c'est du moteur.** Aujourd'hui le jeu ne connaît qu'un pays : les
montants sont en francs, les divisions s'appellent D1 et D2, la coupe nationale est la Coupe de France, les
étés internationaux sont racontés du point de vue français, les sièges européens sont des sièges français,
et les clubs de `CLUBS_EUROPE` (Liverpool, Manchester, Milan, le Barça…) sont les **adversaires** de
Coupe d'Europe — on ne peut pas les affronter le mardi soir et le samedi après-midi. Ouvrir un pays
étranger demande donc un vrai chantier avant la première saison. Il est découpé en étapes d'une journée :
la routine en fait une par jour, comme une saison.

- [ ] **ANG-A — Le cadre** : décider comment un pays entre dans le jeu. Champ `pays` dans `SAISONS`, clés
      préfixées (`"ANG-1990-91"`), libellés de divisions par pays (Premier League / Division One, et
      First Division avant 1992), monnaie d'affichage (livres), coupe nationale (FA Cup), sélecteur
      d'accueil groupé par pays. Écrire la décision dans `CLAUDE.md` **avant** d'écrire une ligne de code.
- [ ] **ANG-B — Les clubs** : métadonnées des ~45 clubs anglais traversant 1990-2010 (nom, stade,
      capacité, standing, budget), couleurs **vérifiées** club par club, blasons SVG au style maison,
      rivalités (`RIVAL`, `NOMS_RIVALITES` : les deux Manchester, Liverpool-Everton, le nord de Londres…).
- [ ] **ANG-C — La réconciliation européenne** : un club anglais ne peut pas être à la fois dans le
      championnat et dans le vivier de Coupe d'Europe. Généraliser `retireDEurope` et la réconciliation
      d'effectifs au pays de la saison, et définir les sièges européens **anglais** par saison.
- [ ] **ANG-D — Les textes** : tout ce qui dit « France » sans le savoir — `HONNEURS` vus d'Angleterre, la
      sélection nationale (`selA`), les dépêches, la presse, les noms procéduraux des jeunes (aujourd'hui
      français), les incidents datés d'époque.
- [ ] **ANG-E — Le harnais de pays** : `harness-angleterre.cjs`, calqué sur `harness9900.cjs` —
      20+20, aucun doublon, aucun club des deux côtés du mur européen, calibrage, six saisons de carrière.

### Angleterre — 20 saisons

Le plateau bouge beaucoup : First Division à 20 en 1990-91, à 22 en 1991-92, Premier League à 22 de 1992
à 1995, 20 ensuite ; et l'échelon du dessous a 24 clubs, donc il faudra écarter les quatre derniers par le
classement réel. Le sous-titre de chaque saison est une mine (Cantona, le triplé 99, les Invincibles 2004).

- [ ] **ANG 1990-91** · [ ] **ANG 1991-92** · [ ] **ANG 1992-93** · [ ] **ANG 1993-94** · [ ] **ANG 1994-95**
- [ ] **ANG 1995-96** · [ ] **ANG 1996-97** · [ ] **ANG 1997-98** · [ ] **ANG 1998-99** · [ ] **ANG 1999-00**
- [ ] **ANG 2000-01** · [ ] **ANG 2001-02** · [ ] **ANG 2002-03** · [ ] **ANG 2003-04** · [ ] **ANG 2004-05**
- [ ] **ANG 2005-06** · [ ] **ANG 2006-07** · [ ] **ANG 2007-08** · [ ] **ANG 2008-09** · [ ] **ANG 2009-10**

---

### ⚠ Avant l'Italie : le lot structure (raccourci)

Le cadre posé pour l'Angleterre sert à tout le monde ; il ne reste que ce qui est propre au pays.

- [ ] **ITA-A — Les clubs** : métadonnées, couleurs vérifiées, blasons, derbys (Milan, Rome, Turin, le
      derby de la Lanterne), lires puis euros à l'affichage.
- [ ] **ITA-B — Le cadre local** : Serie A / Serie B, Coppa Italia, sièges européens italiens par saison,
      textes et sélection italienne.
- [ ] **ITA-C — Le harnais** : `harness-italie.cjs`.

### Italie — 20 saisons

La Serie A n'a que **18 clubs** jusqu'en 2003-04 (20 ensuite) : deux repêchés de Serie B chaque fois,
exactement comme la D1 97/98. Et la saison 2005-06 se lit à deux niveaux à cause du Calciopoli.

- [ ] **ITA 1990-91** · [ ] **ITA 1991-92** · [ ] **ITA 1992-93** · [ ] **ITA 1993-94** · [ ] **ITA 1994-95**
- [ ] **ITA 1995-96** · [ ] **ITA 1996-97** · [ ] **ITA 1997-98** · [ ] **ITA 1998-99** · [ ] **ITA 1999-00**
- [ ] **ITA 2000-01** · [ ] **ITA 2001-02** · [ ] **ITA 2002-03** · [ ] **ITA 2003-04** · [ ] **ITA 2004-05**
- [ ] **ITA 2005-06** · [ ] **ITA 2006-07** · [ ] **ITA 2007-08** · [ ] **ITA 2008-09** · [ ] **ITA 2009-10**

---

### ⚠ Avant l'Espagne : le lot structure (raccourci)

- [ ] **ESP-A — Les clubs** : métadonnées, couleurs vérifiées, blasons, derbys (le Clásico, Madrid,
      Séville, Barcelone), pesetas puis euros à l'affichage.
- [ ] **ESP-B — Le cadre local** : Primera / Segunda, Copa del Rey, sièges européens espagnols par saison,
      textes et sélection espagnole.
- [ ] **ESP-C — Le harnais** : `harness-espagne.cjs`.

### Espagne — 20 saisons

La Primera passe à **22 clubs** de 1995 à 1997 avant de revenir à 20 : deux à écarter ces années-là.

- [ ] **ESP 1990-91** · [ ] **ESP 1991-92** · [ ] **ESP 1992-93** · [ ] **ESP 1993-94** · [ ] **ESP 1994-95**
- [ ] **ESP 1995-96** · [ ] **ESP 1996-97** · [ ] **ESP 1997-98** · [ ] **ESP 1998-99** · [ ] **ESP 1999-00**
- [ ] **ESP 2000-01** · [ ] **ESP 2001-02** · [ ] **ESP 2002-03** · [ ] **ESP 2003-04** · [ ] **ESP 2004-05**
- [ ] **ESP 2005-06** · [ ] **ESP 2006-07** · [ ] **ESP 2007-08** · [ ] **ESP 2008-09** · [ ] **ESP 2009-10**

---

## Où on en est

74 saisons en file, plus onze étapes de structure. À une par jour et si les PR sont relues au fil de l'eau,
le chantier court sur environ trois mois. Les quatorze saisons françaises restantes sont du terrain connu ;
tout ce qui suit ouvre le jeu à un deuxième pays, ce qui est un autre métier.

Une leçon de la première journée, à garder pour les quatre saisons du début des années 90 : **en remontant le
temps, les notes se rajeunissent, et l'inversion de la règle d'âge ment dans les deux sens** (elle gonfle les
trentenaires et écrase les espoirs). La parade — moyenne avec une note calculée sur la saison elle-même, plus
une vraie table d'ajustements à la main — est décrite dans `CLAUDE.md`. Et Transfermarkt sert le début des
années 90 **en trois langues au hasard**, avec un anti-robot qu'un autre domaine (`.com`, `.de`) contourne.

## Journal

| Date | Saison | Ce qui s'est passé |
|---|---|---|
| 2026-09-22 | — | Chantier ouvert. Base du jeu : 1995-96 → 1999-00 (v1.15). |
| 2026-09-22 | 1990-91 | Livrée (v1.16). 760 vrais joueurs, 40 clubs, dont **onze clubs neufs** (Brest, Valenciennes, Alès, Istres, Avignon, Rodez, Annecy, Angers, Rouen, Reims, Tours). La D2 réelle étant en deux groupes de dix-huit, le jeu retient **les dix premiers de chaque groupe** ; **Saint-Seurin écarté** (17 joueurs documentés pour 18 places, jurisprudence Toulon). Étés **1992** et **1994** écrits dans `HONNEURS`. Deux pièges neufs : le **sens du temps inversé** pour les notes, et l'**anti-robot** de Transfermarkt. Un correctif de moteur au passage : `regarnitVivier` pouvait inventer le nom d'un joueur déjà employé. `harness9091.cjs` vert, plus les seize autres harnais en non-régression. |
