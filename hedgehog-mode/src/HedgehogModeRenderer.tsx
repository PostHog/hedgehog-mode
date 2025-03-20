import { useState } from "react";
import { sample } from "lodash";
import { HedgeHogMode, HedgehogModeConfig } from "./hedgehog-mode";
import {
  getRandomAccesoryCombo,
  HedgehogActorColorOptions,
} from "./actors/hedgehog/config";
import { HedgehogModeUI } from "./ui/GameUI";
import root from "react-shadow";
import { styles } from "./ui/styles";

export function HedgehogModeRenderer({
  onGameReady,
  config,
}: {
  onGameReady: (game: HedgeHogMode) => void;
  config: HedgehogModeConfig;
}) {
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

  const setupHedgehogMode = async (container: HTMLDivElement) => {
    const hedgeHogMode = new HedgeHogMode(config);
    await hedgeHogMode.render(container);
    setGame(hedgeHogMode);
    onGameReady?.(hedgeHogMode);
    hedgeHogMode.spawnHedgehog({
      id: "hedgehog-1",
      controls_enabled: true,
      player: true,
      color: sample(HedgehogActorColorOptions),
      accessories: getRandomAccesoryCombo(),
    });

    spawnHedgehog(20, hedgeHogMode);
  };

  return (
    <root.div>
      <style>{styles}</style>
      <div
        className="GameContainer"
        ref={(el) => {
          if (el && !game) {
            setupHedgehogMode(el);
          }
        }}
      />
      {game && <HedgehogModeUI game={game} />}
    </root.div>
  );
}
