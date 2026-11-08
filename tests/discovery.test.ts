import { catalogSchema } from "../src/data/catalog-schema.ts"
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import {
  filterWebsites,
  pickWebsite,
  parseInterests,
  favicon,
  type Website,
} from "../src/lib/discovery.ts"
const sites: Website[] = JSON.parse(
  readFileSync(new URL("../src/data/sources.json", import.meta.url), "utf8")
)
test("the flat catalog is valid and every link can be shuffled", () => {
  assert.deepEqual(catalogSchema.parse(sites), sites)
  const interests = [...new Set(sites.flatMap((site) => site.tags))]
  assert.deepEqual(filterWebsites(sites, interests), sites)
})
test("a website can match any selected interest", () => {
  assert.deepEqual(filterWebsites(sites, []), [])
  const matches = filterWebsites(sites, ["Science", "Tech"])
  assert.ok(matches.some((site) => site.tags.includes("Science")))
  assert.ok(matches.some((site) => site.tags.includes("Tech")))
  assert.deepEqual(filterWebsites(sites, ["missing"]), [])
})
test("shuffle handles empty, single, and repeated results", () => {
  assert.equal(pickWebsite([]), undefined)
  assert.equal(pickWebsite([sites[0]], sites[0].url), sites[0])
  assert.equal(
    pickWebsite(sites.slice(0, 2), sites[0].url, () => 0),
    sites[1]
  )
  assert.equal(
    pickWebsite(sites.slice(0, 2), [sites[0].url, sites[2].url], () => 0),
    sites[1]
  )
})
test("two links on the same host can match different interests", () => {
  const rte = sites.filter(({ url }) => new URL(url).hostname === "rte.ie")
  assert.ok(rte.some(({ url }) => url === "https://rte.ie/news/"))
  assert.equal(
    pickWebsite(filterWebsites(rte, ["Gaeilge"]))?.url,
    "https://rte.ie/news/nuacht/"
  )
  assert.equal(
    pickWebsite(filterWebsites(rte, ["Irish"]))?.url,
    "https://rte.ie/news/"
  )
})
test("new users default to News and saved selections override the default", () => {
  const tags = ["News", "Gaeilge", "Tech"]
  assert.deepEqual(parseInterests(null, tags), ["News"])
  assert.deepEqual(parseInterests('{"tags":[]}', tags), [])
  assert.deepEqual(parseInterests('{"tags":["Gaeilge"]}', tags), ["Gaeilge"])
})
test("interests tolerate corrupt and obsolete values", () => {
  for (const raw of ["broken", "null", "42"])
    assert.deepEqual(parseInterests(raw, ["News"]), [])

  assert.deepEqual(
    parseInterests('{"tags":["News","News","missing",3],"lists":["news"]}', [
      "News",
    ]),
    ["News"]
  )
})
test("Google favicon uses the hostname only", () => {
  assert.equal(
    favicon("https://example.com/path?q=1"),
    "https://www.google.com/s2/favicons?domain=example.com&sz=64"
  )
})
