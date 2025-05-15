import React from "react";
import { GameSprite } from "./GameSprite";
import { HedgeHogMode } from "../../hedgehog-mode";
import { AvailableSpriteFrames } from "../../sprites/sprites";

interface PizzaHealthIndicatorProps {
  game: HedgeHogMode;
  damage: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  className?: string;
  size: "small" | "large";
}

const getPizzaSpriteName = (damage: number): AvailableSpriteFrames => {
  const baseSprite = "ui/pizza/pizza-";
  return `${baseSprite}${damage}.png` as AvailableSpriteFrames;
};

export function PizzaHealthIndicator({
  game,
  damage,
  className = "",
  size = "small",
}: PizzaHealthIndicatorProps) {
  // Ensure health is between 0 and 7
  const clampedDamage = Math.max(0, Math.min(8, damage));

  // Get the appropriate sprite name based on health
  const spriteName = getPizzaSpriteName(clampedDamage);

  return (
    <div className={`pizza-damage-indicator ${className}`}>
      <GameSprite
        game={game}
        spriteName={spriteName}
        translateX={0}
        translateY={0}
        scale={size === "large" ? 1.5 : 1}
      />
    </div>
  );
}
