import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { parseData } from "../src/lib/data.ts"
import {
  byTier,
  defaultFilters,
  directoryOrder,
  browsableTags,
  filterSources,
  iconPath,
  monogram,
  neighbours,
  parseFilters,
  pickSource,
  similarSources,
  tagsByFacet,
  type Filters,
} from "../src/lib/sources.ts"

const read = (name: string) =>
  JSON.parse(
    readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8")
  )
const { sources, tags } = parseData(read("sources.json"), read("tags.json"), {
  minSources: 1,
})
const any: Filters = { topic: [], region: [], feed: [], lowestTier: "F" }
const ids = (list: { id: string }[]) => list.map((source) => source.id).sort()

test("empty filters down to tier F match every source", () => {
  assert.deepEqual(filterSources(sources, any), sources)
})

test("any match within a facet, every facet must match", () => {
  const techOrSports = filterSources(sources, {
    ...any,
    topic: ["tech", "sports"],
  })
  assert.ok(techOrSports.length)
  assert.ok(
    techOrSports.every(
      (source) => source.tags.includes("tech") || source.tags.includes("sports")
    )
  )

  const irishNews = filterSources(sources, {
    ...any,
    topic: ["news"],
    region: ["irish"],
  })
  assert.ok(irishNews.length)
  assert.ok(
    irishNews.every(
      (source) => source.tags.includes("news") && source.tags.includes("irish")
    )
  )

  const feed = filterSources(sources, { ...any, feed: ["techmeme"] })
  assert.ok(feed.length)
  assert.ok(feed.every((source) => source.tags.includes("techmeme")))
})

test("the lowest tier limits the shuffle; E only shows at the bottom", () => {
  const top = filterSources(sources, { ...any, lowestTier: "A" })
  assert.ok(top.every((source) => ["S", "A"].includes(source.tier)))
  const known = filterSources(sources, { ...any, lowestTier: "B" })
  assert.ok(known.some((source) => source.tier === "B"))
  assert.ok(known.every((source) => source.tier !== "E"))
  assert.ok(filterSources(sources, any).some((source) => source.tier === "E"))
})

test("tags group by facet; other kinds stay out", () => {
  const { topic, region, feed } = tagsByFacet(tags)
  assert.ok(topic.every((tag) => tag.kind === "topic"))
  assert.deepEqual(ids(region), ["american", "british", "irish"])
  assert.ok(feed.length && feed.every((tag) => tag.kind === "feed"))
  const browsable = browsableTags(tags).map((tag) => tag.id)
  assert.ok(!browsable.includes("sponsor") && !browsable.includes("gaeilge"))
})

test("shuffle avoids recent ids until none are left", () => {
  const [a, b] = sources
  assert.equal(pickSource([]), undefined)
  assert.equal(pickSource([a], [a.id]), a)
  assert.equal(
    pickSource([a, b], [a.id], () => 0),
    b
  )
  assert.equal(
    pickSource([a, b], [], () => 0.99),
    b
  )
})

test("directory order is tier, then title", () => {
  const ordered = directoryOrder(sources)
  assert.equal(ordered[0].tier, "S")
  assert.equal(ordered.at(-1)?.tier, "F")
  const groups = byTier(sources)
  assert.deepEqual(
    groups.map((group) => group.tier),
    [...new Set(ordered.map((source) => source.tier))]
  )
  assert.deepEqual(
    groups.flatMap((group) => group.sources),
    ordered
  )
})

test("similar sources share a topic and skip the source itself", () => {
  const verge = sources.find((source) => source.id === "theverge")!
  const similar = similarSources(verge, sources, tags, 3)
  assert.ok(similar.length)
  assert.ok(!similar.includes(verge))
  assert.ok(similar.every((source) => source.tags.includes("tech")))
})

test("first visit gets defaults; saved filters drop unknown ids", () => {
  assert.deepEqual(parseFilters(null, tags), defaultFilters)
  assert.deepEqual(parseFilters("broken", tags), defaultFilters)
  assert.deepEqual(
    parseFilters(
      '{"topic":["tech","tech","gone",3],"region":["irish"],"lowestTier":"Z"}',
      tags
    ),
    { topic: ["tech"], region: ["irish"], feed: [], lowestTier: "B" }
  )
  assert.deepEqual(parseFilters('{"topic":[],"lowestTier":"F"}', tags), any)
})

test("neighbours wrap around the ends", () => {
  assert.deepEqual(neighbours([1, 2, 3], 0), { previous: 3, next: 2 })
  assert.deepEqual(neighbours([1, 2, 3], 2), { previous: 2, next: 1 })
  assert.deepEqual(neighbours([1], 0), { previous: 1, next: 1 })
})

test("icons are local paths", () => {
  assert.equal(iconPath("bbc"), "/favicons/bbc.png")
})

test("monogram takes the first letter or digit of the id, with a stable color", () => {
  const wired = monogram({ id: "wired" })
  assert.equal(wired.letter, "W")
  assert.deepEqual(monogram({ id: "wired" }), wired)
  assert.equal(monogram({ id: "404media" }).letter, "4")
  assert.equal(monogram({ id: "-nyt" }).letter, "N")
  assert.equal(monogram({ id: "--" }).letter, "?")
  assert.match(wired.color, /^bg-[a-z]+-700$/)
})
