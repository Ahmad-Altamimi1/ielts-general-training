"use client";

import { createContext, useContext, useMemo } from "react";

import { useAllProgress } from "@/hooks/use-progress";
import {
  computeStats,
  type ExerciseMeta,
  type StudyStats,
} from "@/lib/study-stats";

const ExercisesContext = createContext<readonly ExerciseMeta[]>([]);

/**
 * Every exercise in the book, in order, available anywhere in the app.
 *
 * Mounted once in the root layout so that a card deep inside a section
 * can answer "what comes next?" without the page having to thread it
 * down, and so the figures on the landing page and the progress page are
 * computed from one list.
 */
export function StudyProvider({
  exercises,
  children,
}: {
  exercises: ExerciseMeta[];
  children: React.ReactNode;
}) {
  return (
    <ExercisesContext.Provider value={exercises}>
      {children}
    </ExercisesContext.Provider>
  );
}

export function useExercises(): readonly ExerciseMeta[] {
  return useContext(ExercisesContext);
}

export function useStudyStats(): StudyStats {
  const exercises = useExercises();
  const progress = useAllProgress();
  return useMemo(
    () => computeStats(exercises, progress),
    [exercises, progress],
  );
}

/** The exercise after this one, for the "what next" prompt. */
export function useNextExercise(afterId: string): ExerciseMeta | null {
  const exercises = useExercises();
  const progress = useAllProgress();

  return useMemo(() => {
    const index = exercises.findIndex((e) => e.id === afterId);
    if (index === -1) return null;
    const rest = exercises.slice(index + 1);
    // Prefer something not yet done; fall back to simply the next one.
    return rest.find((e) => !progress[e.id]) ?? rest[0] ?? null;
  }, [exercises, progress, afterId]);
}
