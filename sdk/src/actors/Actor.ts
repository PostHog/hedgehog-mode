import { AnimatedSprite, Ticker } from "pixi.js";
import { AvailableAnimations } from "../sprites/sprites";
import { BoundingRect, Game, GameObject } from "../types";

const GRAVITY_PIXELS_PER_SECOND = 10;

export class Actor implements GameObject {
  protected sprite: AnimatedSprite;
  public isPointerOver = false;
  public isDragging = false;
  protected x = 0;
  protected y = 0;
  protected xVelocity = 0; // Sort of "pixels per second"
  protected yVelocity = 0;
  protected bounce = 0.4;
  protected applyGravity = true;
  protected currentAnimation: AvailableAnimations;

  constructor(private game: Game) {}

  get bounds(): BoundingRect {
    return {
      x: this.x,
      y: this.y,
      width: 100, // TODO
      height: 100, // TODO
    };
  }

  get hitArea(): BoundingRect {
    return this.bounds;
  }

  protected loadSprite(animation: AvailableAnimations): void {
    this.currentAnimation = animation;
    this.sprite = new AnimatedSprite(
      this.game.spritesManager.getSpriteFrames(animation)
    );
    this.sprite.animationSpeed = 0.5;

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
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.game.app.stage.addChild(this.sprite);
  }

  protected updateSprite(animation: AvailableAnimations): void {
    this.currentAnimation = animation;
    this.sprite.stop();
    this.sprite.textures = this.game.spritesManager.getSpriteFrames(animation);
    this.sprite.currentFrame = 0;
    this.sprite.play();
  }

  setDraggable(): void {
    this.sprite.on("pointerdown", () => {
      this.isDragging = true;

      const onDragMove = (event) => {
        if (!this.isDragging) {
          return;
        }
        this.x = event.data.global.x;
        this.y = event.data.global.y;
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

  update(ticker: Ticker): void {
    const relativeDelta = ticker.deltaMS / 1000;
    let newY = this.y;
    let newX = this.x;

    if (this.isDragging) {
      // Apply the change to the sprite and estimate the velocity based on the values
      this.xVelocity += (this.x - this.sprite.x) * relativeDelta;
      this.yVelocity -= (this.y - this.sprite.y) * relativeDelta;
    } else {
      if (this.applyGravity) {
        this.yVelocity -= GRAVITY_PIXELS_PER_SECOND * relativeDelta;
      }

      newY -= this.yVelocity;
      newX += this.xVelocity;
    }

    // Hit detection
    this.game.boxes.forEach((box) => {
      // Detect if the box is intersecting and react

      // TODO: Fix to account for height of item
      if (this.y > box.hitArea.y) {
        newY = box.hitArea.y;
        this.yVelocity = -this.yVelocity * this.bounce;
      }
    });

    this.y = newY;
    this.x = newX;

    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }
}
