import type { Part } from "@/lib/content/schema";

import listeningLab from "./listening-lab";

/**
 * Parts written for this app rather than converted from the book.
 *
 * Kept apart from the generated modules so the line is never blurred:
 * everything under `content/part-*.ts` is the teacher's book, everything
 * here is not, and `npm run content` only ever rewrites the former.
 */
export const extraParts: Part[] = [listeningLab];
