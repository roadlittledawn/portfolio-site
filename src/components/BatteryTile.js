import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { css } from "@emotion/react";
import Icon from "./Icons";
import { SKILL_RATINGS } from "../utils/constants";
import "./BatteryTile.scss";

const SKILL_RATINGS_BAR_COLOR = {
  1: { light: `var(--color-red-200)`, dark: `var(--color-red-600)` },
  2: { light: `var(--color-red-200)`, dark: `var(--color-red-600)` },
  3: { light: `var(--color-yellow-200)`, dark: `var(--color-yellow-600)` },
  4: { light: `var(--color-green-200)`, dark: `var(--color-green-600)` },
  5: { light: `var(--color-green-200)`, dark: `var(--color-green-600)` },
};

const Battery = ({ rating, name, iconName }) => {
  const chargePercent = (rating * 100) / 5;

  return (
    <div className="battery">
      <div
        className="battery-level"
        css={css`
          &:after {
            content: "";
            width: ${chargePercent}%;
            display: block;
            position: absolute;
            background-color: ${SKILL_RATINGS_BAR_COLOR[rating].light};
            opacity: 0.15;
            position: absolute;
            height: 100%;
            bottom: 0;
            left: 0;
            right: 0;
          }
        `}
      >
        <div className="icon">
          <Icon name={iconName} viewbox="0 0 128 128" size="2em" />
        </div>
        <div className={"name"}>{name}</div>
      </div>
    </div>
  );
};

Battery.propTypes = {
  rating: PropTypes.number.isRequired,
};

export default Battery;
