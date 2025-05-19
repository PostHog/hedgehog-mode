import { Actor } from "../actors/Actor";
import { Game, GameElement } from "../types";
import { COLLISIONS } from "../misc/collisions";
import Matter from "matter-js";
import { AnimatedSprite } from "pixi.js";
import { AvailableAnimations, AvailableSpriteFrames } from "../sprites/sprites";

export const INVENTORY_ITEMS = ["gun", "bazooka", "grenade"] as const;
export type InventoryItemType = (typeof INVENTORY_ITEMS)[number];

export interface InventoryOptions {
  type: InventoryItemType;
  scale?: number;
  // Add more properties as needed (ammo, damage, etc.)
}

export class Inventory extends Actor {
  public isInteractive = true;
  public isFlammable = false;

  hitBoxModifier = {
    left: 0.2,
    right: 0.2,
    top: 0.2,
    bottom: 0.2,
  };

  protected collisionFilter = {
    category: COLLISIONS.ACTOR,
    mask: COLLISIONS.ACTOR | COLLISIONS.PLATFORM | COLLISIONS.GROUND,
  };

  scale = 1;
  type: InventoryItemType;
  sprite: AnimatedSprite;

  constructor(game: Game, options: InventoryOptions) {
    super(game, {
      density: 0.001,
      friction: 0.2,
      frictionStatic: 0,
      frictionAir: 0.01,
      restitution: 0.5,
      inertia: Infinity,
      inverseInertia: Infinity,
      label: "Inventory",
    });

    this.type = options.type;
    this.scale = options.scale || 1;

    // Dynamically load the correct sprite/animation based on type
    const spriteKey = `inventory/${this.type}-tile` as AvailableAnimations;
    const frames = game.spritesManager.getAnimatedSpriteFrames(spriteKey);

    this.sprite = new AnimatedSprite(frames);
    this.sprite.anchor.set(0.5, 0.6);
    this.sprite.animationSpeed = 0.1;
    this.sprite.play();

    // Ensure the sprite is added to the stage if Actor doesn't do it
    if (!game.world.container.children.includes(this.sprite)) {
      game.world.container.addChild(this.sprite);
    }

    // Set initial position (if needed)
    this.sprite.visible = true;

    this.setScale(this.scale);

    this.setPosition({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
    });
  }

  onCollisionStart(element: GameElement, pair: Matter.Pair): void {
    super.onCollisionStart(element, pair);
    // You can add custom collision behavior here
  }
}
