import { Application, Ticker } from "pixi.js";
import { Game, HedgehogModeConfig } from "./types";
import { SpritesManager } from "./sprites/sprites";
import { HedgehogActor, HedgehogActorOptions } from "./actors/Hedgehog";
import { Actor } from "./actors/Actor";
import { Box } from "./scene/Box";
import { Floor } from "./scene/Floor";

export class HedgeHogMode implements Game {
  ref?: HTMLDivElement;
  app: Application;
  pointerEventsEnabled = false;
  spritesManager: SpritesManager;
  elapsed?: number;
  actors: Actor[] = [];
  boxes: Box[] = [];

  constructor(private options: HedgehogModeConfig) {
    this.spritesManager = new SpritesManager(options);
  }

  setPointerEvents(enabled: boolean): void {
    console.log("Setting pointer events", enabled);
    this.ref?.style.setProperty("pointer-events", enabled ? "auto" : "none");
    this.pointerEventsEnabled = enabled;
  }

  private spawnHedgehog(options: HedgehogActorOptions) {
    const actor = new HedgehogActor(this, options);
    this.actors.push(actor);
  }

  async render(ref: HTMLDivElement): Promise<void> {
    this.ref = ref;
    // Create the application helper and add its render target to the page
    this.app = new Application();

    await this.app.init({
      backgroundAlpha: 0.2,
      resizeTo: window,
      resolution: window.devicePixelRatio || 1, // Use the device pixel ratio
      autoDensity: true, // Adjust canvas to account for device pixel ratio
      antialias: false, // We have pixel art, so no need for antialiasing
    });

    await this.spritesManager.load();
    ref.appendChild(this.app.canvas);
    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = this.app.screen;

    this.boxes.push(new Floor(this));

    this.spawnHedgehog({});
    this.spawnHedgehog({});
    this.spawnHedgehog({});

    // const anim = this.spritesManager.createAnimatedSprite(
    //   "skins/default/action/tile"
    // );

    // let isDragging = false;

    // const onDragMove = (event) => {
    //   console.log("onDragMove", event);
    //   if (isDragging) {
    //     anim.x = event.data.global.x;
    //     anim.y = event.data.global.y;
    //   }
    // };

    // const onDragEnd = () => {
    //   console.log("onDragEnd");
    //   isDragging = false;
    //   this.app.stage.off("pointermove", onDragMove);
    //   this.setPointerEvents(false);
    // };

    // this.app.stage.on("pointerup", onDragEnd);
    // this.app.stage.on("pointerupoutside", onDragEnd);

    // anim.on("pointerdown", () => {
    //   console.log("pointerdown");
    //   isDragging = true;
    //   this.app.stage.on("pointermove", onDragMove);
    // });

    // anim.on("pointerover", (event) => {
    //   console.log("pointerover", event);
    //   this.setPointerEvents(true);
    // });
    // anim.on("pointerout", (event) => {
    //   console.log("pointerout", event);
    //   if (!isDragging) {
    //     this.setPointerEvents(false);
    //   }
    // });

    // anim.eventMode = "static";
    // anim.play();
    // anim.anchor.set(0.5);
    // anim.x = this.app.screen.width / 2;
    // anim.y = this.app.screen.height / 2;

    // this.app.stage.addChild(anim);

    // Add a ticker callback to move the sprite back and forth
    this.app.ticker.add((ticker) => {
      this.update(ticker);
    });
  }

  private update(ticker: Ticker) {
    let shouldHavePointerEvents = false;

    this.boxes.forEach((box) => box.update(ticker));

    this.actors.forEach((actor) => {
      actor.update(ticker);
      if (actor.isPointerOver) {
        shouldHavePointerEvents = true;
      }
    });

    if (shouldHavePointerEvents !== this.pointerEventsEnabled) {
      this.setPointerEvents(shouldHavePointerEvents);
    }
  }
}
