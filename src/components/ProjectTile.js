import PropTypes from "prop-types";
import React from "react";
import { css } from "@emotion/react";

const ProjectTile = ({ as: Component, name, summary, languages }) => {
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
      `}
    >
      <h3>{name}</h3>
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
  name: PropTypes.string.isRequired,
  summary: PropTypes.string.isRequired,
  languages: PropTypes.array.isRequired,
};

export default ProjectTile;
