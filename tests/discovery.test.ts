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
test("catalog contains unique publishers", () => {
  assert.ok(sites.length > 0)
  assert.equal(new Set(sites.map((site) => site.id)).size, sites.length)
  assert.equal(
    new Set(
      sites.map((site) => new URL(site.url).hostname.replace(/^www\./, ""))
    ).size,
    sites.length
  )
})
test("every catalog entry can be shuffled and has a safe HTTPS destination", () => {
  const tags = [
    ...new Set(
      sites.flatMap((site) =>
        [site, ...(site.editions ?? [])].flatMap(
          (destination) => destination.tags
        )
      )
    ),
  ]
  assert.deepEqual(
    filterWebsites(sites, tags).map((site) => site.id),
    sites.map((site) => site.id)
  )
  for (const site of sites.flatMap((site) => [
    site,
    ...(site.editions ?? []),
  ])) {
    const url = new URL(site.url)
    assert.equal(url.protocol, "https:", site.url)
    assert.equal(url.username, "", site.url)
    assert.equal(url.password, "", site.url)
  }
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
  assert.equal(pickWebsite([sites[0]], sites[0].id), sites[0])
  assert.equal(
    pickWebsite(sites.slice(0, 2), sites[0].id, () => 0),
    sites[1]
  )
  assert.equal(
    pickWebsite(sites.slice(0, 2), [sites[0].id, sites[2].id], () => 0),
    sites[1]
  )
})
test("shuffle picks a matching edition and excludes the last publisher", () => {
  const irishLanguageSites = filterWebsites(sites, ["Gaeilge"])
  const rte = irishLanguageSites.find((site) => site.id === "rte-ie-news")
  assert.ok(rte)
  const pick = pickWebsite([rte], undefined, () => 0)
  assert.equal(pick?.url, "https://rte.ie/news/nuacht/")
  assert.equal(pick?.id, rte.id)
  assert.notEqual(
    pickWebsite(irishLanguageSites, pick?.id, () => 0)?.id,
    rte.id
  )

  const both = filterWebsites(
    sites.filter((site) => site.id === rte.id),
    ["Gaeilge", "Irish"]
  )
  assert.equal(both.length, 1)
  assert.equal(
    pickWebsite(both, undefined, () => 0)?.url,
    "https://rte.ie/news/"
  )
  assert.equal(
    pickWebsite(both, undefined, () => 0.99)?.url,
    "https://rte.ie/news/nuacht/"
  )
  assert.equal(
    pickWebsite(filterWebsites([rte], ["Irish"]))?.url,
    "https://rte.ie/news/"
  )
})
test("defaults omit Gaeilge and saved selections override the defaults", () => {
  const tags = ["News", "Gaeilge", "Tech"]
  assert.deepEqual(parseInterests(null, tags), ["News", "Tech"])
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
