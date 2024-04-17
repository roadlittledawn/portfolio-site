const fs = require("fs");
const { promisify } = require("util");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const path = require("path");
const TurndownService = require("turndown");

const writeFileAsync = promisify(fs.writeFile);

function sortListAlphabetically(cheerio, elem) {
  const listItems = cheerio(elem).children('li').toArray();
  
  // Sort list items by text content
  listItems.sort((a, b) => cheerio(a).text().localeCompare(cheerio(b).text()));
  
  // Clear the current contents of the <ul>
  cheerio(elem).empty();
  
  // Append the sorted items back to the <ul>
  listItems.forEach(item => cheerio(elem).append(item));
}

async function fetchHTMLAndConvertToMarkdown() {
  try {
    // Must run `yarn build && yarn serve` first
    const response = await fetch("http://localhost:9000/resume?embed=true");
    const html = await response.text();

    // Load the HTML into cheerio
    const $ = cheerio.load(html);

    // // Remove all embedded style elements
    $("style").remove();

    $('ul[data-sort-alpha="true"]').each((i, elem) => sortListAlphabetically($, elem));

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
