import { useEffect, useState } from "react";
import { DialogBox } from "./components/DialogBox";
import { EntryUIDialogBoxProps } from "../types";
import { HedgeHogMode } from "../hedgehog-mode";
import { GameConsole } from "./components/GameConsole";

export function HedgehogModeUI({ game }: { game: HedgeHogMode }) {
  /** force a repaint ~10×/sec so the numbers tick up in real-time */
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick(Date.now()), 500);
    return () => clearInterval(id);
  }, []);
  const [consoleVisible, setConsoleVisible] = useState(true);

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
    });
  }, [game]);

  return (
    <div className="EntryUI">
      <div className="Scoreboard">
        wave: {game.world.wave}, kills: {game.world.kills}
      </div>
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
    </div>
  );
}
