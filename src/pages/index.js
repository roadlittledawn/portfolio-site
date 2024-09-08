import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/react";
import { graphql } from "gatsby";
import SEO from "../components/SEO";
import MainLayout from "../layouts/MainLayout";
import { siteOptions } from "../utils/constants";

// Helper function to adjust the brightness of a hex color
const adjustBrightness = (hex, amount) => {
  let color = hex.slice(1); // Remove the '#' symbol
  let num = parseInt(color, 16);

  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;

  r = Math.max(Math.min(255, r), 0);
  g = Math.max(Math.min(255, g), 0);
  b = Math.max(Math.min(255, b), 0);

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};
// Function to generate a random color and return a darker and lighter pair
const getRandomColorPair = () => {
  // Generate a random base color
  const baseColor = `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;

  // Adjust brightness to get darker and lighter shades
  const darkerColor = adjustBrightness(baseColor, -80); // Adjust by -80 for a darker shade
  const lighterColor = adjustBrightness(baseColor, 80); // Adjust by 80 for a lighter shade

  return [darkerColor, lighterColor];
};

let colorGradiantValues = [];

for (let i = 1; i <= 3; i++) {
  const [color1, color2] = getRandomColorPair();
  colorGradiantValues.push([color1, color2]);
}

const underlineMarkerStyles = css`
  background-repeat: no-repeat;
  background-size: 100% 0.2em;
  background-position: 0 88%;
  transition: background-size 0.25s ease-in;
  &:hover {
    background-size: 100% 88%;
  }
`;

const HomePage = ({ data }) => {
  const {
    basics: { image },
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
              {["Writer", "Builder", "Leader"].map((item, index) => (
                <>
                  <span
                    key={`headingSpan-${index}`}
                    style={{
                      backgroundImage: `linear-gradient(120deg,${colorGradiantValues[index][0]} 0%, ${colorGradiantValues[index][1]} 100%)`,
                    }}
                    css={underlineMarkerStyles}
                  >
                    {item}
                  </span>
                  ,{" "}
                </>
              ))}
              at the intersection of technology, technical communication, &
              customer support
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
                I&apos;m a writer who loves technology, an engineer who loves to
                communicate, and a leader who&apos;s passionate about making
                things better for both users and developers. Throughout my
                career, I’ve thrived at the intersection of technology and
                content, using a hands-on approach and technical expertise to
                create clear, effective communication for audiences like myself.
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
