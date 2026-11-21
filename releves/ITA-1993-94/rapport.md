# Relevé ITA 1993-94

## Importé

- **Saison** : Serie A et Serie B 1993-94, relevées par la tâche planifiée le 21/11/2026, branche `secours/2026-11-21`.
- **Serie A, dix-huit clubs à sa vraie taille** (décision de l'auteur, v3.00) : Milan, Juventus, Lazio, Sampdoria, Parma, Napoli,
  Roma, Torino, Foggia, Cremonese, Genoa, Cagliari, Inter, Reggiana, Piacenza, Udinese, Atalanta, Lecce. Le Milan champion avec
  cinquante points (trente-six buts marqués, quinze encaissés), trois devant la Juventus ; Piacenza, Udinese, Atalanta et Lecce
  relégués. **Dernière saison à deux points la victoire.**
- **Serie B, vingt clubs** : Fiorentina, Bari, Brescia, Padova (promus ; Padova après le barrage gagné contre Cesena, tous deux à
  quarante-trois points), Cesena, Venezia, Ascoli, Ancona, Fidelis Andria, Lucchese, Vicenza, Hellas Verona, Cosenza, Palermo,
  Pescara (trois points de pénalité), Acireale, Pisa, Ravenna, Modena, Monza. Acireale, Pisa et Pescara finissent à trente-cinq
  points : Pisa perd le barrage de maintien contre Acireale à Salerne et descend avec Ravenna, Modena et Monza (Pisa est ensuite
  dissous par la fédération). **Aucun écarté, aucun repêché.**
- **Trois clubs nouveaux au relevé** (montés de Serie C1, déjà dans `CLUBS_ITA`) : Vicenza (`VIC`, Transfermarkt 2655), Acireale
  (`ACR`, 4337, « ASD Acireale Calcio ») et Ravenna (`RAV`, 1105, « US Ravenna »), identifiants lus sur le classement Transfermarkt
  de la Serie B 1993 et ajoutés à `releves/clubs-tm.json`. Palermo (`PAL`, 458) y était déjà.
- **720 joueurs retenus** (20 × 18 + 18 × 20), sur 1 068 hommes listés par Transfermarkt.
- **Coup d'envoi commun aux deux divisions : le 29 août 1993** (Wikipédia italienne, « Serie A 1993-1994 » et « Serie B 1993-1994 »).
- **Pépites** : aucune forcée au relevé. Alessandro Nesta (Lazio, dix-sept ans, seize minutes) et Cristiano Zanetti (Fiorentina,
  seize ans) sont présents au coup d'envoi et non retenus : à forcer à l'assemblage si leur note le justifie.
- **Noms proposés** : « La leçon d'Athènes » (le Milan bat le Barcelone de Cruyff 4-0 en finale de la Ligue des champions),
  « Capello verrouille Athènes ».

## Vérifié

- `node releves/verifie-releve.cjs releves/ITA-1993-94` : **trois rouges, tous des minimums d'attaquants** : « CES : G2 D6 M7 A3 »,
  « AND : G2 D7 M6 A3 », « COS : G2 D7 M6 A3 » (voir les doutes) ; tout le reste conforme. Trois alertes : Vicenza, Acireale et
  Ravenna n'ont pas de saison voisine relevée (identité contrôlée par le classement Transfermarkt de 1993).
- **Classements** recopiés de la Wikipédia anglaise (« 1993–94 Serie A », « 1993–94 Serie B »), deux points la victoire : le Milan
  champion, la Fiorentina championne de Serie B. Promus et relégués conformes, barrages compris.
- **Les arrivées**, par la méthode de 1992-93 (l'historique `ceapi/transferHistory` est toujours refusé à la tâche) :
  1. les **listes de transferts été et hiver 93/94 des 38 clubs** (`/transfers/verein/<id>/saison_id/1993/w_s/s|w`) ;
  2. pour les 312 hommes dont « Im Team seit » est vide, postérieure au coup d'envoi, contredite par un doublon ou par un départ
     listé, la **page de détail de chaque transfert** qui les concerne (165 pages, date « Transferzeitpunkt »).
  Club au coup d'envoi = destination du dernier transfert daté au plus tard le 29 août 1993 ; arrivée datée pendant la saison =
  écarté (44 hommes). Deux règles nouvelles : (a) **deux transferts du même jour se lisent en chaîne** (Ambrosio, « Atalanta U20 →
  Atalanta » puis « Atalanta → Pisa » le 1er juillet : il est à Pisa, ce que confirme la page Wikipédia de la saison du club) ;
  (b) **une ligne de la liste d'HIVER datée du 1er juillet** porte la date par défaut de Transfermarkt : le mouvement s'est fait à
  l'hiver (Altomare, Napoli au coup d'envoi, Lucchese ensuite).
- **Un passage de la Primavera à l'équipe première n'est pas une arrivée** : Colacone (Parma, « Parma U20 », 01/01/1994) et
  Morfeo (Atalanta, « Atalanta U20 », 01/12/1993) sont au club au coup d'envoi.
- **Recoupements Wikipédia** (pages italiennes de saison des clubs, « Calciatore in rosa ») : Pizzi « acquistato dal Parma a
  novembre » et Helveg « acquistato dall'Odense a novembre » (Udinese) alors que Transfermarkt date leur transfert du 1er juillet :
  Pizzi est rangé à Parma, Helveg écarté de l'Udinese. Flamigni « ceduto nel calciomercato autunnale » par Brescia : au Brescia au
  coup d'envoi. Rôles repris de ces pages là où il manquait un homme à un poste : Brolin milieu (Parma), Pittana (Udinese),
  L. Rodríguez (Atalanta), Ambrosetti (Brescia) et Pupita (Cesena) attaquants, Baldini défenseur (Pisa).
- **Aucun doublon retenu deux fois** : tous les hommes listés dans deux clubs sont tranchés par les dates (Sensini à l'Udinese,
  Bigliardi et Tresoldi à l'Atalanta, Festa au Cagliari, Carnevale à l'Udinese, Desailly à Marseille…).
- **Test de non-régression** : les pages Transfermarkt 1992 du Milan et de Lecce, lues par le parseur de cette nuit, contiennent
  les vingt et dix-huit retenus livrés en 1992-93, aucun marqué « nicht im Kader ».

## Doutes

- **Cesena, Fidelis Andria et Cosenza n'ont que trois attaquants** au coup d'envoi, ailiers compris : Zagati (Cesena) arrive en
  décembre, Ianuale et Romairone sont déjà comptés à Andria, Caramel et Fabris à Cosenza. Recherches faites : hommes « nicht
  eingesetzt », arrivées non datées, pages Wikipédia italiennes de saison (Cesena : Pupita passé en A ; Andria : un seul « A »
  listé ; Cosenza : un « Giuseppe Compagno » attaquant que Transfermarkt ne connaît pas au club, et que je n'ai pas ajouté).
  Tolérés comme la Lazio en 1992-93.
- **Les dates par défaut du 1er juillet 1993.** Plusieurs hommes ont joué beaucoup pour un club que leur page de transfert dit
  quitté le 1er juillet : Valtolina (Monza, 2 023 minutes, vers Bologna), Marchegiani (Pescara, 1 080, à Lecce), Fiorentini
  (Pisa, 1 075, vers Perugia), Signorelli (Cosenza, 892, à l'Hellas), Dondo (Pisa, 124). La règle de 1992-93 (la date tranche) les
  a écartés, sauf là où une seconde source dit autre chose (Pizzi, Helveg). Fiorentini et Dondo figurent dans la rose Wikipédia
  de Pisa : à revoir le jour où l'historique de transferts répond. Fiorin (Palermo, 2 700 minutes) et Corrado (Genoa) portent
  un transfert du 1er juin 1994 : arrivés pendant la saison selon la date, écartés.
- **Pisa** n'a que dix-neuf hommes utilisables (Antonioli, Muzzi, Farris arrivés en octobre et novembre, Flamigni en décembre).
- **22 retenus restent à `arrivee` 1** (aucun transfert daté, absents du relevé 1992-93), surtout chez les trois promus de C1 :
  Sotgia, Francioso, Buonocore, Cardarelli et Tacchi (Ravenna), Migliaccio, Di Dio, Rispoli et Vaccaro (Acireale), Sterchele
  (Vicenza), et Pellizzaro (Padova), Russo (Lecce), Vinti et Assennato (Palermo).
- **Andrea Bariglione** (Sampdoria), listé au temps de jeu sans minute et absent de la page d'effectif, n'a aucune date de
  naissance : ligne retirée.
- Prénoms laissés vides : les surnoms brésiliens (Júlio César, Aldair, Alemão, Caçapa, Gaúcho, João Paulo) et les noms que
  Transfermarkt n'abrège pas (Luca Fusi, Ivo Pulga, Edi Bivi, Bryan Roy, Luís Oliveira, Wim Jonk), dont la graphie du jeu est
  reprise à l'assemblage.
