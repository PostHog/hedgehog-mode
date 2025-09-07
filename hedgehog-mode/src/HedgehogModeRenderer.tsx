import { useEffect, useState } from "react";
import { HedgeHogMode, HedgehogModeConfig } from "./hedgehog-mode";
import { HedgehogModeUI } from "./ui/GameUI";
import root from "react-shadow";
import { styles } from "./ui/styles";
import { useTheme } from "./ui/hooks/useTheme";

export function HedgehogModeRendererContent({
  id,
  theme,
  style,
  children,
}: {
  id: string;
  theme?: "light" | "dark";
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const osTheme = useTheme();

  return (
    <root.div id={id} data-theme={theme ?? osTheme} style={style}>
      <style>{styles}</style>
      {children}
    </root.div>
  );
}

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
    setGame(hedgeHogMode);
    await hedgeHogMode.render(container);
    onGameReady?.(hedgeHogMode);
  };

  const osTheme = useTheme();

  useEffect(() => {
    return () => game?.destroy();
  }, [game]);

  return (
    <root.div
      id="hedgehog-mode-root"
      data-theme={theme ?? osTheme}
      style={style}
    >
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
