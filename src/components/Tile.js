import PropTypes from "prop-types";
import React from "react";
import { css, keyframes } from "@emotion/react";
import { rgba } from "polished";
import Icon from "./Icons";

const pulse = keyframes`
0% {
  box-shadow: 0 0 0 0 ${rgba("#008c99", 0.7)};
}

70% {
  box-shadow: 0 0 0 10px ${rgba("#008c99", 0)};
}

100% {
  box-shadow: 0 0 0 0 ${rgba("#008c99", 0)};
}
`;

const Tile = ({ children, icon, className }) => {
  return (
    <div
      className={className}
      css={css`
        padding: 1.5rem;
        margin: 1em;
        color: currentColor;
        position: relative;
        min-height: 100px;
        border: 1px solid var(--color-neutrals-600);
        background: var(--primary-background-color);
        border-radius: 0.25rem;
        box-shadow: var(--shadow-3);

        :hover {
          transform: translateY(-2px);
        }

        @media screen and (max-width: 1050px) {
          min-height: 175px;

          &:not(:last-child) {
            margin-bottom: 2rem;
          }
        }

        @media screen and (max-width: 760px) {
          && {
            margin-bottom: 0;
          }
        }

        @media screen and (max-width: 650px) {
          &:not(:last-child) {
            margin-bottom: 2rem;
          }
        }
        ${tileStyles}
        ${icon && iconStyles}
      `}
    >
      {icon && (
        <div
          css={css`
            height: 32px;
            width: 32px;
            z-index: 10;
            position: absolute;
            border-radius: 50%;
            top: 0;
            left: 50%;
            transform: translate(-50%, -50%);
          `}
        >
          <Icon name={icon} size="32px" viewbox="0 0 24 24" strokeWidth={1} />
        </div>
      )}
      <div
        css={css`
          > :first-child {
            margin-top: ${icon ? "1em" : "0"};
          }
        `}
      >
        {children}
      </div>
    </div>
  );
};

const iconStyles = css`
  &::before {
    content: "";
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    height: 4rem;
    width: 4rem;
    border: 1px solid var(--color-neutrals-600);
    background-color: var(--primary-background-color);
    z-index: 1;
    .light-mode & {
      background-color: #ffffff;
    }
    .dark-mode & {
      background-color: #232728;
    }
  }
  &:hover {
    color: currentColor;

    &::before {
      animation: ${pulse} 1.5s infinite;
      border-color: var(--color-teal-300);
    }
  }
`;

const tileStyles = css`
  --tile-border-color: var(--color-teal-400);
  --number-background-color: var(--color-teal-400);
  --number-color: white;
  --outer-ring-border-color: var(--border-color);

  &:hover {
    border-color: var(--color-teal-300);

    .dark-mode & {
      border-color: var(--color-teal-500);
    }
  }

  .dark-mode & {
    --tile-border-color: var(--color-teal-600);
    --number-background-color: var(--color-teal-600);
  }
`;

Tile.defaultProps = {
  icon: null,
};

Tile.propTypes = {
  children: PropTypes.array,
  icon: PropTypes.string,
  title: PropTypes.string,
};

export default Tile;
