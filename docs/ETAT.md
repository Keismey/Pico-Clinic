# Pico-Clinic — État du projet

Mis à jour : 2026-10-21 (C2 V0a). Jeu : https://keismey.github.io/Pico-Clinic/

## Fait
- C1 : dépôt, GitHub Pages, GDD découpé dans `docs/gdd/` (voir 00-base pour l'index des rubriques).
- C2 V0a : `index.html` + modules `js/` ; canvas 1080×1920 mis à l'échelle (DPR ≤ 2) ; un seul doigt ; pause si onglet caché.
- Langues : `lang/fr.json`, `lang/en.json`, `t("clé")`, détection auto, sélecteur FR/EN (titre + pastille en haut à droite), choix gardé dans `pico_save_v1`.
- Scènes (`js/scenes/`) : titre → opération → réactivation → fin. Données : `data/gestures.json` (specs), `data/patients.json` (drone_jouet_v0).
- Gestes (`js/gestures/`) : dévissage (1,5 tour, 3 si rouillée, dérapage à 2,2 × rayon, -5 propreté) ; connecteur (aimant 24 px).
- Réactivation : manette validée à 70 % ; panne restante = toux, zone qui clignote, retour au bloc.
- Testé en navigateur automatique (parcours complet, dérapage, FR/EN) : aucune erreur.

## Reste à faire
- C3 V0b : soudure, remplacement de puce (la puce est déjà dessinée en décor), vibrations et retours visuels.
- V1 → V5 selon le plan des conversations.

## Bugs connus
- Aucun connu. Vibrations absentes sur iPhone (Safari ne les gère pas).

## Prochaine étape
- C3 — V0b soudure et puce (fichier 01-gestes).

## Plus tard
- Indice après 20 s de blocage (recette 01-gestes).
- Bouton pause dans l'écran opération (règle d'ergonomie 00-base).
- Outil dessiné sous le doigt avec décalage (tournevis, pince).
- Jauges propreté/soin visibles (la propreté est déjà calculée).
- Aimant 24 px du connecteur : à élargir dans `data/gestures.json` si trop dur au doigt.
