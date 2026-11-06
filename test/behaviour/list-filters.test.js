// Capstone 2 on: list open and list done.
// Before capstone 2 (no feature.json yet) these tests skip, so npm test stays
// quiet during the labs. A capstone check always runs them.

import test from 'node:test';
import assert from 'node:assert/strict';
import { typeLines, chosenFeature } from './helpers.js';

const skip = chosenFeature() === '' && Number(process.env.CAPSTONE_STAGE || 0) < 2 ? 'capstone 2 not started yet (no feature.json)' : false;

test('list open shows only errands that are not done', { skip }, () => {
  const out = typeLines(['add Buy rice', 'add Pay the bill', 'add Call Sara', 'done 2', 'list open']);
  assert.match(out, /#1 \[ \] Buy rice\n#3 \[ \] Call Sara\nYou have 2 errands/);
});

test('list done shows only done errands', { skip }, () => {
  const out = typeLines(['add Buy rice', 'add Pay the bill', 'done 2', 'list done']);
  assert.match(out, /Done #2: Pay the bill\n#2 \[x\] Pay the bill\nYou have 1 errand/);
});

test('list done with nothing done says so', { skip }, () => {
  assert.match(typeLines(['add Buy rice', 'list done']), /No done errands\./);
});
