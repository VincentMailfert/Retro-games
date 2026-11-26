# Relevé ITA 1998-99

## Importé

- **Saison** : Serie A et Serie B 1998-99, relevées par la tâche planifiée le 26/11/2026, branche `secours/2026-11-26`.
- **Serie A, dix-huit clubs à sa vraie taille** (décision de l'auteur, v3.00) : Milan, Lazio, Fiorentina, Parma, Roma, Udinese,
  Juventus, Inter, Bologna, Bari, Venezia, Piacenza, Cagliari, Perugia, Salernitana, Sampdoria, Vicenza, Empoli. Le Milan
  d'Alberto Zaccheroni champion avec soixante-dix points, un devant la Lazio ; la Fiorentina troisième. Salernitana, Sampdoria,
  Vicenza et Empoli descendent. **Empoli pénalisé de deux points** (`penalite` 2, vingt points au lieu de vingt-deux).
- **Serie B, vingt clubs** : Hellas Verona, Torino, Lecce, Reggina (promus), Pescara, Atalanta, Brescia, Treviso, Ravenna, Napoli,
  Chievo, Genoa, Cesena, Ternana, Monza, Cosenza, Reggiana, Fidelis Andria, Lucchese, Cremonese (relégués : Reggiana, Fidelis
  Andria, Lucchese, Cremonese). **Aucun écarté, aucun repêché.**
- **Aucun club nouveau dans `releves/clubs-tm.json`** : Cesena (1429), Ternana (1103), Cosenza (4031) et Cremonese (2239), montés de
  C1 ou absents du relevé précédent, y étaient déjà.
- **720 joueurs retenus** (20 × 18 + 18 × 20), sur 1 299 lignes listées par Transfermarkt (1 193 hommes distincts).
- **Coups d'envoi** (Wikipédia italienne, « Serie A 1998-1999 » et « Serie B 1998-1999 ») : **le 12 septembre 1998 en Serie A**, **le
  6 septembre 1998 en Serie B**. Pour la première fois en Italie, les deux divisions ne commencent pas le même jour : chaque club est
  jugé au coup d'envoi de sa division.
- **Pépites** : aucune forcée au relevé.
- **Noms proposés** : « Zaccheroni coiffe la Lazio » (le Milan, septième la saison d'avant, passe la Lazio à la trente-troisième
  journée et gagne le titre à Perugia), « Le sprint de Zaccheroni ».

## Vérifié

- `node releves/verifie-releve.cjs releves/ITA-1998-99` : **un rouge, expliqué** : le contrôle d'identité de **Fidelis Andria** (deux
  retenus en commun avec 1997-98, Recchi et Manca), dont l'effectif est encore refait d'une saison à l'autre, comme l'an passé.
  **L'identité est contrôlée par Wikipédia** : les dix-huit retenus d'Andria sont dans la « rosa » de « Associazione Sportiva Fidelis
  Andria 1998-1999 » (18/18). Une alerte : **Ternana** n'a pas de saison voisine relevée ; ses dix-huit retenus sont dans la rosa de
  « Ternana Calcio 1998-1999 » (18/18). Sur tout le plateau, 719 des 720 retenus sont retrouvés dans la rosa Wikipédia de leur club ;
  le dernier est Luciano (Bologna), que la rosa nomme « Eriberto », le nom sous lequel il jouait alors.
- **Classements** : recopiés de la Wikipédia anglaise (« 1998–99 Serie A », « 1998–99 Serie B »), cohérents (225 victoires pour 225
  défaites et 845 buts pour 845 en Serie A ; 247 pour 247 et 865 pour 865 en Serie B), recoupés avec la Wikipédia italienne : mêmes
  chiffres, même pénalité d'Empoli. Seul écart : à égalité de points (51), la Wikipédia italienne met Napoli neuvième devant Ravenna ;
  l'ordre anglais est gardé, sans effet sur le plateau. Milan champion, Hellas Verona champion de Serie B, promus et relégués
  conformes.
- **Les arrivées : l'historique de transferts répond toujours.** `ceapi/transferHistory/list/<id>` a été lu pour **les 1 195 hommes**
  listés (aucune réponse vide). Club au coup d'envoi = destination du dernier transfert daté au plus tard le coup d'envoi de sa
  division ; sinon, club de départ du premier transfert daté après ; les équipes de jeunes du club (« Milan U19 ») comptent comme le
  club. **170 arrivés en cours de saison sont écartés**, dont **Thierry Henry** à la Juventus (18 janvier 1999), **Morfeo** au Milan
  (22 octobre), **Gattuso** à la Salernitana (octobre), **Recoba** à Venezia (janvier), **Pecchia** à la Sampdoria (20 octobre),
  **Fábio Júnior** à la Roma, **Tovalieri** à Ternana, **Giovanni Lopez** à Napoli. 29 hommes partis du club avant le coup d'envoi selon
  l'historique sont écartés, sauf surcharge Wikipédia. Trois hommes sans transfert daté contraire mais au même club dans le relevé
  1997-98 comptent au coup d'envoi (Rampulla à la Juventus, F. Bellucci à Lecce, Cevoli à la Reggiana).
