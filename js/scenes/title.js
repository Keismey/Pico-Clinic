// Écran titre : logo, drone animé, Jouer, choix de la langue.
import { W } from '../canvas.js';
import { t, getLang } from '../i18n.js';
import { Buttons, C, drawCreamBackground, drawText, fitText } from '../ui.js';
import { withDrone, drawShadow, drawFrame, drawCover, setLook } from '../drone.js';
import { go } from '../scenes.js';
import { changeLang, VERSION } from '../settings.js';
import { save, resetSave, totalStars } from '../save.js';

let buttons;
let time = 0;
let confirmReset = 0; // > 0 : en attente de la 2e touche pour effacer

export default {
  init() {
    setLook(null); // le mini-drone jouet de l'écran titre
    time = 0;
    confirmReset = 0;
    buttons = new Buttons();
    buttons.add({ x: 200, y: 1360, w: 680, h: 170, size: 72, label: () => t('title.play'), onTap: () => go('orders') });
    buttons.add({ x: 200, y: 1590, w: 320, h: 130, style: 'secondary', label: () => 'Français', selected: () => getLang() === 'fr', onTap: () => changeLang('fr') });
    buttons.add({ x: 560, y: 1590, w: 320, h: 130, style: 'secondary', label: () => 'English', selected: () => getLang() === 'en', onTap: () => changeLang('en') });
    // Nouvelle partie : deux touches pour ne pas effacer par erreur
    buttons.add({
      x: 290, y: 1745, w: 500, h: 96, size: 32, style: 'secondary',
      label: () => t(confirmReset > 0 ? 'title.reset_confirm' : 'title.reset'),
      onTap: () => {
        if (confirmReset > 0) { resetSave(); confirmReset = 0; } else confirmReset = 3;
      },
    });
  },

  update(dt) {
    time += dt;
    if (confirmReset > 0) confirmReset -= dt;
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
