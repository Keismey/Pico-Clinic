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
    cleanliness: 100,
    slips: 0,
    elapsed: 0,
    attempts: 0,
  };
  return game.repair;
}
