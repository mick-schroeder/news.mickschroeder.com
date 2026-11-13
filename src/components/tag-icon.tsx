import {
  BookOpen,
  Briefcase,
  Cpu,
  Flag,
  FlaskConical,
  Gamepad2,
  Landmark,
  Layers,
  Newspaper,
  Palette,
  Tag as TagGlyph,
  Trophy,
  type LucideProps,
} from "lucide-react"
import { tagIconName, type TagIconName } from "@/lib/tag-display"
import type { Tag } from "@/lib/sites"

const icons: Record<TagIconName, React.ComponentType<LucideProps>> = {
  BookOpen,
  Briefcase,
  Cpu,
  Flag,
  FlaskConical,
  Gamepad2,
  Landmark,
  Layers,
  Newspaper,
  Palette,
  Tag: TagGlyph,
  Trophy,
}

export function TagIcon({ tag, ...props }: { tag: Tag } & LucideProps) {
  const Icon = icons[tagIconName(tag)]
  return <Icon {...props} />
}
