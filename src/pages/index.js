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
              My name is Clinton
              <br />
              Writer, Builder, Leader at the forefront of knowledge management,
              onboarding, and customer support.
              {/* Engineer at Heart, Writer by Trade, Leader by Choice. */}
            </h1>
            <p
              css={css`
                font-size: 1.5rem;
                font-weight: 300;
                line-height: 1.8;
              `}
            >
              <p>
                Experienced technical communicator and leader with 11 years in
                technical writing and 10 years in full-stack development.
                I&apos;ve written a wide variety of content, and developed many
                technical content sites, features, & systems.
              </p>

              <p>
                Writer at heart, engineer by trade, leader by choice – I pride
                myself on putting the <i>technical</i> in technical writer. My
                passion for technical communication has been a constant
                throughout my career, thriving at the intersection of technology
                and content. With a hands-on approach and a deep understanding
                of software engineering audiences, I apply my technical
                expertise to create clear, effective content.
              </p>
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
