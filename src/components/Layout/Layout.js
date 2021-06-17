import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/react";
import Content from "./Content";
import Footer from "./Footer";
import Main from "./Main";
import Sidebar from "./Sidebar";

const Layout = ({ className, children }) => {
  return (
    <div
      className={className}
      css={css`
        --sidebar-width: 300px;

        display: grid;
        /* 
        Use this for sidebar
        grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
        grid-template-areas:
          "sidebar main"
          "sidebar footer";
        grid-template-rows: 1fr auto; */

        min-height: calc(100vh - var(--global-header-height));
        margin: 0 auto;
        max-width: var(--site-max-width);
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas:
          "main"
          "footer";
        grid-template-rows: unset;

        /* @media screen and (max-width: 760px) {
          grid-template-columns: minmax(0, 1fr);
          grid-template-areas:
            "main"
            "footer";
          grid-template-rows: unset;
        } */
      `}
    >
      {children}
    </div>
  );
};

Layout.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

Layout.Content = Content;
Layout.Main = Main;
Layout.Footer = Footer;
Layout.Sidebar = Sidebar;

export default Layout;
