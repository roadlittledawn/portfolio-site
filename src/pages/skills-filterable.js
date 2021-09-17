import PropTypes from "prop-types";
import { graphql } from "gatsby";
import React, { useState } from "react";
import { css } from "@emotion/react";
import MainLayout from "../layouts/MainLayout";
import Tile from "../components/Tile";
import ProgressBar from "../components/ProgressBar";
import Icon from "../components/Icons";
import { SKILL_CATEGORY, siteOptions } from "../utils/constants";
import PageTitle from "../components/PageTitle";
import SEO from "../components/SEO";

const SkillsPageFilterable = ({ data }) => {
  const [skills, setSkills] = useState(data.allSkills.nodes);
  return (
    <>
      <SEO title="Skills" />
      <MainLayout>
        <PageTitle>Skills</PageTitle>
        <div
          css={css`
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            grid-gap: 1rem;
          `}
        >
          {skills.map((skill) => (
            <Tile
              key={skill.name}
              css={css`
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                margin: 0;
                padding: 0.5em;
              `}
            >
              <div
                css={css`
                  margin-bottom: 0.5em;
                `}
              >
                <Icon name={skill.name} viewbox="0 0 128 128" size="2em" />
              </div>
              <div>{skill.name}</div>
            </Tile>
          ))}
        </div>
      </MainLayout>
    </>
  );
};

SkillsPageFilterable.propTypes = {
  data: PropTypes.object.isRequired,
};

export const pageQuery = graphql`
  query {
    allSkills {
      nodes {
        yearsOfExperience
        rating
        name
        level
      }
    }
  }
`;

export default SkillsPageFilterable;
