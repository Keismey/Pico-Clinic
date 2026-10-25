// État partagé : données JSON chargées et réparation en cours.
import { D, faultSpot, spots, setLook, setTrace, setCut, setLayout, lp, assignBays } from './drone.js';
import { save } from './save.js';

export const game = { data: {}, repair: null, lastOrder: 'o01' };

export async function loadData() {
  const [gestures, patients, orders, tools, clients, ranks, rare, story, deco] = await Promise.all(
    ['gestures', 'patients', 'orders', 'tools', 'clients', 'ranks', 'rare_parts', 'story', 'decorations'].map((n) => fetch(`data/${n}.json`).then((r) => r.json()))
  );
  delete patients._doc;
  game.data.gestures = gestures;
  game.data.patients = patients;
  game.data.orders = orders.list;
  game.data.tests = orders.tests || [];
  game.data.tools = tools;
  game.data.clients = clients;
  game.data.ranks = ranks.list;
  game.data.rareParts = rare.list;
  game.data.story = story;
  game.data.decorations = deco.list;
}

export function getOrder(id) {
  if (id === 'free' && game.free) return game.free;
  return game.data.orders.find((o) => o.id === id) || game.data.tests.find((o) => o.id === id) || game.data.orders[0];
}

// Nombre de patients d'une commande (V3b : 2 ou 3 patients à la suite).
export function patientCount(o) {
  return o && o.patients ? o.patients.length : 1;
}

// Disposition de la carte : fixe pour une commande (rejouer = même carte), variée d'une commande à l'autre.
// Les 6 premières commandes (tutoriel) gardent la disposition de base.
function layoutOf(o, part) {
  if (o.layout !== undefined) return o.layout;
  if (!o.n || o.n <= 6) return 0;
  return (o.n * 5 + part * 3) % 4;
}

// Niveau d'un outil (1 à 3) dans la sauvegarde.
export function toolLevel(k) {
  const n = game.data.tools[k] ? game.data.tools[k].levels.length : 3;
  return Math.max(1, Math.min(n, (save.tools && save.tools[k]) || 1));
}

// Réglages des gestes pour cette réparation, modifiés par les outils achetés.
export function toolGestures() {
  const g = JSON.parse(JSON.stringify(game.data.gestures));
  const T = game.data.tools;
  const e = (k, name) => T[k].effect[name][toolLevel(k) - 1];
  // dévisseuse : maintenir le doigt sur la vis suffit
  g.unscrew.hold_turns = T.driver ? e('driver', 'hold_turns') : 0;
  g.solder.tolerance_bonus = e('iron', 'tolerance_bonus');
  g.solder.burn_time *= e('iron', 'burn_factor');
  g.vacuum.radius = Math.round(g.vacuum.radius * e('vacuum', 'radius_factor'));
  g.magnifier.hold *= e('lens', 'hold_factor');
  g.magnifier.scan = e('lens', 'scan');
  g.chip.snap_radius = Math.round(g.chip.snap_radius * e('tweezers', 'snap_factor'));
  g.capacitor.snap_radius = Math.round(g.capacitor.snap_radius * e('tweezers', 'snap_factor'));
  // V3a : la pince aide aussi pour les piles (même aimantation que les puces) et les broches
  g.batteries.snap_radius = g.chip.snap_radius;
  g.pins.tolerance *= e('tweezers', 'snap_factor');
  return g;
}

