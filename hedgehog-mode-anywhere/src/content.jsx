// Content script: drives the hedgehog-mode engine on the page.
// The popup owns customization and talks to us over chrome.runtime messages;
// global enable/disable + per-site state live in chrome.storage.sync.
//
// Two pixi.js behaviours break under MV3 / strict-CSP pages and are neutralised before any
// renderer is created:
//  1. pixi generates shaders with `new Function` — forbidden in MV3 content scripts. The
//     side-effect import below swaps in pixi's eval-free polyfills.
//  2. pixi's texture loader spawns a Web Worker from a blob: URL, which many sites' CSP
//     blocks. Loading textures on the main thread avoids it.
import "pixi.js/unsafe-eval";
import { loadTextures } from "pixi.js";
import { createRoot } from "react-dom/client";
import { HedgehogModeRenderer } from "@posthog/hedgehog-mode";

loadTextures.config.preferWorkers = false;

// Elements the hedgehog can stand on, synced into the physics world as platforms.
const PLATFORM_SELECTOR =
  'button, input, select, .btn, [role="button"], nav, header, footer, aside, .card, .modal, .dialog';

// Stored config keys map onto the library's HedgehogActorOptions.
const toActorOptions = (config = {}) => ({
  skin: config.skin || "default",
  color: config.color || null,
  accessories: config.accessories || [],
  ai_enabled: config.walking_enabled ?? true,
  interactions_enabled: config.interactions_enabled ?? true,
  controls_enabled: config.controls_enabled ?? true,
});

const fromActorOptions = (options) => ({
  skin: options.skin || "default",
  color: options.color || null,
  accessories: options.accessories || [],
  walking_enabled: options.ai_enabled ?? true,
  interactions_enabled: options.interactions_enabled ?? true,
  controls_enabled: options.controls_enabled ?? true,
});

let root = null;
let game = null;
let actor = null;

const startHedgehog = (config) => {
  if (root) return;

  const host = document.createElement("div");
  host.id = "hedgehog-mode-anywhere";
  document.body.appendChild(host);

  root = createRoot(host);
  root.render(
    <HedgehogModeRenderer
      config={{
        assetsUrl: chrome.runtime.getURL("assets"),
        platforms: { selector: PLATFORM_SELECTOR },
        // The engine spawns the player hedgehog itself from this state; we don't spawn one.
        state: { options: { id: "player", player: true, ...toActorOptions(config) } },
      }}
      onGameReady={(readyGame) => {
        game = readyGame;
        actor = game.getPlayableHedgehog();
      }}
    />
  );
};

const stopHedgehog = () => {
  if (!root) return;
  root.unmount(); // triggers game.destroy() via the renderer's cleanup effect
  root = null;
  game = null;
  actor = null;
};

const updateConfig = (config) => {
  if (!actor) return;
  actor.updateOptions(toActorOptions(config));
  // Reload the sprite so a skin change shows immediately, even when AI is off and
  // the engine wouldn't otherwise re-render the actor.
  try {
    actor.updateSprite(actor.currentSprite ?? "idle");
  } catch {
    actor.updateSprite("idle");
  }
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "UPDATE_CONFIG") {
    updateConfig(message.config);
    chrome.storage.sync.set({ hedgehogConfig: message.config });
    sendResponse({ success: true });
    return true;
  }

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
  if (changes.hedgehogConfig && actor) {
    updateConfig(changes.hedgehogConfig.newValue || {});
  }
  if (changes.hedgehogEnabled || changes.disabledSites) {
    reconcileState();
  }
});

reconcileState();
