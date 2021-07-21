import React, { useState } from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/react";
import { graphql, Link } from "gatsby";
import clintonLogo from "../images/logo-sun-dark.png";
import Logo from "../components/Logo";
// import DarkModeToggle from './DarkModeToggle';

import useMedia from "use-media";

const action = css`
  color: var(--secondary-text-color);
  transition: all 0.2s ease-out;

  &:hover {
    color: var(--secondary-text-hover-color);
  }
`;

const actionLink = css`
  ${action};

  display: flex;
  align-items: center;
`;

const actionIcon = css`
  display: block;
  cursor: pointer;
`;

const Header = ({ className }) => {
  const hideLogoText = useMedia({ maxWidth: "655px" });
  const useCondensedHeader = useMedia({ maxWidth: "585px" });

  return (
    <>
      <header
        className={className}
        css={css`
          background-color: var(--color-white);
          position: relative;
          top: 0;
          z-index: 80;

          a {
            text-decoration: none;
          }

          .dark-mode & {
            background-color: var(--color-dark-100);
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
                display: flex;
                align-items: center;
                -webkit-transition: -webkit-transform 0.8s ease-in-out;
                transition: transform 0.8s ease-in-out;
                &:hover {
                  -webkit-transform: rotate(360deg);
                  transform: rotate(360deg);
                }
              `}
            >
              <Logo color="black" />
              {/* <img
                css={css`
                  width: 8vw;
                  min-width: 100px;
                `}
                src={clintonLogo}
              /> */}
            </Link>
          </div>
          <nav>
            <ul
              css={css`
                margin: 0;
                margin-left: 1rem;
                padding: 0;
                display: flex;
                list-style-type: none;

                > li {
                  transition: all 0.2s ease-out;
                  color: var(--secondary-text-color);

                  &:not(:first-of-type) {
                    margin-left: 0.5rem;
                  }
                }
              `}
            >
              <li>
                <Link to={"/experience"}>Experience</Link>
              </li>
              <li>
                <Link to={"/projects"}>Projects</Link>
              </li>
              <li>
                <Link to={"https://gitconnected.com/roadlittledawn/resume"}>
                  Resume
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
};

Header.propTypes = {
  className: PropTypes.string,
};

export default Header;
