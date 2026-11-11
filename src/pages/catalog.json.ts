import { getSources } from "@/data/catalog"

export async function GET() {
  return Response.json(getSources())
}
