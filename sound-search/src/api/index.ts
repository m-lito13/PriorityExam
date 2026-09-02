import type { SoundApiClient } from "./types";
import { MixcloudSoundApiClient } from "./mixcloudSoundApiClient";

export type { SearchOptions, SearchResponse, SoundApiClient } from "./types";
export { SoundApiError, isAbortError } from "./errors";

/**
 * The rest of the app imports `soundApiClient` from here and never
 * references a concrete client class directly. To switch providers, write
 * a new class implementing `SoundApiClient` alongside this file and change
 * the line below — no other file in the app needs to change.
 */
export const soundApiClient: SoundApiClient = new MixcloudSoundApiClient();
