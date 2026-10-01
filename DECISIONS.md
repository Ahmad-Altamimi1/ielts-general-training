# Decisions

Every choice the brief did not dictate, and every point where reality
differed from the brief. Newest section last.

## Milestone 1 — scaffold

**Versions installed.** Next.js 16.3.8 (App Router, Turbopack), React 19.2.8,
TypeScript 5, Tailwind CSS v4, shadcn CLI 4.21.1, `next-themes`, `zod`,
`vitest` 5. All current stable at time of writing.

**`@types/node` bumped from `^20` to `^22`.** `create-next-app` pinned `^20`;
`vitest` 5 requires `^22 || >=24` and the install failed on the peer conflict.
The machine runs Node 22.16, so `^22` is the version that matches reality.
Resolved by upgrading rather than `--legacy-peer-deps`, which would have left a
knowingly-wrong tree.

**CONFLICT WITH BRIEF — shadcn `new-york` style.** The brief specifies the
`new-york` style. shadcn CLI 4.x removed `--style` as a user-facing option and
replaced it with a base (`radix` / `base` / `aria`) plus a preset
(`nova`, `vega`, …). Internally the CLI still resolves component source to
`new-york-v4` when Tailwind v4 is detected, which is what we get. Initialised
with `--base radix` (the original shadcn/ui primitives, which is what the
brief's named components — Sidebar, Command, RadioGroup, Select, AlertDialog —
are built on) and `--preset nova` (Lucide icons, needed for the marking-state
icons the brief requires). Recorded as a conflict because the literal
instruction is no longer expressible.

**All components added per-component via the CLI**, as the brief requires:
`button card sidebar sheet command dialog radio-group select input label
alert-dialog breadcrumb separator badge collapsible tooltip skeleton`.

**Design token named `--brand`, not `--accent`.** shadcn already owns
`--accent` for its neutral hover surface. Putting the deep blue there would
have turned every hover state in the app blue, directly violating the brief's
"the accent appears on … nowhere else". The course accent is `--brand`.

**Marking-state colour.** The brief says the accent appears on marking states
*and* that one accent is the whole palette *and* that marking must not rely on
colour alone. Resolved as: correct takes the accent, incorrect stays ink and is
carried by its icon, its text label and a struck-through response. No red for
wrong answers. See the open question in `README.md`; this is a two-token change
if you want a second colour.

**Typography.** Body 17px/1.6 and passages 18px/1.7, both above the brief's
16px/1.5 floor. Sans is Geist (from the preset); the passage serif is
Source Serif 4, chosen because it is designed for continuous text at small
sizes rather than for display. Radius 0.25rem — near-square, since structure
comes from rules, not rounded cards.

**`hooks/use-mobile.ts` rewritten.** The version shadcn ships sets state inside
an effect, which Next 16's React Compiler lint rejects as an error, so the
brief's "zero lint warnings" was unreachable with the stock file. Rewritten on
`useSyncExternalStore`, the primitive intended for subscribing to a browser
API, which is also SSR-safe. Same fix applied to the theme toggle's
hydration flag via `hooks/use-hydrated.ts`. Rule not disabled.

**`shadcn` moved to `devDependencies`.** The CLI installs itself as a runtime
dependency; it is a build-time tool and does not belong in the bundle graph.

## Milestone 2 — content pipeline

**CONFLICT WITH BRIEF — there is no `content.json`.** The brief says it
would be supplied. What exists is the Word book,
`IELTS-GT-Student-Book.docx`. Rather than hand-transcribe 90 pages — which
would be writing course content, which the brief forbids — the book itself
is the source of truth and `tools/` converts it:

- `tools/docx/read-docx.ts` reads the .docx into a flat document model
  (paragraph style, run formatting, table grid) and decides nothing.
- `tools/docx/to-content.ts` interprets that model as content blocks.
- `tools/build-content.ts` validates each part and writes `content/`.

`npm run content` regenerates. Files under `content/` are generated, so the
fix for a content error is to fix the book and re-run.

**GAP IN THE BOOK — Appendix A is missing.** The book refers to "Appendix A"
three times (How to Use This Book, Part 10, and the Practice Test 1 rubric)
for the eight listening scripts. The .docx contains no Appendix A; the only
appendix present is the answer keys. Not invented. Listening sections will
render without their scripts until the appendix is supplied.

**GAP IN THE BOOK — three parts have no `summary`.** Part summaries come
from the printed Contents page, which supplies one for every numbered part
but not for `how-to-use-this-book`, `appendix-answer-keys` or
`a-final-note`. Reported by `npm run content` rather than filled in. Those
three parts are not generated until a line is supplied for each.

**DEVIATION FROM THE BRIEF'S MODEL — `Part.intro?: Block[]` added.** Most
parts print prose under the part title before the first numbered section.
The brief's `Part` has nowhere to put it, so the choice was to drop real
content or to invent a section heading for it. Added an optional field
instead. Nothing else in the model changed.

**Section ids keep the book's printed number** — "1.1", "3.5", "b.4" — so
that a student reading on paper and a student reading on screen are looking
at the same label. Sections with no printed number are slugified from the
title.

