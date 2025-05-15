import React, { useEffect, useState } from "react";
import { GameSprite } from "./GameSprite";
import { HedgeHogMode } from "../../hedgehog-mode";
import { AvailableSpriteFrames } from "../../sprites/sprites";

interface WeaponProps {
  className?: string;
  icon?: string;
  game: HedgeHogMode;
  spriteName: AvailableSpriteFrames;
  name: string;
  description: string;
  translateX: number;
  translateY: number;
  isSelected: boolean;
  onSelect: () => void;
}

export function Weapon({
  className = "",
  game,
  spriteName,
  name,
  description,
  translateX,
  translateY,
  isSelected,
  onSelect,
}: WeaponProps) {
  return (
    <div>
      <button
        className={`GameConsole-ControlPanel-weapons-weapon pixel-corners-gray-2 ${className} ${isSelected ? "pixel-corners-red bg-red-light" : ""}`}
        onClick={onSelect}
      >
        <div className="GameConsole-ControlPanel-weapons-weapon-icon">
          <GameSprite
            game={game}
            spriteName={spriteName}
            translateX={translateX}
            translateY={translateY}
          />
        </div>
      </button>
    </div>
  );
}

type WeaponsDetails = {
  spriteName: AvailableSpriteFrames;
  name: string;
  description: string;
  translateX: number;
  translateY: number;
};

export function Weapons({ game }: { game: HedgeHogMode }) {
  const weapons: WeaponsDetails[] = [
    {
      spriteName: "inventory/bazooka-tile001.png",
      name: "Bazooka",
      description: "Bazooka",
      translateX: -25,
      translateY: -30,
    },
    {
      spriteName: "inventory/gun-tile001.png",
      name: "Gun",
      description: "Gun",
      translateX: -23,
      translateY: -25,
    },
    {
      spriteName: "inventory/grenade-tile001.png",
      name: "Grenade",
      description: "Grenade",
      translateX: -7,
      translateY: -10,
    },
  ];
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponsDetails | null>(
    weapons[0]
  );

  return (
    <div className="GameConsole-ControlPanel-weapons flex flex-row gap-2 justify-center wrap">
      {weapons.map((weapon) => (
        <Weapon
          game={game}
          spriteName={weapon.spriteName}
          name={weapon.name}
          description={weapon.description}
          translateX={weapon.translateX}
          translateY={weapon.translateY}
          isSelected={selectedWeapon?.spriteName === weapon.spriteName}
          onSelect={() => setSelectedWeapon(weapon)}
        />
      ))}
    </div>
  );
}
