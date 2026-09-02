import type { Track } from "../types";
import type { SearchOptions, SearchResponse, SoundApiClient } from "./types";
import { SoundApiError, isAbortError } from "./errors";
import { delay } from "./delay";

const DEFAULT_PAGE_SIZE = 6;
const SIMULATED_LATENCY_MS = 500;

/**
 * Deterministically fabricates a pool of tracks for a query, so paging
 * through the same search term is stable across requests (as a real API's
 * result set would be for a given query).
 */
function buildMockPool(query: string): Track[] {
  const normalized = query.trim().toLowerCase();
  const poolSize = 26;

  return Array.from({ length: poolSize }, (_, i) => {
    const seed = `${normalized}-${i}`;
    return {
      id: seed,
      name: `${capitalize(normalized)} Session ${i + 1}`,
      artist: `${capitalize(normalized)} Collective`,
      // Mock artwork API. Will become the artwork URL from the real
      // provider's search response (e.g. Mixcloud's `pictures.large`).
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/400`,
      // Will become the provider's embeddable player URL (e.g. Mixcloud's
      // widget iframe URL built from the cloudcast key).
      embedUrl: `https://mock-embed.example.com/tracks/${encodeURIComponent(seed)}`,
    };
  });
}

function capitalize(value: string): string {
  if (!value) return "Untitled";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function encodeCursor(offset: number): string {
  return btoa(String(offset));
}

function decodeCursor(cursor: string | null | undefined): number {
  if (!cursor) return 0;
  try {
    const parsed = parseInt(atob(cursor), 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export class MockSoundApiClient implements SoundApiClient {
  async search({
    query,
    cursor,
    pageSize = DEFAULT_PAGE_SIZE,
    signal,
  }: SearchOptions): Promise<SearchResponse> {
    try {
      await delay(SIMULATED_LATENCY_MS, signal);
    } catch (err) {
      if (isAbortError(err)) throw err;
      throw new SoundApiError("Mock search request failed while waiting.", err);
    }

    // Testing hook: search "throws error" to exercise the error state, or
    // "no results" to exercise the empty state, without touching real data.
    const normalized = query.trim().toLowerCase();
    if (normalized === "throws error") {
      throw new SoundApiError("Simulated failure: the search service is unreachable.");
    }
    if (normalized === "no results") {
      return { tracks: [], nextCursor: null, previousCursor: null };
    }

    const offset = decodeCursor(cursor);
    const pool = buildMockPool(query);
    const tracks = pool.slice(offset, offset + pageSize);

    const nextOffset = offset + pageSize;
    const nextCursor = nextOffset < pool.length ? encodeCursor(nextOffset) : null;
    const previousCursor = offset > 0 ? encodeCursor(Math.max(0, offset - pageSize)) : null;

    return { tracks, nextCursor, previousCursor };
  }
}
