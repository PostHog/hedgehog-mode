// The page under test. Deliberately tiny and React-free: it drives `HedgeHogMode` directly,
// so a failure here is pixi's or the engine's, not Next's or React's.
//
// Everything this file needs must survive `script-src 'self'` — see server.mjs.
import { HedgeHogMode } from "@posthog/hedgehog-mode";

declare global {
  interface Window {
    // Handles for the spec. The page owns the game; the spec only reads it.
    __game?: HedgeHogMode;
    __ready?: boolean;
    __bootError?: string;
  }
}

// The extension bundle disables pixi's blob-URL texture worker, because many sites' CSP
// blocks it. Mirror that only in the extension fixture so the plain build stays faithful to
// what a normal consumer gets.
if (process.env.HEDGEHOG_FIXTURE === "extension") {
  const { loadTextures } = await import("pixi.js");
  // pixi types `config` as optional, and the extension's own untyped .jsx assigns straight
  // through it. Fail loudly here rather than silently leaving workers on, which would make
  // the strict-CSP route hang instead of reporting anything useful.
  if (!loadTextures.config) {
    throw new Error(
      "pixi's loadTextures.config is missing; cannot disable the blob worker"
    );
  }
  loadTextures.config.preferWorkers = false;
}

async function main(): Promise<void> {
  const container = document.getElementById("app") as HTMLDivElement;
  const game = new HedgeHogMode({ assetsUrl: "/assets" });
  window.__game = game;
  await game.render(container);
  window.__ready = true;
}

main().catch((error: unknown) => {
  // Surface boot failures to the spec as data. Re-throwing as well keeps them visible as a
  // real page error, which the spec also asserts on.
  window.__bootError =
    error instanceof Error ? error.stack || error.message : String(error);
  throw error;
});
