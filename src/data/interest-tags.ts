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
  "Drudge Report": {
    icon: "Layers",
    labelGa: "Drudge Report",
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
  Mediagazer: {
    icon: "Layers",
    labelGa: "Mediagazer",
  },
  Memeorandum: {
    icon: "Layers",
    labelGa: "Memeorandum",
  },
  Newzit: {
    icon: "Layers",
    labelGa: "Newzit",
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
  Techmeme: {
    icon: "Layers",
    labelGa: "Techmeme",
  },
} as const satisfies Record<
  string,
  { icon: string; labelGa: string; description?: Record<Locale, string> }
>

export const tags = Object.keys(interestTags) as (keyof typeof interestTags)[]
