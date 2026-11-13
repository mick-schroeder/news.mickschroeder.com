import type { Locale } from "../i18n/locales.ts"
import type { Tag } from "./feed.ts"

export type TagIconName =
  | "BookOpen"
  | "Briefcase"
  | "Cpu"
  | "Flag"
  | "FlaskConical"
  | "Gamepad2"
  | "Landmark"
  | "Layers"
  | "Newspaper"
  | "Palette"
  | "Tag"
  | "Trophy"

/** Icons and Irish labels by tag id. Missing ids fall back by kind. */
export const tagDisplay: Record<string, { icon?: TagIconName; ga?: string }> = {
  news: { icon: "Newspaper", ga: "Nuacht" },
  politics: { icon: "Landmark", ga: "Polaitíocht" },
  business: { icon: "Briefcase", ga: "Gnó" },
  tech: { icon: "Cpu", ga: "Teicneolaíocht" },
  science: { icon: "FlaskConical", ga: "Eolaíocht" },
  culture: { icon: "Palette", ga: "Cultúr" },
  sports: { icon: "Trophy", ga: "Spórt" },
  gaming: { icon: "Gamepad2", ga: "Cluichíocht" },
  american: { ga: "Meiriceánach" },
  british: { ga: "Briotanach" },
  irish: { ga: "Éireannach" },
  gaeilge: { ga: "Gaeilge" },
  newzit: {},
  "brutalist-report": {},
  techmeme: {},
  memeorandum: {},
  mediagazer: {},
  "drudge-report": {},
}

const kindIcons: Record<Tag["kind"], TagIconName> = {
  tag: "Tag",
  region: "Flag",
  language: "BookOpen",
  aggregator: "Layers",
  tier: "Tag",
}

export const tagIconName = (tag: Tag) =>
  tagDisplay[tag.id]?.icon ?? kindIcons[tag.kind]

export const tagLabel = (tag: Tag, locale: Locale) =>
  (locale === "ga" && tagDisplay[tag.id]?.ga) || tag.title
