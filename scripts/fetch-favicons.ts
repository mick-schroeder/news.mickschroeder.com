/**
 * Downloads favicons for all sites into public/favicons/{siteId}.png.
 *
 * Run before builds when the feed changes:
 *   node --experimental-strip-types scripts/fetch-favicons.ts [--refresh]
 *
 * Keeps favicons already on disk unless --refresh is passed.
 *
 * Skips any site whose favicon Google returns as the 16×16 "unknown" globe.
 */
import { mkdir, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { fetchFeed } from "../src/lib/feed.ts"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const OUT_DIR = path.join(ROOT, "public", "favicons")

const googleFaviconUrl = (hostname: string) =>
  `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`

/** Read PNG width from the IHDR chunk (no dependencies). */
function pngWidth(buf: Uint8Array): number {
  // PNG: 8-byte sig + IHDR: 4 (len) + 4 ("IHDR") + 4 (width) + ...
  if (buf.length < 24) return 0
  return new DataView(buf.buffer, buf.byteOffset).getUint32(16, false)
}

// --refresh re-downloads favicons already on disk.
const refresh = process.argv.includes("--refresh")

async function downloadFavicon(
  id: string,
  url: string
): Promise<"saved" | "cached" | "globe" | "error"> {
  if (!refresh && existsSync(path.join(OUT_DIR, `${id}.png`))) return "cached"
  const hostname = new URL(url).hostname
  try {
    const res = await fetch(googleFaviconUrl(hostname))
    if (!res.ok) return "error"
    const bytes = new Uint8Array(await res.arrayBuffer())
    if (pngWidth(bytes) <= 16) return "globe"
    await writeFile(path.join(OUT_DIR, `${id}.png`), bytes)
    return "saved"
  } catch {
    return "error"
  }
}

async function main() {
  const dataUrl = process.env.DATA_URL
  const { sites } = await fetchFeed(dataUrl)

  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true })

  let saved = 0
  let cached = 0
  let skipped = 0
  let errors = 0

  // Sequential to avoid rate-limiting Google's favicon service.
  for (const site of sites) {
    const result = await downloadFavicon(site.id, site.url)
    if (result === "saved") {
      saved++
      process.stdout.write(`  ✓ ${site.id}\n`)
    } else if (result === "cached") {
      cached++
    } else if (result === "globe") {
      skipped++
      process.stdout.write(`  – ${site.id} (globe, skipped)\n`)
    } else {
      errors++
      process.stderr.write(`  ✗ ${site.id} (error)\n`)
    }
  }

  console.log(
    `\nDone: ${saved} saved, ${cached} cached, ${skipped} globes skipped, ${errors} errors`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