**Single-cell tables are classified by shape**, because the book uses the
same device for three things: a worked example ends in "Answer: X"; a
reading passage is long and carries a bold title; anything else is a
callout. A short, fully bold paragraph with no terminal punctuation is a
fourth-level heading, which is how the book writes those rather than
styling them as Heading4.

**The printed cover and Contents page are not converted.** The app builds
its own index from the content tree, so reproducing the printed one would
be a second thing to keep in sync. The Contents page is still parsed, for
the part summaries.

**Inline markdown is parsed to React nodes** by a ~30-line hand-written
parser, not a markdown library. The grammar is two rules wide and parsing
to nodes keeps content away from `dangerouslySetInnerHTML` entirely.

## Milestone 3 — navigation and search

**The search index is written by `npm run content`**, not by a separate
step, so it cannot drift from the content it indexes. It lands at
`public/search-index.json`, is fetched once on the first Cmd+K (or on
hover of the search button), and the dialog degrades to a plain message
pointing at the sidebar if the fetch fails.

**Ranking is a 20-line function, not a library.** Every query word must
appear somewhere, a title match outranks a body match, and an exact title
substring wins outright. No fuzzy matching, for the same reason the marking
engine refuses it. Section text is capped at 1200 characters per section to
keep the file small.

**`cmdk`'s own filtering is switched off** (`shouldFilter={false}` on
`Command`) because the ranking above is ours. Note that this CLI's
`CommandDialog` does not wrap its children in `Command`, unlike older
shadcn versions, so the command root is supplied in our own component.

**Breadcrumb separators are siblings of breadcrumb items.** The obvious
composition — separator inside the item — nests `<li>` inside `<li>`, which
is invalid HTML and failed hydration. Caught in the browser, not by the
build.

**The sidebar drawer closes on navigation on mobile**, since otherwise the
drawer covers the page the student just chose.

## Milestone 4 — exercise engine

**CONFLICT WITH BRIEF — "all five exercise kinds".** The brief's own
`Exercise` type lists six: `tfng`, `ynng`, `mcq`, `matching`, `gapfill`,
`headings`. All six are implemented, with the inputs the brief assigns:
`RadioGroup` for mcq, `Select` for tfng, ynng and headings, `Input` for
gapfill and matching.

**Questions and answers are joined across the book.** The book keeps them
apart on purpose — questions in the unit, keys in Appendix B — so that a
student does not see the key while working. `KEYED_SECTION` in
`tools/docx/exercises.ts` records which appendix section keys which unit,
read off the appendix's own headings ("B.4 Practice 4 …" keys section 3.5).
It is the one table to update if the book gains a unit.

**A question is detected by its formatting, not by a text pattern.** The
book sets every question number as its own bold run in `1A4E8A` — the same
deep blue the brief specifies as the accent. That makes the start of a
question unambiguous and immune to prose that happens to begin with a
number.

**The book's answer notation is expanded, not interpreted.** `FIFTEEN / 15`
becomes two accepted answers; `(A) MEDICAL CERTIFICATE` becomes both with
and without the article. A slash with no spaces around it is left alone,
because `14/3` is a date and not two answers. This is the only place
alternatives are created, and it reads them off the book.

**Exercise titles.** The book heads the questions themselves "Now do
these" but names the task "Practice 4" a little earlier, so the latter is
used. Where there is no such name, the rubric's own label is — "Questions
30 to 34". Nothing is invented.

**Marking-state colour, as flagged in Milestone 1.** Correct takes the
accent; incorrect stays ink and is told apart by its icon, its word, and
the struck-through response. No red. This keeps the brief's "one accent,
nowhere else" and its "never colour alone" at the same time, and it is the
one design point I would put back to you: a second colour for wrong
answers would be two tokens in `globals.css`.

**The timer runs on past zero** and states the overrun in words next to
the figure, so it is never the only signal. It never submits.

**The schema now checks that every accepted answer for a matching or
headings exercise is one of the options offered.** This caught a real bug:
the rubric parser read "A, B, C or D" as three options and dropped D,
while the key accepted it.

## Milestone 5 — progress

**Progress is read through `useSyncExternalStore`, not an effect.** The
server and the hydration pass see an empty record, the browser's real
record arrives in the same commit that reads it, and there is no
`setState` inside an effect for Next 16's lint to reject. A `storage`
event listener means a second tab's work shows up in this one.

**Stored records are validated with zod on every read.** localStorage can
hold anything — a record written by an older version, or edited by hand.
Anything that does not fit the schema is ignored rather than repaired,
because a half-understood record would show the student a score that is
not theirs.

**Storage is probed, not assumed.** Some privacy modes throw on the very
act of touching `localStorage`, so the guard is a write-and-remove inside
a `try`, not a `typeof` check. When storage is unavailable the progress
page says so plainly: every exercise still marks itself, only the record
is lost.

**A saved attempt shows through until the student touches the exercise.**
Local state starts as null and the saved record is what renders; the first
interaction takes over. That restores an attempt across a reload without
copying storage into state.

**Dates are formatted in a fixed `en-GB`/UTC format**, so the server
render and the browser's own locale cannot disagree.
