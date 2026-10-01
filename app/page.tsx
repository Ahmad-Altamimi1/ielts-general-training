import Link from "next/link";
import { ArrowRight, BookOpen, ListChecks, Timer } from "lucide-react";

import { navTree } from "@/lib/content/nav";
import { allExercises } from "@/lib/content/registry";
import { COURSE } from "@/lib/course";

const PROMISE_ICONS = [ListChecks, BookOpen, Timer, ArrowRight] as const;

export default function HomePage() {
  const tree = navTree();
  const first = tree.find((part) => part.sections.length > 0);
  const questions = allExercises.reduce(
    (n, { exercise }) => n + exercise.questions.length,
    0,
  );
  const sections = tree.reduce((n, part) => n + part.sections.length, 0);

  return (
    <div className="mx-auto w-full max-w-6xl pb-8">
      <header className="border-b border-layer-border pb-10">
        <p className="font-heading text-sm font-semibold tracking-wide text-brand uppercase">
          {COURSE.level}
        </p>

        <h1 className="font-heading measure mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {COURSE.title}
        </h1>

        <p className="measure mt-4 text-lg text-ink-muted">{COURSE.tagline}</p>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link
            href={first ? first.sections[0].href : "/progress"}
            className="font-heading inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-brand-ink hover:opacity-90"
          >
            Start the course
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>

          <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-baseline gap-1.5">
              <dt className="sr-only">Parts</dt>
              <dd className="font-heading font-semibold tabular-nums">
                {tree.length}
              </dd>
              <span className="text-ink-muted">parts</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="sr-only">Sections</dt>
              <dd className="font-heading font-semibold tabular-nums">
                {sections}
              </dd>
              <span className="text-ink-muted">sections</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="sr-only">Marked questions</dt>
              <dd className="font-heading font-semibold tabular-nums">
                {questions}
              </dd>
              <span className="text-ink-muted">marked questions</span>
            </div>
          </dl>
        </div>

        <p className="mt-8 inline-block rounded-md border-l-4 border-brand bg-layer-raised py-2.5 pr-5 pl-4">
          <span className="block text-xs tracking-wide text-ink-muted uppercase">
            {COURSE.teacherRole}
          </span>
          <span className="font-heading mt-0.5 block text-xl font-semibold tracking-tight">
            {COURSE.teacherName}
          </span>
        </p>
      </header>

      <section className="mt-10" aria-labelledby="what-this-does">
        <h2
          id="what-this-does"
          className="font-heading text-xs font-semibold tracking-wide text-ink-muted uppercase"
        >
          What this does that paper cannot
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COURSE.promises.map((promise, i) => {
            const Icon = PROMISE_ICONS[i] ?? ListChecks;
            return (
              <li
                key={promise.title}
                className="rounded-md border border-layer-border bg-layer-raised p-4"
              >
                <Icon aria-hidden="true" className="size-5 text-brand" />
                <h3 className="font-heading mt-2.5 text-sm font-semibold">
                  {promise.title}
                </h3>
                <p className="mt-1 text-sm text-ink-muted">{promise.body}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <nav aria-label="Course contents" className="mt-12">
        <h2 className="font-heading text-xs font-semibold tracking-wide text-ink-muted uppercase">
          Contents
        </h2>
        <ul className="mt-3 grid gap-3 md:grid-cols-2">
          {tree.map((part) => (
            <li key={part.id}>
              <Link
                href={part.href}
                className="group flex h-full gap-4 rounded-md border border-layer-border bg-layer-raised p-4 hover:border-brand"
              >
                <span className="font-heading w-14 shrink-0 text-xs font-semibold tracking-wide text-brand uppercase">
                  {part.label}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-heading block font-semibold">
                    {part.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-ink-muted">
                    {part.summary}
                  </span>
                  {part.sections.length > 0 ? (
                    <span className="mt-2 block text-xs text-ink-muted tabular-nums">
                      {part.sections.length} sections
                      {part.exerciseIds.length > 0
                        ? ` · ${part.exerciseIds.length} exercises`
                        : ""}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
