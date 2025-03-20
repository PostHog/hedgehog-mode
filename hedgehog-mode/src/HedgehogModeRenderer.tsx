import { useEffect, useState } from "react";
import { sample } from "lodash";
import { HedgeHogMode } from "./hedgehog-mode";
import {
  getRandomAccesoryCombo,
  HedgehogActorColorOptions,
} from "./actors/hedgehog/config";
import { HedgehogModeUI } from "./ui/GameUI";

export function HedgehogModeRenderer() {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [game, setGame] = useState<HedgeHogMode | null>(null);

  const spawnHedgehog = async (count: number, hedgehogMode = game) => {
    for (let i = 0; i < count; i++) {
      hedgehogMode?.spawnHedgehog({
        id: `hedgehog-${i}`,
        controls_enabled: false,
        accessories: getRandomAccesoryCombo(),
        color: sample(HedgehogActorColorOptions),
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  };

  const setupHedgehogMode = async () => {
    if (ref) {
      const hedgeHogMode = new HedgeHogMode({
        assetsUrl: "/assets",
        platformSelector: ".border",
      });
      await hedgeHogMode.render(ref);
      setGame(hedgeHogMode);

      hedgeHogMode.spawnHedgehog({
        id: "hedgehog-1",
        controls_enabled: true,
        player: true,
        color: sample(HedgehogActorColorOptions),
        accessories: getRandomAccesoryCombo(),
      });

      spawnHedgehog(20, hedgeHogMode);
    }
  };

  useEffect(() => {
    setupHedgehogMode();
  }, [ref]);

  return (
    <>
      <div></div>
      <div className="fixed inset-0 z-20" ref={(r) => setRef(r)}></div>
      {/* UI */}
      {game && <HedgehogModeUI game={game} />}
    </>
  );
}
