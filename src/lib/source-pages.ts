import type { Website } from "./discovery.ts"

export type Source = Website & { id: string }

export const tagSlug = (tag: string) =>
  tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

/** Neighbours in name order, wrapping around at both ends. */
export function neighbours<T>(items: T[], index: number) {
  const at = (offset: number) =>
    items[(index + offset + items.length) % items.length]
  return { previous: at(-1), next: at(1) }
}
