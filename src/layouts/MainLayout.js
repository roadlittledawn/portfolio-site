import React, { useState } from "react";
import PropTypes from "prop-types";
import { useStaticQuery, graphql } from "gatsby";
import Layout from "../components/Layout/Layout";
import Header from "../components/Header";
import Hamburger from "../components/Hamburger";
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
