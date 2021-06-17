import * as React from "react";
import MainLayout from "../layouts/MainLayout";

const IndexPage = () => {
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

export default IndexPage;
