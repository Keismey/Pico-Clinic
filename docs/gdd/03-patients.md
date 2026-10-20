# Pico-Clinic — GDD v14 · Patients : catalogue des patients, tutoriel guidé, les 60 réparations

> Extrait fidèle du GDD (artefact « GDD – Pico-Clinic, le Micro-Chirurgien de Drones »), découpé le 2026-10-21.

## Catalogue des patients

15 modèles standards + 5 prototypes d'Ampère = 20 modèles. Les 60 réparations sont des combinaisons modèle + pannes, avec davantage de pannes aux rangs élevés. Le rang mini est celui à partir duquel un modèle sort dans les commandes aléatoires et l'Atelier libre ; les commandes d'histoire peuvent l'introduire plus tôt. S'ajoute le dernier prototype de Maître Ohm (réparation 60). Les commandes spéciales (prototype sans plan, prototype de la clinique, drone-échantillon) reprennent un modèle existant avec un habillage unique.

| Famille | Modèle | Rang mini | Particularité |
|---|---|---|---|
| Drones | Mini-drone jouet | 1 | 4 vis, grand circuit, pannes simples |
| | Drone de balcon | 1 | Emplacement de puce, câbles longs |
| | Drone livreur | 1 | Pannes cachées (diagnostic) |
| | Drone de course | 4 | Circuit dense, objectifs de temps serrés |
| | Drone photo pro | 4 | Composants fragiles, capteur à calibrer |
| Insectes | Libellule | 2 | Ailes fines, soudures courbes |
| | Scarabée | 2 | Élytres à clips, batterie gonflée |
| | Luciole-lanterne | 3 | Circuit lumineux fragile |
| | Abeille pollinisatrice | 3 | Engrenages et capteur |
| | Mante religieuse | 4 | Articulations complexes, broches |
| Mascottes | Peluche robot (Pantoufle) | 2 | Cœur-batterie fragile, histoire de Léa |
| | Lapin à ressort | 3 | Ressort à remettre en tension |
| | Chat à clé | 3 | Mécanisme à clé, engrenage coincé |
| | Ours à musique | 4 | Boîte à musique, circuit oxydé |
| | Hérisson solaire | 4 | Panneaux et piles, rouille |
| Prototypes | Méduse volante, oiseau en papier, boîte à rêves, tortue-horloge, rayon de miel | 3 à 5 | Uniques, souvent sans plan ; exigent des pièces rares |

### Animation de réactivation par famille

- **Drones :** les rotors montent en régime, les lumières s'allument, le drone décolle, fait une boucle et revient se poser.
- **Insectes :** les ailes battent, les antennes bougent, il vole en cercle au-dessus de l'établi.
- **Mascottes :** les yeux s'allument, la mascotte se lève, salue et fait une petite danse.
- Chaque animation fait 6 à 8 images dans une planche ; les modèles d'une même famille partagent l'animation avec une couleur différente.


## Règles complémentaires (tutoriel)

### Tutoriel guidé (réparation 1, environ 3 minutes)

1.  Léa dépose son mini-drone ; Gribouille se présente.
2.  Toucher le drone pour l'ouvrir : zoom sur le dessus.
3.  Dévisser la première vis : flèche circulaire animée, fin du geste signalée par un clic.
4.  Dévisser les trois autres vis librement, puis soulever la plaque d'un glissement.
5.  Repérer le connecteur débranché (il clignote) et le remettre en place.
6.  Refermer la plaque, tirer la manette de démarrage : premier envol.
7.  Écran de résultats avec explication des étoiles et des crédits ; ouverture de la boutique.

Chaque nouveau geste est introduit de la même façon, avec un indice de Gribouille la première fois seulement : aspirateur (commande 2), soudure (3), puce (4), diagnostic (5), soudure courbe (6), batterie (7), engrenage (13), capteur (14), ressort (25), broches (34), piles (41).


## Les 60 réparations

\* = panne cachée (diagnostic nécessaire). Les commandes entre parenthèses sont des examens de rang. Clients de passage = clients occasionnels sans histoire. La plupart des 60 pannes se complètent par un temps cible du rang (voir Équilibrage).

### Rang 1 (1 à 10) : l'héritage

| \# | Client | Patient | Pannes |
|---|---|---|---|
| 1 | Léa | Mini-drone jouet | Connecteur débranché (tutoriel) |
| 2 | Passage | Mini-drone jouet | Rouille, vis rouillée |
| 3 | Passage | Mini-drone jouet | Câble coupé |
| 4 | Passage | Drone de balcon | Puce grillée |
| 5 | Passage | Drone livreur | Puce grillée\*, câble coupé\* |
| 6 | Passage | Libellule | Câble coupé (courbe), rouille |
| 7 | Mme Volute | Scarabée | Batterie gonflée, élytres à clips |
| 8 | Turbo | Drone de balcon modifié | Câble coupé, puce grillée (temps cible) |
| 9 | Léa | Pantoufle (peluche robot) | Cœur-batterie faible, câble coupé |
| 10 | Prof. Ampère | Prototype sans plan | Rouille, puce\*, câble (examen rang 2) |

