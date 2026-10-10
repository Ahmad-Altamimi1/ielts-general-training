import type { Section } from "@/lib/content/schema";
import source from "@/content/voa/learn-new-skills-with-microcredentials.json";
import { scriptFrom } from "./_source";

/**
 * Note completion on an academic monologue — the shape of Section 4.
 *
 * Answers checked against the transcript in content/voa/.
 */
export const microcredentialsSection: Section = {
  id: "lab-1",
  title: "Microcredentials: a short course that employers recognise",
  blocks: [
    {
      kind: "prose",
      md: "A single speaker explaining a subject, the way **Section 4** of the Listening test works. There is no second voice to help you, so follow the speaker's signposts — *what is*, *how to find*, *how much* — because each one tells you a group of answers is coming.",
    },
    scriptFrom(source, "Recording A"),
    {
      kind: "exercise",
      exercise: {
        id: "ex-lab-1",
        title: "Questions 1 to 10",
        instruction:
          "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        kind: "gapfill",
        questions: [
          {
            n: 1,
            prompt:
              "UNESCO's definition: a professional certification covering learning outcomes in a … field.",
            answers: ["narrow"],
            why: 'The gap sits between "a" and "field", so grammar fixes it as an adjective before you hear a word. "Short" is said close by, but it describes the time the course takes, not the field.',
          },
          {
            n: 2,
            prompt: "Length of study: from one … to one month.",
            answers: ["week"],
            why: 'From a week to a month. The gap takes the first of the two, and "one" is already printed, so writing "a week" would be two words and over the limit.',
          },
          {
            n: 3,
            prompt: "Most popular fields: data analytics, IT support and …",
            answers: ["cybersecurity", "cyber security"],
            why: "Three fields are listed and the first two are printed, so only the third is missing. Students who start writing at the first thing they recognise lose this one.",
          },
          {
            n: 4,
            prompt:
              "Courses are often built by technology companies: Google, Salesforce, Meta, Intuit and …",
            answers: ["IBM"],
            why: "Five companies are named in order and the printed list stops at Intuit. Keep your eye on the last item in a list, not the first.",
          },
          {
            n: 5,
            prompt:
              "Coursera's report: … per cent of US colleges offering microcredentials also give school credit.",
            answers: ["51"],
            why: "Fifty-one per cent, said once. Note what the figure counts: colleges that already give credit, not the ones that plan to, which is the next thing the speaker says.",
          },
          {
            n: 6,
            prompt:
              "Example: at … Pacific University, adding certifications sharply increased interest.",
            answers: ["Hawaii"],
            why: 'Hawaii Pacific University. "Pacific University" is printed, so only the first word is needed; writing the whole name is over the limit even though it is what you heard.',
          },
          {
            n: 7,
            prompt: "To search by field or industry, use the … Finder service.",
            answers: ["Credential"],
            why: 'Credential Finder is a name, so it takes a capital letter. "Finder" is printed, which tells you the answer is one word, not two.',
          },
          {
            n: 8,
            prompt: "Ukraine's … UA scheme helps people find training and work.",
            answers: ["ReSkill", "Re-Skill"],
            why: 'ReSkill UA. "UA" is printed after the gap, so only the first word fits. Copying a name exactly is part of the answer.',
          },
          {
            n: 9,
            prompt: "Coursera Plus costs $… a month, or $399 a year.",
            answers: ["59"],
            why: "Fifty-nine dollars monthly. The yearly figure, 399, is printed in the same line and is said immediately afterwards — the trap is hearing the second number and writing that.",
          },
          {
            n: 10,
            prompt:
              "The course materials are often free, but … is required to earn the certificate.",
            answers: ["payment"],
            why: 'The materials are free; the certificate is not. "Free" is said first and is the distractor: the sentence turns on "but".',
          },
        ],
      },
    },
  ],
};
