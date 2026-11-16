import type { APIRoute } from "astro"
import { getSites } from "@/lib/catalog"

/** Source ids for the detail page's random button. */
export const GET: APIRoute = async () =>
  Response.json((await getSites()).map((site) => site.id))
