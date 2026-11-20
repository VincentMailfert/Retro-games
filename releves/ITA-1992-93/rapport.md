# Relevé ITA 1992-93

## Importé

- **Saison** : Serie A et Serie B 1992-93, relevées par la tâche planifiée le 20/11/2026, branche `secours/2026-11-20`.
- **Serie A, dix-huit clubs à sa vraie taille** (décision de l'auteur, v3.00) : Milan, Inter, Parma, Juventus, Lazio, Cagliari,
  Sampdoria, Atalanta, Torino, Roma, Napoli, Foggia, Genoa, Udinese, Brescia, Fiorentina, Ancona, Pescara. Udinese et Brescia
  finissent à trente points : Brescia perd le match d'appui et descend avec la Fiorentina, Ancona et Pescara.
- **Serie B, vingt clubs** : Reggiana, Cremonese, Piacenza, Lecce (promus), Padova, Ascoli, Cosenza, Pisa, Cesena, Bari, Venezia,
  Hellas Verona, Lucchese, Monza, Modena, Fidelis Andria, SPAL, Bologna, Taranto, Ternana. **Aucun écarté, aucun repêché.**
- **Trois clubs nouveaux au relevé** (montés de Serie C1, déjà dans `CLUBS_ITA`) : Fidelis Andria (`AND`, Transfermarkt 4085),
  SPAL (`SPA`, 2722, « SP Ars et Labor ») et Ternana (`TER`, 1103), identifiants lus sur les classements Transfermarkt de la
  saison 1992 et ajoutés à `releves/clubs-tm.json`. Monza (`MZA`, 2919) y était déjà.
- **720 joueurs retenus** (20 × 18 + 18 × 20), sur 1 046 hommes listés par Transfermarkt.
- **Coup d'envoi commun aux deux divisions : le 6 septembre 1992** (Wikipédia italienne, « Serie A 1992-1993 » et « Serie B 1992-1993 »).
- **Pépites** : Francesco Totti (Roma, seize ans) est retenu par le minimum de quatre attaquants ; Alessio Tacchinardi (Atalanta,
  dix-sept ans) est forcé à l'assemblage (`_forcer`). Del Piero (Padova), Vieri (Pisa), Panucci (Genoa) et Cannavaro (Napoli)
  passent seuls.
- **Noms proposés** : « Parme triomphe à Wembley », « Signori roi des buteurs ».

## Vérifié

- `node releves/verifie-releve.cjs releves/ITA-1992-93` : un seul rouge, **« LAZ : minimums G2 D5 M5 A4 non tenus (G2 D8 M7 A3) »**
  (voir les doutes), tout le reste conforme. Quatre alertes : Monza, Fidelis Andria, SPAL et Ternana n'ont pas de saison voisine
  relevée (identité contrôlée par les classements Transfermarkt de 1992).
- **Classements** recopiés de la Wikipédia anglaise (« 1992–93 Serie A », « 1992–93 Serie B »), deux points la victoire : le Milan
  champion avec cinquante points, quatre devant l'Inter ; la Reggiana championne de Serie B. Promus et relégués conformes.
- **Les arrivées.** L'historique de transferts (`ceapi/transferHistory`) n'a pas été accessible à la tâche cette nuit, et les pages
  de joueur de Transfermarkt sont désormais construites en JavaScript. Les arrivées ont donc été datées autrement, **à la source
  Transfermarkt quand même** :
  1. les **listes de transferts été et hiver 92/93 des 38 clubs** (`/transfers/verein/<id>/saison_id/1992/w_s/s|w`) ;
  2. pour les 300 hommes dont « Im Team seit » est vide, postérieure au coup d'envoi ou contredite par un doublon, la **page de
     détail de chaque transfert** cité dans ces listes (`/jumplist/transfers/spieler/<id>/transfer_id/<t>`, 130 pages), qui donne
     la date exacte (« Transferzeitpunkt »). **Piège : la liste « été » de Transfermarkt contient aussi la session d'automne
     italienne** (octobre et novembre) : Desideri (Udinese, 20/11/1992), Campilongo (Venezia, 14/10/1992), Soldà (Monza,
     01/10/1992) y figurent. Seule la date du détail tranche.
  Club au coup d'envoi = destination du dernier transfert daté au plus tard le 6 septembre 1992 ; une arrivée datée pendant la
  saison écarte l'homme (42 en tout). Les autres : « Im Team seit » avant le coup d'envoi, ou présence au même club en 1991-92
  sans transfert daté qui l'en fasse partir.
- **Un passage de la Primavera à l'équipe première n'est pas une arrivée** : Totti (« AS Rom U20 », 01/01/1993) et Tacchinardi
  (« Atalanta U20 », 01/01/1993) sont au club au coup d'envoi.
- **Doublons** (47 hommes listés dans deux clubs) : tous tranchés par les dates. Desideri à l'Inter, Bresciani au Cagliari,
  Sinigaglia au Torino, Nela et Carli à la Roma, Taccola à Pisa, Catanese à Bologna, Pistella à Lucchese, Negri à Ternana…
- **Test de non-régression** : les relevés ITA 1990-91 et 1991-92 sont inchangés (aucun outil modifié).

## Doutes

- **La Lazio n'a que trois attaquants** (Signori, Riedle, Neri), faute d'un quatrième à la source : Nappi est « nicht im Kader »,
  Madonna est à la SPAL selon Transfermarkt (transfert de Piacenza daté du 01/07/1992), et ses milieux offensifs (Doll, Stroppa,
  Gascoigne) sont des milieux (« C ») dans la page Wikipédia italienne de la saison. **Contradiction à signaler** : cette même page
  range Madonna parmi les attaquants de la Lazio cédés à la SPAL à la session d'automne. Sans date sûre, je ne l'ai pas déplacé.
  Toléré comme Pisa en 1991-92.
- **28 retenus restent à `arrivee` 1** : « Im Team seit » vide ou postérieur, aucun transfert daté, et absents du relevé 1991-92.
  Ce sont surtout des jeunes, et quatorze titulaires des promus et de petits clubs de Serie B dont Transfermarkt n'a pas
  l'historique (Brambilla, Saini, Robbiati et Finetti à Monza ; Brescia, Servidei et Lancini à la SPAL ; Gazzani et Canzian à
  Ternana ; Luceri à Fidelis Andria ; Di Francesco à Lucchese ; Piangerelli à Cesena ; Marchioro à Pescara ; Rampulla à la
  Juventus). Ils ont joué la saison au club et ne figurent dans aucune liste de transferts d'hiver : à recouper par l'historique.
- **Marcel Desailly** apparaît au Milan avec 90 minutes : erreur de la page (il est à Marseille, arrivé à Milan le 10/11/1993) ;
  retiré. Panucci, Răducioiu et Alessandro Orlando, listés au Milan, sont à leur club de la saison (Genoa, Brescia, Udinese).
- **Gianluca De Angelis** (Ancona), né en 1981 et « nicht im Kader », retiré de la liste : ligne fausse de la source.
- Prénoms laissés vides : les surnoms brésiliens (Careca, Aldair, Branco, Dunga, Mazinho, Alemão, Casagrande, Júlio César, João
  Paulo) et les noms que Transfermarkt n'abrège pas (Ivo Pulga, Luca Fusi, Edi Bivi, Luca Moz, Ciro Muro), dont la graphie du jeu
  est reprise à l'assemblage.
