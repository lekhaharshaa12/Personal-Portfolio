const fs = require('fs');
const path = require('path');

const root = __dirname;
const templatePath = path.join(root, 'index.template.html');
const fallbackTemplate = path.join(root, 'index.html');
const outDir = path.join(root, 'public');

if (!fs.existsSync(templatePath)) {
  if (fs.existsSync(fallbackTemplate)) {
    fs.copyFileSync(fallbackTemplate, templatePath);
    console.log('Created index.template.html from existing index.html');
  } else {
    console.error('No template or index.html found to build from');
    process.exit(1);
  }
}

let html = fs.readFileSync(templatePath, 'utf8');

const sections = ['hero', 'about', 'projects', 'contact'];
for (const s of sections) {
  const secPath = path.join(root, 'sections', `${s}.html`);
  if (!fs.existsSync(secPath)) {
    console.warn('Missing section:', secPath);
    continue;
  }
  const secHtml = fs.readFileSync(secPath, 'utf8').trim();
  const re = new RegExp(`<div\\s+[^>]*id="${s}-container"[^>]*>[\\s\\S]*?<\\/div>`, 'i');
  if (re.test(html)) {
    html = html.replace(re, secHtml);
    console.log(`Inlined section: ${s}`);
  } else {
    console.warn(`Container for ${s} not found in template`);
  }
}

// Ensure output directory
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

// Write final index.html to public/
const outPath = path.join(outDir, 'index.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log('Wrote', outPath);

// Copy assets/ and styles.css if they exist
function copyRecursive(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);
    for (const f of fs.readdirSync(src)) {
      copyRecursive(path.join(src, f), path.join(dest, f));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

const assetsSrc = path.join(root, 'assets');
const assetsDest = path.join(outDir, 'assets');
if (fs.existsSync(assetsSrc)) {
  copyRecursive(assetsSrc, assetsDest);
  console.log('Copied assets to public/assets');
}

const stylesSrc = path.join(root, 'styles.css');
const stylesDest = path.join(outDir, 'styles.css');
if (fs.existsSync(stylesSrc)) {
  fs.copyFileSync(stylesSrc, stylesDest);
  console.log('Copied styles.css to public/');
}

console.log('Build complete');
process.exit(0);