// Patient d'une commande : le modèle (data/patients.json) complété par la commande (data/orders.json).
// part = numéro du patient dans une commande à plusieurs patients (o.patients[part] complète la commande).
export function buildPatient(orderId, part = 0) {
  const o = getOrder(orderId);
  const parts = patientCount(o);
  part = Math.max(0, Math.min(parts - 1, part));
  // chaque patient d'une commande multiple a ses propres pannes ; le reste vient de la commande
  const q = o.patients ? { n: o.n, ...o.patients[part] } : o;
  const m = game.data.patients[q.model] || game.data.patients.mini_drone;
  return {
    id: o.id,
    order: o,
    part, parts,
    model: m,
    family: m.family,
    name: q.name || 'patient.' + m.id,
    look: { family: m.family, ...m.look, ...(q.look || {}) },
    rank: o.rank || m.rank_min,
    trace: q.trace || m.trace,
    cuts: q.cuts || 1,
    pins: q.pins,
    layout: layoutOf(q, part),
    faults: q.faults || [],
    hidden_faults: q.hidden || [],
    rusty_screws: q.rusty_screws || [],
    rust: q.rust || [],
    fragile: q.fragile || m.fragile || [[625, 852, 30, 48], [452, 800, 30, 48]],
    decoys: q.decoys || [],
    target_time: o.target_time,
    reward: o.reward,
  };
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

// Remet la carte (disposition, piste, morceau en cours, apparence) d'une réparation déjà commencée.
export function restoreBoard(rep) {
  setLayout(rep.patient.layout);
  setTrace(rep.patient.trace, rep.patient.cuts);
  setCut(rep.weld.cut || 0);
  setLook(rep.patient.look);
  spots.bay = rep.bay;
  spots.fragile = rep.fragile;
}

// part > 0 : patient suivant d'une commande à plusieurs patients (les précédents restent dans game.multi).
export function newRepair(orderId, part = 0) {
  const p = buildPatient(orderId, part);
  if (p.part === 0) game.multi = [];
  game.lastOrder = p.id;
  setLook(p.look);
  // disposition de la carte, puis tout ce qui est placé dessus passe par le miroir
  setLayout(p.layout);
  setTrace(p.trace, p.cuts);
  p.rust = p.rust.map(([x, y, r]) => [...lp(x, y), r]);
  p.decoys = p.decoys.map(([x, y]) => lp(x, y));
  p.fragile = p.fragile.map(([x, y, w, h]) => [...lp(x, y), w, h]);
  const g = toolGestures();
  // pièces de rechange plus chères aux rangs élevés (équilibrage V3b)
  const costs = g.scoring.capacitor_cost_by_rank;
  if (costs) g.scoring.capacitor_cost = costs[Math.min(5, p.rank) - 1];
  const u = g.unscrew;
  // scanner : les pannes cachées sont affichées dès l'ouverture
  const scanned = g.magnifier.scan && p.hidden_faults.length > 0;
  // pièces des gestes secondaires (avant les cibles de la loupe, qui s'en servent)
  spots.bay = assignBays(p.faults);
  game.repair = {
    patient: p,
    g,
    scanned,
    screws: CORNERS.map(([sx, sy], i) => ({
      i,
      dx: sx * D.screwOff, dy: sy * D.screwOff,
      x: D.cx + sx * D.screwOff, y: D.cy + sy * D.screwOff,
      r: u.screw_radius,
      rusty: p.rusty_screws.includes(i),
      turned: 0, angle: i * 0.7, progress: 0,
      out: false, fly: null, inTray: false, damaged: 0,
    })),
    coverOpen: false,
    coverAnim: 0,
    faults: new Set(p.faults),
    plug: p.faults.includes('connector_unplugged')
      ? { x: D.plugStart.x, y: D.plugStart.y, connected: false, lift: false }
      : { x: D.socket.x, y: D.socket.y, connected: true, lift: false },
    // soudure de la piste coupée (déjà faite si le patient n'a pas cette panne)
    // cut = morceau en cours, prev = étain des morceaux déjà soudés, segScores = leurs notes
    weld: {
      cells: [], progress: 0, done: !p.faults.includes('trace_cut'), active: false,
      devSum: 0, devN: 0, burns: 0, shorts: 0, score: null,
      cut: 0, prev: [], segScores: [],
    },
    // puce : l'ancienne (grillée) et la neuve
    chip: p.faults.includes('chip_burnt')
      ? { old: { x: D.slot.x, y: D.slot.y, state: 'slot', fly: null }, neu: { x: D.box.x, y: D.box.y, state: 'box', fly: null }, score: null }
      : { old: { x: 0, y: 0, state: 'gone', fly: null }, neu: { x: D.slot.x, y: D.slot.y, state: 'placed', fly: null }, score: null },
    // V1a : diagnostic à la loupe, rouille, composants fragiles
    phase: p.hidden_faults.length && !scanned ? 'diag' : 'repair',
    diag: {
      hidden: new Set(p.hidden_faults),
      revealed: new Set(scanned ? p.hidden_faults : []),
      targets: [
        ...p.hidden_faults.map((f) => ({ id: f, kind: 'fault', ...faultSpot(f), done: scanned })),
        ...p.decoys.map(([x, y], i) => ({ id: 'decoy' + i, kind: 'decoy', x, y, done: false })),
      ],
      time: 0,
      penalty: 0,
    },
    // pas de rouille sur les condensateurs (ni juste autour) : on peut tout nettoyer sans les toucher
    rust: buildRust(p.rust, g.vacuum.cell, p.fragile),
    // fragile : wear = temps frotté, broken = à remplacer, removed = sorti, breaks = nombre de casses
    fragile: p.fragile.map(([x, y, w, h], i) => ({ i, x, y, w, h, wear: 0, broken: false, removed: false, breaks: 0 })),
    slips: 0,
    // V3a : gestes secondaires (bay = où est chaque pièce, care = points de soin perdus, scores = précisions)
    bay: spots.bay,
    care: 0,
    scores: [],
    elapsed: 0,
    attempts: 0,
  };
  // atelier d'essai : pas de vis à retirer, le capot est déjà ouvert
  if (p.order.test) {
    for (const s of game.repair.screws) { s.out = true; s.inTray = true; s.slot = s.i; }
    Object.assign(game.repair, { coverLoose: true, coverOpen: true, coverAnim: 1 });
  }
  spots.fragile = game.repair.fragile;
  return game.repair;
}
