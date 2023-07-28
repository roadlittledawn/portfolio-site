import PropTypes from "prop-types";
import { graphql } from "gatsby";
import React, { useEffect, useState } from "react";
import { navigate } from "@reach/router";
import { css } from "@emotion/react";
import MainLayout from "../layouts/MainLayout";
import SkillTile from "../components/SkillTile";
import { siteOptions } from "../utils/constants";
import PageTitle from "../components/PageTitle";
import SEO from "../components/SEO";

const filterByRating = (minSkillLevel, maxSkillLevel) => (skill) => {
  return minSkillLevel <= skill.rating && maxSkillLevel >= skill.rating;
};

const filterByCategory = (category) => (skill) => {
  if (!category || category === "all") {
    return true;
  }
  return skill.tags.includes(category);
};

const SkillsPageFilterable = ({ data, location }) => {
  const allSkills = data.allSkills.nodes;

  const [formState, setFormState] = useState({
    minSkillLevel: 1,
    maxSkillLevel: 5,
    category: "all",
    sortBy: "rating",
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const minSkillLevel = queryParams.get("minSkillLevel");
    const maxSkillLevel = queryParams.get("maxSkillLevel");
    const category = queryParams.get("category");
    const sortBy = queryParams.get("sortBy");
    setFormState(() => ({
      minSkillLevel: minSkillLevel || 1,
      maxSkillLevel: maxSkillLevel || 5,
      category: category || "all",
      sortBy: sortBy || "rating",
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
    if (valueType === "sortBy") {
      params.set("sortBy", e.target.value);
    }
    navigate(`?${params.toString()}`);
  };

  const filteredSkills = allSkills
    .filter(filterByRating(formState.minSkillLevel, formState.maxSkillLevel))
    .filter(filterByCategory(formState.category))
    .sort((a, b) => {
      if (typeof a[formState.sortBy] === "string") {
        return (
          b[formState.sortBy].toLowerCase() < a[formState.sortBy].toLowerCase()
        );
      }
      if (typeof a[formState.sortBy] === "number") {
        return b[formState.sortBy] - a[formState.sortBy];
      }
    });

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
              <option value="4,5">Fluent</option>
              <option value="3,3">Intermediate</option>
              <option value="1,2">Beginner</option>
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
              <option value="database">Databases</option>
              <option value="tools">Tools</option>
              <option value="concepts">Concepts</option>
              <option value="management">Management</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="sortBy-input"
              css={css`
                font-weight: bold;
              `}
            >
              Sort By
            </label>
            <select
              id="sortBy-input"
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
              value={formState.sortBy || "rating"}
              onChange={(e) => handleFilterChange(e, "sortBy")}
            >
              <option value="rating">Rating</option>
              <option value="name">Skill Name</option>
            </select>
          </div>
        </div>
        <div
          css={css`
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
            grid-gap: 1rem;
          `}
        >
          {filteredSkills &&
            filteredSkills.map((skill) => (
              <SkillTile
                key={skill.name}
                name={skill.name}
                iconName={skill.iconName || skill.name}
                rating={skill.rating}
                tags={skill.tags}
              />
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
        tags
        iconName
      }
    }
  }
`;

export default SkillsPageFilterable;
