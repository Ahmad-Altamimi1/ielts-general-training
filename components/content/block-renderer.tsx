import {
  Callout,
  ContentTable,
  Heading,
  List,
  Passage,
  Prose,
  Worked,
} from "@/components/content/blocks";
import { ExerciseCard } from "@/components/exercise/exercise-card";
import type { Block } from "@/lib/content/schema";

/** Renders one block. Every `Block` kind is handled; the switch is
 *  exhaustive and TypeScript enforces that. */
export function BlockRenderer({ block }: { block: Block }) {
  switch (block.kind) {
    case "prose":
      return <Prose block={block} />;
    case "heading":
      return <Heading block={block} />;
    case "list":
      return <List block={block} />;
    case "callout":
      return <Callout block={block} />;
    case "table":
      return <ContentTable block={block} />;
    case "passage":
      return <Passage block={block} />;
    case "worked":
      return <Worked block={block} />;
    case "exercise":
      return <ExerciseCard exercise={block.exercise} />;
  }
}

export function Blocks({ blocks }: { blocks: readonly Block[] }) {
  return (
    <>
      {blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} />
      ))}
    </>
  );
}
