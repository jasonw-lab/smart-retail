import { Locale, defaultLocale, locales } from './config';

export function getUserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;

  const pathname = window.location.pathname;
  const matched = pathname.match(/^\/(ja|en)(?:\/|$)/);
  const matchedLocale = matched?.[1];
  if (matchedLocale && (locales as readonly string[]).includes(matchedLocale)) {
    return matchedLocale as Locale;
  }

  const browserLang = navigator.language.split('-')[0];
  if (browserLang && (locales as readonly string[]).includes(browserLang)) {
    return browserLang as Locale;
  }

  return defaultLocale;
}
