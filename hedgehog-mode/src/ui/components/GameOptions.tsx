import { AvailableSpriteFrames } from "../../sprites/sprites";
import { HedgeHogMode } from "../../hedgehog-mode";
import { GameSprite } from "./GameSprite";

export function GameOptions({ game }: { game: HedgeHogMode }) {
  const options: {
    label: string;
    spriteName: AvailableSpriteFrames;
  }[] = [
    {
      label: "Play/Pause",
      spriteName: "ui/ui-play.png",
    },
  ];
  return (
    <div className="GameConsole-ControlPanel-options">
      {options.map((option) => (
        <div className="GameConsole-ControlPanel-option">
          <GameSprite game={game} spriteName={option.spriteName} />
          <p>{option.label}</p>
        </div>
      ))}
    </div>
  );
}
