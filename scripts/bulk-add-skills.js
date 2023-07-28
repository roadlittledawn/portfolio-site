const fs = require("fs");
const path = require("path");
const yargs = require("yargs");

const dataFilePath = path.join(process.cwd(), "src/data/careerData.json");

const updateCareerData = (dataArray) => {
  fs.readFile(dataFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the JSON file:", err);
      return;
    }

    let careerData;
    try {
      careerData = JSON.parse(data);
    } catch (error) {
      console.error("Error parsing JSON file:", error);
      return;
    }

    const skillsToAdd = dataArray.map((name) => ({
      name,
      level: "Intermediate",
      rating: 3,
      tags: ["concepts"],
      yearsOfExperience: 4,
      iconName: null,
      useOnResume: true,
    }));

    careerData.skills = [...careerData.skills, ...skillsToAdd];

    fs.writeFile(
      dataFilePath,
      JSON.stringify(careerData, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.error("Error writing to JSON file:", err);
          return;
        }

        console.log("Data updated successfully!");
      }
    );
  });
};

yargs
  .command({
    command: "$0 <skills>",
    describe:
      "Update careerData.json with new skills. <skills> is a string with multiple values delimited by commas.",
    handler: (argv) => {
      const skillsArray = argv.skills.split(",");
      updateCareerData(skillsArray);
    },
  })
  .help().argv;
