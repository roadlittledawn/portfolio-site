import PropTypes from "prop-types";
import React from "react";
import { Link } from "gatsby";
import { css } from "@emotion/react";

import FeatherIcon from "./Icons/FeatherIcon";
import { SOCIAL_ICON_NAMES } from "../utils/constants";
import DarkModeToggle from "./DarkModeToggle";

const MobileNavMenu = ({ profiles }) => {
  return (
    <nav
      css={css`
        display: flex;
        flex-direction: column;
        justify-content: center;
        background-color: var(--color-teal-100);
        height: 100vh;
        text-align: left;
        padding: 2rem;

        @media (max-width: 576px) {
          width: 100%;
        }

        a {
          font-size: 2rem;
          text-transform: uppercase;
          text-align: center;
          padding: 2rem 0;
          font-weight: bold;
          letter-spacing: 0.5rem;
          color: var(--color-dark-100);
          text-decoration: none;
          transition: color 0.3s linear;

          @media (max-width: 576px) {
            font-size: 1.5rem;
            text-align: center;
          }
        }
      `}
    >
      <div
        css={css`
          text-align: center;
        `}
      >
        <DarkModeToggle
          size="2rem"
          css={css`
            color: var(--color-dark-100);
          `}
        />
      </div>
      <Link to="/experience">Experience</Link>
      <Link to="/projects">Projects</Link>
      <Link to="/skills">Skills</Link>
      <Link href="/resume">Resume</Link>

      <div>
        <ul
          css={css`
            margin: 2em 0 0 0;
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
                <a href={profile.url} key={`link-${profile.network}`}>
                  <FeatherIcon
                    key={`icon-${profile.network}`}
                    title={profile.network}
                    name={SOCIAL_ICON_NAMES[profile.network]}
                  />
                </a>
              </li>
            ))}
        </ul>
      </div>
    </nav>
  );
};

MobileNavMenu.propTypes = {
  profiles: PropTypes.arrayOf(PropTypes.object),
};

export default MobileNavMenu;
