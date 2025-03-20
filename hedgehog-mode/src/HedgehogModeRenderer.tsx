import { useState } from "react";
import { HedgeHogMode, HedgehogModeConfig } from "./hedgehog-mode";
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

  const setupHedgehogMode = async (container: HTMLDivElement) => {
    const hedgeHogMode = new HedgeHogMode(config);
    await hedgeHogMode.render(container);
    setGame(hedgeHogMode);
    onGameReady?.(hedgeHogMode);
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
