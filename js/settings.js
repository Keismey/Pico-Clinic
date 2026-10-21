// Version du jeu et changement de langue (mémorisé dans la sauvegarde).
import { setLang } from './i18n.js';
import { save, persist } from './save.js';

export const VERSION = '0.6.0 · V2b';

export function changeLang(l) {
  setLang(l);
  save.settings.lang = l;
  persist();
}