### Rang 2 (11 à 22) : l'atelier prend de la valeur

| \# | Client | Patient | Pannes |
|---|---|---|---|
| 11 | Brindille | Drone livreur | Rouille, câble coupé |
| 12 | Passage | Libellule | Câble, puce\* |
| 13 | Passage | Scarabée | Engrenage coincé |
| 14 | Brindille | Drone livreur | Capteur décalibré |
| 15 | Turbo | Drone de balcon | Puce, câble (3 min) |
| 16 | Mme Volute | Libellule | Rouille, 2 câbles courbes |
| 17 | Passage | Peluche robot | Cœur fragile, coutures |
| 18 | Léa | Pantoufle | Circuit oxydé |
| 19 | Brindille | Drone livreur | Batterie gonflée, puce\* |
| 20 | Passage | Scarabée | Engrenage, rouille |
| 21 | Prof. Ampère | Drone sans plan | Puce\*, 2 câbles |
| 22 | Mme Volute | Libellule + scarabée (2 patients) | Examen rang 3 : toutes les pannes de la collection |

### Rang 3 (23 à 34) : insectes et mascottes

| \# | Client | Patient | Pannes |
|---|---|---|---|
| 23 | Passage | Luciole-lanterne | Circuit lumineux oxydé (donne la lentille de cristal en 3 étoiles) |
| 24 | Brindille | Drone livreur | Rouille, câble\*, puce\* |
| 25 | Passage | Lapin à ressort | Ressort à retendre, rouille (ressort ancien en 3 étoiles) |
| 26 | Turbo | Drone de balcon | Capteur, puce |
| 27 | Passage | Abeille | Engrenage, capteur |
| 28 | Léa | Pantoufle | Cœur-batterie à remplacer (le mot caché apparaît) |
| 29 | Passage | Chat à clé | Mécanisme, engrenage coincé |
| 30 | Prof. Ampère | Méduse volante (prototype) | Exige la lentille de cristal |
| 31 | Passage | Luciole-lanterne | 3 câbles, puce |
| 32 | Mme Volute | Abeille | Rouille, engrenage, câble |
| 33 | Brindille | 2 drones livreurs | Pannes différentes, cumul de 2 patients |
| 34 | Turbo | Drone de course | Examen rang 4 : câble, puce, broche, temps serré |

### Rang 4 (35 à 46) : la grande clinique

| \# | Client | Patient | Pannes |
|---|---|---|---|
| 35 | Dr Quartz | Drone photo pro | Capteur, puce\*, oxydation (test de ton atelier) |
| 36 | Passage | Mante religieuse | Broches tordues |
| 37 | Mme Volute | Luciole-lanterne | Circuit, puce, rouille |
| 38 | Passage | Ours à musique | Oxydation, engrenage |
| 39 | Turbo | Drone de course | Câble, puce, broche |
| 40 | Prof. Ampère | Oiseau en papier (prototype) | Exige le ressort ancien |
| 41 | Passage | Hérisson solaire | Rouille, piles |
| 42 | Brindille | 3 drones livreurs | Flotte urgente, 3 patients |
| 43 | Dr Quartz | Mante religieuse | Broches, capteur |
| 44 | Passage | Ours à musique | Batterie, capteur (diapason d'argent en 3 étoiles) |
| 45 | Léa | Pantoufle | Visite de contrôle : tout nettoyer (clé minuscule en cadeau) |
| 46 | Dr Quartz | Prototype de sa clinique | Examen rang 5, toutes phases (pierre de quartz en cadeau) |

### Rang 5 (47 à 60) : le Maître

| \# | Client | Patient | Pannes |
|---|---|---|---|
| 47 | Passage | Mante religieuse | Toutes les pannes de la famille |
| 48 | Mme Volute | Libellule + scarabée + luciole | Exposition : 3 patients (papillon de verre en cadeau) |
| 49 | Turbo | Drone de course | Finale, première manche |
| 50 | Prof. Ampère | Boîte à rêves (prototype) | Exige diapason d'argent et fil d'or |
| 51 | Passage | Hérisson solaire | Oxydation, rouille, piles |
| 52 | Brindille | Flotte de 3 livreurs | Panne généralisée |
| 53 | Dr Quartz | Ours à musique | Test du partenariat |
| 54 | Léa | Pantoufle | Visite de Mamie : réparation simple, cadeau de reconnaissance |
| 55 | Prof. Ampère | Tortue-horloge (prototype) | 3 engrenages, exige l'engrenage de laiton |
| 56 | Turbo | Drone de course | Finale, record de temps |
| 57 | Mme Volute | Abeille + mante | Exposition, deuxième partie |
| 58 | Dr Quartz | Rayon de miel (prototype) | Exige la pierre de quartz |
| 59 | Prof. Ampère | Drone-échantillon de Maître Ohm | Révèle la lettre de Maître Ohm |
| 60 | Maître Ohm (par lettre) | Son dernier prototype | Toutes les pannes, sans limite de temps (fin) |

Si une pièce rare exigée manque, la commande de prototype reste verrouillée et Gribouille indique la commande à refaire en 3 étoiles pour l'obtenir.
