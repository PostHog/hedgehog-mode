import { sample, uniqueId } from "lodash";
import { HedgehogActor } from "./actors/Hedgehog";
import {
  getRandomAccessoryCombo,
  HedgehogActorAccessoryOption,
  HedgehogActorColorOptions,
  HedgehogActorOptions,
} from "./actors/hedgehog/config";
import { Game, GameElement } from "./types";
import Matter from "matter-js";
import { MainLevel } from "./levels/main-level";
import { HedgehogGhostActor } from "./actors/Ghost";
import {
  Inventory,
  INVENTORY_ITEMS,
  InventoryItemType,
} from "./items/Inventory";
import { Actor } from "./actors/Actor";
import { Platform } from "./items/Platform";
import { Accessory } from "./items/Accessory";
import { FloatingPlatform } from "./items/FloatingPlatform";
import { GameOver } from "./game-over";
import { Container } from "pixi.js";

export class GameWorld {
  elements: GameElement[] = []; // TODO: Type better
  timers: NodeJS.Timeout[] = [];
  wave: number = 0;
  enemies: HedgehogActor[] = [];
  kills: number = 0;
  container: Container;
  gameOverContainer?: GameOver;
  constructor(private game: Game) {
    this.game = game;
    this.container = new Container();
    this.container.zIndex = 100;
  }

  setTimeout(fn: () => void, delay: number) {
    const timer = setTimeout(() => {
      fn();
      this.timers = this.timers.filter((t) => t !== timer);
    }, delay);
    this.timers.push(timer);
    return timer;
  }

  load() {
    this.game.app.stage.addChild(this.container);
    new MainLevel(this.game).load();
    this.spawnPlatformsForWave();

    this.setTimeout(() => {
      this.startWave();
    }, 1000);

    const inventoryLoop = () => {
      this.setTimeout(() => {
        this.spawnRandomInventory();
        inventoryLoop();
      }, 10000);
    };

    inventoryLoop();
  }

  startWave() {
    this.wave++;
    for (let i = 0; i < this.wave; i++) {
      this.spawnEnemy();
    }
    this.spawnPlatformsForWave();
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Helper: keep ≤ 3 platforms, add 1–2 each wave              */
  /* ─────────────────────────────────────────────────────────── */
  private spawnPlatformsForWave(): void {
    const existing = this.elements.filter(
      (e) => e instanceof FloatingPlatform
    ) as FloatingPlatform[];

    const slotsLeft = 3 - existing.length;
    if (slotsLeft <= 0) return;

    const toSpawn = Math.min(slotsLeft, 1 + Math.floor(Math.random() * 2));

    for (let i = 0; i < toSpawn; i++) {
      const UPPER_LIMIT = 50; // y-coordinate
      const LOWER_LIMIT = window.innerHeight - 120; // just above terrain

      const amplitude = Math.max(
        20, // fail-safe minimum
        (LOWER_LIMIT - UPPER_LIMIT) / 2
      );
      const baseY = UPPER_LIMIT + amplitude; // midpoint

      const x = Math.random() * window.innerWidth; // anywhere onscreen

      this.spawnPlatform(
        new FloatingPlatform(this.game, {
          x,
          y: baseY,
          width: 140 + Math.random() * 100,
          height: 32,
          amplitude: amplitude,
          period: 12000 + Math.random() * 5000,
        })
      );
    }
  }

  addElement(element: GameElement) {
    this.elements.push(element);
  }

  public spawnActor(actor: Actor): void {
    this.elements.push(actor);
  }

  public spawnPlatform(platform: Platform | FloatingPlatform): void {
    this.elements.push(platform);
  }

  update(deltaMS: number) {
    const ticker = { deltaMS, deltaTime: deltaMS / 1000 };
    this.elements.forEach((el) => {
      el.update(ticker);
    });

    this.gameOverContainer?.update(ticker);
  }

  spawnRandomInventory(): Inventory {
    const type = sample(INVENTORY_ITEMS);
    return this.spawnInventory(type);
  }

  spawnInventory(type: InventoryItemType): Inventory {
    const inventory = new Inventory(this.game, {
      type,
    });
    this.elements.push(inventory);
    return inventory;
  }

  spawnPlayer(): HedgehogActor {
    return this.spawnHedgehog({
      id: "player",
      player: true,
      controls_enabled: true,
      ai_enabled: false,
    });
  }

  spawnEnemy(): HedgehogActor {
    const enemy = this.spawnHedgehog({
      id: uniqueId("enemy-hedgehog-"),
      player: false,
      controls_enabled: false,
      ai_enabled: true,
      accessories: getRandomAccessoryCombo(),
      color: sample(HedgehogActorColorOptions),
    });

    this.enemies.push(enemy);
    return enemy;
  }

  spawnHedgehog(options: HedgehogActorOptions | undefined): HedgehogActor {
    const actor = new HedgehogActor(
      this.game,
      options || {
        id: uniqueId("hedgehog-"),
      }
    );
    this.addElement(actor);
    return actor;
  }

  spawnHedgehogGhost(position: Matter.Vector): HedgehogGhostActor {
    const ghost = new HedgehogGhostActor(this.game, position);
    this.addElement(ghost);
    return ghost;
  }

  spawnAccessory(
    accessory: HedgehogActorAccessoryOption,
    position: Matter.Vector
  ): Accessory {
    const el = new Accessory(this.game, {
      accessory,
      position,
    });
    this.addElement(el);
    return el;
  }

  removeElement(element: GameElement): void {
    element.beforeUnload?.();
    if (element.rigidBody) {
      Matter.Composite.remove(this.game.engine.world, element.rigidBody);
    }
    if (element.sprite) {
      this.container.removeChild(element.sprite);
    }
    this.elements = this.elements.filter((el) => el != element);
    this.game.log(`Removed element. Elements left: ${this.elements.length}`);

    if (element instanceof HedgehogActor && !element.options.player) {
      this.onRemoveEnemy(element);
    }
  }

  onRemoveEnemy(enemy: HedgehogActor): void {
    this.game.log(`Removed enemy. Elements left: ${this.elements.length}`);

    this.enemies = this.enemies.filter((e) => e != enemy);
    this.kills++;

    if (this.enemies.length === 0) {
      this.game.log("No enemies left. Starting next wave...");

      this.game.EntryUI?.showDialogBox({
        actor: this.game.getPlayer(),
        messages: [
          {
            words: ["competition squashed"],
          },
        ],
      });

      this.setTimeout(() => {
        this.startWave();
      }, 5000);
    }
  }

  gameOver(position: Matter.Vector): void {
    this.gameOverContainer = new GameOver(this.game, position, () =>
      this.destroy()
    );
  }

  destroy() {
    this.elements.forEach((el) => {
      this.removeElement(el);
    });

    this.timers.forEach((timer) => {
      clearTimeout(timer);
    });

    this.timers = [];
  }

  beforeUnload(): void {
    this.timers.forEach((timer) => {
      clearTimeout(timer);
    });

    this.elements.forEach((el) => {
      el.beforeUnload?.();
    });
  }
}
