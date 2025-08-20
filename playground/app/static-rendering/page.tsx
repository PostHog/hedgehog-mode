"use client";

import {
  HedgehogActorOptions,
  getRandomAccessoryCombo,
  HedgehogActorColorOptions,
  StaticHedgehogRenderer,
} from "@posthog/hedgehog-mode";
import { sample } from "lodash";
import { range } from "lodash";
import { useEffect, useRef, useState } from "react";

export default function StaticRendering() {
  const rendererRef = useRef<StaticHedgehogRenderer | null>(null);
  const [images, setImages] = useState<string[]>([]);

  if (!rendererRef.current) {
    rendererRef.current = new StaticHedgehogRenderer({
      assetsUrl: "/assets",
    });
  }

  useEffect(() => {
    const HEDGEHOGS: HedgehogActorOptions[] = range(20).map((i) => ({
      id: `hedgehog-${i}`,
      accessories: getRandomAccessoryCombo(),
      color: sample(HedgehogActorColorOptions),
      skin: sample(["default", "spiderhog", "robohog"]),
    }));

    const render = async () => {
      const images = await Promise.all(
        HEDGEHOGS.map(async (hedgehog) => {
          const image = await rendererRef.current?.render(hedgehog, 160);
          return image;
        })
      );

      setImages(images.filter((image) => image !== undefined));
    };

    render();
  }, []);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {images.map((image, i) => (
          <img width={80} height={80} src={image} key={i} />
        ))}
      </div>
    </div>
  );
}
