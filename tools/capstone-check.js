// capstone-check.js: runs the required checks for one capstone.
// You can run it yourself before you tag: npm run capstone-2 (and so on).
// GitHub Actions runs the same checks when you push a capstone tag, and the
// capstone checker reads that result.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { git, githubRepo } from './git-info.js';
import { seedFor } from './seed.js';
import crypto from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const which = process.argv[2];
const results = [];

function record(id, passed, detail) {
  results.push({ id, passed, detail });
  // On a pass, show only counts; on a fail, show what to do.
  const show = detail && (!passed || /^\d/.test(detail));
  console.log((passed ? 'PASS  ' : 'FAIL  ') + id + (show ? ': ' + detail : ''));
}

// Run node --test on some files and report each file as one check.
function runTests(id, files, extraArgs = [], env = {}) {
  const result = spawnSync(process.execPath, ['--test', ...extraArgs, ...files], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...env },
    timeout: 120000,
  });
  const out = (result.stdout || '') + (result.stderr || '');
  const passMatch = out.match(/ℹ pass (\d+)/);
  const failMatch = out.match(/ℹ fail (\d+)/);
  const passed = result.status === 0;
  const firstFail = out.split('\n').find((line) => line.startsWith('✖')) || '';
  const counts = (passMatch ? passMatch[1] : '?') + ' passed, ' + (failMatch ? failMatch[1] : '?') + ' failed';
  record(id, passed, passed ? counts : counts + '; first failure: ' + firstFail.replace(/^✖\s*/, '').replace(/\s*\([\d.]+ms\)$/, ''));
  return { passed, out };
}

function read(rel) {
  const file = path.join(root, rel);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
}

// The first argument of every .prepare( or .exec( call, as written.
function sqlArguments(rawSource) {
  // Comments may show a bad example; only the code counts.
  const source = rawSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1');
  const found = [];
  const pattern = /\.(prepare|exec)\s*\(/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    let i = pattern.lastIndex;
    let depth = 0;
    let quote = null;
    let text = '';
    for (; i < source.length; i++) {
      const ch = source[i];
      if (quote) {
        text += ch;
        if (ch === '\\') { text += source[i + 1]; i++; continue; }
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === "'" || ch === '"' || ch === '`') { quote = ch; text += ch; continue; }
      if (ch === '(') depth++;
      if (ch === ')') { if (depth === 0) break; depth--; }
      if (ch === ',' && depth === 0) break;
      text += ch;
    }
    found.push(text.trim());
  }
  return found;
}

