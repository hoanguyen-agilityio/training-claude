# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this repo is

Study notes and hands-on practice for the [AI Dojo](https://dojo.agilityio.dev/schedule.html)
program and the Anthropic Academy courses.

| Path | What it is | Committed? |
|---|---|---|
| `meal-vote/` | Practice app: a small Kitchen-style meal-vote dashboard | Yes |
| `anthropic-academy/` | Course summaries and the local notes site | **No** (git-ignored, local only) |
| `README.md` | Repo overview and course index | Yes |

GitLab project: `gitlab.asoft-python.com/hoa.nguyen/training-claude`. Tickets are GitLab issues
(#1 is the parent; #2–#4 are its bug children).

## meal-vote app

Stack mirrors `apps/kitchen` in the Space monorepo: Astro 5 + React 19 islands, TypeScript
(strict), Tailwind CSS 3, Vitest + Testing Library. Package manager: **pnpm only**.

```bash
cd meal-vote
pnpm install
pnpm dev          # http://localhost:4321
pnpm test         # Vitest
pnpm typecheck    # astro sync && tsc --noEmit
pnpm build
```

`pnpm typecheck` uses `tsc`, not `astro check`: `@astrojs/check` needs Node ≥ 22.12 and this
machine runs Node 22.2.

### Conventions (from Kitchen)

- One folder per component: `index.tsx`, `styles/<kebab-name>.css`, `__test__/index.test.tsx`.
- Class names come from a `variantTheme` map keyed by `BaseVariant`; styles are co-located CSS
  using `@apply` with the `kitchen-*` Tailwind colours. No raw hex values in components.
- Imports grouped with comments: `// Libs`, `// Components`, `// Config`, `// Constants`,
  `// Services`, `// Stores`, `// Utils`, `// Types`, `// Styles`.
- Named exports only (Astro pages and layouts excepted). `@/` alias for `src/`.
- State: pub/sub singletons in `src/stores/` read through hooks (`useSyncExternalStore`).
  **No Zustand.**
- No `any`. `as` casts only at external boundaries, with a comment (see `services/vote-export.ts`).
- Tests: one comment per test explaining the case; repeated literals go in constants.

### Seeded bugs

The app shipped with three intentional bugs, each tracked by its own issue. All three are fixed
(MR !1); keep their tests, since they guard the layer each bug lived in:

| Issue | Layer | Where |
|---|---|---|
| #2 Winner ignores votes whose meal name differs only in case or spacing | Code | `src/utils/vote-tally.ts` |
| #3 Results crash on Tuesday's vote export | Data | `src/data/votes-tuesday.json` |
| #4 Votes cast after the 11:00 cut-off are still counted | Config | `src/config/voting.json` |

- One issue per commit: a fix and its test land together, referencing only that issue.
- Every fix lands with a test that fails before the fix and passes after it.
- Existing tests assert correct behaviour only (office config UTC+7 passed explicitly). Never
  change a test so that it accepts buggy output.

## Verification before any commit

Run all three from `meal-vote/` and report the real output: `pnpm test`, `pnpm typecheck`,
`pnpm build`. Then read your own diff for scope creep, duplication and convention breaches.

## Git and GitLab

- Working branch: **`dev`** (tracks `origin/dev`). MRs target `main` unless told otherwise.
- **Commit, push, or open/merge an MR only when asked in that message.** Finishing an edit
  never implies a commit.
- Conventional commits: `type(scope): subject` (`feat`, `fix`, `chore`, `refactor`, `docs`,
  `test`), plus a short body (2–4 lines) saying what changed and why. Reference the issue
  (`Refs #3`, `Closes #3`). One logical change per commit.
- No AI attribution in commits, MRs or issues.
- Stage specific paths, never `git add .`. Never commit `node_modules/`, `dist/`, `.astro/` or
  anything under `anthropic-academy/`.
- Keep the remote branch `day/02-ticket-analysis`: issues #2–#4 link to its commit `f060102`.
- Everything written to GitLab (issues, MRs, comments) is in **English**. Chat replies to the
  user are in Vietnamese.

## Skills

- `/review-mr <MR number>`: review a GitLab merge request of this project. See
  `.claude/skills/review-mr/SKILL.md`.
