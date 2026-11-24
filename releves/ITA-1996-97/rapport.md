# Relevé ITA 1996-97

## Importé

- **Saison** : Serie A et Serie B 1996-97, relevées par la tâche planifiée le 24/11/2026, branche `secours/2026-11-24`.
- **Serie A, dix-huit clubs à sa vraie taille** (décision de l'auteur, v3.00) : Juventus, Parma, Inter, Lazio, Udinese, Sampdoria,
  Bologna, Vicenza, Fiorentina, Atalanta, Milan, Roma, Napoli, Piacenza, Cagliari, Perugia, Hellas Verona, Reggiana. La Juventus de
  Lippi championne avec soixante-cinq points, deux devant Parma. Cagliari (battu par Piacenza au barrage), Perugia, Hellas Verona et
  Reggiana descendent.
- **Serie B, vingt clubs** : Brescia, Empoli, Lecce, Bari (promus), Genoa, Pescara, Chievo, Ravenna, Torino, Reggina, Foggia, Padova,
  Venezia, Lucchese, Salernitana, Castel di Sangro, Cosenza, Cesena, Palermo, Cremonese (relégués : Cosenza, Cesena, Palermo, Cremonese).
  **Aucun écarté, aucun repêché.** **Ravenna perd trois points de pénalité** (52 points au lieu de 55, `penalite` 3).
- **Deux clubs nouveaux dans `releves/clubs-tm.json`** : Castel di Sangro (`CDS`, Transfermarkt 3512, « ASD Castel di Sangro ») et
  Empoli (`EMP`, 749, « FC Empoli »), montés de C1, déjà dans `CLUBS_ITA`, identifiants lus sur le classement Transfermarkt de la
  Serie B 1996. Lecce (1005) et Ravenna (1105) y étaient.
- **720 joueurs retenus** (20 × 18 + 18 × 20), sur 1 181 hommes listés par Transfermarkt.
- **Coup d'envoi commun aux deux divisions : le 8 septembre 1996** (Wikipédia italienne, « Serie A 1996-1997 » et « Serie B 1996-1997 »).
- **Pépites** : aucune forcée au relevé.
- **Noms proposés** : « Del Piero à Tokyo » (la Juventus gagne la Coupe intercontinentale le 26 novembre 1996 à Tokyo, un but de Del
  Piero contre River Plate), « Le Super Pippo de Bergame » (Filippo Inzaghi meilleur buteur avec l'Atalanta).

## Vérifié

- `node releves/verifie-releve.cjs releves/ITA-1996-97` : **un seul rouge, expliqué** : le contrôle d'identité du Lecce (un retenu en
  commun avec 1994-95, la dernière saison du Lecce dans le jeu : le club est descendu en C1 en 1995, puis remonté deux fois de suite
  avec un effectif refait). **L'identité est contrôlée par Wikipédia** : les dix-huit retenus du Lecce sont dans la « rosa » de la page
  italienne « Unione Sportiva Lecce 1996-1997 » (qui dit l'effectif « pressoché uguale a quella dell'annata precedente », celle de C1).
  Trois alertes : Empoli, Ravenna et Castel di Sangro n'ont pas de saison voisine relevée.
- **Classements** recopiés de la Wikipédia anglaise (« 1996–97 Serie A », « 1996–97 Serie B ») : Juventus championne, Brescia champion
  de Serie B, promus, relégués et barrage Piacenza-Cagliari conformes. Contrôles du vérificateur : points, matchs, victoires et
  défaites, buts.
- **Les arrivées**, par la méthode de 1992-93 (l'historique `ceapi/transferHistory` n'a pas pu être appelé : l'environnement de la
  tâche a refusé la commande) :
  1. les **listes de transferts été et hiver 96/97 des 38 clubs**, arrivées et départs séparés ;
  2. pour les 600 hommes dont « Im Team seit » est vide ou postérieure au coup d'envoi, listés dans deux clubs, ou partis du club (ou
     arrivés ailleurs) dans les listes de la saison, la **page de détail de chaque transfert** (464 pages, date « Transferzeitpunkt »).
  Club au coup d'envoi = destination du dernier transfert daté au plus tard le 8 septembre 1996 ; sinon, club de départ du premier
  transfert daté après ; une ligne de la liste d'hiver datée du 1er juillet compte comme un mouvement d'hiver. 92 hommes arrivés en
  cours de saison sont écartés, dont **Dimas à la Juventus**, **Stanić et Pedros à Parma**, **Candela à la Roma**, **Kanchelskis à la
  Fiorentina**, **Blomqvist au Milan**, **Gattuso et Materazzi à Perugia**, **Mangone et Brambilla à Bologna**.
  **Nouveau** : un homme sans transfert daté et sans « Im Team seit » antérieure au coup d'envoi, mais **présent au même club dans le
  relevé ITA-1995-96**, est compté au club au coup d'envoi (66 hommes, écrit dans leur `remarque`) ; 16 retenus restent à `arrivee` 1.
