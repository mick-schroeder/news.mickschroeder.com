import type { APIRoute } from "astro"
import { CODE_URL, DATA_API, DATA_CODE_URL, SITE_DESCRIPTION } from "@/consts"
import { getSources, getTags, getTiers } from "@/lib/data"

// https://llmstxt.org
export const GET: APIRoute = async ({ site }) => {
  const sources = await getSources()
  const tags = await getTags()
  const tiers = await getTiers()
  const page = (path: string) => new URL(path, site).href

  const text = `# News Shuffle

> ${SITE_DESCRIPTION}

News Shuffle lists ${sources.length} popular news websites. Each has a short description, tags for topic, region, feed and language, and a tier from S to F for its reach and influence, not its viewpoint. The list is rebuilt every night from news feeds.

## Data API

Public JSON, no key needed, MIT licensed.

- [sources.json](${DATA_API}/sources.json): every source with id, title, url, description, tier, tags, icon and similar sources
- [tags.json](${DATA_API}/tags.json): tags with kind and description
- [tiers.json](${DATA_API}/tiers.json): tiers with title and description
- [Data code](${DATA_CODE_URL}) and [site code](${CODE_URL}) on GitHub

## Tiers

${tiers.map((tier) => `- ${tier.id}, ${tier.title}: ${tier.description}`).join("\n")}

## Pages

- [Sources](${page("/sources/")}): every source by tier
- [Tags](${page("/tags/")}): ${tags.length} tags by kind
- [About](${page("/about/")}): how sources are found and judged

## Sources

${sources.map((source) => `- [${source.title}](${page(`/sources/${source.id}/`)}): tier ${source.tier}. ${source.description}`).join("\n")}
`

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
