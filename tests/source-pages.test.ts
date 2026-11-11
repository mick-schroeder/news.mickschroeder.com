import { test } from "node:test"
import assert from "node:assert/strict"
import { catalogSchema, idFromUrl } from "../src/data/catalog-schema.ts"
import { neighbours, tagSlug } from "../src/lib/source-pages.ts"

const site = { id: "a", name: "A", url: "https://a.com/", tags: ["News"] }

test("source ids must be unique page slugs", () => {
  assert.throws(
    () => catalogSchema.parse([site, { ...site, url: "https://b.com/" }]),
    /Duplicate id/
  )
  assert.throws(() => catalogSchema.parse([{ ...site, id: "Not OK" }]))
  assert.throws(() =>
    catalogSchema.parse([{ name: "A", url: site.url, tags: ["News"] }])
  )
})

test("new sources get an id from their URL", () => {
  assert.equal(idFromUrl("https://www.example.com/"), "example-com")
  assert.equal(idFromUrl("https://bbc.com/news/"), "bbc-com-news")
})

test("neighbours wrap around the ends", () => {
  assert.deepEqual(neighbours([1, 2, 3], 0), { previous: 3, next: 2 })
  assert.deepEqual(neighbours([1, 2, 3], 2), { previous: 2, next: 1 })
  assert.deepEqual(neighbours([1], 0), { previous: 1, next: 1 })
})

test("interest slugs are lowercase and hyphenated", () => {
  assert.equal(tagSlug("Drudge Report"), "drudge-report")
  assert.equal(tagSlug("Tech"), "tech")
})
