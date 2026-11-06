// Capstone 2 on: the one menu feature named in feature.json.

import test from 'node:test';
import assert from 'node:assert/strict';
import { typeLines, chosenFeature } from './helpers.js';

const feature = chosenFeature();
const required = Number(process.env.CAPSTONE_STAGE || 0) >= 2;

test('feature.json names one menu feature', { skip: !required && feature === '' }, () => {
  assert.ok(['count', 'undo', 'edit'].includes(feature), 'feature.json should hold {"feature": "count"}, "undo" or "edit". It holds: ' + (feature || 'nothing'));
});

test('count: open and done totals', { skip: feature !== 'count' }, () => {
  const out = typeLines(['add Buy rice', 'add Pay the bill', 'add Call Sara', 'done 2', 'count']);
  assert.match(out, /Open: 2, done: 1/);
  // A second case with other numbers, so a fixed answer does not pass.
  const other = typeLines(['add Buy rice', 'add Pay the bill', 'add Call Sara', 'add Fix the tap', 'done 1', 'done 3', 'done 4', 'count']);
  assert.match(other, /Open: 1, done: 3/);
});

test('undo: a done errand is open again', { skip: feature !== 'undo' }, () => {
  const out = typeLines(['add Buy rice', 'done 1', 'undo 1', 'list', 'undo 1']);
  assert.match(out, /Undo #1: Buy rice/);
  assert.match(out, /#1 \[ \] Buy rice/);
  assert.match(out, /not done/);
});

test('edit: new text, and empty text refused', { skip: feature !== 'edit' }, () => {
  const out = typeLines(['add Buy rice', 'edit 1 Buy brown rice', 'list', 'edit 1    ', 'edit 7 Something']);
  assert.match(out, /Edited #1: Buy brown rice/);
  assert.match(out, /#1 \[ \] Buy brown rice/);
  assert.match(out, /cannot be empty/);
  assert.match(out, /No errand #7\./);
});
