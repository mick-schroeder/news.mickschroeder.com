// Adapted from SmoothUI's CardSwipeDeck (https://smoothui.dev, MIT): the
// caller owns the cards, any card that leaves is thrown, plus deals,
// recalls, a loose pile and idle breathing.
import { useState, type ReactNode } from "react"
import {
  animate as animateValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
  type TargetAndTransition,
  type Transition,
} from "motion/react"
import { cn } from "@/lib/utils"

const dragRange = 260 // px input domain for the drag rotation
const velocityCommit = 450 // px/s
const exitDistance = 900
const minThrowSpeed = 750 // px/s floor so button throws still fly
const throwLift = -160 // px/s upward bias for non-drag throws
const verticalLimit = 90
const scaleStep = 0.05
// Swing around a point below the card, near the hand, not its centre.
const pivotOrigin = "50% 165%"

const throwTransition = { type: "spring", bounce: 0, duration: 0.34 } as const
const snapBack = { type: "spring", bounce: 0.3, duration: 0.45 } as const
const stackTransition = { type: "spring", bounce: 0, duration: 0.35 } as const

/** How a card that leaves the deck goes. */
export type DeckExit = "left" | "right" | "up"

type Entry = "deal" | "drop" | "rise"

type Throw = { exit: DeckExit; x: number; y: number; vx: number; vy: number }

type Flight<T> = {
  key: string
  item: T
  pos: number
  kind: "throw" | "fan" | "fade"
  toss?: Throw
}

type Layout = {
  stackSize: number
  stackOffset: number
}

/** A card's own slant in the pile, kept as it moves up; the top one is straight. */
function leanOf(id: string, maxTilt: number) {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0
  const step = (Math.abs(hash) % 5) - 2
  return (step || 1) * (maxTilt / 2)
}

const rest = (pos: number, { stackSize, stackOffset }: Layout, lean = 0) => ({
  x: 0,
  y: Math.min(pos, stackSize) * stackOffset,
  scale: 1 - Math.min(pos, stackSize) * scaleStep,
  rotate: pos ? lean : 0,
  opacity: pos < stackSize ? 1 : 0,
})

function entryState(
  entry: Entry,
  pos: number,
  layout: Layout,
  reduce: boolean
): TargetAndTransition {
  if (reduce) return { ...rest(pos, layout), opacity: 0 }
  const side = pos % 2 ? 1 : -1
  if (entry === "deal") {
    return {
      x: 0,
      y: pos * layout.stackOffset + 48,
      scale: 0.9,
      rotate: side * 9,
      opacity: 0,
    }
  }
  if (entry === "drop") {
    return { x: 0, y: -28, scale: 1.06, rotate: 0, opacity: 0 }
  }
  return { ...rest(layout.stackSize, layout), opacity: 0 }
}

