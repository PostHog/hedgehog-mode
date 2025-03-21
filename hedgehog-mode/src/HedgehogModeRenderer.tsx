import { useEffect, useState } from "react";
import { HedgeHogMode, HedgehogModeConfig } from "./hedgehog-mode";
import { HedgehogModeUI } from "./ui/GameUI";
import root from "react-shadow";
import { styles } from "./ui/styles";

export function HedgehogModeRenderer({
  onGameReady,
  config,
  theme: _theme,
  style,
}: {
  onGameReady: (game: HedgeHogMode) => void;
  config: HedgehogModeConfig;
  theme?: "light" | "dark";
  style?: React.CSSProperties;
}) {
  const [game, setGame] = useState<HedgeHogMode | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const setupHedgehogMode = async (container: HTMLDivElement) => {
    const hedgeHogMode = new HedgeHogMode(config);
    await hedgeHogMode.render(container);
    setGame(hedgeHogMode);
    onGameReady?.(hedgeHogMode);
  };

  useEffect(() => {
    if (!_theme) {
      const _window = typeof window !== "undefined" ? window : null;
      setTheme(
        _window?.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
      );
    } else {
      setTheme(_theme);
    }
  }, [theme]);

  return (
    <root.div id="hedgehog-mode-root" data-theme={theme} style={style}>
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
