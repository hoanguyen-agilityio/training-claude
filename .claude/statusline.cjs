#!/usr/bin/env node
'use strict';

/**
 * Claude Code status line: "🤖 model  ▰▱▱ 4%  📁 ~/dir  🌿 branch (2, +1, 3↑, 2↓)".
 * A standalone port of the sections used by the Space repo's ClaudeKit status line.
 * Reads the session JSON from stdin and prints one ANSI line to stdout.
 */

const { execFileSync } = require('child_process');
const os = require('os');

const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const COLORS = { red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', magenta: '\x1b[35m', cyan: '\x1b[36m' };
const useColor = !process.env.NO_COLOR;
const paint = (color, text) => (useColor ? `${COLORS[color]}${text}${RESET}` : text);

const BAR_WIDTH = 12;
// Claude Code keeps this many tokens free for auto-compaction, so they count as used
const AUTOCOMPACT_BUFFER = 40000;
const GIT_TIMEOUT_MS = 1000;

const contextColor = (percent) => (percent >= 85 ? 'red' : percent >= 70 ? 'yellow' : 'green');

const contextPercent = (contextWindow = {}) => {
  if (Number.isFinite(contextWindow.used_percentage)) return Math.round(contextWindow.used_percentage);

  const size = contextWindow.context_window_size || 0;
  if (size <= AUTOCOMPACT_BUFFER) return 0;
  const usage = contextWindow.current_usage || {};
  const tokens =
    (usage.input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0);
  return Math.min(100, Math.round(((tokens + AUTOCOMPACT_BUFFER) / size) * 100));
};

const renderContext = (percent) => {
  if (percent <= 0) return null;
  const filled = Math.round((Math.min(100, percent) / 100) * BAR_WIDTH);
  const color = contextColor(percent);
  const bar = useColor
    ? `${COLORS[color]}${'▰'.repeat(filled)}${RESET}${DIM}${'▱'.repeat(BAR_WIDTH - filled)}${RESET}`
    : '▰'.repeat(filled) + '▱'.repeat(BAR_WIDTH - filled);
  return `${bar} ${paint(color, `${percent}%`)}`;
};

const git = (args, cwd) => {
  try {
    return execFileSync('git', args, { cwd, timeout: GIT_TIMEOUT_MS, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
};

const countLines = (output) => (output ? output.split('\n').filter(Boolean).length : 0);

const renderGit = (cwd) => {
  const branch = git(['branch', '--show-current'], cwd) || git(['rev-parse', '--short', 'HEAD'], cwd);
  if (!branch) return null;

  const indicators = [];
  const unstaged = countLines(git(['diff', '--name-only'], cwd));
  const staged = countLines(git(['diff', '--cached', '--name-only'], cwd));
  // "<behind> <ahead>" relative to the upstream; null when the branch tracks nothing
  const [behind = 0, ahead = 0] = (git(['rev-list', '--left-right', '--count', '@{u}...HEAD'], cwd) || '')
    .split(/\s+/)
    .map(Number);
  if (unstaged > 0) indicators.push(`${unstaged}`);
  if (staged > 0) indicators.push(`+${staged}`);
  if (ahead > 0) indicators.push(`${ahead}↑`);
  if (behind > 0) indicators.push(`${behind}↓`);

  const suffix = indicators.length > 0 ? ` ${paint('yellow', `(${indicators.join(', ')})`)}` : '';
  return `🌿 ${paint('magenta', branch)}${suffix}`;
};

const render = (data) => {
  const cwd = data.workspace?.current_dir || data.cwd || process.cwd();
  const home = os.homedir();
  const dir = cwd.startsWith(home) ? `~${cwd.slice(home.length)}` : cwd;

  return [
    `🤖 ${paint('cyan', data.model?.display_name || 'Claude')}`,
    renderContext(contextPercent(data.context_window)),
    `📁 ${paint('yellow', dir)}`,
    renderGit(cwd),
  ]
    .filter(Boolean)
    .join('  ');
};

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let data = {};
  try {
    data = JSON.parse(input || '{}');
  } catch {
    // Malformed input still gets a status line, just without session details
  }
  process.stdout.write(render(data));
});
