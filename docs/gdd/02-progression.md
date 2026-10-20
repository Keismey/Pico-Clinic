# Pico-Clinic — GDD v14 · Progression : méta-progression, boutique, contenu et équilibrage, passage de rang, atelier libre, défi quotidien

> Extrait fidèle du GDD (artefact « GDD – Pico-Clinic, le Micro-Chirurgien de Drones »), découpé le 2026-10-21.

## Méta-progression

### Réputation de l'atelier (5 rangs)

| Rang | Nom | Débloque |
|---|---|---|
| 1 | Établi de garage | Drones jouets simples, tournevis et fer de base |
| 2 | Petit atelier | Insectes cybernétiques, aspirateur renforcé, fer de précision, première mascotte (Pantoufle) |
| 3 | Clinique de quartier | Mascottes mécaniques courantes, loupe thermique, pince fine |
| 4 | Cabinet de précision | Drones pro et de course, laser de soudure, pompe magnétique, pince antistatique |
| 5 | Maître Micro-Chirurgien | Prototypes uniques, scanner, mode Atelier libre |

### Outillage (3 niveaux par outil)

- **Fer à souder** → fer de précision → laser de soudure (chemin plus tolérant, chauffe plus lente).
- **Aspirateur** → aspirateur renforcé → pompe à vide magnétique (récupère aussi les vis et petites pièces).
- **Loupe** → loupe thermique → scanner (affiche tout de suite les pannes).
- **Pince** → pince fine → pince antistatique (aimante légèrement vers les broches).

### Économie

- Monnaie unique : les **crédits**, gagnés par réparation (+ pourboires). Dépensés en outils et en décorations de l'atelier ; les pièces rares ne s'achètent pas, elles se gagnent.
- Aucun achat réel, aucune pub. Le rythme est réglé par le seul gameplay.

### Clients excentriques (6 récurrents + quelques clients de passage)

- Mme Volute, collectionneuse de papillons mécaniques, très bavarde.
- Baptiste « Turbo », pilote de course de drones, pressé.
- Professeur Ampère, inventeur distrait qui apporte des prototypes uniques.
- La petite Léa et sa peluche robot, la commande la plus touchante.
- M. Brindille, livreur de quartier dont les drones tombent sans cesse en panne.
- Dr Quartz, directrice sérieuse d'une grande clinique de robots.
- Chaque client a 5 à 7 commandes d'histoire, révélées au fil des réparations.

### Durée de vie

- ≈ 60 réparations d'histoire (~4 h), puis mode Atelier libre (pannes aléatoires) et défis quotidiens.


## Boutique et collection

### Outils (niveau 2 / niveau 3)

| Outil | Niv. 2 | Niv. 3 | Effet |
|---|---|---|---|
| Fer → fer de précision → laser | 150 | 900 | Chemin plus tolérant, chauffe plus lente |
| Aspirateur → renforcé → pompe magnétique | 150 | 900 | Rayon plus large, ramasse vis et pièces |
| Loupe → thermique → scanner | 200 | 1200 | Révèle plus vite, puis tout d'un coup |
| Pince → fine → antistatique | 120 | 700 | Aimantation plus forte vers les broches |

Chaque amélioration est conditionnée à un rang minimum, pour que le joueur voie l'outil arriver.

### Pièces rares (collection de 12)

- Gagnées avec les 3 étoiles sur des commandes clés ou en cadeau de client ; jamais vendues.
- Exemples : engrenage en laiton d'horloger, puce dorée de Maître Ohm, ressort de montre ancien, lentille de cristal, aile de libellule en fibre.
- Nécessaires à certains prototypes (Ampère, Dr Quartz) et au dernier prototype ; autrement, elles se collectionnent et s'affichent dans le Carnet.

### Décoration de l'atelier (cosmétique)

- 8 éléments de 100 à 1000 crédits : lampe d'établi, plante en pot, poster, drone suspendu, tapis, aquarium mécanique, enseigne lumineuse, horloge à engrenages.
- Ils n'ont aucun effet de jeu, ils donnent seulement une vie à l'atelier et un objectif de dépense tardif.


## Tutoriel : les 10 premières réparations

