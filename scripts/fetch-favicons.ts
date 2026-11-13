/**
 * Caches site favicons in public/favicons/{id}.png for the build.
 *
 *   node --experimental-strip-types scripts/fetch-favicons.ts [--refresh]
 *
 * Fetches missing icons and ones older than MAX_AGE_DAYS (all with --refresh),
 * and deletes icons of sites no longer in the feed or the icon service.
 * Failed downloads keep the old icon; a site with none shows a monogram.
 */
import { mkdir, readdir, rename, rm, stat, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { fetchFeed } from "../src/lib/feed.ts"

const OUT_DIR = fileURLToPath(new URL("../public/favicons/", import.meta.url))
const MAX_AGE_DAYS = 30
const MAX_BYTES = 100_000
const TIMEOUT_MS = 10_000
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

const refresh = process.argv.includes("--refresh")

const iconUrl = (siteUrl: string) =>
  `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(siteUrl).hostname)}&sz=64`

const isPng = (bytes: Uint8Array) =>
  PNG_SIGNATURE.every((byte, i) => bytes[i] === byte)

async function ageDays(file: string) {
  try {
    return (Date.now() - (await stat(file)).mtimeMs) / 86_400_000
  } catch {
    return Infinity
  }
}

/** PNG bytes, "none" when the service has no icon (404), or "error". */
async function download(
  siteUrl: string
): Promise<Uint8Array | "none" | "error"> {
  try {
    const res = await fetch(iconUrl(siteUrl), {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (res.status === 404) return "none"
    if (!res.ok) return "error"
    const bytes = new Uint8Array(await res.arrayBuffer())
    return isPng(bytes) && bytes.length <= MAX_BYTES ? bytes : "error"
  } catch {
    return "error"
  }
}

async function main() {
  const { sites } = await fetchFeed(process.env.DATA_URL || undefined)
  await mkdir(OUT_DIR, { recursive: true })

  const counts = { fetched: 0, cached: 0, none: 0, errors: 0, removed: 0 }

  // Sequential to stay polite to the icon service.
  for (const site of sites) {
    const file = path.join(OUT_DIR, `${site.id}.png`)
    if (!refresh && (await ageDays(file)) < MAX_AGE_DAYS) {
      counts.cached++
      continue
    }
    const result = await download(site.url)
    if (result === "none" || result === "error") {
      if (result === "none") await rm(file, { force: true })
      counts[result === "none" ? "none" : "errors"]++
      console.warn(`  ${result === "none" ? "–" : "✗"} ${site.id} (${result})`)
      continue
    }
    // Write then rename, so an interrupted run never leaves a partial file.
    await writeFile(`${file}.tmp`, result)
    await rename(`${file}.tmp`, file)
    counts.fetched++
  }

  // feed.ts rejects tiny or malformed feeds, so this can't empty the folder.
  const ids = new Set(sites.map((site) => `${site.id}.png`))
  for (const name of await readdir(OUT_DIR)) {
    if (!ids.has(name)) {
      await rm(path.join(OUT_DIR, name), { force: true })
      counts.removed++
    }
  }

  console.log("favicons:", counts)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
