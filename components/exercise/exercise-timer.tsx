"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

function clock(totalSeconds: number): string {
  const seconds = Math.abs(totalSeconds);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

function spoken(totalSeconds: number): string {
  const seconds = Math.abs(totalSeconds);
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  const parts: string[] = [];
  if (minutes > 0) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  if (rest > 0 || minutes === 0)
    parts.push(`${rest} second${rest === 1 ? "" : "s"}`);
  return parts.join(" ");
}

/**
 * A timer for an exercise that the book gives a time for.
 *
 * It does not submit anything when it reaches zero. It turns over and
 * counts up instead, because running over is information a student needs —
 * how far over, and on which question type — and not a failure state.
 * The overrun is stated in words as well as in colour.
 */
export function ExerciseTimer({
  limitSeconds,
  exerciseTitle,
}: {
  limitSeconds: number;
  exerciseTitle: string;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const remaining = limitSeconds - elapsed;
  const over = remaining < 0;

  // Derived, not stored: the live region speaks once, when this string
  // changes from empty. A region that ticks every second is unusable with
  // a screen reader.
  const announcement = over
    ? `Time is up for ${exerciseTitle}. The timer is now counting up. You can keep working.`
    : "";

  const reset = () => {
    setRunning(false);
    setElapsed(0);
  };

  return (
    <div className="print-hidden flex flex-wrap items-center gap-x-3 gap-y-2">
      <p aria-hidden="true" className="flex items-baseline gap-2">
        <span
          className={`font-heading text-2xl font-semibold tabular-nums ${
            over ? "text-timer-overrun" : "text-timer-running"
          }`}
        >
          {over ? "+" : ""}
          {clock(remaining)}
        </span>
        <span
          className={`text-xs ${over ? "text-timer-overrun" : "text-ink-muted"}`}
        >
          {over ? "over the time" : `of ${clock(limitSeconds)} allowed`}
        </span>
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setRunning((r) => !r)}
          aria-label={
            running
              ? `Pause the timer for ${exerciseTitle}`
              : `Start the timer for ${exerciseTitle}`
          }
        >
          {running ? (
            <Pause aria-hidden="true" className="size-3.5" />
          ) : (
            <Play aria-hidden="true" className="size-3.5" />
          )}
          {running ? "Pause" : elapsed === 0 ? "Start" : "Resume"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={reset}
          disabled={elapsed === 0 && !running}
          aria-label={`Reset the timer for ${exerciseTitle}`}
        >
          <RotateCcw aria-hidden="true" className="size-3.5" />
          Reset
        </Button>
      </div>

      {/* The time itself is never read aloud as it ticks; only the one
          state change that matters is announced. */}
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <p className="sr-only">
        {over
          ? `${spoken(remaining)} over the allowed time.`
          : `${spoken(remaining)} remaining of ${spoken(limitSeconds)}.`}
      </p>
    </div>
  );
}
