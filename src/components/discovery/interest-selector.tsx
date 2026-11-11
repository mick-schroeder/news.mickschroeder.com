import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { interestIcon, interestLabel } from "@/components/interest-icons"
import { interestTags, tags } from "@/data/interest-tags"
import { translations, type Locale } from "@/i18n/ui"

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
    <>
      <ToggleGroup
        aria-label={translations[locale].interests}
        className="w-full flex-wrap"
        variant="outline"
        size="sm"
        spacing={2}
        multiple
        disabled={!selected}
        value={selected ?? []}
        onValueChange={onChange}
      >
        {tags.map((tag) => {
          const interest = interestTags[tag]
          const Icon = interestIcon(tag)

          return (
            <ToggleGroupItem
              key={tag}
              value={tag}
              title={
                "description" in interest
                  ? interest.description[locale]
                  : undefined
              }
              className="text-xs aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
            >
              <Icon data-icon="inline-start" aria-hidden="true" />
              <span>{interestLabel(tag, locale)}</span>
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        disabled={!selected?.length}
        onClick={() => onChange([])}
      >
        {translations[locale].clearInterests}
      </Button>
    </>
  )
}
