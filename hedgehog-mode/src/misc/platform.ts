// "alt" is a windows word. On a mac the same key is engraved ⌥ option, so
// telling a mac player to hold alt is telling them to hold a key they haven't
// got.

/** True on macOS/iOS. SSR-safe. */
export function isAppleDevice(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData?.platform ??
    navigator.platform ??
    navigator.userAgent;

  return /mac|iphone|ipad|ipod/i.test(platform ?? "");
}

/** What to call the moonwalk key in front of the player. */
export function altKeyLabel(): string {
  return isAppleDevice() ? "⌥ option" : "alt";
}
