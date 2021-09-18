import PropTypes from "prop-types";
import { graphql } from "gatsby";
import React, { useEffect, useState } from "react";
import { css } from "@emotion/react";
import MainLayout from "../layouts/MainLayout";
import Tile from "../components/Tile";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import Icon from "../components/Icons";
import { SKILL_CATEGORY, SKILL_RATINGS, siteOptions } from "../utils/constants";
import PageTitle from "../components/PageTitle";
import SEO from "../components/SEO";

import { navigate } from "@reach/router";

const SKILL_RATINGS_BAR_COLOR = {
  1: { light: `var(--color-red-200)`, dark: `var(--color-red-600)` },
  2: { light: `var(--color-red-200)`, dark: `var(--color-red-600)` },
  3: { light: `var(--color-yellow-200)`, dark: `var(--color-yellow-600)` },
  4: { light: `var(--color-yellow-200)`, dark: `var(--color-yellow-600)` },
  5: { light: `var(--color-green-200)`, dark: `var(--color-green-600)` },
};

const SkillsPageFilterable = ({ data }) => {
  const allSkills = data.allSkills.nodes;
  const params = new URLSearchParams(location.search);
  const minSkillLevel = params.get("minSkillLevel");
  const [skills, setSkills] = useState(allSkills);
  const [formState, setFormState] = useState({
    minRating: minSkillLevel || 1,
  });

  const handleRatingFilter = (minRating) => {
    let skillsFiltered = allSkills.filter((skill) => minRating <= skill.rating);

    setSkills(skillsFiltered);
    setFormState((prevState) => ({ ...prevState, minRating }));
  };

  return (
    <>
      <SEO title="Skills" />
      <MainLayout>
        <PageTitle>Skills</PageTitle>
        {/* <div>
          <select onChange={(e) => handleRatingFilter(e)}>
            <option value={1}>All the things</option>
            <option value={4}>Stuff I&apos;m pretty good at</option>
          </select>
        </div> */}
        <div
          css={css`
            display: flex;
            margin: 2em 0;
            > *:not(:first-child) {
              margin-left: 1em;
            }
          `}
        >
          <Button
            onClick={() => handleRatingFilter(1)}
            css={css`
              background-color: ${formState.minRating === 1
                ? "var(--color-teal-500)"
                : "transparent"};
              color: ${formState.minRating === 1
                ? "var(--color-white)"
                : "var(--color-teal-500)"};
            `}
          >
            All the things!
          </Button>
          <Button
            onClick={() => handleRatingFilter(4)}
            css={css`
              background-color: ${formState.minRating === 4
                ? "var(--color-teal-500)"
                : "transparent"};
              color: ${formState.minRating === 4
                ? "var(--color-white)"
                : "var(--color-teal-500)"};
            `}
          >
            In my wheelhouse
          </Button>
        </div>
        <div
          css={css`
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            grid-gap: 1rem;
          `}
        >
          {skills &&
            skills
              .sort((a, b) => b.rating - a.rating)
              .map((skill) => (
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

                    & :after {
                      content: "";
                      height: 3px;
                      width: ${(skill.rating / SKILL_RATINGS.MAX) * 100}%;
                      background-color: ${SKILL_RATINGS_BAR_COLOR[skill.rating]
                        .dark};
                      position: absolute;
                      bottom: 0;
                      left: 0;

                      .light-mode & {
                        background-color: ${SKILL_RATINGS_BAR_COLOR[
                          skill.rating
                        ].light};
                      }
                    }
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
