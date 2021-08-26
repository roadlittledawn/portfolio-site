import React from "react";
import { css } from "@emotion/react";
import PropTypes from "prop-types";
import { graphql, Link } from "gatsby";
import MainLayout from "../layouts/MainLayout";
import Tile from "../components/Tile";

import { siteOptions } from "../utils/constants";

const ProjectsPage = ({ data }) => {
  const {
    allProjects: { nodes: projects },
  } = data;
  return (
    <>
      <MainLayout>
        <h1>Projects</h1>
        <div
          css={css`
            display: flex;
            flex-wrap: wrap;
            > * {
              width: 25%;
              min-width: 300px;
            }
            @media screen and (max-width: ${siteOptions.layout
                .mobileBreakpoint}) {
              flex-wrap: wrap;
              > * {
                width: 100%;
              }
            }
          `}
        >
          {projects.map((project) => (
            <>
              <Link
                to={project.repositoryUrl}
                css={css`
                  text-decoration: none;
                `}
              >
                <Tile key={project.name}>
                  <h2>{project.name}</h2>
                  <p>{project.summary}</p>
                  <div
                    css={css`
                      display: flex;
                      flex-wrap: wrap;
                    `}
                  >
                    {project.languages.map((language) => (
                      <span
                        key={`${project.name}-${language}`}
                        css={css`
                          font-size: 0.75em;
                          background-color: var(--color-neutrals-300);
                          padding: 0.25em 0.75em;
                          margin: 0.25em;
                        `}
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </Tile>
              </Link>
            </>
          ))}
        </div>
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
        languages
        name
      }
    }
  }
`;

export default ProjectsPage;
