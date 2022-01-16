const htmlToPdf = require("html-pdf-node");
const fs = require("fs");
const path = require("path");

// https://www.npmjs.com/package/html-pdf-node

let options = { format: "A4" };
// Example of options with args //
// let options = { format: 'A4', args: ['--no-sandbox', '--disable-setuid-sandbox'] };

const file = {
  content: fs.readFileSync(path.join(process.cwd(), "src/files/resume.html")),
};
// or
// const file = { url: "https://gitconnected.com/roadlittledawn/resume" };
htmlToPdf.generatePdf(file, options).then((pdfBuffer) => {
  console.log("PDF Buffer:-", pdfBuffer);
  fs.writeFileSync(
    path.join(process.cwd(), "src/files/resume-local.pdf"),
    pdfBuffer
  );
});
