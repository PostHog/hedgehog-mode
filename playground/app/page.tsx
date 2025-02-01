"use client";
import { HedgeHogMode } from "@posthog/hedgehog-mode";
import { useEffect, useState } from "react";
import { Logo } from "./logo";

const Button = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className="p-2 text-white transition-colors bg-orange-500 border rounded-md hover:bg-orange-600"
      {...props}
    >
      {children}
    </button>
  );
};

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

  useEffect(() => {
    if (ref) {
      const hedgeHogMode = new HedgeHogMode({
        assetsUrl: "/assets",
      });
      hedgeHogMode.render(ref);
      setGame(hedgeHogMode);
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
      <main
        className="fixed inset-0 flex flex-col overflow-hidden"
        style={{ backgroundColor: "#eeefe9" }}
      >
        <Logo />

        <div className="flex flex-row gap-2 p-12">
          <Button onClick={() => game?.spawnHedgehog()}>Spawn hedgehog</Button>
        </div>

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
