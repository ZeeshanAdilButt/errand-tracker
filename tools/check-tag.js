// check-tag.js: says whether a capstone tag is made the right way and on GitHub.
// Run it with: npm run check-tag -- capstone-1

import { git } from './git-info.js';

const tag = process.argv[2];
if (!/^capstone-[1-4]$/.test(tag || '')) {
  console.log('Say which tag, for example: npm run check-tag -- capstone-1');
  process.exit(1);
}

const kind = git(['cat-file', '-t', tag]);
if (kind === '') {
  console.log('There is no tag ' + tag + ' on this laptop yet.');
  console.log('Make it with: git tag -a ' + tag + ' -m "Capstone ' + tag.slice(-1) + '"');
  process.exit(1);
}
if (kind !== 'tag') {
  console.log(tag + ' is a plain tag. The checker needs an annotated tag.');
  console.log('Fix it with: git tag -d ' + tag + '  then  git tag -a ' + tag + ' -m "Capstone ' + tag.slice(-1) + '"');
  process.exit(1);
}

const localCommit = git(['rev-list', '-n', '1', tag]);
const remote = git(['ls-remote', '--tags', 'origin', 'refs/tags/' + tag + '^{}']);
if (remote === '') {
  console.log(tag + ' is on this laptop but not on GitHub yet.');
  console.log('Send it with: git push origin ' + tag);
  process.exit(1);
}
const remoteCommit = remote.split(/\s+/)[0];
if (remoteCommit !== localCommit) {
  console.log('The ' + tag + ' on GitHub points to a different commit than the one here.');
  console.log('Ask in the help channel before you change a pushed tag.');
  process.exit(1);
}
console.log(tag + ' is annotated and on GitHub, on commit ' + localCommit.slice(0, 7) + '.');
console.log('Next: open the Actions tab on GitHub and wait for the capstone run to turn green.');
