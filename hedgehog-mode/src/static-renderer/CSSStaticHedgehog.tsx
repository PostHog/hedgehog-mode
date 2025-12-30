import React, { CSSProperties } from "react";
import spritesData from "../../assets/sprites.json";
import { HedgehogActorOptions } from "../actors/hedgehog/config";
import { HedgehogActorColorOption } from "../actors/hedgehog/config";

type SpriteFrame = {
  frame: { x: number; y: number; w: number; h: number };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
};

type SpritesJSON = {
  frames: Record<string, SpriteFrame>;
};

const sprites = spritesData as SpritesJSON;

// Convert PixiJS ColorMatrixFilter operations to CSS filters
// Note: CSS filters work slightly differently than PixiJS ColorMatrixFilter
// hue-rotate: degrees (same as PixiJS)
// saturate: multiplier (1 = 100%, 1.2 = 120%, 3 = 300%)
// brightness: multiplier (1 = 100%, 0.7 = 70%, 1.3 = 130%)
const COLOR_TO_CSS_FILTER_MAP: Record<HedgehogActorColorOption, string> = {
  red: "hue-rotate(-40deg) saturate(280%) brightness(90%)",
  green: "hue-rotate(60deg) saturate(100%)",
  blue: "hue-rotate(210deg) saturate(300%) brightness(90%)",
  purple: "hue-rotate(240deg)",
  dark: "brightness(70%)",
  light: "brightness(130%)",
  sepia: "saturate(300%) brightness(70%)",
  invert: "invert(100%)",
  greyscale: "grayscale(100%)",
  rainbow: "", // No filter for rainbow
};

interface CSSStaticHedgehogProps {
  options: HedgehogActorOptions;
  size?: number;
  assetsUrl: string;
}

function getSpriteStyle(
  spriteName: string,
  assetsUrl: string,
  size: number = 80
): CSSProperties {
  const frame = sprites.frames[spriteName];
  if (!frame) {
    console.warn(`Sprite not found: ${spriteName}`);
    return {};
  }

  // Calculate scale factor based on desired size vs original sprite size
  const scale = size / frame.sourceSize.w;

  // Sprite sheet dimensions from sprites.json meta
  const sheetWidth = 2000;
  const sheetHeight = 1440;

  return {
    width: `${size}px`,
    height: `${size}px`,
    backgroundImage: `url(${assetsUrl}/sprites.png)`,
    backgroundPosition: `-${frame.frame.x * scale}px -${frame.frame.y * scale}px`,
    backgroundSize: `${sheetWidth * scale}px ${sheetHeight * scale}px`,
    imageRendering: "pixelated",
    position: "absolute",
    top: 0,
    left: 0,
  };
}

export function CSSStaticHedgehog({
  options,
  size = 80,
  assetsUrl,
}: CSSStaticHedgehogProps): JSX.Element {
  const spriteName = `skins/${options.skin ?? "default"}/idle/tile000.png`;
  const baseStyle = getSpriteStyle(spriteName, assetsUrl, size);

  // Apply color filter
  const colorFilter = options.color
    ? COLOR_TO_CSS_FILTER_MAP[options.color]
    : "";

  return (
    <div
      style={{
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {/* Base sprite with color filter */}
      <div
        style={{
          ...baseStyle,
          filter: colorFilter,
        }}
      />

      {/* Accessories */}
      {options.accessories?.map((accessory) => {
        const accessoryName = `accessories/${accessory}.png`;
        const accessoryStyle = getSpriteStyle(accessoryName, assetsUrl, size);

        return (
          <div
            key={accessory}
            style={{
              ...accessoryStyle,
              filter: colorFilter,
            }}
          />
        );
      })}
    </div>
  );
}
