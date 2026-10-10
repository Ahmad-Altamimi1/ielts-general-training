import type { Section } from "@/lib/content/schema";
import source from "@/content/voa/lesson-2-the-interview.json";
import { scriptFrom } from "./_source";

/**
 * A form to fill in while two people talk — the shape of Section 1.
 *
 * Section 1 is the only part of the paper where the answers are mostly
 * concrete: a time, a number, a name, a single word someone says once.
 * Nothing here is hard to understand. The marks are lost by writing the
 * wrong one of two things that were both said, which is why every
 * explanation below names the other one.
 *
 * The recording continues the story of Recording C: the meeting Ms. Weaver
 * called at the end of that one is the meeting referred to in the first
 * line of this one.
 *
 * Answers checked against the transcript in content/voa/.
 */
export const interviewSection: Section = {
  id: "lab-5",
  title: "The interview",
  blocks: [
    {
      kind: "prose",
      md: "Two conversations, a job offer and an interview — the everyday English of **Section 1**. Read the form first and decide what each gap wants: a number, a time, a job, a single describing word. A gap you have already named is a gap you cannot miss.",
    },
    scriptFrom(source, "Recording E"),
    {
      kind: "exercise",
      exercise: {
        id: "ex-lab-5",
        title: "Questions 1 to 10",
        instruction:
          "Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.",
        kind: "gapfill",
        questions: [
          {
            n: 1,
            prompt:
              "The one assignment Anna does not want: reporting traffic from a …",
            answers: ["helicopter"],
            why: "She says it in the first line, before you have settled into the recording. Section 1 does this on purpose: the first answer arrives while most students are still reading the form.",
          },
          {
            n: 2,
            prompt: "Anna's new assignment: hosting and …",
            answers: ["reporting"],
            why: '"I want you to go back to hosting and reporting." Hosting is printed, so only the second half is missing. The reason she is given the job — she is good at asking questions — is said first and is not the answer.',
          },
          {
            n: 3,
            prompt: "She must team up with someone who is very …",
            answers: ["different"],
            why: 'The word is repeated four times, which is the recording telling you it matters. "Cheerful" and "people person" describe Anna herself, not the person she is looking for.',
          },
          {
            n: 4,
            prompt: "When they meet, Pete is busy looking for …",
            answers: ["work"],
            why: '"I\'m busy looking for work." He is also doing a crossword at that moment — that is what he is doing, not what he is looking for, and the next question asks for it.',
          },
          {
            n: 5,
            prompt: "Anna interrupts Pete while he is working on a … puzzle.",
            answers: ["crossword"],
            why: 'The want ads are mentioned in the same breath and are the distractor: Anna tells him to throw those away. "Puzzle" is printed after the gap, so only one word fits.',
          },
          {
            n: 6,
            prompt: "The programme they would host together: a … show",
            answers: ["talk"],
            why: '"Host a talk show." One word before "show". Anna gives the reason for choosing Pete in the same sentence, which is where a student listening for meaning rather than for the gap loses the word.',
          },
          {
            n: 7,
            prompt: "Time of the interview: … am",
            answers: ["10", "ten"],
            why: 'Ten in the morning, the next day. "Tomorrow morning" is said first and is not what the gap wants — "am" is already printed, so the gap can only be the time. Figures or words are both accepted, as in the real test.',
          },
          {
            n: 8,
            prompt: "Pete wrote his book while locked in a …",
            answers: ["cabin"],
            why: 'He says it once, quickly, in a long sentence that also contains a book, a year and two months. The sentence carries three other answers\' worth of detail, so listen for the place, which is what "locked in a" asks for.',
          },
          {
            n: 9,
            prompt:
              "He spoke to nobody for … months, which he calls the best time of his life.",
            answers: ["two", "2"],
            why: '"The best two months of my life." The same sentence also says "last year", and a student writing the first number they hear puts that in. The gap is followed by "months", which rules that out.',
          },
          {
            n: 10,
            prompt:
              "Ms. Weaver's verdict: Pete is … and not good with people.",
            answers: ["grumpy"],
            why: "Pete reports her words himself, after the interview is over. He got the job anyway — which is the joke, and the reason students stop listening a line too early and miss the answer.",
          },
        ],
      },
    },
  ],
};
