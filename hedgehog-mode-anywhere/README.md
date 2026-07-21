# Hedgehog Mode Anywhere 🦔

Bring [PostHog](https://posthog.com)'s beloved hedgehog mascot to any website! An adorable animated companion that walks, jumps, and keeps you company while you browse.

Powered by PostHog's official [`@posthog/hedgehog-mode`](https://github.com/PostHog/hedgehog-mode) engine, with pixi.js rendering and matter-js physics.

![Demo](demo.gif)

## ✨ Features

- 🚶 Animated hedgehog with multiple animations (walk, jump, wave, and more)
- 🎯 Physics-based movement with gravity and bouncing
- 🧱 Lands on and walks across page elements (buttons, inputs, navbars)
- 🖱️ Drag and throw with your mouse
- ⌨️ Keyboard controls (WASD / arrow keys)
- 🎭 5 skins: Default, Spiderhog, Robohog, Hogzilla, Ghost
- 🎨 10 color variations
- 👒 16 accessories across headwear, eyewear, and other categories
- 🥚 Secret codes and easter eggs

## 🛠️ Build

This extension lives in the [`hedgehog-mode`](https://github.com/PostHog/hedgehog-mode) monorepo and bundles the local [`@posthog/hedgehog-mode`](https://github.com/PostHog/hedgehog-mode) engine (wired up as `workspace:*`), so the two are built and tested together. Build from the repo root:

```bash
pnpm install
pnpm build       # builds the engine, the playground, then this extension
```

Or build just the extension — the engine's `dist/` has to exist first, which `pnpm build` or `pnpm dev` at the root produces:

```bash
pnpm --dir hedgehog-mode-anywhere build
```

This produces `dist/content.js`, `dist/popup.js`, and copies the hedgehog spritesheet into `assets/`. Use `pnpm --dir hedgehog-mode-anywhere watch` to rebuild on change while developing.

> The bundled `@posthog/hedgehog-mode` must keep pixi.js externalized ([PostHog/hedgehog-mode#30](https://github.com/PostHog/hedgehog-mode/pull/30)). Builds that inline pixi.js use a `new Function` shader path that MV3 content scripts forbid and that the extension can't patch. With pixi external, `src/content.jsx` patches the single shared pixi.js for eval-free shaders and main-thread texture loading, so the hedgehog runs on any page even under a strict Content-Security-Policy.

## 🧪 Developing & testing locally

There are two ways in, depending on what you're changing.

### The customization UI, without a browser extension

The popup renders the engine's own `HedgehogCustomization` component — the same one the playground's `/config` page uses — so the playground is the fastest way to iterate on it:

```bash
pnpm dev         # engine watcher + playground on http://localhost:8002
```

- **http://localhost:8002/config** — the customization panel (skins, colors, accessories, friends, options).
- **http://localhost:8002/** — the live hedgehog, for physics and click/drag.

Leave `pnpm dev` running while you work on the extension too: it keeps the engine's `dist/` fresh, which the extension bundles.

### The extension itself

Rebuild on change alongside a running `pnpm dev`, then reload the unpacked extension:

```bash
pnpm --dir hedgehog-mode-anywhere watch
```

Load it via [Installation](#-installation) below. After each rebuild, click the **reload** ↻ on the extension's card in `chrome://extensions`, then refresh the page you're testing (the content script injects at `document_end`, and only on `http(s)` pages — not `chrome://` or the web store).

What to poke at:

- **Platform inset** — enable the hedgehog on a site with a sticky header/nav bar; he should stay off the top strip of the window instead of perching there out of sight. Press **`ctrl+d` five times** on the page to toggle the matter.js debug renderer and see the platform bodies (none are created in the top 100px).
- **Persistence & sync** — customize the hedgehog, then navigate to a _different_ domain: the look survives. Open a second window and change something; the other updates within a second. Settings live in `chrome.storage.sync` (shared across tabs, windows, sessions, and signed-in browsers), not the page's `localStorage`.
- **Popup + in-page parity** — the popup and the in-page "Customize me!" panel are the same component, so a change in one shows up in the other. Add a friend from the popup and it appears (and persists) without a reload.

Reset all state from the extension's service-worker console (`chrome://extensions` → the extension → **service worker**):

```js
chrome.storage.sync.clear();
```

## 📦 Installation

### Chrome / Brave / Edge (Chromium browsers)

1. Clone the monorepo and run the build step above
2. Open your browser and navigate to `chrome://extensions/` (or `brave://extensions/`, `edge://extensions/`)
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked"
5. Select the `hedgehog-mode-anywhere/` folder
6. The hedgehog icon should appear in your browser toolbar

## 🚀 Usage

1. Click the hedgehog icon in your toolbar to open the settings popup
2. Toggle "Enabled hedgehog mode" to add a hedgehog to the current page
3. Customize your hedgehog with different skins, colors, and accessories

### 🎮 Controls

| Input                | Action                                         |
| -------------------- | ---------------------------------------------- |
| Arrow keys / WASD    | Move left/right                                |
| Space / W / Up       | Jump (hold for height)                         |
| Down / S             | Drop through platforms                         |
| Shift + direction    | Run 🏃                                         |
| Alt + direction      | Moonwalk 🕺                                    |
| Hold F               | 🔥 Breathe fire                                |
| Click (as Spiderhog) | 🕸️ Sling a web — hold and press W / S to climb |
| Click and drag       | Pick up and throw                              |

### 🤫 Secret Codes

Type these while on a page with the hedgehog:

| Code                              | Effect                       |
| --------------------------------- | ---------------------------- |
| `fff` or `fire`                   | 🔥 Sets the hedgehog on fire |
| `spiderhog` / `robohog` / `ghost` | 🕷️🤖👻 Change skin           |
| `rainbow`                         | 🌈 Rainbow color             |
| `spawn` or `hedgehog`             | 🦔 Spawn a friend            |
| `chaos`                           | 🦔🦔🦔 Spawn ten friends     |
| `hello`                           | 👋 Wave                      |
| `giant` / `tiny`                  | Resize the hedgehog          |
| `slow` / `fast`                   | Change game speed            |
| `cheatcodes`                      | 📜 Show the full cheat sheet |
| `death`                           | ☠️ Clear all hedgehogs       |
| ↑↑↓↓←→←→BA                        | 🚀 Konami code               |

## ⚙️ Options

- **Walk around freely** - Let the hedgehog roam on its own
- **Interact with elements** - Land on buttons, inputs, and other page elements
- **Keyboard controls** - Enable WASD / arrow key movement

## Credits

Built with ❤️ by [PostHog](https://posthog.com), powered by the [`@posthog/hedgehog-mode`](https://github.com/PostHog/hedgehog-mode) engine that drives the hedgehog in the PostHog app.
