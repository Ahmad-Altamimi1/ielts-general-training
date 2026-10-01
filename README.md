# IELTS General Training

An interactive course for IELTS General Training, built from the print
student book. It does what paper cannot: marks instantly, shows why an
answer is wrong at the moment it is wrong, times practice, and keeps
progress.

No accounts, no server, no database. Everything is static and everything a
student does stays in their own browser.

```bash
npm install
npm run content   # build content/ from the Word book
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run content` | Regenerates `content/` and the search index from the Word book |
| `npm run dev` | Development server |
| `npm run build` | Production build; fails on a schema error |
| `npm test` | Marking-engine tests |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |

## Adding a new part

The Word book is the source of truth; `content/` is generated from it.

1. In the book, head the part `Part 12: Its Title` in **Heading 1**.
2. Add a line to the printed Contents page: `Part 12   Its Title: one line of summary`.
3. Head each section `12.1  Its Title` in **Heading 2**.
4. Run `npm run content`. The part, its route and its place in the sidebar,
   the search index and the progress page all follow.

## Adding a new exercise

1. Write the rubric, then the questions, numbered `1.` `2.` … — or lay the
   questions out as an exam panel (a form, a set of notes, lettered
   options), which the converter also reads.
2. Put the key in the appendix under a `B.n` heading, in a table with the
   columns `Q`, `Key` and `Why`. The `Why` column is required: it is the
   explanation the student is shown, and it is never invented for you.
3. Add `"b.n": "12.1"` to `KEYED_SECTION` in `tools/docx/exercises.ts` so
   the key is matched to the section.
4. Run `npm run content`. Anything the book does not supply is reported,
   not filled in.

Say "You have six minutes" in the rubric and the exercise gets a timer.

## How it is put together

- `content/` — **generated.** Fix the book and re-run; edits here are lost.
- `lib/content/schema.ts` — the zod schema. The single source of truth for
  content shape; `lib/content/registry.ts` validates every part on import,
  so a bad part fails `npm run build` with the path named.
- `lib/marking.ts` — the marking engine, with tests. Normalises
  presentation only. No fuzzy matching: IELTS penalises spelling, so a
  misspelling is marked wrong and the correct spelling is shown.
- `lib/progress.ts` — localStorage, validated on read, wrapped throughout.
- `tools/docx/` — the converter: `read-docx` extracts Word's own
  structure, `to-content` interprets it, neither invents anything.
- `app/globals.css` — every design token. Components hard-code no colours.

`DECISIONS.md` records every choice the brief did not dictate, and every
place where the book turned out not to have what the app needs.

## Known gaps in the source book

- **Appendix A is missing.** The book refers to it three times for the
  eight listening scripts; the file contains no Appendix A.
- **Three parts have no Contents-page summary**, so they are not generated:
  How to Use This Book, the answer-key appendix, and A Final Note.
- **Section 10.2's key has no explanations**, so its ten questions are
  shown as text rather than as a marked exercise.
- **Practice Test 1 has no key**, by the book's own decision — it says the
  key is held by the teacher. Its questions render as an exam paper.
