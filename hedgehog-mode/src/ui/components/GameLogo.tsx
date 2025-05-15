import React from "react";

export function GameLogo({ size = "small" }: { size?: "large" | "small" }) {
  const file = size === "large" ? "hogwars-large.png" : "hogwars.png";
  return (
    <div className="GameConsole-ControlPanel-logo">
      <img
        src={`/assets/${file}`}
        alt="Hogwars Logo"
        className="w-full h-auto max-w-full"
      />
    </div>
  );
}
