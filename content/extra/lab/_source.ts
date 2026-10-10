import type { BlockOf } from "@/lib/content/schema";

/** The shape `tools/voa/fetch-voa.ts` writes. */
export type VoaSource = {
  title: string;
  sourceUrl: string;
  audio: string;
  credit: string;
  creditUrl: string;
  paragraphs: string[];
};

/** "Anna: Hum. Oh!" — a short name, then a colon. The same rule the
 *  book's own scripts use, so a dialogue reads with its speakers. */
const SPEAKER = /^([A-Z][A-Za-z' .-]{1,24}):\s*(.+)$/;

/**
 * Turns a fetched VOA report into a script block.
 *
 * The transcript is reproduced in full and unedited, because it is the
 * text of the recording: trimming it would leave the script and the audio
 * saying different things. The credit travels with it.
 */
export function scriptFrom(
  source: VoaSource,
  recording: string,
): BlockOf<"script"> {
  return {
    kind: "script",
    title: source.title,
    recording,
    audio: source.audio,
    credit: source.credit,
    creditUrl: source.sourceUrl,
    lines: source.paragraphs.map((text) => {
      const match = SPEAKER.exec(text);
      return match
        ? { speaker: match[1].trim(), text: match[2].trim() }
        : { text };
    }),
  };
}
