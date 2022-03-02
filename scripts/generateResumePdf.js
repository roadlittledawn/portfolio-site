const htmlToPdf = require("html-pdf-node");
const fs = require("fs");
const path = require("path");

// https://www.npmjs.com/package/html-pdf-node

const options = { format: "A4", printBackground: true };

const file = { url: "https://clintonlangosch.com/resume/?embed=true" };

htmlToPdf.generatePdf(file, options).then((pdfBuffer) => {
  console.log("PDF Buffer:-", pdfBuffer);
  fs.writeFileSync(
    path.join(process.cwd(), "src/files/resume-eng.pdf"),
    pdfBuffer
  );
});
