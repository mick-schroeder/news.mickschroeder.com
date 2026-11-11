import { defaultLocale, type Locale } from "../i18n/locales.ts"

/** Site path in a language, e.g. ("ga", "tags/tech/") → "/ga/tags/tech/". */
export const localePath = (locale: Locale, suffix = "") =>
  `${locale === defaultLocale ? "" : `/${locale}`}/${suffix}`
