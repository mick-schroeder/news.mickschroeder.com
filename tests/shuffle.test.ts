import assert from "node:assert/strict"
import { test } from "node:test"
import { defaultFilters, matches, pickSource } from "../src/lib/shuffle.ts"

const source = { tier: "B", tags: ["news", "british"] }

test("empty filters match everything", () => {
  assert.ok(matches(source, { topic: [], region: [], feed: [], tier: [] }))
})

test("defaults match news in tiers S to B", () => {
  assert.ok(matches(source, defaultFilters))
  assert.ok(!matches({ ...source, tier: "C" }, defaultFilters))
  assert.ok(!matches({ ...source, tags: ["sports"] }, defaultFilters))
})

test("any value within a filter, every filter", () => {
  const filters = { ...defaultFilters, region: ["american", "british"] }
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
