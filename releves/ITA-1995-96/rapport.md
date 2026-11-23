# Relevé ITA 1995-96

## Importé

- **Saison** : Serie A et Serie B 1995-96, relevées par la tâche planifiée le 23/11/2026, branche `secours/2026-11-23`.
- **Serie A, dix-huit clubs à sa vraie taille** (décision de l'auteur, v3.00) : Milan, Juventus, Lazio, Fiorentina, Roma, Parma, Inter,
  Sampdoria, Vicenza, Cagliari, Udinese, Napoli, Atalanta, Piacenza, Bari, Torino, Cremonese, Padova. Le Milan de Capello champion avec
  soixante-treize points, huit devant la Juventus. Bari, Torino, Cremonese et Padova descendent.
- **Serie B, vingt clubs** : Bologna, Hellas Verona, Perugia, Reggiana (promus), Salernitana, Lucchese, Palermo, Genoa, Pescara, Cesena,
  Cosenza, Foggia, Venezia, Chievo, Reggina, Brescia, Fidelis Andria, Avellino, Ancona, Pistoiese (relégués : Andria, Avellino, Ancona,
  Pistoiese). **Aucun écarté, aucun repêché, aucune pénalité.**
- **Un club nouveau dans `releves/clubs-tm.json`** : la Pistoiese (`PST`, Transfermarkt 1307, « AC Pistoiese »), montée de C1, déjà dans
  `CLUBS_ITA`, identifiant lu sur le classement Transfermarkt de la Serie B 1995. Bologna (1025), Reggina (1386) et Avellino (2331) y étaient.
- **720 joueurs retenus** (20 × 18 + 18 × 20), sur 1 074 hommes listés par Transfermarkt.
- **Coup d'envoi commun aux deux divisions : le 27 août 1995** (Wikipédia italienne, « Serie A 1995-1996 » et « Serie B 1995-1996 »).
- **Pépites** : aucune forcée au relevé (Cristiano Zanetti, Fiorentina, quinze minutes, est au club et non retenu : à voir à l'assemblage).
  Gianluigi Buffon (Parma, dix-sept ans, premier match le 19 novembre 1995) est retenu par le minimum de gardiens.
- **Noms proposés** : « Le Libérien de San Siro » (George Weah, Ballon d'or 1995, champion avec le Milan), « Weah et Baggio au Milan ».

## Vérifié

- `node releves/verifie-releve.cjs releves/ITA-1995-96` : **cinq rouges, tous expliqués** : trois minimums d'attaquants (Cremonese,
  Reggina, Ancona, voir les doutes) et deux contrôles d'identité (Reggiana et Ancona n'ont que deux et un retenus en commun avec 1994-95).
  **L'identité de ces deux clubs est contrôlée par Wikipédia** : quinze des dix-huit retenus de la Reggiana et les dix-huit d'Ancona sont
  dans la « rosa » de la page italienne de leur saison 1995-96 (la Reggiana, reléguée, change de gardien, de défense et de milieu ; la page
  cite Ballotta, Caini, Cevoli, Tangorra, Ziliani, Strada, Colucci, Schenardi, Pietranera ; Ancona est celui d'Artistico, vingt buts).
  Quatre alertes : Bologna, Reggina, Avellino et la Pistoiese n'ont pas de saison voisine relevée.
- **Classements** recopiés de la Wikipédia anglaise (« 1995–96 Serie A », « 1995–96 Serie B ») : Milan champion, Bologna champion de
  Serie B, promus et relégués conformes. Contrôles du vérificateur : points, matchs, victoires et défaites, buts.
- **Les arrivées**, par la méthode de 1992-93 (l'historique `ceapi/transferHistory` n'a pas été appelé : l'environnement de la tâche a
  refusé la commande qui le contenait) :
  1. les **listes de transferts été et hiver 95/96 des 38 clubs**, arrivées et départs séparés ;
  2. pour les hommes dont « Im Team seit » est vide ou postérieure au coup d'envoi, listés dans deux clubs, ou partis du club (ou
     arrivés ailleurs) dans les listes de la saison, la **page de détail de chaque transfert** (387 pages, date « Transferzeitpunkt »).
  Club au coup d'envoi = destination du dernier transfert daté au plus tard le 27 août 1995 (transferts du même jour lus en chaîne) ;
  sinon, club de départ du premier transfert daté après ; une ligne de la liste d'hiver datée du 1er juillet compte comme un mouvement
  d'hiver. 79 hommes arrivés en cours de saison sont écartés, dont **Delvecchio à la Roma** (Inter au coup d'envoi), **Ingesson et Ripa
  à Bari**, **O'Neill à Cagliari**, **Mancini à la Lazio**, **Aloisi à la Cremonese**, **van Utrecht à Padova**, **Tramezzani à Cesena**.
