// Gestion des scènes : chaque écran a init / update / draw / pointer.
import * as fx from './particles.js';
import { music, loopStopAll, pitchStop } from './audio.js';

// Musique de chaque écran : opération pendant les gestes, atelier ailleurs.
const MUSIC = { operation: 'op', reactivation: 'op', bench: 'op' };

const scenes = {};
let current = null;
let currentName = '';

export function register(name, scene) {
  scenes[name] = scene;
}

export function go(name, params = {}) {
  current = scenes[name];
  currentName = name;
  fx.clear();
  loopStopAll();
  pitchStop();
  music(MUSIC[name] || 'workshop');
  if (current.init) current.init(params);
}

export function scene() {
  return current;
}

export function sceneName() {
  return currentName;
}
