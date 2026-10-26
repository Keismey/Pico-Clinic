// Version du jeu, notes de mise à jour et changement de langue (mémorisé dans la sauvegarde).
import { setLang } from './i18n.js';
import { save, persist } from './save.js';

export const VERSION = '1.0.1';

// Notes de mise à jour, la plus récente en premier (affichées dans les Options, et une fois après chaque mise à jour).
export const NOTES = [
  { v: '1.0.1', d: ['26 octobre 2026', '26 October 2026'],
    fr: ['Options : notes de mise à jour, sauvegarde à exporter ou importer (pour changer d’appareil), signaler un bug, soutenir le studio, crédits.',
      'Le navigateur est invité à garder ta sauvegarde même quand il fait du ménage.',
      'Écran titre : « Touche pour commencer » ; la langue se choisit dans les Options, comme dans les autres jeux du studio.'],
    en: ['Options: patch notes, a save you can export or import (to switch devices), bug reports, studio support, credits.',
      'The browser is asked to keep your save even when it clears space.',
      'Title screen: “Tap to start”; the language is now chosen in Options, like in the studio’s other games.'] },
  { v: '1.0.0', d: ['25 octobre 2026', '25 October 2026'],
    fr: ['Première version : 60 commandes en 5 chapitres, la boutique et les décorations, le défi du jour et l’Atelier libre.'],
    en: ['First release: 60 orders across 5 chapters, the shop and decorations, the daily challenge and the Free Workshop.'] },
];

const NOTES_KEY = 'pico_notes';

// Une fois après chaque mise à jour, et seulement pour un joueur qui a déjà joué (un nouveau joueur ne les voit pas).
export function notesDue() {
  let seen = null;
  try { seen = localStorage.getItem(NOTES_KEY); } catch (e) { return false; }
  if (seen === VERSION) return false;
  const played = save.credits > 0 || Object.keys(save.orders).length > 0;
  if (!played) { notesSeen(); return false; }
  return true;
}

export function notesSeen() {
  try { localStorage.setItem(NOTES_KEY, VERSION); } catch (e) { /* stockage indisponible */ }
}

export function changeLang(l) {
  setLang(l);
  save.settings.lang = l;
  persist();
}
