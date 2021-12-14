import PropTypes from "prop-types";
import { graphql } from "gatsby";
import React, { useEffect, useState } from "react";
import { navigate } from "@reach/router";
import { css } from "@emotion/react";
import MainLayout from "../layouts/MainLayout";
import Tile from "../components/Tile";
import Icon from "../components/Icons";
import { SKILL_CATEGORY, SKILL_RATINGS, siteOptions } from "../utils/constants";
import PageTitle from "../components/PageTitle";
import SEO from "../components/SEO";

const SKILL_RATINGS_BAR_COLOR = {
  1: { light: `var(--color-red-200)`, dark: `var(--color-red-600)` },
  2: { light: `var(--color-red-200)`, dark: `var(--color-red-600)` },
  3: { light: `var(--color-yellow-200)`, dark: `var(--color-yellow-600)` },
  4: { light: `var(--color-yellow-200)`, dark: `var(--color-yellow-600)` },
  5: { light: `var(--color-green-200)`, dark: `var(--color-green-600)` },
};

const filterByRating = (minSkillLevel, maxSkillLevel) => (skill) => {
  return minSkillLevel <= skill.rating && maxSkillLevel >= skill.rating;
};

const filterByCategory = (category) => (skill) => {
  if (!category || category === "all") {
    return true;
  }
  return SKILL_CATEGORY[skill.name] === category;
};

const SkillsPageFilterable = ({ data, location }) => {
  const allSkills = data.allSkills.nodes;

  const [formState, setFormState] = useState({
    minSkillLevel: 1,
    maxSkillLevel: 5,
    category: "all",
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const minSkillLevel = queryParams.get("minSkillLevel");
    const maxSkillLevel = queryParams.get("maxSkillLevel");
    const category = queryParams.get("category");
    setFormState(() => ({
      minSkillLevel: minSkillLevel || 1,
      maxSkillLevel: maxSkillLevel || 5,
      category: category || "all",
    }));
  }, [location.search]);

  const handleFilterChange = (e, valueType) => {
    const params = new URLSearchParams(location.search);
    if (valueType === "range") {
      params.set("minSkillLevel", e.target.value.split(",")[0]);
      params.set("maxSkillLevel", e.target.value.split(",")[1]);
    }
    if (valueType === "category") {
      params.set("category", e.target.value);
    }
    navigate(`?${params.toString()}`);
  };

  const filteredSkills = allSkills
    .filter(filterByRating(formState.minSkillLevel, formState.maxSkillLevel))
    .filter(filterByCategory(formState.category));

  return (
    <>
      <SEO title="Skills" />
      <MainLayout>
        <PageTitle>What I use</PageTitle>
        <div
          css={css`
            display: flex;
            flex-direction: row;
            margin: 2em 0;

            > * {
              margin: 1em 0;
            }

            > :not(:first-child) {
              margin-left: 2em;
            }
            @media screen and (max-width: ${siteOptions.layout
                .mobileBreakpoint}) {
              flex-direction: column;

              > :not(:first-child) {
                margin-left: 0;
              }
            }
          `}
        >
          <div css={css``}>
            <label
              htmlFor="ratingFilter"
              css={css`
                font-weight: bold;
              `}
            >
              Skill level
            </label>
            <select
              id="ratingFilter"
              css={css`
                background-color: transparent;
                margin: 0.25em 0;
                width: 100%;
                cursor: pointer;
                border-radius: 0.25rem;
                border: 1px solid var(--color-neutrals-500);
                padding: 0.5em;

                .dark-mode & {
                  color: var(--color-dark-700);
                  background-color: var(--color-dark-300);
                  border: var(--color-dark-300);
                }
              `}
              value={`${formState.minSkillLevel},${formState.maxSkillLevel}`}
              onChange={(e) => handleFilterChange(e, "range")}
            >
              <option value="1,5">All the things</option>
              <option value="4,5">Stuff I&apos;m pretty good at</option>
              <option value="1,2">Stuff I&apos;m still learning</option>
            </select>
          </div>
          <div css={css``}>
            <label
              htmlFor="categoryFilter"
              css={css`
                font-weight: bold;
              `}
            >
              Category
            </label>
            <select
              id="categoryFilter"
              css={css`
                background-color: transparent;
                margin: 0.25em 0;
                width: 100%;
                cursor: pointer;
                border-radius: 0.25rem;
                border: 1px solid var(--color-neutrals-500);
                padding: 0.5em;

                .dark-mode & {
                  color: var(--color-dark-700);
                  background-color: var(--color-dark-300);
                  border: var(--color-dark-300);
                }
              `}
              value={formState.category || "all"}
              onChange={(e) => handleFilterChange(e, "category")}
            >
              <option value="all">All the things</option>
              <option value="frontend">Front end</option>
              <option value="backend">Back end</option>
            </select>
          </div>
        </div>
        <div
          css={css`
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            grid-gap: 1rem;
          `}
        >
          {filteredSkills &&
            filteredSkills
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
                    max-height: 125px;
                    margin: 0;
                    padding: 3em;

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
                    <Icon
                      name={skill.name}
                      viewbox="0 0 128 128"
                      size="2.5em"
                    />
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
  location: PropTypes.object.isRequired,
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
