import { I18n } from './i18n.js';

export * from './i18n.js';
export * from './translate.js';

const i18n = I18n.createInstance();
i18n.init().catch(() => void 0);
export { i18n };
