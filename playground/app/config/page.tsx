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
import { useMemo, useState } from "react";

export default function StaticRendering() {
  const [config, setConfig] = useState<HedgehogActorOptions>({
    id: "hedgehog-1",
    accessories: getRandomAccessoryCombo(),
    color: sample(HedgehogActorColorOptions),
    skin: sample(["default", "spiderhog", "robohog"]),
  });
  const game = useMemo(() => {
    return new HedgeHogMode({
      assetsUrl: "/assets",
      platformSelector: ".border",
    });
  }, []);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <HedgehogModeRendererContent id="hedgehog-mode">
          <HedgehogCustomization
            config={config}
            setConfig={setConfig}
            game={game}
          />
        </HedgehogModeRendererContent>
      </div>
    </div>
  );
}
