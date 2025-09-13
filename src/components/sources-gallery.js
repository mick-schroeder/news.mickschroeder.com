import React, { useMemo } from "react";
import { useStaticQuery, graphql } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { useI18next } from "gatsby-plugin-react-i18next";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { AspectRatio } from "./ui/aspect-ratio";
import { ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Badge } from "./ui/badge";

const SourcesGallery = ({ limit, sort }) => {
  const data = useStaticQuery(graphql`
    query {
      allSourcesJson {
        edges {
          node {
            name
            score
            locale
            url
            hash
            screenshot {
              childImageSharp {
                gatsbyImageData(
                  width: 720
                  breakpoints: [360, 720, 1080],
                  sizes: "(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw",
                  placeholder: BLURRED
                  aspectRatio: 0.5625
                )
              }
            }
          }
        }
      }
    }
  `);

  const { language } = useI18next();
  const sortedSources = useMemo(() => {
    const all = data.allSourcesJson.edges;
    const localeMatches = (loc) =>
      Array.isArray(loc) ? loc.includes(language) : loc === language;
    // Filter by current i18n language (locale codes like 'en-IE', 'ga', 'en-US')
    const filtered = all.filter(({ node }) => localeMatches(node.locale));
    let list = [...filtered];
    switch (sort) {
      case "random":
        list.sort(() => 0.5 - Math.random());
        break;
      case "alphabetical":
        list.sort((a, b) => a.node.name.localeCompare(b.node.name));
        break;
      case "rating":
        list.sort((a, b) => parseFloat(b.node.score) - parseFloat(a.node.score));
        break;
      default:
        break;
    }
    return limit ? list.slice(0, limit) : list;
  }, [data.allSourcesJson.edges, language, limit, sort]);

  return (
    <section id="sources-gallery" className="scroll-mt-24">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {sortedSources.map(({ node }, idx) => {
          const image = getImage(node.screenshot);
          const eager = idx < 3 ? "eager" : "lazy";
          const localeText = Array.isArray(node.locale) ? node.locale.join(", ") : node.locale;
          const displayUrl = node.url.length > 42 ? node.url.slice(0, 42) + "..." : node.url;
          return (
            <Card key={node.hash || node.url} className="overflow-hidden transition-shadow hover:shadow-md">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="truncate text-card-foreground">
                    <a href={node.url} target="_blank" rel="noreferrer" className="hover:underline">
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
                      alt={`${node.name}`}
                      loading={eager}
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={`/screenshots/${node.hash}.webp`}
                      alt={`${node.name}`}
                      loading={eager}
                      decoding="async"
                      className="h-full w-full object-cover"
                      width="720"
                      height="1280"
                    />
                  )}
                </AspectRatio>
              </CardContent>
              <CardFooter className="p-4">
                <div className="flex w-full items-center justify-between">
                  <a
                    href={node.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-xs font-semibold text-primary hover:underline"
                  >
                    {displayUrl}
                  </a>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild size="icon" variant="ghost" aria-label={`Open ${node.name}`}>
                          <a href={node.url} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Open in new tab</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default SourcesGallery;
