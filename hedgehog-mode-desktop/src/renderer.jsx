import { HedgehogModeRenderer } from "@posthog/hedgehog-mode";
import { createRoot } from "react-dom/client";
import React from "react";

const desktop = window.hedgehogDesktop;
const [assetsUrl, savedState] = await Promise.all([
  desktop.assetsUrl(),
  desktop.loadState(),
]);

function DesktopHedgehog() {
  return (
    <HedgehogModeRenderer
      config={{
        assetsUrl,
        state: savedState ?? {
          options: { id: "player", player: true, controls_enabled: true },
        },
        onStateChange: desktop.saveState,
      }}
      onGameReady={(game) => {
        const setPointerEvents = game.setPointerEvents.bind(game);
        game.setPointerEvents = (interactive) => {
          setPointerEvents(interactive);
          desktop.setInteractive(interactive || game.gameUI?.visible === true);
        };
        window.setInterval(() => {
          desktop.setInteractive(
            game.pointerEventsEnabled || game.gameUI?.visible === true
          );
          desktop.updateHitAreas(
            game.getAllHedgehogs().map((hedgehog) => hedgehog.rigidBody.bounds)
          );
        }, 50);
      }}
    />
  );
}

createRoot(document.getElementById("root")).render(<DesktopHedgehog />);