| \# | Patient | Apprentissage |
|---|---|---|
| 1 | Mini-drone de Léa (jouet) | Dévisser 4 vis, ouvrir, réactiver |
| 2 | Drone jouet rouillé | Aspirateur et vis rouillées |
| 3 | Drone à câble coupé | Première soudure (chemin droit) |
| 4 | Drone de balcon | Remplacer une puce |
| 5 | Drone livreur | Diagnostic à la loupe : 2 pannes cachées |
| 6 | Libellule cybernétique | Soudure courbe, composants fragiles |
| 7 | Scarabée de Mme Volute | Élytres à clips, batterie gonflée |
| 8 | Drone de Turbo | Soudure + puce, objectif temps |
| 9 | Peluche robot de Léa | Cœur-batterie fragile, premier moment émotion |
| 10 | Prototype du Prof. Ampère | Examen de rang 2 : toutes les phases, notation complète |

### Catalogue de pannes

- **Câble coupé** : souder un chemin entre 2 pastilles (1 à 3 chemins, droits puis courbes).
- **Puce grillée** : repérer à la loupe, dessouder, poser la neuve.
- **Rouille** : surfaces à aspirer, certaines cachent une vis ou une pastille.
- **Batterie gonflée** : la retirer sans la percer (geste lent, zone sensible).
- **Engrenage coincé** : retirer un débris puis remettre l'engrenage sur son axe.
- **Circuit oxydé** : nettoyage fin d'une zone dense en composants fragiles.
- **Capteur décalibré** : faire glisser 2 curseurs jusqu'au signal vert (sans soudure).
- **Broche tordue** : redresser la broche d'une petite flèche de doigt.
- **Ressort détendu** : retendre le ressort en tournant le doigt en spirale jusqu'au clic.
- **Piles faibles** : remplacer les piles et aspirer la poussière des panneaux solaires.
- **Connecteur débranché** : panne d'initiation du tutoriel.

### Équilibrage (valeurs de départ, à ajuster en test)

| Paramètre | Rang 1 | Rang 5 |
|---|---|---|
| Pannes par réparation | 1 à 3 | 4 à 6 |
| Tolérance de soudure | généreuse | serrée, compensée par le laser |
| Crédits par réparation (×1,8 environ à chaque rang) | ≈ 40 | ≈ 400 |
| Coût d'un outil niveau 2 / 3 | ≈ 150 à 200 / 700 à 1200 | — |
| Temps cible | 2 min | 4 min |

- Rythme visé : un outil amélioré toutes les 7 à 8 réparations (8 améliorations au total), un rang toutes les 12 réparations.
- Rejouer une commande réussie permet de viser les 3 étoiles, sans rapporter plus de crédits.


## Règles complémentaires (progression)

### Passage de rang

Total possible : 60 réparations × 3 étoiles = 180 étoiles. On compte le meilleur score de chaque commande, donc rejouer permet de progresser.

| Rang | Étoiles cumulées | Commande d'examen |
|---|---|---|
| 2 | 18 | Prototype du Prof. Ampère (réparation 10) |
| 3 | 45 | Collection de papillons de Mme Volute |
| 4 | 70 | Drone de course de Turbo avant sa finale |
| 5 | 96 | Partenariat de Dr Quartz (réparation 46) |

- Quand le seuil est atteint, la commande d'examen apparaît ; la réussir (même avec 1 étoile) débloque le rang.
- Seuils calés sur environ 2 étoiles sur 3 de moyenne (70 %), soit un rang toutes les 12 réparations.
- Si le seuil n'est pas atteint à l'arrivée de l'examen, l'examen reste verrouillé et Gribouille propose de rejouer des commandes précédentes pour gagner des étoiles.

### Atelier libre (rang 5) et défi quotidien (rang 3)

- **Atelier libre :** choisir un rang de difficulté (1 au rang atteint) ; un patient et des pannes tirés au hasard ; gains à 50 % pour éviter l'exploitation ; pas de pièce rare ; les étoiles ne comptent pas pour les rangs.
- **Défi quotidien :** un patient imposé, choisi à partir de la date du jour (même pour tous, sans serveur), avec 1 tentative gratuite et 1 de plus ensuite ; gain double en crédits et un badge ; historique des 7 derniers jours dans le Carnet.
