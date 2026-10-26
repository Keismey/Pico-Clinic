// Défi du jour : texte à partager (sans rien dévoiler de la réparation) et partage du résultat.
// Téléphone : partage natif (navigator.share). Sinon, ou s'il échoue : copie dans le presse-papiers.
import { W } from './canvas.js';
import { t, getLang } from './i18n.js';
import { C, fitText, roundRect } from './ui.js';
import { dayEntry } from './daily.js';

const SHARE_URL = 'https://keismey.github.io/Pico-Clinic/';
const MEDAL = ['🔧', '🥉', '🥈', '🥇']; // 0 = patient pas réparé, 1 bronze, 2 argent, 3 or

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

// Le texte partagé : date, médaille, étoiles et temps du meilleur essai, essais utilisés, lien.
export function shareText(key) {
  const e = dayEntry(key);
  if (!e) return '';
  const [, m, d] = key.split('-').map(Number);
  const date = t('daily.share.date', { d, m: t('daily.share.m.' + m) });
  const badge = e.stars[0] ? e.best : 0;
  const stars = e.stars.map((on) => (on ? '⭐' : '☆')).join('');
  const parts = [MEDAL[badge] + ' ' + stars];
  if (e.time !== null && e.time !== undefined) parts.push(fmt(e.time));
  parts.push(e.tries <= 1 ? t('daily.share.try1') : t('daily.share.tries', { n: e.tries }));
  return [t('daily.share.head', { d: date }), parts.join(' · '), SHARE_URL + '?lang=' + getLang()].join('\n');
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
      try {
        await navigator.share({ text });
        return 'shared';
      } catch (e) {
        if (e && e.name === 'AbortError') return 'cancelled';
        // autre échec (non pris en charge, refusé…) : repli sur la copie
      }
    }
    return (await copy(text)) ? 'copied' : 'failed';
  } finally {
    busy = false;
  }
}
