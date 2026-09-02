import { useEffect, useState } from "react";
import { readJson, writeJson } from "../utils/localStorage";

const STORAGE_KEY = "sound-search:recent-searches";
const MAX_ENTRIES = 5;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function loadInitial(): string[] {
  return readJson(STORAGE_KEY, [], isStringArray);
}

/**
 * Recent-search history, persisted across visits. State lives here; the
 * component layer only ever sees `recentSearches` and calls `recordSearch`
 * on an explicit search — it doesn't know or care that localStorage exists.
 */
export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>(loadInitial);

  useEffect(() => {
    writeJson(STORAGE_KEY, recentSearches);
  }, [recentSearches]);

  function recordSearch(term: string) {
    setRecentSearches((prev) => {
      const deduped = prev.filter((t) => t.toLowerCase() !== term.toLowerCase());
      const next = [term, ...deduped].slice(0, MAX_ENTRIES);
      return next;
    });
  }

  return { recentSearches, recordSearch };
}
