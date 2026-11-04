# Téléscripteur, lot 2 : la logique d'une action

Lot 1 (v0.83, `commentaires-lot1.md`) : la quantité et les familles manquantes.
Lot 2 : la **cohérence**. Une action racontée en trois temps (mise en place, porteur, conclusion)
ne doit jamais se contredire. Cas signalé par l'auteur le 04/11/2026 : un attaquant qui dribble la
défense et s'apprête à frapper, puis « reprise de volée ».

Livraison en deux versions (choix de l'auteur) :
1. **v2.41** : les voies du jeu ouvert et leur harnais (la cohérence).
2. **version suivante** : les nouvelles phrases, écrites case par case (la quantité).

Autres choix de l'auteur : phrases neutres valables de 1990 à 2010 ; un seul commentaire en
français pour tous les championnats, anglais compris.

---

## 1. Le corpus

**55 lives SoFoot** (pages 1 à 6 de sofoot.com/lives, saison 2026-27 et Mondial 2026 ; les 4 lives
du lot 1 exclus) : **3 855 entrées, 1 098 actions**.

- Récupération : Firecrawl seulement. Une requête directe reçoit un 403 ; un navigateur automatique
  déguisé a été refusé (contournement de protection) et ne doit pas être retenté.
- Les textes bruts et le découpage sont dans `championnat/corpus-lives/` (**hors git**, par
  `.git/info/exclude` : le texte de SoFoot n'est jamais publié). Consigne de découpage :
  `corpus-lives/SCHEMA.md`. Relevé fait par six agents en parallèle ; un groupe de 9 lives a été
  classé par mots-clés seulement (Rennes-OM, Slavia-Lens, PSG-Slovan, Lille-Betis, OM-Paris FC,
  PSG-Monaco, Monaco-OM, Lille-PSG, OL-Fenerbahçe), les autres à la main ou mots-clés corrigés.
- Pièges vus : un scrape peut renvoyer une version en cache (avant-match vide) → `maxAge: 0` ;
  des agents parallèles qui partagent un dossier de travail s'écrasent leurs scripts → un
  sous-dossier par agent.

### Ce que contient un live
| type d'entrée | part |
|---|---|
| action de jeu | 28 % |
| ambiance (tribunes, digression, aparté) | 22 % |
| état du match (qui domine, rythme) | 17 % |
| autre (compos, avant-match) | 13 % |
| changement | 9 % |
| carton, arbitrage, soin, annonce de coup de pied arrêté, cri de but | 11 % |

Registre : 62 % reporter, 38 % chambreur (le jeu garde ~70/30, cf. lot 1).

### Comment finit une action (1 098)
but 187 · arrêt 181 (+ 49 captés) · perdue 121 · à côté 101 · contrée par un défenseur 82 ·
au-dessus 57 · poteau ou barre 48 · faute 33 · corner obtenu 31 · hors-jeu 24 · sauvée sur la ligne 7
· non précisé 177.

**Leçon** : l'action qui MEURT (perdue, contrée, faute) pèse autant que l'arrêt du gardien. Le jeu
n'en raconte presque pas : gisement du lot 2 bis.

### Le geste final
frappe 519 · aucun (l'action meurt avant) 367 · tête 120 · frappe de loin 30 · coup franc direct 24
· penalty 13 · lob 10 · **volée 10 · demi-volée 5**.

### Ce qui précède le geste (dernière étape décrite)
- **volée** : après un centre (3), une profondeur (2), une passe clé (1), un enchaînement direct ;
  **jamais après un dribble**.
- **tête** : après un centre (44), un corner, une remise ; jamais après un dribble.
- **dribble** : → frappe 39, → action perdue 25, → lob 1.
- **avant les 187 buts** : centre 41 (dont 4 en retrait), passe clé 20, frappe directe 19,
  profondeur 14, renvoi 11, dribble 11, remise 9, mêlée 9, penalty 8, une-deux 4, rien de décrit 33.
  Le centre est de loin le premier chemin vers le but (~22 %) ; le jeu en est proche (6 lignes de
  but sur 24 viennent d'un centre).
- **un but ne sort presque jamais de nulle part** : remise, centre, passe décisive ou erreur de
  relance (31 actions naissent d'une erreur adverse) le précèdent.

### Procédés d'écriture (relevés, jamais recopiés)
Le cri en capitales étirées puis la mécanique au calme ; l'annonce d'un coup de pied arrêté puis son
issue à l'entrée suivante ; la fausse alerte corrigée (« et non ») ; la statistique froide qui
ironise ; le commentateur qui « porte la poisse » ; la comparaison décalée pour un raté ; la question
au lecteur pendant un temps mort ; le résumé de mi-temps qui juge le scénario ; la phrase courte entre
deux longues. Transposition : le procédé oui, la référence moderne jamais (1990-2010 neutre).

---

## 2. v2.41 : les voies du jeu ouvert

Avant : cinq cases (coup franc, corner, loin, lob, et « tout le reste »). Le reste mélangeait
dribble, centre, tête, volée, une-deux, face-à-face.

Maintenant la ligne de conclusion **dit sa voie par son vocabulaire** (`VOIES_TIR`, première qui
parle gagne) : `aile` ({A} est le centreur), `rebond`, `centre`, `combi`, `drib`, `face`, sinon
`""` (une frappe nue). `phaseTir` rend la voie, elle voyage sur `g`/`q` dans `ph` comme avant, et
`monteeUn`/`monteeDeux` piochent dans `MONTEE_VOIE[voie]`. Les montées neutres (`MONTEE_BUT`,
`MONTEE_FRAPPE`) ne servent plus qu'à la frappe nue.

Répartition des 63 conclusions de jeu ouvert à la livraison : centre 14, frappe nue 15, dribble 13,
face-à-face 7, une-deux 6, rebond 5, aile 3.

**Garde-fou** : harnais répétitions, section I. Il refuse une conclusion qui parle dribble ET centre,
une montée qui parle la langue d'une autre voie, une montée neutre qui annonce une construction, une
balle arrêtée ou un chiffre dans une montée, un second temps trop lent pour suivre un contre, une
voie qui ne mènerait qu'au but ou qu'à l'échec (la montée trahirait l'issue), et vérifie de bout en
bout sur des matchs simulés.

**Pour écrire une ligne neuve** : on l'écrit dans son pool habituel ; si elle parle de dribble ET
de centre, elle est refusée ; si elle ne parle d'aucune construction, elle est une frappe nue et
doit donc convenir après « Tout converge vers X… ».

---

## 3. Version suivante : la quantité

**Fait en v2.42** : l'action qui meurt (`COMM.meurt`, 17 lignes, ~1 par match), relue et validée
par l'auteur.

**Fait en v2.43** : 22 conclusions pour les voies pauvres (combi 12, rebond 10, face 12, aile 9).

Reste à écrire case par case, dans les deux voix (~70 % reporter, 30 % chambreur) :
- la relance ratée qui finit au fond (erreur adverse, 31 actions dans le corpus) ;
- les annonces en deux temps (corner à suivre, puis son issue) ;
- le résumé de mi-temps qui juge le scénario.
