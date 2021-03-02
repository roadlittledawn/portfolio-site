const { skills, projects } = require("./src/data/careerData.json");

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;

  createTypes(`
    type Skills implements Node {
      name: String!
      level: String
      rating: Int
      yearsOfExperience: Int
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
    }
  `);
};

exports.sourceNodes = ({ actions, createNodeId, createContentDigest }) => {
  const { createNode } = actions;
  skills.map(({ name, level, rating, yearsOfExperience }, idx) => {
    const id = createNodeId(`${idx}-${name}`);
    const data = {
      name,
      level,
      rating,
      yearsOfExperience,
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
};
