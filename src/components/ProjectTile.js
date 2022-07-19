import PropTypes from "prop-types";
import React from "react";
import { css } from "@emotion/react";
import FeatherIcon from "../components/Icons";

const ProjectTile = ({
  as: Component,
  project: { name, summary, languages, repositoryUrl },
}) => {
  return (
    <Component
      key={name}
      css={css`
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        position: relative;
        height: 100%;
        padding: 2rem 1.75rem;
        background-color: #2f3233;
        border-radius: 4px;
        box-shadow: 0 10px 30px -15px #131f23;
        &:hover {
          cursor: pointer;
          h3 {
            color: var(--color-teal-400);
          }
        }
      `}
    >
      <div
        css={css`
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        `}
      >
        <div>
          <FeatherIcon
            name="folder"
            size="2.5em"
            title="folder"
            strokeColor={`var(--color-teal-400)`}
            key={`folder-${name}`}
          />
        </div>
      </div>
      <h3>
        <a
          href={repositoryUrl}
          css={css`
            text-decoration: none;
            color: inherit;
          `}
        >
          {name}
        </a>
      </h3>
      <div>{summary}</div>
      {languages && (
        <ul
          css={css`
            list-style: none;
            display: flex;
            flex-wrap: wrap;
            align-items: flex-end;
            flex-grow: 1;
            margin: 20px 0 0;
            padding: 0;
          `}
        >
          {languages.map((language) => (
            <li
              css={css`
                margin-right: 15px;
              `}
              key={`lang-${language}`}
            >
              {language}
            </li>
          ))}
        </ul>
      )}
    </Component>
  );
};

ProjectTile.defaultProps = {
  as: "li",
};

ProjectTile.propTypes = {
  as: PropTypes.string,
  project: PropTypes.object.isRequired,
};

export default ProjectTile;
