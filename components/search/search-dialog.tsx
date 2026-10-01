"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SEARCH_INDEX_PATH, type SearchEntry } from "@/lib/search/types";

const MAX_RESULTS = 12;

type Scored = { entry: SearchEntry; score: number };

/**
 * Ranks a section against the query.
 *
 * A title match beats a body match, and every query word has to appear
 * somewhere, so "not given" does not return every section containing
 * "not". Deliberately small: the index is a few hundred sections, and a
 * fuzzy matcher here would teach the same bad habit the marking engine
 * refuses to teach.
 */
function score(entry: SearchEntry, words: string[]): number {
  const title = `${entry.sectionId} ${entry.sectionTitle}`.toLowerCase();
  let total = 0;

  for (const word of words) {
    const inTitle = title.includes(word);
    const inText = entry.text.includes(word);
    if (!inTitle && !inText) return 0;
    total += inTitle ? 10 : 1;
  }

  if (title.includes(words.join(" "))) total += 20;
  return total;
}

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const requested = useRef(false);

  // The index is a static file, fetched once, on the first open — not on
  // every page load, where nobody has asked to search yet.
  const loadIndex = useCallback(() => {
    if (requested.current) return;
    requested.current = true;
    fetch(SEARCH_INDEX_PATH)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<SearchEntry[]>;
      })
      .then(setIndex)
      .catch(() => setFailed(true));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((previous) => !previous);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) loadIndex();
  }, [open, loadIndex]);

  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results: Scored[] =
    words.length === 0 || !index
      ? []
      : index
          .map((entry) => ({ entry, score: score(entry, words) }))
          .filter((r) => r.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, MAX_RESULTS);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const emptyMessage = failed
    ? "Search is unavailable. Every section is still reachable from the sidebar."
    : !index
      ? "Loading the index…"
      : "Nothing matches.";

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        onMouseEnter={loadIndex}
        className="h-8 gap-2 px-2.5 text-ink-muted sm:w-56 sm:justify-start sm:px-3"
      >
        <Search aria-hidden="true" className="size-4 shrink-0" />
        <span className="hidden sm:inline">Search the course</span>
        <kbd className="ml-auto hidden rounded-sm border border-rule px-1.5 py-0.5 font-mono text-[0.6875rem] sm:inline">
          Ctrl K
        </kbd>
        <span className="sr-only sm:hidden">Search the course</span>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search the course"
        description="Find a section by its title or its text."
      >
        {/* This CommandDialog does not wrap its children in Command, so the
            command root — and with it the ranking we do ourselves — is set
            up here. */}
        <Command shouldFilter={false} className="p-0">
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search the course…"
          />
          <CommandList>
            {words.length === 0 ? (
              <CommandEmpty>Type to search section titles and text.</CommandEmpty>
            ) : results.length === 0 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
              <CommandGroup heading={`${results.length} section(s)`}>
                {results.map(({ entry }) => (
                  <CommandItem
                    key={entry.href}
                    value={entry.href}
                    onSelect={() => go(entry.href)}
                    className="flex-col items-start gap-0.5"
                  >
                    <span className="text-xs text-ink-muted">
                      {entry.partLabel}
                    </span>
                    <span>
                      <span className="font-heading font-semibold text-brand tabular-nums">
                        {entry.sectionId}
                      </span>{" "}
                      {entry.sectionTitle}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
