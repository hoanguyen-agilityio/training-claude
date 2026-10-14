# Meal vote

A small Kitchen-style app for practising ticket analysis, bug reproduction and fixing. It shows how
the team voted for lunch on a given day and which meal won, counting only votes cast before the
daily cut-off.

Stack mirrors `apps/kitchen` in the Space monorepo: **Astro 5** with **React 19** islands,
**TypeScript** (strict), **Tailwind CSS 3**, and **Vitest** with Testing Library.

> The app ships with three **seeded bugs** on purpose (one each in code, data and config). They
> are tracked as GitLab issues #2, #3 and #4 under #1. Don't fix them outside their own ticket.

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

## How it works

1. `DaySelector` writes the chosen day to `voteDayStore` (a pub/sub singleton, as in Kitchen;
   no Zustand).
2. `MealVoteDashboard` reads the day with `useSelectedDay()` and loads that day's export through
   `getVoteExport()`.
3. `DayResults` runs `tallyVotes()` / `pickWinner()` from `src/utils/vote-tally.ts`, which drop
   votes after `closesAt` using the office offset from `src/config/voting.json`.
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

## Reproducing the seeded bugs

Run `pnpm dev`, open http://localhost:4321 and pick a day.

| Day | What you see | Ticket |
|---|---|---|
| Monday | *Cơm tấm* wins with 2 votes; the tally lists `“Phở bò”`, `“phở bò”` and `“Phở bò ”` separately | #2 |
| Tuesday | "Couldn't compute the results for this day" with `TypeError: Cannot read properties of null (reading 'at')` | #3 |
| Wednesday | *Cơm tấm* wins 4–3; votes at 11:20, 11:35 and 11:48 show **Counted: Yes** | #4 |

Tests assert only correct behaviour (with the office's UTC+7 config passed explicitly), so they
pass today and keep passing after each fix. Each bug ticket asks for its own failing test.
