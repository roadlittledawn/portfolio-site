import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/react";
import useDarkMode from "use-dark-mode";
import Icon from "./Icons";
import isLocalStorageAvailable from "../utils/isLocalStorageAvailable";

const DarkModeToggle = ({ className, size, onClick }) => {
  const isDarkDefault = false;

  // If localStorage is not available, tell useDarkMode to just use an in-memory store
  const darkModeOptions = isLocalStorageAvailable()
    ? {}
    : { storageProvider: false };
  const darkMode = useDarkMode(isDarkDefault, darkModeOptions);

  return (
    <button
      onClick={(e) => {
        darkMode.toggle();

        if (onClick) {
          onClick(e);
        }
      }}
      css={css`
        cursor: pointer;
        border: 0;
        background-color: transparent;
        color: var(--secondary-text-color);
        transition: all 0.2s ease-out;

        &:hover {
          color: var(--secondary-text-hover-color);
        }
      `}
    >
      <Icon
        name={darkMode.value ? "sun" : "moon"}
        className={className}
        size={size}
      />
    </button>
  );
};

DarkModeToggle.propTypes = {
  className: PropTypes.string,
  size: PropTypes.string,
  onClick: PropTypes.func,
};

export default DarkModeToggle;
