import type { Exercise, Question } from "@/lib/content/schema";

/* ===================================================================== *
 * The marking engine.
 *
 * Two principles decide everything here:
 *
 *   1. The key is the source of truth. `answers` lists every accepted
 *      form. The marker normalises presentation — case, spacing, a
 *      surrounding quotation mark — and nothing else. It never infers a
 *      new accepted answer, and in particular never converts between "15"
 *      and "fifteen": if the book accepts both, the book lists both.
 *
 *   2. No fuzzy matching, ever. IELTS penalises spelling. A student who
 *      learns here that "recieve" is accepted loses the mark on test day,
 *      so "recieve" is marked wrong and the correct spelling is shown.
 * ===================================================================== */

/** Characters the student may type around an answer that carry no meaning. */
const EDGE_PUNCTUATION = /^[\s"'“”‘’`(\[{.,;:!?]+|[\s"'“”‘’`)\]}.,;:!?]+$/g;

const ARTICLE = /^(?:a|an|the)\s+/;

/**
 * Reduces a response to the form in which two answers can be compared.
 *
 * - case is never penalised
 * - leading, trailing and repeated whitespace is meaningless
 * - quotation marks and sentence punctuation around the answer are not
 *   part of the answer
 * - "&" and "and" are the same word
 * - a hyphen and a space are the same separator, so "role-play" and
 *   "role play" are one answer
 */
export function normalise(raw: string): string {
  return raw
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[   ]/g, " ")
    .replace(EDGE_PUNCTUATION, "")
    .replace(/\s*&\s*/g, " and ")
    .replace(/[‐-―-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasArticle(value: string): boolean {
  return ARTICLE.test(value);
}

function stripArticle(value: string): string {
  return value.replace(ARTICLE, "");
}

/**
 * True when a response is the accepted answer.
 *
 * The one relational rule: if exactly one of the two carries a leading
 * article, it is dropped before comparing, because the book prints
 * "(a) medical certificate" and the student may write either. If both
 * carry one they must be the same article, since the key chose it.
 */
export function matches(response: string, accepted: string): boolean {
  const left = normalise(response);
  const right = normalise(accepted);
  if (left === "") return false;
  if (left === right) return true;

  if (hasArticle(left) !== hasArticle(right)) {
    return stripArticle(left) === stripArticle(right);
  }

  return false;
}

export type QuestionStatus = "correct" | "incorrect" | "unanswered";

export type QuestionResult = {
  n: number;
  status: QuestionStatus;
  /** Exactly what the student typed or chose, for showing back to them. */
  response: string;
  /** The first accepted answer: the one the book prints. */
  expected: string;
  /** Any further accepted forms, so a student who wrote one of them can
   *  see that it was also right. */
  alsoAccepted: string[];
  why: string;
};

export function markQuestion(
  question: Question,
  rawResponse: string | undefined,
): QuestionResult {
  const response = (rawResponse ?? "").trim();
  const [expected, ...alsoAccepted] = question.answers;

  const status: QuestionStatus =
    response === ""
      ? "unanswered"
      : question.answers.some((answer) => matches(response, answer))
        ? "correct"
        : "incorrect";

  return {
    n: question.n,
    status,
    response,
    expected,
    alsoAccepted,
    why: question.why,
  };
}

export type ExerciseResult = {
  /** Questions answered correctly. */
  score: number;
  /** Questions in the set. An unanswered question is a lost mark, exactly
   *  as it is in the test. */
  total: number;
  results: QuestionResult[];
};

export function markExercise(
  exercise: Exercise,
  responses: Readonly<Record<number, string>>,
): ExerciseResult {
  const results = exercise.questions.map((question) =>
    markQuestion(question, responses[question.n]),
  );

  return {
    score: results.filter((r) => r.status === "correct").length,
    total: results.length,
    results,
  };
}