/** A card in the pile; the front one drags and throws. */
function DeckCard({
  front,
  pos,
  count,
  entry,
  layout,
  lean,
  threshold,
  rotationFactor,
  reduce,
  onCommit,
  onLift,
  children,
}: {
  front: boolean
  pos: number
  count: number
  entry: Entry
  layout: Layout
  lean: number
  threshold: number
  rotationFactor: number
  reduce: boolean
  onCommit: (toss: Throw) => boolean
  onLift?: () => void
  children: ReactNode
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(
    x,
    [-dragRange, dragRange],
    [-rotationFactor, rotationFactor]
  )
  const [settled, setSettled] = useState(entry !== "deal")
  const [dragged, setDragged] = useState(false)

  // A fresh deal lands bottom card first, after the old pile clears.
  const delay = settled ? 0 : 0.14 + (layout.stackSize - 1 - pos) * 0.07
  const transition: Transition = reduce
    ? { duration: 0.15 }
    : { ...stackTransition, delay }

  function onDragEnd(_: unknown, info: PanInfo) {
    const commit =
      Math.abs(info.offset.x) > threshold ||
      Math.abs(info.velocity.x) > velocityCommit
    const toss: Throw = {
      exit: info.offset.x > 0 ? "right" : "left",
      x: x.get(),
      y: y.get(),
      vx: info.velocity.x,
      vy: info.velocity.y,
    }
    if (commit && onCommit(toss)) return
    // Below threshold, or the deck said no: spring back to centre.
    const back = reduce ? { duration: 0 } : snapBack
    animateValue(x, 0, back)
    animateValue(y, 0, back)
  }

  return (
    <motion.div
      className="absolute inset-x-0 top-0 origin-bottom"
      style={{ zIndex: count - pos }}
      initial={entryState(entry, pos, layout, reduce)}
      animate={rest(pos, layout, lean)}
      transition={transition}
      onAnimationComplete={() => setSettled(true)}
    >
      {/* One element whether on top or not, so the card never remounts. */}
      <motion.div
        className={cn(
          front
            ? "cursor-grab touch-pan-y active:cursor-grabbing"
            : onLift && "cursor-pointer"
        )}
        style={{ x, y, rotate, transformOrigin: pivotOrigin }}
        drag={front}
        dragConstraints={{ top: -verticalLimit, bottom: verticalLimit }}
        dragElastic={{ left: 1, right: 1, top: 0.35, bottom: 0.35 }}
        dragMomentum={false}
        whileDrag={reduce ? undefined : { scale: 1.02 }}
        onPointerDown={() => setDragged(false)}
        onDragStart={() => setDragged(true)}
        onDragEnd={onDragEnd}
        // A drag that ends over a link doesn't follow it.
        onClickCapture={(event) => {
          if (!dragged) return
          event.preventDefault()
          event.stopPropagation()
        }}
        // Cards underneath only lift to the top.
        onClick={front ? undefined : onLift}
        aria-hidden={front ? undefined : true}
      >
        <div inert={!front}>{children}</div>
      </motion.div>
    </motion.div>
  )
}

/** A card on its way out: thrown, fanned away on a deal, or pushed out. */
function FlyingCard({
  flight,
  count,
  layout,
  lean,
  rotationFactor,
  reduce,
  onDone,
  children,
}: {
  flight: Flight<unknown>
  count: number
  layout: Layout
  lean: number
  rotationFactor: number
  reduce: boolean
  onDone: () => void
  children: ReactNode
}) {
  const { pos, kind, toss } = flight
  const start = rest(pos, layout, lean)
  let initial: TargetAndTransition = start
  let animate: TargetAndTransition

  if (reduce) {
    animate = { opacity: 0, transition: { duration: 0.12 } }
  } else if (kind === "throw" && toss?.exit === "up") {
    animate = {
      y: -36,
      scale: 1.05,
      opacity: 0,
      transition: { duration: 0.24, ease: [0.4, 0, 1, 1] },
    }
  } else if (kind === "throw" && toss) {
    // Keep the throw on the line the finger was already drawing.
    const way = toss.exit === "left" ? -1 : 1
    const speed = Math.max(Math.abs(toss.vx), minThrowSpeed)
    const vy = toss.vy || throwLift
    const lean = Math.max(-1, Math.min(1, toss.x / dragRange))
    initial = {
      ...start,
      x: toss.x,
      y: start.y + toss.y,
      rotate: lean * rotationFactor,
    }
    animate = {
      x: way * exitDistance,
      y: start.y + toss.y + vy * throwTransition.duration,
      rotate: way * 24,
      opacity: [1, 1, 0],
      transition: {
        x: { ...throwTransition, velocity: way * speed },
        y: { ...throwTransition, velocity: vy },
        rotate: throwTransition,
        opacity: { duration: 0.34, times: [0, 0.6, 1] },
      },
    }
  } else if (kind === "fan") {
    const side = pos % 2 ? 1 : -1
    animate = {
      x: side * (90 + pos * 40),
      y: start.y - 10,
      rotate: side * (10 + pos * 6),
      opacity: 0,
      transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
    }
  } else {
    animate = {
      ...rest(layout.stackSize, layout),
      opacity: 0,
      transition: { duration: 0.2 },
    }
  }

  return (
    <motion.div
      aria-hidden="true"
      inert
      className="pointer-events-none absolute inset-x-0 top-0 origin-bottom"
      style={{
        zIndex: kind === "throw" ? count + 1 : count - pos,
        transformOrigin: kind === "throw" ? pivotOrigin : undefined,
      }}
      initial={initial}
      animate={animate}
      onAnimationComplete={onDone}
    >
      {children}
    </motion.div>
  )
}

/**
 * A pile of cards. The caller owns which cards are in it: drop the top one
 * and it's thrown the way `exit` says; change `dealKey` and the old pile fans
 * out as a new one is dealt. A drag past the threshold asks `onSwipe`, which
 * returns false to send the card back.
 */
export function CardSwipeDeck<T extends { id: string }>({
  items,
  exit,
  dealKey = 0,
  onSwipe,
  onLift,
  renderItem,
  height,
  stackSize = 3,
  stackOffset = 16,
  threshold = 110,
  rotationFactor = 18,
  maxTilt = 2.5,
  breathe = true,
  className,
}: {
  items: T[]
  exit: DeckExit
  dealKey?: number
  onSwipe: (item: T, direction: "left" | "right") => boolean
  onLift?: (item: T) => void
  renderItem: (item: T, front: boolean) => ReactNode
  /** Height of one card, in px. */
  height: number
  stackSize?: number
  stackOffset?: number
  threshold?: number
  rotationFactor?: number
  /** Most a card underneath slants, in degrees. */
  maxTilt?: number
  breathe?: boolean
  className?: string
}) {
  const reduce = Boolean(useReducedMotion())
  const layout: Layout = { stackSize, stackOffset }
  const visible = items.slice(0, stackSize)

  const [seen, setSeen] = useState({ items: visible, dealKey })
  const [entries, setEntries] = useState<Record<string, Entry>>({})
  const [flights, setFlights] = useState<Flight<T>[]>([])
  const [toss, setToss] = useState<Throw>()
  const [flightCount, setFlightCount] = useState(0)

  const keyOf = (item: T) => `${dealKey}:${item.id}`

  // Cards that left since the last render fly out; new ones get an entry.
  const changed =
    seen.dealKey !== dealKey ||
    seen.items.map((item) => item.id).join() !==
      visible.map((item) => item.id).join()
  if (changed) {
    const dealt = seen.dealKey !== dealKey || !seen.items.length
    const kept = new Set(dealt ? [] : visible.map((item) => item.id))
    const gone = seen.items
      .map((item, pos) => ({ item, pos }))
      .filter(({ item }) => !kept.has(item.id))
    const leaving = gone.map<Flight<T>>(({ item, pos }, index) => ({
      key: `fly:${flightCount + index}`,
      item,
      pos,
      kind: dealt ? "fan" : pos === 0 ? "throw" : "fade",
      toss:
        pos === 0 ? (toss ?? { exit, x: 0, y: 0, vx: 0, vy: 0 }) : undefined,
    }))
    const fresh: Record<string, Entry> = {}
    visible.forEach((item, pos) => {
      if (!(keyOf(item) in entries)) {
        fresh[keyOf(item)] = dealt ? "deal" : pos === 0 ? "drop" : "rise"
      }
    })
    setSeen({ items: visible, dealKey })
    setEntries((current) => ({ ...current, ...fresh }))
    setFlights((current) => [...current, ...leaving])
    setFlightCount((count) => count + leaving.length)
    setToss(undefined)
  }

  return (
    <div
      className={cn("relative w-full", className)}
      style={{ height: height + (stackSize - 1) * stackOffset + 8 }}
    >
      {/* The pile breathes as one, so moving a card never restarts it. */}
      <motion.div
        className="absolute inset-0"
        animate={
          breathe && !reduce
            ? { y: [0, -3, 0], rotate: [0, 0.3, 0] }
            : undefined
        }
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {visible.map((item, pos) => (
          <DeckCard
            key={keyOf(item)}
            front={pos === 0}
            pos={pos}
            count={visible.length}
            entry={
              entries[keyOf(item)] ?? (seen.items.length ? "rise" : "deal")
            }
            layout={layout}
            lean={leanOf(item.id, maxTilt)}
            threshold={threshold}
            rotationFactor={rotationFactor}
            reduce={reduce}
            onCommit={(next) => {
              if (!onSwipe(item, next.exit === "left" ? "left" : "right")) {
                return false
              }
              setToss(next)
              return true
            }}
            onLift={onLift && (() => onLift(item))}
          >
            {renderItem(item, pos === 0)}
          </DeckCard>
        ))}
        {flights.map((flight) => (
          <FlyingCard
            key={flight.key}
            flight={flight}
            count={visible.length}
            layout={layout}
            lean={leanOf(flight.item.id, maxTilt)}
            rotationFactor={rotationFactor}
            reduce={reduce}
            onDone={() =>
              setFlights((current) =>
                current.filter((candidate) => candidate.key !== flight.key)
              )
            }
          >
            {renderItem(flight.item, flight.kind === "throw")}
          </FlyingCard>
        ))}
      </motion.div>
    </div>
  )
}
