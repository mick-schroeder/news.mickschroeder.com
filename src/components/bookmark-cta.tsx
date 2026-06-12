import React from 'react';
import { Trans } from 'gatsby-plugin-react-i18next';
import { Button } from './ui/button';
import { Bookmark, Copy, Check } from 'lucide-react';
import LocalizedLink from './LocalizedLink';
import { getSiteConfig } from '../config/getSiteConfig';
import { useSourceFilterContext } from './context/source-filter-context';

const site = getSiteConfig();

const BookmarkCTA: React.FC = () => {
  const linkRef = React.useRef<HTMLAnchorElement>(null);
  const [copied, setCopied] = React.useState(false);
  const { filterQueryString } = useSourceFilterContext();

  // Sync the visible anchor's href to the localized Link's resolved URL
  React.useEffect(() => {
    const el = document.getElementById('bookmark-localized') as HTMLAnchorElement | null;
    if (el && linkRef.current) {
      linkRef.current.href = el.href; // absolute, localized URL
    }
  }, [filterQueryString]);

  const onCopy = async () => {
    const href = linkRef.current?.href;
    if (!href) return;
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (e) {
      // no-op
    }
  };

  const bookmarkTitle = site.copyOverrides?.bookmarkTitle;
  const bookmarkDescription = site.copyOverrides?.bookmarkDescription;
  const bookmarkLinkLabel = site.copyOverrides?.bookmarkLinkLabel;

  return (
    <div className="my-6 w-full max-w-2xl rounded-xl border border-dashed bg-muted/30 px-4 py-4 text-start sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Bookmark className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            {bookmarkTitle || (
              <Trans i18nKey="bookmark.title" defaults="Bookmark the Shuffle link" />
            )}
          </p>
          <p className="mt-1 text-pretty text-sm text-muted-foreground">
            {bookmarkDescription || (
              <Trans
                i18nKey="bookmark.description"
                defaults="Drag this link to your bookmarks bar, or right‑click it and choose ‘Bookmark link’."
              />
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <a
            ref={linkRef}
            href="#"
            // We want a localized link; Link handles the path, but we also
            // need a plain <a> element to expose absolute href for copying.
            // We'll render a hidden Link to generate the correct path and sync it.
            className="whitespace-nowrap font-semibold text-primary hover:underline"
            onClick={(e) => e.preventDefault()}
          >
            {bookmarkLinkLabel || <Trans i18nKey="bookmark.link_label" defaults="News Shuffle" />}
          </a>
          <Button type="button" size="sm" variant="outline" onClick={onCopy} aria-live="polite">
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" aria-hidden="true" />
                <Trans i18nKey="bookmark.copied" defaults="Copied" />
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
                <Trans i18nKey="bookmark.copy" defaults="Copy link" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Hidden localized Link to resolve the correct href; we mirror it onto the visible anchor via effect */}
      <span className="hidden" aria-hidden="true">
        <LocalizedLink id="bookmark-localized" to={`/redirect${filterQueryString}`}>
          localized redirect link
        </LocalizedLink>
      </span>
    </div>
  );
};
export default BookmarkCTA;
