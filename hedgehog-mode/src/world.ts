import { uniqueId } from "lodash";
import { HedgehogActor } from "./actors/Hedgehog";
import { HedgehogActorOptions } from "./actors/hedgehog/config";
import { Game, GameElement } from "./types";
import Matter from "matter-js";
import { MainLevel } from "./levels/main-level";
import { HedgehogGhostActor } from "./actors/Ghost";

export class GameWorld {
  elements: GameElement[] = []; // TODO: Type better

  constructor(private game: Game) {
    this.game = game;
  }

  load() {
    new MainLevel(this.game).load();
  }

  addElement(element: GameElement) {
    this.elements.push(element);
  }

  update(deltaMS: number) {
    this.elements.forEach((el) => {
      el.update({ deltaMS, deltaTime: deltaMS / 1000 });
    });
  }

  spawnPlayer(): HedgehogActor {
    return this.spawnHedgehog({
      id: "player",
      player: true,
      controls_enabled: true,
      ai_enabled: false,
    });  
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
  }
}
