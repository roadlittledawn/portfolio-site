import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/react";
import { graphql } from "gatsby";
import MainLayout from "../layouts/MainLayout";

const AboutPage = () => {
  return (
    <>
      <MainLayout>
        <h1>About</h1>
        Content here
      </MainLayout>
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
