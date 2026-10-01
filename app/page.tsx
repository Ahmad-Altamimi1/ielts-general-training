import { BookOpen, ListChecks, MessageSquare, Timer } from "lucide-react";

import { PartCard } from "@/components/home/part-card";
import { BandPanel } from "@/components/study/band-panel";
import { NextUp } from "@/components/study/next-up";
import { WeakSpots } from "@/components/study/weak-spots";
import { navTree } from "@/lib/content/nav";
import { allExercises } from "@/lib/content/registry";
import { COURSE } from "@/lib/course";

const PROMISE_ICONS = [ListChecks, BookOpen, Timer, MessageSquare] as const;

export default function HomePage() {
  const tree = navTree();

  const questions = allExercises.reduce(
    (n, { exercise }) => n + exercise.questions.length,
    0,
  );
  const sections = tree.reduce((n, part) => n + part.sections.length, 0);

  return (
    <div className="mx-auto w-full max-w-6xl pb-10">
      {/* ---- Hero ---------------------------------------------------- */}
      <section className="relative overflow-hidden rounded-2xl border border-layer-border bg-layer-raised">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_120%_at_12%_0%,var(--wash-blue)_0%,transparent_55%),radial-gradient(70%_110%_at_100%_10%,var(--wash-rose)_0%,transparent_50%)]"
        />

        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
          <p className="font-heading inline-flex items-center gap-2 rounded-full border border-layer-border bg-layer-raised px-3 py-1 text-[0.6875rem] font-bold tracking-wider text-brand uppercase">
            {COURSE.level}
          </p>

          <h1 className="font-heading mt-5 max-w-3xl text-4xl leading-[1.08] font-bold tracking-tight text-balance sm:text-6xl">
            {COURSE.title}
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
            {COURSE.tagline}
          </p>

          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            {[
              { n: tree.length, label: "parts" },
              { n: sections, label: "sections" },
              { n: questions, label: "marked questions" },
              { n: allExercises.length, label: "exercises" },
            ].map((stat) => (
              <div key={stat.label}>
                <dd className="font-heading text-3xl font-bold tabular-nums">
                  {stat.n}
                </dd>
                <dt className="mt-0.5 text-sm text-ink-muted">{stat.label}</dt>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            <NextUp />
          </div>

          <p className="mt-8 flex items-center gap-3 border-t border-layer-border pt-5">
            <span
              aria-hidden="true"
              className="font-heading flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-ink"
            >
              {COURSE.teacherName.slice(0, 1)}
            </span>
            <span>
              <span className="block text-xs tracking-wide text-ink-muted uppercase">
                {COURSE.teacherRole}
              </span>
              <span className="font-heading block font-semibold tracking-tight">
                {COURSE.teacherName}
              </span>
            </span>
          </p>
        </div>
      </section>

      {/* ---- Where the student stands -------------------------------- */}
      <section className="mt-6 grid gap-3 lg:grid-cols-2" aria-label="Your standing">
        <BandPanel />
        <WeakSpots />
      </section>

      {/* ---- What it does -------------------------------------------- */}
      <section className="mt-12" aria-labelledby="what-this-does">
        <h2
          id="what-this-does"
          className="font-heading text-xs font-bold tracking-wider text-ink-muted uppercase"
        >
          What this does that paper cannot
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COURSE.promises.map((promise, i) => {
            const Icon = PROMISE_ICONS[i] ?? ListChecks;
            return (
              <li key={promise.title} className="panel rounded-xl p-5">
                <span
                  aria-hidden="true"
                  className="flex size-9 items-center justify-center rounded-lg bg-tone-wash text-tone"
                >
                  <Icon className="size-4.5" />
                </span>
                <h3 className="font-heading mt-3.5 font-semibold">
                  {promise.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {promise.body}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ---- The course ---------------------------------------------- */}
      <section className="mt-12" aria-labelledby="contents">
        <h2
          id="contents"
          className="font-heading text-xs font-bold tracking-wider text-ink-muted uppercase"
        >
          The course
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tree.map((part) => (
            <li key={part.id}>
              <PartCard part={part} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
