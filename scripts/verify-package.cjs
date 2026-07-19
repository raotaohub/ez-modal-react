const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const packageJson = require(path.join(root, 'package.json'));
const cjs = fs.readFileSync(path.join(root, 'dist/index.js'), 'utf8');
const esm = fs.readFileSync(path.join(root, 'dist/index.mjs'), 'utf8');
const declarations = fs.readFileSync(path.join(root, 'dist/index.d.ts'), 'utf8');

for (const [format, output] of [
  ['CJS', cjs],
  ['ESM', esm],
]) {
  assert.match(output, /^(['"])use client\1;/, `${format} output must start with the use client directive`);
  assert.doesNotMatch(output, /react\/jsx-runtime/, `${format} output must support the React 16.8 classic JSX runtime`);
}

assert.equal(packageJson.version, '2.0.0-alpha.0');
assert.equal(packageJson.exports['.'].default, './dist/index.mjs');
assert.match(declarations, /createEasyModal/);
assert.match(declarations, /ReactElement \| null/);
assert.doesNotMatch(declarations, /JSX\.Element/);

console.log('Package artifacts verified successfully.');
