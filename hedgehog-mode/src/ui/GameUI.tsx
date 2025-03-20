import { useEffect, useState } from "react";
import { DialogBox } from "./components/DialogBox";
import { GameUIDialogBoxProps } from "../types";
import { HedgeHogMode } from "../hedgehog-mode";

export function HedgehogModeUI({ game }: { game: HedgeHogMode }) {
  const [dialogBox, setDialogBox] = useState<GameUIDialogBoxProps | null>(null);

  const uiShowing = dialogBox !== null;

  // To game should control the UI largely so we add an event listener for game modal popups
  useEffect(() => {
    game.setUI({
      showDialogBox: (dialogBox) => {
        setDialogBox(dialogBox);
      },
    });
  }, [game]);

  return (
    <div
      className="fixed inset-0 z-20 font-mono"
      style={{ pointerEvents: uiShowing ? "auto" : "none" }}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <DialogBox
          actor={dialogBox?.actor}
          position={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }}
          messages={dialogBox?.messages ?? []}
          onEnd={() => {
            setDialogBox(null);
          }}
        />
      </div>
    </div>
  );
}
