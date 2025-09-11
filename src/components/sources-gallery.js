import React, { useMemo } from "react";
import { useStaticQuery, graphql } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { useI18next } from "gatsby-plugin-react-i18next";

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
    <section>
      <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {sortedSources.map(({ node }, idx) => {
          const image = getImage(node.screenshot);
          const eager = idx < 3 ? "eager" : "lazy";
          return (
            <a
              key={node.hash || node.url}
              href={node.url}
              target="_blank"
              rel="noopener"
              referrerPolicy="origin"
              aria-label={`Open ${node.name} in a new tab`}
              className="bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg shadow hover:shadow-md dark:bg-neutral-800 dark:border-neutral-700 overflow-hidden hover:dark:bg-neutral-700 hover:dark:border-neutral-600 block"
            >
              <div className="p-4">
                <h4 className="text-lg font-semibold text-neutral-900 dark:text-white hover:text-green-600">
                  {node.name}
                </h4>
              </div>
              {image ? (
                <GatsbyImage image={image} alt={`${node.name}`} loading={eager} />
              ) : (
                <div className="aspect-[9/16] bg-neutral-200 dark:bg-neutral-800">
                  <img
                    src={`/screenshots/${node.hash}.webp`}
                    alt={`${node.name}`}
                    loading={eager}
                    decoding="async"
                    className="w-full h-full object-cover"
                    width="720"
                    height="1280"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="text-xs font-semibold inline-flex items-center text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-600">
                  <p className="truncate mr-2">
                    {node.url.length > 30
                      ? node.url.slice(0, 30) + "..."
                      : node.url}
                  </p>

                  <svg
                    className="w-4 h-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 18"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778"
                    />
                  </svg>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};

export default SourcesGallery;
