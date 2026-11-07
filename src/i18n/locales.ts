export const languages = {
  en: { label: "English", socialLocale: "en_US" },
  ga: { label: "Gaeilge", socialLocale: "ga_IE" },
}

export type Locale = keyof typeof languages
export const defaultLocale: Locale = "en"
export const locales = Object.keys(languages) as Locale[]

export function resolveLocale(value: string | null): Locale {
  return locales.find((locale) => locale === value) ?? defaultLocale
}

export function localizedPaths() {
  return locales.map((locale) => ({
    params: { locale: locale === defaultLocale ? undefined : locale },
    props: { locale },
  }))
}
