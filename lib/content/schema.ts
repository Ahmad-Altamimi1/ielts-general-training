import { z } from "zod";

/* ===================================================================== *
 * Content schema
 *
 * The single source of truth for the shape of course content. Every part
 * module is parsed through `partSchema` when the registry loads, which
 * happens during `next build`, so a malformed part fails the build.
 *
 * Types are inferred from the schemas rather than declared twice, so the
 * two can never drift apart.
 * ===================================================================== */

/** A paragraph of a reading passage. `label` is "A", "B" … when the exam
 *  prints lettered paragraphs that questions refer back to. */
export const paragraphSchema = z.object({
  label: z.string().min(1).optional(),
  text: z.string().min(1),
});

const exerciseKindSchema = z.enum([
  "tfng",
  "ynng",
  "mcq",
  "matching",
  "gapfill",
  "headings",
]);

export const questionSchema = z.object({
  /** The printed question number, 1 to 40. Shown to the student, so it is
   *  the book's number and not an array index. */
  n: z.number().int().positive(),
  prompt: z.string().min(1),
  /** Multiple choice only. */
  choices: z
    .array(z.object({ id: z.string().min(1), text: z.string().min(1) }))
    .min(2)
    .optional(),
  /** Every accepted form of the answer. A response matching any one of
   *  them is correct. The key is the source of truth: the marker never
   *  infers further variants. */
  answers: z.array(z.string().min(1)).min(1),
  /** The explanation, shown after marking — for right answers too, because
   *  it names the trap the student happened to avoid. This field is the
   *  product. */
  why: z.string().min(1),
});

export const exerciseSchema = z
  .object({
    /** Globally unique and stable: it is the localStorage key. */
    id: z.string().regex(/^ex-[a-z0-9.-]+$/i, {
      message: 'exercise id must look like "ex-3.5"',
    }),
    title: z.string().min(1),
    /** The exam rubric, shown verbatim. */
    instruction: z.string().min(1),
    timeLimitSeconds: z.number().int().positive().optional(),
    kind: exerciseKindSchema,
    /** For matching and headings: the letter or roman-numeral option list. */
    options: z.array(z.string().min(1)).min(2).optional(),
    questions: z.array(questionSchema).min(1),
  })
  .superRefine((exercise, ctx) => {
    const seen = new Set<number>();
    for (const q of exercise.questions) {
      if (seen.has(q.n)) {
        ctx.addIssue({
          code: "custom",
          message: `duplicate question number ${q.n} in ${exercise.id}`,
          path: ["questions"],
        });
      }
      seen.add(q.n);
    }

    if (exercise.kind === "mcq") {
      for (const [i, q] of exercise.questions.entries()) {
        if (!q.choices) {
          ctx.addIssue({
            code: "custom",
            message: `mcq question ${q.n} in ${exercise.id} has no choices`,
            path: ["questions", i, "choices"],
          });
          continue;
        }
        const ids = new Set(q.choices.map((c) => c.id));
        for (const answer of q.answers) {
          if (!ids.has(answer)) {
            ctx.addIssue({
              code: "custom",
              message: `mcq question ${q.n} in ${exercise.id} accepts "${answer}", which is not one of its choices`,
              path: ["questions", i, "answers"],
            });
          }
        }
      }
    }

    if (exercise.kind === "matching" || exercise.kind === "headings") {
      if (!exercise.options) {
        ctx.addIssue({
          code: "custom",
          message: `${exercise.kind} exercise ${exercise.id} needs an options list`,
          path: ["options"],
        });
      } else {
        // The student picks from this list, so an accepted answer that is
        // not in it can never be given — and that means the list is wrong.
        const labels = new Set(
          exercise.options.map((option) =>
            (/^([A-Za-z]+|[ivxIVX]+)\b/.exec(option.trim())?.[1] ?? option)
              .trim()
              .toLowerCase(),
          ),
        );
        for (const [i, q] of exercise.questions.entries()) {
          for (const answer of q.answers) {
            if (!labels.has(answer.trim().toLowerCase())) {
              ctx.addIssue({
                code: "custom",
                message: `${exercise.id} question ${q.n} accepts "${answer}", which is not one of the ${exercise.options.length} options offered`,
                path: ["questions", i, "answers"],
              });
            }
          }
        }
      }
    }
  });

