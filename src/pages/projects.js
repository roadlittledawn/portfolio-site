import React from "react";
import { css } from "@emotion/react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import SEO from "../components/SEO";
import MainLayout from "../layouts/MainLayout";
import ProjectTile from "../components/ProjectTile";
import PageTitle from "../components/PageTitle";

const ProjectsPage = ({ data }) => {
  const {
    allProjects: { nodes: projects },
  } = data;
  return (
    <>
      <SEO title="Projects" />
      <MainLayout>
        <PageTitle>Projects</PageTitle>
        <section>
          <ul
            css={css`
              list-style: none;
              padding: 0px;
              margin: 50px 0px 0px;
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
              gap: 15px;
              position: relative;
            `}
          >
            {projects.map((project) => (
              <ProjectTile project={project} key={project.name} />
            ))}
          </ul>
        </section>
      </MainLayout>
    </>
  );
};

ProjectsPage.propTypes = {
  data: PropTypes.object,
};

export const pageQuery = graphql`
  query {
    allProjects {
      nodes {
        summary
        url
        repositoryUrl
        website
        primaryLanguage
        languages
        libraries
        tags
        name
      }
    }
  }
`;

export default ProjectsPage;
