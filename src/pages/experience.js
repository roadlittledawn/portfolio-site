import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/react";
import { graphql } from "gatsby";
import MainLayout from "../layouts/MainLayout";

const ExperiencePage = ({ data }) => {
  const {
    allWork: { nodes: gigs },
  } = data;
  const getNameOfMonth = (monthNumber) =>
    new Date(2021, monthNumber - 1, 10).toLocaleString("default", {
      month: "long",
    });
  return (
    <>
      <MainLayout>
        <h1>Experience</h1>
        {gigs
          .sort((a) => (a.isCurrentRole ? -1 : 1))
          .map((gig, index) => (
            <section
              key={`gig-${index}`}
              css={css`
                margin: 3rem 0;
              `}
            >
              <h2>{gig.position}</h2>
              <div>{gig.name}</div>
              <div>
                {`${getNameOfMonth(gig.start.month)} ${gig.start.year}`} {`to`}{" "}
                {gig.isCurrentRole
                  ? "Present"
                  : `${getNameOfMonth(gig.start.month)} ${gig.end.year}`}
              </div>
              <p>{gig.summary}</p>
              <ul>
                {gig.highlights.map((highlight, index) => (
                  <li key={`highlight-${index}`}>{highlight}</li>
                ))}
              </ul>
            </section>
          ))}
      </MainLayout>
    </>
  );
};

ExperiencePage.propTypes = {
  data: PropTypes.object,
};

export const pageQuery = graphql`
  query {
    allWork {
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
