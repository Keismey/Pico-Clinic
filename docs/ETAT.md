# Pico-Clinic — État du projet

Mis à jour : 2026-10-21 (C7 V2b). Jeu : https://keismey.github.io/Pico-Clinic/

## Fait
- C1-C6 (V0, V1, V2a) : 7 gestes, loupe, aspirateur, 3 étoiles, paie, sauvegarde v3, boutique, comptoir, dialogues, rangs, Carnet, pièces rares.
- C7 V2b tutoriel (`js/tutorial.js`) : Gribouille parle dans le panneau d'aide + main fantôme qui fait le geste, une seule fois (`save.story`). Commande 1 : toucher le drone (zoom), 1re vis, 3 autres, plaque à glisser vers le haut (nouveau geste, toutes commandes), fiche, Démarrer, manette ; résultats (étoiles, crédits) puis boutique présentée.
- Indices 1re fois : vis rouillée + aspirateur (2), soudure (3), puce (4), loupe (5), soudure courbe (6) ; ligne de Gribouille sur le pourboire (8).
- Scènes d'histoire (`js/scenes/story.js`, `data/story.json`) : carte « Chapitre 1 – L'héritage » au premier Jouer, carnet de Maître Ohm trouvé après la commande 3, « Chapitre 2 » après le rang 2.
- Boutique visible après la commande 1, Carnet après la commande 3. Liste des commandes en onglets de chapitres.
- Chapitre 2 : commandes 11 à 22 (Brindille, Turbo, Volute, Léa, Ampère, passages) avec dialogues FR/EN ; examen du rang 3 = commande 22.
- Testé en navigateur automatique (FR/EN, tutoriel complet, leçons 2-6, chapitre 2), aucune erreur ; clés FR = EN (322).

## Écarts au GDD
- Gestes V3a absents, remplacés par puce/connecteur/soudure : commandes 7, 9, 13 (engrenage), 14 (capteur), 17 (cœur, coutures), 18 (oxydation), 19 (batterie), 20.
- Une seule piste par patient (16 et 21 en prévoient 2) ; commande 22 = un seul patient (scarabée) au lieu de 2.
- Répliques des clients de passage 2-6, 12, 13, 17, 20 inventées. Temps cible de Turbo 15 : 90 s (GDD : 3 min).

## Valeurs à valider au doigt
- Seuil de la plaque (160 px vers le haut) ; vitesse de la main fantôme ; taille des bulles de Gribouille ; `data/gestures.json`.

## Bugs connus
- Vibrations absentes sur iPhone. En diagnostic, la fiche peut attraper le doigt avant la loupe. Panneau d'aide (hors tutoriel) : les indices longs (rouille) débordent un peu en haut.

## Prochaine étape
- C8 V3a : gestes secondaires (batterie, engrenage, capteur, broches, ressort, piles, circuit oxydé), puis remettre les vraies pannes des commandes ci-dessus.

## Plus tard
- Images Gemini (clients, Gribouille, carnet, pièces rares) ; son du clic de vis. Commandes 23 à 60, chapitres 3 à 5, patients multiples, prototypes à pièces rares, Atelier libre, défi quotidien, succès.
- Indice 20 s ; pause ; gaucher ; sauver une réparation en cours ; revoir le tutoriel depuis les réglages.
