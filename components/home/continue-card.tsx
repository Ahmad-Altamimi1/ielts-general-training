"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

import { useAllProgress } from "@/hooks/use-progress";
import { useIsHydrated } from "@/hooks/use-hydrated";

export type ResumePoint = {
  exerciseId: string;
  exerciseTitle: string;
  partLabel: string;
  partTitle: string;
  sectionId: string;
  sectionTitle: string;
  href: string;
  tone: string;
};

/**
 * Where to go next.
 *
 * Before anything has been attempted this is the first exercise in the
 * book; afterwards it is the first one still unmarked. Rendered from the
 * same list either way, so there is no empty state to design around and
 * nothing shifts when storage is unavailable.
 */
export function ContinueCard({ points }: { points: ResumePoint[] }) {
  const progress = useAllProgress();
  const hydrated = useIsHydrated();

  const next = points.find((p) => !progress[p.exerciseId]) ?? points.at(-1);
  if (!next) return null;

  const started = hydrated && points.some((p) => progress[p.exerciseId]);

  return (
    <Link
      href={next.href}
      data-tone={next.tone}
      className="group panel tone-field flex items-center gap-4 rounded-xl px-5 py-4 transition hover:panel-lift"
    >
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-tone text-brand-ink"
      >
        <Play className="size-4 translate-x-px fill-current" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="font-heading block text-[0.6875rem] font-bold tracking-wider text-tone uppercase">
          {started ? "Pick up where you left off" : "Start here"}
        </span>
        <span className="font-heading mt-0.5 block truncate font-semibold">
          {next.exerciseTitle}
        </span>
        <span className="mt-0.5 block truncate text-sm text-ink-muted">
          {next.partLabel} · {next.sectionId} {next.sectionTitle}
        </span>
      </span>

      <ArrowRight
        aria-hidden="true"
        className="size-5 shrink-0 text-tone transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
