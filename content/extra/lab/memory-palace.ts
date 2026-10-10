import type { Section } from "@/lib/content/schema";
import source from "@/content/voa/make-a-memory-palace-to-improve-your-english.json";
import { scriptFrom } from "./_source";

/**
 * A long monologue with a worked example inside it, and two named
 * experts — the shape of Section 4.
 *
 * Sentence completion, because the recording's own structure does the
 * work: it defines a thing, demonstrates it, then reports what experts
 * advise. Each gap is fixed by grammar before the recording reaches it,
 * which is the habit the book is trying to build.
 *
 * Answers checked against the transcript in content/voa/.
 */
export const memoryPalaceSection: Section = {
  id: "lab-4",
  title: "The memory palace",
  blocks: [
    {
      kind: "prose",
      md: "The longest recording here, and the most like **Section 4**: one voice, no interruptions, and a clear plan — what it is, how to build one, what the experts add. Read all ten sentences before you start. Each gap already tells you what kind of word it wants.",
    },
    scriptFrom(source, "Recording D"),
    {
      kind: "exercise",
      exercise: {
        id: "ex-lab-4",
        title: "Questions 1 to 10",
        instruction:
          "Complete the sentences below. Write ONE WORD ONLY for each answer.",
        kind: "gapfill",
        questions: [
          {
            n: 1,
            prompt:
              "Sherlock Holmes was created by the British writer Arthur Conan …",
            answers: ["Doyle"],
            why: "A name, and it is said once, in the first sentence. Section 4 often opens with the one proper noun in the whole recording — if you are still settling into your seat when it arrives, it is gone.",
          },
          {
            n: 2,
            prompt:
              'In the television series the technique is called a mind palace or a … palace.',
            answers: ["memory"],
            why: "\"A memory technique called a 'mind palace' or 'memory palace.'\" Both names are given together. The gap is followed by \"palace\", so only the first half of the second name fits.",
          },
          {
            n: 3,
            prompt: "The method itself has existed for … of years.",
            answers: ["thousands"],
            why: "\"The method for remembering has existed for thousands of years.\" The sentence before it says the idea was not a BBC creation — the speaker signals a correction, and a correction is almost always followed by an answer.",
          },
          {
            n: 4,
            prompt:
              "A memory palace is a real …, such as a home or a building, that you picture in your head.",
            answers: ["structure"],
            why: "\"It is a real structure, such as a home or building.\" Home and building are printed in the sentence as the examples, so neither of them is the answer — the gap wants the general word they are examples of.",
          },
          {
            n: 5,
            prompt: "Choose a physical space that you know …",
            answers: ["well"],
            why: "\"Choose a physical space that you know well.\" One word, an adverb, and grammar fixes it before you hear it. Students who expect a noun here wait for the wrong kind of word and miss it.",
          },
          {
            n: 6,
            prompt:
              "Imagine walking through the space along the … you would normally take.",
            answers: ["path"],
            why: "\"Using the path that you would normally take through it.\" The word is repeated twice more afterwards, which is the recording's way of telling you it matters.",
          },
          {
            n: 7,
            prompt:
              "Anthony Metivier suggests starting by drawing a simple … of your palace.",
            answers: ["map"],
            why: "\"Suggests first drawing a simple map of your memory palace.\" \"First\" marks the order, and the next instruction — number the places — is a different step, which is the distractor if you are a beat late.",
          },
          {
            n: 8,
            prompt:
              "Teacher James names three keys: emotion, movement, and … between the object and something permanent.",
            answers: ["connections"],
            why: "Three items in a list, two printed, one missing. The answer is the third, and it is plural — the printed sentence shows that with \"between\", which needs more than one thing.",
          },
          {
            n: 9,
            prompt:
              "Both experts say that imagining things in a humorous or … way helps you remember.",
            answers: ["crazy"],
            why: "\"Imagining things in a humorous or crazy way.\" Two adjectives joined by \"or\", the first printed. The earlier description of the palace as \"extraordinary and humorous\" is the near-miss: it is the same idea in different words, in a different place.",
          },
          {
            n: 10,
            prompt:
              "James also advises putting each object next to something …",
            answers: ["permanent"],
            why: "\"Placing the objects next to or on something permanent.\" The word appears twice before this — in the list of three keys, and in the advice about doors and steps — so if you lost it here, the recording had already offered it to you twice.",
          },
        ],
      },
    },
  ],
};
