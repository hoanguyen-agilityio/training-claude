# training-claude

Study notes and practice exercises for the official Claude courses on
[Anthropic Academy](https://academy.claude.com/). The goal is to build durable AI fluency: knowing
when to hand work to Claude, how to describe it, how to judge the output, and how to stay
accountable for what ships.

Each course gets one summary file covering every lesson: its key ideas, the exercises to practice,
and a quick-reference table at the end. Course summaries are written in Vietnamese.

## Getting started

1. **Clone the repository**

   ```bash
   # SSH
   git clone git@gitlab.asoft-python.com:hoa.nguyen/training-claude.git
   # or HTTPS
   git clone https://gitlab.asoft-python.com/hoa.nguyen/training-claude.git

   cd training-claude
   ```

2. **Create your notes folder.** `anthropic-academy/` is listed in `.gitignore`, so it is not
   part of the clone. Everything you write there stays on your machine and is never committed.

   ```bash
   mkdir -p anthropic-academy/<course-slug>
   ```

   That is why the summary links in the **Courses** table below only open on a machine that
   already has the notes.

3. **Take a course.** Open its course page from the **Courses** table, sign in to Anthropic
   Academy, and work through the lessons in order.

4. **Write your summary** in `anthropic-academy/<course-slug>/README.md`, following
   [Adding a new course](#adding-a-new-course).

5. **Practice.** Run each lesson's exercise against your own tasks. See
   [How to practice](#how-to-practice).

6. **Stay up to date.** Pull the latest README and course list before starting a new course:

   ```bash
   git pull origin main
   ```

## Repository layout

```
training-claude/
├── .gitignore                    # ignores anthropic-academy/ (notes stay local)
├── README.md                     # this file: index of all courses
└── <source>/                     # where the course comes from, e.g. anthropic-academy (not committed)
    └── <course-slug>/            # slug matches the course URL
        └── README.md             # lesson-by-lesson summary + practice
```

## Courses

### Anthropic Academy

Summary links point to the local, git-ignored notes. Use the **course page** link to take the
course.

| Course | What it covers | Notes |
|---|---|---|
| [AI Fluency: Framework & Foundations](anthropic-academy/ai-fluency-framework-foundations/README.md) | The 4D Framework for working with AI: Delegation, Description, Discernment, Diligence | 14 lessons · [course page](https://academy.claude.com/courses/ai-fluency-framework-foundations) |
| [AI Capabilities and Limitations](anthropic-academy/ai-capabilities-and-limitations/README.md) | The four properties of generative AI: Next Token Prediction, Knowledge, Working Memory, Steerability | 13 lessons · ~3.5 h · [course page](https://academy.claude.com/courses/ai-capabilities-and-limitations) |

**Suggested order:** both courses stand alone. *AI Capabilities and Limitations* covers how the
model behaves; *AI Fluency* covers the human skills that respond to that behavior. Taking them
together gives the complete picture.

## Adding a new course

1. Create `<source>/<course-slug>/README.md`, using the slug from the course URL.
2. Follow the existing summaries: course link and duration at the top, then for each lesson its
   key ideas and a **Practice** section, and a quick-reference table at the end.
3. Mark any lesson whose content couldn't be read (for example, interactive *Try It Out*
   activities) instead of guessing at it.
4. Add a row to the **Courses** table above.

## How to practice

The notes are meant to be used, not just read:

- Keep a running list of 4–6 real tasks you use Claude for, and re-run each lesson's exercise
  against that list.
- Before trusting an output, ask which property might be failing (prediction, knowledge, memory,
  steerability) and pick the matching fix.
- Pick one concrete habit change per week (a verification step, standing context, a checkpoint,
  or stating the goal and not just the format) and write it down.
