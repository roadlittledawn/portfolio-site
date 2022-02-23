import PropTypes from "prop-types";
import { graphql } from "gatsby";
import React, { useEffect, useState } from "react";
import SEO from "../components/SEO";
import cx from "classnames";
import { css } from "@emotion/react";
import { siteOptions } from "../utils/constants";
import PageTitle from "../components/PageTitle";
import MainLayout from "../layouts/MainLayout";
import * as styles from "./Resume.module.scss";

const ResumePage = ({ data, location }) => {
  const [isEmbed, setIsEmbed] = useState(0);
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setIsEmbed(queryParams.get("embed") === "true");
  }, [location.search]);

  return (
    <>
      {isEmbed ? (
        <div
          css={css`
            height: 100vh;
          `}
        >
          {renderContent(data)}
        </div>
      ) : (
        <>
          <SEO title="Resume" />
          <MainLayout>
            <PageTitle>Resume</PageTitle>
            <div
              css={css`
                max-width: 8.5in;
                height: 11in;
                padding: 0.1in;
                box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
              `}
            >
              {renderContent(data)}
            </div>
          </MainLayout>
        </>
      )}
    </>
  );
};

const renderContent = (data) => {
  console.log({ styles });
  const {
    allWork: { nodes: workItems },
  } = data;
  return (
    <>
      <div className={styles.resumeBody}>
        <div className={cx(styles.gridContainer, styles.page)}>
          <div className={styles.headerLogo}>
            <div className={styles.headerImg}>
              <img
                src="https://avatars3.githubusercontent.com/u/2952843?v=4"
                alt="Headshot of Clinton"
                className={styles.headshot}
              />
            </div>
          </div>

          <div className={cx(styles.headerName, styles.centerVertical)}>
            <h1>
              <span>Clinton</span> Langosch
            </h1>
          </div>

          <div className={styles.mainSummary}>
            <p>
              Full stack engineer with some back end experience. Steeped in CMS
              development, in-product help, and services that connect them. I'm
              currently a software engineer / technical product manager at New
              Relic.
            </p>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.sidebarWrapper}>
              <div>
                <h2>skills</h2>

                <div>Front end</div>
                <ul className={styles.skillsList}>
                  <li>CSS</li>
                  <li>HTML</li>
                  <li>JavaScript</li>
                  <li>React.js</li>
                  <li>GraphQL</li>
                  <li>Sass</li>
                </ul>

                <div>Back end</div>
                <ul className={styles.skillsList}>
                  <li>MySQL</li>
                  <li>Node.js</li>
                  <li>PHP</li>
                  <li>PostgreSQL</li>
                  <li>MongoDB</li>
                </ul>
              </div>

              <div className={styles.socialContainer}>
                <h2>contact</h2>

                <div>
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className={styles.socialIcon}
                    >
                      <title>Portfolio site</title>
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                  </span>
                  <a href="https://clintonlangosch.com">clintonlangosch.com</a>
                </div>
                <div>
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className={styles.socialIcon}
                    >
                      <title>GitHub</title>
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                  </span>
                  <a href="https://github.com/roadlittledawn">roadlittledawn</a>
                </div>
                <div>
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className={styles.socialIcon}
                    >
                      <title>LinkedIn</title>
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect
                        xmlns="http://www.w3.org/2000/svg"
                        x="2"
                        y="9"
                        width="4"
                        height="12"
                      ></rect>
                      <circle
                        xmlns="http://www.w3.org/2000/svg"
                        cx="4"
                        cy="4"
                        r="2"
                      ></circle>
                    </svg>
                  </span>
                  <a href="https://www.linkedin.com/in/clinton-langosch">
                    clinton-langosch
                  </a>
                </div>
                <div>
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className={styles.socialIcon}
                    >
                      <title>Email address</title>
                      <path
                        xmlns="http://www.w3.org/2000/svg"
                        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                      />
                      <polyline
                        xmlns="http://www.w3.org/2000/svg"
                        points="22,6 12,13 2,6"
                      />
                    </svg>
                  </span>
                  <a href="mailto:clinton.langosch@gmail.com">
                    clinton.langosch@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.main}>
            <div>
              <h2>experience</h2>

              <div className={styles.historyItem}>
                <h3>
                  <span>New Relic</span> <span>|</span>{" "}
                  <span>Software Engineer</span>
                </h3>
                <div className={styles.timeframe}>Aug 2020 - Present</div>
                <div>
                  We develop and maintain sites and services around technical
                  content, product documentation, and opensource projects to
                  help developers get the most out of New Relic.
                </div>
                <ul>
                  <li>
                    Migrate from Drupal to GitHub + React static site to be
                    fully open sourced and part of JAM stack.
                  </li>
                  <li>
                    Develop various React / Node based sites including
                    docs.newrelic.com, developer.newrelic.com,
                    opensource.newrelic.com, and our gatsby-newrelic-theme.
                  </li>
                  <li>
                    Develop and maintain services that connect help content to
                    the product UI.
                  </li>
                  <li>
                    Develop and maintain translation workflows / tooling to
                    localize content into many different languages.
                  </li>
                  <li>
                    Serve as technical product mgr to help develop roadmap,
                    prioritize backlog, scope and plan upcoming work, provide
                    technical input in strategic decisions.
                  </li>
                </ul>
              </div>

              <div className={styles.historyItem}>
                <h3>
                  <span>New Relic</span> <span>|</span>{" "}
                  <span>Software Engineer</span>
                </h3>
                <div className={styles.timeframe}>Oct 2017 - Aug 2020</div>
                <div>
                  Develop Drupal-based content management system on front and
                  back end for docs.newrelic.com and learn.newrelic.com.
                </div>
                <ul>
                  <li>
                    Lead Docs as a Service (DaaS) initaitive to build out REST
                    API / JSON resources to enable other teams to integrate with
                    our site. Examples: programmatically publish release notes,
                    install procedures in the product UI, data dictionary terms
                    fed to UI to display definitions to users in product UI,
                    etc.
                  </li>
                  <li>
                    Develop various React / Node based sites including
                    docs.newrelic.com, developer.newrelic.com,
                    opensource.newrelic.com, and our gatsby-newrelic-theme.
                  </li>
                  <li>
                    Develop prototype of product UI component (called Nerdlet)
                    in React.js to surface search results from disparate sites.
                  </li>
                  <li>Develop integration to translate site in Japanese</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

ResumePage.propTypes = {
  data: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export const pageQuery = graphql`
  query {
    allWork(sort: { fields: [end___year, end___month], order: [DESC, DESC] }) {
      nodes {
        summary
        isCurrentRole
        company
        start {
          month
          year
        }
        end {
          month
          year
        }
        highlights
        name
        position
      }
    }
  }
`;

export default ResumePage;
