# ANG 1991-92 — le relevé, et les trois pièges du jour

## Le plateau arrêté
**First Division** : vingt-deux clubs réels pour vingt places. Tous ont au moins
dix-neuf hommes documentés, donc la documentation n'impose rien : s'effacent les **deux
derniers du classement réel**, Notts County (21e) et West Ham (22e), deux des trois
relégués. Luton, vingtième et relégué lui aussi, reste au plateau.

**Division du dessous** : vingt-quatre clubs réels pour vingt places, dix-huit hommes
chacune. **Dix-huit clubs seulement atteignent dix-huit hommes** : il faut donc en garder
deux qui n'y arrivent pas, et le choix se fait par le haut du classement, qui n'est pas
négociable — **Middlesbrough** (2e, promu, dix-sept hommes) et **Blackburn** (6e,
vainqueur des barrages, la future équipe de Dalglish, quinze hommes).
S'effacent alors les **quatre plus mal documentés de la moitié basse** : Southend (12e,
quinze hommes), Barnsley (16e, dix-sept), Oxford (21e, dix-sept) et Plymouth (22e,
dix-sept). **Les quatre écartés ne sont donc pas les quatre derniers** — jurisprudence
Saint-Seurin et précédent de ANG 1990-91 : Brighton (23e, vingt hommes) et Port Vale
(24e, dix-neuf) sont mieux servis par la source que les clubs qui les précèdent.

**Aucun club neuf** : les quarante-six clubs étaient déjà dans `CLUBS_ANG`.

## Piège 1 — les libellés de poste, et un contrôle qui dormait les yeux ouverts
Le relevé rendait 136 hommes **sans poste**, et mon contrôle annonçait pourtant « tous
les libellés sont reconnus » : un libellé INCONNU et une cellule ABSENTE laissaient tous
deux le champ vide, donc le contrôle ne pouvait rien prouver. C'est exactement
l'avertissement de 91/92 côté français (« contrôler les libellés non reconnus avant de
conclure qu'un club est mal documenté »), et il a fallu relever le libellé **tel quel**,
sans le filtrer par la table de traduction, pour voir les deux coupables :
**`Mittelstürmer`** (132 hommes) et **`Hängende Spitze`** (4).
Et la cause était un détail d'encodage : **le « ß » allemand n'est PAS un signe
diacritique**, `NFD` le laisse tel quel, donc « Linksaußen » ne rejoignait jamais
« linksaussen » dans la table. Sans ce correctif, Brian Deane et Alan Cork, entre autres,
sortaient sans poste.

## Piège 2 — les colonnes se repèrent par rapport au poste, jamais par leur rang
« Première cellule `zentriert` numérique » lisait **l'ÂGE** et le prenait pour un nombre
de matchs : Kevin Moran ressortait à « 35 matchs pour 180 minutes ». Le symptôme à
reconnaître est l'absurdité arithmétique. L'ordre réel est : #, image, nom, poste, âge,
drapeau, dans le groupe, matchs, …, PPG, minutes.

## Piège 3 — LE GROS : Transfermarkt ne couvre pas les deux divisions pareil
L'élite est **complète** (42 à 58 matchs relevés par club, toutes compétitions). La
division du dessous va de **DEUX matchs sur quarante-six à Barnsley** à cinquante à
Newcastle, la seule exception. ANG 1995-96 avait noté la lacune (« treize à vingt matchs
sur quarante-six ») ; elle est ici **bien pire**.
Comme elle est uniforme **à l'intérieur** d'un club, le tri aux minutes reste un bon
arbitre du classement interne — c'est le constat de 1995-96 et il tient. Mais elle fausse
entièrement l'arbitrage d'un doublon **ENTRE** deux clubs : « là où il a le plus joué »,
lu sur les minutes brutes, envoie systématiquement l'homme vers le club le mieux couvert.
**Dix-sept arbitrages étaient faux**, et quatre coûtaient Blackburn, qui tombait de
dix-huit hommes à douze. La parade : mesurer la part de temps de jeu **rapportée à la
couverture du club**. Vérifié sur Wikipedia pour les trois cas qui décidaient du club :
**Colin Hendry** (Manchester City jusqu'en 1991, Blackburn de 1991 à 1998), **Gordon
Cowans** (Aston Villa jusqu'en 1991, Blackburn 1991-1993) et **Mike Newell** (Everton
jusqu'en 1991, Blackburn 1991-1996) sont bien des Blackburn de 1991-92.
Deux hommes marginaux vont dans l'autre sens et sont arbitrés **à la main** : **Chris
Price** (Aston Villa en 91-92, Blackburn à partir de 1992) et **Lee Nogan** (Oxford
jusqu'en 1991, Watford de 1991 à 1995).

## Chiffres du relevé
Quarante-six clubs aspirés, **aucun joueur que la source ne sache dater**, **aucun
libellé de poste inconnu** après correctif, **aucun club sous dix hommes** (le plus
pauvre en aligne quinze), soixante-cinq doublons inter-clubs tranchés par identifiant
Transfermarkt sur le plateau final. **755 vrais joueurs disponibles pour 760 places.**
