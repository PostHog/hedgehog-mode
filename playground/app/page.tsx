"use client";
import {
  HedgehogActorColorOptions,
  getRandomAccesoryCombo,
  HedgehogModeRenderer,
  HedgeHogMode,
} from "@posthog/hedgehog-mode";
import { Logo } from "../components/logo";
import { sample } from "lodash";
import { Button } from "../components/Button";
import { useState } from "react";

export default function Home() {
  const [game, setGame] = useState<HedgeHogMode | null>(null);
  const spawnHedgehog = async (count: number) => {
    for (let i = 0; i < count; i++) {
      game?.spawnHedgehog({
        id: `hedgehog-${i}`,
        controls_enabled: false,
        accessories: getRandomAccesoryCombo(),
        color: sample(HedgehogActorColorOptions),
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  };

  return (
    <div>
      <main className="fixed inset-0 flex flex-col overflow-hidden">
        <div className="relative flex-1 overflow-y-auto">
          <div className="relative flex flex-col w-full h-full">
            <Logo />
          </div>
          <div className="relative flex flex-col w-full h-full">
            <Logo />
          </div>
          <div className="relative flex flex-col w-full h-full">
            <Logo />
          </div>
        </div>

        <div className="absolute bottom-0 z-10 flex flex-row gap-2 p-12">
          <Button onClick={() => spawnHedgehog(1)}>Spawn hedgehog</Button>
          <Button onClick={() => spawnHedgehog(100)}>
            Spawn 100 hedgehogs
          </Button>

          <Button onClick={() => game?.destroy()}>Stop game</Button>
        </div>
      </main>
      <HedgehogModeRenderer onGameReady={setGame} />
    </div>
  );
}
