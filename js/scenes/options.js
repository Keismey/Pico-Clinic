// V4b — Écran « Options » : langue, volumes, vibrations, tremblement réduit, gaucher, contrastes forts,
// puis, comme dans tous les jeux du studio : notes de mise à jour, sauvegarde (exporter / importer),
// signaler un bug, soutenir le studio, version et crédits ; effacer la sauvegarde (deux confirmations).
// Ouvert depuis l'écran titre.
import { W, H } from '../canvas.js';
import { t, getLang } from '../i18n.js';
import { Buttons, C, drawCreamBackground, drawText, fitText, roundRect, clamp, setContrast } from '../ui.js';
import { go } from '../scenes.js';
import { changeLang } from '../settings.js';
import { save, persist, resetSave } from '../save.js';
import { VERSION } from '../settings.js';
import { setMusicVol, setSfxVol, sfx } from '../audio.js';
import { vibrate } from '../feedback.js';
import { applyHand } from '../state.js';
import { drawGribouille } from '../portraits.js';
import { leftText } from './orders.js';

const X0 = 50, CW = W - 100;          // cartes des réglages
const SL = { x0: 110, x1: W - 110 };  // piste des curseurs de volume
const ROWS = {
  lang: { y: 200, h: 136 },
  music: { y: 346, h: 158 },
  sound: { y: 514, h: 158 },
  vibration: { y: 682, h: 124 },
  tremor: { y: 816, h: 124 },
  lefty: { y: 950, h: 124 },
  contrast: { y: 1084, h: 124 },
};
const SLIDERS = { music: 'musicVol', sound: 'sfxVol' };
const TOGGLES = ['vibration', 'tremor', 'lefty', 'contrast'];

let buttons, from, time, drag, confirm, toast;

const sliderY = (k) => ROWS[k].y + 106;

function setVol(k, v) {
  v = Math.round(clamp(v, 0, 1) * 20) / 20; // pas de 5 %
  if (k === 'music') setMusicVol(v); else setSfxVol(v);
}

function toggle(k) {
  save.settings[k] = !save.settings[k];
  if (k === 'contrast') setContrast(save.settings.contrast);
  if (k === 'lefty') applyHand();
  if (k === 'vibration' && save.settings.vibration) vibrate(30);
  persist();
}

// Fenêtre de confirmation (étape 1 puis 2) pour effacer la sauvegarde.
function openConfirm(step) {
  const b = new Buttons();
  b.add({ x: 110, y: 1180, w: 400, h: 150, size: 46, style: 'secondary', label: () => t('opt.cancel'), onTap: () => { confirm = null; } });
  b.add({
    x: 570, y: 1180, w: 400, h: 150, size: step === 1 ? 46 : 40,
    label: () => t(step === 1 ? 'opt.erase_yes' : 'opt.erase_final'),
    onTap: () => {
      if (step === 1) { openConfirm(2); return; }
      resetSave();
      confirm = null;
      vibrate([30, 40, 30]);
      toast = { t: 2.4 };
    },
  });
  confirm = { step, buttons: b, time: 0 };
}

function card(ctx, r) {
  ctx.fillStyle = '#d9c3a3';
  roundRect(ctx, X0, r.y + 8, CW, r.h - 8, 30); ctx.fill();
  ctx.fillStyle = C.paper;
  roundRect(ctx, X0, r.y, CW, r.h - 8, 30); ctx.fill();
}

