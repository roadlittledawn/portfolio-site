import React, { useState } from "react";
import PropTypes from "prop-types";
import { useStaticQuery, graphql } from "gatsby";
import Layout from "../components/Layout/Layout";
import Header from "../components/Header";

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
      <div
        css={css`
          display: flex;
          min-height: 100vh;
          flex-direction: column;
          justify-content: flex-start;
        `}
      >
        <Header profiles={profiles} />
        <MobileNav profiles={profiles} />
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
