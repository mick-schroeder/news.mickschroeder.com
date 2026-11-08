import { parseFragment } from "parse5"

export function publisher(name, value, tags) {
  const url = typeof value === "string" && URL.parse(value)
  if (
    typeof name !== "string" ||
    !name.trim() ||
    !url ||
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    return null

  url.protocol = "https:"
  url.hash = ""
  return { name: name.trim(), url: url.href, tags }
}

export function newzitPublishers(records) {
  if (!Array.isArray(records) || !records.length)
    throw new Error("Expected a nonempty Newzit homepage list")

  return records.map((record) => {
    const tags = ["News", "Newzit"]
    if (record?.geo === "gb") tags.push("British")
    if (record?.geo === "us") tags.push("American")
    const source = publisher(record?.name, record?.url, tags)
    if (!source) throw new Error("Invalid publisher in Newzit homepage list")
    return source
  })
}

function firstAnchor(node) {
  if (node.tagName === "a") return node
  for (const child of node.childNodes ?? []) {
    const anchor = firstAnchor(child)
    if (anchor) return anchor
  }
}

function textContent(node) {
  return node.value ?? node.childNodes?.map(textContent).join("") ?? ""
}

export function drudgePublishers(html) {
  // Drudge uses these nonstandard comments as editorial markers.
  const markers = new Map([
    ["LINKSFIRSTCOLUMN", "first"],
    ["LINKSSECONDCOLUMN", "second"],
    ["LINKSANDSEARCHES3RDCOLUMN", "third"],
  ])
  const blocks = new Map()
  for (const match of html.matchAll(/<!\s*([a-z\d\s]+)>/gi)) {
    const column = markers.get(match[1].replace(/\s+/g, "").toUpperCase())
    if (!column) continue
    const tail = html.slice(match.index + match[0].length)
    const end = tail.search(/<\/tt\s*>/i)
    if (end < 0 || blocks.has(column))
      throw new Error(`Invalid Drudge publisher block in the ${column} column`)
    blocks.set(column, tail.slice(0, end))
  }

  // Known publishers distinguish the directory from adjacent utility sections.
  const directoryHosts = {
    first: ["abcnews.com", "thewrap.com"],
    second: ["africanews.com", "japannews.yomiuri.co.jp"],
    third: ["apnews.com", "reuters.com"],
  }

  return Object.entries(directoryHosts).flatMap(([column, requiredHosts]) => {
    const sections = (blocks.get(column) ?? "").split(/<hr\b[^>]*>/i)
    const matches = sections.map(readDrudgeSection).filter((sources) => {
      const hosts = new Set(
        sources.map(({ url }) => new URL(url).hostname.replace(/^www\./, ""))
      )
      return requiredHosts.every((host) => hosts.has(host))
    })
    if (matches.length !== 1)
      throw new Error(
        `Could not identify the Drudge publisher block in the ${column} column`
      )
    return matches[0]
  })
}

function readDrudgeSection(section) {
  return section.split(/<br\b[^>]*>/i).flatMap((row) => {
    const anchor = firstAnchor(parseFragment(row))
    if (!anchor) return []
    const name = textContent(anchor).replace(/\s+/g, " ").trim()
    const href = anchor.attrs.find(({ name }) => name === "href")?.value
    const source = publisher(name, href, ["News", "Drudge Report"])
    if (
      !source ||
      /^(AP RADIO|LIVE|LATEST|WIRE|FEED)$/i.test(name) ||
      /(^|\.)drudgereport(?:archives)?\.com$/i.test(
        new URL(source.url).hostname
      )
    )
      return []
    return [source]
  })
}
