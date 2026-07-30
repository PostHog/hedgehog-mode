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
