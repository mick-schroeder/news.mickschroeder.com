import { z } from "astro/zod"
import { createHash } from "node:crypto"
import { readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs"
import {
  catalogSchema,
  idFromUrl,
  websiteSchema,
} from "../src/data/catalog-schema.ts"
import { hostname, ignoredHosts } from "./catalog.mjs"

const catalogPath = new URL("../src/data/sources.json", import.meta.url)
const ignorePath = new URL("../src/data/ignore-urls.txt", import.meta.url)

// The review page leaves ids out; saved sites keep theirs or get one from the URL.
const reviewedSite = websiteSchema.partial({ id: true })

const reviewBatchSchema = z.strictObject({
  revision: z.string(),
  approvedOnly: z.boolean(),
  decisions: z.array(
    z.discriminatedUnion("action", [
      z.strictObject({
        action: z.literal("save"),
        original: z.string().optional(),
        site: reviewedSite,
      }),
      z.strictObject({ action: z.literal("remove"), original: z.string() }),
      z.strictObject({ action: z.literal("ignore"), site: reviewedSite }),
    ])
  ),
})

export function readWorkspace(
  catalogFile = catalogPath,
  ignoreFile = ignorePath
) {
  const catalog = readFileSync(catalogFile, "utf8")
  const ignore = readFileSync(ignoreFile, "utf8")
  const revision = createHash("sha256")
    .update(JSON.stringify([catalog, ignore]))
    .digest("hex")
  return {
    catalog,
    sites: catalogSchema.parse(JSON.parse(catalog)),
    ignore,
    revision,
  }
}

export function planChanges(workspace, batch) {
  const { revision, decisions, approvedOnly } = reviewBatchSchema.parse(batch)
  if (revision !== workspace.revision) {
    throw new Error(
      "The catalog or ignore list changed. Reload the workspace before applying."
    )
  }

  const existing = new Map(workspace.sites.map((site) => [site.url, site]))
  const next = new Map(existing)
  const changes = []
  const handled = new Set()
  const ignored = ignoredHosts(workspace.ignore)
  const newRules = []

  for (const { action, original, site } of decisions) {
    if (original !== undefined) {
      if (!existing.has(original) || handled.has(original))
        throw new Error("Invalid original URL")
      handled.add(original)
    }
    if (action === "save") {
      const before = existing.get(original)
      const { id, ...fields } = site
      const replacement = {
        id: id ?? before?.id ?? idFromUrl(site.url),
        ...fields,
      }
      if (original !== undefined) next.set(original, replacement)
      else next.set(Symbol(), replacement)
      if (JSON.stringify(before) !== JSON.stringify(replacement)) {
        changes.push({
          action: before ? "Update" : "Add",
          before,
          after: replacement,
        })
      }
    } else if (action === "remove" && original !== undefined) {
      next.delete(original)
      changes.push({ action: "Remove", before: existing.get(original) })
    } else if (action === "ignore" && original === undefined) {
      const host = hostname(site.url)
      if (!ignored.has(host)) {
        ignored.add(host)
        newRules.push(`https://${host}/`)
        changes.push({ action: "Ignore host", url: newRules.at(-1) })
      }
    } else {
      throw new Error("Invalid review decision")
    }
  }

  if (approvedOnly) {
    for (const [url, site] of existing) {
      if (!handled.has(url)) {
        next.delete(url)
        changes.push({ action: "Remove unapproved", before: site })
      }
    }
  }

  const sites = catalogSchema.parse([...next.values()])
  const ignore = newRules.length
    ? [workspace.ignore.trimEnd(), ...newRules, ""]
        .filter((line, index) => index !== 0 || line)
        .join("\n")
    : workspace.ignore
  return { changes, sites, ignore }
}

export function applyChanges(
  draft,
  catalogFile = catalogPath,
  ignoreFile = ignorePath
) {
  const workspace = readWorkspace(catalogFile, ignoreFile)
  const plan = planChanges(workspace, draft)
  const updates = []
  if (JSON.stringify(plan.sites) !== JSON.stringify(workspace.sites)) {
    updates.push({
      file: catalogFile,
      before: workspace.catalog,
      after: JSON.stringify(plan.sites, null, 2) + "\n",
    })
  }
  if (plan.ignore !== workspace.ignore) {
    updates.push({
      file: ignoreFile,
      before: workspace.ignore,
      after: plan.ignore,
    })
  }

  const staged = []
  const written = []
  try {
    for (const update of updates) {
      const temp = new URL(update.file.href + `.${process.pid}.tmp`)
      writeFileSync(temp, update.after, { flag: "wx" })
      staged.push({ ...update, temp })
    }
    if (readWorkspace(catalogFile, ignoreFile).revision !== draft.revision) {
      throw new Error("The catalog or ignore list changed during apply.")
    }
    for (const update of staged) {
      renameSync(update.temp, update.file)
      written.push(update)
    }
  } catch (error) {
    for (const { file, before } of written.reverse())
      writeFileSync(file, before)
    throw error
  } finally {
    for (const { temp } of staged) {
      try {
        unlinkSync(temp)
      } catch (error) {
        if (error.code !== "ENOENT") throw error
      }
    }
  }
  return plan.changes
}
