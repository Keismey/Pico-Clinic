// Écran titre : logo, drone animé, Jouer, choix de la langue.
import { W } from '../canvas.js';
import { t, getLang } from '../i18n.js';
import { Buttons, C, drawCreamBackground, drawText, fitText } from '../ui.js';
import { withDrone, drawShadow, drawFrame, drawCover, setLook } from '../drone.js';
import { go } from '../scenes.js';
import { changeLang, VERSION } from '../settings.js';
import { save, totalStars } from '../save.js';
import { seen } from '../tutorial.js';

// Toute première partie : le chapitre 1 commence directement, puis Léa arrive au comptoir.
function play() {
  const first = !seen('ch1') && !(save.orders.o01 && save.orders.o01.paid);
  if (first) go('story', { id: 'ch1', then: { scene: 'counter', params: { order: 'o01', mode: 'intro' } } });
  else go('orders');
}

let buttons;
let time = 0;

export default {
  init() {
    setLook(null); // le mini-drone jouet de l'écran titre
    time = 0;
    buttons = new Buttons();
    buttons.add({ x: 200, y: 1360, w: 680, h: 170, size: 72, label: () => t('title.play'), onTap: () => play() });
    buttons.add({ x: 200, y: 1590, w: 320, h: 130, style: 'secondary', label: () => 'Français', selected: () => getLang() === 'fr', onTap: () => changeLang('fr') });
    buttons.add({ x: 560, y: 1590, w: 320, h: 130, style: 'secondary', label: () => 'English', selected: () => getLang() === 'en', onTap: () => changeLang('en') });
    // V4b : Options (volumes, vibrations, accessibilité, effacer la sauvegarde)
    buttons.add({ x: 290, y: 1745, w: 500, h: 110, size: 40, style: 'secondary', label: () => t('title.options'), onTap: () => go('options', { from: 'title' }) });
  },

  update(dt) {
    time += dt;
  },

  draw(ctx) {
    drawCreamBackground(ctx);
    // logo
    ctx.save();
    ctx.translate(W / 2, 250);
    ctx.rotate(-0.03);
    ctx.font = '900 150px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 34;
    ctx.strokeStyle = C.copperDark;
    ctx.strokeText(t('game.title'), 0, 0);
    ctx.fillStyle = C.turquoise;
    ctx.fillText(t('game.title'), 0, 0);
    ctx.restore();
    drawText(ctx, t('title.subtitle'), W / 2, 420, 860, 52, { color: C.inkSoft, weight: 700 });

    // drone qui flotte
    const bob = Math.sin(time * 2) * 18;
    withDrone(ctx, W / 2, 900, 0.82, () => {
      drawShadow(ctx, 0.4);
    });
    withDrone(ctx, W / 2, 860 + bob, 0.82, () => {
      drawFrame(ctx, { rotorAngle: time * 30, rotorSpeed: 30, lights: [1, 0, 1, 0].map((v, i) => (Math.floor(time * 3) + i) % 2) });
      drawCover(ctx);
    });

    fitText(ctx, t('title.wallet', { n: save.credits, s: totalStars() }), W / 2, 1318, 860, 40, C.copperDark, 800);
    fitText(ctx, t('title.language'), W / 2, 1562, 600, 36, C.inkSoft, 700);
    buttons.draw(ctx);
    fitText(ctx, t('title.version', { v: VERSION }), W / 2, 1885, 800, 30, C.inkSoft, 500);
  },

  pointer(type, x, y) {
    buttons.pointer(type, x, y);
  },
};
