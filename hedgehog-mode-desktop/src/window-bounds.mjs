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

  return {
    bounds: { x: left, y: top, width: right - left, height: bottom - top },
    floors: displays.map((display) => ({
      x: display.workArea.x - left,
      y: display.workArea.y - top + display.workArea.height,
      width: display.workArea.width,
    })),
  };
}

export function getSpawnPosition(primaryDisplay, desktopBounds) {
  return {
    x:
      primaryDisplay.workArea.x -
      desktopBounds.x +
      primaryDisplay.workArea.width / 2,
    y: primaryDisplay.workArea.y - desktopBounds.y + 100,
  };
}
