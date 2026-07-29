import { HedgehogModeRenderer } from "@posthog/hedgehog-mode";
import { createRoot } from "react-dom/client";
import React, { useEffect, useState } from "react";
import { addDesktopGroundSegments } from "./desktop-grounds.mjs";

const desktop = window.hedgehogDesktop;
const [assetsUrl, savedState, desktopLayout] = await Promise.all([
  desktop.assetsUrl(),
  desktop.loadState(),
  desktop.desktopLayout(),
]);

function DesktopHedgehog() {
  const [windowPlatforms, setWindowPlatforms] = useState([]);

  useEffect(() => {
    let active = true;
    let refreshing = false;
    const refreshWindowPlatforms = async () => {
      if (refreshing) return;
      refreshing = true;
      try {
        const platforms = await desktop.windowPlatforms();
        if (active) setWindowPlatforms(platforms);
      } finally {
        refreshing = false;
      }
    };
    void refreshWindowPlatforms();
    const interval = window.setInterval(refreshWindowPlatforms, 500);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <>
      {windowPlatforms.map((platform, index) => (
        <div
          className="DesktopWindowPlatform"
          key={`${platform.x}:${platform.y}:${platform.width}:${index}`}
          style={{
            position: "fixed",
            left: platform.x,
            top: platform.y,
            width: platform.width,
            height: 1,
          }}
        />
      ))}
      <HedgehogModeRenderer
        config={{
          assetsUrl,
          platforms: {
            selector: ".DesktopWindowPlatform",
            syncFrequency: 250,
          },
          state: savedState ?? {
            options: { id: "player", player: true, controls_enabled: true },
          },
          onStateChange: desktop.saveState,
        }}
        onGameReady={(game) => {
          addDesktopGroundSegments(game, desktopLayout.floors);
          const player = game.getPlayableHedgehog();
          player?.setPosition(desktopLayout.spawnPosition);
          player?.setVelocity({ x: 0, y: 0 });
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
