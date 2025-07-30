import { useEffect, useState } from "react";
import { HedgeHogMode } from "../../hedgehog-mode";
import { HedgehogActor } from "../../actors/Hedgehog";
import { Weapons } from "./Weapon";
import { GameControls } from "./GameControls";
import { GameLogo } from "./GameLogo";
import { GameOptions } from "./GameOptions";
import { GameHealthAndPoints } from "./GameHealthAndPoints";

interface GameConsoleProps {
  game: HedgeHogMode;
  visible: boolean;
  onClose: () => void;
}

type GameState = "new" | "playing" | "paused" | "game-over";

export function GameConsole({ game, visible, onClose }: GameConsoleProps) {
  const player = game.getPlayer();
  const world = game.world;

  const playerHealth = player?.health;
  const kills = world?.kills;

  const [gameState, setGameState] = useState<GameState>("new");

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
      <div className="GameConsole-overlay" />
      <div className="GameConsole-content items-center pixel-corners">
        <div className="GameConsole-body flex flex-col gap-8 items-center">
          <div
            className="flex flex-col gap-8 items-center"
            style={{ maxWidth: "800px", marginTop: "1rem" }}
          >
            <GameLogo size="large" />
            {gameState == "new" ? (
              <p
                className="text-center text-base"
                style={{ maxWidth: "700px" }}
              >
                Welcome to Hogwars, the game where killing hedgehogs is{" "}
                <span className="font-bold">
                  legal <span className="italic">and</span> fun
                </span>
                . Find weapons and kill your enemies. Lose pizza slices when you
                get hit. Run out of pizza and it's game over.
              </p>
            ) : (
              <>
                <GameHealthAndPoints
                  game={game}
                  health={playerHealth ?? 0}
                  points={kills}
                />
                <Weapons game={game} />
              </>
            )}
          </div>
          <div
            className="flex gap-8 items-center"
            style={{ maxWidth: "800px" }}
          >
            <div className="GameConsole-ControlPanel flex flex-col gap-8">
              <GameControls game={game} />
            </div>
            <div>
              <GameOptions
                game={game}
                startAction={() => {
                  world.load();
                  onClose();
                }}
                resumeAction={() => {
                  game.setSpeed(1);
                  onClose();
                }}
                outfitsAction={() => {}}
                shareAction={() => {}}
              />
            </div>
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
