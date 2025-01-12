"use client";
import { HedgeHogMode } from "@posthog/hedgehog-mode";
import { useEffect, useState } from "react";
import { Logo } from "./logo";

export default function Home() {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (ref) {
      const hedgeHogMode = new HedgeHogMode({
        assetsUrl: "/assets",
      });
      hedgeHogMode.render(ref);
    }
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
      <main className="fixed inset-0 overflow-hidden flex flex-row">
        <Logo />

        <div
          id="game"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          ref={(r) => setRef(r)}
        ></div>
      </main>
    </div>
  );
}
