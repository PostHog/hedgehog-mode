"use client";
import { HedgeHogMode } from "hedgehog-mode";
import { useEffect, useState } from "react";

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
    const t = setTimeout(() => {
      setRandomBoxes(makeRandomBoxes());
    }, 5000);
    return () => clearTimeout(t);
  }, [randomBoxes]);

  useEffect(() => {
    setRandomBoxes(makeRandomBoxes());
  }, []);

  return (
    <div className="">
      <main className="fixed inset-0 overflow-hidden flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {randomBoxes.map((box, index) => (
          <div
            key={index}
            className="border rounded p-4 hover:bg-red-600"
            style={{
              position: "absolute",
              left: `${box.x}px`,
              top: `${box.y}px`,
              width: `${box.w}px`,
              height: `${box.h}px`,
              transition: "all 1000ms ease-in-out",
            }}
          >
            Box {index + 1}
          </div>
        ))}
      </main>

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
    </div>
  );
}
