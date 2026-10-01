import { z } from "zod";

/* ===================================================================== *
 * Progress, kept in this browser.
 *
 * There is no account and no server, so a student's work lives in
 * localStorage under one key per exercise. Storage can be absent, full,
 * disabled, or hold something written by an older version of this app, so
 * every read is validated and every call is wrapped: the app must render
 * correctly when progress is empty or unavailable, which is also what a
 * first visit looks like.
 * ===================================================================== */

const PREFIX = "ielts:progress:";

const progressSchema = z.object({
  exerciseId: z.string().min(1),
  /** Question number → the response as typed or chosen. */
  responses: z.record(z.coerce.number().int(), z.string()),
  score: z.number().int().nonnegative(),
  total: z.number().int().positive(),
  /** ISO 8601, in UTC. */
  completedAt: z.string().min(1),
});

export type ExerciseProgress = z.infer<typeof progressSchema>;

export type ProgressMap = Readonly<Record<string, ExerciseProgress>>;

/** The snapshot used on the server and whenever storage cannot be read.
 *  Frozen and shared so its identity is stable. */
const EMPTY: ProgressMap = Object.freeze({});

function storage(): Storage | null {
  try {
    // Accessing localStorage throws outright in some privacy modes, so
    // the guard has to be inside the try, not a typeof check outside it.
    const store = window.localStorage;
    const probe = `${PREFIX}__probe__`;
    store.setItem(probe, "1");
    store.removeItem(probe);
    return store;
  } catch {
    return null;
  }
}

function readAll(): ProgressMap {
  const store = storage();
  if (!store) return EMPTY;

  const out: Record<string, ExerciseProgress> = {};
  try {
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (!key?.startsWith(PREFIX)) continue;
      const raw = store.getItem(key);
      if (!raw) continue;

      try {
        const parsed = progressSchema.safeParse(JSON.parse(raw));
        // Anything that does not fit is ignored rather than repaired:
        // a half-understood record would show the student a wrong score.
        if (parsed.success) out[parsed.data.exerciseId] = parsed.data;
      } catch {
        // Not JSON. Leave it alone and carry on.
      }
    }
  } catch {
    return EMPTY;
  }

  return out;
}

/* -- the store ---------------------------------------------------------- *
 * Exposed as an external store so React can read it with
 * useSyncExternalStore: the server renders the empty state, hydration
 * matches it, and the real values arrive in the same commit.
 * ---------------------------------------------------------------------- */

let cache: ProgressMap | null = null;
const listeners = new Set<() => void>();

function invalidate(): void {
  cache = null;
  for (const listener of listeners) listener();
}

export function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  // Another tab writing progress is a change in this one too.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key.startsWith(PREFIX)) invalidate();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Cached, so that repeated reads inside one render return the same
 *  object — useSyncExternalStore requires a stable snapshot. */
export function getSnapshot(): ProgressMap {
  cache ??= readAll();
  return cache;
}

export function getServerSnapshot(): ProgressMap {
  return EMPTY;
}

/* -- writes ------------------------------------------------------------- */

export function saveProgress(
  entry: Omit<ExerciseProgress, "completedAt"> & { completedAt?: string },
): void {
  const store = storage();
  if (!store) return;

  const record: ExerciseProgress = {
    ...entry,
    completedAt: entry.completedAt ?? new Date().toISOString(),
  };

  try {
    store.setItem(`${PREFIX}${record.exerciseId}`, JSON.stringify(record));
  } catch {
    // Quota exceeded, or storage disabled between the probe and now.
    // The exercise stays usable; only the record is lost.
    return;
  }
  invalidate();
}

export function clearExercise(exerciseId: string): void {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(`${PREFIX}${exerciseId}`);
  } catch {
    return;
  }
  invalidate();
}

export function clearAllProgress(): void {
  const store = storage();
  if (!store) return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (key?.startsWith(PREFIX)) keys.push(key);
    }
    for (const key of keys) store.removeItem(key);
  } catch {
    return;
  }
  invalidate();
}

/** True when this browser will keep a record at all. Used to tell the
 *  student plainly, rather than silently losing their work. */
export function storageAvailable(): boolean {
  return storage() !== null;
}
