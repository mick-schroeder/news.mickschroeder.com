export const languages = {
  en: {
    label: "English",
    socialLocale: "en_US",
    shareImage: "/news-shuffle-share.jpg",
  },
  ga: {
    label: "Gaeilge",
    socialLocale: "ga_IE",
    shareImage: "/news-shuffle-share-ga.jpg",
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

/** Path after the locale prefix: "/ga/tags/x/" -> "tags/x/". */
export function localeSuffix(pathname: string) {
  const parts = pathname.replace(/^\//, "").split("/")
  return (
    parts[0] !== defaultLocale && locales.includes(parts[0] as Locale)
      ? parts.slice(1)
      : parts
  ).join("/")
}
