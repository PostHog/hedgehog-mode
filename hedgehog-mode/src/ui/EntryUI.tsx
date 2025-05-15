import { useEffect, useState } from "react";
import { DialogBox } from "./components/DialogBox";
import { EntryUIDialogBoxProps } from "../types";
import { HedgeHogMode } from "../hedgehog-mode";
import { GameConsole } from "./components/GameConsole";
import { GameOverUI } from "./components/GameOverUI";
import { GameHealthAndPoints } from "./components/GameHealthAndPoints";
import { GameLogo } from "./components/GameLogo";
import { GameSprite } from "./components/GameSprite";

export function HedgehogModeUI({ game }: { game: HedgeHogMode }) {
  /** force a repaint ~10×/sec so the numbers tick up in real-time */
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick(Date.now()), 500);
    return () => clearInterval(id);
  }, []);
  const [consoleVisible, setConsoleVisible] = useState(true);
  const [gameOverVisible, setGameOverVisible] = useState(false);

  const [dialogBox, setDialogBox] = useState<EntryUIDialogBoxProps | null>(
    null
  );
  const [dialogBoxVisible, setDialogBoxVisible] = useState<boolean>(false);
  // To game should control the UI largely so we add an event listener for game modal popups
  useEffect(() => {
    game.setUI({
      showDialogBox: (dialogBox) => {
        setDialogBoxVisible(true);
        setDialogBox(dialogBox);
      },
      clear: () => {
        setDialogBoxVisible(false);
        setDialogBox(null);
        setConsoleVisible(false);
      },
      showGameOver: () => {
        setDialogBoxVisible(false);
        setConsoleVisible(false);
        setGameOverVisible(true);
      },
      showStartScreen: () => {
        setDialogBoxVisible(false);
        setConsoleVisible(true);
        setGameOverVisible(false);
        game.setSpeed(0);
      },
    });
  }, [game]);

  const player = game.getPlayer();
  const world = game.world;

  const playerHealth = player?.health;
  const kills = world?.kills;

  return (
    <div className="EntryUI">
      {!consoleVisible && !gameOverVisible && (
        <>
          <div className="Scoreboard text-beige">
            <GameHealthAndPoints
              game={game}
              health={playerHealth}
              points={kills}
              size="small"
            />
          </div>
          <div className="BottomLogo text-beige flex gap-2">
            <GameLogo size="small" />
            <div className="flex flex-col gap-1 items-center">
              <GameSprite game={game} spriteName="ui/ui-alt.png" />
              <p className="text-sm" style={{ margin: 0, padding: 0 }}>
                pause
              </p>
            </div>
          </div>
        </>
      )}
      <DialogBox
        game={game}
        actor={dialogBox?.actor}
        position={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }}
        messages={dialogBox?.messages ?? []}
        visible={dialogBoxVisible}
        onClose={() => {
          setDialogBoxVisible(false);
          dialogBox?.onClose?.();
        }}
      ></DialogBox>
      <GameConsole
        game={game}
        visible={consoleVisible}
        onClose={() => setConsoleVisible(false)}
      />

      <GameOverUI
        game={game}
        visible={gameOverVisible}
        onClose={() => setGameOverVisible(false)}
      />
    </div>
  );
}
