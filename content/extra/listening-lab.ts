import type { Part } from "@/lib/content/schema";

import { budgetCutsSection } from "./lab/budget-cuts";
import { emailSection } from "./lab/email";
import { gettysburgSection } from "./lab/gettysburg";
import { interviewSection } from "./lab/interview";
import { memoryPalaceSection } from "./lab/memory-palace";
import { microcredentialsSection } from "./lab/microcredentials";
import { pearlBuckSection } from "./lab/pearl-buck";
import { vocabularySection } from "./lab/vocabulary";

/* ===================================================================== *
 * Listening Lab — NOT PART OF THE BOOK.
 *
 * The book's own listening units are read aloud by the teacher from
 * Appendix A, which the manuscript does not yet contain. This part exists
 * so that a student working alone has something to listen to, and so that
 * every shape the Listening paper uses is practised at least once:
 *
 *   lab-1  note completion, academic monologue        (Section 4)
 *   lab-2  multiple choice, practical monologue       (Section 2)
 *   lab-3  matching and completion, several voices    (Section 3)
 *   lab-4  sentence completion, long monologue        (Section 4)
 *   lab-5  form completion, two conversations         (Section 1)
 *   lab-6  short answer, a talk about a place         (Section 2)
 *   lab-7  summary completion, a life story           (Section 4)
 *   lab-8  notes and multiple choice, a long talk     (Section 4)
 *
 * Provenance, kept explicit on purpose:
 *   - the recordings and their transcripts are Voice of America Learning
 *     English, which is public domain and may be reprinted with credit.
 *     Reports adapted from AP, Reuters or AFP are excluded — the fetcher
 *     in tools/voa refuses them — because VOA's grant does not cover them.
 *   - the questions, the answer keys and the explanations are not the
 *     book's. They were written for this app, in the book's method, and
 *     are labelled as such wherever they appear.
 *
 * Every answer was checked against the transcript in content/voa/*.json,
 * which is the text of the recording itself.
 * ===================================================================== */

const part: Part = {
  id: "listening-lab",
  number: null,
  title: "Listening Lab",
  summary: "extra listening practice with real recordings, not from the book",
  intro: [
    {
      kind: "callout",
      title: "Where this comes from",
      body: [
        "The recordings and transcripts here are from Voice of America Learning English, which places its material in the public domain. The questions and the explanations are not from your book: they were written for this app, following the same method.",
        "Use the book for the method and the worked examples. Use this part when you want something to listen to on your own.",
      ],
    },
    {
      kind: "prose",
      md: "A real recording plays **once**. That is the rule in the test and it is the rule here: start it when you are ready to work, not before. The transcript is underneath, but reading it first turns a listening exercise into a reading one.",
    },
    {
      kind: "prose",
      md: "The eight units cover every shape the paper uses: notes, a form, a summary, sentence completion, short answers, multiple choice and matching — across a conversation, a practical talk, a talk about a place, and four academic monologues.",
    },
  ],
  sections: [
    microcredentialsSection,
    emailSection,
    budgetCutsSection,
    memoryPalaceSection,
    interviewSection,
    gettysburgSection,
    pearlBuckSection,
    vocabularySection,
  ],
};

export default part;
