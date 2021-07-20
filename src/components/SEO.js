import React from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { graphql, useStaticQuery } from "gatsby";
import path from "path";

const SEO = ({ title, location, children }) => {
  const {
    site: { siteMetadata },
  } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          titleTemplate
          siteUrl
        }
      }
    }
  `);

  const { defaultTitle, titleTemplate, siteUrl } = siteMetadata;

  const template = title ? titleTemplate : "%s";

  return (
    <Helmet titleTemplate={template}>
      <title>{title || defaultTitle}</title>
      {children}
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
};

export default SEO;
