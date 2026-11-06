// Lab 2.10: add and list. Run with: npm run lab-2.10

import test from 'node:test';
import assert from 'node:assert/strict';
import { formatErrand, formatList, add, list } from '../../src/errands.js';

test('formatErrand: an open errand', () => {
  assert.equal(formatErrand({ id: 1, text: 'Buy rice', done: false }), '#1 [ ] Buy rice');
});

test('formatErrand: a done errand has a tick', () => {
  assert.equal(formatErrand({ id: 4, text: 'Pay the bill', done: true }), '#4 [x] Pay the bill');
});

test('formatList: one line per errand, then the count', () => {
  const text = formatList([
    { id: 1, text: 'Buy rice', done: false },
    { id: 2, text: 'Pay the bill', done: true },
  ]);
  assert.equal(text, '#1 [ ] Buy rice\n#2 [x] Pay the bill\nYou have 2 errands');
});

test('formatList: one errand says errand', () => {
  assert.equal(formatList([{ id: 1, text: 'Buy rice', done: false }]), '#1 [ ] Buy rice\nYou have 1 errand');
});

test('formatList: an empty list', () => {
  assert.equal(formatList([]), 'No errands yet.');
});

test('add: gives each errand the next id and says what it added', () => {
  assert.equal(add('Buy rice'), 'Added #1: Buy rice');
  assert.equal(add('  Pay the bill  '), 'Added #2: Pay the bill');
});

test('add: refuses empty text and text made of spaces', () => {
  assert.match(add(''), /cannot be empty/);
  assert.match(add('   '), /cannot be empty/);
});

test('list: shows what add added', () => {
  assert.equal(list(''), '#1 [ ] Buy rice\n#2 [ ] Pay the bill\nYou have 2 errands');
});
