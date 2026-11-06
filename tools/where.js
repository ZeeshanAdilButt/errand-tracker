// where.js: where am I, and what is next?
// Run it with: npm run where

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { git } from './git-info.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// The steps in order. A lab is done when its tests pass. A capstone is done
// when its annotated tag exists on this laptop (GitHub Actions then checks it).
const steps = [
  { chapter: '1.13', name: 'Lab 1.13: trace your first bug', files: ['bug-hunt/bugs.test.js'], pattern: 'bug A:', reread: '1.11 and 1.12' },
  { chapter: '1.15', name: 'Capstone 1: the bug log', capstone: 1 },
  { chapter: '2.10', name: 'Lab 2.10: add and list', files: ['test/labs/lab-2.10.test.js'], reread: '2.3, 2.5 and 2.6' },
  { chapter: '2.12', name: 'Lab 2.12: search and done', files: ['test/labs/lab-2.12.test.js'], reread: '2.6 and 2.7' },
  { chapter: '2.14', name: 'Capstone 2: errand tracker v1', capstone: 2 },
  { chapter: '3.8', name: 'Lab 3.8: make the table and save', files: ['test/labs/lab-3.8.test.js'], reread: '3.2, 3.5 and 3.6' },
  { chapter: '3.10', name: 'Lab 3.10: search, done and delete', files: ['test/labs/lab-3.10.test.js'], reread: '3.3, 3.4 and 3.6' },
  { chapter: '3.12', name: 'Capstone 3: errand tracker v2', capstone: 3 },
  { chapter: '4.7', name: 'Lab 4.7: the Errand class in your app', files: ['test/labs/lab-4.7.test.js'], reread: '4.3 and 4.4' },
  { chapter: '4.9', name: 'Lab 4.9: the ErrandStore class', files: ['test/labs/lab-4.9.test.js'], reread: '4.2 and 4.3' },
  { chapter: '4.11', name: 'Capstone 4: errand tracker v3', capstone: 4 },
];

function passes(step) {
  const args = ['--test'];
  if (step.pattern) args.push('--test-name-pattern=' + step.pattern);
  const result = spawnSync(process.execPath, [...args, ...step.files], { cwd: root, encoding: 'utf8', timeout: 120000 });
  const firstFail = ((result.stdout || '').split('\n').find((l) => l.startsWith('✖')) || '').replace(/^✖\s*/, '').replace(/\s*\([\d.]+ms\)$/, '');
  return { ok: result.status === 0, firstFail };
}

function tagged(n) {
  return git(['cat-file', '-t', 'capstone-' + n]) === 'tag';
}

// Which module the code has reached. A later module changes the earlier labs'
// functions on purpose, so their tests are no longer expected to pass.
function stage() {
  if (fs.existsSync(path.join(root, 'src', 'store.js')) || fs.existsSync(path.join(root, 'src', 'errand.js'))) return 4;
  const errandsFile = path.join(root, 'src', 'errands.js');
  if (!fs.existsSync(errandsFile)) return 2;
  const source = fs.readFileSync(errandsFile, 'utf8');
  if (/export\s+(async\s+)?function\s+setup\b|export\s+(const|let)\s+setup\b|export\s*\{[^}]*\bsetup\b/.test(source)) return 3;
  return 2;
}
const reached = stage();

let next = null;
for (const step of steps) {
  const module = Number(step.chapter.split('.')[0]);
  if (step.capstone) {
    const ok = tagged(step.capstone);
    console.log((ok ? 'done  ' : 'todo  ') + step.name + (ok ? ' (tag capstone-' + step.capstone + ' made)' : ''));
    if (!ok) {
      next = { step };
      break;
    }
    continue;
  }
  if (module >= 2 && module < reached) {
    console.log('done  ' + step.name + ' (your code has moved on to module ' + reached + ')');
    continue;
  }
  const { ok, firstFail } = passes(step);
  console.log((ok ? 'done  ' : 'todo  ') + step.name);
  if (!ok) {
    next = { step, firstFail };
    break;
  }
}

console.log('');
if (next && next.step.capstone) {
  const n = next.step.capstone;
  console.log('Next: ' + next.step.name + ' (chapter ' + next.step.chapter + ').');
  console.log('Run npm run capstone-' + n + ' until every line says PASS, then make and push the tag as the chapter shows, and check it with npm run check-tag -- capstone-' + n + '.');
} else if (next) {
  console.log('Next: ' + next.step.name + ' (chapter ' + next.step.chapter + ').');
  if (/\.test\.js$/.test(next.firstFail)) {
    console.log('The lab test file could not start: a function it needs is not written or not exported yet.');
  } else {
    console.log('First test that does not pass yet: ' + next.firstFail);
  }
  console.log('Stuck? Reread ' + (next.step.reread.includes(' and ') ? 'chapters ' : 'chapter ') + next.step.reread + ', then run npm run lab-' + next.step.chapter + ' and read its first failing line.');
} else {
  console.log('Every lab and capstone is done. Finish the gate in chapter 4.12.');
}

const changed = git(['status', '--porcelain']).split('\n').filter(Boolean).length;
if (changed > 0) console.log(changed + ' file(s) changed since your last commit. Commit when a step works.');
const tags = git(['tag', '--list', 'capstone-*']).split('\n').filter(Boolean);
console.log('Capstone tags on this laptop: ' + (tags.length ? tags.join(', ') : 'none yet'));
if (!fs.existsSync(path.join(root, 'bug-hunt', 'seed.json'))) console.log('Run npm run doctor once: it writes your seed.');
