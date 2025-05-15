import { Game, GameElement, UpdateTicker } from "./types";
import { AnimatedSprite, Container, Graphics } from "pixi.js";

const ENTRY_TIME = 2000;

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

    this.game.EntryUI?.clear();

    setTimeout(() => {
      this.deathSequence();
      onLoad?.();
    }, ENTRY_TIME);
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
    this.hedgehogSprite!.animationSpeed = 0.1;
    this.hedgehogSprite!.loop = false;
    this.hedgehogSprite?.play();
    this.hedgehogSprite!.onComplete = () => {
      this.game.EntryUI?.showGameOver();
    };
  }

  update(ticker: UpdateTicker) {
    this.progress += ticker.deltaMS / ENTRY_TIME;

    if (this.progress > 0 && this.progress < 1) {
      const destinationX = window.innerWidth / 2;
      const destinationY = window.innerHeight / 2;

      const actorProgress =
        this.progress > 0.2 ? Math.max(0, (this.progress - 0.2) / 0.8) : 0;

      this.hedgehogSprite!.x =
        destinationX - (destinationX - this.startX) * (1 - actorProgress);
      this.hedgehogSprite!.y =
        destinationY - (destinationY - this.startY) * (1 - actorProgress);

      this.hedgehogSprite!.scale.set(1 + actorProgress * 1);
      this.overlay!.alpha = this.startAlpha + this.progress * 1;
    }
  }

  destroy() {
    this.container.destroy();
    this.game.app.stage.removeChild(this.container);
    this.hedgehogSprite?.destroy();
  }
}
