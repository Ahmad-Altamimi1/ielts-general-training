/** A stable anchor id for a heading. Shared by the renderer and the
 *  "On this page" list, so the two can never disagree. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
