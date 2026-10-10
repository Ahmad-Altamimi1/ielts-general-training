import type { Section } from "@/lib/content/schema";
import source from "@/content/voa/how-to-write-a-good-email.json";
import { scriptFrom } from "./_source";

/**
 * Multiple choice on a practical monologue — the shape of Section 2.
 *
 * Every distractor below is something the recording actually says, put
 * somewhere it does not belong. That is how the real test builds them,
 * and it is the only way the practice is worth anything: a wrong option
 * nobody would choose teaches nothing.
 *
 * Answers checked against the transcript in content/voa/.
 */
export const emailSection: Section = {
  id: "lab-2",
  title: "Writing an email that gets a reply",
  blocks: [
    {
      kind: "prose",
      md: "One speaker, giving practical advice in four parts. This is the shape of **Section 2**: not academic, but full of detail you have to hold on to. In multiple choice the recording usually mentions all three options — the question is which one it actually *claims*.",
    },
    scriptFrom(source, "Recording B"),
    {
      kind: "exercise",
      exercise: {
        id: "ex-lab-2",
        title: "Questions 1 to 8",
        instruction: "Choose the correct letter, A, B or C.",
        kind: "mcq",
        questions: [
          {
            n: 1,
            prompt: "The speaker says the subject line is",
            choices: [
              { id: "A", text: "the shortest part of an email." },
              { id: "B", text: "usually the most important part." },
              { id: "C", text: "the part people read last." },
            ],
            answers: ["B"],
            why: "\"The subject line is usually the most important part of an email.\" A is built from \"it should be short\", which is advice about the subject line, not a claim about its length compared with the rest. C reverses what is said: the receiver reads it first.",
          },
          {
            n: 2,
            prompt: 'Putting the word "important" in a subject line is a problem because',
            choices: [
              { id: "A", text: "it does not give enough information." },
              { id: "B", text: "it sounds impolite to the receiver." },
              { id: "C", text: "it is only suitable for formal emails." },
            ],
            answers: ["A"],
            why: "\"This does not provide enough information.\" The reason is given in the same sentence as the problem, which is usual: when a speaker criticises something, the next clause is normally the answer.",
          },
          {
            n: 3,
            prompt: "How you open an email depends mainly on",
            choices: [
              { id: "A", text: "the time of day you are writing." },
              { id: "B", text: "how formal the relationship is." },
              { id: "C", text: "how long the email will be." },
            ],
            answers: ["B"],
            why: "\"The opening of an email depends on things like how formal the relationship is.\" A is the trap: \"Good Morning\" and \"Good Afternoon\" are read out as example openings a moment later, so a student listening for words rather than for the claim hears time of day.",
          },
          {
            n: 4,
            prompt: '"To Whom it May Concern" is suggested when you are writing',
            choices: [
              { id: "A", text: "to someone whose family name you know." },
              { id: "B", text: "to a colleague you work with every day." },
              { id: "C", text: "to someone you do not know, formally." },
            ],
            answers: ["C"],
            why: "\"If you are sending the email to someone you do not know and it is a formal situation.\" A describes the next case the speaker gives — \"Dear Mister Brown\" — and B describes the one before it. All three situations are named; only one carries this opening.",
          },
          {
            n: 5,
            prompt: "In the body of the email, the speaker advises you to",
            choices: [
              { id: "A", text: "put the most important information first." },
              { id: "B", text: "describe your background in detail." },
              { id: "C", text: "leave your questions until the end." },
            ],
            answers: ["A"],
            why: "\"The most important information should come first.\" B half-matches a real instruction — introduce yourself if the person does not know you — but \"in detail\" contradicts \"in as few words as possible\". One word turns a true statement false.",
          },
          {
            n: 6,
            prompt: "According to the speaker, ordering the body this way",
            choices: [
              { id: "A", text: "makes the email look more professional." },
              { id: "B", text: "saves the receiver time." },
              { id: "C", text: "makes a reply more likely." },
            ],
            answers: ["B"],
            why: "\"This makes your email clear to your receiver and saves them time.\" C is true of the talk as a whole — it ends by promising more responses — but it is not the reason given for this piece of advice. Match the reason to the claim it was attached to.",
          },
          {
            n: 7,
            prompt: "The speaker says an automatic signature is useful because it",
            choices: [
              { id: "A", text: "adds your job title for you." },
              { id: "B", text: "saves time while writing." },
              { id: "C", text: "makes the closing more polite." },
            ],
            answers: ["B"],
            why: "\"This is useful because it saves time when you are writing.\" A is assembled from the sentence just before, which says the ending should tell the receiver where you work and what you do — true of a closing, but not what the speaker says the signature does for you.",
          },
          {
            n: 8,
            prompt: "A closing is usually",
            choices: [
              { id: "A", text: "one or two words." },
              { id: "B", text: "one complete sentence." },
              { id: "C", text: "a short paragraph." },
            ],
            answers: ["A"],
            why: "\"It is usually one or two words.\" The examples that follow — Kind regards, Best, Thank you — confirm it. When a speaker gives a rule and then examples, the examples are your check on whether you heard the rule correctly.",
          },
        ],
      },
    },
  ],
};
