import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { parseData, tagLabel } from "../src/lib/data.ts"

const read = (name: string) =>
  JSON.parse(
    readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8")
  )
const rawSources = read("sources.json")
const rawTags = read("tags.json")
const parse = (sources: unknown, tags: unknown = rawTags) =>
  parseData(sources, tags, { minSources: 1 })

test("the fixture parses and keeps tier F", () => {
  const { sources } = parse(rawSources)
  assert.equal(sources.length, rawSources.length)
  assert.ok(sources.some((source) => source.tier === "F"))
})

test("tags no source uses are dropped", () => {
  const [source] = rawSources
  const { tags } = parse([{ ...source, tags: ["news"] }])
  assert.deepEqual(
    tags.map((tag) => tag.id),
    ["news"]
  )
})

test("feed tags keep their link; other tags have none", () => {
  const { tags } = parse(rawSources)
  const byId = Object.fromEntries(tags.map((tag) => [tag.id, tag]))
  assert.equal(byId.newzit.url, "https://www.newzit.com/")
  assert.equal(byId.news.url, undefined)
  assert.throws(() =>
    parse(rawSources, [{ ...rawTags[0], url: "http://x.com/" }])
  )
})

test("an unjudged source gets tier E and no description", () => {
  const { sources } = parse([
    { id: "a", title: "A", url: "https://a.com/", tags: ["news"] },
  ])
  assert.equal(sources[0].tier, "E")
  assert.equal(sources[0].description, "")
})

test("the data is rejected when it doesn't add up", () => {
  const source = rawSources[0]
  const other = { ...source, id: "other", url: "https://other.example/" }
  assert.throws(
    () => parse([source, { ...other, id: source.id }]),
    /Duplicate source id/
  )
  assert.throws(
    () =>
      parse([source, { ...other, url: source.url.replace("://", "://www.") }]),
    /Duplicate source URL/
  )
  assert.throws(() => parse([{ ...source, tags: ["nope"] }]), /unknown tag/)
  assert.throws(() => parse([{ ...source, tier: "Z" }]))
  assert.throws(() => parse([{ ...source, url: "http://a.com/" }]))
  assert.throws(() => parse([source], [{ ...rawTags[0], kind: "mood" }]))
  assert.throws(() => parseData([source], rawTags), /expected 100\+/)
})

test("every tag has a Lucide icon", async () => {
  for (const tag of parse(rawSources).tags) {
    assert.ok(tag.icon, `${tag.id} has no icon`)
    await assert.doesNotReject(import(`lucide-react/icons/${tag.icon}`))
  }
})

test("tag labels are the tag title", () => {
  const { tags } = parse(rawSources)
  const byId = Object.fromEntries(tags.map((tag) => [tag.id, tag]))
  assert.equal(tagLabel(byId.news), "News")
})
