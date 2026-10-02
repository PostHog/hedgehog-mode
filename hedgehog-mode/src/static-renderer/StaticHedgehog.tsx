import { CSSProperties } from "react";
import spritesData from "../../assets/sprites.json";
import { HedgehogActorOptions } from "../actors/hedgehog/config";
import {
  HedgehogActorColorOption,
  HedgehogActorFlags,
} from "../actors/hedgehog/config";
import { FLAG_CLOTH_ORIGIN, FLAG_GLOBE_CENTER } from "../sprites/flag-layout";
import { FLAG_CLOTH_BANDS } from "../sprites/flag-shear";

type SpriteFrame = {
  frame: { x: number; y: number; w: number; h: number };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
};

type SpritesJSON = {
  frames: Record<string, SpriteFrame>;
  meta: { size: { w: number; h: number } };
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
  const { w: sheetWidth, h: sheetHeight } = sprites.meta.size;

  // Responsive mode: scale to parent using percentages
  const scaleX = 100 / frame.sourceSize.w;
  const scaleY = 100 / frame.sourceSize.h;
  return {
    width: "100%",
    height: "100%",
    backgroundImage: `url(${assetsUrl}/sprites.png)`,
    // A background-position percentage lines up that fraction of the image
    // with the same fraction of the box, so `x / (sheet - frame)` puts the
    // frame's left edge flush with the box's, for frames of any size.
    backgroundPosition: `${(frame.frame.x / (sheetWidth - frame.sourceSize.w)) * 100}% ${(frame.frame.y / (sheetHeight - frame.sourceSize.h)) * 100}%`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${sheetWidth * scaleX}% ${sheetHeight * scaleY}%`,
    imageRendering: "pixelated",
    position: "absolute",
    top: 0,
    left: 0,
  };
}

/** A frame's size in the spritesheet, e.g. to give it a box of the right shape. */
export function getSpriteSize(name: string): { w: number; h: number } | null {
  return sprites.frames[name]?.sourceSize ?? null;
}

/** Renders a single frame from the spritesheet, scaled to fill its parent. */
export function StaticSprite({
  name,
  assetsUrl,
}: {
  name: string;
  assetsUrl: string;
}) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div style={getSpriteStyle(name, assetsUrl)} />
    </div>
  );
}

/** Places a sprite frame at a spot on the 80x80 body frame. */
function placedSprite(
  name: string,
  assetsUrl: string,
  { x, y, w, h }: { x: number; y: number; w: number; h: number }
) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${(x / 80) * 100}%`,
        top: `${(y / 80) * 100}%`,
        width: `${(w / 80) * 100}%`,
        height: `${(h / 80) * 100}%`,
      }}
    >
      <div style={getSpriteStyle(name, assetsUrl)} />
    </div>
  );
}

function StaticFlag({
  flag,
  assetsUrl,
}: {
  flag: NonNullable<HedgehogActorOptions["flag"]>;
  assetsUrl: string;
}) {
  if (HedgehogActorFlags[flag]?.kind === "globe") {
    const name = `props/${flag}/tile000.png`;
    const size = sprites.frames[name]?.sourceSize;
    if (!size) {
      return null;
    }
    return placedSprite(name, assetsUrl, {
      x: 40 + FLAG_GLOBE_CENTER.x - size.w / 2,
      y: 40 + FLAG_GLOBE_CENTER.y - size.h / 2,
      ...size,
    });
  }
  const name = `flags/${flag}.png`;
  const size = sprites.frames[name]?.sourceSize;
  if (!size) {
    return null;
  }
  return (
    <>
      <div style={getSpriteStyle("props/pole.png", assetsUrl)} />
      {/* Band by band, sheared to follow the leaning pole (see flag-shear). */}
      {FLAG_CLOTH_BANDS.map(({ row, height, shift }) => (
        <div
          key={row}
          style={{
            position: "absolute",
            left: `${((40 + FLAG_CLOTH_ORIGIN.x + shift) / 80) * 100}%`,
            top: `${((40 + FLAG_CLOTH_ORIGIN.y + row) / 80) * 100}%`,
            width: `${(size.w / 80) * 100}%`,
            height: `${(height / 80) * 100}%`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: `${(-row / height) * 100}%`,
              width: "100%",
              height: `${(size.h / height) * 100}%`,
            }}
          >
            <div style={getSpriteStyle(name, assetsUrl)} />
          </div>
        </div>
      ))}
    </>
  );
}

export function StaticHedgehog({
  options,
  size,
  assetsUrl,
  className,
  style,
}: StaticHedgehogProps) {
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

      {/* Held flag, unfiltered so the colour option doesn't recolour it */}
      {options.flag && <StaticFlag flag={options.flag} assetsUrl={assetsUrl} />}

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
