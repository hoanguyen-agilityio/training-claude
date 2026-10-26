# Meal vote

A small Kitchen-style app for practising ticket analysis, bug reproduction and fixing. It shows how
the team voted for lunch on a given day and which meal won, counting only votes cast before the
daily cut-off.

Stack mirrors `apps/kitchen` in the Space monorepo: **Astro 5** with **React 19** islands,
**TypeScript** (strict), **Tailwind CSS 3**, and **Vitest** with Testing Library.

> The app shipped with three **seeded bugs** on purpose (one each in code, data and config),
> tracked as GitLab issues #2, #3 and #4 under #1. All three are fixed; see below.

## Getting started

Requires Node 22 and pnpm.

```bash
cd meal-vote
pnpm install
pnpm dev          # http://localhost:4321
```

| Script | What it does |
|---|---|
| `pnpm dev` | Dev server with readable stack traces |
| `pnpm build` / `pnpm preview` | Production build and local preview |
| `pnpm typecheck` | `astro sync` + `tsc --noEmit` |
| `pnpm test` | Unit and component tests (Vitest) |
| `pnpm test:watch` | Vitest in watch mode, re-running tests on save |

## How it works

1. `DaySelector` writes the chosen day to `voteDayStore` (a pub/sub singleton, as in Kitchen;
   no Zustand).
2. `MealVoteDashboard` reads the day with `useSelectedDay()`, loads that day's export through
   `getVoteExport()` and passes on the day's date from `VOTE_DAYS`. A vote whose office-local
   date is another day is listed but not counted. A time without a UTC offset is read as office
   time, so results do not depend on the viewer's timezone.
3. `DayResults` runs `tallyVotes()` / `pickWinner()` from `src/utils/vote-tally.ts`, which drop
   votes after `closesAt` using the office offset from `src/config/voting.json` and count each
   user once, with their latest on-time vote.
4. `WinnerCard`, `VoteTally` and `VoteList` render the result. Meal names are shown in quotes
   so stray spaces stay visible; `VoteList` shows each vote's office time and whether it counted.
5. `ResultsErrorBoundary` turns a crash while computing results into a readable alert; the full
   stack trace goes to the browser console.

## Project structure

```
meal-vote/
├── src/
│   ├── components/          # one folder per component: index.tsx, styles/*.css, __test__/
│   │   ├── DaySelector/
│   │   ├── DayResults/
│   │   ├── MealVoteDashboard/   # React island mounted by the page
│   │   ├── ResultsErrorBoundary/
│   │   ├── VoteList/
│   │   ├── VoteTally/
│   │   ├── WinnerCard/
│   │   └── layout/BaseLayout/
│   ├── config/voting.json   # cut-off time and office UTC offset
│   ├── constants/           # vote days, office timezone
│   ├── data/                # one vote export per day (as received from the voting system)
│   ├── pages/index.astro
│   ├── services/vote-export.ts
│   ├── stores/              # voteDayStore + hooks
│   ├── styles/globals.css
│   ├── types/
│   └── utils/               # vote-tally.ts, format-time.ts
└── …config files (astro, tailwind, tsconfig, vitest)
```

Conventions follow Kitchen: grouped imports with `// Libs`, `// Components`, `// Utils`,
`// Types`, `// Styles` comments; named exports; class names come from a `variantTheme` map keyed by
`BaseVariant`, with the styles in co-located `@apply` CSS.

## Seeded bugs (fixed)

Run `pnpm dev`, open http://localhost:4321 and pick a day.

| Day | Before the fix | After the fix | Ticket |
|---|---|---|---|
| Monday | *Cơm tấm* won with 2 votes; `“Phở bò”`, `“phở bò”` and `“Phở bò ”` were tallied separately | *Phở bò* wins with 3 votes | #2 (code) |
| Tuesday | `TypeError: Cannot read properties of null (reading 'at')` | *Bún bò* 3 – *Cơm gà* 2; an invalid record now fails with its index | #3 (data) |
| Wednesday | *Cơm tấm* won 4–3; votes at 11:20, 11:35 and 11:48 were counted | *Bún chả* wins 3–1 | #4 (config) |

Each fix has a test that failed before it and passes after it.
