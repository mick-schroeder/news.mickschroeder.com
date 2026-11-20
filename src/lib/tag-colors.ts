/** Tailwind colour names tags.json may give; global.css maps each to --tag. */
export const tagColorNames = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
] as const

export type TagColor = (typeof tagColorNames)[number]

/** Filled in the tag's colour; overrides badge and button fills. */
export const tagFill =
  "bg-(--tag) text-white hover:bg-(--tag-hover) [a]:hover:bg-(--tag-hover)"

/** Icon in the tag's colour. */
export const tagInk = "text-(--tag-ink)"
