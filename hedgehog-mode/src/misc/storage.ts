// Small, namespaced, SSR-safe wrapper around localStorage, plus a helper for
// "show this thing at most once per interval" gating (one-off hints, toasts...).

const PREFIX = "hedgehog-mode:";

export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;

export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    // Unavailable (private mode, SSR, blocked) — degrade gracefully.
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(PREFIX + key, value);
  } catch {
    // Ignore — storage being unavailable shouldn't break anything.
  }
}

/**
 * Returns true at most once per `intervalMs` for `key`, stamping the time when
 * it does. Use to throttle one-off hints across sessions, e.g.
 * `if (oncePerInterval("web-climb-hint", DAY_MS)) showHint()`.
 */
export function oncePerInterval(key: string, intervalMs: number): boolean {
  const last = Number(readStorage(key));
  const now = Date.now();
  if (last && now - last < intervalMs) {
    return false;
  }
  writeStorage(key, String(now));
  return true;
}
