import { getRelativeLocaleUrl } from "astro:i18n"
import type { ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { SourceIcon } from "@/components/sources/source-icon"
import { translations, type Locale } from "@/i18n/ui"
import type { Source } from "@/lib/sources"

/** Recent sources replace the headliners once there are this many. */
export const minRecent = 8

// Each half of a row repeats until it's at least this many tiles wide.
const minTiles = 14

const tile =
  "block rounded-xl outline-none transition-transform focus-visible:ring-3 focus-visible:ring-ring motion-safe:hover:-translate-y-0.5"

/**
 * Sources scrolling by in one row. The row runs twice for a seamless loop;
 * the copy is hidden from assistive tech and the tab order. Hover or focus
 * pauses it.
 */
function Marquee({
  label,
  sources,
  renderTile,
}: {
  label: string
  sources: Source[]
  renderTile: (source: Source, copy: boolean) => ReactNode
}) {
  const repeat = Math.max(1, Math.ceil(minTiles / Math.max(sources.length, 1)))
  const half = Array.from({ length: repeat }, () => sources).flat()
  return (
    <div className="min-w-0 overflow-hidden mask-x-from-85%">
      <div
        className="flex w-max hover:[animation-play-state:paused] has-focus-visible:[animation-play-state:paused] motion-safe:animate-source-marquee"
        style={{ animationDuration: `${half.length * 3}s` }}
      >
        {[false, true].map((copy) => (
          <ul
            key={String(copy)}
            className="flex gap-3 py-1 pr-3"
            aria-label={copy ? undefined : label}
            aria-hidden={copy || undefined}
          >
            {half.map((source, position) => (
              <li key={`${source.id}-${position}`}>
                {/* Repeats within a half are copies too. */}
                {renderTile(source, copy || position >= sources.length)}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}

/**
 * Sources below the deck: the headliners to start with, then the sources you
 * opened lately, which go back on top of the deck when picked.
 */
export function SourcesShelf({
  locale,
  headliners,
  recent,
  onSelect,
}: {
  locale: Locale
  headliners: Source[]
  recent: Source[]
  onSelect: (source: Source) => void
}) {
  const t = translations[locale]
  const showRecent = recent.length >= minRecent

  return (
    <section
      className="col-span-full mt-6 min-w-0 border-t border-border py-6"
      aria-labelledby="sources-title"
    >
      <h2 id="sources-title" className="sr-only">
        {showRecent ? t.recent : t.sources}
      </h2>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={showRecent ? "recent" : "headliners"}
          className="min-w-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {showRecent ? (
            <Marquee
              label={t.recent}
              sources={recent}
              renderTile={(source, copy) => (
                <button
                  type="button"
                  title={source.title}
                  tabIndex={copy ? -1 : undefined}
                  className={tile}
                  onClick={() => onSelect(source)}
                >
                  <SourceIcon source={source} size="md" />
                  <span className="sr-only">{`${source.title}: ${t.backOnTop}`}</span>
                </button>
              )}
            />
          ) : (
            <Marquee
              label={t.sources}
              sources={headliners}
              renderTile={(source, copy) => (
                <a
                  href={getRelativeLocaleUrl(locale, `sources/${source.id}/`)}
                  title={source.title}
                  tabIndex={copy ? -1 : undefined}
                  className={tile}
                >
                  <SourceIcon source={source} size="md" />
                  <span className="sr-only">{source.title}</span>
                </a>
              )}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
