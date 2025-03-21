import { useState } from "react";
import { HedgeHogMode, HedgehogModeConfig } from "./hedgehog-mode";
import { HedgehogModeUI } from "./ui/GameUI";
import root from "react-shadow";
import { styles } from "./ui/styles";

export function HedgehogModeRenderer({
  onGameReady,
  config,
  theme,
}: {
  onGameReady: (game: HedgeHogMode) => void;
  config: HedgehogModeConfig;
  theme?: "light" | "dark";
}) {
  const [game, setGame] = useState<HedgeHogMode | null>(null);

  const setupHedgehogMode = async (container: HTMLDivElement) => {
    const hedgeHogMode = new HedgeHogMode(config);
    await hedgeHogMode.render(container);
    setGame(hedgeHogMode);
    onGameReady?.(hedgeHogMode);
  };

  const _window = typeof window !== "undefined" ? window : null;

  if (!theme) {
    theme = _window?.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return (
    <root.div data-theme={theme}>
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
