// Lab 3.8: make the table and save. Run with: npm run lab-3.8

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { setup, add, list } from '../../src/errands.js';

const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'lab-3.8-'));
const dbPath = path.join(folder, 'errands.db');

test('setup: creates the database file and the errands table', () => {
  setup(dbPath);
  assert.ok(fs.existsSync(dbPath), 'setup should create ' + dbPath);
  const db = new DatabaseSync(dbPath);
  const columns = db.prepare('SELECT name FROM pragma_table_info(?)').all('errands').map((c) => c.name);
  db.close();
  assert.deepEqual(columns.sort(), ['created_at', 'done', 'id', 'text']);
});

test('setup: running it twice keeps the table and its rows', () => {
  add('Buy rice');
  setup(dbPath);
  assert.match(list(''), /#1 \[ \] Buy rice/);
});

test('add: saves a row in the table', () => {
  assert.equal(add('Pay the bill'), 'Added #2: Pay the bill');
  const db = new DatabaseSync(dbPath);
  const row = db.prepare('SELECT text, done FROM errands WHERE id = 2').get();
  db.close();
  assert.equal(row.text, 'Pay the bill');
  assert.equal(row.done, 0);
});

test('add: refuses text made of spaces', () => {
  assert.match(add('   '), /cannot be empty/);
});

test("add: text with a quote in it is saved as it is", () => {
  assert.equal(add("Call Ali's shop"), "Added #3: Call Ali's shop");
});

test('list: reads the rows back in id order', () => {
  assert.equal(list(''), "#1 [ ] Buy rice\n#2 [ ] Pay the bill\n#3 [ ] Call Ali's shop\nYou have 3 errands");
});
