// Pure geometry for the pyro flamethrower cone. No Pixi, no Matter — so the
// hit tests are cheap enough to run against every platform on the page every
// frame while the trigger is held.

export type Vec = { x: number; y: number };

/** A DOMRect-compatible rectangle in viewport space. */
export type Rect = { x: number; y: number; width: number; height: number };

export type Cone = {
  /** The nozzle. */
  origin: Vec;
  /** 1 = facing right, -1 = facing left. */
  direction: 1 | -1;
  /** How far the flame reaches, in pixels. */
  length: number;
  /** Half the opening angle, in radians. */
  halfAngleRad: number;
};

export type Side = "left" | "right" | "top" | "bottom";

function pointInCone(cone: Cone, point: Vec): boolean {
  const dx = (point.x - cone.origin.x) * cone.direction;
  const dy = point.y - cone.origin.y;
  if (dx < 0) {
    return false;
  }
  if (Math.hypot(dx, dy) > cone.length) {
    return false;
  }
  return Math.atan2(Math.abs(dy), dx) <= cone.halfAngleRad;
}

/** True when any part of `rect` lies inside the cone. */
export function coneHitsRect(cone: Cone, rect: Rect): boolean {
  // Cheap rejections first: fully behind the origin, or fully past the reach.
  const aheadEdge =
    cone.direction === 1 ? rect.x + rect.width : cone.origin.x * 2 - rect.x;
  if (
    cone.direction === 1 ? aheadEdge < cone.origin.x : rect.x > cone.origin.x
  ) {
    return false;
  }
  const reach = cone.origin.x + cone.direction * cone.length;
  if (cone.direction === 1 ? rect.x > reach : rect.x + rect.width < reach) {
    return false;
  }

  // Any corner inside the cone is a hit.
  const corners: Vec[] = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x, y: rect.y + rect.height },
    { x: rect.x + rect.width, y: rect.y + rect.height },
  ];
  if (corners.some((corner) => pointInCone(cone, corner))) {
    return true;
  }

  // The origin itself inside the rect is a hit.
  if (
    cone.origin.x >= rect.x &&
    cone.origin.x <= rect.x + rect.width &&
    cone.origin.y >= rect.y &&
    cone.origin.y <= rect.y + rect.height
  ) {
    return true;
  }

  // A rect taller/wider than the cone can straddle the centre ray without any
  // corner inside it. The ray runs horizontally from the origin.
  const rayY = cone.origin.y;
  const crossesY = rayY >= rect.y && rayY <= rect.y + rect.height;
  const inReach =
    cone.direction === 1
      ? rect.x + rect.width > cone.origin.x && rect.x <= reach
      : rect.x < cone.origin.x && rect.x + rect.width >= reach;
  return crossesY && inReach;
}

/** True when the two rects overlap after growing `a` by `padding` on every side. */
export function rectsTouch(a: Rect, b: Rect, padding: number): boolean {
  return (
    a.x - padding < b.x + b.width &&
    a.x + a.width + padding > b.x &&
    a.y - padding < b.y + b.height &&
    a.y + a.height + padding > b.y
  );
}

/** The edge of `rect` closest to `origin` — where the burn starts. */
export function ignitionSide(origin: Vec, rect: Rect): Side {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const distances: { side: Side; distance: number }[] = [
    { side: "left", distance: Math.hypot(origin.x - rect.x, origin.y - cy) },
    {
      side: "right",
      distance: Math.hypot(origin.x - (rect.x + rect.width), origin.y - cy),
    },
    { side: "top", distance: Math.hypot(origin.x - cx, origin.y - rect.y) },
    {
      side: "bottom",
      distance: Math.hypot(origin.x - cx, origin.y - (rect.y + rect.height)),
    },
  ];
  distances.sort((a, b) => a.distance - b.distance);
  return distances[0].side;
}

/** Point in the cone at distance `d` and angle offset `a` (for particle spawns). */
export function conePoint(cone: Cone, d: number, a: number): Vec {
  return {
    x: cone.origin.x + cone.direction * d * Math.cos(a),
    y: cone.origin.y + d * Math.sin(a),
  };
}
