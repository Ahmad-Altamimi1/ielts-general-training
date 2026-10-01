import { describe, expect, it } from "vitest";

import { markExercise, markQuestion, matches, normalise } from "./marking";
import type { Exercise, Question } from "@/lib/content/schema";

function question(overrides: Partial<Question> = {}): Question {
  return {
    n: 1,
    prompt: "A prompt",
    answers: ["answer"],
    why: "Because.",
    ...overrides,
  };
}

/* -- normalisation ----------------------------------------------------- */

describe("normalise", () => {
  it("trims and collapses internal whitespace", () => {
    expect(normalise("  swimming    cap  ")).toBe("swimming cap");
    expect(normalise("swimming\tcap")).toBe("swimming cap");
    expect(normalise("swimming cap")).toBe("swimming cap");
  });

  it("lowercases", () => {
    expect(normalise("HADDAD")).toBe("haddad");
    expect(normalise("Not Given")).toBe("not given");
  });

  it("strips surrounding punctuation", () => {
    expect(normalise("portal.")).toBe("portal");
    expect(normalise("portal,")).toBe("portal");
    expect(normalise("(portal)")).toBe("portal");
    expect(normalise("portal!")).toBe("portal");
  });

  it("strips surrounding quotation marks, straight and curly", () => {
    expect(normalise('"portal"')).toBe("portal");
    expect(normalise("'portal'")).toBe("portal");
    expect(normalise("“portal”")).toBe("portal");
    expect(normalise("‘portal’")).toBe("portal");
  });

  it("keeps punctuation inside an answer", () => {
    expect(normalise("st. john's")).toBe("st. john's");
  });

  it("treats & and and as equal", () => {
    expect(normalise("finance & payroll")).toBe("finance and payroll");
    expect(normalise("finance&payroll")).toBe("finance and payroll");
    expect(normalise("finance and payroll")).toBe("finance and payroll");
  });

  it("treats a hyphen and a space as the same separator", () => {
    expect(normalise("role-play")).toBe("role play");
    expect(normalise("role play")).toBe("role play");
    expect(normalise("role–play")).toBe("role play");
  });
});

/* -- matching ---------------------------------------------------------- */

describe("matches", () => {
  it("never penalises case", () => {
    expect(matches("haddad", "HADDAD")).toBe(true);
    expect(matches("HaDdAd", "haddad")).toBe(true);
  });

  it("accepts an answer that differs only in spacing", () => {
    expect(matches("  swimming  cap ", "SWIMMING CAP")).toBe(true);
  });

  it("accepts role play for role-play and the reverse", () => {
    expect(matches("role play", "role-play")).toBe(true);
    expect(matches("role-play", "role play")).toBe(true);
  });

  it("accepts & for and and the reverse", () => {
    expect(matches("finance & payroll", "FINANCE AND PAYROLL")).toBe(true);
    expect(matches("finance and payroll", "FINANCE & PAYROLL")).toBe(true);
  });

  it("drops a leading article when the key has none", () => {
    expect(matches("a medical certificate", "MEDICAL CERTIFICATE")).toBe(true);
    expect(matches("the portal", "PORTAL")).toBe(true);
    expect(matches("an archive", "ARCHIVE")).toBe(true);
  });

  it("drops a leading article when the response has none", () => {
    expect(matches("medical certificate", "A MEDICAL CERTIFICATE")).toBe(true);
    expect(matches("portal", "THE PORTAL")).toBe(true);
  });

  it("does not treat one article as another", () => {
    // The key chose "the"; "a book" is a different noun phrase.
    expect(matches("a book", "the book")).toBe(false);
  });

  it("does not strip a word that merely starts with an article", () => {
    expect(matches("answer", "the answer")).toBe(true);
    expect(matches("theatre", "the atre")).toBe(false);
  });

  /* The rules the engine must refuse. */

  it("rejects a misspelling, however near", () => {
    expect(matches("recieve", "receive")).toBe(false);
    expect(matches("portl", "portal")).toBe(false);
    expect(matches("portals", "portal")).toBe(false);
    expect(matches("haddadd", "haddad")).toBe(false);
  });

  it("never infers a number word from a digit, or the reverse", () => {
    expect(matches("fifteen", "15")).toBe(false);
    expect(matches("15", "fifteen")).toBe(false);
  });

  it("accepts both forms only when the key lists both", () => {
    const q = question({ answers: ["FIFTEEN", "15"] });
    expect(markQuestion(q, "fifteen").status).toBe("correct");
    expect(markQuestion(q, "15").status).toBe("correct");
    expect(markQuestion(q, "fiveteen").status).toBe("incorrect");
  });

  it("rejects an answer that adds a word", () => {
    expect(matches("electric lamps", "lamps")).toBe(false);
    expect(matches("wasit street", "wasit")).toBe(false);
  });

  it("rejects an empty response", () => {
    expect(matches("", "portal")).toBe(false);
    expect(matches("   ", "portal")).toBe(false);
  });
});

