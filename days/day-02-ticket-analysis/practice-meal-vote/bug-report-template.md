# Bug report template

Copy this for each bug. The bar: a dev who has never seen the bug reproduces it from this report
alone, without asking you anything.

```markdown
## <TICKET-ID> — <symptom in one line, not a guess at the cause>

**Environment**
- OS / Node version: <`node --version`>
- Folder + commit: <path> @ <`git rev-parse --short HEAD`>
- Config: <relevant config values, e.g. config.json>
- Data: <exact input file(s) used>

**Steps to reproduce**
1. <command or click, copy-pasteable>
2. ...

**Expected**
<what should happen, and the source of that expectation (ticket, spec, reporter's answer)>

**Actual**
<what happens, with exact output / error / stack trace>

**Frequency**
<always / sometimes (N of M runs) / only with <data/config>>

**Layer (my diagnosis)**
<config | code | data> — <one line of evidence: the experiment that showed it>

**Open questions for the reporter**
- <anything the fix depends on that the ticket doesn't say>
```

## Self-check before you hand it over

- [ ] Every step is copy-pasteable; no "run the app" without the command.
- [ ] Expected says *why* it's expected, not just what you'd like.
- [ ] Actual is pasted output, not a paraphrase.
- [ ] Environment names the exact data file and config values.
- [ ] Layer is backed by an experiment you ran, not by the stack trace alone.
- [ ] A teammate followed it without asking you anything (or Claude did; see README, Step 6).
