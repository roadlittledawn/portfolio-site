import PropTypes from "prop-types";
import React from "react";
import { css } from "@emotion/react";
import { SKILL_RATINGS } from "../utils/constants";

const ProgressBar = ({ currentLevel }) => {
  return (
    <ol
      css={css`
        display: flex;
        justify-content: space-between;
        list-style: none;
        padding: 0;
        margin: 0 0 1rem 0;
        li {
          flex: 2;
          position: relative;
          padding: 0 0 14px 0;
          font-size: 0.75em;
          line-height: 1.5;
          color: var(--color-teal-300);
          font-weight: 600;
          white-space: nowrap;
          overflow: visible;
          min-width: 0;
          text-align: center;
          border-bottom: 2px solid var(--color-neutrals-500);
          :first-child,
          :last-child {
            flex: 1;
          }
          :last-child {
            text-align: right;
          }
          :before {
            content: "";
            display: block;
            width: 8px;
            height: 8px;
            background-color: var(--color-neutrals-500);
            border-radius: 50%;
            border: 2px solid var(--color-white);
            position: absolute;
            left: calc(50% - 6px);
            bottom: -7px;
            z-index: 3;
            transition: all 0.2s ease-in-out;
          }
          :not(.is-active):not(.is-complete):before {
            background-color: var(--color-white);
            border-color: var(--color-neutrals-500);
          }
          :first-child:before {
            left: 0;
          }
          :last-child:before {
            right: 0;
            left: auto;
          }
          :not(.is-active) span {
            opacity: 0;
          }
          :last-child span {
            width: 200%;
            display: inline-block;
            position: absolute;
            left: -100%;
          }
        }
        span {
          transition: opacity 0.3s ease-in-out;
        }
        .is-complete:not(:first-child):after,
        .is-active:not(:first-child):after {
          content: "";
          display: block;
          width: 100%;
          position: absolute;
          bottom: -2px;
          left: -50%;
          z-index: 2;
          border-bottom: 2px solid var(--color-teal-300);
        }
        .is-complete:last-child:after,
        .is-active:last-child:after {
          width: 200%;
          left: -100%;
        }
        .is-complete:before {
          background-color: var(--color-teal-300);
        }
        .is-active:before {
          background-color: var(--color-teal-300);
          border-color: var(--color-white);
        }
        li:hover:before,
        .is-hovered:before {
          background-color: var(--color-white);
          border-color: var(--color-teal-300);
        }
        li:hover:before,
        .is-hovered:before {
          transform: scale(1.33);
        }
        li:hover span,
        li.is-hovered span {
          opacity: 1;
        }
        :hover li:not(:hover) span {
          opacity: 0;
        }
      `}
    >
      {createProgressSteps(currentLevel)}
    </ol>
  );
};

ProgressBar.propTypes = {
  currentLevel: PropTypes.number,
};

const createProgressSteps = (currentLevel) => {
  const stepElems = [];
  for (let i = 1; i <= SKILL_RATINGS.MAX; i++) {
    let classString = "";
    if (currentLevel >= i) {
      classString = "is-complete";
    }
    if (i === currentLevel && currentLevel !== SKILL_RATINGS.MAX) {
      classString = "is-active";
    }
    if (currentLevel === SKILL_RATINGS.MAX) {
      classString = "is-complete";
    }

    stepElems.push(
      <li className={classString}>
        <span>{SKILL_RATINGS.LEVEL.TEXT[i]}</span>
      </li>
    );
  }
  return stepElems;
};

export default ProgressBar;
