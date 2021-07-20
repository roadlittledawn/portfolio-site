import React from "react";
import PropTypes from "prop-types";
import { graphql, Link } from "gatsby";
import MainLayout from "../layouts/MainLayout";

const ProjectsPage = ({ data }) => {
  const {
    allProjects: { nodes: projects },
  } = data;
  return (
    <>
      <MainLayout>
        <h1>Projects</h1>
        {projects.map((project) => (
          <section>
            <h2>
              <Link to={project.repositoryUrl}>{project.name}</Link>
            </h2>
            <small>{project.primaryLanguage}</small>
            <p>{project.summary}</p>
          </section>
        ))}
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
        primaryLanguage
        name
      }
    }
  }
`;

export default ProjectsPage;
