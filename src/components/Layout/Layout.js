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
        position: relative;
        min-height: calc(100vh - var(--global-header-height));
        margin: 0 auto;
        max-width: var(--site-max-width);
        width: 100%;
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
