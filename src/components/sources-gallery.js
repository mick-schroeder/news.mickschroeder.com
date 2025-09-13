import React, { useMemo } from "react";
import { useStaticQuery, graphql } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { useI18next } from "gatsby-plugin-react-i18next";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { AspectRatio } from "./ui/aspect-ratio";
import { ExternalLink } from "lucide-react";

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
      <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {sortedSources.map(({ node }, idx) => {
          const image = getImage(node.screenshot);
          const eager = idx < 3 ? "eager" : "lazy";
          const localeText = Array.isArray(node.locale) ? node.locale.join(", ") : node.locale;
          return (
            <a
              key={node.hash || node.url}
              href={node.url}
              target="_blank"
              rel="noopener"
              aria-label={`Open ${node.name} in a new tab`}
              className="block group"
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="p-4">
                  <CardTitle className="text-card-foreground group-hover:text-primary">
                    {node.name}
                  </CardTitle>
                </CardHeader>
                <AspectRatio ratio={9/16} className="bg-muted">
                  {image ? (
                    <GatsbyImage
                      image={image}
                      alt={`${node.name}`}
                      loading={eager}
                      className="w-full h-full"
                      imgClassName="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={`/screenshots/${node.hash}.webp`}
                      alt={`${node.name}`}
                      loading={eager}
                      decoding="async"
                      className="w-full h-full object-cover"
                      width="720"
                      height="1280"
                    />
                  )}
                </AspectRatio>
                <CardFooter className="p-4">
                  <div className="text-xs font-semibold inline-flex items-center text-primary hover:text-primary">
                    <p className="truncate mr-2">
                      {node.url.length > 30 ? node.url.slice(0, 30) + "..." : node.url}
                    </p>
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  </div>
                </CardFooter>
              </Card>
            </a>
          );
        })}
      </div>
    </section>
  );
};

export default SourcesGallery;
