/**
 * Reads a JSON value from localStorage. Returns `fallback` if the key is
 * missing, storage is unavailable (private browsing, disabled, SSR), or
 * the stored value doesn't pass `isValid`.
 */
export function readJson<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/** Writes a JSON value to localStorage. Silently no-ops if storage isn't available. */
export function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing, quota exceeded, or storage disabled — nothing
    // useful to do here; the app just won't persist this session.
  }
}
