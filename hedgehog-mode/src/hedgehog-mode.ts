import gsap from "gsap";

import Matter, { Render, Runner } from "matter-js";
import decomp from 'poly-decomp';
import { Application } from "pixi.js";
import { Game, EntryUI, HedgehogModeConfig } from "./types";
import { SpritesManager } from "./sprites/sprites";
import { HedgehogActor } from "./actors/Hedgehog";
import { GlobalKeyboardListeners } from "./misc/GlobalKeyboardListeners";
import { StaticHedgehogRenderer } from "./static-renderer/StaticHedgehog";
import { GameWorld } from "./world";
import * as Tone from "tone";
import {PolySynth} from "tone";

Matter.Common.setDecomp(decomp)

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
export { StaticHedgehogRenderer } from "./static-renderer/StaticHedgehog";

export type * from "./types";

export class HedgeHogMode implements Game {
  ref?: HTMLDivElement;
  app!: Application;
  engine!: Matter.Engine;
  runner!: Matter.Runner;
  debugRender?: Matter.Render;
  totalElapsedTime = 0;
  pointerEventsEnabled = false;
  isDebugging = true;
  spritesManager: SpritesManager;
  mousePosition?: Matter.Vector;
  lastTime?: number;
  EntryUI!: EntryUI;
  // stateManager?: GameStateManager;
  staticHedgehogRenderer: StaticHedgehogRenderer;
  world: GameWorld;
  audioContext?: PolySynth;

  constructor(private options: HedgehogModeConfig) {
    this.spritesManager = new SpritesManager(options);
    this.staticHedgehogRenderer = new StaticHedgehogRenderer(
      options,
      this.spritesManager
    );
    this.world = new GameWorld(this);

    const enableSound = async () => {
      window.removeEventListener('keydown', enableSound);
      await Tone.start();
      this.audioContext = new Tone.PolySynth().toDestination();
      this.audioContext.triggerAttackRelease("C4", "8n", Tone.now());
    };
    window.addEventListener('keydown', enableSound);

    this.setupDebugListeners();
  }

  destroy(): void {
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

  setUI(ui: EntryUI): void {
    this.EntryUI = ui;
  }

  setPointerEvents(enabled: boolean): void {
    this.log("Setting pointer events", enabled);
    this.ref?.style.setProperty("pointer-events", enabled ? "auto" : "none");
    this.pointerEventsEnabled = enabled;
  }

  async render(ref: HTMLDivElement): Promise<void> {
    this.ref = ref;

    this.setPointerEvents(false);
    // Create the application helper and add its render target to the page
    this.app = new Application();
    this.engine = Matter.Engine.create();
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

      // Update the world (viewport)
      this.world.update(deltaMS);

      // Update all game elements
      let shouldHavePointerEvents = false;

      for (const el of this.world.elements) {
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

    // setTimeout(() => this.syncPlatforms(), 1000);
    // this.syncPlatforms();

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

    this.world.load();
    // this.stateManager = new GameStateManager(this, this.options);
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
    return this.world.elements.find((element) => element.rigidBody === rb);
  }

  setSpeed(speed: number) {
    this.engine.timing.timeScale = speed;
    gsap.globalTimeline.timeScale(speed);
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

  // private syncPlatforms() {
  //   if (!this.options.platformSelector) {
  //     return;
  //   }
  //   const boxes = Array.from(
  //     document.querySelectorAll(this.options.platformSelector)
  //   );
  //   const existingBoxes = this.world.elements.filter(
  //     (el) => el instanceof SyncedPlatform
  //   );

  //   boxes.forEach((box) => {
  //     // TODO: Make this much faster...
  //     if (existingBoxes.find((el) => el.ref === box)) {
  //       return;
  //     }

  //     const platform = new SyncedPlatform(this, box as HTMLElement);
  //     this.world.spawnActor(platform);
  //   });
  // }

  log(...args: unknown[]): void {
    // LATER: Add debugging option
    if (this.isDebugging) {
      // eslint-disable-next-line no-console
      console.log("[HedgeHogMode]", ...args);
    }
  }
}
