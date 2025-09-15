import React from 'react';
import { graphql, PageProps } from 'gatsby';
import SiteLayout from '@/components/site-layout';
import { SEO } from '@/components/seo';
import '../fragments/locale';

type DataProps = {
  mdx: {
    body: string;
    frontmatter?: {
      title?: string;
      description?: string;
    } | null;
  };
};

const MdPageTemplate: React.FC<PageProps<DataProps>> = ({ data, children }) => {
  const fm = data.mdx.frontmatter || {};
  return (
    <SiteLayout>
      <article className="prose prose-neutral dark:prose-invert max-w-prose">
        {fm.title && <h1 className="mb-6">{fm.title}</h1>}
        {children}
      </article>
    </SiteLayout>
  );
};

export default MdPageTemplate;

export const Head: React.FC<PageProps<DataProps>> = ({ data }) => (
  <SEO title={data.mdx.frontmatter?.title} description={data.mdx.frontmatter?.description} />
);

export const query = graphql`
  query MdPageTemplate($id: String!, $language: String!) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
        description
      }
    }
    locales: allLocale(filter: { language: { eq: $language } }) {
      edges {
        node {
          ...LocaleFields
        }
      }
    }
  }
`;
