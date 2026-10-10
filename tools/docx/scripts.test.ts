import { describe, expect, it } from "vitest";

import { collectScripts } from "./scripts";
import type { DocNode } from "./read-docx";

/* Fixtures below are shaped like the book but are not course content:
 * they exist to prove the Appendix A path works before the real appendix
 * arrives. */

function para(style: string, text: string): DocNode {
  return {
    type: "para",
    style,
    numbered: false,
    runs: [{ text, bold: false, italic: false, color: null }],
    text,
  };
}

describe("collectScripts", () => {
  it("attaches a script to the section its questions are in", () => {
    const nodes: DocNode[] = [
      para("Heading1", "Appendix A: Listening Scripts"),
      para("Heading2", "A.1  Recording 1, a telephone enquiry"),
      para("Normal", "RECEPTIONIST: Good morning, Al Noor Sports Centre."),
      para("Normal", "CALLER: Hello, I'd like to ask about membership."),
      para("Heading1", "Appendix B: Answer Keys"),
      para("Normal", "This should not be picked up."),
    ];

    const index = collectScripts(nodes);
    const scripts = index.get("2.3");

    expect(scripts).toHaveLength(1);
    expect(scripts?.[0].title).toBe("Recording 1, a telephone enquiry");
    expect(scripts?.[0].recording).toBe("Recording 1");
    expect(scripts?.[0].lines).toEqual([
      { speaker: "RECEPTIONIST", text: "Good morning, Al Noor Sports Centre." },
      { speaker: "CALLER", text: "Hello, I'd like to ask about membership." },
    ]);
  });

  it("keeps a single-voice talk as plain lines", () => {
    const nodes: DocNode[] = [
      para("Heading1", "Appendix A"),
      para("Heading2", "A.4  Recording 4, a lecture"),
      para("Normal", "Today I want to talk about vertical farming."),
      para("Normal", "There are three reasons for this."),
    ];

    const lines = collectScripts(nodes).get("10.2")?.[0].lines;
    expect(lines).toEqual([
      { text: "Today I want to talk about vertical farming." },
      { text: "There are three reasons for this." },
    ]);
  });

  it("groups the practice test's four recordings under one section", () => {
    const nodes: DocNode[] = [
      para("Heading1", "Appendix A"),
      para("Heading2", "A.5  Recording 1"),
      para("Normal", "First recording."),
      para("Heading2", "A.6  Recording 2"),
      para("Normal", "Second recording."),
    ];

    const scripts = collectScripts(nodes).get("listening");
    expect(scripts).toHaveLength(2);
    expect(scripts?.map((s) => s.title)).toEqual([
      "Recording 1",
      "Recording 2",
    ]);
  });

  it("ignores an appendix section that keys nothing", () => {
    const nodes: DocNode[] = [
      para("Heading1", "Appendix A"),
      para("Heading2", "A.99  Something the mapping does not know"),
      para("Normal", "Orphan text."),
    ];
    expect(collectScripts(nodes).size).toBe(0);
  });

  it("returns nothing when the book has no Appendix A", () => {
    const nodes: DocNode[] = [
      para("Heading1", "Part 2: Listening"),
      para("Heading2", "2.3  Question type 1"),
      para("Normal", "Body text."),
    ];
    expect(collectScripts(nodes).size).toBe(0);
  });

  it("does not mistake a sentence with a colon for a speaker", () => {
    const nodes: DocNode[] = [
      para("Heading1", "Appendix A"),
      para("Heading2", "A.1  Recording 1"),
      para(
        "Normal",
        "The rule is simple and it reads like this: listen once only.",
      ),
    ];
    const lines = collectScripts(nodes).get("2.3")?.[0].lines;
    expect(lines?.[0].speaker).toBeUndefined();
  });
});
