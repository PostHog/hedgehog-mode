"use client";
import {
  HedgeHogMode,
  HedgehogActorColorOptions,
  getRandomAccesoryCombo,
} from "@posthog/hedgehog-mode";
import { useEffect, useState } from "react";
import { Logo } from "../components/logo";
import { sample } from "lodash";
import { Button } from "../components/Button";

export default function Home() {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [game, setGame] = useState<HedgeHogMode | null>(null);
  const makeRandomBoxes = () => {
    return Array.from({ length: 10 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      w: 100 + Math.random() * 100,
      h: 50 + Math.random() * 50,
    }));
  };

  const [randomBoxes, setRandomBoxes] = useState<
    {
      x: number;
      y: number;
      w: number;
      h: number;
    }[]
  >([]);

  const spawnHedgehog = (hedgehogMode = game) => {
    hedgehogMode?.spawnHedgehog({
      controls_enabled: false,
      accessories: getRandomAccesoryCombo(),
      color: sample(HedgehogActorColorOptions),
    });
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
        skin: "spiderhog", // TODO: Remove
        controls_enabled: true,
        player: true,
        color: "rainbow",
        accessories: getRandomAccesoryCombo(),
      });

      for (let i = 0; i < 20; i++) {
        spawnHedgehog(hedgeHogMode);

        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  };

  useEffect(() => {
    setupHedgehogMode();
  }, [ref]);

  useEffect(() => {
    if (localStorage.getItem("hedgehog-mode-boxes") === "disabled") {
      return;
    }
    const t = setTimeout(() => {
      setRandomBoxes(makeRandomBoxes());
    }, 5000);
    return () => clearTimeout(t);
  }, [randomBoxes]);

  useEffect(() => {
    setRandomBoxes(makeRandomBoxes());
  }, []);

  return (
    <div>
      <main className="fixed inset-0 flex flex-col overflow-hidden">
        <div className="relative flex-1 overflow-y-auto">
          <div className="relative flex flex-col w-full h-full">
            <Logo />
          </div>
          <div className="relative flex flex-col w-full h-full">
            <Logo />
          </div>
          <div className="relative flex flex-col w-full h-full">
            <Logo />
          </div>
        </div>

        <div className="absolute bottom-0 z-10 flex flex-row gap-2 p-12">
          <Button onClick={() => spawnHedgehog()}>Spawn hedgehog</Button>
        </div>

        <div
          id="game"
          className="fixed inset-0 z-20"
          ref={(r) => setRef(r)}
        ></div>
      </main>
    </div>
  );
}
