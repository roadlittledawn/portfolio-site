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
          <div>Clinton Langosch</div>
          <div>Software Engineer | @newrelic</div>
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
          >
            <li>
              <Link to={"https://gitconnected.com/roadlittledawn/resume"}>
                View resume
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

Header.propTypes = {
  className: PropTypes.string,
};

export default Header;
