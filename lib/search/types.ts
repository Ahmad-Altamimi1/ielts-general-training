/** Where the generated index is served from. It is a plain static file:
 *  no search service, no server. */
export const SEARCH_INDEX_PATH = "/search-index.json";

export type SearchEntry = {
  /** "/part-3/3.5" */
  href: string;
  /** "Part 3" — or the title itself for front and back matter. */
  partLabel: string;
  /** "3.5", shown before the section title in results. */
  sectionId: string;
  sectionTitle: string;
  /** Section prose, flattened and capped. Lower-cased for matching. */
  text: string;
};
