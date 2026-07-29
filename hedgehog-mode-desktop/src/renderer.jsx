import { HedgehogModeRenderer } from "@posthog/hedgehog-mode";
import { createRoot } from "react-dom/client";
import React, { useEffect, useState } from "react";
import { addDesktopGroundSegments } from "./desktop-grounds.mjs";
import { findSpriteAtPoint, getSpriteHitArea } from "./desktop-interaction.mjs";
import {
  getVisibleFloorSegments,
  getVisibleSpawnPosition,
} from "./window-bounds.mjs";

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
          const playerHalfHeight = player?.rigidBody
            ? (player.rigidBody.bounds.max.y - player.rigidBody.bounds.min.y) /
              2
            : 0;
          const spawnPosition = getVisibleSpawnPosition(
            desktopLayout.floors,
            window.innerWidth,
            window.innerHeight,
            playerHalfHeight
          );
          player?.setPosition(spawnPosition);
          player?.setVelocity({ x: 0, y: 0 });
          const visibleFloors = getVisibleFloorSegments(
            desktopLayout.floors,
            window.innerWidth,
            window.innerHeight
          );
          window.setInterval(() => {
            const position = player?.rigidBody?.position;
            const visible =
              position &&
              visibleFloors.some(
                (floor) =>
                  position.x >= floor.left &&
                  position.x <= floor.right &&
                  position.y >= -100 &&
                  position.y <= floor.y
              );
            if (player && !visible) {
              player.setPosition(spawnPosition);
              player.setVelocity({ x: 0, y: 0 });
            }
          }, 500);
          const setPointerEvents = game.setPointerEvents.bind(game);
          game.setPointerEvents = (interactive) => {
            setPointerEvents(interactive);
            desktop.setInteractive(
              interactive || game.gameUI?.visible === true
            );
          };
          window.addEventListener(
            "pointerdown",
            (event) => {
              const point = { x: event.clientX, y: event.clientY };
              const hedgehog = findSpriteAtPoint(game.getAllHedgehogs(), point);
              if (hedgehog && !hedgehog.hitTest(point)) {
                hedgehog.startDrag(event);
                event.preventDefault();
                event.stopPropagation();
              }
            },
            { capture: true }
          );
          window.setInterval(() => {
            desktop.setInteractive(
              game.pointerEventsEnabled || game.gameUI?.visible === true
            );
            desktop.updateHitAreas(
              game
                .getAllHedgehogs()
                .filter((hedgehog) => hedgehog.sprite)
                .map((hedgehog) =>
                  getSpriteHitArea(hedgehog.sprite.getBounds())
                )
            );
          }, 50);
        }}
      />
    </>
  );
}

createRoot(document.getElementById("root")).render(<DesktopHedgehog />);
