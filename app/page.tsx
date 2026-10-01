import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { navTree } from "@/lib/content/nav";
import { COURSE } from "@/lib/course";

export default function HomePage() {
  const tree = navTree();
  const first = tree.find((part) => part.sections.length > 0);

  return (
    <div className="pb-8">
      <header className="border-b border-rule pb-10">
        <p className="font-heading text-sm font-semibold tracking-wide text-brand uppercase">
          {COURSE.level}
        </p>

        <h1 className="font-heading measure mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {COURSE.title}
        </h1>

        <p className="measure mt-4 text-lg text-ink-muted">
          {COURSE.tagline}
        </p>

        <p className="mt-8 border-l-4 border-brand pl-4 sm:pl-5">
          <span className="block text-xs tracking-wide text-ink-muted uppercase">
            {COURSE.teacherRole}
          </span>
          <span className="font-heading mt-0.5 block text-xl font-semibold tracking-tight">
            {COURSE.teacherName}
          </span>
        </p>

        {first ? (
          <p className="mt-8">
            <Link
              href={first.sections[0].href}
              className="font-heading inline-flex items-center gap-2 rounded-sm bg-brand px-4 py-2.5 text-sm font-semibold text-brand-ink hover:opacity-90"
            >
              Start with {first.sections[0].id} {first.sections[0].title}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </p>
        ) : null}
      </header>

      <section className="mt-10" aria-labelledby="what-this-does">
        <h2
          id="what-this-does"
          className="font-heading text-xs font-semibold tracking-wide text-ink-muted uppercase"
        >
          What this does that paper cannot
        </h2>
        <ul className="measure mt-4 grid gap-4 sm:grid-cols-2">
          {COURSE.promises.map((promise) => (
            <li key={promise.title}>
              <h3 className="font-heading text-sm font-semibold">
                {promise.title}
              </h3>
              <p className="mt-1 text-sm text-ink-muted">{promise.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <nav aria-label="Course contents" className="mt-12">
        <h2 className="font-heading text-xs font-semibold tracking-wide text-ink-muted uppercase">
          Contents
        </h2>
        <ul className="measure mt-3 border-t border-rule">
          {tree.map((part) => (
            <li key={part.id} className="border-b border-rule">
              <Link
                href={part.href}
                className="grid gap-x-3 py-3.5 hover:bg-surface-hover focus-visible:bg-surface-hover sm:grid-cols-[5.5rem_1fr]"
              >
                <span className="font-heading text-xs font-semibold tracking-wide text-brand uppercase sm:pt-0.5">
                  {part.label}
                </span>
                <span>
                  <span className="block">{part.title}</span>
                  <span className="block text-sm text-ink-muted">
                    {part.summary}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
