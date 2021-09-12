import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/react";
import { graphql } from "gatsby";
import MainLayout from "../layouts/MainLayout";
import PageTitle from "../components/PageTitle";

const ExperiencePage = ({ data }) => {
  const {
    allWork: { nodes: gigs },
  } = data;

  return (
    <>
      <MainLayout>
        <PageTitle>Experience</PageTitle>
        <section
          css={css`
            margin: 3em auto;
            max-width: 800px;
          `}
        >
          {gigs
            .sort(
              (a, b) =>
                convertToUnixTime(`${a.end.year}-${a.end.month}-01`) >
                convertToUnixTime(`${b.end.year}-${b.end.month}-01`)
            )
            .sort((a) => (a.isCurrentRole ? -1 : 1))
            .map((gig, index) => (
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
                    padding: 0.5em;
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
                      transform: translate(-37px, 10px);
                      background-color: var(--color-teal-400);
                    }
                  `}
                >
                  {`${getNameOfMonth(gig.start.month)} ${gig.start.year}`}{" "}
                  {`to`}{" "}
                  {gig.isCurrentRole
                    ? "Present"
                    : `${getNameOfMonth(gig.end.month)} ${gig.end.year}`}
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
            ))}
        </section>
      </MainLayout>
    </>
  );
};

ExperiencePage.propTypes = {
  data: PropTypes.object,
};

const getNameOfMonth = (monthNumber) =>
  new Date(2021, monthNumber - 1, 10).toLocaleString("default", {
    month: "long",
  });

const convertToUnixTime = (dateStamp) => new Date(dateStamp).getTime();

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
