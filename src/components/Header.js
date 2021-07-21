import React, { useState } from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/react";
import { Link } from "gatsby";

import Logo from "../components/Logo";

import useMedia from "use-media";

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
              `}
            >
              <Logo color="black" />
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
