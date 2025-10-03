import { graphql } from 'gatsby';

// Shared fields for NewsSource items used by the sources gallery cards.
export const NewsSourceCardFields = graphql`
  fragment NewsSourceCardFields on NewsSource {
    name
    score
    categories
    url
    hash
    screenshot {
      childImageSharp {
        gatsbyImageData(
          layout: CONSTRAINED
          width: 720
          height: 1280
          formats: [AUTO, WEBP, AVIF]
          placeholder: DOMINANT_COLOR
          breakpoints: [360, 540, 720]
          sizes: "(min-width:768px) 33vw, (min-width:640px) 50vw, 100vw"
          transformOptions: { fit: COVER, cropFocus: ATTENTION }
        )
      }
    }
  }
`;
