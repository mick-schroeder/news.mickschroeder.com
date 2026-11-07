import type { APIRoute } from "astro"
import { adsenseClient } from "@/lib/google-config"

export const GET: APIRoute = () =>
  new Response(
    `google.com, ${adsenseClient.slice(3)}, DIRECT, f08c47fec0942fa0\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  )
