// Module 3 on: delete, text with a quote, and errands that survive a restart.

import test from 'node:test';
import assert from 'node:assert/strict';
import { typeLines, freshDbPath, needsStage } from './helpers.js';

test('errands are still there after the tracker stops and starts again', (t) => {
  if (needsStage(t, 3)) return;
  const db = freshDbPath();
  typeLines(['add Buy rice', 'add Pay the bill', 'done 2'], db);
  const out = typeLines(['list'], db);
  assert.match(out, /#1 \[ \] Buy rice\n#2 \[x\] Pay the bill\nYou have 2 errands/);
});

test('delete removes one errand', (t) => {
  if (needsStage(t, 3)) return;
  const out = typeLines(['add Buy rice', 'add Pay the bill', 'delete 1', 'list', 'delete 1']);
  assert.match(out, /Deleted #1: Buy rice/);
  assert.match(out, /#2 \[ \] Pay the bill\nYou have 1 errand/);
  assert.match(out, /No errand #1\./);
});

test('text with a quote in it is saved and found', (t) => {
  if (needsStage(t, 3)) return;
  const db = freshDbPath();
  typeLines(["add Call Ali's shop"], db);
  const out = typeLines(["search ali's"], db);
  assert.match(out, /#1 \[ \] Call Ali's shop\n1 found/);
});
