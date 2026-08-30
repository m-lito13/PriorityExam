/**
 * Resolves after `ms` milliseconds, or rejects immediately/early with the
 * same AbortError shape `fetch` uses if `signal` is or becomes aborted.
 * Mirrors real request-cancellation behavior so this mock is a faithful
 * stand-in for a fetch-based client later.
 */
export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
