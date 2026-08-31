import { useEffect, useRef, useState } from "react";
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
  /**
   * Call when the user picks a track from whatever's currently displayed —
   * including results that only ever came from the live-typing debounce,
   * never an explicit Enter/Go. A click is just as strong a signal of
   * intent as pressing Go, so it should land in history too.
   */
  notifyResultSelected: () => void;
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
 * `onCommitted` is called once per moment the user's intent is clear:
 * an explicit submit (Enter, Go, or clicking a recent-search entry), OR
 * picking a track from whatever's currently on screen — never from the
 * live-as-you-type debounce path on its own, so a mid-word pause can't
 * leak a partial term into history.
 *
 * Note: no useCallback here. Nothing downstream is wrapped in React.memo,
 * so memoizing these handlers wouldn't skip any renders — it'd just be
 * extra bookkeeping. Plain functions redefined each render close over the
 * current state just as correctly, and are simpler to read.
 */
export function useTrackSearch(onCommitted: (term: string) => void): UseTrackSearchResult {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [previousCursor, setPreviousCursor] = useState<string | null>(null);
  // The term that actually produced the tracks currently on screen — not
  // necessarily whatever's in the text box right now, since the user may
  // have kept typing after this fetch was kicked off. This is what
  // `notifyResultSelected` should record, not `query`.
  const [resultsTerm, setResultsTerm] = useState("");

  // Survive re-renders without themselves triggering one.
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<number | undefined>(undefined);
  // AbortController alone isn't enough to prevent a race: abort() only
  // affects a request that's still pending. If an earlier request happens
  // to fully resolve just before a newer one starts, abort() on it does
  // nothing — it already settled — and its .then() can still fire *after*
  // the newer request's, clobbering fresher state with stale results. This
  // counter is the actual guard: every response checks it's still the most
  // recently *started* request before touching state, independent of what
  // the abort signal says.
  const latestRequestIdRef = useRef(0);

  function fetchPage(term: string, pageCursor: string | null) {
    const trimmed = term.trim();
    if (!trimmed) {
      abortControllerRef.current?.abort();
      latestRequestIdRef.current += 1;
      setStatus("idle");
      setTracks([]);
      setNextCursor(null);
      setPreviousCursor(null);
      return;
    }

    // Cancel whatever was in flight — a fresh search, or a rapid extra
    // Next/Previous click — so its response can never land after this one
    // in the common case, and is dropped by the requestId check below even
    // in the rare case it slips through anyway.
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const requestId = (latestRequestIdRef.current += 1);

    setStatus("loading");
    setErrorMessage(undefined);

    soundApiClient
      .search({ query: trimmed, cursor: pageCursor, pageSize: PAGE_SIZE, signal: controller.signal })
      .then((response) => {
        if (latestRequestIdRef.current !== requestId) return; // superseded — drop it
        setTracks(response.tracks);
        setNextCursor(response.nextCursor);
        setPreviousCursor(response.previousCursor);
        setStatus("ready");
        setResultsTerm(trimmed);
      })
      .catch((err: unknown) => {
        if (latestRequestIdRef.current !== requestId) return; // superseded — drop it
        if (isAbortError(err)) return; // genuinely cancelled — no state change
        setStatus("error");
        setErrorMessage(
          err instanceof SoundApiError ? err.message : "Something went wrong. Please try again.",
        );
      });
  }

  function commit(term: string, recordHistory: boolean) {
    window.clearTimeout(debounceTimerRef.current);
    setCursor(null);
    fetchPage(term, null);
    // History should reflect what the user actually meant to search for,
    // not whatever partial word the debounce happened to fire on — so
    // only an explicit submit (submitSearch) logs it, never the
    // live-as-you-type debounce path below.
    if (recordHistory && term.trim()) onCommitted(term.trim());
  }

  function updateQuery(value: string) {
    setQuery(value);
    window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(() => {
      commit(value, false);
    }, DEBOUNCE_MS);
  }

  function submitSearch(value: string) {
    setQuery(value);
    commit(value, true);
  }

  function goNext() {
    if (!nextCursor) return;
    setCursor(nextCursor);
    fetchPage(query, nextCursor);
  }

  function goPrevious() {
    if (!previousCursor) return;
    setCursor(previousCursor);
    fetchPage(query, previousCursor);
  }

  function retry() {
    fetchPage(query, cursor);
  }

  function notifyResultSelected() {
    const term = resultsTerm || query.trim();
    if (term) { 
      onCommitted(term);
    } 
  }

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
    notifyResultSelected,
  };
}
