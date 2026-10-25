# Pico-Clinic — État du projet

Mis à jour : 2026-10-25 (C11 V4a habillage). Jeu : https://keismey.github.io/Pico-Clinic/ · Essai : https://keismey.github.io/Pico-Clinic/?essai

## Fait
- C11 V4a : `js/audio.js`. Musique d'atelier (85 BPM) et d'opération (100 BPM), jingle, ~35 effets (vis, aspirateur et soudure en boucle, puce, court-circuit, manette, rotors, pièces, étoiles, achat…), tous fabriqués en code. Un MP3 déposé dans `audio/` et listé dans `audio/sons.json` remplace le son du même nom (noms dans `audio/LISEZMOI.md`). Boutons Musique / Sons sur l'écran titre. Vibrations iPhone (iOS 18+, astuce de l'interrupteur caché). Particules déjà en place (max 150).
- C11 relecture des textes : examens des rangs 3 et 5 corrigés (joyaux de Mme Volute, prototype de la clinique Quartz), hérisson 51 (vert-de-gris), EN : Pantoufle (plus « Slipper »), Mrs./Dr., titres des chapitres, « Last said ». FR : espaces insécables avant ! ? : % (plus de « ! » seul en début de ligne), « … ». Générique : « Programmation et dessins : Claude », « Musiques et sons : fabriqués en code » (ligne Gemini retirée tant qu'aucune image Gemini n'est dans le jeu).
- C1-C8 : gestes de base et secondaires (vue rapprochée), loupe, aspirateur, étoiles, paie, sauvegarde v3, boutique, comptoir, rangs, Carnet, pièces rares, tutoriel de Gribouille, chapitres 1-2, bouton retour.
- C10 V3c : textes du GDD pour les arcs des commandes 23 à 60 (mêmes clés `arc.<client>.<n>.intro/.thanks`), ouvertures des chapitres 3 à 5, lettre de Maître Ohm (après la 59), fin et générique (après la 60), dans `data/story.json`. Nouveaux orateurs dans les bulles : `mamie:` (54), `note:` (mot caché de la 28), `postcard:` (carte de la 60). Noms corrigés : o32 « Abeille rarissime », o37 « Aurore, la luciole », o21 « Drone sans plan ». Clés FR = EN (625).
- C9 V3b : les 60 commandes dans `data/orders.json` (rangs 1 à 5, examens 10/22/34/46). Carte en 4 dispositions miroir (`setLayout`, `lp()` dans `js/drone.js`) : puce, piste, batterie et prise changent de place selon le numéro de commande (1 à 6 : disposition de base).
- Pistes en 2 ou 3 morceaux (`cuts`), soudés l'un après l'autre. Commandes à 2-3 patients (`patients`, 22/33/42/48/52/57) : notés ensemble (moyennes, temps additionné). 6 prototypes dessinés (famille `proto`) ; pièce rare exigée (rare_parts.json `use`) : sinon la commande attend et Gribouille dit laquelle refaire en 3 étoiles ; les suivantes restent jouables. Commande 60 : lettre de Maître Ohm sur le comptoir, sans limite de temps.
- Décorations (`data/decorations.json`, `js/deco.js`) : onglet de la boutique, 8 objets visibles au comptoir. Atelier libre au rang 5 (`js/free.js`, `js/scenes/free.js`) : patient et pannes au hasard, gains 50 %, rien d'enregistré. Équilibrage : paie ≈ 44 → 436 du rang 1 au 5, temps cible 2 à 4 min, pièces 5 à 30 crédits.
- Atelier d'essai : capot déjà ouvert (pas de vis), « Les 60 commandes » et « Atelier libre » (tous les rangs). Correctif : la pochette du cœur reste fermée. Ajout hors GDD, outil `driver` : tournevis à cliquet (150 cr., rang 2, 1 tour au lieu de 1,5), puis dévisseuse (800 cr., rang 4 : on garde le doigt sur la vis, 1,25 s, rouillée 2,5 s).
- Testé en navigateur automatique : 60 commandes sans erreur, soudure en 3 morceaux, 3 patients enchaînés, Atelier libre payé, dévisseuse, clés FR = EN (592).

## Écarts au GDD
- Absents : élytres à clips (7), coutures (17), mécanisme à clé (29), 3 engrenages de la tortue (55) ; un seul geste de chaque type par patient. Pas de panne secondaire cachée.
- Clients de passage (23, 25, 27, 29, 31, 36, 38, 41, 44, 47, 51) : pas de texte dans le GDD, les dialogues d'origine restent. Les textes des chapitres 3 à 5 et de la fin (`story.ch3.*`, `.ch4.*`, `.ch5.*`, `story.end.*`) sont nouveaux, écrits d'après le résumé des chapitres.

## Valeurs à valider au doigt
- Vitesse de la dévisseuse (1,2 tour/s), batterie (340), cœur (1 s, ±0,16 s), ressort (0,35 à 1,6 tour/s), broches (6°), temps cibles de Turbo (26, 34, 39, 49, 56), `data/gestures.json`.

## Bugs connus
- Vibrations iPhone : à vérifier au doigt (iOS 18+ seulement, un simple « tic »). En diagnostic, la fiche peut attraper le doigt avant la loupe. Indices longs un peu serrés.

## Prochaine étape
- Musiques générées avec Gemini (atelier, opération ; plus d'1 min) : je les découpe en boucles et les dépose dans `audio/` (conversation « Correctifs V4a »). Le jingle reste en code. Puis C12 V4b : options d'accessibilité et défi quotidien.

## Plus tard
- Images Gemini (clients, Gribouille, pièces rares, gestes secondaires, image de groupe finale, Mamie). Générique : créateur « Keismey » à confirmer, outil des MP3 à créditer s'ils arrivent. Réglages de volume (son 80 %, musique 60 %) en V4b. Défi quotidien, succès. Finitions graphiques des icônes de la carte. Indice 20 s ; bouton pause ; gaucher ; sauver une réparation en cours ; revoir le tutoriel ; pannes cachées visibles dans la loupe ; retour qui ferme d'abord la vue rapprochée.
