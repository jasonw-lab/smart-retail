import { Locale, defaultLocale, locales } from './config';

export function getUserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;

  const pathname = window.location.pathname;
  const matched = pathname.match(/^\/(ja|en)(?:\/|$)/);
  if (matched && (locales as readonly string[]).includes(matched[1])) {
    return matched[1] as Locale;
  }

  const browserLang = navigator.language.split('-')[0];
  if ((locales as readonly string[]).includes(browserLang)) {
    return browserLang as Locale;
  }

  return defaultLocale;
}
