"use client";
import {
  HedgeHogMode,
  HedgehogActorColorOptions,
  getRandomAccesoryCombo,
  GameUIDialogBoxProps,
} from "@posthog/hedgehog-mode";
import { useEffect, useState } from "react";
import { sample } from "lodash";
import { DialogBox } from "./ui/DialogBox";

export function HedgehogModeUI({ game }: { game: HedgeHogMode }) {
  const [dialogBox, setDialogBox] = useState<GameUIDialogBoxProps | null>(null);

  const uiShowing = dialogBox !== null;

  console.log("Messages", dialogBox);

  console.log("UI showing", uiShowing);
  // To game should control the UI largely so we add an event listener for game modal popups
  useEffect(() => {
    game.setUI({
      showDialogBox: (dialogBox) => {
        setDialogBox(dialogBox);
      },
    });
  }, [game]);

  useEffect(() => {
    console.log("UI showing", uiShowing);
  }, [uiShowing]);

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

export function HedgehogModeGame() {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [game, setGame] = useState<HedgeHogMode | null>(null);

  const spawnHedgehog = async (count: number, hedgehogMode = game) => {
    for (let i = 0; i < count; i++) {
      hedgehogMode?.spawnHedgehog({
        id: `hedgehog-${i}`,
        controls_enabled: false,
        accessories: getRandomAccesoryCombo(),
        color: sample(HedgehogActorColorOptions),
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  };

  const setupHedgehogMode = async () => {
    if (ref) {
      const hedgeHogMode = new HedgeHogMode({
        assetsUrl: "/assets",
        platformSelector: ".border",
      });
      await hedgeHogMode.render(ref);
      setGame(hedgeHogMode);

      hedgeHogMode.spawnHedgehog({
        id: "hedgehog-1",
        skin: "spiderhog", // TODO: Remove
        controls_enabled: true,
        player: true,
        color: "rainbow",
        accessories: getRandomAccesoryCombo(),
      });

      spawnHedgehog(20, hedgeHogMode);
    }
  };

  useEffect(() => {
    setupHedgehogMode();
  }, [ref]);

  return (
    <>
      <div></div>
      <div className="fixed inset-0 z-20" ref={(r) => setRef(r)}></div>
      {/* UI */}
      {game && <HedgehogModeUI game={game} />}
    </>
  );
}
