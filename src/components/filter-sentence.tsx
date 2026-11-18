import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { TagIcon } from "@/components/tag-icon"
import { TierBadge } from "@/components/tier-badge"
import { AvatarGroup } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import type { Facet, Filters, Tag, TierInfo } from "@/lib/shuffle"
import { cn } from "@/lib/utils"

// A word in the sentence that opens a menu; the dotted underline marks it.
const word =
  "h-auto gap-[0.15em] px-[0.15em] py-0 font-heading text-[length:inherit] leading-[inherit] font-semibold text-foreground decoration-primary decoration-dotted decoration-[0.06em] underline-offset-[0.16em] [&_svg:not([class*='size-'])]:size-[0.45em]"

/** "news", "news and tech", "news +2"; the any label when empty. */
function summary(tags: Tag[], ids: string[], any: string, lower = false) {
  const names = tags
    .filter((tag) => ids.includes(tag.id))
    .map((tag) => (lower ? tag.title.toLowerCase() : tag.title))
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  if (names.length > 2) return `${names[0]} +${names.length - 1}`
  return names[0] ?? any
}

/** Multi-select tag menu; nothing selected means any. */
export function TagMenu({
  label,
  any,
  tags,
  selected,
  onChange,
  trigger,
  children,
}: {
  label: string
  any: string
  tags: Tag[]
  selected: string[]
  onChange: (ids: string[]) => void
  trigger: React.ReactElement
  children: ReactNode
}) {
  // Keep menu order, so saved ids stay sorted.
  const toggle = (id: string, on: boolean) =>
    onChange(
      tags
        .map((tag) => tag.id)
        .filter((other) => (other === id ? on : selected.includes(other)))
    )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger}>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={!selected.length}
            onCheckedChange={() => onChange([])}
          >
            {any}
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {tags.map((tag) => (
            <DropdownMenuCheckboxItem
              key={tag.id}
              checked={selected.includes(tag.id)}
              onCheckedChange={(on) => toggle(tag.id, on)}
            >
              <TagIcon tag={tag} />
              {tag.title}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Picks a run of tiers, best to worst; none chosen means all of them. */
function TierRange({
  tiers,
  selected,
  onChange,
}: {
  tiers: TierInfo[]
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const ids = tiers.map((tier) => tier.id)
  const ranks = selected.map((id) => ids.indexOf(id))
  const range = ranks.length
    ? [Math.min(...ranks), Math.max(...ranks)]
    : [0, ids.length - 1]
  const shown = tiers.slice(range[0], range[1] + 1)

  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" className={word} />}
        aria-label={`Tiers ${shown.map((tier) => tier.id).join(", ")}`}
      >
        <AvatarGroup className="-space-x-[0.2em] border-b-[0.06em] border-dotted border-primary pb-[0.08em]">
          {shown.map((tier) => (
            <TierBadge
              key={tier.id}
              tier={tier}
              className="size-[1.7em] font-sans text-[0.5em]"
            />
          ))}
        </AvatarGroup>
        <ChevronDown data-icon="inline-end" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent className="w-80 gap-5">
        <PopoverTitle>Tiers</PopoverTitle>
        <div className="grid gap-3">
          {/* Inset half a column each side, so stops sit over the badges. */}
          <Slider
            className="mx-[calc(100%/14)] w-auto!"
            min={0}
            max={ids.length - 1}
            step={1}
            minStepsBetweenValues={0}
            thumbAlignment="center"
            value={range}
            onValueChange={(value) => {
              const [from, to] = value as number[]
              onChange(ids.slice(from, to + 1))
            }}
          />
          <ol className="grid grid-cols-7 justify-items-center">
            {tiers.map((tier) => (
              <li key={tier.id}>
                <TierBadge tier={tier} className="size-6 text-xs" />
              </li>
            ))}
          </ol>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** "Show me news from anywhere ranked S A B": the shuffle's filters as a sentence. */
export function FilterSentence({
  tags,
  tiers,
  filters,
  onChange,
}: {
  tags: Tag[]
  tiers: TierInfo[]
  filters: Filters
  onChange: (filters: Filters) => void
}) {
  const ofKind = (kind: Facet) => tags.filter((tag) => tag.kind === kind)
  const menuWord = <Button variant="ghost" className={cn(word, "underline")} />

  return (
    <p className="text-center font-heading text-3xl leading-snug font-medium tracking-tight text-balance text-muted-foreground sm:text-4xl sm:leading-tight">
      Show me{" "}
      <TagMenu
        label="Topics"
        any="everything"
        tags={ofKind("topic")}
        selected={filters.topic}
        onChange={(topic) => onChange({ ...filters, topic })}
        trigger={menuWord}
      >
        {summary(ofKind("topic"), filters.topic, "everything", true)}
        <ChevronDown data-icon="inline-end" aria-hidden="true" />
      </TagMenu>{" "}
      from{" "}
      <TagMenu
        label="Regions"
        any="anywhere"
        tags={ofKind("region")}
        selected={filters.region}
        onChange={(region) => onChange({ ...filters, region })}
        trigger={menuWord}
      >
        {summary(ofKind("region"), filters.region, "anywhere")}
        <ChevronDown data-icon="inline-end" aria-hidden="true" />
      </TagMenu>{" "}
      ranked{" "}
      <TierRange
        tiers={tiers}
        selected={filters.tier}
        onChange={(tier) => onChange({ ...filters, tier })}
      />
    </p>
  )
}
