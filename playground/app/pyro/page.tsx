"use client";
import { HedgehogModeRenderer } from "@posthog/hedgehog-mode";
import { useState } from "react";
import type { HedgeHogMode } from "@posthog/hedgehog-mode";

// A deterministic recording page for pyro mode: a fixed grid of burnable
// cards (the `.border` selector makes them platforms) and no random spawns,
// so a screen recording captures the same burn every run.
export default function PyroPage() {
  const [game, setGame] = useState<HedgeHogMode | null>(null);

  return (
    <div className="fixed inset-0 bg-white">
      <main className="absolute inset-0 overflow-auto p-16">
        <h1 className="border inline-block text-4xl font-bold mb-8 px-4 py-2">
          Pyro mode
        </h1>
        <div className="grid grid-cols-3 gap-6 max-w-3xl">
          {[
            "Deploy preview",
            "Feature flag",
            "Funnel step 3",
            "Pricing card",
            "Onboarding",
            "Changelog",
          ].map((label) => (
            <div
              key={label}
              className="border rounded-lg bg-orange-50 px-6 py-10 text-center font-medium text-gray-800 shadow-sm"
            >
              {label}
            </div>
          ))}
        </div>
        <p className="border mt-10 inline-block px-4 py-2 text-gray-500">
          hold F and watch this disappear too
        </p>
      </main>
      <HedgehogModeRenderer
        config={{
          assetsUrl: "/assets",
          platforms: {
            selector: ".border",
            viewportPadding: { top: 50 },
          },
        }}
        onGameReady={(g) => {
          setGame(g);
          (window as unknown as { __pyroGame?: HedgeHogMode }).__pyroGame = g;
        }}
      />
      <span className="hidden">{game ? "ready" : "loading"}</span>
    </div>
  );
}
