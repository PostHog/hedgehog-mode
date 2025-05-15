import React from "react";
import { HedgeHogMode } from "../../hedgehog-mode";
import { PizzaHealthIndicator } from "./PizzaHealthIndicator";

interface GameHealthAndPointsProps {
  game: HedgeHogMode;
  health: number;
  points: number;
}

const calculateDamage = (health: number) => {
  const totalDamage = 100 - health;
  const damage = Math.floor(totalDamage / 10) - 1;
  return damage;
};

export function GameHealthAndPoints({
  game,
  health,
  points,
}: GameHealthAndPointsProps) {
  return (
    <div className="GameConsole-ControlPanel-status flex flex-row gap-4 justify-between items-center">
      <PizzaHealthIndicator game={game} damage={calculateDamage(health)} />
      <div className="GameConsole-ControlPanel-status-points flex flex-row gap-2 items-center">
        <div className="GameConsole-ControlPanel-status-count">{points}</div>
        <div className="GameConsole-ControlPanel-status-pineapple"></div>
      </div>
    </div>
  );
}
