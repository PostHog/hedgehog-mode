import Matter from "matter-js";
import { AnimatedSprite } from "pixi.js";
import { AvailableAnimations } from "../sprites/sprites";
import { Game, GameElement } from "../types";

export class Actor implements GameElement {
  public sprite: AnimatedSprite;
  public isPointerOver = false;
  public isDragging = false;
  protected currentAnimation: AvailableAnimations;

  rigidBody: Matter.Body;
  isInteractive = false;
  scale = 1;

  hitBoxModifier = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };

  constructor(
    protected game: Game,
    private rigidBodyOptions: Matter.IBodyDefinition = {}
  ) {}

  protected loadSprite(animation: AvailableAnimations): void {
    this.currentAnimation = animation;
    this.sprite = new AnimatedSprite(
      this.game.spritesManager.getAnimatedSpriteFrames(animation)
    );
    this.sprite.animationSpeed = 0.5;

    this.maybeLoadRigidBody();

    // Setup a bunch of listeners for the sprite
    this.sprite.on("pointerover", () => {
      this.isPointerOver = true;
    });
    this.sprite.on("pointerout", () => {
      if (!this.isDragging) {
        this.isPointerOver = false;
      }
    });

    this.sprite.eventMode = "static";
    this.sprite.play();
    this.sprite.anchor.set(0.5);
    this.sprite.x = this.rigidBody.position.x;
    this.sprite.y = this.rigidBody.position.y;
    this.game.app.stage.addChild(this.sprite);

    this.setupPointerEvents();
  }

  private maybeLoadRigidBody(): void {
    if (this.rigidBody) {
      return;
    }

    const playerOptions: Matter.IBodyDefinition = {
      density: 0.001,
      friction: 0.7,
      frictionStatic: 0,
      frictionAir: 0.01,
      restitution: 0.5,
      inertia: Infinity,
      inverseInertia: Infinity,
      label: "Player",
      ...this.rigidBodyOptions,
    };

    const width = this.sprite.width;
    const height = this.sprite.height;

    this.rigidBody = Matter.Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight / 2,
      width -
        width * this.hitBoxModifier.left -
        width * this.hitBoxModifier.right,
      height -
        height * this.hitBoxModifier.top -
        height * this.hitBoxModifier.bottom,
      playerOptions
    );

    // Matter.Body.scale(this.rigidBody, this.scale, this.scale, {
    //   x: this.rigidBody.position.x,
    //   y: this.rigidBody.position.y,
    // });

    Matter.Composite.add(this.game.engine.world, this.rigidBody);
  }

  protected updateSprite(animation: AvailableAnimations): void {
    this.currentAnimation = animation;
    this.sprite.stop();
    this.sprite.textures =
      this.game.spritesManager.getAnimatedSpriteFrames(animation);
    this.sprite.currentFrame = 0;
    this.sprite.play();
  }

  setupPointerEvents(): void {
    this.sprite.on("pointerdown", () => {
      if (!this.isInteractive) {
        return;
      }

      this.isDragging = true;

      const onDragMove = (event) => {
        if (!this.isDragging) {
          return;
        }

        Matter.Body.setPosition(this.rigidBody, {
          x: event.data.global.x,
          y: event.data.global.y,
        });
      };

      const onDragEnd = () => {
        this.isDragging = false;
        this.game.app.stage.off("pointermove", onDragMove);
      };

      this.game.app.stage.on("pointermove", onDragMove);
      this.game.app.stage.on("pointerup", onDragEnd);
      this.game.app.stage.on("pointerupoutside", onDragEnd);
    });
  }

  update(): void {
    const yDiff = this.game.app.screen.height - this.rigidBody.position.y;

    if (yDiff < 0) {
      Matter.Body.setPosition(this.rigidBody, {
        x: this.rigidBody.position.x,
        y: Math.max(this.rigidBody.position.y - yDiff, 0),
      });
    }

    // TRICKY: This offsets the rendered sprite to match the hitbox
    const { height, width } = this.sprite;
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

    this.sprite.x = this.rigidBody.position.x - xOffsetDiff + xCenterDiff;
    this.sprite.y = this.rigidBody.position.y - yOffsetDiff + yCenterDiff;
    this.sprite.rotation = this.rigidBody.angle;

    // We scale the sprite relatvie to the hitbox

    // const xScale = (hitBoxWidth / width) * this.scale;
    // const yScale = (hitBoxHeight / height) * this.scale;

    // this.sprite.scale.set(xScale, yScale);
    // // TRICKY: The scale of the hitbox is different to the sprite
  }

  onCollision(element: GameElement, pair: Matter.Pair): void {
    // We use this to detect if we are on the ground
    console.log("Collision", element, pair);
  }
}
