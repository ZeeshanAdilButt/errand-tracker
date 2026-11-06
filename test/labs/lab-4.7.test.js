// Lab 4.7: the Errand class. Run with: npm run lab-4.7

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Errand } from '../../src/errand.js';

test('new Errand: keeps its id and text, starts open', () => {
  const errand = new Errand(1, 'Buy rice');
  assert.equal(errand.getId(), 1);
  assert.equal(errand.getText(), 'Buy rice');
  assert.equal(errand.isDone(), false);
});

test('new Errand: trims spaces from the text', () => {
  assert.equal(new Errand(1, '  Buy rice  ').getText(), 'Buy rice');
});

test('new Errand: refuses empty text', () => {
  assert.throws(() => new Errand(1, ''), /cannot be empty/);
  assert.throws(() => new Errand(1, '    '), /cannot be empty/);
});

test('the fields are private', () => {
  const errand = new Errand(1, 'Buy rice');
  assert.equal(errand.text, undefined);
  assert.equal(errand.done, undefined);
  assert.deepEqual(Object.keys(errand), []);
});

test('markDone: an open errand becomes done', () => {
  const errand = new Errand(2, 'Pay the bill');
  errand.markDone();
  assert.equal(errand.isDone(), true);
});

test('markDone: a done errand refuses', () => {
  const errand = new Errand(2, 'Pay the bill', true);
  assert.throws(() => errand.markDone(), /already done/);
});

test('toLine: the same line as before', () => {
  assert.equal(new Errand(1, 'Buy rice').toLine(), '#1 [ ] Buy rice');
  assert.equal(new Errand(2, 'Pay the bill', true).toLine(), '#2 [x] Pay the bill');
});

test('errands.js uses the Errand class', () => {
  const source = fs.readFileSync(new URL('../../src/errands.js', import.meta.url), 'utf8')
    + (fs.existsSync(new URL('../../src/store.js', import.meta.url)) ? fs.readFileSync(new URL('../../src/store.js', import.meta.url), 'utf8') : '')
    + (fs.existsSync(new URL('../../src/db.js', import.meta.url)) ? fs.readFileSync(new URL('../../src/db.js', import.meta.url), 'utf8') : '');
  assert.ok(/new Errand\(/.test(source), 'errands.js (or the file it uses) should make Errand objects with new Errand(...)');
});
