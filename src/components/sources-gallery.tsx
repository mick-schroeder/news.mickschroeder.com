import React, { useMemo } from "react";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { AspectRatio } from "./ui/aspect-ratio";
import { ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Trans, useTranslation } from "gatsby-plugin-react-i18next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Badge } from "./ui/badge";

type Source = {
  name: string;
  score?: number | string;
  locale: string | string[];
  url: string;
  hash?: string;
  screenshot?: any;
};

type Props = {
  items: Source[];
  limit?: number;
  sort?: "alphabetical" | "rating";
};

const SourcesGallery: React.FC<Props> = ({ items, limit, sort }) => {
  const sortedSources = useMemo(() => {
    let list = [...items];

    switch (sort) {
      case "alphabetical":
        list.sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)));
        break;
      case "rating": {
        const scoreOf = (s: any) => {
          const n = parseFloat(String(s ?? "0"));
          return Number.isFinite(n) ? n : 0;
        };
        list.sort((a: any, b: any) => scoreOf(b.score) - scoreOf(a.score));
        break;
      }
      default: {
        // Default to rating sort
        const scoreOf = (s: any) => {
          const n = parseFloat(String(s ?? "0"));
          return Number.isFinite(n) ? n : 0;
        };
        list.sort((a: any, b: any) => scoreOf(b.score) - scoreOf(a.score));
        break;
      }
    }
    return limit ? list.slice(0, limit) : list;
  }, [items, limit, sort]);

  const { t } = useTranslation();

  if (!sortedSources.length) return null;

  return (
    <section id="sources-gallery" className="scroll-mt-24">
      <TooltipProvider>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {sortedSources.map((node: Source, idx: number) => {
            const image = getImage((node as any).screenshot);
            const eager: "eager" | "lazy" = idx < 3 ? "eager" : "lazy";
            const fetchP = idx < 3 ? "high" : undefined;
            const localeText = Array.isArray(node.locale) ? node.locale.join(", ") : node.locale;
            const titleId = `card-title-${node.hash || idx}`;
            let host = node.url;
            try {
              host = new URL(node.url).host;
            } catch {}
            return (
              <Card
                key={node.hash || node.url}
                className="overflow-hidden motion-safe:transition-shadow cursor-pointer hover:shadow-lg hover:ring-1 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 [content-visibility:auto] [contain-intrinsic-size:720px_1280px]"
                role="link"
                tabIndex={0}
                aria-labelledby={titleId}
                onClick={() => {
                  if (typeof window !== "undefined") window.open(node.url, "_blank", "noopener");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (typeof window !== "undefined") window.open(node.url, "_blank", "noopener");
                  }
                }}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="truncate text-card-foreground">
                      <span id={titleId} className="sr-only">
                        {node.name}
                      </span>
                    <a
                      href={node.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                      tabIndex={-1}
                      aria-hidden="true"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      {node.name}
                    </a>
                    </CardTitle>
                    {localeText ? (
                      <Badge variant="secondary" className="shrink-0">{localeText}</Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <AspectRatio ratio={9 / 16} className="bg-muted">
                    {image ? (
                      <GatsbyImage
                        image={image}
                        alt={`Screenshot of ${node.name}`}
                        loading={eager}
                        fetchpriority={fetchP as any}
                        className="h-full w-full"
                        imgClassName="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={`/screenshots/${node.hash}.webp`}
                        alt={`Screenshot of ${node.name}`}
                        loading={eager}
                        fetchpriority={fetchP as any}
                        decoding="async"
                        className="h-full w-full object-cover"
                        width="720"
                        height="1280"
                      />
                    )}
                  </AspectRatio>
                </CardContent>
                <CardFooter className="p-4">
                  <div className="flex w-full items-center justify-between gap-2">
                  <a
                    href={node.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-xs font-semibold text-primary hover:underline flex-1 min-w-0"
                    title={node.url}
                    aria-label={String(t("open_site", { name: node.name }))}
                    tabIndex={-1}
                    aria-hidden="true"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    {host}
                  </a>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild size="icon" variant="ghost">
                        <a
                          href={node.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={String(t("open_site", { name: node.name }))}
                          tabIndex={-1}
                          aria-hidden="true"
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><Trans i18nKey="open_in_new_tab" /></TooltipContent>
                    </Tooltip>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </TooltipProvider>
    </section>
  );
};

export default SourcesGallery;
