import { useRef, useState, type ReactNode } from "react"
import { ChevronDown, Shuffle } from "lucide-react"
import { TagIcon } from "@/components/tag-icon"
import { TierBadge } from "@/components/tier-badge"
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
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
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Facet, Filters, Tag, TierInfo } from "@/lib/shuffle"
import { tagFill, tagInk } from "@/lib/tag-colors"
import { cn } from "@/lib/utils"

type Part = "topic" | "region" | "tier"

const ANY = "*"

const parts = {
  topic: { label: "Topics", any: "everything", chip: "Everything" },
  region: { label: "Regions", any: "anywhere", chip: "Anywhere" },
  tier: { label: "Tiers", any: "", chip: "" },
} satisfies Record<Part, { label: string; any: string; chip: string }>

// A word in the sentence that opens a picker.
const word =
  "group/word h-auto gap-[0.15em] px-[0.15em] py-0 font-heading text-[length:inherit] leading-[inherit] font-semibold text-foreground hover:bg-transparent aria-expanded:bg-transparent dark:hover:bg-transparent [&_svg:not([class*='size-'])]:size-[0.45em]"

// Marker band behind the lower half of the label marks it as a picker.
const band =
  "inline-flex items-center rounded-[0.08em] bg-linear-to-b from-transparent from-55% to-band to-55% px-[0.05em] transition-colors group-hover/word:to-band-strong group-aria-expanded/word:to-band-strong group-aria-pressed/word:to-band-strong"

const chevron = (
  <ChevronDown
    data-icon="inline-end"
    aria-hidden="true"
    className="transition-transform in-aria-expanded:rotate-180"
  />
)

// Avatars sized to the sentence, centred on its text.
const group =
  "-space-x-[0.2em] self-center *:data-[slot=avatar]:size-[1.7em] *:data-[slot=avatar]:text-[0.5em]"

// Most avatars shown; past that the last one becomes a count.
const MAX_AVATARS = 4

/** A tag as a round avatar: its flag, or its icon on its colour. */
function TagAvatar({ tag }: { tag: Tag }) {
  return (
    <Avatar title={tag.title}>
      <AvatarFallback
        data-tag-color={tag.color}
        className={cn("overflow-hidden", tag.color && tagFill)}
      >
        <TagIcon
          tag={tag}
          className={
            tag.flag ? "size-[150%] max-w-none [clip-path:none]" : "size-[55%]"
          }
        />
      </AvatarFallback>
    </Avatar>
  )
}

