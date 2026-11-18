# Relevé ITA 1990-91

## Importé

- **Saison** : ITA 1990-91, relevé brut fait le 15/11/2026 (branche `secours/2026-11-15`), mis au format de phase 1
  le 18/11/2026 sur `secours/2026-11-18`, une fois tranchée la taille de la Serie A (décision de l'auteur, v3.00).
- **Plateau** : la Serie A à sa vraie taille, **dix-huit clubs**, et la Serie B entière, **vingt clubs**, dans l'ordre
  du classement réel. Aucun écarté, aucun repêché. Sampdoria championne (51 points, deux points la victoire),
  Milan et Inter à 46 ; Lecce, Pisa, Cesena et Bologna descendent ; Foggia, Hellas Verona, Cremonese et Ascoli montent.
  Udinese porte cinq points de pénalité (corruption).
- **Monza, Licata et Como**, relevés le 15/11 quand on croyait devoir repêcher, restent dans `brut.json` : ils ne
  servent plus qu'à arbitrer les doublons (un homme listé à Monza et dans un club du plateau).
- **Joueurs** : 720 retenus (20 par club de Serie A, 18 par club de Serie B), triés aux minutes toutes compétitions,
  puis minimums de poste réparés. Vingt et un ailiers (Linksaußen, Rechtsaußen, Winger) passent en attaque là où
  l'effectif n'a pas quatre avant-centres : l'Italie de 1990 joue à deux pointes. **Aucune pépite forcée** :
  l'historique de transferts de Transfermarkt était injoignable cette nuit, et la consigne interdit d'en ajouter
  une sans vérification.
- **Doublons** : quarante et un hommes listés dans deux clubs, rangés au club de leur dernière arrivée datée avant le
  coup d'envoi du 9 septembre 1990 (Serie A et Serie B commencent le même jour), sinon là où ils ont le plus joué hors
  arrivées en cours de saison. Le détail est dans la `remarque` de chacun.
- **Noms proposés** : « Le scudetto de Boskov », « Vialli et Mancini, enfin », « Marassi en bleu cerclé ».

## Vérifié

- `node releves/verifie-releve.cjs releves/ITA-1990-91` : vert sur tout, sauf **six clubs à moins de quatre
  attaquants** (voir Doutes) et l'alerte attendue « aucune saison voisine connue » (première saison italienne).
- Le champion, les relégués et les promus correspondent à la Wikipédia anglaise (« 1990–91 Serie A »,
  « 1990–91 Serie B ») ; sommes des victoires et des défaites, des buts pour et contre, égales dans les deux divisions ;
  points recalculés à deux points la victoire.
- Coup d'envoi des deux divisions le 9 septembre 1990 (Wikipédia italienne, « Serie B 1990-1991 »).
- Test de non-régression du vérificateur : il donne exactement les mêmes défauts qu'avant sur les quinze relevés anglais.

## Doutes

- **Les arrivées ne sont pas recoupées.** Transfermarkt (`.de`, `.com`, `.co.uk`) était injoignable cette nuit, y
  compris `ceapi/transferHistory`. `arrivee` se lit donc sur « Im Team seit » seul : 2 avant le coup d'envoi, 0 pendant
  la saison (écarté), 1 après la saison (68 retenus, gardés avec leur remarque comme en ANG 2007-08), `null` quand la
  colonne est vide (119 retenus). Une arrivée de l'hiver cachée par une date postérieure n'est pas exclue.
- **Six clubs à moins de quatre attaquants**, la source n'ayant personne de plus à ce poste parmi les hommes présents :
  Bologna, Foggia (le trident de Zeman, Rambaudi, Baiano, Signori), Cremonese et Taranto à trois, Brescia et Barletta
  à deux. Toléré par le jeu (cas d'Arsenal et Portsmouth en ANG 2009-10).
- **Ravanelli est rangé à Avellino** (199 minutes, arrivé en 1989) et non à la Reggiana (2 875 minutes, date vide) :
  c'est le club du coup d'envoi selon les dates de Transfermarkt. À recouper le jour où l'historique répond.
- **Angelo Calisti** (Hellas) : Transfermarkt le fait naître en 1948, quarante-deux ans, zéro minute ; ligne retirée.
- **Deux A. Orlando à l'Udinese** : Angelo (2 871 minutes) garde l'initiale, Alessandro (2 277) passe en toutes lettres.
- Cinq noms courts que Transfermarkt n'abrège pas, abrégés à la main : L. Fusi, I. Pulga, C. Muro, L. Moz, E. Bivi.
  Les surnoms brésiliens (Toninho Cerezo, Júlio César, Gerson Caçapa, João Paulo, Careca, Alemão…) restent tels quels.
