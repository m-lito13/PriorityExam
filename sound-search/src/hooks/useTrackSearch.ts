import { useEffect, useRef, useState } from "react";
import { soundApiClient, isAbortError, SoundApiError } from "../api";
import type { Track } from "../types";
import { PAGE_SIZE, DEBOUNCE_MS } from "../const/search";

export type SearchStatus = "idle" | "loading" | "error" | "ready";

/** Everything needed to redisplay a page without re-hitting the API. */
interface PageSnapshot {
  tracks: Track[];
  nextCursor: string | null;
  previousCursor: string | null;
}

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

  const latestRequestIdRef = useRef(0);

  // Pages already fetched for the *current* committed term, in the order
  // visited (index 0 = first page). Navigation here is strictly linear —
  // Next/Previous only ever move one position at a time — so position is
  // enough to identify a page; we don't need to match provider cursor
  // strings, which aren't guaranteed to round-trip (e.g. Mixcloud's
  // `previousCursor` on page 2 is its own opaque URL, not the `null`
  // sentinel our own first request used). Lets Next then Previous redisplay
  // a page instantly with no network call. Reset whenever a new term is
  // committed, since pages from a different term don't belong here.
  const pageStackRef = useRef<PageSnapshot[]>([]);
  const pageIndexRef = useRef(-1);

  // The (term, cursor, navigation) of the most recently *attempted* fetch —
  // updated whether it succeeds or fails, unlike the stack above. `retry`
  // replays this verbatim, so it redoes whatever actually failed (a first
  // search or a Next) rather than re-requesting whatever page happens to
  // be showing.
  const pendingFetchRef = useRef<{ term: string; cursor: string | null; navigation: "reset" | "forward" }>(
    { term: "", cursor: null, navigation: "reset" },
  );

  function applySnapshot(snapshot: PageSnapshot) {
    setTracks(snapshot.tracks);
    setNextCursor(snapshot.nextCursor);
    setPreviousCursor(snapshot.previousCursor);
    setStatus("ready");
  }

  // Redisplay a cached page without touching the network — still cancels
  // any in-flight request so a slow stale response can't clobber it.
  function restoreCachedPage(targetIndex: number, snapshot: PageSnapshot) {
    abortControllerRef.current?.abort();
    latestRequestIdRef.current += 1;
    pageIndexRef.current = targetIndex;
    setErrorMessage(undefined);
    applySnapshot(snapshot);
  }

  function fetchPage(term: string, pageCursor: string | null, navigation: "reset" | "forward") {
    const trimmed = term.trim();
    if (!trimmed) {
      abortControllerRef.current?.abort();
      latestRequestIdRef.current += 1;
      setStatus("idle");
      setTracks([]);
      setNextCursor(null);
      setPreviousCursor(null);
      pageStackRef.current = [];
      pageIndexRef.current = -1;
      return;
    }

    pendingFetchRef.current = { term, cursor: pageCursor, navigation };

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
        const snapshot: PageSnapshot = {
          tracks: response.tracks,
          nextCursor: response.nextCursor,
          previousCursor: response.previousCursor,
        };
        if (navigation === "reset") {
          pageStackRef.current = [snapshot];
          pageIndexRef.current = 0;
        } else {
          const targetIndex = pageIndexRef.current + 1;
          pageStackRef.current = [...pageStackRef.current.slice(0, targetIndex), snapshot];
          pageIndexRef.current = targetIndex;
        }
        applySnapshot(snapshot);
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
    // Clear synchronously (not just inside fetchPage's success handler) so
    // a failed search for the new term can't leave the previous term's
    // pages sitting in the cache for Next/Previous to serve up.
    pageStackRef.current = [];
    pageIndexRef.current = -1;
    fetchPage(term, null, "reset");
    // History should reflect what the user actually meant to search for,
    // not whatever partial word the debounce happened to fire on — so
    // only an explicit submit (submitSearch) logs it, never the
    // live-as-you-type debounce path below.
    if (recordHistory && term.trim()) { 
      onCommitted(term.trim());
    } 
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
    const targetIndex = pageIndexRef.current + 1;
    const cached = pageStackRef.current[targetIndex];
    if (cached) {
      restoreCachedPage(targetIndex, cached);
      return;
    }
    fetchPage(query, nextCursor, "forward");
  }

  function goPrevious() {
    if (!previousCursor) return;
    const targetIndex = pageIndexRef.current - 1;
    const cached = pageStackRef.current[targetIndex];
    if (cached) {
      restoreCachedPage(targetIndex, cached);
      return;
    }
    // Structurally shouldn't happen — a previousCursor only ever exists
    // because we already visited that earlier page — but fall back to a
    // fresh fetch, treated as a new baseline, rather than getting stuck.
    fetchPage(query, previousCursor, "reset");
  }

  function retry() {
    const pending = pendingFetchRef.current;
    fetchPage(pending.term, pending.cursor, pending.navigation);
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
