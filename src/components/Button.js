import PropTypes from "prop-types";
import { graphql } from "gatsby";
import React from "react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";

const Button = ({ children, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={className}
      css={css`
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        font-weight: 600;
        border-radius: 3px;
        background-color: transparent;
        color: var(--color-teal-500);
        border: 1px solid var(--color-teal-500);
        border-radius: 3;
        white-space: nowrap;
        text-decoration: none;
        transition: all 0.2s ease-out;

        :hover {
          background-color: var(--color-teal-500);
          color: var(--color-white);
        }
      `}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.object,
  size: PropTypes.object,
  onClick: PropTypes.func,
};

export default Button;
