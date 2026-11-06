// cli.js: the part of the errand tracker that talks to you.
// You do not need to change this file, and the course checks put it back
// if it changes. It reads each line you type, works out the command,
// calls the matching function in errands.js, and prints what that
// function returns.

import readline from 'node:readline';
import path from 'node:path';
import * as errands from './errands.js';

// The commands this tracker knows, and the function each one calls.
const commands = {
  add: (rest) => callIfBuilt('add', rest),
  list: (rest) => callIfBuilt('list', rest),
  search: (rest) => callIfBuilt('search', rest),
  done: (rest) => callIfBuilt('done', rest),
  delete: (rest) => callIfBuilt('remove', rest),
  count: () => callIfBuilt('count'),
  undo: (rest) => callIfBuilt('undo', rest),
  edit: (rest) => {
    const space = rest.indexOf(' ');
    const id = space === -1 ? rest : rest.slice(0, space);
    const text = space === -1 ? '' : rest.slice(space + 1);
    return callIfBuilt('edit', id, text);
  },
  help: () => helpText(),
};

function callIfBuilt(name, ...args) {
  if (typeof errands[name] !== 'function') {
    return `Not built yet: ${name}`;
  }
  const answer = errands[name](...args);
  return answer === undefined ? `${name} returned nothing yet` : String(answer);
}

function helpText() {
  return [
    'add <text>         add an errand, for example: add Buy rice',
    'list               show every errand (also: list open, list done)',
    'search <text>      show errands that contain the text',
    'done <id>          mark an errand as done, for example: done 2',
    'delete <id>        remove an errand (module 3 on)',
    'count              how many errands are open and done (menu feature)',
    'undo <id>          mark a done errand as open again (menu feature)',
    'edit <id> <text>   change an errand\'s text (menu feature)',
    'quit               stop the tracker',
  ].join('\n');
}

// Run one typed line and return the text to print.
function runLine(line) {
  const trimmed = line.trim();
  if (trimmed === '') return '';
  const space = trimmed.indexOf(' ');
  const word = (space === -1 ? trimmed : trimmed.slice(0, space)).toLowerCase();
  const rest = space === -1 ? '' : trimmed.slice(space + 1).trim();
  const command = commands[word];
  if (!command) return `Unknown command: ${word}. Type help to see the commands.`;
  try {
    return command(rest);
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

function start() {
  if (typeof errands.setup === 'function') {
    const dbPath = path.resolve(process.env.ERRANDS_DB || path.join('data', 'errands.db'));
    errands.setup(dbPath);
    console.log(`Data file: ${dbPath}`);
  }
  console.log('Errand tracker. Type help to see the commands, quit to stop.');

  const typing = process.stdin.isTTY === true;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: typing });
  if (typing) rl.setPrompt('> ');
  if (typing) rl.prompt();

  rl.on('line', (line) => {
    if (line.trim().toLowerCase() === 'quit') {
      rl.close();
      return;
    }
    const answer = runLine(line);
    if (answer !== '') console.log(answer);
    if (typing) rl.prompt();
  });
  rl.on('close', () => {
    if (typeof errands.shutdown === 'function') errands.shutdown();
    console.log('Bye.');
  });
}

start();
