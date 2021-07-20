import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/react";

const FeatherSVG = ({ children, title, defs, size, ...props }) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    css={css`
      width: ${size};
      height: ${size};
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    `}
  >
    {title && <title>{title}</title>}
    {defs && <defs>{defs}</defs>}
    {children}
  </svg>
);

FeatherSVG.propTypes = {
  defs: PropTypes.node,
  children: PropTypes.node,
  title: PropTypes.string,
  size: PropTypes.string,
};

FeatherSVG.defaultProps = {
  size: "1em",
};

export default FeatherSVG;
