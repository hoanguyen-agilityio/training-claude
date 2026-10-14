# Backlog — Kitchen meal vote

Five tickets as reporters actually write them. Quality varies on purpose.

---

## KITCHEN-42 — Menu winner is wrong sometimes

Reporter: office manager · Priority: High

> On Monday everyone told me they voted for phở but the screen said cơm tấm won. This has
> happened before. Please fix the voting.

---

## KITCHEN-43 — Results crash on Tuesday

Reporter: Bình (dev) · Priority: High

> Running the results script for Tuesday's export crashes:
>
> ```text
> TypeError: Cannot read properties of null (reading 'at')
>     at isOnTime (vote-tally.js:6:28)
>     at tallyVotes (vote-tally.js:16:10)
>     at Object.<anonymous> (show-winner.js:6:23)
> ```
>
> Monday's file works fine. Probably a bug in isOnTime, can someone add a null check?

---

## KITCHEN-44 — Late votes are counted

Reporter: Chi (team lead) · Priority: Medium

> Voting closes at 11:00 but I'm pretty sure some people voted after lunch started and it still
> counted. Not fair to people who voted on time.

---

## KITCHEN-45 — Let people change their vote

Reporter: office manager · Priority: Low

> Sometimes people click the wrong meal. They should be able to change it.

---

## KITCHEN-46 — Make the winner announcement nicer

Reporter: Giang (marketing) · Priority: Low

> The winner message looks boring. Can we make it more fun? Maybe with emojis or something.
