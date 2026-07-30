export function getDisplayArea(display, platform = process.platform) {
  return platform === "darwin" ? display.bounds : display.workArea;
}

export function getDesktopBounds(display, platform = process.platform) {
  const area = getDisplayArea(display, platform);
  return {
    x: area.x,
    y: area.y,
    width: area.width,
    height: area.height,
  };
}

export function getVirtualDesktop(displays, platform = process.platform) {
  const areas = displays.map((display) => getDisplayArea(display, platform));
  const left = Math.min(...areas.map((area) => area.x));
  const top = Math.min(...areas.map((area) => area.y));
  const right = Math.max(...areas.map((area) => area.x + area.width));
  const bottom = Math.max(...areas.map((area) => area.y + area.height));

  const bounds = { x: left, y: top, width: right - left, height: bottom - top };
  return {
    bounds,
    floors: getDisplayFloors(displays, bounds, platform),
  };
}

export function getDisplayFloors(
  displays,
  viewportBounds,
  platform = process.platform
) {
  return displays.map((display) => {
    const area = getDisplayArea(display, platform);
    return {
      x: area.x - viewportBounds.x,
      y: area.y - viewportBounds.y + area.height - 1,
      width: area.width,
    };
  });
}

export function getVisibleFloorSegments(floors, viewportWidth, viewportHeight) {
  return floors
    .map((floor) => ({
      left: Math.max(0, floor.x),
      right: Math.min(viewportWidth, floor.x + floor.width),
      y: floor.y,
    }))
    .filter(
      (floor) =>
        floor.right > floor.left && floor.y >= 0 && floor.y < viewportHeight
    );
}

export function getVisibleSpawnPosition(
  floors,
  viewportWidth,
  viewportHeight,
  actorHalfHeight = 0
) {
  const floor = getVisibleFloorSegments(
    floors,
    viewportWidth,
    viewportHeight
  ).sort((a, b) => b.right - b.left - (a.right - a.left))[0];

  if (!floor) {
    return { x: viewportWidth / 2, y: Math.min(100, viewportHeight / 2) };
  }

  return {
    x: (floor.left + floor.right) / 2,
    y: floor.y - actorHalfHeight,
  };
}
