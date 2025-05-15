import React from "react";
import { AvailableSpriteFrames } from "../../sprites/sprites";
import { GameSprite } from "./GameSprite";
import { HedgeHogMode } from "../../hedgehog-mode";

export type GameControlOptionDetails = {
  sprites: AvailableSpriteFrames[];
  label: string;
  multiType?: "or" | "and";
  type: "movement" | "modifier";
};

export type GameControlOption = GameControlOptionDetails & {
  game: HedgeHogMode;
};

export function GameControlOption({
  sprites,
  label,
  multiType,
  game,
}: GameControlOption) {
  const numSprites = sprites.length;
  return (
    <div className="GameConsole-ControlPanel-control-option flex flex-row gap-2">
      <div className="GameConsole-ControlPanel-control-option-icon flex flex-row gap-1">
        {sprites.map((sprite, i) => (
          <>
            <GameSprite game={game} key={sprite} spriteName={sprite} />
            {i < numSprites - 1 && multiType == "or" ? "/" : ""}
          </>
        ))}
      </div>
      <div className="GameConsole-ControlPanel-control-option-label">
        {" - "}
        {label}
      </div>
    </div>
  );
}

export function GameControls({ game }: { game: HedgeHogMode }) {
  const gameControls: GameControlOptionDetails[] = [
    {
      sprites: ["ui/ui-left.png", "ui/ui-d.png"],
      label: "Move left",
      multiType: "or",
      type: "movement",
    },
    {
      sprites: ["ui/ui-right.png", "ui/ui-d.png"],
      label: "Move right",
      multiType: "or",
      type: "movement",
    },
    {
      sprites: ["ui/ui-up.png", "ui/ui-d.png"],
      label: "Jump",
      multiType: "or",
      type: "movement",
    },
    {
      sprites: ["ui/ui-down.png", "ui/ui-d.png"],
      label: "Fall",
      multiType: "or",
      type: "movement",
    },
  ];

  return (
    <div className="GameConsole-ControlPanel-controls flex flex-col gap-1">
      <p className="font-bold">Movement</p>
      {gameControls
        .filter((control) => control.type == "movement")
        .map((control) => (
          <GameControlOption key={control.label} {...control} game={game} />
        ))}
      <p className="font-bold">Modifiers</p>
      {gameControls
        .filter((control) => control.type == "modifier")
        .map((control) => (
          <GameControlOption key={control.label} {...control} game={game} />
        ))}
    </div>
  );
}
