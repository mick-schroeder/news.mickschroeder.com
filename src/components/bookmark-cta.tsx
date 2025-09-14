import * as React from "react";
import { Link, Trans } from "gatsby-plugin-react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Bookmark, Copy, Check } from "lucide-react";

const BookmarkCTA: React.FC = () => {
  const linkRef = React.useRef<HTMLAnchorElement>(null);
  const [copied, setCopied] = React.useState(false);

  // Sync the visible anchor's href to the localized Link's resolved URL
  React.useEffect(() => {
    const el = document.getElementById("bookmark-localized") as HTMLAnchorElement | null;
    if (el && linkRef.current) {
      linkRef.current.href = el.href; // absolute, localized URL
    }
  });

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

  return (
    <Card className="my-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Bookmark className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <Trans i18nKey="bookmark.title" defaults="Bookmark the Shuffle link" />
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p className="mb-3">
          <Trans
            i18nKey="bookmark.description"
            defaults="Drag this link to your bookmarks bar, or right‑click it and choose ‘Bookmark link’."
          />
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <a
            ref={linkRef}
            href="#"
            // We want a localized link; Link handles the path, but we also
            // need a plain <a> element to expose absolute href for copying.
            // We'll render a hidden Link to generate the correct path and sync it.
            className="font-semibold text-primary hover:underline"
            onClick={(e) => e.preventDefault()}
          >
            <Trans i18nKey="bookmark.link_label" defaults="Shuffle (Bookmark me)" />
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

        {/* Hidden localized Link to resolve the correct href; we mirror it onto the visible anchor via effect */}
        <span className="hidden" aria-hidden="true">
          <Link id="bookmark-localized" to="/redirect">
            localized redirect link
          </Link>
        </span>
      </CardContent>
    </Card>
  );
};
export default BookmarkCTA;
