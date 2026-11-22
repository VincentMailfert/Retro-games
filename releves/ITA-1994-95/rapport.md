# Relevé ITA 1994-95

## Importé

- **Saison** : Serie A et Serie B 1994-95, relevées par la tâche planifiée le 22/11/2026, branche `secours/2026-11-22`.
- **Serie A, dix-huit clubs à sa vraie taille** (décision de l'auteur, v3.00) : Juventus, Parma, Lazio, Milan, Roma, Inter, Napoli,
  Sampdoria, Cagliari, Fiorentina, Torino, Bari, Cremonese, Padova, Genoa, Foggia, Reggiana, Brescia. La Juventus de Lippi championne
  avec soixante-treize points, dix devant Parma et la Lazio. **Première saison à trois points la victoire.** Padova et Genoa finissent à
  quarante points : Padova gagne le barrage aux tirs au but (1-1, 5-4, le 10 juin 1995), Genoa descend avec Foggia, Reggiana et Brescia.
- **Serie B, vingt clubs** : Piacenza, Udinese, Vicenza, Atalanta (promus), Salernitana, Ancona, Perugia, Cesena, Venezia, Hellas
  Verona, Pescara, Palermo, Fidelis Andria, Chievo, Cosenza (neuf points de pénalité), Lucchese, Acireale, Ascoli, Como, Lecce
  (relégués : Acireale, Ascoli, Como, Lecce). **Aucun écarté, aucun repêché.**
- **Deux clubs nouveaux au relevé** (montés de Serie C1, déjà dans `CLUBS_ITA`) : Perugia (`PRG`, Transfermarkt 839, « AC Perugia
  Calcio ») et le Chievo (`CHI`, 862, « Chievo Verona »), identifiants lus sur le classement Transfermarkt de la Serie B 1994 et ajoutés
  à `releves/clubs-tm.json`. Salernitana (380) et Como (1047) y étaient déjà.
- **720 joueurs retenus** (20 × 18 + 18 × 20), sur 1 069 hommes listés par Transfermarkt.
- **Coup d'envoi commun aux deux divisions : le 4 septembre 1994** (Wikipédia italienne, « Serie A 1994-1995 » et « Serie B 1994-1995 »).
- **Pépites** : aucune forcée au relevé. Cristiano Zanetti (Fiorentina, dix-sept ans, 100 minutes), Domenico Morfeo (Atalanta, dix-huit
  ans, 681 minutes) et Gianluca Zambrotta (Como, dix-sept ans, 15 minutes) sont au club au coup d'envoi et non retenus : à forcer à
  l'assemblage.
- **Noms proposés** : « La Vieille Dame se réveille » (premier scudetto de la Juventus depuis 1986), « Trois points pour Lippi ».

## Vérifié

- `node releves/verifie-releve.cjs releves/ITA-1994-95` : **un seul rouge**, « PIA : minimums G2 D5 M5 A4 non tenus (G2 D7 M6 A3) »
  (voir les doutes) ; tout le reste conforme. Quatre alertes : Salernitana, Perugia, le Chievo et Como n'ont pas de saison voisine
  relevée (identité contrôlée par le classement Transfermarkt de 1994 et par les pages Wikipédia italiennes de leur saison).
- **Classements** recopiés de la Wikipédia anglaise (« 1994–95 Serie A », « 1994–95 Serie B »), trois points la victoire : la Juventus
  championne, Piacenza champion de Serie B. Promus, relégués, barrage Padova-Genoa et pénalité de Cosenza conformes.
- **Les arrivées**, par la méthode de 1992-93 (l'historique `ceapi/transferHistory` est toujours refusé à la tâche) :
  1. les **listes de transferts été et hiver 94/95 des 38 clubs** ;
  2. pour les 358 hommes dont « Im Team seit » est vide ou postérieure au coup d'envoi, listés dans deux clubs, ou partis du club dans
     les listes de la saison, la **page de détail de chaque transfert** qui les concerne (241 pages, date « Transferzeitpunkt »).
  Club au coup d'envoi = destination du dernier transfert daté au plus tard le 4 septembre 1994 (deux transferts du même jour lus en
  chaîne) ; une ligne de la liste d'hiver datée du 1er juillet compte comme un mouvement d'hiver ; arrivée datée pendant la saison =
  écarté (81 hommes, dont **Gullit à la Sampdoria**, au Milan au coup d'envoi, **Orlando à la Juventus**, **Muzzi à Cagliari**,
  **Cadete à Brescia**, **Padovano et Simutenkov à la Reggiana**). Un passage de la Primavera à l'équipe première n'est pas une arrivée.
- **Recoupements Wikipédia** (pages italiennes de saison de 38 clubs, « Calciatore in rosa » et leurs notes) : quand elles contredisent
  la date de Transfermarkt, elles tranchent, comme en 1993-94. **Arrivés en cours de saison** : Rui Águas (« acquistato a novembre
  dall'Estrela Amadora ») et Mozzini (« a novembre dal Carpi ») à la Reggiana, Minaudo à Piacenza (« sessione autunnale »), Marcão au
  Torino, Zironelli et Valtolina au Chievo (« sessione invernale »). **Au club au coup d'envoi, partis ensuite** : Dionigi à la Reggiana
  (« ceduto a novembre al Como »), Sartor à la Juventus (« ceduto durante la sessione autunnale », donc écarté de Vicenza), Luiso au
  Torino (« ceduto a stagione in corso », donc écarté de Pescara). Orlando et Di Canio, échangés entre le Milan et la Juventus le
  16 septembre selon Transfermarkt : la page de la Juventus confirme la session d'automne.
- **Test de non-régression** : les pages Transfermarkt 1993 du Milan et de Lecce, lues par le parseur de cette nuit, contiennent les
  vingt retenus livrés en 1993-94 de chacun, aucun marqué « nicht im Kader ».

## Doutes

- **Piacenza n'a que trois attaquants** au coup d'envoi (Inzaghi, De Vitis et l'ailier Piovani, passé en attaque) : la page Wikipédia
  italienne de la saison n'en liste pas d'autre. Giuseppe Ferazzoli, à Piacenza au coup d'envoi selon les dates de Transfermarkt, prêté à Avellino le
  1er octobre puis cédé à Pescara en janvier, n'apparaît ni sur la page d'effectif Transfermarkt de Piacenza ni dans la liste Wikipédia :
  il n'est pas ajouté. Toléré comme Cesena, Andria et Cosenza
  en 1993-94.
- **Quatorze ailiers passent en attaque** là où il manquait un quatrième avant-centre : Lentini (Milan), Lombardo (Sampdoria), Robbiati
  (Fiorentina), Bernardi (Torino), Perrone (Padova), Mandelli et Bresciani (Foggia), Piovani (Piacenza), Simonetta et Rastelli
  (Lucchese), Lucidi, Caramel et Vasari (Acireale), Binotto (Ascoli).
- **17 retenus restent à `arrivee` 1** (aucun transfert daté, absents du relevé 1993-94 ou au club de C1) : Grabbi (Juventus), Magnani
  (Parma), Sala (Sampdoria), Ventola (Bari), Masi (Reggiana), Fresi, Grimaudo et Breda (Salernitana), Pandolfi (Ancona), Falanga
  (Andria), D'Angelo (Chievo), Palmieri (Lucchese), et cinq hommes de Como (Giacomo Gattuso, Manzo, Catelli, Boscolo, Ferrigno).
- **Trois lignes fausses de la source retirées** : Simone Masini (Reggiana, « né en 1984 », marqué « nicht im Kader »), « N. N. Vinzioli »
  (Vicenza, dix-neuf minutes, ni prénom ni naissance) et Scuderi (Acireale, gardien sans naissance ni minute).
- **Matjaž Florjančič** (Cremonese, 2 176 minutes) manque à la liste Wikipédia italienne de la saison du club ; Transfermarkt le donne au
  club depuis 1993, il est gardé.
- Prénoms laissés vides : les surnoms et noms que Transfermarkt n'abrège pas (Aldair, Caçapa, Futre, Rui Costa, Abédi Pelé, Luís
  Oliveira, Wim Jonk, Luca Fusi, Luca Lomi), dont la graphie du jeu est reprise à l'assemblage.