- **Recoupements Wikipédia** (pages italiennes de saison des 38 clubs, lignes « Calciatore in rosa » et leurs notes) : quand elles
  contredisent la date par défaut du 1er juillet de Transfermarkt, elles tranchent, comme en 1993-94 et 1994-95.
  **Au club au coup d'envoi, partis ensuite** : Branca à la Roma (« ceduto nella sessione invernale », l'Inter le dit « acquistato
  durante la sessione autunnale »), Pistone et Briaschi à Vicenza, Cravero à la Lazio (« ceduto a settembre al Torino »), Minaudo à
  l'Atalanta, Cozza au Torino, Nicolini à la Cremonese, Corrado à Genoa, Bracaloni au Chievo, Bortoluzzi et Monari à Avellino : écartés
  de l'Inter, du Torino, de Perugia, de Lucchese, de la Reggina, de Cesena et de Venezia. **Arrivés en cours de saison** : Pittana à
  Vicenza, Nava à Padova, Scarafoni, Compagno et Barraco à Palermo, Sclosa et Nardini à la Pistoiese (« acquistato nel corso della
  stagione » ou « nel calciomercato autunnale-invernale »). **Pirri** (Cremonese, « ceduto a stagione in corso ») et **Verolino**
  (Napoli, « aggregato dalla formazione Primavera »), marqués « nicht im Kader » par Transfermarkt, sont dans la rosa comme attaquants :
  gardés au club. Chaque correction est écrite dans la `remarque` du joueur, avec sa citation.
- **Test de non-régression** : le parseur de cette nuit relit la page Transfermarkt 1995 de la Juventus avec les trente-cinq hommes de
  la page, mêmes minutes que l'onglet de temps de jeu ; les retenus de chaque club ont été confrontés un à un aux rosas Wikipédia.

## Doutes

- **Trois clubs n'ont que trois attaquants** : la Cremonese (Florjančič, Tentoni et Pirri ; Fantini était à la Juventus au coup d'envoi,
  Aloisi arrivé en novembre), la Reggina (Aglietti, Veronese, Visentin, les trois attaquants de la rosa Wikipédia) et Ancona (Artistico,
  et Lemme et Lucidi passés en attaque comme la rosa les range). Tolérés comme Piacenza en 1994-95.
- **Sept hommes passent en attaque** : les ailiers Piovani (Piacenza), Foglia (Torino), Valtolina (Bologna), Massara (Andria) et Lucidi
  (Ancona) ; Pirri et Lemme, rangés « A » par Wikipédia.
- **24 retenus restent à `arrivee` 1** (aucun transfert daté, absents du relevé 1994-95 ou jeunes de la Primavera) : Buffon (Parma),
  Balasso (Vicenza), Medda (Cagliari), Marseglia, Colicchio et G. Ballotta (Piacenza), Sommese (Torino), Morello et Piovesan (Padova),
  Nervo (Bologna), Cevoli (Reggiana), Farabegoli et Comandini (Cesena), Spingola (Cosenza), Di Corcia et Volturno (Foggia), Lorieri et
  Vianello (Venezia), Giacchetta (Reggina), Lamanna et Scarponi (Andria), Pergolizzi, Bellini et Biondi (Pistoiese).
- **Scarafoni** (Palermo, 3 094 minutes) est écarté sur la seule foi de la note Wikipédia « acquistato nel corso della stagione » ;
  son temps de jeu laisse penser qu'il est arrivé tôt, mais après le coup d'envoi.
- Prénoms laissés vides : les noms que Transfermarkt n'abrège pas (Rui Costa, Aldair, Roberto Carlos, Paul Ince, Caio Ribeiro, Luis
  Oliveira, Caçapa, Abédi Pelé), dont la graphie du jeu est reprise à l'assemblage.
