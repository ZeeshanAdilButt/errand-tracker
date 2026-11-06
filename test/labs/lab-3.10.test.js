// Lab 3.10: search, done and delete, safely. Run with: npm run lab-3.10

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { setup, add, search, done, remove, list } from '../../src/errands.js';

const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'lab-3.10-'));
const dbPath = path.join(folder, 'errands.db');
setup(dbPath);
add('Buy rice');
add('Pay the bill');
add("Call Ali's shop");

function doneInTable(id) {
  const db = new DatabaseSync(dbPath);
  const row = db.prepare('SELECT done FROM errands WHERE id = ?').get(id);
  db.close();
  return row === undefined ? undefined : row.done;
}

test('search: finds text in any case', () => {
  assert.equal(search('RICE'), '#1 [ ] Buy rice\n1 found');
});

test("search: text with a quote in it", () => {
  assert.equal(search("ali's"), "#3 [ ] Call Ali's shop\n1 found");
});

test('search: no match', () => {
  assert.equal(search('milk'), 'No errands match "milk".');
});

test('done: sets done to 1 in the table', () => {
  assert.equal(done('2'), 'Done #2: Pay the bill');
  assert.equal(doneInTable(2), 1);
  assert.equal(doneInTable(1), 0);
});

test('done: an id that does not exist', () => {
  assert.equal(done('9'), 'No errand #9.');
});

test('remove: deletes the row', () => {
  assert.equal(remove('1'), 'Deleted #1: Buy rice');
  assert.equal(doneInTable(1), undefined);
  assert.equal(remove('1'), 'No errand #1.');
});

test('list: what is left', () => {
  assert.equal(list(''), "#2 [x] Pay the bill\n#3 [ ] Call Ali's shop\nYou have 2 errands");
});
