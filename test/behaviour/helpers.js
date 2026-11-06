// Helpers for the behaviour tests. They run src/cli.js as a user would:
// type some lines, then read what it printed. They never import your
// functions, so they keep working when you change how the code is shaped.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const cliPath = path.join(root, 'src', 'cli.js');

// A new, empty database file for one test.
export function freshDbPath() {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'errands-test-'));
  return path.join(folder, 'errands.db');
}

// Type these lines into the tracker and return everything it printed,
// without the start-up and goodbye lines.
export function typeLines(lines, dbPath = freshDbPath()) {
  const result = spawnSync(process.execPath, [cliPath], {
    input: lines.join('\n') + '\nquit\n',
    env: { ...process.env, ERRANDS_DB: dbPath },
    encoding: 'utf8',
    timeout: 15000,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error('the tracker stopped with an error:\n' + result.stderr);
  }
  return result.stdout
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((line) => !line.startsWith('Data file:') && !line.startsWith('Errand tracker.') && line !== 'Bye.')
    .join('\n');
}

// Which module the code has reached: 2 (in memory), 3 (database), 4 (classes).
export function stage() {
  if (fs.existsSync(path.join(root, 'src', 'store.js'))) return 4;
  const source = fs.readFileSync(path.join(root, 'src', 'errands.js'), 'utf8');
  if (/export\s+(async\s+)?function\s+setup\b|export\s+(const|let)\s+setup\b|export\s*\{[^}]*\bsetup\b/.test(source)) return 3;
  return 2;
}

// Skip a test until the learner reaches its module, unless a capstone check
// says that module is required (then a skip would hide a missing piece).
export function needsStage(t, wanted) {
  const required = Number(process.env.CAPSTONE_STAGE || 0);
  if (stage() >= wanted) return false;
  if (required >= wanted) {
    throw new Error('this test needs module ' + wanted + ' work, and the capstone check requires it');
  }
  t.skip('module ' + wanted + ' not started yet');
  return true;
}

// The menu feature named in feature.json, or '' if none.
export function chosenFeature() {
  const file = path.join(root, 'feature.json');
  if (!fs.existsSync(file)) return '';
  try {
    return String(JSON.parse(fs.readFileSync(file, 'utf8')).feature || '');
  } catch {
    return 'unreadable';
  }
}