export const blockSchema = z.discriminatedUnion("kind", [
  /** Inline markdown: bold and emphasis only. */
  z.object({ kind: z.literal("prose"), md: z.string().min(1) }),

  z.object({
    kind: z.literal("heading"),
    level: z.union([z.literal(3), z.literal(4)]),
    text: z.string().min(1),
  }),

  z.object({
    kind: z.literal("list"),
    ordered: z.boolean(),
    items: z.array(z.string().min(1)).min(1),
  }),

  /** A thick accent bar on the left edge, no background fill. */
  z.object({
    kind: z.literal("callout"),
    title: z.string().min(1).optional(),
    body: z.array(z.string().min(1)).min(1),
  }),

  /** Horizontal rules only, bold header rule, no vertical lines. */
  z.object({
    kind: z.literal("table"),
    headers: z.array(z.string()).min(1),
    rows: z.array(z.array(z.string())).min(1),
    /** Relative column widths, same length as `headers`. */
    widths: z.array(z.number().positive()).min(1).optional(),
  }),

  /** A reading text or an exam rubric. Set in serif. */
  z.object({
    kind: z.literal("passage"),
    title: z.string().min(1).optional(),
    paragraphs: z.array(paragraphSchema).min(1),
  }),

  /** A question reasoned through in the open, before the student tries
   *  the same type unaided. */
  z.object({
    kind: z.literal("worked"),
    question: z.string().min(1),
    steps: z.array(z.string().min(1)).min(1),
    answer: z.string().min(1),
  }),

  z.object({ kind: z.literal("exercise"), exercise: exerciseSchema }),
]);

export const sectionSchema = z.object({
  /** "3.5", or "appendix-b-4" for back matter. */
  id: z.string().min(1),
  title: z.string().min(1),
  blocks: z.array(blockSchema).min(1),
});

export const partSchema = z
  .object({
    /** "part-3", "front-matter", "appendix-b". */
    id: z.string().regex(/^[a-z0-9-]+$/, {
      message: 'part id must be kebab-case, e.g. "part-3"',
    }),
    /** null for front matter and appendices. */
    number: z.number().int().positive().nullable(),
    title: z.string().min(1),
    /** One line, for the sidebar and the part index page. */
    summary: z.string().min(1),
    /** Prose the book prints under the part title, before its first
     *  numbered section.
     *
     *  NOT IN THE BRIEF'S MODEL. Added because the book has such prose in
     *  most parts and the brief's `Part` has nowhere to put it; the
     *  alternatives were to drop real content or to invent a section
     *  heading for it. See DECISIONS.md. */
    intro: z.array(blockSchema).optional(),
    sections: z.array(sectionSchema),
  })
  .superRefine((part, ctx) => {
    if (part.sections.length === 0 && !part.intro?.length) {
      ctx.addIssue({
        code: "custom",
        message: `part ${part.id} has neither sections nor intro content`,
        path: ["sections"],
      });
    }

    const seen = new Set<string>();
    for (const [i, section] of part.sections.entries()) {
      if (seen.has(section.id)) {
        ctx.addIssue({
          code: "custom",
          message: `duplicate section id "${section.id}" in ${part.id}`,
          path: ["sections", i, "id"],
        });
      }
      seen.add(section.id);
    }
  });

export type Paragraph = z.infer<typeof paragraphSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;
export type ExerciseKind = z.infer<typeof exerciseKindSchema>;
export type Block = z.infer<typeof blockSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type Part = z.infer<typeof partSchema>;

/** Narrows a block union member by its `kind`. */
export type BlockOf<K extends Block["kind"]> = Extract<Block, { kind: K }>;
