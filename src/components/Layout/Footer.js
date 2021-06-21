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
        <div
          css={css`
            align-self: flex-end;
            > * {
              margin: 0 0.5rem;
            }
          `}
        >
          <span>
            <Link to={"https://github.com/roadlittledawn"}>
              <FeatherSVG size="24px">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </FeatherSVG>
            </Link>
          </span>
          <span>
            <Link to={"https://github.com/roadlittledawn"}>
              <FeatherSVG size="24px">
                <path
                  xmlns="http://www.w3.org/2000/svg"
                  d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
                />
                <rect
                  xmlns="http://www.w3.org/2000/svg"
                  x="2"
                  y="9"
                  width="4"
                  height="12"
                />
                <circle
                  xmlns="http://www.w3.org/2000/svg"
                  cx="4"
                  cy="4"
                  r="2"
                />
              </FeatherSVG>
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  className: PropTypes.string,
};

export default Footer;
