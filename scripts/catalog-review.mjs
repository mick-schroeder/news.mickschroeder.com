import { isDeepStrictEqual } from "node:util"
import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { spawn } from "node:child_process"
import { tags } from "../src/data/interest-tags.ts"
import { catalogSchema, websiteSchema } from "../src/data/catalog-schema.ts"
import { audit, checkLink, discover } from "./catalog.mjs"
import { applyChanges, planChanges, readWorkspace } from "./catalog-files.mjs"

const host = "127.0.0.1:4322"
const origin = `http://${host}`
const assets = new Map([
  ["/", ["catalog-review.html", "text/html"]],
  ["/review.js", ["catalog-review.js", "text/javascript"]],
  ["/review.css", ["catalog-review.css", "text/css"]],
])

async function readJson(request) {
  let size = 0
  const chunks = []
  for await (const chunk of request) {
    size += chunk.length
    if (size > 1024 * 1024) throw new Error("Request is too large")
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"))
}

const server = createServer(async (request, response) => {
  const json = (data, status = 200) => {
    response.writeHead(status, { "Content-Type": "application/json" })
    response.end(JSON.stringify(data))
  }

  response.setHeader("Cache-Control", "no-store")
  response.setHeader("X-Content-Type-Options", "nosniff")
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' https://www.google.com https://*.gstatic.com; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
  )
  if (request.headers.host !== host) return json({ error: "Invalid host" }, 403)

  try {
    const asset = assets.get(request.url)
    if (request.method === "GET" && asset) {
      const [file, type] = asset
      const body = await readFile(new URL(file, import.meta.url))
      response.writeHead(200, { "Content-Type": `${type}; charset=utf-8` })
      return response.end(body)
    }
    if (request.method === "GET" && request.url === "/api/workspace") {
      const { sites, revision } = readWorkspace()
      return json({ sites, revision, tags })
    }
    if (
      request.method !== "POST" ||
      request.headers.origin !== origin ||
      request.headers["content-type"] !== "application/json"
    ) {
      return json(
        { error: "This request must come from the local review screen." },
        403
      )
    }

    const body = await readJson(request)
    switch (request.url) {
      case "/api/audit":
        return json(await audit(readWorkspace().sites))
      case "/api/discover": {
        const { sites, ignore } = readWorkspace()
        return json(await discover(sites, ignore))
      }
      case "/api/recheck":
        return json(await checkLink(websiteSchema.shape.url.parse(body.url)))
      case "/api/preview":
        return json(planChanges(readWorkspace(), body).changes)
      case "/api/apply":
        return json(applyChanges(body))
      default:
        return json({ error: "Unknown route" }, 404)
    }
  } catch (error) {
    return json(
      {
        error:
          error.issues?.map((issue) => issue.message).join("; ") ??
          error.message,
      },
      400
    )
  }
})

async function verifyDeployment(siteUrl) {
  const endpoint = new URL("/catalog.json", siteUrl)
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
    process.exitCode = 1
    return
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
}

const [mode, flag, url, ...extra] = process.argv.slice(2)
if (mode === "verify" && flag === "--url" && url && !extra.length) {
  await verifyDeployment(url)
} else if (mode === undefined || (mode === "--no-open" && !flag)) {
  server.listen(4322, "127.0.0.1", () => {
    console.log(`Catalog review is available at ${origin}`)
    if (mode === "--no-open") return
    const opener = { darwin: "open", linux: "xdg-open" }[process.platform]
    if (!opener) return
    const child = spawn(opener, [origin], { stdio: "ignore" })
    child.on("error", () => {})
  })
} else {
  throw new Error(
    "Usage: pnpm catalog:review [--no-open | verify --url <site-url>]"
  )
}
