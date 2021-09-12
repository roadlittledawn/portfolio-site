import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/react";
import { Link } from "gatsby";

import Logo from "../components/Logo";
import FeatherIcon from "../components/Icons";
import { SOCIAL_ICON_NAMES, siteOptions } from "../utils/constants";
import DarkModeToggle from "./DarkModeToggle";
import NavLink from "./NavLink";

// import useMedia from "use-media";

const Header = ({ profiles, className }) => {
  // const hideLogoText = useMedia({ maxWidth: "655px" });
  // const useCondensedHeader = useMedia({ maxWidth: "585px" });

  return (
    <>
      <header
        className={className}
        css={css`
          position: relative;
          top: 0;
          z-index: 80;

          a {
            text-decoration: none;
          }
        `}
      >
        <div
          css={css`
            height: var(--global-header-height);
            display: flex;
            justify-content: space-between;
            max-width: var(--site-max-width);
            margin: 0 auto;
            padding: 0 var(--site-content-padding);
            align-items: center;
          `}
        >
          <div
            css={css`
              max-width: 33%;
            `}
          >
            <Link
              to={"/"}
              css={css`
                /* display: flex; */
                align-items: center;
                position: relative;
                &:hover {
                  &::before {
                    position: absolute;
                    content: "";
                    height: 20px;
                    width: 20px;
                    background-color: #fddf99;
                    border-radius: 50%;
                    left: 50%;
                    top: 0;
                    transform: translate(-77%, -400%);
                    z-index: 100;
                    box-shadow: 0 0 60px 30px #fddf99;
                  }
                }
              `}
            >
              <Logo />
            </Link>
          </div>
          <nav
            css={css`
              display: block;
              @media screen and (max-width: ${siteOptions.layout
                  .mobileBreakpoint}) {
                display: none;
              }
            `}
          >
            <ul
              css={css`
                margin: 0;
                margin-left: 1rem;
                padding: 0;
                display: flex;
                align-items: center;
                list-style-type: none;

                > li {
                  transition: all 0.2s ease-out;
                  color: var(--secondary-text-color);

                  &:not(:first-of-type) {
                    margin-left: 1em;
                  }
                }
              `}
            >
              <li>
                <DarkModeToggle size="0.875rem" />
              </li>
              <li>
                <NavLink to={"/experience"}>Experience</NavLink>
              </li>
              <li>
                <NavLink to={"/projects"}>Projects</NavLink>
              </li>
              <li>
                <NavLink to={"/skills"}>Skills</NavLink>
              </li>
              <li>
                <NavLink to={"https://gitconnected.com/roadlittledawn/resume"}>
                  Resume
                </NavLink>
              </li>
              {profiles
                .filter((profile) => profile.network !== "gitconnected")
                .map((profile) => (
                  <li
                    key={`li-${profile.network}`}
                    css={css`
                      width: 1.5em;
                    `}
                  >
                    <NavLink to={profile.url} key={`link-${profile.network}`}>
                      <FeatherIcon
                        key={`icon-${profile.network}`}
                        title={profile.network}
                        name={SOCIAL_ICON_NAMES[profile.network]}
                      />
                    </NavLink>
                  </li>
                ))}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
};

Header.propTypes = {
  profiles: PropTypes.array,
  className: PropTypes.string,
};

export default Header;
