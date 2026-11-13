import { getSites } from "@/lib/catalog"

export async function GET() {
  return Response.json(await getSites())
}
