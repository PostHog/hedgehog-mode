import { HedgehogModeRenderer } from "@posthog/hedgehog-mode";
import { createRoot } from "react-dom/client";
import React from "react";

const desktop = window.hedgehogDesktop;
const [assetsUrl, savedState, desktopLayout] = await Promise.all([
  desktop.assetsUrl(),
  desktop.loadState(),
  desktop.desktopLayout(),
]);

function DesktopHedgehog() {
  return (
    <>
      {desktopLayout.floors.map((floor, index) => (
        <div
          className="DesktopFloor"
          key={index}
          style={{
            position: "fixed",
            left: floor.x,
            top: floor.y,
            width: floor.width,
            height: 1,
          }}
        />
      ))}
      <HedgehogModeRenderer
        config={{
          assetsUrl,
          platforms: { selector: ".DesktopFloor", syncFrequency: 1000 },
          state: savedState ?? {
            options: { id: "player", player: true, controls_enabled: true },
          },
          onStateChange: desktop.saveState,
        }}
        onGameReady={(game) => {
          const setPointerEvents = game.setPointerEvents.bind(game);
          game.setPointerEvents = (interactive) => {
            setPointerEvents(interactive);
            desktop.setInteractive(
              interactive || game.gameUI?.visible === true
            );
          };
          window.setInterval(() => {
            desktop.setInteractive(
              game.pointerEventsEnabled || game.gameUI?.visible === true
            );
            desktop.updateHitAreas(
              game
                .getAllHedgehogs()
                .map((hedgehog) => hedgehog.rigidBody.bounds)
            );
          }, 50);
        }}
      />
    </>
  );
}

createRoot(document.getElementById("root")).render(<DesktopHedgehog />);
