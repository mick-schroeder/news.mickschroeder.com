export { cn } from "cn"

/** A URL's host without "www.", as shown next to sources. */
export const hostOf = (url: string) =>
  new URL(url).hostname.replace(/^www\./, "")
