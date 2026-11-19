# Relevé ITA 1991-92

## Importé

- **Saison** : ITA 1991-92, relevée et assemblée le 19/11/2026 par la tâche planifiée, sur `secours/2026-11-19`.
- **Plateau** : la Serie A à sa vraie taille, **dix-huit clubs**, et la Serie B entière, **vingt clubs**, dans l'ordre
  du classement réel. Aucun écarté, aucun repêché. Le Milan de Capello champion **sans une défaite** (22 victoires,
  12 nuls, 56 points, deux points la victoire), huit devant la Juventus ; Bari, Hellas Verona, Cremonese et Ascoli
  descendent ; Brescia, Pescara, Ancona et Udinese montent. En bas, quatre clubs finissent à 35 points : la
  classifica avulsa sauve Venezia et condamne Palermo, Taranto bat Casertana au match d'appui (2-1 après
  prolongation, le 20 juin 1992). Messina et Avellino descendent aussi.
- **Clubs neufs pour le relevé** (tous déjà dans `CLUBS_ITA`) : Piacenza (verein 1408), Venezia (607), Casertana (4106) et
  Palermo (458), identifiants lus sur la page Serie B 1991-92 de Transfermarkt et notés dans `releves/clubs-tm.json`.
- **Joueurs** : 720 retenus (20 par club de Serie A, 18 par club de Serie B), triés aux minutes toutes compétitions,
  puis minimums de poste réparés. Vingt et un ailiers (ou milieux de couloir) passent en attaque là où l'effectif
  n'avait pas quatre avant-centres, dont **Renato Buso** (Sampdoria), attaquant selon la page Wikipédia de la saison.
- **Arrivées recoupées** : cette nuit, l'historique de transferts de Transfermarkt répondait. 314 hommes dont la colonne
  « Im Team seit » était vide, postérieure au coup d'envoi ou contredite par un doublon ont été recoupés un par un :
  129 confirmés au club, 120 formés au club sans mouvement antérieur, **32 arrivés en cours de saison écartés**,
  27 qui étaient ailleurs au coup d'envoi écartés. Il reste **quatre retenus à `arrivee` 1** (Sconziano, D'Amblè,
  Centurioni, Torino, tous à 30 minutes ou moins), gardés avec leur remarque.
- **Doublons** : seize hommes listés dans deux clubs, rangés au club où l'historique les place au coup d'envoi
  (Antonio Conte à Lecce et non à la Juventus, où il arrive en novembre ; Maniero à Padova…).
- **Effectifs complétés** : la Sampdoria et Parma n'ont que dix-neuf hommes utilisables chez Transfermarkt.
  **Sergio Porcù** (gardien, Sampdoria : relevé en 1990-91, historique « Sampdoria → fin de carrière » en juillet 1992)
  et **Mario Lemme** (Parma : cité dans l'effectif de la page Wikipédia « 1991–92 Parma AC season », arrivé de Vastese
  le 1er juillet 1991, parti à Vicenza en novembre 1992) les complètent, poste et naissance pris sur leur fiche
  Transfermarkt, minutes inconnues (`null`). **Sebastiano Siviglia**, autre absent de la page de Parma, est relevé
  aussi mais non retenu.
- **Pépite forcée** : **Fabio Cannavaro** (Napoli, dix-huit ans, zéro minute), au centre de formation du club ;
  Transfermarkt ne date que sa montée chez les pros (juillet 1992). Il prend la place de Gaetano De Rosa (zéro minute,
  arrivée non recoupée). Del Piero (Padova), Inzaghi (Piacenza), Vieri (Torino) et Panucci (Genoa) passent seuls.
- **Noms proposés** : « Le Milan des invaincus », « Capello sans une défaite », « Trente-quatre sans perdre ».

## Vérifié

- `node releves/verifie-releve.cjs releves/ITA-1991-92` : vert sur tout, sauf **Pisa à trois attaquants** (voir Doutes),
  et l'alerte attendue « aucune saison voisine connue » pour les quatre clubs qui n'étaient pas au plateau de 1990-91.
- Le champion, les relégués et les promus correspondent à la Wikipédia anglaise (« 1991–92 Serie A », « 1991–92 Serie B ») ;
  sommes des victoires et des défaites (195 et 215), des buts pour et contre (695 et 740), égales dans les deux divisions ;
  points recalculés à deux points la victoire.
- Coup d'envoi des deux divisions le 1er septembre 1991 (Wikipédia italienne, « Serie A 1991-1992 » et « Serie B 1991-1992 »).
- Test de non-régression des filtres : la Sampdoria et le Milan, relevés par les mêmes outils, retrouvent les hommes que
  le jeu leur donnait en 1990-91 (Pagliuca, Vierchowod, Mancini, Vialli ; Baresi, Maldini, Van Basten, Gullit), et
  519 des 720 hommes du plateau sont des hommes de 1990-91 qui prennent un an exactement.

## Doutes

- **Pisa n'a que trois attaquants** (Ferrante, Scarafoni, Martini, ailier passé en A) : la source n'en a pas d'autre, et
  aucun milieu de l'effectif n'est un milieu offensif. Toléré comme les six clubs de 1990-91.
- **Michele Zanutta** : la page Wikipédia de la Sampdoria le cite, Transfermarkt le met à la Reggiana (3 463 minutes) et
  met Giorgio Zanutta à la Sampdoria (11 minutes). Transfermarkt suivi.
- **Angelo Pagotto** (Napoli) écarté : son historique le fait entrer au centre de formation du Napoli à l'été 1992.
- **Diego Ficarra**, listé à Parma sans jamais y avoir joué, était à la Triestina selon son historique : écarté.
- Prénoms laissés vides : les mononymes et surnoms brésiliens (Careca, Alemão, Aldair, Dunga, Mazinho, Branco,
  Amarildo, Júlio César, Casagrande, Toninho Cerezo, Paulo Silas, Careca Bianchesi).
