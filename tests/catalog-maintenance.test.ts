import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { catalogSchema } from "../src/data/catalog-schema.ts"
import { addToHistory, readHistory } from "../src/lib/browser-storage.ts"
import {
  applyChanges,
  planChanges,
  readWorkspace,
} from "../scripts/catalog-files.mjs"
import { drudgePublishers } from "../scripts/catalog-publishers.mjs"
import { checkLink, discover } from "../scripts/catalog.mjs"

const original = {
  name: "Example",
  url: "https://example.com/",
  tags: ["News"],
}
const replacement = {
  name: "Example Tech",
  url: "https://example.com/tech/",
  tags: ["Tech"],
}
const newSite = {
  name: "Another",
  url: "https://another.example/",
  tags: ["Culture"],
}

test("normalization detects aliases while keeping distinct paths", () => {
  assert.throws(
    () =>
      catalogSchema.parse([
        replacement,
        { ...replacement, url: "https://www.example.com/tech#top" },
      ]),
    /Duplicate URL/
  )
  assert.deepEqual(catalogSchema.parse([original, replacement]), [
    original,
    replacement,
  ])
})

test("URL history starts fresh, deduplicates, and keeps the most recent URL first", () => {
  const values = new Map([["news-shuffle.history.v1", '["old-id"]']])
  const before = Object.getOwnPropertyDescriptor(globalThis, "localStorage")
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key),
      setItem: (key: string, value: string) => values.set(key, value),
    },
  })
  try {
    assert.deepEqual(readHistory(), [])
    addToHistory(original.url)
    addToHistory(replacement.url)
    assert.deepEqual(addToHistory(original.url), [
      original.url,
      replacement.url,
    ])
    assert.deepEqual(readHistory(), [original.url, replacement.url])
  } finally {
    if (before) Object.defineProperty(globalThis, "localStorage", before)
    else Reflect.deleteProperty(globalThis, "localStorage")
  }
})

