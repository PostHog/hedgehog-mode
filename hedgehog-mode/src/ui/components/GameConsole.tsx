import { useEffect } from "react";
import { HedgeHogMode } from "../../hedgehog-mode";
import { HedgehogActor } from "../../actors/Hedgehog";
import { Weapon, Weapons } from "./Weapon";
import { PizzaHealthIndicator } from "./PizzaHealthIndicator";
import { GameControls } from "./GameControls";
import { GameLogo } from "./GameLogo";

interface GameConsoleProps {
  game: HedgeHogMode;
  visible: boolean;
  onClose: () => void;
}

export function GameConsole({ game, visible, onClose }: GameConsoleProps) {
  const player = game.getPlayer();

  // TODO: Loop to make sure we get updates - we can then use the player info the render the inventoruy

  useEffect(() => {
    if (visible) {
      // Hide all hedgehogs when game console is visible
      const hedgehogs = game.world.elements.filter(
        (el) => el instanceof HedgehogActor
      );
      hedgehogs.forEach((hedgehog) => {
        if (hedgehog.sprite) {
          hedgehog.sprite.visible = false;
        }
      });

      return () => {
        // Show hedgehogs again when game console is hidden
        hedgehogs.forEach((hedgehog) => {
          if (hedgehog.sprite) {
            hedgehog.sprite.visible = true;
          }
        });
      };
    }
  }, [visible, game]);

  if (!visible) return null;

  return (
    <div className="GameConsole text-game-dark">
      <div className="GameConsole-overlay" onClick={onClose} />
      <div className="GameConsole-content pixel-corners">
        <div className="GameConsole-body">
          <div className="GameConsole-GameView pixel-corners"></div>
          <div className="GameConsole-ControlPanel flex flex-col gap-8">
            <div className="GameConsole-ControlPanel-status flex flex-row gap-4 justify-between items-center">
              <PizzaHealthIndicator game={game} damage={1} />
              <div className="GameConsole-ControlPanel-status-points flex flex-row gap-2 items-center">
                <div className="GameConsole-ControlPanel-status-count">215</div>
                <div className="GameConsole-ControlPanel-status-pineapple"></div>
              </div>
            </div>
            <Weapons game={game} />
            <GameControls game={game} />
            <div className="GameConsole-ControlPanel-options"></div>
            <GameLogo />
          </div>
        </div>
      </div>
    </div>
  );
}

export function GameConsoleHeader() {
  return (
    <div className="GameConsoleHeader">
      <h1>Game Console</h1>
    </div>
  );
}
