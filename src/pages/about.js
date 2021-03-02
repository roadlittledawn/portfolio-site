import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/react";
import { graphql } from "gatsby";
import Layout from "../layouts/MainLayout";

const AboutPage = () => {
  return (
    <>
      <h1>About</h1>
      <Layout.Content>Content here</Layout.Content>
    </>
  );
};

export const pageQuery = graphql`
  query {
    allBasics {
      nodes {
        summary
        profiles {
          network
          url
          username
        }
      }
    }
    allSkills {
      nodes {
        name
        level
        rating
        yearsOfExperience
      }
    }
  }
`;

export default AboutPage;
