// Sauvegarde pico_save_v1 : identifiants uniquement, jamais de texte traduit.
// V0a ne stocke que les réglages ; la V1a ajoutera crédits, rang, outils, étoiles…
const KEY = 'pico_save_v1';
const VERSION = 1;

function defaults() {
  return { version: VERSION, settings: { lang: null, vibration: true } };
}

function load() {
  const def = defaults();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return def;
    const d = JSON.parse(raw);
    return { ...def, ...d, settings: { ...def.settings, ...(d.settings || {}) }, version: VERSION };
  } catch (e) {
    return def;
  }
}

export const save = load();

export function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* stockage indisponible */ }
}
