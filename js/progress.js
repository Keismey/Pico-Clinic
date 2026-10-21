// Progression : commandes débloquées une à une, examen de rang, achats d'outils.
import { game, toolLevel } from './state.js';
import { save, persist, totalStars } from './save.js';

export const TOOL_KEYS = ['iron', 'vacuum', 'lens', 'tweezers'];

function paid(o) {
  return !!(o && save.orders[o.id] && save.orders[o.id].paid);
}

// 'done' (déjà réussie), 'open' (jouable), 'locked' (finir la précédente), 'stars' (examen : pas assez d'étoiles).
export function orderState(o) {
  if (paid(o)) return 'done';
  const list = game.data.orders;
  const i = list.indexOf(o);
  if (i > 0 && !paid(list[i - 1])) return 'locked';
  if (o.stars_needed && totalStars() < o.stars_needed) return 'stars';
  return 'open';
}

export function orderStars(o) {
  const r = save.orders[o.id];
  return r ? r.stars.filter(Boolean).length : 0;
}

export function nextOrder(o) {
  const list = game.data.orders;
  return list[list.indexOf(o) + 1] || null;
}

// Prochain niveau d'un outil : { id, price, rank } ou null s'il est au maximum.
export function nextTool(k) {
  return game.data.tools[k].levels[toolLevel(k)] || null;
}

export function currentTool(k) {
  return game.data.tools[k].levels[toolLevel(k) - 1];
}

// 'max', 'rank' (rang trop bas), 'money' (pas assez de crédits) ou 'ok'.
export function buyState(k) {
  const n = nextTool(k);
  if (!n) return 'max';
  if (save.rank < n.rank) return 'rank';
  if (save.credits < n.price) return 'money';
  return 'ok';
}

export function buyTool(k) {
  if (buyState(k) !== 'ok') return false;
  const n = nextTool(k);
  save.credits -= n.price;
  save.tools[k] = toolLevel(k) + 1;
  persist();
  return true;
}
