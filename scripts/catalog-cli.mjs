import { readFile } from "node:fs/promises"
import { isDeepStrictEqual } from "node:util"
import { audit, discover } from "./catalog.mjs"
import { readWorkspace } from "./catalog-files.mjs"
import { catalogSchema } from "../src/data/catalog-schema.ts"

const [mode, ...args] = process.argv.slice(2)
if (mode === "verify" && args.length === 2 && args[0] === "--url") {
  const endpoint = new URL("/catalog.json", args[1])
  const expected = catalogSchema.parse(
    JSON.parse(
      await readFile(new URL("../dist/catalog.json", import.meta.url), "utf8")
    )
  )
  const response = await fetch(endpoint, {
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  })
  if (!response.ok)
    throw new Error(`${endpoint} returned HTTP ${response.status}`)
  const deployed = catalogSchema.safeParse(await response.json())
  if (!deployed.success) {
    console.log(
      JSON.stringify(
        {
          matches: false,
          error: "The deployed catalog does not use the current schema.",
          detail: deployed.error.issues[0]?.message,
        },
        null,
        2
      )
    )
    process.exit(1)
  }
  const live = deployed.data
  const localByUrl = new Map(expected.map((site) => [site.url, site]))
  const liveByUrl = new Map(live.map((site) => [site.url, site]))
  const missing = expected
    .filter(({ url }) => !liveByUrl.has(url))
    .map(({ url }) => url)
  const extra = live
    .filter(({ url }) => !localByUrl.has(url))
    .map(({ url }) => url)
  const changed = expected
    .filter(
      (site) =>
        liveByUrl.has(site.url) &&
        !isDeepStrictEqual(site, liveByUrl.get(site.url))
    )
    .map(({ url }) => url)
  console.log(
    JSON.stringify(
      {
        matches: !(missing.length || extra.length || changed.length),
        missing,
        extra,
        changed,
      },
      null,
      2
    )
  )
  if (missing.length || extra.length || changed.length) process.exitCode = 1
} else if (["audit", "discover"].includes(mode) && !args.length) {
  const { sites, ignore } = readWorkspace()
  if (mode === "audit") {
    const results = await audit(sites)
    console.log(
      JSON.stringify(
        {
          checked: results.length,
          findings: results.filter(({ issue }) => issue !== "reachable"),
        },
        null,
        2
      )
    )
  } else {
    const report = await discover(sites, ignore)
    console.log(JSON.stringify(report, null, 2))
    if (report.feedErrors.length) process.exitCode = 1
  }
} else {
  throw new Error(
    "Usage: catalog-cli.mjs audit | discover | verify --url <site-url>"
  )
}
