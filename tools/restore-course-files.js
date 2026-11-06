// restore-course-files.js: copies the course's own files over your copy
// before the capstone checks run in GitHub Actions. The workflow runs the
// version of this script from the course template, not from your repository,
// so editing a supplied test or tool changes nothing in the check.
//
// Usage: node <template>/tools/restore-course-files.js <template folder> <your folder>

import fs from 'node:fs';
import path from 'node:path';

export const COURSE_FILES = [
  'package.json',
  'src/cli.js',
  'bug-hunt/bugs.test.js',
  'experiments/glued.js',
  'tools/',
  'test/behaviour/',
  'test/labs/',
];

const [from, to] = process.argv.slice(2);
if (!from || !to) {
  console.log('Usage: node tools/restore-course-files.js <template folder> <your folder>');
  process.exit(1);
}

let changed = 0;
function copy(rel) {
  const source = path.join(from, rel);
  const target = path.join(to, rel);
  if (fs.statSync(source).isDirectory()) {
    for (const name of fs.readdirSync(source)) copy(path.join(rel, name));
    return;
  }
  const before = fs.existsSync(target) ? fs.readFileSync(target) : null;
  const after = fs.readFileSync(source);
  if (before === null || !before.equals(after)) {
    changed = changed + 1;
    console.log((before === null ? 'added    ' : 'restored ') + rel);
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, after);
}

for (const rel of COURSE_FILES) copy(rel);
console.log(changed === 0 ? 'Every course file was already the same as the template.' : changed + ' course file(s) put back from the template.');
