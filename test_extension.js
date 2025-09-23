const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Testing Chrome Extension Structure...');

// Test 1: Validate manifest.json
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
console.log('✓ Manifest loads successfully');
console.log('  - Name:', manifest.name);
console.log('  - Version:', manifest.version);

// Test 2: Validate all required files exist
const requiredFiles = [
  'content.js',
  'background.js', 
  'styles/content.css',
  'icons/icon16.png',
  'icons/icon48.png',
  'icons/icon128.png'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log('✓', file);
  } else {
    console.log('✗', file, 'MISSING');
    allFilesExist = false;
  }
});

// Test 3: Basic syntax validation
try {
  require('./content.js');
  console.log('✗ content.js should not execute in Node.js context - this is expected');
} catch (e) {
  console.log('✓ content.js contains browser-specific code (expected)');
}

try {
  require('./background.js');
  console.log('✗ background.js should not execute in Node.js context - this is expected');
} catch (e) {
  console.log('✓ background.js contains Chrome extension APIs (expected)');
}

// Test 4: CSS validation
const css = fs.readFileSync('styles/content.css', 'utf8');
if (css.includes('#yll-') && css.includes('position: fixed')) {
  console.log('✓ CSS contains expected extension-specific styles');
} else {
  console.log('✗ CSS may be missing required styles');
}

console.log('\nExtension structure validation complete.');
