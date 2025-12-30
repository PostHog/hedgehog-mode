import gsap from "gsap";

import Matter, { Render, Runner } from "matter-js";
import { Application } from "pixi.js";
import {
  HedgehogModeInterface,
  GameElement,
  GameUI,
  HedgehogModeConfig,
} from "./types";
import { SpritesManager } from "./sprites/sprites";
import { HedgehogActor } from "./actors/Hedgehog";
import { Ground } from "./items/Ground";
import { SyncedPlatform } from "./items/SyncedPlatform";
import { Actor } from "./actors/Actor";
import { GlobalKeyboardListeners } from "./misc/GlobalKeyboardListeners";
import {
  HedgehogActorAccessoryOption,
  HedgehogActorOptions,
} from "./actors/hedgehog/config";
import { GameStateManager } from "./state";
import { uniqueId } from "lodash";
import { HedgehogGhostActor } from "./actors/Ghost";
import { Accessory } from "./items/Accessory";

export type {
  HedgehogActorOptions,
  HedgehogActorColorOption,
  HedgehogActorAccessoryOption,
  HedgehogActorSkinOption,
  HedgehogActorAccessoryInfo,
} from "./actors/hedgehog/config";
export {
  HedgehogActorColorOptions,
  getRandomAccessoryCombo,
  HedgehogActorAccessoryOptions,
  HedgehogActorSkinOptions,
  HedgehogActorAccessories,
} from "./actors/hedgehog/config";

export type * from "./types";

export class HedgeHogMode implements HedgehogModeInterface {
  ref?: HTMLDivElement;
  app!: Application;
  engine!: Matter.Engine;
  runner!: Matter.Runner;
  debugRender?: Matter.Render;
  elements: GameElement[] = []; // TODO: Type better
  totalElapsedTime = 0;
  pointerEventsEnabled = false;
  isDebugging = false;
  spritesManager: SpritesManager;
  mousePosition?: Matter.Vector;
  lastTime?: number;
  gameUI!: GameUI;
  stateManager?: GameStateManager;
  syncPlatformsInterval?: NodeJS.Timeout;

  constructor(public options: HedgehogModeConfig) {
    this.spritesManager = new SpritesManager(options);
    this.setupDebugListeners();
  }

  destroy(): void {
    if (this.syncPlatformsInterval) {
      clearInterval(this.syncPlatformsInterval);
    }
    Runner.stop(this.runner);
    this.app.destroy({
      removeView: true,
    });
    if (this.debugRender) {
      Render.stop(this.debugRender);
      Matter.World.clear(this.engine.world, false);
      Matter.Engine.clear(this.engine);
      this.debugRender.canvas.remove();
      this.debugRender.canvas = document.createElement("canvas");
      this.debugRender.context = this.debugRender.canvas.getContext("2d")!;
      this.debugRender.textures = {};
    }
  }

  setupDebugListeners(): void {
    let dCount = 0;
    window.addEventListener("keydown", (e) => {
      if (e.key === "d" && e.ctrlKey) {
        dCount++;
        if (dCount === 5) {
          dCount = 0;
          this.isDebugging = !this.isDebugging;
          if (this.debugRender?.canvas) {
            this.debugRender.canvas.style.opacity = this.isDebugging
              ? "0.5"
              : "0";
          }
        }
      } else {
        dCount = 0;
      }
    });
  }

  setUI(ui: GameUI): void {
    this.gameUI = ui;
  }

  setPointerEvents(enabled: boolean): void {
    this.log("Setting pointer events", enabled);
    this.ref?.style.setProperty("pointer-events", enabled ? "auto" : "none");
    // Add a classname to indicate hovering
    this.ref?.classList.toggle("GameContainer--hovering", enabled);
    this.pointerEventsEnabled = enabled;
  }

  spawnHedgehogGhost(position: Matter.Vector): HedgehogGhostActor {
    const ghost = new HedgehogGhostActor(this, position);
    this.elements.push(ghost);
    return ghost;
  }

  spawnHedgehog(options: HedgehogActorOptions | undefined): HedgehogActor {
    const actor = new HedgehogActor(
      this,
      options || {
        id: uniqueId("hedgehog-"),
      }
    );
    this.spawnActor(actor);
    return actor;
  }

  spawnAccessory(
    accessory: HedgehogActorAccessoryOption,
    position: Matter.Vector
  ): Accessory {
    const el = new Accessory(this, { accessory, position });
    this.elements.push(el);
    return el;
  }

  getPlayableHedgehog(): HedgehogActor | undefined {
    return this.elements.find(
      (element) => element instanceof HedgehogActor && element.options.player
    ) as HedgehogActor | undefined;
  }

  getAllHedgehogs(): HedgehogActor[] {
    return this.elements.filter(
      (element) => element instanceof HedgehogActor
    ) as HedgehogActor[];
  }

  public spawnActor(actor: Actor): void {
    this.elements.push(actor);
  }

