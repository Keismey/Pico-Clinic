# Pico-Clinic — GDD v14 · Gestes : gameplay, specs, gestes secondaires, performances

> Extrait fidèle du GDD (artefact « GDD – Pico-Clinic, le Micro-Chirurgien de Drones »), découpé le 2026-10-21.

## Boucle d'une réparation

**Réception** du client → **Diagnostic** → **Opération** (plusieurs gestes, voir Specs et Règles) → **Réactivation** → **Paie & étoiles**.

### Les gestes (vue zoomée, un doigt)

| Phase | Geste | Réussite / erreur |
|---|---|---|
| Dévissage | Maintenir sur la vis puis tourner en cercle ; les vis rouillées demandent plus de tours | Cercle régulier = vis sortie. Doigt qui dérape = vis abîmée (-propreté) |
| Nettoyage | Frotter les zones de rouille avec l'aspirateur micro | Jauge de propreté ; frotter sur un composant fragile fait vibrer et baisse la jauge de soin |
| Soudure | Tracer d'un trait continu un chemin entre deux pastilles, le fer chauffe en restant appuyé | Trop lent = brûlure ; trop rapide = soudure froide ; sortir du chemin = court-circuit (étincelle, à refaire) |
| Remplacement de puce | Glisser la puce neuve avec la pince, l'aligner sur les broches, relâcher pour l'enclencher | Tolérance selon le niveau d'outil ; broche tordue = mini-jeu de redressage |
| Diagnostic | Balayer avec la loupe (puis la loupe thermique et le scanner) pour révéler les points chauds ou morts | Toucher les bons composants ; chaque erreur coûte du temps, pas des étoiles |
| Réactivation | Tirer la manette de démarrage, puis tester rotors, lumières, sons | Si une panne cachée reste : le drone tousse, on rouvre sur la zone fautive |

### Notation (3 étoiles)

- ⭐ Fonctionnel (le drone démarre) · ⭐ Propre (soins, rouille, vis) · ⭐ Précis (soudures et alignements).
- Un temps cible donne un bonus de pourboire, sans jamais retirer d'étoile.

### Variété

- Pannes tirées d'un catalogue de 11 pannes (voir Contenu et Règles) combinées selon le modèle.
- Chaque famille de patient a son plan de carte interne et ses pièges (le scarabée a des élytres à clips, la mascotte a un cœur-batterie fragile).


## Specs des gestes (valeurs de départ)

Monde logique 1080 × 1920 mis à l'échelle de l'écran (et du devicePixelRatio). Toutes les valeurs sont dans les JSON de données.

| Geste | Calcul | Paramètres |
|---|---|---|
| Dévissage | Angle cumulé du doigt autour du centre de la vis | 1,5 tour (3 si rouillée) ; dérapage si le doigt s'éloigne de plus de 2,2 × le rayon de la vis |
| Aspirateur | Grille de cellules de rouille, chaque passage réduit leur opacité | Rayon 18 px, vitesse mini pour éviter le simple tapotement ; cellule fragile touchée = -soin |
| Soudure | Courbe échantillonnée ; progression = projection du doigt sur la courbe | Tolérance 14 px (rang 1) → 8 px (rang 5), +15 % avec le fer de précision, +30 % avec le laser ; chauffe 0 → 1 en 1,2 s ; vitesse idéale 60 à 140 px/s ; hors tolérance plus de 150 ms = court-circuit |
| Puce | Glisser jusqu'à un rayon d'aimantation, puis relâcher | Rayon 14 px (18 avec la pince fine, 22 avec la pince antistatique) ; score d'alignement = 1 - distance / rayon |
| Diagnostic | Cercle de loupe qui révèle après maintien | Rayon 60 px, 0,4 s de maintien ; le scanner révèle tout d'un coup |
| Réactivation | Tirer la manette vers le bas | Validée à 70 % de la course ; s'il reste une panne, le drone tousse et la zone fautive clignote |

### Notation

- ⭐ Fonctionnel : le drone démarre.
- ⭐ Propre : propreté ≥ 80 % et aucun composant fragile abîmé.
- ⭐ Précis : précision moyenne (soudures + alignements) ≥ 85 %.
- Pourboire = +25 % des crédits de base si le temps cible est tenu.

### Format de données (exemple d'un patient)

    {
      "id": "drone_jouet_01",
      "family": "drone",
      "rank": 1,
      "parts": ["screw x4", "chip_slot x1", "cable x1"],
      "faults": ["cable_cut", "chip_burnt"],
      "target_time": 120,
      "reward": 40,
      "client": "lea"
    }

### Sauvegarde

- Une clé `pico_save_v1` en localStorage : crédits, rang, outils possédés et leur niveau, étoiles par commande, progression des clients, réglages (langue, son, vibration, gaucher). Identifiants uniquement, jamais de texte traduit.
- Numéro de version dans la sauvegarde pour migrer sans rien perdre quand le jeu évolue.

### Recette (tests)

- Chaque geste testé au doigt sur petit et grand écran, en main gauche et main droite.
- Aucune opération impossible à terminer : si le joueur bloque, un indice s'affiche après 20 s.
- Rotation d'écran, retour d'une autre appli et mise en veille sans perte de progression.
- Parcours des 10 premières réparations d'une traite, sans lecture de règles.


## Règles complémentaires (gestes)

### Gestes secondaires

| Panne | Geste | Paramètres |
|---|---|---|
| Connecteur débranché (tutoriel) | Glisser le connecteur jusqu'à sa prise et relâcher | Rayon d'aimantation 24 px, aucune erreur possible |
| Batterie gonflée | Glisser la batterie hors de son logement le long d'un rail | Vitesse max 220 px/s ; au-delà, jauge de risque ; toucher le bord rouge = soin en baisse |
| Engrenage coincé | 1\) glisser le débris hors de la zone ; 2) glisser l'engrenage sur son axe et tourner un quart de tour pour engager les dents | Alignement des dents à 20° près ; 3 essais avant un indice |
| Capteur décalibré | Deux curseurs à régler, un son monte quand on approche du signal | Zone verte de 12 % de large, à tenir 0,8 s |
| Broche tordue | Pousser la broche d'un petit trait de doigt dans le bon sens | Angle correct à 6° près ; de 1 à 4 broches |
| Ressort détendu | Tourner le doigt en spirale autour du ressort | 3 tours complets à vitesse régulière ; un clic confirme ; trop vite = jauge de risque |
| Piles faibles | Glisser deux piles neuves sur leurs bornes, puis frotter le panneau | Même aimantation que les puces (14 px) ; panneau nettoyé à 90 % |

### Performances

- Cible : 60 images par seconde, 30 minimum sur un téléphone Android d'entrée de gamme (2 Go de RAM).
- Canvas à la résolution logique 1080 × 1920, devicePixelRatio plafonné à 2.
- Maximum 150 particules à la fois ; sprites regroupés en planches ; textures libérées entre les écrans.
- Jeu mis en pause automatiquement quand l'onglet n'est plus visible.
