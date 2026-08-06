const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Fix 10: Missing null/undefined guards before .map() or .filter() calls
  // Be careful not to replace it if it already has ?. or is part of Object.keys().map
  // A simple regex approach: look for variables followed by .map( or .filter(
  // and replace with ?.map( or ?.filter(
  // This is a bit risky with regex, better to use it on known arrays, or just 
  // replace all .map( and .filter( with ?.map( and ?.filter( where preceded by variable name.
  
  content = content.replace(/([a-zA-Z0-9_\]\)])\.map\(/g, (match, p1) => {
    // Avoid changing Object.keys(map).map
    if (p1.endsWith('keys(map)')) return match;
    if (p1.endsWith(')')) return match;
    return `${p1}?.map(`;
  });

  content = content.replace(/([a-zA-Z0-9_\]\)])\.filter\(/g, (match, p1) => {
    if (p1.endsWith(')')) return match;
    return `${p1}?.filter(`;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function traverseDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      fixFile(fullPath);
    }
  });
}

traverseDir(srcPath);
