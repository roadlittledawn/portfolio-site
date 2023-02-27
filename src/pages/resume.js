import PropTypes from "prop-types";
import { graphql, Link } from "gatsby";
import React, { useEffect, useState } from "react";
import SEO from "../components/SEO";
import cx from "classnames";
import { css } from "@emotion/react";
import { SKILL_CATEGORY } from "../utils/constants";
import PageTitle from "../components/PageTitle";
import MainLayout from "../layouts/MainLayout";
import * as styles from "./Resume.module.scss";
import resumePdfLink from "../files/clinton-langosch-resume-eng.pdf";
import FeatherIcon from "../components/Icons/FeatherIcon";

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
                margin: 1em 0;
                display: flex;
                justify-content: flex-end;
              `}
            >
              <Link
                to={resumePdfLink}
                css={css`
                  border: 1px solid transparent;
                  border-radius: 10px;
                  text-decoration: none;
                  padding: 0.5em 1em;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  :hover {
                    color: var(--color-teal-700);
                    border: 1px solid var(--color-teal-300);
                    background-color: var(--color-teal-300);
                    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
                      0 1px 5px 0 rgba(0, 0, 0, 0.12),
                      0 3px 1px -2px rgba(0, 0, 0, 0.2);
                  }
                `}
              >
                <FeatherIcon
                  name="save"
                  size="1em"
                  css={css`
                    margin: 0 0.5em 4px 0;
                  `}
                />{" "}
                Save as PDF or Print
              </Link>
            </div>
            <div
              css={css`
                max-width: 8.5in;
                height: 11.2in;
                width: 100%;
                padding: 0.1in;
                box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
                .dark-mode & {
                  border: 1px solid var(--color-neutrals-400);
                  box-shadow: 0 5px 10px #70ccd370;
                }
                @media screen and (max-width: 600px) {
                  height: auto;
                }
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
  const {
    basics,
    allSkills: { nodes: skills },
    allWork: { nodes: workHistory },
  } = data;
  return (
    <>
      <div className={styles.resumeBody}>
        <div className={cx(styles.gridContainer, styles.page)}>
          <div className={styles.headerLogo}>
            <div className={styles.headerImg}>
              <img
                src={basics.image}
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
            <p>{basics.summary}</p>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.sidebarWrapper}>
              <div>
                <h2>skills</h2>

                <h4>Front-end</h4>
                <ul className={styles.skillsList}>
                  {skills
                    .filter(
                      (skill) => SKILL_CATEGORY[skill.name] === "frontend"
                    )
                    .sort((a, b) => a.name > b.name)
                    .map((skill) => (
                      <li key={skill.name}>{skill.name}</li>
                    ))}
                </ul>

                <h4>Back-end</h4>
                <ul className={styles.skillsList}>
                  {skills
                    .filter((skill) => SKILL_CATEGORY[skill.name] === "backend")
                    .sort((a, b) => a.name > b.name)
                    .map((skill) => (
                      <li key={skill.name}>{skill.name}</li>
                    ))}
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

              {workHistory.map((gig, index) => (
                <div
                  className={styles.historyItem}
                  key={`${gig.company}${index}`}
                >
                  <h3>
                    <span>{gig.company}</span> <span>|</span>{" "}
                    <span>{gig.position}</span>
                  </h3>
                  <div className={styles.timeframe}>
                    {" "}
                    {gig.start.year} {`to`}{" "}
                    {gig.isCurrentRole ? "Present" : gig.end.year}
                  </div>
                  <p>{gig.summary}</p>
                  <div>
                    <ul>
                      {gig.highlights.map((highlight, index) => (
                        <li key={`${gig.company}-highlight-${index}`}>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
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
    basics {
      summary
      image
      profiles {
        network
        url
        username
      }
    }
    allSkills {
      nodes {
        name
        level
        rating
        yearsOfExperience
      }
    }
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
