import { SaxesParser } from "saxes"
import { catalogUrlKey } from "../src/data/catalog-schema.ts"

const feeds = [
  { url: "https://www.techmeme.com/lb.opml", tag: "Tech" },
  { url: "https://www.memeorandum.com/lb.opml", tag: "Politics" },
  { url: "https://mediagazer.com/lb.opml", tag: "Culture" },
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

async function readFeed({ url, tag }) {
  const response = await request(url)
  if (!response.ok) {
    await response.body?.cancel()
    throw new Error(`HTTP ${response.status}`)
  }

  const candidates = []
  const parser = new SaxesParser()
  parser.on("opentag", ({ name, attributes }) => {
    if (name !== "outline") return
    const label = (attributes.text || attributes.title)?.trim()
    const homepage = URL.parse(attributes.htmlUrl || attributes.url || "")
    if (
      !label ||
      !homepage ||
      !["http:", "https:"].includes(homepage.protocol) ||
      homepage.username ||
      homepage.password
    )
      return
    homepage.protocol = "https:"
    homepage.hash = ""
    candidates.push({ name: label, url: homepage.href, tag, feed: url })
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

export async function discover(sites, ignoreList, fetchFeed = readFeed) {
  const existing = new Set(sites.map(({ url }) => catalogUrlKey(url)))
  const ignored = ignoredHosts(ignoreList)
  const candidates = new Map()
  const feedErrors = []
  const results = await Promise.allSettled(feeds.map(fetchFeed))

  for (const [index, result] of results.entries()) {
    if (result.status === "rejected") {
      feedErrors.push({ feed: feeds[index].url, detail: result.reason.message })
      continue
    }
    for (const { name, url, tag, feed } of result.value) {
      const key = catalogUrlKey(url)
      if (existing.has(key) || ignored.has(hostname(url))) continue
      if (!candidates.has(key)) {
        candidates.set(key, {
          source: { name, url, tags: [] },
          discoveredVia: [],
        })
      }
      const candidate = candidates.get(key)
      if (!candidate.source.tags.includes(tag)) candidate.source.tags.push(tag)
      if (!candidate.discoveredVia.includes(feed))
        candidate.discoveredVia.push(feed)
    }
  }
  return {
    feedErrors,
    candidates: [...candidates.values()].sort((a, b) =>
      a.source.name.localeCompare(b.source.name)
    ),
  }
}
