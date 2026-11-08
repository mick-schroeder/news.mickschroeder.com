import { catalogSchema } from "./catalog-schema"
import sources from "./sources.json"

export const getWebsites = () => catalogSchema.parse(sources)
