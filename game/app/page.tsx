"use client";
import { HedgehogModeRenderer } from "@posthog/hedgehog-mode";

export default function Home() {
  return (
    <div>
      <HedgehogModeRenderer
        config={{
          assetsUrl: "/assets",
        }}
        onGameReady={() => {}}
      />
    </div>
  );
}
