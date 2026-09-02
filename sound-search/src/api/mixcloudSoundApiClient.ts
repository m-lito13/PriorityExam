import type { Track } from "../types";
import type { SearchOptions, SearchResponse, SoundApiClient } from "./types";
import { SoundApiError, isAbortError } from "./errors";
import { MIXCLOUD_API } from "../const/mixcloudApi";
import { PAGE_SIZE } from "../const/search";

const { SEARCH_ENDPOINT, EMBED_BASE } = MIXCLOUD_API;

// Only the fields we actually read. Mixcloud's real objects have more —
// deliberately not modeling those, so a schema change there doesn't ripple
// into fields this app never touches.
interface MixcloudPictures {
  extra_large?: string;
  large?: string;
  medium?: string;
  thumbnail?: string;
}

interface MixcloudUser {
  name?: string;
  username?: string;
}

interface MixcloudCloudcast {
  key: string;
  url: string;
  name: string;
  user?: MixcloudUser;
  pictures?: MixcloudPictures;
}

interface MixcloudSearchPayload {
  data: MixcloudCloudcast[];
  paging?: {
    next: string | null;
    previous: string | null;
  };
}

function toTrack(cloudcast: MixcloudCloudcast): Track {
  return {
    id: cloudcast.key,
    name: cloudcast.name,
    artist: cloudcast.user?.name ?? cloudcast.user?.username ?? "Unknown artist",
    imageUrl:
      cloudcast.pictures?.extra_large ??
      cloudcast.pictures?.large ??
      cloudcast.pictures?.medium ??
      cloudcast.pictures?.thumbnail ??
      "",
    embedUrl: buildEmbedUrl(cloudcast.url),
  };
}

/**
 * Mixcloud's widget takes the show's own page URL as `feed`
 * — see https://www.mixcloud.com/developers/ "Embedding" and the sample
 * URL in the exam brief:
 * mixcloud.com/widget/iframe/?feed=<show url>&hide_cover=1&light=1
 */
function buildEmbedUrl(showUrl: string): string {
  const params = new URLSearchParams({
    feed: showUrl,
    hide_cover: "1",
    light: "1",
    autoplay: "1"
  });
  return `${EMBED_BASE}?${params.toString()}`;
}

export class MixcloudSoundApiClient implements SoundApiClient {
  async search({ query, cursor, pageSize = PAGE_SIZE, signal }: SearchOptions): Promise<SearchResponse> {
    const trimmed = query.trim();
    if (!trimmed) {
      return { tracks: [], nextCursor: null, previousCursor: null };
    }

    // A cursor, when we have one, IS the full `paging.next` / `paging.previous`
    // URL Mixcloud already gave us — we only ever build query params
    // ourselves for the very first page. This is why nothing above this
    // file needs to know or care how Mixcloud's paging actually works.
    const url =
      cursor ??
      `${SEARCH_ENDPOINT}?${new URLSearchParams({
        q: trimmed,
        type: "cloudcast",
        limit: String(pageSize),
      }).toString()}`;

    let response: Response;
    try {
      response = await fetch(url, { signal });
    } catch (err) {
      if (isAbortError(err)) throw err;
      throw new SoundApiError(
        "Couldn't reach Mixcloud. Check your connection and try again.",
        err,
      );
    }

    if (!response.ok) {
      throw new SoundApiError(`Mixcloud search failed (HTTP ${response.status}).`);
    }

    let payload: MixcloudSearchPayload;
    try {
      payload = (await response.json()) as MixcloudSearchPayload;
    } catch (err) {
      throw new SoundApiError("Mixcloud returned an unexpected response.", err);
    }

    return {
      tracks: (payload.data ?? []).map(toTrack),
      nextCursor: payload.paging?.next ?? null,
      previousCursor: payload.paging?.previous ?? null,
    };
  }
}
