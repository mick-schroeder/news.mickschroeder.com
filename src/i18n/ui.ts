import { site } from "@/lib/site"
import type { Locale } from "./locales"
import en from "./en"
export type { Locale } from "./locales"

type Strings = Record<keyof typeof en, string>

const withSite = (strings: Strings) =>
  Object.fromEntries(
    Object.entries(strings).map(([key, value]) => [
      key,
      value.replaceAll("{site}", site.name),
    ])
  ) as Strings

export const translations: Record<Locale, Strings> = {
  en: withSite(en),
}

/** Fills {placeholders} in a translation string. */
export function format(
  template: string,
  values: Record<string, string | number>
) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match
  )
}
