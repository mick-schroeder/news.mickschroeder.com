import { graphql } from 'gatsby';

// Shared i18n fragment. Import this file (side-effect) in any page that uses `...LocaleFields`.
export const LocaleFields = graphql`
  fragment LocaleFields on Locale {
    ns
    data
    language
  }
`;
