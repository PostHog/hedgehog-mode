import { useEffect } from "react";
import { HedgeHogMode } from "../../hedgehog-mode";
import { HedgehogActor } from "../../actors/Hedgehog";

interface GameConsoleProps {
  game: HedgeHogMode;
  visible: boolean;
  onClose: () => void;
}

export function GameConsole({ game, visible, onClose }: GameConsoleProps) {
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
    <div className="GameConsole">
      <div className="GameConsole-overlay" onClick={onClose} />
      <div className="GameConsole-content">
        <div className="GameConsole-header">
          <h1>Game Console</h1>
          <button className="Button" onClick={onClose}>
            X
          </button>
        </div>
        <div className="GameConsole-body">
          {/* Add game console content here */}
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
