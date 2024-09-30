import { AnimatedSprite, Application, Ticker } from "pixi.js";
import { AvailableAnimations, SpritesManager } from "../sprites/sprites";

const GRAVITY_PIXELS_PER_SECOND = 10;

export class Actor {
  protected sprite: AnimatedSprite;
  public isPointerOver = false;
  public isDragging = false;
  protected x = 0;
  protected y = 0;
  protected xVelocity = 0; // Sort of "pixels per second"
  protected yVelocity = 0;
  protected currentAnimation: AvailableAnimations;

  constructor(
    private app: Application,
    private spritesManager: SpritesManager
  ) {}

  protected loadSprite(animation: AvailableAnimations): void {
    this.currentAnimation = animation;
    this.sprite = new AnimatedSprite(
      this.spritesManager.getSpriteFrames(animation)
    );
    this.sprite.animationSpeed = 0.25;

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
    this.app.stage.addChild(this.sprite);
  }

  protected updateSprite(animation: AvailableAnimations): void {
    this.currentAnimation = animation;
    this.sprite.stop();
    this.sprite.textures = this.spritesManager.getSpriteFrames(animation);
    this.sprite.currentFrame = 0;
    this.sprite.play();
  }

  setDraggable(): void {
    this.sprite.on("pointerdown", () => {
      this.isDragging = true;
      this.app.stage.on("pointermove", onDragMove);
    });

    const onDragMove = (event) => {
      if (this.isDragging) {
        this.x = event.data.global.x;
        this.y = event.data.global.y;
      }
    };

    const onDragEnd = () => {
      this.isDragging = false;
      this.app.stage.off("pointermove", onDragMove);
    };

    this.app.stage.on("pointerup", onDragEnd);
    this.app.stage.on("pointerupoutside", onDragEnd);
  }

  update(ticker: Ticker): void {
    const relativeDelta = ticker.deltaMS / 1000;
    this.yVelocity -= GRAVITY_PIXELS_PER_SECOND * relativeDelta;
    this.y -= this.yVelocity;
    this.x += this.xVelocity;

    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }
}
