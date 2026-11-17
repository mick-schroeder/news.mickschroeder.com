export const languages = {
  en: {
    label: "English",
    socialLocale: "en_US",
    shareImage: "/news-shuffle-share.jpg",
  },
}

export type Locale = keyof typeof languages
export const defaultLocale: Locale = "en"
export const locales = Object.keys(languages) as Locale[]

export function resolveLocale(value?: string | null): Locale {
  return locales.find((locale) => locale === value) ?? defaultLocale
}

/** The [...locale] route param: none for the default locale. */
export const localeParam = (locale: Locale) =>
  locale === defaultLocale ? undefined : locale

export function localizedPaths() {
  return locales.map((locale) => ({ params: { locale: localeParam(locale) } }))
}
