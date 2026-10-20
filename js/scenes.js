// Gestion des scènes : chaque écran a init / update / draw / pointer.
import * as fx from './particles.js';

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
  if (current.init) current.init(params);
}

export function scene() {
  return current;
}

export function sceneName() {
  return currentName;
}
