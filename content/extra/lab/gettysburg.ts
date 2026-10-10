import type { Section } from "@/lib/content/schema";
import source from "@/content/voa/american-places-gettysburg-pennsylvania.json";
import { scriptFrom } from "./_source";

/**
 * A talk about a place a visitor might go to — the shape of Section 2, and
 * the first short-answer set in this part.
 *
 * Short answer looks easier than completion because the question is a
 * whole sentence rather than a gap. It is not: there is no grammar around
 * the gap to tell you what kind of word is coming, so the question word —
 * who, when, how many, what is it called — is the only thing narrowing it
 * down. Read those first.
 *
 * Answers checked against the transcript in content/voa/.
 */
export const gettysburgSection: Section = {
  id: "lab-6",
  title: "A battlefield and a museum",
  blocks: [
    {
      kind: "prose",
      md: "A talk about a place, the way **Section 2** works: a single informed voice describing somewhere a visitor can go. The recording is dense with names, dates and figures, and almost every one of them is said exactly once. Before you start, underline the question word in each question — it is the only thing telling you what sort of answer to wait for.",
    },
    scriptFrom(source, "Recording F"),
    {
      kind: "exercise",
      exercise: {
        id: "ex-lab-6",
        title: "Questions 1 to 10",
        instruction:
          "Answer the questions below. Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.",
        kind: "gapfill",
        questions: [
          {
            n: 1,
            prompt: "In which state is the Gettysburg National Military Park?",
            answers: ["Pennsylvania"],
            why: "The first sentence. Baltimore and Washington, D.C. are named a few lines later as places the roads lead to, and a student who starts writing late puts one of those here.",
          },
          {
            n: 2,
            prompt: "Who commanded the United States Army of the Potomac?",
            answers: ["General George Meade", "George Meade", "Meade"],
            why: "Two armies and two generals are named in the same sentence, in the order Potomac–Meade, Northern Virginia–Lee. Attach each name to its army as you hear it, because the next question asks for the other pair and there is no second chance.",
          },
          {
            n: 3,
            prompt: "Who led the Confederate Army of Northern Virginia?",
            answers: ["General Robert E. Lee", "Robert E. Lee", "Lee"],
            why: 'Lee is the name said most often in the recording, which makes it easy — and that is the risk: the easy one is where attention drops. The question asks who led the Confederate army, not who won.',
          },
          {
            n: 4,
            prompt: "On what date did the battle of Gettysburg begin?",
            answers: ["July 1, 1863", "July 1 1863", "1 July 1863"],
            why: 'Three dates sit close together: it began on July 1 and ended on July 3, and the cyclorama shows the attack of July 3. The question says "begin", so only the first of them counts.',
          },
          {
            n: 5,
            prompt: "How long did the fighting last?",
            answers: ["three days", "3 days"],
            why: '"About 170,000 soldiers fought for three days." The sentence holds two numbers and this question wants the smaller one. A student listening for a big figure writes 170,000 and loses the mark to a number they heard correctly.',
          },
          {
            n: 6,
            prompt: "How many artifacts does the museum hold?",
            answers: ["more than 1 million", "1 million", "over 1 million"],
            why: 'The figure is given as "more than 1 million", and the limit of three words lets you keep "more than". Writing the number alone is also accepted — what is not accepted is the list of examples that follows it.',
          },
          {
            n: 7,
            prompt: "What is the final major attack of the battle now called?",
            answers: ["Pickett's Charge", "Picketts Charge"],
            why: 'The recording says the attack "has come to be called" this — that phrase is the signal that a name is arriving. George Pickett the man is explained immediately afterwards and is not what the question asks for.',
          },
          {
            n: 8,
            prompt:
              "What name is given today to the point the Confederate soldiers reached?",
            answers: [
              "the High Water Mark",
              "High Water Mark",
              "High-Water Mark",
            ],
            why: 'Another name, and the same signal: "Today, the point is called". Marking ignores capital letters, so the form matters more than the case — three words, exactly as said.',
          },
          {
            n: 9,
            prompt:
              "Who visited on 19 November 1863 to help dedicate the burial ground?",
            answers: ["Abraham Lincoln", "President Abraham Lincoln", "Lincoln"],
            why: "The date is given before the name, so the question hands you the cue and asks for what follows it. This is the usual pattern in short answer: find the fact you already have, then take the next one.",
          },
          {
            n: 10,
            prompt: "How long did Lincoln speak for?",
            answers: ["two minutes", "2 minutes"],
            why: '"Lincoln spoke for just two minutes." The word "just" is the recording making a point of how short it was — and a point being made is almost always a fact worth testing.',
          },
        ],
      },
    },
  ],
};
