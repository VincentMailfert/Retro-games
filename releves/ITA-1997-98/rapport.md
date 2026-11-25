# Relevé ITA 1997-98

## Importé

- **Saison** : Serie A et Serie B 1997-98, relevées par la tâche planifiée le 25/11/2026, branche `secours/2026-11-25`.
- **Serie A, dix-huit clubs à sa vraie taille** (décision de l'auteur, v3.00) : Juventus, Inter, Udinese, Roma, Fiorentina, Parma,
  Lazio, Bologna, Sampdoria, Milan, Bari, Piacenza, Empoli, Vicenza, Brescia, Atalanta, Lecce, Napoli. La Juventus de Lippi
  championne avec soixante-quatorze points, cinq devant l'Inter de Ronaldo ; l'Udinese de Zaccheroni troisième. Brescia, Atalanta,
  Lecce et Napoli (quatorze points) descendent.
- **Serie B, vingt clubs** : Salernitana, Venezia, Cagliari, Perugia (promus ; Perugia après le barrage gagné aux tirs au but contre
  le Torino, à égalité de points), Torino, Reggina, Hellas Verona, Treviso, Genoa, Chievo, Reggiana, Fidelis Andria, Pescara, Ravenna,
  Lucchese, Monza, Foggia, Ancona, Padova, Castel di Sangro (relégués : Foggia, Ancona, Padova, Castel di Sangro).
  **Aucun écarté, aucun repêché, aucune pénalité.**
- **Un club nouveau dans `releves/clubs-tm.json`** : Treviso (`TRV`, Transfermarkt 2251, « Treviso FBC 1993 »), monté de C1, déjà
  dans `CLUBS_ITA`, identifiant lu sur le classement Transfermarkt de la Serie B 1997. Monza (2919) et Fidelis Andria (4085) y étaient.
- **720 joueurs retenus** (20 × 18 + 18 × 20), sur 1 276 hommes listés par Transfermarkt.
- **Coup d'envoi commun aux deux divisions : le 31 août 1997** (Wikipédia italienne, « Serie A 1997-1998 » et « Serie B 1997-1998 »).
- **Pépites** : aucune forcée au relevé.
- **Noms proposés** : « Le Fenomeno à San Siro » (Ronaldo, Ballon d'or 1997, arrive à l'Inter et gagne la Coupe UEFA), « Le Frioul de
  Bierhoff » (Bierhoff meilleur buteur avec vingt-sept buts, l'Udinese troisième).

## Vérifié

- `node releves/verifie-releve.cjs releves/ITA-1997-98` : **deux rouges, expliqués** : le contrôle d'identité de **Fidelis Andria**
  (un retenu en commun avec 1995-96) et d'**Ancona** (deux), dont la dernière saison relevée est 1995-96, avec un effectif refait
  depuis. **L'identité est contrôlée par Wikipédia** : les dix-huit retenus d'Andria et les dix-huit d'Ancona sont dans la « rosa » de
  leurs pages italiennes « Associazione Sportiva Fidelis Andria 1997-1998 » et « Ancona Calcio 1997-1998 » (18/18 chacun). Deux
  alertes : Treviso et Monza n'ont pas de saison voisine relevée (Monza : 18/18 dans sa rosa ; Treviso : 16/18, les deux autres,
  Falcioni et Susic, absents de la rosa, Susic étant de toute façon écarté).
- **Classements** : la Serie A recopiée de la Wikipédia anglaise (« 1997–98 Serie A »). **La Serie B de la Wikipédia anglaise est
  incohérente** (246 victoires pour 245 défaites, 903 buts pour 895 : la ligne de Perugia est fausse, 15-17-6 et 52-35) : elle est
  remplacée par le classement de la **Wikipédia italienne** (« Serie B 1997-1998 »), cohérent (Perugia 16-14-8, 46-37, 62 points ;
  Reggina sixième devant l'Hellas, Lucchese quinzième devant Monza). Juventus championne, Salernitana championne de Serie B, promus,
  relégués et barrage Perugia-Torino conformes.
- **Les arrivées : l'historique de transferts répond cette nuit.** `ceapi/transferHistory/list/<id>` (refusé par l'environnement de
  la tâche depuis 1992-93) a été lu pour **les 1 175 hommes** listés. Club au coup d'envoi = destination du dernier transfert daté au
  plus tard le 31 août 1997 ; sinon, club de départ du premier transfert daté après ; les équipes de jeunes du club (« Milan U19 »)
  comptent comme le club. 167 hommes arrivés en cours de saison sont écartés, dont **Davids à la Juventus**, **Vierchowod à Piacenza**
  (arrivé le 6 septembre, confirmé par la Repubblica citée sur « Serie A 1997-1998 »), **Pedros à Napoli** (4 septembre), **Andreas
  Andersson** (1er septembre), **Ganz** et **Maniero** au Milan, **Colonnese** à l'Inter, **Dorigo** au Torino, **Francioso** à Monza.
  17 hommes partis du club avant le coup d'envoi selon l'historique sont écartés (Blomqvist, Asprilla, Bravo, Luzardi…).
  Un homme sans transfert daté contraire mais au même club dans le relevé 1996-97 compte au coup d'envoi (5 retenus : Rampulla,
  Iannuzzi, F. Bellucci, Araboni, Lamacchi).
