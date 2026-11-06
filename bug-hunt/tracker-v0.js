// tracker-v0.js: a finished errand tracker with bugs in it.
// In module 1 you do not write new code. You run this program, find
// what goes wrong, trace it to the line that causes it, and change
// that one line. Every line has a comment that says what it does.
//
// Run it:        node bug-hunt/tracker-v0.js
// See inside it: node bug-hunt/tracker-v0.js --trace

import fs from 'node:fs';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

// --trace on the command line turns on the trace lines.
const tracing = process.argv.includes('--trace');

// Print a trace line, but only when --trace is on.
function trace(where, values) {
  if (tracing) {
    console.log('[trace] ' + where + ': ' + JSON.stringify(values));
  }
}

// One errand as one line, for example: #1 [ ] Buy rice
export function formatErrand(errand) {
  trace('formatErrand', errand);                       // show the errand we were given
  const tick = errand.don ? '[x]' : '[ ]';             // [x] if the errand is done, [ ] if not
  return '#' + errand.id + ' ' + tick + ' ' + errand.text; // put the pieces together
}

// Every errand on its own line, then how many there are.
export function formatList(errands) {
  const lines = [];                                    // an empty list of lines to print
  for (const errand of errands) {                      // visit each errand in turn
    lines.push(formatErrand(errand));                  // add its line
  }
  const count = errands.length - 1;                    // how many errands there are
  trace('formatList', { length: errands.length, count: count }); // show both numbers
  lines.push('You have ' + count + ' errands');        // the last line: the count
  return lines.join('\n');                             // all lines, one under the other
}

// Add an errand to the list, unless its text is empty.
export function addErrand(errands, nextId, text) {
  trace('addErrand', { text: text, nextId: nextId });  // show what was typed
  if (text === '') {                                   // is the text empty?
    return 'Errand text cannot be empty.';             // then refuse it
  }
  errands.push({ id: nextId, text: text, done: false }); // add the new errand
  return 'Added #' + nextId + ': ' + text;             // say what was added
}

// The errands whose text contains what was searched for.
export function searchErrands(errands, query) {
  const found = [];                                    // an empty list for the matches
  for (const errand of errands) {                      // visit each errand in turn
    const matches = errand.text.includes(query);       // does its text contain the query?
    trace('searchErrands', { text: errand.text, query: query, matches: matches });
    if (matches) {                                     // if it does,
      found.push(errand);                              // keep it
    }
  }
  return found;                                        // the errands that matched
}

// Mark the errand with this id as done.
export function markDone(errands, id) {
  let found = false;                                   // no errand found yet
  for (const errand of errands) {                      // visit each errand in turn
    if (errand.id = id) {                              // is this the errand with that id?
      errand.done = true;                              // then mark it as done
      found = true;                                    // and remember we found one
    }
    trace('markDone', errand);                         // show the errand after the check
  }
  if (!found) {                                        // no errand had that id
    return 'No errand #' + id + '.';
  }
  return 'Done #' + id;                                // say which one is done
}

// The sample errands this tracker starts with. They come from your seed
// (bug-hunt/seed.json, written by npm run doctor), so yours differ from
// other learners' errands.
function startingErrands() {
  let texts = ['Buy rice', 'Pay the electricity bill', 'Return the library book'];
  const seedFile = new URL('./seed.json', import.meta.url);
  if (fs.existsSync(seedFile)) {
    texts = JSON.parse(fs.readFileSync(seedFile, 'utf8')).errands;
  }
  const errands = [];
  for (let i = 0; i < texts.length; i++) {
    errands.push({ id: i + 1, text: texts[i], done: false });
  }
  return errands;
}

// Read typed lines and run each command.
function start() {
  const errands = startingErrands();
  let nextId = errands.length + 1;
  console.log('Errand tracker v0. Commands: add <text>, list, search <text>, done <id>, quit');
  const typing = process.stdin.isTTY === true;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: typing });
  if (typing) rl.setPrompt('> ');
  if (typing) rl.prompt();
  rl.on('line', (line) => {
    const space = line.indexOf(' ');
    const word = space === -1 ? line.trim() : line.slice(0, space);
    const rest = space === -1 ? '' : line.slice(space + 1);
    if (word === 'quit') {
      rl.close();
      return;
    } else if (word === 'add') {
      const answer = addErrand(errands, nextId, rest);
      if (answer.startsWith('Added')) nextId = nextId + 1;
      console.log(answer);
    } else if (word === 'list') {
      console.log(formatList(errands));
    } else if (word === 'search') {
      const found = searchErrands(errands, rest);
      console.log(found.length === 0 ? 'No errands match.' : formatList(found));
    } else if (word === 'done') {
      console.log(markDone(errands, Number(rest)));
    } else if (word !== '') {
      console.log('Unknown command: ' + word);
    }
    if (typing) rl.prompt();
  });
  rl.on('close', () => console.log('Bye.'));
}

// Start only when this file is run, not when a test loads it.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  start();
}
