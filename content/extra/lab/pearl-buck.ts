import type { Section } from "@/lib/content/schema";
import source from "@/content/voa/pearl-s-buck-the-first-american-woman-to-win-a-n.json";
import { scriptFrom } from "./_source";

/**
 * A life told in order — the shape of Section 4, set as a summary.
 *
 * A summary is not a list of gaps: it is one piece of writing, and the
 * sentences around a gap are as much a clue as the recording is. The
 * summary here is deliberately written in different words from the
 * recording, because that is what the real paper does — if the summary
 * repeated the talk you could answer it by matching sounds.
 *
 * Answers checked against the transcript in content/voa/.
 */
export const pearlBuckSection: Section = {
  id: "lab-7",
  title: "A writer between two countries",
  blocks: [
    {
      kind: "prose",
      md: "One voice telling a life from beginning to end — **Section 4**, and the easiest kind to follow and the easiest to drift in. The summary below runs in the same order as the recording, so if you lose your place, find the next thing you recognise and start again from there. Losing one answer is normal; losing the thread costs you five.",
    },
    scriptFrom(source, "Recording G"),
    {
      kind: "exercise",
      exercise: {
        id: "ex-lab-7",
        title: "Questions 1 to 10",
        instruction:
          "Complete the summary below. Write ONE WORD AND/OR A NUMBER for each answer.",
        kind: "gapfill",
        questions: [
          {
            n: 1,
            prompt:
              "The Good Earth was the best selling book in the United States in 1931, and a year later it won the … Prize.",
            answers: ["Pulitzer"],
            why: 'The recording says "the following year", and the summary says "a year later" — the same fact in different words, which is the whole technique of this question type. Two prizes are named in the talk, and this is the first.',
          },
          {
            n: 2,
            prompt:
              "In 1938 she became the first American woman to be awarded the Nobel Prize in …",
            answers: ["Literature"],
            why: "The second prize. The two are a sentence apart and the dates, 1932 and 1938, are the only thing separating them — which is why the summary prints the year for you.",
          },
          {
            n: 3,
            prompt: "China was her home for nearly … years.",
            answers: ["40", "forty"],
            why: 'The figure is given twice, once near the start and once near the end — "for nearly 40 years" and "after almost 40 years". A number repeated at both ends of a recording is one you are expected to get.',
          },
          {
            n: 4,
            prompt: "Her parents went to China as religious …",
            answers: ["workers"],
            why: 'The same phrase is used later about the man she married, which is the trap: hearing "religious worker" and marking the wrong one of the two people it describes.',
          },
          {
            n: 5,
            prompt:
              "She returned to the United States in 1910 to study … at a college in Virginia.",
            answers: ["philosophy"],
            why: "The subject, not the college. The college's name, Randolph-Macon Woman's College, is long and arrives immediately afterwards — long enough to make you miss that the answer has already gone past.",
          },
          {
            n: 6,
            prompt: "Three years after graduating she married a man who studied …",
            answers: ["agriculture"],
            why: 'He is described as "a religious worker who studied agriculture", so both halves of the description are in the recording and only one answers the question. The gap follows "studied", which settles it.',
          },
          {
            n: 7,
            prompt:
              "The couple moved to a small … in the north of China, and the people there became the subject of her books.",
            answers: ["village"],
            why: "Said once, in passing, in a sentence whose main point is somewhere else. Section 4 hides answers inside sentences that are about something else — that is the difference between it and Section 1.",
          },
          {
            n: 8,
            prompt:
              "In the novel, Wang Lung and O-Lan work hard and finally buy … for a farm.",
            answers: ["land"],
            why: 'The title of the book is The Good Earth, so "earth" sounds right and is wrong — the recording says they buy land. A word you expect before you hear it is the one to be most careful with.',
          },
          {
            n: 9,
            prompt:
              "Speaking to young people, she stressed the importance of a good …",
            answers: ["education"],
            why: 'She told them two things, and this is the first. The second — that they needed to know more about other people around the world — follows straight after and is the distractor if you are a beat late.',
          },
          {
            n: 10,
            prompt: "She died in 1973 at the age of …",
            answers: ["80", "eighty"],
            why: "The last line of the recording, and the point at which most students have stopped listening. Both numbers are in the same short sentence: the year is printed for you, so the gap can only be the age.",
          },
        ],
      },
    },
  ],
};
