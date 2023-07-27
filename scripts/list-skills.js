const fs = require("fs");
const path = require("path");
const { program } = require("commander");

const dataFilePath = path.join(process.cwd(), "src/data/careerData.json");

const listSkills = (tag) => {
  fs.readFile(dataFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the JSON file:", err);
      return;
    }
    const careerData = JSON.parse(data);

    if (tag) {
      const selectedSkills = careerData.skills
        .filter((skill) => skill.tags.includes(tag))
        .map(({ name }) => name);
      console.log(selectedSkills);
      return null;
    } else {
      console.log(careerData.skills.map(({ name }) => name));
      return null;
    }
  });
};

program.arguments("[tag]").action((tag) => {
  if (tag) {
    listSkills(tag);
  } else {
    listSkills();
  }
});

program.parse(process.argv);
