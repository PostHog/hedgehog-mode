import { Actor } from "../actors/Actor";
import { Game, GameElement } from "../types";
import { COLLISIONS } from "../misc/collisions";
import Matter from "matter-js";
import { AnimatedSprite } from "pixi.js";
import { AvailableSpriteFrames } from "../sprites/sprites";

type InventoryItemType = "gun" | "bazooka" | "grenade";

export interface InventoryOptions {
  type: InventoryItemType;
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

    // Dynamically load the correct sprite/animation based on type
    const spriteKey = `inventory/${this.type}-tile` as AvailableSpriteFrames;
    // @ts-ignore
    let frames = game.spritesManager.getAnimatedSpriteFrames(spriteKey);

    this.sprite = new AnimatedSprite(frames);
    this.sprite.animationSpeed = 0.1;
    this.sprite.play();

    // Ensure the sprite is added to the stage if Actor doesn't do it
    if (!game.app.stage.children.includes(this.sprite)) {
      game.app.stage.addChild(this.sprite);
    }

    // Set initial position (if needed)
    // this.sprite.x = this.rigidBody?.position.x ?? 0;
    // this.sprite.y = this.rigidBody?.position.y ?? 0;
    this.sprite.visible = true;

    this.setScale(0.8);
  }

  onCollisionStart(element: GameElement, pair: Matter.Pair): void {
    super.onCollisionStart(element, pair);
    // You can add custom collision behavior here
  }
} 