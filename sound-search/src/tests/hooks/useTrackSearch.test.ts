// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useTrackSearch } from "../../hooks/useTrackSearch";
import { soundApiClient } from "../../api";
import type { Track } from "../../types";
import type { SearchResponse } from "../../api";

vi.mock("../../api", async () => {
  const actual = await vi.importActual<typeof import("../../api")>("../../api");
  return {
    ...actual,
    soundApiClient: { search: vi.fn() },
  };
});

const searchMock = vi.mocked(soundApiClient.search);

function track(id: string): Track {
  return { id, name: `Track ${id}`, artist: "Artist", imageUrl: "", embedUrl: "" };
}

// Mirrors the real Mixcloud client: the cursor that gets you "back" to a
// page is the provider's own opaque token, never the same string as the
// `null` sentinel used to fetch a first page — see mixcloudSoundApiClient.ts.
function page(
  tracks: Track[],
  nextCursor: string | null,
  previousCursor: string | null,
): SearchResponse {
  return { tracks, nextCursor, previousCursor };
}

describe("useTrackSearch page cache", () => {
  beforeEach(() => {
    searchMock.mockReset();
  });

  it("redisplays the first page on Previous without a second network call", async () => {
    searchMock.mockResolvedValueOnce(page([track("1")], "next-1", null));
    const { result } = renderHook(() => useTrackSearch(() => {}));

    act(() => result.current.submitSearch("aphex twin"));
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.tracks).toEqual([track("1")]);

    searchMock.mockResolvedValueOnce(page([track("2")], null, "prev-from-page-2"));
    act(() => result.current.goNext());
    await waitFor(() => expect(result.current.tracks).toEqual([track("2")]));
    expect(searchMock).toHaveBeenCalledTimes(2);

    act(() => result.current.goPrevious());
    expect(result.current.tracks).toEqual([track("1")]);
    expect(searchMock).toHaveBeenCalledTimes(2); // no extra fetch
  });

  it("serves both directions from cache across Next, Next, Previous, Previous", async () => {
    searchMock.mockResolvedValueOnce(page([track("1")], "next-1", null));
    const { result } = renderHook(() => useTrackSearch(() => {}));
    act(() => result.current.submitSearch("four tet"));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    searchMock.mockResolvedValueOnce(page([track("2")], "next-2", "prev-1"));
    act(() => result.current.goNext());
    await waitFor(() => expect(result.current.tracks).toEqual([track("2")]));

    searchMock.mockResolvedValueOnce(page([track("3")], null, "prev-2"));
    act(() => result.current.goNext());
    await waitFor(() => expect(result.current.tracks).toEqual([track("3")]));
    expect(searchMock).toHaveBeenCalledTimes(3);

    act(() => result.current.goPrevious());
    expect(result.current.tracks).toEqual([track("2")]);
    act(() => result.current.goPrevious());
    expect(result.current.tracks).toEqual([track("1")]);
    expect(searchMock).toHaveBeenCalledTimes(3); // still just the 3 forward fetches

    act(() => result.current.goNext());
    expect(result.current.tracks).toEqual([track("2")]);
    expect(searchMock).toHaveBeenCalledTimes(3); // forward hop replayed from cache too
  });

  it("clears the cache on a new committed search, so Next always fetches fresh", async () => {
    searchMock.mockResolvedValueOnce(page([track("1")], "next-1", null));
    const { result } = renderHook(() => useTrackSearch(() => {}));
    act(() => result.current.submitSearch("boards of canada"));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    searchMock.mockResolvedValueOnce(page([track("2")], null, "prev-1"));
    act(() => result.current.goNext());
    await waitFor(() => expect(result.current.tracks).toEqual([track("2")]));
    expect(searchMock).toHaveBeenCalledTimes(2);

    // New search reuses the same cursor strings a stale cache entry might
    // wrongly answer from — proves the reset actually clears state.
    searchMock.mockResolvedValueOnce(page([track("9")], "next-1", null));
    act(() => result.current.submitSearch("radiohead"));
    await waitFor(() => expect(result.current.tracks).toEqual([track("9")]));
    expect(searchMock).toHaveBeenCalledTimes(3);

    searchMock.mockResolvedValueOnce(page([track("10")], null, "prev-1"));
    act(() => result.current.goNext());
    await waitFor(() => expect(result.current.tracks).toEqual([track("10")]));
    expect(searchMock).toHaveBeenCalledTimes(4); // fetched, not served from the old term's cache
  });

  it("retry always hits the network even when that page is cached", async () => {
    searchMock.mockResolvedValueOnce(page([track("1")], "next-1", null));
    const { result } = renderHook(() => useTrackSearch(() => {}));
    act(() => result.current.submitSearch("floating points"));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    searchMock.mockResolvedValueOnce(page([track("2")], null, "prev-1"));
    act(() => result.current.goNext());
    await waitFor(() => expect(result.current.tracks).toEqual([track("2")]));

    act(() => result.current.goPrevious());
    expect(result.current.tracks).toEqual([track("1")]);
    expect(searchMock).toHaveBeenCalledTimes(2); // cache hit, no fetch yet

    searchMock.mockResolvedValueOnce(page([track("1-refreshed")], "next-1", null));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.tracks).toEqual([track("1-refreshed")]));
    expect(searchMock).toHaveBeenCalledTimes(3); // retry bypasses the cache
  });
});
