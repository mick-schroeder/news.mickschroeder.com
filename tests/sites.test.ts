import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { parseFeed } from "../src/lib/feed.ts"
import {
  byTier,
  defaultFilters,
  directoryOrder,
  facets,
  filterSites,
  iconPath,
  monogram,
  neighbours,
  parseFilters,
  pickSite,
  similarSites,
  type Filters,
} from "../src/lib/sites.ts"

const read = (name: string) =>
  JSON.parse(
    readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8")
  )
const { sites, tags } = parseFeed(read("sources.json"), read("tags.json"), {
  minSites: 1,
})
const any: Filters = { topics: [], regions: [], seenOn: [], lowestTier: "E" }
const ids = (list: { id: string }[]) => list.map((site) => site.id).sort()

test("empty filters down to tier E match every site", () => {
  assert.deepEqual(filterSites(sites, any), sites)
})

test("any match within a facet, every facet must match", () => {
  const techOrSports = filterSites(sites, {
    ...any,
    topics: ["tech", "sports"],
  })
  assert.ok(techOrSports.length)
  assert.ok(
    techOrSports.every(
      (site) => site.tags.includes("tech") || site.tags.includes("sports")
    )
  )

  const irishNews = filterSites(sites, {
    ...any,
    topics: ["news"],
    regions: ["irish"],
  })
  assert.ok(irishNews.length)
  assert.ok(
    irishNews.every(
      (site) => site.tags.includes("news") && site.tags.includes("irish")
    )
  )

  const seenOn = filterSites(sites, { ...any, seenOn: ["techmeme"] })
  assert.ok(seenOn.length)
  assert.ok(seenOn.every((site) => site.tags.includes("techmeme")))
})

test("the lowest tier limits the shuffle; E only shows at the bottom", () => {
  const top = filterSites(sites, { ...any, lowestTier: "A" })
  assert.ok(top.every((site) => ["S", "A"].includes(site.tier)))
  const known = filterSites(sites, { ...any, lowestTier: "B" })
  assert.ok(known.some((site) => site.tier === "B"))
  assert.ok(known.every((site) => site.tier !== "E"))
  assert.ok(filterSites(sites, any).some((site) => site.tier === "E"))
})

test("facets split tags by kind and hide sponsor and tier tags", () => {
  const { topics, regions, seenOn } = facets(tags)
  assert.ok(topics.every((tag) => tag.kind === "tag"))
  assert.ok(!topics.some((tag) => tag.id === "sponsor"))
  assert.deepEqual(ids(regions), ["american", "british", "gaeilge", "irish"])
  assert.ok(seenOn.every((tag) => tag.kind === "aggregator"))
  const shown = [...topics, ...regions, ...seenOn]
  assert.ok(!shown.some((tag) => tag.kind === "tier"))
})

test("shuffle avoids recent ids until none are left", () => {
  const [a, b] = sites
  assert.equal(pickSite([]), undefined)
  assert.equal(pickSite([a], [a.id]), a)
  assert.equal(
    pickSite([a, b], [a.id], () => 0),
    b
  )
  assert.equal(
    pickSite([a, b], [], () => 0.99),
    b
  )
})

test("directory order is tier, then title", () => {
  const ordered = directoryOrder(sites)
  assert.equal(ordered[0].tier, "S")
  assert.equal(ordered.at(-1)?.tier, "E")
  const groups = byTier(sites)
  assert.deepEqual(
    groups.map((group) => group.tier),
    [...new Set(ordered.map((site) => site.tier))]
  )
  assert.deepEqual(
    groups.flatMap((group) => group.sites),
    ordered
  )
})

test("similar sites share a topic and skip the site itself", () => {
  const verge = sites.find((site) => site.id === "theverge")!
  const similar = similarSites(verge, sites, tags, 3)
  assert.ok(similar.length)
  assert.ok(!similar.includes(verge))
  assert.ok(similar.every((site) => site.tags.includes("tech")))
})

test("first visit gets defaults; saved filters drop unknown ids", () => {
  assert.deepEqual(parseFilters(null, tags), defaultFilters)
  assert.deepEqual(parseFilters("broken", tags), defaultFilters)
  assert.deepEqual(
    parseFilters(
      '{"topics":["tech","tech","gone",3],"regions":["irish"],"lowestTier":"F"}',
      tags
    ),
    { topics: ["tech"], regions: ["irish"], seenOn: [], lowestTier: "B" }
  )
  assert.deepEqual(parseFilters('{"topics":[],"lowestTier":"E"}', tags), any)
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
