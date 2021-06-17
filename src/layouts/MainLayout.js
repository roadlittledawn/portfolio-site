import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Layout from "../components/Layout/Layout";
import Header from "../components/Header";
import SEO from "../components/SEO";
import MobileHeader from "../components/MobileHeader";
// import { Logo, MobileHeader } from "@newrelic/gatsby-theme-newrelic";
import { graphql, Link } from "gatsby";
import { css } from "@emotion/react";

const MainLayout = ({ data = {}, children, pageContext }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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
        <Layout.Footer />
      </Layout>
    </>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node,
};

export default MainLayout;
