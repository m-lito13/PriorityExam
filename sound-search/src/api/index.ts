import type { SoundApiClient } from "./types";
import { MixcloudSoundApiClient } from "./mixcloudSoundApiClient";

export type { SearchOptions, SearchResponse, SoundApiClient } from "./types";
export { SoundApiError, isAbortError } from "./errors";

export const soundApiClient: SoundApiClient = new MixcloudSoundApiClient();
