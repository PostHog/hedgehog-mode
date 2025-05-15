import { Game, GameElement, UpdateTicker } from "./types";
import { AnimatedSprite, Container, Graphics } from "pixi.js";

export class GameOver implements GameElement {
  private overlay: Graphics;
  private container: Container;
  isInteractive = false;

  private hedgehogSprite?: AnimatedSprite;
  private startX = 0;
  private startY = 0;
  private startAlpha = 0;
  private progress = 0;

  constructor(
    private game: Game,
    private actorPosition: Matter.Vector,
    onLoad?: () => void
  ) {
    this.game = game;
    this.container = new Container();
    this.overlay = new Graphics();
    this.overlay.rect(
      0,
      0,
      this.game.app.screen.width,
      this.game.app.screen.height
    );
    this.overlay.fill(0x000000);
    this.overlay.alpha = 0;
    this.container.addChild(this.overlay);
    this.game.app.stage.addChild(this.container);
    this.container.zIndex = 101;
    this.startAlpha = 0;
    this.startX = actorPosition.x;
    this.startY = actorPosition.y;

    this.spawnHedgehog(this.actorPosition);

    setTimeout(() => {
      this.deathSequence();
      onLoad?.();
    }, 3000);
  }

  spawnHedgehog(position: Matter.Vector) {
    const frames = this.game.spritesManager.getAnimatedSpriteFrames(
      "skins/default/death/tile"
    );
    this.hedgehogSprite = new AnimatedSprite(frames);

    this.hedgehogSprite.eventMode = "static";
    this.hedgehogSprite.texture.source.scaleMode = "nearest";

    this.hedgehogSprite.anchor.set(0.5);
    this.hedgehogSprite.x = position.x;
    this.hedgehogSprite.y = position.y;
    this.container.addChild(this.hedgehogSprite);
  }

  deathSequence() {
    this.game.setSpeed(1);
  }

  update(ticker: UpdateTicker) {
    this.progress += ticker.deltaMS / 3000;

    if (this.progress < 1) {
      const destinationX = window.innerWidth / 2;
      const destinationY = window.innerHeight / 2;

      this.hedgehogSprite!.x =
        destinationX - (destinationX - this.startX) * (1 - this.progress);
      this.hedgehogSprite!.y =
        destinationY - (destinationY - this.startY) * (1 - this.progress);
      this.overlay!.alpha = this.startAlpha + this.progress * 1;

      console.log({
        alpha: this.overlay!.alpha,
        progress: this.progress,
        startAlpha: this.startAlpha,
        startX: this.startX,
        startY: this.startY,
        destinationX: destinationX,
        destinationY: destinationY,
      });
    }
  }
}
