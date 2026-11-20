/** Tag kinds tags.json may give, in display order. */
export const tagKinds = [
  { id: "topic", singular: "Topic", plural: "Topics" },
  { id: "region", singular: "Region", plural: "Regions" },
  { id: "feed", singular: "Feed", plural: "Feeds" },
  { id: "language", singular: "Language", plural: "Languages" },
  { id: "sponsor", singular: "Sponsor", plural: "Sponsors" },
] as const

export type TagKind = (typeof tagKinds)[number]["id"]
