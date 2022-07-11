import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/react";
import { graphql } from "gatsby";
import SEO from "../components/SEO";
import MainLayout from "../layouts/MainLayout";
import { siteOptions } from "../utils/constants";

const HomePage = ({ data }) => {
  const {
    basics: { summary, image },
  } = data;
  const {
    layout: { mobileBreakpoint },
  } = siteOptions;
  return (
    <>
      <SEO title="Home" />
      <MainLayout>
        <section
          css={css`
            display: flex;
            justify-content: space-evenly;
            align-items: center;
            > * {
              margin: 1rem;
            }
          `}
        >
          <div
            css={css`
              width: 60%;

              @media screen and (max-width: ${mobileBreakpoint}) {
                width: 100%;
                order: 2;
              }
            `}
          >
            <h1>
              Hello there. My name is Clinton. <br />
              I&apos;m a software engineering manager.
            </h1>
            <p
              css={css`
                font-size: 1.5rem;
                font-weight: 300;
                line-height: 1.8;
              `}
            >
              {summary}
            </p>
          </div>

          <div
            css={css`
              width: 40%;
              text-align: center;
              @media screen and (max-width: ${mobileBreakpoint}) {
                width: 100%;
                order: 1;
              }
            `}
          >
            <img
              src={image}
              alt="Headshot of Clinton"
              css={css`
                border-radius: 50%;
                width: 100%;
                max-width: 400px;
                padding: 10px;
                background: var(--color-teal-300);
                background: radial-gradient(
                  circle,
                  var(--color-teal-300) 40%,
                  var(--primary-background-color) 100%
                );
              `}
            />
          </div>
        </section>
      </MainLayout>
    </>
  );
};

HomePage.propTypes = {
  data: PropTypes.object,
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
  }
`;

export default HomePage;
