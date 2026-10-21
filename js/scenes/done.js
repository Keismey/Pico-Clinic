// Fin de réparation (provisoire : les étoiles et les crédits arrivent en V1).
import { W } from '../canvas.js';
import { t } from '../i18n.js';
import { Buttons, C, drawCreamBackground, drawText, fitText } from '../ui.js';
import { withDrone, drawShadow, drawFrame, drawCover } from '../drone.js';
import { game } from '../state.js';
import { go } from '../scenes.js';

let rep, buttons, time;

function fmt(sec) {
  const s = Math.round(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default {
  init() {
    rep = game.repair;
    time = 0;
    buttons = new Buttons();
    buttons.add({ x: 190, y: 1440, w: 700, h: 170, size: 68, label: () => t('done.replay'), onTap: () => go('operation', {}) });
    buttons.add({ x: 290, y: 1660, w: 500, h: 150, style: 'secondary', label: () => t('done.menu'), onTap: () => go('title') });
  },

  update(dt) {
    time += dt;
  },

  draw(ctx) {
    drawCreamBackground(ctx);
    drawText(ctx, t('done.title'), W / 2, 235, 900, 120, { color: C.turquoise, weight: 900, stroke: C.copperDark });

    const bob = Math.sin(time * 2.4) * 22;
    withDrone(ctx, W / 2, 880, 0.66, () => drawShadow(ctx, 0.8));
    withDrone(ctx, W / 2, 760 + bob, 0.72, () => {
      drawFrame(ctx, { rotorAngle: time * 45, rotorSpeed: 48, lights: [0, 1, 2, 3].map((i) => (Math.floor(time * 4) + i) % 2 === 0) });
      drawCover(ctx, { screws: rep.screws });
    });

    const lines = [
      t('done.time', { t: fmt(rep.elapsed) }),
      t('done.slips', { n: rep.slips }),
      t('done.attempts', { n: rep.attempts }),
    ];
    // précision moyenne des soudures et des alignements de puce
    const scores = [rep.weld.score, rep.chip.score].filter((v) => v !== null && v !== undefined);
    if (scores.length) lines.push(t('done.precision', { p: Math.round(100 * scores.reduce((a, b) => a + b, 0) / scores.length) }));
    if (rep.weld.burns || rep.weld.shorts) lines.push(t('done.solder', { b: rep.weld.burns, s: rep.weld.shorts }));
    lines.forEach((l, i) => fitText(ctx, l, W / 2, 1170 + i * 56, 860, 42, C.ink, 700));
    buttons.draw(ctx);
  },

  pointer(type, x, y) {
    buttons.pointer(type, x, y);
  },
};
