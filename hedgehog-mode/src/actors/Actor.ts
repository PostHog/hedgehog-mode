import Matter, { Constraint } from "matter-js";
import { AnimatedSprite } from "pixi.js";
import { AvailableAnimations } from "../sprites/sprites";
import { HedgehogModeInterface, GameElement, UpdateTicker } from "../types";
import { COLLISIONS } from "../misc/collisions";

const BASE_COLLISION_FILTER = {
  category: COLLISIONS.ACTOR,
  mask:
    COLLISIONS.ACTOR |
    COLLISIONS.PLATFORM |
    COLLISIONS.PROJECTILE |
    COLLISIONS.GROUND,
};

export const DEFAULT_COLLISION_FILTER = {
  ...BASE_COLLISION_FILTER,
  category: COLLISIONS.ACTOR,
};

export const NO_PLATFORM_COLLISION_FILTER = {
  ...BASE_COLLISION_FILTER,
  mask: COLLISIONS.ACTOR | COLLISIONS.PROJECTILE | COLLISIONS.GROUND,
};

export class Actor implements GameElement {
  public sprite?: AnimatedSprite;
  public isDragging = false;
  public isFlammable = false;
  protected currentAnimation?: AvailableAnimations;
  protected connectedElements: GameElement[] = [];
  protected collisionFilter: Matter.ICollisionFilter = DEFAULT_COLLISION_FILTER;
  collisionFilterOverride?: Matter.ICollisionFilter;

  rigidBody: Matter.Body | null = null;
  isInteractive = false;

