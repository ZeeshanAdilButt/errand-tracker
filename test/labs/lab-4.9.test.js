// Lab 4.9: the ErrandStore class. Run with: npm run lab-4.9

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ErrandStore } from '../../src/store.js';
import { Errand } from '../../src/errand.js';

const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'lab-4.9-'));
const store = new ErrandStore(path.join(folder, 'errands.db'));

test('add: returns an Errand with the new id', () => {
  const errand = store.add('Buy rice');
  assert.ok(errand instanceof Errand);
  assert.equal(errand.getId(), 1);
  assert.equal(errand.getText(), 'Buy rice');
  store.add('Pay the bill');
  store.add("Call Ali's shop");
});

test('add: refuses empty text and saves nothing', () => {
  assert.throws(() => store.add('   '), /cannot be empty/);
  assert.equal(store.all().length, 3);
});

test('all and get: give Errand objects', () => {
  assert.deepEqual(store.all().map((e) => e.toLine()), ['#1 [ ] Buy rice', '#2 [ ] Pay the bill', "#3 [ ] Call Ali's shop"]);
  assert.equal(store.get(2).getText(), 'Pay the bill');
  assert.equal(store.get(99), undefined);
});

test('save: keeps a change made on the Errand', () => {
  const errand = store.get(2);
  errand.markDone();
  store.save(errand);
  assert.equal(store.get(2).isDone(), true);
  assert.deepEqual(store.byDone(true).map((e) => e.getId()), [2]);
  assert.deepEqual(store.byDone(false).map((e) => e.getId()), [1, 3]);
});

test('search: in SQL, any case, quotes are fine', () => {
  assert.deepEqual(store.search('RICE').map((e) => e.getId()), [1]);
  assert.deepEqual(store.search("ali's").map((e) => e.getId()), [3]);
});

test('remove: the errand is gone', () => {
  store.remove(1);
  assert.equal(store.get(1), undefined);
});

test('errands.js holds no SQL and uses the store', () => {
  const source = fs.readFileSync(new URL('../../src/errands.js', import.meta.url), 'utf8');
  // Comments may mention SQL words; only the code counts.
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  assert.ok(/from ['"]\.\/store\.js['"]/.test(code), "errands.js should import from './store.js'");
  assert.ok(!/\.(prepare|exec)\(|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE FROM\b/.test(code), 'errands.js should not contain SQL any more: move it into store.js');
  assert.equal(fs.existsSync(new URL('../../src/db.js', import.meta.url)), false, 'db.js should be gone: its work moved into store.js');
});