function isOneSqlString(arg) {
  const single = /^'([^'\\]|\\.)*'$/.test(arg) || /^"([^"\\]|\\.)*"$/.test(arg);
  const template = /^`[^`]*`$/.test(arg) && !arg.includes('${');
  return single || template;
}

function checkTagCommit(tag) {
  if (!process.env.GITHUB_REF_NAME) return;
  record('tag-annotated', git(['cat-file', '-t', tag]) === 'tag', 'the tag must be made with git tag -a');
}

// Lines that come from the BUGLOG.md template itself. They never count as the learner's words.
const TEMPLATE_LINES = new Set([
  '1.', '2.', '3.', '1. Symptom:', '3. Cause (file and line):',
]);

// How many words the learner wrote under one bold heading, up to the next bold heading.
// The heading may put its colon inside or outside the bold: **Expected:** or **Expected** (...):
function ownWordsUnder(section, heading) {
  const lines = section.split('\n');
  const start = lines.findIndex((line) => new RegExp('^\\*\\*' + heading, 'i').test(line.trim()));
  if (start === -1) return 0;
  // Text on the heading line after the bold part, minus a template note in brackets.
  const first = lines[start].trim().replace(/^\*\*[^*]+\*\*/, '').replace(/^\s*\([^)]*\)/, '').replace(/^[\s:]+/, '');
  const body = [first];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^\*\*[^*]+\*\*/.test(line) || /^## /.test(line)) break;
    if (!TEMPLATE_LINES.has(line)) body.push(line);
  }
  return body.join(' ').split(/\s+/).filter((word) => /[A-Za-z0-9]/.test(word)).length;
}

function capstone1() {
  const log = read('bug-hunt/BUGLOG.md');
  if (log === null) return record('buglog-exists', false, 'bug-hunt/BUGLOG.md is missing');
  const chosenLine = log.match(/^chosen:\s*(.+)$/im);
  const chosen = chosenLine ? chosenLine[1].toUpperCase().match(/\b[B-E]\b/g) || [] : [];
  const unique = [...new Set(chosen)];
  record('buglog-chosen', unique.length === 3, 'the first line should say which three of B, C, D and E you traced, for example: chosen: B, D, E');
  // Each chosen bug needs its own section with the log's headings, each followed by
  // at least a few words of the learner's own (the template's own lines do not count).
  const headings = ['Steps to reproduce', 'Expected', 'Actual', 'Cause chain'];
  for (const bug of unique) {
    const section = log.split(/^## /m).find((part) => part.toUpperCase().startsWith('BUG ' + bug));
    const missing = section ? headings.filter((h) => ownWordsUnder(section, h) < 3) : headings;
    record('buglog-section-' + bug, Boolean(section) && missing.length === 0,
      section ? 'the "## Bug ' + bug + '" section needs your own words under: ' + missing.join(', ') : 'add a "## Bug ' + bug + '" section with the headings from the template');
  }
  const pattern = ['A', ...unique].map((bug) => 'bug ' + bug + ':').join('|');
  runTests('bug-tests', ['bug-hunt/bugs.test.js'], ['--test-name-pattern=' + pattern]);
  const repo = githubRepo();
  if (repo) {
    const seed = seedFor(repo.owner);
    const ownOutput = seed.errands.some((text) => log.includes(text));
    const traceLine = /^\s*\[trace\] [A-Za-z]+: \{/m.test(log);
    record('own-output', ownOutput && traceLine, 'the log should paste your own tracker output (with your sample errands) and at least one real [trace] line, such as [trace] formatList: {...}');
  } else {
    record('own-output', false, 'cannot tell which GitHub repository this is');
  }
}

function capstone2() {
  runTests('lab-2.10', ['test/labs/lab-2.10.test.js']);
  runTests('lab-2.12', ['test/labs/lab-2.12.test.js']);
  runTests('behaviour', ['test/behaviour/*.test.js'], [], { CAPSTONE_STAGE: '2' });
  const tracked = git(['ls-files', 'node_modules']);
  record('no-packages', tracked === '', 'node_modules should not be in the repository');
}

function capstone3() {
  runTests('lab-3.8', ['test/labs/lab-3.8.test.js']);
  runTests('lab-3.10', ['test/labs/lab-3.10.test.js']);
  runTests('behaviour', ['test/behaviour/*.test.js'], [], { CAPSTONE_STAGE: '3' });
  const bad = [];
  for (const file of fs.readdirSync(path.join(root, 'src')).filter((f) => f.endsWith('.js'))) {
    for (const arg of sqlArguments(read('src/' + file))) {
      if (!isOneSqlString(arg)) bad.push(file + ': ' + arg.slice(0, 60));
    }
  }
  record('sql-written-in-place', bad.length === 0, bad.length === 0 ? '' : 'write the SQL right inside prepare(...) as one string with ? for values; found ' + bad.join('; '));
  record('data-not-committed', git(['ls-files', 'data']) === '', 'data/ should not be in the repository');
}

function capstone4() {
  runTests('lab-4.7', ['test/labs/lab-4.7.test.js']);
  runTests('lab-4.9', ['test/labs/lab-4.9.test.js']);
  runTests('behaviour', ['test/behaviour/*.test.js'], [], { CAPSTONE_STAGE: '4' });
  const mineDir = path.join(root, 'test', 'mine');
  const mineFiles = fs.existsSync(mineDir) ? fs.readdirSync(mineDir).filter((f) => f.endsWith('.test.js')) : [];
  let testCount = 0;
  for (const file of mineFiles) {
    testCount += (fs.readFileSync(path.join(mineDir, file), 'utf8').match(/^\s*(test|it)\(/gm) || []).length;
  }
  record('own-tests-count', testCount >= 3, testCount + ' test(...) calls found in test/mine/; at least 3 are needed');
  const brokenSource = path.join(root, 'tools', 'broken', 'errand.js');
  if (!fs.existsSync(brokenSource)) return record('own-tests-catch-broken-rule', false, 'course file tools/broken/errand.js is missing: copy it back from the template');
  if (mineFiles.length === 0) return;
  const mine = mineFiles.map((f) => 'test/mine/' + f);
  runTests('own-tests-pass', mine);
  // Copy the project, swap in an Errand that accepts empty text, and run the
  // learner's tests again: at least one should now fail.
  const copy = fs.mkdtempSync(path.join(os.tmpdir(), 'broken-errand-'));
  fs.cpSync(root, copy, { recursive: true, filter: (src) => !src.includes(path.sep + '.git') && !src.includes(path.sep + 'node_modules') });
  fs.copyFileSync(brokenSource, path.join(copy, 'src', 'errand.js'));
  const broken = spawnSync(process.execPath, ['--test', ...mine], { cwd: copy, encoding: 'utf8', timeout: 120000 });
  record('own-tests-catch-broken-rule', broken.status !== 0, 'with an Errand that accepts empty text, at least one of your tests should fail');
}

// The recorded change for gate 4.12: one of ten small changes, picked from the
// GitHub owner's name, so each learner gets one and cannot choose it.
const RECORDED_CHANGES = [
  'list shows done errands last',
  'refuse errand text longer than 80 characters',
  'refuse an 11th open errand',
  'refuse an errand whose text matches an open one, ignoring case',
  'a done errand cannot be deleted',
  'search needs at least 2 letters',
  'search shows the newest match first',
  'add says how many errands are open',
  'refuse errand text that contains #',
  'delete says how many errands are left',
];

function recordedChange() {
  const repo = githubRepo();
  if (!repo) return null;
  const hash = crypto.createHash('sha256').update(String(repo.owner).toLowerCase() + ':recorded-change').digest();
  const n = hash.readUInt32BE(0) % RECORDED_CHANGES.length;
  return (n + 1) + '. ' + RECORDED_CHANGES[n];
}

const steps = { 'capstone-1': capstone1, 'capstone-2': capstone2, 'capstone-3': capstone3, 'capstone-4': capstone4 };
if (!steps[which]) {
  console.log('Say which capstone, for example: node tools/capstone-check.js capstone-2');
  process.exit(1);
}
console.log('Checking ' + which);
checkTagCommit(which);
steps[which]();
const failed = results.filter((r) => !r.passed);
fs.writeFileSync(path.join(os.tmpdir(), which + '-results.json'), JSON.stringify(results, null, 2));
console.log('');
console.log(failed.length === 0 ? 'All required checks passed.' : failed.length + ' check(s) failed. Fix the first FAIL line first.');
if (which === 'capstone-4' && failed.length === 0) {
  const change = recordedChange();
  if (change) console.log('Your recorded change for gate 4.12: ' + change + '. Chapter 4.12 says how to make and record it.');
}
process.exitCode = failed.length === 0 ? 0 : 1;
