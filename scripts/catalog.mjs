import { SaxesParser } from "saxes"
import { catalogUrlKey } from "../src/data/catalog-schema.ts"

import {
  drudgePublishers,
  newzitPublishers,
  publisher,
} from "./catalog-publishers.mjs"

const feeds = [
  { url: "https://www.techmeme.com/lb.opml", tags: ["Tech", "Techmeme"] },
  {
    url: "https://www.memeorandum.com/lb.opml",
    tags: ["Politics", "Memeorandum"],
  },
  { url: "https://mediagazer.com/lb.opml", tags: ["Culture", "Mediagazer"] },
  { url: "https://www.newzit.com/api/domainThumbs", type: "newzit" },
  { url: "https://www.drudgereport.com/", type: "drudge" },
]

const request = (url, method = "GET") =>
  fetch(url, {
    method,
    signal: AbortSignal.timeout(8000),
    headers: {
      "User-Agent": "NewsShuffleCatalog/1.0 (+https://news.mickschroeder.com)",
    },
  })

export const hostname = (url) => new URL(url).hostname.replace(/^www\./, "")

export async function checkLink(url, fetchLink = request) {
  try {
    let response = await fetchLink(url, "HEAD")
    if (!response.ok) {
      await response.body?.cancel()
      response = await fetchLink(url)
    }
    await response.body?.cancel()
    const status = response.status
    const issue = response.ok
      ? catalogUrlKey(url) === catalogUrlKey(response.url)
        ? "reachable"
        : "redirect"
      : [404, 410].includes(status)
        ? "missing"
        : "inconclusive"
    return { url, issue, status, finalUrl: response.url }
  } catch (error) {
    return {
      url,
      issue: "inconclusive",
      detail: error.cause?.code ?? error.message,
    }
  }
}

export async function audit(sites) {
  const pending = sites.values()
  const results = await Promise.all(
    Array.from({ length: 8 }, async () => {
      const findings = []
      for (const { url } of pending) findings.push(await checkLink(url))
      return findings
    })
  )
  return results.flat().sort((a, b) => a.url.localeCompare(b.url))
}

async function readFeed({ url, tags, type }, fetchSource) {
  const response = await fetchSource(url)
  if (!response.ok) {
    await response.body?.cancel()
    throw new Error(`HTTP ${response.status}`)
  }

  if (type === "newzit") return newzitPublishers(await response.json())
  if (type === "drudge") return drudgePublishers(await response.text())

  const candidates = []
  const parser = new SaxesParser()
  parser.on("opentag", ({ name, attributes }) => {
    if (name !== "outline") return
    const source = publisher(
      attributes.text || attributes.title,
      attributes.htmlUrl || attributes.url,
      tags
    )
    if (source) candidates.push(source)
  })
  const bytes = await response.arrayBuffer()
  const declaration = new TextDecoder().decode(bytes.slice(0, 200))
  const encoding =
    declaration.match(/<\?xml[^>]*encoding=["']([^"']+)/i)?.[1] ?? "utf-8"
  parser.write(new TextDecoder(encoding).decode(bytes)).close()
  if (!candidates.length) throw new Error("No publisher links found")
  return candidates
}

export function ignoredHosts(ignoreList) {
  const hosts = new Set()
  for (const line of ignoreList.split(/\r?\n/)) {
    const rule = line.trim()
    if (!rule || rule.startsWith("#")) continue
    const url = new URL(rule)
    if (["http:", "https:"].includes(url.protocol)) hosts.add(hostname(url))
  }
  return hosts
}

export async function discover(sites, ignoreList, fetchSource = request) {
  const existing = new Map(sites.map((site) => [catalogUrlKey(site.url), site]))
  const ignored = ignoredHosts(ignoreList)
  const candidates = new Map()
  const feedErrors = []
  const results = await Promise.allSettled(
    feeds.map((feed) => readFeed(feed, fetchSource))
  )

  for (const [index, result] of results.entries()) {
    const feed = feeds[index].url
    if (result.status === "rejected") {
      feedErrors.push({ feed, detail: result.reason.message })
      continue
    }
    for (const source of result.value) {
      const key = catalogUrlKey(source.url)
      if (ignored.has(hostname(source.url))) continue
      const original = existing.get(key)
      if (!candidates.has(key)) {
        const site = original ?? source
        candidates.set(key, {
          source: { ...site, tags: [...site.tags] },
          discoveredVia: [],
          ...(original && { original: original.url }),
        })
      }
      const candidate = candidates.get(key)
      for (const tag of source.tags) {
        if (!candidate.source.tags.includes(tag))
          candidate.source.tags.push(tag)
      }
      if (!candidate.discoveredVia.includes(feed))
        candidate.discoveredVia.push(feed)
    }
  }
  return {
    feedErrors,
    candidates: [...candidates.entries()]
      .filter(
        ([key, { source }]) =>
          source.tags.length > (existing.get(key)?.tags.length ?? 0)
      )
      .map(([, candidate]) => candidate)
      .sort((a, b) => a.source.name.localeCompare(b.source.name)),
  }
}
