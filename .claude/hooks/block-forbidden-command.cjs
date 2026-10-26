#!/usr/bin/env node
'use strict';

/**
 * PreToolUse hook for Bash: blocks the commands CLAUDE.md lists under "Never".
 * Reads the hook JSON from stdin; exits 2 with the reason on stderr to block,
 * exits 0 (no decision) otherwise. Anything it cannot parse is let through.
 */

const PROTECTED_BRANCH = 'day/02-ticket-analysis';
const FORBIDDEN_DIRS = ['node_modules', 'dist', '.astro', 'anthropic-academy'];
const STAGE_ALL_ARGS = ['.', '*', ':/', '-A', '--all', '-u', '--update'];
const NPM_LIKE = ['npm', 'yarn'];
const NPM_SUBCOMMANDS = ['install', 'i', 'ci', 'add', 'remove', 'uninstall', 'update', 'run', 'test', 'exec'];
// git options that take a value before the subcommand, e.g. `git -C meal-vote add`
const GIT_OPTIONS_WITH_VALUE = ['-C', '-c', '--git-dir', '--work-tree', '--namespace'];

const splitSegments = (command) => command.split(/&&|\|\||[;|\n]/).map((part) => part.trim()).filter(Boolean);

// Quoted strings stay one token, so a commit message like "fix -a flag" is not read as flags
const tokenize = (segment) =>
  (segment.match(/"[^"]*"|'[^']*'|\S+/g) ?? [])
    .map((token) => token.replace(/^['"]|['"]$/g, ''))
    .filter((token) => token && !/^[A-Za-z_][A-Za-z0-9_]*=/.test(token));

const isInForbiddenDir = (path) => path.split('/').some((part) => FORBIDDEN_DIRS.includes(part));

const parseGit = (tokens) => {
  let index = 1;
  while (index < tokens.length && tokens[index].startsWith('-')) {
    index += GIT_OPTIONS_WITH_VALUE.includes(tokens[index]) ? 2 : 1;
  }
  return { subcommand: tokens[index], args: tokens.slice(index + 1) };
};

const checkGitAdd = (args) => {
  const stageAll = args.find((arg) => STAGE_ALL_ARGS.includes(arg));
  if (stageAll) return `\`git add ${stageAll}\` stages everything; stage specific paths instead.`;
  const forbidden = args.find((arg) => !arg.startsWith('-') && isInForbiddenDir(arg));
  if (forbidden) return `\`${forbidden}\` must never be committed (${FORBIDDEN_DIRS.join(', ')}).`;
  return null;
};

const checkGitCommit = (args) => {
  const all = args.find((arg) => arg === '--all' || /^-[A-Za-z]*a[A-Za-z]*$/.test(arg));
  return all ? `\`git commit ${all}\` stages every tracked change; stage specific paths instead.` : null;
};

const checkGitPush = (args) => {
  const deletes = args.includes('--delete') || args.includes('-d');
  const touchesProtected = args.some(
    (arg) => arg === PROTECTED_BRANCH || arg.endsWith(`:${PROTECTED_BRANCH}`) || arg.endsWith(`:refs/heads/${PROTECTED_BRANCH}`),
  );
  const deletesByRefspec = args.some((arg) => arg === `:${PROTECTED_BRANCH}` || arg === `:refs/heads/${PROTECTED_BRANCH}`);
  if ((deletes && touchesProtected) || deletesByRefspec) {
    return `Never delete the remote branch \`${PROTECTED_BRANCH}\`: issues #2-#4 link to its commit f060102.`;
  }
  return null;
};

const checkSegment = (segment) => {
  const tokens = tokenize(segment);
  const [program] = tokens;
  if (program === 'git') {
    const { subcommand, args } = parseGit(tokens);
    if (subcommand === 'add') return checkGitAdd(args);
    if (subcommand === 'commit') return checkGitCommit(args);
    if (subcommand === 'push') return checkGitPush(args);
  }
  if (NPM_LIKE.includes(program) && NPM_SUBCOMMANDS.includes(tokens[1])) {
    return `\`${program} ${tokens[1]}\`: this repo uses pnpm only.`;
  }
  return null;
};

const findViolation = (command) => {
  for (const segment of splitSegments(command)) {
    const reason = checkSegment(segment);
    if (reason) return reason;
  }
  return null;
};

const main = () => {
  let raw = '';
  process.stdin.on('data', (chunk) => (raw += chunk));
  process.stdin.on('end', () => {
    let command = '';
    try {
      command = JSON.parse(raw).tool_input?.command ?? '';
    } catch {
      process.exit(0);
    }
    const reason = findViolation(command);
    if (reason) {
      process.stderr.write(`Blocked by block-forbidden-command (CLAUDE.md "Never"): ${reason}\n`);
      process.exit(2);
    }
    process.exit(0);
  });
};

if (require.main === module) main();

module.exports = { findViolation };
