import { AvailableSpriteFrames } from "../../sprites/sprites";
import { HedgeHogMode } from "../../hedgehog-mode";
import { GameSprite } from "./GameSprite";

export function GameOptions({
  game,
  startAction,
  resumeAction,
  outfitsAction,
  shareAction,
}: {
  game: HedgeHogMode;
  startAction: () => void;
  resumeAction: () => void;
  outfitsAction: () => void;
  shareAction: () => void;
}) {
  const options: {
    spriteName: AvailableSpriteFrames;
    clickedSpriteName?: AvailableSpriteFrames;
    scale: number;
    action: () => void;
  }[] = [
    {
      spriteName: "ui/ui-start.png",
      clickedSpriteName: "ui/ui-start-pressed.png",
      scale: 0.25,
      action: startAction,
    },
    {
      spriteName: "ui/ui-start.png",
      scale: 0.25,
      action: outfitsAction,
    },
    {
      spriteName: "ui/ui-share-lg.png",
      scale: 0.25,
      action: shareAction,
    },
  ];
  return (
    <div className="GameConsole-ControlPanel-options">
      {options.map((option) => (
        <div
          className="GameConsole-ControlPanel-option"
          onClick={option.action}
        >
          <GameSprite
            game={game}
            spriteName={option.spriteName}
            scale={option.scale}
          />
        </div>
      ))}
    </div>
  );
}
