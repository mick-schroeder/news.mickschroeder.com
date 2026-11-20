declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    googlefc?: {
      callbackQueue: Array<() => void>
      showRevocationMessage?: () => void
    }
  }
}

export {}