- **Recoupements Wikipédia** (pages italiennes de saison des 38 clubs, lignes « Calciatore in rosa » et leurs notes, **notes nommées
  réutilisées comprises**) : quand elles contredisent une date par défaut de Transfermarkt (1er juillet), elles tranchent (70 cas, écrits
  dans la `remarque` de chacun, « SURCHARGE Wikipédia », avec la citation). Arrivés en cours de saison malgré le 1er juillet :
  Tovalieri, Melli et Manicone à Perugia, Malinarich au Torino, Silenzi et Grimaudo à la Reggiana, De
  Patre à Cagliari, Dell'Anno et Sogliano à Ravenna, Seno, Rosa, Pergolizzi et Quinteros à Padova, Betti et Chianese à Foggia… Au club
  au coup d'envoi, partis ensuite : Paganin et Tarantino à l'Inter, Tovalieri et Morales à la Sampdoria, Simone Inzaghi à Piacenza,
  Chianese à l'Atalanta, Sulcis à Cagliari, Scarponi et Longo au Torino, Evani et Hatz à la Reggiana. **La note « ceduto » ne surcharge
  pas un homme que l'historique place dans un autre club au coup d'envoi** (elle dit seulement qu'il est reparti : Zamboni, Pedros,
  Andersson, Conte, Balducci, Campioli restent écartés).
- **Contrôle du parseur** : pour chacun des 38 clubs, la page d'effectif et l'onglet de temps de jeu donnent les mêmes hommes, à une
  exception près : **Jonathan Bachini** (Udinese, 2 625 minutes), absent de la page d'effectif, gardé (naissance du relevé 1996-97).
- **Test de non-régression** : la règle de l'historique, appliquée au coup d'envoi du 8 septembre 1996, retrouve les arrivées du
  relevé ITA-1996-97 de la Juventus (19 cas comparables sur 19) et de Parma (21 sur 21), sans un désaccord.

## Doutes

- **Neuf hommes changent de ligne** pour tenir les minimums : en attaque, Hazem Emam (Udinese), Kolyvanov (Bologna), Piovani (Piacenza),
  Rapajić (Perugia), Binotto (Hellas), Pasino et Campo (Reggina), Bernardi (Castel di Sangro), ailiers chez Transfermarkt ou « A » de la
  rosa, et **Savićević au Milan** (milieu offensif chez Transfermarkt, « di ruolo centrocampista o attaccante » sur la Wikipédia
  italienne), Andersson et Ganz étant arrivés après le coup d'envoi ; en défense, **Aimo Diana** (Brescia, « D » de la rosa), Luzardi
  étant parti à Ascoli.
- **Andrea Ivan** (gardien) : Transfermarkt le met à Salernitana dès le 1er juillet (450 minutes) et « nicht im Kader » à Foggia ; la
  rosa de Foggia le dit « ceduto durante il calciomercato a stagione avviata ». Gardé à **Foggia** (sans quoi Foggia n'a qu'un gardien
  au coup d'envoi), écarté de Salernitana.
- **Diego Fuser** (Lazio) : la note « Dall'8 marzo 1998 » de la rosa porte sur le brassard de capitaine, pas sur une arrivée : gardé.
- **Attilio Gregori** (Venezia, 3 330 minutes) : Transfermarkt le renvoie à l'Hellas le 1er juillet 1997 (fin de prêt, date par
  défaut) ; la rosa de Venezia le compte sans note : gardé (prêt prolongé). Même règle (rosa sans note, temps de jeu au club) pour
  Cerretti et Morabito (Reggina), Cevoli (Reggiana ; Transfermarkt écrit Reggina, confusion déjà vue avec Pedone) et Tisci (Pescara).
- **Trois fiches Transfermarkt fantômes** retirées de la liste (naissance impossible, homonymes liés au mauvais homme) : Daniele Federici
  (1988, listé à la Lazio et à Castel di Sangro), Andrea Ferrari (1986, Bologna), Gianluca Esposito (1995, Perugia, 38 minutes qui
  reviennent sans doute à l'autre Gianluca Esposito, né en 1977). Aucun n'aurait été retenu.
- **Les deux Tedesco de Salernitana** : Giovanni (« G. Tedesco ») et Giacomo (« Giacomo Tedesco »), graphies du jeu.
- 21 retenus sans prénom, tous des noms d'usage sans initiale (Dimas, Zé Maria, Rui Costa…).
