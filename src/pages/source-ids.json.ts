import type { APIRoute } from "astro"
import { getSources } from "@/lib/catalog"

/** Source ids for the detail page's random button. */
export const GET: APIRoute = async () =>
  Response.json((await getSources()).map((source) => source.id))
