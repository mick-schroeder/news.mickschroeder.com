import type { APIRoute } from "astro"
import { getSites } from "@/lib/catalog"

export const GET: APIRoute = async () => Response.json(await getSites())
