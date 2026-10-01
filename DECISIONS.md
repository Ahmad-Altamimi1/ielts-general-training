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