/* -- marking ----------------------------------------------------------- */

describe("markQuestion", () => {
  it("accepts any one of the listed answers", () => {
    const q = question({ answers: ["14 MARCH", "MARCH 14", "14/3"] });
    expect(markQuestion(q, "march 14").status).toBe("correct");
    expect(markQuestion(q, "14/3").status).toBe("correct");
    expect(markQuestion(q, "14 March").status).toBe("correct");
    expect(markQuestion(q, "13 March").status).toBe("incorrect");
  });

  it("reports an unanswered question separately from a wrong one", () => {
    const q = question({ answers: ["TRUE"] });
    expect(markQuestion(q, undefined).status).toBe("unanswered");
    expect(markQuestion(q, "").status).toBe("unanswered");
    expect(markQuestion(q, "FALSE").status).toBe("incorrect");
  });

  it("shows the key's own spelling back, not the student's", () => {
    const result = markQuestion(question({ answers: ["PORTAL"] }), "recieve");
    expect(result.status).toBe("incorrect");
    expect(result.expected).toBe("PORTAL");
    expect(result.response).toBe("recieve");
  });

  it("lists the further accepted forms", () => {
    const result = markQuestion(
      question({ answers: ["FIFTEEN", "15"] }),
      "15",
    );
    expect(result.expected).toBe("FIFTEEN");
    expect(result.alsoAccepted).toEqual(["15"]);
  });

  it("carries the explanation whether right or wrong", () => {
    const q = question({ answers: ["TRUE"], why: "A quarter is three months." });
    expect(markQuestion(q, "TRUE").why).toBe("A quarter is three months.");
    expect(markQuestion(q, "FALSE").why).toBe("A quarter is three months.");
  });
});

describe("markExercise", () => {
  const exercise: Exercise = {
    id: "ex-test",
    title: "Test set",
    instruction: "Write TRUE, FALSE or NOT GIVEN.",
    kind: "tfng",
    questions: [
      question({ n: 22, answers: ["TRUE"] }),
      question({ n: 23, answers: ["FALSE"] }),
      question({ n: 24, answers: ["NOT GIVEN"] }),
    ],
  };

  it("scores out of the number of questions", () => {
    const result = markExercise(exercise, {
      22: "true",
      23: "FALSE",
      24: "TRUE",
    });
    expect(result.score).toBe(2);
    expect(result.total).toBe(3);
  });

  it("counts an unanswered question as a lost mark", () => {
    const result = markExercise(exercise, { 22: "TRUE" });
    expect(result.score).toBe(1);
    expect(result.total).toBe(3);
    expect(result.results.map((r) => r.status)).toEqual([
      "correct",
      "unanswered",
      "unanswered",
    ]);
  });

  it("returns results in the order the questions are printed", () => {
    const result = markExercise(exercise, {});
    expect(result.results.map((r) => r.n)).toEqual([22, 23, 24]);
  });

  it("marks a full set with no responses as zero, without throwing", () => {
    expect(markExercise(exercise, {}).score).toBe(0);
  });
});
