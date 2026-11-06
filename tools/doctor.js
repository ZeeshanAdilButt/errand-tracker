// doctor.js: checks your setup and says the one thing to fix.
// Run it with: npm run doctor

import fs from 'node:fs';
import { git, githubRepo } from './git-info.js';
import { seedFor } from './seed.js';

let problems = 0;

function ok(text) {
  console.log('OK    ' + text);
}

function fix(text, how) {
  problems = problems + 1;
  console.log('FIX   ' + text);
  console.log('      ' + how);
}

function note(text) {
  console.log('NOTE  ' + text);
}

// 1. Node
const major = Number(process.versions.node.split('.')[0]);
if (major >= 24) {
  ok('Node ' + process.versions.node);
} else {
  fix('Node ' + process.versions.node + ' is too old', 'Install Node 26 LTS from nodejs.org, then open a new terminal.');
}

// 2. SQLite inside Node
try {
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(':memory:');
  const version = db.prepare('SELECT sqlite_version() AS v').get().v;
  db.close();
  ok('SQLite ' + version + ' (built into Node)');
} catch (error) {
  fix('Node cannot open SQLite: ' + error.message, 'Install Node 26 LTS from nodejs.org.');
}

// 3. Git and your name and email
const gitVersion = git(['--version']);
if (gitVersion) {
  ok(gitVersion);
} else {
  fix('Git is not installed, or this terminal cannot find it', 'Install Git from git-scm.com, then open a new terminal.');
}
const name = git(['config', 'user.name']);
const email = git(['config', 'user.email']);
if (name && email) {
  ok('Git knows you as ' + name + ' <' + email + '>');
} else {
  fix('Git does not know your name and email yet', 'Run: git config --global user.name "Your Name"  and  git config --global user.email "you@example.com"');
}

// 4. This folder is your copy of the repository on GitHub
const repo = githubRepo();
if (repo) {
  ok('This folder is the repository ' + repo.owner + '/' + repo.repo);
} else {
  fix('This folder is not linked to a GitHub repository', 'Clone your own repository (chapter 1.9) and run the doctor inside it.');
}

// 5. The repository is public, so the capstone checker can read it
if (repo) {
  try {
    const answer = await fetch('https://api.github.com/repos/' + repo.owner + '/' + repo.repo, {
      headers: { 'User-Agent': 'errand-tracker-doctor' },
      signal: AbortSignal.timeout(8000),
    });
    if (answer.status === 200) {
      const data = await answer.json();
      if (data.private) {
        fix('The repository is private', 'On GitHub open Settings, then Danger Zone, then Change visibility to Public.');
      } else {
        ok('The repository is public');
      }
    } else if (answer.status === 404) {
      fix('GitHub cannot see this repository from outside', 'Make it public: Settings, then Danger Zone, then Change visibility.');
    } else {
      note('Could not check if the repository is public (GitHub answered ' + answer.status + '). Try again later.');
    }
  } catch {
    note('Could not reach GitHub to check if the repository is public. Check your internet and run the doctor again later.');
  }
}

// 6. Your seed: the sample errands your buggy tracker starts with
if (repo) {
  const seed = seedFor(repo.owner);
  fs.writeFileSync(new URL('../bug-hunt/seed.json', import.meta.url), JSON.stringify(seed, null, 2) + '\n');
  ok('Your sample errands: ' + seed.errands.join(', '));
}

console.log('');
if (problems === 0) {
  console.log('All good. You are ready for the next step.');
} else {
  console.log(problems + ' thing(s) to fix. Fix the first FIX line, then run npm run doctor again.');
  process.exitCode = 1;
}
