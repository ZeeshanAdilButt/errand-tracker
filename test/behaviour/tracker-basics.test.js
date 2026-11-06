// Module 2 on: add, list, search and done, including the five module 1 bugs.

import test from 'node:test';
import assert from 'node:assert/strict';
import { typeLines } from './helpers.js';

test('add then list shows each errand and the right count', () => {
  const out = typeLines(['add Buy rice', 'add Pay the bill', 'add Call Sara', 'list']);
  assert.match(out, /Added #1: Buy rice/);
  assert.match(out, /#1 \[ \] Buy rice/);
  assert.match(out, /#3 \[ \] Call Sara/);
  assert.match(out, /You have 3 errands/);
});

test('one errand says errand, not errands', () => {
  assert.match(typeLines(['add Buy rice', 'list']), /You have 1 errand$/m);
});

test('an empty list says so', () => {
  assert.match(typeLines(['list']), /No errands yet\./);
});

test('search ignores upper and lower case', () => {
  const out = typeLines(['add Buy rice', 'add Pay the bill', 'search RICE']);
  assert.match(out, /#1 \[ \] Buy rice\n1 found/);
});

test('search with no match says so', () => {
  assert.match(typeLines(['add Buy rice', 'search milk']), /No errands match "milk"\./);
});

test('done ticks only the errand with that id', () => {
  const out = typeLines(['add Buy rice', 'add Pay the bill', 'add Call Sara', 'done 2', 'list']);
  assert.match(out, /Done #2: Pay the bill/);
  assert.match(out, /#1 \[ \] Buy rice/);
  assert.match(out, /#2 \[x\] Pay the bill/);
  assert.match(out, /#3 \[ \] Call Sara/);
});

test('done on an id that does not exist says so', () => {
  assert.match(typeLines(['add Buy rice', 'done 9']), /No errand #9\./);
});

test('done twice says it is already done', () => {
  assert.match(typeLines(['add Buy rice', 'done 1', 'done 1']), /already done/);
});

test('an errand made only of spaces is refused', () => {
  const out = typeLines(['add    ', 'list']);
  assert.match(out, /cannot be empty/);
  assert.match(out, /No errands yet\./);
});
