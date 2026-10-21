# Pico-Clinic — État du projet

Mis à jour : 2026-10-21 (C3 V0b). Jeu : https://keismey.github.io/Pico-Clinic/

## Fait
- C1 : dépôt, GitHub Pages, GDD découpé dans `docs/gdd/`.
- C2 V0a : canvas 1080×1920, langues FR/EN (`t()`), scènes titre → opération → réactivation → fin, dévissage, connecteur, manette.
- C3 V0b : `js/gestures/solder.js` (soudure) et `js/gestures/chip.js` (puce). Le drone a 3 pannes : connecteur, puce grillée, piste coupée.
- Soudure : pastille qui clignote → fer qui chauffe 1,2 s → suivre le chemin sans lever. Trop lent = brûlure, trop vite = soudure froide, hors chemin 0,15 s = court-circuit (éclair, secousse, à refaire). Jauge de vitesse dans le panneau.
- Puce : sortir la grillée de la carte (part dans la coupelle), prendre la neuve dans la boîte en haut à droite, lâcher sur le cadre (aimant, score = 1 − distance/rayon, pince dessinée).
- Retours : vibrations par événement, fumées, étincelles, voyant vert quand tout est réparé ; la zone de la 1re panne restante clignote après une toux. Écran de fin : précision, brûlures, courts-circuits.
- Testé en navigateur automatique (parcours complet, court-circuit, toux, FR/EN) : aucune erreur.

## Valeurs à valider au doigt (`data/gestures.json`)
- Le GDD donne 14 px de tolérance de soudure et 14 px d'aimant de puce : ≈ 1 mm sur téléphone, injouable. Mis à 36 px (rang 1 → 21 au rang 5).
- Vitesse idéale de soudure 80–240 px/s (GDD : 60–140) ; chemin de 485 px = 2 à 6 s.

## Reste à faire
- V1 → V5 selon le plan des conversations.

## Bugs connus
- Aucun connu. Vibrations absentes sur iPhone (Safari ne les gère pas).

## Prochaine étape
- C4 — V1a cœur de jeu (fichiers 01-gestes, 02-progression).

## Plus tard
- Broche tordue après une puce mal posée (geste secondaire, V3a) ; bonus fer de précision / laser et pinces (V1b).
- Indice après 20 s de blocage ; bouton pause ; gaucher (fer dessiné à gauche).
- Jauges propreté/soin visibles ; aimant du connecteur (24 px) à élargir si trop dur.
