import { sample, uniqueId } from "lodash";
import { HedgehogActor } from "./actors/Hedgehog";
import {
  getRandomAccessoryCombo,
  HedgehogActorColorOptions,
  HedgehogActorOptions,
} from "./actors/hedgehog/config";
import { Game, GameElement } from "./types";
import Matter from "matter-js";
import { MainLevel } from "./levels/main-level";
import { HedgehogGhostActor } from "./actors/Ghost";
import { Inventory } from "./items/Inventory";
import { Actor } from "./actors/Actor";
import { Platform } from "./items/Platform";

export class GameWorld {
  elements: GameElement[] = []; // TODO: Type better
  timers: NodeJS.Timeout[] = [];
  wave: number = 0;
  enemies: HedgehogActor[] = [];

  constructor(private game: Game) {
    this.game = game;
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
    new MainLevel(this.game).load();

    this.setTimeout(() => {
      this.startWave();
    }, 1000);

    const inventoryLoop = () => {
      this.spawnRandomInventory();
      this.setTimeout(inventoryLoop, 10000);
    };

    inventoryLoop();
  }

  startWave() {
    this.wave++;
    for (let i = 0; i < this.wave; i++) {
      this.spawnEnemy();
    }
  }

  addElement(element: GameElement) {
    this.elements.push(element);
  }

  public spawnActor(actor: Actor): void {
    this.elements.push(actor);
  }

  public spawnPlatform(platform: Platform): void {
    this.elements.push(platform);
  }

  update(deltaMS: number) {
    this.elements.forEach((el) => {
      el.update({ deltaMS, deltaTime: deltaMS / 1000 });
    });
  }

  spawnRandomInventory(): Inventory {
    const inventory = new Inventory(this.game, {
      type: "bazooka",
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

  removeElement(element: GameElement): void {
    element.beforeUnload?.();
    if (element.rigidBody) {
      Matter.Composite.remove(this.game.engine.world, element.rigidBody);
    }
    if (element.sprite) {
      this.game.app.stage.removeChild(element.sprite);
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

  beforeUnload(): void {
    this.timers.forEach((timer) => {
      clearTimeout(timer);
    });

    this.elements.forEach((el) => {
      el.beforeUnload?.();
    });
  }
}
