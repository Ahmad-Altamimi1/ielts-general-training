import { describe, expect, it } from "vitest";

import listeningLab from "../listening-lab";
import type { Block, Exercise } from "@/lib/content/schema";

/* ===================================================================== *
 * Every answer in the Listening Lab must be a thing the recording
 * actually says.
 *
 * The questions here were written by reading the transcripts, and reading
 * is exactly how a wrong answer gets in: a number misremembered, a name
 * half-copied, a word that felt right. This checks each accepted answer
 * against the transcript of the recording it belongs to, so a mistake
 * fails the build instead of teaching a student the wrong thing.
 *
 * Letters — the answers to multiple choice and matching — are checked
 * differently: they have to be options the student was actually offered.
 * ===================================================================== */

/** Lower-cased, punctuation-light, so "ReSkill" matches "ReSkill UA" and
 *  "$59" matches "59". */
function flatten(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9'$% ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type Unit = { exercises: Exercise[]; transcript: string };

/** Each section pairs one script with the exercises written on it. */
const units: Unit[] = listeningLab.sections.map((section) => {
  const script = section.blocks.find(
    (b): b is Extract<Block, { kind: "script" }> => b.kind === "script",
  );
  const exercises = section.blocks
    .filter((b): b is Extract<Block, { kind: "exercise" }> =>
      b.kind === "exercise",
    )
    .map((b) => b.exercise);

  return {
    exercises,
    transcript: flatten(script?.lines.map((l) => l.text).join(" ") ?? ""),
  };
});

describe("Listening Lab", () => {
  it("has a script and at least one exercise in every section", () => {
    expect(units).toHaveLength(8);
    for (const unit of units) {
      expect(unit.transcript.length).toBeGreaterThan(500);
      expect(unit.exercises.length).toBeGreaterThan(0);
    }
  });

  it("every recording carries its credit and its audio", () => {
    for (const section of listeningLab.sections) {
      const script = section.blocks.find((b) => b.kind === "script");
      expect(script, `${section.id} has no script`).toBeDefined();
      if (script?.kind !== "script") return;
      expect(script.audio, `${section.id} has no audio`).toMatch(
        /^\/audio\/voa\/.+\.mp3$/,
      );
      expect(script.credit, `${section.id} has no credit`).toContain(
        "Voice of America",
      );
      expect(script.creditUrl).toContain("learningenglish.voanews.com");
    }
  });

  it("every written answer appears in the recording it belongs to", () => {
    const missing: string[] = [];

    for (const unit of units) {
      for (const exercise of unit.exercises) {
        // Letters are checked against the options, not the transcript.
        if (exercise.kind === "mcq" || exercise.kind === "matching") continue;

        for (const question of exercise.questions) {
          const found = question.answers.some((answer) =>
            unit.transcript.includes(flatten(answer)),
          );
          if (!found) {
            missing.push(
              `${exercise.id} q${question.n}: none of ${JSON.stringify(question.answers)} is said in the recording`,
            );
          }
        }
      }
    }

    expect(missing).toEqual([]);
  });

  it("every letter answer is one of the options offered", () => {
    const wrong: string[] = [];

    for (const unit of units) {
      for (const exercise of unit.exercises) {
        for (const question of exercise.questions) {
          if (exercise.kind === "mcq") {
            const ids = new Set(question.choices?.map((c) => c.id));
            for (const answer of question.answers) {
              if (!ids.has(answer)) {
                wrong.push(`${exercise.id} q${question.n}: "${answer}" is not a choice`);
              }
            }
          }
          if (exercise.kind === "matching") {
            const letters = new Set(
              (exercise.options ?? []).map((o) => o.trim()[0]),
            );
            for (const answer of question.answers) {
              if (!letters.has(answer.trim()[0])) {
                wrong.push(`${exercise.id} q${question.n}: "${answer}" is not an option`);
              }
            }
          }
        }
      }
    }

    expect(wrong).toEqual([]);
  });

  it("explains every question, because that is the point", () => {
    for (const unit of units) {
      for (const exercise of unit.exercises) {
        for (const question of exercise.questions) {
          expect(
            question.why.length,
            `${exercise.id} q${question.n} has a thin explanation`,
          ).toBeGreaterThan(60);
        }
      }
    }
  });
});
