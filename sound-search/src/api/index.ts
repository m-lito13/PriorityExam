import type { SoundApiClient } from "./types";
import { MockSoundApiClient } from "./mockSoundApiClient";

export type { SearchOptions, SearchResponse, SoundApiClient } from "./types";
export { SoundApiError, isAbortError } from "./errors";

/**
 * The rest of the app imports `soundApiClient` from here and never
 * references `MockSoundApiClient` directly. To switch to the real Sound
 * API (e.g. Mixcloud), write a `MixcloudSoundApiClient implements
 * SoundApiClient` alongside this file and change the line below — no
 * other file in the app needs to change.
 */
export const soundApiClient: SoundApiClient = new MockSoundApiClient();
