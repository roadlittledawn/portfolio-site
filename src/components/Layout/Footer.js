import React from "react";
import PropTypes from "prop-types";

import { css } from "@emotion/react";
import FeatherIcon from "../Icons/FeatherIcon";
import { SOCIAL_ICON_NAMES } from "../../utils/constants";

const currentYear = new Date().getFullYear();

const Footer = ({ profiles, className }) => {
  return (
    <footer
      className={className}
      css={css`
        color: var(--secondary-text-color);
        z-index: 1;
        margin: auto 1em 0 1em;
        color: var(--color-neutrals-600);

        a {
          color: currentColor;
        }
        > *:not(:first-child) {
          margin-top: 1em;
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
        {profiles
          .filter((profile) => profile.network !== "gitconnected")
          .map((profile) => (
            <li
              key={`li-${profile.network}`}
              css={css`
                width: 2em;
                margin: 0 1em;
              `}
            >
              <a
                href={profile.url}
                key={`link-${profile.network}`}
                target="_blank"
                rel="noreferrer"
              >
                <FeatherIcon
                  key={`icon-${profile.network}`}
                  title={profile.network}
                  name={SOCIAL_ICON_NAMES[profile.network]}
                  strokeColor={"var(--color-neutrals-600)"}
                />
              </a>
            </li>
          ))}
      </ul>
      <div
        css={css`
          font-size: 1em;
          text-align: center;
          display: flex;
          justify-content: center;
          flex-direction: column;
        `}
      >
        <div>
          Made with
          <span aria-label="upside down smile emoji" role="img">
            {" "}
            🙃
          </span>{" "}
          by Clinton Langosch
        </div>
        <div>© {currentYear}</div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  profiles: PropTypes.array,
  className: PropTypes.string,
};

export default Footer;
