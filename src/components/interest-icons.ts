import {
  BookOpen,
  Briefcase,
  Cpu,
  Flag,
  FlaskConical,
  Gamepad2,
  Globe,
  Landmark,
  Layers,
  Newspaper,
  Palette,
} from "lucide-react"
import { interestTags } from "@/data/interest-tags"
import type { Locale } from "@/i18n/locales"

export const interestIcons = {
  BookOpen,
  Briefcase,
  Cpu,
  Flag,
  FlaskConical,
  Gamepad2,
  Globe,
  Landmark,
  Layers,
  Newspaper,
  Palette,
}

export type Interest = keyof typeof interestTags

export const interestIcon = (tag: Interest) =>
  interestIcons[interestTags[tag].icon]

export const interestLabel = (tag: Interest, locale: Locale) =>
  locale === "ga" ? interestTags[tag].labelGa : tag
