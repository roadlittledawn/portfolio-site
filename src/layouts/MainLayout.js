import React, { useState } from "react";
import PropTypes from "prop-types";
import { useStaticQuery, graphql } from "gatsby";
import Layout from "../components/Layout/Layout";
import Header from "../components/Header";
import Hamburger from "../components/Hamburger";
import MobileNav from "../components/MobileNav";
import { css } from "@emotion/react";
import { siteOptions } from "../utils/constants";

const MainLayout = ({ children }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { layout } = siteOptions;

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

  return (
    <>
      <div
        css={css`
          display: flex;
          min-height: 100vh;
          flex-direction: column;
          justify-content: flex-start;
        `}
      >
        <Header profiles={profiles} />
        <Hamburger
          css={css`
            display: none;
            @media screen and (max-width: ${layout.mobileBreakpoint}) {
              display: flex;
            }
          `}
          open={isMobileNavOpen}
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
        />
        <MobileNav open={isMobileNavOpen} profiles={profiles} />
        <Layout>
          <Layout.Main
            css={css`
              > section {
                @media screen and (max-width: 980px) {
                  flex-wrap: wrap;
                }
              }
            `}
          >
            {children}
          </Layout.Main>
        </Layout>
        <Layout.Footer profiles={profiles} />
      </div>
    </>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node,
};

export default MainLayout;
