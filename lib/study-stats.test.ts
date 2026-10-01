import { describe, expect, it } from "vitest";

import { computeStats, streakFrom, type ExerciseMeta } from "./study-stats";
import type { ProgressMap } from "./progress";

function meta(overrides: Partial<ExerciseMeta> = {}): ExerciseMeta {
  return {
    id: "ex-1",
    title: "Practice 1",
    kind: "tfng",
    paper: "reading",
    questionCount: 8,
    partId: "part-3",
    partLabel: "Part 3",
    sectionId: "3.5",
    sectionTitle: "True, False, Not Given",
    href: "/part-3/3.5",
    tone: "blue",
    ...overrides,
  };
}

function record(
  id: string,
  score: number,
  total: number,
  completedAt: string,
): ProgressMap[string] {
  return { exerciseId: id, responses: {}, score, total, completedAt };
}

describe("streakFrom", () => {
  it("counts an unbroken run ending today", () => {
    const days = new Set(["2026-10-02", "2026-10-01", "2026-09-30"]);
    expect(streakFrom(days, "2026-10-02")).toBe(3);
  });

  it("keeps the streak alive before today's practice", () => {
    // Opening the app in the morning must not appear to reset it.
    const days = new Set(["2026-10-01", "2026-09-30"]);
    expect(streakFrom(days, "2026-10-02")).toBe(2);
  });

  it("breaks after a missed day", () => {
    const days = new Set(["2026-10-02", "2026-09-29", "2026-09-28"]);
    expect(streakFrom(days, "2026-10-02")).toBe(1);
  });

  it("is zero when nothing was done yesterday or today", () => {
    const days = new Set(["2026-09-25"]);
    expect(streakFrom(days, "2026-10-02")).toBe(0);
  });

  it("is zero with no practice at all", () => {
    expect(streakFrom(new Set(), "2026-10-02")).toBe(0);
  });

  it("crosses a month boundary", () => {
    const days = new Set(["2026-10-01", "2026-09-30", "2026-09-29"]);
    expect(streakFrom(days, "2026-10-01")).toBe(3);
  });
});

describe("computeStats", () => {
  const exercises = [
    meta({ id: "a", kind: "tfng", paper: "reading" }),
    meta({ id: "b", kind: "gapfill", paper: "listening", partId: "part-2" }),
    meta({ id: "c", kind: "mcq", paper: "reading" }),
  ];

  it("reports an empty record without throwing", () => {
    const stats = computeStats(exercises, {});
    expect(stats.attempted).toBe(0);
    expect(stats.accuracy).toBe(0);
    expect(stats.byKind).toEqual([]);
    expect(stats.streak).toBe(0);
    expect(stats.next?.id).toBe("a");
  });

  it("totals marks across attempted exercises only", () => {
    const stats = computeStats(exercises, {
      a: record("a", 6, 8, "2026-10-02T09:00:00.000Z"),
      c: record("c", 2, 5, "2026-10-02T10:00:00.000Z"),
    });
    expect(stats.attempted).toBe(2);
    expect(stats.score).toBe(8);
    expect(stats.total).toBe(13);
  });

  it("puts the weakest question type first", () => {
    const stats = computeStats(exercises, {
      a: record("a", 7, 8, "2026-10-02T09:00:00.000Z"),
      c: record("c", 1, 5, "2026-10-02T09:00:00.000Z"),
    });
    expect(stats.byKind.map((k) => k.kind)).toEqual(["mcq", "tfng"]);
    expect(stats.byKind[0].accuracy).toBeCloseTo(0.2);
  });

  it("projects a band per paper from accuracy over forty", () => {
    // 30 of 40 in GT Reading is band 6 in the book's own table.
    const stats = computeStats(exercises, {
      a: record("a", 6, 8, "2026-10-02T09:00:00.000Z"),
    });
    const reading = stats.papers.find((p) => p.paper === "reading");
    expect(reading?.projected).toBe(30);
    expect(reading?.band).toBe(6);
    expect(reading?.next?.band).toBe(7);
    expect(reading?.next?.moreAnswers).toBe(4);
  });

  it("keeps papers apart", () => {
    const stats = computeStats(exercises, {
      a: record("a", 8, 8, "2026-10-02T09:00:00.000Z"),
      b: record("b", 2, 10, "2026-10-02T09:00:00.000Z"),
    });
    expect(stats.papers.find((p) => p.paper === "reading")?.projected).toBe(40);
    expect(stats.papers.find((p) => p.paper === "listening")?.projected).toBe(8);
  });

  it("points at the first unattempted exercise", () => {
    const stats = computeStats(exercises, {
      a: record("a", 8, 8, "2026-10-02T09:00:00.000Z"),
    });
    expect(stats.next?.id).toBe("b");
  });

  it("has nothing to point at once everything is done", () => {
    const stats = computeStats(exercises, {
      a: record("a", 8, 8, "2026-10-02T09:00:00.000Z"),
      b: record("b", 5, 10, "2026-10-02T09:00:00.000Z"),
      c: record("c", 3, 5, "2026-10-02T09:00:00.000Z"),
    });
    expect(stats.next).toBeNull();
  });
});
