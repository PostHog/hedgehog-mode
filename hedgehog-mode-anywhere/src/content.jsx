// Content script: drives the hedgehog-mode engine on the page.
// All config — customization, global enable/disable, per-site state — lives in
// chrome.storage.sync; the popup writes it and every tab reacts via storage events.
//
// Two pixi.js behaviours break under MV3 / strict-CSP pages and are neutralised before any
// renderer is created:
//  1. pixi generates shaders with `new Function` — forbidden in MV3 content scripts. The
//     side-effect import below swaps in pixi's eval-free polyfills.
//  2. pixi's texture loader spawns a Web Worker from a blob: URL, which many sites' CSP
//     blocks. Loading textures on the main thread avoids it.
import "./browser-globals";
import "pixi.js/unsafe-eval";
import { loadTextures } from "pixi.js";
import { createRoot } from "react-dom/client";
import { HedgehogModeRenderer } from "@posthog/hedgehog-mode";
import { toActorOptions, fromActorOptions } from "./hedgehog-config";

loadTextures.config.preferWorkers = false;

// Elements the hedgehog can stand on, synced into the physics world as platforms.
const PLATFORM_SELECTOR =
  'button, input, select, .btn, [role="button"], nav, header, footer, aside, .card, .modal, .dialog';

// Ignore elements in the top strip of the viewport when discovering platforms. Sticky
// headers and nav bars sit at y≈0, and a hedgehog perched on one ends up jammed against
// the top edge of the window where he's clipped and effectively invisible. Keep his world
// starting a bit below the fold. (See HedgehogModeConfig.platforms.viewportPadding.)
const PLATFORM_TOP_INSET = 100;

// The engine persists its state through chrome.storage.sync (below) instead of writing to
// the host page's localStorage. localStorage in a content script belongs to whatever site
// you're on: it's per-origin (your hedgehog would reset on every different domain), it
// litters every page with our key, and it can't sync across windows, sessions or devices.
// chrome.storage.sync is shared by every tab and window, survives restarts, and roams across
// the user's signed-in browsers. We store the same flattened `hedgehogConfig` the popup uses,
// so in-page customization and the popup stay in lockstep.
let lastConfigJson = null;

const persistConfig = (config) => {
  const json = JSON.stringify(config);
  // Skip no-op writes (e.g. the engine re-persisting the state we just seeded it with) so we
  // don't burn chrome.storage.sync's write quota or fire redundant storage events.
  if (json === lastConfigJson) return;
  lastConfigJson = json;
  chrome.storage.sync.set({ hedgehogConfig: config });
};

let root = null;
let host = null;
let game = null;
let actor = null;
// The freshest config seen before the engine finished starting up. A cross-tab edit can land
// after render() but before onGameReady (and before GameStateManager exists); we buffer it here
// instead of dropping it, and flush it once the engine is ready. See updateConfig / onGameReady.
let pendingConfig = null;

const startHedgehog = (config) => {
  if (root) return;

  // Baseline for persistConfig's dedupe: normalise the seed the same way the engine will
  // hand it back via onStateChange, so its initial persist-on-spawn is a genuine no-op.
  lastConfigJson = JSON.stringify(fromActorOptions(toActorOptions(config)));

  host = document.createElement("div");
  host.id = "hedgehog-mode-anywhere";
  // The overlay's z-index lives inside its shadow root, so it only orders within itself;
  // give the host a max-z-index stacking context so it sits above the page's modals and headers.
  host.style.position = "relative";
  host.style.zIndex = "2147483647";
  document.body.appendChild(host);

  root = createRoot(host);
  root.render(
    <HedgehogModeRenderer
      config={{
        assetsUrl: chrome.runtime.getURL("assets"),
        platforms: {
          selector: PLATFORM_SELECTOR,
          viewportPadding: { top: PLATFORM_TOP_INSET },
        },
        // The engine spawns the player hedgehog itself from this state; we don't spawn one.
        state: {
          options: { id: "player", player: true, ...toActorOptions(config) },
        },
        // Persist state changes (incl. in-page customization) to chrome.storage instead of
        // the page's localStorage, so they survive navigation and sync across windows.
        onStateChange: (state) => {
          // If a newer config arrived during startup, the engine is seeding from a now-stale
          // `state` prop — skip persisting it so we don't clobber the pending edit. The flush
          // in onGameReady applies (and persists) the newer config instead.
          if (pendingConfig !== null) return;
          persistConfig(fromActorOptions(state.options));
        },
      }}
      onGameReady={(readyGame) => {
        game = readyGame;
        actor = game.getPlayableHedgehog();
        // Apply any config that landed while the engine was still starting up.
        if (pendingConfig !== null) {
          const config = pendingConfig;
          pendingConfig = null;
          updateConfig(config);
        }
      }}
    />
  );
};

const stopHedgehog = () => {
  if (!root) return;
  const mountedRoot = root;
  const mountedHost = host;
  root = null;
  host = null;
  game = null;
  actor = null;
  try {
    mountedRoot.unmount(); // triggers game.destroy() via the renderer's cleanup effect
  } finally {
    mountedHost?.remove();
  }
};

const updateConfig = (config) => {
  // Route through the state manager (not actor.updateOptions) so friend hedgehogs get
  // spawned/removed too — not just the player's own skin/colour/accessories.
  if (!game?.stateManager) {
    // Engine isn't ready yet — remember the latest config and apply it in onGameReady.
    pendingConfig = config;
    return;
  }
  game.stateManager.setHedgehog({
    id: "player",
    player: true,
    ...toActorOptions(config),
  });
  // Reload the sprite so a skin change shows immediately, even when AI is off and the
  // engine wouldn't otherwise re-render the player.
  const player = game.getPlayableHedgehog();
  try {
    player?.updateSprite(player.currentSprite ?? "idle");
  } catch {
    player?.updateSprite("idle");
  }
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // Config changes flow through chrome.storage.sync now (see the popup + onChanged below),
  // so there's no UPDATE_CONFIG message — every tab reacts to the storage event instead.
  if (message.type === "GET_STATUS") {
    sendResponse({ config: actor ? fromActorOptions(actor.options) : null });
    return true;
  }

  if (message.type === "SET_ON_FIRE") {
    actor?.setOnFire();
    sendResponse({ success: true });
    return true;
  }
});

const reconcileState = () => {
  chrome.storage.sync.get(
    ["hedgehogEnabled", "hedgehogConfig", "disabledSites"],
    (result) => {
      const siteDisabled = (result.disabledSites || []).includes(
        window.location.hostname
      );
      const shouldRun = !!result.hedgehogEnabled && !siteDisabled;

      if (shouldRun && !root) {
        startHedgehog(result.hedgehogConfig || {});
      } else if (!shouldRun && root) {
        stopHedgehog();
      }
    }
  );
};

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  if (changes.hedgehogConfig) {
    const json = JSON.stringify(changes.hedgehogConfig.newValue ?? null);
    // Skip events that just echo the config we already hold: a local edit already updated the
    // engine, and its own storage write comes back here — re-running the full actor/friend
    // update and sprite refresh would be wasted work. Only genuine cross-tab changes differ.
    if (json !== lastConfigJson) {
      lastConfigJson = json;
      updateConfig(changes.hedgehogConfig.newValue || {});
    }
  }
  if (changes.hedgehogEnabled || changes.disabledSites) {
    reconcileState();
  }
});

reconcileState();
