"use client";
import { HedgeHogMode } from "hedgehog-mode";
import { useEffect, useState } from "react";

export default function Home() {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref) {
      const hedgeHogMode = new HedgeHogMode({
        assetsUrl: "/assets",
      });
      hedgeHogMode.render(ref);
    }
  }, [ref]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="border rounded p-4">Box 1</div>
        <div className="border rounded p-4">Box 2</div>
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
