# Pico-Clinic — État du projet

Mis à jour : 2026-10-25 (C9 V3b contenu + dévisseuse). Jeu : https://keismey.github.io/Pico-Clinic/ · Essai : https://keismey.github.io/Pico-Clinic/?essai

## Fait
- C1-C8 : gestes de base et secondaires (vue rapprochée), loupe, aspirateur, étoiles, paie, sauvegarde v3, boutique, comptoir, rangs, Carnet, pièces rares, tutoriel de Gribouille, chapitres 1-2, bouton retour.
- C9 V3b : les 60 commandes dans `data/orders.json` (rangs 1 à 5, examens 10/22/34/46). Carte en 4 dispositions miroir (`setLayout`, `lp()` dans `js/drone.js`) : puce, piste, batterie et prise changent de place selon le numéro de commande (1 à 6 : disposition de base).
- Pistes en 2 ou 3 morceaux (`cuts`), soudés l'un après l'autre. Commandes à 2-3 patients (`patients`, 22/33/42/48/52/57) : notés ensemble (moyennes, temps additionné).
- 6 prototypes dessinés (famille `proto`) ; pièce rare exigée (rare_parts.json `use`) : sinon la commande attend et Gribouille dit laquelle refaire en 3 étoiles ; les suivantes restent jouables. Commande 60 : lettre de Maître Ohm sur le comptoir, sans limite de temps.
- Décorations (`data/decorations.json`, `js/deco.js`) : onglet de la boutique, 8 objets visibles au comptoir. Atelier libre au rang 5 (`js/free.js`, `js/scenes/free.js`) : patient et pannes au hasard, gains 50 %, rien d'enregistré. Équilibrage : paie ≈ 44 → 436 du rang 1 au 5, temps cible 2 à 4 min, pièces 5 à 30 crédits.
- Atelier d'essai : capot déjà ouvert (pas de vis), « Les 60 commandes » et « Atelier libre » (tous les rangs). Correctif : la pochette du cœur reste fermée.
- Ajout hors GDD : dévisseuse (outil `driver`, 180 crédits, rang 2) : on garde le doigt sur la vis, elle se dévisse seule (1,25 s, rouillée 2,5 s).
- Testé en navigateur automatique : 60 commandes sans erreur, soudure en 3 morceaux, 3 patients enchaînés, Atelier libre payé, dévisseuse, clés FR = EN (592).

## Écarts au GDD
- Absents : élytres à clips (7), coutures (17), mécanisme à clé (29), 3 engrenages de la tortue (55) ; un seul geste de chaque type par patient. Pas de panne secondaire cachée.
- Dialogues des commandes 23 à 60 provisoires (à réécrire en V3c). Pas de scène d'ouverture des chapitres 3 à 5.

## Valeurs à valider au doigt
- Vitesse de la dévisseuse (1,2 tour/s), batterie (340), cœur (1 s, ±0,16 s), ressort (0,35 à 1,6 tour/s), broches (6°), temps cibles de Turbo (26, 34, 39, 49, 56), `data/gestures.json`.

## Bugs connus
- Vibrations absentes sur iPhone. En diagnostic, la fiche peut attraper le doigt avant la loupe. Indices longs un peu serrés.

## Prochaine étape
- C10 V3c textes : arcs et chapitres 3 à 5, fin (remplacer les dialogues provisoires 23-60).

## Plus tard
- Images Gemini (clients, Gribouille, pièces rares, gestes secondaires) ; son du clic de vis. Défi quotidien, succès. Finitions graphiques des icônes de la carte.
- Indice 20 s ; bouton pause ; gaucher ; sauver une réparation en cours ; revoir le tutoriel ; pannes cachées visibles dans la loupe ; retour qui ferme d'abord la vue rapprochée.
