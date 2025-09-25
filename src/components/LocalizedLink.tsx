import React from 'react';
import { Link as I18nLink } from 'gatsby-plugin-react-i18next';
import type { GatsbyLinkProps } from 'gatsby';

type LocalizedLinkProps = GatsbyLinkProps<Record<string, unknown>> & {
  language?: string;
  hrefLang?: string;
};

const LocalizedLink = React.forwardRef<HTMLAnchorElement, LocalizedLinkProps>((props, ref) => (
  <I18nLink {...(props as any)} ref={ref} />
));

LocalizedLink.displayName = 'LocalizedLink';

export type { LocalizedLinkProps };
export default LocalizedLink;
