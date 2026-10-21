# Pico-Clinic — État du projet

Mis à jour : 2026-10-21 (C5 V1b). Jeu : https://keismey.github.io/Pico-Clinic/

## Fait
- C1-C4 (V0, V1a) : canvas, FR/EN, dévissage, connecteur, soudure, puce, loupe, aspirateur, condensateurs, réactivation, 3 étoiles, paie et pourboire, sauvegarde.
- C5 V1b : `data/patients.json` = 15 modèles en 3 familles (drones, insectes, mascottes), chacun dessiné avec sa forme et ses couleurs (`js/drone.js`, provisoire en attendant les images).
- `data/orders.json` = les 10 commandes du rang 1 (clients, pannes, rouille, piste droite/courbe/vague, temps, paie). Écran Commandes (`js/scenes/orders.js`) : débloquées une à une.
- Commande 10 = examen : 18 étoiles nécessaires, la réussir donne le rang 2 (bandeau sur l'écran de fin).
- Boutique (`js/scenes/shop.js`, `data/tools.json`) : fer, aspirateur, loupe, pince, 3 niveaux, prix et rangs du GDD. Effets : chemin de soudure plus large, aspirateur plus large, loupe plus rapide, scanner = pannes visibles d'emblée, pince qui aimante mieux.
- Sauvegarde v3 (ancienne partie migrée, ancien drone d'essai retiré).
- Testé en navigateur automatique : 10 réparations d'affilée, rang 2, achats, sauvegarde après rechargement, aucune erreur.

## Écarts au GDD (en attendant les gestes de V3a)
- Batterie gonflée, élytres, cœur-batterie : remplacés par puce/connecteur dans les commandes 7 et 9 (`gdd_faults` dans `orders.json`).

## Valeurs à valider au doigt
- `data/gestures.json` (aspirateur 28 px, loupe 125 px, tolérance soudure 36 px) ; paie des commandes 30 à 60 crédits.

## Bugs connus
- Aucun connu. Vibrations absentes sur iPhone. En diagnostic, la fiche du connecteur peut attraper le doigt au lieu de la loupe.

## Prochaine étape
- C6 selon le plan des conversations (V2).

## Plus tard
- Animations de réactivation propres à chaque famille (ailes, danse) ; images Gemini des 15 modèles.
- Commandes 11 à 60, Atelier libre, défi quotidien, pièces rares, décorations.
- Broche tordue, batterie, engrenage, capteur, ressort, piles (V3a). Pompe magnétique qui ramasse les vis.
- Indice 20 s pour tous les gestes ; pause ; gaucher. Sauver une réparation en cours si l'onglet se ferme.
- Rouille qui cache une vis ou une pastille ; son d'aspiration (V4a).