  hitBoxModifier = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };

  forceAngle = 0;

  constructor(
    protected game: HedgehogModeInterface,
    private rigidBodyOptions: Matter.IBodyDefinition = {}
  ) {}

  protected loadSprite(animation: AvailableAnimations): void {
    this.currentAnimation = animation;
    this.sprite = new AnimatedSprite(
      this.game.spritesManager.getAnimatedSpriteFrames(animation)
    );

    this.loadRigidBody();
    this.sprite.eventMode = "static";
    this.sprite.texture.source.scaleMode = "nearest";

    this.sprite.play();
    this.sprite.anchor.set(0.5);
    this.sprite.x = this.rigidBody!.position.x;
    this.sprite.y = this.rigidBody!.position.y;
    this.game.app.stage.addChild(this.sprite);

    this.setupPointerEvents();
  }

  protected onClick(): void {}

  private loadRigidBody(reset = false): void {
    // If reset is passed then we recreate the rigid body
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (reset && this.rigidBody) {
      x = this.rigidBody.position.x;
      y = this.rigidBody.position.y;
      Matter.Composite.remove(this.game.engine.world, this.rigidBody);
      this.rigidBody = null;
    }

    if (this.rigidBody) {
      return;
    }

    const playerOptions: Matter.IBodyDefinition = {
      density: 0.001,
      friction: 0.2,
      frictionStatic: 0,
      frictionAir: 0.01,
      restitution: 0.5,
      inertia: Infinity,
      inverseInertia: Infinity,
      label: "Actor",
      collisionFilter: this.collisionFilter,
      ...this.rigidBodyOptions,
    };

    const width = this.sprite!.width;
    const height = this.sprite!.height;

    this.rigidBody = Matter.Bodies.rectangle(
      x,
      y,
      width -
        width * this.hitBoxModifier.left -
        width * this.hitBoxModifier.right,
      height -
        height * this.hitBoxModifier.top -
        height * this.hitBoxModifier.bottom,
      playerOptions
    );

    Matter.Composite.add(this.game.engine.world, this.rigidBody);
  }

  protected getRigidBodyDimensions(): { width: number; height: number } {
    return {
      width: this.rigidBody!.bounds.max.x - this.rigidBody!.bounds.min.x,
      height: this.rigidBody!.bounds.max.y - this.rigidBody!.bounds.min.y,
    };
  }

  protected updateSprite(
    animation: AvailableAnimations,
    options: { reset?: boolean; onComplete?: () => void } = {}
  ): void {
    if (!this.currentAnimation) {
      return this.loadSprite(animation);
    }
    const sprite = this.sprite!;

    sprite.animationSpeed = this.game.engine.timing.timeScale * 0.5;

    if (this.currentAnimation === animation && !options.reset) {
      return;
    }

    this.currentAnimation = animation;
    sprite.stop();
    sprite.textures =
      this.game.spritesManager.getAnimatedSpriteFrames(animation);
    sprite.currentFrame = 0;
    if (options.onComplete) {
      sprite.loop = false;
      sprite.onComplete = options.onComplete;
    } else {
      sprite.loop = true;
    }
    sprite.play();
  }

  public setVelocity(vector: Matter.Vector): void {
    Matter.Body.setVelocity(this.rigidBody!, vector);
  }

  public setPosition(position: Matter.Vector): void {
    Matter.Body.setPosition(this.rigidBody!, position);
  }

  public setScale(scale: number): void {
    this.sprite!.scale.set(scale, scale);
    // We need to reload the body whenever the scale changes
    // Ideally we would just fix this
    this.loadRigidBody(true);
  }

  setupPointerEvents(): void {
    this.sprite!.on("pointerdown", (e) => {
      if (!this.isInteractive) {
        return;
      }

      let ropeConstraint: Constraint | null = null;
      const startPoint: { x: number; y: number } = {
        x: e.clientX,
        y: e.clientY,
      };

      const onDragMove = () => {
        // We only want to start dragging if the distance moved is greater than 10px
        if (!ropeConstraint) {
          const distance = Math.sqrt(
            (e.clientX - startPoint.x) ** 2 + (e.clientY - startPoint.y) ** 2
          );
          if (distance < 10) {
            return;
          }

          ropeConstraint = Constraint.create({
            pointA: { x: e.clientX, y: e.clientY },
            bodyB: this.rigidBody!,
            stiffness: 0.2,
            damping: 1,
            length: 2,
          });
          Matter.World.addConstraint(this.game.engine.world, ropeConstraint);

          this.isDragging = true;
        }
        ropeConstraint!.pointA.x = e.clientX;
        ropeConstraint!.pointA.y = e.clientY;
      };

      const onDragEnd = () => {
        if (!this.isDragging) {
          this.onClick();
        }

        this.isDragging = false;
        if (ropeConstraint) {
          Matter.World.remove(this.game.engine.world, ropeConstraint);
        }

        this.game.app.stage.off("pointermove", onDragMove);
        this.game.app.stage.off("pointerup", onDragEnd);
        this.game.app.stage.off("pointerupoutside", onDragEnd);
      };

      this.game.app.stage.on("pointermove", onDragMove);
      this.game.app.stage.on("pointerup", onDragEnd);
      this.game.app.stage.on("pointerupoutside", onDragEnd);
    });
  }

  update(ticker: UpdateTicker): void {
    // Apply the collision filter override if it exists
    this.rigidBody!.collisionFilter.mask =
      this.collisionFilterOverride?.mask ?? this.collisionFilter.mask;
    this.rigidBody!.collisionFilter.category =
      this.collisionFilterOverride?.category ?? this.collisionFilter.category;

    const yDiff = this.game.app.screen.height - this.rigidBody!.position.y;

    if (yDiff < 0) {
      this.setPosition({
        x: this.rigidBody!.position.x,
        y: Math.max(this.rigidBody!.position.y - yDiff, 0),
      });
    }

    // TRICKY: This offsets the rendered sprite to match the hitbox
    const sprite = this.sprite!;
    const rigidBody = this.rigidBody!;
    const { height, width } = sprite;
    const hitBoxHeight =
      height -
      height * this.hitBoxModifier.top -
      height * this.hitBoxModifier.bottom;

    const hitBoxWidth =
      width -
      width * this.hitBoxModifier.left -
      width * this.hitBoxModifier.right;

    const yOffsetDiff = height * this.hitBoxModifier.top;
    const yCenterDiff = (height - hitBoxHeight) / 2;
    const xOffsetDiff = width * this.hitBoxModifier.left;
    const xCenterDiff = (width - hitBoxWidth) / 2;

    // Keep it upright (unless overidden)
    rigidBody.angle = this.forceAngle;

    sprite.x = rigidBody.position.x - xOffsetDiff + xCenterDiff;
    sprite.y = rigidBody.position.y - yOffsetDiff + yCenterDiff;
    sprite.rotation = rigidBody.angle;

    const { width: rigidBodyWidth } = this.getRigidBodyDimensions();
    if (rigidBody.position.x > window.innerWidth + rigidBodyWidth) {
      this.setPosition({
        x: 0,
        y: rigidBody.position.y,
      });
    }

    if (rigidBody.position.x < 0 - rigidBodyWidth) {
      this.setPosition({
        x: window.innerWidth,
        y: rigidBody.position.y,
      });
    }

    // // TRICKY: The scale of the hitbox is different to the sprite
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCollisionStart(element: GameElement, pair: Matter.Pair): void {
    // We use this to detect if we are on the ground
    this.connectedElements.push(element);
  }

  onCollisionEnd(element: GameElement): void {
    this.connectedElements = this.connectedElements.filter(
      (el) => el !== element
    );
  }

  getGround(): GameElement | undefined {
    const ground = this.connectedElements.find((el) => {
      // Considered ground if it is below us
      return el.rigidBody!.position.y >= this.rigidBody!.position.y;
    });

    // Slight optimization: If we find ground then lets move it to the front of the array
    if (ground) {
      this.connectedElements.splice(this.connectedElements.indexOf(ground), 1);
      this.connectedElements.unshift(ground);
    }

    return ground;
  }
}
