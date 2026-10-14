# Answer key — read only after you've finished each step

## Morning: three-sentence analyses (one good version each)

| Ticket | Asks | Ambiguous | First step |
|---|---|---|---|
| KITCHEN-42 | Make the announced winner match how people actually voted. | Which day's data, what "wrong" means (counts? winner?), and the tie rule is unspecified. | Run the Monday export and compare the tally with the votes by hand. |
| KITCHEN-43 | Stop the Tuesday results run from crashing. | Whether the fix belongs in code (guard) or data (bad export); the reporter already assumes code. | Inspect Tuesday's file for the record the trace points at before touching code. |
| KITCHEN-44 | Exclude votes cast after the 11:00 cut-off. | Which day, which votes, and whose clock defines 11:00. | Find a day with late timestamps and compute local time by hand. |
| KITCHEN-45 | Let a voter change their choice. | Until when (cut-off?), does the last vote win, is the change visible to others? | Ask the reporter for the rule; it's a feature, not a bug. |
| KITCHEN-46 | Make the winner message more engaging. | No acceptance criteria at all: who decides "fun", which channel, any constraints? | Ask for an example of a message they'd like; don't build anything yet. |

Questions worth sending (examples): "On a tie, which meal should win?" · "Is 11:00 Vietnam time?" ·
"Should a changed vote after 11:00 count?" · "Can you paste or screenshot the message you'd like?"

## Afternoon: bugs by layer

| Ticket | Layer | Root cause | Evidence experiment | Failing test should assert |
|---|---|---|---|---|
| KITCHEN-42 | **Code** | `tallyVotes` uses the raw `meal` string as the key: `Phở bò`, `phở bò`, `Phở bò ` count as three meals. | Normalise the names in a copy of the data → Phở bò wins 3–2. | Votes differing only in case/whitespace are counted as one meal and that meal wins. |
| KITCHEN-43 | **Data** (code hardening optional) | Tuesday's export contains a `null` record. The trace points at `isOnTime`, but the code is fine for valid data. | Remove the `null` → runs, Bún bò wins 3–2. Monday's file has no `null`. | A data-validation test: a vote file contains only objects with `user`, `meal`, `at`. Whether code should skip bad rows is a question for the lead, not a silent fix. |
| KITCHEN-44 | **Config** | `config.json` has `utcOffsetHours: 0`; the office is UTC+7, so 11:20 local is read as 04:20 and counted. | Run with `utcOffsetHours: 7` → Wednesday flips from Cơm tấm 4–3 to Bún chả 3–1. | With offset 7, a vote at `11:20+07:00` is not on time; one at `10:55+07:00` is. |

Trap to notice: fixing KITCHEN-44 does **not** fix Monday (KITCHEN-42) — two bugs, two layers.

## Git drill

During `git pull --rebase`, the conflict shows `HEAD` = the teammate's pushed commit and the
other side = your commit being replayed (the reverse of a merge). Correct resolution keeps both
changes:

```json
{
  "closesAt": "11:30",
  "utcOffsetHours": 7
}
```

Then `git add config.json && git rebase --continue`, and `git log --oneline --graph` shows your
commit on top of the teammate's.
