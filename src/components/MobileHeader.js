import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/react";
// import Link from "./Link";
// import Logo from "./Logo";
// import HamburgerMenu from "./HamburgerMenu";
// import MobileNavigation from "./MobileNavigation";
import { graphql, useStaticQuery, Link } from "gatsby";
import { useToggle } from "react-use";
import { SITE } from "../utils/constants";

const MobileHeader = ({ children }) => {
  const [isOpen, toggle] = useToggle(false);

  const {
    LAYOUT: { MOBILE_BREAKPOINT },
  } = SITE;

  return (
    <header
      css={css`
        display: none;
        padding: 1rem var(--site-content-padding);
        justify-content: space-between;
        align-items: center;

        @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
          display: flex;
        }
      `}
    >
      Nav here
    </header>
  );
};

MobileHeader.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MobileHeader;
