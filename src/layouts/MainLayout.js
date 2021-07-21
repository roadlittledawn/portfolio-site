import React, { useState } from "react";
import PropTypes from "prop-types";
import Layout from "../components/Layout/Layout";
import Header from "../components/Header";
import SEO from "../components/SEO";
import MobileHeader from "../components/MobileHeader";
import FeatherIcon from "../components/Icons";
import { graphql, useStaticQuery, Link } from "gatsby";
import { css } from "@emotion/react";
import { SOCIAL_ICON_NAMES, siteOptions } from "../utils/constants";

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

  // useEffect(() => {
  //   setIsMobileNavOpen(false);
  // }, [location.pathname]);

  return (
    <>
      <SEO />
      <Header />
      {/* <MobileHeader>Mobile nav</MobileHeader> */}
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
        <aside
          css={css`
            position: fixed;
            bottom: 0;
            right: 1em;
            width: 30px;
            @media screen and (max-width: ${layout.mobileBreakpoint}) {
              position: relative;
              width: 100%;
            }
          `}
        >
          <nav
            css={css`
              display: flex;
              flex-direction: column;
              @media screen and (max-width: ${layout.mobileBreakpoint}) {
                flex-direction: row;
                justify-content: space-evenly;
                /* width: 300px; */
              }
              > * {
                margin: 0.5em 0;
              }
            `}
          >
            {profiles.map((profile) => (
              <Link
                to={profile.url}
                key={`link-${profile.network}`}
                css={css`
                  margin: 0.5em 0;
                  @media screen and (max-width: ${layout.mobileBreakpoint}) {
                    margin: 0 1em;
                    width: 2em;
                  }
                `}
              >
                <FeatherIcon
                  key={`icon-${profile.network}`}
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
