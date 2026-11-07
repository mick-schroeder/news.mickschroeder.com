import { getCollection } from "astro:content"
import sources from "./sources.json"

export async function getWebsites() {
  const entries = await getCollection("sources")
  if (!entries.length) throw new Error("The website catalog is empty.")
  if (entries.length !== sources.length) {
    throw new Error("Publisher IDs must be unique in sources.json.")
  }

  const urls = new Set<string>()
  const publishersByHost = new Map<string, string>()
  const websites = entries.map(({ data }) => data)
  for (const site of websites) {
    for (const destination of [site, ...(site.editions ?? [])]) {
      const url = new URL(destination.url)
      url.hostname = url.hostname.replace(/^www\./, "")
      url.hash = ""
      url.pathname = url.pathname.replace(/\/+$/, "")
      if (urls.has(url.href))
        throw new Error(`Duplicate destination: ${url.href}`)
      urls.add(url.href)

      const publisher = publishersByHost.get(url.hostname)
      if (publisher && publisher !== site.id) {
        throw new Error(
          `Group destinations from ${url.hostname} under one publisher.`
        )
      }
      publishersByHost.set(url.hostname, site.id)
    }
  }

  return websites
}
