import { DATA_API, OWNER, SITE_DESCRIPTION, SITE_TITLE } from "@/consts"
import type { Source } from "@/lib/shuffle"

type Node = Record<string, unknown>

const id = (site: URL, name: string) => `${site.href}#${name}`

export const website = (site: URL): Node => ({
  "@type": "WebSite",
  "@id": id(site, "website"),
  name: SITE_TITLE,
  description: SITE_DESCRIPTION,
  url: site.href,
  inLanguage: "en",
  publisher: { "@id": id(site, "publisher") },
})

export const publisher = (site: URL): Node => ({
  "@type": "Organization",
  "@id": id(site, "publisher"),
  name: OWNER.name,
  url: OWNER.url,
  logo: new URL("/icons/icon-512.png", site).href,
})

export const breadcrumbs = (items: { name: string; url: URL }[]): Node => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url.href,
  })),
})

export const itemList = (items: { name: string; url: URL }[]): Node => ({
  "@type": "ItemList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    url: item.url.href,
  })),
})

/** A source's page, about the outlet itself. */
export const sourcePage = (
  site: URL,
  url: URL,
  source: Pick<Source, "title" | "url" | "description" | "icon">
): Node => ({
  "@type": "ItemPage",
  "@id": url.href,
  url: url.href,
  name: source.title,
  description: source.description,
  isPartOf: { "@id": id(site, "website") },
  about: {
    "@type": "NewsMediaOrganization",
    name: source.title,
    url: source.url,
    logo: source.icon,
    description: source.description,
  },
})

/** The data API, for Google Dataset Search. */
export const dataset = (site: URL): Node => ({
  "@type": "Dataset",
  name: "News Shuffle sources",
  description:
    "Popular news websites, each with a description, topic, region and feed tags, and a tier from S (agenda setters) to F (unreliable). Rebuilt every night from news feeds.",
  url: new URL("/about/", site).href,
  license: "https://opensource.org/license/mit",
  isAccessibleForFree: true,
  creator: { "@id": id(site, "publisher") },
  keywords: ["news", "news websites", "media", "news sources"],
  distribution: ["sources", "tags", "tiers"].map((file) => ({
    "@type": "DataDownload",
    encodingFormat: "application/json",
    contentUrl: `${DATA_API}/${file}.json`,
  })),
})

export const toJsonLd = (nodes: Node[]) =>
  JSON.stringify({ "@context": "https://schema.org", "@graph": nodes })
