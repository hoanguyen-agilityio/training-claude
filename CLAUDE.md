# CLAUDE.md

AI Dojo practice repo. GitLab: `gitlab.asoft-python.com/hoa.nguyen/training-claude`.
`meal-vote/` is the practice app (Astro 5 + React 19 islands, strict TS, Tailwind 3, Vitest);
how it works and the fixed bug history live in `meal-vote/README.md`.

## Commands (from `meal-vote/`, pnpm only)

```bash
pnpm install && pnpm dev   # http://localhost:4321
pnpm test                  # Vitest
pnpm typecheck             # astro sync && tsc --noEmit (not astro check: Node 22.2)
pnpm build
```

Before any commit: run all three gates, report the real output, then read your own diff.

## Conventions (Kitchen)

- One folder per component: `index.tsx`, `styles/<kebab-name>.css`, `__test__/index.test.tsx`.
- Class names from a `variantTheme` map keyed by `BaseVariant`; co-located `@apply` CSS with
  `kitchen-*` colours.
- Import groups with comments: `// Libs`, `// Components`, `// Config`, `// Constants`,
  `// Services`, `// Stores`, `// Utils`, `// Types`, `// Styles`.
- Named exports (Astro pages/layouts excepted); `@/` is `src/`.
- State: pub/sub singletons in `src/stores/`, read through hooks.
- Tests: one comment per test; repeated literals in constants. Every fix ships with a test that
  fails before it and passes after.

## Git and GitLab

- Work on `dev`; MRs target `dev` unless told otherwise.
- `type(scope): subject` + 2–4 line body + `Refs #n` / `Closes #n`. One issue per commit.
- Stage specific paths. Assign every issue and MR to `hoa.nguyen`.
- GitLab text in English; chat replies in Vietnamese.

## Never

- Commit, push, or open/merge an MR unless asked in that message.
- `any`, Zustand, raw hex colours, or `as` casts outside external boundaries (comment them).
- Change a test so it accepts buggy output.
- AI attribution in commits, MRs or issues.
- `git add .`, or commit `node_modules/`, `dist/`, `.astro/`, `anthropic-academy/`.
- Delete the remote branch `day/02-ticket-analysis` (issues #2–#4 link to `f060102`).

## Skills

- `/review-mr <n>`: review a GitLab MR (`.claude/skills/review-mr/SKILL.md`).
