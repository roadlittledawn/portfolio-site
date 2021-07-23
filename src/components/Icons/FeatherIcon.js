import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/react";
import featherIcons from "./feather";

const FeatherIcon = ({ name, size, title, defs, props, strokeColor }) => {
  const featherSVG = featherIcons[name];

  if (featherSVG) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        css={css`
          width: ${size};
          height: ${size};
          fill: none;
          stroke: ${strokeColor || "currentColor"};
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        `}
      >
        {title && <title>{title}</title>}
        {defs && <defs>{defs}</defs>}
        {featherSVG}
      </svg>
    );
  }

  throw new Error(`Icon: ${name} did not match a known icon`);
};

FeatherIcon.propTypes = {
  name: PropTypes.string,
  strokeColor: PropTypes.string,
};

export default FeatherIcon;
