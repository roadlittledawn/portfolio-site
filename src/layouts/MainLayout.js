import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Layout from "../components/Layout/Layout";
import Header from "../components/Header";
import SEO from "../components/SEO";
import MobileHeader from "../components/MobileHeader";
import FeatherIcon from "../components/Icons";
// import { Logo, MobileHeader } from "@newrelic/gatsby-theme-newrelic";
import { graphql, useStaticQuery, Link } from "gatsby";
import { css } from "@emotion/react";
import { SOCIAL_ICON_NAMES } from "../utils/constants";
import FeatherSVG from "../components/FeatherSVG";

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
      <Header />
      <MobileHeader>Mobile nav</MobileHeader>
      <Layout>
        <Layout.Main
          css={css`
            display: ${isMobileNavOpen ? "none" : "block"};
          `}
        >
          {children}
        </Layout.Main>
        <aside
          css={css`
            position: fixed;
            bottom: 0;
            right: 1em;
            width: 30px;
          `}
        >
          <nav
            css={css`
              display: flex;
              flex-direction: column;
              > * {
                margin: 0.5em 0;
              }
            `}
          >
            {profiles.map((profile) => (
              <Link to={profile.url}>
                <FeatherIcon
                  title={profile.network}
                  name={SOCIAL_ICON_NAMES[profile.network]}
                />
              </Link>
            ))}
          </nav>
        </aside>
        <Layout.Footer />
      </Layout>
    </>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node,
};

export default MainLayout;
