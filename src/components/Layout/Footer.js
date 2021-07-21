import React from "react";
import PropTypes from "prop-types";

import { css } from "@emotion/react";
import { siteOptions } from "../../utils/constants";

const currentYear = new Date().getFullYear();

const Footer = ({ className }) => {
  const { layout } = siteOptions;
  return (
    <footer
      className={className}
      css={css`
        color: var(--secondary-text-color);
        z-index: 1;
        position: absolute;
        width: 100%;
        bottom: 0;
        @media screen and (max-width: ${layout.mobileBreakpoint}) {
          position: relative;
        }

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
          font-size: 1rem;
          display: flex;
          padding: 1rem var(--site-content-padding);
          max-width: var(--site-max-width);
          margin: 0 auto;
          justify-content: flex-start;
          @media screen and (max-width: ${layout.mobileBreakpoint}) {
            justify-content: center;
          }
        `}
      >
        <div>Clinton Langosch {currentYear}</div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  className: PropTypes.string,
};

export default Footer;
