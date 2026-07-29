export function isPointInArea(point, windowBounds, areas) {
  const localX = point.x - windowBounds.x;
  const localY = point.y - windowBounds.y;

  return areas.some(
    (area) =>
      localX >= area.min.x &&
      localX <= area.max.x &&
      localY >= area.min.y &&
      localY <= area.max.y
  );
}

export function getSpriteHitArea(spriteBounds, padding = 8) {
  return {
    min: {
      x: spriteBounds.minX - padding,
      y: spriteBounds.minY - padding,
    },
    max: {
      x: spriteBounds.maxX + padding,
      y: spriteBounds.maxY + padding,
    },
  };
}

export function findSpriteAtPoint(actors, point) {
  return actors.find((actor) => {
    if (!actor.sprite) return false;
    const area = getSpriteHitArea(actor.sprite.getBounds());
    return (
      point.x >= area.min.x &&
      point.x <= area.max.x &&
      point.y >= area.min.y &&
      point.y <= area.max.y
    );
  });
}
