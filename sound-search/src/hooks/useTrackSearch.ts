import { useCallback, useEffect, useRef, useState } from "react";
import { soundApiClient, isAbortError, SoundApiError } from "../api";
import type { Track } from "../types";

export type SearchStatus = "idle" | "loading" | "error" | "ready";

const PAGE_SIZE = 6;
const DEBOUNCE_MS = 300;

interface UseTrackSearchResult {
  /** Current text in the search box (kept in sync so a history click updates it too). */
  query: string;
  tracks: Track[];
  status: SearchStatus;
  errorMessage?: string;
  hasNext: boolean;
  hasPrevious: boolean;
  /** Call on every keystroke — debounced internally, cancels any in-flight request. */
  updateQuery: (value: string) => void;
  /** Call on submit (button click / Enter / a recent-search click) — runs immediately, no debounce. */
  submitSearch: (value: string) => void;
  goNext: () => void;
  goPrevious: () => void;
  retry: () => void;
}

/**
 * All of requirement 7/8's async plumbing lives here, in one place, away
 * from any component:
 *  - debounces typing by ~300ms
 *  - cancels the previous request (AbortController) whenever a newer one
 *    starts, whether that's a new search, Next, or Previous — so a slow
 *    stale response can never overwrite what the user is currently looking at
 *  - tracks loading/error/ready status for the view to render
 *
 * `onCommitted` is called once per *executed* search (not per keystroke) so
 * the caller can push it into recent-search history.
 */
export function useTrackSearch(onCommitted: (term: string) => void): UseTrackSearchResult {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [previousCursor, setPreviousCursor] = useState<string | null>(null);

  // Survive re-renders without themselves triggering one.
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<number | undefined>(undefined);
  const activeTermRef = useRef<string>("");

  const fetchPage = useCallback((term: string, pageCursor: string | null) => {
    const trimmed = term.trim();
    if (!trimmed) {
      abortControllerRef.current?.abort();
      setStatus("idle");
      setTracks([]);
      setNextCursor(null);
      setPreviousCursor(null);
      return;
    }

    // Cancel whatever was in flight — a fresh search, or a rapid extra
    // Next/Previous click — so its response can never land after this one.
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    activeTermRef.current = trimmed;

    setStatus("loading");
    setErrorMessage(undefined);

    soundApiClient
      .search({ query: trimmed, cursor: pageCursor, pageSize: PAGE_SIZE, signal: controller.signal })
      .then((response) => {
        setTracks(response.tracks);
        setNextCursor(response.nextCursor);
        setPreviousCursor(response.previousCursor);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return; // superseded — silently ignore, no state change
        setStatus("error");
        setErrorMessage(
          err instanceof SoundApiError ? err.message : "Something went wrong. Please try again.",
        );
      });
  }, []);

  const commit = useCallback(
    (term: string, recordHistory: boolean) => {
      window.clearTimeout(debounceTimerRef.current);
      setCursor(null);
      fetchPage(term, null);
      // History should reflect what the user actually meant to search for,
      // not whatever partial word the debounce happened to fire on — so
      // only an explicit submit (submitSearch) logs it, never the
      // live-as-you-type debounce path below.
      if (recordHistory && term.trim()) onCommitted(term.trim());
    },
    [fetchPage, onCommitted],
  );

  const updateQuery = useCallback(
    (value: string) => {
      setQuery(value);
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = window.setTimeout(() => {
        commit(value, false);
      }, DEBOUNCE_MS);
    },
    [commit],
  );

  const submitSearch = useCallback(
    (value: string) => {
      setQuery(value);
      commit(value, true);
    },
    [commit],
  );

  const goNext = useCallback(() => {
    if (!nextCursor) return;
    setCursor(nextCursor);
    fetchPage(query, nextCursor);
  }, [nextCursor, query, fetchPage]);

  const goPrevious = useCallback(() => {
    if (!previousCursor) return;
    setCursor(previousCursor);
    fetchPage(query, previousCursor);
  }, [previousCursor, query, fetchPage]);

  const retry = useCallback(() => {
    fetchPage(query, cursor);
  }, [fetchPage, query, cursor]);

  useEffect(() => {
    return () => {
      window.clearTimeout(debounceTimerRef.current);
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    query,
    tracks,
    status,
    errorMessage,
    hasNext: nextCursor !== null,
    hasPrevious: previousCursor !== null,
    updateQuery,
    submitSearch,
    goNext,
    goPrevious,
    retry,
  };
}
