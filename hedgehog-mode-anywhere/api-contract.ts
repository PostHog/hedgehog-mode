// Type-level lock on the slice of @posthog/hedgehog-mode that src/content.jsx and
// src/popup.jsx depend on. The extension source is untyped JSX, and esbuild bundles
// without type-checking, so a `workspace:*` engine bump that renamed, removed, or
// reshaped one of these would otherwise ship a green build and break only in the
// browser. `pnpm typecheck` fails here instead. Keep it in sync with actual usage.

import type { ComponentProps } from "react";
import {
  HedgehogModeRenderer,
  StaticHedgehog,
  HedgehogActorSkinOptions,
  HedgehogActorColorOptions,
  HedgehogActorAccessories,
} from "@posthog/hedgehog-mode";

// content.jsx: <HedgehogModeRenderer config={...} onGameReady={...} />
type RendererProps = ComponentProps<typeof HedgehogModeRenderer>;
const _config: RendererProps["config"] = {
  assetsUrl: "",
  platforms: { selector: "" },
  state: { options: { id: "player", player: true } },
};
const _onReady: NonNullable<RendererProps["onGameReady"]> = (game) => {
  // content.jsx drives the actor returned here; pin the members it calls.
  const actor = game.getPlayableHedgehog();
  if (!actor) return;
  actor.updateOptions(actor.options);
  actor.updateSprite(actor.currentSprite ?? "idle");
  actor.setOnFire();
};

// popup.jsx: <StaticHedgehog options={...} assetsUrl={...} size="100%" /> and the option lists.
type StaticProps = ComponentProps<typeof StaticHedgehog>;
const _static: Pick<StaticProps, "options" | "assetsUrl" | "size"> = {
  options: { id: "preview" },
  assetsUrl: "",
  size: "100%",
};
HedgehogActorSkinOptions.map((skin) => skin);
HedgehogActorColorOptions.map((color) => color);
Object.values(HedgehogActorAccessories).map((accessory) => accessory.group);

void _config;
void _onReady;
void _static;
