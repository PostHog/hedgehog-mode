import { Game, GameElement, UpdateTicker } from "./types";
import gsap from "gsap";
import { Container, Graphics } from "pixi.js";

export class GameOver implements GameElement {
  private overlay: Graphics;
  private container: Container;
  isInteractive = false;

  constructor(private game: Game) {
    this.game = game;
    this.container = new Container();
    this.overlay = new Graphics();
    this.overlay.beginFill(0x000000);
    this.overlay.drawRect(
      0,
      0,
      this.game.app.screen.width,
      this.game.app.screen.height
    );
    this.overlay.endFill();
    this.overlay.alpha = 0;
    this.container.addChild(this.overlay);
    this.game.app.stage.addChild(this.container);
    this.container.zIndex = 101;

    gsap.to(this.overlay, {
      alpha: 1,
      duration: 1,
      ease: "power2.inOut",
    });
  }

  update(ticker: UpdateTicker) {
    // Do

    this.overlay.alpha = Math.min(this.overlay.alpha + 0.01, 1);
  }
}
