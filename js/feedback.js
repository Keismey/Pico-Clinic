import { save } from './save.js';

// Vibration courte (ignorée si le téléphone ne sait pas vibrer, ex. iPhone).
export function vibrate(pattern) {
  if (!save.settings.vibration) return;
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* rien */ }
}

// Petit son continu (capteur : il monte quand on approche du signal). Coupé si le son est désactivé.
let ac = null, osc = null, gain = null;
export function tone(freq) {
  if (!save.settings.sound) return;
  try {
    if (!ac) {
      const A = window.AudioContext || window.webkitAudioContext;
      if (!A) return;
      ac = new A();
    }
    if (ac.state === 'suspended') ac.resume();
    if (!osc) {
      osc = ac.createOscillator();
      gain = ac.createGain();
      osc.type = 'sine';
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start();
    }
    osc.frequency.setTargetAtTime(freq, ac.currentTime, 0.03);
    gain.gain.setTargetAtTime(0.07, ac.currentTime, 0.03);
  } catch (e) { /* rien */ }
}

export function toneStop() {
  try { if (gain && ac) gain.gain.setTargetAtTime(0, ac.currentTime, 0.05); } catch (e) { /* rien */ }
}
