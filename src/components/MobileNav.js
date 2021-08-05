import PropTypes from "prop-types";
import React, { useState, useRef } from "react";
import { css } from "@emotion/react";
import Hamburger from "./Hamburger";
import MobileNavMenu from "./MobileNavMenu";
import { siteOptions } from "../utils/constants";

const MobileNav = ({ profiles }) => {
  const [open, setOpen] = useState(false);
  const mobileNavRef = useRef();
  // useEffect(() => {
  //   const listener = (event) => {
  //     if (!ref.current || ref.current.contains(event.target)) {
  //       return;
  //     }
  //     handler(event);
  //   };
  //   document.addEventListener("mousedown", listener);

  //   return () => {
  //     document.removeEventListener("mousedown", listener);
  //   };
  // });
  return (
    <div
      ref={mobileNavRef}
      css={css`
        display: none;
        @media screen and (max-width: ${siteOptions.layout.mobileBreakpoint}) {
          display: block;
        }
      `}
    >
      <Hamburger open={open} onClick={() => setOpen(!open)} />
      <MobileNavMenu open={open} profiles={profiles} />
    </div>
  );
};

MobileNav.propTypes = {
  profiles: PropTypes.arrayOf(PropTypes.object),
};

export default MobileNav;
