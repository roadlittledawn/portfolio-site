const {
  skills,
  projects,
  basics,
  work,
} = require("./src/data/careerData.json");

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        path: require.resolve("path-browserify"),
      },
      fallback: {
        fs: false,
      },
    },
  });
};

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;

  createTypes(`
    type Basics implements Node {
      name: String!
      label: String
      email: String
      summary: String
      profiles: [Profile]
      headline: String
      yearsOfExperience: Int
      username: String
      locationAsString: String
      picture: String
    }
    type Profile {
      network: String
      username: String
      url: String
    }
    type Skills implements Node {
      name: String!
      level: String
      rating: Int
      yearsOfExperience: Int
      tags: [String]
    }
    type Projects implements Node {
      name: String!
      description: String
      url: String
      summary: String
      primaryLanguage: String
      languages: [String]
      githubUrl: String
      repositoryUrl: String
      website: String
    }
    type Work implements Node {
      name: String!
      position: String
      startDate: String
      endDate: String
      summary: String
      highlights: [String]
      isCurrentRole: Boolean
      start: DateObject
      end: DateObject
      company: String
    }
    type DateObject {
      year: Int
      month: Int
    }
  `);
};

exports.sourceNodes = ({ actions, createNodeId, createContentDigest }) => {
  const { createNode } = actions;

  const id = createNodeId("basics");
  const data = ({
    name,
    label,
    email,
    summary,
    profiles,
    headline,
    yearsOfExperience,
    username,
    locationAsString,
    picture,
  } = basics);

  createNode({
    ...data,
    id,
    parent: null,
    children: [],
    internal: {
      type: "Basics",
      contentDigest: createContentDigest(data),
    },
  });

  skills.map(({ name, level, rating, yearsOfExperience, tags }, idx) => {
    const id = createNodeId(`${idx}-${name}`);
    const data = {
      name,
      level,
      rating,
      yearsOfExperience,
      tags,
    };
    createNode({
      ...data,
      id,
      parent: null,
      children: [],
      internal: {
        type: "Skills",
        contentDigest: createContentDigest(data),
      },
    });
  });
  projects.map(
    (
      {
        name,
        description,
        url,
        summary,
        primaryLanguage,
        languages,
        githubUrl,
        repositoryUrl,
        website,
      },
      idx
    ) => {
      const id = createNodeId(`${idx}-${name}`);
      const data = {
        name,
        description,
        url,
        summary,
        primaryLanguage,
        languages,
        githubUrl,
        repositoryUrl,
        website,
      };
      createNode({
        ...data,
        id,
        parent: null,
        children: [],
        internal: {
          type: "Projects",
          contentDigest: createContentDigest(data),
        },
      });
    }
  );
  work.map(
    (
      {
        name,
        position,
        startDate,
        endDate,
        summary,
        highlights,
        isCurrentRole,
        start,
        end,
        company,
      },
      idx
    ) => {
      const id = createNodeId(`${idx}-${name}`);
      const data = {
        name,
        position,
        startDate,
        endDate,
        summary,
        highlights,
        isCurrentRole,
        start,
        end,
        company,
      };
      createNode({
        ...data,
        id,
        parent: null,
        children: [],
        internal: {
          type: "Work",
          contentDigest: createContentDigest(data),
        },
      });
    }
  );
};
