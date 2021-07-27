import PropTypes from "prop-types";
import React, { useState, useRef, useEffect } from "react";
import Hamburger from "./Hamburger";
import MobileNavMenu from "./MobileNavMenu";

const MobileNav = () => {
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
    <div ref={mobileNavRef}>
      <Hamburger open={open} onClick={() => setOpen(!open)} />
      <MobileNavMenu open={open} setOpen={setOpen} />
    </div>
  );
};

MobileNav.propTypes = {
  data: PropTypes.object.isRequired,
  location: PropTypes.object,
};

export default MobileNav;
