// Shared mapping between the extension's stored `hedgehogConfig` (a flat, popup-friendly
// shape kept in chrome.storage.sync) and the engine's HedgehogActorOptions. Imported by both
// the content script and the popup so the two can never drift out of sync.

// Defaults for a freshly-installed, never-customised hedgehog.
export const DEFAULT_CONFIG = {
  skin: "default",
  color: null,
  accessories: [],
  walking_enabled: true,
  interactions_enabled: true,
  controls_enabled: true,
  friends: [],
};

// Stored config -> engine actor options. (`walking_enabled` is the engine's `ai_enabled`.)
export const toActorOptions = (config = {}) => ({
  skin: config.skin || "default",
  color: config.color || null,
  accessories: config.accessories || [],
  ai_enabled: config.walking_enabled ?? true,
  interactions_enabled: config.interactions_enabled ?? true,
  controls_enabled: config.controls_enabled ?? true,
  friends: config.friends || [],
});

// Engine actor options -> stored config. Keep the key order fixed and identical to
// DEFAULT_CONFIG: the content script dedupes storage writes by JSON-comparing this output,
// so a stable serialization keeps round-trips from looking like changes.
export const fromActorOptions = (options = {}) => ({
  skin: options.skin || "default",
  color: options.color || null,
  accessories: options.accessories || [],
  walking_enabled: options.ai_enabled ?? true,
  interactions_enabled: options.interactions_enabled ?? true,
  controls_enabled: options.controls_enabled ?? true,
  friends: options.friends || [],
});
