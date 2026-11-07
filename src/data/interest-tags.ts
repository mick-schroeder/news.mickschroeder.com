import type { Locale } from "../i18n/locales"

export const interestTags = {
  Aggregator: {
    icon: "Layers",
    labelGa: "Comhbhailitheoir",
  },
  American: {
    icon: "Flag",
    labelGa: "Meiriceánach",
  },
  British: {
    icon: "Flag",
    labelGa: "Briotanach",
  },
  Business: {
    icon: "Briefcase",
    labelGa: "Gnó",
  },
  Culture: {
    icon: "Palette",
    labelGa: "Cultúr",
  },
  Gaeilge: {
    icon: "BookOpen",
    labelGa: "Gaeilge",
    description: {
      en: "Irish language sources",
      ga: "Foinsí Gaeilge",
    },
  },
  Gaming: {
    icon: "Gamepad2",
    labelGa: "Cluichíocht",
  },
  Global: {
    icon: "Globe",
    labelGa: "Domhanda",
  },
  Irish: {
    icon: "Flag",
    labelGa: "Éireannach",
    description: {
      en: "Irish news outlets",
      ga: "Foinsí nuachta Éireannacha",
    },
  },
  News: {
    icon: "Newspaper",
    labelGa: "Nuacht",
  },
  Politics: {
    icon: "Landmark",
    labelGa: "Polaitíocht",
  },
  Science: {
    icon: "FlaskConical",
    labelGa: "Eolaíocht",
  },
  Tech: {
    icon: "Cpu",
    labelGa: "Teicneolaíocht",
  },
} as const satisfies Record<
  string,
  { icon: string; labelGa: string; description?: Record<Locale, string> }
>

export const tags = Object.keys(interestTags) as (keyof typeof interestTags)[]
