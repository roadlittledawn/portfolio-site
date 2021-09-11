import React from "react";
import PropTypes from "prop-types";

import { css } from "@emotion/react";
import { Link } from "gatsby";
import FeatherIcon from "../Icons/FeatherIcon";
import { siteOptions, SOCIAL_ICON_NAMES } from "../../utils/constants";

const currentYear = new Date().getFullYear();

const Footer = ({ profiles, className }) => {
  const { layout } = siteOptions;
  return (
    <footer
      className={className}
      css={css`
        color: var(--secondary-text-color);
        z-index: 1;
        position: relative;
        width: 100%;
        bottom: 0;
        color: var(--color-neutrals-600);
        @media screen and (max-width: ${layout.mobileBreakpoint}) {
          position: relative;
        }

        a {
          color: currentColor;
        }
      `}
    >
      <ul
        css={css`
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          list-style-type: none;
        `}
      >
        {profiles.map((profile) => (
          <li
            key={`li-${profile.network}`}
            css={css`
              width: 2em;
              margin: 0 1em;
            `}
          >
            <Link to={profile.url} key={`link-${profile.network}`}>
              <FeatherIcon
                key={`icon-${profile.network}`}
                title={profile.network}
                name={SOCIAL_ICON_NAMES[profile.network]}
                strokeColor={"var(--color-neutrals-600)"}
              />
            </Link>
          </li>
        ))}
      </ul>
      <div
        css={css`
          font-size: 1em;
          display: flex;
          padding: 1rem var(--site-content-padding);
          max-width: var(--site-max-width);
          margin: 0 auto;
          justify-content: center;
          @media screen and (max-width: ${layout.mobileBreakpoint}) {
            justify-content: center;
          }
        `}
      >
        <div>
          Made with Clinton Langosch&apos;s blood, sweat, and tears{" "}
          <span aria-label="upside down smile emoji" role="img">
            🙃
          </span>
          <span> | © {currentYear}</span>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  profiles: PropTypes.array,
  className: PropTypes.string,
};

export default Footer;
