import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/react";
import featherIcons from "./feather";
import svgIcons from "./svgIcons";

const FeatherIcon = ({
  name,
  size,
  viewbox,
  title,
  defs,
  props,
  strokeColor,
  strokeWidth,
  className,
}) => {
  const featherSVG = featherIcons[name];
  const svgIcon = svgIcons[name];

  if (featherSVG) {
    return (
      <svg
        {...props}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        css={css`
          width: ${size};
          height: ${size};
          fill: none;
          stroke: ${strokeColor || "currentColor"};
          stroke-width: ${strokeWidth || 2};
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

  if (svgIcon) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewbox || "0 0 24 24"}
        css={css`
          width: ${size};
          height: ${size};
        `}
      >
        {svgIcon}
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
