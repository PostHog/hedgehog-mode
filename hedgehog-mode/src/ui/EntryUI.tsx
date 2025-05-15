import { useEffect, useState } from "react";
import { DialogBox } from "./components/DialogBox";
import { EntryUIDialogBoxProps } from "../types";
import { HedgeHogMode } from "../hedgehog-mode";
import { GameConsole } from "./components/GameConsole";

export function HedgehogModeUI({ game }: { game: HedgeHogMode }) {
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
      <GameConsole game={game} visible={true} onClose={() => {}} />
    </div>
  );
}
