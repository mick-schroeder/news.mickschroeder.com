declare module "*.svg" {
  const content: string
  export default content
}

// Allow importing JS modules from TS without type defs
declare module "../hooks/use-site-metadata" {
  export const useSiteMetadata: () => any
}

declare module "../components/next-site-context" {
  import * as React from "react"
  export const NextSiteProvider: React.FC<React.PropsWithChildren>
  export const useNextSiteContext: () => any
}

declare module "./next-site-context" {
  import * as React from "react"
  export const NextSiteProvider: React.FC<React.PropsWithChildren>
  export const useNextSiteContext: () => any
}
