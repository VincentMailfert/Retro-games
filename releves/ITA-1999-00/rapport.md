# Relevé ITA 1999-00

## Importé

- **Saison** : Serie A et Serie B 1999-00, relevées par la tâche planifiée le 27/11/2026, branche `secours/2026-11-27`.
- **Serie A, dix-huit clubs à sa vraie taille** (décision de l'auteur, v3.00) : Lazio, Juventus, Milan, Inter, Parma, Roma,
  Fiorentina, Udinese, Hellas Verona, Perugia, Reggina, Bologna, Lecce, Bari, Torino, Venezia, Cagliari, Piacenza. La Lazio de
  Sven-Göran Eriksson championne avec soixante-douze points, un devant la Juventus, battue à Perugia sous la pluie à la dernière
  journée. L'Inter passe Parma (cinquante-huit points chacun) au match d'appui pour la quatrième place. Torino, Venezia,
  Cagliari et Piacenza descendent.
- **Serie B, vingt clubs** : Vicenza, Napoli, Atalanta, Brescia (promus), Sampdoria, Genoa, Salernitana, Empoli, Treviso,
  Ternana, Ravenna, Cosenza, Pescara, Monza, Chievo, Pistoiese, Cesena, Alzano Virescit, Savoia, Fermana (relégués : Cesena,
  battu par la Pistoiese au double barrage, Alzano, Savoia, Fermana). **La Pistoiese est pénalisée de quatre points**
  (`penalite` 4). **Aucun écarté, aucun repêché.**
- **Trois clubs nouveaux dans `releves/clubs-tm.json`**, montés de C1 et déjà dans `CLUBS_ITA` : **Alzano Virescit (4338)**,
  **Savoia (4341, « AC Savoia 1908 »)** et **Fermana (4033, « Fermana Calcio 1920 »)**, relevés sur la page de championnat
  Transfermarkt.co.uk Serie B 1999-00.
- **720 joueurs retenus** (20 × 18 + 18 × 20), sur 1 378 lignes listées par Transfermarkt (1 253 hommes distincts).
- **Coups d'envoi** (Wikipédia italienne, « Serie A 1999-2000 » et « Serie B 1999-2000 ») : **le 28 août 1999 en Serie A**,
  **le 29 août 1999 en Serie B**. Chaque club est jugé au coup d'envoi de sa division.
- **Pépites** : aucune forcée au relevé.
- **Noms proposés** : « Le déluge de Pérouse » (la Juventus tombe à Perugia, sur un terrain inondé, après plus de soixante-dix
  minutes d'interruption, et la Lazio est championne), « La pluie de Collina ».

## Vérifié

- `node releves/verifie-releve.cjs releves/ITA-1999-00` : **un rouge, expliqué** : les minimums de poste de la **Pistoiese**,
  qui n'a que **trois attaquants** au coup d'envoi (Bonaldi, Della Giovanna, et Foglia passé en attaque) ; ses six autres
  attaquants de la saison (Banchelli, Corrado Colombo, Ricchiuti, Belmonte, Desole, Pantano) sont tous arrivés en cours de saison
  selon l'historique de transferts. Tolérée à trois attaquants, comme Piacenza en 1994-95 ou Cremonese en 1995-96. Quatre
  alertes : **Pistoiese, Alzano, Savoia et Fermana** n'ont pas de saison voisine relevée ; **leurs dix-huit retenus sont tous dans
  la rosa Wikipédia de leur club** (18/18 chacun). Sur tout le plateau, 715 des 720 retenus sont retrouvés dans la rosa
  Wikipédia de leur club ; les cinq autres y sont sous un autre nom (Sensini « Néstor Sensini », Gurenko, Luciano « Eriberto »,
  Christophe Sanchez, Hashimu Garba).
- **Classements** : recopiés de la Wikipédia anglaise (« 1999–2000 Serie A », « 1999–2000 Serie B »), cohérents (212 victoires
  pour 212 défaites et 764 buts pour 764 en Serie A ; 249 pour 249 et 952 pour 952 en Serie B), recoupés avec la Wikipédia
  italienne (pénalité de la Pistoiese, barrage Pistoiese-Cesena, match d'appui Inter-Parma). Lazio championne, Vicenza
  champion de Serie B, promus et relégués conformes.
- **Les arrivées : l'historique de transferts répond toujours.** `ceapi/transferHistory/list/<id>` a été lu pour **les 1 256
  hommes** listés (l'anti-robot a refusé environ deux cents requêtes, toutes reprises jusqu'à réponse ; aucune réponse vide).
  Club au coup d'envoi = destination du dernier transfert daté au plus tard le coup d'envoi de sa division ; sinon, club de
  départ du premier transfert daté après ; les équipes de jeunes du club comptent comme le club. **146 arrivés en cours de
  saison sont écartés**, dont **Seedorf** et **Córdoba** à l'Inter (janvier 2000), **Kennet Andersson** à Bologna, **Amoruso** à
  Perugia (1er septembre), **Luís Oliveira** à Cagliari (8 septembre), **Galante** au Torino, **Apolloni** à l'Hellas,
  **Carparelli** au Genoa, **Saudati** à Empoli et **Juarez** à Lecce. 73 hommes partis du club avant le coup d'envoi selon
  l'historique sont écartés, sauf surcharge Wikipédia.
- **Recoupements Wikipédia** (pages italiennes de saison des 38 clubs, lignes « Calciatore in rosa » et leurs notes, `<ref>` et
  `{{efn}}`, notes nommées réutilisées comprises) : **63 surcharges**, écrites dans la `remarque` de chacun avec leur citation.
  **Arrivés en cours de saison malgré le 1er juillet de Transfermarkt (30)**, dont beaucoup « acquistati nella sessione estiva,
  a stagione in corso » (le marché d'été fermait après le coup d'envoi) : Lorieri et Semioli (Salernitana), Valoti et D'Aversa
  (Cosenza), Malagò et Manfredini (Genoa), Comotto (Vicenza), Serena (Inter), Mondini (Lazio, « acquistato a settembre »),
  Salvatori et Florjančič (Alzano), Bedin (Monza), Rachini (Fermana), cinq hommes de Savoia. **Au club au coup d'envoi, partis
  ensuite (19)** : Dabo (Inter), Tentoni et Pellegrini (Perugia), Martino (Reggina), Cyprien, Atelkin et Greco (Lecce), Mazzocco
  et Biancone (Vicenza), Mazzeo (Brescia), Iacopino (Sampdoria), Polito et Lo Nero (Salernitana), Toscano (Cosenza), Minopoli
  (Pescara), Giusti et Lombardini (Chievo), Antonellini (Cesena), Direnzo (Fermana). **Règle de Gregori (14)** : rosa du club
  sans note et temps de jeu au club, contre un historique qui le place ailleurs (Rampulla à la Juventus, Maini et Ghidini à
  Parma, Appiah à l'Udinese, Piovanelli à l'Hellas, Melli à Perugia, Cimarelli à Lecce, Mora, Bigica, Russo et Bordi à Napoli,
  Falcioni à Cosenza, Daniele Gregori à Pescara, Vignaroli à Monza). **Les deux règles de 1998-99 appliquées** : un homme
  revendiqué par deux clubs reste à l'ancien s'il y a joué (Dabo à l'Inter et non à Parma, Cimarelli à Lecce et non au Chievo,
  Mazzeo à Brescia et non à Monza) ; aucune note « acquistato » ne visait un homme ayant joué plus de matchs que sa division
  n'a de journées.
- **Contrôle du parseur** : pour chacun des 38 clubs, la page d'effectif et l'onglet de temps de jeu donnent les mêmes hommes,
  à une exception près : **Jonathan Bachini** (Juventus), absent de la page d'effectif comme en 1997-98 et 1998-99, gardé,
  naissance reprise du relevé 1998-99.
- **Test de non-régression** : la règle de l'historique, appliquée au coup d'envoi du 12 septembre 1998, retrouve les arrivées
  du relevé ITA-1998-99 de Parma (27/27) et de l'Inter (28/28), de la Juventus (25/26) et de la Lazio (29/30) ; les deux écarts
  sont des surcharges écrites de 1998-99 (Rampulla, au même club la saison d'avant ; Rambaudi, note Wikipédia).

## Doutes

- **La Pistoiese reste à trois attaquants** (voir plus haut).
- **Six hommes changent de ligne** pour tenir les quatre attaquants, tous rangés « A » par la rosa Wikipédia de leur club :
  **Francioso** (Genoa, ailier gauche, meilleur buteur de Serie B, déjà « A » dans le jeu), **Tarantino** (Empoli, ailier
  droit), **Kanyengele** (Savoia, ailier droit), **Foglia** (Pistoiese, ailier gauche), **Rapaić** (Perugia, milieu gauche) et
  **Osmanovski** (Bari, ailier gauche).
- **Trois innommables écartés de la présélection** : **Hilário** (Perugia), **Dani** (Perugia) et **Hugo** (Bari), noms d'usage
  déjà portés par d'autres hommes du jeu, sans autre nom libre (la fiche Transfermarkt, qui aurait donné un nom complet, a
  répondu par l'anti-robot) ; même règle que Reinaldo en 1996-97. Les suivants aux minutes prennent leur place.
- **Cinq dates précises de Transfermarkt gardées contre une note Wikipédia** : Campolo (Perugia), Statuto (Piacenza),
  Răducioiu (Brescia), Teodorani (Ternana), Gatta (Monza), transférés avant le coup d'envoi.
- **Trois fiches Transfermarkt fantômes** retirées de la liste (naissance impossible pour la saison) : Andrea Campagnolo
  (« 1986 », Roma), Mattia Bennardo (« 1991 », Brescia) et Giovanni Puglisi (« 1993 », Cosenza).
- **Pantano** (Pistoiese) : Transfermarkt le fait arriver en novembre 1999, la rosa le dit « ceduto nella sessione invernale » ;
  l'historique ne recoupe ni l'un ni l'autre : laissé arrivé en cours de saison, non retenu.
- 22 retenus sans prénom, presque tous des noms d'usage sans initiale (Leonardo, Ronaldo, Cafu, Aldair, Rui Costa…) ou des noms
  entiers déjà écrits ainsi par le jeu (Luca Toni, David Dei, Giacomo Tedesco).
