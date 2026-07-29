export function getDesktopBounds(display) {
  return {
    x: display.workArea.x,
    y: display.workArea.y,
    width: display.workArea.width,
    height: display.workArea.height,
  };
}

export function getVirtualDesktop(displays) {
  const left = Math.min(...displays.map((display) => display.workArea.x));
  const top = Math.min(...displays.map((display) => display.workArea.y));
  const right = Math.max(
    ...displays.map((display) => display.workArea.x + display.workArea.width)
  );
  const bottom = Math.max(
    ...displays.map((display) => display.workArea.y + display.workArea.height)
  );

  const bounds = { x: left, y: top, width: right - left, height: bottom - top };
  return {
    bounds,
    floors: getDisplayFloors(displays, bounds),
  };
}

export function getDisplayFloors(displays, viewportBounds) {
  return displays.map((display) => ({
    x: display.workArea.x - viewportBounds.x,
    y: display.workArea.y - viewportBounds.y + display.workArea.height - 1,
    width: display.workArea.width,
  }));
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

export function getVisibleSpawnPosition(floors, viewportWidth, viewportHeight) {
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
    y: Math.min(100, Math.max(40, floor.y / 2)),
  };
}
