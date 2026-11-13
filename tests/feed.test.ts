import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { parseFeed } from "../src/lib/feed.ts"
import { tagDisplay } from "../src/lib/tag-display.ts"

const read = (name: string) =>
  JSON.parse(
    readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8")
  )
const rawSites = read("sources.json")
const rawTags = read("tags.json")
const parse = (sites: unknown, tags: unknown = rawTags) =>
  parseFeed(sites, tags, { minSites: 1 })

test("the fixture parses and tier F is dropped", () => {
  const { sites, tags } = parse(rawSites)
  assert.equal(tags.length, rawTags.length)
  assert.ok(rawSites.some((site: { tier: string }) => site.tier === "F"))
  assert.equal(
    sites.length,
    rawSites.filter((site: { tier: string }) => site.tier !== "F").length
  )
})

test("aggregator tags keep their link; other tags have none", () => {
  const { tags } = parse(rawSites)
  const byId = Object.fromEntries(tags.map((tag) => [tag.id, tag]))
  assert.equal(byId.newzit.url, "https://www.newzit.com/")
  assert.equal(byId.news.url, undefined)
  assert.throws(() =>
    parse(rawSites, [{ ...rawTags[0], url: "http://x.com/" }])
  )
})

test("an unjudged site gets tier E and no description", () => {
  const { sites } = parse([
    { id: "a", title: "A", url: "https://a.com/", tags: ["news"] },
  ])
  assert.equal(sites[0].tier, "E")
  assert.equal(sites[0].description, "")
})

test("the feed is rejected when it doesn't add up", () => {
  const site = rawSites[0]
  const other = { ...site, id: "other", url: "https://other.example/" }
  assert.throws(
    () => parse([site, { ...other, id: site.id }]),
    /Duplicate site id/
  )
  assert.throws(
    () => parse([site, { ...other, url: site.url.replace("://", "://www.") }]),
    /Duplicate site URL/
  )
  assert.throws(() => parse([{ ...site, tags: ["nope"] }]), /unknown tag/)
  assert.throws(() => parse([{ ...site, tier: "Z" }]))
  assert.throws(() => parse([{ ...site, url: "http://a.com/" }]))
  assert.throws(() => parse([site], [{ ...rawTags[0], kind: "mood" }]))
  assert.throws(() => parseFeed([site], rawTags), /expected 100\+/)
})

test("every chip tag has a display entry", () => {
  const missing = rawTags
    .filter((tag: { kind: string }) => !["tier", "sponsor"].includes(tag.kind))
    .filter((tag: { id: string }) => !(tag.id in tagDisplay))
    .map((tag: { id: string }) => tag.id)
  assert.deepEqual(missing, [], `Add to tag-display.ts: ${missing}`)
})
