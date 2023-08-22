const fs = require("fs");
const { promisify } = require("util");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const path = require("path");
const TurndownService = require("turndown");

const writeFileAsync = promisify(fs.writeFile);

async function fetchHTMLAndConvertToMarkdown() {
  try {
    const response = await fetch("http://localhost:9000/resume?embed=true");
    const html = await response.text();

    // Load the HTML into cheerio
    const $ = cheerio.load(html);

    // // Remove all embedded style elements
    $("style").remove();

    // Find the div with attribute data-target-id="resume-page"
    const resumePageDiv = $(`[data-target-id="resume-page"]`);

    if (!resumePageDiv.length) {
      console.error(
        'Could not find div with attribute data-target-id="resume-page"'
      );
      return;
    }

    // Get the inner HTML of the selected div
    const resumePageHtml = resumePageDiv.html();

    // Convert HTML to Markdown
    const turndownService = new TurndownService();
    const markdownOutput = turndownService.turndown(resumePageHtml);

    // Write Markdown to a file
    await writeFileAsync(
      path.join(process.cwd(), "/src/files/resume.md"),
      markdownOutput
    );

    console.log("Markdown content has been written to resume.md");
  } catch (error) {
    console.error("Error:", error);
  }
}

fetchHTMLAndConvertToMarkdown();
