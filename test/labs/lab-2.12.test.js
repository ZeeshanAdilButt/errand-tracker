// Lab 2.12: search and done. Run with: npm run lab-2.12

import test from 'node:test';
import assert from 'node:assert/strict';
import { searchErrands, countOpen, add, search, done, list } from '../../src/errands.js';

const sample = [
  { id: 1, text: 'Buy rice', done: false },
  { id: 2, text: 'Buy brown bread', done: true },
  { id: 3, text: 'Pay the bill', done: false },
];

test('searchErrands: finds text in any case', () => {
  assert.deepEqual(searchErrands(sample, 'BUY').map((e) => e.id), [1, 2]);
});

test('searchErrands: no match gives an empty list', () => {
  assert.deepEqual(searchErrands(sample, 'milk'), []);
});

test('searchErrands: an empty list stays empty', () => {
  assert.deepEqual(searchErrands([], 'rice'), []);
});

test('countOpen: counts errands that are not done', () => {
  assert.equal(countOpen(sample), 2);
  assert.equal(countOpen([]), 0);
});

test('search: lines for the matches, then how many', () => {
  add('Buy rice');
  add('Pay the bill');
  assert.equal(search('rice'), '#1 [ ] Buy rice\n1 found');
  assert.equal(search('milk'), 'No errands match "milk".');
});

test('done: ticks the errand with that id, typed as text', () => {
  assert.equal(done('2'), 'Done #2: Pay the bill');
  assert.equal(list(''), '#1 [ ] Buy rice\n#2 [x] Pay the bill\nYou have 2 errands');
});

test('done: an id that does not exist', () => {
  assert.equal(done('9'), 'No errand #9.');
});

test('done: twice says it is already done', () => {
  assert.match(done('2'), /already done/);
});
