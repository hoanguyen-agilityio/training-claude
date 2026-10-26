'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const { findViolation } = require('../block-forbidden-command.cjs');

const HOOK_PATH = path.join(__dirname, '..', 'block-forbidden-command.cjs');
const PROTECTED_BRANCH = 'day/02-ticket-analysis';
const SAFE_ADD = 'git add meal-vote/src/utils/vote-tally.ts';
const BLOCKED = 2;
const ALLOWED = 0;

const runHook = (input) => spawnSync('node', [HOOK_PATH], { input, encoding: 'utf8' });
const hookInput = (command) => JSON.stringify({ tool_name: 'Bash', tool_input: { command } });

describe('findViolation', () => {
  // Staging everything is forbidden in every spelling
  it('blocks git add of everything', () => {
    for (const command of ['git add .', 'git add -A', 'git add --all', 'git add -u', 'git -C meal-vote add .']) {
      assert.ok(findViolation(command), command);
    }
  });

  // Build output, dependencies and the course folder must never be staged
  it('blocks staging forbidden directories', () => {
    for (const command of ['git add node_modules', 'git add meal-vote/dist/index.html', 'git add .astro/', 'git add anthropic-academy/notes.md']) {
      assert.ok(findViolation(command), command);
    }
  });

  // `commit -a` bypasses explicit staging
  it('blocks git commit -a and -am', () => {
    for (const command of ['git commit -a', 'git commit -am "msg"', 'git commit --all']) {
      assert.ok(findViolation(command), command);
    }
  });

  // The ticket-analysis branch is referenced by issues #2-#4
  it('blocks deleting the protected remote branch', () => {
    for (const command of [`git push origin --delete ${PROTECTED_BRANCH}`, `git push origin -d ${PROTECTED_BRANCH}`, `git push origin :${PROTECTED_BRANCH}`]) {
      assert.ok(findViolation(command), command);
    }
  });

  // The repo is pnpm only
  it('blocks npm and yarn package commands', () => {
    for (const command of ['npm install', 'npm i clsx', 'yarn add react', 'npm run build']) {
      assert.ok(findViolation(command), command);
    }
  });

  // A forbidden command chained after a safe one is still caught
  it('checks every segment of a chained command', () => {
    assert.ok(findViolation(`cd meal-vote && ${SAFE_ADD} && git add .`));
  });

  // Normal day-to-day commands pass through untouched
  it('allows safe commands', () => {
    for (const command of [SAFE_ADD, 'git commit -m "fix: x"', 'git commit -m "drop the -a flag"', `git push origin ${PROTECTED_BRANCH}`, 'git push origin --delete feat/old', 'pnpm install', 'git status']) {
      assert.equal(findViolation(command), null, command);
    }
  });
});

describe('hook process', () => {
  // A violation exits 2 and explains why on stderr
  it('exits 2 with the reason on stderr', () => {
    const result = runHook(hookInput('git add .'));
    assert.equal(result.status, BLOCKED);
    assert.match(result.stderr, /stage specific paths/);
  });

  // A safe command exits 0 with no output
  it('exits 0 for a safe command', () => {
    const result = runHook(hookInput(SAFE_ADD));
    assert.equal(result.status, ALLOWED);
    assert.equal(result.stderr, '');
  });

  // Unparseable input never blocks Claude
  it('lets invalid JSON through', () => {
    assert.equal(runHook('not json').status, ALLOWED);
  });
});
