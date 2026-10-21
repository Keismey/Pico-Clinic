// Atelier d'essai (lien « ?essai ») : essayer chaque geste secondaire sans toucher à la partie.
// Les réparations d'essai (data/orders.json → tests) ne paient rien et ne sont pas enregistrées.
import { W } from '../canvas.js';
import { t } from '../i18n.js';
import { Buttons, C, drawCreamBackground, drawText, fitText } from '../ui.js';
import { game } from '../state.js';
import { go } from '../scenes.js';

let buttons;

export default {
  init() {
    buttons = new Buttons();
    const list = game.data.tests || [];
    list.forEach((o, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      buttons.add({
        x: 70 + col * 480, y: 400 + row * 230, w: 460, h: 190, size: 44, style: 'secondary',
        label: () => t('sec.title.' + o.gesture),
        onTap: () => go('operation', { order: o.id }),
      });
    });
    buttons.add({ x: 240, y: 1700, w: 600, h: 150, size: 54, label: () => t('bench.menu'), onTap: () => go('title') });
  },

  update() {},

  draw(ctx) {
    drawCreamBackground(ctx);
    fitText(ctx, t('bench.title'), W / 2, 170, 900, 80, C.copperDark, 900);
    drawText(ctx, t('bench.sub'), W / 2, 290, 900, 38, { color: C.inkSoft, weight: 700 });
    buttons.draw(ctx);
  },

  pointer(type, x, y) {
    buttons.pointer(type, x, y);
  },
};
