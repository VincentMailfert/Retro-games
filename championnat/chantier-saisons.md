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
3. **Lui donner un nom** (depuis la v1.22) : chaque saison porte un champ `nom` à côté de son `titre`, et
   c'est ce nom que l'écran d'accueil met en avant — « Sur tapis vert — 1991-92 ». Deux à cinq mots,
   trente-quatre caractères au plus, français d'époque, ton léger, tiré de ce que la saison a de
   singulier. **Aucun mot marquant déjà utilisé par une autre saison ni par un feuilleton** (`ARCS` : le
   diamant, le sac, le sortilège, la buvette sont pris). `harness-noms.cjs` refuse tout le reste, et il
   refuse aussi qu'on touche à `titre`, qui reste le créneau daté. Voir « LES SAISONS NOMMÉES » dans
   `CLAUDE.md`.
   **Enregistrer aussi le prénom de chaque vrai joueur** (depuis la v1.46, consigne auteur) : le jeu garde
   le nom court « B. Lama » dans les effectifs, et affiche « Bernard Lama » sur la fiche, la signature et la
   feuille de match grâce à la table `PRENOMS_VRAIS` (juste au-dessus de `PRENOMS_GEN`). Pour **chaque nom à
   initiale nouveau** de la saison, ajouter une entrée `"B. Lama":"Bernard"`, prise sur la page d'effectif
   Transfermarkt déjà relevée (elle donne le nom complet). Prénom d'usage, avec ses accents ; prénom composé
   pour « J.-P. ». **Si le prénom est douteux ou introuvable, écrire `""`** : le jeu garde alors l'initiale,
   jamais de prénom deviné. Même nom court, deux hommes différents d'une saison à l'autre : `""` aussi, sauf
   s'ils ont le même prénom. `harness-prenoms.cjs` refuse la livraison si un vrai joueur n'a pas d'entrée,
   ou si un prénom ne commence pas par l'initiale affichée.
   **Écrire aussi la liste du recruteur de l'été** (depuis la v1.69) : une entrée `VIVIER_SAISON[an]`
   d'environ quarante vrais joueurs qui jouent HORS de France cet été-là, au club où ils sont après le
   mercato d'été, avec une note à leur niveau du moment (même échelle que les listes voisines). Pas plus de
   la moitié des noms en commun avec l'été précédent. Vérifier clubs et années de naissance contre Wikidata
   (voir la section « LE RECRUTEUR, SAISON PAR SAISON » de `CLAUDE.md`) ; `harness-recruteur.cjs` doit rester vert.
4. **Valider**, sans exception : extraction du JS + `node --check`, le nouveau harnais de la saison, puis
   **tous les autres harnais du dossier** en non-régression. Tout doit finir « TOUT EST VERT ».
5. **Cocher la ligne** dans ce fichier, ajouter une ligne au journal en bas, écrire le paragraphe de la
   saison dans `CLAUDE.md`, **incrémenter `VERSION`** dans `index.html`.
6. **Livrer** : commit sur `main`, message en français dans le style des livraisons précédentes
   (`git log` pour le ton), puis `git push`. Si le push est refusé parce que quelqu'un a poussé entre
   temps, `git pull --rebase`, relancer les harnais, et repousser.
7. **Si ça bloque** (source injoignable, effectifs trop pauvres, harnais rouge, structure à inventer) :
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
- [x] **1991-92** — `STARS_9192`/`STARS_D2_9192`, `D1_9192`/`D2_9192`, `an:1991`, `saison_id/1991`
- [x] **1992-93** — `STARS_9293`/`STARS_D2_9293`, `D1_9293`/`D2_9293`, `an:1992`, `saison_id/1992`
- [x] **1993-94** — `STARS_9394`/`STARS_D2_9394`, `D1_9394`/`D2_9394`, `an:1993`, `saison_id/1993`
- [x] **1994-95** — `STARS_9495`/`STARS_D2_9495`, `D1_9495`/`D2_9495`, `an:1994`, `saison_id/1994`

### France, après 1999-00 — 10 saisons

Terrain connu : c'est exactement la méthode de 99/00, saison après saison. Deux détails d'époque à ne pas
rater — la **Coupe des Coupes n'existe plus** après 1999 (les sièges européens se répartissent entre C1 et
C3, puis la C3 devient la Coupe UEFA moderne), et la D1 devient la **Ligue 1** en 2002, la D2 la Ligue 2 :
l'appeler par son nom d'époque dans le sous-titre de la saison sans toucher aux libellés du moteur.

- [x] **2000-01** — `STARS_0001`/`STARS_D2_0001`, `D1_0001`/`D2_0001`, `an:2000`, `saison_id/2000`
- [x] **2001-02** — `STARS_0102`/`STARS_D2_0102`, `D1_0102`/`D2_0102`, `an:2001`, `saison_id/2001`
- [x] **2002-03** — `STARS_0203`/`STARS_D2_0203`, `D1_0203`/`D2_0203`, `an:2002`, `saison_id/2002`
- [x] **2003-04** — `STARS_0304`/`STARS_D2_0304`, `D1_0304`/`D2_0304`, `an:2003`, `saison_id/2003`
- [x] **2004-05** — `STARS_0405`/`STARS_D2_0405`, `D1_0405`/`D2_0405`, `an:2004`, `saison_id/2004`
- [x] **2005-06** — `STARS_0506`/`STARS_D2_0506`, `D1_0506`/`D2_0506`, `an:2005`, `saison_id/2005`
- [x] **2006-07** — `STARS_0607`/`STARS_D2_0607`, `D1_0607`/`D2_0607`, `an:2006`, `saison_id/2006`
- [x] **2007-08** — `STARS_0708`/`STARS_D2_0708`, `D1_0708`/`D2_0708`, `an:2007`, `saison_id/2007`
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

