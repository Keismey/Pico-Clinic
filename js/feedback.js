import { save } from './save.js';
import { pitch, pitchStop } from './audio.js';

// Vibration courte.
// Android : navigator.vibrate. iPhone (iOS 18 et plus) : pas de vibrate, mais un interrupteur
// caché qu'on bascule donne un petit « tic » du moteur haptique (seulement pendant un toucher).
let iosSwitch = null;
let lastIos = 0;

function iosTap() {
  try {
    if (!iosSwitch) {
      const label = document.createElement('label');
      label.style.cssText = 'position:fixed;left:-100px;top:-100px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('switch', '');
      label.appendChild(input);
      document.body.appendChild(label);
      iosSwitch = label;
    }
    iosSwitch.click();
  } catch (e) { /* rien */ }
}

export function vibrate(pattern) {
  if (!save.settings.vibration) return;
  try {
    if (navigator.vibrate) { navigator.vibrate(pattern); return; }
    // iPhone : un seul tic, pas plus de 12 par seconde (les vibrations continues sont ignorées)
    const ms = Array.isArray(pattern) ? pattern.reduce((a, b) => a + b, 0) : pattern;
    const now = performance.now();
    if (ms < 6 || now - lastIos < 80) return;
    lastIos = now;
    iosTap();
  } catch (e) { /* rien */ }
}

// Petit son continu (capteur : il monte quand on approche du signal).
export function tone(freq) { pitch(freq); }
export function toneStop() { pitchStop(); }
