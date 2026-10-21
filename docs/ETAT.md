# Pico-Clinic — État du projet

Mis à jour : 2026-10-21 (C6 V2a). Jeu : https://keismey.github.io/Pico-Clinic/

## Fait
- C1-C5 (V0, V1) : 7 gestes, loupe, aspirateur, 3 étoiles, paie, sauvegarde v3, 15 modèles, 10 commandes du rang 1, boutique 3 niveaux.
- C6 V2a : `data/clients.json` (6 clients + passage + Gribouille), portraits provisoires en formes (`js/portraits.js`).
- Comptoir (`js/scenes/counter.js`) : accueil avant, merci après, bulles lettre à lettre, Passer. Commande déjà réussie = rejouée sans comptoir.
- Dialogues des commandes 1 à 10 (`intro`/`thanks` dans `orders.json`, clés `arc.client.n.*`), Gribouille annonce les examens.
- Rangs (`data/ranks.json` : 18/45/70/96 étoiles, examens 10/22/34/46), écran « Nouveau rang ! » (`rank.js`), panneau de Gribouille si l'examen manque d'étoiles.
- Carnet de Maître Ohm (`notebook.js`) : clients (fiche, bio, dernier mot), 12 pièces rares, 5 rangs avec barre d'étoiles.
- Pièces rares (`data/rare_parts.json`) : 3 étoiles ou cadeau ; seul l'engrenage (commande 10) est gagnable aujourd'hui.
- Correctifs V2a : langue choisie seulement sur l'écran titre (plus de boutons FR/EN en jeu) ; le doigt tient le manche du fer (rond orange), la pointe reste visible devant (`solder.grip`).
- Testé en navigateur automatique (FR/EN, parcours complet, soudure), aucune erreur ; clés FR = EN.

## Écarts au GDD
- Batterie gonflée, élytres, cœur-batterie remplacés par puce/connecteur (commandes 7 et 9) en attendant V3a.
- Clients de passage (commandes 2 à 6) : répliques inventées (le GDD n'en donne pas).

## Valeurs à valider au doigt
- Vitesse du texte (42 lettres/s) ; tailles des portraits ; position du doigt sur le fer (`solder.grip` 65/130) ; `data/gestures.json`.

## Bugs connus
- Vibrations absentes sur iPhone. En diagnostic, la fiche du connecteur peut attraper le doigt au lieu de la loupe.

## Prochaine étape
- C7 V2b : tutoriel avec Gribouille, 10 premières réparations, chapitres 1 et 2.

## Plus tard
- Images Gemini des clients, de Gribouille et des pièces rares ; animations de réactivation par famille.
- Commandes 11 à 60, prototypes qui exigent des pièces rares, Atelier libre, défi quotidien, décorations, succès.
- Gestes V3a (batterie, engrenage, capteur, broches, ressort, piles). Pompe magnétique qui ramasse les vis.
- Indice 20 s ; pause ; gaucher ; sauver une réparation en cours. Rouille qui cache une vis ; sons (V4a).
