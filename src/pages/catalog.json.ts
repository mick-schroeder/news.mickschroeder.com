import { getWebsites } from "@/data/catalog"

export async function GET() {
  return Response.json(getWebsites())
}
