// État partagé : données JSON chargées et réparation en cours.
import { D } from './drone.js';

export const game = { data: {}, repair: null };

export async function loadData() {
  const [gestures, patients] = await Promise.all(
    ['gestures', 'patients'].map((n) => fetch(`data/${n}.json`).then((r) => r.json()))
  );
  game.data.gestures = gestures;
  game.data.patients = patients;
}

const CORNERS = [[-1, -1], [1, -1], [1, 1], [-1, 1]];

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
    cleanliness: 100,
    slips: 0,
    elapsed: 0,
    attempts: 0,
  };
  return game.repair;
}
