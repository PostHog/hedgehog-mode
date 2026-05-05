import { ComponentType, useEffect, useState } from "react";
import { HedgeHogMode, HedgehogModeConfig } from "./hedgehog-mode";
import { HedgehogModeUI } from "./ui/GameUI";
import { styles } from "./ui/styles";
import { useTheme } from "./ui/hooks/useTheme";

type ShadowDivProps = {
  id?: string;
  "data-theme"?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

let cachedShadowDiv: ComponentType<ShadowDivProps> | null = null;

function useShadowDiv(): ComponentType<ShadowDivProps> | null {
  const [Div, setDiv] = useState<ComponentType<ShadowDivProps> | null>(
    cachedShadowDiv
  );
  useEffect(() => {
    if (cachedShadowDiv) return;
    void import("react-shadow").then((m) => {
      cachedShadowDiv = m.default.div as ComponentType<ShadowDivProps>;
      setDiv(() => cachedShadowDiv);
    });
  }, []);
  return Div;
}

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
  const ShadowDiv = useShadowDiv();
  if (!ShadowDiv) return null;

  return (
    <ShadowDiv id={id} data-theme={theme ?? osTheme} style={style}>
      <style>{styles}</style>
      {children}
    </ShadowDiv>
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
  const ShadowDiv = useShadowDiv();

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

  if (!ShadowDiv) return null;

  return (
    <ShadowDiv
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
    </ShadowDiv>
  );
}
