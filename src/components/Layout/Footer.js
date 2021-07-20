import React from "react";
import PropTypes from "prop-types";
// import Logo from './Logo';

import { graphql, useStaticQuery, Link } from "gatsby";
import { css } from "@emotion/react";
import FeatherSVG from "../FeatherSVG";

const currentYear = new Date().getFullYear();

const Footer = ({ className }) => {
  return (
    <footer
      className={className}
      css={css`
        color: var(--secondary-text-color);
        z-index: 1;
        position: absolute;
        bottom: 0;

        .dark-mode & {
          background-color: var(--color-dark-050);
        }

        a {
          color: currentColor;
        }
      `}
    >
      <div
        css={css`
          font-size: 0.75rem;
          align-items: center;
          justify-content: space-between;
          display: flex;
          padding: 1rem var(--site-content-padding);
          max-width: var(--site-max-width);
          margin: 0 auto;

          @media screen and (max-width: 550px) {
            flex-direction: column;
            justify-content: center;
          }
        `}
      >
        <div
          css={css`
            align-self: flex-start;
          `}
        >
          Clinton Langosch {currentYear}
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  className: PropTypes.string,
};

export default Footer;
