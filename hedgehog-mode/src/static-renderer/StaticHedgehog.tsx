import { CSSProperties } from "react";
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
  blue: "hue-rotate(200deg) saturate(300%) brightness(100%)",
  purple: "hue-rotate(240deg)",
  dark: "brightness(70%)",
  light: "brightness(130%)",
  sepia: "sepia(100%)", // Use native CSS sepia filter for proper sepia tone
  invert: "invert(100%)",
  greyscale: "grayscale(100%)",
  rainbow: "", // No filter for rainbow
};

interface StaticHedgehogProps {
  options: HedgehogActorOptions;
  size?: number | string;
  assetsUrl: string;
  className?: string;
  style?: CSSProperties;
}

function getSpriteStyle(spriteName: string, assetsUrl: string): CSSProperties {
  const frame = sprites.frames[spriteName];
  if (!frame) {
    return {};
  }

  // Sprite sheet dimensions from sprites.json meta
  const sheetWidth = 2000;
  const sheetHeight = 1440;

  // Responsive mode: scale to parent using percentages
  const scaleX = 100 / frame.sourceSize.w;
  const scaleY = 100 / frame.sourceSize.h;
  return {
    width: "100%",
    height: "100%",
    backgroundImage: `url(${assetsUrl}/sprites.png)`,
    backgroundPosition: `-${frame.frame.x * scaleX}% -${frame.frame.y * scaleY}%`,
    backgroundSize: `${sheetWidth * scaleX}% ${sheetHeight * scaleY}%`,
    imageRendering: "pixelated",
    position: "absolute",
    top: 0,
    left: 0,
  };
}

export function StaticHedgehog({
  options,
  size,
  assetsUrl,
  className,
  style,
}: StaticHedgehogProps): JSX.Element {
  const spriteName = `skins/${options.skin ?? "default"}/idle/tile000.png`;
  const baseStyle = getSpriteStyle(spriteName, assetsUrl);

  // Apply color filter
  const colorFilter = options.color
    ? COLOR_TO_CSS_FILTER_MAP[options.color]
    : "";

  return (
    <div
      style={{
        position: "relative",
        width: size ? (typeof size === "number" ? `${size}px` : size) : "100%",
        height: size ? (typeof size === "number" ? `${size}px` : size) : "100%",
        ...style,
      }}
      className={className}
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
        const accessoryStyle = getSpriteStyle(accessoryName, assetsUrl);

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