/** One tag by name, several as avatars; the any label when empty. */
function TagSummary({
  tags,
  ids,
  any,
  lower,
}: {
  tags: Tag[]
  ids: string[]
  any: string
  lower: boolean
}) {
  const picked = tags.filter((tag) => ids.includes(tag.id))
  if (!picked.length) return any
  if (picked.length === 1)
    return lower ? picked[0].title.toLowerCase() : picked[0].title
  const extra = picked.length - MAX_AVATARS
  return (
    <>
      {/* Zero-width text gives the word a text baseline, like the others. */}
      {"\u200b"}
      <AvatarGroup className={group}>
        {picked
          .slice(0, extra > 0 ? MAX_AVATARS - 1 : MAX_AVATARS)
          .map((tag) => (
            <TagAvatar key={tag.id} tag={tag} />
          ))}
        {extra > 0 && (
          <AvatarGroupCount className="size-[1.7em] font-sans text-[0.5em] font-semibold">
            +{extra + 1}
          </AvatarGroupCount>
        )}
      </AvatarGroup>
    </>
  )
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
              <TagIcon
                tag={tag}
                data-tag-color={tag.color}
                className={tag.color && tagInk}
              />
              {tag.title}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const chip =
  "h-11 justify-start gap-2 px-3 text-base font-normal aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-foreground [&_svg:not([class*='size-'])]:size-4.5"

/** Chip grid of tags; the any chip clears the rest. */
function TagChips({
  label,
  any,
  tags,
  selected,
  onChange,
}: {
  label: string
  any: string
  tags: Tag[]
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const value = selected.length ? selected : [ANY]
  return (
    <ToggleGroup
      multiple
      variant="outline"
      aria-label={label}
      className="grid w-full grid-cols-2 sm:grid-cols-4"
      value={value}
      onValueChange={(next: string[]) => {
        // Keep tag order, so saved ids stay sorted.
        const picked = next.includes(ANY) && !value.includes(ANY)
        onChange(
          picked
            ? []
            : tags.map((tag) => tag.id).filter((id) => next.includes(id))
        )
      }}
    >
      <ToggleGroupItem value={ANY} className={chip}>
        <Shuffle aria-hidden="true" />
        {any}
      </ToggleGroupItem>
      {tags.map((tag) => (
        <ToggleGroupItem key={tag.id} value={tag.id} className={chip}>
          <TagIcon
            tag={tag}
            data-tag-color={tag.color}
            className={tag.color && tagInk}
          />
          {tag.title}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

/** Picks a run of tiers, best to worst; none chosen means all of them. */
function TierRange({
  tiers,
  range,
  onChange,
}: {
  tiers: TierInfo[]
  range: number[]
  onChange: (ids: string[]) => void
}) {
  const ids = tiers.map((tier) => tier.id)
  return (
    <div className="mx-auto grid w-full max-w-md gap-3 py-1">
      {/* Inset half a column each side, so stops sit over the badges. */}
      <Slider
        aria-label="Tiers"
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
        {tiers.map((tier, rank) => (
          <li key={tier.id}>
            <TierBadge
              tier={tier}
              className={cn(
                "size-8 text-sm transition-opacity",
                (rank < range[0] || rank > range[1]) && "opacity-30"
              )}
            />
          </li>
        ))}
      </ol>
    </div>
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
  // The part outlives closing, so the drawer keeps its picker while it slides away.
  const [part, setPart] = useState<Part>("topic")
  const [isOpen, setIsOpen] = useState(false)
  const words = useRef<Partial<Record<Part, HTMLButtonElement | null>>>({})
  const line = useRef<HTMLParagraphElement>(null)
  // Sentence height at open, so the popover holds still as words change.
  const held = useRef(0)
  const mobile = useIsMobile()

  function setOpen(which: Part, next: boolean) {
    if (next) {
      setPart(which)
      held.current = line.current?.offsetHeight ?? 0
    }
    setIsOpen(next)
  }
  const ofKind = (kind: Facet) => tags.filter((tag) => tag.kind === kind)

  const ranks = filters.tier.map((id) => tiers.findIndex((t) => t.id === id))
  const range = ranks.length
    ? [Math.min(...ranks), Math.max(...ranks)]
    : [0, tiers.length - 1]
  const shown = tiers.slice(range[0], range[1] + 1)

  const label = (which: Part) =>
    which === "tier" ? (
      <>
        {/* Zero-width text gives the word a text baseline, like the others. */}
        {"\u200b"}
        <AvatarGroup className={group}>
          {shown.map((tier) => (
            <TierBadge key={tier.id} tier={tier} className="font-sans" />
          ))}
        </AvatarGroup>
      </>
    ) : (
      <TagSummary
        tags={ofKind(which)}
        ids={filters[which]}
        any={parts[which].any}
        lower={which === "topic"}
      />
    )

  // Under the sentence's top edge at its held height, whichever word opened it.
  const anchor = {
    getBoundingClientRect: () => {
      const box = line.current!.getBoundingClientRect()
      return new DOMRect(box.x, box.y, box.width, held.current || box.height)
    },
  }

  const wordProps = (which: Part) => ({
    variant: "ghost" as const,
    className: word,
    "aria-label":
      which === "tier"
        ? `Tiers ${shown.map((tier) => tier.id).join(", ")}`
        : filters[which].length > 1
          ? `${parts[which].label} ${ofKind(which)
              .filter((tag) => filters[which].includes(tag.id))
              .map((tag) => tag.title)
              .join(", ")}`
          : undefined,
  })

  const picker = (which: Part) =>
    which === "tier" ? (
      <TierRange
        tiers={tiers}
        range={range}
        onChange={(tier) => onChange({ ...filters, tier })}
      />
    ) : (
      <TagChips
        label={parts[which].label}
        any={parts[which].chip}
        tags={ofKind(which)}
        selected={filters[which]}
        onChange={(ids) => onChange({ ...filters, [which]: ids })}
      />
    )

  // On desktop each word opens a popover; on mobile the same click opens the drawer.
  const popoverWord = (which: Part) => (
    <Popover
      open={!mobile && isOpen && part === which}
      onOpenChange={(next) => setOpen(which, next)}
    >
      <PopoverTrigger
        ref={(node: HTMLButtonElement | null) => {
          words.current[which] = node
        }}
        render={<Button {...wordProps(which)} />}
      >
        <span className={band}>{label(which)}</span>
        {chevron}
      </PopoverTrigger>
      <PopoverContent
        anchor={anchor}
        className="w-[min(42rem,calc(100vw-2rem))] gap-3 p-4"
      >
        <PopoverHeader>
          <PopoverTitle className="text-muted-foreground">
            {parts[which].label}
          </PopoverTitle>
        </PopoverHeader>
        {picker(which)}
      </PopoverContent>
    </Popover>
  )

  // In the drawer, words switch the picker.
  const drawerWord = (which: Part) => (
    <Button
      {...wordProps(which)}
      aria-pressed={part === which}
      onClick={() => setPart(which)}
    >
      <span className={band}>{label(which)}</span>
      {chevron}
    </Button>
  )

  const sentence = (word: (which: Part) => ReactNode) => (
    <>
      Show me {word("topic")} from {word("region")} ranked {word("tier")}
    </>
  )

  return (
    <div className="flex flex-col gap-4">
      <p
        ref={line}
        className="text-center font-heading text-3xl leading-snug font-medium tracking-tight text-balance text-muted-foreground sm:text-4xl sm:leading-tight"
      >
        {sentence(popoverWord)}
      </p>

      <Drawer
        open={mobile && isOpen}
        onOpenChange={(next) => !next && setIsOpen(false)}
        showSwipeHandle
      >
        <DrawerContent
          className="rounded-t-2xl bg-popover"
          finalFocus={() => words.current[part] ?? true}
        >
          <DrawerHeader>
            <DrawerTitle className="text-center text-xl leading-snug font-medium tracking-tight text-balance text-muted-foreground">
              {sentence(drawerWord)}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4">{picker(part)}</div>
          <DrawerFooter>
            <DrawerClose render={<Button size="xl" />}>Done</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
