/* eslint-disable jsx-a11y/heading-has-content */
import React from "react";
import { css } from "@emotion/react";
import { siteOptions } from "../utils/constants";

const PageTitle = (props) => (
  <h1
    css={css`
      @media screen and (min-width: ${siteOptions.layout.mobileBreakpoint}) {
        display: none;
      }
    `}
    {...props}
  />
);

export default PageTitle;
