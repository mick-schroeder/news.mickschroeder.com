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

test("discovery keeps partial results and honours the ignore list", async () => {
  const report = await discover(
    [original],
    "https://another.example/",
    async ({ url, tag }: { url: string; tag: string }) => {
      if (tag === "Politics") throw new Error("Feed unavailable")
      return [original, replacement, newSite].map((site) => ({
        ...site,
        feed: url,
        tag,
      }))
    }
  )
  assert.equal(report.feedErrors.length, 1)
  assert.deepEqual(
    report.candidates.map(
      ({ source }: { source: typeof replacement }) => source
    ),
    [{ ...replacement, tags: ["Tech", "Culture"] }]
  )
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
