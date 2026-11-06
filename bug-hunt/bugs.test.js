// One test per planted bug. Each test fails until its bug is fixed.
// npm run capstone-1 runs bug A and the three bugs named in BUGLOG.md.

import test from 'node:test';
import assert from 'node:assert/strict';
import { formatErrand, formatList, addErrand, searchErrands, markDone } from './tracker-v0.js';

function threeErrands() {
  return [
    { id: 1, text: 'Buy rice', done: false },
    { id: 2, text: 'Pay the electricity bill', done: false },
    { id: 3, text: 'Return the library book', done: false },
  ];
}

test('bug A: list says how many errands there are', () => {
  const text = formatList(threeErrands());
  assert.ok(text.includes('You have 3 errands'), 'expected "You have 3 errands" in:\n' + text);
});

test('bug B: search ignores upper and lower case', () => {
  const found = searchErrands(threeErrands(), 'Rice');
  assert.equal(found.length, 1, 'search for "Rice" should find "Buy rice"');
});

test('bug C: done ticks only the errand with that id', () => {
  const errands = threeErrands();
  markDone(errands, 2);
  assert.deepEqual(errands.map((e) => [e.id, e.done]), [[1, false], [2, true], [3, false]]);
});

test('bug D: an errand made only of spaces is refused', () => {
  const errands = threeErrands();
  const answer = addErrand(errands, 4, '   ');
  assert.equal(errands.length, 3, 'the blank errand should not be added');
  assert.ok(answer.includes('cannot be empty'));
});

test('bug E: a done errand shows a tick', () => {
  const line = formatErrand({ id: 1, text: 'Buy rice', done: true });
  assert.equal(line, '#1 [x] Buy rice');
});
