import type { Website } from "./discovery"

export async function loadCatalog(signal: AbortSignal): Promise<Website[]> {
  const response = await fetch("/catalog.json", { signal })
  if (!response.ok) throw new Error("Could not load the website catalog.")
  const websites = await response.json()
  if (!Array.isArray(websites) || websites.length === 0) {
    throw new Error("The website catalog is missing or empty.")
  }
  return websites
}
