import { useEffect, useReducer } from "react"
import type { Source } from "@/lib/shuffle"

/** Shortest skeleton time per pick; also caps how fast people can shuffle. */
export const minLoadingMs = 500
/** Longest wait for a favicon before showing the pick anyway. */
const maxIconMs = 2000

export type PickState<T> =
  | { status: "empty" }
  | { status: "loading"; source: T; minMs: number }
  | { status: "ready"; source: T }

type PickEvent<T> =
  | { type: "pick"; source: T | undefined }
  | { type: "settle"; from: PickState<T> }

function picked<T>(source: T | undefined, minMs: number): PickState<T> {
  return source ? { status: "loading", source, minMs } : { status: "empty" }
}

function reducer<T>(state: PickState<T>, event: PickEvent<T>): PickState<T> {
  switch (event.type) {
    case "pick":
      return picked(event.source, minLoadingMs)
    case "settle":
      // Ignore loads a newer pick replaced.
      return state === event.from && state.status === "loading"
        ? { status: "ready", source: state.source }
        : state
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function preload(src: string) {
  const image = new Image()
  image.src = src
  return image.decode().catch(() => {})
}

/**
 * A random source moving empty → loading → ready. Loading lasts at least
 * minLoadingMs and until the favicon is in, so the card never pops in half done.
 */
export function usePick<T extends Pick<Source, "icon">>(
  first: () => T | undefined,
  firstMinMs: number
) {
  const [state, dispatch] = useReducer(reducer<T>, undefined, () =>
    picked(first(), firstMinMs)
  )

  useEffect(() => {
    if (state.status !== "loading") return
    const icon = Promise.race([preload(state.source.icon), wait(maxIconMs)])
    Promise.all([wait(state.minMs), icon]).then(() =>
      dispatch({ type: "settle", from: state })
    )
  }, [state])

  const pick = (source: T | undefined) => dispatch({ type: "pick", source })
  return [state, pick] as const
}
