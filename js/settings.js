// Version du jeu et changement de langue (mémorisé dans la sauvegarde).
import { setLang } from './i18n.js';
import { save, persist } from './save.js';

export const VERSION = '0.8.0 · V4a';

export function changeLang(l) {
  setLang(l);
  save.settings.lang = l;
  persist();
}