test("preview and apply an approved batch and reject a stale draft", (t) => {
  const directory = mkdtempSync(join(tmpdir(), "catalog-review-"))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const catalog = pathToFileURL(join(directory, "catalog.json"))
  const ignore = pathToFileURL(join(directory, "ignore.txt"))
  writeFileSync(catalog, JSON.stringify([original]))
  writeFileSync(ignore, "# Existing rules\n")
  const workspace = readWorkspace(catalog, ignore)
  const draft = {
    revision: workspace.revision,
    approvedOnly: false,
    decisions: [
      { action: "save", original: original.url, site: replacement },
      { action: "save", site: newSite },
      {
        action: "ignore",
        site: { ...newSite, url: "https://www.ignored.example/path" },
      },
    ],
  }

  const preview = planChanges(workspace, draft)
  assert.deepEqual(preview.sites, [replacement, newSite])
  assert.deepEqual(readWorkspace(catalog, ignore).sites, [original])
  assert.deepEqual(applyChanges(draft, catalog, ignore), preview.changes)
  assert.deepEqual(readWorkspace(catalog, ignore).sites, [replacement, newSite])
  assert.match(readFileSync(ignore, "utf8"), /https:\/\/ignored\.example\//)
  assert.throws(() => applyChanges(draft, catalog, ignore), /changed/)
  const current = readWorkspace(catalog, ignore)
  const rebuild = {
    revision: current.revision,
    approvedOnly: true,
    decisions: [{ action: "save", original: newSite.url, site: newSite }],
  }
  assert.deepEqual(planChanges(current, rebuild).sites, [newSite])
  writeFileSync(ignore, "# Changed externally\n")
  assert.throws(() => applyChanges(rebuild, catalog, ignore), /changed/)
})

const drudgeHtml = `
  <a href="https://headline.example/story">Headline</a>
  <! LINKS FIRST COLUMN>
  <a href="https://trends.example/">Trends</a><hr>
  <a href="https://charts.example/">Charts</a><hr>
  <a href="https://www.abcnews.com/">ABC News</a><br>
  <a href="http://www.example.com/">Renamed &amp; updated</a>
  <a href="https://example.com/latest">LATEST</a><br>
  <a href="https://www.thewrap.com/">The Wrap</a><br>
  </tt>
  <! LINKS SECOND C OL U M N>
  <a href="https://www.africanews.com/">Africa News</a><br>
  <a href="https://europe.example/en/">European news</a><br>
  <a href="https://japannews.yomiuri.co.jp/">Yomiuri</a><br>
  </tt>
  <! LINK S A N D SEARCHES 3 R D C O LUM N>
  <a href="https://apnews.com/">AP Top</a><br>
  <a href="https://wire.example/">Wire service</a><br>
  <a href="https://radio.example/">AP RADIO</a><br>
  <a href="https://www.reuters.com/">Reuters</a><br>
  <hr><a href="https://archives.example/">Archives</a>
  </tt>
`

test("discovery proposes additions and tag updates from all five sources", async () => {
  const report = await discover(
    [original],
    "https://another.example/",
    async (url: string) => {
      if (url.includes("newzit")) {
        return Response.json([
          { name: "Example GB", url: original.url, geo: "gb" },
          { name: "Example US", url: replacement.url, geo: "us" },
          { name: "Another", url: newSite.url, geo: "us" },
          { name: "World", url: "https://world.example/" },
        ])
      }
      if (url.includes("drudge")) return new Response(drudgeHtml)
      return new Response(
        `<opml><body><outline text="Example" htmlUrl="${original.url}"/></body></opml>`
      )
    }
  )
  assert.deepEqual(report.feedErrors, [])
  const byUrl = new Map<string, (typeof report.candidates)[number]>(
    report.candidates.map((candidate: (typeof report.candidates)[number]) => [
      candidate.source.url,
      candidate,
    ])
  )
  const update = byUrl.get(original.url)
  assert.equal(update.original, original.url)
  assert.equal(update.discoveredVia.length, 5)
  assert.deepEqual(update.source, {
    ...original,
    tags: [
      "News",
      "Tech",
      "Techmeme",
      "Politics",
      "Memeorandum",
      "Culture",
      "Mediagazer",
      "Newzit",
      "British",
      "Drudge Report",
    ],
  })
  assert.deepEqual(byUrl.get(replacement.url).source.tags, [
    "Newzit",
    "American",
    "News",
  ])
  assert.deepEqual(byUrl.get("https://world.example/").source.tags, [
    "Newzit",
  ])
  assert.deepEqual(byUrl.get("https://europe.example/en/").source.tags, [
    "Drudge Report",
  ])
  assert.deepEqual(byUrl.get("https://wire.example/").source.tags, [
    "Drudge Report",
  ])
  assert.equal(byUrl.size, 11)

  const directory = mkdtempSync(join(tmpdir(), "catalog-discovery-"))
  try {
    const catalog = pathToFileURL(join(directory, "catalog.json"))
    const ignore = pathToFileURL(join(directory, "ignore.txt"))
    writeFileSync(catalog, JSON.stringify([original]))
    writeFileSync(ignore, "")
    const workspace = readWorkspace(catalog, ignore)
    const draft = {
      revision: workspace.revision,
      approvedOnly: false,
      decisions: [
        { action: "save", original: update.original, site: update.source },
      ],
    }
    assert.deepEqual(planChanges(workspace, draft).sites, [update.source])
    assert.deepEqual(readWorkspace(catalog, ignore).sites, [original])
    applyChanges(draft, catalog, ignore)
    assert.deepEqual(readWorkspace(catalog, ignore).sites, [update.source])
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test("discovery reports failed sources and leaves other candidates available", async () => {
  const report = await discover([], "", async (url: string) => {
    if (url.includes("drudge"))
      return new Response(drudgeHtml.replace("3 R D C O LUM N", "CHANGED"))
    if (url.includes("newzit")) return Response.json([{ name: "Missing URL" }])
    if (url.includes("memeorandum")) return new Response(null, { status: 503 })
    return new Response(
      `<opml><body><outline text="Example" htmlUrl="${original.url}"/></body></opml>`
    )
  })
  assert.deepEqual(
    report.feedErrors.map(({ detail }: { detail: string }) => detail),
    [
      "HTTP 503",
      "Invalid publisher in Newzit homepage list",
      "Could not identify the Drudge publisher block in the third column",
    ]
  )
  assert.deepEqual(report.candidates[0].source.tags, [
    "Tech",
    "Techmeme",
    "Culture",
    "Mediagazer",
  ])
})

test("Drudge finds the directory after a new utility divider and rejects ambiguous blocks", () => {
  const shifted = drudgeHtml.replace(
    "Charts</a><hr>",
    'Charts</a><hr><a href="https://utility.example/">Utility</a><hr>'
  )
  assert.deepEqual(drudgePublishers(shifted), drudgePublishers(drudgeHtml))
  assert.throws(
    () =>
      drudgePublishers(
        drudgeHtml.replace("www.thewrap.com", "utility.example")
      ),
    /Could not identify the Drudge publisher block in the first column/
  )
  const duplicate =
    '<a href="https://abcnews.com/">ABC</a><br><a href="https://thewrap.com/">The Wrap</a><hr>'
  assert.throws(
    () =>
      drudgePublishers(
        drudgeHtml.replace(
          "<! LINKS FIRST COLUMN>",
          "<! LINKS FIRST COLUMN>" + duplicate
        )
      ),
    /Could not identify the Drudge publisher block in the first column/
  )
})

test("review batches reject non-boolean rebuild flags and malformed decisions", () => {
  const workspace = {
    revision: "current",
    sites: [original, newSite],
    ignore: "",
  }
  const draft = {
    revision: workspace.revision,
    decisions: [{ action: "save", original: original.url, site: original }],
    approvedOnly: false,
  }
  assert.throws(
    () => planChanges(workspace, { ...draft, approvedOnly: "false" }),
    /boolean/
  )
  assert.throws(
    () =>
      planChanges(workspace, { ...draft, decisions: [{ action: "remove" }] }),
    /original/
  )
  assert.deepEqual(planChanges(workspace, draft).sites, [original, newSite])
})

test("link checks distinguish a redirect, missing page, and blocked request", async () => {
  for (const [status, expected] of [
    [200, "redirect"],
    [404, "missing"],
    [403, "inconclusive"],
  ] as const) {
    const methods: string[] = []
    const result = await checkLink(
      original.url,
      async (_url: string, method = "GET") => {
        methods.push(method)
        const response = new Response(null, { status })
        Object.defineProperty(response, "url", { value: replacement.url })
        return response
      }
    )
    assert.equal(result.issue, expected)
    assert.deepEqual(methods, status === 200 ? ["HEAD"] : ["HEAD", "GET"])
  }
})
