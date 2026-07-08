import { Vector } from "matter-js";

export const PUNCH_RANGE_X = 70;
export const PUNCH_RANGE_Y = 60;
export const PUNCH_COOLDOWN_MS = 300;
export const PUNCH_HIT_DELAY_MS = 50;
// Weaker than a projectile hit (50, see Projectile.onCollisionStart)
export const PUNCH_DAMAGE = 20;

const KNOCKBACK_X = 12;
const KNOCKBACK_Y = -4;

export function getPunchDirection(origin: Vector, target: Vector): 1 | -1 {
  return target.x >= origin.x ? 1 : -1;
}

export function isInPunchRange(
  origin: Vector,
  direction: 1 | -1,
  other: Vector
): boolean {
  const dx = other.x - origin.x;
  const dy = other.y - origin.y;
  return (
    dx * direction >= 0 &&
    Math.abs(dx) <= PUNCH_RANGE_X &&
    Math.abs(dy) <= PUNCH_RANGE_Y
  );
}

export function getKnockbackVelocity(puncher: Vector, victim: Vector): Vector {
  const away = victim.x >= puncher.x ? 1 : -1;
  return { x: away * KNOCKBACK_X, y: KNOCKBACK_Y };
}
