import PropTypes from "prop-types";
import { graphql } from "gatsby";
import React from "react";
import { css } from "@emotion/react";
import MainLayout from "../layouts/MainLayout";
import Tile from "../components/Tile";
import ProgressBar from "../components/ProgressBar";
import Icon from "../components/Icons";
import { SKILL_CATEGORY, siteOptions } from "../utils/constants";

const SkillsPage = ({ data }) => {
  const { nodes: skills } = data.allSkills;
  return (
    <MainLayout>
      <h1>Skills</h1>

      <div
        css={css`
          display: flex;
          > * {
            width: 50%;
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
        <Tile
          icon="window"
          css={css`
            margin: 1em;
          `}
        >
          <h2
            css={css`
              text-align: center;
            `}
          >
            Frontend
          </h2>
          {skills
            .filter((skill) => SKILL_CATEGORY[skill.name] === "frontend")
            .sort((a, b) => b.rating - a.rating)
            .map((skill) => renderSkill(skill.name, skill.rating))}
        </Tile>
        <Tile
          icon="terminal"
          css={css`
            margin: 1em;
          `}
        >
          <h2
            css={css`
              text-align: center;
            `}
          >
            Backend
          </h2>
          {skills
            .filter((skill) => SKILL_CATEGORY[skill.name] === "backend")
            .sort((a, b) => b.rating - a.rating)
            .map((skill) => renderSkill(skill.name, skill.rating))}
        </Tile>
      </div>
    </MainLayout>
  );
};

SkillsPage.propTypes = {
  data: PropTypes.object.isRequired,
};

const renderSkill = (skillName, skillRating) => (
  <div
    key={skillName}
    css={css`
      margin-bottom: 2em;
      display: flex;
      justify-content: space-between;
    `}
  >
    <div
      css={css`
        text-align: center;
        width: 5rem;
      `}
    >
      <div>
        <Icon name={skillName} viewbox="0 0 128 128" size="2em" />
      </div>
      <div
        css={css`
          margin: 0;
          font-size: 0.8em;
        `}
      >
        {skillName}
      </div>
    </div>
    <div
      css={css`
        width: 70%;
      `}
    >
      <ProgressBar currentLevel={skillRating} />
    </div>
  </div>
);

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

export default SkillsPage;
