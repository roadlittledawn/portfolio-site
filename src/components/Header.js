import React, { useState } from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/react";
import { graphql, Link } from "gatsby";
// import DarkModeToggle from './DarkModeToggle';

// import Button from "./Button";
// import Dropdown from "./Dropdown";
// import NewRelicLogo from './NewRelicLogo';
// import Icon from './Icon';
// import GlobalNavLink from "./GlobalNavLink";
import useMedia from "use-media";
import { rgba } from "polished";

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
      <div
        className={className}
        css={css`
          background-color: var(--color-neutrals-100);
          position: sticky;
          top: 0;
          z-index: 80;

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
          `}
        >
          <nav
            css={css`
              display: flex;
              align-items: center;
              height: 100%;
              overflow: hidden;
              position: relative;

              @media screen and (max-width: 800px) {
                &::after {
                  content: "";
                  position: absolute;
                  right: 0;
                  height: 100%;
                  width: 2rem;
                  pointer-events: none;
                  background: linear-gradient(
                    to right,
                    ${rgba("#f4f5f5", 0)},
                    var(--color-neutrals-100)
                  );

                  .dark-mode & {
                    background: linear-gradient(
                      to right,
                      ${rgba("#22353c", 0)},
                      var(--color-dark-100)
                    );
                  }
                }
              }
            `}
          >
            <ul
              css={css`
                height: 100%;
                margin: 0;
                padding: 0;
                display: flex;
                list-style-type: none;
                white-space: nowrap;
                overflow-x: auto;
                position: relative;
                -webkit-overflow-scrolling: touch;
                -ms-overflow-style: -ms-autohiding-scrollbar;

                > li {
                  margin: 0;
                  flex: 0 0 auto;
                }
              `}
            >
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/experience">Experience</Link>
              </li>
              <li>
                <Link to="/projects">Projects</Link>
              </li>
            </ul>
          </nav>

          <ul
            css={css`
              margin: 0;
              margin-left: 1rem;
              padding: 0;
              display: flex;
              list-style-type: none;
              align-items: center;
              flex: 1;

              > li {
                transition: all 0.2s ease-out;
                color: var(--secondary-text-color);

                &:not(:first-of-type) {
                  margin-left: 0.5rem;
                }
              }
            `}
          ></ul>
        </div>
      </div>
    </>
  );
};

Header.propTypes = {
  className: PropTypes.string,
};

export default Header;
