const fs = require('fs');
const path = require('path');

const root = __dirname;
const templatePath = path.join(root, 'index.html');
const backupPath = path.join(root, 'index.template.html');

// Create a backup template if not present
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(templatePath, backupPath);
  console.log('Created index.template.html backup');
}

let html = fs.readFileSync(backupPath, 'utf8');

const sections = ['hero', 'about', 'projects', 'contact'];

for (const s of sections) {
  const secPath = path.join(root, 'sections', `${s}.html`);
  if (!fs.existsSync(secPath)) {
    console.warn('Missing section:', secPath);
    continue;
  }

  const secHtml = fs.readFileSync(secPath, 'utf8').trim();

  // Replace the entire container div (e.g. <div id="hero-container" ...>...</div>) with section HTML
  const re = new RegExp(`<div\\s+[^>]*id="${s}-container"[^>]*>[\\s\\S]*?<\\/div>`, 'i');
  if (re.test(html)) {
    html = html.replace(re, secHtml);
    console.log(`Inlined section: ${s}`);
  } else {
    console.warn(`Container for ${s} not found in template`);
  }
}

const outPath = path.join(root, 'index.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log('Wrote', outPath);

process.exit(0);
