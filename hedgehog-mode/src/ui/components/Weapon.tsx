import React from "react";
import { GameSprite } from "./GameSprite";
import { HedgeHogMode } from "../../hedgehog-mode";

interface WeaponProps {
  className?: string;
  icon?: string;
  game: HedgeHogMode;
}

export function Weapon({ className = "", game }: WeaponProps) {
  return (
    <div>
      <div
        className={`GameConsole-ControlPanel-weapons-weapon pixel-corners-gray-2 ${className}`}
      >
        <div className="GameConsole-ControlPanel-weapons-weapon-icon">
          <GameSprite game={game} spriteName="projectiles/missile/tile-0.png" />
        </div>
      </div>
    </div>
  );
}
