import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { css } from "@emotion/react";
import MobileNavMenu from "./MobileNavMenu";

const MobileNav = ({ profiles, open }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [open]);
  return (
    <div
      css={css`
        z-index: ${open ? 998 : 500};
        opacity: ${open ? 1 : 0};
        visibility: ${open ? "shown" : "hidden"};
        transform: ${open ? "translateX(0)" : "translateX(100%)"};
        transition: visibility 0.3s ease-in-out, transform 0.3s ease-in-out,
          opacity 0.3s ease-in-out;
        height: 100vh;
        position: fixed;
        inset: 0;
        height: 100vh;
        width: 100vw;
        overflow-y: auto;
      `}
    >
      <MobileNavMenu open={open} profiles={profiles} />
    </div>
  );
};

MobileNav.propTypes = {
  profiles: PropTypes.arrayOf(PropTypes.object),
  open: PropTypes.bool,
};

export default MobileNav;
