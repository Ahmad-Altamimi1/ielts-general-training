import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/nav/breadcrumbs";
import { ProgressList } from "@/components/progress/progress-list";
import {
  allExercises,
  partLabel,
  sectionHref,
} from "@/lib/content/registry";

export const metadata: Metadata = {
  title: "Your progress",
  description:
    "Every exercise in the course, with the score from your last attempt.",
};

export default function ProgressPage() {
  const exercises = allExercises.map(({ part, section, exercise }) => ({
    id: exercise.id,
    title: exercise.title,
    questionCount: exercise.questions.length,
    partLabel: partLabel(part),
    sectionId: section.id,
    sectionTitle: section.title,
    href: sectionHref(part.id, section.id),
  }));

  return (
    <div>
      <Breadcrumbs
        trail={[{ label: "Course", href: "/" }, { label: "Your progress" }]}
      />

      <header className="mt-4">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Your progress
        </h1>
        <p className="measure mt-3 text-ink-muted">
          Every exercise in the course, with the score from your last
          attempt. Your work is kept in this browser only — it is not sent
          anywhere, and it will not follow you to another device.
        </p>
      </header>

      <ProgressList exercises={exercises} />
    </div>
  );
}
