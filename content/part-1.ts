// Generated from the Word book by `npm run content`. Do not edit by hand:
// change the book and re-run, or your edit is lost on the next build.

import type { Part } from "@/lib/content/schema";

const part: Part = {
  "id": "part-1",
  "number": 1,
  "title": "The Test",
  "summary": "format, scoring, and ten rules",
  "sections": [
    {
      "id": "1.1",
      "title": "Test format",
      "blocks": [
        {
          "kind": "table",
          "headers": [
            "Section",
            "Time",
            "Questions",
            "What it contains"
          ],
          "rows": [
            [
              "Listening",
              "30 minutes",
              "40",
              "Four recordings, each heard once only"
            ],
            [
              "Reading",
              "60 minutes",
              "40",
              "Three sections, no extra transfer time"
            ],
            [
              "Writing",
              "60 minutes",
              "2 tasks",
              "A letter of 150 words, an essay of 250 words"
            ],
            [
              "Speaking",
              "11 to 14 min",
              "3 parts",
              "A face to face interview with an examiner"
            ]
          ],
          "widths": [
            1.13,
            1.07,
            1,
            3.04
          ]
        },
        {
          "kind": "prose",
          "md": "Listening and Speaking are identical in the Academic and General Training versions. Only Reading and Writing are different, and that difference works in your favour: the texts are shorter and the letter is easier to learn than a data description."
        }
      ]
    },
    {
      "id": "1.2",
      "title": "How scoring works",
      "blocks": [
        {
          "kind": "prose",
          "md": "In Listening and Reading, one correct answer is worth one mark, out of 40. That raw score is then converted into a band from 1 to 9. Writing and Speaking are marked by trained examiners against four published criteria each."
        },
        {
          "kind": "heading",
          "level": 4,
          "text": "Raw score to band"
        },
        {
          "kind": "prose",
          "md": "This is the part most students do not know, and it changes how you should work. General Training Reading needs more correct answers than Academic Reading for the same band, because the texts are easier."
        },
        {
          "kind": "table",
          "headers": [
            "Band",
            "Listening, out of 40",
            "GT Reading, out of 40",
            "Academic Reading, for comparison"
          ],
          "rows": [
            [
              "4",
              "10",
              "15",
              "10"
            ],
            [
              "5",
              "16",
              "23",
              "15"
            ],
            [
              "6",
              "23",
              "30",
              "23"
            ],
            [
              "7",
              "30",
              "34",
              "30"
            ],
            [
              "8",
              "35",
              "38",
              "35"
            ]
          ],
          "widths": [
            1,
            1.79,
            1.93,
            1.97
          ]
        },
        {
          "kind": "callout",
          "title": "Read that table again",
          "body": [
            "The gap between band 5 and band 6 in Reading is seven answers. Seven questions stand between you and your target. Most students lose those seven not because they failed to understand the text, but because they left blanks, wrote too many words, or spelled the answer wrongly."
          ]
        },
        {
          "kind": "heading",
          "level": 4,
          "text": "Your overall band"
        },
        {
          "kind": "prose",
          "md": "The overall band is the average of the four sections, rounded to the nearest half. If you score 6 in Listening, 5.5 in Reading, 5 in Writing and 6 in Speaking, the total is 22.5, the average is 5.625, and the reported band is 5.5. An average ending in .25 rounds up to the next half band; an average ending in .75 rounds up to the next whole band."
        }
      ]
    },
    {
      "id": "1.3",
      "title": "Ten rules that apply to the whole test",
      "blocks": [
        {
          "kind": "list",
          "ordered": true,
          "items": [
            "Never leave a blank. A wrong answer costs nothing. A blank is a guaranteed zero.",
            "Spelling is part of the answer. A correct word spelled wrongly scores nothing.",
            "Singular and plural are part of the answer. If the text says books and you write book, you lose the mark.",
            "Obey the word limit. If the instruction says two words maximum, three words scores zero even when the meaning is right.",
            "Write in capital letters in Listening and Reading. This removes any doubt about proper nouns and makes your handwriting readable.",
            "Answer the question asked, not the topic. What you personally know about the subject is not a source of answers.",
            "Copy the spelling from the text. If the word is printed in front of you, there is no excuse for getting it wrong.",
            "Watch your own clock. Nobody warns you about time in Reading or Writing.",
            "Do not change an answer unless you have a reason. Your first reading of a question is usually the more careful one.",
            "Transfer as you go. In Reading there is no extra minute at the end to copy answers across."
          ]
        }
      ]
    },
    {
      "id": "1.4",
      "title": "On test day",
      "blocks": [
        {
          "kind": "list",
          "ordered": true,
          "items": [
            "Bring the same ID document you registered with. Without it you will not be admitted.",
            "No paper, no phone, no notes go into the room.",
            "In Listening, use the reading time you are given to read ahead. It is part of the strategy, not a rest.",
            "In Reading, write answers straight onto the answer sheet as you work.",
            "In Writing, start with Task 2 if you are worried about time. It is worth twice as much as Task 1.",
            "If you miss a Listening question, guess immediately and move on. Stopping costs you the next two questions as well."
          ]
        }
      ]
    }
  ],
  "intro": [
    {
      "kind": "prose",
      "md": "IELTS General Training is taken by people who want to work, train or migrate to an English-speaking country. It has four sections, all taken on the same day, except Speaking, which may be on a different day."
    }
  ]
};

export default part;
