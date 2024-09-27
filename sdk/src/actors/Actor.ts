import { AnimatedSprite, Application, Ticker } from "pixi.js";
import { AvailableAnimations, SpritesManager } from "../sprites/sprites";

const GRAVITY_PIXELS_PER_SECOND = 1;

export class Actor {
  protected sprite: AnimatedSprite;
  public isPointerOver = false;
  public isDragging = false;
  protected x = 0;
  protected y = 0;
  protected xVelocity = 0;
  protected yVelocity = 0;

  constructor(
    private app: Application,
    private spritesManager: SpritesManager
  ) {}

  protected loadSprite(animation: AvailableAnimations): void {
    if (this.sprite) {
      this.app.stage.removeChild(this.sprite);
    }
    this.sprite = this.spritesManager.createAnimatedSprite(animation);

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

    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }
}
