// Type-level lock on the slice of @posthog/hedgehog-mode that src/content.jsx and
// src/popup.jsx depend on. The extension source is untyped JSX, and esbuild bundles
// without type-checking, so a `workspace:*` engine bump that renamed, removed, or
// reshaped one of these would otherwise ship a green build and break only in the
// browser. `pnpm typecheck` fails here instead. Keep it in sync with actual usage.

import type { ComponentProps } from "react";
import {
  HedgehogModeRenderer,
  HedgehogModeRendererContent,
  HedgehogCustomization,
} from "@posthog/hedgehog-mode";

// content.jsx: <HedgehogModeRenderer config={...} onGameReady={...} />
type RendererProps = ComponentProps<typeof HedgehogModeRenderer>;
const _config: RendererProps["config"] = {
  assetsUrl: "",
  platforms: { selector: "", viewportPadding: { top: 100 } },
  state: { options: { id: "player", player: true } },
  onStateChange: (state) => void state.options,
};
const _onReady: NonNullable<RendererProps["onGameReady"]> = (game) => {
  // content.jsx drives the game returned here; pin the members it calls.
  game.stateManager?.setHedgehog({ id: "player", player: true });
  const actor = game.getPlayableHedgehog();
  if (!actor) return;
  actor.updateSprite(actor.currentSprite ?? "idle");
  actor.setOnFire();
  void actor.options;
};

// popup.jsx renders the library's own customization UI inside HedgehogModeRendererContent
// (for the engine's shadow-root styles) instead of a hand-rolled grid.
type CustomizationProps = ComponentProps<typeof HedgehogCustomization>;
const _customization: Pick<
  CustomizationProps,
  "config" | "setConfig" | "assetsUrl"
> = {
  config: { id: "player", player: true },
  setConfig: (config) => void config,
  assetsUrl: "",
};
type ContentProps = ComponentProps<typeof HedgehogModeRendererContent>;
const _content: Pick<ContentProps, "id" | "theme"> = {
  id: "hedgehog-customization",
  theme: "dark",
};

void _config;
void _onReady;
void _customization;
void _content;
