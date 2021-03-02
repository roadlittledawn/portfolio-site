const { skills } = require("./src/data/careerData.json");

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;

  createTypes(`
    type Skills implements Node {
      name: String!
      level: String
      rating: Int
      yearsOfExperience: Int
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
};
