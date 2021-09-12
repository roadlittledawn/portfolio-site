import PropTypes from "prop-types";
import React from "react";
import { Link } from "gatsby";
import { css } from "@emotion/react";

import FeatherIcon from "./Icons/FeatherIcon";
import { SOCIAL_ICON_NAMES } from "../utils/constants";

const MobileNavMenu = ({ open, profiles }) => {
  return (
    <nav
      css={css`
        z-index: 500;
        display: ${open ? "flex" : "none"};
        flex-direction: column;
        justify-content: center;
        background: #effffa;
        /* transform: ${open ? "translateX(0)" : "translateX(100%)"}; */
        height: 100vh;
        text-align: left;
        padding: 2rem;
        position: absolute;
        top: 0;
        right: 0;
        /* transition: transformm 0.3s ease-in-out; */

        @media (max-width: 576px) {
          width: 100%;
        }

        a {
          font-size: 2rem;
          text-transform: uppercase;
          padding: 2rem 0;
          font-weight: bold;
          letter-spacing: 0.5rem;
          color: #0d0c1d;
          text-decoration: none;
          transition: color 0.3s linear;

          @media (max-width: 576px) {
            font-size: 1.5rem;
            text-align: center;
          }

          &:hover {
            color: #343078;
          }
        }
      `}
    >
      <Link href="/experience">Experience</Link>
      <Link href="/projects">Projects</Link>
      <Link href="/skills">Skills</Link>
      <Link href="https://gitconnected.com/roadlittledawn/resume">Resume</Link>
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
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

MobileNavMenu.propTypes = {
  open: PropTypes.bool,
  profiles: PropTypes.arrayOf(PropTypes.object),
};

export default MobileNavMenu;
