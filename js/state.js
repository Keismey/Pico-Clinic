// État partagé : données JSON chargées et réparation en cours.
import { D, faultSpot, spots } from './drone.js';

export const game = { data: {}, repair: null };

export async function loadData() {
  const [gestures, patients] = await Promise.all(
    ['gestures', 'patients'].map((n) => fetch(`data/${n}.json`).then((r) => r.json()))
  );
  game.data.gestures = gestures;
  game.data.patients = patients;
}

const CORNERS = [[-1, -1], [1, -1], [1, 1], [-1, 1]];

// Petit hasard fixe (toujours le même dessin de rouille pour un patient).
function hash(a, b) {
  const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

// Plaques de rouille [x, y, rayon] → cellules dont l'opacité baisse quand on aspire.
function buildRust(patches, cell, fragile = []) {
  const near = (x, y) => (fragile || []).some(([fx, fy, w, h]) => Math.abs(x - fx) < w / 2 + 14 && Math.abs(y - fy) < h / 2 + 14);
  const cells = [];
  for (const [cx, cy, r] of patches || []) {
    for (let y = cy - r; y <= cy + r; y += cell) {
      for (let x = cx - r; x <= cx + r; x += cell) {
        const d = Math.hypot(x - cx, y - cy);
        const edge = r * (0.72 + 0.28 * hash(Math.round(x), Math.round(y)));
        if (d > edge || near(x, y)) continue;
        if (cells.some((c) => c.x === x && c.y === y)) continue;
        const a = 0.55 + 0.45 * hash(y, x) * (1 - (0.5 * d) / edge);
        cells.push({ x, y, a, a0: a, dark: hash(x + 7, y + 3) > 0.7 });
      }
    }
  }
  return { cells, total: cells.reduce((s, c) => s + c.a0, 0) };
}

export function newRepair(patientId) {
  const p = game.data.patients[patientId];
  const u = game.data.gestures.unscrew;
  game.repair = {
    patient: p,
    screws: CORNERS.map(([sx, sy], i) => ({
      i,
      dx: sx * D.screwOff, dy: sy * D.screwOff,
      x: D.cx + sx * D.screwOff, y: D.cy + sy * D.screwOff,
      r: u.screw_radius,
      rusty: (p.rusty_screws || []).includes(i),
      turned: 0, angle: i * 0.7, progress: 0,
      out: false, fly: null, inTray: false, damaged: 0,
    })),
    coverOpen: false,
    coverAnim: 0,
    faults: new Set(p.faults),
    plug: { x: D.plugStart.x, y: D.plugStart.y, connected: false, lift: false },
    // soudure de la piste coupée (déjà faite si le patient n'a pas cette panne)
    weld: {
      cells: [], progress: 0, done: !p.faults.includes('trace_cut'), active: false,
      devSum: 0, devN: 0, burns: 0, shorts: 0, score: null,
    },
    // puce : l'ancienne (grillée) et la neuve
    chip: p.faults.includes('chip_burnt')
      ? { old: { x: D.slot.x, y: D.slot.y, state: 'slot', fly: null }, neu: { x: D.box.x, y: D.box.y, state: 'box', fly: null }, score: null }
      : { old: { x: 0, y: 0, state: 'gone', fly: null }, neu: { x: D.slot.x, y: D.slot.y, state: 'placed', fly: null }, score: null },
    // V1a : diagnostic à la loupe, rouille, composants fragiles
    phase: (p.hidden_faults || []).length ? 'diag' : 'repair',
    diag: {
      hidden: new Set(p.hidden_faults || []),
      revealed: new Set(),
      targets: [
        ...(p.hidden_faults || []).map((f) => ({ id: f, kind: 'fault', ...faultSpot(f), done: false })),
        ...(p.decoys || []).map(([x, y], i) => ({ id: 'decoy' + i, kind: 'decoy', x, y, done: false })),
      ],
      time: 0,
      penalty: 0,
    },
    // pas de rouille sur les condensateurs (ni juste autour) : on peut tout nettoyer sans les toucher
    rust: buildRust(p.rust, game.data.gestures.vacuum.cell, p.fragile),
    // fragile : wear = temps frotté, broken = à remplacer, removed = sorti, breaks = nombre de casses
    fragile: (p.fragile || []).map(([x, y, w, h], i) => ({ i, x, y, w, h, wear: 0, broken: false, removed: false, breaks: 0 })),
    slips: 0,
    elapsed: 0,
    attempts: 0,
  };
  spots.fragile = game.repair.fragile;
  return game.repair;
}
