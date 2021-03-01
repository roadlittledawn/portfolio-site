const fs = require("fs");
const fetch = require("node-fetch");

require("dotenv").config();

const fetchCareerData = async () => {
  try {
    const resp = await fetch(process.env.CAREER_DATA_API_URL);
    return resp.json();
  } catch (e) {}
};

const run = async () => {
  const data = await fetchCareerData();
  fs.writeFileSync(
    "./src/data/careerData.json",
    JSON.stringify(data, null, 2),
    "utf-8"
  );
};

run();
