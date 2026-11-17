import { useSyncExternalStore } from "react"
import { getRelativeLocaleUrl } from "astro:i18n"
import { Mail, Share2 } from "lucide-react"
import {
  siBluesky,
  siFacebook,
  siReddit,
  siThreads,
  siWhatsapp,
  siX,
} from "simple-icons"
import { Button, buttonVariants } from "@/components/ui/button"
import type { Locale } from "@/i18n/locales"
import { format, translations } from "@/i18n/ui"

const canShare = () => typeof navigator.share === "function"
const enc = encodeURIComponent

/** Each network's share page, filled in with the text and link. */
const networks = [
  {
    icon: siX,
    href: (text: string, url: string) =>
      `https://x.com/intent/post?text=${enc(text)}&url=${enc(url)}`,
  },
  {
    icon: siBluesky,
    href: (text: string, url: string) =>
      `https://bsky.app/intent/compose?text=${enc(`${text} ${url}`)}`,
  },
  {
    icon: siThreads,
    href: (text: string, url: string) =>
      `https://www.threads.net/intent/post?text=${enc(`${text} ${url}`)}`,
  },
  {
    icon: siFacebook,
    href: (_text: string, url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
  },
  {
    icon: siReddit,
    href: (text: string, url: string) =>
      `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(text)}`,
  },
  {
    icon: siWhatsapp,
    href: (text: string, url: string) =>
      `https://wa.me/?text=${enc(`${text} ${url}`)}`,
  },
]

/** The device's share sheet where there is one, then links to each network. */
export function ShareButtons({
  locale,
  source,
}: {
  locale: Locale
  source: { id: string; title: string }
}) {
  const t = translations[locale]
  const native = useSyncExternalStore(
    () => () => {},
    canShare,
    () => false
  )
  const url = new URL(
    getRelativeLocaleUrl(locale, `sources/${source.id}/`),
    import.meta.env.SITE
  ).href
  const text = format(t.shareText, { title: source.title })
  const link = buttonVariants({ variant: "outline", size: "icon-sm" })

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {native && (
        <Button
          variant="outline"
          size="sm"
          className="mr-1"
          onClick={() =>
            navigator.share({ title: text, url }).catch(() => {
              // closed without sharing
            })
          }
        >
          <Share2 data-icon="inline-start" aria-hidden="true" />
          {t.share}
        </Button>
      )}
      <ul className="flex flex-wrap gap-1.5" aria-label={t.share}>
        {networks.map(({ icon, href }) => {
          const label = format(t.shareOn, { network: icon.title })
          return (
            <li key={icon.slug}>
              <a
                href={href(text, url)}
                target="_blank"
                rel="noopener noreferrer"
                className={link}
                title={label}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-4 fill-current"
                >
                  <path d={icon.path} />
                </svg>
                <span className="sr-only">
                  {label} ({t.opensInNewTab})
                </span>
              </a>
            </li>
          )
        })}
        <li>
          <a
            href={`mailto:?subject=${enc(text)}&body=${enc(url)}`}
            className={link}
            title={t.shareByEmail}
          >
            <Mail aria-hidden="true" />
            <span className="sr-only">{t.shareByEmail}</span>
          </a>
        </li>
      </ul>
    </div>
  )
}