- **Recoupements Wikipédia** (pages italiennes de saison des 38 clubs, lignes « Calciatore in rosa » et leurs notes, **notes nommées
  réutilisées comprises**, `<ref name=…/>`) : quand elles contredisent la date par défaut du 1er juillet de Transfermarkt, elles tranchent.
  **Arrivés en cours de saison** : Ferrante et Rocco au Torino (« Acquistato a stagione in corso » ; Rocco reste donc à Perugia au coup
  d'envoi), Delli Carri à Piacenza (Genoa « fino a settembre »), Longhi à la Reggiana, Biato à la Lucchese, Castellazzi et Fig à Padova,
  Brioschi à Padova (« ceduto nella sessione autunnale » par Piacenza), Locatelli à l'Udinese, Tovalieri à Cagliari, Giunta à l'Hellas.
  **Au club au coup d'envoi, partis ensuite** : Locatelli au Milan, Biato et Foglia au Torino, Delli Carri à Genoa, Pedone et Tovalieri à
  la Reggiana (Transfermarkt met Pedone à la Reggina : confusion probable des deux clubs), Pioli, Ciocci et Giunta à Padova, Marin à la
  Reggina, Pisciotta à Palermo. Chaque surcharge est écrite dans la `remarque` du joueur (« SURCHARGE Wikipédia… »), avec sa citation.
- **Contrôle du parseur** : pour chacun des 38 clubs, la page d'effectif et l'onglet de temps de jeu donnent les mêmes hommes, à une
  exception près : **Jonathan Bachini** (Lecce, 24 matchs, 1 088 minutes), présent dans l'onglet de temps de jeu mais pas sur la page
  d'effectif. Il est gardé : naissance lue sur sa fiche de joueur Transfermarkt (5 juin 1975), et la page du Lecce le dit prêté par
  l'Udinese et aligné en Coppa Italia contre Genoa avant le coup d'envoi.
- **Test de non-régression** : les filtres reprennent la méthode écrite de 1995-96 (marqueur « nicht im Kader » écarté, « nicht
  eingesetzt » gardé, 40 hommes écartés pour « nicht im Kader »).

## Doutes

- **Huit hommes passent en attaque** : Zanini (Sampdoria), Kolyvanov et Nervo (Bologna), Gautieri (Perugia), Francioso (Lecce), Rastelli
  (Lucchese), Ricchetti (Salernitana) et Vasari (Palermo), ailiers chez Transfermarkt ou rangés « A » par la rosa Wikipédia.
- **16 retenus restent à `arrivee` 1** (aucun transfert daté, absents du relevé 1995-96 au même club ou jeunes de la Primavera) : Pinton
  (Parma), Federici (Lazio), Vaira (Bologna), Iannuzzi (Vicenza), Zerbini (Piacenza), Dossi (Brescia), Balli et Gazzoli (Empoli), Bellucci
  (Lecce), Buonocore (Ravenna), Mordenti (Torino), Tortora (Reggina), Sorrentino (Lucchese), Bonomi (Castel di Sangro), Chiaretti (Cesena),
  Manfredi (Cremonese).
- **Da Rold** (Lucchese, 2 832 minutes) : Transfermarkt le fait arriver de l'Hellas le 1er septembre 1996, la page de la Lucchese dit
  « Acquistato nel calciomercato autunnale-invernale » ; la date de Transfermarkt n'est pas celle du 1er juillet et son temps de jeu
  (huit matchs manqués sur trente-huit au plus) va avec elle : gardé au club au coup d'envoi.
- **Ricci** (Padova), **Grossi** (Reggiana), **Logarzo** (Cosenza) : quelques minutes à Bari, à la Roma et à la Salernitana, transfert
  daté du 1er juillet, aucune note Wikipédia : laissés au club d'arrivée.
- **Castel di Sangro** : Filippo Biondi et Danilo Di Vincenzo, « deceduti a stagione in corso » (accident de la route de décembre 1996),
  étaient au club au coup d'envoi ; Di Vincenzo est retenu par son temps de jeu.
- Prénoms laissés vides : les noms que Transfermarkt n'abrège pas (Dimas, Müller, Aldair…), dont la graphie du jeu est reprise à
  l'assemblage.
