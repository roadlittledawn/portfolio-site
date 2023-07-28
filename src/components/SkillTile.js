import PropTypes from "prop-types";
import React from "react";
import { css } from "@emotion/react";
import Icon from "./Icons";
import { SKILL_RATINGS } from "../utils/constants";

const SKILL_RATINGS_BAR_COLOR = {
  1: { light: `var(--color-red-200)`, dark: `var(--color-red-600)` },
  2: { light: `var(--color-red-200)`, dark: `var(--color-red-600)` },
  3: { light: `var(--color-yellow-200)`, dark: `var(--color-yellow-600)` },
  4: { light: `var(--color-green-200)`, dark: `var(--color-green-600)` },
  5: { light: `var(--color-green-200)`, dark: `var(--color-green-600)` },
};

const SkillTile = ({ name, rating, iconName }) => {
  return (
    <div
      css={css`
        position: relative;
        display: flex;
        align-items: center;
        /* justify-content: center; */
        border: 1px solid var(--color-neutrals-600);
        border-radius: 0.25rem;
        min-height: 66px;
        padding: 0.25em;
        &:after {
          content: "";
          height: 3px;
          width: ${(rating / SKILL_RATINGS.MAX) * 100}%;
          background-color: ${SKILL_RATINGS_BAR_COLOR[rating].dark};
          position: absolute;
          bottom: 0;
          left: 0;

          .light-mode & {
            background-color: ${SKILL_RATINGS_BAR_COLOR[rating].light};
          }
        }
        &:hover {
          border-color: var(--color-teal-300);

          .dark-mode & {
            border-color: var(--color-teal-500);
          }
        }
      `}
    >
      <div
        css={css`
          margin-right: 0.25em;
        `}
      >
        <Icon name={iconName} viewbox="0 0 128 128" size="2em" />
      </div>
      <div
        css={css`
          font-size: 0.75em;
          width: 100%;
          text-align: center;
        `}
      >
        {name}
      </div>
    </div>
  );
};

SkillTile.defaultProps = {
  icon: null,
};

SkillTile.propTypes = {
  name: PropTypes.string,
  rating: PropTypes.number,
  iconName: PropTypes.string,
};

export default SkillTile;
