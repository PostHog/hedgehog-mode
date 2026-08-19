// Which physical key drives which control.
//
// TRICKY: These are resolved from `event.code`, not `event.key`, because `key`
// is what the keypress *produces* and every modifier rewrites it: macOS turns
// ⌥+a into "å" and every platform turns shift+a into "A". Keying off it meant
// moonwalking and running with WASD never registered at all, and — worse — a
// keydown of "a" followed by a keyup of "å" never matched, so the key stayed
// held and the hog walked off the edge of the world forever.
//
// `code` is the physical key, so "KeyA" stays "KeyA" whatever is held with it.

export type ControlKey =
  | "left"
  | "right"
  | "up"
  | "down"
  | "shift"
  | "alt"
  | "f";

const CODE_MAPPING: Record<string, ControlKey> = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  ArrowUp: "up",
  KeyW: "up",
  Space: "up",
  ArrowDown: "down",
  KeyS: "down",
  ShiftLeft: "shift",
  ShiftRight: "shift",
  AltLeft: "alt",
  AltRight: "alt",
  KeyF: "f",
};

// Fallback for the mobile keyboards and IMEs that report no code at all. Keys
// are lowercased first so a stray "A" or "F" still lands.
const KEY_MAPPING: Record<string, ControlKey> = {
  arrowleft: "left",
  a: "left",
  arrowright: "right",
  d: "right",
  arrowup: "up",
  w: "up",
  " ": "up",
  arrowdown: "down",
  s: "down",
  shift: "shift",
  alt: "alt",
  f: "f",
};

/** The control a key event drives, or null if it drives none. */
export function resolveControlKey(
  event: Pick<KeyboardEvent, "code" | "key">
): ControlKey | null {
  const byCode = event.code ? CODE_MAPPING[event.code] : undefined;
  if (byCode) {
    return byCode;
  }
  return KEY_MAPPING[event.key?.toLowerCase()] ?? null;
}
