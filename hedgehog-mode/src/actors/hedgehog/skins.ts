import type Matter from "matter-js";
import type { HedgehogModeInterface } from "../../types";
import type { HedgehogActor } from "../Hedgehog";
import { COLLISIONS } from "../../misc/collisions";
import {
  HedgehogSkinAbility,
  HogzillaAbility,
  SpiderHogAbility,
} from "./abilities";
import { HedgehogActorSkinOption } from "./config";

type BodyTuning = Pick<
  Matter.IBodyDefinition,
  "density" | "friction" | "frictionStatic" | "frictionAir"
>;

/**
 * Everything that varies between hedgehog skins, in one place — so the actor
 * reads `skinDefinition.*` instead of branching on `options.skin`. Passive
 * tuning (physics, jump, render) plus an optional active ability factory.
 */
export interface HedgehogSkinDefinition {
  /** Rigid body tuning applied in syncRigidBody. */
  body: BodyTuning;
  /** Max consecutive jumps (Infinity = fly, for the ghost). */
  maxJumps: number;
  /** Upward velocity applied on jump. */
  jumpVelocity: number;
  /** Sprite opacity (the ghost is semi-transparent). */
  spriteAlpha: number;
  /** AnimatedSprite playback speed. */
  animationSpeed: number;
  /** Collision mask used while not moving upwards through platforms. */
  collisionMask: number;
  /** Accessory anchor override (defaults to centre when omitted). */
  accessoryAnchor?: { x: number; y: number };
  /** Build the skin's active ability, if it has one. */
  createAbility?: (
    actor: HedgehogActor,
    game: HedgehogModeInterface
  ) => HedgehogSkinAbility;
}

const DEFAULT_COLLISION_MASK =
  COLLISIONS.ACTOR | COLLISIONS.PROJECTILE | COLLISIONS.GROUND;

const DEFAULT_SKIN: HedgehogSkinDefinition = {
  body: {
    density: 0.001,
    friction: 0.2,
    frictionStatic: 0,
    frictionAir: 0.01,
  },
  maxJumps: 2,
  jumpVelocity: -15,
  spriteAlpha: 1,
  animationSpeed: 0.5,
  collisionMask: DEFAULT_COLLISION_MASK,
};

export const HEDGEHOG_SKINS: Record<
  HedgehogActorSkinOption,
  HedgehogSkinDefinition
> = {
  default: DEFAULT_SKIN,
  robohog: DEFAULT_SKIN,
  spiderhog: {
    ...DEFAULT_SKIN,
    createAbility: (actor, game) => new SpiderHogAbility(actor, game),
  },
  hogzilla: {
    ...DEFAULT_SKIN,
    accessoryAnchor: { x: 0.45, y: 0.5 },
    createAbility: (actor, game) => new HogzillaAbility(actor, game),
  },
  ghost: {
    ...DEFAULT_SKIN,
    body: {
      density: 0.0001,
      friction: 0.1,
      frictionStatic: 0,
      frictionAir: 0.2,
    },
    maxJumps: Infinity,
    jumpVelocity: -20,
    spriteAlpha: 0.5,
    animationSpeed: 0.1,
    // The ghost drifts through everything except the ground.
    collisionMask: COLLISIONS.GROUND,
    accessoryAnchor: { x: 0.4, y: 0.55 },
  },
};

export function getSkinDefinition(
  skin: HedgehogActorSkinOption | null | undefined
): HedgehogSkinDefinition {
  return (skin && HEDGEHOG_SKINS[skin]) || DEFAULT_SKIN;
}
