import PropTypes from "prop-types";
import React from "react";
import { css } from "@emotion/react";
import FeatherIcon from "../components/Icons";

const ProjectTile = ({
  as: Component,
  project: {
    name,
    summary,
    languages,
    libraries,
    tags,
    repositoryUrl,
    website,
  },
}) => {
  const mainLink = repositoryUrl || website;
  const links = [{ repositoryUrl }, { website }];
  const projectMetaDataTags = [...languages, ...libraries, ...tags].filter(
    Boolean
  );

  const LINK_ICONS = {
    repositoryUrl: "github",
    website: "window",
  };

  return (
    <Component
      key={name}
      css={css`
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        position: relative;
        height: 100%;
        padding: 1.25rem 1.75rem;
        background-color: var(--tile-background-color);
        border: var(--tile-border);
        border-radius: 4px;
        box-shadow: var(--tile-box-shadow);
        transition: all 0.25s cubic-bezier(0.645, 0.045, 0.355, 1) 0s,
          opacity 0.5s cubic-bezier(0.645, 0.045, 0.355, 1) 0s,
          transform 0.5s cubic-bezier(0.645, 0.045, 0.355, 1) 0s;
        &:hover {
          cursor: ${mainLink ? "pointer" : "default"};
          transform: translateY(-8px);
          h3 a {
            color: var(--color-teal-400);
          }
        }
        a {
          transition: all 0.25s ease-in;
          &:hover {
            color: var(--color-teal-400);
          }
        }
      `}
    >
      <div
        css={css`
          display: flex;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 20px;
        `}
      >
        <div>
          <FeatherIcon
            name="folder"
            size="2.5em"
            title="folder"
            strokeColor={`var(--color-teal-400)`}
            key={`folder-${name}`}
          />
        </div>
        <div
          css={css`
            display: flex;
            align-items: center;
          `}
        >
          {links.map((link) => {
            const hasValue = Object.values(link)[0];
            if (hasValue) {
              return (
                <a
                  key={`project-link-${Object.keys(link)[0]}`}
                  css={css`
                    position: relative;
                    z-index: 1;
                    padding: 5px 7px;
                    color: var(--tile-foreground-neutral);
                  `}
                  href={Object.values(link)[0]}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FeatherIcon
                    name={LINK_ICONS[Object.keys(link)[0]]}
                    size="1.5em"
                    title={`Go to ${Object.keys(link)[0]}`}
                    key={`${Object.keys(link)[0]}-logo`}
                  />
                </a>
              );
            }
          })}
        </div>
      </div>
      <h3>
        {mainLink ? (
          <a
            href={mainLink}
            title="Go to project repo"
            css={css`
              text-decoration: none;
              color: inherit;
              &::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
              }
            `}
          >
            {name}
          </a>
        ) : (
          name
        )}
      </h3>
      <div>{summary}</div>
      {projectMetaDataTags && (
        <ul
          css={css`
            list-style: none;
            font-family: var(--code-font);
            font-size: 0.75em;
            display: flex;
            flex-wrap: wrap;
            align-items: flex-end;
            flex-grow: 1;
            margin: 20px 0 0;
            padding: 0;
          `}
        >
          {projectMetaDataTags.map((tag) => (
            <li
              css={css`
                margin: 0.25em 0.5em;
              `}
              key={`tag-${tag}`}
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </Component>
  );
};

ProjectTile.defaultProps = {
  as: "li",
};

ProjectTile.propTypes = {
  as: PropTypes.string,
  project: PropTypes.object.isRequired,
};

export default ProjectTile;