- **Recoupements Wikipédia** (pages italiennes de saison des 38 clubs, lignes « Calciatore in rosa » et leurs notes, **notes nommées
  réutilisées comprises**, appariement des noms à l'orthographe près : « Florjancic » et « Florijančič ») : 37 surcharges, écrites dans
  la `remarque` de chacun avec leur citation. **Arrivés en cours de saison malgré le 1er juillet de Transfermarkt (22)** : Lučić,
  Maini (Bologna), Statuto (Piacenza), Grella (Empoli), Piovanelli (Hellas), Blasi, Esquerdinha, Marruocco (Lecce), Firmani (Reggina),
  Lantignotti (Treviso), Pergolizzi, Silenzi (Ravenna), Lemme, Greco (Monza), Mazzoli, Tiberi, Žabov (Cosenza), Panarelli, Corrado,
  Florjančič (Fidelis Andria), D'Ignazio Pulpito (Lucchese), Puaca (Cremonese). **Au club au coup d'envoi, partis ensuite (15)** :
  Marrocco (Genoa), Morrone et Marcatti (Cosenza), Buonocore (Ravenna), Tangorra (Perugia), Imbriani et Panarelli (Napoli),
  Rambaudi (Lazio), Fiorio (Treviso), Gabrieli (Ravenna), Giansante (Pescara), Coppola (Reggiana), Landi et Vagnati (Andria), Greco
  (Salernitana). Comme l'an passé, une note « ceduto » ne remet au club que l'homme que l'historique fait sortir de ce même club au
  1er juillet.
- **Deux règles nouvelles, écrites ici pour les saisons suivantes.** (1) **Une note « acquistato » d'automne ou d'hiver ne surcharge
  pas un homme qui a joué plus de matchs que sa division n'a de journées** : Marco Zamboni (Lecce, 42 matchs, 3 715 minutes) était
  là toute la saison, la note nommée réutilisée sur sa ligne ne le concerne pas. (2) **Un homme que deux clubs revendiquent après une
  surcharge « ceduto » reste à son ancien club s'il y a joué cette saison** : il y était au coup d'envoi et n'est arrivé au nouveau
  club qu'en cours de saison (Buonocore à Ravenna et non à Venezia, Tangorra à Perugia et non au Genoa, Morrone à Cosenza et non à
  Empoli, Imbriani à Napoli et non au Genoa).
- **Contrôle du parseur** : pour chacun des 38 clubs, la page d'effectif et l'onglet de temps de jeu donnent les mêmes hommes, à une
  exception près : **Jonathan Bachini** (Udinese), absent de la page d'effectif, gardé, naissance reprise du relevé 1997-98.
- **Test de non-régression** : la règle de l'historique, appliquée au coup d'envoi du 31 août 1997, retrouve les arrivées du relevé
  ITA-1997-98 de la Juventus (26 cas comparables sur 26), de Parma (26/26), de l'Inter (27/27) et de la Lazio (21/21), sans un
  désaccord.

## Doutes

- **Six hommes changent de ligne** pour tenir les quatre attaquants : **Paulo Sérgio** (Roma), **Piovani** (Piacenza, comme en
  1997-98) et **Francioso** (Genoa, seize buts), ailiers chez Transfermarkt et rangés « A » par leur rosa Wikipédia ; **Fabris**
  (Ternana) et **Vecchiola** (Genoa), ailiers droits chez Transfermarkt ; et **Leonardo** au Milan, milieu offensif chez Transfermarkt
  et trequartista derrière Bierhoff et Weah, Morfeo, Datti et Iannuzzi étant arrivés après le coup d'envoi.
- **Trois dates de Transfermarkt précises gardées contre une note Wikipédia** : Salvatore Fresi (Salernitana, transfert du
  1er septembre 1998, note « sessione invernale », 2 204 minutes), Andrea Sussi (Reggina, 1er septembre) et Florin Răducioiu (Brescia,
  1er septembre), tous avant le coup d'envoi de leur division. Tudisco (Andria) et D'Aversa (Monza) sont au club depuis 1997 et 1996.
- **Denis Godeas** (Udinese, 33 minutes) : Transfermarkt le prête à Livorno au 1er juillet ; la rosa de l'Udinese le compte sans note
  et il joue pour elle : gardé (même règle que Gregori en 1997-98). Même règle pour Scandroglio (Empoli) et Sciacca (Ravenna).
- **Deux fiches Transfermarkt fantômes** retirées de la liste (naissance impossible, aucune minute) : Salvatore Papa (« 1990 »,
  Juventus) et Tommaso Coletti (« 1984 », Pescara).
- **Les deux Tedesco de la Salernitana** : Giovanni (« G. Tedesco ») et Giacomo (« Giacomo Tedesco »), graphies du jeu.
- 18 retenus sans prénom, tous des noms d'usage sans initiale (Leonardo, Rui Costa, Cafu, Ronaldo, Zé Maria…).
