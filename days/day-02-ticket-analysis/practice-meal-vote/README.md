# Practice — Day 02 kit: Meal vote (solo, ~4 h)

The whole of [Dojo Day 02](https://dojo.agilityio.dev/schedule/day-02.html) in one small,
self-contained app: no backlog, seeded app or partner needed. Each step names the Dojo skill bar
and the Claude 101 lesson it practises.

**Skill bars for today** (from Dojo *Shared fundamentals*):
1. Given any ticket, state in three sentences what it asks, what's ambiguous, your first step.
2. Reproduce a reported bug and point at the layer where it lives: **config, code or data**.
3. Write a reproduce-ready bug report: steps, expected vs actual, environment. Devs never need
   to ask for more.

| File | What it is |
|---|---|
| `backlog.md` | 5 tickets, written the way reporters really write them |
| `vote-tally.js`, `show-winner.js` | The app: tallies votes before the 11:00 cut-off, picks a winner |
| `config.json` | Cut-off time and timezone offset |
| `votes-monday/tuesday/wednesday.json` | One day's export each |
| `bug-report-template.md` | The report format + self-check |
| `git-drill.sh` | Builds a sandbox where `git pull --rebase` hits a conflict |
| `ANSWERS.md` | Answer key. Open it only after each step |

Run every command from this folder:

```bash
cd ~/training-claude/days/day-02-ticket-analysis/practice-meal-vote
```

Log everything in [`../log.md`](../log.md): prompt v1, what was wrong, what you changed, how you
verified.

---

## Morning — ticket analysis (~1 h 30)

### Step 1 · Three-sentence analysis × 5 (skill bar 1 · Lesson 2, Lesson 5) — 40 min

1. Create a **Claude Project** called "Kitchen tickets":
   - **Instructions:** "For every ticket I paste, reply with exactly three sentences: what it asks,
     what's ambiguous, my first step. Then list every assumption you made and every piece of
     missing information (environment, steps, expected vs actual, attachments, related tickets)."
   - **Knowledge:** upload `vote-tally.js`, `show-winner.js` and `config.json`, so Claude can
     cross-reference the code.
2. For each ticket in `backlog.md`: **write your own three sentences first**, then paste the
   ticket into the project.
3. Compare: what did Claude catch that you missed, and what did it assume that the code
   contradicts? Log one line per ticket.

### Step 2 · Questions for the reporter + role-play (Lesson 3: discernment) — 30 min

1. Ask Claude to draft questions, then keep **at most 3 per ticket**. Cut any the ticket already
   answers or a non-developer couldn't answer.
2. Role-play (solo version): ask Claude to play the reporter of KITCHEN-45, "answering only what
   a busy office manager would know". Ask your questions and note which one unblocked the most.
3. Mark each ticket **bug** or **feature request**. Only bugs go on to the afternoon.

Check against `ANSWERS.md` → *Morning*.

---

## Afternoon — reproduce and understand (~2 h)

Work the three bugs: **KITCHEN-42, 43, 44**. For each one, repeat Steps 3–5.

### Step 3 · Reproduce from a clean state (skill bar 2) — 10 min per bug

```bash
node --version
node show-winner.js votes-monday.json      # KITCHEN-42
node show-winner.js votes-tuesday.json     # KITCHEN-43
node show-winner.js votes-wednesday.json   # KITCHEN-44
```

Before blaming anything, write down what the output *should* be, and where that expectation
comes from (the ticket, the config, counting by hand).

### Step 4 · Hypotheses, verified by running (Lesson 3: verify, don't trust) — 20 min per bug

Paste the ticket, the output or stack trace, and the relevant code into Claude:

```text
[stage] I'm debugging a small Node app that tallies lunch votes. Ticket and output below.
[task]  Give me up to 3 hypotheses ranked by likelihood. For each: which layer it lives in
        (config, code or data), the evidence, and the single cheapest experiment that would
        confirm or rule it out.
[rules] Don't propose a fix yet. Don't assume the reporter's diagnosis is right.
<ticket> <output / stack trace> <vote-tally.js> <config.json>
```

**Run every experiment yourself** on a copy of the data or config, never the originals. Log:
hypothesis → experiment → result → kept / ruled out → **layer**.

> Trap: the stack trace in KITCHEN-43 points into `vote-tally.js`. That's where it *crashed*,
> not necessarily where the *problem* is.

### Step 5 · Reproduce-ready bug report (skill bar 3 · Lesson 6: ask for the deliverable) — 15 min per bug

Fill in `bug-report-template.md` for each bug. Then test it the Dojo way: open a **fresh chat**
(no context), paste only your report, and ask:

```text
You're a developer who has never seen this project. Using only this report, list the exact
commands you'd run to reproduce the bug, and every question you'd still need to ask me.
```

Any question Claude asks is a gap in your report. Fix it and repeat until there are none.

### Step 6 · The bug as a failing test (Lesson 3: evals) — 30 min

Create `vote-tally.test.js` and run it with Node's built-in runner:

```bash
node --test
```

- One test per bug that **fails now, for that bug's reason**. Read each failure message.
- KITCHEN-43 is a data bug: the test belongs on the data (validate the export), not a silent
  `if (!vote) continue` in the code. Write down whether the code should also skip bad rows, and
  who should decide.
- Ask Claude: "Does each test assert behaviour or implementation? Would it still pass after a
  different correct fix?"
- **Don't fix anything.** Fixing is Day 03.

Check against `ANSWERS.md` → *Afternoon*.

---

## Git block (~30 min)

```bash
bash git-drill.sh            # creates /tmp/day02-git-drill
cd /tmp/day02-git-drill/you
```

1. `git log --oneline --graph --all`, then `git fetch`. Explain in one line what the teammate
   pushed, using `git log main..origin/main` and `git diff main origin/main`.
2. `git pull --rebase` → conflict in `config.json`. Before editing, answer: which side is `HEAD`
   during a rebase?
3. Resolve it so **both** changes survive, then `git add config.json && git rebase --continue`.
4. `git log --oneline --graph` should show your commit on top of the teammate's.

Clean up with `rm -rf /tmp/day02-git-drill`. Check against `ANSWERS.md` → *Git drill*.

---

## Done when

- [ ] 5 three-sentence analyses: mine vs Claude's, in `log.md`
- [ ] Each ticket marked bug or feature, with ≤ 3 reporter questions
- [ ] 3 bugs reproduced, each with its **layer** backed by an experiment
- [ ] 3 bug reports that a fresh Claude chat could reproduce with zero questions
- [ ] `node --test` shows one failing test per bug, each failing for its own reason
- [ ] Git drill: conflict resolved with both changes kept
- [ ] Claude 101 finished (see the Academy Notes site)
