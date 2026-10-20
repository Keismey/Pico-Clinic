import { save } from './save.js';

// Vibration courte (ignorée si le téléphone ne sait pas vibrer, ex. iPhone).
export function vibrate(pattern) {
  if (!save.settings.vibration) return;
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* rien */ }
}
