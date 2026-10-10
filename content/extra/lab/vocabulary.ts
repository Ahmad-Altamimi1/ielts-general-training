import type { Section } from "@/lib/content/schema";
import source from "@/content/voa/raise-your-english-level-with-more-vocabulary.json";
import { scriptFrom } from "./_source";

/**
 * A long talk made of advice, with the two question types split the way a
 * real paper splits them: completion while the talk is listing things,
 * multiple choice once it starts explaining them.
 *
 * The recording is also worth listening to for its own sake — it is about
 * how to build vocabulary, which is the single thing most likely to move a
 * band score. That is not an accident in the choice.
 *
 * Answers checked against the transcript in content/voa/.
 */
export const vocabularySection: Section = {
  id: "lab-8",
  title: "Building vocabulary",
  blocks: [
    {
      kind: "prose",
      md: "The longest talk in this part, and the only one whose advice you can use tonight. Two sets of questions: notes while the speaker lists, then multiple choice once the speaker starts explaining. **The notes come first in the recording, so answer them in order and do not read ahead to the choices** — that is how students lose the first set to the second.",
    },
    scriptFrom(source, "Recording H"),
    {
      kind: "exercise",
      exercise: {
        id: "ex-lab-8",
        title: "Questions 1 to 6",
        instruction:
          "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        kind: "gapfill",
        questions: [
          {
            n: 1,
            prompt:
              "To fully understand a written text, a learner needs to know … per cent of its words or more.",
            answers: ["95", "ninety-five"],
            why: "Four numbers arrive in the opening half-minute — 500, 1,000, 95 and 100. This one is the percentage, and the gap says so by printing \"per cent\" after it.",
          },
          {
            n: 2,
            prompt:
              "First rule: connect a new word to a … or a situation, rather than learning it from a list.",
            answers: ["story"],
            why: '"Situation" is printed after the gap because it is the other half of what the speaker says. The list is what the advice is against, so writing "list" turns the sentence upside down.',
          },
          {
            n: 3,
            prompt: "Second rule: be active, not …",
            answers: ["passive"],
            why: "Said twice — here, and again as the last line of the whole talk. The speaker's closing words are almost always a repeat of something earlier, which is a free second chance if you missed it the first time.",
          },
          {
            n: 4,
            prompt:
              "Write down and repeat three to … more sentences using the new vocabulary.",
            answers: ["five", "5"],
            why: 'A range, "three to five", with the first half printed. The gap wants the second of the two, not the first — writing "three" is copying what is already on the page.',
          },
          {
            n: 5,
            prompt: "Explain the word to someone as though you were a …",
            answers: ["teacher"],
            why: 'The advice is repeated immediately for the case where you have a study partner, so the word is said twice in two lines. Repetition inside one piece of advice is the speaker underlining it.',
          },
          {
            n: 6,
            prompt:
              "Rather than learning the names of 12 birds at once, learn … or three of them.",
            answers: ["two", "2"],
            why: "Three numbers in one example: 12 birds, then two or three at a time. The gap is followed by \"or three\", which leaves only one of them possible — grammar settles this before the recording reaches it.",
          },
        ],
      },
    },
    {
      kind: "exercise",
      exercise: {
        id: "ex-lab-8-2",
        title: "Questions 7 to 10",
        instruction: "Choose the correct letter, A, B or C.",
        kind: "mcq",
        questions: [
          {
            n: 7,
            prompt: "What does the speaker advise about prepositions?",
            choices: [
              { id: "A", text: "Learn the preposition once you know the word well." },
              { id: "B", text: "Learn a word and its preposition as a single unit." },
              { id: "C", text: "Avoid prepositions until your English is stronger." },
            ],
            answers: ["B"],
            why: '"Memorize the word and its preposition together as one unit instead of two separate words." The examples — "amused by", "happy with" — come first, and a student who answers from the examples alone cannot choose between these three.',
          },
          {
            n: 8,
            prompt: "What warning does the speaker give about learning through songs?",
            choices: [
              { id: "A", text: "Songs mostly teach informal language." },
              { id: "B", text: "Singing makes words harder to recall later." },
              { id: "C", text: "You must be able to recall the words without the music." },
            ],
            answers: ["C"],
            why: 'The speaker says music helps, then adds "but make sure that you can remember the new vocabulary without the music, too". The answer is after the "but", which is where the answer usually is when a question asks for a warning.',
          },
          {
            n: 9,
            prompt: "What is the best way to learn the tone of a word?",
            choices: [
              { id: "A", text: "Ask people who speak the language natively." },
              { id: "B", text: "Learn it together with words of similar meaning." },
              { id: "C", text: "Work it out from how the word is spelled." },
            ],
            answers: ["A"],
            why: '"It is hard to learn about tone by yourself. The best way … is to ask native speakers about it." The question says "best way", and so does the recording — when a question borrows the speaker\'s own words, it is pointing at the sentence.',
          },
          {
            n: 10,
            prompt: "According to the speaker, an app using spaced repetition shows a word",
            choices: [
              { id: "A", text: "seven times a week while it is still new." },
              { id: "B", text: "less and less often as you come to know it." },
              { id: "C", text: "once a day once you know it well." },
            ],
            answers: ["B"],
            why: 'The recording says seven times in one day when the word is new, then once a week afterwards. A and C are those same two figures with the time words swapped — the commonest way a multiple-choice distractor is built, and the reason you should hear the whole option before choosing.',
          },
        ],
      },
    },
  ],
};
