// V3b — Atelier libre (rang 5) : un patient et des pannes tirés au hasard, au rang choisi.
// Gains à 50 %, pas de pièce rare, étoiles non comptées pour les rangs (GDD 02-progression).
import { game } from './state.js';

export const FREE = {
  // pannes par réparation, temps cible et paie de base (avant les 50 %), par rang
  faults: [[1, 2], [2, 3], [2, 4], [3, 4], [3, 5]],
  time: [120, 150, 180, 200, 220],
  base: [45, 75, 130, 230, 400],
  ratio: 0.5,
  rust: [[560, 850, 88], [445, 790, 68], [700, 1000, 60], [400, 840, 80], [560, 880, 60], [400, 980, 60]],
  decoys: [[760, 860], [560, 1000], [370, 967]],
};

// Hasard utilisé par makeFree : Math.random, ou un hasard fixe (défi quotidien : même tirage pour tous).
let R = Math.random;
const pick = (a) => a[Math.floor(R() * a.length)];
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const BATTERY_LIKE = ['battery_swollen', 'heart_battery'];
const SECONDARY = ['battery_swollen', 'heart_battery', 'gear_stuck', 'sensor', 'pin_bent', 'spring_loose', 'batteries_low', 'oxidized'];
// pannes que le jeu sait faire (les élytres à clips et les coutures ne sont pas encore jouables)
const PLAYABLE = ['connector_unplugged', 'chip_burnt', 'trace_cut', ...SECONDARY];

// Fabrique la commande « free » (game.free). test = depuis l'atelier d'essai (rien n'est payé).
// rng : hasard à utiliser (défi quotidien), sinon Math.random.
export function makeFree(rank, test = false, rng = null) {
  R = rng || Math.random;
  try { return build(rank, test); } finally { R = Math.random; }
}

function build(rank, test) {
  const r = Math.max(1, Math.min(5, rank || 1));
  const models = Object.values(game.data.patients).filter((m) => m.rank_min <= r && m.family !== 'proto');
  const m = pick(models);
  const pool = shuffle([...new Set([...m.faults_pool, 'chip_burnt', 'trace_cut'])].filter((f) => PLAYABLE.includes(f)));
  const wantsRust = m.faults_pool.includes('rust') || R() < 0.4;
  const [lo, hi] = FREE.faults[r - 1];
  let n = lo + Math.floor(R() * (hi - lo + 1));
  if (wantsRust) n = Math.max(1, n - 1); // la rouille compte comme une panne
  const faults = [];
  let sec = 0;
  for (const f of pool) {
    if (faults.length >= n) break;
    if (BATTERY_LIKE.includes(f) && faults.some((x) => BATTERY_LIKE.includes(x))) continue;
    if (f === 'heart_battery' && m.id !== 'plush_robot') continue;
    if (SECONDARY.includes(f) && !BATTERY_LIKE.includes(f)) { if (sec >= 3) continue; sec++; }
    faults.push(f);
  }
  if (!faults.length) faults.push('chip_burnt');
  const o = {
    id: 'free', n: 0, free: true, test, rank: r, client: 'passage', model: m.id,
    faults, target_time: FREE.time[r - 1] + Math.max(0, faults.length - 2) * 20,
    reward: Math.round(FREE.base[r - 1] * FREE.ratio),
    layout: Math.floor(R() * 4),
  };
  if (faults.includes('trace_cut')) {
    o.trace = pick(['straight', 'curve', 'wave']);
    if (r >= 3 && o.trace !== 'straight' && R() < 0.5) o.cuts = r >= 5 ? pick([2, 3]) : 2;
  }
  if (faults.includes('pin_bent')) o.pins = Math.min(4, 1 + Math.floor(R() * r));
  // pannes cachées (diagnostic à la loupe) à partir du rang 2
  if (r >= 2) {
    const hide = ['chip_burnt', 'trace_cut'].filter((f) => faults.includes(f) && R() < 0.5);
    if (hide.length) {
      o.hidden = hide;
      const battery = faults.some((f) => BATTERY_LIKE.includes(f));
      o.decoys = FREE.decoys.filter(([x]) => !battery || x !== 370).slice(0, 2);
    }
  }
  if (wantsRust) o.rust = shuffle(FREE.rust.slice()).slice(0, 1 + Math.floor(R() * Math.min(3, r)));
  const rusty = Math.floor(R() * Math.min(3, r));
  if (rusty) o.rusty_screws = shuffle([0, 1, 2, 3]).slice(0, rusty);
  game.free = o;
  return o;
}
