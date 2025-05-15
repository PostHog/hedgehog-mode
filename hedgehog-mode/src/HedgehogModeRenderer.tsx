import { useState } from "react";
import { HedgeHogMode, HedgehogModeConfig } from "./hedgehog-mode";
import { HedgehogModeUI } from "./ui/EntryUI";
import root from "react-shadow";
import { styles } from "./ui/styles";
import { useTheme } from "./ui/hooks/useTheme";

export function HedgehogModeRenderer({
  onGameReady,
  config,
  theme,
  style,
}: {
  onGameReady: (game: HedgeHogMode) => void;
  config: HedgehogModeConfig;
  theme?: "light" | "dark";
  style?: React.CSSProperties;
}) {
  const [game, setGame] = useState<HedgeHogMode | null>(null);
  const setupHedgehogMode = async (container: HTMLDivElement) => {
    const hedgeHogMode = new HedgeHogMode(config);
    await hedgeHogMode.render(container);
    setGame(hedgeHogMode);
    onGameReady?.(hedgeHogMode);
  };

  const osTheme = useTheme();

  return (
    <root.div
      id="hedgehog-mode-root"
      data-theme={theme ?? osTheme}
      style={style}
    >
      <style>
        {`
        @import
        url('https://fonts.googleapis.com/css2?family=Doto:wght@500&display=swap');
        `}
      </style>
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
