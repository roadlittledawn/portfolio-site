import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/react";
import { graphql } from "gatsby";
import MainLayout from "../layouts/MainLayout";
import PageTitle from "../components/PageTitle";
import SEO from "../components/SEO";
import { calculateTimeBetweenDates } from "../utils/time";
import { pluralize } from "../utils/pluralize";

const ExperiencePage = ({ data }) => {
  const {
    allWork: { nodes: gigs },
  } = data;

  return (
    <>
      <SEO title="Experience" />
      <MainLayout>
        <PageTitle>Experience</PageTitle>
        <section
          css={css`
            margin: 3em auto;
            max-width: 800px;
          `}
        >
          {gigs
            .sort((a) => (a.isCurrentRole ? -1 : 0))
            .map((gig, index) => {
              const yearsOfService = calculateTimeBetweenDates({
                unit: "years",
                start: [gig.start.year, gig.start.month],
                end: gig.end.year
                  ? [gig.end.year, gig.end.month]
                  : [new Date().getFullYear(), new Date().getMonth()],
                returnFloat: true,
              });
              return (
                <div
                  key={`gig-${index}`}
                  css={css`
                    position: relative;
                    padding: 0 30px 60px 30px;

                    :last-child {
                      padding-bottom: 0;
                      margin-top: -1px;
                    }

                    :not(:last-child):before {
                      content: "";
                      position: absolute;
                      left: 0;
                      width: 1px;
                      height: 100%;
                      background-color: var(--color-teal-400);
                    }
                  `}
                >
                  <div
                    css={css`
                      font-size: 0.8em;
                      padding: 0.5em 1em;
                      position: relative;
                      top: -17px;
                      display: inline-block;
                      margin-bottom: 1em;
                      border: 1px solid var(--color-teal-400);

                      :before {
                        content: "";
                        width: 30px;
                        position: absolute;
                        height: 1px;
                        transform: translate(-43px, 10px);
                        background-color: var(--color-teal-400);
                      }
                    `}
                  >
                    {`${gig.start.year}`} {`to`}{" "}
                    {gig.isCurrentRole ? "Present" : `${gig.end.year}`}
                  </div>
                  <div
                    css={css`
                      display: inline-block;
                      margin: 0 0 1em 1em;
                      position: relative;
                      top: -17px;
                      font-size: 0.85em;
                    `}
                  >
                    {pluralize(yearsOfService, "year")}
                  </div>
                  <h2>{gig.position}</h2>
                  <div>{gig.name}</div>
                  <p>{gig.summary}</p>
                  <ul>
                    {gig.highlights.map((highlight, index) => (
                      <li key={`highlight-${index}`}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
        </section>
      </MainLayout>
    </>
  );
};

ExperiencePage.propTypes = {
  data: PropTypes.object,
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

export default ExperiencePage;
