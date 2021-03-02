import React from "react";
import PropTypes from "prop-types";
// import Logo from './Logo';

import { graphql, useStaticQuery, Link } from "gatsby";
import { css } from "@emotion/react";

const Footer = ({ className }) => {
  return (
    <footer
      className={className}
      css={css`
        color: var(--secondary-text-color);
        background-color: var(--color-neutrals-050);
        z-index: 1;

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
        <Link to="/">Logo here</Link>
      </div>

      <div
        css={css`
          background-color: rgba(0, 0, 0, 0.05);

          .dark-mode & {
            background-color: rgba(0, 0, 0, 0.2);
          }
        `}
      >
        <div
          css={css`
            font-size: 0.75rem;
            align-items: center;
            justify-content: space-between;
            display: grid;
            grid-template-columns: auto auto;
            grid-template-areas: "copyright legal";
            padding: 0.5rem var(--site-content-padding);
            max-width: var(--site-max-width);
            margin: 0 auto;

            @media screen and (max-width: 760px) {
              justify-content: center;
              text-align: center;
              grid-template-columns: auto;
              grid-gap: 0.5rem;
              grid-template-areas:
                "legal"
                "copyright";
            }
          `}
        >
          Clinton Langosch 2021
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  className: PropTypes.string,
};

export default Footer;
