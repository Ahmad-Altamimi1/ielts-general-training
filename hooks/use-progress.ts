"use client";

import { useSyncExternalStore } from "react";

import {
  getServerSnapshot,
  getSnapshot,
  subscribe,
  type ExerciseProgress,
  type ProgressMap,
} from "@/lib/progress";

/** Every exercise this browser has a record for. Empty on the server, on
 *  a first visit, and wherever storage is unavailable. */
export function useAllProgress(): ProgressMap {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useExerciseProgress(
  exerciseId: string,
): ExerciseProgress | null {
  return useAllProgress()[exerciseId] ?? null;
}
