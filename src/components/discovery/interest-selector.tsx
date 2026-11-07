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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { interestTags, tags } from "@/data/interest-tags"
import { translations, type Locale } from "@/i18n/ui"

const icons = {
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

export function InterestSelector({
  locale,
  selected,
  onChange,
}: {
  locale: Locale
  selected: string[] | undefined
  onChange: (tags: string[]) => void
}) {
  return (
    <ToggleGroup
      aria-label={translations[locale].interests}
      className="flex w-full flex-wrap justify-start gap-2"
      variant="outline"
      size="sm"
      multiple
      disabled={!selected}
      value={selected ?? []}
      onValueChange={onChange}
    >
      {tags.map((tag) => {
        const interest = interestTags[tag]
        const Icon = icons[interest.icon]

        return (
          <ToggleGroupItem
            key={tag}
            value={tag}
            title={
              "description" in interest
                ? interest.description[locale]
                : undefined
            }
            className="gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:bg-muted hover:text-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
          >
            <Icon className="size-3.5" aria-hidden="true" />
            <span>{locale === "ga" ? interest.labelGa : tag}</span>
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}
