import assert from "node:assert/strict"
import { test } from "node:test"
import { getDefaultFilters, matches, pickSource } from "../src/lib/shuffle.ts"

const source = { tier: "B", tags: ["news", "british"] }
const tiers = [{ id: "S" }, { id: "A" }, { id: "B" }, { id: "C" }]
const defaults = getDefaultFilters(tiers)

test("empty filters match everything", () => {
  assert.ok(matches(source, { topic: [], region: [], feed: [], tier: [] }))
})

test("defaults match news in tiers S to B", () => {
  assert.ok(matches(source, defaults))
  assert.ok(!matches({ ...source, tier: "C" }, defaults))
  assert.ok(!matches({ ...source, tags: ["sports"] }, defaults))
})

test("any value within a filter, every filter", () => {
  const filters = { ...defaults, region: ["american", "british"] }
  assert.ok(matches(source, filters))
  assert.ok(!matches({ ...source, tags: ["news", "irish"] }, filters))
})

test("picks from the list", () => {
  assert.equal(
    pickSource(["a", "b", "c"], () => 0.5),
    "b"
  )
  assert.equal(
    pickSource([], () => 0.5),
    undefined
  )
})
