import { useEffect, useState } from "react";
import { HedgeHogMode } from "../../hedgehog-mode";

interface GameOverUIProps {
  game: HedgeHogMode;
  visible: boolean;
  onClose: () => void;
}

export function GameOverUI({ game, visible, onClose }: GameOverUIProps) {
  const [state, setState] = useState<"init" | "showing" | "exiting">("init");

  useEffect(() => {
    if (!visible) {
      setState("init");
    } else {
      setTimeout(() => {
        setState("showing");

        setTimeout(() => {
          setState("exiting");

          setTimeout(() => {
            onClose();
            game.world.reset();
          }, 1000);
        }, 5000);
      }, 5000);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`GameOverUI ${state === "showing" ? "GameOverUI--showing" : state === "exiting" ? "GameOverUI--exiting" : ""}`}
    >
      <img
        className="GameOverUI-image"
        src={`/assets/game-over.png`}
        alt="Game over"
      />
    </div>
  );
}
