# Changelog

## 2026-06-24

- Use `@posthog/hedgehog-mode@0.0.53`, which externalizes pixi.js for MV3 / strict-CSP compatibility ([PostHog/hedgehog-mode#30](https://github.com/PostHog/hedgehog-mode/pull/30))
- Added a pnpm/esbuild build step that bundles the content script and popup (`pnpm install && pnpm build`)
- Patched pixi.js for MV3 / strict-CSP pages: eval-free shaders (`pixi.js/unsafe-eval`) and main-thread texture loading (no blob Web Worker)
- Added Hogzilla and Ghost skins, `rainbow` color, Spiderhog web-slinging, in-page message bubbles, cheat sheet, and extra secret codes (`spawn`, `chaos`, `hello`, `giant`, `tiny`, `slow`, `fast`, `cheatcodes`, `death`)
- Popup previews now render from the engine's spritesheet via `StaticHedgehog`
- Updated the extension icon

## 2026-01-30

- Per-site toggle to disable hedgehog on specific websites
- Sound effects for jump, land, and fire (Web Audio API)
- Spiderhog web line visual during web-slinging
- Cross-tab config sync via `chrome.storage.onChanged`
- ARIA labels, focus outlines, keyboard navigation
- Extracted shared constants into `shared.js`
- Replaced magic numbers with named constants
- Deduplicated accessory selection logic
- Larger preview grid items
- Fixed global enable and per-site toggle interfering with each other
- Fixed hedgehog teleporting after browser lag spikes

## 2026-01-24

- Added demo GIF to README

## 2026-01-23

- Animated hedgehog buddy on any website
- Drag, throw, walk, jump, and double jump
- Spiderhog, Robohog skins and 10 color filters
- 16 accessories (headwear, eyewear, other)
- Secret keyboard codes
- Settings persist via `chrome.storage.sync`
- Dark theme popup with preview card
- Skin, color, and accessory grids
- Toggle pills for options
- Optimized animation loop with FPS throttling
- Cached ground element queries, sprite URLs, and filter values
