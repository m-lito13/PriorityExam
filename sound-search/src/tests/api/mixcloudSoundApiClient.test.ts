import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MixcloudSoundApiClient } from "../../api/mixcloudSoundApiClient";
import { SoundApiError } from "../../api/errors";

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    ...init,
    headers: { "Content-Type": "application/json" },
  });
}

describe("MixcloudSoundApiClient", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let client: MixcloudSoundApiClient;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    client = new MixcloudSoundApiClient();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns an empty page without calling fetch for a blank query", async () => {
    const result = await client.search({ query: "   " });

    expect(result).toEqual({ tracks: [], nextCursor: null, previousCursor: null });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("builds the first-page search URL from query and pageSize", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }));

    await client.search({ query: "deep house", pageSize: 12 });

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://api.mixcloud.com/search/?q=deep+house&type=cloudcast&limit=12",
    );
  });

  it("uses a paging cursor verbatim instead of rebuilding query params", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }));
    const cursor = "https://api.mixcloud.com/search/?q=deep+house&offset=12";

    await client.search({ query: "deep house", cursor });

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(cursor);
  });

  it("maps a cloudcast to a Track, falling back through picture sizes and user fields", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: [
          {
            key: "/artist/show/",
            url: "https://www.mixcloud.com/artist/show/",
            name: "Late Night Mix",
            user: { username: "artistname" },
            pictures: { medium: "https://img/medium.jpg", thumbnail: "https://img/thumb.jpg" },
          },
        ],
        paging: { next: "next-url", previous: null },
      }),
    );

    const result = await client.search({ query: "mix" });

    expect(result.tracks).toEqual([
      {
        id: "/artist/show/",
        name: "Late Night Mix",
        artist: "artistname",
        imageUrl: "https://img/medium.jpg",
        embedUrl:
          "https://player-widget.mixcloud.com?feed=https%3A%2F%2Fwww.mixcloud.com%2Fartist%2Fshow%2F&hide_cover=1&light=1&autoplay=1",
      },
    ]);
    expect(result.nextCursor).toBe("next-url");
    expect(result.previousCursor).toBeNull();
  });

  it("falls back to 'Unknown artist' when the cloudcast has no user name or username", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: [{ key: "k", url: "u", name: "n", pictures: {} }],
      }),
    );

    const result = await client.search({ query: "mix" });

    expect(result.tracks[0].artist).toBe("Unknown artist");
    expect(result.tracks[0].imageUrl).toBe("");
  });

  it("defaults nextCursor/previousCursor to null when paging is absent", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }));

    const result = await client.search({ query: "mix" });

    expect(result.nextCursor).toBeNull();
    expect(result.previousCursor).toBeNull();
  });

  it("rethrows an AbortError as-is instead of wrapping it", async () => {
    const abortError = new DOMException("Aborted", "AbortError");
    fetchMock.mockRejectedValueOnce(abortError);

    await expect(client.search({ query: "mix" })).rejects.toBe(abortError);
  });

  it("wraps a network failure in a SoundApiError", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("network down"));

    await expect(client.search({ query: "mix" })).rejects.toBeInstanceOf(SoundApiError);
  });

  it("throws a SoundApiError with the status when the response isn't ok", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));

    await expect(client.search({ query: "mix" })).rejects.toThrow(/HTTP 500/);
  });

  it("throws a SoundApiError when the response body isn't valid JSON", async () => {
    fetchMock.mockResolvedValueOnce(new Response("not json", { status: 200 }));

    await expect(client.search({ query: "mix" })).rejects.toBeInstanceOf(SoundApiError);
  });
});