73 saisons en file, plus onze étapes de structure. À une par jour et si les PR sont relues au fil de l'eau,
le chantier court sur environ trois mois. Les treize saisons françaises restantes sont du terrain connu ;
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
| 2026-09-23 | 1991-92 | Livrée (v1.21). **758 vrais joueurs**, 40 clubs, dont **deux clubs neufs** seulement (Bourges et le Gazélec Ajaccio) : le plateau de 91/92 est presque entièrement déjà connu du jeu. La D1 réelle avait ses vingt clubs **sans aucun repêchage** — Bordeaux, Brest et Nice rétrogradés administrativement, Le Havre, Lens et Nîmes promus — ce qui est le premier cas depuis 96/97 où le compte tombe juste tout seul. La D2 étant encore en deux groupes de dix-huit, on reprend la règle de 90/91 (les dix premiers de chaque groupe) ; **Tours écarté** (seize joueurs pour dix-huit places), **Ancenis sauté** (dix-sept), **Beauvais entre**. Sens du temps de nouveau normal : 495 des 758 noms héritent de leur note 90/91 **vieillie** d'un an, ce qui évite complètement le piège de l'inversion. Aucun forçage nécessaire cette année : Zidane, Thuram, Barthez, Vairelles et Lamouchi passent tous au temps de jeu. `harness9192.cjs` vert cinq fois de suite, plus les vingt autres harnais en non-régression. |
| 2026-09-24 | 1992-93 | Livrée (v1.27). **757 vrais joueurs**, 40 clubs, et **aucun club neuf — une première** : les quarante clubs du plateau étaient déjà au registre du jeu, Charleville et Niort compris. La D1 réelle avait ses vingt clubs **sans aucun repêchage** (Bordeaux, Strasbourg et Valenciennes montent ; Cannes, Nancy et Rennes descendent), et la D2 étant toujours en deux groupes de dix-huit, on reprend la règle de 90/91 — les dix premiers de chacun — **sans avoir à écarter personne** cette fois. Piège d'époque : **la Coupe de France 1992 n'a pas eu de vainqueur** (compétition arrêtée après le drame de Furiani), c'est donc le finaliste, Monaco, qui prend le siège de C2. L'été 93 est muet : comme en 90/91, la première intersaison ne porte aucun tournoi. Le sens du temps reste normal, **504 des 757 noms héritent de leur note 91/92 vieillie d'un an** et la table d'ajustements tombe à douze entrées. Trois découvertes de relevé : Transfermarkt **n'abrège pas les prénoms courts** (« Abedi Pelé », « Luc Sonor », onze joueurs pris pour des mononymes), l'appariement des ancres doit être **insensible aux accents et à la forme des initiales**, et **les jumeaux Vujović jouaient tous les deux à Nice** — d'où le refus de tout appariement approché ambigu. `harness9293.cjs` vert cinq fois de suite, plus les vingt-trois autres harnais en non-régression. |
| 2026-09-25 | 1993-94 | Livrée (v1.33). **759 vrais joueurs**, 40 clubs, et **aucun club neuf pour la deuxième fois** : les quarante étaient déjà au registre. La D1 réelle avait ses vingt clubs **sans aucun repêchage** (Cannes, Martigues et Angers montent ; Valenciennes et Nîmes descendent) et **Toulon, dix-neuvième, n'est nulle part** — la DNCG l'a rétrogradé directement en National pour dettes, ce qui a sauvé **Mulhouse**, repêché en D2 à sa place. Nouveauté de structure : la D2 quitte ses deux groupes de dix-huit et devient un **groupe unique de vingt-deux clubs**, la « Super D2 » — on prend les vingt premiers du classement réel et on écarte **Bourges (21e) et Istres (22e)**. Sièges européens qui racontent l'année : l'OM, tenant du titre, **exclu par l'UEFA**, le PSG deuxième qui **refuse la place** comme il avait refusé le titre, et **Monaco** qui la prend ; le PSG joue la C2 qu'il a gagnée sur le terrain. L'héritage n'a jamais autant travaillé : **559 des 759 noms reprennent leur note 92/93 vieillie d'un an**, 50 autres viennent de 91/92 et 90/91, et la distribution finale est collée à celle de 92/93. Table d'ajustements réduite à **sept entrées** (Ginola 84, Djorkaeff 83, Desailly 82, Sonny Anderson 81, Boli 79, Ouédec 78, Thuram 73). **Huit pépites forcées**, dont **Vieira à dix-sept ans** — trouvées par une méthode neuve : comparer les écartés aux ancres des saisons POSTÉRIEURES du jeu. Trois découvertes : **Bokšić garde ses douze matchs marseillais** avant la Lazio (la note est la valeur, pas le temps de jeu), **Bell tient les buts à trente-neuf ans** (borne d'âge du harnais montée à 39), et TM sert **Futre et Oliveira en mononymes**. `harness9394.cjs` vert cinq fois de suite, plus les vingt-quatre autres harnais en non-régression. |
| 2026-09-26 | 1994-95 | Livrée (v1.50), sous le nom **« Une seule défaite »** — le FC Nantes de Suaudeau n'en concède qu'une en trente-huit journées, record jamais égalé. **759 vrais joueurs**, 40 clubs, et **aucun club neuf pour la troisième fois**. Le plateau tombe juste tout seul pour la **quatrième fois de suite** : la D1 réelle avait ses vingt clubs sans repêchage (Nice, Rennes et Bastia montent ; Toulouse et Angers descendent ; l'OM purge sa rétrogradation en D2), et la D2 restant un groupe unique de vingt-deux, on prend les vingt premiers et on écarte **Sedan (21e) et Nîmes (22e)**. Sièges européens qui racontent l'année : le PSG champion en C1, Auxerre en C2 (Coupe de France 94), et **l'OM en Coupe UEFA depuis la DEUXIÈME DIVISION** — vérifié plutôt que supposé, il a sorti l'Olympiakos avant de tomber à Sion. Règle neuve et à garder : **quand un homme est ancré des deux côtés à égale distance, on prend toujours l'ancre du passé** ; sans elle 403 noms passaient par la moyenne rajeunie au lieu de la règle éprouvée. **536 des 759 noms reprennent leur note 93/94 vieillie d'un an**, 68 viennent de plus loin, 96 passent par la moyenne et 49 sont calculés ; distribution collée à celle de 93/94. Table d'ajustements de dix entrées (Weah 86, Ballon d'or ; Guérin 82, meilleur joueur ; Cascarino 82, trente et un buts en D2), **dix pépites forcées** dont **Didier Domi, seize ans et une minute** — le plus jeune vrai joueur du jeu. Trois prénoms faux corrigés sur pièces (Ricardo Gomes, Clément Garcia, Armindo Ferreira). Le piège du jour n'était pas Transfermarkt mais le script d'aspiration : une commande `curl` sans URL rend un échec muet qu'on prend pour un blocage. `harness9495.cjs` vert cinq fois de suite, plus les vingt-cinq autres harnais — avec une réserve honnête : **deux harnais rougissent par hasard, avant comme après**. `harness-formations.cjs` borne son calibrage sur 760 matchs seulement et déborde une fois sur douze ; `harness-hdm.cjs` cherche le **nom court** du meilleur buteur dans un almanach qui écrit son **prénom** depuis la v1.48, et échoue deux fois sur cinq. Les deux ont été **prouvés non régressifs** : à `Math.random` remplacé par une graine fixe, ils rendent le même résultat sur la version d'avant. Aucune assertion n'a été touchée — c'est un travail de moteur, pas de saison. |
| 2026-09-27 | 2000-01 | Livrée (v1.51), sous le nom **« Le jeu à la nantaise »** — le huitième titre du FC Nantes de Denoueix, Éric Carrière élu meilleur joueur **et** meilleur passeur, Mickaël Landreau dans les buts à vingt et un ans. **760 vrais joueurs**, 40 clubs, et **aucun club neuf pour la quatrième fois** : les quarante étaient déjà au registre. **Première saison ajoutée APRÈS la base** — elle est désormais la plus récente du jeu, ce qui change deux choses : toutes les ancres de notes sont derrière (528 des 760 noms reprennent leur note 99/00 vieillie d'un an, 162 seulement sont calculés, et la distribution tombe au dixième près sur celle de 99/00), mais **la méthode de 93/94 pour trouver les pépites ne marche plus** — comparer les écartés aux saisons postérieures n'a plus d'objet. La parade, meilleure que la mémoire : **lister les écartés que le jeu connaît déjà**, ce qui a rattrapé **Didier Drogba** (419 minutes au Mans, noté 59/90 depuis 98/99) que le tri aux minutes jetait. La D1 réelle n'ayant que dix-huit clubs et la D2 vingt, **double repêchage dans les deux sens** comme en 98/99 : Nancy et Le Havre montent, Amiens et Valence reviennent tenir les vingt de la D2. **La Coupe des Coupes n'existe plus** : `euroC2` est vide pour la première fois du jeu, et **Gueugnon joue la Coupe UEFA depuis la D2** au titre de sa Coupe de la Ligue — troisième cas après Nice 97/98 et l'OM 94/95. Dix pépites forcées (Drogba, Riise, Abidal, Evra, Arteta, Domi, Tainio, Niang, Méïté, Benoît Cheyrou), vingt-deux notes ajustées à la main (Anderson 84, Carrière 82, Chilavert 82). **Deux corrections de méthode** : les minimums de poste se réparent APRÈS le tri aux minutes et non avant, et sur un homonyme **celui qui portait déjà le nom court dans le jeu le garde** — sans quoi « F. Lemasson » changeait d'homme d'une saison à l'autre. Un prénom faux corrigé sur pièces : « M. dos Santos » est Manuel, pas Márcio. `harness0001.cjs` vert cinq fois de suite, plus les **vingt-sept autres harnais** en non-régression — y compris `harness-formations.cjs` et `harness-hdm.cjs`, les deux qui rougissent par hasard, verts cette nuit-là. |
| 2026-09-28 | 2001-02 | Livrée (v1.52), sous le nom **« Le premier des sept »** — le dernier championnat qui s'appelle Division 1 se décide le 4 mai 2002 à Gerland, Lyon battant Lens 3-1 pour son premier titre, jamais le titre ne s'étant joué sur un duel direct entre les deux premiers. **760 vrais joueurs**, 40 clubs, et **un club neuf** après quatre saisons sans : **Grenoble** (`GRE`, Lesdiguières, bleu et blanc vérifié), monté du National. Repêchage **asymétrique, configuration neuve** : la D1 réelle n'avait que dix-huit clubs et la D2 vingt tout juste, mais **Toulouse (37 pts) jouait le National** — il monte en D1 sans rien coûter à la D2, qui ne perd que **Saint-Étienne (34)** et se contente donc d'**un seul** repêché, **Cannes** ; Strasbourg, dix-huitième de D1, reste en D2 et **y joue la Coupe UEFA** au titre de sa Coupe de France, quatrième cas du jeu. L'héritage n'a jamais été aussi propre : **500 des 760 noms** reprennent leur note 00/01 vieillie d'un an, 178 seulement sont calculés. **Onze pépites forcées** (Abidal, Plašil, Giuly, Sinama-Pongolle, Toulalan, Moussilou, Béria, Yahia, Ben Saada, Didot, Diakhaté), trente-huit notes ajustées à la main (Pauleta 84, Juninho 82, Ronaldinho 81/96). **Deux pièges neufs, et le premier était grave** : une sentinelle `\Z` en fin d'expression de découpage **perd la dernière ligne de chaque tableau d'effectif**, ce qui coûtait Pauleta et Adebayor — le symptôme est « exactement un joueur par club sans poste ni date » ; et **six identifiants Transfermarkt posés de mémoire avaient rebaptisé six joueurs au hasard**, ce qu'aucun harnais n'aurait vu. Troisième leçon : **compter les hommes ne suffit pas, il faut regarder les minutes** — Cannes a dix-neuf joueurs documentés mais aucun au-delà de 270 minutes, et on ne l'a gardé qu'après avoir constaté qu'Angers, le repêché suivant, était bien pire (treize hommes, un seul match). `harness0102.cjs` vert cinq fois de suite, plus les **vingt-neuf autres harnais** en non-régression — y compris `harness-formations.cjs` et `harness-hdm.cjs`, les deux qui rougissent par hasard, verts cette nuit-là. |
| 2026-09-29 | 2002-03 | Livrée (v1.56), sous le nom **« Bienvenue en Ligue 1 »** — le championnat change de nom et de taille le même été : la Division 1 devient la **Ligue 1** et passe de dix-huit à **vingt clubs**. **760 vrais joueurs**, 40 clubs, et **un club neuf** : **Clermont** (`CLE`, Gabriel-Montpied, rouge et bleu vérifié). **LE PLATEAU TOMBE JUSTE TOUT SEUL — une première du chantier français** : les deux échelons réels ont vingt clubs, donc **aucun repêchage, aucun écarté**, et le harnais vérifie désormais les deux listes par **égalité** et non par inclusion. Quatre promus (Ajaccio, Strasbourg, Nice, Le Havre), deux descendus (Metz, Lorient). Lyon garde son titre d'un point sur Monaco, Nonda plante vingt-six buts, Pauleta est meilleur joueur pour la deuxième année, et **Didier Drogba se révèle à Guingamp** (dix-sept buts, septième place inédite). Sièges européens : Lyon, Lens et Auxerre en C1 ; le PSG, Bordeaux et **LORIENT, vainqueur de la Coupe de France MAIS RELÉGUÉ**, en Coupe UEFA — cinquième club du jeu à jouer l'Europe depuis la D2. Vérifié plutôt que supposé : **aucun club français n'a gagné l'Intertoto 2002**, donc Lille, Troyes et Sochaux n'ont pas de siège. Première intersaison **muette** (cinquième cas), l'Euro 2004 tombe à la deuxième. **584 des 760 noms** héritent de leur note 01/02 vieillie d'un an, 176 sont calculés, distribution collée à 01/02. **Seize pépites forcées**, la plus grosse fournée du chantier (Briand dix-sept ans, Zubar dix-sept ans, N'Daw une minute, Morel, Romao, Yebda, Obraniak, Cana, Makoun, Fortuné, Faty, Plašil, Bougherra, Pelé, Béria, Fanni, Balmont), quarante-cinq notes ajustées à la main. **La leçon du jour : la règle des homonymes vaut aussi d'une saison à l'autre** — un nom court que le jeu attribue déjà à un autre homme ne se reprend pas, même si cet homme ne joue plus en France ; sans elle **« B. Cheyrou » cessait d'être Bruno pour devenir son frère Benoît**. Et un prénom faux réparé : « I. Ba » disait Ibrahim (Le Havre, 95) alors que c'est **Issa** (Laval) depuis 00/01 — deux hommes, un nom court, donc `""`. Quatre pièges de relevé, dont **la sentinelle de fin qui frappe encore** (elle perdait le dernier joueur de chaque bloc d'ancres, coûtant Cissé et Mexès), le `</table>` non gourmand qui se ferme sur la table interne, **trois formats de date selon la langue** (trente-cinq clubs sur quarante non datés), et **« J. Riise » contre « J.-J. Okocha »** — seul un prénom à trait d'union donne une double initiale. Source la plus généreuse du chantier : aucun club sous vingt-deux hommes, un seul joueur non daté (Cédric Stoll, le même qu'en 01/02). `harness0203.cjs` vert cinq fois de suite, plus les **trente et un autres harnais** en non-régression — y compris `harness-formations.cjs` et `harness-hdm.cjs`, les deux qui rougissent par hasard, verts cette nuit-là. |
| 2026-09-30 | 2003-04 | Livrée (v1.57), sous le nom **« Le printemps des finalistes »** — la France place **deux clubs en finale européenne le même printemps et n'en ramène aucune coupe** : Monaco perd la Ligue des champions contre Porto à Gelsenkirchen, Marseille la Coupe UEFA contre Valence à Göteborg trois jours plus tôt. **760 vrais joueurs**, 40 clubs, et **un club neuf** : **Besançon** (`BES`, Léo-Lagrange, rouge et blanc vérifié), monté du National. **Le plateau tombe juste tout seul pour la deuxième fois de suite** : vingt clubs de chaque côté, aucun repêchage, aucun écarté — trois promus (Toulouse, Metz, Le Mans), trois descendus (Troyes, Sedan, Le Havre). Lyon prend son troisième titre d'affilée avec **soixante-dix-neuf points, un record** ; Drogba est élu meilleur joueur avant Chelsea, Cissé meilleur buteur avec vingt-six buts avant Liverpool, Coupet meilleur gardien, Evra meilleur espoir, Deschamps meilleur entraîneur. Sièges européens : Lyon, Monaco et Marseille en C1 ; Bordeaux, Sochaux, Auxerre et **Lens, qualifié au CLASSEMENT DU FAIR-PLAY** — un motif neuf pour le jeu — en Coupe UEFA. Pour la première fois depuis 96/97, **les sept sièges sont en première division**. L'**Euro 2004 de la Grèce tombe dès la première intersaison**. **516 des 760 noms** héritent de leur note 02/03 vieillie d'un an, 157 sont calculés, distribution collée à 02/03. **Dix-sept pépites forcées** (Gourcuff et Gouffran à dix-sept ans, Hoarau pour quinze minutes, Debuchy, Dante, Briand, Obraniak, Perrin, Zubar, Samba, Obbadi, Lacen, Bougherra… et Christanval, prêté du Barça, que la profondeur de l'OM jetait), **soixante-six notes ajustées à la main**. **Le piège du jour est la sentinelle de fin, pour la troisième fois** : le dernier joueur de chaque tableau de temps de jeu ressortait à **zéro minute**, ce qui coûtait **treize vrais joueurs** dont **Pierre-Alain Frau** (cinquième buteur du championnat), **Bernard Diomède** (champion du monde 98) et **Bafétimbi Gomis**. **La découverte du jour corrige une décision de 02/03** : les deux tables 96/97, curées avec « âge TM − 1 », sont **décalées d'un an** pour les hommes nés au second semestre (48 ancres sur 86 en D1, 32 sur 60 en D2, contre zéro ailleurs), si bien que le garde-fou d'âge fabriquait de faux homonymes — **Kor Sarr, vérifié par identifiant Transfermarkt, est bien le Beauvaisien de 96/97** et retrouve son « K. Sarr ». Vérifié plutôt que supposé : aucun club français n'a gagné l'Intertoto 2003, et **Franck Ribéry jouait à Brest, en National** — il n'arrive à Metz qu'à l'été 2004. Six joueurs procéduraux seulement, le meilleur score du chantier. `harness0304.cjs` vert cinq fois de suite, plus les **trente-deux autres harnais** en non-régression. |
| 2026-10-01 | 2004-05 | Livrée (v1.68), sous le nom **« Quatre fois de suite »** — Lyon prend son **quatrième titre d'affilée avec soixante-dix-neuf points, exactement le total de l'année d'avant** ; avant lui, seuls Saint-Étienne (1967-1970) et Marseille (1989-1992) avaient gagné quatre championnats de suite. **760 vrais joueurs**, 40 clubs, et **un club neuf** : **Dijon** (`DIJ`, Gaston-Gérard, rouge et blanc vérifié), monté du National pour sa première saison professionnelle, qu'il finit quatrième. **Le plateau tombe juste tout seul pour la TROISIÈME fois de suite** : vingt clubs de chaque côté, aucun repêchage, aucun écarté — trois promus (Saint-Étienne, Caen, Istres), trois descendus (Guingamp, Le Mans, Montpellier). Michael Essien est élu meilleur joueur avant Chelsea, Coupet meilleur gardien pour la troisième fois, Le Guen meilleur entraîneur pour sa dernière saison, Toulalan meilleur espoir ; Frei plante vingt buts, Lille finit deuxième, Ribéry fait la saison de sa vie à Metz, et un gamin de dix-sept ans entre en jeu cent sept minutes à Lyon : **Karim Benzema**. Sièges européens : Lyon, le PSG et Monaco en C1 ; Auxerre, Sochaux, **Lille au titre de l'Intertoto 2004** (le premier club français à le gagner depuis Montpellier en 1999) et **CHÂTEAUROUX, finaliste BATTU de la Coupe de France, depuis la LIGUE 2** — sixième club du jeu à jouer l'Europe en deuxième division, et le premier à y aller pour avoir perdu une finale. Première intersaison **muette** (sixième cas), le Mondial 2006 tombe à la deuxième. **513 des 760 noms** héritent de leur note 03/04 vieillie d'un an, 75 viennent de plus loin, 172 sont calculés ; distribution collée à 03/04. **Quarante-six notes ajustées à la main** (Saviola 81, Isaksson 79, Maicon 77, et deux palmarès que rien ne trahit : Kapsis champion d'Europe 2004, Jankauskas vainqueur de la C1 2004), **dix-huit pépites forcées** dont Benzema (cent sept minutes), Matuidi (cent cinquante-huit), **Mandanda (quatre-vingt-dix, un seul match)**, Cabaye, Koscielny, Gignac, Diaby et Digard — Le Havre en paie trois. **Hugo Lloris, dix-huit ans à Nice, reste dehors : zéro minute, et on ne force pas un homme qui n'a pas joué.** **Le piège du jour vient d'une règle de 03/04** : la tolérance d'un an accordée aux tables 96/97 prenait **Ludovic Leroy pour Laurent Leroy** et lui donnait sa note ET son nom — elle ne vaut désormais que pour un nom que SEULES ces deux tables connaissent. Et un cas sans précédent : **deux mononymes « Cris »**, celui d'Angers que le jeu porte depuis 03/04 et celui de Lyon ; aucun remède connu ne marchait, le Lyonnais s'écrit donc **« Cristiano »**, son prénom civil, et **03/04 n'a pas été retouché**. Source la plus généreuse du chantier : aucun club sous vingt-trois hommes, **aucun joueur non daté — une première**, quatre-vingts pages aspirées sans un échec. 157 prénoms neufs, aucun vide. **Quatre joueurs procéduraux seulement, le meilleur score du chantier.** `harness0405.cjs` vert cinq fois de suite, plus les **trente-trois autres harnais** en non-régression. |
| 2026-10-02 | 2005-06 | Livrée (v1.71), sous le nom **« Le coup franc de Juninho »** — Lyon prend son **cinquième titre d'affilée, et le plus large de tous** : quatre-vingt-quatre points, quinze de plus que Bordeaux, et Juninho Pernambucano est élu meilleur joueur du championnat. **760 vrais joueurs**, 40 clubs, et **un club neuf** : **Sète** (`SET`, Louis-Michel, vert et blanc vérifié), monté du National, dernier avec vingt-trois points et redescendu aussitôt. **Le plateau tombe juste tout seul pour la QUATRIÈME fois de suite** : vingt clubs de chaque côté, aucun repêchage, aucun écarté — trois promus (Nancy champion de Ligue 2, Le Mans, Troyes), trois descendus (Caen, Bastia, Istres). Coupet est meilleur gardien pour la quatrième fois, Claude Puel meilleur entraîneur d'un Lille troisième qui va chercher les huitièmes de la Ligue des champions, Pauleta meilleur buteur avec vingt et un buts, Ribéry meilleur espoir ; Nancy, absent de l'élite depuis 1997, gagne la Coupe de la Ligue par Zerka et Kim. **Huit sièges européens, tous en Ligue 1, la plus grosse délégation depuis 97/98** — Lyon et Lille en phase de groupes de C1, Monaco en qualifications ; en Coupe UEFA Rennes, Auxerre (Coupe de France), Strasbourg (Coupe de la Ligue) et **MARSEILLE ET LENS, tous deux vainqueurs de l'INTERTOTO 2005**, une première pour le jeu. Vérifié plutôt que supposé : **Bordeaux, deuxième du championnat, part sans Europe** (quinzième l'année d'avant) — le harnais le garde, c'est l'erreur la plus facile et la plus invisible. **Le Mondial 2006 tombe dès la première intersaison**, l'été 2007 est muet. **526 des 760 noms** héritent de leur note 04/05 vieillie d'un an, 78 viennent de plus loin, 156 sont calculés ; distribution collée à 04/05. **Soixante-deux notes ajustées à la main**, **dix-neuf pépites forcées** dont **Olivier Giroud (cent quatorze minutes à Grenoble)**, **Dimitri Payet (quatre-vingt-huit à Nantes)**, Benzema, Ben Arfa, Gameiro, Mirallas, Kaboul, Diaby et Koscielny — et **HUGO LLORIS ENTRE ENFIN**, lui qui restait dehors en 04/05 faute d'avoir joué : mille cinquante minutes à Nice. **Le piège du jour est la sentinelle de fin, pour la quatrième fois, mais du côté des ANCRES** : le script qui relit les tables du jeu perdait le dernier club de chacune, soit une quarantaine d'héritages silencieusement recalculés. **Une règle neuve : un forcé ne doit pas contredire le recruteur** — Christian Vieri, 747 minutes au Rocher, n'y est arrivé qu'en janvier et les vitrines de l'été 2005 le placent au Milan AC ; il reste dehors. Et une troisième leçon de relevé : la page de temps de jeu sert **le nom complet des deux côtés** quand le patronyme est court, d'où seize formes abrégées reprises des tables du jeu plutôt que devinées. Source aussi généreuse qu'en 04/05 : aucun club sous vingt-deux hommes, aucun joueur non daté, quatre-vingts pages sans un échec ni un anti-robot. 138 prénoms neufs, aucun vide. **Deux joueurs procéduraux seulement, le meilleur score du chantier.** `harness0506.cjs` vert cinq fois de suite, plus les **trente-cinq autres harnais** en non-régression. |
| 2026-10-03 | 2006-07 | Livrée (v1.75), sous le nom **« La chute des Canaris »** — le FC Nantes descend pour la **première fois de son histoire**, après quarante-quatre saisons d'affilée dans l'élite, et c'est l'écho du « Jeu à la nantaise » de 00/01. Lyon prend son **sixième titre d'affilée, le plus écrasant de tous** : quatre-vingt-un points, dix-sept d'avance sur Marseille, le titre acquis le 22 avril à cinq journées de la fin. **760 vrais joueurs**, 40 clubs, et **un club neuf** : **Libourne** (`LIB`, Jean-Antoine-Moueix, 7 000 places, bleu et blanc vérifié), né d'une fusion et monté du National pour sa première saison professionnelle. **Le plateau tombe juste tout seul pour la CINQUIÈME fois de suite** : vingt clubs de chaque côté, aucun repêchage, aucun écarté — trois promus (Valenciennes champion de Ligue 2, Lorient, Sedan), trois descendus (Ajaccio, Metz, Strasbourg). Malouda est élu meilleur joueur avant Chelsea, Richert meilleur gardien, Nasri meilleur espoir à dix-neuf ans, Houllier meilleur entraîneur ; **Pauleta finit meilleur buteur avec QUINZE buts seulement, le plus petit total qu'on ait vu en France** ; Toulouse prend une troisième place inédite, Sochaux la Coupe de France aux tirs au but contre Marseille. **Huit sièges européens, tous en Ligue 1** — Lyon, Bordeaux et Lille en C1, Lens, le Paris SG (Coupe de France), Nancy (Coupe de la Ligue) et **Marseille ET Auxerre, tous deux vainqueurs de l'Intertoto 2006**, en Coupe UEFA, deux clubs par la même Intertoto pour la deuxième année de suite ; et **Toulouse, futur troisième, part sans Europe**, le harnais le garde. **`HONNEURS` a enfin appris 2008**, le premier été que la table ait eu à apprendre depuis l'ouverture du chantier : l'été 2007 est muet, l'Euro de l'Espagne tombe à la deuxième intersaison. **532 des 760 noms** héritent de leur note 05/06 vieillie d'un an, 63 viennent de plus loin, 165 sont calculés ; distribution collée à 05/06. **Quarante-huit notes ajustées à la main**, dont **deux corrections en sens inverse** : Djibril Cissé, ancré en 2003 et vieilli trois fois, **ressortait au plafond du jeu (88)** pour une saison de prêt au Vélodrome — une ancre lointaine dérape beaucoup plus qu'une ancre d'un an. **Vingt-deux pépites forcées, la plus grosse fournée du chantier** : **MAMADOU SAKHO, SEIZE ANS au Parc des Princes** (le deuxième du jeu après Didier Domi), Schneiderlin, Taarabt, Mongongu, Yanga-Mbiwa, Alessandrini et Feghouli à dix-sept ans, **Kévin Constant pour DEUX minutes**, Rami, Loïc Rémy, N'Gog, Vainqueur, Sako, Kaboré, Cissokho, et Giroud, Bong et Yebda reconduits. **Ben Arfa a été forcé pour ne pas SORTIR** : le forçage de Loïc Rémy l'éjectait de Lyon — le piège de Thuram-Grimandi (90/91) se rejoue dès qu'un club paie deux hommes. **Sept homonymes résolus, un record**, et un cas inédit : **TROIS Traoré sans lien dont aucun ne peut prendre « M. Traoré »**, qui appartient à un quatrième homme — tous les trois en toutes lettres. **Le piège du jour** : la forme abrégée des tables du jeu doit passer **avant** la règle du mononyme et exiger une concordance d'âge **exacte**, sans quoi Eduardo Oliveira devenait le mononyme « Eduardo » d'un autre et Álvaro Santos héritait du nom d'Adailton Santos. Source la plus généreuse du chantier : aucun club sous vingt-deux hommes, aucun joueur non daté, quatre-vingts pages sans un échec ni un anti-robot. 151 prénoms neufs, aucun vide. **Quatre joueurs procéduraux seulement**, à égalité avec 04/05. `harness0607.cjs` vert cinq fois de suite, plus les **trente-cinq autres harnais** — avec une réserve honnête : **`harness-recruteur.cjs` rougit par hasard environ trois fois sur dix**, parce que sa section F exige un prénom sur chaque carte alors que `PRENOMS_VRAIS` porte `"J. S. Verón":""`, un prénom volontairement vide (consigne v1.46 : on garde l'initiale, jamais de prénom deviné). **Prouvé non régressif à graine fixe** — les deux versions rendent le même échec sur le même homme, et deux lancements sur douze de la version d'avant rougissaient déjà. Aucune assertion n'a été touchée : c'est un travail de moteur, pas de saison. |
| 2026-10-04 | 2007-08 | Livrée (v1.76), sous le nom **« Les vingt buts de Benzema »** — Lyon prend son **septième titre d'affilée, le dernier de la série**, quatre points devant le Bordeaux de Laurent Blanc, et **Karim Benzema, vingt ans, est élu meilleur joueur du championnat ET meilleur buteur avec vingt buts**, le seul doublé individuel depuis Pauleta en 02/03. **760 vrais joueurs**, 40 clubs, et **un club neuf** : **Boulogne** (`BLG`, stade de la Libération, 8 700 places, rouge et noir vérifié), monté du National pour sa première saison professionnelle après cent neuf ans d'existence — avec un piège de code à la clé, **`BOU` étant pris depuis 91/92 par le FC Bourges**. **Le plateau tombe juste tout seul pour la SIXIÈME fois de suite** : vingt clubs de chaque côté, aucun repêchage, aucun écarté — trois promus (Metz champion de Ligue 2, Caen, Strasbourg), trois descendus (Nantes, Troyes, Sedan). Ben Arfa est meilleur espoir, Mandanda meilleur gardien sans manquer une minute, **Jérôme Leroy meilleur passeur à trente-trois ans**, Blanc meilleur entraîneur ; le PSG, seizième, gagne la Coupe de la Ligue et perd la Coupe de France contre Lyon ; en Ligue 2 **Guillaume Hoarau plante vingt-huit buts** et ramène Le Havre dans l'élite. **Sept sièges européens, tous en Ligue 1**, et le contrôle du harnais joue **dans les deux sens pour la première fois** : Nancy et Saint-Étienne, futurs quatrième et cinquième, partent sans Europe, tandis que **Toulouse, qui finira DIX-SEPTIÈME, joue bel et bien la Ligue des champions** pour avoir été troisième l'année d'avant — le siège le plus invraisemblable que le jeu ait eu à poser. **`HONNEURS` a appris l'été 2010**, le deuxième été qu'il ait eu à écrire : l'Euro 2008 tombe dès la première intersaison, l'été 2009 est muet, et le Mondial d'Afrique du Sud arrive à la troisième — Knysna comprise, et sans « LA FRANCE » en capitales. **L'héritage n'a jamais autant porté : 540 des 760 noms reprennent leur note 06/07 vieillie d'un an**, 73 viennent de plus loin, 147 seulement sont calculés — 81 %, le meilleur taux du chantier. Cinquante-huit notes ajustées à la main (Benzema 84/93, que l'héritage seul laissait à 73 ; Pjanić 67/92 à dix-sept ans pour 2 839 minutes), **vingt-trois pépites forcées** dont **EDEN HAZARD, SEIZE ANS ET TRENTE-TROIS MINUTES À LILLE** — son premier match professionnel, le plus haut potentiel du plateau — et **Pierre-Baptiste Baherlé, seize ans à Boulogne**, soit **deux hommes de seize ans dans la même saison, une première**. **Le piège du jour est neuf et il était grave : deux hommes nés la même année peuvent se disputer une seule ancre, et les minutes tranchent à l'envers.** Abdou Traoré (Bordeaux, 71 minutes) prenait le nom ET la note d'Alain Traoré (Auxerre, 3 minutes), et **les deux héritaient de la même ancre** ; la règle à garder est que **c'est le club de l'ancre qui tranche**, et une vérification générale « aucune ancre ne sert deux fois » a été ajoutée au relevé. Deuxième correctif du même tonneau : **l'ancre doit se chercher aussi sous le nom FINAL**, sans quoi les hommes que le jeu porte en toutes lettres (Benoît Cheyrou, 3 798 minutes ; André Luiz, 3 627) perdaient leur héritage en silence. Deux mononymes brésiliens descendus au nom civil, identités tranchées par identifiant Transfermarkt : **« Eduardo Ribeiro »** (le Toulousain de 03/04 est un autre homme, né un an plus tôt) et **« Henrique Gomes »**. Source la plus généreuse du chantier pour la troisième fois : aucun club sous vingt-deux hommes, aucun joueur non daté, quatre-vingts pages sans un échec ni un anti-robot ; 1 086 hommes ont joué pour 760 places, quarante-cinq listés dans deux clubs. 131 prénoms neufs, aucun vide. **Trois joueurs procéduraux seulement.** `harness0708.cjs` vert cinq fois de suite, plus les **trente-six autres harnais** — avec la même réserve honnête qu'en 06/07 : **`harness-recruteur.cjs` rougit par hasard quatre fois sur douze** à cause de `"J. S. Verón":""`, un prénom volontairement vide (consigne v1.46), et c'est **prouvé non régressif à graine fixe** — à graine 10, la v1.75 et la v1.76 rendent le même échec sur le même homme. Aucune assertion n'a été touchée. |
