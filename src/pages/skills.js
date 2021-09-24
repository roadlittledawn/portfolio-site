import PropTypes from "prop-types";
import { graphql } from "gatsby";
import React, { useEffect, useState } from "react";
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

const filterByRating = (minSkillLevel) => (skill) => {
  return minSkillLevel <= skill.rating;
};

const filterByCategory = (category) => (skill) => {
  if (!category || category === "all") {
    return true;
  }
  return SKILL_CATEGORY[skill.name] === category;
};

const SkillsPageFilterable = ({ data }) => {
  const allSkills = data.allSkills.nodes;
  const [skills, setSkills] = useState(allSkills);

  const [formState, setFormState] = useState({
    minSkillLevel: 1,
    category: "",
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const minSkillLevel = queryParams.get("minSkillLevel");
    const category = queryParams.get("category");
    setFormState(() => ({
      minSkillLevel: minSkillLevel || 1,
      category: category || "",
    }));
  }, []);

  useEffect(() => {
    const { minSkillLevel, category } = formState;
    let filteredSkills = allSkills
      .filter(filterByRating(minSkillLevel))
      .filter(filterByCategory(category));

    setSkills(filteredSkills);
    setParams(formState);
  }, [formState, allSkills]);

  const setParams = (paramsToSet) => {
    const url = new URL(window.location);
    Object.entries(paramsToSet).forEach(([key, value]) => {
      value ? url.searchParams.set(key, value) : url.searchParams.delete(key);
    });
    window.history.replaceState({}, "", url);
  };

  return (
    <>
      <SEO title="Skills" />
      <MainLayout>
        <PageTitle>Skills</PageTitle>
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
              value={formState.minSkillLevel}
              onChange={(e) =>
                setFormState((state) => ({
                  ...state,
                  minSkillLevel: e.target.value,
                }))
              }
            >
              <option value={1}>All the things</option>
              <option value={4}>Stuff I&apos;m pretty good at</option>
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
              onChange={(e) => {
                setFormState((state) => ({
                  ...state,
                  category: e.target.value,
                }));
              }}
            >
              <option value={"all"}>All the things</option>
              <option value={"frontend"}>Front end</option>
              <option value={"backend"}>Back end</option>
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
