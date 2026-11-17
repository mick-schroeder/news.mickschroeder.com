import type { APIRoute } from "astro"
import { getSources } from "@/lib/catalog"

export const GET: APIRoute = async () => Response.json(await getSources())
