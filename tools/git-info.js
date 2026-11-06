// git-info.js: small helpers the other tools use to ask Git questions.

import { execFileSync } from 'node:child_process';

export function git(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

// The GitHub owner and repository name, from GITHUB_REPOSITORY in CI or
// from the origin remote on your laptop. Returns { owner, repo } or null.
export function githubRepo() {
  if (process.env.GITHUB_REPOSITORY) {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    return { owner, repo };
  }
  const url = git(['remote', 'get-url', 'origin']);
  const match = url.match(/github\.com[/:]([^/]+)\/([^/]+?)(\.git)?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}
