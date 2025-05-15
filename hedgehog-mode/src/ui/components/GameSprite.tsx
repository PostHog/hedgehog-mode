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
        backgroundPosition: `-${x}px ${y}px`,
        backgroundSize: "2000px 2000px",
        imageRendering: "pixelated",
      }}
    />
  );
}
