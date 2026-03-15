const fs = require('fs');
const path = require('path');
const jade = require('jade');

const projectRoot = path.resolve(__dirname, '..');
const viewsDir = path.join(projectRoot, 'views');
const docsDir = path.join(projectRoot, 'docs');
const publicDir = path.join(projectRoot, 'public');

function emptyDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return;
  }

  for (const entry of fs.readdirSync(dirPath)) {
    const fullPath = path.join(dirPath, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      emptyDir(fullPath);
      fs.rmdirSync(fullPath);
    } else {
      fs.unlinkSync(fullPath);
    }
  }
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    return;
  }

  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function build() {
  emptyDir(docsDir);
  fs.mkdirSync(docsDir, { recursive: true });

  const html = jade.renderFile(path.join(viewsDir, 'index.jade'));

  // GitHub Pages project sites run under /<repo>/, so use relative asset paths.
  const pageHtml = html
    .replace(/href="\/styles\//g, 'href="./styles/')
    .replace(/src="\/images\//g, 'src="./images/');

  fs.writeFileSync(path.join(docsDir, 'index.html'), pageHtml, 'utf8');
  fs.writeFileSync(path.join(docsDir, '.nojekyll'), '', 'utf8');

  copyDir(path.join(publicDir, 'styles'), path.join(docsDir, 'styles'));
  copyDir(path.join(publicDir, 'images'), path.join(docsDir, 'images'));

  console.log('GitHub Pages build generated in docs/.');
}

build();
