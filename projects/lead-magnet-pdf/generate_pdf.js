const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const DIR = __dirname;
const HTML_PATH = path.join(DIR, 'output.html');
const PDF_PATH = path.join(DIR, '5-Step-Client-Conversion-System.pdf');

async function generatePDF() {
  console.log('Launching headless Chrome...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Set viewport to letter size at 96dpi
  await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 2 });

  const fileUrl = `file://${HTML_PATH}`;
  console.log(`Loading: ${fileUrl}`);

  await page.goto(fileUrl, {
    waitUntil: 'networkidle0',  // Wait for Google Fonts to fully load
    timeout: 60000,
  });

  // Extra wait for fonts to settle
  await new Promise(r => setTimeout(r, 2000));

  console.log('Generating PDF...');

  await page.pdf({
    path: PDF_PATH,
    format: 'Letter',
    printBackground: true,  // Critical: renders background colors/gradients
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    displayHeaderFooter: false,
  });

  await browser.close();

  const stats = fs.statSync(PDF_PATH);
  const mb = (stats.size / 1024 / 1024).toFixed(1);
  console.log(`\n✓ PDF generated: ${PDF_PATH}`);
  console.log(`  File size: ${mb} MB`);
  console.log(`\n  Open with: open "${PDF_PATH}"`);
}

generatePDF().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
