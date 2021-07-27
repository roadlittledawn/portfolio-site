import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useStaticQuery, graphql } from "gatsby";
import { useMedia } from "react-use";
import Layout from "../components/Layout/Layout";
import Header from "../components/Header";
import SEO from "../components/SEO";
import MobileNav from "../components/MobileNav";

import { css } from "@emotion/react";

const MainLayout = ({ children }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const {
    basics: { profiles },
  } = useStaticQuery(graphql`
    query {
      basics {
        profiles {
          network
          url
          username
        }
      }
    }
  `);

  // useEffect(() => {
  //   setIsMobileNavOpen(false);
  // }, [location.pathname]);

  return (
    <>
      <SEO />
      <Header profiles={profiles} />
      <MobileNav />
      <Layout>
        <Layout.Main
          css={css`
            display: ${isMobileNavOpen ? "none" : "block"};
            > section {
              @media screen and (max-width: 980px) {
                flex-wrap: wrap;
              }
            }
          `}
        >
          {children}
        </Layout.Main>

        <Layout.Footer profiles={profiles} />
      </Layout>
    </>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node,
};

export default MainLayout;
