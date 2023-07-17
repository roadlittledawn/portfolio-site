import PropTypes from "prop-types";
import { graphql, Link } from "gatsby";
import React, { useEffect, useState } from "react";
import SEO from "../components/SEO";
import cx from "classnames";
import { css } from "@emotion/react";
import PageTitle from "../components/PageTitle";
import MainLayout from "../layouts/MainLayout";
import * as styles from "./Resume2.module.scss";
import resumePdfLink from "../files/clinton-langosch-resume-eng.pdf";
import FeatherIcon from "../components/Icons/FeatherIcon";
import { getNameOfMonth } from "../utils/time";

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
                margin: 0 auto;
                max-width: 8.5in;
                /* height: 11.2in; */
                width: 100%;
              `}
            >
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
                  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
                  padding: 0.25em;
                  .dark-mode & {
                    border: 1px solid var(--color-neutrals-400);
                    box-shadow: 0 5px 10px #70ccd370;
                    padding: 0.25em 0.25em 0 0.25em;
                  }
                  @media screen and (max-width: 600px) {
                    height: auto;
                  }
                `}
              >
                {renderContent(data)}
              </div>
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
    allEducation: { nodes: education },
  } = data;

  const renderSkillList = (tagName) => (
    <div className={styles.skillsGrid}>
      <h3>{tagName.replace("-", " ")}</h3>
      <div>
        <ul className={styles.skillsList}>
          {skills
            .filter(
              (skill) => skill.tags.includes(tagName) && skill.useOnResume
            )
            .sort((a, b) => a.name.toUpperCase() > b.name.toUpperCase())
            .map((skill) => (
              <li key={skill.name}>{skill.name}</li>
            ))}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <div className={styles.resumeBody}>
        <section
          css={css`
            background-color: #006c75;
          `}
        >
          <div className={styles.header}>
            <div>
              <h1>{basics.name}</h1>
            </div>
            <div>
              <h2 className={styles.textCenter}>{basics.label}</h2>
            </div>
          </div>
        </section>

        <section>
          <div className={styles.basicsInfo}>
            <ul className={styles.listHorizontal}>
              <li>
                <FeatherIcon
                  name="mail"
                  size="1em"
                  css={css`
                    margin: 0 0.5em 0 0;
                  `}
                />{" "}
                <a href={`mailto:${basics.email}`}>{basics.email}</a>
              </li>

              <li>
                {" "}
                <FeatherIcon
                  name="phone"
                  size="1em"
                  css={css`
                    margin: 0 0.5em 0 0.25em;
                  `}
                />{" "}
                {basics.phone}
              </li>

              <li>
                {" "}
                <FeatherIcon
                  name="map-pin"
                  size="1em"
                  css={css`
                    margin: 0 0.5em 0 0.25em;
                  `}
                />{" "}
                {basics.locationAsString}
              </li>
              {basics.profiles.map((profile) => (
                <>
                  <li key={profile.network}>
                    <FeatherIcon
                      name={profile.network.toLowerCase()}
                      size="1em"
                      css={css`
                        margin: 0 0.5em 0 0.25em;
                      `}
                    />{" "}
                    <a href={profile.url}>{profile.network}</a>
                  </li>
                </>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <div
            css={css`
              text-align: center;
            `}
          >
            <ul className={cx(styles.listHorizontalBullets, styles.allCaps)}>
              {basics.industrySubDomains.map((domain) => (
                <li key={`domain-${domain}`}>{domain}</li>
              ))}
            </ul>
          </div>

          <div
            dangerouslySetInnerHTML={{ __html: basics.positioningStatement }}
          ></div>
        </section>

        <section>
          {renderSkillList("frontend")}
          {renderSkillList("backend")}
          {renderSkillList("tools")}
          {renderSkillList("cloud-platform")}
          {renderSkillList("concepts")}
        </section>

        <section>
          <h2>Experience</h2>
          <ul className={styles.noBullets}>
            {workHistory.map((gig, idx) => (
              <li
                key={`gig-${idx}`}
                css={css`
                  page-break-before: ${idx === workHistory.length - 1
                    ? "always"
                    : "auto"};
                `}
              >
                <div
                  css={css`
                    display: flex;
                    justify-content: space-between;
                    font-weight: bold;
                  `}
                >
                  <h3 className={styles.bold}>
                    {gig.name} - {gig.location}
                  </h3>
                  <div
                    css={css`
                      font-weight: bold;
                    `}
                  >
                    {getNameOfMonth(gig.start.month)} {gig.start.year} to{" "}
                    {gig.isCurrentRole
                      ? "Present"
                      : `${getNameOfMonth(gig.end.month)} ${gig.end.year}`}
                  </div>
                </div>
                <div>
                  <h4>{gig.position}</h4>
                </div>
                <p>{gig.summary}</p>
                <ul>
                  {gig.highlights.map((highlight, idx2) => (
                    <li key={`${idx}-highlight-${idx2}`}>{highlight}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Education</h2>
          {education.map((ed) => (
            <>
              <p>
                {ed.name}, {ed.yearOfGraduation}. {ed.degree}.
              </p>
            </>
          ))}
        </section>
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
      name
      email
      locationAsString
      positioningStatement
      industrySubDomains
      label
      image
      phone
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
        tags
        useOnResume
      }
    }
    allWork(sort: { fields: [end___year, end___month], order: [DESC, DESC] }) {
      nodes {
        summary
        isCurrentRole
        company
        location
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
    allEducation {
      nodes {
        name
        degree
        yearOfGraduation
      }
    }
  }
`;

export default ResumePage;
