# Pico-Clinic — État du projet

Mis à jour : 2026-10-21 (C4 V1a + correctifs). Jeu : https://keismey.github.io/Pico-Clinic/

## Fait
- C1 : dépôt, Pages, GDD découpé dans `docs/gdd/`. C2-C3 (V0) : canvas, FR/EN, scènes, dévissage, connecteur, soudure, puce, vibrations, réactivation.
- C4 V1a : boucle complète dévissage → diagnostic → réparation → démarrage → étoiles et paie.
- Diagnostic (`js/gestures/magnifier.js`) : la loupe flotte au-dessus du doigt ; 0,4 s sur une panne cachée (puce grillée, piste coupée) la révèle ; sur une pièce saine = « Rien ici » +3 s. Indice qui pulse après 20 s. Avant, la puce et la piste ont l'air normales.
- Aspirateur (`js/gestures/vacuum.js`) : embout 150 px au-dessus du doigt (le pouce ne cache plus rien), condensateurs entourés pendant l'aspiration ; indice « rouille » dès l'ouverture. 2 condensateurs cassables (0,3 s de frottement).
- Condensateur cassé (`js/gestures/capacitor.js`) = panne : le drone tousse. Le sortir de la carte, puis poser le neuf (à côté de la boîte). Il fait quand même perdre l'étoile Propre.
- Notation (`js/score.js`) : Fonctionnel ; Propre = propreté ≥ 80 % (rouille aspirée − 5 par vis abîmée) et aucun condensateur abîmé ; Précis = moyenne soudure + puce ≥ 85 %. Pourboire +25 % si temps ≤ objectif (2:00).
- Sauvegarde `pico_save_v1` v2 (migration depuis v1) : crédits, rang, outils, étoiles par commande, meilleur temps, réglages. Une commande ne paie qu'une fois (règle du GDD) ; « Nouvelle partie » sur l'écran titre efface tout (2 touches).
- Testé en navigateur automatique : parcours complet, paie 40 + 10, sauvegarde après rechargement, aucune erreur.

## Valeurs à valider au doigt (`data/gestures.json`)
- GDD trop petit pour un doigt : aspirateur 46 px (GDD 18), loupe 125 px (GDD 60). Tolérances soudure/puce à 36 px (voir V0b).

## Reste à faire
- V1b → V5 selon le plan des conversations.

## Bugs connus
- Aucun connu. Vibrations absentes sur iPhone. La fiche du connecteur est près de la puce : en diagnostic, poser le doigt sur la fiche l'attrape au lieu de la loupe.

## Prochaine étape
- C5 — V1b économie et patients (02-progression, 03-patients).

## Plus tard
- Broche tordue (V3a) ; bonus fer de précision/laser, pinces, loupe thermique, scanner, aspirateur renforcé (V1b).
- Indice 20 s pour tous les gestes ; pause ; gaucher. Sauver une réparation en cours si le navigateur ferme l'onglet.
- Rouille qui cache une vis ou une pastille ; son d'aspiration (V4a).
