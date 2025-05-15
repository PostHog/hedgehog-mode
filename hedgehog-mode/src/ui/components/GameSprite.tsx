import { HedgeHogMode } from "../../hedgehog-mode";
import { AvailableSpriteFrames } from "../../sprites/sprites";

export function GameSprite({
  game,
  spriteName,
}: {
  game?: HedgeHogMode;
  spriteName: AvailableSpriteFrames;
}) {
  if (!game) return null;
  const spriteBaseUrl = game.spritesManager.assetUrl("sprites.png");
  const details = game.spritesManager.getSpriteFrames(spriteName);
  const backgroundSize = game.spritesManager.spritesheet?.data.meta.size;
  const backgroundWidth = backgroundSize?.w;
  const backgroundHeight = backgroundSize?.h;
  const width = details.frame.width;
  const height = details.frame.height;
  const x = details.frame.x;
  const y = details.frame.y;

  return (
    <div
      // className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundImage: `url(${spriteBaseUrl})`,
        backgroundPosition: `-${x}px -${y}px`,
        backgroundSize: `${backgroundWidth}px ${backgroundHeight}px`,
        imageRendering: "pixelated",
      }}
    />
  );
}