  async render(ref: HTMLDivElement): Promise<void> {
    this.ref = ref;

    this.setPointerEvents(false);
    // Create the application helper and add its render target to the page
    this.app = new Application();
    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: 2 },
    });
    this.runner = Runner.create();

    Matter.Events.on(this.engine, "collisionStart", (event) =>
      this.onCollisionStart(event)
    );

    Matter.Events.on(this.engine, "collisionEnd", (event) =>
      this.onCollisionEnd(event)
    );

    Matter.Events.on(this.engine, "afterUpdate", () => {
      const currentTime = performance.now();
      if (!this.lastTime) {
        this.lastTime = currentTime;
        return;
      }

      const deltaMS =
        (currentTime - this.lastTime) * this.engine.timing.timeScale;
      this.totalElapsedTime += deltaMS / 1000;
      gsap.updateRoot(this.totalElapsedTime);

      // Update all game elements
      let shouldHavePointerEvents = false;
      for (const el of this.elements) {
        el.update({ deltaMS, deltaTime: deltaMS / 1000 });

        if (
          !shouldHavePointerEvents &&
          el instanceof HedgehogActor &&
          this.mousePosition &&
          (Matter.Query.point([el.rigidBody!], this.mousePosition).length ||
            el.isDragging)
        ) {
          shouldHavePointerEvents = true;
        }
      }

      if (shouldHavePointerEvents !== this.pointerEventsEnabled) {
        this.setPointerEvents(shouldHavePointerEvents);
      }

      // Render PIXI stage
      this.app.render();
      this.lastTime = currentTime;
    });

    await this.app.init({
      backgroundAlpha: 0,
      resizeTo: window,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: false,
      roundPixels: false,
    });

    await this.spritesManager.load();
    ref.appendChild(this.app.canvas);

    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = this.app.screen;

    window.addEventListener("resize", () => this.resize());

    if (this.options.platforms) {
      this.syncPlatformsInterval = setInterval(
        () => this.syncPlatforms(),
        this.options.platforms.syncFrequency ?? 200
      );
      this.syncPlatforms();
    }

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

    // Start the Matter.js runner
    Runner.run(this.runner, this.engine);
    // Start the debug renderer
    Render.run(this.debugRender);

    document.addEventListener("mousemove", (event) => {
      this.mousePosition = { x: event.clientX, y: event.clientY };
    });

    new GlobalKeyboardListeners(this);
    gsap.ticker.remove(gsap.updateRoot);
    this.elements.push(new Ground(this));
    this.stateManager = new GameStateManager(this, this.options);
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

  setSpeed(speed: number) {
    this.engine.timing.timeScale = speed;
    gsap.globalTimeline.timeScale(speed);
  }

  removeElement(element: GameElement): void {
    element.beforeUnload?.();
    if (element.rigidBody) {
      Matter.Composite.remove(this.engine.world, element.rigidBody);
    }
    if (element.sprite) {
      this.app.stage.removeChild(element.sprite);
    }
    this.elements = this.elements.filter((el) => el != element);
    this.log(`Removed element. Elements left: ${this.elements.length}`);
  }

  private resize() {
    if (!this.debugRender || !this.ref) {
      return;
    }

    this.debugRender.bounds.max.x = this.ref.clientWidth;
    this.debugRender.bounds.max.y = this.ref.clientHeight;
    this.debugRender.options.width = this.ref.clientWidth;
    this.debugRender.options.height = this.ref.clientHeight;
    this.debugRender.canvas.width = this.ref.clientWidth;
    this.debugRender.canvas.height = this.ref.clientHeight;
    Matter.Render.setPixelRatio(this.debugRender, window.devicePixelRatio);
  }

  private syncPlatforms() {
    const platforms = this.options.platforms;
    const {
      selector,
      viewportPadding,
      minWidth = 10,
      maxNumberOfPlatforms = 500,
    } = platforms ?? {};
    if (!selector) {
      return;
    }
    let boxes = Array.from(document.querySelectorAll(selector));

    // Filter each to only show those that are visible in the viewport
    boxes = boxes
      .filter((box) => {
        const rect = box.getBoundingClientRect();

        if (minWidth && rect.width < minWidth) {
          return false;
        }

        return (
          rect.top >= (viewportPadding?.top ?? 0) &&
          rect.left >= (viewportPadding?.left ?? 0) &&
          rect.bottom <= window.innerHeight - (viewportPadding?.bottom ?? 0) &&
          rect.right <= window.innerWidth - (viewportPadding?.right ?? 0)
        );
      })
      .slice(0, maxNumberOfPlatforms);

    const existingBoxes: SyncedPlatform[] = [];
    const existingBoxesRefs: HTMLElement[] = [];

    this.elements.forEach((el) => {
      if (el instanceof SyncedPlatform) {
        existingBoxes.push(el);
        existingBoxesRefs.push(el.ref);
      }
    });

    // Remove all platforms that are no longer visible
    existingBoxes.forEach((box) => {
      if (boxes.includes(box.ref)) {
        return;
      }
      this.removeElement(box);
    });

    boxes.forEach((box) => {
      if (existingBoxesRefs.includes(box as HTMLElement)) {
        return;
      }

      const platform = new SyncedPlatform(this, box as HTMLElement);
      existingBoxes.push(platform);
      this.elements.push(platform);
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
