// Version du jeu et changement de langue (mémorisé dans la sauvegarde).
import { setLang } from './i18n.js';
import { save, persist } from './save.js';

export const VERSION = '1.0.0';

export function changeLang(l) {
  setLang(l);
  save.settings.lang = l;
  persist();
}