function drawSlider(ctx, k) {
  const v = save.settings[SLIDERS[k]] || 0;
  const y = sliderY(k);
  const x = SL.x0 + v * (SL.x1 - SL.x0);
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#e2d0b4';
  ctx.lineWidth = 22;
  ctx.beginPath(); ctx.moveTo(SL.x0, y); ctx.lineTo(SL.x1, y); ctx.stroke();
  if (v > 0) {
    ctx.strokeStyle = C.turquoise;
    ctx.beginPath(); ctx.moveTo(SL.x0, y); ctx.lineTo(x, y); ctx.stroke();
  }
  const held = drag === k;
  ctx.fillStyle = C.copperDark;
  ctx.beginPath(); ctx.arc(x, y + 5, held ? 40 : 34, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = held ? C.orange : C.copper;
  ctx.beginPath(); ctx.arc(x, y, held ? 40 : 34, 0, Math.PI * 2); ctx.fill();
}

export default {
  init(params = {}) {
    from = params.from || 'title';
    time = 0;
    drag = null;
    confirm = null;
    toast = null;
    buttons = new Buttons();
    buttons.add({ x: 520, y: ROWS.lang.y + 12, w: 240, h: 106, size: 36, style: 'secondary', label: () => 'Français', selected: () => getLang() === 'fr', onTap: () => changeLang('fr') });
    buttons.add({ x: 780, y: ROWS.lang.y + 12, w: 240, h: 106, size: 36, style: 'secondary', label: () => 'English', selected: () => getLang() === 'en', onTap: () => changeLang('en') });
    for (const k of TOGGLES) {
      buttons.add({
        x: 790, y: ROWS[k].y + 8, w: 210, h: 100, size: 38, style: 'secondary',
        label: () => t(save.settings[k] ? 'opt.on' : 'opt.off'),
        selected: () => !!save.settings[k],
        onTap: () => toggle(k),
      });
    }
    // communs aux jeux du studio (commun/ks-studio.js)
    const lang = () => (getLang() === 'en' ? 'en' : 'fr');
    buttons.add({ x: 50, y: 1222, w: 480, h: 104, size: 34, style: 'secondary', label: () => t('opt.notes'), onTap: () => go('notes', { from: 'options' }) });
    buttons.add({ x: 550, y: 1222, w: 480, h: 104, size: 34, style: 'secondary', label: () => t('opt.save'),
      onTap: () => { if (window.KS) window.KS.saveDialog({ jeu: 'Pico-Clinic', keys: ['pico_save_v1'], lang: lang(), save: persist, file: 'pico-clinic', accent: '#3fd0bb' }); } });
    buttons.add({ x: 50, y: 1338, w: 480, h: 104, size: 34, style: 'secondary', label: () => t('opt.bug'), onTap: () => { persist(); if (window.KS) window.KS.bug('Pico-Clinic', lang()); } });
    buttons.add({ x: 550, y: 1338, w: 480, h: 104, size: 34, style: 'secondary', label: () => t('opt.support'), onTap: () => { if (window.KS) window.KS.support(); } });
    buttons.add({ x: 190, y: 1458, w: 700, h: 104, size: 36, style: 'secondary', label: () => t('opt.erase'), onTap: () => openConfirm(1) });
    buttons.add({ x: 240, y: 1590, w: 600, h: 150, size: 58, label: () => t('opt.back'), onTap: () => go(from) });
  },

  update(dt) {
    time += dt;
    if (confirm) confirm.time += dt;
    if (toast) { toast.t -= dt; if (toast.t <= 0) toast = null; }
  },

  draw(ctx) {
    drawCreamBackground(ctx);
    leftText(ctx, t('opt.title'), 60, 110, 700, 80, C.copperDark, 900);
    drawGribouille(ctx, 940, 110, 0.32, { time });

    for (const [k, r] of Object.entries(ROWS)) {
      card(ctx, r);
      if (k === 'lang') {
        leftText(ctx, t('opt.lang'), 90, r.y + 64, 400, 44, C.ink, 800);
      } else if (SLIDERS[k]) {
        const v = Math.round((save.settings[SLIDERS[k]] || 0) * 100);
        leftText(ctx, t('opt.' + k), 90, r.y + 44, 600, 44, C.ink, 800);
        fitText(ctx, v ? t('opt.pct', { n: v }) : t('opt.muted'), 880, r.y + 44, 240, 40, v ? C.turquoiseDark : C.inkSoft, 900);
        drawSlider(ctx, k);
      } else {
        leftText(ctx, t('opt.' + k), 90, r.y + 38, 680, 40, C.ink, 800);
        leftText(ctx, t('opt.' + k + '.sub'), 90, r.y + 82, 680, 28, C.inkSoft, 700);
      }
    }
    buttons.draw(ctx);
    fitText(ctx, t('title.version', { v: VERSION }), W / 2, 1790, W - 120, 30, C.inkSoft, 700);
    fitText(ctx, t('opt.credits'), W / 2, 1838, W - 120, 28, C.inkSoft, 600);

    if (toast) {
      const a = Math.min(1, toast.t * 2);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = C.turquoiseDark;
      roundRect(ctx, 140, 1480, W - 280, 90, 45); ctx.fill();
      fitText(ctx, t('opt.erased'), W / 2, 1525, W - 340, 38, '#fff', 800);
      ctx.restore();
    }
    if (confirm) this.drawConfirm(ctx);
  },

  drawConfirm(ctx) {
    const k = Math.min(1, confirm.time * 5);
    ctx.save();
    ctx.globalAlpha = k;
    ctx.fillStyle = 'rgba(58, 42, 30, 0.6)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#d9c3a3';
    roundRect(ctx, 60, 642, W - 120, 740, 44); ctx.fill();
    ctx.fillStyle = C.paper;
    roundRect(ctx, 60, 630, W - 120, 740, 44); ctx.fill();
    drawGribouille(ctx, W / 2, 760, 0.6, { time: confirm.time });
    const s = confirm.step;
    drawText(ctx, t(s === 1 ? 'opt.erase_q1' : 'opt.erase_q2'), W / 2, 905, W - 220, 54, { color: s === 1 ? C.copperDark : C.red, weight: 900 });
    drawText(ctx, t(s === 1 ? 'opt.erase_t1' : 'opt.erase_t2'), W / 2, 1040, W - 240, 36, { color: C.inkSoft, weight: 700, lineH: 46 });
    confirm.buttons.draw(ctx);
    ctx.restore();
  },

  back() {
    if (confirm) { confirm = null; return true; }
    go(from);
    return true;
  },

  pointer(type, x, y) {
    if (confirm) { confirm.buttons.pointer(type, x, y); return; }
    if (type === 'down') {
      // curseur : on attrape n'importe où sur la piste (zone large pour le pouce)
      for (const k of Object.keys(SLIDERS)) {
        if (Math.abs(y - sliderY(k)) < 55 && x > SL.x0 - 60 && x < SL.x1 + 60) {
          drag = k;
          setVol(k, (x - SL.x0) / (SL.x1 - SL.x0));
          vibrate(8);
          return;
        }
      }
    }
    if (drag) {
      if (type === 'move') setVol(drag, (x - SL.x0) / (SL.x1 - SL.x0));
      else if (type === 'up' || type === 'cancel') {
        // aperçu du volume des sons au relâchement
        if (drag === 'sound') sfx('coin');
        drag = null;
        persist();
      }
      return;
    }
    buttons.pointer(type, x, y);
  },
};
