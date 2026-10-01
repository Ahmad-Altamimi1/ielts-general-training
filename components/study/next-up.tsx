"use client";

import Link from "next/link";
import { ArrowRight, Flame, Play } from "lucide-react";

import { useStudyStats } from "@/components/study/study-context";
import { useIsHydrated } from "@/hooks/use-hydrated";

/**
 * One card that answers "what now?".
 *
 * There is never a dead end: before anything is attempted it points at
 * the first exercise, afterwards at the first unmarked one, and when
 * everything is done it sends the student back to their weakest type.
 * The streak sits beside it because the thing that moves a band is
 * turning up again tomorrow.
 */
export function NextUp() {
  const stats = useStudyStats();
  const hydrated = useIsHydrated();

  const weakest = stats.byKind[0];
  const target = stats.next
    ? {
        href: stats.next.href,
        title: stats.next.title,
        where: `${stats.next.partLabel} · ${stats.next.sectionId} ${stats.next.sectionTitle}`,
        tone: stats.next.tone,
        lead: stats.attempted === 0 ? "Start here" : "Next up",
      }
    : weakest
      ? {
          href: weakest.href,
          title: weakest.label,
          where: "Your weakest question type — go again",
          tone: "rose",
          lead: "Everything marked once",
        }
      : null;

  if (!target) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <Link
        href={target.href}
        data-tone={target.tone}
        className="group panel tone-field flex flex-1 items-center gap-4 rounded-xl px-5 py-4 transition hover:panel-lift"
      >
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-tone text-brand-ink"
        >
          <Play className="size-4 translate-x-px fill-current" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="font-heading block text-[0.6875rem] font-bold tracking-wider text-tone uppercase">
            {target.lead}
          </span>
          <span className="font-heading mt-0.5 block truncate font-semibold">
            {target.title}
          </span>
          <span className="mt-0.5 block truncate text-sm text-ink-muted">
            {target.where}
          </span>
        </span>

        <ArrowRight
          aria-hidden="true"
          className="size-5 shrink-0 text-tone transition-transform group-hover:translate-x-0.5"
        />
      </Link>

      {/* A streak is only worth showing once there is one. */}
      {hydrated && stats.streak > 0 ? (
        <div
          data-tone="amber"
          className="panel tone-field flex items-center gap-3 rounded-xl px-5 py-4 sm:w-44 sm:flex-col sm:items-start sm:justify-center"
        >
          <Flame aria-hidden="true" className="size-5 shrink-0 text-tone" />
          <p>
            <span className="font-heading text-2xl font-bold tabular-nums">
              {stats.streak}
            </span>
            <span className="ml-1.5 text-sm text-ink-muted">
              day{stats.streak === 1 ? "" : "s"} in a row
            </span>
            <span className="mt-0.5 block text-xs text-ink-muted">
              {stats.practisedToday
                ? "Done for today."
                : "Nothing done today yet."}
            </span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
