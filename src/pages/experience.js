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
        {gigs.map((gig) => (
          <section
            css={css`
              margin: 3rem 0;
            `}
          >
            <h2>{gig.position}</h2>
            <p>
              {gig.name}{" "}
              {`${getNameOfMonth(gig.start.month)} ${gig.start.year}`} {`to`}{" "}
              {gig.isCurrentRole
                ? "Present"
                : `${getNameOfMonth(gig.start.month)}${gig.end.year}`}
            </p>
            <p>{gig.summary}</p>
            <ul>
              {gig.highlights.map((highlight) => (
                <li>{highlight}</li>
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
