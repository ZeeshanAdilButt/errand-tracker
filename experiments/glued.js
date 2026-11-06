// experiments/glued.js: the unsafe way, so you can see it break (lab 3.10).
// It glues the errand text straight into the SQL. Never do this in src/.
//
// Run it:  node experiments/glued.js "Call Ali's shop"

import { DatabaseSync } from 'node:sqlite';

const text = process.argv[2] || "Call Ali's shop";
const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE errands (id INTEGER PRIMARY KEY, text TEXT NOT NULL)');

const glued = "INSERT INTO errands (text) VALUES ('" + text + "')";
console.log('The glued statement: ' + glued);
try {
  db.exec(glued);
  console.log('It worked this time. Try a text with a quote in it.');
} catch (error) {
  console.log('It broke: ' + error.message);
}

const safe = db.prepare('INSERT INTO errands (text) VALUES (?)');
safe.run(text);
console.log('With a placeholder: saved ' + JSON.stringify(db.prepare('SELECT text FROM errands').all().map((row) => row.text)));
db.close();
