"use client";
import { HedgehogModeRenderer, HedgeHogMode } from "@posthog/hedgehog-mode";
import { useState } from "react";

export default function Home() {
  const [game, setGame] = useState<HedgeHogMode | null>(null);

  return (
    <div>
      <HedgehogModeRenderer
        config={{
          assetsUrl: "/assets",
        }}
        onGameReady={setGame}
      />
    </div>
  );
}
