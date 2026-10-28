// Défi du jour : texte à partager (sans rien dévoiler de la réparation) et partage du résultat.
// Téléphone : partage natif (navigator.share) avec une image du résultat + le texte.
// Si l'image n'est pas acceptée : texte seul. Sinon, ou s'il échoue : copie dans le presse-papiers.
import { W } from './canvas.js';
import { t, getLang } from './i18n.js';
import { C, fitText, roundRect } from './ui.js';
import { dayEntry } from './daily.js';

const SHARE_URL = 'https://keismey.github.io/Pico-Clinic/';
const MEDAL = ['🔧', '🥉', '🥈', '🥇']; // 0 = patient pas réparé, 1 bronze, 2 argent, 3 or

// Illustration du jeu, préchargée pour que l'image soit prête au moment du clic.
const cover = new Image();
cover.src = 'couverture.webp';

// « 1:42 », comme dans le reste du jeu.
function fmt(sec) {
  const s = Math.round(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Au moins un essai joué ce jour-là : le bouton « Partager » peut apparaître.
export function canShare(key) {
  const e = dayEntry(key);
  return !!e && e.tries > 0;
}

// Les morceaux du résultat, utilisés par le texte et par l'image.
function resultParts(key) {
  const e = dayEntry(key);
  if (!e) return null;
  const [, m, d] = key.split('-').map(Number);
  const date = t('daily.share.date', { d, m: t('daily.share.m.' + m) });
  const badge = e.stars[0] ? e.best : 0;
  const stars = e.stars.map((on) => (on ? '⭐' : '☆')).join('');
  const parts = [MEDAL[badge] + ' ' + stars];
  if (e.time !== null && e.time !== undefined) parts.push(fmt(e.time));
  parts.push(e.tries <= 1 ? t('daily.share.try1') : t('daily.share.tries', { n: e.tries }));
  return { head: t('daily.share.head', { d: date }), medal: MEDAL[badge], stars, rest: parts.slice(1).join(' · '), line: parts.join(' · ') };
}

// Le texte partagé : date, médaille, étoiles et temps du meilleur essai, essais utilisés, lien.
export function shareText(key) {
  const p = resultParts(key);
  if (!p) return '';
  return [p.head, p.line, SHARE_URL + '?lang=' + getLang()].join('\n');
}

// L'image partagée (1080×1080) : illustration du jeu en haut, carte du résultat en bas.
function shareImage(key) {
  const p = resultParts(key);
  if (!p) return Promise.resolve(null);
  const S = 1080;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = C.turquoiseDark;
  g.fillRect(0, 0, S, S);
  if (cover.complete && cover.naturalWidth) {
    // remplit la largeur, cadré sur le haut de l'illustration
    const k = S / cover.naturalWidth;
    g.drawImage(cover, 0, 0, S, cover.naturalHeight * k);
  }
  // carte blanche du résultat
  g.fillStyle = 'rgba(255,255,255,0.95)';
  roundRect(g, 60, 560, S - 120, 460, 48);
  g.fill();
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  fitText(g, p.head, S / 2, 640, S - 200, 52, C.turquoiseDark, 900);
  fitText(g, p.medal + ' ' + p.stars, S / 2, 770, S - 200, 110, '#222', 900);
  fitText(g, p.rest, S / 2, 890, S - 200, 56, '#333', 700);
  fitText(g, 'keismey.github.io/Pico-Clinic', S / 2, 970, S - 200, 36, '#777', 600);
  return new Promise((res) => {
    try { c.toBlob((b) => res(b), 'image/png'); } catch (e) { res(null); }
  });
}

// Copie dans le presse-papiers ; repli sur l'ancienne méthode si l'API moderne n'existe pas.
async function copy(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) { /* on essaie l'autre méthode */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;left:-1000px;top:0;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    ta.remove();
    return !!ok;
  } catch (e) {
    return false;
  }
}

// Message « Résultat copié ! » : une pastille qui recouvre un instant la rangée de boutons du bas (k : 1 → 0).
export function shareToast(r) {
  return r === 'copied' || r === 'failed' ? { key: r === 'copied' ? 'daily.share.copied' : 'daily.share.failed', t: 2, max: 2 } : null;
}

export function drawShareToast(ctx, toast) {
  ctx.save();
  ctx.globalAlpha = Math.min(1, (toast.t / toast.max) * 4);
  ctx.fillStyle = toast.key === 'daily.share.failed' ? C.red : C.turquoiseDark;
  roundRect(ctx, 50, 1700, W - 100, 150, 36); // même emplacement que la rangée de boutons, qu'elle recouvre
  ctx.fill();
  fitText(ctx, t(toast.key), W / 2, 1775, W - 200, 60, '#fff', 900);
  ctx.restore();
}

let busy = false;

// Renvoie 'shared' | 'cancelled' | 'copied' | 'failed' | 'busy'.
// Annuler le partage natif n'est pas une erreur : on ne copie rien et on n'affiche rien.
export async function shareResult(key) {
  if (busy) return 'busy'; // la feuille de partage est déjà ouverte
  const text = shareText(key);
  if (!text) return 'failed';
  busy = true;
  try {
    if (typeof navigator.share === 'function') {
      // 1) image + texte, si l'appareil accepte les fichiers
      try {
        const blob = await shareImage(key);
        if (blob) {
          const file = new File([blob], 'pico-clinic.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], text });
            return 'shared';
          }
        }
      } catch (e) {
        if (e && e.name === 'AbortError') return 'cancelled';
        // échec avec l'image : on retente en texte seul
      }
      // 2) texte seul
      try {
        await navigator.share({ text });
        return 'shared';
      } catch (e) {
        if (e && e.name === 'AbortError') return 'cancelled';
      }
    }
    return (await copy(text)) ? 'copied' : 'failed';
  } finally {
    busy = false;
  }
}
