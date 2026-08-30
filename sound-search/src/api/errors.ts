/**
 * Thrown by a SoundApiClient when a request fails for a reason other than
 * cancellation (network failure, non-2xx response, malformed payload, etc).
 * Kept distinct from AbortError so callers can tell "the user cancelled
 * this" apart from "this actually needs a retry button".
 */
export class SoundApiError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "SoundApiError";
  }
}

/** True when `err` is the standard cancellation error thrown by fetch/AbortController. */
export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}
