const fs = require("fs");
const path = require("path");
const { program } = require("commander");

const dataFilePath = path.join(process.cwd(), "src/data/careerData.json");

/**
 * @description Reads careerData.json file and logs list of skills to console by specified format.
 * @param {String} tag Specify tag to look for in each skill.
 * @param {(name|skillObject)} format Specify format of list. `name` = name only. `skillObject` is whole object as stored in careerData.json
 * @returns null. Logs results to console.
 */

const listSkills = (tag, format = "name") => {
  fs.readFile(dataFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the JSON file:", err);
      return;
    }
    const careerData = JSON.parse(data);

    if (tag) {
      const selectedSkills = careerData.skills
        .filter((skill) => skill.tags.includes(tag))
        .map((skill) => (format === "name" ? skill.name : skill))
        .sort((a, b) => {
          if (format === "name") {
            return a.localeCompare(b);
          }
          if (format === "skillObject") {
            return a.name.localeCompare(b.name);
          }
          return 1;
        });
      console.log(selectedSkills);
      return null;
    } else {
      console.log(
        careerData.skills
          .map((skill) => (format === "name" ? skill.name : skill))
          .sort((a, b) => {
            if (format === "name") {
              return a.localeCompare(b);
            }
            if (format === "skillObject") {
              return a.name.localeCompare(b.name);
            }
            return 1;
          })
      );
      return null;
    }
  });
};

program
  .arguments("[tag]")
  .option(
    "-f, --format <format>",
    "Specify format for displaying tags. Supported formats: name, skillObject",
    "name"
  )
  .action((tag, options) => {
    if (tag) {
      listSkills(tag, options.format);
    } else {
      listSkills(tag, options.format);
    }
  });

program.parse(process.argv);
