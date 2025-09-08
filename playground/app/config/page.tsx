"use client";

import {
  HedgehogActorOptions,
  getRandomAccessoryCombo,
  HedgehogActorColorOptions,
  HedgehogCustomization,
  HedgeHogMode,
  HedgehogModeRendererContent,
} from "@posthog/hedgehog-mode";
import { sample } from "lodash";
import { useEffect, useState } from "react";

export default function StaticRendering() {
  const [config, setConfig] = useState<HedgehogActorOptions>({
    id: "hedgehog-1",
    accessories: getRandomAccessoryCombo(),
    color: sample(HedgehogActorColorOptions),
    skin: sample(["default", "spiderhog", "robohog"]),
  });
  const [game, setGame] = useState<HedgeHogMode | null>(null);
  useEffect(() => {
    const game = new HedgeHogMode({
      assetsUrl: "/assets",
    });
    setGame(game);
  }, []);

  return (
    <div className="flex flex-col gap-2 justify-start p-4">
      <div className="flex flex-wrap gap-2 border border-gray-200 rounded-md p-3 bg-white max-w-screen-lg">
        <HedgehogModeRendererContent id="hedgehog-mode">
          {game && (
            <HedgehogCustomization
              config={config}
              setConfig={setConfig}
              game={game}
            />
          )}
        </HedgehogModeRendererContent>
      </div>
    </div>
  );
}
