import type { Section } from "@/lib/content/schema";
import source from "@/content/voa/lesson-1-budget-cuts.json";
import { scriptFrom } from "./_source";

/**
 * Several voices in a workplace — the shape of Section 3.
 *
 * The hard part of a multi-voice recording is not vocabulary, it is
 * keeping track of who said what, so the first set is matching and the
 * second set asks for details that are stated *about* a person by someone
 * else. That is the trap the real test uses here: the fact about Kaveh is
 * spoken by Amelia, and a student following the voice rather than the
 * subject swaps the two.
 *
 * Answers checked against the transcript in content/voa/.
 */
export const budgetCutsSection: Section = {
  id: "lab-3",
  title: "An office meeting and a rumour",
  blocks: [
    {
      kind: "prose",
      md: "Five people, a rumour, and a meeting. Before you start, read the names: in a conversation with several voices the questions follow the order of the recording, but the *names* do not. Listen for who is being talked about, not only for who is talking.",
    },
    scriptFrom(source, "Recording C"),
    {
      kind: "exercise",
      exercise: {
        id: "ex-lab-3",
        title: "Questions 1 to 5",
        instruction:
          "Match each statement with the correct person, A to E. Write the correct letter.",
        kind: "matching",
        options: [
          "A  Anna",
          "B  Jonathan",
          "C  Amelia",
          "D  Kaveh",
          "E  Ms. Weaver",
        ],
        questions: [
          {
            n: 1,
            prompt: "Heard the rumour from one person in Accounting.",
            answers: ["B"],
            why: "Jonathan says he has heard \"people in the building\" talking, and when pressed names Mark in Accounting. Mark is the source but never speaks, and he is not on the list — the question asks who heard it.",
          },
          {
            n: 2,
            prompt: 'Points out that one person is not "people".',
            answers: ["A"],
            why: "Anna: \"That's one person. That's not 'people.'\" She is the one who questions the rumour, which is worth noticing: the speaker who challenges a claim is usually the one the questions are built around.",
          },
          {
            n: 3,
            prompt: "Used to work as a detective.",
            answers: ["C"],
            why: "Amelia: \"I can't go back to being a detective.\" Kaveh says the same kind of thing one line later about teaching, so the two sit side by side on purpose. Take the name from the line itself, not from the one you heard most recently.",
          },
          {
            n: 4,
            prompt: "Tells a colleague to update their CV.",
            answers: ["D"],
            why: "Kaveh tells Penelope to update her résumé and says he has already updated his. Penelope is in the conversation but is not on the list, which is normal: an option list never contains every voice you hear.",
          },
          {
            n: 5,
            prompt: "Explains that the meeting is about new assignments.",
            answers: ["E"],
            why: "Ms. Weaver, at the end. Everything before it is guesswork by the staff, and the recording is built so the correct explanation arrives last — if you answered early from the rumour, you answered the wrong thing.",
          },
        ],
      },
    },
    {
      kind: "exercise",
      exercise: {
        id: "ex-lab-3-2",
        title: "Questions 6 to 10",
        instruction:
          "Complete the sentences below. Write ONE WORD ONLY for each answer.",
        kind: "gapfill",
        questions: [
          {
            n: 6,
            prompt: "Kaveh's job at The Studio is …",
            answers: ["reporter"],
            why: "\"You're a good reporter\" — said by Amelia, about Kaveh. The fact about each person is spoken by the other one, which is exactly where this type catches people out.",
          },
          {
            n: 7,
            prompt: "Amelia's job at The Studio is …",
            answers: ["videographer"],
            why: "\"You've done a great job as a videographer\" — said by Kaveh, about Amelia. If you wrote these two the other way round, you were tracking the voice instead of the subject.",
          },
          {
            n: 8,
            prompt: "Kaveh does not want to teach again because … kids scare him.",
            answers: ["high school", "high-school"],
            why: "\"High school kids scare me.\" The instruction says one word, and \"high school\" is normally counted as one compound item on an answer sheet — but if you are unsure, the safe answer is the shortest form that completes the sentence.",
          },
          {
            n: 9,
            prompt: "The only person who lost their job was Mark in …",
            answers: ["Accounting"],
            why: "The twist at the end: the man who started the rumour is the one it was about. Accounting is named twice, early as the source and late as the answer — and the second time is the one that counts.",
          },
          {
            n: 10,
            prompt: "Ms. Weaver called the meeting to praise the team and give out new …",
            answers: ["assignments"],
            why: "\"To tell you what a good job you've been doing and give out new assignments.\" The gap is after \"new\", so grammar fixes it as a plural noun before you hear it.",
          },
        ],
      },
    },
  ],
};
