import React from "react";
import PropTypes from "prop-types";
import { useStaticQuery, graphql } from "gatsby";

import Layout from "../components/Layout/Layout";
import Header from "../components/Header";

import MobileNav from "../components/MobileNav";

const MainLayout = ({ children }) => {
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
      <Header profiles={profiles} />
      <MobileNav profiles={profiles} />
      <Layout>
        <Layout.Main>{children}</Layout.Main>

        <Layout.Footer profiles={profiles} />
      </Layout>
    </>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node,
};

export default MainLayout;
