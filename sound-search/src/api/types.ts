import type { Track } from "../types";

export interface SearchOptions {
  /** Free-text search term, e.g. an artist or track name. */
  query: string;
  /**
   * Opaque paging cursor returned by a previous call's `nextCursor` /
   * `previousCursor`. Omit (or pass `null`) to fetch the first page.
   *
   * This is intentionally opaque — callers must not decode, construct, or
   * do arithmetic on it. A naive numeric offset would break the moment a
   * provider (like Mixcloud) returns real cursor URLs instead of a page
   * index, so the contract only ever passes the string back verbatim.
   */
  cursor?: string | null;
  /** Results per page. Defaults to 6 per the spec. */
  pageSize?: number;
  /** Lets the caller cancel an in-flight request (debounce / rapid paging). */
  signal?: AbortSignal;
}

export interface SearchResponse {
  tracks: Track[];
  /** Cursor to pass back in to fetch the next page, or null if this is the last page. */
  nextCursor: string | null;
  /** Cursor to pass back in to fetch the previous page, or null if this is the first page. */
  previousCursor: string | null;
}

/**
 * Contract every Sound API provider (mock, Mixcloud, or anything else)
 * implements. Everything above this interface — components, hooks, state —
 * only ever talks to `SoundApiClient`, never to a concrete provider, so
 * swapping providers means writing one new class and changing one line in
 * `api/index.ts`.
 */
export interface SoundApiClient {
  search(options: SearchOptions): Promise<SearchResponse>;
}
