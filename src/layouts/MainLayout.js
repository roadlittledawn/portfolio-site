import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Layout from "../components/Layout";
import Header from "../components/Header";
import SEO from "../components/SEO";
// import { Logo, MobileHeader } from "@newrelic/gatsby-theme-newrelic";
import { graphql, Link } from "gatsby";
import { css } from "@emotion/react";

const MainLayout = ({ data = {}, children, pageContext }) => {
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <>
      <SEO location={location} />
      <Header />
      <MobileHeader>
        {nav?.id === rootNav.id ? (
          <RootNavigation nav={nav} />
        ) : (
          <SubNavigation nav={nav} />
        )}
      </MobileHeader>
      <Layout>
        <Layout.Sidebar>
          <Link
            to="/"
            css={css`
              display: block;
              margin-bottom: 1rem;
              text-decoration: none;
            `}
          >
            <Logo />
          </Link>
        </Layout.Sidebar>
        <Layout.Main
          css={css`
            display: ${isMobileNavOpen ? "none" : "block"};
          `}
        >
          {children}
        </Layout.Main>
        <Layout.Footer />
      </Layout>
    </>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node,
};

export default MainLayout;
