import Matter, { Render } from "matter-js";
import { Application, Ticker } from "pixi.js";
import { Game, GameElement, HedgehogModeConfig } from "./types";
import { SpritesManager } from "./sprites/sprites";
import { HedgehogActor, HedgehogActorOptions } from "./actors/Hedgehog";
import { Ground } from "./items/Ground";
import { SyncedBox } from "./items/SyncedBox";
import { getRandomAccesoryCombo } from "./actors/Accessories";
import { Actor } from "./actors/Actor";

export class HedgeHogMode implements Game {
  ref?: HTMLDivElement;
  app: Application;
  engine: Matter.Engine;
  debugRender?: Matter.Render;
  elements: GameElement[] = []; // TODO: Type better
  isDebugging = true;

  pointerEventsEnabled = false;
  spritesManager: SpritesManager;
  elapsed?: number;

  constructor(private options: HedgehogModeConfig) {
    this.spritesManager = new SpritesManager(options);
    this.setupDebugListeners();
    this.setPointerEvents(false);
  }

  setupDebugListeners(): void {
    let dCount = 0;
    window.addEventListener("keydown", (e) => {
      if (e.key === "d" && e.ctrlKey) {
        dCount++;
        if (dCount === 5) {
          dCount = 0;
          this.isDebugging = !this.isDebugging;
          this.debugRender.canvas.style.opacity = this.isDebugging
            ? "0.5"
            : "0";
        }
      } else {
        dCount = 0;
      }
    });
  }

  setPointerEvents(enabled: boolean): void {
    this.log("Setting pointer events", enabled);
    this.ref?.style.setProperty("pointer-events", enabled ? "auto" : "none");
    this.pointerEventsEnabled = enabled;
  }

  private spawnHedgehog(options: HedgehogActorOptions) {
    if (!options.accessories) {
      options.accessories = getRandomAccesoryCombo();
    }
    const actor = new HedgehogActor(this, options);
    this.spawnActor(actor);
  }

  public spawnActor(actor: Actor): void {
    this.elements.push(actor);
  }

  async render(ref: HTMLDivElement): Promise<void> {
    this.ref = ref;
    // Create the application helper and add its render target to the page
    this.app = new Application();

    this.engine = Matter.Engine.create();

    Matter.Events.on(this.engine, "collisionStart", (event) =>
      this.onCollisionStart(event)
    );

    Matter.Events.on(this.engine, "collisionEnd", (event) =>
      this.onCollisionEnd(event)
    );

    await this.app.init({
      backgroundAlpha: 0,
      resizeTo: window,
      resolution: window.devicePixelRatio || 1, // Use the device pixel ratio
      autoDensity: true, // Adjust canvas to account for device pixel ratio
      antialias: false, // We have pixel art, so no need for antialiasing
    });

    await this.spritesManager.load();
    ref.appendChild(this.app.canvas);
    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = this.app.screen;

    // Add a ticker callback to move the sprite back and forth
    this.app.ticker.add((ticker) => this.update(ticker));

    window.addEventListener("resize", () => this.resize());

    setTimeout(() => {
      this.syncBoxes();
    }, 1000);
    this.syncBoxes();

    // Add debug renderer
    this.debugRender = Render.create({
      element: this.ref,
      engine: this.engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: true,
        showVelocity: true,
        showCollisions: true,
        showBounds: true,
        background: "transparent",
        pixelRatio: window.devicePixelRatio || 1,
      },
    });

    // Position the debug canvas absolutely over the PIXI canvas
    const debugCanvas = this.debugRender.canvas;
    debugCanvas.style.position = "absolute";
    debugCanvas.style.top = "0";
    debugCanvas.style.left = "0";
    debugCanvas.style.pointerEvents = "none";
    debugCanvas.style.opacity = this.isDebugging ? "0.5" : "0";

    // Start the debug renderer
    Render.run(this.debugRender);

    this.setupLevel();
  }

  private setupLevel() {
    this.elements.push(new Ground(this));

    this.spawnHedgehog({
      controls_enabled: true,
    });

    for (let i = 0; i < 20; i++) {
      this.spawnHedgehog({
        controls_enabled: false,
      });
    }
  }

  private update(ticker: Ticker) {
    Matter.Engine.update(this.engine, ticker.deltaMS);

    let shouldHavePointerEvents = false;

    for (const el of this.elements) {
      el.update();

      if (el.isPointerOver && el.isInteractive) {
        shouldHavePointerEvents = true;
      }
    }

    if (shouldHavePointerEvents !== this.pointerEventsEnabled) {
      this.setPointerEvents(shouldHavePointerEvents);
    }
  }

  private onCollisionStart(event: Matter.IEventCollision<Matter.Engine>) {
    event.pairs.forEach((pair) => {
      const [bodyA, bodyB] = [pair.bodyA, pair.bodyB];
      this.log(`${bodyA.label} ${bodyA.id} hits ${bodyB.label} ${bodyA.id}`);

      const elementA = this.findElementWithRigidBody(bodyA);
      const elementB = this.findElementWithRigidBody(bodyB);

      if (elementA && elementB) {
        elementA.onCollisionStart?.(elementB, pair);
        elementB.onCollisionStart?.(elementA, pair);
      }
    });
  }

  private onCollisionEnd(event: Matter.IEventCollision<Matter.Engine>) {
    event.pairs.forEach((pair) => {
      const [bodyA, bodyB] = [pair.bodyA, pair.bodyB];
      this.log(
        `${bodyA.label} ${bodyA.id} stops hitting ${bodyB.label} ${bodyA.id}`
      );

      const elementA = this.findElementWithRigidBody(bodyA);
      const elementB = this.findElementWithRigidBody(bodyB);

      if (elementA && elementB) {
        elementA.onCollisionEnd?.(elementB, pair);
        elementB.onCollisionEnd?.(elementA, pair);
      }
    });
  }

  private findElementWithRigidBody(rb: Matter.Body) {
    return this.elements.find((element) => element.rigidBody === rb);
  }

  removeElement(element: GameElement): void {
    element.beforeUnload();
    Matter.Composite.remove(this.engine.world, element.rigidBody); // stop physics simulation
    this.app.stage.removeChild(element.sprite); // stop drawing on the canvas
    this.elements = this.elements.filter((el) => el != element); // stop updating
    this.log(`Removed element. Elements left: ${this.elements.length}`);
  }

  private resize() {
    if (!this.debugRender) {
      return;
    }

    // Function to handle resizing
    this.debugRender.bounds.max.x = this.ref.clientWidth;
    this.debugRender.bounds.max.y = this.ref.clientHeight;
    this.debugRender.options.width = this.ref.clientWidth;
    this.debugRender.options.height = this.ref.clientHeight;
    this.debugRender.canvas.width = this.ref.clientWidth;
    this.debugRender.canvas.height = this.ref.clientHeight;
    Matter.Render.setPixelRatio(this.debugRender, window.devicePixelRatio); // added this
  }

  private syncBoxes() {
    // TODO: Move this to a config option
    const boxes = Array.from(document.querySelectorAll(".border"));
    const existingBoxes = this.elements.filter((el) => el instanceof SyncedBox);

    boxes.forEach((box) => {
      // TODO: Make this much faster...

      if (existingBoxes.find((el) => el.ref === box)) {
        return;
      }

      const syncedBox = new SyncedBox(this, box as HTMLElement);
      this.elements.push(syncedBox);
    });
  }

  log(...args: unknown[]): void {
    // LATER: Add debugging option
    if (this.isDebugging) {
      // eslint-disable-next-line no-console
      console.log("[HedgeHogMode]", ...args);
    }
  }
}
